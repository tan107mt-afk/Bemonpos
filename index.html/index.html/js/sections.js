/* ═══════════════════════════════════════════════════
   ZENTEA – All sections: Checklist UI, Training, Salary, Reports, Waste
   File: js/sections.js
═══════════════════════════════════════════════════ */

// ── Timeline view helpers ──────────────────────────────
const CL_DOW_MAP = {0:'CHỦ NHẬT',1:'THỨ 2',2:'THỨ 3',3:'THỨ 4',4:'THỨ 5',5:'THỨ 6',6:'THỨ 7'};
const MONTH_VI = ['','Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
                   'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];

function clChangeMonth(delta){
  clViewMonth += delta;
  if(clViewMonth > 12){ clViewMonth = 1;  clViewYear++; }
  if(clViewMonth < 1) { clViewMonth = 12; clViewYear--; }
  clRender();
}

// Get or create a done-state key for a specific date + task template
function clDoneKey(year, month, day, templateIdx){
  return `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}-${templateIdx}`;
}

// Per-date done storage — separate from weekly template
const CL_DATE_DONE_KEY = 'zentea-cl-dates';
let clDateDone = {}; // { "2026-03-01-0": true, ... }

async function clLoadDateDone(){
  try {
    const s = await window.storage.get(branchKey('zentea-cl-dates'));
    if(s) clDateDone = JSON.parse(s.value);
  } catch(e){ clDateDone = {}; }
}
async function clSaveDateDone(){
  try { await window.storage.set(branchKey('zentea-cl-dates'), JSON.stringify(clDateDone)); } catch(e){}
}

// ── Per-date task overrides (custom text / person for a specific day) ──
const CL_DATE_OV_KEY = 'zentea-cl-overrides';
let clDateOverrides = {}; // { "2026-03-05-ov-2": {nhiem_vu:'...', phan_cong:'...'}, ... }

async function clLoadDateOverrides(){
  try {
    const s = await window.storage.get(branchKey('zentea-cl-overrides'));
    if(s) clDateOverrides = JSON.parse(s.value);
  } catch(e){ clDateOverrides = {}; }
}
async function clSaveDateOverrides(){
  try { await window.storage.set(branchKey('zentea-cl-overrides'), JSON.stringify(clDateOverrides)); } catch(e){}
}

let _clDateModalDate = null;
function openClDateModal(dateStr, label){
  _clDateModalDate = dateStr;
  const [y,m,d] = dateStr.split('-').map(Number);
  const dow = new Date(y, m-1, d).getDay();
  const dowName = CL_DOW_MAP[dow];
  const dayTasks = CL_WEEKLY_TEMPLATE.filter(t => t.thu === dowName);

  var _cdmt=$('cl-date-modal-title'); if(_cdmt) _cdmt.textContent = '✏️ Chỉnh sửa ngày ' + label;
  var _cdms=$('cl-date-modal-sub'); if(_cdms) _cdms.textContent = `${dayTasks.length} nhiệm vụ theo lịch tuần — có thể thay đổi nội dung riêng cho ngày này`;

  let body = `<div style="display:flex;flex-direction:column;gap:10px;">
    <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:10px 14px;font-size:12px;color:#1d4ed8;">
      💡 Thay đổi ở đây chỉ áp dụng cho ngày <strong>${label}</strong>, không ảnh hưởng lịch tuần gốc. Để trống = dùng lịch gốc.
    </div>`;

  dayTasks.forEach((t, i) => {
    const ti = CL_WEEKLY_TEMPLATE.indexOf(t);
    const ovKey = `${dateStr}-ov-${ti}`;
    const ov = clDateOverrides[ovKey] || {};
    const cs = clCaStyle(t.ca);
    const doneKey = clDoneKey(y, m, d, ti);
    const done = !!clDateDone[doneKey];
    body += `
    <div style="background:#fafafa;border:1.5px solid #e8e8e8;border-radius:12px;padding:12px 14px;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
        <span style="padding:2px 8px;border-radius:7px;font-size:10px;font-weight:700;background:${cs.bg};color:${cs.c};">${cs.icon} ${t.ca}</span>
        <span style="font-size:11px;color:#aaa;">Gốc: ${t.nhiem_vu}</span>
        <label style="margin-left:auto;display:flex;align-items:center;gap:5px;cursor:pointer;">
          <input type="checkbox" data-done-key="${doneKey}" ${done?'checked':''} style="accent-color:var(--green);width:15px;height:15px;" onchange="clDateDone[this.dataset.doneKey]=this.checked;clSaveDateDone();">
          <span style="font-size:11px;color:#555;font-weight:600;">Hoàn thành</span>
        </label>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
        <div>
          <label class="fld-lbl-xs">NỘI DUNG CÔNG VIỆC</label>
          <input data-ov-key="${ovKey}" data-ov-field="nhiem_vu" type="text" value="${(ov.nhiem_vu||'').replace(/"/g,'&quot;')}"
            placeholder="${t.nhiem_vu}"
            style="width:100%;padding:8px 10px;border:1.5px solid var(--border);border-radius:8px;font-family:'Open Sans',sans-serif;font-size:12px;outline:none;box-sizing:border-box;"
            onfocus="this.style.borderColor='var(--green)'" onblur="this.style.borderColor='var(--border)'"/>
        </div>
        <div>
          <label class="fld-lbl-xs">PHÂN CÔNG</label>
          <input data-ov-key="${ovKey}" data-ov-field="phan_cong" type="text" value="${(ov.phan_cong!==undefined?ov.phan_cong:(t.phan_cong||'')).replace(/"/g,'&quot;')}"
            placeholder="${t.phan_cong||'Nhập tên...'}"
            style="width:100%;padding:8px 10px;border:1.5px solid var(--border);border-radius:8px;font-family:'Open Sans',sans-serif;font-size:12px;outline:none;box-sizing:border-box;"
            onfocus="this.style.borderColor='var(--green)'" onblur="this.style.borderColor='var(--border)'"/>
        </div>
      </div>
    </div>`;
  });

  // Also allow adding extra one-off tasks for this date
  const extraKey = `${dateStr}-extras`;
  const extras = clDateOverrides[extraKey] || [];
  body += `
    <div id="cl-date-extras" style="display:flex;flex-direction:column;gap:6px;">
      ${extras.map((ex,ei) => `
      <div style="display:flex;gap:8px;align-items:center;background:#f0fdf4;border:1.5px solid #bbf7d0;border-radius:10px;padding:8px 10px;">
        <span style="font-size:12px;">➕</span>
        <input data-extra-idx="${ei}" data-extra-field="nhiem_vu" type="text" value="${(ex.nhiem_vu||'').replace(/"/g,'&quot;')}" placeholder="Tên công việc..."
          style="flex:2;padding:6px 10px;border:1.5px solid var(--border);border-radius:8px;font-size:12px;font-family:'Open Sans',sans-serif;outline:none;"
          onfocus="this.style.borderColor='var(--green)'" onblur="this.style.borderColor='var(--border)'"/>
        <input data-extra-idx="${ei}" data-extra-field="phan_cong" type="text" value="${(ex.phan_cong||'').replace(/"/g,'&quot;')}" placeholder="Phân công..."
          style="flex:1;padding:6px 10px;border:1.5px solid var(--border);border-radius:8px;font-size:12px;font-family:'Open Sans',sans-serif;outline:none;"
          onfocus="this.style.borderColor='var(--green)'" onblur="this.style.borderColor='var(--border)'"/>
        <button onclick="clRemoveExtra('${dateStr}',${ei})" style="padding:4px 8px;background:#fff;border:1.5px solid #fca5a5;border-radius:8px;color:#dc2626;cursor:pointer;font-size:12px;">✕</button>
      </div>`).join('')}
    </div>
    <button onclick="clAddDateExtra('${dateStr}')" style="padding:8px 14px;background:#fff;border:1.5px dashed var(--green);border-radius:10px;color:var(--green);cursor:pointer;font-size:12px;font-weight:700;font-family:'Open Sans',sans-serif;width:100%;text-align:center;">
      + Thêm nhiệm vụ riêng cho ngày này
    </button>
  </div>`;

  $('cl-date-modal-body').innerHTML = body;
  const m2 = $('cl-date-modal');
  m2.style.display = 'flex';
  setTimeout(()=>{ m2.querySelector('div').style.transform='scale(1)'; },10);
}

function clAddDateExtra(dateStr){
  const key = `${dateStr}-extras`;
  if(!clDateOverrides[key]) clDateOverrides[key] = [];
  clDateOverrides[key].push({nhiem_vu:'', phan_cong:''});
  // re-open to refresh
  const title = $('cl-date-modal-title').textContent.replace('✏️ Chỉnh sửa ngày ','');
  clSaveDateEdits(true);
  openClDateModal(dateStr, title);
}

function clRemoveExtra(dateStr, idx){
  const key = `${dateStr}-extras`;
  if(clDateOverrides[key]) clDateOverrides[key].splice(idx,1);
  clSaveDateOverrides();
  const title = $('cl-date-modal-title').textContent.replace('✏️ Chỉnh sửa ngày ','');
  openClDateModal(dateStr, title);
}

async function clSaveDateEdits(silent=false){
  // Save overrides from inputs
  document.querySelectorAll('[data-ov-key]').forEach(inp => {
    const key = inp.dataset.ovKey;
    const field = inp.dataset.ovField;
    if(!clDateOverrides[key]) clDateOverrides[key] = {};
    clDateOverrides[key][field] = inp.value.trim();
  });
  // Save extras
  const extraInputs = document.querySelectorAll('[data-extra-idx]');
  if(extraInputs.length){
    const dateStr = _clDateModalDate;
    const key = `${dateStr}-extras`;
    if(!clDateOverrides[key]) clDateOverrides[key] = [];
    extraInputs.forEach(inp => {
      const idx = parseInt(inp.dataset.extraIdx);
      const field = inp.dataset.extraField;
      if(!clDateOverrides[key][idx]) clDateOverrides[key][idx] = {};
      clDateOverrides[key][idx][field] = inp.value.trim();
    });
  }
  await clSaveDateOverrides();
  if(!silent){
    clCloseDateModal();
    clRender();
  }
}

function clCloseDateModal(){
  hide('cl-date-modal');
}

async function clToggleDateDone(key){
  clDateDone[key] = !clDateDone[key];
  await clSaveDateDone();
  clRender();
}

function clRenderTimeline(){
  const year = clViewYear;
  const month = clViewMonth;
  const daysInMonth = new Date(year, month, 0).getDate();
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  // Count progress for this month
  let totalMonth = 0, doneMonth = 0;
  for(let d = 1; d <= daysInMonth; d++){
    const dow = new Date(year, month-1, d).getDay();
    const dowName = CL_DOW_MAP[dow];
    const dayTasks = CL_WEEKLY_TEMPLATE.filter(t => t.thu === dowName);
    dayTasks.forEach((t, ti) => {
      totalMonth++;
      const key = clDoneKey(year, month, d, CL_WEEKLY_TEMPLATE.indexOf(t));
      if(clDateDone[key]) doneMonth++;
    });
  }
  const pct = totalMonth ? Math.round(doneMonth/totalMonth*100) : 0;

  let html = `
  <!-- Month nav -->
  <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 4px 14px;gap:12px;flex-wrap:wrap;">
    <div style="display:flex;align-items:center;gap:12px;">
      <button onclick="clChangeMonth(-1)" style="width:36px;height:36px;border-radius:50%;border:2px solid var(--border);background:#fff;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;transition:.15s;" onmouseover="this.style.borderColor='var(--green)'" onmouseout="this.style.borderColor='var(--border)'">‹</button>
      <div style="text-align:center;">
        <div style="font-size:22px;font-weight:800;color:var(--dark);font-family:'Lato',sans-serif;">${MONTH_VI[month]}</div>
        <div style="font-size:12px;color:#aaa;font-weight:600;">${year}</div>
      </div>
      <button onclick="clChangeMonth(1)" style="width:36px;height:36px;border-radius:50%;border:2px solid var(--border);background:#fff;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;transition:.15s;" onmouseover="this.style.borderColor='var(--green)'" onmouseout="this.style.borderColor='var(--border)'">›</button>
      <button onclick="clViewMonth=new Date().getMonth()+1;clViewYear=new Date().getFullYear();clRender();" style="padding:6px 14px;border:1.5px solid var(--green);background:#fff;color:var(--green);border-radius:20px;font-size:11px;font-weight:700;cursor:pointer;font-family:'Open Sans',sans-serif;">Hôm nay</button>
    </div>
    <!-- Month progress -->
    <div style="display:flex;align-items:center;gap:10px;background:#f0fdf4;padding:10px 16px;border-radius:12px;">
      <div style="font-size:11px;color:#888;">Tiến độ ${MONTH_VI[month]}:</div>
      <div style="width:160px;height:8px;background:#c6f6d5;border-radius:4px;overflow:hidden;">
        <div style="height:100%;background:var(--green);width:${pct}%;transition:width .4s;"></div>
      </div>
      <div style="font-size:13px;font-weight:800;color:var(--green);">${doneMonth}/${totalMonth}</div>
      <div style="font-size:12px;font-weight:700;color:#aaa;">${pct}%</div>
    </div>
  </div>

  <!-- Timeline -->
  <div style="position:relative;padding-left:54px;">
    <!-- Vertical line -->
    <div style="position:absolute;left:26px;top:0;bottom:0;width:3px;background:linear-gradient(to bottom,#c6f6d5,#a7f3d0,#6ee7b7);border-radius:2px;"></div>`;

  for(let d = 1; d <= daysInMonth; d++){
    const date = new Date(year, month-1, d);
    const dow = date.getDay();
    const dowName = CL_DOW_MAP[dow];
    const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isToday = dateStr === todayStr;
    const isPast  = dateStr < todayStr;
    const isWknd  = dow === 0 || dow === 6;

    const dayTasks = CL_WEEKLY_TEMPLATE.filter(t => t.thu === dowName);
    if(!dayTasks.length) continue;

    // Apply filters
    const filteredTasks = dayTasks.filter(t => {
      if(clFilterC !== 'all' && t.ca !== clFilterC) return false;
      const key = clDoneKey(year, month, d, CL_WEEKLY_TEMPLATE.indexOf(t));
      const done = !!clDateDone[key];
      if(clFilterS === 'done' && !done) return false;
      if(clFilterS === 'todo' && done) return false;
      return true;
    });
    if(!filteredTasks.length) continue;

    const dayDone = dayTasks.filter(t => !!clDateDone[clDoneKey(year,month,d,CL_WEEKLY_TEMPLATE.indexOf(t))]).length;
    const dayPct  = Math.round(dayDone/dayTasks.length*100);
    const allDone = dayDone === dayTasks.length;

    html += `
    <div style="position:relative;margin-bottom:${isToday?'24px':'16px'};">
      <!-- Dot on timeline -->
      <div style="position:absolute;left:-36px;top:12px;width:${isToday?'22px':'16px'};height:${isToday?'22px':'16px'};border-radius:50%;
        background:${allDone?'var(--green)':isToday?'#fff':isPast?'#d1d5db':'#fff'};
        border:3px solid ${allDone?'var(--green)':isToday?'var(--green)':isPast?'#9ca3af':'#d1d5db'};
        box-shadow:${isToday?'0 0 0 4px rgba(74,176,54,.2)':'none'};
        display:flex;align-items:center;justify-content:center;font-size:9px;
        margin-left:${isToday?'-3px':0};">
        ${allDone?'<span style="color:#fff;font-size:10px;">✓</span>':''}
      </div>

      <!-- Day card -->
      <div style="background:${isToday?'#fff':'#fafafa'};border:${isToday?'2px solid var(--green)':'1.5px solid #e8e8e8'};border-radius:14px;overflow:hidden;
        box-shadow:${isToday?'0 4px 20px rgba(74,176,54,.15)':'none'};">

        <!-- Day header -->
        <div style="padding:10px 16px;background:${isToday?'linear-gradient(135deg,var(--green),var(--green-light))':allDone?'#f0fdf4':isWknd?'#fff8f0':'#f8f9fa'};
          display:flex;align-items:center;gap:10px;">
          <div style="text-align:center;min-width:40px;">
            <div style="font-size:22px;font-weight:900;color:${isToday?'#fff':isWknd?'#e65100':'var(--dark)'}; font-family:'Lato',sans-serif;line-height:1;">${d}</div>
            <div style="font-size:10px;font-weight:700;color:${isToday?'rgba(255,255,255,.8)':isWknd?'#fb923c':'#aaa'};">${['CN','T2','T3','T4','T5','T6','T7'][dow]}</div>
          </div>
          <div style="flex:1;">
            <div style="font-size:12px;font-weight:700;color:${isToday?'#fff':isWknd?'#e65100':'var(--green)'};">${dowName}${isToday?' — Hôm nay':''}</div>
            <div style="display:flex;align-items:center;gap:6px;margin-top:4px;">
              <div style="flex:1;height:5px;background:${isToday?'rgba(255,255,255,.3)':'#e0e0e0'};border-radius:3px;overflow:hidden;max-width:100px;">
                <div style="height:100%;background:${isToday?'#fff':'var(--green)'};width:${dayPct}%;"></div>
              </div>
              <span style="font-size:10px;color:${isToday?'rgba(255,255,255,.8)':'#aaa'};">${dayDone}/${dayTasks.length}</span>
            </div>
          </div>
          ${isPast && !allDone ? `<span style="font-size:10px;padding:3px 8px;background:#fff3cd;color:#856404;border-radius:8px;font-weight:700;">⚠ Còn sót</span>` : ''}
          ${allDone ? `<span style="font-size:10px;padding:3px 8px;background:${isToday?'rgba(255,255,255,.2)':'#dcfce7'};color:${isToday?'#fff':'#166534'};border-radius:8px;font-weight:700;">✅ Hoàn thành</span>` : ''}
          <button onclick="event.stopPropagation();openClDateModal('${dateStr}','${dowName} ${d}/${month}/${year}')" title="Chỉnh sửa thủ công ngày này"
            style="width:28px;height:28px;border-radius:8px;border:1.5px solid ${isToday?'rgba(255,255,255,.4)':'var(--border)'};background:${isToday?'rgba(255,255,255,.15)':'#fff'};cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:.15s;"
            onmouseover="this.style.background='${isToday?'rgba(255,255,255,.25)':'var(--green-pale)'}'" onmouseout="this.style.background='${isToday?'rgba(255,255,255,.15)':'#fff'}'">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="${isToday?'#fff':'var(--green)'}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
        </div>

        <!-- Tasks -->
        <div style="padding:8px 12px;display:flex;flex-direction:column;gap:5px;">`;

    filteredTasks.forEach(t => {
      const ti   = CL_WEEKLY_TEMPLATE.indexOf(t);
      const key  = clDoneKey(year, month, d, ti);
      const done = !!clDateDone[key];
      const cs   = clCaStyle(t.ca);
      // get overridden text if any
      const overKey = `${dateStr}-ov-${ti}`;
      const overData = clDateOverrides[overKey] || {};
      const taskText = overData.nhiem_vu || t.nhiem_vu;
      const taskPerson = overData.phan_cong !== undefined ? overData.phan_cong : (t.phan_cong||'');
      html += `
          <div onclick="clToggleDateDone('${key}')" style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:10px;cursor:pointer;
            background:${done?'#f0fdf4':'#fff'};border:1px solid ${done?'#bbf7d0':overData.nhiem_vu?'#bfdbfe':'#f0f0f0'};transition:all .15s;"
            onmouseover="this.style.background='${done?'#dcfce7':'#f9fafb'}'" onmouseout="this.style.background='${done?'#f0fdf4':'#fff'}'">
            <div style="width:20px;height:20px;border-radius:50%;border:2px solid ${done?'var(--green)':'#ddd'};background:${done?'var(--green)':'#fff'};
              flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:10px;color:#fff;">${done?'✓':''}</div>
            <span style="padding:2px 7px;border-radius:7px;font-size:10px;font-weight:700;background:${cs.bg};color:${cs.c};flex-shrink:0;">${cs.icon} ${t.ca}</span>
            <div style="flex:1;font-size:12px;font-weight:${done?400:600};color:${done?'#9ca3af':'#374151'};text-decoration:${done?'line-through':'none'};">${taskText}${overData.nhiem_vu?'<span style="font-size:9px;margin-left:4px;color:#3b82f6;">✎</span>':''}</div>
            <div style="font-size:11px;color:#9ca3af;white-space:nowrap;">👤 ${taskPerson||'—'}</div>
          </div>`;
    });

    // Extra one-off tasks
    const extraKey2 = `${dateStr}-extras`;
    const extras = clDateOverrides[extraKey2] || [];
    extras.forEach((ex, ei) => {
      if(!ex.nhiem_vu) return;
      html += `
          <div style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:10px;background:#f0fdf4;border:1px dashed #86efac;">
            <div style="width:20px;height:20px;border-radius:50%;border:2px dashed #86efac;background:#fff;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:10px;">➕</div>
            <span style="padding:2px 7px;border-radius:7px;font-size:10px;font-weight:700;background:#dcfce7;color:#166534;flex-shrink:0;">📝 Thêm</span>
            <div style="flex:1;font-size:12px;font-weight:600;color:#166534;">${ex.nhiem_vu}</div>
            <div style="font-size:11px;color:#9ca3af;white-space:nowrap;">👤 ${ex.phan_cong||'—'}</div>
          </div>`;
    });

    html += `</div></div></div>`;
  }

  html += `</div>`; // end timeline container
  return html;
}

function clRenderList(tasks){
  if(!tasks.length) return '<div style="padding:32px;text-align:center;color:#aaa;">Không có nhiệm vụ nào phù hợp bộ lọc.</div>';
  // Group by day
  const byDay = {};
  THU_ORDER.forEach(d => { byDay[d] = []; });
  tasks.forEach(t => { if(byDay[t.thu]) byDay[t.thu].push(t); });

  let html = '';
  THU_ORDER.forEach(dow => {
    const list = byDay[dow];
    if(!list.length) return;
    const doneCount = list.filter(t=>t.done).length;
    const isWknd = dow==='CHỦ NHẬT'||dow==='THỨ 7';

    html += `<div style="margin-bottom:20px;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;padding:8px 12px;background:${isWknd?'#fff8f0':'#f0fdf4'};border-radius:10px;">
        <span style="font-size:13px;font-weight:800;color:${isWknd?'#e65100':'var(--green)'};">${dow}</span>
        <span style="font-size:11px;color:#aaa;">${doneCount}/${list.length} hoàn thành</span>
        <div style="flex:1;height:5px;background:#e0e0e0;border-radius:3px;overflow:hidden;">
          <div style="height:100%;background:${isWknd?'#fb923c':'var(--green)'};width:${list.length?Math.round(doneCount/list.length*100):0}%;"></div>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;">`;

    list.forEach(t => {
      const cs = clCaStyle(t.ca);
      html += `<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:${t.done?'#f9fef9':'#fff'};border:1.5px solid ${t.done?'#c6f6d5':'#e8e8e8'};border-radius:12px;cursor:pointer;transition:all .15s;" onclick="clToggleDone('${t.id}')">
        <div style="width:22px;height:22px;border-radius:50%;border:2px solid ${t.done?'var(--green)':'#ddd'};background:${t.done?'var(--green)':'#fff'};display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:12px;">${t.done?'✓':''}</div>
        <span style="padding:3px 8px;border-radius:8px;font-size:10px;font-weight:700;background:${cs.bg};color:${cs.c};flex-shrink:0;">${cs.icon} ${t.ca}</span>
        <div style="flex:1;font-size:13px;font-weight:${t.done?400:600};color:${t.done?'#aaa':'#333'};text-decoration:${t.done?'line-through':'none'};">${t.nhiem_vu}</div>
        <div style="font-size:11px;color:#888;white-space:nowrap;">👤 ${t.phan_cong||'—'}</div>
        <button onclick="event.stopPropagation();openClEditModal('${t.id}')" style="background:none;border:none;cursor:pointer;color:#bbb;font-size:14px;padding:2px 4px;">✏️</button>
      </div>`;
    });
    html += `</div></div>`;
  });
  return html;
}

