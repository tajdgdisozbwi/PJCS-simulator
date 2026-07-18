"use strict";

const STORAGE_KEY = "pjcs-simulator-v04";
const OLD_STORAGE_KEYS = ["pjcs-simulator-v03","pjcs-simulator-v02"];
const TURN_MS = 500;
const SWITCH_COOLDOWN_TURNS = 90;
const MAX_TURNS = 540;
const STAB = 1.2;
const SHADOW_ATTACK = 1.2;
const SHADOW_DEFENSE = 0.8333333333;
const EMBEDDED = window.PJCS_EMBEDDED_DATA;
if(!EMBEDDED?.pokemon || Object.keys(EMBEDDED.pokemon).length < 200){
  throw new Error("内蔵ポケモンデータを読み込めませんでした。");
}

const STAGE = { "-4":0.5,"-3":0.5714285714,"-2":0.6666666667,"-1":0.8,"0":1,"1":1.25,"2":1.5,"3":1.75,"4":2 };

const SUPER = {
  fire:["grass","ice","bug","steel"],water:["fire","ground","rock"],electric:["water","flying"],grass:["water","ground","rock"],ice:["grass","ground","flying","dragon"],fighting:["normal","ice","rock","dark","steel"],poison:["grass","fairy"],ground:["fire","electric","poison","rock","steel"],flying:["grass","fighting","bug"],psychic:["fighting","poison"],bug:["grass","psychic","dark"],rock:["fire","ice","flying","bug"],ghost:["psychic","ghost"],dragon:["dragon"],dark:["psychic","ghost"],steel:["ice","rock","fairy"],fairy:["fighting","dragon","dark"]
};
const RESIST = {
  normal:["rock","steel"],fire:["fire","water","rock","dragon"],water:["water","grass","dragon"],electric:["electric","grass","dragon"],grass:["fire","grass","poison","flying","bug","dragon","steel"],ice:["fire","water","ice","steel"],fighting:["poison","flying","psychic","bug","fairy"],poison:["poison","ground","rock","ghost"],ground:["grass","bug"],flying:["electric","rock","steel"],psychic:["psychic","steel"],bug:["fire","fighting","poison","flying","ghost","steel","fairy"],rock:["fighting","ground","steel"],ghost:["dark"],dragon:["steel"],dark:["fighting","dark","fairy"],steel:["fire","water","electric","steel"],fairy:["fire","poison","steel"]
};
const IMMUNE = { normal:["ghost"],electric:["ground"],fighting:["ghost"],poison:["steel"],ground:["flying"],psychic:["dark"],ghost:["normal"],dragon:["fairy"] };

const TYPE_JP = {
  normal:"ノーマル",fire:"ほのお",water:"みず",electric:"でんき",grass:"くさ",ice:"こおり",fighting:"かくとう",poison:"どく",ground:"じめん",flying:"ひこう",psychic:"エスパー",bug:"むし",rock:"いわ",ghost:"ゴースト",dragon:"ドラゴン",dark:"あく",steel:"はがね",fairy:"フェアリー"
};

const MOVE_JP = {
  ROLLOUT_FAST:"ころがる",DRAGON_BREATH_FAST:"りゅうのいぶき",METAL_SOUND_FAST:"きんぞくおん",MUD_SHOT_FAST:"マッドショット",FAIRY_WIND_FAST:"ようせいのかぜ",VOLT_SWITCH_FAST:"ボルトチェンジ",EMBER_FAST:"ひのこ",SAND_ATTACK_FAST:"すなかけ",SHADOW_CLAW_FAST:"シャドークロー",POISON_STING_FAST:"どくばり",COUNTER_FAST:"カウンター",WATER_GUN_FAST:"みずでっぽう",WATERFALL_FAST:"たきのぼり",VINE_WHIP_FAST:"つるのムチ",RAZOR_LEAF_FAST:"はっぱカッター",FIRE_SPIN_FAST:"ほのおのうず",INCINERATE_FAST:"やきつくす",POWDER_SNOW_FAST:"こなゆき",ICE_SHARD_FAST:"こおりのつぶて",CHARM_FAST:"あまえる",WING_ATTACK_FAST:"つばさでうつ",AIR_SLASH_FAST:"エアスラッシュ",GUST_FAST:"かぜおこし",CONFUSION_FAST:"ねんりき",PSYCHO_CUT_FAST:"サイコカッター",HEX_FAST:"たたりめ",ASTONISH_FAST:"おどろかす",LICK_FAST:"したでなめる",SNARL_FAST:"バークアウト",BITE_FAST:"かみつく",FEINT_ATTACK_FAST:"だましうち",SPARK_FAST:"スパーク",THUNDER_SHOCK_FAST:"でんきショック",CHARGE_BEAM_FAST:"チャージビーム",BULLET_SEED_FAST:"タネマシンガン",INFESTATION_FAST:"まとわりつく",FURY_CUTTER_FAST:"れんぞくぎり",BUG_BITE_FAST:"むしくい",ROCK_THROW_FAST:"いわおとし",SMACK_DOWN_FAST:"うちおとす",MUD_SLAP_FAST:"どろかけ",DRAGON_TAIL_FAST:"ドラゴンテール",STEEL_WING_FAST:"はがねのつばさ",METAL_CLAW_FAST:"メタルクロー",TACKLE_FAST:"たいあたり",QUICK_ATTACK_FAST:"でんこうせっか",SCRATCH_FAST:"ひっかく",LOW_KICK_FAST:"けたぐり",KARATE_CHOP_FAST:"からてチョップ",DOUBLE_KICK_FAST:"にどげり",POISON_JAB_FAST:"どくづき",ACID_FAST:"ようかいえき",BUBBLE_FAST:"あわ",LOCK_ON_FAST:"ロックオン",PSYWAVE_FAST:"サイコウェーブ",FORCE_PALM_FAST:"はっけい",SUCKER_PUNCH_FAST:"ふいうち",
  BODY_SLAM:"のしかかり",SHADOW_BALL:"シャドーボール",SKY_ATTACK:"ゴッドバード",FLAMETHROWER:"かえんほうしゃ",HYDRO_CANNON:"ハイドロカノン",DRILL_PECK:"ドリルくちばし",AQUA_TAIL:"アクアテール",MUD_BOMB:"どろばくだん",ENERGY_BALL:"エナジーボール",ACROBATICS:"アクロバット",SAND_TOMB:"すなじごく",ROCK_TOMB:"がんせきふうじ",GIGATON_HAMMER:"デカハンマー",BULLDOZE:"じならし",WEATHER_BALL_FIRE:"ウェザーボール（ほのお）",AIR_CUTTER:"エアカッター",PAYBACK:"しっぺがえし",ICE_BEAM:"れいとうビーム",EARTHQUAKE:"じしん",STONE_EDGE:"ストーンエッジ",FOUL_PLAY:"イカサマ",DRAIN_PUNCH:"ドレインパンチ",SURF:"なみのり",NIGHT_SHADE:"ナイトヘッド",POWER_GEM:"パワージェム",ROCK_SLIDE:"いわなだれ",THUNDERBOLT:"10まんボルト",DISCHARGE:"ほうでん",WILD_CHARGE:"ワイルドボルト",THUNDER_PUNCH:"かみなりパンチ",ICE_PUNCH:"れいとうパンチ",FIRE_PUNCH:"ほのおのパンチ",POWER_UP_PUNCH:"グロウパンチ",CLOSE_COMBAT:"インファイト",CROSS_CHOP:"クロスチョップ",DYNAMIC_PUNCH:"ばくれつパンチ",SUPERPOWER:"ばかぢから",SUPER_POWER:"ばかぢから",SACRED_SWORD:"せいなるつるぎ",BRICK_BREAK:"かわらわり",LEAF_BLADE:"リーフブレード",SEED_BOMB:"タネばくだん",POWER_WHIP:"パワーウィップ",FRENZY_PLANT:"ハードプラント",SLUDGE_BOMB:"ヘドロばくだん",SLUDGE_WAVE:"ヘドロウェーブ",ACID_SPRAY:"アシッドボム",POISON_FANG:"どくどくのキバ",GUNK_SHOT:"ダストシュート",WEATHER_BALL_WATER:"ウェザーボール（みず）",WEATHER_BALL_ICE:"ウェザーボール（こおり）",WEATHER_BALL_ROCK:"ウェザーボール（いわ）",SCALD:"ねっとう",HYDRO_PUMP:"ハイドロポンプ",AQUA_JET:"アクアジェット",LIQUIDATION:"アクアブレイク",BLAST_BURN:"ブラストバーン",FLAME_CHARGE:"ニトロチャージ",OVERHEAT:"オーバーヒート",FIRE_BLAST:"だいもんじ",ICY_WIND:"こごえるかぜ",AVALANCHE:"ゆきなだれ",BLIZZARD:"ふぶき",WEATHER_BALL_NORMAL:"ウェザーボール",MOONBLAST:"ムーンフォース",PLAY_ROUGH:"じゃれつく",DAZZLING_GLEAM:"マジカルシャイン",PSYCHIC:"サイコキネシス",PSYSHOCK:"サイコショック",MIRROR_COAT:"ミラーコート",NIGHT_SLASH:"つじぎり",DARK_PULSE:"あくのはどう",CRUNCH:"かみくだく",OBSTRUCT:"ブロッキング",DRAGON_CLAW:"ドラゴンクロー",OUTRAGE:"げきりん",DRACO_METEOR:"りゅうせいぐん",BREAKING_SWIPE:"ワイドブレイカー",IRON_HEAD:"アイアンヘッド",FLASH_CANNON:"ラスターカノン",MAGNET_BOMB:"マグネットボム",HEAVY_SLAM:"ヘビーボンバー",GYRO_BALL:"ジャイロボール",X_SCISSOR:"シザークロス",BUG_BUZZ:"むしのさざめき",LUNGE:"とびかかる",MEGAHORN:"メガホーン",ANCIENT_POWER:"げんしのちから",ROCK_BLAST:"ロックブラスト",ROCK_WRECKER:"がんせきほう",DIG:"あなをほる",DRILL_RUN:"ドリルライナー",HIGH_HORSEPOWER:"10まんばりき",PRECIPICE_BLADES:"だんがいのつるぎ",BRAVE_BIRD:"ブレイブバード",AERIAL_ACE:"つばめがえし",HURRICANE:"ぼうふう",FEATHER_DANCE:"フェザーダンス",SHADOW_PUNCH:"シャドーパンチ",SHADOW_SNEAK:"かげうち",OMINOUS_WIND:"あやしいかぜ",POLTERGEIST:"ポルターガイスト",RETURN:"おんがえし",LAST_RESORT:"とっておき",HYPER_BEAM:"はかいこうせん",HORN_ATTACK:"つのでつく",SWIFT:"スピードスター"
};

