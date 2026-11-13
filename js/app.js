/* Professor Bingo — game logic, scenery, water/fire effects */
(function(){
"use strict";
const NS="http://www.w3.org/2000/svg";
const rand=(a,b)=>a+Math.random()*(b-a);

/* ---------------- procedural scenery ---------------- */
(function buildScene(){
  const land=document.getElementById("land"); let h="";
  h+=`<defs><radialGradient id="lantern"><stop offset="0" stop-color="#ffcf6a"/><stop offset=".4" stop-color="#ff7a2b" stop-opacity=".7"/><stop offset="1" stop-color="#ff4a1a" stop-opacity="0"/></radialGradient></defs>`;
  h+=`<path d="M0 330 C200 280 340 300 520 270 C700 240 860 290 1040 260 C1200 235 1320 270 1440 250 L1440 600 L0 600Z" fill="#2c1a4c"/>`;
  function pagoda(cx,base,w,tiers,fill){
    let d="",y=base,tw=w;
    for(let i=0;i<tiers;i++){
      const bh=tw*0.32, bx=cx-tw*0.3;
      d+=`M${bx} ${y} h${tw*0.6} v${-bh} h${-tw*0.6}Z`;
      y-=bh;
      d+=`M${cx-tw*0.7} ${y+4} Q${cx-tw*0.45} ${y-2} ${cx-tw*0.36} ${y-tw*0.16} L${cx+tw*0.36} ${y-tw*0.16} Q${cx+tw*0.45} ${y-2} ${cx+tw*0.7} ${y+4} Z`;
      y-=tw*0.16; tw*=0.8;
    }
    d+=`M${cx-2} ${y} h4 v-${w*0.5} h-4Z`;
    return `<path d="${d}" fill="${fill}"/>`;
  }
  h+=pagoda(260,330,120,5,"#22143d")+pagoda(1150,320,110,4,"#22143d")+pagoda(700,300,80,3,"#25163f");
  h+=`<path d="M0 420 C160 380 300 400 460 370 C620 345 760 395 940 365 C1100 340 1260 380 1440 360 L1440 600 L0 600Z" fill="#1b0f2e"/>`;
  pagoda(120,430,150,4,"#150b24")+pagoda(1320,425,140,4,"#150b24");
  [[160,300],[205,250],[1190,290],[1290,330],[118,360],[1330,360],[700,265]].forEach(([x,y])=>{h+=`<circle cx="${x}" cy="${y}" r="26" fill="url(#lantern)"/><circle cx="${x}" cy="${y}" r="3" fill="#ffe2a0"/>`;});
  // torii bottom-right
  h+=`<g fill="#7a1420" stroke="#2a0509" stroke-width="2"><rect x="1250" y="470" width="12" height="110"/><rect x="1338" y="470" width="12" height="110"/><path d="M1225 462 Q1300 448 1375 462 L1372 474 Q1300 462 1228 474Z"/><rect x="1240" y="488" width="120" height="8"/></g>`;
  h+=`<path d="M0 520 C200 490 400 520 640 500 C880 480 1100 520 1440 495 L1440 600 L0 600Z" fill="#0e0717"/>`;
  land.innerHTML=h;
  // wisteria
  ["wisL","wisR"].forEach(id=>{
    const s=document.getElementById(id); let w=`<path d="M0 8 C60 20 140 2 240 14" stroke="#3a2418" stroke-width="7" fill="none"/>`;
    const cols=["#c7a0ee","#a77fd9","#8e63c4","#e3c9f7","#b88ae6"];
    for(let k=0;k<9;k++){
      const x0=12+k*26+rand(-6,6), len=rand(140,320); let y=14, wd=16;
      w+=`<path d="M${x0} 10 L${x0} ${14+len*0.1}" stroke="#4d7a3a" stroke-width="1.5"/>`;
      while(y<len){ const n=wd>8?3:2; for(let j=0;j<n;j++){ w+=`<circle cx="${(x0+rand(-wd/2,wd/2)).toFixed(1)}" cy="${(y+rand(-2,2)).toFixed(1)}" r="${(rand(2.4,4.2)*(0.5+wd/32)).toFixed(1)}" fill="${cols[Math.floor(Math.random()*cols.length)]}" opacity="${rand(.75,1).toFixed(2)}"/>`; } y+=5.5; wd=Math.max(3,wd-0.42); }
    }
    s.innerHTML=w;
  });
})();

/* ---------------- data ---------------- */
const PRESETS={
  "Any lecture":["Any questions?","This will be on the exam","As I said last class","Let's take a 5-minute break","Can everyone hear me?","I'll upload the slides later","Is this clear?","We're running out of time","Read the next chapter","This is very important","Let me go back a slide","Who can tell me…","Settle down, please","Phones away","Attendance is compulsory","Let's wait for latecomers","Quiet at the back","I'll explain it next class","It's a simple concept","Write this down","Any doubts?","I want pin-drop silence","Assignment due Monday","You should know this already","One last thing…","Last slide, I promise","Raise your hand","Check the syllabus","Does that make sense?","I'm not here to spoon-feed you"],
  "Online class":["You're on mute","Can you see my screen?","Turn on your cameras","Sorry, my internet dropped","Type it in the chat","Someone's mic is on","Can you hear me now?","Let me share the other window","I'll send the recording","Is anyone there?","Unmute and answer","Wait, the slide isn't moving","Put a 'yes' in the chat","Admitting people from the waiting room","Your video is frozen","Can someone confirm?","Hello? Hello?","I'll stop sharing now","Raise your virtual hand","Please rename yourself","Check the meeting link","There's a lag","Let's do a quick poll","Breakout rooms now","Close your other tabs","Is the audio clear?","Who just left the call?","I see you're not on camera"],
  "CS / Engineering":["It's just an edge case","Works on my machine","Let's dry-run this","Off-by-one error","Base case first","Just Google it","Don't copy from GitHub","Semicolon missing","Compile and see","Theoretically it should work","Think in terms of pointers","Draw the flowchart","Classic interview question","Null check!","Indentation matters","Write pseudocode first","What's the time complexity?","What about space complexity?","Use a hash map","Trust me, it's O(1)","Test your corner cases","Use version control","Left as an exercise","Lab viva next week","Comment your code","Infinite loop again?","Did you even run it?","It's in the documentation"]
};
const RANKS=[[0,"Ink Novice"],[100,"Lantern Scout"],[300,"Moon Blade"],[600,"Crimson Ronin"],[1000,"Shadow Master"],[1600,"Legend of the Hall"]];
const XP_TICK=10,XP_LINE=100,COMBO_WINDOW=15000;
const LINES=[],LINE_NAMES=[];
for(let r=0;r<5;r++){LINES.push([0,1,2,3,4].map(c=>r*5+c));LINE_NAMES.push("Row "+(r+1));}
for(let c=0;c<5;c++){LINES.push([0,1,2,3,4].map(r=>r*5+c));LINE_NAMES.push("Column "+"BINGO"[c]);}
LINES.push([0,6,12,18,24]);LINE_NAMES.push("Diagonal ↘");
LINES.push([4,8,12,16,20]);LINE_NAMES.push("Diagonal ↙");
const CENTER=12,KEY="professorBingo.v3",MAX_LEN=60;

const SAMPLE_HUNTERS=[
  { name:"Moonblade Riku", emblem:"moon", xp:1420, bingos:11, bestCombo:7 },
  { name:"Ember Sana", emblem:"flame", xp:980, bingos:7, bestCombo:5 },
  { name:"Quiet Kenji", emblem:"wave", xp:750, bingos:6, bestCombo:6 },
  { name:"Lantern Mei", emblem:"sakura", xp:520, bingos:4, bestCombo:4 },
  { name:"Ink Daichi", emblem:"wave", xp:390, bingos:3, bestCombo:4 },
  { name:"Petal Aiko", emblem:"sakura", xp:240, bingos:2, bestCombo:3 },
  { name:"Storm Haru", emblem:"flame", xp:80, bingos:0, bestCombo:2 }
];
const SAMPLE_HUNTERS_SESSION=[
  { name:"Moonblade Riku", emblem:"moon", xp:160, bingos:1, bestCombo:4 },
  { name:"Ember Sana", emblem:"flame", xp:110, bingos:1, bestCombo:3 },
  { name:"Quiet Kenji", emblem:"wave", xp:70, bingos:0, bestCombo:3 },
  { name:"Lantern Mei", emblem:"sakura", xp:50, bingos:0, bestCombo:2 },
  { name:"Ink Daichi", emblem:"wave", xp:40, bingos:0, bestCombo:2 },
  { name:"Petal Aiko", emblem:"sakura", xp:20, bingos:0, bestCombo:1 },
  { name:"Storm Haru", emblem:"flame", xp:0, bingos:0, bestCombo:0 }
];

let sessionXP=0, sessionBingos=0, sessionBestCombo=0;
let S=load()||freshState();
let focusIdx=0,freshCell=-1,lastTick=0,combo=0;

function freshState(){
  const deck="Any lecture";
  const s={
    deck,
    phrases:PRESETS[deck].slice(),
    free:true,
    quiet:false,
    target:1,
    seed:0,
    card:[],
    ticked:{},
    history:[],
    log:[],
    completed:[],
    celebrated:0,
    wins:0,
    cards:0,
    xp:0,
    bestCombo:0,
    hunter:{ name:"Guest Hunter", emblem:"wave" }
  };
  newCard(s);
  return s;
}

function load(){
  try{
    const raw=localStorage.getItem(KEY);
    if(!raw)return null;
    const s=JSON.parse(raw);
    if(!s||!Array.isArray(s.card)||s.card.length!==25)return null;
    if(!s.hunter) s.hunter={ name:"Guest Hunter", emblem:"wave" };
    if(typeof s.bestCombo!=="number") s.bestCombo=0;
    return s;
  }catch(e){return null;}
}

function save(){
  try{
    localStorage.setItem(KEY,JSON.stringify(S));
    if(typeof saveCurrentHunter === "function") saveCurrentHunter();
  }catch(e){}
}
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function newCard(s){
  s.seed=Math.floor(Math.random()*0xFFFF);
  const r=rng(s.seed),pool=s.phrases.slice();
  for(let i=pool.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
  const picked=pool.slice(0,s.free?24:25); if(s.free) picked.splice(CENTER,0,"FREE");
  s.card=picked;s.ticked={};s.history=[];s.log=[];s.completed=[];s.celebrated=0;
  if(s.free) s.ticked[CENTER]="free";
  s.cards=(s.cards||0)+1;
}
const rankFor=xp=>{let i=0;RANKS.forEach((r,k)=>{if(xp>=r[0])i=k;});return i;};

/* ---------------- validation ---------------- */
function parsePhrases(text){const seen=new Set(),out=[],problems=[];text.split("\n").forEach((line,n)=>{const p=line.trim().replace(/\s+/g," ");if(!p)return;if(p.length>MAX_LEN){problems.push(`Line ${n+1} is too long (${p.length}/${MAX_LEN} chars).`);return;}const k=p.toLowerCase();if(seen.has(k))return;seen.add(k);out.push(p);});return{list:out,problems};}
function validate(){
  const{list,problems}=parsePhrases(el.phrases.value),need=el.freeChk.checked?24:25;
  el.count.textContent=`${list.length} unique phrases · need at least ${need}`;
  const msg=problems.length?problems[0]:(list.length<need?`Summon ${need-list.length} more unique phrase${need-list.length===1?"":"s"} to fill the card.`:"");
  el.count.className="hint"+(msg?"":" ok");el.err.textContent=msg;el.applyBtn.disabled=!!msg;return msg?null:list;
}

/* ---------------- DOM ---------------- */
const $=id=>document.getElementById(id);const el={};
["grid","status","cardId","deckName","quietBtn","newCardBtn","undoBtn","clearBtn","preset","phrases","count","err","freeChk","applyBtn","resetDeckBtn","log",
 "sLines","sWins","sCards","overlay","modal","winLine","winRibbon","rankUp","ach","slain","keepBtn","modalNewBtn","toast","combo","rankName","rankXp","xpBar","app","intro","startBtn","guestBtn","hunterNameInput","nameError","emblemPicker","switchHunterBtn","hunterNameDisplay","hunterProfileEmblem","openScoreboardBtn","modalScoreBtn","scoreboardOverlay","closeScoreboardBtn","returnGameBtn","tabAllTime","tabSession","resetScoreBtn","resetConfirmDialog","confirmResetBtn","cancelResetBtn","scoreTableBody","fx","amb",
 "savedHuntersWrap","savedHuntersList","newHunterToggleBtn","customHunterForm","studentRollInput","studentRollErr","studentSectionSelect","studentLoginBtn"].forEach(k=>el[k]=$(k));
Object.keys(PRESETS).concat(["Custom"]).forEach(n=>{const o=document.createElement("option");o.value=o.textContent=n;el.preset.appendChild(o);});
const targetRadios=[...document.querySelectorAll('input[name="target"]')];
const fmtTime=ts=>new Date(ts).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
const ICON_TICK='<svg class="ic"><use href="#sakura"/></svg>';

function renderHud(){
  const i=rankFor(S.xp),cur=RANKS[i][0],next=RANKS[i+1]?RANKS[i+1][0]:null;
  el.rankName.textContent=RANKS[i][1];
  el.rankXp.textContent=next?`${S.xp} / ${next} XP`:`${S.xp} XP · MAX`;
  el.xpBar.style.width=(next?((S.xp-cur)/(next-cur))*100:100)+"%";
}

function updateHunterDisplay(){
  if(!S.hunter) S.hunter={ name:"Guest Hunter", emblem:"wave" };
  if(el.hunterNameDisplay) el.hunterNameDisplay.textContent=S.hunter.name;
  if(el.hunterProfileEmblem){
    const use=el.hunterProfileEmblem.querySelector("use");
    if(use) use.setAttribute("href","#emblem-"+S.hunter.emblem);
  }
}

function render(){
  document.body.classList.toggle("quiet",!!S.quiet);
  el.quietBtn.setAttribute("aria-checked",S.quiet?"true":"false");
  el.cardId.textContent="#"+S.seed.toString(16).toUpperCase().padStart(4,"0");
  el.deckName.textContent=S.deck+" · win at "+S.target+" line"+(S.target>1?"s":"");
  const winCells=new Set();S.completed.forEach(li=>LINES[li].forEach(i=>winCells.add(i)));
  el.grid.innerHTML="";
  S.card.forEach((text,i)=>{
    const b=document.createElement("button"),isFree=S.free&&i===CENTER,on=!!S.ticked[i];
    b.className="cell"+(on?" ticked":"")+(isFree?" free":"")+(winCells.has(i)?" win":"")+(i===freshCell?" fresh":"");
    b.setAttribute("role","gridcell");b.setAttribute("aria-pressed",on?"true":"false");b.tabIndex=i===focusIdx?0:-1;b.dataset.i=i;
    b.setAttribute("aria-label",(isFree?"Free space":text)+(on?", ticked":", not ticked"));
    if(isFree){b.innerHTML='<span class="txt">無料</span><span class="sub">FREE</span>';}
    else{const tx=document.createElement("span");tx.className="txt";tx.textContent=text;b.appendChild(tx);
      if(on){const t=document.createElement("span");t.className="t";t.textContent=fmtTime(S.ticked[i]);b.appendChild(t);}
      b.insertAdjacentHTML("beforeend",'<span class="slash"></span><span class="stamp">討</span>');}
    el.grid.appendChild(b);
  });
  freshCell=-1;
  const n=Object.keys(S.ticked).length;
  el.status.innerHTML=`<b>${n}</b> / 25 slain`+(S.completed.length?` · <b>${S.completed.length}</b> line${S.completed.length>1?"s":""}`:"");
  el.undoBtn.disabled=!S.history.length;
  el.sLines.textContent=S.completed.length;el.sWins.textContent=S.wins;el.sCards.textContent=S.cards;
  el.log.innerHTML="";
  if(!S.log.length) el.log.innerHTML='<li class="empty">No demons slain yet. The lecture is suspiciously quiet…</li>';
  else S.log.slice().reverse().forEach(e=>{const li=document.createElement("li");if(e.win)li.className="win";li.innerHTML=ICON_TICK;
    const a=document.createElement("span");a.className="tx";a.textContent=e.text;const t=document.createElement("span");t.className="tm";t.textContent=fmtTime(e.ts);li.append(a,t);el.log.appendChild(li);});
  renderHud();
  updateHunterDisplay();
  if(isScoreboardOpen) renderScoreboard();
  save();
}

function syncEditor(){el.preset.value=S.deck;el.phrases.value=S.phrases.join("\n");el.freeChk.checked=S.free;targetRadios.forEach(r=>r.checked=+r.value===S.target);validate();}

/* ---------------- gameplay & water breathing spells ---------------- */
function spawnWaterBlade(i, isFlame) {
  const stageLeft = document.getElementById("stageLeft");
  let startX = 160, startY = 320;
  if (stageLeft && stageLeft.offsetParent !== null) {
    const rL = stageLeft.getBoundingClientRect();
    startX = rL.left + rL.width * 0.78;
    startY = rL.top + rL.height * 0.42;
  } else {
    startX = 28;
    startY = window.innerHeight * 0.45;
  }
  const cellEl = el.grid.querySelector(`[data-i="${i}"]`);
  if (cellEl) {
    const rC = cellEl.getBoundingClientRect();
    const endX = rC.left + rC.width / 2;
    const endY = rC.top + rC.height / 2;

    // Launch Water Breathing Dragon Spell (or Hinokami Kagura Flame Dragon)
    const arcHeight = S.quiet ? 45 : (isFlame ? 135 : 110);
    P.push({
      t: "waterDragon",
      isFlame: !!isFlame,
      startX, startY,
      endX, endY,
      cp1x: startX + (endX - startX) * 0.32,
      cp1y: Math.min(startY, endY) - arcHeight,
      cp2x: startX + (endX - startX) * 0.75,
      cp2y: Math.min(startY, endY) - (arcHeight * 0.65),
      progress: 0,
      speed: S.quiet ? 0.055 : (isFlame ? 0.042 : 0.038),
      trail: [],
      targetIdx: i,
      life: 1,
      max: 1
    });
    kick();
    if (!S.quiet) {
      if (isFlame) fireSound();
      else waterSpellSound();
    }
  }
}

function toggle(i,fromUndo){
  if(S.free&&i===CENTER){showToast("The free space is always yours.");return;}
  if(S.ticked[i]){
    delete S.ticked[i];
    S.xp=Math.max(0,S.xp-XP_TICK);
    sessionXP=Math.max(0,sessionXP-XP_TICK);
    combo=0;
  }else{
    const now=Date.now();S.ticked[i]=now;S.log.push({text:S.card[i],ts:now});
    combo=(now-lastTick<COMBO_WINDOW)?combo+1:1;lastTick=now;
    const gained=XP_TICK+(combo>1?combo*2:0);
    S.xp+=gained;
    sessionXP+=gained;
    if(combo>(S.bestCombo||0)) S.bestCombo=combo;
    if(combo>sessionBestCombo) sessionBestCombo=combo;
    freshCell=i;
    const isFlame = (combo >= 2) || (S.hunter && S.hunter.emblem === "flame");
    if(!S.quiet) slashSound();
    window.chars?.slash?.({ element: isFlame ? 'flame' : 'water' });
    window.chars?.cheer?.();
    spawnWaterBlade(i, isFlame);
  }
  showCombo();
  if(!fromUndo)S.history.push(i);
  if(S.log.length>60)S.log.shift();
  focusIdx=i;check();render();
  const btn=el.grid.querySelector(`[data-i="${i}"]`);if(btn)btn.focus();
  if(pendingWin){const w=pendingWin;pendingWin=null;celebrate(w);}
}

let pendingWin=null;
function check(){
  const now=[];LINES.forEach((line,li)=>{if(line.every(i=>S.ticked[i]))now.push(li);});
  const fresh=now.filter(li=>!S.completed.includes(li));
  S.completed=now;
  if(now.length<S.target) S.celebrated=Math.min(S.celebrated,now.length);
  if(!fresh.length) return;
  const before=rankFor(S.xp),gained=fresh.length*XP_LINE;
  S.xp+=gained;
  sessionXP+=gained;
  const names=fresh.map(li=>LINE_NAMES[li]);
  if(now.length>=S.target && now.length>S.celebrated){
    S.wins+=1;
    sessionBingos+=1;
    S.celebrated=now.length;
    S.log.push({text:"BINGO — "+names.join(", "),ts:Date.now(),win:true});
    const after=rankFor(S.xp);
    pendingWin={fresh,names,gained,rankUp:after>before?RANKS[after][1]:null};
  }else{
    S.log.push({text:"Line — "+names.join(", "),ts:Date.now(),win:true});
    showToast(`${names.join(" + ")} complete · ${now.length}/${S.target} lines · +${gained} XP`);
  }
}

function showCombo(){if(combo>1&&!S.quiet){el.combo.textContent=`x${combo} combo!`;el.combo.classList.add("show");}else el.combo.classList.remove("show");}
function achievements(){
  const t=S.ticked,n=Object.keys(t).length,c=S.completed;
  return [
    ["2 lines in a row", c.length>=2],
    ["1 line in any direction", c.length>=1],
    ["Corner line (diagonal)", c.includes(10)||c.includes(11)],
    ["4 corners", !!(t[0]&&t[4]&&t[20]&&t[24])],
    ["Full house", n===25]
  ];
}

function celebrate(w){
  const blackout=Object.keys(S.ticked).length===25, lines=S.completed.length;
  if(S.quiet){
    igniteQuietFire();
    window.chars?.click?.();
    showToast((blackout?"✓ Full house · ":"✓ Bingo · ")+w.names.join(" + ")+` · +${w.gained} XP`+(w.rankUp?` · Rank: ${w.rankUp}`:""));
    return;
  }
  window.chars?.victory?.();
  el.winLine.textContent=blackout?"⟡━ FULL HOUSE COMPLETE ━⟡":(lines>1?`⟡━ BINGO ${lines} COMPLETE ━⟡`:`⟡━ ${w.names.join(" + ")} COMPLETE ━⟡`.toUpperCase());
  el.winRibbon.textContent=`+${w.fresh.length} LINE${w.fresh.length>1?"S":""}`;
  el.rankUp.textContent=w.rankUp?`▲ Rank up · ${w.rankUp}`:"";el.rankUp.classList.toggle("show",!!w.rankUp);
  el.ach.innerHTML=achievements().map(([t,on])=>`<li class="${on?"on":""}"><span class="box">${on?"✓":""}</span>${t}</li>`).join("");
  const cells=new Set();w.fresh.forEach(li=>LINES[li].forEach(i=>cells.add(i)));
  el.slain.textContent="Slain: "+[...cells].map(i=>(S.free&&i===CENTER)?"FREE":S.card[i]).join(" · ");
  igniteFire();fireSound();
  setTimeout(()=>{el.overlay.classList.add("show");modalFire=true;kick();setTimeout(()=>el.keepBtn.focus(),60);},450);
}

function closeModal(){el.overlay.classList.remove("show");modalFire=false;const b=el.grid.querySelector(`[data-i="${focusIdx}"]`);if(b)b.focus();}
let toastTimer;function showToast(m){el.toast.textContent=m;el.toast.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.toast.classList.remove("show"),3500);}

/* ---------------- audio ---------------- */
let AC=null;
function ac(){if(S.quiet)return null;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.state==="suspended")AC.resume();return AC;}catch(e){return null;}}
function noise(c,dur){const len=Math.floor(c.sampleRate*dur),b=c.createBuffer(1,len,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;const s=c.createBufferSource();s.buffer=b;return s;}
function waterSound(){const c=ac();if(!c)return;const t=c.currentTime;
  const o=c.createOscillator(),g=c.createGain();o.type="sine";o.frequency.setValueAtTime(380,t);o.frequency.exponentialRampToValueAtTime(1100,t+0.09);
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.22,t+0.01);g.gain.exponentialRampToValueAtTime(0.0001,t+0.16);o.connect(g).connect(c.destination);o.start(t);o.stop(t+0.18);
  const n=noise(c,0.25),f=c.createBiquadFilter(),g2=c.createGain();f.type="lowpass";f.frequency.value=1400;g2.gain.setValueAtTime(0.12,t);g2.gain.exponentialRampToValueAtTime(0.0001,t+0.25);n.connect(f).connect(g2).connect(c.destination);n.start(t);}
