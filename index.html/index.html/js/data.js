/* ═══════════════════════════════════════════════════
   ZENTEA – Violations & Recipes static data
   File: js/data.js
═══════════════════════════════════════════════════ */

// ═══ VIOLATIONS DATA (from Excel XỬ LÍ VI PHẠM) ═══
const DEFAULT_VIOLATIONS = [
  // ---- VI PHẠM THỜI GIAN ----
  {id:'v1',cat:'tg',group:'Nghỉ đột xuất',behavior:'Có báo trước 30 phút và không thoả điều kiện',nhacnho:'',trudiemtxt:'L1-L2',camket:'L1',habac:'',chamdut:'L2'},
  {id:'v2',cat:'tg',group:'Nghỉ đột xuất',behavior:'Có báo trước 30 phút và thoả điều kiện',nhacnho:'L1-L2',trudiemtxt:'',camket:'',habac:'',chamdut:'L3'},
  {id:'v3',cat:'tg',group:'Nghỉ đột xuất',behavior:'Không báo và không thoả điều kiện',nhacnho:'',trudiemtxt:'L1',camket:'',habac:'',chamdut:'L1'},
  {id:'v4',cat:'tg',group:'Nghỉ đột xuất',behavior:'Không báo và thoả điều kiện',nhacnho:'L1-L2',trudiemtxt:'',camket:'',habac:'',chamdut:'L3'},
  {id:'v5',cat:'tg',group:'Đi trễ',behavior:'Có phép – báo trên group trước giờ làm và đi trễ dưới 01 tiếng',nhacnho:'L1-L2',trudiemtxt:'L3-L4-L5',camket:'L4',habac:'',chamdut:'L5'},
  {id:'v6',cat:'tg',group:'Đi trễ',behavior:'Có phép – báo trên group trước giờ làm và đi trễ trên 01 tiếng',nhacnho:'',trudiemtxt:'L1-L2-L3',camket:'L2',habac:'',chamdut:'L3'},
  {id:'v7',cat:'tg',group:'Đi trễ',behavior:'Không phép – không báo trên group trước giờ làm và đi trễ dưới 05 phút',nhacnho:'L1-L2',trudiemtxt:'L3-L4-L5',camket:'L4',habac:'',chamdut:'L5'},
  {id:'v8',cat:'tg',group:'Đi trễ',behavior:'Không phép – không báo trên group trước giờ làm và đi trễ trên 05 phút',nhacnho:'',trudiemtxt:'L1-L2-L3',camket:'L2',habac:'',chamdut:'L3'},
  {id:'v9',cat:'tg',group:'Về sớm',behavior:'Có phép',nhacnho:'L1-L2',trudiemtxt:'L3-L4-L5',camket:'L4',habac:'',chamdut:'L5'},
  {id:'v10',cat:'tg',group:'Về sớm',behavior:'Không phép',nhacnho:'',trudiemtxt:'L1',camket:'',habac:'',chamdut:'L1'},
  {id:'v11',cat:'tg',group:'Về sớm',behavior:'Chấm công ra sớm',nhacnho:'',trudiemtxt:'L1-L2-L3',camket:'L3',habac:'',chamdut:'L4'},
  {id:'v12',cat:'tg',group:'Thời gian',behavior:'Vào/rời vị trí làm việc, bắt đầu/kết thúc công việc không đúng thời gian quy định',nhacnho:'',trudiemtxt:'L1-L2-L3-L4',camket:'L4',habac:'',chamdut:'L5'},
  {id:'v13',cat:'tg',group:'Nghỉ giữa giờ',behavior:'Nghỉ quá/không đúng thời gian quy định',nhacnho:'',trudiemtxt:'L1-L2-L3-L4',camket:'L3',habac:'',chamdut:'L4'},

  // ---- TRẬT TỰ TRONG CỬA HÀNG ----
  {id:'v14',cat:'tt',group:'Trật tự khi làm việc',behavior:'Gây ồn ào, mất trật tự',nhacnho:'',trudiemtxt:'L1-L2-L3-L4',camket:'L3',habac:'',chamdut:'L4'},
  {id:'v15',cat:'tt',group:'Trật tự khi làm việc',behavior:'Làm việc không đúng nơi quy định',nhacnho:'',trudiemtxt:'L1-L2-L3',camket:'L3',habac:'L4',chamdut:'L4'},
  {id:'v16',cat:'tt',group:'Trật tự khi làm việc',behavior:'Tự ý cho phép người lạ tiếp cận khu vực làm việc',nhacnho:'',trudiemtxt:'L1',camket:'L1-L2',habac:'L2',chamdut:'L4'},
  {id:'v17',cat:'tt',group:'Trật tự khi làm việc',behavior:'Tụ tập người thân/bạn bè trước cửa hàng trong giờ làm việc',nhacnho:'',trudiemtxt:'L1-L2-L3',camket:'L3',habac:'',chamdut:'L4'},
  {id:'v18',cat:'tt',group:'Trật tự khi làm việc',behavior:'Tự ý lưu trú tại nơi làm việc',nhacnho:'',trudiemtxt:'L1-L2-L3-L4',camket:'L4',habac:'',chamdut:'L5'},
  {id:'v19',cat:'tt',group:'Trật tự khi làm việc',behavior:'Rời vị trí quá 10 phút (trong phạm vi cửa hàng)',nhacnho:'',trudiemtxt:'L1',camket:'L2',habac:'L3',chamdut:'L4'},
  {id:'v20',cat:'tt',group:'Trật tự khi làm việc',behavior:'Rời vị trí quá 10 phút (ngoài phạm vi cửa hàng)',nhacnho:'',trudiemtxt:'L1',camket:'L2',habac:'L3',chamdut:'L4'},
  {id:'v21',cat:'tt',group:'Trật tự khi làm việc',behavior:'Sử dụng trang thiết bị-dụng cụ, nguyên liệu cho mục đích cá nhân',nhacnho:'',trudiemtxt:'L1-L2-L3',camket:'L3',habac:'',chamdut:'L4'},
  {id:'v22',cat:'tt',group:'Trật tự khi làm việc',behavior:'Sử dụng chất kích thích (bia, rượu,…) trong giờ làm việc',nhacnho:'',trudiemtxt:'L1',camket:'L1-L2',habac:'L3',chamdut:'L4'},
  {id:'v23',cat:'tt',group:'Làm việc riêng',behavior:'Sử dụng trang thiết bị điện tử, vật dụng cá nhân',nhacnho:'L1',trudiemtxt:'L2',camket:'L3',habac:'L4',chamdut:'L5'},
  {id:'v24',cat:'tt',group:'Làm việc riêng',behavior:'Trao – nhận vật dụng, thực phẩm cá nhân',nhacnho:'L1',trudiemtxt:'L2',camket:'L3',habac:'L4',chamdut:'L5'},
  {id:'v25',cat:'tt',group:'Làm việc riêng',behavior:'Ăn ngoài giờ quy định',nhacnho:'L1',trudiemtxt:'L2',camket:'L3',habac:'L4',chamdut:'L5'},
  {id:'v26',cat:'tt',group:'Mua sản phẩm của cửa hàng',behavior:'Trong giờ làm việc',nhacnho:'',trudiemtxt:'L1',camket:'L2',habac:'L3',chamdut:'L4'},
  {id:'v27',cat:'tt',group:'Mua sản phẩm của cửa hàng',behavior:'Giờ nghỉ ngơi',nhacnho:'',trudiemtxt:'L1',camket:'L2',habac:'L3',chamdut:'L4'},
  {id:'v28',cat:'tt',group:'Nghỉ giữa giờ',behavior:'Gục mặt xuống bàn',nhacnho:'L1',trudiemtxt:'L2-L3',camket:'L4',habac:'',chamdut:'L5'},
  {id:'v29',cat:'tt',group:'Nghỉ giữa giờ',behavior:'Ngủ tại nơi làm việc',nhacnho:'L1',trudiemtxt:'L2',camket:'L4',habac:'',chamdut:'L5'},
  {id:'v30',cat:'tt',group:'Nghỉ giữa giờ',behavior:'Ồn ào mất trật tự',nhacnho:'L1',trudiemtxt:'L2',camket:'L4',habac:'',chamdut:'L5'},
  {id:'v31',cat:'tt',group:'Nghỉ giữa giờ',behavior:'Nghỉ ngơi không đúng khu vực quy định',nhacnho:'',trudiemtxt:'L1-L2-L3-L4',camket:'L3',habac:'',chamdut:'L4'},

  // ---- NỘI QUY ----
  {id:'v32',cat:'nq',group:'Đồng phục',behavior:'Sai quy định đồng phục',nhacnho:'',trudiemtxt:'L1',camket:'L3',habac:'L4',chamdut:'L5'},
  {id:'v33',cat:'nq',group:'Đồng phục',behavior:'Sử dụng đồng phục cửa hàng ngoài khu vực/thời gian làm việc',nhacnho:'',trudiemtxt:'L1',camket:'L3',habac:'L4',chamdut:'L5'},
  {id:'v34',cat:'nq',group:'Đồng phục',behavior:'Có vết bẩn lớn',nhacnho:'L1',trudiemtxt:'L2-L3',camket:'L4',habac:'',chamdut:'L5'},
  {id:'v35',cat:'nq',group:'Đồng phục',behavior:'Đeo khẩu trang không che kín mũi và miệng',nhacnho:'L1',trudiemtxt:'L2-L3',camket:'L4',habac:'',chamdut:'L5'},
  {id:'v36',cat:'nq',group:'Tóc',behavior:'Tóc nhuộm màu nổi bật/sáng màu/móc light/màu khói',nhacnho:'',trudiemtxt:'L1',camket:'L2',habac:'',chamdut:'L3'},
  {id:'v37',cat:'nq',group:'Tóc',behavior:'Bù xù/bung xổ/để tóc mai – không gọn gàng',nhacnho:'',trudiemtxt:'L1',camket:'L3',habac:'L4',chamdut:'L5'},
  {id:'v38',cat:'nq',group:'Tóc',behavior:'Tóc mái che mắt/phủ mắt/không kẹp gọn gàng',nhacnho:'L1',trudiemtxt:'L2',camket:'L4',habac:'',chamdut:'L5'},
  {id:'v39',cat:'nq',group:'Tay',behavior:'Móng tay dài, nhô ra quá 02 mm',nhacnho:'',trudiemtxt:'L1',camket:'L3',habac:'L4',chamdut:'L5'},
  {id:'v40',cat:'nq',group:'Tay',behavior:'Sơn móng tay màu',nhacnho:'',trudiemtxt:'L1',camket:'L3',habac:'L4',chamdut:'L5'},
  {id:'v41',cat:'nq',group:'Tư thế',behavior:'Đứng trong tư thế nghỉ / Khoanh tay / Chống nạnh',nhacnho:'L1',trudiemtxt:'L2',camket:'L4',habac:'',chamdut:'L5'},
  {id:'v42',cat:'nq',group:'Vi phạm quy trình, quy định',behavior:'Không tuân thủ quy trình, quy định làm việc',nhacnho:'L1',trudiemtxt:'L2',camket:'L4',habac:'',chamdut:'L5'},
  {id:'v43',cat:'nq',group:'Vi phạm quy trình, quy định',behavior:'Không chấp hành theo sự chỉ đạo (hợp pháp) từ cấp trên',nhacnho:'',trudiemtxt:'L1',camket:'L1',habac:'L2',chamdut:'L2'},
  {id:'v44',cat:'nq',group:'Vi phạm quy trình, quy định',behavior:'Che giấu, đồng lõa, tiếp tay cho đồng nghiệp vi phạm',nhacnho:'',trudiemtxt:'L1',camket:'L1',habac:'L2',chamdut:'L2'},
  {id:'v45',cat:'nq',group:'Vi phạm quy trình, quy định',behavior:'Giấu diếm hoặc chiếm dụng tài sản của Công ty/khách hàng/đồng nghiệp',nhacnho:'',trudiemtxt:'L1',camket:'L1',habac:'L2',chamdut:'L2'},
  {id:'v46',cat:'nq',group:'Vi phạm quy trình, quy định',behavior:'Sử dụng/chiếm dụng thực phẩm của khách còn dư hoặc nguyên vật liệu của Công ty',nhacnho:'',trudiemtxt:'L1',camket:'L1',habac:'L2',chamdut:'L2'},
  {id:'v47',cat:'nq',group:'Vi phạm quy trình, quy định',behavior:'Thực hiện tích điểm từ đơn hàng của khách hàng cho bản thân',nhacnho:'',trudiemtxt:'L1',camket:'L1',habac:'L2',chamdut:'L2'},
  {id:'v48',cat:'nq',group:'An toàn vệ sinh thực phẩm',behavior:'Sử dụng các nguyên liệu đã quá hạn sử dụng, nguyên liệu không rõ nguồn gốc',nhacnho:'',trudiemtxt:'L1',camket:'L3',habac:'L4',chamdut:'L5'},
  {id:'v49',cat:'nq',group:'An toàn vệ sinh thực phẩm',behavior:'Bảo quản nguyên liệu sai quy định, ảnh hưởng đến chất lượng thành phẩm',nhacnho:'',trudiemtxt:'L1',camket:'L3',habac:'L4',chamdut:'L5'},
  {id:'v50',cat:'nq',group:'An toàn lao động',behavior:'Mang chất dễ cháy nổ, hóa chất độc hại vào Công ty',nhacnho:'',trudiemtxt:'L1',camket:'L3',habac:'L4',chamdut:'L5'},
  {id:'v51',cat:'nq',group:'An toàn lao động',behavior:'Để đồ đạc, hàng hóa chắn lối thoát hiểm',nhacnho:'',trudiemtxt:'L1',camket:'L3',habac:'L4',chamdut:'L5'},
  {id:'v52',cat:'nq',group:'An toàn lao động',behavior:'Tự ý câu, mắc, thay thế thiết bị điện',nhacnho:'',trudiemtxt:'L1',camket:'L3',habac:'L4',chamdut:'L5'},

  // ---- QUY TẮC ỨNG XỬ ----
  {id:'v53',cat:'ux',group:'Với cấp trên/đồng nghiệp',behavior:'Thực hiện hành vi thiếu đứng đắn, thiếu văn minh',nhacnho:'',trudiemtxt:'L1',camket:'L3',habac:'L4',chamdut:'L5'},
  {id:'v54',cat:'ux',group:'Với cấp trên/đồng nghiệp',behavior:'Sử dụng ngôn từ thiếu lịch sự, thô tục',nhacnho:'',trudiemtxt:'L1',camket:'L1',habac:'L2',chamdut:'L2'},
  {id:'v55',cat:'ux',group:'Với cấp trên/đồng nghiệp',behavior:'Gây gỗ, tranh cãi, lớn tiếng',nhacnho:'',trudiemtxt:'L1',camket:'L1',habac:'L2',chamdut:'L2'},
  {id:'v56',cat:'ux',group:'Với cấp trên/đồng nghiệp',behavior:'Nói trống không',nhacnho:'',trudiemtxt:'L1',camket:'L1',habac:'L2',chamdut:'L2'},
  {id:'v57',cat:'ux',group:'Với khách hàng',behavior:'Sử dụng ngôn từ teencode, nói trống không với khách hàng',nhacnho:'',trudiemtxt:'L1',camket:'L1',habac:'L2',chamdut:'L2'},
  {id:'v58',cat:'ux',group:'Với khách hàng',behavior:'Gây gổ, tranh cãi với khách hàng',nhacnho:'',trudiemtxt:'L1',camket:'L1',habac:'L2',chamdut:'L2'},
  {id:'v59',cat:'ux',group:'Với khách hàng',behavior:'Có thái độ không thân thiện với khách hàng',nhacnho:'',trudiemtxt:'L1',camket:'L1',habac:'L2',chamdut:'L2'},
  {id:'v60',cat:'ux',group:'Với khách hàng',behavior:'Không hỗ trợ nhóm khách hàng ưu tiên',nhacnho:'',trudiemtxt:'L1',camket:'L3',habac:'L4',chamdut:'L5'},
];

