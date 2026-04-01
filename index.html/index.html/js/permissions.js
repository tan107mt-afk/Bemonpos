/* ═══════════════════════════════════════════════════
   ZENTEA – Google auth, Approval panel, Permissions, Doc storage
   File: js/permissions.js
═══════════════════════════════════════════════════ */

async function handleGoogleUser(gUser, fromSession=false){
  // Nếu đã đăng nhập rồi → bỏ qua
  if(isLoggedIn) return;
  // Lock: tránh 2 lần gọi đồng thời (từ loginWithGoogle + onAuthStateChanged)
  if(_googleAuthLock) return;
  _googleAuthLock = true;
  try {
    await _handleGoogleUserCore(gUser, fromSession);
  } finally {
    _googleAuthLock = false;
  }
}

async function _handleGoogleUserCore(gUser, fromSession=false){
  const isSuperAdmin = gUser.email === SUPERADMIN_EMAIL;
  const accounts = await apiGetAccounts();
  let found = accounts.find(a => a.googleUid === gUser.uid || a.email === gUser.email);

  if(isSuperAdmin){
    // Superadmin: tự động tạo/tìm tài khoản và đăng nhập
    if(!found){
      found = {
        id: 'g-' + gUser.uid, googleUid: gUser.uid, email: gUser.email,
        username: 'superadmin', fullname: gUser.displayName || 'Super Admin',
        password: '', role: 'superadmin', branch: 'global',
        status: 'approved', createdAt: new Date().toISOString()
      };
      accounts.push(found);
      await apiSaveAccounts(accounts);
    } else if(found.role !== 'superadmin'){
      found.role = 'superadmin'; found.status = 'approved';
      await apiSaveAccounts(accounts);
    }
    loginSuccess({user:found.username,fullname:found.fullname,branch:'global',
      role:'superadmin',id:found.id,email:found.email,avatar:gUser.photoURL||''}, fromSession);
    return;
  }

  // Account khác: kiểm tra status
  if(found){
    if(found.status === 'approved'){
      loginSuccess({user:found.username,fullname:found.fullname,
        branch:found.branch||'global',role:found.role||'staff',
        id:found.id,email:found.email,avatar:gUser.photoURL||'',
        allowedSections:found.allowedSections||null,
        allowedStores:found.allowedStores||null}, fromSession);
    } else if(found.status === 'rejected'){
      // Tài khoản bị từ chối đăng nhập lại → reset về pending để admin xét lại
      found.status = 'pending';
      found.requestedAt = new Date().toISOString();
      found.avatar = gUser.photoURL || found.avatar || '';
      found.fullname = gUser.displayName || found.fullname || gUser.email;
      await apiSaveAccounts(accounts);
      // Notify superadmin
      if(fbDb){
        try { await fbDb.ref('pendingNotify/' + gUser.uid).set({
          email: gUser.email, name: gUser.displayName, requestedAt: Date.now()
        }); } catch(e){}
      }
      showPendingScreen(gUser.email);
    } else {
      // pending hoặc MISSING status → coi là pending, cập nhật lại
      if(!found.status){
        found.status = 'pending';
        found.requestedAt = found.requestedAt || found.createdAt || new Date().toISOString();
        await apiSaveAccounts(accounts);
      }
      showPendingScreen(gUser.email);
    }
    return;
  }

  // Lần đầu đăng nhập: tạo pending request
  const newReq = {
    id: 'g-' + gUser.uid, googleUid: gUser.uid, email: gUser.email,
    username: gUser.email.split('@')[0].replace(/[^a-z0-9_.]/gi,'_').toLowerCase(),
    fullname: gUser.displayName || gUser.email,
    password: '', role: 'staff', branch: 'global',
    status: 'pending', requestedAt: new Date().toISOString(),
    avatar: gUser.photoURL || ''
  };
  accounts.push(newReq);
  await apiSaveAccounts(accounts);

  // Notify superadmin có tài khoản mới chờ duyệt
  if(fbDb){
    try { await fbDb.ref('pendingNotify/' + gUser.uid).set({
      email: gUser.email, name: gUser.displayName || gUser.email,
      requestedAt: Date.now(), isNew: true
    }); } catch(e){}
  }
  showPendingScreen(gUser.email);
}  // end _handleGoogleUserCore