function waterSpellSound(){
  const c=ac();if(!c)return;const t=c.currentTime;
  const n=noise(c,0.28),f=c.createBiquadFilter(),g=c.createGain();
  f.type="bandpass";f.Q.value=1.4;f.frequency.setValueAtTime(3400,t);f.frequency.exponentialRampToValueAtTime(650,t+0.26);
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.32,t+0.02);g.gain.exponentialRampToValueAtTime(0.0001,t+0.28);
  n.connect(f).connect(g).connect(c.destination);n.start(t);
  const o=c.createOscillator(),og=c.createGain();o.type="sine";o.frequency.setValueAtTime(420,t);o.frequency.exponentialRampToValueAtTime(860,t+0.12);
  og.gain.setValueAtTime(0.0001,t);og.gain.exponentialRampToValueAtTime(0.16,t+0.02);og.gain.exponentialRampToValueAtTime(0.0001,t+0.22);
  o.connect(og).connect(c.destination);o.start(t);o.stop(t+0.24);
}
function slashSound(){const c=ac();if(!c)return;const t=c.currentTime,n=noise(c,0.18),f=c.createBiquadFilter(),g=c.createGain();f.type="bandpass";f.Q.value=1.2;f.frequency.setValueAtTime(5200,t);f.frequency.exponentialRampToValueAtTime(900,t+0.18);g.gain.setValueAtTime(0.3,t);g.gain.exponentialRampToValueAtTime(0.0001,t+0.18);n.connect(f).connect(g).connect(c.destination);n.start(t);}
function fireSound(){const c=ac();if(!c)return;const t=c.currentTime;
  const n=noise(c,2.4),f=c.createBiquadFilter(),g=c.createGain();f.type="lowpass";f.frequency.setValueAtTime(300,t);f.frequency.linearRampToValueAtTime(2400,t+0.4);f.frequency.linearRampToValueAtTime(700,t+2.4);
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.45,t+0.15);g.gain.exponentialRampToValueAtTime(0.0001,t+2.4);n.connect(f).connect(g).connect(c.destination);n.start(t);
  [0,0.2].forEach(dt=>{const o=c.createOscillator(),gg=c.createGain();o.type="sine";o.frequency.setValueAtTime(150,t+dt);o.frequency.exponentialRampToValueAtTime(45,t+dt+0.4);gg.gain.setValueAtTime(0.7,t+dt);gg.gain.exponentialRampToValueAtTime(0.001,t+dt+0.45);o.connect(gg).connect(c.destination);o.start(t+dt);o.stop(t+dt+0.5);});
  [587.33,739.99,880,1174.66].forEach((fq,k)=>{const o=c.createOscillator(),gg=c.createGain(),s=t+0.45+k*0.1;o.type="triangle";o.frequency.value=fq;gg.gain.setValueAtTime(0.0001,s);gg.gain.exponentialRampToValueAtTime(0.15,s+0.02);gg.gain.exponentialRampToValueAtTime(0.0001,s+0.5);o.connect(gg).connect(c.destination);o.start(s);o.stop(s+0.55);});}