const COMMON_JP = {
  lickilicky:"ベロベルト",feraligatr:"オーダイル",altaria:"チルタリス",corsola:"サニーゴ",jellicent:"ブルンゲル",quagsire:"ヌオー",jumpluff:"ワタッコ",empoleon:"エンペルト",clodsire:"ドオー",sableye:"ヤミラミ",ninetales:"キュウコン",corviknight:"アーマーガア",tinkaton:"デカヌチャン",azumarill:"マリルリ",skarmory:"エアームド",medicham:"チャーレム",stunfisk:"マッギョ",lanturn:"ランターン",gligar:"グライガー",gliscor:"グライオン",mandibuzz:"バルジーナ",dunsparce:"ノコッチ",dudunsparce:"ノココッチ",diggersby:"ホルード",carbink:"メレシー",toxapex:"ドヒドイデ",trevenant:"オーロット",venusaur:"フシギバナ",charizard:"リザードン",swampert:"ラグラージ",serperior:"ジャローダ",whiscash:"ナマズン",pelipper:"ペリッパー",noctowl:"ヨルノズク",umbreon:"ブラッキー",dewgong:"ジュゴン",lapras:"ラプラス",registeel:"レジスチル",bastiodon:"トリデプス",victreebel:"ウツボット",machamp:"カイリキー",primeape:"オコリザル",annihilape:"コノヨザル",poliwrath:"ニョロボン",toxicroak:"ドクロッグ",marowak:"ガラガラ",muk:"ベトベトン",drapion:"ドラピオン",golbat:"ゴルバット",crobat:"クロバット",ariados:"アリアドス",beedrill:"スピアー",forretress:"フォレトス",cradily:"ユレイドル",aurorus:"アマルルガ",abomasnow:"ユキノオー",walrein:"トドゼルガ",froslass:"ユキメノコ",alolan_sandslash:"サンドパン",sandslash:"サンドパン",wigglytuff:"プクリン",clefable:"ピクシー",sylveon:"ニンフィア",aromatisse:"フレフワン",togetic:"トゲチック",togekiss:"トゲキッス",dragonair:"ハクリュー",goodra:"ヌメルゴン",sliggoo:"ヌメイル",kommo_o:"ジャラランガ",hakamo_o:"ジャランゴ",zweilous:"ジヘッド",guzzlord:"アクジキング",greninja:"ゲッコウガ",samurott:"ダイケンキ",blastoise:"カメックス",tentacruel:"ドククラゲ",mantine:"マンタイン",araquanid:"オニシズクモ",golisopod:"グソクムシャ",charjabug:"デンヂムシ",galvantula:"デンチュラ",magnezone:"ジバコイル",togedemaru:"トゲデマル",pachirisu:"パチリス",raichu:"ライチュウ",electrode:"マルマイン",charjabug_shadow:"デンヂムシ",cofagrigus:"デスカーン",runerigus:"デスバーン",drifblim:"フワライド",dusclops:"サマヨール",haunter:"ゴースト",gengar:"ゲンガー",froslass_shadow:"ユキメノコ",mew:"ミュウ",cresselia:"クレセリア",deoxys_defense:"デオキシス",hypno:"スリーパー",malamar:"カラマネロ",oranguru:"ヤレユータン",girafarig:"キリンリキ",farigiraf:"リキキリン",lokix:"エクスレッグ",obstagoon:"タチフサグマ",scrafty:"ズルズキン",pangoro:"ゴロンダ",morpeko_full_belly:"モルペコ",perrserker:"ニャイキング",escavalier:"シュバルゴ",ferrothorn:"ナットレイ",steelix:"ハガネール",excadrill:"ドリュウズ",probopass:"ダイノーズ",aggron:"ボスゴドラ",melmetal:"メルメタル",aegislash_shield:"ギルガルド",talonflame:"ファイアロー",skeledirge:"ラウドボーン",salazzle:"エンニュート",typhlosion:"バクフーン",magcargo:"マグカルゴ",seismitoad:"ガマゲロゲ",gastrodon:"トリトドン",hippowdon:"カバルドン",flygon:"フライゴン",claydol:"ネンドール",rhyperior:"ドサイドン",vigoroth:"ヤルキモノ",greedent:"ヨクバリス",furret:"オオタチ",miltank:"ミルタンク",snorlax:"カビゴン",dubwool:"バイウールー",bibarel:"ビーダル",castform:"ポワルン"
};

const FALLBACK_FAST = structuredClone(EMBEDDED.fast);
const FALLBACK_CHARGED = structuredClone(EMBEDDED.charged);
const FALLBACK_POKEMON = structuredClone(EMBEDDED.pokemon);
let FAST_MOVES = structuredClone(EMBEDDED.fast);
let CHARGED_MOVES = structuredClone(EMBEDDED.charged);
let POKEMON = structuredClone(EMBEDDED.pokemon);
let META_ORDER = [...EMBEDDED.order].filter(id=>POKEMON[id]);
let DATA_INFO = {
  source:EMBEDDED.source,
  count:META_ORDER.length,
  loaded:true,
  updatedAt:EMBEDDED.updatedAt,
  diagnostics:EMBEDDED.diagnostics
};
let japaneseNamesByEnglish = new Map();

const PLAYER_DEFAULT = ["lickilicky","altaria","empoleon","quagsire_shadow","jumpluff","forretress_shadow"].filter(id=>POKEMON[id]);
const OPPONENT_DEFAULT = ["tinkaton","ninetales_shadow","corviknight","feraligatr","clodsire","sableye_shadow"].filter(id=>POKEMON[id]);

function clone(value){ return JSON.parse(JSON.stringify(value)); }
function clamp(v,min,max){ return Math.max(min,Math.min(max,v)); }
function mulberry32(seed){let a=seed>>>0;return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};}
function slug(value){ return String(value||"").trim().toLowerCase().replace(/[^a-z0-9_]+/g,"_").replace(/^_+|_+$/g,""); }
function safeNumber(value,fallback=0){ const n=Number(value); return Number.isFinite(n)?n:fallback; }
function moveName(id,rawName=""){ return MOVE_JP[id] || rawName || id; }
function typeName(type){ return TYPE_JP[type] || type; }

