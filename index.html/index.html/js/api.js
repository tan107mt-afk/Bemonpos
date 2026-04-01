/* ═══════════════════════════════════════════════════
   ZENTEA – Firebase API, localStorage, Employees, Schedule
   File: js/api.js
═══════════════════════════════════════════════════ */

// ─── Branch-scoped storage key helper ──────────────────────────
// All per-branch data is prefixed with the branch ID so stores never share data
function branchKey(key){
  // Namespace logic:
  // 1. Nếu đang chọn chi nhánh cụ thể (cn01..cn17):
  //    - Admin/Superadmin: dùng branch ID → data chia sẻ cho chi nhánh đó
  //    - Staff: dùng branch ID → đọc data được admin nhập cho chi nhánh đó
  // 2. Nếu 'global' hoặc không có branch:
  //    - Dùng username → backward compatible với data cũ
  const hasBranch = typeof selectedBranch !== 'undefined' 
    && selectedBranch 
    && selectedBranch !== 'global'
    && /^cn\d+$/.test(selectedBranch); // chỉ cn01-cn17 pattern
  
  const ns = hasBranch
    ? selectedBranch
    : (currentUser && currentUser.user ? currentUser.user : 'global');
  return ns + '-' + key;
}

// Called once after a successful login to load all branch data

// Hiển thị trạng thái "Chi nhánh chưa có dữ liệu" cho section
function showBranchEmptyState(sectionId, dataLabel){
  if(!selectedBranch || selectedBranch === 'global') return;
  const section = document.getElementById(sectionId);
  if(!section) return;
  
  // Kiểm tra nếu section đang active
  if(!section.classList.contains('page-active')) return;
  
  const branchName = STORES[selectedBranch] || selectedBranch;
  let emptyEl = section.querySelector('.branch-empty-state');
  if(!emptyEl){
    emptyEl = document.createElement('div');
    emptyEl.className = 'branch-empty-state';
    emptyEl.style.cssText = 'text-align:center;padding:40px 20px;color:#9ca3af;';
    emptyEl.innerHTML = `
      <div style="font-size:40px;margin-bottom:12px;">📭</div>
      <div style="font-size:15px;font-weight:700;color:#374151;margin-bottom:6px;">
        Chưa có dữ liệu cho ${branchName}
      </div>
      <div style="font-size:13px;line-height:1.6;">
        ${dataLabel || 'Dữ liệu'} của chi nhánh này chưa được nhập.<br>
        ${currentUser?.role === 'staff' ? 'Liên hệ quản lý để cập nhật.' : 'Hãy thêm dữ liệu cho chi nhánh này.'}
      </div>
    `;
    // Chèn sau panel-titlebar
    const titlebar = section.querySelector('.panel-titlebar');
    if(titlebar) titlebar.after(emptyEl);
    else section.prepend(emptyEl);
  }
}

// Xóa empty state khi có data
function hideBranchEmptyState(sectionId){
  const section = document.getElementById(sectionId);
  section?.querySelector('.branch-empty-state')?.remove();
}
async function loadBranchData(){
  // Cập nhật banner chi nhánh
  _updateBranchBanner();
  
  // Load tất cả data của chi nhánh hiện tại
  await loadContacts();
  await loadEmployees();
  await loadShifts();
  await loadViolations();
  await loadSchedule();
  await loadCleaning();
  await loadCustomRecipes();
  
  // Reload checklist data cho branch mới
  if(typeof clLoadDateDone === 'function') await clLoadDateDone();
  if(typeof clLoadDateOverrides === 'function') await clLoadDateOverrides();
  
  // Re-render section đang hiện (nếu có)
  const active = document.querySelector('.acc-section.page-active');
  if(active){
    const id = active.id;
    // Trigger re-render theo section
    try {
      if(id === 'contacts') renderContactsGrid && renderContactsGrid();
      else if(id === 'employees') renderEmployees && renderEmployees();
      else if(id === 'violations') renderViolations && renderViolations();
      else if(id === 'checklist') {
        if(typeof clRenderList === 'function') clRenderList();
        else if(typeof clRenderTimeline === 'function') clRenderTimeline();
      }
      else if(id === 'recipes') renderRecipes && renderRecipes();
    } catch(e){}
  }
}

function _updateBranchBanner(){
  const userNameEl = document.getElementById('tb-user-name');
  if(!currentUser) return;
  
  const branchName = (selectedBranch && selectedBranch !== 'global') 
    ? (STORES[selectedBranch] || selectedBranch) 
    : null;
  
  // Cập nhật topbar user name + chi nhánh
  if(userNameEl){
    userNameEl.textContent = branchName 
      ? (currentUser.fullname || currentUser.user || '') + ' — ' + branchName.replace('ZEN Tea ','')
      : (currentUser.fullname || currentUser.user || '');
  }

  // Cập nhật store selector trong sidebar
  const storeSel = document.getElementById('sb-store-sel');
  if(storeSel && selectedBranch){
    storeSel.value = selectedBranch;
  }
  
  // Hiển thị/ẩn banner "Đang xem chi nhánh" ở đầu content
  let banner = document.getElementById('branch-view-banner');
  if(branchName && currentUser.role !== 'superadmin'){
    if(!banner){
      banner = document.createElement('div');
      banner.id = 'branch-view-banner';
      banner.style.cssText = 'display:none;';
      document.getElementById('main')?.prepend(banner);
    }
    banner.innerHTML = `<div style="
      background:linear-gradient(135deg,var(--green),#3a9430);
      color:#fff;padding:8px 20px;font-size:13px;font-weight:700;
      display:flex;align-items:center;gap:8px;
    ">🏪 ${branchName} <span style="font-weight:400;opacity:.85;font-size:12px;">— Chi nhánh đang quản lý</span></div>`;
    banner.style.display = 'block';
  } else if(banner){
    banner.style.display = 'none';
  }
}

// EMOJI PICKER

function selectEmoji(em){
  $('ef-emoji').value = em;
  $('ef-emoji-btn').textContent = em;
  hide('emoji-picker');
}

// Emoji picker initialized on first open