let violationsData = [...DEFAULT_VIOLATIONS];
let vioFilterCat = 'all';
let editingVioId = null;

const CAT_LABEL = {tg:'⏰ VI PHẠM THỜI GIAN', tt:'🏢 TRẬT TỰ CỬA HÀNG', nq:'📋 NỘI QUY', ux:'🤝 QUY TẮC ỨNG XỬ'};

async function loadViolations(){
  violationsData = [...DEFAULT_VIOLATIONS];
  try {
    const r = await window.storage.get(branchKey('zentea-violations'));
    if(r && r.value) violationsData = JSON.parse(r.value);
  } catch(e){}
  try {
    const s = localStorage.getItem(branchKey('zentea-violations'));
    if(s) violationsData = JSON.parse(s);
  } catch(e){}
  renderViolations();
}
async function saveViolations(){
  try { await window.storage.set(branchKey('zentea-violations'), JSON.stringify(violationsData)); } catch(e){}
  try { localStorage.setItem(branchKey('zentea-violations'), JSON.stringify(violationsData)); } catch(e){}
}

function renderViolations(){
  const tbody = $('vio-tbody');
  if(!tbody) return;
  const list = vioFilterCat === 'all' ? violationsData : violationsData.filter(v => v.cat === vioFilterCat);

  let html = '';
  let lastCat = '', lastGroup = '';
  list.forEach(v => {
    const catLabel = lastCat !== v.cat ? `<tr style="background:var(--green);"><td colspan="11" style="color:#fff;font-weight:700;font-size:12px;padding:8px 14px;letter-spacing:.5px;">${CAT_LABEL[v.cat]||v.cat}</td></tr>` : '';
    const groupCell = lastGroup !== v.group || lastCat !== v.cat ? `<td style="font-weight:700;color:var(--dark);background:#fafff8;" rowspan="1">${v.group}</td>` : '<td></td>';
    const cell = (val, color='') => val ? `<td style="font-weight:600;color:${color||'var(--green)'};text-align:center;">${val}</td>` : '<td style="color:#ddd;text-align:center;">—</td>';
    html += catLabel;
    html += `<tr>
      <td style="font-size:12px;color:#666;">${v.group}</td>
      <td style="font-size:12px;">${v.behavior}</td>
      ${cell(v.nhacnho,'#1565c0')}
      ${cell(v.trudiemtxt,'#e65100')}
      ${cell(v.camket,'#6a1b9a')}
      <td style="color:#ddd;text-align:center;">—</td>
      <td style="color:#ddd;text-align:center;">—</td>
      <td style="color:#ddd;text-align:center;">—</td>
      ${cell(v.habac,'#b71c1c')}
      <td style="color:#ddd;text-align:center;">—</td>
      ${cell(v.chamdut,'#000')}
    </tr>`;
    lastCat = v.cat; lastGroup = v.group;
  });
  tbody.innerHTML = html;
}

function filterVio(e, cat){
  vioFilterCat = cat;
  document.querySelectorAll('#vio-cat-tabs .tab-btn').forEach(b=>b.classList.remove('active'));
  e.target.classList.add('active');
  renderViolations();
}

// Violation Edit Modal
function openViolationEdit(){
  show('vio-modal','flex');
  hide('vio-form');
  renderVioEditList();
}
function closeVioModal(){ hide('vio-modal'); }
var _vm=$('vio-modal'); if(_vm) _vm.addEventListener('click', function(e){ if(e.target===this) closeVioModal(); });

function renderVioEditList(){
  const el = $('vio-edit-list');
  el.innerHTML = violationsData.map(v => `
    <div style="display:flex;align-items:center;gap:10px;padding:9px 12px;background:var(--green-pale);border-radius:10px;">
      <div style="flex:1;overflow:hidden;">
        <div style="font-size:10px;font-weight:700;color:var(--green);letter-spacing:.5px;">${CAT_LABEL[v.cat]||v.cat} · ${v.group}</div>
        <div style="font-size:12px;color:var(--dark);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${v.behavior}</div>
      </div>
      <button onclick="editVioItem('${v.id}')" style="padding:5px 12px;background:var(--green);color:#fff;border:none;border-radius:8px;font-size:12px;cursor:pointer;flex-shrink:0;">✏️</button>
    </div>`).join('');
}

function openVioAddForm(){
  editingVioId = null;
  $('vf-id').value='';
  $('vf-cat').value='tg';
  $('vf-group').value='';
  $('vf-behavior').value='';
  $('vf-nhacnho').value='';
  $('vf-trudiemtxt').value='';
  $('vf-camket').value='';
  $('vf-habac').value='';
  $('vf-chamdut').value='';
  hide('vf-delete-btn');
  var _vft1=$('vio-form-title'); if(_vft1) _vft1.textContent='Thêm vi phạm mới';
  show('vio-form');
}

function editVioItem(id){
  const v = violationsData.find(x=>x.id===id);
  if(!v) return;
  editingVioId = id;
  $('vf-id').value=id;
  $('vf-cat').value=v.cat;
  $('vf-group').value=v.group;
  $('vf-behavior').value=v.behavior;
  $('vf-nhacnho').value=v.nhacnho||'';
  $('vf-trudiemtxt').value=v.trudiemtxt||'';
  $('vf-camket').value=v.camket||'';
  $('vf-habac').value=v.habac||'';
  $('vf-chamdut').value=v.chamdut||'';
  show('vf-delete-btn');
  var _vft2=$('vio-form-title'); if(_vft2) _vft2.textContent='Chỉnh sửa vi phạm';
  show('vio-form');
  $('vio-form').scrollIntoView({behavior:'smooth',block:'nearest'});
}

async function saveVioItem(){
  const behavior = $('vf-behavior').value.trim();
  if(!behavior){ alert('Vui lòng nhập hành vi vi phạm!'); return; }
  const item = {
    id: editingVioId || ('v'+Date.now()),
    cat: $('vf-cat').value,
    group: $('vf-group').value.trim(),
    behavior,
    nhacnho: $('vf-nhacnho').value.trim(),
    trudiemtxt: $('vf-trudiemtxt').value.trim(),
    camket: $('vf-camket').value.trim(),
    habac: $('vf-habac').value.trim(),
    chamdut: $('vf-chamdut').value.trim(),
  };
  const idx = violationsData.findIndex(v=>v.id===editingVioId);
  if(idx>=0) violationsData[idx]=item;
  else violationsData.push(item);
  await saveViolations();
  renderViolations();
  renderVioEditList();
  closeVioForm();
}