/* ---------------- FX: water + fire ---------------- */
const reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
const fx=el.fx,g=fx.getContext("2d");let W=0,H=0;
function size(){W=innerWidth;H=innerHeight;[fx,el.amb].forEach(c=>{c.width=W;c.height=H;});}size();addEventListener("resize",size);
function sprite(stops){const c=document.createElement("canvas");c.width=c.height=64;const x=c.getContext("2d"),gr=x.createRadialGradient(32,32,0,32,32,32);stops.forEach(([o,col])=>gr.addColorStop(o,col));x.fillStyle=gr;x.fillRect(0,0,64,64);return c;}
const SPR={
  core:sprite([[0,"rgba(255,255,230,1)"],[.25,"rgba(255,230,140,.95)"],[.6,"rgba(255,160,40,.5)"],[1,"rgba(255,120,0,0)"]]),
  mid:sprite([[0,"rgba(255,200,80,.95)"],[.45,"rgba(255,100,20,.6)"],[1,"rgba(200,30,0,0)"]]),
  outer:sprite([[0,"rgba(230,50,20,.75)"],[.5,"rgba(140,15,10,.35)"],[1,"rgba(60,0,0,0)"]]),
  smoke:sprite([[0,"rgba(60,30,40,.35)"],[1,"rgba(30,10,20,0)"]]),
  water:sprite([[0,"rgba(240,252,255,1)"],[.35,"rgba(140,215,255,.85)"],[1,"rgba(40,130,230,0)"]])
};
let P=[],running=false,fireUntil=0,quietFireUntil=0,modalFire=false,winRects=[];
function kick(){if(!running&&!reduce){running=true;requestAnimationFrame(loop);}}
function fireP(x,y,sc){const m=rand(34,62);P.push({t:"fire",x,y,vx:rand(-.6,.6),vy:-rand(1.6,3.4)*sc,s:rand(34,64)*sc,life:m,max:m});}
function emberP(x,y){const m=rand(60,110);P.push({t:"ember",x,y,vx:rand(-1.2,1.2),vy:-rand(1.5,4),s:rand(1.2,2.6),life:m,max:m});}
function igniteFire(){if(S.quiet||reduce)return;fireUntil=performance.now()+2600;
  winRects=[...el.grid.querySelectorAll(".cell.win")].map(b=>b.getBoundingClientRect());
  for(let k=0;k<60;k++)emberP(rand(0,W),H+rand(0,40));kick();}