// CONTACTS EDIT SYSTEM
const DEFAULT_CONTACTS = [
  {id:'c1',dept:'Tổng kho tất cả chi nhánh',name:'Nguyễn Quang Khoa',phone:'0946633098'},
  {id:'c2',dept:'Nhân sự',name:'Hoàng Anh',phone:'0906720820'},
  {id:'c3',dept:'IT – Lỗi POS – Camera',name:'Chắng Gia Minh',phone:'0942253157'},
  {id:'c4',dept:'Thiết kế',name:'Phạm Chí Hiếu',phone:'0977391392'},
  {id:'c5',dept:'Thu mua thiết bị dụng cụ',name:'Lê Minh Trí',phone:'0868799503'},
  {id:'c6',dept:'Hóa đơn thuế',name:'Đỗ Trần Phương Linh',phone:'0918575702'},
  {id:'c7',dept:'Phòng nguyên liệu',name:'Cao Thị Thủy',phone:'0388518600'},
  {id:'c8',dept:'ATLĐ – PCCC',name:'Lê Minh Trí',phone:'0868799503'},
  {id:'c9',dept:'Thiết bị dụng cụ',name:'Nguyễn Hà Duy Nhật',phone:'0567947819'},
  {id:'c10',dept:'Cơ sở vật chất – điện – nước',name:'Nguyễn Anh Vũ',phone:'0327142721'},
  {id:'c11',dept:'Kế toán lương',name:'Nguyễn Hoàng Anh',phone:'0373868945'},
  {id:'c12',dept:'Kế toán doanh thu',name:'Trần Phương Uyên',phone:'0933256740'},
  {id:'c13',dept:'Hợp đồng – Chốt công',name:'Nguyễn Ngọc Quỳnh Như',phone:'0788345979'},
  {id:'c14',dept:'HR',name:'Nguyễn Thị Trúc Ly',phone:'0399879085'},
  {id:'c15',dept:'Chất lượng bakery',name:'Nguyễn Thị Bích Hân',phone:'0905046200'},
  {id:'c16',dept:'Chất lượng nguyên liệu',name:'Lê Phương Anh',phone:'0845599278'},
  {id:'c17',dept:'Đào tạo – Kỹ năng 1',name:'Nguyễn Phát Lộc',phone:'0375999005'},
  {id:'c18',dept:'Đào tạo – Kỹ năng 2',name:'Lê Nguyễn Minh Tân',phone:'0938574215'},
  {id:'c19',dept:'Truyền thông bán hàng',name:'Z E N A D',phone:'0988446746'},
  {id:'c20',dept:'Chỉnh sửa file bánh, file topping',name:'Nguyễn Thị Ngọc Mai',phone:'0359688216'},
];

let contactsData = [...DEFAULT_CONTACTS];

async function loadContacts(){
  contactsData = [...DEFAULT_CONTACTS];
  try {
    const r = await window.storage.get(branchKey('zentea-contacts'));
    if(r && r.value) contactsData = JSON.parse(r.value);
  } catch(e){
    try {
      const s = localStorage.getItem(branchKey('zentea-contacts'));
      if(s) contactsData = JSON.parse(s);
    } catch(e2){}
  }
  renderContactsGrid();
}
async function saveContacts(){
  try { await window.storage.set(branchKey('zentea-contacts'), JSON.stringify(contactsData)); } catch(e){}
  try { localStorage.setItem(branchKey('zentea-contacts'), JSON.stringify(contactsData)); } catch(e){}
}

function renderContactsGrid(){
  const cg = $('contacts-grid');
  if(!cg) return;
  cg.innerHTML = contactsData.map(c => `
    <div class="contact-card">
      <div class="contact-dept">${c.dept}</div>
      <div class="contact-name">${c.name}</div>
      <div class="contact-phone">📞 ${c.phone}</div>
    </div>`).join('');
}

function openContactEdit(){
  show('contact-modal','flex');
  switchContactTab('list');
  renderContactListEditable();
}
function closeContactModal(){ hide('contact-modal'); }
var _cm=$('contact-modal'); if(_cm) _cm.addEventListener('click', function(e){ if(e.target===this) closeContactModal(); });

function switchContactTab(tab){
  $('ctab-list-content').style.display = tab==='list' ? 'block' : 'none';
  $('ctab-edit-content').style.display = tab==='edit' ? 'block' : 'none';
  const listBtn = $('ctab-list');
  const editBtn = $('ctab-edit');
  if(tab==='list'){
    listBtn.style.background='var(--green)'; listBtn.style.color='#fff'; listBtn.style.borderColor='var(--green)';
    editBtn.style.background='#fff'; editBtn.style.color='#888'; editBtn.style.borderColor='var(--border)';
  } else {
    editBtn.style.background='var(--green)'; editBtn.style.color='#fff'; editBtn.style.borderColor='var(--green)';
    listBtn.style.background='#fff'; listBtn.style.color='#888'; listBtn.style.borderColor='var(--border)';
  }
}

function renderContactListEditable(){
  const el = $('contact-list-editable');
  el.innerHTML = contactsData.map(c => `
    <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--green-pale);border-radius:10px;">
      <div style="flex:1;">
        <div style="font-size:11px;font-weight:700;color:var(--green);letter-spacing:.5px;">${c.dept}</div>
        <div style="font-size:13px;font-weight:600;color:var(--dark);">${c.name} · ${c.phone}</div>
      </div>
      <button onclick="editContact('${c.id}')" style="padding:5px 12px;background:var(--green);color:#fff;border:none;border-radius:8px;font-size:12px;cursor:pointer;">✏️</button>
    </div>`).join('');
  // Add new button
  el.innerHTML += `<button onclick="clearContactForm();switchContactTab('edit')" style="width:100%;margin-top:8px;padding:12px;background:#fff;color:var(--green);border:2px dashed var(--green);border-radius:10px;font-family:'Open Sans',sans-serif;font-size:13px;font-weight:700;cursor:pointer;">➕ Thêm liên hệ mới</button>`;
}

function editContact(id){
  const c = contactsData.find(x=>x.id===id);
  if(!c) return;
  $('ce-id').value = id;
  $('ce-dept').value = c.dept;
  $('ce-name').value = c.name;
  $('ce-phone').value = c.phone;
  show('ce-delete-btn');
  switchContactTab('edit');
}

function clearContactForm(){
  $('ce-id').value = '';
  $('ce-dept').value = '';
  $('ce-name').value = '';
  $('ce-phone').value = '';
  hide('ce-delete-btn');
}

