/* ═══════════════════════════════════════════════════
   ZENTEA – App navigation, showPage, hash routing
   File: js/app.js
═══════════════════════════════════════════════════ */

function showPage(id){
  // Kiểm tra quyền truy cập
  if(id && id !== 'home' && typeof currentUser !== 'undefined' && currentUser){
    const _role = currentUser.role || 'staff';
    const _allowed = currentUser.allowedSections;
    if(_role !== 'superadmin' && _role !== 'admin'){
      if(!_allowed || !Array.isArray(_allowed) || !_allowed.includes(id)){
        const firstAllowed = _allowed && _allowed[0];
        if(firstAllowed && firstAllowed !== id) showPage(firstAllowed);
        return;
      }
    }
  }
  // Cập nhật active state trong sidebar
  document.querySelectorAll('.sb-item').forEach(b => b.classList.remove('active'));
  const _sbBtn = document.querySelector('.sb-item[data-target="'+id+'"]');
  if(_sbBtn) _sbBtn.classList.add('active');
  // Cập nhật URL hash
  if(id && id !== 'home' && location.hash !== '#'+id){
    history.replaceState(null, '', '#' + id);
  } else if(id === 'home'){
    history.replaceState(null, '', location.pathname);
  }
  const hero = $('home');
  // Hide all pages and hero
  document.querySelectorAll('.acc-section').forEach(s => {
    s.classList.remove('page-active');
  });
  // Hook: render doc list khi vào Lưu trữ
  if(id === 'luu-tru' && typeof docRender === 'function') setTimeout(docRender, 50);
  // Going home
  if(id === 'home'){
    if(hero) hero.style.display = 'flex';
    window.scrollTo({top:0,behavior:'instant'});
    return;
  }
  if(hero) hero.style.display = 'none';
  const page = $(id);
  if(page){
    // Force re-trigger animation by removing and re-adding class
    void page.offsetWidth; // reflow
    page.classList.add('page-active');
    window.scrollTo({top:0,behavior:'instant'});
  }
  // Sync active item trong sidebar
  document.querySelectorAll('.sb-item').forEach(i => i.classList.remove('active'));
  const activeBtn = document.querySelector('.sb-item[data-target="'+id+'"]');
  if(activeBtn) {
    activeBtn.classList.add('active');
    const grp = activeBtn.closest('.sb-group');
    if(grp && !grp.classList.contains('expanded')) {
      grp.classList.add('expanded');
      const hdr = grp.querySelector('.sb-group-header');
      if(hdr) hdr.classList.add('active-group');
    }
  }

  // Lazy-load schedule iframe
  if(id === 'schedule'){
    setTimeout(()=>{
      const inp = $('sch-link-input');
      const frame = $('gsheet-frame');
      if(inp && inp.value && frame && !frame.src) applySheetLink();
    }, 80);
  }
  // Render flowchart when training page opens
  if(id === 'training'){
    setTimeout(function(){ fcLoad(); fcRender(); }, 60);
  }
}

// Keep openSection as alias for compatibility
function openSection(id){ showPage(id); }
function toggleAcc(header){ /* no-op in page mode */ }

// Daily checklist
const daily = [
  "Kiểm tra chất lượng, hạn sử dụng đầu ca",
  "Kiểm tra cơ sở vật chất, thiết bị dụng cụ",
  "Kiểm tra vệ sinh định kỳ, vệ sinh hằng ngày tại cửa hàng",
  "Kiểm tra tác phong, nội quy – quy định của nhân viên",
  "Nhắc nhở, cập nhật thông tin chương trình khuyến mãi, quy trình kiến thức mới",
  "Xem đánh giá các APP bán hàng (Grab, ShopeeFood, Xanh SM, Google)",
  "Xem file topping hủy, nguyên liệu đặt",
  "Kiểm tra sơ lược camera các ca không có quản lý của ngày trước",
  "Theo dõi, hỗ trợ công việc cửa hàng trong ngày",
  "Kiểm tra sơ bộ PCCC, kiểm thực",
  "Trực tiếp xử lý complain (nếu có)",
  "Kiểm tra các app bán hàng",
  "Kiểm tra kho xuất – nhập tồn",
  "Chỉnh sửa phân ca",
  "Theo dõi doanh thu",
];
const dl = $('daily-list');
daily.forEach(t=>{
  const div = document.createElement('div');
  div.className = 'checklist-item';
  div.innerHTML = `<div class="check-box"><span class="check-icon">✓</span></div><span class="check-text">${t}</span>`;
  div.onclick = ()=>div.classList.toggle('done');
  dl.appendChild(div);
});