function igniteQuietFire(){if(reduce)return;quietFireUntil=performance.now()+1800;
  winRects=[...el.grid.querySelectorAll(".cell.win")].map(b=>b.getBoundingClientRect());kick();}
function water(x,y,big){
  if(reduce)return;
  const countScale=S.quiet?0.5:1.0;
  const numRings=Math.max(1,Math.round((big?4:3)*countScale));
  for(let k=0;k<numRings;k++)P.push({t:"ring",x,y,r:(4+k*3)*(S.quiet?0.7:1),vr:((big?3.4:2.6)+k*0.5)*(S.quiet?0.6:1),life:Math.round((42-k*5)*(S.quiet?0.75:1)),max:Math.round((42-k*5)*(S.quiet?0.75:1)),delay:k*4});
  const n=Math.max(6,Math.round((big?26:18)*countScale));
  for(let k=0;k<n;k++){const a=-Math.PI/2+rand(-1.25,1.25),sp=rand(2.0,big?7:5.5)*(S.quiet?0.6:1),m=Math.round(rand(24,42)*(S.quiet?0.75:1));P.push({t:"drop",x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,s:rand(4,9)*(S.quiet?0.7:1),life:m,max:m});}
  if(!S.quiet){
    const arcs=big?2:1;for(let a=0;a<arcs;a++){const m=26;P.push({t:"swirl",x,y,r:big?46:30,a0:rand(0,6.28),dir:a?-1:1,life:m,max:m});}
  }
  kick();}