function clRenderWeek(tasks){
  const byDay = {};
  THU_ORDER.forEach(d => { byDay[d] = []; });
  tasks.forEach(t => { if(byDay[t.thu]) byDay[t.thu].push(t); });

  let html = `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin-top:8px;">`;
  THU_ORDER.forEach(dow => {
    const list = byDay[dow];
    const isWknd = dow==='CHỦ NHẬT'||dow==='THỨ 7';
    const doneC = list.filter(t=>t.done).length;
    html += `<div style="background:#fff;border:2px solid ${isWknd?'#fed7aa':'#e8f5e9'};border-radius:14px;overflow:hidden;">
      <div style="background:${isWknd?'#fff8f0':'#f0fdf4'};padding:10px 14px;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-weight:800;font-size:12px;color:${isWknd?'#e65100':'var(--green)'};">${dow}</span>
        <span style="font-size:10px;color:#aaa;">${doneC}/${list.length}</span>
      </div>
      <div style="padding:8px;">`;
    if(!list.length){
      html += `<div style="padding:12px;text-align:center;color:#ccc;font-size:11px;">Không có nhiệm vụ</div>`;
    } else {
      list.forEach(t => {
        const cs = clCaStyle(t.ca);
        html += `<div style="display:flex;gap:6px;align-items:flex-start;padding:6px;border-radius:8px;cursor:pointer;margin-bottom:4px;background:${t.done?'#f0fdf4':'transparent'};" onclick="clToggleDone('${t.id}')">
          <div style="width:16px;height:16px;border-radius:50%;border:2px solid ${t.done?'var(--green)':'#ddd'};background:${t.done?'var(--green)':'#fff'};display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:9px;margin-top:1px;">${t.done?'✓':''}</div>
          <div style="flex:1;">
            <div style="font-size:11px;color:${t.done?'#aaa':'#333'};text-decoration:${t.done?'line-through':'none'};font-weight:${t.done?400:600};line-height:1.4;">${t.nhiem_vu}</div>
            <div style="display:flex;gap:4px;margin-top:3px;flex-wrap:wrap;">
              <span style="font-size:9px;padding:1px 5px;border-radius:5px;background:${cs.bg};color:${cs.c};font-weight:700;">${cs.icon} ${t.ca}</span>
              <span style="font-size:9px;color:#aaa;">👤 ${t.phan_cong||'—'}</span>
            </div>
          </div>
        </div>`;
      });
    }
    html += `</div></div>`;
  });
  html += `</div>`;
  return html;
}

function clRenderPerson(tasks){
  const byPerson = {};
  tasks.forEach(t => {
    const k = t.phan_cong||'Chưa phân công';
    if(!byPerson[k]) byPerson[k] = [];
    byPerson[k].push(t);
  });
  const people = Object.keys(byPerson).sort();

  let html = `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px;margin-top:8px;">`;
  people.forEach(person => {
    const list = byPerson[person];
    const doneC = list.filter(t=>t.done).length;
    const pct = Math.round(doneC/list.length*100);

    html += `<div style="background:#fff;border:2px solid #e8f5e9;border-radius:14px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,var(--green),var(--green-light));padding:10px 14px;">
        <div style="font-weight:800;font-size:13px;color:#fff;">👤 ${person}</div>
        <div style="font-size:10px;color:rgba(255,255,255,.75);margin-top:2px;">${doneC}/${list.length} nhiệm vụ · ${pct}%</div>
        <div style="height:4px;background:rgba(255,255,255,.3);border-radius:2px;margin-top:6px;overflow:hidden;">
          <div style="height:100%;background:#fff;width:${pct}%;"></div>
        </div>
      </div>
      <div style="padding:8px;">`;

    list.forEach(t => {
      const cs = clCaStyle(t.ca);
      const dow_short = THU_SHORT[t.thu]||t.thu;
      html += `<div style="display:flex;gap:6px;align-items:center;padding:6px 8px;border-radius:8px;cursor:pointer;margin-bottom:4px;background:${t.done?'#f0fdf4':'#fafafa'};" onclick="clToggleDone('${t.id}')">
        <div style="width:16px;height:16px;border-radius:50%;border:2px solid ${t.done?'var(--green)':'#ddd'};background:${t.done?'var(--green)':'#fff'};display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:9px;">${t.done?'✓':''}</div>
        <div style="flex:1;font-size:11px;color:${t.done?'#aaa':'#333'};text-decoration:${t.done?'line-through':'none'};font-weight:${t.done?400:600};line-height:1.4;">${t.nhiem_vu}</div>
        <span style="font-size:9px;padding:2px 5px;border-radius:5px;background:${cs.bg};color:${cs.c};font-weight:700;flex-shrink:0;">${dow_short}</span>
      </div>`;
    });
    html += `</div></div>`;
  });
  html += `</div>`;
  return html;
}

async function clToggleDone(id){
  const t = clTasks.find(t=>t.id===id);
  if(t){ t.done = !t.done; await clSave(); clRender(); }
}

function openClAddModal(){
  $('cl-edit-id').value = '';
  $('cl-edit-task').value = '';
  $('cl-edit-day').value = 'THỨ 2';
  $('cl-edit-ca').value = 'CA12';
  $('cl-edit-person').value = '';
  $('cl-edit-done').checked = false;
  hide('cl-delete-btn');
  var _clmt1=$('cl-modal-title'); if(_clmt1) _clmt1.textContent = 'Thêm nhiệm vụ vệ sinh';
  const m = $('cl-add-modal');
  m.style.display = 'flex';
}

function openClEditModal(id){
  const t = clTasks.find(t=>t.id===id);
  if(!t) return;
  $('cl-edit-id').value = t.id;
  $('cl-edit-task').value = t.nhiem_vu;
  $('cl-edit-day').value = t.thu;
  $('cl-edit-ca').value = t.ca;
  $('cl-edit-person').value = t.phan_cong||'';
  $('cl-edit-done').checked = !!t.done;
  $('cl-delete-btn').style.display = 'inline-block';
  var _clmt2=$('cl-modal-title'); if(_clmt2) _clmt2.textContent = 'Chỉnh sửa nhiệm vụ';
  const m = $('cl-add-modal');
  m.style.display = 'flex';
}

function closeClModal(){
  hide('cl-add-modal');
}

async function saveClTask(){
  const id = $('cl-edit-id').value;
  const nhiem_vu = $('cl-edit-task').value.trim();
  if(!nhiem_vu) return alert('Vui lòng nhập tên nhiệm vụ!');
  const obj = {
    id: id || 'cl-custom-' + Date.now(),
    thu: $('cl-edit-day').value,
    nhiem_vu,
    ca: $('cl-edit-ca').value,
    phan_cong: $('cl-edit-person').value.trim(),
    done: $('cl-edit-done').checked,
  };
  if(id){
    const idx = clTasks.findIndex(t=>t.id===id);
    if(idx>=0) clTasks[idx] = obj;
  } else {
    clTasks.push(obj);
  }
  await clSave();
  closeClModal();
  clRender();
}

async function deleteClTask(){
  const id = $('cl-edit-id').value;
  if(!id) return;
  if(!confirm('Xóa nhiệm vụ này?')) return;
  clTasks = clTasks.filter(t=>t.id!==id);
  await clSave();
  closeClModal();
  clRender();
}


// CONTENT EDITOR (checklist, salary, training, promotion)
var CONTENT_EDIT_CONFIG = {
  checklist: {
    title: '📋 Checklist Công Việc',
    storageKey: 'zentea-content-checklist',
    fields: [
      { id: 'daily', label: 'Checklist hằng ngày (mỗi dòng 1 mục)', placeholder: 'VD: Kiểm tra chất lượng đầu ca' }
    ]
  },
  salary: {
    title: '💰 Bảng Lương & Bậc',
    storageKey: 'zentea-content-salary',
    fields: [
      { id: 'salary_main', label: 'Bảng lương (mỗi dòng: Thành phần | Bậc C | Bậc B | Bậc A | A1 | A2)', placeholder: 'VD: Lương cơ bản/giờ | 20.000đ | 21.000đ | 22.000đ | 22.000đ | 22.000đ' },
      { id: 'salary_pos',  label: 'Phụ cấp vị trí (mỗi dòng: Vị trí | Phụ cấp)', placeholder: 'VD: Thu ngân | 2.000đ / giờ' }
    ]
  },
  training: {
    title: '🎓 Quy Trình Đào Tạo',
    storageKey: 'zentea-content-training',
    fields: [
      { id: 'steps', label: 'Các bước đào tạo (mỗi dòng: Tiêu đề | Mô tả)', placeholder: 'VD: Hội nhập | Đào tạo nội quy 6 ngày' }
    ]
  },
  promotion: {
    title: '🏆 Quy Trình Xét Bậc',
    storageKey: 'zentea-content-promotion',
    fields: [
      { id: 'steps', label: 'Các bước xét bậc (mỗi dòng: Tiêu đề | Mô tả)', placeholder: 'VD: Tiếp nhận thông tin | Nhận đăng ký từ group Zalo' },
      { id: 'exam',  label: 'Bảng đề kiểm tra (mỗi dòng: Đề | Trắc nghiệm | Tự luận | Câu liệt | Tổng)', placeholder: 'VD: Bậc C → B | 45 | 5 | 1 | 50' }
    ]
  },
  training_hoinhap: {
    title: '📚 Nội Dung Quy Trình Đào Tạo',
    storageKey: 'zentea-content-training-hoinhap',
    fields: [
      { id: 'steps', label: 'Các bước (mỗi dòng: Tiêu đề | Thời hạn | Bộ phận | Nội dung)', placeholder: 'VD: THÔNG TIN TUYỂN DỤNG | 1 NGÀY | QUẢN LÝ | - Nhận và xác nhận thông tin...' }
    ]
  },
  training_cm: {
    title: '🎯 Nội Dung Đào Tạo Chuyên Môn',
    storageKey: 'zentea-content-training-cm',
    fields: [
      { id: 'steps', label: 'Các bước (mỗi dòng: Tiêu đề | Thời hạn | Bộ phận | Nội dung)', placeholder: 'VD: TIẾP NHẬN THÔNG TIN | 1 NGÀY | QUẢN LÍ | - Cập nhật thông tin...' }
    ]
  },
  training_rank: {
    title: '🏆 Nội Dung Quy Trình Xét Bậc',
    storageKey: 'zentea-content-training-rank',
    fields: [
      { id: 'steps', label: 'Các bước (mỗi dòng: Tiêu đề | Thời hạn | Bộ phận | Nội dung)', placeholder: 'VD: TIẾP NHẬN THÔNG TIN | 1 NGÀY | QUẢN LÝ | - Nhận đăng ký từ group Zalo...' },
      { id: 'exam',  label: 'Bảng đề kiểm tra (mỗi dòng: Đề | Trắc nghiệm | Tự luận | Câu liệt | Tổng)', placeholder: 'VD: Bậc C → B | 45 | 5 | 1 | 50' }
    ]
  }
};

var _ceSection = null;


// ── Training step editor helpers ──
var DEFAULT_TRAINING_STEPS = [
  {"title":"Thông tin tuyển dụng","desc":"Nhận & xác nhận thông tin nhân sự từ Workflow (IOT). Chuyển sang Hội nhập.","shape":"rect","color":"#2d7a2d"},
  {"title":"Hội nhập","desc":"Đào tạo nội quy, kỹ năng. QL có mặt 3 buổi đầu. Đạt LT+TH >80 → tiếp tục.","shape":"rect","color":"#1d4ed8"},
  {"title":"Đào tạo nghề","desc":"Ký HĐ đào tạo. Kiểm tra LT sau ca 10. Đạt >80 → ký HĐ chính thức.","shape":"diamond","color":"#b45309"},
  {"title":"Ký hợp đồng chính thức","desc":"Báo QLLLV xác nhận kết quả. Cấp phát đồng phục. Thành công ✓","shape":"rounded","color":"#059669"}
];

var DIAGRAM_SHAPES = ['rect','rounded','diamond','circle','hexagon'];
var DIAGRAM_COLORS = ['#2d7a2d','#1d4ed8','#b45309','#059669','#7c3aed','#dc2626','#0891b2','#be185d'];