function showPendingScreen(email){
  const el = $('pending-email-display');
  if(el) el.textContent = email;
  const s = $('pending-screen');
  if(s) s.style.display = 'flex';
  const home = $('home');
  if(home) home.style.display = 'none';
  const loader = $('app-loading');
  if(loader) loader.style.display = 'none';
}

function logoutPending(){
  if(fbAuth) fbAuth.signOut();
  const s = $('pending-screen');
  if(s) s.style.display = 'none';
  show('home');
}

// ── Approval Panel (Superadmin only) ──
function switchApprovalTab(tab){
  const pendingEl = $('approval-list');
  const membersEl = $('members-list');
  const pendingBtn = $('tab-pending');
  const membersBtn = $('tab-members');
  if(tab === 'pending'){
    if(pendingEl) pendingEl.style.display = 'block';
    if(membersEl) membersEl.style.display = 'none';
    if(pendingBtn){ pendingBtn.style.color='var(--green)'; pendingBtn.style.borderBottom='3px solid var(--green)'; }
    if(membersBtn){ membersBtn.style.color='#6b7280'; membersBtn.style.borderBottom='3px solid transparent'; }
  } else {
    if(pendingEl) pendingEl.style.display = 'none';
    if(membersEl) membersEl.style.display = 'block';
    if(membersBtn){ membersBtn.style.color='var(--green)'; membersBtn.style.borderBottom='3px solid var(--green)'; }
    if(pendingBtn){ pendingBtn.style.color='#6b7280'; pendingBtn.style.borderBottom='3px solid transparent'; }
    renderMembersList();
  }
}

async function openApprovalPanel(){
  show('approval-panel');
  await refreshApprovalList();
}

const ROLE_LABELS = {
  superadmin: {label:'Super Admin', cls:'role-superadmin'},
  admin:      {label:'Quản lý',     cls:'role-admin'},
  staff:      {label:'Nhân viên',   cls:'role-staff'},
  viewer:     {label:'Xem báo cáo', cls:'role-viewer'},
  pending:    {label:'Chờ duyệt',   cls:'role-pending'},
  rejected:   {label:'Từ chối',     cls:'role-pending'},
};

