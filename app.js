"use strict";

const STORAGE_KEY = "pjcs-simulator-v02";
const TURN_MS = 500;
const SWITCH_COOLDOWN_TURNS = 90;
const MAX_TURNS = 540;
const STAB = 1.2;
const SHADOW_ATTACK = 1.2;
const SHADOW_DEFENSE = 0.8333333333;

const STAGE = { "-4":0.5,"-3":0.5714285714,"-2":0.6666666667,"-1":0.8,"0":1,"1":1.25,"2":1.5,"3":1.75,"4":2 };

const FAST_MOVES = {
  rollout:{name:"ころがる",type:"rock",power:7,energy:13,turns:3},
  dragon_breath:{name:"りゅうのいぶき",type:"dragon",power:3,energy:4,turns:1},
  metal_sound:{name:"メタルサウンド",type:"steel",power:5,energy:8,turns:2},
  mud_shot:{name:"マッドショット",type:"ground",power:3,energy:9,turns:2},
  fairy_wind:{name:"ようせいのかぜ",type:"fairy",power:4,energy:9,turns:2},
  volt_switch:{name:"ボルトチェンジ",type:"electric",power:14,energy:16,turns:4},
  ember:{name:"ひのこ",type:"fire",power:4,energy:9,turns:2},
  sand_attack:{name:"すなかけ",type:"ground",power:2,energy:4,turns:1},
  shadow_claw:{name:"シャドークロー",type:"ghost",power:6,energy:8,turns:2},
  poison_sting:{name:"どくばり",type:"poison",power:4,energy:9,turns:2}
};

const CHARGED_MOVES = {
  body_slam:{name:"のしかかり",type:"normal",power:55,energy:35},
  shadow_ball:{name:"シャドーボール",type:"ghost",power:100,energy:50},
  sky_attack:{name:"ゴッドバード",type:"flying",power:75,energy:50},
  flamethrower:{name:"かえんほうしゃ",type:"fire",power:90,energy:55},
  hydro_cannon:{name:"ハイドロカノン",type:"water",power:80,energy:40},
  drill_peck:{name:"ドリルくちばし",type:"flying",power:70,energy:40},
  aqua_tail:{name:"アクアテール",type:"water",power:55,energy:35},
  mud_bomb:{name:"どろばくだん",type:"ground",power:65,energy:45},
  energy_ball:{name:"エナジーボール",type:"grass",power:80,energy:45,effect:{chance:.1,target:"opponent",stat:"defense",delta:-1}},
  acrobatics:{name:"アクロバット",type:"flying",power:110,energy:55},
  sand_tomb:{name:"すなじごく",type:"ground",power:40,energy:40,effect:{chance:1,target:"opponent",stat:"defense",delta:-1}},
  rock_tomb:{name:"がんせきふうじ",type:"rock",power:75,energy:50,effect:{chance:1,target:"opponent",stat:"attack",delta:-1}},
  gigaton_hammer:{name:"デカハンマー",type:"steel",power:130,energy:60},
  bulldoze:{name:"じならし",type:"ground",power:45,energy:45,effect:{chance:.5,target:"opponent",stat:"defense",delta:-1}},
  weather_ball_fire:{name:"ウェザーボール（炎）",type:"fire",power:55,energy:35},
  air_cutter:{name:"エアカッター",type:"flying",power:45,energy:35,effect:{chance:.3,target:"self",stat:"attack",delta:1}},
  payback:{name:"しっぺがえし",type:"dark",power:110,energy:60},
  ice_beam:{name:"れいとうビーム",type:"ice",power:90,energy:55},
  earthquake:{name:"じしん",type:"ground",power:120,energy:65},
  stone_edge:{name:"ストーンエッジ",type:"rock",power:100,energy:55},
  foul_play:{name:"イカサマ",type:"dark",power:65,energy:40},
  drain_punch:{name:"ドレインパンチ",type:"fighting",power:40,energy:40,effect:{chance:1,target:"self",stat:"defense",delta:1}}
};