function baseSpeciesId(speciesId){
  return String(speciesId||"")
    .replace(/_shadow$/i,"")
    .replace(/_(alolan|galarian|hisuian|paldean)$/i,"")
    .replace(/_(male|female)$/i,"");
}
function formSuffix(speciesId,englishName=""){
  const id=String(speciesId||"");
  const parts=[];
  if(/_alolan/.test(id))parts.push("アローラのすがた");
  if(/_galarian/.test(id))parts.push("ガラルのすがた");
  if(/_hisuian/.test(id))parts.push("ヒスイのすがた");
  if(/_paldean/.test(id))parts.push("パルデアのすがた");
  if(/_shadow$/.test(id))parts.push("シャドウ");
  if(!parts.length){
    const m=String(englishName).match(/\(([^)]+)\)/);
    if(m && !/shadow/i.test(m[1]))parts.push(m[1]);
  }
  return parts.length?`（${parts.join("・")}）`:"";
}
function localizedSpeciesName(p){
  const sid=p.speciesId||p.id||"";
  const base=baseSpeciesId(sid);
  const direct=COMMON_JP[sid] || COMMON_JP[base];
  const englishBase=String(p.speciesName||p.englishName||"").replace(/\s*\([^)]*\)\s*/g,"").trim().toLowerCase();
  const external=japaneseNamesByEnglish.get(englishBase);
  const name=direct || external || p.speciesName || p.englishName || sid;
  return `${name}${formSuffix(sid,p.speciesName||p.englishName)}`;
}

function defaultState(){
  return {playerRoster:[...PLAYER_DEFAULT],opponentRoster:[...OPPONENT_DEFAULT],playerBuilds:Array(6).fill(null),opponentBuilds:Array(6).fill(null),playerPicks:[],opponentPicks:[],format:3,playerScore:0,opponentScore:0,gameNumber:1,history:[],lastBattle:null,lastRecommendations:null};
}
function loadState(){
  try{
    const raw=localStorage.getItem(STORAGE_KEY) || OLD_STORAGE_KEYS.map(k=>localStorage.getItem(k)).find(Boolean);
    const parsed=raw?JSON.parse(raw):null;
    return parsed?{...defaultState(),...parsed}:defaultState();
  }catch{return defaultState();}
}
function saveState(){ localStorage.setItem(STORAGE_KEY,JSON.stringify(state)); }
let state=loadState();
let timerId=null;
let timerValue=90;
let dialogTarget=null;
let buildTarget=null;

function setDataBanner(title,text,kind="loading"){
  const banner=document.getElementById("dataBanner");
  const titleEl=document.getElementById("dataStatusTitle");
  const textEl=document.getElementById("dataStatusText");
  if(titleEl)titleEl.textContent=title;
  if(textEl)textEl.textContent=text;
  if(banner)banner.dataset.kind=kind;
  const chip=document.getElementById("poolChip");
  if(chip)chip.textContent=`${DATA_INFO.count}体`;
}

function cpmAt(level){
  const rounded=Math.round(Number(level)*2)/2;
  return safeNumber(EMBEDDED.cpm[String(rounded)]??EMBEDDED.cpm[rounded.toFixed(1)],0);
}
function cpFor(p,level,a,d,h){
  const c=cpmAt(level);
  if(!c)return 9999;
  return Math.max(10,Math.floor((p.baseAtk+a)*Math.sqrt(p.baseDef+d)*Math.sqrt(p.baseSta+h)*c*c/10));
}
function statsFor(p,level,a,d,h){
  const c=cpmAt(level);
  return {level,atkIV:a,defIV:d,hpIV:h,cp:cpFor(p,level,a,d,h),atk:(p.baseAtk+a)*c,def:(p.baseDef+d)*c,hp:Math.max(10,Math.floor((p.baseSta+h)*c))};
}
function presetData(p,preset="rank1"){
  if(preset==="attack")return p.attackPreset||p.rank1;
  if(preset==="cmp")return p.cmpPreset||p.attackPreset||p.rank1;
  return p.rank1||{level:20,atkIV:0,defIV:15,hpIV:15,cp:p.cp,atk:p.atk,def:p.def,hp:p.hp};
}
function normalizeBuild(p,build){
  const preset=build?.preset||"rank1";
  const base=presetData(p,preset);
  const level=clamp(Math.round(safeNumber(build?.level,base.level)*2)/2,1,50);
  const atkIV=clamp(Math.round(safeNumber(build?.atkIV,base.atkIV)),0,15);
  const defIV=clamp(Math.round(safeNumber(build?.defIV,base.defIV)),0,15);
  const hpIV=clamp(Math.round(safeNumber(build?.hpIV,base.hpIV)),0,15);
  const stat=statsFor(p,level,atkIV,defIV,hpIV);
  const legalFast=(p.legalFast||[]).filter(id=>FAST_MOVES[id]);
  const legalCharged=(p.legalCharged||[]).filter(id=>CHARGED_MOVES[id]);
  const fast=legalFast.includes(build?.fast)?build.fast:(legalFast.includes(p.fast)?p.fast:legalFast[0]);
  const requested=[build?.charged1,build?.charged2].filter(Boolean);
  const charged=[];
  for(const id of [...requested,...(p.charged||[]),...legalCharged]){
    if(legalCharged.includes(id)&&!charged.includes(id))charged.push(id);
    if(charged.length===2)break;
  }
  return {...stat,preset,fast,charged,valid:stat.cp<=1500};
}
function buildsKey(side){return side==="player"?"playerBuilds":"opponentBuilds"}
function rosterKey(side){return side==="player"?"playerRoster":"opponentRoster"}
function buildForSlot(side,index){
  const id=state[rosterKey(side)][index],p=POKEMON[id];
  return p?normalizeBuild(p,state[buildsKey(side)]?.[index]):null;
}
function effectivePokemon(side,index){
  const id=state[rosterKey(side)][index],p=POKEMON[id];
  if(!p)return null;
  return {...p,...buildForSlot(side,index),id};
}
function repairStateRosters(){
  const available=META_ORDER.length?META_ORDER:Object.keys(POKEMON);
  const repair=(current,defaults)=>{
    const result=[];
    for(const id of [...(current||[]),...defaults,...available]){
      if(!POKEMON[id])continue;
      if(result.some(x=>POKEMON[x]?.dex===POKEMON[id]?.dex))continue;
      result.push(id);if(result.length===6)break;
    }
    return result;
  };
  state.playerRoster=repair(state.playerRoster,PLAYER_DEFAULT);
  state.opponentRoster=repair(state.opponentRoster,OPPONENT_DEFAULT);
  state.playerBuilds=Array.from({length:6},(_,i)=>state.playerBuilds?.[i]||null);
  state.opponentBuilds=Array.from({length:6},(_,i)=>state.opponentBuilds?.[i]||null);
  state.playerPicks=(state.playerPicks||[]).filter(i=>i>=0&&i<6).slice(0,3);
  state.opponentPicks=(state.opponentPicks||[]).filter(i=>i>=0&&i<6).slice(0,3);
  saveState();
}
function hydrateEmbeddedData(){
  FAST_MOVES=structuredClone(EMBEDDED.fast);
  CHARGED_MOVES=structuredClone(EMBEDDED.charged);
  POKEMON=structuredClone(EMBEDDED.pokemon);
  META_ORDER=[...EMBEDDED.order].filter(id=>POKEMON[id]);
  DATA_INFO={source:EMBEDDED.source,count:META_ORDER.length,loaded:true,updatedAt:EMBEDDED.updatedAt,diagnostics:EMBEDDED.diagnostics};
  repairStateRosters();
  const when=new Date(DATA_INFO.updatedAt).toLocaleDateString("ja-JP");
  setDataBanner("内蔵SLデータを読み込みました",`${DATA_INFO.count}体・技 ${DATA_INFO.diagnostics.moveCountFast+DATA_INFO.diagnostics.moveCountCharged}種・スナップショット ${when}`,"ready");
}

function effectiveness(type,defTypes){return defTypes.reduce((m,t)=>{if(IMMUNE[type]?.includes(t))return m*0.390625;if(SUPER[type]?.includes(t))return m*1.6;if(RESIST[type]?.includes(t))return m*0.625;return m},1)}
function stageMult(stage){return STAGE[String(clamp(stage,-4,4))]||1}
function attackStat(mon){return mon.atk*stageMult(mon.attackStage)*(mon.shadow?SHADOW_ATTACK:1)}
function defenseStat(mon){return mon.def*stageMult(mon.defenseStage)*(mon.shadow?SHADOW_DEFENSE:1)}
function calcDamage(attacker,defender,move){if(!attacker||!defender||!move)return 1;const stab=attacker.types.includes(move.type)?STAB:1;const eff=effectiveness(move.type,defender.types);return Math.max(1,Math.floor(.5*move.power*(attackStat(attacker)/Math.max(1,defenseStat(defender)))*stab*eff*1.2999999523)+1)}

function monFromId(id,build=null){const p=POKEMON[id]||Object.values(FALLBACK_POKEMON)[0];const b=normalizeBuild(p,build);return {...p,...b,id,maxHp:b.hp,currentHp:b.hp,energy:0,attackStage:0,defenseStage:0,fastPending:null,fainted:false}}
function createTeam(roster,picks,builds){return {party:picks.map(i=>monFromId(roster[i],builds?.[i])),active:0,shields:2,switchCooldown:0}}
function active(team){return team.party[team.active]}
function alive(team){return team.party.map((m,i)=>!m.fainted?i:-1).filter(i=>i>=0)}
function battleOver(a,b){return alive(a).length===0||alive(b).length===0}
function teamHpRatio(team){return team.party.reduce((s,m)=>s+Math.max(0,m.currentHp)/Math.max(1,m.maxHp),0)}
function chargedObjects(mon){return (mon.charged||[]).map(id=>CHARGED_MOVES[id]).filter(Boolean)}
function fastObject(mon){return FAST_MOVES[mon.fast]||Object.values(FAST_MOVES)[0]}