function loop(){
  g.clearRect(0,0,W,H);const now=performance.now();
  if(S.quiet){
    if(now<quietFireUntil){
      winRects.forEach(r=>{
        if(Math.random()<0.5){
          fireP(r.left+rand(8,r.width-8),r.bottom-rand(2,8),0.45);
        }
      });
    }
  }else{
    if(now<fireUntil){const k=Math.round(30*Math.min(1,(fireUntil-now)/900));for(let i=0;i<k;i++)fireP(rand(-20,W+20),H+rand(5,30),rand(1.3,2.3));
      winRects.forEach(r=>{for(let i=0;i<3;i++)fireP(r.left+rand(6,r.width-6),r.bottom-rand(4,14),.8);});
      if(Math.random()<.5)emberP(rand(0,W),H);}
    if(modalFire&&el.overlay.classList.contains("show")){const r=el.modal.getBoundingClientRect();
      for(let i=0;i<5;i++)fireP(r.left+rand(0,r.width),r.top+rand(0,6),rand(.5,.9));
      for(let i=0;i<2;i++){fireP(r.left-rand(0,10),r.top+rand(0,r.height),.6);fireP(r.right+rand(0,10),r.top+rand(0,r.height),.6);}
      if(Math.random()<.35)emberP(r.left+rand(0,r.width),r.top);}
  }
  if(P.length>1800)P.splice(0,P.length-1800);
  P=P.filter(p=>p.life>0);
  // water (normal blend)
  g.globalCompositeOperation="source-over";
  for(const p of P){
    if(p.t==="ring"){if(p.delay>0){p.delay--;continue;}p.r+=p.vr;p.vr*=.96;p.life--;const a=p.life/p.max;
      g.strokeStyle=`rgba(150,220,255,${a*.9})`;g.lineWidth=2.5*a+0.5;g.beginPath();g.ellipse(p.x,p.y,p.r,p.r*.55,0,0,Math.PI*2);g.stroke();
      g.strokeStyle=`rgba(255,255,255,${a*.5})`;g.lineWidth=1;g.beginPath();g.ellipse(p.x,p.y,p.r*.86,p.r*.47,0,0,Math.PI*2);g.stroke();}
    else if(p.t==="drop"){p.vy+=.28;p.vx*=.985;p.x+=p.vx;p.y+=p.vy;p.life--;const a=Math.min(1,p.life/18);g.globalAlpha=a;const s=p.s;g.drawImage(SPR.water,p.x-s/2,p.y-s/2,s,s);g.globalAlpha=1;}
    else if(p.t==="swirl"){p.life--;const f=1-p.life/p.max,a=p.life/p.max,start=p.a0+f*4*p.dir,len=2.2;
      g.strokeStyle=`rgba(120,205,255,${a})`;g.lineWidth=5*a+1;g.lineCap="round";g.shadowColor="#5ec8ff";g.shadowBlur=12;
      g.beginPath();g.arc(p.x,p.y,p.r*(0.6+f*0.7),start,start+len*p.dir,p.dir<0);g.stroke();
      g.strokeStyle=`rgba(255,255,255,${a*.8})`;g.lineWidth=1.5;g.stroke();g.shadowBlur=0;}
    else if(p.t==="waterDragon"){
      p.progress += p.speed;
      const t = Math.min(1, p.progress);
      const it = 1 - t;
      const px = it * it * it * p.startX + 3 * it * it * t * p.cp1x + 3 * it * t * t * p.cp2x + t * t * t * p.endX;
      const py = it * it * it * p.startY + 3 * it * it * t * p.cp1y + 3 * it * t * t * p.cp2y + t * t * t * p.endY;

      p.trail.unshift({ x: px, y: py, t });
      if (p.trail.length > 20) p.trail.pop();

      // Render flowing Dragon Arc (Hinokami Kagura Flame or Mizu no Kokyu Water)
      if (p.trail.length > 1) {
        if (p.isFlame) {
          // Blazing Hinokami Kagura Fire Dragon Arc (Demon Slayer Flame Slash)
          g.beginPath();
          g.moveTo(p.trail[0].x, p.trail[0].y);
          for (let k = 1; k < p.trail.length; k++) {
            g.lineTo(p.trail[k].x, p.trail[k].y);
          }
          g.strokeStyle = S.quiet ? "rgba(235, 70, 20, 0.7)" : "rgba(255, 45, 10, 0.95)";
          g.lineWidth = S.quiet ? 5 : 10;
          g.lineCap = "round";
          g.lineJoin = "round";
          g.stroke();

          // White-hot solar core
          g.beginPath();
          g.moveTo(p.trail[0].x, p.trail[0].y);
          for (let k = 1; k < p.trail.length; k++) {
            g.lineTo(p.trail[k].x, p.trail[k].y);
          }
          g.strokeStyle = S.quiet ? "rgba(255, 230, 140, 0.85)" : "rgba(255, 255, 220, 0.98)";
          g.lineWidth = S.quiet ? 2.5 : 4.5;
          g.stroke();

          // Golden cresting solar sparks
          if (!S.quiet) {
            for (let k = 1; k < p.trail.length; k += 2) {
              const pt = p.trail[k];
              const prev = p.trail[k - 1];
              const ang = Math.atan2(prev.y - pt.y, prev.x - pt.x);
              const flameLen = 8 + (k % 4) * 3;
              const fx = pt.x + Math.cos(ang + Math.PI / 2) * flameLen;
              const fy = pt.y + Math.sin(ang + Math.PI / 2) * flameLen;
              g.fillStyle = "#ffcc00";
              g.beginPath();
              g.arc(fx, fy, 2.5, 0, Math.PI * 2);
              g.fill();
            }
          }
        } else {
          // Deep ocean blue outer wave
          g.beginPath();
          g.moveTo(p.trail[0].x, p.trail[0].y);
          for (let k = 1; k < p.trail.length; k++) {
            g.lineTo(p.trail[k].x, p.trail[k].y);
          }
          g.strokeStyle = S.quiet ? "rgba(0, 140, 230, 0.65)" : "rgba(0, 110, 240, 0.88)";
          g.lineWidth = S.quiet ? 5 : 9;
          g.lineCap = "round";
          g.lineJoin = "round";
          g.stroke();

          // Glowing turquoise/cyan water core
          g.beginPath();
          g.moveTo(p.trail[0].x, p.trail[0].y);
          for (let k = 1; k < p.trail.length; k++) {
            g.lineTo(p.trail[k].x, p.trail[k].y);
          }
          g.strokeStyle = S.quiet ? "rgba(180, 240, 255, 0.75)" : "rgba(160, 245, 255, 0.95)";
          g.lineWidth = S.quiet ? 2.5 : 4.5;
          g.stroke();

          // White cresting wave foam tips
          if (!S.quiet) {
            for (let k = 1; k < p.trail.length; k += 2) {
              const pt = p.trail[k];
              const prev = p.trail[k - 1];
              const ang = Math.atan2(prev.y - pt.y, prev.x - pt.x);
              const foamLen = 7 + (k % 4) * 2.5;
              const fx = pt.x + Math.cos(ang + Math.PI / 2) * foamLen;
              const fy = pt.y + Math.sin(ang + Math.PI / 2) * foamLen;
              g.fillStyle = "#ffffff";
              g.beginPath();
              g.arc(fx, fy, 2.5, 0, Math.PI * 2);
              g.fill();
            }
          }
        }
      }

      // Trailing droplet or ember spray
      if (Math.random() < (S.quiet ? 0.35 : 0.75)) {
        if (p.isFlame) {
          emberP(px + rand(-4, 4), py + rand(-4, 4));
        } else {
          water(px + rand(-6, 6), py + rand(-6, 6), false);
        }
      }

      // Detonation on impact at the bingo square!
      if (p.progress >= 1) {
        p.life = 0;
        if (p.isFlame) {
          fireP(p.endX, p.endY, 1.2);
          for (let s = 0; s < 14; s++) {
            emberP(p.endX + rand(-15, 15), p.endY + rand(-15, 15));
          }
        } else {
          water(p.endX, p.endY, true);
          if (!S.quiet) {
            waterSound();
            for (let s = 0; s < 18; s++) {
              const a = Math.random() * Math.PI * 2;
              const sp = rand(3.5, 7.5);
              P.push({
                t: "drop",
                x: p.endX,
                y: p.endY,
                vx: Math.cos(a) * sp,
                vy: Math.sin(a) * sp - 2.5,
                s: rand(4.5, 9.5),
                life: Math.round(rand(24, 40)),
                max: 40
              });
            }
          }
        }
      }
    }
  }
  // fire (additive)
  g.globalCompositeOperation="lighter";
  for(const p of P){
    if(p.t==="fire"){p.vy-=.045;p.vx+=rand(-.25,.25);p.x+=p.vx;p.y+=p.vy;p.s*=.975;p.life--;const f=p.life/p.max;
      const spr=f>.62?SPR.core:f>.3?SPR.mid:SPR.outer;g.globalAlpha=Math.min(.85,f*1.2);const s=p.s*(f>.62?0.8:1.15);g.drawImage(spr,p.x-s/2,p.y-s/2,s,s);}
    else if(p.t==="ember"){p.vy-=.02;p.vx+=rand(-.15,.15);p.x+=p.vx;p.y+=p.vy;p.life--;g.globalAlpha=p.life/p.max;g.fillStyle="#ffcf6a";g.beginPath();g.arc(p.x,p.y,p.s,0,Math.PI*2);g.fill();}
  }
  g.globalAlpha=1;g.globalCompositeOperation="source-over";
  if(P.length||now<fireUntil||(S.quiet&&now<quietFireUntil)||(modalFire&&el.overlay.classList.contains("show")))requestAnimationFrame(loop);else{running=false;g.clearRect(0,0,W,H);}
}

