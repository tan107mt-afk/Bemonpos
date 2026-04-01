/* ═══════════════════════════════════════════════════
   ZENTEA – Checklist logic
   File: js/checklist.js
═══════════════════════════════════════════════════ */


// ── RECIPE IMAGE UPLOAD ──────────────────────────────────────
function uploadRecipeImg(id, event){
  event.stopPropagation();
  var inp = document.createElement('input');
  inp.type = 'file'; inp.accept = 'image/*'; inp.style.display = 'none';
  document.body.appendChild(inp);
  inp.onchange = function(){
    var file = inp.files[0];
    document.body.removeChild(inp);
    if(!file) return;
    // Resize & compress to ≤200KB base64
    var reader = new FileReader();
    reader.onload = function(e){
      var img = new Image();
      img.onload = function(){
        var canvas = document.createElement('canvas');
        var MAX = 600;
        var ratio = Math.min(MAX/img.width, MAX/img.height, 1);
        canvas.width  = Math.round(img.width  * ratio);
        canvas.height = Math.round(img.height * ratio);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        var dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        // Save imgUrl into custom recipe (override base)
        var existing = customRecipes.find(function(r){ return r.id === id; });
        if(existing){
          existing.imgUrl = dataUrl;
        } else {
          // Clone from base
          var all = getAllRecipes();
          var base = all.find(function(r){ return r.id === id; });
          if(base){
            var clone = JSON.parse(JSON.stringify(base));
            clone.imgUrl = dataUrl;
            customRecipes.push(clone);
          } else {
            customRecipes.push({id:id, imgUrl:dataUrl});
          }
        }
        saveCustomRecipes();
        renderRecipes();
        if(typeof showToast==='function') showToast('✅ Đã lưu ảnh', 'Hình ảnh đã được cập nhật');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };
  inp.click();
}

function renderRecipes(){
  const search = ($('recipe-search')?.value || '').toLowerCase();
  const all = getAllRecipes();
  const filtered = all.filter(r => {
    const matchCat = currentCat === 'all' || r.cat === currentCat;
    const matchSearch = !search || (r.name||'').toLowerCase().includes(search) || (r.desc||'').toLowerCase().includes(search);
    return matchCat && matchSearch;
  });

  const grid = $('recipe-grid');
  if(!grid) return;

  if(filtered.length === 0){
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:48px;color:#bbb;font-size:14px;">Không tìm thấy món phù hợp 🍵</div>';
    return;
  }

  grid.innerHTML = filtered.map(r => {
    const imgUrl = getImg(r);
    const isCustom = customRecipes.some(c => c.id === r.id);
    const grad = CAT_GRADS[r.cat] || CAT_GRADS['dac-biet'];
    return `
    <div onclick="openRecipeDetail('${r.id}')"
      style="background:#fff;border-radius:16px;overflow:hidden;cursor:pointer;
      box-shadow:0 3px 14px rgba(45,122,45,.09);transition:.22s;"
      onmouseover="this.style.transform='translateY(-5px)';this.style.boxShadow='0 10px 30px rgba(45,122,45,.18)'"
      onmouseout="this.style.transform='';this.style.boxShadow='0 3px 14px rgba(45,122,45,.09)'">
      <!-- Image area -->
      <div style="height:140px;position:relative;background:${grad};">
        <img src="${imgUrl}" alt="${r.name}" loading="lazy"
          style="width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity .4s;"
          onload="this.style.opacity=1"
          onerror="this.style.display=\'none\'"/>
        <div style="position:absolute;inset:0;background:linear-gradient(to bottom,transparent 40%,rgba(0,0,0,.45));display:flex;align-items:flex-end;justify-content:space-between;padding:10px 12px;">
          <span style="font-size:30px;filter:drop-shadow(0 2px 4px rgba(0,0,0,.3));">${r.emoji}</span>
          <div style="display:flex;gap:6px;">
            <button onclick="event.stopPropagation();openEditModal('${r.id}')" style="background:rgba(255,255,255,.25);border:none;border-radius:20px;padding:4px 10px;color:#fff;font-size:11px;font-weight:700;cursor:pointer;backdrop-filter:blur(4px);">✏️ Sửa</button>
            <button onclick="event.stopPropagation();uploadRecipeImg('${r.id}',event)" style="background:rgba(255,255,255,.25);border:none;border-radius:20px;padding:4px 10px;color:#fff;font-size:11px;font-weight:700;cursor:pointer;backdrop-filter:blur(4px);">📷 Ảnh</button>
            <button data-delid="${r.id}" onclick="event.stopPropagation();confirmDeleteRecipe(this.getAttribute('data-delid'),'món này',this)" style="background:rgba(220,38,38,.7);border:none;border-radius:50%;width:26px;height:26px;color:#fff;font-size:15px;font-weight:900;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;backdrop-filter:blur(4px);line-height:1;" title="Xóa món">✕</button>
          </div>
        </div>
      </div>
      <!-- Info area -->
      <div style="padding:14px 16px;">
        <div style="font-weight:700;font-size:14px;color:var(--dark);margin-bottom:3px;">${r.name}</div>
        <div style="font-size:12px;color:#888;margin-bottom:10px;">${r.desc}</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px;">
          ${(r.ingredients||[]).slice(0,2).map(i=>`<span style="font-size:11px;padding:2px 8px;background:var(--green-pale);color:var(--green);border-radius:10px;">${typeof i==='string'?i.split(':')[0]:i.label}</span>`).join('')}
          ${(r.ingredients||[]).length > 2 ? `<span style="font-size:11px;padding:2px 8px;background:#f5f5f5;color:#999;border-radius:10px;">+${r.ingredients.length-2}</span>` : ''}
        </div>
        <div style="margin-top:10px;font-size:12px;color:var(--green);font-weight:600;">Xem công thức →</div>
      </div>
    </div>`;
  }).join('');

  // Show/hide rules section
  const rules = $('rules-section');
  if(rules) rules.style.display = currentMode === 'manual' ? 'block' : 'none';
}

function switchMode(mode){
  currentMode = mode;
  $('mode-btn-manual').style.background = mode==='manual' ? 'var(--green)' : 'transparent';
  $('mode-btn-manual').style.color = mode==='manual' ? '#fff' : '#888';
  $('mode-btn-machine').style.background = mode==='machine' ? 'var(--green)' : 'transparent';
  $('mode-btn-machine').style.color = mode==='machine' ? '#fff' : '#888';
  renderRecipes();
}

function filterCat(e, cat){
  currentCat = cat;
  document.querySelectorAll('#recipe-cat-tabs .tab-btn').forEach(b=>b.classList.remove('active'));
  e.target.classList.add('active');
  renderRecipes();
}

function renderIngredients(list){
  if(!list || !list.length) return '';

  function parseIng(ing){
    var label, valuePart;
    if(typeof ing === 'string'){
      var colonIdx = ing.indexOf(': ');
      if(colonIdx > -1){ label = ing.slice(0,colonIdx); valuePart = ing.slice(colonIdx+2); }
      else { label = ing; valuePart = ing; }
    } else {
      label = ing.label || '';
      valuePart = (ing.vals||[]).join(' | ');
    }

    var mVals=[], lVals=[], plainVals=[];
    var parts = valuePart.split(/\s*\|\s*/);
    parts.forEach(function(part){
      part = part.trim();
      if(!part) return;
      var m3 = part.match(/^M[:\u2192]\s*(.+)$/i);
      if(m3){ mVals.push(m3[1].trim()); return; }
      var m4 = part.match(/^L[:\u2192]\s*(.+)$/i);
      if(m4){ lVals.push(m4[1].trim()); return; }
      plainVals.push(part);
    });
    return {label:label, mVals:mVals, lVals:lVals, plainVals:plainVals};
  }

  var parsed = list.map(parseIng);
  var hasSizes = parsed.some(function(p){ return p.mVals.length > 0 || p.lVals.length > 0; });

  // Plain table (no M/L)
  if(!hasSizes){
    var rows = parsed.map(function(p,i){
      var bg = i%2===0?'#fff':'#f5fbf3';
      return '<tr style="background:'+bg+';">'
        +'<td style="padding:9px 14px;font-size:13px;font-weight:600;color:var(--dark);border-top:1px solid var(--border);">'+p.label+'</td>'
        +'<td style="padding:9px 14px;font-size:13px;color:#444;border-top:1px solid var(--border);border-left:1px solid var(--border);">'+p.plainVals.join(' | ')+'</td>'
        +'</tr>';
    }).join('');
    return '<div style="margin-bottom:18px;border-radius:12px;overflow:hidden;border:1.5px solid var(--border);">'
      +'<table style="width:100%;border-collapse:collapse;">'
      +'<thead><tr style="background:var(--green);">'
      +'<th style="padding:9px 14px;color:#fff;font-size:11px;letter-spacing:1px;text-align:left;">NGUYÊN LIỆU</th>'
      +'<th style="padding:9px 14px;color:#fff;font-size:11px;letter-spacing:1px;text-align:left;border-left:1px solid rgba(255,255,255,.25);">LƯỢNG</th>'
      +'</tr></thead><tbody>'+rows+'</tbody></table></div>';
  }

  // 3-column table: Nguyên liệu | Size Nhỏ | Size Lớn
  var rows = parsed.map(function(p, i){
    var bg = i%2===0 ? '#fff' : '#f9fef9';
    var mVal = p.mVals.length ? p.mVals.join('<br>') : (p.plainVals.length ? '<span style="font-size:11px;color:#888;">'+p.plainVals.join(' | ')+'</span>' : '<span style="color:#ddd;">—</span>');
    var lVal = p.lVals.length ? p.lVals.join('<br>') : (p.plainVals.length ? '<span style="font-size:11px;color:#888;">'+p.plainVals.join(' | ')+'</span>' : '<span style="color:#ddd;">—</span>');
    return '<tr style="background:'+bg+';">'
      +'<td style="padding:9px 14px;font-size:13px;font-weight:600;color:var(--dark);border-top:1px solid var(--border);width:36%;">'+p.label+'</td>'
      +'<td style="padding:9px 12px;font-size:13px;font-weight:700;color:#16a34a;text-align:center;border-top:1px solid var(--border);border-left:2px solid #86efac;width:32%;">'+mVal+'</td>'
      +'<td style="padding:9px 12px;font-size:13px;font-weight:700;color:#1d4ed8;text-align:center;border-top:1px solid var(--border);border-left:2px solid #93c5fd;width:32%;">'+lVal+'</td>'
      +'</tr>';
  }).join('');

  return '<div style="margin-bottom:18px;border-radius:12px;overflow:hidden;border:1.5px solid var(--border);">'
    +'<table style="width:100%;border-collapse:collapse;">'
    +'<thead>'
    +'<tr>'
    +'<th style="padding:10px 14px;background:#f1f5f9;color:var(--dark);font-size:11px;font-weight:700;letter-spacing:1px;text-align:left;width:36%;">NGUYÊN LIỆU</th>'
    +'<th style="padding:10px 12px;background:#16a34a;color:#fff;font-size:12px;font-weight:800;letter-spacing:1px;text-align:center;width:32%;border-left:2px solid #86efac;">☕ SIZE NHỎ</th>'
    +'<th style="padding:10px 12px;background:#1d4ed8;color:#fff;font-size:12px;font-weight:800;letter-spacing:1px;text-align:center;width:32%;border-left:2px solid #93c5fd;">🧋 SIZE LỚN</th>'
    +'</tr>'
    +'</thead>'
    +'<tbody>'+rows+'</tbody>'
    +'</table></div>';
}

function openRecipeDetail(id){
  const all = getAllRecipes();
  const r = all.find(x=>x.id===id);
  if(!r) return;
  const imgUrl = getImg(r);
  const grad = CAT_GRADS[r.cat] || CAT_GRADS['dac-biet'];
  $('modal-content').innerHTML = `
    <div style="height:180px;position:relative;background:${grad};border-radius:20px 20px 0 0;overflow:hidden;">
      <img src="${imgUrl}" alt="${r.name}" loading="lazy" style="width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity .4s;" onload="this.style.opacity=1" onerror="this.style.display='none'"/>
      <div style="position:absolute;inset:0;background:linear-gradient(to bottom,transparent,rgba(0,0,0,.6));display:flex;align-items:flex-end;padding:18px 22px;justify-content:space-between;">
        <div>
          <div style="font-size:36px;">${r.emoji}</div>
          <h2 style="font-family:'Lato',sans-serif;font-size:22px;color:#fff;margin-top:4px;">${r.name}</h2>
          <p style="font-size:12px;color:rgba(255,255,255,.8);">${r.desc}</p>
        </div>
        <button onclick="closeRecipeModal()" style="background:rgba(255,255,255,.2);border:none;width:36px;height:36px;border-radius:50%;cursor:pointer;font-size:16px;color:#fff;flex-shrink:0;align-self:flex-start;">✕</button>
      </div>
    </div>
    <div style="padding:22px 24px;">
      <h3 style="font-size:12px;font-weight:700;letter-spacing:1px;color:var(--green);text-transform:uppercase;margin-bottom:10px;">📦 Nguyên liệu</h3>
      ${renderIngredients(r.ingredients||[])}
      <h3 style="font-size:12px;font-weight:700;letter-spacing:1px;color:var(--green);text-transform:uppercase;margin-bottom:10px;">⚡ Quy trình</h3>
      <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:${r.notes?'16px':'0'};">
        ${(r.steps||[]).map((s,i)=>`<div style="display:flex;gap:10px;align-items:flex-start;"><span style="background:var(--green);color:#fff;font-size:11px;font-weight:700;min-width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;">${i+1}</span><span style="font-size:13px;color:var(--dark);line-height:1.55;">${s}</span></div>`).join('')}
      </div>
      ${r.notes ? `<div style="background:#fff8e1;border-radius:10px;padding:11px 13px;border-left:3px solid #f0b429;"><span style="font-size:12px;font-weight:700;color:#b07800;">💡 Lưu ý: </span><span style="font-size:12px;color:#666;">${r.notes}</span></div>` : ''}
    </div>
  `;
  show('recipe-modal','flex');
}

// AUTH SYSTEM (simplified - branch password only)

function loginSuccess(account, fromSession){
  isLoggedIn = true;
  currentUser = account;
  // Set selectedBranch từ account (ưu tiên allowedStores[0] nếu có)
  if(account.allowedStores && account.allowedStores.length > 0
     && account.role !== 'admin' && account.role !== 'superadmin'){
    // Staff: dùng cửa hàng đầu tiên được phân làm default
    selectedBranch = account.branch && account.branch !== 'global'
      ? account.branch : account.allowedStores[0];
  } else if(account.branch && account.branch !== 'global'){
    selectedBranch = account.branch;
  } else {
    selectedBranch = 'global';
  }
  // Ẩn loading splash nếu còn hiển thị
  const loader = document.getElementById('app-loading');
  if(loader && loader.style.display !== 'none'){
    loader.style.opacity = '0';
    setTimeout(() => loader.style.display = 'none', 300);
  }
  // Setup sidebar với thông tin account
  setTimeout(() => { if(typeof setupSidebar === 'function') setupSidebar(account); }, 100);
  if(!fromSession){
    try { localStorage.setItem('zentea-session', JSON.stringify(account)); } catch(e){}
  }
  // Hide hero, show main app
  hide('home');
  document.body.classList.add('logged-in');
  // Hiện topbar khi đăng nhập
  const _topbar = $('topbar');
  if(_topbar) _topbar.style.display = 'flex';
  // Phân quyền sidebar + topbar
  if(typeof sidebarSetup === 'function') sidebarSetup(account);
  document.querySelector('.stats-bar').style.display = 'none';
  // Show checklist page after login
  showPage('checklist');
  document.querySelectorAll('.nav-item').forEach(i=>i.classList.remove('active'));
  const clNav = document.querySelector('.nav-item[data-target="checklist"]');
  if(clNav) clNav.classList.add('active');
  // SHOW sidebar (if it exists)
  const sb = $('sidebar');
  if(sb) sb.classList.add('visible');
  // Update topnav branch badge
  // Update logo text to account name

  // Account dropdown — replace nav-logo content with merged logo+user+logout pill
  const navBadge = $('nav-branch-badge');
  if(navBadge){ navBadge.innerHTML = ''; }

  const navLogo = document.querySelector('.nav-logo');
  if(navLogo){
    const displayName = account.fullname || account.user || 'ZEN Tea';
    // Save original content for logout restore
    if(!navLogo.dataset.originalHtml){
      navLogo.dataset.originalHtml = navLogo.innerHTML;
    }
    // Replace logo content: logo img + divider + user name + logout btn
    const imgEl = navLogo.querySelector('img');
    const imgHtml = imgEl ? imgEl.outerHTML.replace('height:42px', 'height:34px').replace('width:42px','width:34px') : '';
    navLogo.style.cssText = 'display:flex;align-items:center;gap:0;background:rgba(255,255,255,.15);border:1.5px solid rgba(255,255,255,.28);border-radius:24px;overflow:hidden;flex-shrink:0;padding:0;text-decoration:none;';
    navLogo.innerHTML = `
      <span style="display:flex;align-items:center;gap:8px;padding:5px 12px 5px 8px;flex-shrink:0;">
        ${imgHtml}
        <span style="display:flex;flex-direction:column;line-height:1.2;">
          <span style="font-family:'Lato',sans-serif;font-size:11px;font-weight:700;color:rgba(255,255,255,.55);letter-spacing:.5px;">ZEN TEA</span>
          <span id="nav-user-name" style="font-size:12.5px;font-weight:700;color:#fff;white-space:nowrap;max-width:140px;overflow:hidden;text-overflow:ellipsis;">${displayName}</span>
        </span>
      </span>
      <button id="nav-user-pill" onclick="doLogout()" title="Đăng xuất"
        style="display:flex;align-items:center;gap:5px;padding:6px 13px;height:100%;
               background:rgba(255,255,255,.1);border:none;border-left:1.5px solid rgba(255,255,255,.2);
               color:rgba(255,255,255,.75);cursor:pointer;font-size:12px;font-weight:600;
               font-family:'Open Sans',sans-serif;transition:background .15s,color .15s;white-space:nowrap;"
        onmouseover="this.style.background='rgba(220,50,50,.4)';this.style.color='#fff'"
        onmouseout="this.style.background='rgba(255,255,255,.1)';this.style.color='rgba(255,255,255,.75)'">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Đăng xuất
      </button>`;
  }
  // Update sidebar logo if sidebar exists
  const logo = document.querySelector('.sb-logo-text');
  if(logo) logo.textContent = account.fullname || BRANCH_NAMES[account.branch] || account.user;
  // Branch badge below stats bar
  // branch-badge removed — branch shown in topnav right pill only
  // Add logout button to sidebar (only once, if sidebar exists)
  const nav = document.querySelector('.sb-nav');
  if(nav && !$('logout-btn')){
    const div = document.createElement('div');
    div.innerHTML = '<div class="sb-divider"></div><div class="sb-item" id="logout-btn" onclick="doLogout()" style="color:rgba(255,200,200,.8);"><span class="sb-icon">🚪</span><span class="sb-label">Đổi chi nhánh</span></div>';
    nav.appendChild(div);
  }
  // Render employees list
  try { renderEmployees(); } catch(e){}
  // Load all branch-specific data
  try { loadBranchData().then(function(){ try{ applyAllContentEdits(); }catch(e){} }).catch(e=>{}); } catch(e){}
  // Auto-seed TPH: nếu tph-main rỗng, lấy từ tph-excel (filter unit=Ly)
  try {
    var _tphCur = tphMainLoad();
    if(_tphCur.length === 0){
      var _exRaw = localStorage.getItem(branchKey(TPH_STORAGE_KEY));
      if(_exRaw){
        var _exData = JSON.parse(_exRaw);
        var _lyItems = (_exData.products||[]).filter(function(r){ return (r.unit||'').toLowerCase()==='ly'; });
        if(_lyItems.length > 0){ tphMainSave(_lyItems); }
      }
    }
  } catch(e){}
  // Sau login đọc hash URL để vào đúng section
  setTimeout(() => {
    const _h = location.hash.replace('#','');
    if(_h && document.getElementById(_h)){
      showPage(_h);
      document.querySelectorAll('.nav-item').forEach(i=>i.classList.remove('active'));
      const _b = document.querySelector('.nav-item[data-target="'+_h+'"]');
      if(_b) _b.classList.add('active');
    }
  }, 400);

  // Hiện nút duyệt nếu là superadmin
  setTimeout(async () => {
    if(currentUser && currentUser.role === 'superadmin'){
      const btn = document.getElementById('approve-btn');
      if(btn) btn.style.display = 'inline-flex';
      await checkPendingBadge();
    }
  }, 800);
}

function doLogout(){
  isLoggedIn = false; currentUser = null; selectedBranch = null;
  try { localStorage.removeItem('zentea-session'); } catch(e){}
  // Ẩn topbar và sidebar
  const topbar = $('topbar');
  if(topbar) topbar.style.display = 'none';
  const sb = $('sidebar');
  if(sb){ sb.classList.remove('visible','open'); }
  // Ẩn overlay
  const ov = $('sb-overlay');
  if(ov){ ov.classList.remove('visible'); ov.style.display='none'; }
  // Ẩn branch banner
  const banner = $('branch-view-banner');
  if(banner) banner.style.display = 'none';
  // Reset tb-user
  const tbUser = $('tb-user');
  if(tbUser) tbUser.style.display = 'none';
  // Ẩn approve button
  const approveBtn = $('approve-btn');
  if(approveBtn) approveBtn.style.display = 'none';
  
  document.body.classList.remove('sb-visible','sb-expanded','logged-in');
  document.querySelectorAll('.acc-section').forEach(s => s.classList.remove('page-active'));
  document.querySelector('.stats-bar').style.display = 'none';
  
  // Reset logout button trong sidebar
  const logoutBtn = $('logout-btn');
  if(logoutBtn && logoutBtn.parentElement) logoutBtn.parentElement.remove();
  const sbLogoutBtn = $('sb-logout-btn');
  if(sbLogoutBtn) sbLogoutBtn.style.display = 'none';
  
  // Reset user info trong sidebar
  const sbUserInfo = $('sb-user-info');
  if(sbUserInfo) sbUserInfo.style.display = 'none';
  const sbStoreWrap = $('sb-store-wrap');
  if(sbStoreWrap) sbStoreWrap.style.display = 'none';

  // Reset URL hash
  history.replaceState(null,'',location.pathname);

  // Reset login form
  var _bpi=$('branch-pass-input'); if(_bpi) _bpi.value = '';
  var uiEl=$('login-username-input'); if(uiEl) uiEl.value = '';
  var _aer=$('auth-error'); if(_aer) _aer.style.display = 'none';

  // Hiện login screen
  show('home','flex');
  window.scrollTo({top:0,behavior:'instant'});

  // Reset in-memory data
  contactsData = [...DEFAULT_CONTACTS];
  violationsData = [...DEFAULT_VIOLATIONS];
  employeesData = [];
  customRecipes = [];
  shiftsData = [...DEFAULT_SHIFTS];
  clTasks = []; clDateDone = {}; clDateOverrides = {};
  
  // Sign out Firebase
  try { if(typeof fbAuth !== 'undefined' && fbAuth) fbAuth.signOut(); } catch(e){}
}

// Init: hide content until logged in, check session
document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.stats-bar').style.display = 'none';
  document.querySelectorAll('.acc-section').forEach(s => s.classList.remove('page-active'));

  // Ẩn home ngay - chỉ hiện sau khi biết có/không có session
  hide('home');

  // Khởi động: đợi cả session lẫn Firebase auth state
  (async () => {
    // Bước 1: Check localStorage session trước
    await checkSession();
    
    if(isLoggedIn){
      // Đã đăng nhập từ localStorage → ẩn loader
      const loader = document.getElementById('app-loading');
      if(loader){ loader.style.opacity='0'; setTimeout(()=>loader.style.display='none',300); }
      return;
    }

    // Bước 2: Nếu không có localStorage, đợi Firebase auth state
    // (Firebase tự động khôi phục Google session trên browser mới)
    await new Promise(resolve => {
      const timeout = setTimeout(() => {
        // Sau 3s không có Firebase response → hiện login
        resolve();
      }, 3000);

      const unsub = fbAuth.onAuthStateChanged(async (gUser) => {
        unsub(); // Unsubscribe ngay
        clearTimeout(timeout);
        
        if(gUser && !isLoggedIn){
          // Firebase có session → xử lý tự động
          await handleGoogleUser(gUser, true);
        }
        resolve();
      });
    });

    // Bước 3: Nếu vẫn chưa login → hiện màn hình đăng nhập
    if(!isLoggedIn){
      show('home','flex');
      window.scrollTo({top:0,behavior:'instant'});
    }

    // Ẩn loading splash
    const loader = document.getElementById('app-loading');
    if(loader){ loader.style.opacity='0'; setTimeout(()=>loader.style.display='none',300); }
    window._appReady = true; // Cho phép onAuthStateChanged xử lý tiếp
  })();
});