function bestCharged(mon,opp,preferCheap=false){
  const available=chargedObjects(mon).filter(m=>mon.energy>=m.energy);
  if(!available.length)return null;
  if(preferCheap)return [...available].sort((a,b)=>a.energy-b.energy)[0];
  return [...available].sort((a,b)=>(calcDamage(mon,opp,b)/Math.max(1,b.energy))-(calcDamage(mon,opp,a)/Math.max(1,a.energy)))[0];
}
function matchupScore(mon,opp){
  if(!mon||!opp)return 0;
  const fast=fastObject(mon);
  const ownCharged=chargedObjects(mon);
  const own=(calcDamage(mon,opp,fast)/fast.turns)+(ownCharged.length?Math.max(...ownCharged.map(m=>calcDamage(mon,opp,m)/Math.max(1,m.energy)))*3:0);
  const of=fastObject(opp);
  const theirCharged=chargedObjects(opp);
  const theirs=(calcDamage(opp,mon,of)/of.turns)+(theirCharged.length?Math.max(...theirCharged.map(m=>calcDamage(opp,mon,m)/Math.max(1,m.energy)))*3:0);
  return (own-theirs)/Math.max(1,theirs);
}
function bestSwitch(team,opp){let best=-1,bestScore=-Infinity;for(const i of alive(team)){if(i===team.active)continue;const s=matchupScore(team.party[i],opp);if(s>bestScore){bestScore=s;best=i}}return {index:best,score:bestScore}}

function chooseAction(team,other,rng,style){
  const mon=active(team),opp=active(other);if(!mon||mon.fainted)return {type:"none"};
  const currentScore=matchupScore(mon,opp);const candidate=bestSwitch(team,opp);
  const switchBias=style==="conservative"?.15:style==="aggressive"?-.05:0;
  if(team.switchCooldown===0&&candidate.index>=0&&currentScore<-0.22+switchBias&&candidate.score>currentScore+.22&&rng()<.78)return {type:"switch",index:candidate.index};
  const available=chargedObjects(mon).filter(move=>mon.energy>=move.energy);
  if(available.length){
    const maxDamage=Math.max(...available.map(move=>calcDamage(mon,opp,move)));
    const lethal=maxDamage>=opp.currentHp;const throwChance=style==="aggressive"?.93:style==="conservative"?.70:.84;
    if(lethal||mon.energy>=90||rng()<throwChance){
      const move=other.shields>0&&available.length>1&&rng()<(style==="aggressive"?.48:.35)?bestCharged(mon,opp,true):bestCharged(mon,opp,false);
      return {type:"charged",move};
    }
  }
  return {type:"fast",move:fastObject(mon)};
}
function shouldShield(team,attacker,move,rng,style){if(team.shields<=0)return false;const defender=active(team),dmg=calcDamage(attacker,defender,move);if(dmg>=defender.currentHp)return true;const threshold=style==="conservative"?.28:style==="aggressive"?.48:.38;const lastMon=alive(team).length===1;if(lastMon&&dmg>=defender.currentHp*.25)return true;return dmg>=defender.currentHp*threshold&&rng()<(style==="conservative"?.9:style==="aggressive"?.62:.78)}
function applyEffects(user,target,move,rng,log,turn){
  for(const effect of move.effects||[]){
    if(rng()>safeNumber(effect.chance,1))continue;
    const receiver=effect.target==="opponent"?target:user;
    const key=effect.stat==="attack"?"attackStage":"defenseStage";
    receiver[key]=clamp(receiver[key]+safeNumber(effect.delta),-4,4);
    log.push(`${turnLabel(turn)} ${receiver.name}の${effect.stat==="attack"?"攻撃":"防御"}が${effect.delta>0?"上昇":"低下"}（${receiver[key]}段階）`);
  }
}
function turnLabel(turn){return `${(turn*TURN_MS/1000).toFixed(1)}秒`}
function forceSwitch(team,opp,log,turn){const options=alive(team).filter(i=>i!==team.active);if(!options.length)return;let best=options[0],score=-Infinity;for(const i of options){const s=matchupScore(team.party[i],opp);if(s>score){score=s;best=i}}team.active=best;team.party[best].fastPending=null;log.push(`${turnLabel(turn)} ${active(team).name}を繰り出した`)}
function processFaints(a,b,log,turn){const am=active(a),bm=active(b);if(am&&am.currentHp<=0&&!am.fainted){am.fainted=true;am.currentHp=0;am.fastPending=null;log.push(`${turnLabel(turn)} ${am.name}がひんし`)}if(bm&&bm.currentHp<=0&&!bm.fainted){bm.fainted=true;bm.currentHp=0;bm.fastPending=null;log.push(`${turnLabel(turn)} ${bm.name}がひんし`)}if(!battleOver(a,b)){if(active(a).fainted)forceSwitch(a,active(b),log,turn);if(active(b).fainted)forceSwitch(b,active(a),log,turn)}}

function simulateBattle(playerRoster,playerPicks,opponentRoster,opponentPicks,seed,style="balanced",verbose=true,playerBuilds=state.playerBuilds,opponentBuilds=state.opponentBuilds){
  const rng=mulberry32(Number(seed)||1),p=createTeam(playerRoster,playerPicks,playerBuilds),o=createTeam(opponentRoster,opponentPicks,opponentBuilds),log=[];
  for(let turn=1;turn<=MAX_TURNS;turn++){
    p.switchCooldown=Math.max(0,p.switchCooldown-1);o.switchCooldown=Math.max(0,o.switchCooldown-1);
    const pActor=active(p),oActor=active(o);
    const pa=pActor.fastPending?{type:"wait"}:chooseAction(p,o,rng,style);
    const oa=oActor.fastPending?{type:"wait"}:chooseAction(o,p,rng,style);

    const charged=[];
    if(pa.type==="charged")charged.push({team:p,other:o,action:pa,actor:pActor});
    if(oa.type==="charged")charged.push({team:o,other:p,action:oa,actor:oActor});
    charged.sort((x,y)=>attackStat(y.actor)-attackStat(x.actor)||(rng()<.5?-1:1));
    for(const item of charged){
      if(battleOver(p,o))break;
      const user=item.actor,target=active(item.other),move=item.action.move;
      if(active(item.team)!==user||!user||user.fainted||!move||user.energy<move.energy)continue;
      user.energy-=move.energy;
      const shield=shouldShield(item.other,user,move,rng,style);
      const dmg=shield?1:calcDamage(user,target,move);
      if(shield)item.other.shields-=1;
      target.currentHp-=dmg;
      if(verbose)log.push(`${turnLabel(turn)} ${user.name}の${move.name} → ${target.name} ${dmg}ダメージ${shield?"（シールド）":""}`);
      applyEffects(user,target,move,rng,log,turn);processFaints(p,o,log,turn);
    }
    if(battleOver(p,o))return finishBattle(p,o,turn,log,"KO");

    if(pa.type==="switch"&&active(p)===pActor&&!active(p).fainted&&p.switchCooldown===0){p.active=pa.index;p.switchCooldown=SWITCH_COOLDOWN_TURNS;if(verbose)log.push(`${turnLabel(turn)} あなたは${active(p).name}へ交代`)}
    if(oa.type==="switch"&&active(o)===oActor&&!active(o).fainted&&o.switchCooldown===0){o.active=oa.index;o.switchCooldown=SWITCH_COOLDOWN_TURNS;if(verbose)log.push(`${turnLabel(turn)} 相手は${active(o).name}へ交代`)}

    if(pa.type==="fast"&&active(p)===pActor&&!active(p).fastPending)active(p).fastPending={remaining:pa.move.turns,move:pa.move};
    if(oa.type==="fast"&&active(o)===oActor&&!active(o).fastPending)active(o).fastPending={remaining:oa.move.turns,move:oa.move};

    const fastHits=[];
    for(const [team,other] of [[p,o],[o,p]]){
      const mon=active(team);
      if(mon?.fastPending){mon.fastPending.remaining-=1;if(mon.fastPending.remaining<=0){fastHits.push({attacker:mon,defender:active(other),move:mon.fastPending.move});mon.fastPending=null}}
    }
    const damages=fastHits.map(hit=>({...hit,damage:calcDamage(hit.attacker,hit.defender,hit.move)}));
    for(const hit of damages){
      if(!hit.attacker.fainted&&hit.defender){
        hit.attacker.energy=clamp(hit.attacker.energy+hit.move.energy,0,100);hit.defender.currentHp-=hit.damage;
        if(verbose&&turn%4===0)log.push(`${turnLabel(turn)} ${hit.attacker.name}の${hit.move.name} → ${hit.damage}ダメージ（E${hit.attacker.energy}）`);
      }
    }
    processFaints(p,o,log,turn);
    if(battleOver(p,o))return finishBattle(p,o,turn,log,"KO");
  }
  return finishBattle(p,o,MAX_TURNS,log,"TIME");
}

