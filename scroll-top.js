/* Mỗi lần mở một trang/mục: tự cuộn tới đầu phần nội dung chính, không giữ vị trí cuộn của trang trước. */
(function(){'use strict';
try{history.scrollRestoration='manual'}catch(e){}
var vis=function(el){return !!el&&!el.classList.contains('hidden')&&el.offsetParent!==null};
function curSec(){try{return typeof currentSection!=='undefined'?currentSection:''}catch(e){return ''}}
function pick(sec){
  var run=document.getElementById('quiz-run-area');if(vis(run))return run;
  var own=document.getElementById(sec+'-section');if(vis(own))return own;
  var all=document.querySelectorAll('[id$="-section"]');
  for(var i=0;i<all.length;i++)if(vis(all[i]))return all[i];
  return null}
function go(sec){
  var h=document.querySelector('header.sticky');var off=(h?h.offsetHeight:0)+8;
  var el=(sec==='home')?null:pick(sec);
  var y=el?Math.max(0,el.getBoundingClientRect().top+window.pageYOffset-off):0;
  try{window.scrollTo({top:y,left:0,behavior:'instant'})}catch(e){window.scrollTo(0,y)}}
function later(getSec){
  requestAnimationFrame(function(){go(getSec())});
  setTimeout(function(){go(getSec())},120);
  setTimeout(function(){go(getSec())},450)}
function wrap(name,getSec){
  var o=window[name];if(typeof o!=='function'||o.__st)return;
  var w=function(){var r=o.apply(this,arguments);later(function(){return getSec.apply(null,arguments)}.bind(null));return r};
  w.__st=1;window[name]=w}
function sw(){var o=window.switchSection;if(typeof o!=='function'||o.__st)return;
  var w=function(sec){var r=o.apply(this,arguments);later(function(){return sec||curSec()});return r};
  w.__st=1;window.switchSection=w}
function init(){sw();['launchQuiz','openQuizPicker','showQuizPicker'].forEach(function(n){wrap(n,curSec)})}
if(document.readyState==='complete')setTimeout(init,0);else window.addEventListener('load',function(){setTimeout(init,0)});
})();