const POKEMON = {
  lickilicky:{name:"ベロベルト",cp:1500,types:["normal"],atk:105.7,def:139.5,hp:185,fast:"rollout",charged:["body_slam","shadow_ball"],shadow:false,source:"GLランク1相当"},
  altaria:{name:"チルタリス",cp:1497,types:["dragon","flying"],atk:103.4,def:151.9,hp:138,fast:"dragon_breath",charged:["sky_attack","flamethrower"],shadow:false,source:"Lv29 0/14/15"},
  empoleon:{name:"エンペルト",cp:1500,types:["water","steel"],atk:125.1,def:117.0,hp:122,fast:"metal_sound",charged:["hydro_cannon","drill_peck"],shadow:false,source:"Lv19.5 0/13/15"},
  quagsire_shadow:{name:"ヌオー（シャドウ）",cp:1499,types:["water","ground"],atk:111.2,def:112.6,hp:161,fast:"mud_shot",charged:["aqua_tail","mud_bomb"],shadow:true,source:"GLランク1相当"},
  jumpluff:{name:"ワタッコ",cp:1499,types:["grass","flying"],atk:96.7,def:156.9,hp:153,fast:"fairy_wind",charged:["energy_ball","acrobatics"],shadow:false,source:"GLランク1相当"},
  forretress_shadow:{name:"フォレトス（シャドウ）",cp:1500,types:["bug","steel"],atk:109.7,def:145.4,hp:128,fast:"volt_switch",charged:["sand_tomb","rock_tomb"],shadow:true,source:"Lv25.5 0/9/15"},
  tinkaton:{name:"デカヌチャン",cp:1497,types:["fairy","steel"],atk:106.0,def:151.5,hp:154,fast:"fairy_wind",charged:["gigaton_hammer","bulldoze"],shadow:false,source:"GLランク1近似"},
  ninetales_shadow:{name:"キュウコン（シャドウ）",cp:1495,types:["fire"],atk:114.3,def:135.5,hp:126,fast:"ember",charged:["weather_ball_fire","energy_ball"],shadow:true,source:"Lv25 0/15/15"},
  corviknight:{name:"アーマーガア",cp:1500,types:["flying","steel"],atk:106.9,def:130.6,hp:150,fast:"sand_attack",charged:["air_cutter","payback"],shadow:false,source:"Lv23.5 0/13/14"},
  feraligatr:{name:"オーダイル",cp:1499,types:["water"],atk:123.8,def:117.3,hp:125,fast:"shadow_claw",charged:["hydro_cannon","ice_beam"],shadow:false,source:"Lv20 0/11/13"},
  clodsire:{name:"ドオー",cp:1499,types:["poison","ground"],atk:95.0,def:119.7,hp:208,fast:"poison_sting",charged:["earthquake","stone_edge"],shadow:false,source:"GLランク1相当"},
  sableye_shadow:{name:"ヤミラミ（シャドウ）",cp:1499,types:["dark","ghost"],atk:119.6,def:124.6,hp:125,fast:"shadow_claw",charged:["foul_play","drain_punch"],shadow:true,source:"Lv49.5 0/15/15"}
};

const PLAYER_DEFAULT = ["lickilicky","altaria","empoleon","quagsire_shadow","jumpluff","forretress_shadow"];
const OPPONENT_DEFAULT = ["tinkaton","ninetales_shadow","corviknight","feraligatr","clodsire","sableye_shadow"];

