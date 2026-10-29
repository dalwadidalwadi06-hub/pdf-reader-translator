/* PDF.js renderer and automatic translation pop-up, touch-friendly for iPad. */
if(!window.pdfjsLib){alert("PDF.js tidak berhasil dimuat. Periksa koneksi internet lalu muat ulang halaman.");}
else pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
const $=id=>document.getElementById(id);
const defaults={source:"en",target:"id",provider:"mymemory"};
let pdfDoc=null,currentPage=1,scale=1.2,fileKey="",selectedText="",translatedText="",requestId=0,translateTimer=null,lastSelection="";
const loadObj=(key,def)=>{try{return JSON.parse(localStorage.getItem(key)||"null")??def}catch{return def}};
const saveObj=(key,val)=>localStorage.setItem(key,JSON.stringify(val));
function settings(){return {...defaults,...loadObj("pdftr-settings",{})};}
function status(t){$("status").textContent=t||"";}
function updatePager(){ $("pageStatus").textContent=pdfDoc?`${currentPage} / ${pdfDoc.numPages}`:"0 / 0";$("prevPage").disabled=!pdfDoc||currentPage<=1;$("nextPage").disabled=!pdfDoc||currentPage>=pdfDoc.numPages;}
async function openFile(file){
 if(!file)return;if(!file.name.toLowerCase().endsWith(".pdf")){alert("Pilih file PDF.");return;}
 try{
 $("fileLabel").textContent=file.name;$("welcome").hidden=true;$("documentArea").hidden=false;$("pages").innerHTML='<div class="page-loading">Membuka PDF…</div>';
 const buffer=await file.arrayBuffer();pdfDoc=await pdfjsLib.getDocument({data:buffer}).promise;fileKey=`${file.name}:${file.size}:${file.lastModified}`;
 const last=loadObj("pdftr-lastpages",{});currentPage=Math.min(Math.max(1,last[fileKey]||1),pdfDoc.numPages);await renderPage(currentPage);
 }catch(e){console.error(e);alert("PDF tidak dapat dibuka. Coba file PDF lain.");}
}
async function renderPage(n){
 if(!pdfDoc)return;currentPage=n;
 const page=await pdfDoc.getPage(n),viewport=page.getViewport({scale});
 const wrap=document.createElement("div");wrap.className="page-wrap";wrap.style.width=viewport.width+"px";
 const canvas=document.createElement("canvas");canvas.className="page-canvas";canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);canvas.style.width=viewport.width+"px";canvas.style.height=viewport.height+"px";wrap.appendChild(canvas);
 const layer=document.createElement("div");layer.className="textLayer";layer.style.width=viewport.width+"px";layer.style.height=viewport.height+"px";wrap.appendChild(layer);
 $("pages").replaceChildren(wrap);await page.render({canvasContext:canvas.getContext("2d"),viewport}).promise;
 const content=await page.getTextContent();
 if(typeof pdfjsLib.renderTextLayer==="function"){const task=pdfjsLib.renderTextLayer({textContent:content,container:layer,viewport,textDivs:[]});await task.promise;}
 else {for(const item of content.items){if(!item.str)continue;const tx=pdfjsLib.Util.transform(viewport.transform,item.transform);const span=document.createElement("span");span.textContent=item.str;span.style.left=tx[4]+"px";span.style.top=(tx[5]-Math.abs(tx[3]||tx[0])*.8)+"px";span.style.fontSize=Math.max(1,Math.hypot(tx[2],tx[3]))+"px";layer.appendChild(span);}}
 updatePager();const last=loadObj("pdftr-lastpages",{});last[fileKey]=currentPage;saveObj("pdftr-lastpages",last);
}
$("fileInput").addEventListener("change",e=>openFile(e.target.files[0]));$("welcomeFile").addEventListener("change",e=>openFile(e.target.files[0]));
$("prevPage").addEventListener("click",()=>{if(currentPage>1)renderPage(currentPage-1)});$("nextPage").addEventListener("click",()=>{if(pdfDoc&&currentPage<pdfDoc.numPages)renderPage(currentPage+1)});
$("zoomIn").addEventListener("click",()=>{if(pdfDoc){scale=Math.min(2.5,scale+.15);renderPage(currentPage)}});$("zoomOut").addEventListener("click",()=>{if(pdfDoc){scale=Math.max(.65,scale-.15);renderPage(currentPage)}});
function selectedRange(){const sel=window.getSelection();if(!sel||!String(sel).trim())return null;try{return sel.getRangeAt(0)}catch{return null}}
function placePopup(range){
 const rect=range?.getBoundingClientRect();if(!rect)return;
 const pop=$("selectionPopup");pop.hidden=false;
 const left=Math.max(8,Math.min(rect.left+(rect.width/2)-145,window.innerWidth-318));
 let top=rect.top-160;if(top<8)top=Math.min(rect.bottom+12,window.innerHeight-180);
 pop.style.left=left+"px";pop.style.top=Math.max(8,top)+"px";
}
function onTextSelected(){
 const range=selectedRange();const text=String(window.getSelection()?.toString()||"").trim();
 if(!text||!range||text===lastSelection)return;
 lastSelection=text;selectedText=text;$("selectedText").textContent=text;$("popupSelection").textContent=text.length>180?text.slice(0,177)+"…":text;$("popupTranslation").textContent="Menerjemahkan…";placePopup(range);
 clearTimeout(translateTimer);translateTimer=setTimeout(()=>translateText(text),450);
}
document.addEventListener("selectionchange",()=>{if(window.getSelection()?.toString().trim())onTextSelected();});
document.addEventListener("mouseup",onTextSelected);
document.addEventListener("touchend",()=>{setTimeout(onTextSelected,120);},{passive:true});
document.addEventListener("mousedown",e=>{if(!$("selectionPopup").contains(e.target)&&!e.target.closest(".textLayer"))$("selectionPopup").hidden=true;});
document.addEventListener("touchstart",e=>{if(!$("selectionPopup").contains(e.target)&&!e.target.closest(".textLayer")){$("selectionPopup").hidden=true;}},{passive:true});
$("popupOpenPanel").addEventListener("click",()=>{document.querySelector('[data-tab="translate"]').click();$("selectionPopup").hidden=true;});
async function myMemory(text,s){
 if(s.source==="auto")throw new Error("Pilih bahasa sumber di Pengaturan (contoh: Inggris).");
 const url=new URL("https://api.mymemory.translated.net/get");url.searchParams.set("q",text.slice(0,450));url.searchParams.set("langpair",`${s.source}|${s.target}`);
 const res=await fetch(url);if(!res.ok)throw new Error("Layanan MyMemory tidak tersedia ("+res.status+").");
 const data=await res.json();if(data.responseStatus!==200||!data.responseData?.translatedText)throw new Error(data.responseDetails||"Tidak ada hasil. Coba sorot bagian teks yang lebih pendek.");
 return data.responseData.translatedText;
}
async function libre(text,s){
 let err;for(const endpoint of ["https://translate.terraprint.co/translate","https://trans.zillyhuhn.com/translate"]){try{
 const res=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({q:text,source:s.source,target:s.target,format:"text"})});
 if(!res.ok)throw new Error("HTTP "+res.status);const data=await res.json();if(data.translatedText)return data.translatedText;throw new Error("Respons tanpa terjemahan");
 }catch(e){err=e;}}
 throw new Error("Server LibreTranslate publik tidak tersedia. "+(err?.message||""));
}
async function translateText(text){
 const id=++requestId;status("Menerjemahkan…");
 try{
 const s=settings();const result=s.provider==="libretranslate"?await libre(text,s):await myMemory(text,s);
 if(id!==requestId)return;translatedText=result;$("translationText").textContent=result;
 if(selectedText===text&&!$("selectionPopup").hidden)$("popupTranslation").textContent=result;
 $("speakBtn").disabled=false;$("copyBtn").disabled=false;$("favoriteBtn").disabled=false;status("Terjemahan selesai.");
 const history=loadObj("pdftr-history",[]);history.unshift({source:text,target:result,createdAt:Date.now(),file:$("fileLabel").textContent,page:currentPage});saveObj("pdftr-history",history.slice(0,200));renderHistory();
 }catch(e){if(id!==requestId)return;status("Terjemahan gagal: "+e.message);if(selectedText===text&&!$("selectionPopup").hidden)$("popupTranslation").textContent="Terjemahan gagal. "+e.message;}
}
function speak(text,lang){if(!text)return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang=lang==="zh-CN"?"zh-CN":lang;speechSynthesis.speak(u);}
$("speakBtn").addEventListener("click",()=>speak(selectedText,settings().source));$("copyBtn").addEventListener("click",async()=>{try{await navigator.clipboard.writeText(translatedText);status("Terjemahan disalin.");}catch{status("Silakan pilih dan salin teks terjemahan secara manual.");}});
$("favoriteBtn").addEventListener("click",()=>{if(!selectedText||!translatedText)return;const items=loadObj("pdftr-favorites",[]);if(!items.some(x=>x.source===selectedText&&x.target===translatedText)){items.unshift({source:selectedText,target:translatedText,createdAt:Date.now(),file:$("fileLabel").textContent,page:currentPage});saveObj("pdftr-favorites",items);}renderFavorites();$("favoriteBtn").textContent="★ Tersimpan";});
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x===b));document.querySelectorAll(".tab-panel").forEach(x=>x.hidden=x.id!==`tab-${b.dataset.tab}`);if(b.dataset.tab==="favorites")renderFavorites();if(b.dataset.tab==="history")renderHistory();}));
function card(item,isFav){const d=document.createElement("div");d.className="saved-item";const a=document.createElement("div");a.className="source";a.textContent=item.source;const b=document.createElement("div");b.className="target";b.textContent=item.target;const m=document.createElement("div");m.className="meta";m.textContent=`${item.file||""} · halaman ${item.page||"-"} · ${new Date(item.createdAt).toLocaleString()}`;const actions=document.createElement("div");actions.className="item-actions";const copy=document.createElement("button");copy.className="secondary";copy.textContent="Salin";copy.onclick=()=>navigator.clipboard.writeText(item.target||"");const say=document.createElement("button");say.className="secondary";say.textContent="🔊 Ucapkan";say.onclick=()=>speak(item.source,settings().source);actions.append(copy,say);if(isFav){const del=document.createElement("button");del.className="secondary";del.textContent="Hapus";del.onclick=()=>{saveObj("pdftr-favorites",loadObj("pdftr-favorites",[]).filter(x=>!(x.source===item.source&&x.target===item.target)));renderFavorites()};actions.append(del);}d.append(a,b,m,actions);return d;}
function renderFavorites(){const root=$("favoritesList");root.replaceChildren();const items=loadObj("pdftr-favorites",[]);if(!items.length){root.textContent="Belum ada kosakata favorit.";return;}items.forEach(x=>root.appendChild(card(x,true)));}
function renderHistory(){const root=$("historyList");root.replaceChildren();const items=loadObj("pdftr-history",[]);if(!items.length){root.textContent="Belum ada riwayat terjemahan.";return;}items.forEach(x=>root.appendChild(card(x,false)));}
$("clearHistory").addEventListener("click",()=>{if(confirm("Hapus seluruh riwayat?")){saveObj("pdftr-history",[]);renderHistory();}});
$("saveSettings").addEventListener("click",()=>{saveObj("pdftr-settings",{source:$("source").value,target:$("target").value,provider:$("provider").value});status("Pengaturan tersimpan.");});
function loadSettingsUI(){const s=settings();$("source").value=s.source;$("target").value=s.target;$("provider").value=s.provider;}
loadSettingsUI();renderFavorites();renderHistory();
if("serviceWorker" in navigator && location.protocol.startsWith("http"))window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