async function deleteVioItem(){
  if(!editingVioId || !confirm('Xóa vi phạm này?')) return;
  violationsData = violationsData.filter(v=>v.id!==editingVioId);
  await saveViolations();
  renderViolations();
  renderVioEditList();
  closeVioForm();
}

function closeVioForm(){ hide('vio-form'); }

function switchTab(e,id){
  const parent = e.target.closest('.acc-inner');
  parent.querySelectorAll('.tab-content').forEach(t=>t.classList.remove('active'));
  parent.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  $('tab-'+id).classList.add('active');
  e.target.classList.add('active');
}

// ═══ RECIPES DATA ═══
const RECIPES = [
  // TRÀ SỮA
  {id:'ts1',cat:'tra-sua',name:'Trà Sữa Truyền Thống',emoji:'🧋',
   desc:'Trà sữa cổ điển – 100% trà cốt',
   ingredients:[
     {label:'Sữa đặc',vals:['0→15g|23g','1→27g|40g','2→35g|53g','3→40g|60g','4→45g|67g','5→45g|67g']},
     {label:'Trà cốt',vals:['0–4→60g|90g','5→55g|82g']},
     {label:'Bột sữa',vals:['M→2 muỗng','L→3 muỗng']},
   ],
   steps:['Cho trà cốt + sữa đặc vào shaker theo định lượng','Thêm bột sữa, khuấy tan','Thêm đá theo công thức, lắc 50 lần (13–18 giây)','Đổ ra ly, chuyển Đọc Bill'],
   notes:'Trà SỮA NÓNG: thêm 60g (M) / 90g (L) nước trước khi đánh nóng'},

  {id:'ts2',cat:'tra-sua',name:'Trà Sữa Ít Trà (X)',emoji:'🧋',
   desc:'60% trà – vị nhạt hơn truyền thống',
   ingredients:[
     {label:'Sữa đặc',vals:['X0→15g|23g','X1→22g|33g','X2→30g|45g','X3→35g|53g','X4→45g|67g','X5→45g|67g']},
     {label:'Trà cốt',vals:['X0–X4→40g|60g','X5→35g|53g']},
     {label:'Nước lọc',vals:['M→20g','L→30g']},
     {label:'Bột sữa',vals:['M→2 muỗng','L→3 muỗng']},
   ],
   steps:['Bấm sữa đặc vào shaker','Thêm trà cốt + nước lọc + bột sữa','Lắc 50 lần (13–18 giây)','Đổ ra ly có đá, chuyển Đọc Bill'],
   notes:'Nước lọc bù lại 40% trà đã giảm'},

  {id:'ts3',cat:'tra-sua',name:'Trà Sữa Olong (O)',emoji:'🧋',
   desc:'100% trà Olong – thơm thanh',
   ingredients:[
     {label:'Sữa đặc',vals:['O0→15g|23g','O1→22g|33g','O2→30g|45g','O3→35g|53g','O4→40g|60g','O5→40g|60g']},
     {label:'Trà Olong cốt',vals:['O0–O4→70g|105g','O5→65g|97g']},
     {label:'Bột sữa',vals:['M→2 muỗng','L→3 muỗng']},
   ],
   steps:['Bấm sữa đặc vào shaker','Thêm trà Olong cốt + bột sữa','Lắc 50 lần (13–18 giây)','Đổ ra ly có đá, chuyển Đọc Bill'],
   notes:'Vị D (Đậm): thêm 10g trà M / 15g trà L'},

  // CÀ PHÊ
  {id:'cf1',cat:'ca-phe',name:'Americano Lạnh',emoji:'☕',
   desc:'Cà phê đen đá – thanh mát',
   ingredients:[
     {label:'Nước lọc',vals:['M→120ml','L→180ml']},
     {label:'Đá',vals:['M→180g','L→220g']},
     {label:'Cafe',vals:['M→1 Slot (38–42g)','L→1,5 Slot (57–62g)']},
   ],
   steps:['Cân đá vào ly','Đong nước lọc vào ly','Thực hiện chiết xuất cà phê, rót lên trên mặt nước','Chuyển Đọc Bill'],
   notes:'Không khuấy – giữ lớp phân tầng đẹp'},

  {id:'cf2',cat:'ca-phe',name:'Americano Nóng',emoji:'☕',
   desc:'Cà phê đen nóng',
   ingredients:[
     {label:'Nước nóng (máy CF)',vals:['M→140ml','L→210ml']},
     {label:'Cafe',vals:['M→1 Shot','L→1,5 Slot']},
   ],
   steps:['Chọn ly giấy 500','Đong nước sôi từ máy cafe vào ly','Thực hiện chiết xuất cà phê, rót lên','Nhiệt độ mang tới khách: 75–80°C','Chuyển Đọc Bill'],
   notes:''},

  {id:'cf3',cat:'ca-phe',name:'Cafe Latte Kem Mật',emoji:'☕',
   desc:'Latte kết hợp kem mật thốt nốt béo ngậy',
   ingredients:[
     {label:'Sữa đặc',vals:['Cơ bản→28g','Ngọt→33g','Ít Ngọt→23g']},
     {label:'Sữa tươi',vals:['80g']},
     {label:'Cafe',vals:['20g (Ít cafe: 15g)']},
     {label:'Đá',vals:['130–140g (±30g)']},
     {label:'Kem mật thốt nốt',vals:['50g (Ít kem: 30g)']},
   ],
   steps:['Bấm sữa đặc + cân sữa tươi vào shaker','Thực hiện cà phê → cho vào shaker → đánh bọt 20 giây','Cân đá vào ly → đổ hỗn hợp, khuấy 3–5 vòng','Cân kem mật thốt nốt → đổ vào ly','Chuyển Đọc Bill'],
   notes:'Kiểm tra chất lượng kem trước khi dùng – khuấy đều'},

  {id:'cf4',cat:'ca-phe',name:'Cafe Latte Lạnh',emoji:'☕',
   desc:'Latte đá – classic',
   ingredients:[
     {label:'Sữa đặc',vals:['Cơ bản→32g','Ngọt→37g','Ít Ngọt→27g']},
     {label:'Sữa tươi',vals:['100g']},
     {label:'Cafe',vals:['20g']},
     {label:'Đá',vals:['170–180g (±30g)']},
   ],
   steps:['Bấm sữa đặc + cân sữa tươi vào shaker','Thực hiện cà phê → đánh bọt 20 giây','Cân đá vào ly → đổ hỗn hợp, khuấy 3–5 vòng','Chuyển Đọc Bill'],
   notes:''},

  {id:'cf5',cat:'ca-phe',name:'Cafe Latte Nóng',emoji:'☕',
   desc:'Latte nóng – 85–90°C',
   ingredients:[
     {label:'Sữa đặc',vals:['Cơ bản→32g','Ngọt→37g','Ít Ngọt→27g']},
     {label:'Sữa tươi',vals:['100g']},
     {label:'Nước lọc',vals:['20ml']},
     {label:'Cafe',vals:['20g']},
   ],
   steps:['Bấm sữa đặc + sữa tươi + nước lọc vào shaker','Khuấy đều → đánh nóng. Nhiệt độ chuẩn: 85°C–90°C','Thực hiện cà phê → cho vào hỗn hợp → đổ ra ly','Chuyển Đọc Bill'],
   notes:''},

  {id:'cf6',cat:'ca-phe',name:'Bạc Xỉu Lạnh',emoji:'☕',
   desc:'Ít cà phê, nhiều sữa – vị nhẹ',
   ingredients:[
     {label:'Sữa đặc',vals:['Cơ bản→30g','Ngọt→35g','Ít Ngọt→25g','Ít ít→20g','KĐ→0g']},
     {label:'Sữa tươi',vals:['20g']},
     {label:'Cafe',vals:['17–21g (Ít: 12–16g)']},
     {label:'Đá',vals:['Ngang miệng ly (Ít: 160–170g)']},
   ],
   steps:['Bấm sữa đặc + sữa tươi → shaker','Thực hiện cà phê → đánh bọt 20 giây','Đong đá ngang miệng ly → đổ hỗn hợp, khuấy 3–5 vòng','Chuyển Đọc Bill'],
   notes:''},

  {id:'cf7',cat:'ca-phe',name:'Cafe Sữa Lạnh',emoji:'☕',
   desc:'Cà phê sữa đặc đá đậm đà',
   ingredients:[
     {label:'Sữa đặc',vals:['Cơ bản→30g','Ngọt→35g','Ít Ngọt→25g']},
     {label:'Cafe',vals:['M→1 Slot (38–42g)','Ít: 30g']},
     {label:'Đá',vals:['Ngang miệng ly']},
   ],
   steps:['Bấm sữa đặc vào shaker','Thực hiện cà phê → cho vào shaker → đánh bọt 20 giây','Đong đá ngang miệng ly → đổ hỗn hợp, khuấy 3–5 vòng','Chuyển Đọc Bill'],
   notes:''},

  {id:'cf8',cat:'ca-phe',name:'Cafe Đen Lạnh',emoji:'☕',
   desc:'Cà phê đen với đường bột',
   ingredients:[
     {label:'Đường bột',vals:['Cơ bản→8g','Ngọt→10g','Ít Ngọt→6g','KĐ→0g']},
     {label:'Cafe',vals:['1 Slot (38–42g)']},
     {label:'Đá',vals:['Ngang miệng ly']},
   ],
   steps:['Cân đường bột vào shaker','Thực hiện cà phê → cho vào shaker → đánh bọt 20 giây','Lấy đá ngang miệng ly → đổ hỗn hợp, khuấy 3–5 vòng','Chuyển Đọc Bill'],
   notes:''},

  // TRÀ XANH
  {id:'tx1',cat:'tra-xanh',name:'Trà Xanh Latte Đá Viên',emoji:'🍵',
   desc:'Matcha latte đá – thanh mát thơm ngon',
   ingredients:[
     {label:'Syrup đường',vals:['Cơ bản→M:29,5g|L:44,3g','Ngọt→M:35,4g|L:53,1g','Ít Ngọt→M:23,6g|L:35,4g']},
     {label:'Sữa đặc',vals:['M→10g','L→15g']},
     {label:'Bột Matcha',vals:['Cơ bản: M→1Tsp+½Tsp | L→2Tsp+¼Tsp','Ít trà: M→1Tsp | L→1Tsp+½Tsp']},
     {label:'Sữa tươi (1)',vals:['M→100ml','L→150ml']},
     {label:'Sữa tươi (2)',vals:['M→40ml','L→60ml']},
     {label:'Đá',vals:['M→150–152g (±30g)','L→225–227g (±45g)']},
   ],
   steps:['Bấm Syrup đường vào shaker','Đong sữa tươi (1) vào shaker','Cân đá vào ly. Lắc shaker 50 lần → đổ ra ly','Đong sữa tươi (2) vào ca đong → múc bột Matcha vào ca','Đánh bọt 40 giây → rưới hỗn hợp matcha vào ly','Chuyển Đọc Bill'],
   notes:'Đánh bọt matcha riêng 40 giây để tạo lớp foam đẹp'},

  {id:'tx2',cat:'tra-xanh',name:'Trà Xanh Latte Nóng',emoji:'🍵',
   desc:'Matcha latte nóng – 75–80°C',
   ingredients:[
     {label:'Syrup đường',vals:['Cơ bản→M:29,5g|L:44,3g']},
     {label:'Sữa đặc',vals:['M→10g','L→15g']},
     {label:'Bột Matcha',vals:['Giống công thức latte đá']},
     {label:'Sữa tươi (1)',vals:['M→100ml','L→150ml']},
     {label:'Sữa tươi (2)',vals:['M→40ml','L→60ml']},
     {label:'Nước lọc',vals:['M→20ml','L→30ml']},
   ],
   steps:['Bấm Syrup + sữa đặc vào ly','Đong sữa tươi (1) + nước lọc → khuấy đều','Đánh nóng: 75°C–80°C','Đong sữa tươi (2) → múc bột Matcha → đánh bọt 40 giây','Rưới hỗn hợp matcha vào ly sữa nóng','Chuyển Đọc Bill'],
   notes:''},

  {id:'tx3',cat:'tra-xanh',name:'Trà Xanh Đá Xay',emoji:'🍵',
   desc:'Matcha đá xay bông kem – đậm đà',
   ingredients:[
     {label:'Syrup đường',vals:['Cơ bản→M:29,5g|L:44,3g']},
     {label:'Sữa đặc',vals:['M→10g','L→15g']},
     {label:'Bột Matcha',vals:['M→1Tsp+½Tsp | L→2Tsp+¼Tsp']},
     {label:'Bột Vani',vals:['M→1 Tbsp | L→1,5 Tbsp']},
     {label:'Sữa tươi',vals:['M→100ml (Nhiều đá: 140ml)','L→150ml (Nhiều đá: 210ml)']},
     {label:'Đá',vals:['M→150–152g','L→200g']},
     {label:'Bông kem',vals:['M→2 vòng (30–40g)','L→2,5 vòng (45–50g)']},
   ],
   steps:['Bấm Syrup + sữa đặc vào cối xay','Múc bột Matcha + bột Vani vào cối','Đong sữa tươi vào cối','Cân đá → đổ vào cối. Xay mức số 1 – 1 lần → đổ ra ly','Xịt bông kem + rắc bột Matcha lên bông kem','Chuyển Đọc Bill'],
   notes:'Kỹ thuật xịt kem: xịt trụ từ giữa tâm xoay tròn'},

  {id:'tx4',cat:'tra-xanh',name:'Xoài Latte',emoji:'🥭',
   desc:'Latte xoài tươi thơm mát',
   ingredients:[
     {label:'Syrup đường',vals:['Cơ bản→M:5,9g|L:8,8g','Ngọt→M:11,8g|L:17,7g']},
     {label:'Xoài tươi',vals:['M→1 túi (60–64g)','L→1,5 túi']},
     {label:'Sữa đặc',vals:['M→15g','L→23g']},
     {label:'Sữa tươi',vals:['M→150ml','L→225ml']},
     {label:'Đá',vals:['M→158–160g','L→180g']},
     {label:'Húng lũi',vals:['1 lá']},
   ],
   steps:['Bấm Syrup + sữa đặc vào cối xay','Cho xoài tươi vào cối','Đong sữa tươi vào cối. Xay mức số 2 – 1 lần','Cân đá vào ly → đổ hỗn hợp vào ly','Đặt 1 lá húng lũi lên mặt ly','Chuyển Đọc Bill'],
   notes:'Xoài chưa mềm: xả dưới vòi nước lọc 20–30 giây trước khi dùng'},

  // TRÀ TRÁI CÂY
  {id:'ttc1',cat:'tra-trai-cay',name:'Hồng Trà Kem Mật',emoji:'🍑',
   desc:'Hồng trà kết hợp kem mật thốt nốt',
   ingredients:[
     {label:'Syrup đường',vals:['Cơ bản→M:17,7g|L:26,5g','Ngọt→M:23,6g|L:35,4g','Ít Ngọt→M:11,8g|L:17,7g']},
     {label:'Trà pha loại II',vals:['M→100ml','L→150ml']},
     {label:'Đá',vals:['M→150g','L→225g']},
     {label:'Kem mật thốt nốt',vals:['M→50g (Ít: 30g)','L→75g (Ít: 40g)']},
   ],
   steps:['Bấm Syrup đường vào ly','Đong trà pha loại II vào ly (size L: 100ml + 50ml)','Cân đá → khuấy 3–4 vòng','Cân kem mật thốt nốt → đổ vào ly','Chuyển Đọc Bill'],
   notes:'Kiểm tra chất lượng kem trước khi dùng, khuấy đều'},

  {id:'ttc2',cat:'tra-trai-cay',name:'Trà Đào Lạnh',emoji:'🍑',
   desc:'Trà đào tươi thơm ngọt',
   ingredients:[
     {label:'Syrup đường',vals:['Cơ bản→M:11,8g|L:17,7g','Ngọt→M:17,7g|L:26,5g']},
     {label:'Cốt đào',vals:['M→20ml','L→30ml']},
     {label:'Syrup đào',vals:['Cơ bản→M:25ml|L:38ml','Thơm đào→M:35ml|L:53ml']},
     {label:'Trà pha loại II',vals:['M→80ml (Ít trà: 50ml)','L→120ml (Ít trà: 75ml)']},
     {label:'Nước lọc',vals:['M→30ml','L→45ml']},
     {label:'Miếng đào',vals:['M→3 miếng','L→5 miếng']},
   ],
   steps:['Bấm Syrup đường vào ly','Đong cốt đào + Syrup đào vào ly','Đong Trà pha loại II vào ly','Bỏ đá → khuấy 3–4 vòng ("Khuấy khi có đá")','Múc đào miếng đặt lên mặt ly (nhẹ tay, tránh nát đào)','Chuyển Đọc Bill'],
   notes:'Không đong đúp 2 nguyên liệu cùng lúc'},

  {id:'ttc3',cat:'tra-trai-cay',name:'Trà Chanh Lạnh',emoji:'🍋',
   desc:'Trà chanh chua ngọt mát lạnh',
   ingredients:[
     {label:'Syrup đường',vals:['Cơ bản→M:41,3g|L:62,5g','Ngọt→M:47,2g|L:70,8g','Ít Ngọt→M:35,4g|L:53,1g']},
     {label:'Trà pha loại II',vals:['M→100ml (Ít trà: 50ml)','L→150ml']},
     {label:'Cốt chanh',vals:['Cơ bản→M:10g|L:15g','Chua nhiều→M:15g|L:22g']},
     {label:'Nước lọc',vals:['M→50ml','L→75ml']},
   ],
   steps:['Nghiến 1/2 lát chanh vàng vào ly (4 lần, lực vừa, không lấy hạt)','Bấm Syrup đường vào ly','Vắt cốt chanh vào ca đong','Đong Trà pha loại II vào ly','Bỏ đá → khuấy 3–4 vòng','Decor 1 lát chanh vàng – logo hướng về phía bản thân','Chuyển Đọc Bill'],
   notes:'Hướng Logo về phía bản thân – chanh vàng nằm phía tay trái'},

  {id:'ttc4',cat:'tra-trai-cay',name:'Trà Chanh Mật Ong',emoji:'🍋',
   desc:'Trà chanh kết hợp mật ong tự nhiên',
   ingredients:[
     {label:'Mật ong',vals:['M→28g (±5g)','L→42g (±7,5g)']},
     {label:'Syrup đường',vals:['Cơ bản→M:29,5g|L:44,3g']},
     {label:'Trà pha loại II',vals:['M→100ml (Ít trà: 50ml)','L→150ml']},
     {label:'Cốt chanh',vals:['Cơ bản→M:12g|L:18g']},
     {label:'Nước lọc',vals:['M→50ml','L→75ml']},
   ],
   steps:['Nghiến 1/2 lát chanh vàng vào ly (4 lần)','Bấm Syrup + cân mật ong vào ly','Vắt cốt chanh vào ca đong','Đong Trà pha → khuấy tan mật ong 5–10 vòng','Đánh hỗn hợp 3–5 viên đá: 5 giây','Bỏ đá → khuấy 3–4 vòng. Decor 1 lát chanh + húng lũi','Chuyển Đọc Bill'],
   notes:'Trà Tắc Mật Ong: tương tự nhưng dùng trái tắc thay chanh vàng'},

  {id:'ttc5',cat:'tra-trai-cay',name:'Trà Dứa Tươi',emoji:'🍍',
   desc:'Trà dứa thanh mát nhiệt đới',
   ingredients:[
     {label:'Syrup đường',vals:['Cơ bản→M:11,8g|L:17,7g']},
     {label:'Cốt dứa',vals:['M→75g','L→112,5g']},
     {label:'Cốt tắc',vals:['M→4g','L→6g']},
     {label:'Nước lọc',vals:['M→100ml','L→150ml']},
     {label:'Đá',vals:['M→160–170g','L→190–200g']},
     {label:'Dứa topping',vals:['M→40g','L→60g']},
   ],
   steps:['Bấm Syrup đường vào ly','Cân cốt dứa (lắc bình dứa 15 cái trước khi dùng)','Cân cốt tắc vào ca đong + nước lọc','Cho 3–5 viên đá → đánh hỗn hợp 3 giây','Cân đá vào ly','Cân dứa tươi đặt lên mặt ly. Decor nhánh húng lũi','Chuyển Đọc Bill'],
   notes:'Cuống và ngọn húng nằm ngang, không cắm xuống đá'},

  {id:'ttc6',cat:'tra-trai-cay',name:'Trà Long Nhãn Hạt Sen',emoji:'🍈',
   desc:'Trà long nhãn hạt sen tươi thanh mát',
   ingredients:[
     {label:'Syrup đường',vals:['M→5,9g','L→8,8g']},
     {label:'Cốt nhãn',vals:['Cơ bản→M:80g|L:120g','Ít Ngọt→M:70g|L:105g']},
     {label:'Trà pha loại II',vals:['M→40ml','L→60ml']},
     {label:'Trà pha loại I',vals:['M→10ml','L→15ml']},
     {label:'Nhãn tươi',vals:['M→70g (±2g)','L→105g']},
     {label:'Sen tươi',vals:['M→12g','L→18g']},
   ],
   steps:['Cân nước cốt nhãn (dùng ca rót phần nước, không ép nhãn)','Đong trà pha loại II + I vào ly','Cho 3–5 viên đá → đánh hỗn hợp 3 giây','Cân đá vào ly','Múc nhãn tươi bằng vá có lỗ → cân → đặt lên mặt ly','Cân hạt sen + decor lá dứa tươi đẹp','Chuyển Đọc Bill'],
   notes:''},

  {id:'ttc7',cat:'tra-trai-cay',name:'Olong Mãng Cầu Chanh Dây',emoji:'🌿',
   desc:'Olong mãng cầu thanh mát độc đáo',
   ingredients:[
     {label:'Syrup đường',vals:['Cơ bản→M:29,5g|L:44,25g']},
     {label:'Nước hỗn hợp',vals:['M→50g','L→75g']},
     {label:'Trà Olong',vals:['M→20ml','L→30ml']},
     {label:'Cốt tắc',vals:['M→4g','L→6g']},
     {label:'Nước lọc',vals:['M→30ml','L→45ml']},
     {label:'Đá',vals:['M→180g','L→220g']},
     {label:'Mãng cầu topping',vals:['M→50g','L→75g']},
   ],
   steps:['Bấm Syrup đường vào ly','Cân nước hỗn hợp vào ly (kiểm tra chất lượng trước)','Đong Trà Olong + cốt tắc + nước lọc','Cho 3–5 viên đá → đánh hỗn hợp 3 giây','Cân đá vào ly','Múc mãng cầu (vá có lỗ) → cân → đặt lên mặt ly. Decor lá dứa','Chuyển Đọc Bill'],
   notes:'Đặt lá dứa đối diện với logo ly'},

  // ĐẶC BIỆT
  {id:'db1',cat:'dac-biet',name:'Sữa Tươi Trân Châu Đường Đen',emoji:'🖤',
   desc:'Classic bubble tea với đường đen',
   ingredients:[
     {label:'Trân châu nhỏ',vals:['M→65–70g','L→100–105g']},
     {label:'Đường đen (Trong)',vals:['Cơ bản→M:10g|L:15g','Không TC→M:30g|L:45g']},
     {label:'Đường đen (Viền)',vals:['M→10g','L→15g']},
     {label:'Sữa tươi',vals:['Cơ bản→M:200ml|L:300ml','Ngọt→M:250ml|L:370ml']},
     {label:'Đá',vals:['M→219g','L→280g']},
   ],
   steps:['Múc trân châu vào ly (sai số ±5g)','Cân Đường Đen vào trong ly → đánh 10–15 cái (tơi trân châu)','Xịt Đường Đen viền ly → chà từ miệng xuống đều','Đong sữa tươi → đổ vào ly','Cân đá → đổ vào ly','Chuyển Đọc Bill'],
   notes:'⚠️ Xịt viền đúng vòng tròn quanh miệng. Vượt mức → hủy sản phẩm'},

  {id:'db2',cat:'dac-biet',name:'Đá Me Hạt Đác',emoji:'🌿',
   desc:'Đặc sản me chua ngọt hạt đác giòn',
   ingredients:[
     {label:'Cốt me',vals:['Cơ bản→M:110g|L:165g','Ít Ngọt→M:100g|L:150g']},
     {label:'Syrup đường',vals:['M→5,9g','L→8,8g']},
     {label:'Nước lọc',vals:['Cơ bản→M:40ml|L:60ml','Ít Ngọt→M:50ml|L:75ml']},
     {label:'Đá',vals:['M→160–170g','L→190–200g']},
     {label:'Hạt đác',vals:['M→40g','L→60g']},
     {label:'Đậu phộng',vals:['M→5g','L→8g']},
   ],
   steps:['Cân cốt me (khuấy đều trước khi dùng)','Đong nước lọc vào ly','Cho 3–5 viên đá → đánh hỗn hợp 3 giây','Cân đá vào ly','Cân hạt đác đặt lên mặt ly','Cân đậu phộng → rắc đều mặt ly','Chuyển Đọc Bill'],
   notes:''},

  {id:'db3',cat:'dac-biet',name:'Rau Má Đậu Xanh',emoji:'🌱',
   desc:'Thức uống giải nhiệt truyền thống',
   ingredients:[
     {label:'Syrup đường',vals:['Cơ bản→M:11,8g|L:17,7g']},
     {label:'Rau má',vals:['Cơ bản→M:100ml|L:150ml','Ít đậu xanh→M:150ml|L:225ml']},
     {label:'Đậu xanh',vals:['Cơ bản→M:100g|L:150g','Ít ĐX→M:50g|L:75g']},
   ],
   steps:['Bấm Syrup đường vào shaker','Đong rau má vào shaker (kiểm tra chất lượng)','Cho 3–5 viên đá → đánh hỗn hợp 3 giây','Cân đậu xanh vào ly (sai số ±2g)','Bỏ đá → đổ hỗn hợp rau má ra ly (đổ nhanh, dồn bọt lên miệng)','Chuyển Đọc Bill'],
   notes:'Chú ý dồn thẳng lớp bọt cuối đáy shaker lên mặt ly'},

  {id:'db4',cat:'dac-biet',name:'Socola Sữa Lạnh',emoji:'🍫',
   desc:'Chocolate sữa đá mát lạnh',
   ingredients:[
     {label:'Sữa đặc',vals:['Cơ bản→M:30g|L:45g','Ngọt→M:35g|L:53g','Ít Ngọt→M:25g|L:38g']},
     {label:'Sữa tươi',vals:['M→140ml','L→210ml']},
     {label:'Bột Choco',vals:['M→1 Tbsp','L→1 Tbsp + 1 Tsp']},
     {label:'Đá',vals:['M→158–160g','L→180g']},
   ],
   steps:['Bấm sữa đặc vào shaker','Đong sữa tươi + múc bột Choco → khuấy đều','Cho 3–5 viên đá → đánh hỗn hợp 12 giây (tan 100% sữa đặc)','Cân đá vào ly → đổ hỗn hợp','Chuyển Đọc Bill'],
   notes:'Đánh đủ 12 giây để sữa đặc tan hoàn toàn'},

  {id:'db5',cat:'dac-biet',name:'Socola Sữa Nóng',emoji:'🍫',
   desc:'Chocolate sữa nóng ấm áp – 75–80°C',
   ingredients:[
     {label:'Sữa đặc',vals:['Cơ bản→M:30g|L:45g']},
     {label:'Sữa tươi (1)',vals:['M→100ml','L→150ml']},
     {label:'Sữa tươi (2)',vals:['M→40ml','L→60ml']},
     {label:'Nước lọc',vals:['M→20ml','L→30ml']},
     {label:'Bột Choco',vals:['M→1 Tbsp','L→1 Tbsp + 1 Tsp']},
   ],
   steps:['Bấm sữa đặc vào ly','Đong sữa tươi (1) + nước lọc vào ly','Khuấy đều → đánh nóng 75°C–80°C','Đong sữa tươi (2) → múc bột Choco → đánh bọt 12 giây','Đổ hỗn hợp matcha vào ly sữa đã đánh nóng','Chuyển Đọc Bill'],
   notes:''},

  {id:'db6',cat:'dac-biet',name:'Socola Kem Mật',emoji:'🍫',
   desc:'Socola với kem mật thốt nốt và Chocochip',
   ingredients:[
     {label:'Sữa đặc',vals:['Cơ bản→M:25g|L:37g']},
     {label:'Sữa tươi',vals:['M→80ml','L→120ml']},
     {label:'Bột Choco',vals:['M→1Tsp+½Tsp','L→2Tsp+¼Tsp']},
     {label:'Cafe',vals:['M→10g (Không: 0g)','L→15g']},
     {label:'Đá',vals:['M→150g','L→180g']},
     {label:'Kem mật thốt nốt',vals:['M→40g (Ít: 20g)','L→60g']},
     {label:'Socola Chip',vals:['M→10g','L→15g']},
   ],
   steps:['Bấm sữa đặc + sữa tươi + bột Choco vào shaker','Cho 3–5 viên đá → đánh 12 giây (tan 100% sữa đặc)','Cân đá vào ly → đổ hỗn hợp','Đổ kem mật thốt nốt vào ly (kiểm tra chất lượng)','Cân 10g Chocochip → rải đều bề mặt','Chuyển Đọc Bill'],
   notes:''},

  {id:'db7',cat:'dac-biet',name:'Socola Đá Xay',emoji:'🍫',
   desc:'Socola đá xay bông kem – phủ sốt zigzag',
   ingredients:[
     {label:'Sữa đặc',vals:['Cơ bản→M:45g|L:67g','Ngọt→M:50g|L:75g']},
     {label:'Sữa tươi',vals:['M→80ml','L→120ml']},
     {label:'Bột Choco',vals:['M→1Tbsp+1Tsp+½Tsp']},
     {label:'Bột Vani',vals:['M→1 Tbsp','L→1,5 Tbsp']},
     {label:'Cafe',vals:['M→5g (Không: 0g)']},
     {label:'Đá',vals:['M→158–160g (Ít: -20g)']},
     {label:'Bông kem',vals:['M→2 vòng (30–40g)']},
     {label:'Sốt Socola',vals:['6 đường zigzag']},
   ],
   steps:['Bấm sữa đặc + sữa tươi + bột Choco + Vani + cafe vào cối','Cân đá vào cối → xay mức số 1 – 1 lần → đổ ra ly','Xịt bông kem + xịt sốt Socola zigzag 6 đường','Chuyển Đọc Bill'],
   notes:''},

  {id:'db8',cat:'dac-biet',name:'Caramel Cà Phê Muối',emoji:'🍮',
   desc:'Caramel cà phê muối trang trí kẹo đường',
   ingredients:[
     {label:'Xốt Caramel',vals:['M→20g','L→30g']},
     {label:'Sữa đặc',vals:['Cơ bản→M:20g|L:30g']},
     {label:'Sữa tươi',vals:['M→100ml','L→150ml']},
     {label:'Đá',vals:['M→150g','L→180g']},
     {label:'Cafe',vals:['M→20g','L→30g']},
     {label:'Kẹo đường',vals:['M→12–15g','L→18–21g']},
   ],
   steps:['Rưới xốt Caramel lên thành ly → đập 3–5 cái cho sốt chảy đều','Cân đá vào ly','Đong sữa tươi + cân sữa đặc → cho 3–5 viên đá → đánh đều 3 giây → đổ vào ly','Đánh cafe 20 giây → rưới lên mặt ly','Trang trí kẹo đường','Chuyển Đọc Bill'],
   notes:''},

  {id:'db9',cat:'dac-biet',name:'Sữa Chua Nếp Gấc',emoji:'🍧',
   desc:'Sữa chua nếp gấc độc đáo',
   ingredients:[
     {label:'Sữa đặc',vals:['Cơ bản→M:30g|L:45g']},
     {label:'Sữa tươi',vals:['M→30g','L→45g']},
     {label:'Sữa chua',vals:['M→90g','L→135g']},
     {label:'Nếp gấc',vals:['M→20g','L→30g']},
     {label:'Đá',vals:['M→120g','L→180g']},
   ],
   steps:['Rưới xốt Caramel lên thành ly → đập 3–5 cái','Bấm sữa đặc vào shaker','Đong sữa tươi + sữa chua → cho 3–5 viên đá → đánh đều','Đổ hỗn hợp vào ly có đá','Đánh cafe 20 giây → rưới lên mặt ly. Trang trí kẹo đường','Chuyển Đọc Bill'],
   notes:''},

  {id:'db10',cat:'dac-biet',name:'Xoài Dứa Đá Xay',emoji:'🥭',
   desc:'Đá xay xoài dứa nhiệt đới',
   ingredients:[
     {label:'Syrup đường',vals:['Cơ bản→M:11,8g|L:17,7g']},
     {label:'Sữa đặc',vals:['M→25g','L→38g']},
     {label:'Cốt dứa',vals:['M→50g','L→75g']},
     {label:'Xoài tươi',vals:['M→1 túi (60–64g)','L→1,5 túi']},
     {label:'Sữa tươi',vals:['M→50ml','L→75ml']},
     {label:'Đá',vals:['M→150–152g','L→225–227g']},
     {label:'Topping dứa',vals:['M→40g','L→60g']},
   ],
   steps:['Bấm sữa đặc + sữa tươi vào cối','Cân cốt dứa + xoài tươi vào cối','Cân đá vào cối → xay 1 lần → đổ ra ly','Xịt bông kem + xịt sốt Socola zigzag','Chuyển Đọc Bill'],
   notes:'Kiểm tra cối không nứt, không hôi mốc trước khi dùng'},
];

