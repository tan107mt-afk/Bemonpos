/* ═══════════════════════════════════════════════════
   ZENTEA – Config, helpers cơ bản (show/hide/$)
   File: js/config.js
═══════════════════════════════════════════════════ */


'use strict';
// $ shorthand
var $=function(id){return document.getElementById(id);};
function show(id,d){var e=$(id);if(e)e.style.display=d||'block';}
function hide(id){var e=$(id);if(e)e.style.display='none';}

// ── Essential Global State Variables ────────────────────────────
// Khai báo trước tất cả các file khác để đảm bảo accessibility
var isLoggedIn = false;
var currentUser = null;
var selectedBranch = null;
var authMode = 'login';
var _googleAuthLock = false;
var _docFilter = 'all';
var _viewerCurrentDoc = null;


// Hero bg
// Hero background → xem js/hero-bg.js

// Sidebar toggle (only if sidebar exists)
const sidebar = $('sidebar');
const body = document.body;
const sidebarToggleBtn = $('sidebarToggle');
if(sidebarToggleBtn && sidebar){
  sidebarToggleBtn.onclick = () => {
    sidebar.classList.toggle('open');
    body.classList.toggle('sb-expanded');
  };
}

// Sidebar nav items
document.querySelectorAll('.sb-item[data-target]').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    if(!document.body.classList.contains('logged-in')) return;
    const target = item.dataset.target;
    showPage(target);
    document.querySelectorAll('.sb-item').forEach(i=>i.classList.remove('active'));
    item.classList.add('active');
  });
});

// Top navbar nav-item click handlers — SPA page switch + Hash routing
document.querySelectorAll('.nav-item[data-target]').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    if(!document.body.classList.contains('logged-in')) return;
    const target = item.dataset.target;
    history.pushState(null, '', '#' + target);
    showPage(target);
    document.querySelectorAll('.nav-item').forEach(i=>i.classList.remove('active'));
    item.classList.add('active');
  });
});

// Back/Forward browser navigation
window.addEventListener('popstate', () => {
  if(!document.body.classList.contains('logged-in')) return;
  const hash = location.hash.replace('#','') || 'home';
  showPage(hash);
  document.querySelectorAll('.nav-item').forEach(i=>i.classList.remove('active'));
  const btn = document.querySelector('.nav-item[data-target="'+hash+'"]');
  if(btn) btn.classList.add('active');
});


// SPA page navigation
// ── App Constants ────────────────────────────────────
// NAV_SECTIONS: các mục menu có thể phân quyền
const NAV_SECTIONS = [
  {id:'checklist',      label:'✅ Checklist',         group:'qlch'},
  {id:'contacts',       label:'📞 Liên Hệ',           group:'qlch'},
  {id:'salary',         label:'💰 Lương Bậc',         group:'qlch'},
  {id:'violations',     label:'⚠️ Vi Phạm',           group:'qlch'},
  {id:'recipes',        label:'🧋 Công Thức',         group:'qlch'},
  {id:'employees',      label:'👥 Nhân Viên',         group:'qlch'},
  {id:'hr-eval',        label:'⭐ Đánh Giá NS',       group:'qlch'},
  {id:'schedule',       label:'📅 Lịch Làm Việc',    group:'qlch'},
  {id:'tinhhung',       label:'💬 Tình Huống',        group:'qlch'},
  {id:'waste-material', label:'♻️ Topping & NL Hủy', group:'qlch'},
  {id:'report-overview',label:'📈 Tổng Quan',         group:'qlch'},
  {id:'dt-test',        label:'📝 Tạo Đề Test',       group:'dt'},
  {id:'luu-tru',        label:'📁 Lưu Trữ TL',        group:'dt'},
  {id:'dt-vipham',      label:'⚖️ QT Vi Phạm',        group:'dt'},
  {id:'dt-quytrinh',    label:'📚 QT Đào Tạo',        group:'dt'},
  {id:'dt-baocao',      label:'📊 Báo Cáo ĐT',        group:'dt'},
];

// STORES: 17 cửa hàng ZEN Tea
const STORES = {
  global:'Tất cả cửa hàng',
  cn01:'ZEN Tea Võ Thị Sáu',    cn02:'ZEN Tea Food Court',
  cn03:'ZEN Tea Biên Hùng',     cn04:'ZEN Tea Ngô Quyền',
  cn05:'ZEN Tea Quảng Trường',  cn06:'ZEN Tea Trảng Dài',
  cn07:'ZEN Tea Hố Nai',        cn08:'ZEN Tea Trảng Bom 1',
  cn09:'ZEN Tea Trảng Bom 2',   cn10:'ZEN Tea Gia Kiệm',
  cn11:'ZEN Tea Long Khánh',    cn12:'ZEN Tea Long Thành',
  cn13:'ZEN Tea Bình Dương',    cn14:'ZEN Tea Nguyễn Thái Học',
  cn15:'ZEN Tea Võ Văn Ngân',   cn16:'ZEN Tea Nguyễn Thị Minh Khai',
  cn17:'ZEN Tea Phan Xích Long'
};

// SUPERADMIN email
const SUPERADMIN_EMAIL = 'tan107.mt@gmail.com';