async function refreshApprovalList(){
  const pendingEl = $('approval-list');
  if(!pendingEl) return;
  pendingEl.innerHTML = '<div class="no-pending">Đang tải...</div>';

  const accounts = await apiGetAccounts();
  const pending = accounts.filter(a => a.status === 'pending');

  let html = '';
  if(pending.length > 0){
    pending.forEach(req => {
      const initials = (req.fullname||'?').split(' ').map(w=>w[0]).join('').toUpperCase().substring(0,2);
      // Build permission checkboxes
      const _qlch = NAV_SECTIONS.filter(s=>s.group==='qlch');
      const _dt   = NAV_SECTIONS.filter(s=>s.group==='dt');
      const _mkBox = (list,id) => list.map(s =>
        `<label class="perm-item"><input type="checkbox" class="perm-cb-${id}" value="${s.id}" checked><label>${s.label}</label></label>`
      ).join('');
      const permBoxes = `
        <div style="font-size:10px;font-weight:800;color:var(--green);letter-spacing:1px;margin:6px 0 4px;text-transform:uppercase;">🏪 Quản Lý Cửa Hàng</div>
        <div class="perm-grid">${_mkBox(_qlch,req.id)}</div>
        <div style="font-size:10px;font-weight:800;color:#6366f1;letter-spacing:1px;margin:10px 0 4px;text-transform:uppercase;">🎓 Đào Tạo</div>
        <div class="perm-grid">${_mkBox(_dt,req.id)}</div>
      `;
      html += `<div class="req-card">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
          <div class="member-avatar">${req.avatar ? `<img src="${req.avatar}">` : initials}</div>
          <div>
            <div class="member-name">👤 ${req.fullname}</div>
            <div class="member-email">📧 ${req.email}</div>
            <div class="req-time" style="margin-top:2px;">Yêu cầu: ${req.requestedAt ? new Date(req.requestedAt).toLocaleString('vi-VN') : ''}</div>
          </div>
        </div>
        <div class="req-actions" style="margin-bottom:10px;">
          <select class="req-role-sel" id="role-${req.id}">
            <option value="staff">Nhân viên</option>
            <option value="admin">Quản lý (thấy tất cả)</option>
            <option value="viewer">Xem báo cáo</option>
          </select>
          <button class="btn-approve" onclick="approveAccount('${req.id}')">✅ Duyệt</button>
          <button class="btn-reject" onclick="rejectAccount('${req.id}')">❌ Từ chối</button>
        </div>
        <div class="perm-panel">
          <div class="perm-title">📋 Phân quyền menu</div>
          <span class="perm-select-all" onclick="permToggleAll('${req.id}',true)">Chọn tất cả</span>
          &nbsp;·&nbsp;
          <span class="perm-select-all" onclick="permToggleAll('${req.id}',false)">Bỏ tất cả</span>
          <div class="perm-grid">${permBoxes}</div>

          <div class="perm-title" style="margin-top:14px;">🏪 Phân quyền cửa hàng</div>
          <span class="perm-select-all" onclick="storeToggleAll('${req.id}',true)">Chọn tất cả</span>
          &nbsp;·&nbsp;
          <span class="perm-select-all" onclick="storeToggleAll('${req.id}',false)">Bỏ tất cả</span>
          <div class="perm-grid" style="grid-template-columns:1fr 1fr;">
            ${Object.entries(STORES).filter(([id])=>id!=='global').map(([id,name])=>
              `<label class="perm-item">
                <input type="checkbox" class="perm-store-cb-${req.id}" value="${id}" checked>
                <label style="font-size:11px;">${name.replace('ZEN Tea ','')}</label>
              </label>`
            ).join('')}
          </div>
        </div>
      </div>`;
    });
  } else {
    html = '<div class="no-pending">✨ Không có yêu cầu chờ duyệt</div>';
  }
  pendingEl.innerHTML = html;

  // Update badges
  const badgePending = $('tab-pending-count');
  if(badgePending) badgePending.textContent = pending.length > 0 ? pending.length : '';
  

  const navBadge = $('pending-badge');
  if(navBadge) navBadge.textContent = pending.length > 0 ? '('+pending.length+')' : '';

  // Also refresh members if that tab was open
  const membersEl = $('tab-members');
  if(membersEl && membersEl.style.display !== 'none') await renderMembersList();
}

async function renderMembersList(){
  const membersEl = $('members-list');
  if(!membersEl) return;
  membersEl.innerHTML = '<div class="no-pending">Đang tải...</div>';

  const accounts = await apiGetAccounts();
  const members = accounts.filter(a => a.status === 'approved');

  // Update badge
  const badgeMembers = $('tab-members-count');
  if(badgeMembers) badgeMembers.textContent = members.length;

  if(!members.length){
    membersEl.innerHTML = '<div class="no-pending">Chưa có tài khoản nào được duyệt</div>';
    return;
  }

  // Group by role
  const roleOrder = ['superadmin','admin','staff','viewer'];
  const grouped = {};
  roleOrder.forEach(r => grouped[r] = []);
  members.forEach(m => { if(grouped[m.role]) grouped[m.role].push(m); else grouped['staff'].push(m); });

  let html = '';
  roleOrder.forEach(role => {
    const list = grouped[role];
    if(!list.length) return;
    const rl = ROLE_LABELS[role] || {label:role, cls:'role-staff'};
    html += `<div style="font-size:11px;font-weight:700;letter-spacing:1px;color:#6b7280;margin:14px 0 8px;text-transform:uppercase;">${rl.label} (${list.length})</div>`;
    list.forEach(acc => {
      const initials = (acc.fullname||'?').split(' ').map(w=>w[0]).join('').toUpperCase().substring(0,2);
      const isSelf = acc.role === 'superadmin';
      html += `<div class="member-card">
        <div class="member-avatar">${acc.avatar ? `<img src="${acc.avatar}" onerror="this.parentElement.textContent='${initials}'">` : initials}</div>
        <div class="member-info">
          <div class="member-name">${acc.fullname || acc.username}</div>
          <div class="member-email">${acc.email}</div>
        </div>
        <div class="member-actions">
          ${isSelf ? `<span class="role-badge role-superadmin">👑 Super Admin</span>` : `
          <select class="role-select-inline" onchange="changeRole('${acc.id}',this.value)">
            <option value="staff"   ${acc.role==='staff'   ?'selected':''}>Nhân viên</option>
            <option value="admin"   ${acc.role==='admin'   ?'selected':''}>Quản lý</option>
            <option value="viewer"  ${acc.role==='viewer'  ?'selected':''}>Xem báo cáo</option>
          </select>
          <button class="btn-approve" style="padding:5px 10px;font-size:11px;" onclick="openPermEdit('${acc.id}')" title="Phân quyền menu">🔐</button>
          <button class="btn-remove" onclick="revokeAccount('${acc.id}')" title="Thu hồi quyền">🚫</button>`}
        </div>
      </div>`;
    });
  });

  membersEl.innerHTML = html;
}

