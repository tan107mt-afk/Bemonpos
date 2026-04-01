/* ═══════════════════════════════════════════════════
   ZENTEA – Document viewer + Sidebar navigation
   File: js/sidebar.js
═══════════════════════════════════════════════════ */


function openDocViewer(id) {
  const list = docGetList();
  const doc = list.find(d => d.id === id);
  if(!doc) return;
  _viewerCurrentDoc = doc;

  const modal = document.getElementById('doc-viewer-modal');
  const body  = document.getElementById('dv-body');
  const nameEl = document.getElementById('dv-file-name');
  const iconEl = document.getElementById('dv-file-icon');
  if(!modal) return;

  nameEl.textContent = doc.name;
  iconEl.textContent = docGetIcon(doc.ext);
  modal.style.display = 'flex';
  body.innerHTML = '<div class="dv-loading"><div class="dv-spinner"></div><span>Đang mở tài liệu...</span></div>';

  setTimeout(() => {
    switch(doc.type) {
      case 'pdf':   viewPDF(doc, body);   break;
      case 'word':  viewWord(doc, body);  break;
      case 'excel': viewExcel(doc, body); break;
      case 'ppt':   viewPPT(doc, body);   break;
      default:      viewGeneric(doc, body);
    }
  }, 150);
}

function closeDocViewer() {
  const modal = document.getElementById('doc-viewer-modal');
  if(modal) modal.style.display = 'none';
  _viewerCurrentDoc = null;
}

function docViewerDownload() {
  if(_viewerCurrentDoc) docDownload(_viewerCurrentDoc.id);
}

function viewPDF(doc, body) {
  try {
    const blob = dataURLtoBlob(doc.data);
    const url  = URL.createObjectURL(blob);
    body.innerHTML = `<iframe src="${url}" style="width:100%;height:100%;border:none;flex:1;min-height:80vh;"></iframe>`;
  } catch(e) { viewGeneric(doc, body); }
}

async function viewWord(doc, body) {
  try {
    if(typeof mammoth === 'undefined') throw new Error('Thư viện chưa tải');
    const ab = await dataURLtoArrayBuffer(doc.data);
    const result = await mammoth.convertToHtml({ arrayBuffer: ab });
    body.innerHTML = `<div class="dv-docx-content">${result.value || '<p style="color:#999">Trống</p>'}</div>`;
  } catch(e) {
    body.innerHTML = `<div class="dv-loading"><span style="font-size:36px;">📝</span><b>${doc.name}</b><p style="color:#666;font-size:13px;">Không thể hiển thị trực tuyến</p><button class="dv-dl-btn" onclick="docViewerDownload()">⬇️ Tải về để xem</button></div>`;
  }
}

async function viewExcel(doc, body) {
  try {
    if(typeof XLSX === 'undefined') throw new Error('Thư viện chưa tải');
    const ab = await dataURLtoArrayBuffer(doc.data);
    const wb = XLSX.read(ab, { type: 'array' });
    const names = wb.SheetNames;

    let html = '';
    if(names.length > 1) {
      html += '<div class="dv-sheet-tabs">' +
        names.map((n,i) =>
          `<button class="dv-sheet-tab ${i===0?'active':''}" onclick="xlsxSwitchSheet(this,'${n.replace(/'/g,"\'")}')"> ${n}</button>`
        ).join('') + '</div>';
    }
    html += xlsxSheetHtml(wb, names[0]);
    body.innerHTML = html;
    body._wb = wb;
  } catch(e) {
    body.innerHTML = `<div class="dv-loading"><span style="font-size:36px;">📊</span><b>${doc.name}</b><p style="color:#666;font-size:13px;">Không thể hiển thị trực tuyến</p><button class="dv-dl-btn" onclick="docViewerDownload()">⬇️ Tải về để xem</button></div>`;
  }
}