async function saveContact(){
  const dept = $('ce-dept').value.trim();
  const name = $('ce-name').value.trim();
  const phone = $('ce-phone').value.trim();
  if(!dept || !name || !phone){ alert('Vui lòng điền đầy đủ thông tin'); return; }
  const id = $('ce-id').value;
  if(id){
    const idx = contactsData.findIndex(c=>c.id===id);
    if(idx >= 0) contactsData[idx] = {id, dept, name, phone};
  } else {
    contactsData.push({id:'c'+Date.now(), dept, name, phone});
  }
  await saveContacts();
  renderContactsGrid();
  renderContactListEditable();
  switchContactTab('list');
  clearContactForm();
}

async function deleteContact(){
  const id = $('ce-id').value;
  if(!id || !confirm('Xóa liên hệ này?')) return;
  contactsData = contactsData.filter(c=>c.id!==id);
  await saveContacts();
  renderContactsGrid();
  renderContactListEditable();
  switchContactTab('list');
  clearContactForm();
}

// Override contacts rendering - use contactsData instead of hardcoded
// Remove old contacts render from existing code by overriding
// Init handled by DOMContentLoaded


function closeRecipeModal(){ hide('recipe-modal'); }

// ─── EDIT / ADD MODAL ───

// ─── EMOJI PICKER ───
const EMOJIS = [
  '🧋','☕','🍵','🍑','🍋','🍍','🍈','🌿','🌱','⭐','🖤','🍫','🍮','🍧','🥭','🧃',
  '🫖','🥤','🍹','🍺','🍷','🥛','🍼','🫗','🧊','🍰','🎂','🍩','🍪','🎁','🏆','🌸',
  '🌺','🌻','🌹','💚','💛','🧡','❤️','💜','💙','🤍','🖤','🟢','🟡','🟠','🔴','🟣',
  '✨','⚡','🔥','💧','🌊','🍃','🌴','🌵','🎋','🎍','🎀','🎊','🎉','🎯','💎','🔮',
];

function initEmojiPicker(){
  const grid = $('emoji-grid');
  if(!grid || grid.children.length > 0) return;
  grid.innerHTML = EMOJIS.map(e =>
    `<button type="button" onclick="pickEmoji('${e}')"
      style="background:none;border:none;font-size:22px;cursor:pointer;padding:4px;border-radius:8px;
      transition:.15s;" onmouseover="this.style.background='var(--green-pale)'" onmouseout="this.style.background='none'">${e}</button>`
  ).join('');
}

function pickEmoji(e){
  $('ef-emoji').value = e;
  const btn = $('ef-emoji-btn');
  if(btn) btn.textContent = e;
  hide('emoji-picker');
}

function toggleEmojiPicker(evt){
  if(evt) evt.stopPropagation();
  initEmojiPicker();
  const p = $('emoji-picker');
  p.style.display = p.style.display === 'none' ? 'block' : 'none';
}

// Close picker when clicking outside
document.addEventListener('click', function(e){
  const picker = $('emoji-picker');
  const btn = $('ef-emoji-btn');
  if(picker && !picker.contains(e.target) && e.target !== btn){
    picker.style.display = 'none';
  }
});

// ── Ingredient table helpers ──
function ingRowHtml(label, mVal, lVal, idx){
  var bg = idx%2===0?'#fff':'#f9fef9';
  var inp = 'width:100%;padding:6px 8px;border:1.5px solid var(--border);border-radius:7px;'
          + 'font-family:\'Open Sans\',sans-serif;font-size:12px;outline:none;box-sizing:border-box;background:#fff;';
  return '<tr style="background:'+bg+';" data-ing-row>'
    +'<td style="padding:5px 8px;border-top:1px solid var(--border);">'
    +'<input type="text" placeholder="Tên nguyên liệu…" value="'+label+'" data-ing-label '
    +'style="'+inp+'" onfocus="this.style.borderColor=\'var(--green)\'" onblur="this.style.borderColor=\'var(--border)\'"/></td>'
    +'<td style="padding:5px 8px;border-top:1px solid var(--border);border-left:1px solid var(--border);">'
    +'<input type="text" placeholder="VD: 120ml" value="'+mVal+'" data-ing-m '
    +'style="'+inp+'text-align:center;color:#16a34a;font-weight:600;" onfocus="this.style.borderColor=\'#16a34a\'" onblur="this.style.borderColor=\'var(--border)\'"/></td>'
    +'<td style="padding:5px 8px;border-top:1px solid var(--border);border-left:1px solid var(--border);">'
    +'<input type="text" placeholder="VD: 180ml" value="'+lVal+'" data-ing-l '
    +'style="'+inp+'text-align:center;color:#1d4ed8;font-weight:600;" onfocus="this.style.borderColor=\'#1d4ed8\'" onblur="this.style.borderColor=\'var(--border)\'"/></td>'
    +'<td style="padding:5px 6px;border-top:1px solid var(--border);border-left:1px solid var(--border);text-align:center;">'
    +'<button type="button" onclick="this.closest(\'tr\').remove()" '
    +'style="background:none;border:none;color:#f87171;font-size:15px;cursor:pointer;padding:2px 4px;line-height:1;">✕</button></td>'
    +'</tr>';
}

function ingParseString(s){
  s = (s||'').trim();
  var label='', mVals=[], lVals=[];
  var c = s.indexOf(': ');
  if(c > -1){
    label = s.slice(0,c);
    var rest = s.slice(c+2);
    var parts = rest.split(/\s*\|\s*/);
    parts.forEach(function(p){
      p = p.trim();
      // M→val
      var m = p.match(/^M[:→]\s*(.+)$/i); if(m){ mVals.push(m[1].trim()); return; }
      // L→val
      var l = p.match(/^L[:→]\s*(.+)$/i); if(l){ lVals.push(l[1].trim()); return; }
      // "Cơ bản→M:10g|L:15g" inline
      var ml = p.match(/M[:→]\s*([^|]+)\|L[:→]\s*(.+)/i);
      if(ml){ mVals.push(ml[1].trim()); lVals.push(ml[2].trim()); return; }
      // "0→15g|23g" level→M|L
      var lv = p.match(/^([^→→]+)[→→]([^|]+)\|(.+)$/);
      if(lv){ mVals.push(lv[1].trim()+': '+lv[2].trim()); lVals.push(lv[1].trim()+': '+lv[3].trim()); return; }
      // fallback
      if(!mVals.length) mVals.push(p);
    });
  } else { label = s; }
  return {label:label, mVal:mVals.join(', '), lVal:lVals.join(', ')};
}