async function changeRole(id, newRole){
  const accounts = await apiGetAccounts();
  const acc = accounts.find(a => a.id === id);
  if(!acc) return;
  acc.role = newRole;
  await apiSaveAccounts(accounts);
  // Toast nhỏ
  showToast('✅ Đã đổi quyền thành công');
}

async function approveAccount(id){
  const accounts = await apiGetAccounts();
  const acc = accounts.find(a => a.id === id);
  if(!acc) return;
  const roleEl = document.getElementById('role-' + id);
  const role = roleEl ? roleEl.value : 'staff';
  acc.status = 'approved';
  acc.role = role;
  acc.approvedAt = new Date().toISOString();
  // Lưu allowedSections (chỉ với role staff/viewer, admin thấy tất)
  if(role !== 'admin' && role !== 'superadmin'){
    const cbs = document.querySelectorAll('.perm-cb-' + id + ':checked');
    acc.allowedSections = [...cbs].map(cb => cb.value);
  } else {
    acc.allowedSections = null; // admin thấy tất cả
  }
  // Lưu allowedStores từ checkboxes
  if(role === 'admin' || role === 'superadmin'){
    acc.allowedStores = null; // admin thấy tất cả stores
    acc.branch = 'global';
  } else {
    const storeCbs = document.querySelectorAll('.perm-store-cb-' + id + ':checked');
    acc.allowedStores = [...storeCbs].map(cb => cb.value);
    // Set branch = cửa hàng đầu tiên được phân (để data load đúng ngay khi login)
    acc.branch = (acc.allowedStores.length > 0) ? acc.allowedStores[0] : 'global';
  }
  await apiSaveAccounts(accounts);
  if(fbDb) try { await fbDb.ref('pendingNotify/' + acc.googleUid).remove(); } catch(e){}
  await refreshApprovalList();
  showToast('✅ Đã duyệt tài khoản', acc.fullname || acc.email);
}

async function rejectAccount(id){
  const accounts = await apiGetAccounts();
  const acc = accounts.find(a => a.id === id);
  if(!acc) return;
  acc.status = 'rejected';
  await apiSaveAccounts(accounts);
  await refreshApprovalList();
}

async function revokeAccount(id){
  if(!confirm('Thu hồi quyền truy cập của tài khoản này?')) return;
  const accounts = await apiGetAccounts();
  const acc = accounts.find(a => a.id === id);
  if(!acc) return;
  acc.status = 'pending';
  delete acc.approvedAt;
  await apiSaveAccounts(accounts);
  await refreshApprovalList();
}

// Check pending badge khi superadmin login
async function changeRole(id, newRole){
  const accounts = await apiGetAccounts();
  const acc = accounts.find(a => a.id === id);
  if(!acc) return;
  acc.role = newRole;
  await apiSaveAccounts(accounts);
  // Cập nhật lại list mà không reload toàn bộ
  await refreshApprovalList();
  // Ở lại tab members
  switchApprovalTab('members');
}

async function checkPendingBadge(){
  if(currentUser?.role !== 'superadmin') return;
  const btn = $('approve-btn');
  if(btn) btn.style.display = 'inline-flex';
  const accounts = await apiGetAccounts();
  const pendingCount = accounts.filter(a => a.status === 'pending').length;
  const badge = $('pending-badge');
  if(badge) badge.textContent = pendingCount > 0 ? '(' + pendingCount + ')' : '';
  // Lắng nghe realtime pending mới
  if(fbDb){
    fbDb.ref('pendingNotify').on('value', snap => {
      const count = snap.numChildren();
      if(badge) badge.textContent = count > 0 ? '(' + count + ')' : '';
    });
  }
}