const SUPER = {
  fire:["grass","ice","bug","steel"],water:["fire","ground","rock"],electric:["water","flying"],grass:["water","ground","rock"],ice:["grass","ground","flying","dragon"],fighting:["normal","ice","rock","dark","steel"],poison:["grass","fairy"],ground:["fire","electric","poison","rock","steel"],flying:["grass","fighting","bug"],psychic:["fighting","poison"],bug:["grass","psychic","dark"],rock:["fire","ice","flying","bug"],ghost:["psychic","ghost"],dragon:["dragon"],dark:["psychic","ghost"],steel:["ice","rock","fairy"],fairy:["fighting","dragon","dark"]
};
const RESIST = {
  normal:["rock","steel"],fire:["fire","water","rock","dragon"],water:["water","grass","dragon"],electric:["electric","grass","dragon"],grass:["fire","grass","poison","flying","bug","dragon","steel"],ice:["fire","water","ice","steel"],fighting:["poison","flying","psychic","bug","fairy"],poison:["poison","ground","rock","ghost"],ground:["grass","bug"],flying:["electric","rock","steel"],psychic:["psychic","steel"],bug:["fire","fighting","poison","flying","ghost","steel","fairy"],rock:["fighting","ground","steel"],ghost:["dark"],dragon:["steel"],dark:["fighting","dark","fairy"],steel:["fire","water","electric","steel"],fairy:["fire","poison","steel"]
};
const IMMUNE = { normal:["ghost"],electric:["ground"],fighting:["ghost"],poison:["steel"],ground:["flying"],psychic:["dark"],ghost:["normal"],dragon:["fairy"] };

const defaultState = () => ({
  playerRoster:[...PLAYER_DEFAULT],opponentRoster:[...OPPONENT_DEFAULT],playerPicks:[],opponentPicks:[],format:3,playerScore:0,opponentScore:0,gameNumber:1,history:[],lastBattle:null
});
let state = loadState();
let timerId = null;
let timerValue = 90;