// water on every click (buttons, cells, switch, tabs)
document.addEventListener("click",e=>{
  const t=e.target.closest(".btn,.cell,.switch");if(!t||t.disabled)return;
  window.chars?.click?.();
  const r=t.getBoundingClientRect();const x=e.detail?e.clientX:r.left+r.width/2,y=e.detail?e.clientY:r.top+r.height/2;
  if(!reduce){const sp=document.createElement("span");sp.className="ripple";const d=Math.max(r.width,r.height);sp.style.width=sp.style.height=d+"px";sp.style.left=(x-r.left-d/2)+"px";sp.style.top=(y-r.top-d/2)+"px";
    if(getComputedStyle(t).position==="static")t.style.position="relative";t.appendChild(sp);setTimeout(()=>sp.remove(),720);}
  water(x,y,t.classList.contains("cell"));
  if(!t.classList.contains("cell")&&!S.quiet)waterSound();
},true);

// ambient: sakura petals + fireflies
(function ambient(){if(reduce)return;const c=el.amb,x=c.getContext("2d");
  const petals=Array.from({length:26},()=>({x:rand(0,innerWidth),y:rand(-innerHeight,innerHeight),s:rand(4,8),vy:rand(.4,1.1),vx:rand(.2,.8),r:rand(0,6),vr:rand(-.03,.03),w:rand(0,6)}));
  const flies=Array.from({length:22},()=>({x:rand(0,innerWidth),y:rand(innerHeight*.45,innerHeight),p:rand(0,6)}));
  (function f(){
    x.clearRect(0,0,c.width,c.height);
    const activePetals=S.quiet?petals.slice(0,13):petals;
    const activeFlies=S.quiet?flies.slice(0,11):flies;
    activePetals.forEach(p=>{p.w+=.03;p.y+=p.vy;p.x+=p.vx+Math.sin(p.w)*.6;p.r+=p.vr;if(p.y>c.height+10){p.y=-10;p.x=rand(-50,c.width);}if(p.x>c.width+20)p.x=-20;
      x.save();x.translate(p.x,p.y);x.rotate(p.r);x.fillStyle=S.quiet?"rgba(255,170,200,.45)":"rgba(255,170,200,.85)";x.beginPath();x.ellipse(0,0,p.s,p.s*.55,0,0,Math.PI*2);x.fill();x.restore();});
    activeFlies.forEach(q=>{q.p+=.03;const a=(Math.sin(q.p)+1)/2;q.x+=Math.cos(q.p*.7)*.3;q.y+=Math.sin(q.p*.5)*.25;x.fillStyle=S.quiet?`rgba(255,210,120,${.1+a*.3})`:`rgba(255,210,120,${.2+a*.6})`;x.shadowColor="#ffb347";x.shadowBlur=S.quiet?5:10;x.beginPath();x.arc(q.x,q.y,1.8,0,Math.PI*2);x.fill();x.shadowBlur=0;});
    requestAnimationFrame(f);
  })();
})();

/* ---------------- multi-login & hunter accounts ---------------- */
const KEY_HUNTERS = "professorBingo.hunters.v2";

const ANIME_LEGENDS = {
  tanjiro: {
    name: "Tanjiro Kamado",
    emblem: "wave",
    xp: 480,
    wins: 3,
    cards: 4,
    bestCombo: 5,
    deck: "Any lecture"
  },
  zenitsu: {
    name: "Zenitsu Agatsuma",
    emblem: "flame",
    xp: 320,
    wins: 2,
    cards: 3,
    bestCombo: 6,
    deck: "Any lecture"
  },
  inosuke: {
    name: "Inosuke Hashibira",
    emblem: "moon",
    xp: 290,
    wins: 2,
    cards: 2,
    bestCombo: 4,
    deck: "Any lecture"
  },
  nezuko: {
    name: "Nezuko Kamado",
    emblem: "sakura",
    xp: 560,
    wins: 4,
    cards: 5,
    bestCombo: 7,
    deck: "Any lecture"
  }
};

function getSavedHunters() {
  try {
    const raw = localStorage.getItem(KEY_HUNTERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") return parsed;
    }
  } catch (e) {}
  return {
    "Guest Hunter": { name: "Guest Hunter", emblem: "wave", xp: 0, wins: 0, cards: 0, bestCombo: 0, lastActive: Date.now() },
    "Tanjiro Kamado": { name: "Tanjiro Kamado", emblem: "wave", xp: 480, wins: 3, cards: 4, bestCombo: 5, lastActive: Date.now() - 3600000 },
    "Zenitsu Agatsuma": { name: "Zenitsu Agatsuma", emblem: "flame", xp: 320, wins: 2, cards: 3, bestCombo: 6, lastActive: Date.now() - 7200000 }
  };
}

function persistHunters(map) {
  try {
    localStorage.setItem(KEY_HUNTERS, JSON.stringify(map));
  } catch (e) {}
}

function saveCurrentHunter() {
  const map = getSavedHunters();
  const currentName = S.hunter ? S.hunter.name : "Guest Hunter";
  map[currentName] = {
    name: currentName,
    emblem: S.hunter ? S.hunter.emblem : "wave",
    xp: S.xp,
    wins: S.wins,
    cards: S.cards,
    bestCombo: S.bestCombo || 0,
    deck: S.deck,
    lastActive: Date.now()
  };
  persistHunters(map);
}

function switchAccount(name, emblem) {
  saveCurrentHunter();

  const map = getSavedHunters();
  if (map[name]) {
    const acc = map[name];
    S.hunter = { name: acc.name, emblem: acc.emblem || emblem || "wave" };
    S.xp = acc.xp || 0;
    S.wins = acc.wins || 0;
    S.cards = acc.cards || 0;
    S.bestCombo = acc.bestCombo || 0;
    sessionXP = 0;
    sessionBingos = 0;
    sessionBestCombo = 0;
    acc.lastActive = Date.now();
    persistHunters(map);
  } else {
    S.hunter = { name, emblem: emblem || selectedEmblem || "wave" };
    S.xp = 0;
    S.wins = 0;
    S.cards = 0;
    S.bestCombo = 0;
    sessionXP = 0;
    sessionBingos = 0;
    sessionBestCombo = 0;
    map[name] = {
      name,
      emblem: S.hunter.emblem,
      xp: 0,
      wins: 0,
      cards: 0,
      bestCombo: 0,
      deck: S.deck,
      lastActive: Date.now()
    };
    persistHunters(map);
  }

  save();
  updateHunterDisplay();
  renderHud();
  window.chars?.setElement?.(S.hunter.emblem === "flame" ? "flame" : "water");
  if (isScoreboardOpen) renderScoreboard();
  startGame();
  showToast(`Switched account to ${name}.`);
}