// ─── RECIPE IMAGES ───
const CAT_IMGS = {
  'tra-sua': [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=200&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1627310970575-eb5ad7e19ef5?w=400&h=200&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=200&fit=crop&auto=format',
  ],
  'ca-phe': [
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=200&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=200&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1485808191679-5f86510bd652?w=400&h=200&fit=crop&auto=format',
  ],
  'tra-xanh': [
    'https://images.unsplash.com/photo-1545665277-5937489579f2?w=400&h=200&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&h=200&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=200&fit=crop&auto=format',
  ],
  'tra-trai-cay': [
    'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=200&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400&h=200&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&h=200&fit=crop&auto=format',
  ],
  'dac-biet': [
    'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?w=400&h=200&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400&h=200&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=200&fit=crop&auto=format',
  ],
};
const CAT_GRADS = {
  'tra-sua':'linear-gradient(135deg,#3a7bd5,#6fb3d2)',
  'ca-phe':'linear-gradient(135deg,#4e342e,#a1887f)',
  'tra-xanh':'linear-gradient(135deg,#2e7d32,#a5d6a7)',
  'tra-trai-cay':'linear-gradient(135deg,#e65100,#ffb74d)',
  'dac-biet':'linear-gradient(135deg,#6a1b9a,#ce93d8)',
};
function getImg(r){
  if(r.imgUrl) return r.imgUrl;
  const pool = CAT_IMGS[r.cat] || CAT_IMGS['dac-biet'];
  const idx = Math.abs(r.id.charCodeAt(r.id.length-1) - 48) % pool.length;
  return pool[idx];
}