function loadState(){try{const parsed=JSON.parse(localStorage.getItem(STORAGE_KEY));return parsed?{...defaultState(),...parsed}:defaultState()}catch{return defaultState()}}
function saveState(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}
function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
function mulberry32(seed){let a=seed>>>0;return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

function effectiveness(type,defTypes){return defTypes.reduce((m,t)=>{if(IMMUNE[type]?.includes(t))return m*0.390625;if(SUPER[type]?.includes(t))return m*1.6;if(RESIST[type]?.includes(t))return m*0.625;return m},1)}
function stageMult(stage){return STAGE[String(clamp(stage,-4,4))]}
function attackStat(mon){return mon.atk*stageMult(mon.attackStage)*(mon.shadow?SHADOW_ATTACK:1)}
function defenseStat(mon){return mon.def*stageMult(mon.defenseStage)*(mon.shadow?SHADOW_DEFENSE:1)}
function calcDamage(attacker,defender,move){const stab=attacker.types.includes(move.type)?STAB:1;const eff=effectiveness(move.type,defender.types);return Math.max(1,Math.floor(.5*move.power*(attackStat(attacker)/defenseStat(defender))*stab*eff*1.3)+1)}

function monFromId(id){const p=POKEMON[id];return {...p,id,maxHp:p.hp,currentHp:p.hp,energy:0,attackStage:0,defenseStage:0,fastPending:null,fainted:false}}
function createTeam(roster,picks){return {party:picks.map(i=>monFromId(roster[i])),active:0,shields:2,switchCooldown:0}}
function active(team){return team.party[team.active]}
function alive(team){return team.party.map((m,i)=>!m.fainted?i:-1).filter(i=>i>=0)}
function battleOver(a,b){return alive(a).length===0||alive(b).length===0}
function teamHpRatio(team){return team.party.reduce((s,m)=>s+Math.max(0,m.currentHp)/m.maxHp,0)}

function bestCharged(mon,opp,preferCheap=false){const available=mon.charged.map(id=>CHARGED_MOVES[id]).filter(m=>mon.energy>=m.energy);if(!available.length)return null;if(preferCheap)return [...available].sort((a,b)=>a.energy-b.energy)[0];return [...available].sort((a,b)=>(calcDamage(mon,opp,b)/b.energy)-(calcDamage(mon,opp,a)/a.energy))[0]}
function matchupScore(mon,opp){const fast=FAST_MOVES[mon.fast];const own=(calcDamage(mon,opp,fast)/fast.turns)+(Math.max(...mon.charged.map(id=>calcDamage(mon,opp,CHARGED_MOVES[id])/CHARGED_MOVES[id].energy))*3);const of=FAST_MOVES[opp.fast];const theirs=(calcDamage(opp,mon,of)/of.turns)+(Math.max(...opp.charged.map(id=>calcDamage(opp,mon,CHARGED_MOVES[id])/CHARGED_MOVES[id].energy))*3);return (own-theirs)/Math.max(1,theirs)}
function bestSwitch(team,opp){let best=-1,bestScore=-Infinity;for(const i of alive(team)){if(i===team.active)continue;const s=matchupScore(team.party[i],opp);if(s>bestScore){bestScore=s;best=i}}return {index:best,score:bestScore}}

function chooseAction(team,other,rng,style){const mon=active(team),opp=active(other);if(!mon||mon.fainted)return {type:"none"};const currentScore=matchupScore(mon,opp);const candidate=bestSwitch(team,opp);const switchBias=style==="conservative"?.15:style==="aggressive"?-.05:0;if(team.switchCooldown===0&&candidate.index>=0&&currentScore<-0.22+switchBias&&candidate.score>currentScore+.22&&rng()<.78)return {type:"switch",index:candidate.index};const available=mon.charged.filter(id=>mon.energy>=CHARGED_MOVES[id].energy);if(available.length){const maxDamage=Math.max(...available.map(id=>calcDamage(mon,opp,CHARGED_MOVES[id])));const lethal=maxDamage>=opp.currentHp;const throwChance=style==="aggressive"?.93:style==="conservative"?.70:.84;if(lethal||mon.energy>=90||rng()<throwChance){let move;if(other.shields>0&&available.length>1&&rng()<(style==="aggressive"?.48:.35))move=bestCharged(mon,opp,true);else move=bestCharged(mon,opp,false);return {type:"charged",move}}}return {type:"fast",move:FAST_MOVES[mon.fast]}}
function shouldShield(team,attacker,move,rng,style){if(team.shields<=0)return false;const defender=active(team);const dmg=calcDamage(attacker,defender,move);if(dmg>=defender.currentHp)return true;const threshold=style==="conservative"?.28:style==="aggressive"?.48:.38;const lastMon=alive(team).length===1;if(lastMon&&dmg>=defender.currentHp*.25)return true;return dmg>=defender.currentHp*threshold&&rng()<(style==="conservative"?.9:style==="aggressive"?.62:.78)}
function applyEffect(user,target,move,rng,log,turn){if(!move.effect||rng()>move.effect.chance)return;const receiver=move.effect.target==="self"?user:target;const key=move.effect.stat==="attack"?"attackStage":"defenseStage";receiver[key]=clamp(receiver[key]+move.effect.delta,-4,4);log.push(`${turnLabel(turn)} ${receiver.name}の${move.effect.stat==="attack"?"攻撃":"防御"}が${move.effect.delta>0?"上昇":"低下"}（${receiver[key]}段階）`)}
function turnLabel(turn){return `${(turn*TURN_MS/1000).toFixed(1)}秒`}
function forceSwitch(team,opp,log,turn){const options=alive(team).filter(i=>i!==team.active);if(!options.length)return;let best=options[0],score=-Infinity;for(const i of options){const s=matchupScore(team.party[i],opp);if(s>score){score=s;best=i}}team.active=best;log.push(`${turnLabel(turn)} ${active(team).name}を繰り出した`)}
function processFaints(a,b,log,turn){const am=active(a),bm=active(b);if(am&&am.currentHp<=0&&!am.fainted){am.fainted=true;am.currentHp=0;log.push(`${turnLabel(turn)} ${am.name}がひんし`)}if(bm&&bm.currentHp<=0&&!bm.fainted){bm.fainted=true;bm.currentHp=0;log.push(`${turnLabel(turn)} ${bm.name}がひんし`)}if(!battleOver(a,b)){if(active(a).fainted)forceSwitch(a,active(b),log,turn);if(active(b).fainted)forceSwitch(b,active(a),log,turn)}}

function simulateBattle(playerRoster,playerPicks,opponentRoster,opponentPicks,seed,style="balanced",verbose=true){
  const rng=mulberry32(Number(seed)||1),p=createTeam(playerRoster,playerPicks),o=createTeam(opponentRoster,opponentPicks),log=[];
  for(let turn=1;turn<=MAX_TURNS;turn++){
    p.switchCooldown=Math.max(0,p.switchCooldown-1);o.switchCooldown=Math.max(0,o.switchCooldown-1);
    const pActor=active(p),oActor=active(o);
    const pa=pActor.fastPending?{type:"wait"}:chooseAction(p,o,rng,style);
    const oa=oActor.fastPending?{type:"wait"}:chooseAction(o,p,rng,style);

    const charged=[];if(pa.type==="charged")charged.push({side:"p",team:p,other:o,action:pa,actor:pActor});if(oa.type==="charged")charged.push({side:"o",team:o,other:p,action:oa,actor:oActor});
    charged.sort((x,y)=>attackStat(active(y.team))-attackStat(active(x.team))|| (rng()<.5?-1:1));
    for(const item of charged){if(battleOver(p,o))break;const user=item.actor,target=active(item.other),move=item.action.move;if(active(item.team)!==user||!user||user.fainted||user.energy<move.energy)continue;user.energy-=move.energy;const shield=shouldShield(item.other,user,move,rng,style);let dmg=shield?1:calcDamage(user,target,move);if(shield)item.other.shields-=1;target.currentHp-=dmg;if(verbose)log.push(`${turnLabel(turn)} ${user.name}の${move.name} → ${target.name} ${dmg}ダメージ${shield?"（シールド）":""}`);applyEffect(user,target,move,rng,log,turn);processFaints(p,o,log,turn)}
    if(battleOver(p,o))return finish(p,o,turn,log,"KO");

    if(pa.type==="switch"&&active(p)===pActor&&!active(p).fainted&&p.switchCooldown===0){p.active=pa.index;p.switchCooldown=SWITCH_COOLDOWN_TURNS;if(verbose)log.push(`${turnLabel(turn)} あなたは${active(p).name}へ交代`)}
    if(oa.type==="switch"&&active(o)===oActor&&!active(o).fainted&&o.switchCooldown===0){o.active=oa.index;o.switchCooldown=SWITCH_COOLDOWN_TURNS;if(verbose)log.push(`${turnLabel(turn)} 相手は${active(o).name}へ交代`)}

    if(pa.type==="fast"&&active(p)===pActor&&!active(p).fastPending)active(p).fastPending={remaining:pa.move.turns,move:pa.move};
    if(oa.type==="fast"&&active(o)===oActor&&!active(o).fastPending)active(o).fastPending={remaining:oa.move.turns,move:oa.move};

    const fastHits=[];
    for(const [team,other,label] of [[p,o,"あなた"],[o,p,"相手"]]){const mon=active(team);if(mon.fastPending){mon.fastPending.remaining-=1;if(mon.fastPending.remaining<=0){fastHits.push({attacker:mon,defender:active(other),move:mon.fastPending.move,label});mon.fastPending=null}}}
    const damages=fastHits.map(h=>({...h,damage:calcDamage(h.attacker,h.defender,h.move)}));
    for(const hit of damages){if(!hit.attacker.fainted){hit.attacker.energy=clamp(hit.attacker.energy+hit.move.energy,0,100);hit.defender.currentHp-=hit.damage;if(verbose&&turn%4===0)log.push(`${turnLabel(turn)} ${hit.attacker.name}の${hit.move.name} → ${hit.damage}ダメージ（E${hit.attacker.energy}）`)}}
    processFaints(p,o,log,turn);
    if(battleOver(p,o))return finish(p,o,turn,log,"KO");
  }
  return finish(p,o,MAX_TURNS,log,"TIME");
}

function finish(p,o,turn,log,reason){let winner;if(alive(p).length!==alive(o).length)winner=alive(p).length>alive(o).length?"player":"opponent";else if(Math.abs(teamHpRatio(p)-teamHpRatio(o))<1e-9)winner=attackStat(active(p))>=attackStat(active(o))?"player":"opponent";else winner=teamHpRatio(p)>teamHpRatio(o)?"player":"opponent";return {winner,turns:turn,seconds:turn*TURN_MS/1000,reason,player:{alive:alive(p).length,hp:teamHpRatio(p),shields:p.shields},opponent:{alive:alive(o).length,hp:teamHpRatio(o),shields:o.shields},log:log.slice(-120)}}

function rosterRow(side,index,id){const w=document.createElement("div");w.className="roster-row";const n=document.createElement("span");n.className="slot-number";n.textContent=String(index+1);const s=document.createElement("select");s.dataset.side=side;s.dataset.index=String(index);for(const [pid,p] of Object.entries(POKEMON)){const op=document.createElement("option");op.value=pid;op.textContent=p.name;op.selected=pid===id;s.appendChild(op)}const cp=document.createElement("span");cp.className="cp-chip";cp.textContent=`CP ${POKEMON[id].cp}`;w.append(n,s,cp);return w}
function renderRosters(){document.getElementById("playerRoster").replaceChildren(...state.playerRoster.map((id,i)=>rosterRow("player",i,id)));document.getElementById("opponentRoster").replaceChildren(...state.opponentRoster.map((id,i)=>rosterRow("opponent",i,id)))}
function validateRosters(){if(new Set(state.playerRoster).size!==6||new Set(state.opponentRoster).size!==6)return "同じ側に同一ポケモンを複数登録できません。";return ""}
function updateRoster(event){const s=event.target;if(!(s instanceof HTMLSelectElement)||!s.dataset.side)return;const key=s.dataset.side==="player"?"playerRoster":"opponentRoster";state[key][Number(s.dataset.index)]=s.value;state.playerPicks=[];state.opponentPicks=[];saveState();renderRosters()}

function renderPickGrid(id,roster,picks,side){const root=document.getElementById(id);root.replaceChildren(...roster.map((pid,index)=>{const p=POKEMON[pid],b=document.createElement("button");b.type="button";b.className="pick-card";b.dataset.side=side;b.dataset.index=String(index);const order=picks.indexOf(index);if(order>=0)b.classList.add("is-picked");b.innerHTML=`<strong>${p.name}</strong><small>CP ${p.cp}</small><small>${FAST_MOVES[p.fast].name} / ${p.charged.map(x=>CHARGED_MOVES[x].name).join(" / ")}</small>`;if(order>=0){const badge=document.createElement("span");badge.className="pick-order";badge.textContent=String(order+1);b.appendChild(badge)}return b}))}
function renderSelection(){renderPickGrid("playerSelection",state.playerRoster,state.playerPicks,"player");renderPickGrid("opponentSelection",state.opponentRoster,state.opponentPicks,"opponent");document.getElementById("playerSelectionSummary").textContent=selectionNames(state.playerRoster,state.playerPicks)||"未選択";document.getElementById("opponentSelectionSummary").textContent=selectionNames(state.opponentRoster,state.opponentPicks)||"未選択"}
function selectionNames(roster,picks){return picks.map(i=>POKEMON[roster[i]].name).join(" → ")}
function togglePick(side,index){const key=side==="player"?"playerPicks":"opponentPicks",arr=state[key],i=arr.indexOf(index);if(i>=0)arr.splice(i,1);else if(arr.length<3)arr.push(index);saveState();renderSelection();renderBattleLineups();renderMatch()}
function renderLineup(id,roster,picks){const root=document.getElementById(id);const items=picks.map((i,j)=>{const x=document.createElement("span");x.className="lineup-pill";x.textContent=`${j===0?"先発":`控え${j}`} ${POKEMON[roster[i]].name}`;return x});root.replaceChildren(...items);if(!items.length)root.textContent="未確定"}
function renderBattleLineups(){renderLineup("battlePlayerLineup",state.playerRoster,state.playerPicks);renderLineup("battleOpponentLineup",state.opponentRoster,state.opponentPicks)}

function showResult(result,batch=null){const box=document.getElementById("battleResult");box.className=`result-card ${result.winner==="player"?"win":"loss"}`;if(batch){box.innerHTML=`<h3>100試合の勝率分析</h3><p>あなたの勝率 <strong>${batch.playerPct.toFixed(1)}%</strong>（${batch.playerWins}勝 / ${batch.opponentWins}敗）</p><div class="metric-row"><div class="metric"><strong>${batch.avgSeconds.toFixed(1)}秒</strong><span>平均時間</span></div><div class="metric"><strong>${batch.avgAlive.toFixed(2)}</strong><span>平均残存数</span></div><div class="metric"><strong>${batch.seed}</strong><span>開始シード</span></div></div>`;return}box.innerHTML=`<h3>${result.winner==="player"?"あなたの勝利":"相手の勝利"}</h3><p>${result.reason==="KO"?"3体を倒して決着":"時間切れ判定"}・${result.seconds.toFixed(1)}秒</p><div class="metric-row"><div class="metric"><strong>${result.player.alive} - ${result.opponent.alive}</strong><span>残存ポケモン</span></div><div class="metric"><strong>${result.player.shields} - ${result.opponent.shields}</strong><span>残りシールド</span></div><div class="metric"><strong>${result.turns}</strong><span>経過ターン</span></div></div>`;const log=document.getElementById("battleLog");log.replaceChildren(...result.log.map(t=>{const li=document.createElement("li");li.textContent=t;return li}));if(!result.log.length){const li=document.createElement("li");li.textContent="ログなし";log.appendChild(li)}}
function validPicks(){return state.playerPicks.length===3&&state.opponentPicks.length===3}
function currentSeed(){return Number(document.getElementById("seedInput").value)||20260719}
function currentStyle(){return document.getElementById("aiStyle").value}
function runOne(record=false){if(!validPicks()){switchTab("selection");document.getElementById("selectionMessage").textContent="両者とも3体を選んでください。";return null}const result=simulateBattle(state.playerRoster,state.playerPicks,state.opponentRoster,state.opponentPicks,currentSeed()+state.gameNumber-1,currentStyle(),true);state.lastBattle=result;saveState();showResult(result);if(record)recordSimulatedWinner(result);return result}
function runBatch(){if(!validPicks()){switchTab("selection");return}const seed=currentSeed(),style=currentStyle();let pw=0,ow=0,sec=0,aliveSum=0;for(let i=0;i<100;i++){const r=simulateBattle(state.playerRoster,state.playerPicks,state.opponentRoster,state.opponentPicks,seed+i,style,false);if(r.winner==="player")pw++;else ow++;sec+=r.seconds;aliveSum+=r.player.alive}showResult({winner:pw>=ow?"player":"opponent"},{playerPct:pw,playerWins:pw,opponentWins:ow,avgSeconds:sec/100,avgAlive:aliveSum/100,seed})}

function targetWins(){return Math.ceil(Number(state.format)/2)}
function matchFinished(){return state.playerScore>=targetWins()||state.opponentScore>=targetWins()}
function recordSimulatedWinner(result){if(matchFinished())return;state.history.push({game:state.gameNumber,winner:result.winner,player:state.playerPicks.map(i=>POKEMON[state.playerRoster[i]].name),opponent:state.opponentPicks.map(i=>POKEMON[state.opponentRoster[i]].name),seconds:result.seconds});if(result.winner==="player")state.playerScore++;else state.opponentScore++;if(!matchFinished())state.gameNumber++;saveState();renderMatch()}
function renderMatch(){document.getElementById("matchFormat").value=String(state.format);document.getElementById("playerScore").textContent=state.playerScore;document.getElementById("opponentScore").textContent=state.opponentScore;document.getElementById("gameNumber").textContent=`GAME ${state.gameNumber}`;document.getElementById("targetWins").textContent=`${targetWins()}勝先取`;renderLineup("currentPlayerLineup",state.playerRoster,state.playerPicks);renderLineup("currentOpponentLineup",state.opponentRoster,state.opponentPicks);const list=document.getElementById("historyList");list.replaceChildren(...state.history.map(h=>{const li=document.createElement("li");li.textContent=`Game ${h.game}: ${h.winner==="player"?"あなた":"相手"}勝利（${h.seconds.toFixed(1)}秒）`;return li}));if(!state.history.length){const li=document.createElement("li");li.textContent="まだ結果はありません。";list.appendChild(li)}document.getElementById("simulateGame").disabled=matchFinished();document.getElementById("nextSelection").disabled=matchFinished();const msg=document.getElementById("matchMessage");msg.textContent=state.playerScore>=targetWins()?"マッチ終了：あなたの勝利":state.opponentScore>=targetWins()?"マッチ終了：相手の勝利":""}
function resetMatch(){state.playerScore=0;state.opponentScore=0;state.gameNumber=1;state.history=[];state.playerPicks=[];state.opponentPicks=[];saveState();renderSelection();renderMatch();renderBattleLineups()}
function resetAll(){if(!confirm("登録・選出・履歴をすべて初期化しますか？"))return;state=defaultState();saveState();renderAll();switchTab("roster")}

function switchTab(name){document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("is-active",b.dataset.tab===name));document.querySelectorAll(".panel").forEach(p=>p.classList.toggle("is-active",p.id===name));if(name==="selection")renderSelection();if(name==="battle")renderBattleLineups();if(name==="match")renderMatch();window.scrollTo({top:0,behavior:"smooth"})}
function startTimer(){clearInterval(timerId);timerValue=90;updateTimer();timerId=setInterval(()=>{timerValue--;updateTimer();if(timerValue<=0){clearInterval(timerId);timerId=null;document.getElementById("selectionMessage").textContent="選出時間が終了しました。"}},1000)}
function updateTimer(){const el=document.getElementById("timer");el.textContent=timerValue;el.closest(".timer-box").classList.toggle("is-low",timerValue<=15)}
function renderAll(){renderRosters();renderSelection();renderBattleLineups();renderMatch();updateTimer()}