function ingSetRows(list){
  var tbody = $('ing-tbody');
  if(!tbody) return;
  if(!list || !list.length){ tbody.innerHTML = ingRowHtml('','','',0); return; }
  tbody.innerHTML = list.map(function(item, i){
    var label='', mVal='', lVal='';
    if(typeof item === 'string'){
      var p = ingParseString(item);
      label=p.label; mVal=p.mVal; lVal=p.lVal;
    } else {
      label = item.label||'';
      var vals = item.vals||[];
      vals.forEach(function(v){
        v=(v||'').trim();
        var m=v.match(/^M[:\u2192]\s*(.+)$/i); if(m){mVal=m[1].trim();return;}
        var l=v.match(/^L[:\u2192]\s*(.+)$/i); if(l){lVal=l[1].trim();return;}
        if(!mVal && !lVal) mVal=v;
      });
    }
    return ingRowHtml(label, mVal, lVal, i);
  }).join('');
}

function ingAddRow(){
  var tbody = $('ing-tbody');
  if(!tbody) return;
  var idx = tbody.querySelectorAll('tr').length;
  tbody.insertAdjacentHTML('beforeend', ingRowHtml('','','',idx));
}

function ingGetRows(){
  var rows = document.querySelectorAll('#ing-tbody [data-ing-row]');
  var result = [];
  rows.forEach(function(row){
    var label = (row.querySelector('[data-ing-label]').value||'').trim();
    var mVal  = (row.querySelector('[data-ing-m]').value||'').trim();
    var lVal  = (row.querySelector('[data-ing-l]').value||'').trim();
    if(!label && !mVal && !lVal) return;
    if(!mVal && !lVal){
      result.push(label);
    } else {
      result.push(label + ': M\u2192' + (mVal||'') + ' | L\u2192' + (lVal||''));
    }
  });
  return result;
}

function openAddModal(){
  editingId = null;
  var _emt2=$('edit-modal-title'); if(_emt2) _emt2.textContent = '➕ Thêm công thức mới';
  $('ef-name').value = '';
  $('ef-emoji').value = '🧋';
  const eb = $('ef-emoji-btn');
  if(eb) eb.textContent = '🧋';
  $('ef-cat').value = 'tra-sua';
  $('ef-desc').value = '';
  ingSetRows([]);
  $('ef-steps').value = '';
  $('ef-notes').value = '';
  $('ef-img').value = '';
  hide('delete-btn');
  show('edit-modal','flex');
}

function openEditModal(id){
  const all = getAllRecipes();
  const r = all.find(x=>x.id===id);
  if(!r) return;
  editingId = id;
  var _emt3=$('edit-modal-title'); if(_emt3) _emt3.textContent = '✏️ Chỉnh sửa: ' + r.name;
  $('ef-name').value = r.name;
  $('ef-emoji').value = r.emoji;
  const _eb = $('ef-emoji-btn');
  if(_eb) _eb.textContent = r.emoji;
  $('ef-cat').value = r.cat;
  $('ef-desc').value = r.desc;
  ingSetRows(r.ingredients||[]);
  $('ef-steps').value = (r.steps||[]).join('\n');
  $('ef-notes').value = r.notes || '';
  $('ef-img').value = r.imgUrl || '';
  // Show delete for all recipes
  show('delete-btn');
  show('edit-modal','flex');
}

async function saveRecipe(){
  const name = $('ef-name').value.trim();
  if(!name){ alert('Vui lòng nhập tên món!'); return; }
  const recipe = {
    id: editingId || ('custom-' + Date.now()),
    mode: currentMode,
    cat: $('ef-cat').value,
    name,
    emoji: $('ef-emoji').value || '🧋',
    desc: $('ef-desc').value.trim(),
    ingredients: ingGetRows(),
    steps: $('ef-steps').value.split('\n').filter(x=>x.trim()),
    notes: $('ef-notes').value.trim(),
    imgUrl: $('ef-img').value.trim(),
  };

  // If editing a BASE recipe, add as custom override
  const existingIdx = customRecipes.findIndex(c=>c.id===editingId);
  if(existingIdx >= 0) customRecipes[existingIdx] = recipe;
  else customRecipes.push(recipe);

  await saveCustomRecipes();
  closeEditModal();
  renderRecipes();
  showToast(editingId ? '✅ Đã chỉnh sửa!' : '✅ Đã thêm mới!', 'Công thức đã được cập nhật thành công');
}

async function deleteRecipe(){
  if(!editingId) return;
  if(!confirm('Xóa công thức "' + ($('ef-name').value||'này') + '"?')) return;
  // Remove from custom recipes
  customRecipes = customRecipes.filter(c=>c.id!==editingId);
  // If it's a base recipe, mark as deleted so it won't show
  if(!customRecipes.some(c=>c.id===editingId)){
    // Add a tombstone entry to hide base recipe
    customRecipes.push({ id: editingId, _deleted: true });
  }
  await saveCustomRecipes();
  closeEditModal();
  renderRecipes();
  showToast('🗑️ Đã xóa!', 'Công thức đã được xóa khỏi danh sách');
}