// ══════════════════════════════════════════════════════════════
// LƯU TRỮ TÀI LIỆU
// ══════════════════════════════════════════════════════════════
const DOC_STORAGE_KEY = 'zentea-docs-v1';
// _docFilter declared in config.js

function docGetList() {
  try { return JSON.parse(localStorage.getItem(DOC_STORAGE_KEY) || '[]'); }
  catch(e) { return []; }
}

function docSaveList(list) {
  localStorage.setItem(DOC_STORAGE_KEY, JSON.stringify(list));
}

function docGetIcon(ext) {
  const icons = { xlsx:'📊', xls:'📊', docx:'📝', doc:'📝',
                  pptx:'📊', ppt:'📊', pdf:'📄' };
  return icons[ext] || '📎';
}

function docGetTypeClass(ext) {
  if(['xlsx','xls'].includes(ext)) return 'excel';
  if(['docx','doc'].includes(ext)) return 'word';
  if(['pptx','ppt'].includes(ext)) return 'ppt';
  if(ext === 'pdf') return 'pdf';
  return 'other';
}

function docFormatSize(bytes) {
  if(bytes < 1024) return bytes + ' B';
  if(bytes < 1024*1024) return (bytes/1024).toFixed(1) + ' KB';
  return (bytes/1024/1024).toFixed(2) + ' MB';
}

function docSetFilter(type, btn) {
  _docFilter = type;
  document.querySelectorAll('.doc-filter-btn').forEach(b => b.classList.remove('active'));
  if(btn) btn.classList.add('active');
  docRender();
}

function docHandleDrop(event) {
  event.preventDefault();
  document.getElementById('doc-upload-zone').classList.remove('drag-over');
  const files = event.dataTransfer.files;
  if(files.length) docHandleFiles(files);
}

function docHandleFiles(files) {
  const allowed = ['xlsx','xls','docx','doc','pptx','ppt','pdf'];
  let addedCount = 0;
  const list = docGetList();

  Array.from(files).forEach(file => {
    const ext = file.name.split('.').pop().toLowerCase();
    if(!allowed.includes(ext)) {
      showToast('⚠️ File không hỗ trợ: ' + file.name, 'Chỉ nhận Excel, Word, PowerPoint, PDF');
      return;
    }
    // Check duplicate
    if(list.find(d => d.name === file.name && d.size === file.size)) {
      showToast('⚠️ File đã tồn tại', file.name);
      return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
      const doc = {
        id: 'doc-' + Date.now() + '-' + Math.random().toString(36).substr(2,6),
        name: file.name,
        ext: ext,
        size: file.size,
        type: docGetTypeClass(ext),
        data: e.target.result,
        uploadedAt: new Date().toISOString(),
        uploadedBy: (typeof currentUser !== 'undefined' && currentUser) ? (currentUser.fullname || currentUser.user) : 'Unknown'
      };
      const currentList = docGetList();
      currentList.unshift(doc);
      docSaveList(currentList);
      addedCount++;
      docRender();
      showToast('✅ Đã lưu tài liệu', file.name);
    };
    reader.readAsDataURL(file);
  });
  // Reset input
  const inp = document.getElementById('doc-file-input');
  if(inp) inp.value = '';
}

function docDownload(id) {
  const list = docGetList();
  const doc = list.find(d => d.id === id);
  if(!doc) return;
  const a = document.createElement('a');
  a.href = doc.data;
  a.download = doc.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast('⬇️ Đang tải xuống', doc.name);
}

function docDelete(id) {
  const list = docGetList();
  const doc = list.find(d => d.id === id);
  if(!doc) return;
  if(!confirm('Xóa tài liệu "' + doc.name + '"?')) return;
  const newList = list.filter(d => d.id !== id);
  docSaveList(newList);
  docRender();
  showToast('🗑️ Đã xóa', doc.name);
}

