/* ═══════════════════════════════════════════════════
   ZENTEA – Authentication: login, logout, session, Google
   File: js/auth.js
═══════════════════════════════════════════════════ */

async function loginWithGoogle(){
  if(!fbAuth){
    const notice = $('fb-notice');
    if(notice) notice.style.display = 'block';
    showAuthError('Firebase chưa được cấu hình. Vui lòng liên hệ admin.');
    return;
  }
  const btn = $('google-login-btn');
  if(btn){ btn.disabled=true; btn.style.opacity='0.7'; }
  try{
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    // Popup qua zentea-qlch.firebaseapp.com (đã authorized sẵn)
    const result = await fbAuth.signInWithPopup(provider);
    const gUser = result.user;
    // Set lock NGAY để onAuthStateChanged không chạy đồng thời
    _googleAuthLock = true;
    try {
      await _handleGoogleUserCore(gUser, false);
    } finally {
      _googleAuthLock = false;
    }

  }catch(err){
    if(err.code !== 'auth/popup-closed-by-user'){
      showAuthError('Đăng nhập Google thất bại: ' + (err.message||err.code));
    }
  }finally{
    if(btn){ btn.disabled=false; btn.style.opacity='1'; }
  }
}

// Lắng nghe Firebase auth state + xử lý redirect result
if(fbAuth){
  // onAuthStateChanged được handle trong DOMContentLoaded để tránh conflict
  // Chỉ giữ lại để xử lý sau khi popup login thành công
  fbAuth.onAuthStateChanged(async (gUser) => {
    if(gUser && !isLoggedIn && !_googleAuthLock && window._appReady){
      await handleGoogleUser(gUser, true);
    }
  });
}

async function loadAccounts(){ return apiGetAccounts(); }
async function saveAccounts(list){ return apiSaveAccounts(list); }

async function checkSession(){
  try {
    const s = localStorage.getItem('zentea-session');
    if(!s) return;
    const u = JSON.parse(s);
    selectedBranch = u.branch || 'global';
    // LUÔN đọc lại từ DB để lấy status + allowedSections mới nhất
    if(u.email || u.id){
      try {
        const accounts = await apiGetAccounts();
        const fresh = accounts.find(a => a.id === u.id || a.email === u.email);
        if(fresh){
          // Kiểm tra status
          if(fresh.status === 'rejected'){
            // Tài khoản bị từ chối → xóa session, Firebase sẽ trigger re-login
            // _handleGoogleUserCore sẽ reset về pending tự động
            localStorage.removeItem('zentea-session');
            if(fbAuth && fbAuth.currentUser){
              // Có Firebase session → xử lý qua handleGoogleUser (sẽ reset pending)
              await handleGoogleUser(fbAuth.currentUser, true);
            } else {
              showAuthError('❌ Tài khoản đã bị từ chối. Vui lòng đăng nhập lại để yêu cầu xét duyệt.');
            }
            return;
          }
          if(fresh.status === 'pending'){
            localStorage.removeItem('zentea-session');
            showPendingScreen(fresh.email || u.email);
            return;
          }
          // Đồng bộ mọi thay đổi từ DB
          u.allowedSections = fresh.allowedSections || null;
          u.allowedStores = fresh.allowedStores || null;
          u.role = fresh.role || u.role;
          u.status = fresh.status;
          u.fullname = fresh.fullname || u.fullname;
          // Sync branch từ DB
          if(fresh.branch && fresh.branch !== 'global'){
            u.branch = fresh.branch;
          } else if(fresh.allowedStores && fresh.allowedStores.length > 0
                    && fresh.role !== 'admin' && fresh.role !== 'superadmin'){
            u.branch = fresh.allowedStores[0];
          }
          // Cập nhật session
          localStorage.setItem('zentea-session', JSON.stringify(u));
        } else if(u.googleUid) {
          // Tài khoản Google không còn trong DB → logout
          localStorage.removeItem('zentea-session');
          return;
        }
      } catch(e){}
    }
    await new Promise(r => setTimeout(r, 50));
    loginSuccess(u, true);
  } catch(e){}
}

// ADMIN PANEL
const ADMIN_USER = 'qlch@tominh.vn';
const ADMIN_PASS = 'Zentea11';

function openAdminLogin(){
  show('admin-login-modal','flex');
  $('admin-user').value = '';
  $('admin-pass-input').value = '';
  hide('admin-login-error');
  setTimeout(() => $('admin-user').focus(), 100);
}

