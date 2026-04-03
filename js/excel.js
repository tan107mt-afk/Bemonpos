/* ═══════════════════════════════════════════════════
   ZENTEA – Excel PKCE, Graph API, TPH table
   File: js/excel.js
═══════════════════════════════════════════════════ */

async function odGeneratePKCE(){
  var arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  var verifier = btoa(String.fromCharCode.apply(null,arr)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');
  var buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  var challenge = btoa(String.fromCharCode.apply(null,new Uint8Array(buf))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');
  return {verifier, challenge};
}

// ── Popup Auth ──────────────────────────────────────────────────
async function odGetTokenViaPopup(){
  var pkce = await odGeneratePKCE();
  var state = Math.random().toString(36).slice(2);
  sessionStorage.setItem('od_pkce_verifier', pkce.verifier);
  sessionStorage.setItem('od_state', state);
  var authUrl = 'https://login.microsoftonline.com/'+OD_TENANT+'/oauth2/v2.0/authorize'
    +'?client_id='+OD_CLIENT_ID
    +'&response_type=code'
    +'&redirect_uri='+encodeURIComponent(OD_REDIRECT)
    +'&scope='+encodeURIComponent(OD_SCOPES+' offline_access')
    +'&code_challenge='+pkce.challenge
    +'&code_challenge_method=S256'
    +'&state='+state
    +'&prompt=select_account';
  return new Promise(function(resolve, reject){
    var popup = window.open(authUrl,'ms_auth','width=520,height=620,left=200,top=100');
    if(!popup){ reject(new Error('Popup bị chặn — cho phép popup cho trang này')); return; }
    var timer = setInterval(function(){
      try {
        if(popup.closed){ clearInterval(timer); reject(new Error('Đóng cửa sổ đăng nhập sớm')); return; }
        var url = popup.location.href;
        if(url && url.startsWith(OD_REDIRECT)){
          clearInterval(timer); popup.close();
          var params = new URL(url).searchParams;
          var code = params.get('code');
          if(!code){ reject(new Error(params.get('error_description')||'Không lấy được code')); return; }
          resolve(code);
        }
      } catch(e){}
    }, 300);
    setTimeout(function(){ clearInterval(timer); if(!popup.closed) popup.close(); reject(new Error('Hết thời gian đăng nhập')); }, 120000);
  });
}

async function odExchangeCode(code){
  var verifier = sessionStorage.getItem('od_pkce_verifier');
  var res = await fetch('https://login.microsoftonline.com/'+OD_TENANT+'/oauth2/v2.0/token',{
    method:'POST',
    headers:{'Content-Type':'application/x-www-form-urlencoded'},
    body:'client_id='+OD_CLIENT_ID+'&grant_type=authorization_code&code='+encodeURIComponent(code)+'&redirect_uri='+encodeURIComponent(OD_REDIRECT)+'&code_verifier='+encodeURIComponent(verifier)
  });
  var d = await res.json();
  if(!d.access_token) throw new Error(d.error_description||d.error||'Token exchange failed');
  return d.access_token;
}

// ── Read Excel from Graph API ────────────────────────────────────
async function odReadExcelFromOneDrive(token, fileName) {
  // Search for file
  var encoded = btoa(unescape(encodeURIComponent('https://tominhvn-my.sharepoint.com/:x:/g/personal/tructhuyen_tominh_vn/'))).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');

  // Search by name in drive
  var sr = await fetch(
    'https://graph.microsoft.com/v1.0/me/drive/root/search(q=\''+encodeURIComponent(fileName)+'\')?$select=name,id&$top=5',
    { headers: { Authorization: 'Bearer '+token, Accept: 'application/json' } }
  );
  if(sr.status===401){ _odToken=null; throw new Error('Token hết hạn — nhấn đồng bộ lại'); }
  if(!sr.ok) throw new Error('Không tìm được file ('+sr.status+')');
  var sd = await sr.json();
  var found = (sd.value||[]).find(function(f){ return f.name===fileName; });
  if(!found) throw new Error('Không tìm thấy file: '+fileName);

  // Download file
  var dr = await fetch(
    'https://graph.microsoft.com/v1.0/me/drive/items/'+found.id+'/content',
    { headers: { Authorization: 'Bearer '+token } }
  );
  if(!dr.ok) throw new Error('Không tải được file ('+dr.status+')');
  var blob = await dr.blob();

  // Read as base64
  var b64 = await new Promise(function(res,rej){
    var reader=new FileReader();
    reader.onload=function(e){res(e.target.result.split(',')[1]);};
    reader.onerror=rej;
    reader.readAsDataURL(blob);
  });

  // Load SheetJS if needed
  if(typeof XLSX==='undefined'||typeof XLSX.read!=='function'){
    await new Promise(function(res,rej){
      var s=document.createElement('script');
      s.src='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
      s.onload=res; s.onerror=rej;
      document.head.appendChild(s);
    });
  }

  // Parse
  var wb = XLSX.read(b64,{type:'base64',cellDates:true});
  var sheetName = wb.SheetNames.find(function(n){return n.toUpperCase()===OD_SHEET.toUpperCase();})||wb.SheetNames[0];
  var ws = wb.Sheets[sheetName];
  var rows = XLSX.utils.sheet_to_json(ws,{header:1,defval:null});

  // Process: group by NL name, sum by month
  var grouped = {};
  for(var i=1;i<rows.length;i++){
    var row=rows[i];
    if(!row||row[0]==null) continue;
    var phanLoai=String(row[2]||'').toLowerCase();
    if(phanLoai==='nước_tea'||phanLoai==='nuoc_tea') continue;
    var tenNL=String(row[4]||'').trim();
    if(!tenNL||tenNL==='null') continue;
    var sl=parseFloat(row[9])||0;
    if(sl<=0) continue;
    var ngay=row[0]; var thang=0;
    if(ngay instanceof Date) thang=ngay.getMonth()+1;
    else if(typeof ngay==='number'){var d=new Date(Math.round((ngay-25569)*86400000));thang=d.getMonth()+1;}
    if(thang<1||thang>12) continue;
    var dvt=String(row[5]||'Gram').trim();
    var key=tenNL.toLowerCase()+'||'+dvt.toLowerCase();
    if(!grouped[key]) grouped[key]={name:tenNL,unit:dvt,months:new Array(12).fill(0)};
    grouped[key].months[thang-1]+=sl;
  }

  var result=Object.values(grouped).filter(function(r){return r.months.some(function(v){return v>0;});});
  result.sort(function(a,b){return a.name.localeCompare(b.name,'vi');});
  result.forEach(function(r){r.months=r.months.map(function(v){return Math.round(v*100)/100;});});
  return {data:result, sheet:sheetName, rows:rows.length-1};
}

// ── TPH MAIN TABLE (embedded in waste-material) ──────────────
var TPH_MAIN_KEY = 'zentea-tph-main';

function tphMainLoad(){
  try{
    var r = localStorage.getItem(branchKey(TPH_MAIN_KEY));
    if(r){ var d=JSON.parse(r); if(Array.isArray(d)) return d; }
    return [];
  } catch(e){ return []; }
}
function tphMainSave(d){
  try{ localStorage.setItem(branchKey(TPH_MAIN_KEY), JSON.stringify(d)); } catch(e){}
}

function tphMainRender(){
  var data = tphMainLoad();
  var tbody = $('tph-main-tbody');
  var tfoot = $('tph-main-tfoot');
  if(!tbody) return;

  // ── Luôn populate select trước (kể cả data rỗng) ──
  var tphSelEl = $('tph-cmp-sel');
  if(tphSelEl){
    var _cv = tphSelEl.value;
    var _o = '<option value="">-- Chọn thành phẩm --</option>';
    data.forEach(function(r,i){ _o += '<option value="'+i+'">'+(r.name||'')+'</option>'; });
    tphSelEl.innerHTML = _o;
    if(_cv && data[parseInt(_cv)]) tphSelEl.value = _cv;
    if(tphSelEl.value) wmUpdateCompare('tph');
  }

  // ── Xử lý data rỗng ──
  if(data.length === 0){
    tbody.innerHTML = '<tr><td colspan="15" style="text-align:center;padding:32px;color:#bbb;font-size:13px;">Chưa có dữ liệu — nhấn <strong>☁ Nhập file Excel</strong> để tải lên</td></tr>';
    if(tfoot) tfoot.innerHTML = '';
    return;
  }

  // ── Sort ──
  var sortDir = window._tphSortDir || 0;
  var displayData = data.slice();
  if(sortDir === 1) displayData.sort(function(a,b){ return wmRowSum(a)-wmRowSum(b); });
  if(sortDir === 2) displayData.sort(function(a,b){ return wmRowSum(b)-wmRowSum(a); });

  var tdBase = 'padding:7px 8px;font-size:12px;border-bottom:1px solid #fee2e2;';
  var totals = [0,0,0,0,0,0,0,0,0,0,0,0];

  // ── Render rows ──
  tbody.innerHTML = displayData.map(function(row, ri){
    var bg = ri%2===0 ? '#fff' : '#fff8f8';
    var origIdx = data.indexOf(row);
    var cells = '<td contenteditable="true" style="'+tdBase+'background:'+bg+';font-weight:600;min-width:200px;position:sticky;left:0;z-index:1;" onblur="tphMainUpdateName('+origIdx+',this.innerText)">'+row.name+'</td>';
    for(var m=0; m<12; m++){
      var v = row.months[m]||0;
      if(v>0) totals[m]+=v;
      cells += '<td contenteditable="true" style="'+tdBase+'background:'+bg+';text-align:center;'+(v>0?'color:#1a1a1a;':'color:#ddd;')+'" onblur="tphMainUpdateCell('+origIdx+','+m+',this.innerText)">'+(v>0?v.toLocaleString('vi-VN'):'–')+'</td>';
    }
    cells += '<td style="'+tdBase+'background:'+bg+';text-align:center;color:#888;font-size:11px;">'+(row.unit||'Ly')+'</td>';
    cells += '<td style="'+tdBase+'background:'+bg+';text-align:center;"><button onclick="tphMainDelete('+origIdx+')" style="background:#fee2e2;border:none;border-radius:50%;width:24px;height:24px;cursor:pointer;color:#b91c1c;font-size:13px;line-height:1;">×</button></td>';
    return '<tr style="background:'+bg+';">'+cells+'</tr>';
  }).join('');

  // ── TỔNG footer ──
  if(tfoot){
    var ftd = 'padding:8px;font-size:12px;font-weight:700;background:#fee2e2;text-align:center;border-top:2px solid #fca5a5;';
    var fc = '<td style="'+ftd+'text-align:left;color:#b91c1c;position:sticky;left:0;z-index:2;background:#fee2e2;">TỔNG</td>';
    for(var m=0; m<12; m++){
      fc += '<td style="'+ftd+'color:'+(totals[m]>0?'#b91c1c':'#ddd')+'">'+(totals[m]>0?totals[m].toLocaleString('vi-VN'):'–')+'</td>';
    }
    fc += '<td style="background:#fee2e2;border-top:2px solid #fca5a5;"></td><td style="background:#fee2e2;border-top:2px solid #fca5a5;"></td>';
    tfoot.innerHTML = '<tr>'+fc+'</tr>';
  }
}


function tphMainUpdateName(ri, v){
  var d = tphMainLoad(); if(d[ri]) d[ri].name = v.trim(); tphMainSave(d);
}
function tphMainUpdateCell(ri, mi, v){
  var d = tphMainLoad();
  if(d[ri]) d[ri].months[mi] = parseFloat(String(v).replace(/[^\d.]/g,''))||0;
  tphMainSave(d); tphMainRender();
}
function tphMainDelete(ri){
  var d = tphMainLoad(); d.splice(ri,1); tphMainSave(d); tphMainRender();
}
function tphAddRow(){
  var name = prompt('Tên thành phẩm:',''); if(!name) return;
  var d = tphMainLoad();
  d.push({name:name.trim(), unit:'Ly', months:[0,0,0,0,0,0,0,0,0,0,0,0]});
  tphMainSave(d); tphMainRender();
}

function wmParseExcel(buf){
  return new Promise(function(resolve, reject){
    function doparse(){
      try {
        var wb = XLSX.read(new Uint8Array(buf), {type:'array'});
        var sheetName = 'SG2';
        if(!wb.Sheets[sheetName]) sheetName = wb.SheetNames[0];
        var sheet = wb.Sheets[sheetName];
        if(!sheet){ reject(new Error('Không tìm thấy sheet SG2')); return; }

        var rawRows = XLSX.utils.sheet_to_json(sheet, {header:1, defval:null, raw:true});
        var fmtRows = XLSX.utils.sheet_to_json(sheet, {header:1, defval:null, raw:false});
        console.log('[wmParse] Sheet:', sheetName, 'Total rows:', rawRows.length);

        var curYear = new Date().getFullYear();
        var nlMap = {};   // Nguyên Liệu Hủy: {name, unit, months[12]}
        var tphMap = {};  // Thành Phẩm Hủy (Nước_tea): {name, unit, months[12]}
        var parsedNL = 0, parsedTPH = 0;

        for(var rowIdx = 1; rowIdx < rawRows.length; rowIdx++){
          var row = rawRows[rowIdx];
          var fmtRow = fmtRows[rowIdx] || [];
          if(!row || !Array.isArray(row)) continue;

          // Col: 0=Ngày, 2=Phân loại, 4=Tên, 5=ĐVT, 9=Hết hạn(NL), 12=Chủ quan(TPH)
          var phanLoai = String(row[2] != null ? row[2] : '').trim();
          var tenNL    = String(row[4] != null ? row[4] : '').trim();
          var dvt      = String(row[5] != null ? row[5] : '').trim();
          var isTPH    = phanLoai.toLowerCase() === 'nước_tea' || phanLoai.toLowerCase() === 'nuoc_tea';
          var slHuy    = isTPH ? ((parseFloat(row[10])||0) + (parseFloat(row[11])||0) + (parseFloat(row[12])||0))  // Test + Không đạt + Chủ quan
                               : (parseFloat(row[9])  || 0);  // Hết hạn cho NVL/Topping

          if(!tenNL || tenNL === 'Tên Nguyên liệu') continue;
          if(slHuy <= 0) continue;

          // Parse date
          var ngayRaw = row[0]; var ngayFmt = fmtRow[0]; var d = null;
          if(ngayRaw instanceof Date){ d = ngayRaw; }
          else if(typeof ngayRaw === 'number' && ngayRaw > 40000 && ngayRaw < 60000){
            d = new Date(Math.round((ngayRaw - 25569) * 86400 * 1000));
          } else {
            var s = String(ngayFmt || ngayRaw || '').trim();
            if(s){
              var m1 = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
              if(m1) d = new Date(+m1[3], +m1[1]-1, +m1[2]);
              if(!d){ var m2 = s.match(/^(\d{4})-(\d{2})-(\d{2})/); if(m2) d = new Date(+m2[1], +m2[2]-1, +m2[3]); }
              if(!d) d = new Date(s);
            }
          }
          if(!d || isNaN(d.getTime())) continue;
          if(d.getFullYear() !== curYear) continue;

          var mo = d.getMonth(); // 0-based
          var key = tenNL.toLowerCase() + '||' + dvt.toLowerCase();

          if(isTPH){
            if(!tphMap[key]) tphMap[key] = {name:tenNL, unit:dvt||'Ly', months:[0,0,0,0,0,0,0,0,0,0,0,0]};
            tphMap[key].months[mo] += slHuy;
            parsedTPH++;
          } else {
            if(!nlMap[key]) nlMap[key] = {name:tenNL, unit:dvt, months:[0,0,0,0,0,0,0,0,0,0,0,0]};
            nlMap[key].months[mo] += slHuy;
            parsedNL++;
          }
        }

        var nlResult  = Object.values(nlMap);
        var tphResult = Object.values(tphMap);
        console.log('[wmParse] NL:', nlResult.length, '(parsed:', parsedNL, ') | TPH:', tphResult.length, '(parsed:', parsedTPH, ')');

        if(nlResult.length === 0 && tphResult.length === 0){
          reject(new Error('Không tìm thấy dữ liệu năm ' + curYear));
          return;
        }
        resolve({ nl: nlResult, tph: tphResult });
      } catch(e){
        console.error('[wmParse] Error:', e.message, e.stack);
        reject(new Error('Lỗi đọc file: ' + e.message));
      }
    }
    if(typeof XLSX !== 'undefined'){ doparse(); return; }
    var s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    s.onload = doparse;
    s.onerror = function(){ reject(new Error('Không tải được thư viện đọc Excel')); };
    document.head.appendChild(s);
  });
}


function tphParseExcel(buf){
  return new Promise(function(resolve,reject){
    function doparse(){
      try{
        var wb=XLSX.read(new Uint8Array(buf),{type:'array'});
        var sheetName=wb.SheetNames[0];
        for(var i=0;i<wb.SheetNames.length;i++){
          var sn=wb.SheetNames[i].toLowerCase();
          if(sn==='sg2'||sn.includes('th\u00e0nh ph\u1ea9m')||sn.includes('tph')){sheetName=wb.SheetNames[i];break;}
        }
        var sheet=wb.Sheets[sheetName];
        if(!sheet){reject(new Error('Kh\u00f4ng t\u00ecm th\u1ea5y sheet'));return;}
        var rawRows=XLSX.utils.sheet_to_json(sheet,{header:1,defval:null,raw:true});
        var fmtRows=XLSX.utils.sheet_to_json(sheet,{header:1,defval:null,raw:false});
        console.log('[tphParse] Sheet:',sheetName,'Rows:',rawRows.length);

        // Detect columns from header row
        var headerRow=rawRows[0]||[];
        var colNgay=0,colTen=4,colDvt=5,colSL=9,colPhanLoai=-1;
        for(var c=0;c<headerRow.length;c++){
          var h=String(headerRow[c]||'').toLowerCase().trim();
          if(h.includes('ng\u00e0y')||h==='ngay') colNgay=c;
          else if((h.includes('t\u00ean')||h.includes('s\u1ea3n ph\u1ea9m'))&&!h.includes('nh\u00e2n')) colTen=c;
          else if(h.includes('\u0111\u01a1n v\u1ecb')||h==='dvt') colDvt=c;
          else if(h.includes('h\u1ebft h\u1ea1n')||h.includes('h\u1ee7y')) colSL=c;
          else if(h.includes('ph\u00e2n lo\u1ea1i')||h.includes('lo\u1ea1i')) colPhanLoai=c;
        }
        console.log('[tphParse] Cols: ngay='+colNgay+' ten='+colTen+' dvt='+colDvt+' sl='+colSL);

        var curYear=new Date().getFullYear();
        var map={};
        var parsed=0;

        for(var rowIdx=1;rowIdx<rawRows.length;rowIdx++){
          var row=rawRows[rowIdx];
          var fmtRow=fmtRows[rowIdx]||[];
          if(!row||!Array.isArray(row)) continue;

          var tenSP=String(row[colTen]!=null?row[colTen]:'').trim();
          var dvt=String(row[colDvt]!=null?row[colDvt]:'').trim();
          var slHuy=parseFloat(row[colSL])||0;

          if(colPhanLoai>=0){
            var pl=String(row[colPhanLoai]||'').toLowerCase().trim();
            if(pl==='n\u01b0\u1edbc_tea'||pl==='nuoc_tea') continue;
          }
          if(!tenSP||tenSP.length<2) continue;
          if(slHuy<=0) continue;

          var ngayRaw=row[colNgay];
          var ngayFmt=fmtRow[colNgay];
          var d=null;
          if(ngayRaw instanceof Date){d=ngayRaw;}
          else if(typeof ngayRaw==='number'&&ngayRaw>40000&&ngayRaw<60000){
            d=new Date(Math.round((ngayRaw-25569)*86400*1000));
          } else {
            var s=String(ngayFmt||ngayRaw||'').trim();
            if(s){
              var m1=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
              if(m1) d=new Date(+m1[3],+m1[1]-1,+m1[2]);
              if(!d){var m2=s.match(/^(\d{4})-(\d{2})-(\d{2})/);if(m2) d=new Date(+m2[1],+m2[2]-1,+m2[3]);}
              if(!d) d=new Date(s);
            }
          }
          if(!d||isNaN(d.getTime())) continue;
          if(d.getFullYear()!==curYear) continue;

          var mo=d.getMonth();
          var key=tenSP.toLowerCase();
          if(!map[key]) map[key]={name:tenSP,unit:dvt||'',months:[0,0,0,0,0,0,0,0,0,0,0,0]};
          map[key].months[mo]+=slHuy;
          parsed++;
        }

        var result=Object.values(map);
        console.log('[tphParse] Done:',result.length,'products, parsed:',parsed);
        if(result.length===0){
          reject(new Error('Kh\u00f4ng t\u00ecm th\u1ea5y d\u1eef li\u1ec7u n\u0103m '+curYear));
          return;
        }
        resolve(result);
      }catch(e){
        console.error('[tphParse] Error:',e.message);
        reject(new Error('L\u1ed7i \u0111\u1ecdc file: '+e.message));
      }
    }
    if(typeof XLSX!=='undefined'){doparse();return;}
    var s=document.createElement('script');
    s.src='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    s.onload=doparse;
    s.onerror=function(){reject(new Error('Kh\u00f4ng t\u1ea3i \u0111\u01b0\u1ee3c th\u01b0 vi\u1ec7n'));};
    document.head.appendChild(s);
  });
}

function tphSyncFile(){
  var btn=$('tph-sync-btn');
  if(!btn) return;
  var origHtml=btn.innerHTML;
  btn.disabled=true;
  var inp=document.createElement('input');
  inp.type='file';inp.accept='.xlsx,.xls,.xlsm';
  inp.style.display='none';
  document.body.appendChild(inp);
  inp.onchange=function(){
    var file=inp.files[0];
    document.body.removeChild(inp);
    if(!file){btn.disabled=false;btn.innerHTML=origHtml;return;}
    btn.innerHTML='\u23f3 \u0110ang \u0111\u1ecdc '+file.name+'...';
    var reader=new FileReader();
    reader.onload=function(e){
      tphParseExcel(e.target.result)
        .then(function(products){
          if(!products||products.length===0) throw new Error('Kh\u00f4ng \u0111\u1ecdc \u0111\u01b0\u1ee3c d\u1eef li\u1ec7u');
          tphMainSave(products);
          tphMainRender();
          btn.innerHTML='\u2705 Xong! ('+products.length+' SP)';
          btn.disabled=false;
          setTimeout(function(){btn.innerHTML=origHtml;btn.disabled=false;},3000);
          if(typeof showToast==='function') showToast('\u2705 \u0110\u00e3 nh\u1eadp','\u0110\u00e3 c\u1eadp nh\u1eadt '+products.length+' s\u1ea3n ph\u1ea9m h\u1ee7y t\u1eeb Excel');
        })
        .catch(function(err){
          btn.innerHTML='\u274c '+err.message;
          btn.disabled=false;
          setTimeout(function(){btn.innerHTML=origHtml;btn.disabled=false;},4000);
          if(typeof showToast==='function') showToast('\u274c L\u1ed7i \u0111\u1ecdc file',err.message);
        });
    };
    reader.readAsArrayBuffer(file);
  };
  inp.click();
}

function wmSyncOneDrive(){
  var btn=$('wm-sync-btn');
  var origHtml=btn.innerHTML;
  btn.disabled=true;

  // Tạo hidden file input để upload file Excel từ máy tính
  var inp = document.createElement('input');
  inp.type = 'file';
  inp.accept = '.xlsx,.xls,.xlsm';
  inp.style.display = 'none';
  document.body.appendChild(inp);

  inp.onchange = function(){
    var file = inp.files[0];
    document.body.removeChild(inp);
    if(!file){ btn.disabled=false; btn.innerHTML=origHtml; return; }

    btn.innerHTML='⏳ Đang đọc ' + file.name + '...';

    var reader = new FileReader();
    reader.onload = function(e){
      wmParseExcel(e.target.result)
        .then(function(result){
          var nlData = result.nl || [];
          var tphData = result.tph || [];
          if(nlData.length===0 && tphData.length===0) throw new Error('Không đọc được dữ liệu');
          if(nlData.length>0) wmSaveData(nlData);
          if(tphData.length>0) tphMainSave(tphData);
          wmRender();
          tphMainRender();
          btn.innerHTML='✅ Xong! (' + nlData.length + ' NL, ' + tphData.length + ' TP)';
          btn.disabled=false;
          setTimeout(function(){btn.innerHTML=origHtml;btn.disabled=false;},3000);
          if(typeof showToast==='function') showToast('✅ Đã nhập', nlData.length + ' NL, ' + tphData.length + ' TP từ ' + file.name);
        })
        .catch(function(err){
          btn.innerHTML='❌ Lỗi!';
          btn.disabled=false;
          setTimeout(function(){btn.innerHTML=origHtml;btn.disabled=false;},3000);
          alert('❌ Lỗi đọc file: ' + err.message);
        });
    };
    reader.onerror = function(){
      btn.innerHTML='❌ Lỗi!';
      btn.disabled=false;
      setTimeout(function(){btn.innerHTML=origHtml;btn.disabled=false;},3000);
      alert('❌ Không đọc được file');
    };
    reader.readAsArrayBuffer(file);
  };

  inp.oncancel = function(){
    document.body.removeChild(inp);
    btn.disabled=false;
    btn.innerHTML=origHtml;
  };

  // Mở file picker
  inp.click();

  // Fallback nếu oncancel không trigger
  setTimeout(function(){
    if(btn.disabled && inp.parentNode){
      document.body.removeChild(inp);
      btn.disabled=false;
      btn.innerHTML=origHtml;
    }
  }, 60000);
}


// TRAINING TABS + STATIC FLOWCHART DIAGRAMS

function switchTrainingTab(tab){
  ['hoinhap','cm','rank'].forEach(function(t){
    var panel = $('tpanel-'+t);
    var btn   = $('ttab-'+t);
    if(panel) panel.style.display = t===tab ? 'block' : 'none';
    if(btn){
      btn.style.background = t===tab ? 'var(--green)' : 'transparent';
      btn.style.color      = t===tab ? '#fff' : '#888';
    }
  });
  // Also show/hide edit button
  var editBtn = $('training-edit-btn');
  if(editBtn) editBtn.style.display = tab==='hoinhap' ? 'flex' : 'none';
  // Reset FC render target based on active tab
  if(tab==='hoinhap'){
    window._fcRenderTarget = 'training-diagram';
    window._fcSaveKey = typeof branchKey==='function' ? branchKey('zentea-flowchart') : 'zentea-flowchart';
    FC.nodes=[]; FC.edges=[];
    try{ var r=localStorage.getItem(window._fcSaveKey); if(r){var d=JSON.parse(r);FC.nodes=d.nodes||[];FC.edges=d.edges||[];} }catch(e){}
    setTimeout(function(){ fcLoad(); fcRender(); }, 60);
  }
  if(tab==='cm'){
    window._fcRenderTarget = 'cm-diagram';
    window._fcSaveKey = typeof branchKey==='function' ? branchKey('zentea-flowchart-cm') : 'zentea-flowchart-cm';
    FC.nodes=[]; FC.edges=[];
    try{ var r2=localStorage.getItem(window._fcSaveKey); if(r2){var d2=JSON.parse(r2);FC.nodes=d2.nodes||[];FC.edges=d2.edges||[];} }catch(e){}
    renderStaticDiagram('cm-diagram', CM_STEPS);
  }
  if(tab==='rank'){
    window._fcRenderTarget = 'rank-diagram';
    window._fcSaveKey = typeof branchKey==='function' ? branchKey('zentea-flowchart-rank') : 'zentea-flowchart-rank';
    FC.nodes=[]; FC.edges=[];
    try{ var r3=localStorage.getItem(window._fcSaveKey); if(r3){var d3=JSON.parse(r3);FC.nodes=d3.nodes||[];FC.edges=d3.edges||[];} }catch(e){}
    renderStaticDiagram('rank-diagram', RANK_STEPS);
  }
}

function staticDiagramTaller(id){
  var el=$(id);
  if(el) el.style.height=(parseInt(el.style.height||520)+120)+'px';
}
function staticDiagramShorter(id){
  var el=$(id);
  if(el){ var h=Math.max(200,parseInt(el.style.height||520)-120); el.style.height=h+'px'; }
}

// ── Process data from Excel ──
var CM_STEPS = [
  {label:'TIẾP NHẬN\nTHÔNG TIN', time:'1 ngày', color:'#1d4ed8', shape:'rect',
   desc:'Cập nhật thông tin trên Workflow. Xác nhận và sắp xếp lịch đào tạo.'},
  {label:'ĐÀO TẠO\nCHUYÊN MÔN', time:'5 ngày', color:'#0891b2', shape:'rect',
   desc:'3 ca: LT → TH hướng dẫn → LT+TH song song. Kiểm tra LT+TH >80 điểm.'},
  {label:'KIỂM TRA &\nPHẢN HỒI KQ', time:'3 ngày', color:'#7c3aed', shape:'diamond',
   desc:'Đạt (>80đ) → Thành công. Không đạt → Thất bại.'},
  {label:'THÀNH CÔNG', time:'', color:'#059669', shape:'rounded', desc:'Hoàn thành quy trình đào tạo chuyên môn ✓'},
  {label:'THẤT BẠI', time:'', color:'#dc2626', shape:'rounded', desc:'Không đạt yêu cầu đào tạo'}
];

var RANK_STEPS = [
  {label:'TIẾP NHẬN\nTHÔNG TIN', time:'1 ngày', color:'#b45309', shape:'rect',
   desc:'Nhận đăng ký từ Zalo. Tạo nhiệm vụ Workflow + phiếu đánh giá.'},
  {label:'XÉT ĐIỀU KIỆN\nLÊN BẬC', time:'1 ngày', color:'#d97706', shape:'diamond',
   desc:'3 tháng liên tiếp không trừ >50% điểm + full-time chính thức.'},
  {label:'KIỂM TRA &\nĐÁNH GIÁ', time:'5 ngày', color:'#b45309', shape:'rect',
   desc:'LT + TH > 80 điểm và không sai câu liệt → Đạt.'},
  {label:'PHẢN HỒI\nKẾT QUẢ', time:'5 ngày', color:'#92400e', shape:'rect',
   desc:'Chấm trực tiếp. Phiếu đánh giá: QLCH + NV + Giám sát xác nhận.'},
  {label:'THÀNH CÔNG', time:'', color:'#059669', shape:'rounded', desc:'Lên bậc thành công ✓'},
  {label:'THẤT BẠI', time:'', color:'#dc2626', shape:'rounded', desc:'Không đủ điều kiện, đăng ký lại sau 3 tháng'}
];

// ── Static SVG flowcharts from Excel ──
var STATIC_FC1 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 660 988" width="660" height="988" style="display:block;font-family:'Times New Roman',serif;"><rect width="660" height="988" fill="#f8fafc"/><defs><marker id="arr" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><polygon points="0 0,9 3.5,0 7" fill="#374151"/></marker></defs><line x1="330" y1="82" x2="330" y2="108" stroke="#374151" stroke-width="2" marker-end="url(#arr)"/><line x1="330" y1="170" x2="330" y2="196" stroke="#374151" stroke-width="2" marker-end="url(#arr)"/><line x1="330" y1="250" x2="330" y2="266" stroke="#374151" stroke-width="2" marker-end="url(#arr)"/><line x1="330" y1="348" x2="330" y2="374" stroke="#374151" stroke-width="2" marker-end="url(#arr)"/><line x1="330" y1="436" x2="330" y2="452" stroke="#374151" stroke-width="2" marker-end="url(#arr)"/><line x1="330" y1="506" x2="330" y2="522" stroke="#374151" stroke-width="2" marker-end="url(#arr)"/><line x1="330" y1="576" x2="330" y2="592" stroke="#374151" stroke-width="2" marker-end="url(#arr)"/><line x1="330" y1="674" x2="330" y2="700" stroke="#374151" stroke-width="2" marker-end="url(#arr)"/><line x1="330" y1="782" x2="330" y2="808" stroke="#374151" stroke-width="2" marker-end="url(#arr)"/><line x1="330" y1="870" x2="330" y2="888" stroke="#374151" stroke-width="2"/><line x1="330" y1="888" x2="210" y2="888" stroke="#00B050" stroke-width="2"/><line x1="210" y1="888" x2="210" y2="896" stroke="#00B050" stroke-width="2" marker-end="url(#arr)"/><line x1="330" y1="888" x2="450" y2="888" stroke="#C00000" stroke-width="2"/><line x1="450" y1="888" x2="450" y2="896" stroke="#C00000" stroke-width="2" marker-end="url(#arr)"/><text x="210" y="883" text-anchor="middle" font-size="9" fill="#00B050" font-weight="bold">ĐẠT</text><text x="450" y="883" text-anchor="middle" font-size="9" fill="#C00000" font-weight="bold">KHÔNG ĐẠT</text><ellipse cx="330" cy="56" rx="95" ry="26" fill="white" stroke="#C55A11" stroke-width="2"/><text x="330" y="61" text-anchor="middle" font-size="12" font-weight="bold" fill="#C55A11">NHẬN THÔNG TIN</text><rect x="230" y="118" width="200" height="52" rx="6" fill="#C00000" stroke="white" stroke-width="1" opacity="0.93"/><text x="330" y="149" text-anchor="middle" font-size="11.5" font-weight="bold" fill="white">HỘI NHẬP</text><rect x="190" y="206" width="280" height="44" rx="6" fill="#0070C0" stroke="white" stroke-width="1" opacity="0.93"/><text x="330" y="224" text-anchor="middle" font-size="11" font-weight="bold" fill="white">ĐÀO TẠO &</text><text x="330" y="238" text-anchor="middle" font-size="11" font-weight="bold" fill="white">THEO DÕI HỘI NHẬP</text><polygon points="330,276 440,312 330,348 220,312" fill="#C00000" stroke="white" stroke-width="1.5" opacity="0.92"/><text x="330" y="311" text-anchor="middle" font-size="10.5" font-weight="bold" fill="white">KIỂM TRA</text><text x="330" y="324" text-anchor="middle" font-size="10.5" font-weight="bold" fill="white">ĐÁNH GIÁ HỘI NHẬP</text><rect x="230" y="384" width="200" height="52" rx="6" fill="#C00000" stroke="white" stroke-width="1" opacity="0.93"/><text x="330" y="415" text-anchor="middle" font-size="11.5" font-weight="bold" fill="white">ĐÀO TẠO NGHỀ</text><rect x="190" y="462" width="280" height="44" rx="6" fill="#0070C0" stroke="white" stroke-width="1" opacity="0.93"/><text x="330" y="480" text-anchor="middle" font-size="11" font-weight="bold" fill="white">KÍ HỢP ĐỒNG</text><text x="330" y="494" text-anchor="middle" font-size="11" font-weight="bold" fill="white">+ PHIẾU ĐÁNH GIÁ</text><rect x="190" y="532" width="280" height="44" rx="6" fill="#0070C0" stroke="white" stroke-width="1" opacity="0.93"/><text x="330" y="550" text-anchor="middle" font-size="11" font-weight="bold" fill="white">SẮP XẾP LỊCH &</text><text x="330" y="564" text-anchor="middle" font-size="11" font-weight="bold" fill="white">THEO DÕI ĐÀO TẠO</text><polygon points="330,602 440,638 330,674 220,638" fill="#C00000" stroke="white" stroke-width="1.5" opacity="0.92"/><text x="330" y="637" text-anchor="middle" font-size="10.5" font-weight="bold" fill="white">KIỂM TRA </text><text x="330" y="650" text-anchor="middle" font-size="10.5" font-weight="bold" fill="white">LÝ THUYẾT</text><polygon points="330,710 440,746 330,782 220,746" fill="#C00000" stroke="white" stroke-width="1.5" opacity="0.92"/><text x="330" y="745" text-anchor="middle" font-size="10.5" font-weight="bold" fill="white">KIỂM TRA </text><text x="330" y="758" text-anchor="middle" font-size="10.5" font-weight="bold" fill="white">THỰC HÀNH</text><rect x="210" y="818" width="240" height="52" rx="6" fill="#0070C0" stroke="white" stroke-width="1" opacity="0.93"/><text x="330" y="849" text-anchor="middle" font-size="11.5" font-weight="bold" fill="white">KÝ HỢP ĐỒNG CHÍNH THỨC</text><ellipse cx="210" cy="932" rx="80" ry="26" fill="white" stroke="#00B050" stroke-width="2"/><text x="210" y="937" text-anchor="middle" font-size="12" font-weight="bold" fill="#00B050">THÀNH CÔNG</text><ellipse cx="450" cy="932" rx="80" ry="26" fill="white" stroke="#C00000" stroke-width="2"/><text x="450" y="937" text-anchor="middle" font-size="12" font-weight="bold" fill="#C00000">THẤT BẠI</text></svg>`;
var STATIC_FC2 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 660 832" width="660" height="832" style="display:block;font-family:'Times New Roman',serif;"><rect width="660" height="832" fill="#f8fafc"/><defs><marker id="arr" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><polygon points="0 0,9 3.5,0 7" fill="#374151"/></marker></defs><line x1="330" y1="80" x2="330" y2="104" stroke="#374151" stroke-width="2" marker-end="url(#arr)"/><line x1="330" y1="164" x2="330" y2="178" stroke="#374151" stroke-width="2" marker-end="url(#arr)"/><line x1="330" y1="238" x2="330" y2="262" stroke="#374151" stroke-width="2" marker-end="url(#arr)"/><line x1="330" y1="322" x2="330" y2="346" stroke="#374151" stroke-width="2" marker-end="url(#arr)"/><line x1="330" y1="426" x2="330" y2="450" stroke="#374151" stroke-width="2" marker-end="url(#arr)"/><line x1="330" y1="530" x2="330" y2="554" stroke="#374151" stroke-width="2" marker-end="url(#arr)"/><line x1="330" y1="634" x2="330" y2="658" stroke="#374151" stroke-width="2" marker-end="url(#arr)"/><line x1="330" y1="718" x2="330" y2="735" stroke="#374151" stroke-width="2"/><line x1="330" y1="735" x2="210" y2="735" stroke="#00B050" stroke-width="2"/><line x1="210" y1="735" x2="210" y2="742" stroke="#00B050" stroke-width="2" marker-end="url(#arr)"/><line x1="330" y1="735" x2="450" y2="735" stroke="#C00000" stroke-width="2"/><line x1="450" y1="735" x2="450" y2="742" stroke="#C00000" stroke-width="2" marker-end="url(#arr)"/><text x="210" y="730" text-anchor="middle" font-size="9" fill="#00B050" font-weight="bold">ĐẠT</text><text x="450" y="730" text-anchor="middle" font-size="9" fill="#C00000" font-weight="bold">KHÔNG ĐẠT</text><ellipse cx="330" cy="55" rx="95" ry="25" fill="white" stroke="#C55A11" stroke-width="2"/><text x="330" y="60" text-anchor="middle" font-size="12" font-weight="bold" fill="#C55A11">NHẬN THÔNG TIN</text><rect x="220" y="114" width="220" height="50" rx="6" fill="#0070C0" stroke="white" stroke-width="1" opacity="0.93"/><text x="330" y="144" text-anchor="middle" font-size="11.5" font-weight="bold" fill="white">TẠO PHIẾU ĐÁNH GIÁ</text><rect x="220" y="188" width="220" height="50" rx="6" fill="#0070C0" stroke="white" stroke-width="1" opacity="0.93"/><text x="330" y="218" text-anchor="middle" font-size="11.5" font-weight="bold" fill="white">SẮP XẾP LỊCH ĐÀO TẠO</text><rect x="220" y="272" width="220" height="50" rx="6" fill="#0070C0" stroke="white" stroke-width="1" opacity="0.93"/><text x="330" y="302" text-anchor="middle" font-size="11.5" font-weight="bold" fill="white">THEO DÕI ĐÀO TẠO</text><polygon points="330,356 440,391 330,426 220,391" fill="#C00000" stroke="white" stroke-width="1.5" opacity="0.92"/><text x="330" y="390" text-anchor="middle" font-size="10.5" font-weight="bold" fill="white">KIỂM TRA </text><text x="330" y="403" text-anchor="middle" font-size="10.5" font-weight="bold" fill="white">LÝ THUYẾT</text><polygon points="330,460 440,495 330,530 220,495" fill="#C00000" stroke="white" stroke-width="1.5" opacity="0.92"/><text x="330" y="494" text-anchor="middle" font-size="10.5" font-weight="bold" fill="white">KIỂM TRA</text><text x="330" y="507" text-anchor="middle" font-size="10.5" font-weight="bold" fill="white">LT LẦN 2</text><polygon points="330,564 440,599 330,634 220,599" fill="#C00000" stroke="white" stroke-width="1.5" opacity="0.92"/><text x="330" y="598" text-anchor="middle" font-size="10.5" font-weight="bold" fill="white">KIỂM TRA </text><text x="330" y="611" text-anchor="middle" font-size="10.5" font-weight="bold" fill="white">THỰC HÀNH</text><rect x="220" y="668" width="220" height="50" rx="6" fill="#0070C0" stroke="white" stroke-width="1" opacity="0.93"/><text x="330" y="698" text-anchor="middle" font-size="11.5" font-weight="bold" fill="white">THÔNG BÁO KẾT QUẢ</text><ellipse cx="210" cy="777" rx="82" ry="25" fill="white" stroke="#00B050" stroke-width="2"/><text x="210" y="782" text-anchor="middle" font-size="12" font-weight="bold" fill="#00B050">THÀNH CÔNG</text><ellipse cx="450" cy="777" rx="82" ry="25" fill="white" stroke="#C00000" stroke-width="2"/><text x="450" y="782" text-anchor="middle" font-size="12" font-weight="bold" fill="#C00000">THẤT BẠI</text></svg>`;
var STATIC_FC3 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 660 800" width="660" height="800" style="display:block;font-family:'Times New Roman',serif;"><rect width="660" height="800" fill="#f8fafc"/><defs><marker id="arr" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto"><polygon points="0 0,9 3.5,0 7" fill="#374151"/></marker></defs><line x1="330" y1="88" x2="330" y2="107" stroke="#374151" stroke-width="2" marker-end="url(#arr)"/><line x1="330" y1="159" x2="330" y2="168" stroke="#374151" stroke-width="2" marker-end="url(#arr)"/><line x1="330" y1="228" x2="330" y2="252" stroke="#374151" stroke-width="2" marker-end="url(#arr)"/><line x1="330" y1="332" x2="330" y2="356" stroke="#374151" stroke-width="2" marker-end="url(#arr)"/><line x1="330" y1="436" x2="330" y2="460" stroke="#374151" stroke-width="2" marker-end="url(#arr)"/><line x1="330" y1="520" x2="330" y2="539" stroke="#374151" stroke-width="2" marker-end="url(#arr)"/><line x1="330" y1="599" x2="330" y2="618" stroke="#374151" stroke-width="2" marker-end="url(#arr)"/><line x1="330" y1="678" x2="330" y2="695" stroke="#374151" stroke-width="2"/><line x1="330" y1="695" x2="210" y2="695" stroke="#00B050" stroke-width="2"/><line x1="210" y1="695" x2="210" y2="702" stroke="#00B050" stroke-width="2" marker-end="url(#arr)"/><line x1="330" y1="695" x2="450" y2="695" stroke="#C00000" stroke-width="2"/><line x1="450" y1="695" x2="450" y2="702" stroke="#C00000" stroke-width="2" marker-end="url(#arr)"/><text x="210" y="690" text-anchor="middle" font-size="9" fill="#00B050" font-weight="bold">ĐẠT</text><text x="450" y="690" text-anchor="middle" font-size="9" fill="#C00000" font-weight="bold">KHÔNG ĐẠT</text><ellipse cx="330" cy="59" rx="95" ry="29" fill="white" stroke="#C55A11" stroke-width="2"/><text x="330" y="64" text-anchor="middle" font-size="12" font-weight="bold" fill="#C55A11">ĐĂNG KÍ XÉT BẬC</text><rect x="215" y="117" width="230" height="42" rx="6" fill="white" stroke="white" stroke-width="1" opacity="0.93"/><text x="330" y="134" text-anchor="middle" font-size="11" font-weight="bold" fill="#333">TẠO NHIỆM</text><text x="330" y="148" text-anchor="middle" font-size="11" font-weight="bold" fill="#333">VỤ WORKFLOW(IOT)</text><rect x="215" y="178" width="230" height="50" rx="6" fill="#0070C0" stroke="white" stroke-width="1" opacity="0.93"/><text x="330" y="208" text-anchor="middle" font-size="11.5" font-weight="bold" fill="white">TỔNG HỢP THÔNG TIN</text><polygon points="330,262 440,297 330,332 220,297" fill="#C00000" stroke="white" stroke-width="1.5" opacity="0.92"/><text x="330" y="296" text-anchor="middle" font-size="10.5" font-weight="bold" fill="white">XÉT ĐIỀU K</text><text x="330" y="309" text-anchor="middle" font-size="10.5" font-weight="bold" fill="white">IỆN LÊN BẬC</text><polygon points="330,366 440,401 330,436 220,401" fill="#C00000" stroke="white" stroke-width="1.5" opacity="0.92"/><text x="330" y="400" text-anchor="middle" font-size="10.5" font-weight="bold" fill="white">KIỂM TRA</text><text x="330" y="413" text-anchor="middle" font-size="10.5" font-weight="bold" fill="white">ĐÁNH GIÁ</text><rect x="215" y="470" width="230" height="50" rx="6" fill="#0070C0" stroke="white" stroke-width="1" opacity="0.93"/><text x="330" y="491" text-anchor="middle" font-size="11" font-weight="bold" fill="white">GỬI KẾT QUẢ</text><text x="330" y="505" text-anchor="middle" font-size="11" font-weight="bold" fill="white">CHO NHÂN SỰ</text><rect x="215" y="549" width="230" height="50" rx="6" fill="#0070C0" stroke="white" stroke-width="1" opacity="0.93"/><text x="330" y="570" text-anchor="middle" font-size="11" font-weight="bold" fill="white">GIÁM SÁT XÁC</text><text x="330" y="584" text-anchor="middle" font-size="11" font-weight="bold" fill="white">NHẬN KẾT QUẢ</text><rect x="215" y="628" width="230" height="50" rx="6" fill="#0070C0" stroke="white" stroke-width="1" opacity="0.93"/><text x="330" y="658" text-anchor="middle" font-size="11.5" font-weight="bold" fill="white">THÔNG BÁO KẾT QUẢ</text><ellipse cx="210" cy="741" rx="82" ry="29" fill="white" stroke="#00B050" stroke-width="2"/><text x="210" y="746" text-anchor="middle" font-size="12" font-weight="bold" fill="#00B050">THÀNH CÔNG</text><ellipse cx="450" cy="741" rx="82" ry="29" fill="white" stroke="#C00000" stroke-width="2"/><text x="450" y="746" text-anchor="middle" font-size="12" font-weight="bold" fill="#C00000">THẤT BẠI</text></svg>`;

function renderStaticDiagram(containerId, stepsOrKey){
  var el = $(containerId);
  if(!el) return;
  var svg = '';
  if(containerId === 'cm-diagram')   svg = STATIC_FC2;
  if(containerId === 'rank-diagram') svg = STATIC_FC3;
  if(!svg) return;
  el.innerHTML = '<div style="min-width:640px;">' + svg + '</div>';
}

// Auto-init: render static diagrams when training tab opens
var _origShowPage = typeof showPage === 'function' ? showPage : null;
document.addEventListener('DOMContentLoaded', function(){
  // Render static diagrams when visible
  var origSP = window.showPage;
  window.showPage = function(target){
    if(origSP) origSP(target);
    if(target === 'training'){
      // Check active tab
      var cmPanel = $('tpanel-cm');
      var rankPanel = $('tpanel-rank');
      if(cmPanel && cmPanel.style.display !== 'none') renderStaticDiagram('cm-diagram', CM_STEPS);
      if(rankPanel && rankPanel.style.display !== 'none') renderStaticDiagram('rank-diagram', RANK_STEPS);
    }
  };
});

// STEP CONTENT EDITOR — for training tabs

var STEP_STORAGE = {
  dt:   'zentea-steps-dt',
  cm:   'zentea-steps-cm',
  rank: 'zentea-steps-rank'
};

var STEP_COLORS = {
  dt:   'var(--green)',
  cm:   '#1d4ed8',
  rank: '#b45309'
};

var STEP_TITLES = {
  dt:   '📚 Quy Trình Đào Tạo',
  cm:   '🎯 Đào Tạo Chuyên Môn',
  rank: '🏆 Xét Bậc'
};

// ── Default steps data ──
var DEFAULT_STEPS = {
  dt: [
    {num:1, title:'THÔNG TIN TUYỂN DỤNG', time:'1 NGÀY', dept:'QUẢN LÝ',
     content:'- Quản lý nhận và xác nhận thông tin nhân sự từ bên tuyển dụng trên Workflow(IOT) bước "THÔNG TIN TUYỂN DỤNG"\n=> Sau khi tích và hoàn thành các nhiệm vụ con tiếp tục chuyển nhiệm vụ sang bước "HỘI NHẬP".'},
    {num:2, title:'HỘI NHẬP', time:'6 NGÀY', dept:'QUẢN LÝ',
     content:'- Liên hệ với ứng viên để sắp xếp lịch hội nhập\n- Tạo phiếu đánh giá hội nhập\n- Đào Tạo và theo dõi hội nhập:\n+ Ngày hội nhập thứ 1: Đào tạo và hướng dẫn nội quy, quy chế. Cuối ca thực hiện làm bài kiểm tra trên Onedrive.\n+ Ngày hội nhập thứ 2, 3: Đào tạo và theo dõi các kỹ năng còn lại theo phiếu đào tạo hội nhập\n* Trong 3 ca hội nhập BẮT BUỘC phải có QL trong ca để theo dõi.\n- Kiểm tra và đánh giá hội nhập\n- Hoàn thành phiếu đánh giá hội nhập\n(*) Kết quả ĐẠT: điểm (LT+TH) > 80 điểm\n(**) Kết quả KHÔNG ĐẠT: điểm (LT+TH) < 80 điểm'},
    {num:3, title:'ĐÀO TẠO NGHỀ', time:'17 NGÀY (CA3) / 10 NGÀY (CA12)', dept:'QUẢN LÝ',
     content:'- Ký hợp đồng đào tạo nghề\n- Báo cho tuyển dụng tạo User.\n- Liên hệ ứng viên, người đào tạo và sắp xếp lịch đào tạo\n- Tạo phiếu đánh giá đào tạo nghề\n* Theo dõi đào tạo:\n+ Sau khi hoàn tất buổi đào tạo LT (Ca thứ 10) làm bài kiểm tra trên one drive với đề thi "PHA CHẾ PHỤ"\n+ Trường hợp LT ĐẠT (*) tiếp tục theo dõi thực hành.\n+ Trường hợp LT KHÔNG ĐẠT (**): cho cơ hội kiểm tra lại lần 2. Lần 2 KHÔNG ĐẠT → chuyển sang "THẤT BẠI"\n- Kiểm tra và đánh giá thực hành\n- Hoàn thành phiếu đánh giá đào tạo nghề\n(*) Kết quả ĐẠT: LT > 80 điểm | (**) Kết quả KHÔNG ĐẠT: LT < 80 điểm'},
    {num:4, title:'KÝ HỢP ĐỒNG CHÍNH THỨC', time:'3 NGÀY', dept:'QUẢN LÝ',
     content:'- Trường hợp ĐẠT (*) chủ động nhắn tin cho QLLLV để xác nhận kết quả làm hợp đồng đào tạo.\n- Báo cho tuyển dụng cấp phát đồng phục\n- Sau khi hoàn tất đẩy dữ liệu lên chuyển nhiệm vụ sang "Thành công"\n(*) Kết quả Đạt: điểm tổng (LT+TH) > 80 điểm'}
  ],
  cm: [
    {num:1, title:'TIẾP NHẬN THÔNG TIN', time:'1 NGÀY', dept:'QUẢN LÍ',
     content:'- Quản lý cập nhật thông tin nhân sự được đề xuất đào tạo chuyên môn trên Workflow (IOT) bước "TIẾP NHẬN THÔNG TIN"\n- Xác nhận thông tin nhân sự, người đào tạo và sắp xếp lịch đào tạo\n=> Sau khi tích và hoàn thành các nhiệm vụ con tiếp tục chuyển nhiệm vụ sang bước "ĐÀO TẠO CHUYÊN MÔN".'},
    {num:2, title:'ĐÀO TẠO CHUYÊN MÔN', time:'5 NGÀY', dept:'QUẢN LÍ',
     content:'- Tạo phiếu đánh giá đào tạo chuyên môn\n* Theo dõi đào tạo (3 ca):\n+ Ca 1 – Đào tạo lý thuyết theo vị trí chuyên môn\n+ Ca 2 – Đào tạo thực hành có hướng dẫn\n+ Ca 3 – Đào tạo lý thuyết và áp dụng song song với thực hành\n- Sau khi hoàn tất 3 buổi đào tạo làm bài kiểm tra theo vị trí chuyên môn.\n(*) Kết quả ĐẠT: LT+TH > 80 điểm | (**) Kết quả KHÔNG ĐẠT: LT+TH < 80 điểm'},
    {num:3, title:'KIỂM TRA VÀ PHẢN HỒI KẾT QUẢ', time:'3 NGÀY', dept:'QUẢN LÍ',
     content:'- Tổng hợp kết quả đào tạo chuyên môn:\n+ Nhập "Phản hồi kết quả" trên Workflow\n+ Đính kèm "Phiếu đánh giá và kết quả đào tạo"\n+ Nhập "Ngày lên chính thức" sau khi xác nhận đạt\n- ĐẠT (*) → chuyển sang "THÀNH CÔNG" | KHÔNG ĐẠT (**) → chuyển sang "THẤT BẠI"\n(*) Kết quả ĐẠT: điểm tổng LT + TH > 80 điểm'}
  ],
  rank: [
    {num:1, title:'TIẾP NHẬN THÔNG TIN', time:'1 NGÀY', dept:'QUẢN LÝ',
     content:'- Quản lý nhận và xác nhận thông tin đăng ký xét bậc (*) từ group ZALO "LỊCH LÀM VIỆC"\n- Ngày 1 tạo nhiệm vụ trên Workflow(IOT) bước "TIẾP NHẬN THÔNG TIN"\n- Tạo phiếu đánh giá xét bậc\n(*) Ngày đăng ký xét bậc là 2 ngày cuối tháng và ngày 1 đầu tháng.'},
    {num:2, title:'XÉT ĐIỀU KIỆN LÊN BẬC', time:'1 NGÀY', dept:'QUẢN LÝ',
     content:'- Tổng hợp thông tin điều kiện xét bậc:\n+ Tổng 3 tháng liên tiếp không bị trừ quá 50% số điểm\n+ Thời gian làm việc full-time chính thức\n- ĐẠT (*) → tiến hành kiểm tra đánh giá LT + TH\n- KHÔNG ĐẠT (**) → chuyển nhiệm vụ sang thất bại.\n(*) Kết quả ĐẠT: đáp ứng đủ 2 điều kiện | (**) KHÔNG ĐẠT: không đáp ứng'},
    {num:3, title:'KIỂM TRA VÀ ĐÁNH GIÁ', time:'5 NGÀY', dept:'QUẢN LÝ',
     content:'- Kiểm tra và đánh giá lý thuyết\n- Kiểm tra và đánh giá thực hành\n- ĐẠT (*) → chuyển sang bước "PHẢN HỒI KẾT QUẢ"\n- KHÔNG ĐẠT (**) → chuyển sang bước "THẤT BẠI"\n(*) LT+TH > 80 điểm + Không sai câu liệt\n(**) LT+TH < 80 điểm hoặc Sai câu liệt'},
    {num:4, title:'PHẢN HỒI KẾT QUẢ', time:'5 NGÀY', dept:'QUẢN LÝ / GIÁM SÁT',
     content:'- Thực hiện chấm trực tiếp với nhân viên\n- Hoàn thành phiếu đánh giá xét bậc:\n+ QLCH xác nhận kết quả\n+ Nhân viên xác nhận kết quả\n+ Giám sát xác nhận kết quả\n=> Sau khi tích và hoàn thành các nhiệm vụ tiếp tục nhiệm vụ sang bước "THÀNH CÔNG"'}
  ]
};

function loadSteps(tab){
  try{
    var raw = localStorage.getItem(branchKey(STEP_STORAGE[tab]));
    if(raw) return JSON.parse(raw);
  }catch(e){}
  return DEFAULT_STEPS[tab];
}

function saveSteps(tab, steps){
  try{ localStorage.setItem(branchKey(STEP_STORAGE[tab]), JSON.stringify(steps)); }catch(e){}
}

// ── Render step cards from data ──
function renderStepCards(tab){
  var steps = loadSteps(tab);
  var color = STEP_COLORS[tab];
  var containerId = tab==='dt' ? 'training-grid-cards' : (tab==='cm' ? 'tpanel-cm-steps' : 'tpanel-rank-steps');
  var el = $(containerId);
  if(!el) return;

  var html = steps.map(function(s){
    var timeHtml = s.time ? '<span style="background:'+color+';color:#fff;border-radius:20px;padding:3px 10px;font-size:11px;font-weight:700;">'+s.time+'</span>' : '';
    var deptHtml = s.dept ? '<span style="font-size:11px;color:#888;">👤 '+s.dept+'</span>' : '';
    var contentHtml = formatStepContent(s.content||'');
    return '<div style="background:#fff;border-radius:16px;padding:20px 22px;box-shadow:0 2px 12px rgba(45,122,45,.07);border:1px solid var(--border);border-left:4px solid '+color+';margin-bottom:14px;">'
      +'<div class="row-hdr">'
      +'<div style="width:32px;height:32px;border-radius:50%;background:'+color+';color:#fff;font-size:13px;font-weight:900;display:flex;align-items:center;justify-content:center;flex-shrink:0;">'+String(s.num).padStart(2,'0')+'</div>'
      +'<div style="font-family:Lato,sans-serif;font-size:16px;font-weight:700;color:#1a1a1a;flex:1;">'+s.title+'</div>'
      +timeHtml+deptHtml
      +'</div>'
      +'<div style="font-size:13px;color:#444;line-height:1.65;">'+contentHtml+'</div>'
      +'</div>';
  }).join('');

  // Add completion bar
  var gradient = tab==='dt'?'linear-gradient(135deg,#2d7a2d,#4aab3a)':tab==='cm'?'linear-gradient(135deg,#1d4ed8,#3b82f6)':'linear-gradient(135deg,#b45309,#d97706)';
  html += '<div style="background:'+gradient+';border-radius:12px;padding:14px 20px;text-align:center;color:#fff;font-weight:700;font-size:14px;">✅ HOÀN THÀNH QUY TRÌNH</div>';

  el.innerHTML = html;
}

function formatStepContent(text){
  var lines = text.split('\n');
  var out = '';
  var inUl = false;
  lines.forEach(function(line){
    line = line.replace(/</g,'&lt;').replace(/>/g,'&gt;');
    if(line.startsWith('- ')||line.startsWith('+ ')||line.startsWith('* ')){
      if(!inUl){ out+='<ul style="padding-left:16px;margin:4px 0;">'; inUl=true; }
      out+='<li style="margin-bottom:3px;">'+line.slice(2)+'</li>';
    } else {
      if(inUl){ out+='</ul>'; inUl=false; }
      if(line.startsWith('=>'))
        out+='<div style="margin-top:8px;padding:6px 10px;background:#e8f5e2;border-radius:8px;font-size:12px;font-weight:600;color:#2d7a2d;">'+line+'</div>';
      else if(line.startsWith('(')&&line.includes(')'))
        out+='<div style="font-size:11px;color:#888;margin-top:2px;">'+line+'</div>';
      else if(line)
        out+='<div style="margin-bottom:2px;">'+line+'</div>';
    }
  });
  if(inUl) out+='</ul>';
  return out;
}

// ── Open step editor modal ──
var _editingTab = null;

function openStepEditor(tab){
  _editingTab = tab;
  var steps = loadSteps(tab);
  var color = STEP_COLORS[tab];
  var title = STEP_TITLES[tab];

  var inp = 'width:100%;padding:8px 12px;border:1.5px solid #e5e7eb;border-radius:9px;font-family:Open Sans,sans-serif;font-size:13px;outline:none;transition:.15s;box-sizing:border-box;';
  var focusAttr = 'onfocus="this.style.borderColor=\"'+color+'\"" onblur="this.style.borderColor=\"#e5e7eb\""';

  var html = '<div style="display:flex;flex-direction:column;gap:14px;">';

  steps.forEach(function(s, i){
    html += '<div style="background:#f9fafb;border-radius:14px;padding:16px;border:1.5px solid #e5e7eb;" id="step-edit-'+i+'">'
      +'<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">'
      +'<div style="width:28px;height:28px;border-radius:50%;background:'+color+';color:#fff;font-size:12px;font-weight:900;display:flex;align-items:center;justify-content:center;flex-shrink:0;">'+String(s.num).padStart(2,'0')+'</div>'
      +'<div style="font-size:12px;font-weight:700;color:#555;flex:1;">BƯỚC '+s.num+'</div>'
      +'<button type="button" onclick="addStepBelow('+i+')" title="Thêm bước mới bên dưới" style="padding:3px 10px;background:#f0fdf4;border:1.5px solid var(--green);border-radius:8px;font-size:11px;font-weight:700;color:var(--green);cursor:pointer;">+ Thêm bước</button>'
      +(steps.length>1?'<button type="button" onclick="removeStep('+i+')" title="Xóa bước này" style="padding:3px 10px;background:#fff1f0;border:1.5px solid #fca5a5;border-radius:8px;font-size:11px;font-weight:700;color:#dc2626;cursor:pointer;">🗑 Xóa</button>':'')
      +'</div>'
      +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">'
      +'<div><label style="font-size:10px;font-weight:700;color:#888;display:block;margin-bottom:3px;">TIÊU ĐỀ *</label>'
      +'<input type="text" id="se-title-'+i+'" value="'+s.title.replace(/"/g,'&quot;')+'" style="'+inp+'" '+focusAttr+'/></div>'
      +'<div><label style="font-size:10px;font-weight:700;color:#888;display:block;margin-bottom:3px;">THỜI HẠN</label>'
      +'<input type="text" id="se-time-'+i+'" value="'+(s.time||'').replace(/"/g,'&quot;')+'" placeholder="VD: 1 NGÀY" style="'+inp+'" '+focusAttr+'/></div>'
      +'</div>'
      +'<div style="margin-bottom:8px;"><label style="font-size:10px;font-weight:700;color:#888;display:block;margin-bottom:3px;">BỘ PHẬN</label>'
      +'<input type="text" id="se-dept-'+i+'" value="'+(s.dept||'').replace(/"/g,'&quot;')+'" placeholder="VD: QUẢN LÝ" style="'+inp+'" '+focusAttr+'/></div>'
      +'<div><label style="font-size:10px;font-weight:700;color:#888;display:block;margin-bottom:3px;">NỘI DUNG QUY ĐỊNH (mỗi dòng 1 mục, bắt đầu bằng - hoặc +)</label>'
      +'<textarea id="se-content-'+i+'" rows="6" style="'+inp+'resize:vertical;line-height:1.6;" '+focusAttr+'>'+s.content.replace(/</g,'&lt;')+'</textarea></div>'
      +'</div>';
  });

  html += '</div>'
    +'<div style="display:flex;gap:10px;margin-top:16px;">'
    +'<button type="button" onclick="saveStepEditor()" style="flex:1;padding:13px;background:'+color+';color:#fff;border:none;border-radius:11px;font-family:Open Sans,sans-serif;font-size:14px;font-weight:700;cursor:pointer;">💾 Lưu thay đổi</button>'
    +'<button type="button" onclick="resetStepEditor()" style="padding:13px 18px;background:#fff;color:#dc2626;border:2px solid #fca5a5;border-radius:11px;font-size:13px;font-weight:600;cursor:pointer;">↺ Reset</button>'
    +'<button type="button" onclick="closeContentEdit()" style="padding:13px 18px;background:#f5f5f5;color:#888;border:none;border-radius:11px;font-size:13px;cursor:pointer;">Hủy</button>'
    +'</div>';

  var titleEl = $('ce-modal-title');
  if(titleEl) titleEl.textContent = title + ' — Chỉnh sửa nội dung';
  var bodyEl = $('ce-modal-body');
  if(bodyEl) bodyEl.innerHTML = html;
  var modal = $('content-edit-modal');
  if(modal) modal.style.display = 'flex';
}

function getStepsFromEditor(){
  var steps = [];
  var i = 0;
  while($('se-title-'+i)){
    steps.push({
      num: i+1,
      title: ($('se-title-'+i).value||'').trim(),
      time:  ($('se-time-'+i).value||'').trim(),
      dept:  ($('se-dept-'+i).value||'').trim(),
      content: ($('se-content-'+i).value||'').trim()
    });
    i++;
  }
  return steps;
}

function saveStepEditor(){
  var tab = _editingTab;
  var steps = getStepsFromEditor();
  if(!steps.length) return;
  saveSteps(tab, steps);
  closeContentEdit();
  applyStepEdits(tab);
  if(typeof showToast==='function') showToast('✅ Đã lưu!', 'Nội dung đã được cập nhật');
}

function resetStepEditor(){
  if(!confirm('Khôi phục nội dung gốc từ file Excel? Mọi chỉnh sửa sẽ bị mất.')) return;
  var tab = _editingTab;
  try{ localStorage.removeItem(branchKey(STEP_STORAGE[tab])); }catch(e){}
  closeContentEdit();
  applyStepEdits(tab);
  if(typeof showToast==='function') showToast('↺ Đã reset', 'Nội dung đã khôi phục về mặc định');
}

function addStepBelow(idx){
  var steps = getStepsFromEditor();
  var newStep = {num:0, title:'BƯỚC MỚI', time:'', dept:'QUẢN LÝ', content:'- Nội dung bước mới'};
  steps.splice(idx+1, 0, newStep);
  steps.forEach(function(s,i){ s.num=i+1; });
  // Re-render editor with new step
  var tab = _editingTab;
  saveSteps(tab, steps);
  openStepEditor(tab);
}

function removeStep(idx){
  var steps = getStepsFromEditor();
  if(steps.length<=1) return;
  steps.splice(idx,1);
  steps.forEach(function(s,i){ s.num=i+1; });
  var tab = _editingTab;
  saveSteps(tab, steps);
  openStepEditor(tab);
}

function applyStepEdits(tab){
  var containerId = tab==='dt' ? 'training-grid-cards' : (tab==='cm' ? 'tpanel-cm-steps' : 'tpanel-rank-steps');
  renderStepCards(tab);
}

// ── Auto-apply on page load ──
document.addEventListener('DOMContentLoaded', function(){
  // Always render step cards from DEFAULT_STEPS or saved data
  ['dt','cm','rank'].forEach(function(tab){
    try{ renderStepCards(tab); }catch(e){}
  });
  // Apply saved nav order
  try{ applyNavOrderOnLoad(); }catch(e){}
  // Init inline editing
  try{ initInlineEdit(); }catch(e){}
});

// ═══  NAV DRAG-TO-REORDER  ═══════════════════
var _navDragSrc = null;
var _navOrder = []; // current order during modal

function openNavReorder(){
  var modal = $('nav-reorder-modal');
  if(!modal) return;
  modal.style.display = 'flex';
  renderNavReorderList();
}

function closeNavReorder(){
  var modal = $('nav-reorder-modal');
  if(modal) modal.style.display = 'none';
}

function getNavItems(){
  // Get all nav-items except the sort button itself
  return Array.from(document.querySelectorAll('#topnav .nav-items .nav-item:not(#nav-sort-btn)'));
}

function renderNavReorderList(){
  var list = $('nav-reorder-list');
  if(!list) return;
  var items = getNavItems();
  list.innerHTML = '';
  items.forEach(function(btn, i){
    var label = (btn.querySelector('.nav-item-label')||{}).textContent || ('Mục '+(i+1));
    var iconHtml = (btn.querySelector('.nav-item-icon')||{}).innerHTML || '';
    var row = document.createElement('div');
    row.className = 'nav-reorder-row';
    row.draggable = true;
    row.dataset.target = btn.dataset.target || i;
    row.style.cssText = 'display:flex;align-items:center;gap:10px;background:#fff;border:1.5px solid #e5e7eb;border-radius:12px;padding:10px 12px;cursor:grab;user-select:none;transition:box-shadow .15s,transform .15s;touch-action:none;';
    row.innerHTML = '<span style="color:#aaa;font-size:16px;flex-shrink:0;">⠿</span>'
      +'<span style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;color:#2d7a2d;flex-shrink:0;">'+iconHtml+'</span>'
      +'<span style="font-size:13px;font-weight:600;color:#1a1a1a;flex:1;">'+label+'</span>'
      +'<span style="font-size:11px;color:#aaa;">↕</span>';

    // Desktop drag events
    row.addEventListener('dragstart', function(e){
      _navDragSrc = row;
      row.style.opacity = '.45';
      e.dataTransfer.effectAllowed = 'move';
    });
    row.addEventListener('dragend', function(){
      row.style.opacity = '1';
      list.querySelectorAll('.nav-reorder-row').forEach(function(r){ r.style.boxShadow=''; r.style.transform=''; });
    });
    row.addEventListener('dragover', function(e){
      e.preventDefault();
      if(_navDragSrc && _navDragSrc !== row){
        row.style.boxShadow = '0 0 0 2px #4aab3a';
        var bounding = row.getBoundingClientRect();
        var offset = bounding.y + bounding.height/2;
        if(e.clientY < offset){
          list.insertBefore(_navDragSrc, row);
        } else {
          list.insertBefore(_navDragSrc, row.nextSibling);
        }
      }
    });
    row.addEventListener('dragleave', function(){ row.style.boxShadow=''; });
    row.addEventListener('drop', function(e){ e.preventDefault(); row.style.boxShadow=''; });

    // Touch drag (mobile long-press)
    var _touchTimer = null, _touchSrc = null, _touchLastY = 0;
    row.addEventListener('touchstart', function(e){
      _touchLastY = e.touches[0].clientY;
      _touchTimer = setTimeout(function(){
        _touchSrc = row;
        row.style.boxShadow = '0 4px 20px rgba(45,122,45,.3)';
        row.style.transform = 'scale(1.03)';
        if(navigator.vibrate) navigator.vibrate(40);
      }, 350);
    }, {passive:true});
    row.addEventListener('touchmove', function(e){
      if(!_touchSrc){ clearTimeout(_touchTimer); return; }
      var touch = e.touches[0];
      var el = document.elementFromPoint(touch.clientX, touch.clientY);
      var target = el && el.closest('.nav-reorder-row');
      if(target && target !== _touchSrc){
        var bounding = target.getBoundingClientRect();
        if(touch.clientY < bounding.y + bounding.height/2){
          list.insertBefore(_touchSrc, target);
        } else {
          list.insertBefore(_touchSrc, target.nextSibling);
        }
      }
    }, {passive:true});
    row.addEventListener('touchend', function(){
      clearTimeout(_touchTimer);
      if(_touchSrc){
        _touchSrc.style.boxShadow = '';
        _touchSrc.style.transform = '';
        _touchSrc = null;
      }
    });

    list.appendChild(row);
  });
}

function applyNavOrder(){
  var list = $('nav-reorder-list');
  if(!list) return;
  var rows = list.querySelectorAll('.nav-reorder-row');
  var newOrder = Array.from(rows).map(function(r){ return r.dataset.target; });
  // Save order
  try{ localStorage.setItem('zentea_nav_order', JSON.stringify(newOrder)); }catch(e){}
  // Reorder actual nav items
  reorderNavItems(newOrder);
  closeNavReorder();
  if(typeof showToast==='function') showToast('✅ Đã sắp xếp!', 'Thứ tự menu đã được lưu');
}

function reorderNavItems(order){
  var navItems = document.querySelector('#topnav .nav-items');
  if(!navItems) return;
  var sortBtn = $('nav-sort-btn');
  var dividers = Array.from(navItems.querySelectorAll('.nav-divider:not(:last-child)'));
  // Remove all dividers from their current positions (except the one before sort btn)
  var allItems = getNavItems();
  var itemMap = {};
  allItems.forEach(function(btn){ itemMap[btn.dataset.target] = btn; });
  // Clear and re-append in order
  order.forEach(function(target){
    var btn = itemMap[target];
    if(btn) navItems.insertBefore(btn, sortBtn.previousSibling.previousSibling || sortBtn);
  });
}

function resetNavOrder(){
  try{ localStorage.removeItem('zentea_nav_order'); }catch(e){}
  location.reload();
}

function applyNavOrderOnLoad(){
  var saved = null;
  try{ saved = JSON.parse(localStorage.getItem('zentea_nav_order')||'null'); }catch(e){}
  if(saved && Array.isArray(saved)) reorderNavItems(saved);
}

// ═══  INLINE CONTENT EDITING  ════════════════
var _inlineEditActive = false;

function initInlineEdit(){
  // Các section đã có nút openContentEdit riêng → không thêm inline toggle
  var MODAL_SECTIONS = ['checklist','salary','training','dt-vipham','dt-quytrinh'];
  document.querySelectorAll('.panel-titlebar').forEach(function(bar){
    var section = bar.closest('.acc-section');
    if(!section) return;
    // Bỏ qua nếu section đã có btn-edit (modal editor)
    if(bar.querySelector('.btn-edit')) return;
    // Bỏ qua nếu section id nằm trong danh sách modal
    if(MODAL_SECTIONS.indexOf(section.id) >= 0) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'inline-edit-toggle';
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Chỉnh sửa';
    btn.title = 'Bật/tắt chỉnh sửa trực tiếp nội dung';
    btn.style.cssText = 'margin-left:auto;display:flex;align-items:center;gap:5px;padding:5px 12px;border-radius:20px;border:1.5px solid #2d7a2d;background:#f0fdf0;color:#2d7a2d;font-size:11px;font-weight:700;cursor:pointer;font-family:Open Sans,sans-serif;transition:.15s;flex-shrink:0;';
    btn.addEventListener('click', function(){ toggleInlineEdit(section, btn); });
    bar.appendChild(btn);
  });
}

function toggleInlineEdit(section, btn){
  var isOn = section.dataset.editMode === '1';
  if(isOn){
    // Turn off - save all edits
    saveInlineEdits(section);
    section.dataset.editMode = '0';
    btn.style.background = '#f0fdf0';
    btn.style.color = '#2d7a2d';
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Chỉnh sửa';
    section.querySelectorAll('[contenteditable="true"]').forEach(function(el){
      el.contentEditable = 'false';
      el.style.outline = '';
      el.style.borderRadius = '';
      el.style.background = '';
      el.style.minHeight = '';
    });
    if(typeof showToast==='function') showToast('💾 Đã lưu!', 'Nội dung chỉnh sửa đã được lưu');
  } else {
    // Turn on edit mode
    section.dataset.editMode = '1';
    btn.style.background = '#fff3cd';
    btn.style.color = '#b45309';
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Lưu lại';
    // Make text nodes editable
    var editableSelectors = [
      '.step-title','step-desc',
      '.tl-task','.tl-period',
      '.check-text',
      '.contact-name','.contact-dept','.contact-phone',
      '.panel-title','td','th',
      'p','li','h2','h3','h4',
      '[style*="font-size"]',
      '.info-card-body','.situation-card-body','.note-box',
      '.acc-inner p', '.acc-inner li', '.acc-inner td','.acc-inner h2','.acc-inner h3','.acc-inner h4'
    ];
    var body = section.querySelector('.acc-inner') || section.querySelector('.acc-body') || section;
    // Enable contenteditable on meaningful text nodes
    body.querySelectorAll('p,li,td,th,h2,h3,h4,.check-text,.tl-task,.tl-period,.contact-name,.contact-dept,.step-title,.step-desc,.info-card-body,.situation-card-body,.note-box').forEach(function(el){
      // Skip elements with interactive children (buttons, inputs)
      if(el.querySelector('button,input,select,textarea')) return;
      el.contentEditable = 'true';
      el.style.outline = '2px dashed #f59e0b';
      el.style.outlineOffset = '2px';
      el.style.borderRadius = '4px';
      el.style.minHeight = '1em';
    });
  }
}

function saveInlineEdits(section){
  var sectionId = section.id || 'unknown';
  var branch = '';
  try{ branch = localStorage.getItem('zentea_branch')||''; }catch(e){}
  var key = 'zentea_inline_'+branch+'_'+sectionId;
  var data = {};
  section.querySelectorAll('[contenteditable]').forEach(function(el, i){
    data['el_'+i] = el.innerHTML;
    el.dataset.inlineIdx = i;
  });
  try{ localStorage.setItem(key, JSON.stringify(data)); }catch(e){}
}

// ── CSS for inline edit ──
(function(){
  var s = document.createElement('style');
  s.textContent = '[contenteditable="true"]:focus{outline:2px solid #f59e0b!important;background:rgba(255,243,205,.35)!important;} .inline-edit-toggle:hover{transform:translateY(-1px);box-shadow:0 3px 10px rgba(45,122,45,.15);} #nav-sort-btn:hover{opacity:1!important;}';
  document.head.appendChild(s);
})();




// ══════════════════════════════════════════════════════════════
// GOOGLE ACCOUNT AUTHORIZATION SYSTEM
// ══════════════════════════════════════════════════════════════

// Lock để tránh gọi handleGoogleUser đồng thời
// _googleAuthLock defined in config.js