function xlsxSheetHtml(wb, name) {
  const sheet = wb.Sheets[name];
  const rows  = XLSX.utils.sheet_to_json(sheet, { header:1, defval:'' });
  if(!rows.length) return '<div class="dv-loading">Sheet trống</div>';
  const cols = Math.max(...rows.map(r => r.length));
  let t = '<div class="dv-xlsx-wrap"><table class="dv-xlsx-table"><thead><tr>';
  (rows[0]||[]).forEach(c => t += `<th>${_esc(String(c))}</th>`);
  t += '</tr></thead><tbody>';
  for(let i=1;i<rows.length;i++){
    t += '<tr>';
    for(let j=0;j<cols;j++) t += `<td>${_esc(String(rows[i][j]??''))}</td>`;
    t += '</tr>';
  }
  return t + '</tbody></table></div>';
}

function xlsxSwitchSheet(btn, name) {
  const body = document.getElementById('dv-body');
  if(!body || !body._wb) return;
  const wb = body._wb;
  document.querySelectorAll('.dv-sheet-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const tabs = body.querySelector('.dv-sheet-tabs');
  body.innerHTML = '';
  if(tabs) body.appendChild(tabs);
  body.insertAdjacentHTML('beforeend', xlsxSheetHtml(wb, name));
  body._wb = wb;
}

function viewPPT(doc, body) {
  body.innerHTML = `<div class="dv-loading" style="gap:16px;"><span style="font-size:48px;">📊</span><b style="font-size:15px;">${doc.name}</b><p style="font-size:13px;color:#666;text-align:center;max-width:320px;">PowerPoint cần ứng dụng hỗ trợ để xem.<br>Tải về rồi mở bằng PowerPoint hoặc Google Slides.</p><button class="dv-dl-btn" onclick="docViewerDownload()" style="padding:12px 28px;">⬇️ Tải về để xem</button></div>`;
}

function viewGeneric(doc, body) {
  body.innerHTML = `<div class="dv-loading" style="gap:12px;"><span style="font-size:48px;">${docGetIcon(doc.ext)}</span><b>${doc.name}</b><button class="dv-dl-btn" onclick="docViewerDownload()">⬇️ Tải về</button></div>`;
}

function dataURLtoBlob(dataURL) {
  const arr = dataURL.split(','), mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8 = new Uint8Array(n);
  while(n--) u8[n] = bstr.charCodeAt(n);
  return new Blob([u8], { type: mime });
}

async function dataURLtoArrayBuffer(dataURL) {
  return await dataURLtoBlob(dataURL).arrayBuffer();
}

function _esc(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

document.addEventListener('keydown', e => { if(e.key==='Escape') closeDocViewer(); });


// ══════════════════════════════════════════════════════════════
// SIDEBAR NAVIGATION
// ══════════════════════════════════════════════════════════════


// Mở sidebar
function openSidebar() {
  const sb = document.getElementById('sidebar');
  const ov = document.getElementById('sidebar-overlay');
  if(sb){ sb.classList.add('open'); }
  if(ov){ ov.style.display = 'block'; }
  document.body.style.overflow = 'hidden';
}

// Đóng sidebar
function closeSidebar() {
  const sb = document.getElementById('sidebar');
  const ov = document.getElementById('sidebar-overlay');
  if(sb){ sb.classList.remove('open'); }
  if(ov){ ov.style.display = 'none'; }
  document.body.style.overflow = '';
}

// Toggle group expand/collapse
function sbToggleGroup(groupId) {
  const group = document.getElementById(groupId);
  if(!group) return;
  group.classList.toggle('expanded');
  const header = group.querySelector('.sb-group-header');
  if(header) header.classList.toggle('active-group', group.classList.contains('expanded'));
}

// Navigate to section
function sbNavigate(target) {
  // Kiểm tra quyền
  if(currentUser && currentUser.role !== 'superadmin' && currentUser.role !== 'admin') {
    const allowed = currentUser.allowedSections;
    if(allowed && !allowed.includes(target)) {
      showToast('🔒 Không có quyền truy cập mục này');
      closeSidebar();
      return;
    }
  }
  // Cập nhật active item
  document.querySelectorAll('.sb-item').forEach(i => i.classList.remove('active'));
  const btn = document.querySelector('.sb-item[data-target="' + target + '"]');
  if(btn) {
    btn.classList.add('active');
    // Mở group chứa item này
    const group = btn.closest('.sb-group');
    if(group && !group.classList.contains('expanded')) {
      group.classList.add('expanded');
      const header = group.querySelector('.sb-group-header');
      if(header) header.classList.add('active-group');
    }
  }
  showPage(target);
  closeSidebar();
}

// Setup sidebar sau khi đăng nhập
function setupSidebar(account) {
  // Cập nhật user info
  const userEl = document.getElementById('sb-user-name');
  if(userEl) userEl.textContent = account.fullname || account.user || account.email || '';

  // Hiện/ẩn store selector
  const storeWrap = document.getElementById('sb-store-wrap');
  const role = account.role || 'staff';
  if(storeWrap) {
    storeWrap.style.display = (role === 'superadmin' || role === 'admin') ? 'block' : 'none';
  }

  // Set selected store
  const sel = document.getElementById('sb-branch-sel');
  if(sel && account.branch) sel.value = account.branch || 'global';

  // Phân quyền: ẩn items không có quyền
  const allowed = account.allowedSections;
  document.querySelectorAll('.sb-item[data-target]').forEach(btn => {
    const t = btn.dataset.target;
    if(role === 'superadmin' || role === 'admin') {
      btn.style.display = '';
    } else if(allowed && Array.isArray(allowed)) {
      btn.style.display = allowed.includes(t) ? '' : 'none';
    } else {
      btn.style.display = 'none';
    }
  });

  // Ẩn/hiện group nếu không có item nào trong group
  document.querySelectorAll('.sb-group').forEach(group => {
    const visibleItems = [...group.querySelectorAll('.sb-item')].filter(i => i.style.display !== 'none');
    group.style.display = visibleItems.length ? '' : 'none';
  });
}

// Đổi chi nhánh
function sbChangeBranch(branchId) {
  selectedBranch = branchId;
  // Cập nhật branchKey và reload data
  try { loadBranchData(); } catch(e){}
  showToast('📍 Đã chuyển sang ' + (STORES.find(s=>s.id===branchId)?.name || branchId));
}

// Phím ESC đóng sidebar
document.addEventListener('keydown', e => {
  if(e.key === 'Escape') {
    closeSidebar();
    closeDocViewer();
  }
});

// showPage hook handled inside showPage function


// ══════════════════════════════════════════════════════════════
// SIDEBAR JS
// ══════════════════════════════════════════════════════════════
// STORES moved to config.js

function sidebarOpen(){
  document.getElementById('sidebar').classList.add('open');
  const ov = document.getElementById('sb-overlay');
  ov.style.display = 'block';
  setTimeout(() => ov.classList.add('visible'), 10);
}

function sidebarClose(){
  document.getElementById('sidebar').classList.remove('open');
  const ov = document.getElementById('sb-overlay');
  ov.classList.remove('visible');
  setTimeout(() => ov.style.display = 'none', 250);
}

function sidebarToggleGroup(groupId){
  const grp = document.getElementById(groupId);
  if(!grp) return;
  grp.classList.toggle('collapsed');
}

function sidebarNav(target){
  if(!document.body.classList.contains('logged-in')) return;
  // Active state
  document.querySelectorAll('.sb-item').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector('.sb-item[data-target="'+target+'"]');
  if(btn) btn.classList.add('active');
  // Navigate
  showPage(target);
  // Update hash
  history.pushState(null,'','#'+target);
  // Close sidebar on mobile
  if(window.innerWidth < 768) sidebarClose();
}

function sidebarChangeBranch(val){
  // Kiểm tra quyền cửa hàng
  if(currentUser && currentUser.role !== 'superadmin' && currentUser.role !== 'admin'){
    const allowed = currentUser.allowedStores;
    if(allowed && allowed.length > 0 && !allowed.includes(val) && val !== 'global'){
      showToast('❌ Không có quyền truy cập cửa hàng này');
      return;
    }
  }
  selectedBranch = val;
  // Cập nhật currentUser.branch để đồng bộ
  if(currentUser) currentUser.branch = val;
  // Visual feedback: hiện loading trên active section
  const _activeSection = document.querySelector('.acc-section.page-active');
  let _loadingEl = null;
  if(_activeSection){
    _loadingEl = document.createElement('div');
    _loadingEl.style.cssText = 'position:absolute;inset:0;background:rgba(255,255,255,.7);z-index:100;display:flex;align-items:center;justify-content:center;font-size:14px;color:var(--green);font-weight:700;border-radius:12px;';
    _loadingEl.innerHTML = '<div>🔄 Đang tải dữ liệu ' + (STORES[val] || val) + '...</div>';
    _activeSection.style.position = 'relative';
    _activeSection.appendChild(_loadingEl);
  }
  // Lưu vào localStorage
  try {
    const s = JSON.parse(localStorage.getItem('zentea-session')||'{}');
    s.branch = val;
    localStorage.setItem('zentea-session', JSON.stringify(s));
  } catch(e){}
  // Cập nhật branch trong Firebase DB để persist qua các session
  if(typeof apiGetAccounts === 'function' && currentUser && currentUser.id){
    apiGetAccounts().then(accounts => {
      const acc = accounts.find(a => a.id === currentUser.id);
      if(acc && acc.role !== 'superadmin'){
        acc.branch = val;
        if(typeof apiSaveAccounts === 'function') apiSaveAccounts(accounts).catch(()=>{});
      }
    }).catch(()=>{});
  }
  try { 
    loadBranchData().then(() => {
      // Xóa loading overlay sau khi data load xong
      if(_loadingEl) _loadingEl.remove();
    }).catch(() => {
      if(_loadingEl) _loadingEl.remove();
    });
  } catch(e){ if(_loadingEl) _loadingEl.remove(); }
  const storeName = val === 'global' ? 'Tất cả cửa hàng' : (STORES[val] || val);
  showToast('🏪 ' + storeName);
}

function sidebarSetup(account){
  if(!account) return;
  const role = account.role || 'staff';
  const allowed = account.allowedSections;

  // Ẩn/hiện từng sb-item theo quyền
  document.querySelectorAll('.sb-item[data-target]').forEach(btn => {
    const target = btn.dataset.target;
    if(role === 'superadmin' || role === 'admin'){
      btn.style.display = '';
    } else if(allowed && Array.isArray(allowed) && allowed.length){
      btn.style.display = allowed.includes(target) ? '' : 'none';
    } else {
      btn.style.display = 'none';
    }
  });

  // Ẩn/hiện group nếu không còn item nào
  ['sbg-qlch','sbg-dt'].forEach(gid => {
    const grp = document.getElementById(gid);
    if(!grp) return;
    const visibleItems = grp.querySelectorAll('.sb-item[style=""],.sb-item:not([style])');
    const allHidden = [...grp.querySelectorAll('.sb-item')].every(b => b.style.display === 'none');
    // Keep group visible but collapse if all hidden
    if(allHidden) grp.classList.add('collapsed');
  });

  // Store selector: filter theo allowedStores
  const storeSel = document.getElementById('sb-store-sel');
  const storeWrap = document.getElementById('sb-store-wrap');
  if(storeWrap) storeWrap.style.display = '';
  if(storeSel){
    const allowedSt = account.allowedStores;
    if(role === 'superadmin' || role === 'admin' || !allowedSt || allowedSt.length === 0){
      // Admin/superadmin: thấy tất cả 17 cửa hàng + global
      [...storeSel.options].forEach(opt => { opt.style.display = ''; });
      storeSel.value = account.branch || 'global';
      selectedBranch = account.branch || 'global';
    } else if(allowedSt.length === 1){
      // Staff 1 cửa hàng: hiện tên cố định, không có dropdown
      selectedBranch = allowedSt[0];
      if(storeWrap){
        storeWrap.innerHTML = `<div class="sb-store-label">🏪 Cửa hàng</div>
          <div style="padding:7px 12px;background:#d1fae5;border-radius:10px;font-size:12px;font-weight:700;color:var(--green);">
            📍 ${STORES[allowedSt[0]] || allowedSt[0]}
          </div>`;
      }
      // Load data cho chi nhánh được phân quyền
      if(currentUser) currentUser.branch = allowedSt[0];
      try { setTimeout(() => loadBranchData(), 50); } catch(e){}
    } else {
      // Staff nhiều cửa hàng: dropdown chỉ hiện các cửa hàng được phép
      // Ẩn global và các cửa hàng không được phép
      let firstAllowed = null;
      [...storeSel.options].forEach(opt => {
        // Staff không thấy option "Tất cả cửa hàng"
        const show = allowedSt.includes(opt.value);
        opt.style.display = show ? '' : 'none';
        if(show && !firstAllowed) firstAllowed = opt.value;
      });
      // Set giá trị mặc định
      const currentBranch = account.branch || '';
      const targetBranch = allowedSt.includes(currentBranch) ? currentBranch : (firstAllowed || allowedSt[0]);
      storeSel.value = targetBranch;
      selectedBranch = targetBranch;
      // Sync currentUser.branch và localStorage
      if(currentUser) currentUser.branch = targetBranch;
      try {
        const _sess = JSON.parse(localStorage.getItem('zentea-session')||'{}');
        if(_sess.id === account.id){ _sess.branch = targetBranch; localStorage.setItem('zentea-session', JSON.stringify(_sess)); }
      } catch(e){}
      // Load data cho chi nhánh đầu tiên
      try { setTimeout(() => loadBranchData(), 50); } catch(e){}
    }
  }

  // User info
  const uInfo = document.getElementById('sb-user-info');
  if(uInfo) uInfo.style.display = 'flex';
  const uName = document.getElementById('sb-user-name');
  const uRole = document.getElementById('sb-user-role');
  const uAvatar = document.getElementById('sb-avatar');
  if(uName) uName.textContent = account.fullname || account.user || '?';
  if(uRole){
    const roleMap = {superadmin:'👑 Super Admin',admin:'🛡 Quản Lý',staff:'👤 Nhân Viên',viewer:'👁 Xem Báo Cáo'};
    uRole.textContent = roleMap[role] || role;
  }
  if(uAvatar && account.avatar){
    if(account.avatar){ const ai=document.createElement('img'); ai.src=account.avatar; ai.style='width:100%;height:100%;object-fit:cover;border-radius:50%;'; uAvatar.appendChild(ai); }
  }

  // Topbar user pill
  const tbUser = document.getElementById('tb-user');
  if(tbUser){
    tbUser.style.display = 'flex';
    tbUser.innerHTML = (account.avatar ? '<img src="'+account.avatar+'">' : '') +
      '<span id="tb-user-name">'+(account.fullname||account.user||'User')+'</span>';
  }

  // Logout button
  const logoutBtn = document.getElementById('sb-logout-btn');
  if(logoutBtn) logoutBtn.style.display = 'block';

  // Logo ảnh
  const logoSrc = document.querySelector('.tb-logo img');
  const sbLogoSrc = document.getElementById('sb-logo-img');
  // Lấy ảnh logo từ nav cũ
  const oldImg = document.querySelector('.nav-logo img');
  if(oldImg){
    if(logoSrc) logoSrc.src = oldImg.src;
    if(sbLogoSrc) sbLogoSrc.src = oldImg.src;
  }
}

// Khởi động logo khi DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Set logo từ nav-logo img (ẩn trong DOM)
  const _setLogo = () => {
    const oldImg = document.querySelector('.nav-logo img');
    if(oldImg && oldImg.src && oldImg.src.includes('data:image')){
      const tbImg = document.getElementById('tb-logo-img');
      const sbImg = document.getElementById('sb-logo-img');
      if(tbImg) tbImg.src = oldImg.src;
      if(sbImg) sbImg.src = oldImg.src;
    }
  };
  _setLogo();
  setTimeout(_setLogo, 300);
});