function confirmDeleteRecipe(id, nameHint, btnEl){
  // Get recipe name from data
  var recipeName = nameHint || 'món này';
  try{
    var found = getAllRecipes().find(function(r){ return r.id===id; });
    if(found && found.name) recipeName = found.name;
  }catch(e){}

  // Find card container
  var card = btnEl ? btnEl.closest('div[onclick]') : null;
  if(!card){ directDeleteRecipe(id); return; }

  // Remove any existing overlay
  var old = card.querySelector('.del-confirm-ov');
  if(old) old.remove();

  // Build inline Yes/No overlay
  var ov = document.createElement('div');
  ov.className = 'del-confirm-ov';
  ov.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,.75);border-radius:16px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;z-index:20;padding:16px;animation:delOvIn .2s cubic-bezier(.34,1.56,.64,1) both;';
  var yesBtn = document.createElement('button');
  yesBtn.textContent = 'Có, xóa';
  var btnBase = 'padding:10px 26px;border:none;border-radius:10px;font-size:13.5px;font-weight:700;cursor:pointer;font-family:Open Sans,sans-serif;transition:transform .15s cubic-bezier(.34,1.56,.64,1),box-shadow .15s,background .15s;';
  yesBtn.style.cssText = btnBase + 'background:#dc2626;color:#fff;box-shadow:0 4px 14px rgba(220,38,38,.35);';
  yesBtn.onmouseover = function(){ this.style.transform='translateY(-2px) scale(1.04)'; this.style.boxShadow='0 7px 20px rgba(220,38,38,.5)'; this.style.background='#b91c1c'; };
  yesBtn.onmouseout  = function(){ this.style.transform=''; this.style.boxShadow='0 4px 14px rgba(220,38,38,.35)'; this.style.background='#dc2626'; };
  yesBtn.onmousedown = function(){ this.style.transform='scale(.95)'; };
  yesBtn.onmouseup   = function(){ this.style.transform='translateY(-2px) scale(1.04)'; };
  var noBtn = document.createElement('button');
  noBtn.textContent = 'Không';
  noBtn.style.cssText = btnBase + 'background:rgba(255,255,255,.18);border:1.5px solid rgba(255,255,255,.4);color:#fff;';
  noBtn.onmouseover = function(){ this.style.transform='translateY(-2px) scale(1.04)'; this.style.background='rgba(255,255,255,.32)'; };
  noBtn.onmouseout  = function(){ this.style.transform=''; this.style.background='rgba(255,255,255,.18)'; };
  noBtn.onmousedown = function(){ this.style.transform='scale(.95)'; };
  noBtn.onmouseup   = function(){ this.style.transform='translateY(-2px) scale(1.04)'; };

  var msg = document.createElement('div');
  msg.style.cssText = 'color:#fff;font-size:13.5px;font-weight:700;text-align:center;line-height:1.5;';
  msg.innerHTML = 'Bạn có thực sự muốn xóa<br><span style="color:#fca5a5;font-size:15px;">"' + recipeName + '"</span>?';

  var btnRow = document.createElement('div');
  btnRow.style.cssText = 'display:flex;gap:10px;';
  btnRow.appendChild(yesBtn);
  btnRow.appendChild(noBtn);

  ov.appendChild(msg);
  ov.appendChild(btnRow);

  yesBtn.onclick = function(e){ e.stopPropagation(); directDeleteRecipe(id); ov.remove(); };
  noBtn.onclick  = function(e){ e.stopPropagation(); ov.remove(); };

  card.style.position = 'relative';
  card.appendChild(ov);
}

async function directDeleteRecipe(id){
  customRecipes = customRecipes.filter(c=>c.id!==id);
  // Check if it's a base recipe — add tombstone so it won't reappear
  const base = currentMode==='manual' ? BASE_RECIPES : MACHINE_RECIPES;
  if(base.some(r=>r.id===id)){
    customRecipes.push({ id: id, _deleted: true });
  }
  await saveCustomRecipes();
  renderRecipes();
  showToast('🗑️ Đã xóa!', 'Công thức đã được xóa');
}

function closeEditModal(){ hide('edit-modal'); }

function showToast(title, sub){
  var t = $('toast');
  var tt = $('toast-title');
  var ts = $('toast-sub');
  if(!t) return;
  if(tt) tt.textContent = title || 'Hoàn thành!';
  if(ts) ts.textContent = sub || '';
  t.classList.add('show');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(function(){ t.classList.remove('show'); }, 1800);
}

var _rm=$('recipe-modal'); if(_rm) _rm.addEventListener('click', function(e){ if(e.target===this) closeRecipeModal(); });
var _em=$('edit-modal'); if(_em) _em.addEventListener('click', function(e){ if(e.target===this) closeEditModal(); });

// STAFF LIST
// EMPLOYEES
let employeesData = [];
let editingEmpId = null;

async function loadEmployees(){
  employeesData = [];
  try {
    const r = await window.storage.get(branchKey('zentea-employees'));
    if(r && r.value) employeesData = JSON.parse(r.value);
  } catch(e){}
  try {
    const s = localStorage.getItem(branchKey('zentea-employees'));
    if(s && !employeesData.length) employeesData = JSON.parse(s);
  } catch(e){}
}

async function saveEmployees(){
  try { await window.storage.set(branchKey('zentea-employees'), JSON.stringify(employeesData)); } catch(e){}
  try { localStorage.setItem(branchKey('zentea-employees'), JSON.stringify(employeesData)); } catch(e){}
}

const STATUS_COLOR = {
  'Đang làm':'#2e7d32','Thử việc':'#f57c00','Nghỉ phép':'#1565c0','Đã nghỉ':'#c62828'
};
const STATUS_BG = {
  'Đang làm':'#e8f5e9','Thử việc':'#fff3e0','Nghỉ phép':'#e3f2fd','Đã nghỉ':'#ffebee'
};