function docRender() {
  const grid = document.getElementById('doc-grid');
  const emptyEl = document.getElementById('doc-empty');
  if(!grid) return;

  const searchVal = (document.getElementById('doc-search')?.value || '').toLowerCase();
  let list = docGetList();

  // Filter by type
  if(_docFilter !== 'all') {
    list = list.filter(d => d.type === _docFilter);
  }
  // Filter by search
  if(searchVal) {
    list = list.filter(d => d.name.toLowerCase().includes(searchVal));
  }

  if(!list.length) {
    grid.innerHTML = '';
    if(emptyEl) emptyEl.style.display = 'block';
    return;
  }
  if(emptyEl) emptyEl.style.display = 'none';

  grid.innerHTML = list.map(doc => {
    const icon = docGetIcon(doc.ext);
    const badgeClass = 'badge-' + doc.ext;
    const date = doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString('vi-VN') : '';
    const size = docFormatSize(doc.size || 0);
    return `<div class="doc-card">
      <span class="doc-type-badge ${badgeClass}">${doc.ext.toUpperCase()}</span>
      <span class="doc-icon">${icon}</span>
      <div class="doc-name">${doc.name}</div>
      <div class="doc-meta">${size} · ${date}</div>
      <div class="doc-actions">
        <button class="btn-doc-dl" onclick="openDocViewer('${doc.id}')" style="background:var(--green-light);">👁️ Xem</button>
        <button class="btn-doc-dl" onclick="docDownload('${doc.id}')">⬇️</button>
        <button class="btn-doc-del" onclick="docDelete('${doc.id}')">🗑️</button>
      </div>
    </div>`;
  }).join('');
}


function permToggleAll(id, state) {
  document.querySelectorAll('.perm-cb-' + id).forEach(cb => cb.checked = state);
}

function storeToggleAll(id, state) {
  document.querySelectorAll('.perm-store-cb-' + id).forEach(cb => cb.checked = state);
}