function renderSavedHuntersList() {
  if (!el.savedHuntersList) return;
  const map = getSavedHunters();
  const names = Object.keys(map).sort((a, b) => (map[b].lastActive || 0) - (map[a].lastActive || 0));

  if (names.length === 0) {
    if (el.savedHuntersWrap) el.savedHuntersWrap.style.display = "none";
    if (el.customHunterForm) el.customHunterForm.style.display = "block";
    return;
  }

  if (el.savedHuntersWrap) el.savedHuntersWrap.style.display = "block";
  const curName = S.hunter ? S.hunter.name : "Guest Hunter";

  el.savedHuntersList.innerHTML = names.map(name => {
    const acc = map[name];
    const isActive = name === curName;
    const rankTitle = RANKS[rankFor(acc.xp || 0)][1];
    const safeName = name.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const emblem = acc.emblem || "wave";
    return `<div class="saved-hunter-item ${isActive ? "active" : ""}" data-hunter="${safeName}">
      <div class="saved-hunter-info">
        <svg class="emblem-svg sm" style="width:18px;height:18px;color:var(--gold2);">
          <use href="#emblem-${emblem}"/>
        </svg>
        <div>
          <div class="saved-hunter-name">${safeName}</div>
          <div class="saved-hunter-rank">${rankTitle} · ${(acc.xp || 0).toLocaleString()} XP</div>
        </div>
      </div>
      <div class="saved-hunter-right">
        ${isActive ? '<span class="active-tag">ACTIVE</span>' : ''}
        ${name !== "Guest Hunter" && names.length > 1 ? `<button type="button" class="remove-hunter-btn" data-del="${safeName}" title="Delete account">×</button>` : ''}
      </div>
    </div>`;
  }).join("");

  el.savedHuntersList.querySelectorAll(".saved-hunter-item").forEach(item => {
    item.addEventListener("click", e => {
      if (e.target.closest(".remove-hunter-btn")) return;
      const targetName = item.dataset.hunter;
      switchAccount(targetName);
    });
  });

  el.savedHuntersList.querySelectorAll(".remove-hunter-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const delName = btn.dataset.del;
      const curMap = getSavedHunters();
      delete curMap[delName];
      persistHunters(curMap);
      renderSavedHuntersList();
      showToast(`Removed account "${delName}".`);
    });
  });
}

let selectedEmblem = (S.hunter && S.hunter.emblem) || "wave";

function validateHunterName(val){
  const trimmed = (val || "").trim();
  if(!trimmed){
    return { ok:false, msg:"Hunter name is required (2–16 characters)." };
  }
  if(trimmed.length < 2){
    return { ok:false, msg:"Too short (minimum 2 characters)." };
  }
  if(trimmed.length > 16){
    return { ok:false, msg:"Too long (maximum 16 characters)." };
  }
  if(!/^[a-zA-Z0-9 ]+$/.test(trimmed)){
    return { ok:false, msg:"Letters, numbers, and spaces only." };
  }
  return { ok:true, name:trimmed };
}

function handleNameInput(){
  if(!el.hunterNameInput || !el.nameError || !el.startBtn) return;
  const res = validateHunterName(el.hunterNameInput.value);
  if(!res.ok){
    el.nameError.textContent = res.msg;
    el.startBtn.disabled = true;
  } else {
    el.nameError.textContent = "";
    el.startBtn.disabled = false;
  }
}

if(el.hunterNameInput){
  el.hunterNameInput.addEventListener("input", handleNameInput);
  el.hunterNameInput.addEventListener("keydown", e => {
    if(e.key === "Enter" && !el.startBtn.disabled){
      el.startBtn.click();
    }
  });
}

const emblemButtons = document.querySelectorAll(".emblem-btn");
emblemButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    emblemButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedEmblem = btn.dataset.emblem || "wave";
    window.chars?.setElement?.(selectedEmblem === "flame" ? "flame" : "water");
  });
});

if(el.startBtn){
  el.startBtn.addEventListener("click", () => {
    const res = validateHunterName(el.hunterNameInput ? el.hunterNameInput.value : "");
    if(!res.ok) return;
    switchAccount(res.name, selectedEmblem);
  });
}

if(el.guestBtn){
  el.guestBtn.addEventListener("click", () => {
    switchAccount("Guest Hunter", selectedEmblem || "wave");
  });
}

if(el.switchHunterBtn){
  el.switchHunterBtn.addEventListener("click", () => {
    renderSavedHuntersList();
    if(el.hunterNameInput){
      el.hunterNameInput.value = S.hunter.name === "Guest Hunter" ? "" : S.hunter.name;
      handleNameInput();
    }
    emblemButtons.forEach(b => {
      b.classList.toggle("active", b.dataset.emblem === S.hunter.emblem);
    });
    selectedEmblem = S.hunter.emblem;
    if(el.intro){
      el.intro.classList.remove("hide");
      if(el.hunterNameInput) setTimeout(() => el.hunterNameInput.focus(), 80);
    }
  });
}

// Navigation Tabs in Login Modal
const loginNavTabs = document.querySelectorAll(".login-nav-tab");
loginNavTabs.forEach(tab => {
  tab.addEventListener("click", () => {
    loginNavTabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    const target = tab.dataset.tab;
    document.querySelectorAll(".login-panel").forEach(p => p.classList.remove("active"));
    const p = document.getElementById("panel" + target.charAt(0).toUpperCase() + target.slice(1));
    if (p) p.classList.add("active");
    if (target === "accounts") renderSavedHuntersList();
  });
});

// Anime Legends Quick 1-Click Logins
document.querySelectorAll(".legend-card").forEach(card => {
  card.addEventListener("click", () => {
    const key = card.dataset.legend;
    const leg = ANIME_LEGENDS[key];
    if (leg) {
      const map = getSavedHunters();
      if (!map[leg.name]) {
        map[leg.name] = { ...leg, lastActive: Date.now() };
        persistHunters(map);
      }
      switchAccount(leg.name, leg.emblem);
    }
  });
});

// Student Portal Login
if(el.studentLoginBtn){
  el.studentLoginBtn.addEventListener("click", () => {
    const input = el.studentRollInput ? el.studentRollInput.value.trim() : "";
    const err = el.studentRollErr;
    if (!input || input.length < 2) {
      if (err) err.textContent = "Please enter student ID / roll number (min 2 chars).";
      return;
    }
    if (err) err.textContent = "";
    const section = el.studentSectionSelect ? el.studentSectionSelect.value : "Any lecture";
    const studentName = `Student ${input}`;
    const map = getSavedHunters();
    if (!map[studentName]) {
      map[studentName] = {
        name: studentName,
        emblem: selectedEmblem || "wave",
        xp: 0,
        wins: 0,
        cards: 0,
        bestCombo: 0,
        deck: section,
        lastActive: Date.now()
      };
      persistHunters(map);
    }
    switchAccount(studentName, selectedEmblem || "wave");
  });
}

// Toggle Create New Hunter Form in Accounts Tab
if(el.newHunterToggleBtn){
  let showCreate = false;
  el.newHunterToggleBtn.addEventListener("click", () => {
    showCreate = !showCreate;
    if(el.customHunterForm) el.customHunterForm.style.display = showCreate ? "block" : "none";
    el.newHunterToggleBtn.textContent = showCreate ? "Cancel" : "+ Create New";
    if (showCreate && el.hunterNameInput) {
      el.hunterNameInput.focus();
    }
  });
}

function startGame(){
  el.intro.classList.add("hide");
  ac();
  const b=el.grid.querySelector('[data-i="0"]');
  if(b) b.focus({preventScroll:true});
}

// Initialize saved hunters list on load
renderSavedHuntersList();

/* ---------------- scoreboard logic ---------------- */
let currentScoreTab = "allTime";
let isScoreboardOpen = false;

function openScoreboard(){
  if(!el.scoreboardOverlay) return;
  el.scoreboardOverlay.classList.add("show");
  isScoreboardOpen = true;
  if(el.resetConfirmDialog) el.resetConfirmDialog.classList.add("hidden");
  renderScoreboard();
}

function closeScoreboard(){
  if(!el.scoreboardOverlay) return;
  el.scoreboardOverlay.classList.remove("show");
  isScoreboardOpen = false;
  if(el.resetConfirmDialog) el.resetConfirmDialog.classList.add("hidden");
}