function closeAdminLogin(){
  hide('admin-login-modal');
}

function toggleAdminPwd(){
  const p = $('admin-pass-input');
  p.type = p.type === 'password' ? 'text' : 'password';
}

async function doAdminLogin(){
  const u = $('admin-user').value.trim();
  const p = $('admin-pass-input').value;
  const errEl = $('admin-login-error');
  if(u === ADMIN_USER && p === ADMIN_PASS){
    closeAdminLogin();
    await openAdminPanel();
  } else {
    errEl.textContent = 'Tài khoản hoặc mật khẩu không đúng';
    errEl.style.display = 'block';
  }
}

async function openAdminPanel(){
  // Load current password for single account
  const pw = await getStorePw('global');
  const inp = $('pw-global');
  if(inp) inp.value = pw || '';
  const st = $('status-global');
  if(st) st.textContent = pw ? '✅ Đã có mật khẩu' : '⚠️ Chưa thiết lập';
  show('admin-panel','flex');
}

function closeAdminPanel(){
  hide('admin-panel');
}

async function getStorePw(branchId){
  const key = 'zentea-store-pw-' + branchId;
  try {
    const r = await window.storage.get(key, true);
    if(r && r.value) return r.value;
  } catch(e){}
  try { return localStorage.getItem(key) || ''; } catch(e){ return ''; }
}

async function saveStorePw(branchId){
  const inp = $('pw-'+branchId);
  const pw = inp ? inp.value.trim() : '';
  if(!pw){ alert('Vui lòng nhập mật khẩu!'); return; }
  const key = 'zentea-store-pw-' + branchId;
  try { await window.storage.set(key, pw, true); } catch(e){}
  try { localStorage.setItem(key, pw); } catch(e){}
  const st = $('status-'+branchId);
  if(st){ st.textContent = '✅ Đã lưu thành công!'; setTimeout(()=>{ st.textContent='✅ Đã có mật khẩu'; },2000); }
}

// Close admin panel on backdrop click
var _ap=$('admin-panel'); if(_ap) _ap.addEventListener('click', function(e){ if(e.target===this) closeAdminPanel(); });
var _alm=$('admin-login-modal'); if(_alm) _alm.addEventListener('click', function(e){ if(e.target===this) closeAdminLogin(); });