document.addEventListener("change",updateRoster);
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>switchTab(b.dataset.tab)));
document.getElementById("saveRosters").addEventListener("click",()=>{const e=validateRosters();document.getElementById("rosterMessage").textContent=e||"保存しました。";if(!e){saveState();renderSelection();switchTab("selection")}});
document.addEventListener("click",e=>{const c=e.target.closest(".pick-card");if(c)togglePick(c.dataset.side,Number(c.dataset.index))});
document.getElementById("startTimer").addEventListener("click",startTimer);
document.getElementById("clearPicks").addEventListener("click",()=>{state.playerPicks=[];state.opponentPicks=[];saveState();renderSelection()});
document.getElementById("confirmPicks").addEventListener("click",()=>{if(!validPicks()){document.getElementById("selectionMessage").textContent="両者とも3体を選んでください。";return}clearInterval(timerId);document.getElementById("selectionMessage").textContent="選出を確定しました。";saveState();renderBattleLineups();switchTab("battle")});
document.getElementById("runBattle").addEventListener("click",()=>runOne(false));
document.getElementById("runBatch").addEventListener("click",runBatch);
document.getElementById("simulateGame").addEventListener("click",()=>runOne(true));
document.getElementById("nextSelection").addEventListener("click",()=>{state.playerPicks=[];state.opponentPicks=[];saveState();renderSelection();switchTab("selection")});
document.getElementById("newMatch").addEventListener("click",resetMatch);
document.getElementById("matchFormat").addEventListener("change",e=>{state.format=Number(e.target.value);resetMatch()});
document.getElementById("resetAll").addEventListener("click",resetAll);
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
renderAll();