function finishBattle(p,o,turn,log,reason){
  let winner;
  if(alive(p).length!==alive(o).length)winner=alive(p).length>alive(o).length?"player":"opponent";
  else if(Math.abs(teamHpRatio(p)-teamHpRatio(o))<1e-9)winner=attackStat(active(p))>=attackStat(active(o))?"player":"opponent";
  else winner=teamHpRatio(p)>teamHpRatio(o)?"player":"opponent";
  return {winner,turns:turn,seconds:turn*TURN_MS/1000,reason,player:{alive:alive(p).length,hp:teamHpRatio(p),shields:p.shields},opponent:{alive:alive(o).length,hp:teamHpRatio(o),shields:o.shields},log:log.slice(-140)};
}

function escapeHtml(value){return String(value??"").replace(/[&<>'"]/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[ch]))}
function moveLabel(p){const fast=FAST_MOVES[p.fast]?.name||p.fast;const charged=(p.charged||[]).map(id=>CHARGED_MOVES[id]?.name||id).join(" / ");return `${fast} / ${charged}`}
function typeChips(types){return (types||[]).map(t=>`<span class="type-chip type-${escapeHtml(t)}">${escapeHtml(typeName(t))}</span>`).join("")}

function rosterCard(side,index,id){
  const p=POKEMON[id],b=buildForSlot(side,index),card=document.createElement("article");card.className="roster-slot-card";
  if(!p||!b){card.textContent="データなし";return card;}
  if(!b.valid)card.classList.add("invalid-build");
  card.innerHTML=`
    <span class="slot-number">${index+1}</span>
    <div class="roster-main">
      <div class="roster-title"><strong>${escapeHtml(p.name)}</strong><span class="cp-chip">CP ${b.cp}</span></div>
      <div class="type-row">${typeChips(p.types)}<span class="rank-chip">収録 #${p.rank||"—"}</span></div>
      <div class="build-summary"><span>Lv ${b.level}</span><span>IV ${b.atkIV}/${b.defIV}/${b.hpIV}</span><span>A ${b.atk.toFixed(1)}</span><span>D ${b.def.toFixed(1)}</span><span>HP ${b.hp}</span></div>
      <small class="roster-moves">${escapeHtml(moveLabel({...p,...b}))}</small>
    </div>
    <div class="roster-actions"><button class="build-pokemon secondary-button" data-side="${side}" data-index="${index}" type="button">個体・技</button><button class="change-pokemon ghost-button" data-side="${side}" data-index="${index}" type="button">変更</button></div>`;
  return card;
}
function renderRosters(){
  document.getElementById("playerRoster").replaceChildren(...state.playerRoster.map((id,i)=>rosterCard("player",i,id)));
  document.getElementById("opponentRoster").replaceChildren(...state.opponentRoster.map((id,i)=>rosterCard("opponent",i,id)));
  document.getElementById("playerReady").textContent=`${state.playerRoster.length} / 6`;
  document.getElementById("opponentReady").textContent=`${state.opponentRoster.length} / 6`;
  const chip=document.getElementById("poolChip");if(chip)chip.textContent=`${DATA_INFO.count}体`;
}
function validateRosters(){
  for(const roster of [state.playerRoster,state.opponentRoster]){
    if(roster.length!==6||roster.some(id=>!POKEMON[id]))return "6体すべてを登録してください。";
    const dexes=roster.map(id=>POKEMON[id].dex);
    if(new Set(dexes).size!==6)return "同じポケモン（フォルム・シャドウ違いを含む）は同じ6体に複数登録できません。";
  }
  return "";
}
function openPokemonDialog(side,index){
  dialogTarget={side,index};
  const dialog=document.getElementById("pokemonDialog");
  const input=document.getElementById("pokemonSearch");
  input.value="";
  document.getElementById("dialogHint").textContent=`${side==="player"?"あなた":"相手"}の${index+1}枠目を変更します。SL順位上位から表示。`;
  renderPokemonOptions("");
  if(typeof dialog.showModal==="function")dialog.showModal();else dialog.setAttribute("open","");
  setTimeout(()=>input.focus(),50);
}
function renderPokemonOptions(query){
  const root=document.getElementById("pokemonList");
  const q=String(query||"").trim().toLowerCase();
  const ids=META_ORDER.filter(id=>{
    const p=POKEMON[id];
    const hay=[p.name,p.englishName,p.speciesId,...p.types.map(typeName),...p.types,p.shadow?"shadow シャドウ":""].join(" ").toLowerCase();
    return !q||hay.includes(q);
  }).slice(0,q?180:100);
  const currentRoster=dialogTarget?(dialogTarget.side==="player"?state.playerRoster:state.opponentRoster):[];
  root.replaceChildren(...ids.map(id=>{
    const p=POKEMON[id],button=document.createElement("button");button.type="button";button.className="pokemon-option";button.dataset.pokemonId=id;
    const duplicate=currentRoster.some((existing,i)=>i!==dialogTarget.index&&POKEMON[existing]?.dex===p.dex);
    button.disabled=duplicate;
    button.innerHTML=`<span class="pokemon-rank">#${p.rank||"—"}</span><span class="pokemon-option-main"><strong>${escapeHtml(p.name)}</strong><small>CP ${p.cp}・${escapeHtml(moveLabel(p))}</small><span class="type-row">${typeChips(p.types)}</span></span>${duplicate?'<span class="duplicate-label">登録済み</span>':""}`;
    return button;
  }));
  if(!ids.length){const empty=document.createElement("p");empty.className="empty-state";empty.textContent="該当するポケモンが見つかりません。";root.appendChild(empty)}
}
function chooseDialogPokemon(id){
  if(!dialogTarget||!POKEMON[id])return;
  const key=dialogTarget.side==="player"?"playerRoster":"opponentRoster";
  state[key][dialogTarget.index]=id;
  state[buildsKey(dialogTarget.side)][dialogTarget.index]=null;
  state.playerPicks=[];state.opponentPicks=[];state.lastRecommendations=null;
  saveState();renderAll();
  document.getElementById("pokemonDialog").close();dialogTarget=null;
}

function renderPickGrid(id,roster,picks,side){
  const root=document.getElementById(id);
  root.replaceChildren(...roster.map((pid,index)=>{
    const p=effectivePokemon(side,index),button=document.createElement("button");button.type="button";button.className="pick-card";button.dataset.side=side;button.dataset.index=String(index);
    const order=picks.indexOf(index);if(order>=0)button.classList.add("is-picked");
    button.innerHTML=`<strong>${escapeHtml(p.name)}</strong><small>CP ${p.cp}・Lv ${p.level}・IV ${p.atkIV}/${p.defIV}/${p.hpIV}</small><span class="type-row">${typeChips(p.types)}</span><small>${escapeHtml(moveLabel(p))}</small>`;
    if(order>=0){const badge=document.createElement("span");badge.className="pick-order";badge.textContent=String(order+1);button.appendChild(badge)}
    return button;
  }));
}
function renderSelection(){
  renderPickGrid("playerSelection",state.playerRoster,state.playerPicks,"player");renderPickGrid("opponentSelection",state.opponentRoster,state.opponentPicks,"opponent");
  document.getElementById("playerSelectionSummary").textContent=selectionNames(state.playerRoster,state.playerPicks)||"未選択";
  document.getElementById("opponentSelectionSummary").textContent=selectionNames(state.opponentRoster,state.opponentPicks)||"未選択";
}
function selectionNames(roster,picks){return picks.map(i=>POKEMON[roster[i]]?.name||"?").join(" → ")}
function togglePick(side,index){const key=side==="player"?"playerPicks":"opponentPicks",arr=state[key],at=arr.indexOf(index);if(at>=0)arr.splice(at,1);else if(arr.length<3)arr.push(index);state.lastRecommendations=null;saveState();renderSelection();renderBattleLineups();renderMatch()}
function renderLineup(id,roster,picks){const root=document.getElementById(id);const items=picks.map((i,j)=>{const span=document.createElement("span");span.className="lineup-pill";span.textContent=`${j===0?"先発":`控え${j}`} ${POKEMON[roster[i]]?.name||"?"}`;return span});root.replaceChildren(...items);if(!items.length)root.textContent="未確定"}
function renderBattleLineups(){renderLineup("battlePlayerLineup",state.playerRoster,state.playerPicks);renderLineup("battleOpponentLineup",state.opponentRoster,state.opponentPicks)}

function showResult(result,batch=null){
  const box=document.getElementById("battleResult");box.className=`result-card ${result.winner==="player"?"win":"loss"}`;
  if(batch){
    box.innerHTML=`<h3>100試合の勝率分析</h3><p>あなたの推定勝率 <strong>${batch.playerPct.toFixed(1)}%</strong>（${batch.playerWins}勝 / ${batch.opponentWins}敗）</p><div class="metric-row"><div class="metric"><strong>${batch.avgSeconds.toFixed(1)}秒</strong><span>平均時間</span></div><div class="metric"><strong>${batch.avgAlive.toFixed(2)}</strong><span>平均残存数</span></div><div class="metric"><strong>${batch.seed}</strong><span>開始シード</span></div></div><p class="result-note">AI判断と確率効果を変えて100回実行した推定値です。</p>`;return;
  }
  box.innerHTML=`<h3>${result.winner==="player"?"あなたの勝利":"相手の勝利"}</h3><p>${result.reason==="KO"?"3体を倒して決着":"時間切れ判定"}・${result.seconds.toFixed(1)}秒</p><div class="metric-row"><div class="metric"><strong>${result.player.alive} - ${result.opponent.alive}</strong><span>残存ポケモン</span></div><div class="metric"><strong>${result.player.shields} - ${result.opponent.shields}</strong><span>残りシールド</span></div><div class="metric"><strong>${result.turns}</strong><span>経過ターン</span></div></div>`;
  const log=document.getElementById("battleLog");log.replaceChildren(...result.log.map(text=>{const li=document.createElement("li");li.textContent=text;return li}));if(!result.log.length){const li=document.createElement("li");li.textContent="ログなし";log.appendChild(li)}
}
function validPicks(){return state.playerPicks.length===3&&state.opponentPicks.length===3}
function currentSeed(){return Number(document.getElementById("seedInput").value)||20260719}
function currentStyle(){return document.getElementById("aiStyle").value}
function runOne(record=false){
  if(!validPicks()){switchTab("selection");document.getElementById("selectionMessage").textContent="両者とも3体を選んでください。";return null}
  const result=simulateBattle(state.playerRoster,state.playerPicks,state.opponentRoster,state.opponentPicks,currentSeed()+state.gameNumber-1,currentStyle(),true,state.playerBuilds,state.opponentBuilds);
  state.lastBattle=result;saveState();showResult(result);if(record)recordSimulatedWinner(result);return result;
}
function runBatch(){
  if(!validPicks()){switchTab("selection");document.getElementById("selectionMessage").textContent="両者とも3体を選んでください。";return}
  const button=document.getElementById("runBatch");button.disabled=true;button.textContent="100試合を計算中…";
  setTimeout(()=>{
    const seed=currentSeed(),style=currentStyle();let pw=0,ow=0,sec=0,aliveSum=0;
    for(let i=0;i<100;i++){const result=simulateBattle(state.playerRoster,state.playerPicks,state.opponentRoster,state.opponentPicks,seed+i,style,false,state.playerBuilds,state.opponentBuilds);if(result.winner==="player")pw++;else ow++;sec+=result.seconds;aliveSum+=result.player.alive}
    showResult({winner:pw>=ow?"player":"opponent"},{playerPct:pw,playerWins:pw,opponentWins:ow,avgSeconds:sec/100,avgAlive:aliveSum/100,seed});
    button.disabled=false;button.textContent="100試合で勝率分析";
  },30);
}

function lineupPermutations(){
  const lines=[];
  for(let lead=0;lead<6;lead++){
    const rest=[0,1,2,3,4,5].filter(i=>i!==lead);
    for(let a=0;a<rest.length;a++)for(let b=a+1;b<rest.length;b++)lines.push([lead,rest[a],rest[b]]);
  }
  return lines;
}
function lineMons(roster,line,builds){return line.map(i=>monFromId(roster[i],builds?.[i]))}
function pairScoreBySlots(aRoster,aIndex,bRoster,bIndex,aBuilds,bBuilds){return clamp(matchupScore(monFromId(aRoster[aIndex],aBuilds?.[aIndex]),monFromId(bRoster[bIndex],bBuilds?.[bIndex])),-2,2)}
function pairScoreById(aId,bId){return clamp(matchupScore(monFromId(aId),monFromId(bId)),-2,2)}
function lineupHeuristic(playerRoster,pLine,opponentRoster,oLine){
  const pIds=pLine.map(i=>playerRoster[i]),oIds=oLine.map(i=>opponentRoster[i]);
  const lead=pairScoreById(pIds[0],oIds[0]);
  const coverage=oIds.map(oid=>Math.max(...pIds.map(pid=>pairScoreById(pid,oid))));
  const pressure=pIds.map(pid=>Math.max(...oIds.map(oid=>pairScoreById(pid,oid))));
  const worstCoverage=Math.min(...coverage);
  const safe=pIds.slice(1).map(pid=>{
    const p=POKEMON[pid];
    const worst=Math.min(...oIds.map(oid=>pairScoreById(pid,oid)));
    return worst+Math.log(Math.max(1,p.def*p.hp))/25;
  });
  return lead*.48+(coverage.reduce((a,b)=>a+b,0)/3)*.26+(pressure.reduce((a,b)=>a+b,0)/3)*.10+worstCoverage*.10+Math.max(...safe)*.06;
}
function uniqueLines(lines){const seen=new Set();return lines.filter(line=>{const key=line.join("-");if(seen.has(key))return false;seen.add(key);return true})}
function opponentSamplesFor(playerLine,allOpponentLines){
  const ranked=[...allOpponentLines].sort((a,b)=>lineupHeuristic(state.opponentRoster,b,state.playerRoster,playerLine)-lineupHeuristic(state.opponentRoster,a,state.playerRoster,playerLine));
  const samples=[...ranked.slice(0,5)];
  if(state.opponentPicks.length===3)samples.push([...state.opponentPicks]);
  for(let i=0;i<ranked.length&&samples.length<14;i+=Math.max(1,Math.floor(ranked.length/10)))samples.push(ranked[i]);
  return uniqueLines(samples).slice(0,14);
}
function simulateLineEstimate(playerLine,opponentLines,seed,style){
  let wins=0,total=0,alive=0;
  opponentLines.forEach((oLine,j)=>{
    for(let k=0;k<3;k++){
      const result=simulateBattle(state.playerRoster,playerLine,state.opponentRoster,oLine,seed+j*17+k*1009,style,false,state.playerBuilds,state.opponentBuilds);
      wins+=result.winner==="player"?1:0;alive+=result.player.alive;total++;
    }
  });
  return {winPct:total?wins/total*100:0,avgAlive:total?alive/total:0,total};
}
function bestCounterName(playerLine,opponentIndex){
  const oid=state.opponentRoster[opponentIndex];
  let best=playerLine[0],score=-Infinity;
  for(const index of playerLine){const s=pairScoreById(state.playerRoster[index],oid);if(s>score){score=s;best=index}}
  return {player:POKEMON[state.playerRoster[best]].name,opponent:POKEMON[oid].name,score};
}
function recommendationReasons(line){
  const pIds=line.map(i=>state.playerRoster[i]);
  const oIds=state.opponentRoster;
  const leadAverages=line.map(index=>({index,score:oIds.reduce((sum,oid)=>sum+pairScoreById(state.playerRoster[index],oid),0)/oIds.length})).sort((a,b)=>b.score-a.score);
  const threatScores=oIds.map((oid,index)=>({index,score:Math.max(...pIds.map(pid=>pairScoreById(pid,oid)))})).sort((a,b)=>a.score-b.score);
  const threat=bestCounterName(line,threatScores[0].index);
  const coverageCount=oIds.filter(oid=>Math.max(...pIds.map(pid=>pairScoreById(pid,oid)))>0.03).length;
  const backs=line.slice(1).map(index=>{
    const p=POKEMON[state.playerRoster[index]];
    const worst=Math.min(...oIds.map(oid=>pairScoreById(state.playerRoster[index],oid)));
    return {index,value:Math.log(Math.max(1,p.def*p.hp))+worst*3};
  }).sort((a,b)=>b.value-a.value);
  const reasons=[];
  reasons.push(`🎯 ${POKEMON[state.playerRoster[line[0]]].name}先発で、相手6体への平均圧力を確保`);
  reasons.push(`🧯 ${threat.player}が警戒枠の${threat.opponent}への回答役`);
  reasons.push(`🧩 3体で相手6体中${coverageCount}体にプラス評価を作れる構成`);
  if(backs[0])reasons.push(`🛟 ${POKEMON[state.playerRoster[backs[0].index]].name}は裏のクッション役として比較的安定`);
  if(leadAverages[0].index!==line[0])reasons.push(`💡 平均相性だけなら${POKEMON[state.playerRoster[leadAverages[0].index]].name}先発も候補`);
  return reasons.slice(0,4);
}
function renderRecommendations(results,currentEstimate=null){
  const panel=document.getElementById("recommendationPanel");panel.hidden=false;
  panel.innerHTML=`<div class="recommendation-heading"><div><p class="step">SELECTION ADVISER</p><h3>勝ち筋が太い選出候補 ✨</h3></div><span class="status-chip">相手の全60選出を想定</span></div><p class="recommendation-intro">相手の6体から考えられる選出を広く評価し、上位候補を実戦AIで再シミュレーションしました。勝率は推定値です。</p>`;
  const grid=document.createElement("div");grid.className="recommendation-grid";
  results.forEach((result,rank)=>{
    const card=document.createElement("article");card.className="recommendation-card";
    const delta=currentEstimate==null?null:result.winPct-currentEstimate;
    card.innerHTML=`
      <div class="recommendation-top"><span class="recommendation-rank">${rank===0?"👑 BEST":`#${rank+1}`}</span><strong>${result.winPct.toFixed(1)}%</strong></div>
      <div class="recommended-line">${result.line.map((i,j)=>`<span>${j===0?"先発":"控え"} ${escapeHtml(POKEMON[state.playerRoster[i]].name)}</span>`).join("")}</div>
      ${delta==null?"":`<p class="delta ${delta>=0?"positive":"negative"}">現在選出比 ${delta>=0?"+":""}${delta.toFixed(1)}pt</p>`}
      <div class="reason-list">${result.reasons.map(reason=>`<span class="reason-chip">${escapeHtml(reason)}</span>`).join("")}</div>
      <button class="apply-recommendation primary-button" data-line="${result.line.join(",")}" type="button">この選出を使う</button>`;
    grid.appendChild(card);
  });
  panel.appendChild(grid);
}
function estimateCurrentAcrossUnknown(seed,style){
  if(state.playerPicks.length!==3)return null;
  const opponentLines=opponentSamplesFor(state.playerPicks,lineupPermutations());
  return simulateLineEstimate(state.playerPicks,opponentLines,seed+70000,style).winPct;
}
function analyzeSelections(){
  const error=validateRosters();if(error){switchTab("roster");document.getElementById("rosterMessage").textContent=error;return}
  const button=document.getElementById("analyzeSelections");button.disabled=true;button.textContent="✨ 60通りを分析中…";
  const panel=document.getElementById("recommendationPanel");panel.hidden=false;panel.innerHTML='<div class="analysis-loading"><strong>選出を探索中…</strong><span>6体から60通りを作り、相手の選出候補と照合しています。</span></div>';
  setTimeout(()=>{
    const playerLines=lineupPermutations(),opponentLines=lineupPermutations();
    const scored=playerLines.map(line=>({line,heuristic:opponentLines.reduce((sum,oLine)=>sum+lineupHeuristic(state.playerRoster,line,state.opponentRoster,oLine),0)/opponentLines.length})).sort((a,b)=>b.heuristic-a.heuristic);
    const candidates=uniqueLines([...(state.playerPicks.length===3?[state.playerPicks]:[]),...scored.slice(0,8).map(x=>x.line)]).slice(0,8);
    const seed=currentSeed(),style=currentStyle();
    const validated=candidates.map((line,index)=>{
      const samples=opponentSamplesFor(line,opponentLines);
      const estimate=simulateLineEstimate(line,samples,seed+index*10000,style);
      return {line,...estimate,reasons:recommendationReasons(line)};
    }).sort((a,b)=>b.winPct-a.winPct||b.avgAlive-a.avgAlive);
    const current=estimateCurrentAcrossUnknown(seed,style);
    const top=validated.slice(0,3);
    state.lastRecommendations={createdAt:Date.now(),results:top};saveState();renderRecommendations(top,current);
    button.disabled=false;button.textContent="✨ 勝てる選出を探す";
  },50);
}

function openBuildDialog(side,index){
  buildTarget={side,index};
  const p=POKEMON[state[rosterKey(side)][index]],current=buildForSlot(side,index);
  if(!p||!current)return;
  document.getElementById("buildDialogTitle").textContent=`${p.name}の個体値・技`;
  document.getElementById("buildPreset").value=state[buildsKey(side)][index]?.preset||"rank1";
  document.getElementById("buildLevel").value=current.level;
  document.getElementById("buildAtkIv").value=current.atkIV;
  document.getElementById("buildDefIv").value=current.defIV;
  document.getElementById("buildHpIv").value=current.hpIV;
  const fast=document.getElementById("buildFast"),c1=document.getElementById("buildCharged1"),c2=document.getElementById("buildCharged2");
  fast.replaceChildren(...p.legalFast.map(id=>new Option(FAST_MOVES[id]?.name||id,id)));
  c1.replaceChildren(...p.legalCharged.map(id=>new Option(CHARGED_MOVES[id]?.name||id,id)));
  c2.replaceChildren(...p.legalCharged.map(id=>new Option(CHARGED_MOVES[id]?.name||id,id)));
  fast.value=current.fast;c1.value=current.charged[0]||p.legalCharged[0];c2.value=current.charged[1]||p.legalCharged.find(x=>x!==c1.value)||c1.value;
  updateBuildPreview();
  document.getElementById("buildMessage").textContent="";
  document.getElementById("buildDialog").showModal();
}
function readBuildForm(){
  return {preset:document.getElementById("buildPreset").value,level:safeNumber(document.getElementById("buildLevel").value),atkIV:safeNumber(document.getElementById("buildAtkIv").value),defIV:safeNumber(document.getElementById("buildDefIv").value),hpIV:safeNumber(document.getElementById("buildHpIv").value),fast:document.getElementById("buildFast").value,charged1:document.getElementById("buildCharged1").value,charged2:document.getElementById("buildCharged2").value};
}
function applyPresetToBuildForm(){
  if(!buildTarget)return;const p=POKEMON[state[rosterKey(buildTarget.side)][buildTarget.index]],preset=document.getElementById("buildPreset").value;
  if(preset!=="custom"){
    const b=presetData(p,preset);document.getElementById("buildLevel").value=b.level;document.getElementById("buildAtkIv").value=b.atkIV;document.getElementById("buildDefIv").value=b.defIV;document.getElementById("buildHpIv").value=b.hpIV;
  }
  updateBuildPreview();
}
function updateBuildPreview(){
  if(!buildTarget)return;const p=POKEMON[state[rosterKey(buildTarget.side)][buildTarget.index]],b=normalizeBuild(p,readBuildForm()),preview=document.getElementById("buildPreview");
  preview.className=`result-card ${b.valid?"":"invalid-build"}`;
  preview.innerHTML=`<h3>${escapeHtml(p.name)} / CP ${b.cp}</h3><p>Lv ${b.level}・IV ${b.atkIV}/${b.defIV}/${b.hpIV}</p><div class="metric-row"><div class="metric"><strong>${b.atk.toFixed(2)}</strong><span>攻撃</span></div><div class="metric"><strong>${b.def.toFixed(2)}</strong><span>防御</span></div><div class="metric"><strong>${b.hp}</strong><span>HP</span></div></div><p class="result-note">${b.valid?"スーパーリーグ上限内です。":"CP1500を超えています。レベルまたは個体値を下げてください。"}</p>`;
}
function saveBuildFromDialog(){
  if(!buildTarget)return;const p=POKEMON[state[rosterKey(buildTarget.side)][buildTarget.index]],raw=readBuildForm(),b=normalizeBuild(p,raw);
  if(!b.valid){document.getElementById("buildMessage").textContent="CP1500を超えているため保存できません。";return}
  state[buildsKey(buildTarget.side)][buildTarget.index]=raw;state.lastRecommendations=null;saveState();renderAll();document.getElementById("buildDialog").close();buildTarget=null;
}
function renderDataLibrary(query=""){
  const d=DATA_INFO.diagnostics||{},q=String(query).trim().toLowerCase();
  document.getElementById("dataCountChip").textContent=`${DATA_INFO.count}体`;
  document.getElementById("dataMetrics").innerHTML=`<div class="metric"><strong>${DATA_INFO.count}</strong><span>収録ポケモン</span></div><div class="metric"><strong>${d.moveCountFast||0}</strong><span>通常技</span></div><div class="metric"><strong>${d.moveCountCharged||0}</strong><span>ゲージ技</span></div>`;
  const ids=META_ORDER.filter(id=>{const p=POKEMON[id],hay=[p.name,p.englishName,...p.types.map(typeName),...p.types,FAST_MOVES[p.fast]?.name,...p.charged.map(x=>CHARGED_MOVES[x]?.name)].join(" ").toLowerCase();return !q||hay.includes(q)}).slice(0,q?320:120);
  document.getElementById("dataList").replaceChildren(...ids.map(id=>{const p=POKEMON[id],b=p.rank1,row=document.createElement("article");row.className="data-row";row.innerHTML=`<span class="data-rank">#${p.rank}</span><div class="data-main"><strong>${escapeHtml(p.name)}</strong><small>${typeChips(p.types)} ${escapeHtml(moveLabel(p))}</small></div><div class="data-build">CP ${b.cp}<br>Lv ${b.level} / IV ${b.atkIV}/${b.defIV}/${b.hpIV}</div>`;return row}));
  document.getElementById("dataDiagnostics").innerHTML=`<p><strong>データ元:</strong> ${escapeHtml(DATA_INFO.source)}</p><p><strong>基準日:</strong> ${new Date(DATA_INFO.updatedAt).toLocaleDateString("ja-JP")}</p><p><strong>収録:</strong> 通常・フォルム ${d.baseForms||0}、シャドウ ${d.shadowForms||0}</p><p><strong>除外:</strong> ${d.excludedCount||0}件${d.excludedCount?`（${(d.excluded||[]).map(x=>`${escapeHtml(x.id)}: ${escapeHtml(x.reason)}`).join(" / ")}）`:"。数値データ不足による除外はありません。"}</p><p>各個体はCP1500以下でSCPが最大となるレベル・個体値を全4096通りから計算しています。攻撃寄り・CMP寄り・手入力にも切替可能です。</p>`;
}

function targetWins(){return Math.ceil(Number(state.format)/2)}
function matchFinished(){return state.playerScore>=targetWins()||state.opponentScore>=targetWins()}
function recordSimulatedWinner(result){
  if(matchFinished())return;
  state.history.push({game:state.gameNumber,winner:result.winner,player:state.playerPicks.map(i=>POKEMON[state.playerRoster[i]].name),opponent:state.opponentPicks.map(i=>POKEMON[state.opponentRoster[i]].name),seconds:result.seconds});
  if(result.winner==="player")state.playerScore++;else state.opponentScore++;
  if(!matchFinished())state.gameNumber++;
  saveState();renderMatch();
}
function renderMatch(){
  document.getElementById("matchFormat").value=String(state.format);document.getElementById("playerScore").textContent=state.playerScore;document.getElementById("opponentScore").textContent=state.opponentScore;document.getElementById("gameNumber").textContent=`GAME ${state.gameNumber}`;document.getElementById("targetWins").textContent=`${targetWins()}勝先取`;
  renderLineup("currentPlayerLineup",state.playerRoster,state.playerPicks);renderLineup("currentOpponentLineup",state.opponentRoster,state.opponentPicks);
  const list=document.getElementById("historyList");list.replaceChildren(...state.history.map(h=>{const li=document.createElement("li");li.textContent=`Game ${h.game}: ${h.winner==="player"?"あなた":"相手"}勝利（${h.seconds.toFixed(1)}秒）`;return li}));
  if(!state.history.length){const li=document.createElement("li");li.textContent="まだ結果はありません。";list.appendChild(li)}
  document.getElementById("simulateGame").disabled=matchFinished();document.getElementById("nextSelection").disabled=matchFinished();
  const msg=document.getElementById("matchMessage");msg.textContent=state.playerScore>=targetWins()?"マッチ終了：あなたの勝利 🎉":state.opponentScore>=targetWins()?"マッチ終了：相手の勝利":"";
}
function resetMatch(){state.playerScore=0;state.opponentScore=0;state.gameNumber=1;state.history=[];state.playerPicks=[];state.opponentPicks=[];state.lastRecommendations=null;saveState();renderSelection();renderMatch();renderBattleLineups();document.getElementById("recommendationPanel").hidden=true}
function resetAll(){if(!confirm("登録・個体値・技・選出・履歴を初期化しますか？"))return;state=defaultState();repairStateRosters();saveState();renderAll();switchTab("roster")}

function switchTab(name){document.querySelectorAll(".tab").forEach(button=>button.classList.toggle("is-active",button.dataset.tab===name));document.querySelectorAll(".panel").forEach(panel=>panel.classList.toggle("is-active",panel.id===name));if(name==="selection")renderSelection();if(name==="battle")renderBattleLineups();if(name==="match")renderMatch();if(name==="data")renderDataLibrary(document.getElementById("dataSearch")?.value||"");window.scrollTo({top:0,behavior:"smooth"})}
function startTimer(){clearInterval(timerId);timerValue=90;updateTimer();timerId=setInterval(()=>{timerValue--;updateTimer();if(timerValue<=0){clearInterval(timerId);timerId=null;document.getElementById("selectionMessage").textContent="選出時間が終了しました。"}},1000)}
function updateTimer(){const el=document.getElementById("timer");el.textContent=timerValue;el.closest(".timer-box").classList.toggle("is-low",timerValue<=15)}
function renderAll(){renderRosters();renderSelection();renderBattleLineups();renderMatch();renderDataLibrary(document.getElementById("dataSearch")?.value||"");updateTimer();if(state.lastRecommendations?.results?.length)renderRecommendations(state.lastRecommendations.results,null)}

function applyRecommendation(line){
  const parsed=String(line||"").split(",").map(Number).filter(n=>Number.isInteger(n)&&n>=0&&n<6);
  if(parsed.length!==3)return;
  state.playerPicks=parsed;saveState();renderSelection();renderBattleLineups();renderMatch();
  document.getElementById("selectionMessage").textContent="おすすめ選出を反映しました ✨";
  switchTab("selection");
}

function wireEvents(){
  document.querySelectorAll(".tab").forEach(button=>button.addEventListener("click",()=>switchTab(button.dataset.tab)));
  document.getElementById("saveRosters").addEventListener("click",()=>{const error=validateRosters();document.getElementById("rosterMessage").textContent=error||"保存しました。";if(!error){saveState();renderSelection();switchTab("selection")}});
  document.addEventListener("click",event=>{
    const change=event.target.closest(".change-pokemon");if(change){openPokemonDialog(change.dataset.side,Number(change.dataset.index));return}
    const build=event.target.closest(".build-pokemon");if(build){openBuildDialog(build.dataset.side,Number(build.dataset.index));return}
    const option=event.target.closest(".pokemon-option");if(option&&!option.disabled){chooseDialogPokemon(option.dataset.pokemonId);return}
    const pick=event.target.closest(".pick-card");if(pick){togglePick(pick.dataset.side,Number(pick.dataset.index));return}
    const apply=event.target.closest(".apply-recommendation");if(apply){applyRecommendation(apply.dataset.line)}
  });
  document.getElementById("pokemonSearch").addEventListener("input",event=>renderPokemonOptions(event.target.value));
  document.getElementById("closePokemonDialog").addEventListener("click",()=>document.getElementById("pokemonDialog").close());
  document.getElementById("closeBuildDialog").addEventListener("click",()=>document.getElementById("buildDialog").close());
  document.getElementById("buildPreset").addEventListener("change",applyPresetToBuildForm);
  ["buildLevel","buildAtkIv","buildDefIv","buildHpIv","buildFast","buildCharged1","buildCharged2"].forEach(id=>document.getElementById(id).addEventListener("input",()=>{document.getElementById("buildPreset").value="custom";updateBuildPreview()}));
  document.getElementById("saveBuild").addEventListener("click",saveBuildFromDialog);
  document.getElementById("dataSearch").addEventListener("input",event=>renderDataLibrary(event.target.value));
  document.getElementById("openDataTab").addEventListener("click",()=>switchTab("data"));
  document.getElementById("startTimer").addEventListener("click",startTimer);
  document.getElementById("clearPicks").addEventListener("click",()=>{state.playerPicks=[];state.opponentPicks=[];state.lastRecommendations=null;saveState();renderSelection();document.getElementById("recommendationPanel").hidden=true});
  document.getElementById("confirmPicks").addEventListener("click",()=>{if(!validPicks()){document.getElementById("selectionMessage").textContent="両者とも3体を選んでください。";return}clearInterval(timerId);document.getElementById("selectionMessage").textContent="選出を確定しました。";saveState();renderBattleLineups();switchTab("battle")});
  document.getElementById("runBattle").addEventListener("click",()=>runOne(false));
  document.getElementById("runBatch").addEventListener("click",runBatch);
  document.getElementById("analyzeSelections").addEventListener("click",analyzeSelections);
  document.getElementById("simulateGame").addEventListener("click",()=>runOne(true));
  document.getElementById("nextSelection").addEventListener("click",()=>{state.playerPicks=[];state.opponentPicks=[];state.lastRecommendations=null;saveState();renderSelection();switchTab("selection")});
  document.getElementById("newMatch").addEventListener("click",resetMatch);
  document.getElementById("matchFormat").addEventListener("change",event=>{state.format=Number(event.target.value);resetMatch()});
  document.getElementById("resetAll").addEventListener("click",resetAll);
  }

async function bootstrap(){
  hydrateEmbeddedData();wireEvents();repairStateRosters();renderAll();
  if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
}
if(typeof document!=="undefined")bootstrap();