// LỊCH LÀM VIỆC — Google Sheets embed
function convertToEmbedUrl(url){
  url = url.trim();
  if(!url) return null;
  // Extract spreadsheet ID
  const m = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if(!m) return null;
  const id = m[1];
  // Check for gid (sheet tab)
  const gid = (url.match(/[#?&]gid=(\d+)/) || [])[1];
  // Use edit?rm=minimal so user can edit directly if logged into Google
  let embed = 'https://docs.google.com/spreadsheets/d/' + id + '/edit?rm=minimal&usp=sharing';
  if(gid) embed += '&gid=' + gid;
  return embed;
}

function loadSheetIntoFrame(embedUrl){
  const ph = $('sch-placeholder');
  const loader = $('sch-loading');
  const frame = $('gsheet-frame');
  if(!frame) return;

  if(ph){ ph.style.display = 'none'; }
  if(loader){ loader.style.display='flex'; loader.style.opacity='1'; }
  frame.style.opacity = '0';

  // Timeout fallback: if onload doesn't fire after 12s, show error
  let loaded = false;
  const timeout = setTimeout(()=>{
    if(!loaded) showEmbedError();
  }, 12000);

  frame.onload = function(){
    loaded = true;
    clearTimeout(timeout);
    // Small delay to let Google render content
    setTimeout(()=>{
      frame.style.opacity = '1';
      if(loader){ loader.style.opacity='0'; setTimeout(()=>{ loader.style.display='none'; }, 400); }
    }, 300);
  };
  frame.src = embedUrl;
}

function showEmbedError(){
  const loader = $('sch-loading');
  const ph = $('sch-placeholder');
  if(loader) loader.style.display='none';
  if(ph){
    ph.innerHTML = '<div style="font-size:40px;">⚠️</div>' +
      '<div style="font-size:14px;font-weight:700;color:#c44;">Không thể hiển thị trực tiếp</div>' +
      '<div style="font-size:12px;color:#888;max-width:320px;line-height:1.8;margin-top:4px;">' +
        'Google đang chặn nhúng file này.<br>' +
        'Vào Google Sheets → <strong>Tệp → Chia sẻ → Xuất bản lên web</strong><br>' +
        'rồi nhấn <strong>▶ Hiển thị</strong> lại.' +
      '</div>' +
      '<button onclick="applySheetLink()" style="padding:10px 24px;background:var(--green);color:#fff;border:none;border-radius:20px;font-size:13px;font-weight:700;cursor:pointer;">🔄 Thử lại</button>';
    ph.style.display = 'flex';
  }
}

async function loadSchedule(){
  try {
    const saved = localStorage.getItem(branchKey('sch-link'));
    if(saved){
      const input = $('sch-link-input');
      if(input) input.value = saved;
      // Auto-load iframe with saved link
      const embedUrl = convertToEmbedUrl(saved);
      if(embedUrl) loadSheetIntoFrame(embedUrl);
    }
  } catch(e){}
}

function applySheetLink(){
  const input = $('sch-link-input');
  if(!input) return;
  const raw = input.value.trim();
  if(!raw){ input.focus(); return; }
  const embedUrl = convertToEmbedUrl(raw);
  if(!embedUrl){
    input.style.borderColor = '#e53e3e';
    setTimeout(()=>{ input.style.borderColor='var(--border)'; }, 2500);
    alert('Link không hợp lệ! Vui lòng dán đúng link Google Sheets.');
    return;
  }
  // Save link per branch
  try { localStorage.setItem(branchKey('sch-link'), raw); } catch(e){}
  loadSheetIntoFrame(embedUrl);
}

var _schZoom = 1.0;
function schZoom(delta){
  _schZoom = Math.max(0.3, Math.min(3.0, _schZoom + delta));
  var frame = $('gsheet-frame');
  var label = $('sch-zoom-label');
  if(frame){
    frame.style.transform = 'scale(' + _schZoom + ')';
    frame.style.transformOrigin = 'top left';
    frame.style.width = (100 / _schZoom) + '%';
    frame.style.height = (100 / _schZoom) + '%';
  }
  if(label) label.textContent = Math.round(_schZoom * 100) + '%';
}
function schZoomReset(){
  _schZoom = 1.0;
  var frame = $('gsheet-frame');
  var label = $('sch-zoom-label');
  if(frame){ frame.style.transform=''; frame.style.width='100%'; frame.style.height='100%'; }
  if(label) label.textContent = '100%';
}
function reloadSheet(){
  const frame = $('gsheet-frame');
  if(!frame || !frame.src) return;
  const src = frame.src;
  const loader = $('sch-loading');
  if(loader){ loader.style.display='flex'; loader.style.opacity='1'; }
  frame.style.opacity = '0';
  frame.src = '';
  setTimeout(()=>{ frame.src = src; }, 150);
}

// CLEANING SCHEDULE — VỆ SINH ĐỊNH KỲ

const CL_STORAGE_KEY = 'zentea-cleaning';

// Master cleaning data from Excel (Tháng 3/2026 - tuần lặp lại)
const CL_WEEKLY_TEMPLATE = [
  // CHỦ NHẬT
  {thu:'CHỦ NHẬT', nhiem_vu:'Lau bờ tường, chân bàn, chân ghế tầng 1', ca:'CA12', phan_cong:'Nguyễn Trung Hiếu'},
  {thu:'CHỦ NHẬT', nhiem_vu:'Lau kính tầng 1', ca:'CA12', phan_cong:'Huỳnh Ý Như'},
  {thu:'CHỦ NHẬT', nhiem_vu:'Lau lá cây của các chậu cây giả', ca:'CA3', phan_cong:'Phạm Văn Hoàng'},
  {thu:'CHỦ NHẬT', nhiem_vu:'Ngâm caffeto ca đong nhựa, shaker, nắp cối xay, cối', ca:'CA3', phan_cong:'Nguyễn Chí Cường'},
  // THỨ 2
  {thu:'THỨ 2', nhiem_vu:'Vệ sinh tủ bánh, kệ tủ bánh, mặt tủ', ca:'CA12', phan_cong:'Huỳnh Ý Như'},
  {thu:'THỨ 2', nhiem_vu:'Lau kệ sách treo tường tầng 1', ca:'CA12', phan_cong:'Trần Xuân Mai'},
  {thu:'THỨ 2', nhiem_vu:'Chà sàn kho', ca:'CA3', phan_cong:'Trần Thị Khánh Ly'},
  {thu:'THỨ 2', nhiem_vu:'Vệ sinh máy caffee, dụng cụ pha cafe bằng caffeto', ca:'CA3', phan_cong:'Nguyễn Lê Thảo Uyên'},
  // THỨ 3
  {thu:'THỨ 3', nhiem_vu:'Lau 2 kệ sách tầng 1', ca:'CA12', phan_cong:'Đinh Hoàng Khánh Ly'},
  {thu:'THỨ 3', nhiem_vu:'Vệ sinh máy đường', ca:'CA12', phan_cong:'Nguyễn Trung Hiếu'},
  {thu:'THỨ 3', nhiem_vu:'Vệ sinh Ca inox bằng caffeto', ca:'CA3', phan_cong:'Nguyễn Ngọc Thùy Dương'},
  {thu:'THỨ 3', nhiem_vu:'Vệ sinh máy sữa đặc', ca:'CA3', phan_cong:'Phạm Văn Hoàng'},
  // THỨ 4
  {thu:'THỨ 4', nhiem_vu:'Vệ sinh kệ trang trí trong quầy', ca:'CA12', phan_cong:'Nguyễn Trung Hiếu'},
  {thu:'THỨ 4', nhiem_vu:'Vệ sinh miếng lưới của máy lạnh', ca:'CA12', phan_cong:'Nguyễn Đức Trí'},
  {thu:'THỨ 4', nhiem_vu:'Chà 2 kệ inox 2 bồn rửa P2, P3', ca:'CA3', phan_cong:'Trần Thị Khánh Ly'},
  {thu:'THỨ 4', nhiem_vu:'Vệ sinh sàn phía sau máy pha chế', ca:'CA3', phan_cong:'Nguyễn Lê Thảo Uyên'},
  // THỨ 5
  {thu:'THỨ 5', nhiem_vu:'Vệ sinh kho trên dưới (Sàn, tủ lạnh, kệ)', ca:'CA12', phan_cong:'Trương Hoàng Kim Phụng'},
  {thu:'THỨ 5', nhiem_vu:'Lau dọn toàn bộ tủ inox + khay đựng nắp ly muỗng', ca:'CA12', phan_cong:'Huỳnh Ngọc Hân'},
  {thu:'THỨ 5', nhiem_vu:'Vệ sinh máy sữa đặc', ca:'CA3', phan_cong:'Nguyễn Chí Cường'},
  {thu:'THỨ 5', nhiem_vu:'Rửa xà bông mặt tủ inox', ca:'CA3', phan_cong:'Nguyễn Ngọc Thùy Dương'},
  // THỨ 6
  {thu:'THỨ 6', nhiem_vu:'Lau kệ sách treo tường tầng trệt', ca:'CA12', phan_cong:'Nguyễn Trung Hiếu'},
  {thu:'THỨ 6', nhiem_vu:'Lau hộc tủ sách tầng trệt (sách kệ cầu thang)', ca:'CA12', phan_cong:'Trương Hoàng Kim Phụng'},
  {thu:'THỨ 6', nhiem_vu:'Vệ sinh kho rác, thùng hóa chất', ca:'CA3', phan_cong:'Nguyễn Chí Cường'},
  {thu:'THỨ 6', nhiem_vu:'Vệ sinh tủ đựng trà Phụ 2, 2 thùng đựng trà bột trong kho', ca:'CA3', phan_cong:'Nguyễn Ngọc Thùy Dương'},
  // THỨ 7
  {thu:'THỨ 7', nhiem_vu:'Lau chậu cây, bình chữa cháy, thiết bị PCCC', ca:'CA12', phan_cong:'Nguyễn Đức Trí'},
  {thu:'THỨ 7', nhiem_vu:'Lau chân bàn chân ghế, bờ tường gỗ tầng trệt', ca:'CA12', phan_cong:'Huỳnh Ngọc Hân'},
  {thu:'THỨ 7', nhiem_vu:'Lau bề mặt tủ đá, kệ 2 tủ lạnh', ca:'CA3', phan_cong:'Phạm Văn Hoàng'},
  {thu:'THỨ 7', nhiem_vu:'Vệ sinh máy sữa đặc', ca:'CA3', phan_cong:'Nguyễn Lê Thảo Uyên'},
];

const THU_ORDER = ['CHỦ NHẬT','THỨ 2','THỨ 3','THỨ 4','THỨ 5','THỨ 6','THỨ 7'];
const THU_SHORT = {'CHỦ NHẬT':'CN','THỨ 2':'T2','THỨ 3':'T3','THỨ 4':'T4','THỨ 5':'T5','THỨ 6':'T6','THỨ 7':'T7'};

let clTasks = []; // [{id, thu, nhiem_vu, ca, phan_cong, done}]
let clView = 'list';
let clFilterD = 'all';
let clFilterC = 'all';
let clFilterS = 'all';
let clViewMonth = new Date().getMonth() + 1; // 1–12
let clViewYear  = new Date().getFullYear();

async function loadCleaning(){
  clDateDone = {};
  clDateOverrides = {};
  await clLoadDateDone();
  await clLoadDateOverrides();
  try {
    const saved = await window.storage.get(branchKey('zentea-cleaning'));
    if(saved) clTasks = JSON.parse(saved.value);
    else { clInitDefault(); }
  } catch(e) { clInitDefault(); }
  clRender();
}

function clInitDefault(){
  clTasks = CL_WEEKLY_TEMPLATE.map((t,i) => ({
    id: 'cl-' + i,
    thu: t.thu,
    nhiem_vu: t.nhiem_vu,
    ca: t.ca,
    phan_cong: t.phan_cong,
    done: false,
  }));
}

async function clSave(){
  try { await window.storage.set(branchKey('zentea-cleaning'), JSON.stringify(clTasks)); } catch(e){}
}

function clSetView(v){
  clView = v;
  ['list','timeline','week','person'].forEach(k=>{
    const btn = $('cl-btn-'+k);
    if(btn){ btn.style.background = k===v?'var(--green)':'transparent'; btn.style.color = k===v?'#fff':'#666'; }
  });
  clRender();
}

function clFilterDay(d){
  clFilterD = d;
  document.querySelectorAll('.cl-df').forEach(b=>{
    const active = b.dataset.d===d;
    b.style.background = active?'var(--green)':'#fff';
    b.style.color = active?'#fff':'#555';
    b.style.borderColor = active?'var(--green)':'var(--border)';
    if(active) b.classList.add('active'); else b.classList.remove('active');
  });
  clRender();
}

function clFilterCa(c){
  clFilterC = c;
  document.querySelectorAll('.cl-cf').forEach(b=>{
    const active = b.dataset.c===c;
    b.style.background = active?'var(--green)':'#fff';
    b.style.color = active?'#fff':'#555';
    b.style.borderColor = active?'var(--green)':'var(--border)';
  });
  clRender();
}

function clFilterStatus(s){
  clFilterS = s;
  document.querySelectorAll('.cl-sf').forEach(b=>{
    const active = b.dataset.s===s;
    b.style.background = active?'var(--green)':'#fff';
    b.style.color = active?'#fff':'#555';
    b.style.borderColor = active?'var(--green)':'var(--border)';
  });
  clRender();
}

function clGetFiltered(){
  return clTasks.filter(t => {
    if(clFilterD!=='all' && t.thu!==clFilterD) return false;
    if(clFilterC!=='all' && t.ca!==clFilterC) return false;
    if(clFilterS==='done' && !t.done) return false;
    if(clFilterS==='todo' && t.done) return false;
    return true;
  });
}

function clRender(){
  // Update progress
  const total = clTasks.length;
  const done = clTasks.filter(t=>t.done).length;
  const pct = total ? Math.round(done/total*100) : 0;
  const pb = $('cl-progress-bar');
  const pt = $('cl-progress-text');
  if(pb) pb.style.width = pct+'%';
  if(pt) pt.textContent = `${done}/${total} (${pct}%)`;

  const cont = $('cl-main-content');
  if(!cont) return;
  const filtered = clGetFiltered();

  if(clView==='list') cont.innerHTML = clRenderList(filtered);
  else if(clView==='timeline') cont.innerHTML = clRenderTimeline();
  else if(clView==='week') cont.innerHTML = clRenderWeek(filtered);
  else cont.innerHTML = clRenderPerson(filtered);
}

function clCaStyle(ca){
  if(ca==='CA3') return {bg:'#1e1b4b',c:'#a5b4fc',icon:'🌃'};
  if(ca==='CA12') return {bg:'#f3e5f5',c:'#6a1b9a',icon:'🌓'};
  if(ca==='CA1') return {bg:'#e8f5e9',c:'#2e7d32',icon:'☀'};
  if(ca==='CA2') return {bg:'#dbeafe',c:'#1d4ed8',icon:'🌙'};
  return {bg:'#f5f5f5',c:'#555',icon:'⏰'};
}