function renderEmployees(){
  const tbody = $('emp-tbody');
  if(!tbody) return;
  const q = ($('emp-search')?.value || '').toLowerCase();
  const list = employeesData.filter(e =>
    !q || (e.name||'').toLowerCase().includes(q) || (e.role||'').toLowerCase().includes(q) || (e.shift||'').toLowerCase().includes(q)
  );

  if(!list.length){
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:32px;color:#bbb;">Chưa có nhân viên nào 👥</td></tr>`;
  } else {
    tbody.innerHTML = list.map(e => {
      // KPI average
      const kpis = (e.kpi||[]).filter(k=>k!==''&&k!==null&&k!==undefined);
      const kpiAvg = kpis.length ? Math.round(kpis.reduce((a,b)=>a+parseFloat(b||0),0)/kpis.length) : null;
      const kpiColor = kpiAvg===null ? '#bbb' : kpiAvg>=80 ? '#2e7d32' : kpiAvg>=60 ? '#f57c00' : '#c62828';
      const kpiDisplay = kpiAvg!==null ? `<span style="font-weight:700;color:${kpiColor};">${kpiAvg}%</span>` : '—';
      const rankDate = e.rankdate ? `<span style="font-size:11px;color:#666;">${e.rankdate}</span>` : '—';
      return `
      <tr style="cursor:pointer;" onclick="openEmpModal('${e.id}')"
        onmouseover="this.style.background='#f9fef9'" onmouseout="this.style.background=''">
        <td style="font-weight:600;">${e.name}</td>
        <td>${e.role}</td>
        <td>${e.shift}</td>
        <td>${e.phone || '—'}</td>
        <td><span style="background:var(--green-pale);color:var(--green);padding:2px 10px;border-radius:20px;font-size:12px;font-weight:700;">Bậc ${e.rank}</span></td>
        <td style="font-size:12px;">${rankDate}</td>
        <td style="text-align:center;">${kpiDisplay}</td>
        <td><span style="background:${STATUS_BG[e.status]||'#f5f5f5'};color:${STATUS_COLOR[e.status]||'#555'};
          padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;">${e.status}</span></td>
        <td style="text-align:center;">
          <button onclick="event.stopPropagation();openEmpModal('${e.id}')"
            style="background:var(--green-pale);border:none;border-radius:8px;padding:5px 12px;
            color:var(--green);font-size:12px;font-weight:700;cursor:pointer;">✏️ Sửa</button>
        </td>
      </tr>`;
    }).join('');
  }

  // Stats
  const stats = $('emp-stats');
  if(stats){
    const total = employeesData.length;
    const active = employeesData.filter(e=>e.status==='Đang làm').length;
    const trial = employeesData.filter(e=>e.status==='Thử việc').length;
    const left = employeesData.filter(e=>e.status==='Đã nghỉ').length;
    stats.innerHTML = [
      ['👥 Tổng', total, '#2e7d32','#e8f5e9'],
      ['✅ Đang làm', active,'#2e7d32','#e8f5e9'],
      ['🔄 Thử việc', trial,'#f57c00','#fff3e0'],
      ['❌ Đã nghỉ', left,'#c62828','#ffebee'],
    ].map(([l,v,c,bg])=>
      `<div style="background:${bg};border-radius:12px;padding:10px 18px;display:flex;align-items:center;gap:8px;">
        <span style="font-size:13px;color:${c};font-weight:700;">${l}</span>
        <span style="font-size:22px;font-weight:800;color:${c};">${v}</span>
      </div>`
    ).join('');
  }
}

function buildKpiGrid(kpiArr){
  const grid = $('kpi-grid');
  if(!grid) return;
  const months = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];
  const vals = kpiArr && kpiArr.length === 12 ? kpiArr : Array(12).fill('');
  grid.innerHTML = months.map((m,i) => `
    <div style="text-align:center;">
      <label class="fld-lbl-xs">${m}</label>
      <input type="number" min="0" max="150" step="1" id="kpi-m${i}" value="${vals[i]||''}"
        placeholder="–"
        style="width:100%;padding:7px 4px;border:1.5px solid var(--border);border-radius:8px;font-size:13px;text-align:center;outline:none;box-sizing:border-box;"
        onfocus="this.style.borderColor='var(--green)'" onblur="this.style.borderColor='var(--border)'"/>
    </div>`).join('');
}

function openEmpModal(id){
  editingEmpId = id;
  const e = id ? employeesData.find(x=>x.id===id) : null;
  var _emt=$('emp-modal-title'); if(_emt) _emt.textContent = e ? '✏️ Chỉnh sửa nhân viên' : '➕ Thêm nhân viên';
  $('emp-name').value  = e?.name  || '';
  $('emp-role').value  = e?.role  || 'Nhân viên';
  $('emp-rank').value  = e?.rank  || 'C';
  populateShiftSelect(e?.shift || shiftsData[0] || '');
  $('emp-phone').value = e?.phone || '';
  $('emp-status').value= e?.status|| 'Đang làm';
  $('emp-note').value  = e?.note  || '';
  $('emp-rankdate').value = e?.rankdate || '';
  buildKpiGrid(e?.kpi || []);
  $('emp-delete-btn').style.display = e ? 'block' : 'none';
  show('emp-modal','flex');
}

function closeEmpModal(){ hide('emp-modal'); }

async function saveEmployee(){
  const name = $('emp-name').value.trim();
  if(!name){ alert('Vui lòng nhập họ tên!'); return; }
  const kpi = Array.from({length:12},(_,i)=>{
    const v = $('kpi-m'+i)?.value.trim();
    return v !== '' ? parseFloat(v) : '';
  });
  const emp = {
    id: editingEmpId || ('emp-'+Date.now()),
    name,
    role:     $('emp-role').value,
    rank:     $('emp-rank').value,
    shift:    $('emp-shift').value,
    phone:    $('emp-phone').value.trim(),
    status:   $('emp-status').value,
    note:     $('emp-note').value.trim(),
    rankdate: $('emp-rankdate').value,
    kpi,
  };
  const idx = employeesData.findIndex(e=>e.id===editingEmpId);
  if(idx >= 0) employeesData[idx] = emp;
  else employeesData.push(emp);
  await saveEmployees();
  closeEmpModal();
  renderEmployees();
}

async function deleteEmployee(){
  if(!editingEmpId || !confirm('Xóa nhân viên này?')) return;
  employeesData = employeesData.filter(e=>e.id!==editingEmpId);
  await saveEmployees();
  closeEmpModal();
  renderEmployees();
}

var _epm=$('emp-modal'); if(_epm) _epm.addEventListener('click', function(e){ if(e.target===this) closeEmpModal(); });

// SHIFT MANAGER
const DEFAULT_SHIFTS = [
  'Ca 1 (6h–14h)',
  'Ca 2 (14h–22h)',
  'Ca 3 (22h–6h)',
  'Ca hành chính',
  'Linh hoạt',
];
let shiftsData = [...DEFAULT_SHIFTS];

async function loadShifts(){
  shiftsData = [...DEFAULT_SHIFTS];
  try {
    const r = await window.storage.get(branchKey('zentea-shifts'));
    if(r && r.value) shiftsData = JSON.parse(r.value);
  } catch(e){}
  try {
    const s = localStorage.getItem(branchKey('zentea-shifts'));
    if(s) shiftsData = JSON.parse(s);
  } catch(e){}
  populateShiftSelect();
}

async function saveShifts(){
  try { await window.storage.set(branchKey('zentea-shifts'), JSON.stringify(shiftsData)); } catch(e){}
  try { localStorage.setItem(branchKey('zentea-shifts'), JSON.stringify(shiftsData)); } catch(e){}
}

function populateShiftSelect(currentVal){
  const sel = $('emp-shift');
  if(!sel) return;
  const val = currentVal || sel.value;
  sel.innerHTML = shiftsData.map(s =>
    `<option value="${s}" ${s===val?'selected':''}>${s}</option>`
  ).join('');
}