// ─── BASE RECIPES ───
const BASE_RECIPES = [
  // TRÀ SỮA
  {id:'ts1',cat:'tra-sua',name:'Trà Sữa Truyền Thống',emoji:'🧋',desc:'100% trà cốt – vị cổ điển',
   ingredients:['Sữa đặc: 0→15g|23g, 1→27g|40g, 2→35g|53g, 3→40g|60g, 4→45g|67g','Trà cốt: 0–4→60g|90g (5→55g|82g)','Bột sữa: M→2 muỗng | L→3 muỗng'],
   steps:['Bấm sữa đặc vào shaker theo vị','Đong trà cốt theo định lượng','Thêm bột sữa, khuấy tan','Thêm đá, lắc 50 lần (13–18 giây)','Đổ ra ly, chuyển Đọc Bill'],
   notes:'Trà NÓNG: thêm 60g(M)/90g(L) nước trước khi đánh nóng'},
  {id:'ts2',cat:'tra-sua',name:'Trà Sữa Ít Trà (X)',emoji:'🧋',desc:'60% trà – vị nhạt hơn',
   ingredients:['Sữa đặc: X0→15g|23g, X1→22g|33g, X2→30g|45g, X3→35g|53g, X4→45g|67g','Trà cốt: X0–X4→40g|60g (X5→35g|53g)','Nước lọc: M→20g | L→30g','Bột sữa: M→2 muỗng | L→3 muỗng'],
   steps:['Bấm sữa đặc vào shaker','Thêm trà cốt + nước lọc + bột sữa','Khuấy tan bột','Thêm đá, lắc 50 lần','Đổ ra ly, chuyển Đọc Bill'],
   notes:'Nước lọc bù lại 40% trà đã giảm'},
  {id:'ts3',cat:'tra-sua',name:'Trà Sữa Olong (O)',emoji:'🧋',desc:'100% trà Olong – thơm thanh',
   ingredients:['Sữa đặc: O0→15g|23g, O1→22g|33g, O2→30g|45g, O3→35g|53g, O4→40g|60g','Trà Olong cốt: O0–O4→70g|105g (O5→65g|97g)','Bột sữa: M→2 muỗng | L→3 muỗng'],
   steps:['Bấm sữa đặc vào shaker','Thêm trà Olong cốt + bột sữa','Lắc 50 lần (13–18 giây)','Đổ ra ly có đá, chuyển Đọc Bill'],
   notes:'Vị D (Đậm): +10g trà (M) / +15g trà (L)'},
  // CÀ PHÊ
  {id:'cf1',cat:'ca-phe',name:'Americano Lạnh',emoji:'☕',desc:'Cà phê đen đá thanh mát',
   ingredients:['Nước lọc: M→120ml | L→180ml','Đá: M→180g | L→220g','Cafe: M→1 Slot(38–42g) | L→1,5 Slot(57–62g)'],
   steps:['Cân đá vào ly','Đong nước lọc vào ly','Chiết xuất cà phê, rót lên trên mặt nước','Chuyển Đọc Bill'],
   notes:'Không khuấy – giữ lớp phân tầng'},
  {id:'cf2',cat:'ca-phe',name:'Americano Nóng',emoji:'☕',desc:'Cà phê đen nóng – 75–80°C',
   ingredients:['Nước nóng (máy CF): M→140ml | L→210ml','Cafe: M→1 Shot | L→1,5 Slot'],
   steps:['Chọn ly giấy 500','Đong nước sôi từ máy cafe vào ly','Thực hiện chiết xuất cà phê, rót lên','Nhiệt độ mang tới khách: 75–80°C','Chuyển Đọc Bill'],
   notes:''},
  {id:'cf3',cat:'ca-phe',name:'Cafe Latte Kem Mật',emoji:'☕',desc:'Latte + kem mật thốt nốt béo ngậy',
   ingredients:['Sữa đặc: Cơ bản→28g | Ngọt→33g | Ít Ngọt→23g','Sữa tươi: 80g','Cafe: 20g (Ít cafe: 15g)','Đá: 130–140g (±30g)','Kem mật thốt nốt: 50g (Ít kem: 30g)'],
   steps:['Bấm sữa đặc + sữa tươi vào shaker','Chiết xuất cà phê → cho vào shaker → đánh bọt 20 giây','Cân đá vào ly → đổ hỗn hợp, khuấy 3–5 vòng','Cân kem mật thốt nốt → đổ vào ly','Chuyển Đọc Bill'],
   notes:'Kiểm tra + khuấy đều kem trước khi dùng'},
  {id:'cf4',cat:'ca-phe',name:'Cafe Latte Lạnh',emoji:'☕',desc:'Latte đá classic',
   ingredients:['Sữa đặc: Cơ bản→32g | Ngọt→37g | Ít Ngọt→27g','Sữa tươi: 100g','Cafe: 20g','Đá: 170–180g (±30g)'],
   steps:['Bấm sữa đặc + sữa tươi vào shaker','Chiết xuất cà phê → đánh bọt 20 giây','Cân đá vào ly → đổ hỗn hợp, khuấy 3–5 vòng','Chuyển Đọc Bill'],
   notes:''},
  {id:'cf5',cat:'ca-phe',name:'Cafe Latte Nóng',emoji:'☕',desc:'Latte nóng 85–90°C',
   ingredients:['Sữa đặc: Cơ bản→32g | Ngọt→37g | Ít Ngọt→27g','Sữa tươi: 100g','Nước lọc: 20ml','Cafe: 20g'],
   steps:['Bấm sữa đặc + sữa tươi + nước lọc vào shaker','Khuấy đều → đánh nóng 85–90°C','Chiết xuất cà phê → cho vào hỗn hợp → đổ ra ly','Chuyển Đọc Bill'],
   notes:''},
  {id:'cf6',cat:'ca-phe',name:'Bạc Xỉu Lạnh',emoji:'☕',desc:'Ít cà phê – nhiều sữa vị nhẹ',
   ingredients:['Sữa đặc: Cơ bản→30g | Ngọt→35g | Ít Ngọt→25g | Ít ít→20g','Sữa tươi: 20g','Cafe: 17–21g (Ít: 12–16g)','Đá: ngang miệng ly'],
   steps:['Bấm sữa đặc + sữa tươi → shaker','Chiết xuất cà phê → đánh bọt 20 giây','Đong đá ngang miệng ly → đổ hỗn hợp, khuấy 3–5 vòng','Chuyển Đọc Bill'],
   notes:''},
  {id:'cf7',cat:'ca-phe',name:'Cafe Sữa Lạnh',emoji:'☕',desc:'Cà phê sữa đặc đá đậm đà',
   ingredients:['Sữa đặc: Cơ bản→30g | Ngọt→35g | Ít Ngọt→25g','Cafe: M→1 Slot(38–42g) | Ít: 30g','Đá: ngang miệng ly'],
   steps:['Bấm sữa đặc vào shaker','Chiết xuất cà phê → đánh bọt 20 giây','Đong đá ngang miệng ly → đổ hỗn hợp, khuấy','Chuyển Đọc Bill'],
   notes:''},
  {id:'cf8',cat:'ca-phe',name:'Cafe Đen Lạnh',emoji:'☕',desc:'Cà phê đen với đường bột',
   ingredients:['Đường bột: Cơ bản→8g | Ngọt→10g | Ít Ngọt→6g','Cafe: 1 Slot (38–42g)','Đá: ngang miệng ly'],
   steps:['Cân đường bột vào shaker','Chiết xuất cà phê → đánh bọt 20 giây','Đong đá ngang miệng ly → đổ hỗn hợp, khuấy','Chuyển Đọc Bill'],
   notes:''},
  // TRÀ XANH
  {id:'tx1',cat:'tra-xanh',name:'Trà Xanh Latte Đá',emoji:'🍵',desc:'Matcha latte đá thanh mát',
   ingredients:['Syrup đường: Cơ bản→M:29,5g|L:44,3g | Ngọt→M:35,4g|L:53,1g','Sữa đặc: M→10g | L→15g','Bột Matcha: M→1Tsp+½Tsp | L→2Tsp+¼Tsp','Sữa tươi (1): M→100ml | L→150ml','Sữa tươi (2): M→40ml | L→60ml','Đá: M→150–152g | L→225–227g'],
   steps:['Bấm Syrup đường vào shaker','Đong sữa tươi (1) vào shaker','Cân đá vào ly. Lắc shaker 50 lần → đổ ra ly','Đong sữa tươi (2) → múc bột Matcha → đánh bọt 40 giây','Rưới hỗn hợp matcha vào ly','Chuyển Đọc Bill'],
   notes:'Đánh bọt matcha riêng 40 giây để tạo foam đẹp'},
  {id:'tx2',cat:'tra-xanh',name:'Trà Xanh Latte Nóng',emoji:'🍵',desc:'Matcha latte nóng 75–80°C',
   ingredients:['Syrup đường: M→29,5g | L→44,3g','Sữa đặc: M→10g | L→15g','Bột Matcha: giống latte đá','Sữa tươi (1): M→100ml | L→150ml','Sữa tươi (2): M→40ml | L→60ml','Nước lọc: M→20ml | L→30ml'],
   steps:['Bấm Syrup + sữa đặc vào ly','Đong sữa tươi (1) + nước lọc → khuấy đều','Đánh nóng: 75–80°C','Đong sữa tươi (2) → múc bột Matcha → đánh bọt 40 giây','Rưới hỗn hợp matcha vào ly sữa nóng','Chuyển Đọc Bill'],
   notes:''},
  {id:'tx3',cat:'tra-xanh',name:'Trà Xanh Đá Xay',emoji:'🍵',desc:'Matcha đá xay bông kem',
   ingredients:['Syrup đường: M→29,5g | L→44,3g','Sữa đặc: M→10g | L→15g','Bột Matcha: M→1Tsp+½Tsp | L→2Tsp+¼Tsp','Bột Vani: M→1 Tbsp | L→1,5 Tbsp','Sữa tươi: M→100ml | L→150ml','Đá: M→150–152g | L→200g','Bông kem: M→2 vòng | L→2,5 vòng'],
   steps:['Bấm Syrup + sữa đặc + bột Matcha + bột Vani + sữa tươi vào cối','Cân đá → đổ vào cối. Xay số 1 – 1 lần → đổ ra ly','Xịt bông kem + rắc bột Matcha lên bông kem','Chuyển Đọc Bill'],
   notes:'Xịt kem: xịt trụ từ giữa tâm xoay tròn'},
  {id:'tx4',cat:'tra-xanh',name:'Xoài Latte',emoji:'🥭',desc:'Latte xoài tươi thơm mát',
   ingredients:['Syrup đường: Cơ bản→M:5,9g|L:8,8g | Ngọt→M:11,8g|L:17,7g','Xoài tươi: M→1 túi(60–64g) | L→1,5 túi','Sữa đặc: M→15g | L→23g','Sữa tươi: M→150ml | L→225ml','Đá: M→158–160g | L→180g','Húng lũi: 1 lá'],
   steps:['Bấm Syrup + sữa đặc + xoài tươi vào cối','Đong sữa tươi vào cối. Xay số 2 – 1 lần','Cân đá vào ly → đổ hỗn hợp','Đặt 1 lá húng lũi lên mặt ly','Chuyển Đọc Bill'],
   notes:'Xoài chưa mềm: xả nước lọc 20–30 giây'},
  // TRÀ TRÁI CÂY
  {id:'ttc1',cat:'tra-trai-cay',name:'Hồng Trà Kem Mật',emoji:'🍑',desc:'Hồng trà + kem mật thốt nốt',
   ingredients:['Syrup đường: Cơ bản→M:17,7g|L:26,5g','Trà pha loại II: M→100ml | L→150ml','Đá: M→150g | L→225g','Kem mật thốt nốt: M→50g | L→75g'],
   steps:['Bấm Syrup đường vào ly','Đong trà pha loại II vào ly','Cân đá → khuấy 3–4 vòng','Cân kem mật → đổ vào ly','Chuyển Đọc Bill'],
   notes:'Khuấy đều kem trước khi dùng'},
  {id:'ttc2',cat:'tra-trai-cay',name:'Trà Đào Lạnh',emoji:'🍑',desc:'Trà đào tươi thơm ngọt',
   ingredients:['Syrup đường: Cơ bản→M:11,8g|L:17,7g','Cốt đào: M→20ml | L→30ml','Syrup đào: Cơ bản→M:25ml|L:38ml | Thơm→M:35ml|L:53ml','Trà pha loại II: M→80ml | L→120ml','Miếng đào: M→3 | L→5 miếng'],
   steps:['Bấm Syrup đường vào ly','Đong cốt đào + Syrup đào vào ly','Đong Trà pha loại II vào ly','Bỏ đá → khuấy 3–4 vòng','Múc đào miếng đặt lên mặt ly (nhẹ tay)','Chuyển Đọc Bill'],
   notes:'Không đong đúp 2 nguyên liệu cùng lúc'},
  {id:'ttc3',cat:'tra-trai-cay',name:'Trà Chanh Lạnh',emoji:'🍋',desc:'Trà chanh chua ngọt mát lạnh',
   ingredients:['Syrup đường: Cơ bản→M:41,3g|L:62,5g','Trà pha loại II: M→100ml | L→150ml','Cốt chanh: Cơ bản→M:10g|L:15g','Nước lọc: M→50ml | L→75ml'],
   steps:['Nghiến ½ lát chanh vàng vào ly (4 lần, lực vừa, không lấy hạt)','Bấm Syrup đường vào ly','Vắt cốt chanh vào ca đong','Đong Trà pha loại II vào ly','Bỏ đá → khuấy 3–4 vòng','Decor 1 lát chanh vàng','Chuyển Đọc Bill'],
   notes:'Logo hướng về phía bản thân – chanh nằm phía tay trái'},
  {id:'ttc4',cat:'tra-trai-cay',name:'Trà Chanh Mật Ong',emoji:'🍋',desc:'Trà chanh kết hợp mật ong tự nhiên',
   ingredients:['Mật ong: M→28g(±5g) | L→42g','Syrup đường: M→29,5g | L→44,3g','Trà pha loại II: M→100ml | L→150ml','Cốt chanh: M→12g | L→18g','Nước lọc: M→50ml | L→75ml'],
   steps:['Nghiến ½ lát chanh vàng vào ly (4 lần)','Bấm Syrup + cân mật ong vào ly','Vắt cốt chanh, đong trà pha → khuấy tan mật ong 5–10 vòng','Đánh hỗn hợp 3–5 viên đá: 5 giây','Bỏ đá → khuấy 3–4 vòng. Decor chanh + húng lũi','Chuyển Đọc Bill'],
   notes:'Trà Tắc Mật Ong: tương tự, dùng trái tắc thay chanh vàng'},
  {id:'ttc5',cat:'tra-trai-cay',name:'Trà Dứa Tươi',emoji:'🍍',desc:'Trà dứa thanh mát nhiệt đới',
   ingredients:['Syrup đường: M→11,8g | L→17,7g','Cốt dứa: M→75g | L→112,5g','Cốt tắc: M→4g | L→6g','Nước lọc: M→100ml | L→150ml','Dứa topping: M→40g | L→60g'],
   steps:['Bấm Syrup + cân cốt dứa (lắc bình 15 cái trước)','Cân cốt tắc + nước lọc. Đánh hỗn hợp 3 giây','Cân đá vào ly','Cân dứa tươi đặt lên mặt ly. Decor nhánh húng lũi','Chuyển Đọc Bill'],
   notes:'Cuống húng nằm ngang, không cắm xuống đá'},
  {id:'ttc6',cat:'tra-trai-cay',name:'Trà Long Nhãn Hạt Sen',emoji:'🍈',desc:'Thanh mát với nhãn tươi và sen',
   ingredients:['Syrup đường: M→5,9g | L→8,8g','Cốt nhãn: Cơ bản→M:80g|L:120g','Trà pha loại II: M→40ml | L→60ml','Nhãn tươi: M→70g | L→105g','Sen tươi: M→12g | L→18g'],
   steps:['Cân nước cốt nhãn (dùng ca rót, không ép nhãn)','Đong trà pha → cho 3–5 viên đá → đánh 3 giây','Cân đá vào ly','Múc nhãn tươi bằng vá có lỗ → cân → đặt lên mặt ly','Cân hạt sen + decor lá dứa tươi đẹp','Chuyển Đọc Bill'],
   notes:''},
  {id:'ttc7',cat:'tra-trai-cay',name:'Olong Mãng Cầu Chanh Dây',emoji:'🌿',desc:'Olong mãng cầu độc đáo',
   ingredients:['Syrup đường: M→29,5g | L→44,25g','Nước hỗn hợp: M→50g | L→75g','Trà Olong: M→20ml | L→30ml','Cốt tắc: M→4g | L→6g','Mãng cầu topping: M→50g | L→75g'],
   steps:['Bấm Syrup đường vào ly','Cân nước hỗn hợp + Trà Olong + cốt tắc + nước lọc','Đánh hỗn hợp 3 giây','Cân đá vào ly','Múc mãng cầu (vá có lỗ) → cân → đặt lên mặt ly. Decor lá dứa','Chuyển Đọc Bill'],
   notes:'Lá dứa đặt đối diện logo ly'},
  // ĐẶC BIỆT
  {id:'db1',cat:'dac-biet',name:'Sữa Tươi Trân Châu Đường Đen',emoji:'🖤',desc:'Classic bubble tea đường đen',
   ingredients:['Trân châu nhỏ: M→65–70g | L→100–105g','Đường đen (trong): Cơ bản→M:10g|L:15g','Đường đen (viền): M→10g | L→15g','Sữa tươi: Cơ bản→M:200ml|L:300ml','Đá: M→219g | L→280g'],
   steps:['Múc trân châu vào ly (±5g)','Cân đường đen trong → đánh 10–15 cái (tơi trân châu)','Xịt đường đen viền ly → chà từ miệng xuống đều','Đong sữa tươi → đổ vào ly','Cân đá → đổ vào ly','Chuyển Đọc Bill'],
   notes:'⚠️ Xịt viền đúng vòng tròn quanh miệng – vượt mức → hủy sản phẩm'},
  {id:'db2',cat:'dac-biet',name:'Đá Me Hạt Đác',emoji:'🌿',desc:'Me chua ngọt + hạt đác giòn',
   ingredients:['Cốt me: Cơ bản→M:110g|L:165g','Syrup đường: M→5,9g | L→8,8g','Nước lọc: M→40ml | L→60ml','Hạt đác: M→40g | L→60g','Đậu phộng: M→5g | L→8g'],
   steps:['Cân cốt me (khuấy đều trước khi dùng)','Đong nước lọc → đánh hỗn hợp 3 giây','Cân đá vào ly','Cân hạt đác đặt lên mặt ly. Rắc đậu phộng đều','Chuyển Đọc Bill'],
   notes:''},
  {id:'db3',cat:'dac-biet',name:'Rau Má Đậu Xanh',emoji:'🌱',desc:'Giải nhiệt truyền thống',
   ingredients:['Syrup đường: M→11,8g | L→17,7g','Rau má: Cơ bản→M:100ml|L:150ml','Đậu xanh: Cơ bản→M:100g|L:150g'],
   steps:['Bấm Syrup + rau má vào shaker. Đánh hỗn hợp 3 giây','Cân đậu xanh vào ly (±2g)','Bỏ đá → đổ hỗn hợp rau má ra ly (đổ nhanh, dồn bọt lên)','Chuyển Đọc Bill'],
   notes:'Dồn thẳng lớp bọt cuối đáy shaker lên mặt ly'},
  {id:'db4',cat:'dac-biet',name:'Socola Sữa Lạnh',emoji:'🍫',desc:'Chocolate sữa đá mát lạnh',
   ingredients:['Sữa đặc: Cơ bản→M:30g|L:45g','Sữa tươi: M→140ml | L→210ml','Bột Choco: M→1 Tbsp | L→1 Tbsp+1 Tsp','Đá: M→158–160g | L→180g'],
   steps:['Bấm sữa đặc + sữa tươi + bột Choco vào shaker','Đánh hỗn hợp 12 giây (tan 100% sữa đặc)','Cân đá vào ly → đổ hỗn hợp','Chuyển Đọc Bill'],
   notes:'Đánh đủ 12 giây để sữa đặc tan hoàn toàn'},
  {id:'db5',cat:'dac-biet',name:'Socola Kem Mật',emoji:'🍫',desc:'Socola + kem mật + Chocochip',
   ingredients:['Sữa đặc: M→25g | L→37g','Sữa tươi: M→80ml | L→120ml','Bột Choco: M→1Tsp+½Tsp | L→2Tsp+¼Tsp','Cafe: M→10g | L→15g','Kem mật thốt nốt: M→40g | L→60g','Socola Chip: M→10g | L→15g'],
   steps:['Bấm sữa đặc + sữa tươi + bột Choco vào shaker','Đánh 12 giây','Cân đá vào ly → đổ hỗn hợp','Đổ kem mật (kiểm tra chất lượng trước)','Rắc Chocochip đều bề mặt','Chuyển Đọc Bill'],
   notes:''},
  {id:'db6',cat:'dac-biet',name:'Socola Đá Xay',emoji:'🍫',desc:'Socola đá xay bông kem + sốt zigzag',
   ingredients:['Sữa đặc: Cơ bản→M:45g|L:67g','Sữa tươi: M→80ml | L→120ml','Bột Choco: M→1Tbsp+1Tsp+½Tsp','Bột Vani: M→1 Tbsp | L→1,5 Tbsp','Cafe: M→5g','Bông kem: M→2 vòng | L→2,5 vòng','Sốt Socola: 6 đường zigzag'],
   steps:['Bấm sữa đặc + sữa tươi + bột Choco + Vani + cafe vào cối','Cân đá → xay số 1 – 1 lần → đổ ra ly','Xịt bông kem + xịt sốt Socola zigzag 6 đường','Chuyển Đọc Bill'],
   notes:''},
  {id:'db7',cat:'dac-biet',name:'Caramel Cà Phê Muối',emoji:'🍮',desc:'Caramel CF muối + kẹo đường',
   ingredients:['Xốt Caramel: M→20g | L→30g','Sữa đặc: M→20g | L→30g','Sữa tươi: M→100ml | L→150ml','Cafe: M→20g | L→30g','Kẹo đường: M→12–15g | L→18–21g'],
   steps:['Rưới xốt Caramel lên thành ly → đập 3–5 cái','Cân đá vào ly','Đong sữa tươi + sữa đặc → đánh đều 3 giây → đổ vào ly','Đánh cafe 20 giây → rưới lên mặt ly','Trang trí kẹo đường','Chuyển Đọc Bill'],
   notes:''},
  {id:'db8',cat:'dac-biet',name:'Sữa Chua Nếp Gấc',emoji:'🍧',desc:'Sữa chua nếp gấc đặc trưng',
   ingredients:['Sữa đặc: M→30g | L→45g','Sữa tươi: M→30g | L→45g','Sữa chua: M→90g | L→135g','Nếp gấc: M→20g | L→30g','Đá: M→120g | L→180g'],
   steps:['Rưới xốt Caramel lên thành ly → đập 3–5 cái','Bấm sữa đặc + sữa tươi + sữa chua → đánh đều','Đổ hỗn hợp vào ly có đá','Đặt nếp gấc lên mặt ly. Trang trí kẹo đường','Chuyển Đọc Bill'],
   notes:''},
  {id:'db9',cat:'dac-biet',name:'Xoài Dứa Đá Xay',emoji:'🥭',desc:'Đá xay xoài dứa nhiệt đới',
   ingredients:['Syrup đường: M→11,8g | L→17,7g','Sữa đặc: M→25g | L→38g','Cốt dứa: M→50g | L→75g','Xoài tươi: M→1 túi | L→1,5 túi','Sữa tươi: M→50ml | L→75ml','Topping dứa: M→40g | L→60g'],
   steps:['Bấm sữa đặc + sữa tươi + cốt dứa + xoài tươi vào cối','Cân đá → xay 1 lần → đổ ra ly','Xịt bông kem + sốt Socola zigzag','Chuyển Đọc Bill'],
   notes:'Kiểm tra cối không nứt, không hôi mốc'},
];