// Monthly
const monthly = [
  {p:"Ngày 1",t:["Gửi giấy chấm công bảo vệ","Hoàn thành thống kê LLV gửi chị QLLLV","Tiếp nhận đề xuất xét bậc","In giấy PCCC","In giấy thiết bị dụng cụ","In giấy kiểm thực","Chỉnh sửa phân ca tháng trước","Tạo định mức lên file đặt hàng"]},
  {p:"Ngày 2–3",t:["Thống kê thành phẩm hủy","Thống kê lỗi nguyên liệu hủy","Gửi xác nhận lỗi vi phạm","Thống kê lỗi vi phạm"]},
  {p:"Ngày 3–5",t:["Tạo bảng KPI","Gửi chốt KPI (2 ngày)","Gửi chốt phân ca tháng trước","Tạo phân ca tháng này","Phân ca lên ZEN WORK","Báo cáo vấn đề CSVC-TBDC 1-5","Chỉnh sửa phân ca từ 1-5","Chốt KPI không chỉnh sửa"]},
  {p:"Ngày 5–10",t:["Cập nhật thông tin từ file tổng hợp vấn đề","Nhập thống kê LLV từ ngày 1-9","Tạo lịch làm việc tháng tiếp theo","Thông báo kiểm tra thống kê phân ca","Báo cáo vấn đề CSVC-TBDC 5-10"]},
  {p:"Ngày 6–10",t:["Nhập Input KPI","Báo cáo vấn đề CSVC-TBDC 10-15","Chỉnh sửa phân ca từ ngày 6-10"]},
  {p:"Ngày 10–15",t:["Thông báo kiểm tra bảng lương","Test hệ thống PCCC","Cập nhật thông tin nhân sự","Xét điều kiện và thực hiện bài test xét bậc","Chấm bài xét bậc","Hoàn thành phiếu đánh giá xét bậc"]},
  {p:"Ngày 11–15",t:["Chỉnh sửa phân ca từ 11-15","Báo cáo vấn đề CSVC-TBDC ngày 10-15","Cập nhật lỗi vi phạm từ ngày 1-15"]},
  {p:"Ngày 15–20",t:["Chốt bảng lương","Nhắc ngày cuối chốt đăng ký lịch off","Chỉnh sửa lịch làm việc tháng mới","Tạo thống kê lỗi LLV","Báo cáo vấn đề CSVC-TBDC 15-20","Chỉnh sửa phân ca từ ngày 16-20"]},
  {p:"Ngày 20–25",t:["Thông báo đăng ký lịch làm việc tháng mới","Viết báo cáo đánh giá dữ liệu tháng trước","Gửi chốt lịch làm việc tháng mới đến group nội bộ","Chỉnh sửa phân ca từ ngày 21-25"]},
  {p:"Ngày 25–30",t:["Đăng ký lịch off của quản lý","Gửi lịch làm việc lên group chung cửa hàng","Cập nhật lại thông tin nhân sự trong tháng","Kiểm tra sắp xếp kho để đầu tháng kiểm kho tổng","Rà lại lỗi file topping hủy"]},
];
const tl = $('monthly-timeline');
monthly.forEach(m=>{
  const d = document.createElement('div'); d.className='tl-item';
  d.innerHTML=`<div class="tl-dot"></div><div class="tl-period">${m.p}</div><div class="tl-tasks">${m.t.map(x=>`<div class="tl-task">• ${x}</div>`).join('')}</div>`;
  tl.appendChild(d);
});

// Contacts
// contacts rendered dynamically via contactsData

const groups=[
  {n:"Ngưng seen tin nhắn",d:"Trao đổi thông tin QLCH với c Hoàng Anh, anh Tú Đào"},
  {n:"TÔ MINH – NHÂN SỰ – ZENTEA",d:"Nhận thông tin nhân sự mới, cập nhật BHXH"},
  {n:"TÔ MINH – QUẢN LÝ TEA",d:"Triển khai thông báo tổng từ công ty đến QLCH"},
  {n:"S.O.S",d:"Triển khai thông báo an sinh xã hội, quà tặng, HR"},
  {n:"CMR_IT_QL_NS_TTBH_NH",d:"Báo cáo vấn đề mạng, CMR, đề xuất lắp cam, lỗi app chấm công"},
  {n:"TÔ MINH – KỸ THUẬT – TEA",d:"Báo cáo sửa chữa, đề xuất lắp đặt, xin cấp thiết bị"},
  {n:"TÔ MINH – QLCL – QLCH – NS",d:"Báo cáo chất lượng, cập nhật vấn đề liên quan chất lượng"},
  {n:"LỖI ODER",d:"Báo lỗi POS, lỗi phần mềm IoT, ứng dụng bán hàng"},
  {n:"THU NGÂN BÁO BÁNH",d:"Theo dõi báo bánh hủy, xác nhận bánh tồn"},
  {n:"ĐỒ KHÁCH QUÊN",d:"Báo đồ khách để quên, nhận lại"},
  {n:"XUẤT HÓA ĐƠN",d:"Xử lý vấn đề hóa đơn, thuế"},
  {n:"ZENTEA[TênCH] – Báo cáo công việc hằng ngày",d:"Theo dõi vệ sinh hằng ngày, checklist chất lượng, thiết bị"},
  {n:"Chi nhánh – Tên CH – Nội bộ",d:"Group riêng QLCH với tất cả nhân viên chi nhánh"},
  {n:"ZEN Tea – Lịch làm việc – Tên CH",d:"Báo ca, nhờ làm thế, xin đi trễ về sớm, đổi ca, lỗi chấm công"},
];
const gt=$('groups-tbody');
groups.forEach(g=>{gt.innerHTML+=`<tr><td><strong>${g.n}</strong></td><td>${g.d}</td></tr>`;});

const vLevels=["Nhắc nhở","Trừ điểm -1","Trừ điểm -2","Trừ điểm -4","Trừ điểm -6","Văn bản cam kết","Không xét thưởng nội quy","Không xét thưởng chuyên cần","Không xét thưởng KPI","Hạ bậc","Cách chức","Chấm dứt HĐ","Chế độ part-time"];