function openShiftManager(){
  show('shift-modal','flex');
  renderShiftList();
  $('new-shift-input').value = '';
}

function closeShiftModal(){
  hide('shift-modal');
  populateShiftSelect();
}
var _sm=$('shift-modal'); if(_sm) _sm.addEventListener('click', function(e){
  if(e.target === this) closeShiftModal();
});

function renderShiftList(){
  const el = $('shift-list');
  if(!el) return;
  if(!shiftsData.length){
    el.innerHTML = `<p style="color:#bbb;font-size:13px;text-align:center;padding:12px;">Chưa có ca nào</p>`;
    return;
  }
  el.innerHTML = shiftsData.map((s, i) => `
    <div style="display:flex;align-items:center;gap:8px;padding:9px 12px;
      background:var(--green-pale);border-radius:10px;">
      <span style="font-size:16px;">🕐</span>
      <span id="shift-label-${i}" style="flex:1;font-size:13px;font-weight:600;color:var(--dark);">${s}</span>
      <input id="shift-edit-${i}" type="text" value="${s}"
        style="display:none;flex:1;padding:6px 10px;border:1.5px solid var(--green);border-radius:8px;
        font-family:'Open Sans',sans-serif;font-size:13px;outline:none;"
        onkeydown="if(event.key==='Enter')confirmEditShift(${i});if(event.key==='Escape')cancelEditShift(${i})"/>
      <button onclick="startEditShift(${i})" id="shift-btn-edit-${i}"
        style="padding:4px 10px;background:#fff;border:1.5px solid var(--border);border-radius:8px;
        font-size:12px;color:var(--green);cursor:pointer;font-weight:600;">✏️</button>
      <button onclick="confirmEditShift(${i})" id="shift-btn-save-${i}"
        style="display:none;padding:4px 10px;background:var(--green);border:none;border-radius:8px;
        font-size:12px;color:#fff;cursor:pointer;font-weight:600;">✔</button>
      <button onclick="deleteShift(${i})"
        style="padding:4px 10px;background:#fff;border:1.5px solid #ffcdd2;border-radius:8px;
        font-size:12px;color:#c44;cursor:pointer;font-weight:600;">🗑</button>
    </div>`).join('');
}

function startEditShift(i){
  $(`shift-label-${i}`).style.display = 'none';
  $(`shift-edit-${i}`).style.display = 'block';
  $(`shift-btn-edit-${i}`).style.display = 'none';
  $(`shift-btn-save-${i}`).style.display = 'block';
  $(`shift-edit-${i}`).focus();
}

function cancelEditShift(i){
  $(`shift-label-${i}`).style.display = 'block';
  $(`shift-edit-${i}`).style.display = 'none';
  $(`shift-btn-edit-${i}`).style.display = 'block';
  $(`shift-btn-save-${i}`).style.display = 'none';
}

async function confirmEditShift(i){
  const val = $(`shift-edit-${i}`).value.trim();
  if(!val) return;
  shiftsData[i] = val;
  await saveShifts();
  renderShiftList();
}

async function addShift(){
  const input = $('new-shift-input');
  const val = input.value.trim();
  if(!val) return;
  if(shiftsData.includes(val)){ alert('Ca này đã tồn tại!'); return; }
  shiftsData.push(val);
  await saveShifts();
  renderShiftList();
  input.value = '';
  input.focus();
}

async function deleteShift(i){
  const name = shiftsData[i];
  const used = employeesData.some(e => e.shift === name);
  if(used && !confirm(`Ca "${name}" đang được dùng bởi nhân viên. Vẫn xóa?`)) return;
  if(!used && !confirm(`Xóa ca "${name}"?`)) return;
  shiftsData.splice(i, 1);
  await saveShifts();
  renderShiftList();
}

// BRANCH SELECTOR
// selectedBranch declared in config.js
const BRANCH_NAMES = {
  ntmk: 'ZEN Tea Nguyễn Thị Minh Khai',
  vvn:  'ZEN Tea Võ Văn Ngân',
  pxl:  'ZEN Tea Phan Xích Long',
  nth:  'ZEN Tea Nguyễn Thái Học',
};

function selectBranch(btn, branchId){
  selectedBranch = branchId;
  // Show branch name label
  var _sbn=$('selected-branch-name'); if(_sbn) _sbn.textContent = '🏪 ' + BRANCH_NAMES[branchId];
  // Switch step
  hide('step-branch');
  const stepPw = $('step-password');
  stepPw.style.display = 'block';
  setTimeout(() => $('branch-pass-input').focus(), 120);
}

function backToBranch(){
  selectedBranch = null;
  hide('step-password');
  show('step-branch');
  $('branch-pass-input').value = '';
  hide('auth-error');
}

function togglePwd(){
  const p = $('branch-pass-input');
  p.type = p.type === 'password' ? 'text' : 'password';
}

// ─── MAIN AUTH ───
// authMode declared in config.js
// isLoggedIn declared in config.js
// currentUser declared in config.js

function toggleAuthMode(){}
function togglePwdOld(){}

// ACCOUNT API — multi-user auth system
// ══ ACCOUNTS — Firebase Realtime DB ══
const ACCOUNTS_KEY = 'zentea-accounts';

async function apiGetAccounts(){
  // 1. Firebase Realtime Database (cloud, shared across devices)
  if(fbDb){
    try{
      const snap = await fbDb.ref('accounts').once('value');
      const val = snap.val();
      if(val){
        const list = Object.values(val);
        // Cache locally
        try{ localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list)); }catch(e){}
        return list;
      }
      // Empty DB but connected — return empty + check local cache
      try{ const s = localStorage.getItem(ACCOUNTS_KEY); if(s) return JSON.parse(s); }catch(e){}
      return [];
    }catch(e){
      console.warn('Firebase read error:', e.message);
      // Nếu lỗi domain chưa được authorize thì fallback localStorage
    }
  }
  // 2. Claude artifact storage (fallback)
  if(typeof window.storage !== 'undefined'){
    try{
      const r = await window.storage.get(ACCOUNTS_KEY, true);
      if(r && r.value) return JSON.parse(r.value);
    }catch(e){}
  }
  // 3. localStorage (device-only fallback)
  try{
    const el = $('fb-notice');
    if(el) el.style.display = 'block';
    const s = localStorage.getItem(ACCOUNTS_KEY);
    if(s) return JSON.parse(s);
  }catch(e){}
  return [];
}