function renderScoreboard(){
  if(!el.scoreTableBody) return;
  const isSession = currentScoreTab === "session";
  const sampleList = isSession ? SAMPLE_HUNTERS_SESSION : SAMPLE_HUNTERS;

  saveCurrentHunter();
  const huntersMap = getSavedHunters();
  const curName = S.hunter ? S.hunter.name : "Guest Hunter";

  // Build entries for all local saved accounts
  const localEntries = Object.values(huntersMap).map(acc => {
    const isCur = acc.name === curName;
    const xp = isCur ? (isSession ? sessionXP : S.xp) : (isSession ? Math.round(acc.xp * 0.25) : acc.xp);
    const wins = isCur ? (isSession ? sessionBingos : S.wins) : (isSession ? Math.max(0, acc.wins - 2) : acc.wins);
    const combo = isCur ? (isSession ? sessionBestCombo : (S.bestCombo || 0)) : (acc.bestCombo || 0);
    return {
      name: acc.name,
      emblem: acc.emblem || "wave",
      rankTitle: RANKS[rankFor(xp)][1],
      xp,
      bingos: wins,
      bestCombo: combo,
      isPlayer: isCur
    };
  });

  // Combine with fictional sample hunters (filtering duplicates if any)
  const fictional = sampleList
    .filter(s => !huntersMap[s.name])
    .map(s => ({
      ...s,
      rankTitle: RANKS[rankFor(s.xp)][1],
      isPlayer: false
    }));

  const list = [...localEntries, ...fictional];
  list.sort((a, b) => b.xp - a.xp || b.bingos - a.bingos || b.bestCombo - a.bestCombo);

  el.scoreTableBody.innerHTML = list.map((entry, idx) => {
    const rank = idx + 1;
    let rankBadge = `<span class="rank-num">${rank}</span>`;
    if(rank === 1) rankBadge = `<span class="medal gold">🥇 1</span>`;
    else if(rank === 2) rankBadge = `<span class="medal silver">🥈 2</span>`;
    else if(rank === 3) rankBadge = `<span class="medal bronze">🥉 3</span>`;

    const rowClass = "score-row" + (entry.isPlayer ? " player-row" : "");
    const safeName = entry.name.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const nameDisplay = entry.isPlayer ? `<b>${safeName} (You)</b>` : safeName;

    return `<tr class="${rowClass}" style="--i: ${idx}">
      <td>${rankBadge}</td>
      <td>
        <svg class="emblem-svg sm" style="width:18px;height:18px;vertical-align:middle;">
          <use href="#emblem-${entry.emblem}"/>
        </svg>
      </td>
      <td>${nameDisplay}</td>
      <td>${entry.rankTitle}</td>
      <td>${entry.xp.toLocaleString()}</td>
      <td>${entry.bingos}</td>
      <td>x${entry.bestCombo}</td>
    </tr>`;
  }).join("");
}

if(el.openScoreboardBtn) el.openScoreboardBtn.addEventListener("click", openScoreboard);
if(el.modalScoreBtn) el.modalScoreBtn.addEventListener("click", openScoreboard);
if(el.closeScoreboardBtn) el.closeScoreboardBtn.addEventListener("click", closeScoreboard);
if(el.returnGameBtn) el.returnGameBtn.addEventListener("click", closeScoreboard);

if(el.scoreboardOverlay){
  el.scoreboardOverlay.addEventListener("click", e => {
    if(e.target === el.scoreboardOverlay) closeScoreboard();
  });
}

if(el.tabAllTime && el.tabSession){
  el.tabAllTime.addEventListener("click", () => {
    el.tabAllTime.classList.add("active");
    el.tabAllTime.setAttribute("aria-selected", "true");
    el.tabSession.classList.remove("active");
    el.tabSession.setAttribute("aria-selected", "false");
    currentScoreTab = "allTime";
    renderScoreboard();
  });
  el.tabSession.addEventListener("click", () => {
    el.tabSession.classList.add("active");
    el.tabSession.setAttribute("aria-selected", "true");
    el.tabAllTime.classList.remove("active");
    el.tabAllTime.setAttribute("aria-selected", "false");
    currentScoreTab = "session";
    renderScoreboard();
  });
}

if(el.resetScoreBtn && el.resetConfirmDialog){
  el.resetScoreBtn.addEventListener("click", () => {
    el.resetConfirmDialog.classList.remove("hidden");
  });
}
if(el.cancelResetBtn && el.resetConfirmDialog){
  el.cancelResetBtn.addEventListener("click", () => {
    el.resetConfirmDialog.classList.add("hidden");
  });
}
if(el.confirmResetBtn && el.resetConfirmDialog){
  el.confirmResetBtn.addEventListener("click", () => {
    S.xp = 0;
    S.wins = 0;
    S.cards = Math.max(1, S.cards || 1);
    S.bestCombo = 0;
    sessionXP = 0;
    sessionBingos = 0;
    sessionBestCombo = 0;
    save();
    render();
    renderScoreboard();
    el.resetConfirmDialog.classList.add("hidden");
    showToast("Your hunter score has been reset.");
  });
}

/* ---------------- events ---------------- */
el.grid.addEventListener("click",e=>{const b=e.target.closest(".cell");if(b)toggle(+b.dataset.i);});
el.grid.addEventListener("keydown",e=>{const b=e.target.closest(".cell");if(!b)return;const i=+b.dataset.i;let n=i;
  if(e.key==="ArrowRight")n=Math.min(24,i+1);else if(e.key==="ArrowLeft")n=Math.max(0,i-1);else if(e.key==="ArrowDown")n=Math.min(24,i+5);else if(e.key==="ArrowUp")n=Math.max(0,i-5);else return;
  e.preventDefault();focusIdx=n;[...el.grid.children].forEach((c,k)=>c.tabIndex=k===n?0:-1);el.grid.children[n].focus();});
el.quietBtn.addEventListener("click",()=>{S.quiet=!S.quiet;window.chars?.setQuiet?.(S.quiet);if(S.quiet){closeModal();combo=0;showCombo();}
  render();showToast(S.quiet?"Quiet Classroom Mode on — silent, subtle animations":"Quiet mode off: full water & fire effects.");});
function doNewCard(){newCard(S);focusIdx=0;combo=0;showCombo();closeModal();render();showToast("A fresh card has been drawn.");}
el.newCardBtn.addEventListener("click",doNewCard);el.modalNewBtn.addEventListener("click",doNewCard);el.keepBtn.addEventListener("click",closeModal);
el.overlay.addEventListener("click",e=>{if(e.target===el.overlay)closeModal();});
el.undoBtn.addEventListener("click",()=>{const i=S.history.pop();if(i===undefined)return;if(S.ticked[i]){const idx=S.log.map(x=>x.text).lastIndexOf(S.card[i]);if(idx>-1)S.log.splice(idx,1);}toggle(i,true);});
el.clearBtn.addEventListener("click",()=>{S.ticked={};if(S.free)S.ticked[CENTER]="free";S.history=[];S.completed=[];S.celebrated=0;S.log=[];combo=0;showCombo();render();showToast("Card cleared.");});
el.preset.addEventListener("change",()=>{if(PRESETS[el.preset.value])el.phrases.value=PRESETS[el.preset.value].join("\n");validate();});
el.phrases.addEventListener("input",()=>{el.preset.value="Custom";validate();});
el.freeChk.addEventListener("change",validate);
el.applyBtn.addEventListener("click",()=>{const list=validate();if(!list)return;S.phrases=list;S.deck=el.preset.value;S.free=el.freeChk.checked;
  S.target=+(targetRadios.find(r=>r.checked)||{value:1}).value;newCard(S);focusIdx=0;render();syncEditor();showToast(`New card summoned · win at ${S.target} line${S.target>1?"s":""}.`);});
el.resetDeckBtn.addEventListener("click",()=>{el.preset.value="Any lecture";el.phrases.value=PRESETS["Any lecture"].join("\n");el.freeChk.checked=true;targetRadios.forEach(r=>r.checked=r.value==="1");validate();});
document.addEventListener("keydown",e=>{if(e.target.matches("textarea,select,input"))return;
  if(e.key==="Escape"){
    if(isScoreboardOpen){ closeScoreboard(); return; }
    if(el.overlay.classList.contains("show")){ closeModal(); return; }
  }
  else if(e.key==="q"||e.key==="Q")el.quietBtn.click();
  else if(e.key==="n"||e.key==="N")doNewCard();
  else if(e.key==="z"||e.key==="Z")el.undoBtn.click();});

window.__bingo={get state(){return S;},toggle,newCard:doNewCard,LINES,openScoreboard,closeScoreboard,renderScoreboard};
render();syncEditor();window.chars?.setQuiet?.(S.quiet);
})();