// ── Step row in editor ──
function trainingStepRow(title, desc, idx, shape, color){
  shape = shape || 'rect';
  color = color || DIAGRAM_COLORS[idx % DIAGRAM_COLORS.length];
  var bg = idx%2===0?'#fff':'#f9fef9';
  var inp = 'padding:7px 10px;border:1.5px solid var(--border);border-radius:8px;font-family:Open Sans,sans-serif;font-size:12px;outline:none;box-sizing:border-box;width:100%;background:#fff;';

  var shapeOpts = DIAGRAM_SHAPES.map(function(s){
    var labels = {rect:'▭ Hộp',rounded:'▢ Bo góc',diamond:'◇ Thoi',circle:'○ Tròn',hexagon:'⬡ Lục giác'};
    return '<option value="'+s+'"'+(s===shape?' selected':'')+'>'+labels[s]+'</option>';
  }).join('');

  var colorDots = DIAGRAM_COLORS.map(function(c){
    return '<span onclick="this.closest(\'[data-step-row]\').querySelector(\'[data-step-color]\').value=\''+c+'\';this.parentNode.querySelectorAll(\'span\').forEach(function(x){x.style.outline=\'none\'});this.style.outline=\'2px solid #333\'" '
      + 'style="display:inline-block;width:18px;height:18px;border-radius:50%;background:'+c+';cursor:pointer;'+(c===color?'outline:2px solid #333;':'')+'"></span>';
  }).join('');

  return '<div data-step-row style="background:'+bg+';border-radius:12px;padding:10px 12px;margin-bottom:8px;border:1.5px solid #e8e8e8;">'
    + '<div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;">'
    + '<span data-step-badge style="width:24px;height:24px;border-radius:50%;background:'+color+';color:#fff;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;">'+(idx+1)+'</span>'
    + '<input type="text" data-step-title placeholder="Tiêu đề bước..." value="'+title.replace(/"/g,'&quot;').replace(/'/g,"&#39;")+'" style="'+inp+'font-weight:700;flex:1;" onfocus="this.style.borderColor=\'var(--green)\'" onblur="this.style.borderColor=\'var(--border)\'"/>'
    + '<button type="button" onclick="trainingMoveStep(this,-1)" title="Lên" style="background:#f5f5f5;border:none;border-radius:6px;padding:3px 7px;cursor:pointer;color:#666;font-size:12px;">↑</button>'
    + '<button type="button" onclick="trainingMoveStep(this,1)" title="Xuống" style="background:#f5f5f5;border:none;border-radius:6px;padding:3px 7px;cursor:pointer;color:#666;font-size:12px;">↓</button>'
    + '<button type="button" onclick="this.closest(\'[data-step-row]\').remove();trainingReindex()" style="background:none;border:none;color:#f87171;font-size:17px;cursor:pointer;padding:2px 4px;line-height:1;">✕</button>'
    + '</div>'
    + '<textarea data-step-desc placeholder="Tóm tắt nội dung..." rows="2" style="'+inp+'resize:vertical;line-height:1.5;margin-bottom:8px;">'+desc+'</textarea>'
    + '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">'
    + '<div style="display:flex;align-items:center;gap:6px;">'
    + '<span style="font-size:10px;font-weight:700;color:#888;">HÌNH DẠNG</span>'
    + '<select data-step-shape style="padding:4px 8px;border:1.5px solid var(--border);border-radius:7px;font-size:11px;outline:none;background:#fff;cursor:pointer;">'+shapeOpts+'</select>'
    + '</div>'
    + '<div style="display:flex;align-items:center;gap:6px;">'
    + '<span style="font-size:10px;font-weight:700;color:#888;">MÀU</span>'
    + '<div style="display:flex;gap:4px;align-items:center;flex-wrap:wrap;">'+colorDots+'</div>'
    + '<input type="hidden" data-step-color value="'+color+'"/>'
    + '</div>'
    + '</div>'
    + '</div>';
}

function trainingReindex(){
  var rows = document.querySelectorAll('#training-steps-list [data-step-row]');
  rows.forEach(function(row, i){
    var badge = row.querySelector('[data-step-badge]');
    var color = row.querySelector('[data-step-color]').value;
    if(badge){ badge.textContent = i+1; badge.style.background = color; }
    row.style.background = i%2===0?'#fff':'#f9fef9';
  });
}

function trainingMoveStep(btn, dir){
  var row = btn.closest('[data-step-row]');
  var list = $('training-steps-list');
  if(!list) return;
  var rows = Array.from(list.querySelectorAll('[data-step-row]'));
  var idx = rows.indexOf(row);
  var target = rows[idx + dir];
  if(!target) return;
  if(dir===-1) list.insertBefore(row, target);
  else list.insertBefore(target, row);
  trainingReindex();
}

function trainingAddStep(){
  var list = $('training-steps-list');
  if(!list) return;
  var idx = list.querySelectorAll('[data-step-row]').length;
  var color = DIAGRAM_COLORS[idx % DIAGRAM_COLORS.length];
  list.insertAdjacentHTML('beforeend', trainingStepRow('','',idx,'rect',color));
}

function trainingGetStepsParsed(){
  var rows = document.querySelectorAll('#training-steps-list [data-step-row]');
  var result = [];
  rows.forEach(function(row){
    result.push({
      title:(row.querySelector('[data-step-title]').value||'').trim(),
      desc:(row.querySelector('[data-step-desc]').value||'').trim(),
      shape:row.querySelector('[data-step-shape]').value||'rect',
      color:(row.querySelector('[data-step-color]').value||'#2d7a2d').trim()
    });
  });
  return result;
}

function trainingGetSteps(){
  var rows = document.querySelectorAll('#training-steps-list [data-step-row]');
  var result = [];
  rows.forEach(function(row){
    var title = (row.querySelector('[data-step-title]').value||'').trim();
    var desc  = (row.querySelector('[data-step-desc]').value||'').trim();
    var shape = row.querySelector('[data-step-shape]').value||'rect';
    var color = (row.querySelector('[data-step-color]').value||'#2d7a2d').trim();
    if(title||desc) result.push(title+'|'+desc+'|'+shape+'|'+color);
  });
  return result.join('\n');
}

// ── SVG Diagram renderer ──
// FLOWCHART EDITOR
var FC = {
  nodes: [], edges: [], sel: null, selEdge: null,
  connecting: null, connectPort: null,
  dragging: null, dragOff: {x:0,y:0},
  draggingEdge: null, edgeDragOff: {x:0,y:0},
  svgEl: null
};

var FC_SHAPES = [
  {id:'rect',    label:'▭ Hộp'},
  {id:'rounded', label:'▢ Bo góc'},
  {id:'diamond', label:'◇ Thoi'},
  {id:'oval',    label:'○ Oval'},
  {id:'hexa',    label:'⬡ Lục giác'}
];
var FC_COLORS = ['#1d4ed8','#2d7a2d','#b45309','#dc2626','#7c3aed','#0891b2','#be185d','#374151'];

function fcSave(){
  try { localStorage.setItem(branchKey('zentea-flowchart'), JSON.stringify({nodes:FC.nodes,edges:FC.edges})); } catch(e){}
}
function fcLoad(){
  try {
    var raw = localStorage.getItem(branchKey('zentea-flowchart'));
    if(raw){ var d=JSON.parse(raw); FC.nodes=d.nodes||[]; FC.edges=d.edges||[]; return true; }
  } catch(e){}
  return false;
}
function fcUid(){ return 'n'+(Date.now()+Math.random()).toString(36).replace('.',''); }

function fcNodeW(n){ return n.shape==='diamond'?130:n.shape==='oval'?110:120; }
function fcNodeH(n){ return n.shape==='diamond'?80:n.shape==='oval'?48:52; }

function fcShapePath(n){
  var x=n.x,y=n.y,w=fcNodeW(n),h=fcNodeH(n),cx=x+w/2,cy=y+h/2;
  if(n.shape==='rect')    return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="4"/>';
  if(n.shape==='rounded') return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="16"/>';
  if(n.shape==='oval')    return '<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+(w/2)+'" ry="'+(h/2)+'"/>';
  if(n.shape==='diamond'){
    return '<polygon points="'+cx+','+(cy-h/2)+' '+(cx+w/2)+','+cy+' '+cx+','+(cy+h/2)+' '+(cx-w/2)+','+cy+'"/>';
  }
  if(n.shape==='hexa'){
    var r=h/2,rw=w*0.45;
    var pts=[[cx,cy-r],[cx+rw,cy-r*0.5],[cx+rw,cy+r*0.5],[cx,cy+r],[cx-rw,cy+r*0.5],[cx-rw,cy-r*0.5]];
    return '<polygon points="'+pts.map(function(p){return p[0]+','+p[1]}).join(' ')+'"/>';
  }
  return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="4"/>';
}

function fcPortPos(n, port){
  var w=fcNodeW(n),h=fcNodeH(n),cx=n.x+w/2,cy=n.y+h/2;
  if(port==='top')    return {x:cx,   y:n.y};
  if(port==='bottom') return {x:cx,   y:n.y+h};
  if(port==='left')   return {x:n.x,  y:cy};
  if(port==='right')  return {x:n.x+w,y:cy};
  // auto: pick best direction
  return {x:cx, y:cy};
}

function fcBestPort(from, to, preferFrom){
  var fw=fcNodeW(from),fh=fcNodeH(from);
  var fcx=from.x+fw/2,fcy=from.y+fh/2;
  var tcx=to.x+fcNodeW(to)/2,tcy=to.y+fcNodeH(to)/2;
  if(preferFrom) return preferFrom;
  var dx=tcx-fcx, dy=tcy-fcy;
  if(Math.abs(dx)>Math.abs(dy)) return dx>0?'right':'left';
  return dy>0?'bottom':'top';
}

function fcOppositePort(port){
  return {top:'bottom',bottom:'top',left:'right',right:'left'}[port]||'top';
}

function fcEdgePoints(from, to, fromPort, toPort){
  fromPort = fromPort || fcBestPort(from, to, null);
  toPort   = toPort   || fcOppositePort(fromPort);
  // Also auto-fix toPort based on direction if not forced
  if(!toPort){
    var fw=fcNodeW(from),fh=fcNodeH(from);
    var fcx=from.x+fw/2,fcy=from.y+fh/2;
    var tcx=to.x+fcNodeW(to)/2,tcy=to.y+fcNodeH(to)/2;
    var dx=tcx-fcx,dy=tcy-fcy;
    if(Math.abs(dx)>Math.abs(dy)) toPort=dx>0?'left':'right';
    else toPort=dy>0?'top':'bottom';
  }
  var s=fcPortPos(from,fromPort);
  var e=fcPortPos(to,toPort);
  return {sx:s.x,sy:s.y,ex:e.x,ey:e.y,fromPort:fromPort,toPort:toPort};
}

// Port dots positions for a node
function fcGetPorts(n){
  var w=fcNodeW(n),h=fcNodeH(n),cx=n.x+w/2,cy=n.y+h/2;
  return [
    {port:'top',    x:cx,     y:n.y,   cx:0, cy:-1},
    {port:'bottom', x:cx,     y:n.y+h, cx:0, cy:1},
    {port:'left',   x:n.x,   y:cy,    cx:-1,cy:0},
    {port:'right',  x:n.x+w, y:cy,    cx:1, cy:0},
  ];
}

// ── Shared node SVG renderer (used by both fcRender + fcDrawCanvas) ──
function fcNodeSVGString(n, isSel){
  var w=fcNodeW(n), h=fcNodeH(n), cx=n.x+w/2, cy=n.y+h/2;
  var bg  = n.color    || '#1d4ed8';
  var tc  = n.textColor|| '#ffffff';
  var str = '';

  // Selection glow
  if(isSel) str += '<rect x="'+(n.x-4)+'" y="'+(n.y-4)+'" width="'+(w+8)+'" height="'+(h+8)+'" rx="10" fill="rgba(251,191,36,.45)"/>';

  // Shape
  var shp = fcShapePath(n);
  var stroke = isSel ? '#fbbf24' : 'rgba(255,255,255,.3)';
  var sw     = isSel ? '3' : '1';
  str += shp.replace('/>',
    ' fill="'+bg+'" stroke="'+stroke+'" stroke-width="'+sw+'"/>'
  );

  // Text — word wrap
  var words = n.label.split(' '), lines = [], cur = '';
  words.forEach(function(w2){
    if((cur+' '+w2).trim().length > 13 && cur){ lines.push(cur.trim()); cur = w2; }
    else cur = (cur+' '+w2).trim();
  });
  if(cur) lines.push(cur.trim());
  lines = lines.slice(0, 3);
  var ly = cy - (lines.length-1)*7;
  lines.forEach(function(l, i){
    str += '<text x="'+cx+'" y="'+(ly+i*14)+'" text-anchor="middle" dominant-baseline="middle"'
         + ' fill="'+tc+'" font-size="10.5" font-weight="700" font-family="Open Sans,sans-serif">'+l+'</text>';
  });
  return str;
}

function fcDiagramTaller(){
  var el=$('training-diagram');
  if(el) el.style.height=(parseInt(el.style.height||520)+120)+'px';
}
function fcDiagramShorter(){
  var el=$('training-diagram');
  if(el){ var h=Math.max(200,parseInt(el.style.height||520)-120); el.style.height=h+'px'; }
}

function fcRender(){
  var el=$('training-diagram');
  if(!el) return;
  if(!FC.nodes.length){
    el.innerHTML='<div style="text-align:center;padding:40px;color:#aaa;font-size:13px;background:#f8fafc;border-radius:14px;">Nhấn <strong>✏️ Chỉnh sửa</strong> để thiết kế sơ đồ</div>'; if(typeof STATIC_FC1!=="undefined"){ el.innerHTML='<div style="min-width:640px;">'+STATIC_FC1+'</div>'; }
    return;
  }

  // Calculate SVG bounds
  var minX=Infinity,minY=Infinity,maxX=0,maxY=0;
  FC.nodes.forEach(function(n){
    minX=Math.min(minX,n.x); minY=Math.min(minY,n.y);
    maxX=Math.max(maxX,n.x+fcNodeW(n)); maxY=Math.max(maxY,n.y+fcNodeH(n));
  });
  var pad=40;
  var vw=maxX-minX+pad*2, vh=maxY-minY+pad*2;
  var ox=minX-pad, oy=minY-pad;

  var svgW=Math.max(700,vw), svgH=Math.max(400,vh);
  var svg='<svg viewBox="'+ox+' '+oy+' '+vw+' '+vh+'" width="'+svgW+'" height="'+svgH+'" style="display:block;" xmlns="http://www.w3.org/2000/svg">';
  svg+='<defs>';
  // arrowhead per color
  var usedColors={};
  FC.edges.forEach(function(e){ usedColors[e.color||'#374151']=1; });
  Object.keys(usedColors).forEach(function(c){
    var id='arr'+c.replace('#','');
    svg+='<marker id="'+id+'" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="'+c+'"/></marker>';
  });
  svg+='</defs>';
  svg+='<rect x="'+ox+'" y="'+oy+'" width="'+vw+'" height="'+vh+'" fill="#f8fafc"/>';

  // Draw edges
  FC.edges.forEach(function(e){
    var from=FC.nodes.find(function(n){return n.id===e.from;});
    var to=FC.nodes.find(function(n){return n.id===e.to;});
    if(!from||!to) return;
    var p=fcEdgePoints(from,to,e.fromPort||null,e.toPort||null);
    var c=e.color||'#374151';
    var bx=(e.bendX!==undefined)?e.bendX:(p.sx+p.ex)/2;
    var by=(e.bendY!==undefined)?e.bendY:(p.sy+p.ey)/2;
    var mid;
    if(p.fromPort==='top'||p.fromPort==='bottom')
      mid='M'+p.sx+','+p.sy+' C'+p.sx+','+by+' '+p.ex+','+by+' '+p.ex+','+p.ey;
    else
      mid='M'+p.sx+','+p.sy+' C'+bx+','+p.sy+' '+bx+','+p.ey+' '+p.ex+','+p.ey;
    svg+='<path d="'+mid+'" fill="none" stroke="'+c+'" stroke-width="2" marker-end="url(#arr'+c.replace('#','')+')"/>';
    if(e.label){
      var lx=bx, ly=by-12;
      svg+='<rect x="'+(lx-26)+'" y="'+(ly-9)+'" width="52" height="17" rx="5" fill="rgba(255,255,255,.92)" stroke="'+c+'" stroke-width="1"/>';
      svg+='<text x="'+lx+'" y="'+(ly+3)+'" text-anchor="middle" font-size="9.5" font-weight="700" fill="'+c+'" font-family="Open Sans,sans-serif">'+e.label+'</text>';
    }
  });

  // Draw nodes
  FC.nodes.forEach(function(n){
    svg += '<g>' + fcNodeSVGString(n, false) + '</g>';
  });

  svg+='</svg>';
  // Make diagram fill container width, scroll vertically
  el.style.overflow='auto';
  el.innerHTML='<div style="min-width:'+Math.max(600,vw)+'px;min-height:'+Math.max(300,vh)+'px;">'+svg+'</div>';
}

// ── Canvas editor inside modal ──
function fcOpenEditor(){
  fcLoad();
  _ceSection='training';
  var _cemt1=$('ce-modal-title'); if(_cemt1) _cemt1.textContent='🗂 Sơ Đồ Quy Trình Đào Tạo';
  var _cem1=$('content-edit-modal'); if(_cem1) _cem1.style.display='flex';

  var textColors=['#ffffff','#111111','#fef08a','#bbf7d0','#bfdbfe','#fecaca'];
  var textColorDots=textColors.map(function(tc){
    return '<span onclick="fcSetTextColor(\''+tc+'\')" data-fc-tcolor="'+tc+'" title="Màu chữ: '+tc+'"'
      +' style="display:inline-block;width:18px;height:18px;border-radius:50%;background:'+tc+';cursor:pointer;border:2px solid #aaa;"></span>';
  }).join('');

  var colors=FC_COLORS.map(function(c){
    return '<span onclick="fcSetColor(\''+c+'\')" style="display:inline-block;width:20px;height:20px;border-radius:50%;background:'+c+';cursor:pointer;border:2px solid transparent;" data-fc-color="'+c+'"></span>';
  }).join('');

  var shapeOpts=FC_SHAPES.map(function(s){
    return '<button type="button" onclick="fcAddNode(\''+s.id+'\')" style="padding:6px 12px;border:1.5px solid var(--border);border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;background:#fff;color:var(--dark);transition:.15s;" onmouseover="this.style.background=\'var(--green)\';this.style.color=\'#fff\'" onmouseout="this.style.background=\'#fff\';this.style.color=\'var(--dark)\'">'+s.label+'</button>';
  }).join('');

  $('ce-modal-body').innerHTML=
    '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;align-items:center;">'
    +'<span style="font-size:11px;font-weight:700;color:#888;">THÊM NÚT:</span>'+shapeOpts
    +'</div>'
    +'<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;align-items:center;">'
    +'<span style="font-size:11px;font-weight:700;color:#888;">MÀU:</span>'+colors
    +'<span id="fc-color-preview" style="display:inline-block;width:20px;height:20px;border-radius:50%;background:'+FC_COLORS[0]+';border:2px solid #333;"></span>'
    +'</div>'
    +'<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;align-items:center;">'
    +'<span style="font-size:11px;font-weight:700;color:#888;">MÀU CHỮ:</span>'+textColorDots
    +'</div>'
    +'<div style="margin-bottom:8px;display:flex;gap:6px;flex-wrap:wrap;">'
    +'<button type="button" onclick="fcStartConnect()" id="fc-connect-btn" style="padding:6px 14px;background:#f5f5f5;border:1.5px solid #ddd;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;">🔗 Nối mũi tên</button>'
    +'<button type="button" onclick="fcDeleteSel()" style="padding:6px 14px;background:#fff;border:1.5px solid #fca5a5;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;color:#dc2626;">🗑 Xóa</button>'
    +'<button type="button" onclick="fcClear()" style="padding:6px 14px;background:#fff;border:1.5px solid #e5e7eb;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;color:#888;">↺ Xóa tất cả</button>'
    +'<span style="font-size:11px;color:#aaa;padding-top:6px;">Kéo nút để di chuyển • Click nút để chọn • Nhấn Nối để kéo mũi tên</span>'
    +'</div>'
    +'<div id="fc-canvas-wrap" style="border:2px solid var(--border);border-radius:12px;background:#f0f4f8;overflow:hidden;position:relative;height:580px;cursor:default;resize:vertical;"></div>'
    +'<div id="fc-edit-panel" style="margin-top:10px;display:none;background:var(--green-pale);border-radius:10px;padding:12px;display:flex;gap:8px;align-items:center;flex-wrap:wrap;">'
    +'<input id="fc-label-inp" type="text" placeholder="Nhập nội dung..." style="flex:1;min-width:120px;padding:8px 12px;border:1.5px solid var(--border);border-radius:8px;font-size:12px;outline:none;" onfocus="this.style.borderColor=\'var(--green)\'" onblur="this.style.borderColor=\'var(--border)\'"/>'
    +'<button type="button" onclick="fcApplyLabel()" style="padding:8px 14px;background:var(--green);color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;">✓ Cập nhật</button>'
    +'</div>'
    +'<div style="display:flex;gap:10px;margin-top:12px;">'
    +'<button type="button" onclick="fcSaveAndClose()" style="flex:1;padding:12px;background:var(--green);color:#fff;border:none;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer;">💾 Lưu sơ đồ</button>'
    +'<button type="button" onclick="closeContentEdit()" style="padding:12px 18px;background:#f5f5f5;color:#888;border:none;border-radius:12px;font-size:13px;cursor:pointer;">Hủy</button>'
    +'</div>';

  FC._activeColor = FC_COLORS[0];
  setTimeout(fcInitCanvas, 50);
}

var FC_canvas_initialized = false;
function fcInitCanvas(){
  var wrap = $('fc-canvas-wrap');
  if(!wrap) return;
  wrap.innerHTML = '';

  var svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('width','100%');
  svg.setAttribute('height','100%');
  svg.setAttribute('id','fc-svg');
  svg.style.cssText = 'position:absolute;inset:0;user-select:none;';

  // defs
  var defs = document.createElementNS('http://www.w3.org/2000/svg','defs');
  FC_COLORS.forEach(function(c){
    var m = document.createElementNS('http://www.w3.org/2000/svg','marker');
    m.setAttribute('id','m'+c.replace('#',''));
    m.setAttribute('markerWidth','10'); m.setAttribute('markerHeight','7');
    m.setAttribute('refX','9'); m.setAttribute('refY','3.5');
    m.setAttribute('orient','auto');
    var p = document.createElementNS('http://www.w3.org/2000/svg','polygon');
    p.setAttribute('points','0 0, 10 3.5, 0 7');
    p.setAttribute('fill',c);
    m.appendChild(p); defs.appendChild(m);
  });
  svg.appendChild(defs);
  wrap.appendChild(svg);
  FC.svgEl = svg;
  fcDrawCanvas();
  fcBindCanvasEvents(svg, wrap);
}

function fcGetSVGPt(svg, clientX, clientY){
  var pt = svg.createSVGPoint();
  pt.x = clientX; pt.y = clientY;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
}

function fcBindCanvasEvents(svg, wrap){
  // mousedown on SVG
  svg.addEventListener('mousedown', function(e){
    if(e.button!==0) return;
    var pt = fcGetSVGPt(svg, e.clientX, e.clientY);
    var hit = fcHitNode(pt.x, pt.y);

    // Check if clicking a port dot
    var portEl = e.target.closest ? e.target.closest('[data-port-node]') : null;
    if(!portEl && e.target.hasAttribute && e.target.hasAttribute('data-port-node')) portEl = e.target;

    if(FC.connecting){
      // Picking FROM port (first click sets source port)
      if(portEl){
        var pNode = portEl.getAttribute('data-port-node');
        var pDir  = portEl.getAttribute('data-port-dir');
        if(pNode === FC.connecting){
          // User clicked a port on the source node → set fromPort and wait for target
          FC.connectPort = pDir;
          $('fc-connect-btn').textContent = '🔗 Chọn cổng đích...';
          fcDrawCanvas();
          return;
        } else {
          // User clicked a port on a different node → this is the target
          var label = prompt('Nhãn mũi tên (để trống nếu không cần):', '') || '';
          FC.edges.push({
            id:fcUid(), from:FC.connecting, to:pNode,
            fromPort: FC.connectPort || null,
            toPort: pDir,
            label:label, color:FC._activeColor||'#374151'
          });
          FC.connecting = null; FC.connectPort = null;
          var btn = $('fc-connect-btn');
          if(btn){ btn.style.background='#f5f5f5'; btn.style.color='#333'; btn.textContent='🔗 Nối mũi tên'; }
          fcDrawCanvas(); fcSave();
          return;
        }
      }
      // Clicked body of a different node (auto port)
      if(hit && hit.id !== FC.connecting){
        var label = prompt('Nhãn mũi tên (để trống nếu không cần):', '') || '';
        FC.edges.push({
          id:fcUid(), from:FC.connecting, to:hit.id,
          fromPort: FC.connectPort || null, toPort: null,
          label:label, color:FC._activeColor||'#374151'
        });
        FC.connecting = null; FC.connectPort = null;
        var btn = $('fc-connect-btn');
        if(btn){ btn.style.background='#f5f5f5'; btn.style.color='#333'; btn.textContent='🔗 Nối mũi tên'; }
        fcDrawCanvas(); fcSave();
      } else if(!hit){
        // Clicked empty space = cancel
        FC.connecting = null; FC.connectPort = null;
        var btn = $('fc-connect-btn');
        if(btn){ btn.style.background='#f5f5f5'; btn.style.color='#333'; btn.textContent='🔗 Nối mũi tên'; }
        fcDrawCanvas();
      }
      return;
    }

    if(hit){
      FC.sel = hit.id; FC.selEdge = null;
      FC.dragging = hit.id;
      FC.dragOff = {x: pt.x - hit.x, y: pt.y - hit.y};
      var ep = $('fc-edit-panel');
      if(ep){ ep.style.display='flex'; $('fc-label-inp').value = hit.label; }
    } else {
      FC.sel = null; FC.selEdge = null;
      var ep = $('fc-edit-panel');
      if(ep) ep.style.display='none';
    }
    fcDrawCanvas();
    e.preventDefault();
  });

  svg.addEventListener('mousemove', function(e){
    if(!FC.dragging && !FC.draggingEdge) return;
    var pt = fcGetSVGPt(svg, e.clientX, e.clientY);
    if(FC.draggingEdge){
      var ed=FC.edges.find(function(x){return x.id===FC.draggingEdge;});
      if(ed){ ed.bendX=pt.x-FC.edgeDragOff.x; ed.bendY=pt.y-FC.edgeDragOff.y; fcDrawCanvas(); }
    } else {
      var n = FC.nodes.find(function(x){return x.id===FC.dragging;});
      if(n){ n.x = pt.x - FC.dragOff.x; n.y = pt.y - FC.dragOff.y; fcDrawCanvas(); }
    }
    e.preventDefault();
  });

  svg.addEventListener('mouseup', function(e){
    if(FC.dragging){ FC.dragging=null; fcSave(); }
    if(FC.draggingEdge){ FC.draggingEdge=null; fcSave(); }
  });

  // touch support
  svg.addEventListener('touchstart', function(e){
    var t=e.touches[0];
    var pt=fcGetSVGPt(svg,t.clientX,t.clientY);
    var hit=fcHitNode(pt.x,pt.y);
    if(hit){ FC.sel=hit.id; FC.dragging=hit.id; FC.dragOff={x:pt.x-hit.x,y:pt.y-hit.y}; fcDrawCanvas(); }
    e.preventDefault();
  },{passive:false});
  svg.addEventListener('touchmove', function(e){
    if(!FC.dragging) return;
    var t=e.touches[0];
    var pt=fcGetSVGPt(svg,t.clientX,t.clientY);
    var n=FC.nodes.find(function(x){return x.id===FC.dragging;});
    if(n){n.x=pt.x-FC.dragOff.x;n.y=pt.y-FC.dragOff.y;fcDrawCanvas();}
    e.preventDefault();
  },{passive:false});
  svg.addEventListener('touchend', function(){if(FC.dragging){FC.dragging=null;fcSave();}});
}

function fcHitNode(x,y){
  for(var i=FC.nodes.length-1;i>=0;i--){
    var n=FC.nodes[i],w=fcNodeW(n),h=fcNodeH(n);
    if(x>=n.x&&x<=n.x+w&&y>=n.y&&y<=n.y+h) return n;
  }
  return null;
}

function fcDrawCanvas(){
  var svg=FC.svgEl; if(!svg) return;
  // remove old dynamic elements
  var old=svg.querySelectorAll('[data-fc]');
  old.forEach(function(el){el.remove();});

  var ns='http://www.w3.org/2000/svg';

  // background grid
  var bg=document.createElementNS(ns,'rect');
  bg.setAttribute('x','-5000');bg.setAttribute('y','-5000');
  bg.setAttribute('width','10000');bg.setAttribute('height','10000');
  bg.setAttribute('fill','#f0f4f8');bg.setAttribute('data-fc','1');
  svg.insertBefore(bg,svg.firstChild.nextSibling||null);

  // edges
  FC.edges.forEach(function(e){
    var from=FC.nodes.find(function(n){return n.id===e.from;});
    var to=FC.nodes.find(function(n){return n.id===e.to;});
    if(!from||!to) return;

    var p=fcEdgePoints(from,to,e.fromPort||null,e.toPort||null);
    var c=e.color||'#374151';
    var isSel=(e.id===FC.selEdge);

    // Bend control point
    var bx=(e.bendX!==undefined)?e.bendX:(p.sx+p.ex)/2;
    var by=(e.bendY!==undefined)?e.bendY:(p.sy+p.ey)/2;

    // Path string
    var mid2;
    if(p.fromPort==='top'||p.fromPort==='bottom')
      mid2='M'+p.sx+','+p.sy+' C'+p.sx+','+by+' '+p.ex+','+by+' '+p.ex+','+p.ey;
    else
      mid2='M'+p.sx+','+p.sy+' C'+bx+','+p.sy+' '+bx+','+p.ey+' '+p.ex+','+p.ey;

    // 1) Fat invisible hit area (easy to click)
    var hit=document.createElementNS(ns,'path');
    hit.setAttribute('d',mid2);
    hit.setAttribute('fill','none');
    hit.setAttribute('stroke','rgba(0,0,0,0)');
    hit.setAttribute('stroke-width','18');
    hit.setAttribute('data-fc','1');
    hit.style.cursor='pointer';
    (function(eid){
      hit.addEventListener('mousedown',function(ev){
        if(FC.connecting) return;
        ev.stopPropagation();
        FC.selEdge=eid; FC.sel=null; FC.draggingEdge=null;
        // start dragging bend immediately
        FC.draggingEdge=eid;
        var pt2=fcGetSVGPt(FC.svgEl,ev.clientX,ev.clientY);
        var ed=FC.edges.find(function(x){return x.id===eid;});
        if(ed){
          var cbx=(ed.bendX!==undefined)?ed.bendX:(p.sx+p.ex)/2;
          var cby=(ed.bendY!==undefined)?ed.bendY:(p.sy+p.ey)/2;
          FC.edgeDragOff={x:pt2.x-cbx, y:pt2.y-cby};
        }
        var ep=$('fc-edit-panel');
        if(ep){
          ep.style.display='flex';
          var li=$('fc-label-inp');
          var ed2=FC.edges.find(function(x){return x.id===eid;});
          if(li&&ed2) li.value=ed2.label||'';
        }
        fcDrawCanvas();
        ev.preventDefault();
      });
    })(e.id);
    svg.appendChild(hit);

    // 2) Visible path
    var path=document.createElementNS(ns,'path');
    path.setAttribute('d',mid2);
    path.setAttribute('fill','none');
    path.setAttribute('stroke',isSel?'#f59e0b':c);
    path.setAttribute('stroke-width',isSel?'3':'2');
    path.setAttribute('stroke-dasharray',isSel?'6,3':'none');
    path.setAttribute('marker-end','url(#m'+c.replace('#','')+')');
    path.setAttribute('data-fc','1');
    svg.appendChild(path);

    // 3) Midpoint drag handle (always visible, bigger when selected)
    var handle=document.createElementNS(ns,'circle');
    handle.setAttribute('cx',bx); handle.setAttribute('cy',by);
    handle.setAttribute('r',isSel?'8':'5');
    handle.setAttribute('fill',isSel?'#f59e0b':'rgba(255,255,255,0.7)');
    handle.setAttribute('stroke',isSel?'#fff':c);
    handle.setAttribute('stroke-width','2');
    handle.setAttribute('data-fc','1');
    handle.style.cursor='grab';
    (function(eid){
      handle.addEventListener('mousedown',function(ev){
        ev.stopPropagation();
        FC.selEdge=eid; FC.sel=null; FC.draggingEdge=eid;
        var pt2=fcGetSVGPt(FC.svgEl,ev.clientX,ev.clientY);
        var ed=FC.edges.find(function(x){return x.id===eid;});
        if(ed){
          var cbx=(ed.bendX!==undefined)?ed.bendX:(p.sx+p.ex)/2;
          var cby=(ed.bendY!==undefined)?ed.bendY:(p.sy+p.ey)/2;
          FC.edgeDragOff={x:pt2.x-cbx,y:pt2.y-cby};
        }
        fcDrawCanvas();
        ev.preventDefault();
      });
    })(e.id);
    svg.appendChild(handle);

    // 4) Delete button (only when selected)
    if(isSel){
      var delG=document.createElementNS(ns,'g');
      delG.setAttribute('data-fc','1');
      delG.style.cursor='pointer';
      var delBg=document.createElementNS(ns,'circle');
      delBg.setAttribute('cx',bx+18); delBg.setAttribute('cy',by-18);
      delBg.setAttribute('r','11'); delBg.setAttribute('fill','#ef4444');
      delBg.setAttribute('stroke','#fff'); delBg.setAttribute('stroke-width','2');
      var delTxt=document.createElementNS(ns,'text');
      delTxt.setAttribute('x',bx+18); delTxt.setAttribute('y',by-14);
      delTxt.setAttribute('text-anchor','middle');
      delTxt.setAttribute('fill','#fff'); delTxt.setAttribute('font-size','14');
      delTxt.setAttribute('font-weight','900');
      delTxt.textContent='✕';
      delG.appendChild(delBg); delG.appendChild(delTxt);
      (function(eid){
        delG.addEventListener('mousedown',function(ev){
          ev.stopPropagation();
          FC.edges=FC.edges.filter(function(x){return x.id!==eid;});
          FC.selEdge=null; FC.draggingEdge=null;
          var ep=$('fc-edit-panel');
          if(ep) ep.style.display='none';
          fcSave(); fcDrawCanvas();
        });
      })(e.id);
      svg.appendChild(delG);
    }

    // 5) Label
    if(e.label){
      var lx=bx, ly=by-14;
      var lbg=document.createElementNS(ns,'rect');
      lbg.setAttribute('x',lx-26); lbg.setAttribute('y',ly-9);
      lbg.setAttribute('width','52'); lbg.setAttribute('height','17');
      lbg.setAttribute('rx','5'); lbg.setAttribute('fill','rgba(255,255,255,.95)');
      lbg.setAttribute('stroke',c); lbg.setAttribute('stroke-width','1');
      lbg.setAttribute('data-fc','1');
      svg.appendChild(lbg);
      var lb=document.createElementNS(ns,'text');
      lb.setAttribute('x',lx); lb.setAttribute('y',ly+3);
      lb.setAttribute('text-anchor','middle'); lb.setAttribute('font-size','9.5');
      lb.setAttribute('font-weight','700'); lb.setAttribute('fill',c);
      lb.setAttribute('font-family','Open Sans,sans-serif');
      lb.setAttribute('data-fc','1');
      lb.textContent=e.label;
      svg.appendChild(lb);
    }
  });

  // nodes
  FC.nodes.forEach(function(n){
    var w=fcNodeW(n),h=fcNodeH(n),cx=n.x+w/2,cy=n.y+h/2;
    var c=n.color||'#1d4ed8';
    var isSel=n.id===FC.sel;
    var g=document.createElementNS(ns,'g');
    g.setAttribute('data-fc','1');
    g.style.cursor='move';

    // shadow
    if(isSel){
      var sh=document.createElementNS(ns,'rect');
      sh.setAttribute('x',n.x-3);sh.setAttribute('y',n.y-3);
      sh.setAttribute('width',w+6);sh.setAttribute('height',h+6);
      sh.setAttribute('rx','8');sh.setAttribute('fill','rgba(255,200,0,.4)');
      g.appendChild(sh);
    }

    // Use shared renderer — insert via innerHTML trick on a temp container
    var tmpDiv=document.createElementNS(ns,'g');
    tmpDiv.innerHTML = fcNodeSVGString(n, isSel);
    while(tmpDiv.firstChild) g.appendChild(tmpDiv.firstChild);

    // Port dots — show when in connecting mode OR node selected
    var showPorts = isSel || FC.connecting;
    if(showPorts){
      var ports = fcGetPorts(n);
      ports.forEach(function(pt){
        var isConnecting = !!FC.connecting;
        var portDot = document.createElementNS(ns,'circle');
        portDot.setAttribute('cx', pt.x);
        portDot.setAttribute('cy', pt.y);
        portDot.setAttribute('r', isConnecting ? '7' : '5');
        portDot.setAttribute('fill', isConnecting ? (n.id===FC.connecting?'#fbbf24':'#22c55e') : '#fbbf24');
        portDot.setAttribute('stroke','#fff');
        portDot.setAttribute('stroke-width','1.5');
        portDot.style.cursor = 'crosshair';
        portDot.setAttribute('data-fc','1');
        portDot.setAttribute('data-port-node', n.id);
        portDot.setAttribute('data-port-dir', pt.port);
        g.appendChild(portDot);
      });
    }

    svg.appendChild(g);
  });
}

function fcAddNode(shape){
  var wrap=$('fc-canvas-wrap');
  var W=wrap?wrap.offsetWidth:400, H=wrap?wrap.offsetHeight:460;
  // Random position avoiding overlap
  var x=60+Math.random()*(W-200), y=60+Math.random()*(H-150);
  FC.nodes.push({id:fcUid(),label:'Nút mới',shape:shape||'rect',color:FC._activeColor||'#1d4ed8',x:x,y:y});
  fcDrawCanvas();
}

function fcSetColor(c){
  FC._activeColor=c;
  document.querySelectorAll('[data-fc-color]').forEach(function(el){
    el.style.border=el.dataset.fcColor===c?'2px solid #111':'2px solid transparent';
  });
  var prev=$('fc-color-preview');
  if(prev) prev.style.background=c;
  if(FC.sel){
    var n=FC.nodes.find(function(x){return x.id===FC.sel;});
    if(n){ n.color=c; fcSave(); fcDrawCanvas(); }
  }
  if(FC.selEdge){
    var ed=FC.edges.find(function(x){return x.id===FC.selEdge;});
    if(ed){ ed.color=c; fcSave(); fcDrawCanvas(); }
  }
}

function fcSetTextColor(tc){
  document.querySelectorAll('[data-fc-tcolor]').forEach(function(el){
    el.style.border=el.dataset.fcTcolor===tc?'2px solid #111':'2px solid #aaa';
  });
  if(FC.sel){
    var n=FC.nodes.find(function(x){return x.id===FC.sel;});
    if(n){ n.textColor=tc; fcSave(); fcDrawCanvas(); }
  }
}

function fcStartConnect(){
  if(!FC.sel){ alert('Hãy chọn (click) nút nguồn trước!'); return; }
  FC.connecting=FC.sel; FC.connectPort=null;
  var btn=$('fc-connect-btn');
  btn.style.background='var(--green)'; btn.style.color='#fff';
  btn.textContent='🔗 Click cổng xanh để chọn hướng xuất phát...';
  fcDrawCanvas();
}

function fcApplyLabel(){
  var inp=$('fc-label-inp');
  if(!inp) return;
  if(FC.sel){
    var n=FC.nodes.find(function(x){return x.id===FC.sel;});
    if(n){ n.label=inp.value||'?'; fcSave(); fcDrawCanvas(); }
  } else if(FC.selEdge){
    var ed=FC.edges.find(function(x){return x.id===FC.selEdge;});
    if(ed){ ed.label=inp.value; fcSave(); fcDrawCanvas(); }
  }
}

function fcDeleteSel(){
  if(FC.selEdge){
    FC.edges=FC.edges.filter(function(e){return e.id!==FC.selEdge;});
    FC.selEdge=null; FC.draggingEdge=null;
  } else if(FC.sel){
    FC.nodes=FC.nodes.filter(function(n){return n.id!==FC.sel;});
    FC.edges=FC.edges.filter(function(e){return e.from!==FC.sel&&e.to!==FC.sel;});
    FC.sel=null;
  }
  var ep=$('fc-edit-panel');
  if(ep) ep.style.display='none';
  fcSave(); fcDrawCanvas();
}

function fcClear(){
  if(!confirm('Xóa toàn bộ sơ đồ?')) return;
  FC.nodes=[]; FC.edges=[]; FC.sel=null; fcDrawCanvas();
}

function fcSaveAndClose(){
  fcSave();
  closeContentEdit();
  // Small delay to ensure modal is closed before rendering
  setTimeout(function(){ fcLoad(); fcRender(); }, 50);
  showToast('✅ Đã lưu!','Sơ đồ đã được cập nhật');
}

function renderTrainingDiagram(steps){ fcRender(); }

// ── Open FC editor for CM or Rank diagram ──
var _fcActiveTarget = 'training'; // which diagram is being edited

function fcOpenEditorFor(target){
  // target: 'training' | 'cm' | 'rank'
  _fcActiveTarget = target;

  var storageKeys = {
    training: branchKey('zentea-flowchart'),
    cm:       branchKey('zentea-flowchart-cm'),
    rank:     branchKey('zentea-flowchart-rank')
  };
  var titles = {
    training: '🗂 Sơ Đồ Quy Trình Đào Tạo',
    cm:       '🗂 Sơ Đồ Đào Tạo Chuyên Môn',
    rank:     '🗂 Sơ Đồ Quy Trình Xét Bậc'
  };
  var diagramIds = {
    training: 'training-diagram',
    cm:       'cm-diagram',
    rank:     'rank-diagram'
  };

  // Load data for this target
  FC.nodes = []; FC.edges = [];
  try {
    var raw = localStorage.getItem(storageKeys[target]);
    if(raw){ var d=JSON.parse(raw); FC.nodes=d.nodes||[]; FC.edges=d.edges||[]; }
  } catch(e){}

  // Override fcSave to save to correct key
  window._fcSaveKey = storageKeys[target];
  window._fcRenderTarget = diagramIds[target];

  // Open the editor modal (reuse fcOpenEditor logic)
  _ceSection = 'training';
  var titleEl = $('ce-modal-title');
  if(titleEl) titleEl.textContent = titles[target];
  var modal = $('content-edit-modal');
  if(modal) modal.style.display='flex';

  // Reuse fcOpenEditor and override title
  fcOpenEditor();
  setTimeout(function(){
    var t2 = $('ce-modal-title');
    if(t2) t2.textContent = titles[target];
  }, 10);
}

// Patch fcSave to respect active target
var _origFcSave = fcSave;
fcSave = function(){
  var key = window._fcSaveKey || branchKey('zentea-flowchart');
  try { localStorage.setItem(key, JSON.stringify({nodes:FC.nodes,edges:FC.edges})); } catch(e){}
};

// Patch fcRender to render in correct container
var _origFcRender = fcRender;
fcRender = function(){
  var targetId = window._fcRenderTarget || 'training-diagram';
  var el = $(targetId);
  if(!el){ _origFcRender(); return; }

  // Temporarily swap the training-diagram reference
  var origEl = $('training-diagram');
  // We need to render into correct el
  if(!FC.nodes.length){
    // Show static SVG based on target
    if(targetId==='cm-diagram' && typeof STATIC_FC2!=='undefined'){
      el.innerHTML='<div style="min-width:640px;">'+STATIC_FC2+'</div>';
    } else if(targetId==='rank-diagram' && typeof STATIC_FC3!=='undefined'){
      el.innerHTML='<div style="min-width:640px;">'+STATIC_FC3+'</div>';
    } else if(typeof STATIC_FC1!=='undefined'){
      el.innerHTML='<div style="min-width:640px;">'+STATIC_FC1+'</div>';
    } else {
      el.innerHTML='<div style="text-align:center;padding:40px;color:#aaa;font-size:13px;">Nhấn ✏️ Chỉnh sửa để thiết kế sơ đồ</div>';
    }
    return;
  }

  // Render SVG into the correct element (copy logic from original fcRender)
  var minX=Infinity,minY=Infinity,maxX=0,maxY=0;
  FC.nodes.forEach(function(n){
    minX=Math.min(minX,n.x);minY=Math.min(minY,n.y);
    maxX=Math.max(maxX,n.x+fcNodeW(n));maxY=Math.max(maxY,n.y+fcNodeH(n));
  });
  var pad=40,vw=maxX-minX+pad*2,vh=maxY-minY+pad*2,ox=minX-pad,oy=minY-pad;
  var svgW=Math.max(700,vw),svgH=Math.max(400,vh);
  var svg='<svg viewBox="'+ox+' '+oy+' '+vw+' '+vh+'" width="'+svgW+'" height="'+svgH+'" style="display:block;" xmlns="http://www.w3.org/2000/svg">';
  svg+='<defs>';
  var usedColors={};
  FC.edges.forEach(function(e){usedColors[e.color||'#374151']=1;});
  Object.keys(usedColors).forEach(function(c){
    var id='arr'+c.replace('#','');
    svg+='<marker id="'+id+'" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0,10 3.5,0 7" fill="'+c+'"/></marker>';
  });
  svg+='</defs>';
  svg+='<rect x="'+ox+'" y="'+oy+'" width="'+vw+'" height="'+vh+'" fill="#f8fafc"/>';
  FC.edges.forEach(function(e){
    var from=FC.nodes.find(function(n){return n.id===e.from;});
    var to=FC.nodes.find(function(n){return n.id===e.to;});
    if(!from||!to)return;
    var p=fcEdgePoints(from,to,e.fromPort||null,e.toPort||null);
    var c=e.color||'#374151';
    var bx=(e.bendX!==undefined)?e.bendX:(p.sx+p.ex)/2;
    var by=(e.bendY!==undefined)?e.bendY:(p.sy+p.ey)/2;
    var mid;
    if(p.fromPort==='top'||p.fromPort==='bottom')
      mid='M'+p.sx+','+p.sy+' C'+p.sx+','+by+' '+p.ex+','+by+' '+p.ex+','+p.ey;
    else
      mid='M'+p.sx+','+p.sy+' C'+bx+','+p.sy+' '+bx+','+p.ey+' '+p.ex+','+p.ey;
    svg+='<path d="'+mid+'" fill="none" stroke="'+c+'" stroke-width="2" marker-end="url(#arr'+c.replace('#','')+')"/>';
    if(e.label){
      var lx=bx,ly=by-12;
      svg+='<rect x="'+(lx-26)+'" y="'+(ly-9)+'" width="52" height="17" rx="5" fill="rgba(255,255,255,.92)" stroke="'+c+'" stroke-width="1"/>';
      svg+='<text x="'+lx+'" y="'+(ly+3)+'" text-anchor="middle" font-size="9.5" font-weight="700" fill="'+c+'" font-family="Open Sans,sans-serif">'+e.label+'</text>';
    }
  });
  FC.nodes.forEach(function(n){ svg+='<g>'+fcNodeSVGString(n,false)+'</g>'; });
  svg+='</svg>';
  el.style.overflow='auto';
  el.innerHTML='<div style="min-width:'+Math.max(600,vw)+'px;min-height:'+Math.max(300,vh)+'px;">'+svg+'</div>';
};


// ── Default salary data ──
var DEFAULT_SALARY_MAIN = [
  ['Lương cơ bản/giờ','20.000đ','21.000đ','22.000đ','22.000đ','22.000đ'],
  ['Thưởng năng lực/giờ','6.000đ','6.000đ','6.000đ','8.000đ','10.000đ'],
  ['Pha chế chính (LCB)','+1.000đ','–','–','–','–'],
  ['Thưởng nội quy/giờ','1.500đ / tổng giờ làm','','','',''],
  ['Thưởng chuyên cần/giờ','1.000đ / tổng giờ đăng ký','','','',''],
  ['Phụ cấp ăn uống','30.000đ / 08 giờ','','','','']
];
var DEFAULT_SALARY_POS = [
  ['Thu ngân','2.000đ / giờ vị trí thu ngân'],
  ['Bán bánh','1.500đ / giờ vị trí bán bánh'],
  ['Kiểm kho ca sáng','3.000đ / giờ'],
  ['Kiểm kho ca tối','2.000đ / giờ'],
  ['Giao hàng','Dưới 3km: 15.000đ | Trên 3km: +4.000đ/km'],
  ['Đào tạo','30.000đ / ca']
];

function salaryGetTableData(tbodyId){
  var rows = [];
  var tbody = $(tbodyId);
  if(!tbody) return rows;
  tbody.querySelectorAll('tr').forEach(function(tr){
    var cells = tr.querySelectorAll('td[contenteditable]');
    var row = [];
    cells.forEach(function(td){ row.push(td.innerText.trim()); });
    if(row.length) rows.push(row);
  });
  return rows;
}

function salaryAddRow(tbodyId, cols){
  var tbody = $(tbodyId);
  if(!tbody) return;
  var tr = document.createElement('tr');
  var cells = '';
  for(var i=0;i<cols;i++){
    cells += '<td contenteditable="true" style="'+_salaryTdStyle(i,cols)+'"></td>';
  }
  cells += '<td style="text-align:center;padding:4px;width:32px;">'
    +'<button type="button" onclick="this.closest(\'tr\').remove()" style="background:#fff0f0;border:1px solid #fca5a5;color:#dc2626;border-radius:6px;width:24px;height:24px;cursor:pointer;font-size:13px;line-height:1;">×</button>'
    +'</td>';
  tr.innerHTML = cells;
  tbody.appendChild(tr);
  // focus first cell
  tr.querySelector('td[contenteditable]').focus();
}

function _salaryTdStyle(i, total){
  var base = 'padding:7px 10px;border:1px solid #e2f0db;font-size:12px;font-family:Open Sans,sans-serif;outline:none;min-width:70px;';
  if(i===0) return base+'font-weight:600;background:#f9fef7;min-width:150px;';
  return base+'background:#fff;text-align:center;';
}

function salaryRenderEditTable(tbodyId, data, cols, addLabel){
  var html = '<tbody id="'+tbodyId+'">';
  data.forEach(function(row){
    html += '<tr>';
    for(var i=0;i<cols;i++){
      html += '<td contenteditable="true" style="'+_salaryTdStyle(i,cols)+'">'+(row[i]||'')+'</td>';
    }
    html += '<td style="text-align:center;padding:4px;width:32px;"><button type="button" onclick="this.closest(\'tr\').remove()" style="background:#fff0f0;border:1px solid #fca5a5;color:#dc2626;border-radius:6px;width:24px;height:24px;cursor:pointer;font-size:13px;line-height:1;">×</button></td>';
    html += '</tr>';
  });
  html += '</tbody>';
  return html;
}

function openContentEdit(section) {
  var cfg = CONTENT_EDIT_CONFIG[section];
  if (!cfg) return;
  _ceSection = section;
  var _cemt2=$('ce-modal-title'); if(_cemt2) _cemt2.textContent = cfg.title;
  var saved = {};
  try { var raw = localStorage.getItem(branchKey(cfg.storageKey)); if(raw) saved = JSON.parse(raw); } catch(e){}

  // ── Training: open flowchart editor ──
  if(section === 'training'){ fcOpenEditor(); return; }

  // ── Salary: inline editable table ──
  if(section === 'salary'){
    // Parse saved or use defaults
    var mainData = DEFAULT_SALARY_MAIN;
    var posData  = DEFAULT_SALARY_POS;
    if(saved && saved.salary_main_rows) mainData = saved.salary_main_rows;
    else if(saved && saved.salary_main){
      mainData = saved.salary_main.split('\n').filter(function(x){return x.trim();}).map(function(r){return r.split('|').map(function(c){return c.trim();});});
    }
    if(saved && saved.salary_pos_rows) posData = saved.salary_pos_rows;
    else if(saved && saved.salary_pos){
      posData = saved.salary_pos.split('\n').filter(function(x){return x.trim();}).map(function(r){return r.split('|').map(function(c){return c.trim();});});
    }

    var thStyle = 'padding:8px 10px;background:var(--green);color:#fff;font-size:11px;font-weight:700;letter-spacing:.4px;text-align:center;white-space:nowrap;';
    var th0Style = 'padding:8px 10px;background:var(--green);color:#fff;font-size:11px;font-weight:700;letter-spacing:.4px;text-align:left;';
    var wrapStyle = 'overflow-x:auto;border-radius:12px;border:1.5px solid var(--border);margin-bottom:6px;';
    var tableStyle = 'width:100%;border-collapse:collapse;min-width:500px;';
    var addBtnStyle = 'margin-bottom:20px;padding:6px 14px;background:var(--green-pale);color:var(--green);border:1.5px solid var(--green);border-radius:20px;font-size:12px;font-weight:700;cursor:pointer;font-family:Open Sans,sans-serif;';

    var html = '<div style="display:flex;flex-direction:column;gap:4px;">';

    // --- Table 1: Bảng lương ---
    html += '<div style="font-size:11px;font-weight:700;color:var(--green);letter-spacing:.5px;margin-bottom:6px;">💰 BẢNG LƯƠNG THEO BẬC</div>';
    html += '<div style="'+wrapStyle+'"><table style="'+tableStyle+'">';
    html += '<thead><tr>'
      +'<th style="'+th0Style+'">Thành phần lương</th>'
      +'<th style="'+thStyle+'">Bậc C</th>'
      +'<th style="'+thStyle+'">Bậc B</th>'
      +'<th style="'+thStyle+'">Bậc A</th>'
      +'<th style="'+thStyle+'">A1</th>'
      +'<th style="'+thStyle+'">A2</th>'
      +'<th style="'+thStyle+';background:#b91c1c;width:32px;"></th>'
      +'</tr></thead>';
    html += salaryRenderEditTable('se-tbody-main', mainData, 6, '');
    html += '</table></div>';
    html += '<button type="button" onclick="salaryAddRow(\'se-tbody-main\',6)" style="'+addBtnStyle+'">+ Thêm dòng</button>';

    // --- Table 2: Phụ cấp vị trí ---
    html += '<div style="font-size:11px;font-weight:700;color:var(--green);letter-spacing:.5px;margin-bottom:6px;">📍 PHỤ CẤP VỊ TRÍ</div>';
    html += '<div style="'+wrapStyle+'"><table style="'+tableStyle+';min-width:300px;">';
    html += '<thead><tr>'
      +'<th style="'+th0Style+'">Vị trí</th>'
      +'<th style="'+thStyle+'">Phụ cấp</th>'
      +'<th style="'+thStyle+';background:#b91c1c;width:32px;"></th>'
      +'</tr></thead>';
    html += salaryRenderEditTable('se-tbody-pos', posData, 2, '');
    html += '</table></div>';
    html += '<button type="button" onclick="salaryAddRow(\'se-tbody-pos\',2)" style="'+addBtnStyle+'">+ Thêm dòng</button>';

    html += '</div>'; // end flex column

    html += '<div style="display:flex;gap:10px;margin-top:4px;">'
      +'<button type="button" onclick="saveContentEdit()" style="flex:1;padding:12px;background:var(--green);color:#fff;border:none;border-radius:12px;font-family:Open Sans,sans-serif;font-size:14px;font-weight:700;cursor:pointer;">💾 Lưu thay đổi</button>'
      +'<button type="button" onclick="resetContentEdit()" style="padding:12px 18px;background:#fff;color:#e53e3e;border:2px solid #fed7d7;border-radius:12px;font-size:13px;font-weight:600;cursor:pointer;">↺ Reset</button>'
      +'</div>';

    $('ce-modal-body').innerHTML = html;
    var _cem2=$('content-edit-modal'); if(_cem2) _cem2.style.display = 'flex';
    return;
  }

  // ── Other sections: textarea fields ──
  var html = '<div style="display:flex;flex-direction:column;gap:16px;">';
  cfg.fields.forEach(function(f){
    var val = (saved[f.id]||'').replace(/</g,'&lt;');
    html += '<div>'
      + '<label style="font-size:11px;font-weight:700;color:var(--green);letter-spacing:.5px;display:block;margin-bottom:6px;">' + f.label.toUpperCase() + '</label>'
      + '<textarea id="ce-field-'+f.id+'" rows="8" style="width:100%;padding:10px 14px;border:2px solid var(--border);border-radius:10px;font-family:Open Sans,sans-serif;font-size:12px;outline:none;resize:vertical;line-height:1.7;box-sizing:border-box;" placeholder="'+f.placeholder+'" onfocus="this.style.borderColor=\'var(--green)\'" onblur="this.style.borderColor=\'var(--border)\'">'+val+'</textarea>'
      + '</div>';
  });
  html += '</div>'
    + '<div style="display:flex;gap:10px;margin-top:20px;">'
    + '<button type="button" onclick="saveContentEdit()" style="flex:1;padding:12px;background:var(--green);color:#fff;border:none;border-radius:12px;font-family:Open Sans,sans-serif;font-size:14px;font-weight:700;cursor:pointer;">💾 Lưu thay đổi</button>'
    + '<button type="button" onclick="resetContentEdit()" style="padding:12px 18px;background:#fff;color:#e53e3e;border:2px solid #fed7d7;border-radius:12px;font-size:13px;font-weight:600;cursor:pointer;">↺ Reset</button>'
    + '</div>';
  $('ce-modal-body').innerHTML = html;
  var _cem2=$('content-edit-modal'); if(_cem2) _cem2.style.display = 'flex';
} // end openContentEdit

function closeContentEdit(){
  var _cem3=$('content-edit-modal'); if(_cem3) _cem3.style.display = 'none';
  _ceSection = null;
}

function saveContentEdit(){
  var cfg = CONTENT_EDIT_CONFIG[_ceSection];
  if(!cfg) return;
  var data = {};
  if(_ceSection === 'training'){
    data.steps = trainingGetSteps();
    data.stepsParsed = trainingGetStepsParsed();
  } else if(_ceSection === 'salary'){
    data.salary_main_rows = salaryGetTableData('se-tbody-main');
    data.salary_pos_rows  = salaryGetTableData('se-tbody-pos');
    // Also store legacy pipe format for backward compat
    data.salary_main = data.salary_main_rows.map(function(r){return r.join(' | ');}).join('\n');
    data.salary_pos  = data.salary_pos_rows.map(function(r){return r.join(' | ');}).join('\n');
  } else {
    cfg.fields.forEach(function(f){
      var el = $('ce-field-'+f.id);
      if(el) data[f.id] = el.value.trim();
    });
  }
  try { localStorage.setItem(branchKey(cfg.storageKey), JSON.stringify(data)); } catch(e){}
  var sec = _ceSection;
  closeContentEdit();
  showToast('✅ Đã lưu!', 'Nội dung đã được cập nhật');
  applyContentEdit(sec);
}

function resetContentEdit(){
  if(!confirm('Khôi phục nội dung gốc? Mọi chỉnh sửa sẽ bị mất.')) return;
  var cfg = CONTENT_EDIT_CONFIG[_ceSection];
  if(!cfg) return;
  try { localStorage.removeItem(branchKey(cfg.storageKey)); } catch(e){}
  var sec = _ceSection;
  closeContentEdit();
  showToast('↺ Đã reset', 'Nội dung đã khôi phục về mặc định');
  applyContentEdit(sec);
}

function applyContentEdit(section){
  var cfg = CONTENT_EDIT_CONFIG[section];
  if(!cfg) return;
  var saved = null;
  try { var raw = localStorage.getItem(branchKey(cfg.storageKey)); if(raw) saved = JSON.parse(raw); } catch(e){}

  if(section === 'checklist' && saved && saved.daily){
    var lines = saved.daily.split('\n').filter(function(x){ return x.trim(); });
    var el = $('daily-list');
    if(el){
      el.innerHTML = lines.map(function(item,i){
        return '<div class="checklist-item" onclick="this.classList.toggle(\'done\')">'
          + '<div class="check-box"><span class="check-icon">✓</span></div>'
          + '<span class="check-text">'+item+'</span></div>';
      }).join('');
    }
    return;
  }

  if(section === 'salary' && saved){
    // Support both new rows format and legacy pipe format
    var mainRows = saved.salary_main_rows || null;
    if(!mainRows && saved.salary_main){
      mainRows = saved.salary_main.split('\n').filter(function(x){return x.trim();}).map(function(r){return r.split('|').map(function(c){return c.trim();});});
    }
    var posRows = saved.salary_pos_rows || null;
    if(!posRows && saved.salary_pos){
      posRows = saved.salary_pos.split('\n').filter(function(x){return x.trim();}).map(function(r){return r.split('|').map(function(c){return c.trim();});});
    }
    if(mainRows){
      var tbody = document.querySelector('#salary tbody');
      if(tbody){
        tbody.innerHTML = mainRows.map(function(cols){
          if(!cols || !cols.length) return '';
          // If only 2 cells (merged style), use colspan
          if(cols.filter(function(c){return c;}).length <= 2 && cols[1]){
            return '<tr><td>'+cols[0]+'</td><td colspan="5">'+cols[1]+'</td></tr>';
          }
          return '<tr>' + cols.map(function(c,i){ return i===0?'<td>'+c+'</td>':'<td class="hl">'+c+'</td>'; }).join('') + '</tr>';
        }).join('');
      }
    }
    if(posRows){
      var tbodies = document.querySelectorAll('#salary tbody');
      if(tbodies[1]){
        tbodies[1].innerHTML = posRows.map(function(cols){
          return '<tr><td>'+(cols[0]||'')+'</td><td>'+(cols[1]||'')+'</td></tr>';
        }).join('');
      }
    }
    return;
  }

  if((section === 'training' || section === 'promotion') && saved && saved.steps){
    var rows3 = saved.steps.split('\n').filter(function(x){return x.trim();});
    var grid = document.querySelector('#'+section+' .training-grid');
    if(grid){
      grid.innerHTML = rows3.map(function(r,i){
        var parts = r.split('|');
        var title = (parts[0]||'').trim();
        var desc  = (parts[1]||'').trim();
        var color = (parts[3]||'var(--green)').trim();
        var num   = ('0'+(i+1)).slice(-2);
        return '<div class="step-card" style="border-top:4px solid '+color+';"><div class="step-num" style="color:'+color+'">'+num+'</div><div class="step-title">'+title+'</div><div class="step-desc">'+desc+'</div></div>';
      }).join('');
    }
    // Render SVG diagram for training
    if(section === 'training'){
      var diagramSteps = rows3.map(function(r){
        var p = r.split('|');
        return {title:(p[0]||'').trim(), desc:(p[1]||'').trim(), shape:(p[2]||'rect').trim(), color:(p[3]||'#2d7a2d').trim()};
      });
      renderTrainingDiagram(diagramSteps);
    }
    if(section === 'promotion' && saved.exam){
      var examRows = saved.exam.split('\n').filter(function(x){return x.trim();});
      var examTbody = document.querySelector('#promotion table:last-of-type tbody');
      if(examTbody){
        examTbody.innerHTML = examRows.map(function(r){
          var cols = r.split('|');
          return '<tr>'
            + '<td>'+(cols[0]||'').trim()+'</td>'
            + '<td>'+(cols[1]||'').trim()+'</td>'
            + '<td>'+(cols[2]||'').trim()+'</td>'
            + '<td>'+(cols[3]||'').trim()+'</td>'
            + '<td class="hl">'+(cols[4]||'').trim()+'</td>'
            + '</tr>';
        }).join('');
      }
    }
    return;
  }
}

// Apply saved edits on page load
function applyAllContentEdits(){
  ['checklist','salary','training','promotion'].forEach(function(s){ applyContentEdit(s); });
  // Load and render flowchart diagram
  if(fcLoad()){
    fcRender();
  }
}

document.addEventListener('DOMContentLoaded', function(){
  var cem = $('content-edit-modal');
  if(!cem) return;
  if(cem) cem.addEventListener('click', function(e){ if(e.target===this) closeContentEdit(); });
});

// SHARED UTILITIES FOR NEW DATA MODULES

var MONTHS_VI = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
                 'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];

// ── DỮ LIỆU GỐC TỪ EXCEL (Zentea 103 Phan Xích Long) ──────────────
var EXCEL_SEED = {
  hr_eval: {"2026-02":[{"name":"Trần Đức Duy","bac":"","nq":"","kn":"","gt":"","tn":"","td":"","pc":"6.0","diemtru":"0.1","note":"Điểm pha chế: 6 | Trừ: 0.1"}],"2026-03":[{"name":"Nguyễn Thành Đạt","bac":"","nq":"Chấp hành tốt nội quy, đi làm đúng giờ.","kn":"Kỹ năng đạt","gt":"Giao tiếp tốt, thân thiện với đồng nghiệp và niềm nở với khách hàng.","tn":"Đạt","td":"Đạt","pc":"","diemtru":"","note":""},{"name":"Sòng Thanh Thông","bac":"","nq":"Chấp hành tốt nội quy, đi làm chưa đúng giờ.","kn":"Kỹ năng đạt","gt":"Giao tiếp tốt, thân thiện với đồng nghiệp và niềm nở với khách hàng.","tn":"Đạt","td":"Đạt","pc":"","diemtru":"","note":""},{"name":"Khổng Nguyễn Ngọc Quyên","bac":"","nq":"Chấp hành tốt nội quy, đi làm chưa đúng giờ.","kn":"Kỹ năng đạt","gt":"Giao tiếp tốt, thân thiện với đồng nghiệp và niềm nở với khách hàng.","tn":"Đạt","td":"Đạt","pc":"","diemtru":"","note":""},{"name":"Nguyễn Thành An","bac":"","nq":"Chấp hành tốt nội quy, đi làm đúng giờ.","kn":"Kỹ năng đạt","gt":"Giao tiếp tốt, thân thiện với đồng nghiệp và niềm nở với khách hàng.","tn":"Đạt","td":"Đạt","pc":"","diemtru":"","note":""},{"name":"Huỳnh Thị Thu Cúc","bac":"","nq":"Chấp hành tốt nội quy, đi làm chưa đúng giờ.","kn":"Kỹ năng đạt","gt":"Giao tiếp tốt, thân thiện với đồng nghiệp và niềm nở với khách hàng.","tn":"Đạt","td":"Đạt","pc":"","diemtru":"","note":""},{"name":"Lê Ngọc Sơn Tùng","bac":"","nq":"Chấp hành tốt nội quy, đi làm đúng giờ.","kn":"Kỹ năng đạt","gt":"Giao tiếp tốt, thân thiện với đồng nghiệp và niềm nở với khách hàng.","tn":"Đạt","td":"Đạt","pc":"","diemtru":"","note":""},{"name":"Phạm Bảo Phong","bac":"","nq":"Chấp hành tốt nội quy, đi làm đúng giờ.","kn":"Kỹ năng đạt","gt":"Giao tiếp tốt, thân thiện với đồng nghiệp và niềm nở với khách hàng.","tn":"Đạt","td":"Đạt","pc":"","diemtru":"","note":""},{"name":"Dương Nguyễn Kỳ Phương","bac":"","nq":"Chấp hành tốt nội quy, đi làm đúng giờ.","kn":"Kỹ năng đạt","gt":"Giao tiếp tốt, thân thiện với đồng nghiệp và niềm nở với khách hàng.","tn":"Đạt","td":"Đạt","pc":"","diemtru":"","note":""},{"name":"Nguyễn Minh Phong","bac":"","nq":"Chấp hành tốt nội quy, đi làm chưa đúng giờ.","kn":"Kỹ năng đạt","gt":"Giao tiếp tốt, thân thiện với đồng nghiệp và niềm nở với khách hàng.","tn":"Đạt","td":"Đạt","pc":"","diemtru":"","note":""},{"name":"Bùi Uyên Nhi","bac":"","nq":"Chấp hành tốt nội quy, đi làm chưa đúng giờ.","kn":"Kỹ năng đạt","gt":"Giao tiếp tốt, thân thiện với đồng nghiệp và niềm nở với khách hàng.","tn":"Đạt","td":"Đạt","pc":"","diemtru":"","note":""},{"name":"Hà Lâm Quốc Bảo","bac":"","nq":"Chấp hành tốt nội quy, đi làm chưa đúng giờ.","kn":"Kỹ năng đạt","gt":"Giao tiếp tốt, thân thiện với đồng nghiệp và niềm nở với khách hàng.","tn":"Đạt","td":"Đạt","pc":"","diemtru":"","note":""}]},
  waste_product: {"2026-01":[{"product":"Test","qty":4,"unit":"Ly","reason":"Test","value":0,"staff":""},{"product":"Trà Sữa ZEN (L)","qty":42,"unit":"Ly","reason":"Sản phẩm chính","value":0,"staff":""},{"product":"Lý do: Khách Đổi","qty":10,"unit":"Ly","reason":"Khách Đổi","value":0,"staff":""},{"product":"Lý do: Làm sai","qty":21,"unit":"Ly","reason":"Làm sai","value":0,"staff":""},{"product":"Lý do: Làm dư","qty":11,"unit":"Ly","reason":"Làm dư","value":0,"staff":""},{"product":"Lý do: Làm đổ","qty":11,"unit":"Ly","reason":"Làm đổ","value":0,"staff":""},{"product":"Lý do: Không đá-có đá","qty":14,"unit":"Ly","reason":"Không đá-có đá","value":0,"staff":""}],"2026-02":[{"product":"Test","qty":4,"unit":"Ly","reason":"Test","value":0,"staff":""},{"product":"Trà Sữa ZEN (L)","qty":40,"unit":"Ly","reason":"Sản phẩm chính","value":0,"staff":""},{"product":"Lý do: Khách Đổi","qty":17,"unit":"Ly","reason":"Khách Đổi","value":0,"staff":""},{"product":"Lý do: Làm sai","qty":11,"unit":"Ly","reason":"Làm sai","value":0,"staff":""},{"product":"Lý do: Làm dư","qty":3,"unit":"Ly","reason":"Làm dư","value":0,"staff":""},{"product":"Lý do: Làm đổ","qty":13,"unit":"Ly","reason":"Làm đổ","value":0,"staff":""},{"product":"Lý do: Không đá-có đá","qty":13,"unit":"Ly","reason":"Không đá-có đá","value":0,"staff":""}]},
  waste_material: {"2026-01":[{"material":"Bánh Flan","qty":86,"unit":"Cái","reason":"Hao hụt","value":0,"staff":""},{"material":"Bông kem","qty":5698,"unit":"Gram","reason":"Hao hụt","value":0,"staff":""},{"material":"Bông Kem Mật Thốt Nốt","qty":1523,"unit":"Phần","reason":"Hao hụt","value":0,"staff":""},{"material":"Cà phê","qty":1454,"unit":"Gram","reason":"Hao hụt","value":0,"staff":""},{"material":"Cốt dứa","qty":177,"unit":"Gram","reason":"Hao hụt","value":0,"staff":""},{"material":"Chanh vàng","qty":1060,"unit":"Gram","reason":"Hao hụt","value":0,"staff":""},{"material":"Chanh xanh","qty":3580,"unit":"Gram","reason":"Hao hụt","value":0,"staff":""},{"material":"Dứa","qty":2395,"unit":"Gram","reason":"Hao hụt","value":0,"staff":""},{"material":"Đào trái Rhodes","qty":2559,"unit":"Gram","reason":"Hao hụt","value":0,"staff":""},{"material":"Hạt Sen Tươi","qty":2551,"unit":"Gram","reason":"Hao hụt","value":0,"staff":""},{"material":"Kem thốt nốt","qty":3733,"unit":"Gram","reason":"Hao hụt","value":0,"staff":""},{"material":"Trà olong","qty":68997,"unit":"Gram","reason":"Hao hụt","value":0,"staff":""},{"material":"Trà pha loại 1","qty":69154,"unit":"Gram","reason":"Hao hụt","value":0,"staff":""},{"material":"Trà pha loại 2","qty":58991,"unit":"Gram","reason":"Hao hụt","value":0,"staff":""},{"material":"Trân Châu Hoàng Kim","qty":27849,"unit":"cái","reason":"Hao hụt","value":0,"staff":""},{"material":"Trân châu Tươi (đã nấu)","qty":22555,"unit":"cái","reason":"Hao hụt","value":0,"staff":""},{"material":"Sữa đặc Ngôi Sao","qty":3927,"unit":"Gram","reason":"Hao hụt","value":0,"staff":""},{"material":"Thạch Sương Sáo","qty":2538,"unit":"Gram","reason":"Hao hụt","value":0,"staff":""}],"2026-02":[{"material":"Bánh Flan","qty":15,"unit":"Cái","reason":"Hao hụt","value":0,"staff":""},{"material":"Bông kem","qty":4702,"unit":"Gram","reason":"Hao hụt","value":0,"staff":""},{"material":"Bông Kem Mật Thốt Nốt","qty":2023,"unit":"Phần","reason":"Hao hụt","value":0,"staff":""},{"material":"Cà phê","qty":1374,"unit":"Gram","reason":"Hao hụt","value":0,"staff":""},{"material":"Cốt dứa","qty":1162,"unit":"Gram","reason":"Hao hụt","value":0,"staff":""},{"material":"Chanh xanh","qty":4279,"unit":"Gram","reason":"Hao hụt","value":0,"staff":""},{"material":"Dứa","qty":4735,"unit":"Gram","reason":"Hao hụt","value":0,"staff":""},{"material":"Hạt Sen Tươi","qty":2228,"unit":"Gram","reason":"Hao hụt","value":0,"staff":""},{"material":"Trà olong","qty":47456,"unit":"Gram","reason":"Hao hụt","value":0,"staff":""},{"material":"Trà pha loại 1","qty":51373,"unit":"Gram","reason":"Hao hụt","value":0,"staff":""},{"material":"Trà pha loại 2","qty":42746,"unit":"Gram","reason":"Hao hụt","value":0,"staff":""},{"material":"Trân Châu Hoàng Kim","qty":19963,"unit":"cái","reason":"Hao hụt","value":0,"staff":""},{"material":"Trân châu Tươi (đã nấu)","qty":18146,"unit":"cái","reason":"Hao hụt","value":0,"staff":""},{"material":"Sữa đặc Ngôi Sao","qty":3137,"unit":"Gram","reason":"Hao hụt","value":0,"staff":""},{"material":"Nhãn","qty":1313,"unit":"Phần","reason":"Hao hụt","value":0,"staff":""},{"material":"Syrup đào","qty":100,"unit":"Gram","reason":"Hao hụt","value":0,"staff":""},{"material":"Sốt sô-cô-la","qty":44,"unit":"Gram","reason":"Hao hụt","value":0,"staff":""}]},
  data_analytics: {"2026-01":[{"metric":"Số vi phạm","target":5,"actual":15,"unit":"lần","note":"Mục tiêu ≤5/tháng"},{"metric":"Thành phẩm hủy (ly)","target":80,"actual":71,"unit":"ly","note":"Tổng lý do hủy T1"},{"metric":"NL hủy (mặt hàng)","target":10,"actual":34,"unit":"mặt hàng","note":""},{"metric":"Nhân sự được đánh giá","target":10,"actual":0,"unit":"người","note":""}],"2026-02":[{"metric":"Số vi phạm","target":5,"actual":5,"unit":"lần","note":"Mục tiêu ≤5/tháng"},{"metric":"Thành phẩm hủy (ly)","target":80,"actual":61,"unit":"ly","note":"Tổng lý do hủy T2"},{"metric":"NL hủy (mặt hàng)","target":10,"actual":34,"unit":"mặt hàng","note":""},{"metric":"Nhân sự được đánh giá","target":10,"actual":1,"unit":"người","note":""}],"2026-03":[{"metric":"Số vi phạm","target":5,"actual":0,"unit":"lần","note":""},{"metric":"Thành phẩm hủy (ly)","target":80,"actual":0,"unit":"ly","note":""},{"metric":"NL hủy (mặt hàng)","target":10,"actual":0,"unit":"mặt hàng","note":""},{"metric":"Nhân sự được đánh giá","target":10,"actual":11,"unit":"người","note":""}]}
};

function moduleKey(name){ return branchKey('zentea-module-'+name); }

function loadModuleData(name){
  try{
    var r=localStorage.getItem(moduleKey(name));
    var stored = r ? JSON.parse(r) : {};
    // Merge Excel seed: for months not yet in localStorage, use seed data
    var seed = EXCEL_SEED[name] || {};
    var merged = Object.assign({}, seed, stored);
    return merged;
  }catch(e){ return EXCEL_SEED[name]||{}; }
}
function saveModuleData(name,data){
  try{ localStorage.setItem(moduleKey(name),JSON.stringify(data)); }catch(e){}
}

// Build month-year key: "2026-03"
function mkKey(monthVal){
  var p=monthVal.split('-');
  return {y:parseInt(p[0]),m:parseInt(p[1])};
}

// Populate a <select> with last 12 months, select current
function populateMonthSelect(selId){
  var sel=$(selId);
  if(!sel) return;
  var now=new Date();
  var opts='';
  for(var i=11;i>=0;i--){
    var d=new Date(now.getFullYear(),now.getMonth()-i,1);
    var y=d.getFullYear(), m=d.getMonth()+1;
    var val=y+'-'+(m<10?'0'+m:m);
    var label=MONTHS_VI[m-1]+' '+y;
    var sel2=(i===0)?'selected':'';
    opts+='<option value="'+val+'" '+sel2+'>'+label+'</option>';
  }
  sel.innerHTML=opts;
}

function deleteRowModule(name, idx, renderFn){
  var data=loadModuleData(name);
  var monthSel=$(name.replace('_','-')+'-month') ||
               $(name+'-month');
  var mv=monthSel?monthSel.value:'';
  if(!data[mv]) return;
  data[mv].splice(idx,1);
  saveModuleData(name,data);
  renderFn();
}

var _rptCharts={};
function destroyChart(id){
  if(_rptCharts[id]){ _rptCharts[id].destroy(); delete _rptCharts[id]; }
}

function makeDeleteBtn(onclick){
  return '<button type="button" onclick="'+onclick+'" style="background:#fff0f0;border:1px solid #fca5a5;color:#dc2626;border-radius:6px;width:26px;height:26px;cursor:pointer;font-size:13px;line-height:1;">×</button>';
}

// MODULE: HR EVAL (hr_eval)
function hrEvalRender(){
  var sel=$('hr-eval-month');
  if(!sel) return;
  var mv=sel.value;
  var data=loadModuleData('hr_eval');
  var rows=data[mv]||[];
  var tbody=$('hr-eval-tbody');
  if(!tbody) return;
  if(!rows.length){
    tbody.innerHTML='<tr><td colspan="11" style="text-align:center;color:#aaa;padding:28px;font-size:13px;">Chưa có dữ liệu — nhấn <strong>🔄 Đồng bộ NV</strong> hoặc <strong>+ Thêm</strong></td></tr>';
    return;
  }
  var td='padding:7px 8px;font-size:12px;border-bottom:1px solid #edf5e9;outline:none;';
  tbody.innerHTML=rows.map(function(r,i){
    var bg=i%2===0?'#fff':'#f9fef7';
    function ce(field,val,extra){
      return '<td contenteditable="true" style="'+td+'background:'+bg+';'+(extra||'')+'" onblur="hrEvalUpdate(\''+mv+'\','+i+',\''+field+'\',this.innerText)">'+(val||'')+'</td>';
    }
    return '<tr>'
      +ce('name',r.name,'font-weight:700;min-width:120px;')
      +ce('bac',r.bac,'text-align:center;min-width:45px;')
      +ce('nq',r.nq,'min-width:140px;')
      +ce('kn',r.kn,'min-width:100px;')
      +ce('gt',r.gt,'min-width:140px;')
      +ce('tn',r.tn,'text-align:center;')
      +ce('td',r.td,'text-align:center;')
      +ce('pc',r.pc,'text-align:center;color:#2d7a2d;font-weight:700;')
      +ce('diemtru',r.diemtru,'text-align:center;color:#dc2626;font-weight:700;')
      +ce('note',r.note,'color:#888;font-size:11px;')
      +'<td style="'+td+'background:'+bg+';padding:4px;text-align:center;"><button type="button" onclick="hrEvalDelete(\''+mv+'\','+i+')" style="background:#fff0f0;border:1px solid #fca5a5;color:#dc2626;border-radius:6px;width:24px;height:24px;cursor:pointer;font-size:12px;">×</button></td>'
      +'</tr>';
  }).join('');
}

function hrEvalUpdate(mv,i,field,val){
  var data=loadModuleData('hr_eval');
  if(!data[mv]||!data[mv][i]) return;
  data[mv][i][field]=val.trim();
  saveModuleData('hr_eval',data);
}

function hrEvalDelete(mv,i){
  var data=loadModuleData('hr_eval');
  if(data[mv]) data[mv].splice(i,1);
  saveModuleData('hr_eval',data);
  hrEvalRender();
}

function hrEvalAddRow(){
  var mv=$('hr-eval-month').value;
  var data=loadModuleData('hr_eval');
  if(!data[mv]) data[mv]=[];
  data[mv].push({name:'Nhân viên mới',bac:'C',nq:'',kn:'',gt:'',tn:'',td:'',pc:'',diemtru:'',note:''});
  saveModuleData('hr_eval',data);
  hrEvalRender();
  setTimeout(function(){
    var cells=document.querySelectorAll('#hr-eval-tbody tr:last-child td[contenteditable]');
    if(cells.length){cells[0].focus();var r=document.createRange();r.selectNodeContents(cells[0]);r.collapse(false);var s=window.getSelection();s.removeAllRanges();s.addRange(r);}
  },60);
}

function hrEvalSyncEmployees(){
  var mv=$('hr-eval-month').value;
  var data=loadModuleData('hr_eval');
  if(!data[mv]) data[mv]=[];
  var existing=data[mv].map(function(r){return (r.name||'').trim().toLowerCase();});
  var added=0;
  (typeof employeesData!=='undefined'?employeesData:[]).forEach(function(emp){
    if(emp.status==='Đang làm'||emp.status==='Thử việc'){
      if(existing.indexOf(emp.name.trim().toLowerCase())<0){
        data[mv].push({name:emp.name,bac:emp.rank||'C',nq:'',kn:'',gt:'',tn:'',td:'',pc:'',diemtru:'',note:''});
        existing.push(emp.name.trim().toLowerCase());
        added++;
      }
    }
  });
  saveModuleData('hr_eval',data);
  hrEvalRender();
  showToast('🔄 Đồng bộ xong','Đã thêm '+added+' nhân viên từ danh sách');
}


// MODULE: WASTE PRODUCT (waste_product)
function wpRender(){
  var sel=$('wp-month');
  if(!sel) return;
  if(!sel) return;
  var mv=sel.value;
  var data=loadModuleData('waste_product');
  var rows=data[mv]||[];
  var tbody=$('wp-tbody');
  if(!tbody) return;
  if(!tbody) return;
  if(!rows.length){
    tbody.innerHTML='<tr><td colspan="8" style="text-align:center;color:#aaa;padding:24px;font-size:13px;">Chưa có dữ liệu — nhấn <strong>+ Thêm</strong></td></tr>';
    return;
  }
  tbody.innerHTML=rows.map(function(r,i){
    return '<tr>'
      +'<td>'+r.date+'</td><td>'+r.product+'</td>'
      +'<td style="text-align:center;">'+r.qty+'</td><td style="text-align:center;">'+r.unit+'</td>'
      +'<td>'+r.reason+'</td>'
      +'<td style="text-align:right;color:#dc2626;font-weight:600;">'+(parseFloat(r.value)||0).toLocaleString('vi-VN')+'đ</td>'
      +'<td>'+r.staff+'</td>'
      +'<td>'+makeDeleteBtn('wpDelete('+i+')')+'</td>'
      +'</tr>';
  }).join('');
}

function wpDelete(i){
  var _wpm=$('wp-month'); if(!_wpm) return;
  var mv=_wpm.value;
  var data=loadModuleData('waste_product');
  if(data[mv]) data[mv].splice(i,1);
  saveModuleData('waste_product',data);
  wpRender();
}

function wpAddRow(){
  var _wpm2=$('wp-month'); if(!_wpm2) return;
  var mv=_wpm2.value;
  var date=prompt('Ngày (VD: 15/03/2026):',new Date().toLocaleDateString('vi-VN'));
  if(!date) return;
  var product=prompt('Tên sản phẩm:','');
  if(!product) return;
  var qty=prompt('Số lượng:','1');
  var unit=prompt('Đơn vị (ly/hộp/kg…):','ly');
  var reason=prompt('Lý do hủy:','Hết hạn');
  var value=prompt('Giá trị (đồng):','0');
  var staff=prompt('Người ghi nhận:','');
  var data=loadModuleData('waste_product');
  if(!data[mv]) data[mv]=[];
  data[mv].push({date:date,product:product,qty:qty||1,unit:unit||'',reason:reason||'',value:parseFloat(value)||0,staff:staff||''});
  saveModuleData('waste_product',data);
  wpRender();
  showToast('✅ Đã thêm','Thành phẩm hủy đã được ghi nhận');
}

// MODULE: NGUYÊN LIỆU HỦY - Excel style (12 tháng x nguyên liệu)
var WM_STORAGE_KEY = 'zentea-wm-excel';
var WM_DEFAULT = [
  {name:'Trà olong',months:[68997,47456,0,0,0,0,0,0,0,0,0,0],unit:'Gram'},
  {name:'Trà pha loại 1',months:[69154,51373,0,0,0,0,0,0,0,0,0,0],unit:'Gram'},
  {name:'Trà pha loại 2',months:[58991,42746,0,0,0,0,0,0,0,0,0,0],unit:'cái'},
  {name:'Bánh Flan',months:[86,15,0,0,0,0,0,0,0,0,0,0],unit:'Cái'},
  {name:'Bông kem',months:[5698,4702,0,0,0,0,0,0,0,0,0,0],unit:'Gram'},
  {name:'Bông Kem Mật Thốt Nốt',months:[1523,2023,0,0,0,0,0,0,0,0,0,0],unit:'Phần'},
  {name:'Cà phê',months:[1454,1374,0,0,0,0,0,0,0,0,0,0],unit:'Gram'},
  {name:'Cốt dứa',months:[177,1162,0,0,0,0,0,0,0,0,0,0],unit:'Gram'},
  {name:'Chanh vàng các loại',months:[1060,472,0,0,0,0,0,0,0,0,0,0],unit:'Gram'},
  {name:'Chanh xanh',months:[3580,4279,0,0,0,0,0,0,0,0,0,0],unit:'Gram'},
  {name:'Dứa',months:[2395,4735,0,0,0,0,0,0,0,0,0,0],unit:'Gram'},
  {name:'Đào trái Rhodes',months:[2559,993,0,0,0,0,0,0,0,0,0,0],unit:'Gram'},
  {name:'Đậu phộng',months:[30,0,0,0,0,0,0,0,0,0,0,0],unit:'Gram'},
  {name:'Hạt Sen Tươi',months:[2551,2228,0,0,0,0,0,0,0,0,0,0],unit:'Gram'},
  {name:'Kem thốt nốt',months:[3733,0,0,0,0,0,0,0,0,0,0,0],unit:'Gram'},
  {name:'Kẹo đường',months:[594,1030,0,0,0,0,0,0,0,0,0,0],unit:'Gram'},
  {name:'Khúc Bạch Olong Nhãn',months:[1299,232,0,0,0,0,0,0,0,0,0,0],unit:'Gram'},
  {name:'Lá dứa',months:[341,95,0,0,0,0,0,0,0,0,0,0],unit:'Gram'},
  {name:'Long Châu Phô Mai "Nhân Mù"',months:[1536,2078,0,0,0,0,0,0,0,0,0,0],unit:'Gram'},
  {name:'Ly 500 Uy Kiệt',months:[1,8,0,0,0,0,0,0,0,0,0,0],unit:'Cái'},
  {name:'Ly 700 Uy Kiệt',months:[4,0,0,0,0,0,0,0,0,0,0,0],unit:'Cái'},
  {name:'Mứt đác',months:[270,994,0,0,0,0,0,0,0,0,0,0],unit:'Gram'},
  {name:'Nước cốt nhãn',months:[2503,2359,0,0,0,0,0,0,0,0,0,0],unit:'Gram'},
  {name:'Nhãn',months:[0,1313,0,0,0,0,0,0,0,0,0,0],unit:'Phần'},
  {name:'Rau Húng lũi',months:[307,110,0,0,0,0,0,0,0,0,0,0],unit:'Gram'},
  {name:'Sữa đà lạt true milk 1000ml',months:[720,2080,0,0,0,0,0,0,0,0,0,0],unit:'Viên'},
  {name:'Sữa đặc Ngôi Sao Phương Nam',months:[3927,3137,0,0,0,0,0,0,0,0,0,0],unit:'Gram'},
  {name:'Syrup đào',months:[0,100,0,0,0,0,0,0,0,0,0,0],unit:'Gram'},
  {name:'Sốt sô-cô-la',months:[0,44,0,0,0,0,0,0,0,0,0,0],unit:'Gram'},
  {name:'tắc',months:[1686,1088,0,0,0,0,0,0,0,0,0,0],unit:'Gram'},
  {name:'Thạch phô mai',months:[113,195,0,0,0,0,0,0,0,0,0,0],unit:'Gram'},
  {name:'Thạch Sương Sáo',months:[2538,2738,0,0,0,0,0,0,0,0,0,0],unit:'Gram'},
  {name:'Trân Châu Giòn Quýt Yuzu',months:[2090,4962,0,0,0,0,0,0,0,0,0,0],unit:'cái'},
  {name:'Trân Châu Hoàng Kim (Đã nấu)',months:[27849,19963,0,0,0,0,0,0,0,0,0,0],unit:'cái'},
  {name:'Trân châu Tươi_ chưa nấu',months:[344,0,0,0,0,0,0,0,0,0,0,0],unit:'cái'},
  {name:'Trân châu Tươi_ Đã nấu',months:[22555,18146,0,0,0,0,0,0,0,0,0,0],unit:'cái'},
  {name:'Xoài',months:[0,60,0,0,0,0,0,0,0,0,0,0],unit:'Gram'},
  {name:'Xốt caramel mặn',months:[255,359,0,0,0,0,0,0,0,0,0,0],unit:'Gram'}
];

function wmLoadData(){try{var r=localStorage.getItem(branchKey(WM_STORAGE_KEY));return r?JSON.parse(r):JSON.parse(JSON.stringify(WM_DEFAULT));}catch(e){return JSON.parse(JSON.stringify(WM_DEFAULT));}}
function wmSaveData(d){try{localStorage.setItem(branchKey(WM_STORAGE_KEY),JSON.stringify(d));}catch(e){}}

function wmRender(){
  var data = wmLoadData();
  var tbody = $('wm-excel-tbody');
  var tfoot = $('wm-excel-tfoot');
  if(!tbody) return;

  // Apply sort
  var sortDir = window._wmSortDir || 0; // 0=original,1=asc,2=desc
  var displayData = data.slice();
  if(sortDir === 1) displayData.sort(function(a,b){ return wmRowSum(a)-wmRowSum(b); });
  if(sortDir === 2) displayData.sort(function(a,b){ return wmRowSum(b)-wmRowSum(a); });

  var tdBase = 'padding:7px 8px;font-size:12px;border-bottom:1px solid #edf5e9;';
  tbody.innerHTML = displayData.map(function(row, ri){
    var bg = ri%2===0 ? '#fff' : '#f9fef7';
    // Find original index for edit callbacks
    var origIdx = data.indexOf(row);
    var cells = '<td contenteditable="true" style="'+tdBase+'background:'+bg+';font-weight:600;min-width:180px;position:sticky;left:0;z-index:1;" onblur="wmUpdateName('+origIdx+',this.innerText)">'+row.name+'</td>';
    for(var m=0; m<12; m++){
      var v = row.months[m]||0;
      cells += '<td contenteditable="true" style="'+tdBase+'background:'+bg+';text-align:center;'+(v>0?'color:#1a1a1a;':'color:#ddd;')+'" onblur="wmUpdateCell('+origIdx+','+m+',this.innerText)">'+(v>0?v.toLocaleString('vi-VN'):'–')+'</td>';
    }
    cells += '<td contenteditable="true" style="'+tdBase+'background:'+bg+';text-align:center;color:#666;font-size:11px;" onblur="wmUpdateUnit('+origIdx+',this.innerText)">'+row.unit+'</td>';
    cells += '<td style="'+tdBase+'background:'+bg+';text-align:center;padding:4px;"><button type="button" onclick="wmDeleteRow('+origIdx+')" style="background:#fff0f0;border:1px solid #fca5a5;color:#dc2626;border-radius:6px;width:24px;height:24px;cursor:pointer;font-size:12px;">×</button></td>';
    return '<tr>'+cells+'</tr>';
  }).join('');

  if(tfoot) tfoot.innerHTML = '';
  wmRenderCompare('wm', data);
}
function wmRowSum(r){ return (r.months||[]).reduce(function(a,b){return a+(b||0);},0); }

function wmToggleSort(prefix){
  var key = '_'+prefix+'SortDir';
  window[key] = ((window[key]||0)+1) % 3;
  if(prefix==='wm') wmRender();
  else tphMainRender();
  // Update button label
  var labels = ['↕ Sắp xếp','↑ Thấp→Cao','↓ Cao→Thấp'];
  var btn = $(prefix+'-sort-btn');
  if(btn) btn.textContent = labels[window[key]];
}

function wmRenderCompare(prefix, data){
  var panel = $(prefix+'-compare-panel');
  if(!panel) return;

  var isWm        = (prefix==='wm');
  var accentColor = isWm ? 'var(--green)' : '#b91c1c';
  var bgColor     = isWm ? '#f0fdf4'      : '#fff5f5';
  var borderColor = isWm ? '#bbf7d0'      : '#fecaca';
  var placeholder = isWm ? 'nguyên liệu'  : 'thành phẩm';

  var opts = '<option value="">-- Chọn '+placeholder+' --</option>';
  if(data && data.length>0){
    data.forEach(function(r,i){ opts += '<option value="'+i+'">'+(r.name||'')+'</option>'; });
  }

  // Always render the panel with select (even if empty)
  panel.innerHTML =
    '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:10px 16px;'
    +'background:'+bgColor+';border:1.5px solid '+borderColor+';border-radius:12px;">'
    +'<span style="font-size:13px;font-weight:700;color:'+accentColor+';white-space:nowrap;">📊 So sánh %</span>'
    +'<select id="'+prefix+'-cmp-sel" onchange="wmUpdateCompare(\''+prefix+'\')" '
    +'style="padding:5px 10px;border-radius:8px;border:1.5px solid '+borderColor+';font-size:12px;'
    +'font-family:\'Open Sans\',sans-serif;background:#fff;color:#1a1a1a;outline:none;cursor:pointer;max-width:200px;">'
    +opts+'</select>'
    +'<div id="'+prefix+'-cmp-bars" style="flex:1;min-width:240px;">'
    +(data.length===0?'<span style="color:#bbb;font-size:11px;">Nhập file Excel để xem</span>':'')
    +'</div>'
    +'</div>';
}

function wmUpdateCompare(prefix){
  var sel  = $(prefix+'-cmp-sel');
  var bars = $(prefix+'-cmp-bars');
  if(!sel || !bars) return;
  var idx = parseInt(sel.value);
  if(isNaN(idx)){ bars.innerHTML='<span style="color:#aaa;font-size:11px;">← Chọn để xem so sánh %</span>'; return; }

  var data  = prefix==='wm' ? wmLoadData() : tphMainLoad();
  var row   = data[idx];
  if(!row){ bars.innerHTML=''; return; }

  var months = row.months||[];
  var maxVal = Math.max.apply(null, months.map(function(v){ return v||0; }));
  if(maxVal===0){ bars.innerHTML='<span style="color:#aaa;font-size:11px;">Không có dữ liệu</span>'; return; }

  var color  = prefix==='wm' ? '#2d7a2d' : '#dc2626';
  var labels = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];

  var html = '<div style="display:flex;align-items:flex-end;gap:4px;height:44px;">';
  months.forEach(function(v, m){
    var val = v||0;
    var pct = maxVal>0 ? Math.round(val/maxVal*100) : 0;
    var h   = maxVal>0 ? Math.max(Math.round(pct*32/100), val>0?4:0) : 0;
    var tip = labels[m]+': '+(val>0?val.toLocaleString('vi-VN'):'0')+(maxVal>0?' ('+pct+'%)':'');
    var isMax = val===maxVal && val>0;
    html += '<div title="'+tip+'" style="display:flex;flex-direction:column;align-items:center;gap:1px;flex:1;cursor:default;">';
    html += '<span style="font-size:9px;font-weight:700;color:'+color+';line-height:1;">'+(val>0?pct+'%':'')+'</span>';
    html += '<div style="width:100%;max-width:28px;height:'+h+'px;background:'+color+';border-radius:3px 3px 0 0;'
          + 'opacity:'+(val>0?(isMax?'1':'0.65'):'0.12')+';box-shadow:'+(isMax?'0 0 6px '+color+'88':'none')+';">'
          + '</div>';
    html += '<span style="font-size:9px;color:#888;line-height:1.3;">'+labels[m]+'</span>';
    html += '</div>';
  });
  html += '</div>';
  bars.innerHTML = html;
}