async function openPermEdit(id) {
  const accounts = await apiGetAccounts();
  const acc = accounts.find(a => a.id === id);
  if(!acc) return;

  const current = acc.allowedSections || NAV_SECTIONS.map(s => s.id);
  const qlch = NAV_SECTIONS.filter(s => s.group === 'qlch');
  const dt   = NAV_SECTIONS.filter(s => s.group === 'dt');
  const makeBoxes = (list) => list.map(s =>
    `<label class="perm-item">
      <input type="checkbox" class="perm-edit-cb" value="${s.id}" ${current.includes(s.id)?'checked':''}>
      <label>${s.label}</label>
    </label>`
  ).join('');
  const permBoxes = `
    <div style="font-size:11px;font-weight:800;color:var(--green);letter-spacing:1px;margin:8px 0 6px;text-transform:uppercase;">🏪 Quản Lý Cửa Hàng</div>
    <div class="perm-grid">${makeBoxes(qlch)}</div>
    <div style="font-size:11px;font-weight:800;color:#6366f1;letter-spacing:1px;margin:14px 0 6px;text-transform:uppercase;">🎓 Đào Tạo</div>
    <div class="perm-grid">${makeBoxes(dt)}</div>
  `;

  // Build stores checkboxes
  const accStores = acc.allowedStores || [];
  const isAdminRole = (acc.role === 'admin' || acc.role === 'superadmin');
  const storeBoxes = Object.entries(STORES)
    .filter(([id]) => id !== 'global')
    .map(([id, name]) =>
      `<label class="perm-item">
        <input type="checkbox" class="perm-store-cb" value="${id}" ${(isAdminRole || accStores.includes(id)) ? 'checked' : ''}>
        <label style="font-size:11px;">${name.replace('ZEN Tea ','')}</label>
      </label>`
    ).join('');
  const html = `<div style="padding:20px 22px;max-height:85vh;overflow-y:auto;">
    <!-- Header user -->
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;padding-bottom:14px;border-bottom:1.5px solid #e5e7eb;">
      <div style="width:42px;height:42px;border-radius:50%;overflow:hidden;background:var(--green);display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;flex-shrink:0;">
        ${acc.avatar ? '<img src="'+acc.avatar+'" style="width:100%;height:100%;object-fit:cover;">' : '👤'}
      </div>
      <div>
        <div style="font-size:14px;font-weight:800;color:#1a1a1a;">${acc.fullname || acc.username}</div>
        <div style="font-size:11px;color:#9ca3af;">${acc.email}</div>
      </div>
    </div>

    <!-- Menu permissions -->
    <div style="font-size:12px;font-weight:800;color:var(--green);letter-spacing:.5px;text-transform:uppercase;margin-bottom:6px;">📋 Quyền Menu</div>
    <div style="font-size:11px;margin-bottom:8px;">
      <span class="perm-select-all" onclick="document.querySelectorAll('.perm-edit-cb').forEach(c=>c.checked=true)">✅ Chọn tất</span>
      &nbsp;·&nbsp;
      <span class="perm-select-all" onclick="document.querySelectorAll('.perm-edit-cb').forEach(c=>c.checked=false)">❌ Bỏ tất</span>
    </div>
    <div style="font-size:11px;font-weight:700;color:#374151;margin:4px 0 3px;">🏪 Quản Lý Cửa Hàng</div>
    <div class="perm-grid">${makeBoxes(qlch)}</div>
    <div style="font-size:11px;font-weight:700;color:#374151;margin:8px 0 3px;">🎓 Đào Tạo</div>
    <div class="perm-grid">${makeBoxes(dt)}</div>

    <!-- Store permissions -->
    <div style="font-size:12px;font-weight:800;color:#6366f1;letter-spacing:.5px;text-transform:uppercase;margin:16px 0 6px;">🏪 Quyền Cửa Hàng</div>
    <div style="font-size:11px;margin-bottom:8px;">
      <span class="perm-select-all" onclick="document.querySelectorAll('.perm-store-cb').forEach(c=>c.checked=true)">✅ Chọn tất</span>
      &nbsp;·&nbsp;
      <span class="perm-select-all" onclick="document.querySelectorAll('.perm-store-cb').forEach(c=>c.checked=false)">❌ Bỏ tất</span>
    </div>
    <div class="perm-store-grid">${storeBoxes}</div>

    <div style="display:flex;gap:8px;margin-top:18px;">
      <button class="btn-approve" style="flex:1;padding:10px;" onclick="savePermEdit('${id}')">💾 Lưu quyền</button>
      <button class="btn-reject" style="padding:10px 16px;" onclick="closePerm()">✕ Hủy</button>
    </div>
  </div>`;

  
  // Show in a modal overlay
  let overlay = document.getElementById('perm-edit-overlay');
  if(!overlay){
    overlay = document.createElement('div');
    overlay.id = 'perm-edit-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;';
    overlay.onclick = function(e){ if(e.target===this) closePerm(); };
    document.body.appendChild(overlay);
  }
  overlay.innerHTML = `<div style="background:#fff;border-radius:20px;max-width:420px;width:90%;max-height:90vh;overflow-y:auto;">${html}</div>`;
  overlay.style.display = 'flex';
  overlay._editId = id;
}

function closePerm(){
  const o = document.getElementById('perm-edit-overlay');
  if(o) o.style.display = 'none';
}

async function savePermEdit(id){
  const accounts = await apiGetAccounts();
  const acc = accounts.find(a => a.id === id);
  if(!acc) return;
  const cbs = document.querySelectorAll('.perm-edit-cb:checked');
  acc.allowedSections = [...cbs].map(cb => cb.value);
  const storeCbs = document.querySelectorAll('.perm-store-cb:checked');
  acc.allowedStores = [...storeCbs].map(cb => cb.value);
  // Set branch = cửa hàng đầu tiên được phân
  if(acc.role !== 'admin' && acc.role !== 'superadmin'){
    acc.branch = (acc.allowedStores && acc.allowedStores.length > 0)
      ? acc.allowedStores[0] : 'global';
  } else {
    acc.branch = 'global';
  }
  await apiSaveAccounts(accounts);
  closePerm();
  await renderMembersList();
  showToast('✅ Đã cập nhật quyền', acc.fullname || acc.email);
}


// ══════════════════════════════════════════════════════════════
// DOCUMENT VIEWER
// ══════════════════════════════════════════════════════════════
// _viewerCurrentDoc declared in config.js