// Machine recipes (rút gọn - chỉ thao tác thủ công sau khi máy pha)
const MACHINE_RECIPES = [
  {id:'m-ts1',cat:'tra-sua',name:'Trà Sữa Truyền Thống',emoji:'🧋',desc:'Máy tự động bơm trà + đường',
   ingredients:['Máy tự bơm: Trà cốt + Syrup đường theo vị','Thủ công thêm: Bột sữa M→2 muỗng | L→3 muỗng','Sữa đặc: Bấm tay theo bảng định lượng máy'],
   steps:['Quét mã QR bill trên máy – chọn size + vị','Máy tự bơm trà cốt + syrup đường','Bấm sữa đặc thủ công theo bảng máy đường','Thêm bột sữa, khuấy tan','Thêm đá → chuyển Đọc Bill'],
   notes:'Kiểm tra bảng định lượng máy đường đầu ca'},
  {id:'m-ts2',cat:'tra-sua',name:'Trà Sữa Ít Trà (X)',emoji:'🧋',desc:'Máy pha – vị X',
   ingredients:['Máy tự bơm: Trà cốt 60% + Syrup + Nước lọc bù','Thủ công: Bột sữa + Sữa đặc theo bảng'],
   steps:['Quét mã QR bill – chọn vị X','Máy bơm trà + nước lọc + syrup','Bấm sữa đặc thủ công','Thêm bột sữa → khuấy tan → đá','Chuyển Đọc Bill'],
   notes:''},
  {id:'m-ts3',cat:'tra-sua',name:'Trà Sữa Olong (O)',emoji:'🧋',desc:'Máy pha – vị O',
   ingredients:['Máy tự bơm: Trà Olong cốt + Syrup','Thủ công: Bột sữa + Sữa đặc theo bảng'],
   steps:['Quét mã QR bill – chọn vị O','Máy bơm trà Olong + syrup','Bấm sữa đặc thủ công','Thêm bột sữa → khuấy tan → đá','Chuyển Đọc Bill'],
   notes:''},
  {id:'m-cf1',cat:'ca-phe',name:'Cafe Latte (Máy)',emoji:'☕',desc:'Cafe latte rút gọn dùng máy',
   ingredients:['Máy tự bơm: Sữa tươi + Syrup','Thủ công: Sữa đặc bấm tay + Chiết xuất CF'],
   steps:['Quét mã QR bill','Máy bơm sữa tươi + syrup vào ly','Bấm sữa đặc thủ công','Chiết xuất CF thủ công → rót vào ly','Đánh bọt 20 giây (nếu cần)','Chuyển Đọc Bill'],
   notes:'CF vẫn chiết xuất thủ công 38–42g'},
  {id:'m-tx1',cat:'tra-xanh',name:'Trà Xanh Latte (Máy)',emoji:'🍵',desc:'Matcha latte rút gọn',
   ingredients:['Máy tự bơm: Sữa tươi + Syrup đường','Thủ công: Sữa đặc + Bột Matcha (đánh bọt)'],
   steps:['Quét mã QR bill','Máy bơm sữa tươi + syrup','Bấm sữa đặc thủ công','Múc bột Matcha → đánh bọt 40 giây','Rưới lên ly','Chuyển Đọc Bill'],
   notes:'Đánh bọt matcha riêng 40 giây'},
  {id:'m-ttc1',cat:'tra-trai-cay',name:'Trà Đào (Máy)',emoji:'🍑',desc:'Trà đào rút gọn',
   ingredients:['Máy tự bơm: Syrup đường + Trà pha loại II','Thủ công: Cốt đào + Syrup đào + Miếng đào'],
   steps:['Quét mã QR bill','Máy bơm syrup + trà pha','Thêm cốt đào + syrup đào thủ công','Bỏ đá → khuấy → đặt đào miếng lên','Chuyển Đọc Bill'],
   notes:''},
  {id:'m-ttc2',cat:'tra-trai-cay',name:'Trà Chanh (Máy)',emoji:'🍋',desc:'Trà chanh rút gọn',
   ingredients:['Máy tự bơm: Syrup đường + Trà pha loại II','Thủ công: Nghiến chanh + Cốt chanh + Nước lọc'],
   steps:['Nghiến ½ lát chanh vàng vào ly','Quét mã QR bill','Máy bơm syrup + trà pha','Vắt cốt chanh thủ công + nước lọc','Bỏ đá → khuấy → decor chanh','Chuyển Đọc Bill'],
   notes:''},
  {id:'m-db1',cat:'dac-biet',name:'Sữa Tươi Đường Đen (Máy)',emoji:'🖤',desc:'Bubble tea đường đen rút gọn',
   ingredients:['Máy tự bơm: Sữa tươi','Thủ công: Trân châu + Đường đen (trong + viền)'],
   steps:['Múc trân châu + đường đen thủ công vào ly','Xịt viền đường đen','Quét mã QR bill','Máy bơm sữa tươi vào ly','Cân đá → chuyển Đọc Bill'],
   notes:'⚠️ Xịt viền chuẩn – vượt mức → hủy'},
];