function wmUpdateName(ri,v){var d=wmLoadData();if(d[ri])d[ri].name=v.trim();wmSaveData(d);}
function wmUpdateUnit(ri,v){var d=wmLoadData();if(d[ri])d[ri].unit=v.trim();wmSaveData(d);}
function wmUpdateCell(ri,mi,v){var d=wmLoadData();if(d[ri])d[ri].months[mi]=parseFloat(v.replace(/[^\d.]/g,''))||0;wmSaveData(d);}
function wmDeleteRow(ri){var d=wmLoadData();d.splice(ri,1);wmSaveData(d);wmRender();}
function wmAddRow(){var d=wmLoadData();var name=prompt('Tên nguyên liệu:','');if(!name)return;var unit=prompt('Đơn vị:','Gram');d.push({name:name.trim(),months:[0,0,0,0,0,0,0,0,0,0,0,0],unit:(unit||'Gram').trim()});wmSaveData(d);wmRender();showToast('✅ Đã thêm','Nguyên liệu mới đã được thêm');}
function wmSave(){wmRender();showToast('✅ Đã lưu','Bảng nguyên liệu hủy đã cập nhật');}
function wmDelete(){}

// MODULE: THÀNH PHẨM HỦY (food-staff section) - Excel style 3 bảng
var TPH_STORAGE_KEY='zentea-tph-excel';
var TPH_DEFAULT={
  products:[{name:'Test',months:[4,4,0,0,0,0,0,0,0,0,0,0]},{name:'Trà Sữa ZEN (L)',months:[42,40,0,0,0,0,0,0,0,0,0,0]}],
  reasons:[
    {name:'Test',months:[4,4,0,0,0,0,0,0,0,0,0,0]},{name:'Khách Đổi',months:[10,17,0,0,0,0,0,0,0,0,0,0]},
    {name:'Làm sai',months:[21,11,0,0,0,0,0,0,0,0,0,0]},{name:'Làm dư',months:[11,3,0,0,0,0,0,0,0,0,0,0]},
    {name:'Làm đổ',months:[11,13,0,0,0,0,0,0,0,0,0,0]},{name:'Khác',months:[0,0,0,0,0,0,0,0,0,0,0,0]},
    {name:'Đọc sai, đọc dư',months:[0,0,0,0,0,0,0,0,0,0,0,0]},{name:'Không đá-có đá',months:[14,13,0,0,0,0,0,0,0,0,0,0]}
  ],
  details:[
    {name:'Americano',months:[1,0,0,0,0,0,0,0,0,0,0,0]},{name:'Americano (L)',months:[0,1,0,0,0,0,0,0,0,0,0,0]},
    {name:'Bạc Xỉu',months:[1,0,0,0,0,0,0,0,0,0,0,0]},{name:'Cafe Latte',months:[0,2,0,0,0,0,0,0,0,0,0,0]},
    {name:'Cafe Sữa',months:[0,1,0,0,0,0,0,0,0,0,0,0]},{name:'Caramel Cà Phê Muối',months:[1,1,0,0,0,0,0,0,0,0,0,0]},
    {name:'Đá me Hạt Đác',months:[0,3,0,0,0,0,0,0,0,0,0,0]},{name:'Đá me Hạt Đác (L)',months:[0,3,0,0,0,0,0,0,0,0,0,0]},
    {name:'Hồng Trà Kem Mật Thốt Nốt',months:[1,0,0,0,0,0,0,0,0,0,0,0]},
    {name:'Sô-cô-la Kem Mật Thốt Nốt',months:[1,1,0,0,0,0,0,0,0,0,0,0]},
    {name:'Sô-Cô-La Sữa',months:[1,0,0,0,0,0,0,0,0,0,0,0]},{name:'Sô-Cô-La Sữa (L)',months:[0,1,0,0,0,0,0,0,0,0,0,0]},
    {name:'Sô-cô-la đá xay bông kem truyền thống (L)',months:[0,1,0,0,0,0,0,0,0,0,0,0]},
    {name:'Sữa Tươi - Đường Đen- Trân Châu Tươi (L)',months:[1,1,0,0,0,0,0,0,0,0,0,0]},
    {name:'Trà Chanh',months:[1,0,0,0,0,0,0,0,0,0,0,0]},{name:'Trà Chanh (L)',months:[1,1,0,0,0,0,0,0,0,0,0,0]},
    {name:'Trà Chanh Mật Ong',months:[2,0,0,0,0,0,0,0,0,0,0,0]},{name:'Trà chanh mật ong (L)',months:[0,2,0,0,0,0,0,0,0,0,0,0]},
    {name:'Trà Dứa Tươi',months:[1,1,0,0,0,0,0,0,0,0,0,0]},{name:'Trà Dứa Tươi (L)',months:[1,0,0,0,0,0,0,0,0,0,0,0]},
    {name:'Trà Đào',months:[0,2,0,0,0,0,0,0,0,0,0,0]},{name:'Trà Đào (L)',months:[1,2,0,0,0,0,0,0,0,0,0,0]},
    {name:'Trà Long Nhãn Hạt Sen Tươi',months:[5,2,0,0,0,0,0,0,0,0,0,0]},
    {name:'Trà Long Nhãn Hạt Sen Tươi (L)',months:[5,7,0,0,0,0,0,0,0,0,0,0]},
    {name:'Trà Sữa Bông Kem Mật Thốt Nốt(L)',months:[1,0,0,0,0,0,0,0,0,0,0,0]},
    {name:'Trà Sữa Kem Mật Thốt Nốt',months:[1,0,0,0,0,0,0,0,0,0,0,0]},
    {name:'Trà Sữa Olong',months:[4,2,0,0,0,0,0,0,0,0,0,0]},{name:'Trà Sữa Olong (L)',months:[1,5,0,0,0,0,0,0,0,0,0,0]},
    {name:'Trà Sữa ZEN',months:[22,19,0,0,0,0,0,0,0,0,0,0]},{name:'Trà Sữa ZEN (L)',months:[42,40,0,0,0,0,0,0,0,0,0,0]},
    {name:'Trà Tắc Mật Ong',months:[1,3,0,0,0,0,0,0,0,0,0,0]},{name:'Trà tắc mật ong (L)',months:[0,2,0,0,0,0,0,0,0,0,0,0]},
    {name:'Trà Xanh Đá Viên (L)',months:[1,1,0,0,0,0,0,0,0,0,0,0]},{name:'Trà xanh đá viên',months:[0,1,0,0,0,0,0,0,0,0,0,0]},
    {name:'Trà xanh đá xay bông kem truyền thống (L)',months:[0,1,0,0,0,0,0,0,0,0,0,0]},
    {name:'Trà xanh đá xay bông kem mật thốt nốt (L)',months:[0,1,0,0,0,0,0,0,0,0,0,0]},
    {name:'Xoài Dứa Đá Xay',months:[1,1,0,0,0,0,0,0,0,0,0,0]},{name:'Xoài Dứa Đá Xay (L)',months:[1,0,0,0,0,0,0,0,0,0,0,0]},
    {name:'Xoài Tươi Latte',months:[1,0,0,0,0,0,0,0,0,0,0,0]}
  ]
};
function tphLoad(){try{var r=localStorage.getItem(branchKey(TPH_STORAGE_KEY));return r?JSON.parse(r):JSON.parse(JSON.stringify(TPH_DEFAULT));}catch(e){return JSON.parse(JSON.stringify(TPH_DEFAULT));}}
function tphSaveData(d){try{localStorage.setItem(branchKey(TPH_STORAGE_KEY),JSON.stringify(d));}catch(e){}}