async function apiSaveAccounts(accounts){
  // 1. Firebase Realtime Database
  if(fbDb){
    try{
      const obj = {};
      accounts.forEach(a => { obj[a.id] = a; });
      await fbDb.ref('accounts').set(obj);
      try{ localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts)); }catch(e){}
      return;
    }catch(e){ console.warn('Firebase write error:', e); }
  }
  // 2. Claude artifact storage
  if(typeof window.storage !== 'undefined'){
    const json = JSON.stringify(accounts);
    try{ await window.storage.set(ACCOUNTS_KEY, json, true); }catch(e){}
  }
  // 3. localStorage fallback
  try{ localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts)); }catch(e){}
}


// ── UI tab switcher ──
function switchAuthTab(tab){
  const isLogin = tab === 'login';
  $('panel-login').style.display    = isLogin ? 'block' : 'none';
  $('panel-register').style.display = isLogin ? 'none'  : 'block';
  var lt = $('tab-login-btn');
  var rt = $('tab-register-btn');
  if(lt){lt.style.color=isLogin?'#2d7a2d':'#9ca3af';lt.style.borderBottomColor=isLogin?'#4aab3a':'transparent';}
  if(rt){rt.style.color=isLogin?'#9ca3af':'#1d4ed8';rt.style.borderBottomColor=isLogin?'transparent':'#3b82f6';}
  // Clear errors
  var ae=$('auth-error'); if(ae){ae.style.display='none';}
  var re=$('reg-error');  if(re){re.style.display='none';}
  var ro=$('reg-ok');     if(ro){ro.style.display='none';}
}

// ── Toggle password visibility ──
function togglePwd(){
  const p = $('branch-pass-input');
  if(p) p.type = p.type==='password'?'text':'password';
}
function toggleRegPwd(){
  const p = $('reg-pass-input');
  if(p) p.type = p.type==='password'?'text':'password';
}

// ── Show error/ok helpers ──
function showAuthError(msg){
  const e = $('auth-error');
  if(!e) return;
  e.textContent = msg; e.style.display='block';
}
function showRegError(msg){
  const e=$('reg-error'); if(!e)return;
  const o=$('reg-ok');    if(o) o.style.display='none';
  e.textContent=msg; e.style.display='block';
}
function showRegOk(msg){
  const e=$('reg-error'); if(e) e.style.display='none';
  const o=$('reg-ok');    if(!o)return;
  o.textContent=msg; o.style.display='block';
}

// ── LOGIN ──
async function doAuth(){
  const usernameEl = $('login-username-input');
  const username   = usernameEl ? usernameEl.value.trim() : '';
  const passEl     = $('branch-pass-input');
  const pass       = passEl ? passEl.value : '';
  const errEl      = $('auth-error');
  if(errEl) errEl.style.display='none';

  if(!username){ showAuthError('Vui lòng nhập tên đăng nhập'); return; }
  if(!pass)    { showAuthError('Vui lòng nhập mật khẩu');      return; }

  // Show loading state
  const btn = document.querySelector('#panel-login .zt-btn');
  if(btn){ btn.disabled=true; btn.textContent='Đang xác thực...'; }

  try{
    let accounts = [];
    try { accounts = await apiGetAccounts(); } catch(fetchErr) {
      // Fallback to localStorage nếu Firebase không kết nối được
      try { accounts = JSON.parse(localStorage.getItem('zentea-accounts')||'[]'); } catch(e) {}
    }
    const found = accounts.find(a => (a.username||'').toLowerCase()===(username||'').toLowerCase());
    if(!found){
      showAuthError('Tên đăng nhập không tồn tại');
      return;
    }
    if(found.password !== pass){
      showAuthError('Mật khẩu không đúng');
      return;
    }

    selectedBranch = found.branch || 'global';
    const account = {
      user:     found.username,
      fullname: found.fullname || found.username,
      branch:   found.branch  || 'global',
      role:     found.role    || 'staff',
      id:       found.id
    };
    loginSuccess(account, false);

  }catch(err){
    showAuthError('Lỗi kết nối. Thử lại!');
    console.error(err);
  }finally{
    if(btn){ btn.disabled=false; btn.textContent='Đăng nhập →'; }
  }
}

// ── REGISTER ──
async function doRegister(){
  const fullname = ($('reg-fullname-input')?.value||'').trim();
  const username = ($('reg-username-input')?.value||'').trim().toLowerCase();
  const pass     = ($('reg-pass-input')?.value||'');

  if(!fullname){ showRegError('Vui lòng nhập họ tên');      return; }
  if(!username){ showRegError('Vui lòng nhập tên đăng nhập'); return; }
  if(pass.length<4){ showRegError('Mật khẩu phải ít nhất 4 ký tự'); return; }
  if(!/^[a-z0-9_.]+$/.test(username)){ showRegError('Tên đăng nhập chỉ dùng chữ thường, số, _ và .'); return; }

  const btn = document.querySelector('#panel-register .zt-btn');
  if(btn){ btn.disabled=true; btn.textContent='Đang xử lý...'; }

  try{
    // Check duplicate username
    const accounts = await apiGetAccounts();
    if(accounts.find(a=>(a.username||'').toLowerCase()===username)){
      showRegError('Tên đăng nhập đã tồn tại, chọn tên khác'); return;
    }

    // Create account
    const newAccount = {
      id:        'acc-' + Date.now(),
      username,
      fullname,
      password:  pass,
      role:      'staff',
      branch:    'global',
      createdAt: new Date().toISOString()
    };
    accounts.push(newAccount);
    await apiSaveAccounts(accounts);

    // Clear form
    ['reg-fullname-input','reg-username-input','reg-pass-input']
      .forEach(id=>{ const el=$(id); if(el) el.value=''; });
    showRegOk('✅ Tạo tài khoản thành công! Bạn có thể đăng nhập ngay.');
    setTimeout(()=>switchAuthTab('login'),2200);

  }catch(err){
    showRegError('Lỗi hệ thống: '+err.message);
  }finally{
    if(btn){ btn.disabled=false; btn.textContent='Tạo tài khoản →'; }
  }
}


// ══ GOOGLE SIGN-IN ══════════════════════════════════════