// ─── STATE ───
let currentMode = 'manual';
let currentCat = 'all';
let editingId = null;
let customRecipes = [];

const HAS_STORAGE = typeof window !== 'undefined' && typeof window.storage !== 'undefined';

async function loadCustomRecipes(){
  customRecipes = [];
  if(HAS_STORAGE){
    try {
      const r = await window.storage.get(branchKey('zentea-custom-recipes'));
      if(r && r.value) customRecipes = JSON.parse(r.value);
    } catch(e) { customRecipes = []; }
  } else {
    try {
      const saved = localStorage.getItem(branchKey('zentea-custom-recipes'));
      if(saved) customRecipes = JSON.parse(saved);
    } catch(e) { customRecipes = []; }
  }
  renderRecipes();
}

async function saveCustomRecipes(){
  if(HAS_STORAGE){
    try { await window.storage.set(branchKey('zentea-custom-recipes'), JSON.stringify(customRecipes)); }
    catch(e){ localStorage.setItem(branchKey('zentea-custom-recipes'), JSON.stringify(customRecipes)); }
  } else {
    try { localStorage.setItem(branchKey('zentea-custom-recipes'), JSON.stringify(customRecipes)); } catch(e){}
  }
}

function getAllRecipes(){
  const base = currentMode === 'manual' ? BASE_RECIPES : MACHINE_RECIPES;
  // Custom recipes override base recipes with same id, or add new ones
  const overrideIds = new Set(customRecipes.map(r => r.id));
  const baseFiltered = base.filter(r => !overrideIds.has(r.id));
  // Filter out tombstone (deleted) entries
  const customs = customRecipes.filter(r => !r._deleted && (!r.mode || r.mode === currentMode));
  return [...baseFiltered, ...customs];
}