function _tphTable(rows,tbodyId,hasDel,delFn,headerBg){
  var tbody=$(tbodyId); if(!tbody) return [0,0,0,0,0,0,0,0,0,0,0,0];
  var totals=[0,0,0,0,0,0,0,0,0,0,0,0];
  var td='padding:7px 6px;font-size:12px;border-bottom:1px solid #fde8e8;';
  tbody.innerHTML=rows.map(function(row,ri){
    var bg=ri%2===0?'#fff':'#fff8f8';
    var cells='<td contenteditable="true" style="'+td+'background:'+bg+';font-weight:600;" onblur="tphUpdateName(\''+tbodyId+'\','+ri+',this.innerText)">'+row.name+'</td>';
    for(var m=0;m<12;m++){
      var v=row.months[m]||0; if(v>0) totals[m]+=v;
      cells+='<td contenteditable="true" style="'+td+'background:'+bg+';text-align:center;'+(v>0?'':'color:#ddd;')+'" onblur="tphUpdateCell(\''+tbodyId+'\','+ri+','+m+',this.innerText)">'+(v>0?v:'–')+'</td>';
    }
    if(hasDel) cells+='<td style="'+td+'background:'+bg+';padding:4px;text-align:center;"><button type="button" onclick="'+delFn+'('+ri+')" style="background:#fff0f0;border:1px solid #fca5a5;color:#dc2626;border-radius:6px;width:24px;height:24px;cursor:pointer;font-size:12px;">×</button></td>';
    return '<tr>'+cells+'</tr>';
  }).join('');
  return totals;
}

function tphRender(){
  var d=tphLoad();
  // Bảng 1
  var t1=_tphTable(d.products,'tph-tbody1',false,'','');
  var t1sum=$('tph-tbody1'); if(!t1sum) return;
  if(t1sum){var tc='<td style="padding:7px 6px;background:#e8f5e2;font-weight:700;font-size:12px;">TỔNG</td>';for(var m=0;m<12;m++)tc+='<td style="padding:7px 6px;background:#e8f5e2;text-align:center;font-weight:700;color:var(--green);font-size:12px;">'+(t1[m]>0?t1[m]:'–')+'</td>';t1sum.innerHTML+='<tr>'+tc+'</tr>';}
  // Bảng 2
  var t2=_tphTable(d.reasons,'tph-tbody2',false,'','');
  var t2sum=$('tph-tbody2');
  if(!t2sum) return;
  if(t2sum){var fc='<td style="padding:7px 6px;background:#fde8e8;font-weight:700;color:#dc2626;font-size:12px;">TỔNG</td>';for(var m=0;m<12;m++)fc+='<td style="padding:7px 6px;background:#fde8e8;text-align:center;font-weight:700;color:#dc2626;font-size:12px;">'+(t2[m]>0?t2[m]:'–')+'</td>';t2sum.innerHTML+='<tr>'+fc+'</tr>';}
  // Bảng 3
  var t3=_tphTable(d.details,'tph-tbody3',true,'tphDelProduct3','');
  var tfoot=$('tph-tfoot3');
  if(!tfoot) return;
  if(tfoot){var gc='<td style="padding:7px 6px;background:#fde8e8;font-weight:700;color:#dc2626;font-size:12px;">TỔNG</td>';for(var m=0;m<12;m++)gc+='<td style="padding:7px 6px;background:#fde8e8;text-align:center;font-weight:700;color:#dc2626;font-size:12px;">'+(t3[m]>0?t3[m]:'–')+'</td>';gc+='<td style="background:#fde8e8;"></td>';tfoot.innerHTML='<tr>'+gc+'</tr>';}
}
function tphUpdateName(tbid,ri,v){var d=tphLoad();var k=tbid==='tph-tbody1'?'products':tbid==='tph-tbody2'?'reasons':'details';if(d[k]&&d[k][ri])d[k][ri].name=v.trim();tphSaveData(d);}
function tphUpdateCell(tbid,ri,mi,v){var d=tphLoad();var k=tbid==='tph-tbody1'?'products':tbid==='tph-tbody2'?'reasons':'details';if(d[k]&&d[k][ri])d[k][ri].months[mi]=parseFloat(v.replace(/[^\d.]/g,''))||0;tphSaveData(d);}
function tphDelProduct(ri){var d=tphLoad();d.products.splice(ri,1);tphSaveData(d);tphRender();}
function tphDelProduct3(ri){var d=tphLoad();d.details.splice(ri,1);tphSaveData(d);tphRender();}
function tphAddProduct(){var name=prompt('Tên sản phẩm:','');if(!name)return;var d=tphLoad();d.details.push({name:name.trim(),months:[0,0,0,0,0,0,0,0,0,0,0,0]});tphSaveData(d);tphRender();showToast('✅ Đã thêm','Sản phẩm mới đã được thêm vào Bảng 3');}
function tphSave(){tphRender();showToast('✅ Đã lưu','Bảng thành phẩm hủy đã cập nhật');}
function fsRender(){}
function fsAddRow(){}
function fsDelete(){}
// MODULE: DATA ANALYTICS - inline editable
function daRender(){
  var sel=$('da-month');
  if(!sel) return;
  if(!sel) return;
  var mv=sel.value;
  var data=loadModuleData('data_analytics');
  var rows=data[mv]||[];
  var tbody=$('da-tbody');
  if(!tbody) return;
  if(!tbody) return;
  if(!rows.length){
    tbody.innerHTML='<tr><td colspan="7" style="text-align:center;color:#aaa;padding:28px;font-size:13px;">Chưa có dữ liệu — nhấn <strong>+ Thêm dòng</strong></td></tr>';
    return;
  }
  var td='padding:8px 10px;font-size:12px;border-bottom:1px solid #edf5e9;outline:none;';
  tbody.innerHTML=rows.map(function(r,i){
    var bg=i%2===0?'#fff':'#f9fef7';
    var tgt=parseFloat(r.target)||0, act=parseFloat(r.actual)||0;
    var isLower=r.metric&&(r.metric.toLowerCase().indexOf('vi phạm')>=0||r.metric.toLowerCase().indexOf('hủy')>=0);
    var ok=isLower?(act<=tgt):(act>=tgt);
    var badge=ok
      ?'<span style="background:#dcfce7;color:#16a34a;border-radius:10px;padding:2px 8px;font-size:11px;font-weight:700;">✓ Đạt</span>'
      :'<span style="background:#fee2e2;color:#dc2626;border-radius:10px;padding:2px 8px;font-size:11px;font-weight:700;">✗ Chưa</span>';
    return '<tr>'
      +'<td contenteditable="true" data-mv="'+mv+'" data-i="'+i+'" data-f="metric" style="'+td+'background:'+bg+';font-weight:600;" onblur="daUpdate(this.dataset.mv,this.dataset.i,this.dataset.f,this.innerText)">'+r.metric+'</td>'
      +'<td contenteditable="true" data-mv="'+mv+'" data-i="'+i+'" data-f="target" style="'+td+'background:'+bg+';text-align:center;" onblur="daUpdate(this.dataset.mv,this.dataset.i,this.dataset.f,this.innerText)">'+r.target+'</td>'
      +'<td contenteditable="true" data-mv="'+mv+'" data-i="'+i+'" data-f="actual" style="'+td+'background:'+bg+';text-align:center;font-weight:700;color:#1d4ed8;" onblur="daUpdate(this.dataset.mv,this.dataset.i,this.dataset.f,this.innerText)">'+r.actual+'</td>'
      +'<td contenteditable="true" data-mv="'+mv+'" data-i="'+i+'" data-f="unit" style="'+td+'background:'+bg+';text-align:center;color:#666;" onblur="daUpdate(this.dataset.mv,this.dataset.i,this.dataset.f,this.innerText)">'+r.unit+'</td>'
      +'<td style="'+td+'background:'+bg+';text-align:center;">'+badge+'</td>'
      +'<td contenteditable="true" data-mv="'+mv+'" data-i="'+i+'" data-f="note" style="'+td+'background:'+bg+';color:#888;" onblur="daUpdate(this.dataset.mv,this.dataset.i,this.dataset.f,this.innerText)">'+(r.note||'')+'</td>'
      +'<td style="'+td+'background:'+bg+';padding:4px;text-align:center;"><button type="button" data-mv="'+mv+'" data-i="'+i+'" onclick="daDelete(this.dataset.mv,parseInt(this.dataset.i))" style="background:#fff0f0;border:1px solid #fca5a5;color:#dc2626;border-radius:6px;width:24px;height:24px;cursor:pointer;font-size:12px;">×</button></td>'
      +'</tr>';
  }).join('');
}
function daUpdate(mv,i,field,val){
  var data=loadModuleData('data_analytics');
  i=parseInt(i);
  if(!data[mv]||!data[mv][i]) return;
  if(field==='target'||field==='actual') data[mv][i][field]=parseFloat(val.replace(/[^\d.]/g,''))||0;
  else data[mv][i][field]=val.trim();
  saveModuleData('data_analytics',data);
  setTimeout(function(){daRender();},300);
}
function daDelete(mv,i){
  var data=loadModuleData('data_analytics');
  if(data[mv]) data[mv].splice(i,1);
  saveModuleData('data_analytics',data);
  daRender();
}
function daAddRow(){
  var _dam=$('da-month'); if(!_dam) return;
  var mv=_dam.value;
  var data=loadModuleData('data_analytics');
  if(!data[mv]) data[mv]=[];
  data[mv].push({metric:'Chỉ số mới',target:100,actual:0,unit:'%',note:''});
  saveModuleData('data_analytics',data);
  daRender();
  setTimeout(function(){
    var cells=document.querySelectorAll('#da-tbody tr:last-child td[contenteditable]');
    if(cells.length) cells[0].focus();
  },60);
}


// MODULE: REPORT OVERVIEW
// MODULE: REPORT OVERVIEW - Thành phẩm hủy + NL hủy + nhân viên
// REPORT OVERVIEW — theo NĂM (12 tháng)

function populateYearSelect(selId){
  var sel=$(selId);
  if(!sel) return;
  var now=new Date();
  var curY=now.getFullYear();
  var opts='';
  for(var y=curY; y>=curY-3; y--){
    opts+='<option value="'+y+'"'+(y===curY?' selected':'')+'>Năm '+y+'</option>';
  }
  sel.innerHTML=opts;
}

// REPORT OVERVIEW - By Year, 12 months

function rptPopulateYear(){
  var sel=$('rpt-year');
  if(!sel) return;
  var now=new Date();
  var yr=now.getFullYear();
  var opts='';
  for(var y=yr; y>=yr-3; y--){
    opts+='<option value="'+y+'"'+(y===yr?' selected':'')+'>Năm '+y+'</option>';
  }
  sel.innerHTML=opts;
}

function rptRender(){
  var sel=$('rpt-year');
  if(!sel) return;
  var yr=parseInt(sel.value)||new Date().getFullYear();

  var tphData=tphLoad();
  var tphMainData=tphMainLoad();
  var wmData=wmLoadData();

  var months=Array.from({length:12},function(_,i){
    var m=i+1; return yr+'-'+(m<10?'0'+m:m);
  });
  var monthLabels=['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];
  var monthNames=['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
                  'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];

  // ── TP hủy từng tháng
  var tpByMonth;
  if(tphMainData && tphMainData.length>0){
    tpByMonth=months.map(function(mk,mi){
      return tphMainData.reduce(function(s,r){return s+(r.months[mi]||0);},0);
    });
  } else {
    tpByMonth=months.map(function(mk,mi){
      return (tphData.reasons||[]).reduce(function(s,r){return s+(r.months[mi]||0);},0);
    });
  }
  var tpTotal=tpByMonth.reduce(function(s,v){return s+v;},0);
  var tpPeak=Math.max.apply(null,tpByMonth);
  var tpPeakIdx=tpByMonth.indexOf(tpPeak);

  // ── TP lý do
  var tpReasonYr;
  if(tphData.reasons && tphData.reasons.length>0 && tphData.reasons.some(function(r){return r.months.some(function(v){return v>0;});})){
    tpReasonYr=tphData.reasons.map(function(r){
      return {name:r.name,val:r.months.reduce(function(s,v){return s+v;},0)};
    }).filter(function(x){return x.val>0;});
  } else {
    tpReasonYr=tphMainData.map(function(r){
      return {name:r.name,val:r.months.reduce(function(s,v){return s+v;},0)};
    }).filter(function(x){return x.val>0;}).slice(0,8);
  }

  // ── NL hủy: tổng số lượng (gram/kg) từng tháng
  var nlByMonth=months.map(function(mk,mi){
    return wmData.reduce(function(s,r){return s+(r.months[mi]||0);},0);
  });
  var nlItemsByMonth=months.map(function(mk,mi){
    return wmData.filter(function(r){return (r.months[mi]||0)>0;}).length;
  });
  var nlTotal=nlByMonth.reduce(function(s,v){return s+v;},0);

  // ── HR từng tháng
  var hrByMonth=months.map(function(mk){
    return (loadModuleData('hr_eval')[mk]||[]).length;
  });
  var hrTotal=hrByMonth.reduce(function(s,v){return s+v;},0);

  // ── Sync tháng selector
  var mfSel=$('rpt-month-filter');
  if(mfSel) mfSel.innerHTML='<option value="all">📅 Cả năm</option>'
    +monthNames.map(function(n,i){return '<option value="'+i+'">'+n+'</option>';}).join('');

  // ── KPI Cards (premium style)
  var prevTpTotal=0; // would need prev year data — skip trend for now
  var cards=[
    {label:'Tổng TP hủy',sub:'Năm '+yr,val:tpTotal+' ly',color:'#dc2626',grad:'linear-gradient(135deg,#fef2f2,#fecaca)',icon:'🗑️',trend:''},
    {label:'Tháng hủy cao nhất',sub:tpPeak>0?monthNames[tpPeakIdx]:'–',val:tpPeak>0?tpPeak+' ly':'Chưa có',color:'#b91c1c',grad:'linear-gradient(135deg,#fff1f2,#ffe4e6)',icon:'📈',trend:''},
    {label:'NL hủy (tổng SL)',sub:'Quy đổi cả năm',val:rptFmt(nlTotal),color:'#b45309',grad:'linear-gradient(135deg,#fffbeb,#fde68a)',icon:'📦',trend:''},
    {label:'Mặt hàng NL hủy',sub:'Tổng lượt mặt hàng',val:nlItemsByMonth.reduce(function(s,v){return s+v;},0),color:'#d97706',grad:'linear-gradient(135deg,#fefce8,#fef9c3)',icon:'🏷️',trend:''},
    {label:'Lượt đánh giá NS',sub:'Năm '+yr,val:hrTotal+' lượt',color:'#2d7a2d',grad:'linear-gradient(135deg,#f0fdf4,#dcfce7)',icon:'👥',trend:''},
    {label:'Lý do hủy #1',sub:'Thành phẩm',val:(function(){if(!tpReasonYr.length)return '–';var mx=tpReasonYr.reduce(function(a,b){return a.val>=b.val?a:b;});return mx.name;}()),color:'#7c3aed',grad:'linear-gradient(135deg,#faf5ff,#ede9fe)',icon:'📋',trend:''},
  ];
  var kpiEl=$('rpt-kpi-cards');
  if(kpiEl) kpiEl.innerHTML=cards.map(function(c){
    return '<div style="background:'+c.grad+';border-radius:16px;padding:18px 16px;border:1px solid rgba(0,0,0,.06);position:relative;overflow:hidden;">'
      +'<div style="font-size:26px;margin-bottom:8px;">'+c.icon+'</div>'
      +'<div style="font-size:20px;font-weight:800;color:'+c.color+';font-family:Lato,sans-serif;line-height:1.1;word-break:break-word;">'+c.val+'</div>'
      +'<div style="font-size:12px;font-weight:700;color:#333;margin-top:4px;">'+c.label+'</div>'
      +'<div style="font-size:10px;color:#999;margin-top:2px;">'+c.sub+'</div>'
      +'</div>';
  }).join('');

  // ── Charts
  var rColors=['#dc2626','#f97316','#f59e0b','#84cc16','#06b6d4','#8b5cf6','#ec4899','#14b8a6'];

  destroyChart('rpt-chart-hr');
  var ctxHr=$('rpt-chart-hr');
  if(ctxHr){
    _rptCharts['rpt-chart-hr']=new Chart(ctxHr,{
      type:'doughnut',
      data:{
        labels:tpReasonYr.length?tpReasonYr.map(function(x){return x.name;}):['Chưa có dữ liệu'],
        datasets:[{data:tpReasonYr.length?tpReasonYr.map(function(x){return x.val;}):[1],
          backgroundColor:rColors,borderWidth:3,borderColor:'#fff',hoverBorderWidth:0}]
      },
      options:{responsive:true,cutout:'60%',plugins:{
        legend:{position:'bottom',labels:{font:{size:10,weight:'bold'},boxWidth:10,padding:8}},
        tooltip:{callbacks:{label:function(c){var t=c.dataset.data.reduce(function(a,b){return a+b;},0);return ' '+c.label+': '+c.raw+' ('+Math.round(c.raw/t*100)+'%)'; }}}
      }}
    });
  }

  destroyChart('rpt-chart-wp');
  var ctxWp=$('rpt-chart-wp');
  if(ctxWp){
    _rptCharts['rpt-chart-wp']=new Chart(ctxWp,{
      type:'bar',
      data:{labels:monthLabels,datasets:[{label:'Số ly hủy',data:tpByMonth,
        backgroundColor:tpByMonth.map(function(v){return v===tpPeak&&tpPeak>0?'rgba(220,38,38,1)':'rgba(220,38,38,0.55)';}),
        borderRadius:6,borderWidth:0}]},
      options:{responsive:true,plugins:{legend:{display:false},tooltip:{callbacks:{title:function(c){return monthNames[c[0].dataIndex];}}}},
        scales:{y:{beginAtZero:true,grid:{color:'rgba(0,0,0,.05)'},ticks:{font:{size:10}}},x:{grid:{display:false},ticks:{font:{size:10,weight:'bold'}}}}}
    });
  }

  destroyChart('rpt-chart-wm');
  var ctxWm=$('rpt-chart-wm');
  if(ctxWm){
    _rptCharts['rpt-chart-wm']=new Chart(ctxWm,{
      type:'bar',
      data:{labels:monthLabels,datasets:[{label:'Số mặt hàng',data:nlItemsByMonth,
        backgroundColor:'rgba(180,83,9,0.6)',borderRadius:6,borderWidth:0},
        {label:'Tổng SL',data:nlByMonth,type:'line',borderColor:'#d97706',
        backgroundColor:'rgba(217,119,6,.1)',borderWidth:2,pointRadius:3,fill:true,tension:.4,yAxisID:'y1'}]},
      options:{responsive:true,plugins:{legend:{position:'top',labels:{font:{size:10},boxWidth:10}}},
        scales:{
          y:{beginAtZero:true,grid:{color:'rgba(0,0,0,.05)'},ticks:{font:{size:10}}},
          y1:{position:'right',beginAtZero:true,grid:{display:false},ticks:{font:{size:10}}},
          x:{grid:{display:false},ticks:{font:{size:10,weight:'bold'}}}
        }}
    });
  }

  destroyChart('rpt-chart-waste');
  var ctxWaste=$('rpt-chart-waste');
  if(ctxWaste){
    _rptCharts['rpt-chart-waste']=new Chart(ctxWaste,{
      type:'bar',
      data:{labels:monthLabels,datasets:[{label:'Người được đánh giá',data:hrByMonth,
        backgroundColor:'rgba(45,122,45,0.65)',borderRadius:6,borderWidth:0}]},
      options:{responsive:true,plugins:{legend:{display:false}},
        scales:{y:{beginAtZero:true,grid:{color:'rgba(0,0,0,.05)'},ticks:{font:{size:10},stepSize:1}},
          x:{grid:{display:false},ticks:{font:{size:10,weight:'bold'}}}}}
    });
  }

  // Month detail + Employee
  rptRenderMonthDetail();
  rptBuildEmpSelector(yr, months);
}

// Format số lớn
function rptFmt(n){
  if(!n) return '0';
  if(n>=1000000) return (n/1000000).toFixed(1)+'M';
  if(n>=1000) return (n/1000).toFixed(1)+'K';
  return String(Math.round(n));
}

// ── Month detail: TP & NL hủy lọc theo tháng
function rptRenderMonthDetail(){
  var mfSel=$('rpt-month-filter');
  var yrSel=$('rpt-year');
  var container=$('rpt-month-detail');
  if(!mfSel||!yrSel||!container) return;

  var mVal=mfSel.value;
  var yr=parseInt(yrSel.value)||new Date().getFullYear();
  var tphMainData=tphMainLoad();
  var wmData=wmLoadData();
  var MN=['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
          'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];

  var cols = mVal==='all'
    ? [0,1,2,3,4,5,6,7,8,9,10,11]
    : [parseInt(mVal)];

  var periodLabel = mVal==='all' ? 'Cả năm '+yr : MN[parseInt(mVal)]+' '+yr;
  var showTotal   = mVal==='all';

    // THÀNH PHẨM HỦY
    var tpHtml='';
  if(tphMainData && tphMainData.length>0){
    var tpRows=tphMainData.filter(function(r){
      return cols.some(function(ci){return (r.months[ci]||0)>0;});
    });
    if(tpRows.length>0){
      var tpColTotals=cols.map(function(ci){
        return tpRows.reduce(function(s,r){return s+(r.months[ci]||0);},0);
      });
      var tpGrand=tpColTotals.reduce(function(s,v){return s+v;},0);

      var tpParts=[];
      tpParts.push('<div style="background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 4px 20px rgba(220,38,38,.08);border:1px solid #fecaca;margin-bottom:16px;">');
      tpParts.push('<div style="background:linear-gradient(135deg,#b91c1c,#dc2626);padding:14px 20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">');
      tpParts.push('<div style="color:#fff;"><span style="font-size:15px;">🗑️</span>');
      tpParts.push(' <span style="font-family:Lato,sans-serif;font-weight:700;font-size:14px;">THÀNH PHẨM HỦY</span>');
      tpParts.push('<span style="font-size:11px;opacity:.75;margin-left:8px;">'+periodLabel+'</span></div>');
      tpParts.push('<div style="background:rgba(255,255,255,.2);border-radius:20px;padding:4px 14px;color:#fff;font-size:12px;font-weight:700;">Tổng: '+tpGrand+' ly</div>');
      tpParts.push('</div>');
      tpParts.push('<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:12px;">');
      tpParts.push('<thead><tr>');
      tpParts.push('<th style="padding:10px 14px;background:#fef2f2;color:#991b1b;font-weight:700;text-align:left;min-width:180px;position:sticky;left:0;z-index:1;">Tên sản phẩm</th>');
      cols.forEach(function(ci){
        tpParts.push('<th style="padding:10px 12px;background:#fef2f2;color:#991b1b;font-weight:700;text-align:center;min-width:80px;">'+MN[ci]+'</th>');
      });
      if(showTotal) tpParts.push('<th style="padding:10px 12px;background:#fee2e2;color:#991b1b;font-weight:700;text-align:center;min-width:72px;">Tổng</th>');
      tpParts.push('</tr></thead><tbody>');
      tpRows.forEach(function(r,idx){
        var rowTotal=cols.reduce(function(s,ci){return s+(r.months[ci]||0);},0);
        var bg=idx%2===0?'#fff':'#fff8f8';
        tpParts.push('<tr style="background:'+bg+';">');
        tpParts.push('<td style="padding:9px 14px;font-weight:600;color:#1a1a1a;position:sticky;left:0;background:'+bg+';border-bottom:1px solid #fce7f3;">'+r.name+'</td>');
        cols.forEach(function(ci){
          var v=r.months[ci]||0;
          var c=v>0?'#dc2626':'#ccc';
          var fw=v>0?'700':'400';
          tpParts.push('<td style="padding:9px 12px;text-align:center;border-bottom:1px solid #fce7f3;color:'+c+';font-weight:'+fw+';">'+(v>0?v:'–')+'</td>');
        });
        if(showTotal) tpParts.push('<td style="padding:9px 12px;text-align:center;border-bottom:1px solid #fce7f3;font-weight:800;color:#b91c1c;">'+rowTotal+'</td>');
        tpParts.push('</tr>');
      });
      tpParts.push('<tr style="background:#fef2f2;">');
      tpParts.push('<td style="padding:10px 14px;font-weight:800;color:#991b1b;position:sticky;left:0;background:#fef2f2;">⊕ TỔNG CỘNG</td>');
      tpColTotals.forEach(function(v){
        tpParts.push('<td style="padding:10px 12px;text-align:center;font-weight:800;color:#dc2626;font-size:13px;">'+v+'</td>');
      });
      if(showTotal) tpParts.push('<td style="padding:10px 12px;text-align:center;font-weight:800;color:#dc2626;font-size:14px;">'+tpGrand+'</td>');
      tpParts.push('</tr></tbody></table></div></div>');
      tpHtml=tpParts.join('');
    } else {
      tpHtml='<div style="background:#fff;border-radius:18px;border:1px solid #fecaca;padding:16px 20px;margin-bottom:16px;text-align:center;color:#aaa;font-size:13px;">🗑️ Không có dữ liệu thành phẩm hủy cho khoảng thời gian này</div>';
    }
  }

    // NGUYÊN LIỆU HỦY
    var nlHtml='';
  if(wmData && wmData.length>0){
    var nlRows=wmData.filter(function(r){
      return cols.some(function(ci){return (r.months[ci]||0)>0;});
    });
    if(nlRows.length>0){
      var nlColTotals=cols.map(function(ci){
        return nlRows.reduce(function(s,r){return s+(r.months[ci]||0);},0);
      });
      var nlGrand=nlColTotals.reduce(function(s,v){return s+v;},0);

      var nlParts=[];
      nlParts.push('<div style="background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 4px 20px rgba(180,83,9,.08);border:1px solid #fed7aa;margin-bottom:16px;">');
      nlParts.push('<div style="background:linear-gradient(135deg,#92400e,#b45309);padding:14px 20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">');
      nlParts.push('<div style="color:#fff;"><span style="font-size:15px;">📦</span>');
      nlParts.push(' <span style="font-family:Lato,sans-serif;font-weight:700;font-size:14px;">NGUYÊN LIỆU HỦY</span>');
      nlParts.push('<span style="font-size:11px;opacity:.75;margin-left:8px;">'+periodLabel+'</span></div>');
      nlParts.push('<div style="background:rgba(255,255,255,.2);border-radius:20px;padding:4px 14px;color:#fff;font-size:12px;font-weight:700;">Tổng: '+rptFmt(nlGrand)+'</div>');
      nlParts.push('</div>');
      nlParts.push('<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:12px;">');
      nlParts.push('<thead><tr>');
      nlParts.push('<th style="padding:10px 14px;background:#fffbeb;color:#92400e;font-weight:700;text-align:left;min-width:180px;position:sticky;left:0;z-index:1;">Tên nguyên liệu</th>');
      nlParts.push('<th style="padding:10px 12px;background:#fffbeb;color:#92400e;font-weight:700;text-align:center;min-width:60px;">ĐVT</th>');
      cols.forEach(function(ci){
        nlParts.push('<th style="padding:10px 12px;background:#fffbeb;color:#92400e;font-weight:700;text-align:center;min-width:80px;">'+MN[ci]+'</th>');
      });
      if(showTotal) nlParts.push('<th style="padding:10px 12px;background:#fef3c7;color:#92400e;font-weight:700;text-align:center;min-width:72px;">Tổng</th>');
      nlParts.push('</tr></thead><tbody>');
      nlRows.forEach(function(r,idx){
        var rowTotal=cols.reduce(function(s,ci){return s+(r.months[ci]||0);},0);
        var bg=idx%2===0?'#fff':'#fffdf5';
        nlParts.push('<tr style="background:'+bg+';">');
        nlParts.push('<td style="padding:9px 14px;font-weight:600;color:#1a1a1a;position:sticky;left:0;background:'+bg+';border-bottom:1px solid #fef3c7;">'+r.name+'</td>');
        nlParts.push('<td style="padding:9px 12px;text-align:center;border-bottom:1px solid #fef3c7;color:#888;font-size:11px;">'+(r.unit||'–')+'</td>');
        cols.forEach(function(ci){
          var v=r.months[ci]||0;
          var c=v>0?'#b45309':'#ccc';
          var fw=v>0?'700':'400';
          nlParts.push('<td style="padding:9px 12px;text-align:center;border-bottom:1px solid #fef3c7;color:'+c+';font-weight:'+fw+';">'+(v>0?rptFmt(v):'–')+'</td>');
        });
        if(showTotal) nlParts.push('<td style="padding:9px 12px;text-align:center;border-bottom:1px solid #fef3c7;font-weight:800;color:#92400e;">'+rptFmt(rowTotal)+'</td>');
        nlParts.push('</tr>');
      });
      nlParts.push('<tr style="background:#fffbeb;">');
      nlParts.push('<td style="padding:10px 14px;font-weight:800;color:#92400e;position:sticky;left:0;background:#fffbeb;">⊕ TỔNG CỘNG</td>');
      nlParts.push('<td style="padding:10px 12px;"></td>');
      nlColTotals.forEach(function(v){
        nlParts.push('<td style="padding:10px 12px;text-align:center;font-weight:800;color:#b45309;font-size:13px;">'+rptFmt(v)+'</td>');
      });
      if(showTotal) nlParts.push('<td style="padding:10px 12px;text-align:center;font-weight:800;color:#92400e;font-size:14px;">'+rptFmt(nlGrand)+'</td>');
      nlParts.push('</tr></tbody></table></div></div>');
      nlHtml=nlParts.join('');
    } else {
      nlHtml='<div style="background:#fff;border-radius:18px;border:1px solid #fed7aa;padding:16px 20px;margin-bottom:16px;text-align:center;color:#aaa;font-size:13px;">📦 Không có dữ liệu nguyên liệu hủy cho khoảng thời gian này</div>';
    }
  }

  container.innerHTML=(tpHtml||'')+(nlHtml||'');
}


function rptBuildEmpSelector(yr, months){
  var sel=$('rpt-emp-select');
  if(!sel) return;
  var allNames={};
  months.forEach(function(mk){
    (loadModuleData('hr_eval')[mk]||[]).forEach(function(r){
      if(r.name&&r.name.trim()) allNames[r.name.trim()]=true;
    });
  });
  if(typeof employeesData!=='undefined') employeesData.forEach(function(e){
    if(e.name) allNames[e.name.trim()]=true;
  });
  var currentVal=sel.value;
  sel.innerHTML='<option value="">— Chọn nhân viên —</option>'
    +Object.keys(allNames).sort().map(function(n){
      return '<option value="'+n+'"'+(n===currentVal?' selected':'')+'>'+n+'</option>';
    }).join('');
  sel.dataset.yr=yr;
  if(currentVal && allNames[currentVal]) rptShowEmpDetail();
}

function rptShowEmpDetail(){
  var sel=$('rpt-emp-select');
  if(!sel||!sel.value) {
    var d=$('rpt-emp-detail');
    if(d) d.innerHTML='<div style="color:#aaa;text-align:center;padding:20px;font-size:13px;">Chọn nhân viên để xem đánh giá 12 tháng</div>';
    return;
  }
  var name=sel.value;
  var yr=parseInt(sel.dataset.yr)||new Date().getFullYear();
  var detail=$('rpt-emp-detail');
  if(!detail) return;

  // Employee base info
  var empInfo=null;
  if(typeof employeesData!=='undefined') empInfo=employeesData.find(function(e){return e.name.trim()===name;});

  // Get evaluation for each month
  var months=Array.from({length:12},function(_,i){
    var m=i+1;
    return yr+'-'+(m<10?'0'+m:m);
  });
  var evalByMonth=months.map(function(mk){
    var rows=loadModuleData('hr_eval')[mk]||[];
    return rows.find(function(r){return r.name&&r.name.trim()===name;})||null;
  });
  var hasAny=evalByMonth.some(function(x){return x;});

  // ── Employee header card
  var headerHtml='<div style="background:linear-gradient(135deg,#1e5c1e,var(--green));border-radius:14px;padding:16px 20px;color:#fff;margin-bottom:18px;display:flex;align-items:center;gap:16px;flex-wrap:wrap;">'
    +'<div style="width:50px;height:50px;border-radius:50%;background:rgba(255,255,255,.25);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;flex-shrink:0;">'+name.split(' ').pop().charAt(0)+'</div>'
    +'<div style="flex:1;min-width:160px;">'
      +'<div style="font-weight:700;font-size:17px;font-family:Lato,sans-serif;">'+name+'</div>'
      +(empInfo?'<div style="font-size:12px;opacity:.85;margin-top:3px;">'+empInfo.role+' · Bậc '+empInfo.rank+' · '+empInfo.shift+' · <span style="background:rgba(255,255,255,.2);padding:2px 8px;border-radius:10px;">'+empInfo.status+'</span></div>':'')
    +'</div>';

  // Summary stats
  var totalDt=evalByMonth.reduce(function(s,ev){return s+(ev&&ev.diemtru?parseFloat(ev.diemtru)||0:0);},0);
  var evalCount=evalByMonth.filter(function(x){return x;}).length;
  headerHtml+='<div style="display:flex;gap:12px;flex-wrap:wrap;">'
    +'<div style="background:rgba(255,255,255,.15);border-radius:10px;padding:10px 14px;text-align:center;min-width:80px;">'
      +'<div style="font-size:20px;font-weight:700;">'+evalCount+'/12</div>'
      +'<div style="font-size:10px;opacity:.8;margin-top:2px;">Tháng đánh giá</div>'
    +'</div>'
    +'<div style="background:rgba(255,255,255,.15);border-radius:10px;padding:10px 14px;text-align:center;min-width:80px;">'
      +'<div style="font-size:20px;font-weight:700;">'+totalDt.toFixed(1)+'</div>'
      +'<div style="font-size:10px;opacity:.8;margin-top:2px;">Tổng điểm trừ</div>'
    +'</div>'
    +(empInfo?'<div style="background:rgba(255,255,255,.15);border-radius:10px;padding:10px 14px;text-align:center;min-width:80px;">'
      +'<div style="font-size:20px;font-weight:700;">'+empInfo.rank+'</div>'
      +'<div style="font-size:10px;opacity:.8;margin-top:2px;">Bậc hiện tại</div>'
    +'</div>':'')
  +'</div></div>';

  if(!hasAny){
    detail.innerHTML=headerHtml+'<div style="background:#f9f9f9;border-radius:12px;padding:24px;text-align:center;color:#aaa;font-size:13px;">Chưa có dữ liệu đánh giá trong năm '+yr+' cho nhân viên này</div>';
    return;
  }

  // ── Full 12-month evaluation table
  var fields=[
    {key:'nq',label:'Chấp hành NQ',w:'180px'},
    {key:'kn',label:'Kỹ năng CM',w:'130px'},
    {key:'gt',label:'Giao tiếp',w:'160px'},
    {key:'tn',label:'Trách nhiệm',w:'90px'},
    {key:'td',label:'Thái độ',w:'80px'},
    {key:'pc',label:'Thành Phẩm Hủy',w:'70px'},
    {key:'diemtru',label:'Điểm trừ',w:'75px'},
    {key:'note',label:'Ghi chú',w:'150px'}
  ];

  var th='<th style="padding:9px 10px;background:#2d7a2d;color:#fff;font-size:11px;font-weight:700;text-align:left;min-width:110px;position:sticky;left:0;z-index:2;">Tiêu chí / Tháng</th>'
    +Array.from({length:12},function(_,i){
      var ev=evalByMonth[i];
      var bg=ev?'#2d7a2d':'#888';
      return '<th style="padding:9px 8px;background:'+bg+';color:#fff;font-size:11px;font-weight:700;text-align:center;min-width:90px;">T'+(i+1)+(ev?'':' —')+'</th>';
    }).join('');

  var tbody=fields.map(function(f,fi){
    var bg=fi%2===0?'#fff':'#f9fef7';
    var cells=fields.map(function(){}); // placeholder
    var tds=Array.from({length:12},function(_,mi){
      var ev=evalByMonth[mi];
      var val=ev?ev[f.key]:'';
      var disp='<span style="color:#ddd;font-size:11px;">–</span>';
      if(val&&String(val).trim()&&val!=='nan'&&val!=='undefined'){
        if(f.key==='diemtru'){
          disp='<span style="color:#dc2626;font-weight:700;font-size:12px;">-'+val+'</span>';
        } else if(f.key==='pc'){
          disp='<span style="color:#2d7a2d;font-weight:700;font-size:12px;">'+val+'</span>';
        } else {
          var s=String(val);
          var isOk=s.toLowerCase().indexOf('đạt')>=0||s.toLowerCase().indexOf('tốt')>=0||s.toLowerCase().indexOf('đúng')>=0;
          var isNo=s.toLowerCase().indexOf('chưa')>=0||s.toLowerCase().indexOf('không')>=0;
          if(isOk) disp='<div style="background:#dcfce7;color:#16a34a;border-radius:8px;padding:3px 6px;font-size:10px;font-weight:700;text-align:center;">✓ Đạt</div>';
          else if(isNo) disp='<div style="background:#fef9c3;color:#b45309;border-radius:8px;padding:3px 6px;font-size:10px;font-weight:700;text-align:center;">⚠ Cần cải thiện</div>';
          else {
            var short=s.length>20?s.substring(0,18)+'…':s;
            disp='<div title="'+s.replace(/"/g,"'")+'" style="font-size:10px;color:#555;text-align:left;line-height:1.4;">'+short+'</div>';
          }
        }
      }
      var cellBg=ev?bg:'#fafafa';
      return '<td style="padding:7px 8px;background:'+cellBg+';border-bottom:1px solid #edf5e9;vertical-align:top;">'+disp+'</td>';
    }).join('');
    return '<tr>'
      +'<td style="padding:7px 10px;background:'+bg+';font-weight:700;font-size:12px;border-bottom:1px solid #edf5e9;position:sticky;left:0;z-index:1;min-width:110px;">'+f.label+'</td>'
      +tds
      +'</tr>';
  }).join('');

  var tableHtml='<div style="overflow-x:auto;border-radius:12px;border:1.5px solid var(--border);">'
    +'<table style="width:100%;border-collapse:collapse;font-size:12px;min-width:800px;">'
    +'<thead><tr>'+th+'</tr></thead>'
    +'<tbody>'+tbody+'</tbody>'
    +'</table></div>';

  detail.innerHTML=headerHtml+tableHtml;
}

// ── Init all month selects on page load ──
document.addEventListener('DOMContentLoaded', function(){
  ['hr-eval-month','wm-month'].forEach(function(id){
    populateMonthSelect(id);
  });
  rptPopulateYear();
});

// ── Re-render when section becomes active ──
(function(){
  var _origNav=window.navTo||null;
  document.addEventListener('click',function(e){
    var btn=e.target.closest('.nav-item[data-target]');
    if(!btn) return;
    var t=btn.getAttribute('data-target');
    setTimeout(function(){
      if(t==='hr-eval') hrEvalRender();
      else if(t==='waste-material'){ wmRender(); tphMainRender(); }
      else if(t==='food-staff') tphRender();
      else if(t==='report-overview') rptRender();
    },80);
  });
})();


// ONEDRIVE SYNC — Auth Code PKCE + Netlify Function proxy

var OD_CLIENT_ID   = '831b5ce3-e3df-40ff-9b79-0ed9c5520eae';
var OD_REDIRECT    = 'https://qlch2026zen.pages.dev/';
var OD_TENANT      = '369de972-20f4-410c-b48e-2c238bbd9b79';
var OD_SCOPES      = 'Files.Read User.Read';
var _odToken       = null;

// Map chi nhánh → tên file OneDrive
var OD_BRANCH_FILES = {
  'ntmk': 'Topping_Sài Gòn 2 (NTMK).xlsx',
  'vvn':  'Topping_Sài Gòn 4 (VVN).xlsx',
  'pxl':  'Topping_Sài Gòn 3 (PXL).xlsx',
  'nth':  'Topping_Sài Gòn (NTH).xlsx'
};
var OD_SHEET = 'SG2';

// ── PKCE ────────────────────────────────────────────────────────