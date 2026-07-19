"use strict";

const STORAGE_KEY = "pjcs-simulator-v07";
const OLD_STORAGE_KEYS = ["pjcs-simulator-v06","pjcs-simulator-v05","pjcs-simulator-v04","pjcs-simulator-v03","pjcs-simulator-v02"];
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
  lickilicky:"ベロベルト",feraligatr:"オーダイル",altaria:"チルタリス",corsola:"サニーゴ",jellicent:"ブルンゲル",quagsire:"ヌオー",jumpluff:"ワタッコ",empoleon:"エンペルト",clodsire:"ドオー",sableye:"ヤミラミ",ninetales:"キュウコン",corviknight:"アーマーガア",tinkaton:"デカヌチャン",azumarill:"マリルリ",skarmory:"エアームド",medicham:"チャーレム",stunfisk:"マッギョ",lanturn:"ランターン",gligar:"グライガー",gliscor:"グライオン",mandibuzz:"バルジーナ",dunsparce:"ノコッチ",dudunsparce:"ノココッチ",diggersby:"ホルード",carbink:"メレシー",toxapex:"ドヒドイデ",trevenant:"オーロット",venusaur:"フシギバナ",charizard:"リザードン",swampert:"ラグラージ",serperior:"ジャローダ",whiscash:"ナマズン",pelipper:"ペリッパー",noctowl:"ヨルノズク",umbreon:"ブラッキー",dewgong:"ジュゴン",lapras:"ラプラス",registeel:"レジスチル",bastiodon:"トリデプス",victreebel:"ウツボット",machamp:"カイリキー",primeape:"オコリザル",annihilape:"コノヨザル",poliwrath:"ニョロボン",toxicroak:"ドクロッグ",marowak:"ガラガラ",muk:"ベトベトン",drapion:"ドラピオン",golbat:"ゴルバット",crobat:"クロバット",ariados:"アリアドス",beedrill:"スピアー",forretress:"フォレトス",cradily:"ユレイドル",aurorus:"アマルルガ",abomasnow:"ユキノオー",walrein:"トドゼルガ",froslass:"ユキメノコ",alolan_sandslash:"サンドパン",sandslash:"サンドパン",wigglytuff:"プクリン",clefable:"ピクシー",sylveon:"ニンフィア",aromatisse:"フレフワン",togetic:"トゲチック",togekiss:"トゲキッス",dragonair:"ハクリュー",goodra:"ヌメルゴン",sliggoo:"ヌメイル",kommo_o:"ジャラランガ",hakamo_o:"ジャランゴ",zweilous:"ジヘッド",guzzlord:"アクジキング",greninja:"ゲッコウガ",samurott:"ダイケンキ",blastoise:"カメックス",tentacruel:"ドククラゲ",mantine:"マンタイン",araquanid:"オニシズクモ",golisopod:"グソクムシャ",charjabug:"デンヂムシ",galvantula:"デンチュラ",magnezone:"ジバコイル",togedemaru:"トゲデマル",pachirisu:"パチリス",raichu:"ライチュウ",electrode:"マルマイン",charjabug_shadow:"デンヂムシ",cofagrigus:"デスカーン",runerigus:"デスバーン",drifblim:"フワライド",dusclops:"サマヨール",haunter:"ゴースト",gengar:"ゲンガー",froslass_shadow:"ユキメノコ",mew:"ミュウ",cresselia:"クレセリア",deoxys_defense:"デオキシス",hypno:"スリーパー",malamar:"カラマネロ",oranguru:"ヤレユータン",girafarig:"キリンリキ",farigiraf:"リキキリン",lokix:"エクスレッグ",obstagoon:"タチフサグマ",scrafty:"ズルズキン",pangoro:"ゴロンダ",morpeko_full_belly:"モルペコ",perrserker:"ニャイキング",escavalier:"シュバルゴ",ferrothorn:"ナットレイ",steelix:"ハガネール",excadrill:"ドリュウズ",probopass:"ダイノーズ",aggron:"ボスゴドラ",melmetal:"メルメタル",aegislash_shield:"ギルガルド",talonflame:"ファイアロー",skeledirge:"ラウドボーン",salazzle:"エンニュート",typhlosion:"バクフーン",magcargo:"マグカルゴ",seismitoad:"ガマゲロゲ",gastrodon:"トリトドン",hippowdon:"カバルドン",flygon:"フライゴン",claydol:"ネンドール",rhyperior:"ドサイドン",vigoroth:"ヤルキモノ",greedent:"ヨクバリス",furret:"オオタチ",miltank:"ミルタンク",snorlax:"カビゴン",dubwool:"バイウールー",bibarel:"ビーダル",castform:"ポワルン",fearow:"オニドリル"
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
const OPPONENT_DEFAULT = ["tinkaton","ninetales_shadow","corviknight","feraligatr","clodsire","sableye"].filter(id=>POKEMON[id]);

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
  // Raw internal form labels such as "normal" are never displayed.
  void englishName;
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
  return {playerRoster:[...PLAYER_DEFAULT],opponentRoster:[...OPPONENT_DEFAULT],playerBuilds:Array(6).fill(null),opponentBuilds:Array(6).fill(null),playerPicks:[],opponentPicks:[],opponentSelectionMeta:null,opponentRevealed:false,format:3,playerScore:0,opponentScore:0,gameNumber:1,history:[],lastBattle:null,lastRecommendations:null,quickBattleNumber:0};
}
function loadState(){
  try{
    const raw=localStorage.getItem(STORAGE_KEY) || OLD_STORAGE_KEYS.map(k=>localStorage.getItem(k)).find(Boolean);
    const parsed=raw?JSON.parse(raw):null;
    return parsed?{...defaultState(),...parsed}:defaultState();
  }catch{return defaultState();}
}
function saveState(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch{}}
let state=loadState();
let timerId=null;
let timerValue=90;
let dialogTarget=null;
let buildTarget=null;
let opponentAiComputing=false;

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
  state.opponentRevealed=Boolean(state.opponentRevealed);
  state.quickBattleNumber=Math.max(0,Math.trunc(Number(state.quickBattleNumber)||0));
  if(!state.opponentSelectionMeta||state.opponentSelectionMeta.version!==7)state.opponentSelectionMeta=null;
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
  setDataBanner("内蔵SLデータを読み込みました",`${DATA_INFO.count}体・技 ${DATA_INFO.diagnostics.moveCountFast+DATA_INFO.diagnostics.moveCountCharged}種・更新 ${when}`,"ready");
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
function fastTiming(move){return `${move.turns}ターン / ${(move.turns*TURN_MS/1000).toFixed(1)}秒`}
function forceSwitch(team,opp,log,turn){const options=alive(team).filter(i=>i!==team.active);if(!options.length)return;let best=options[0],score=-Infinity;for(const i of options){const s=matchupScore(team.party[i],opp);if(s>score){score=s;best=i}}team.active=best;team.party[best].fastPending=null;log.push(`${turnLabel(turn)} ${active(team).name}を繰り出した`)}
function processFaints(a,b,log,turn){const am=active(a),bm=active(b);if(am&&am.currentHp<=0&&!am.fainted){am.fainted=true;am.currentHp=0;am.fastPending=null;log.push(`${turnLabel(turn)} ${am.name}がひんし`)}if(bm&&bm.currentHp<=0&&!bm.fainted){bm.fainted=true;bm.currentHp=0;bm.fastPending=null;log.push(`${turnLabel(turn)} ${bm.name}がひんし`)}if(!battleOver(a,b)){if(active(a).fainted)forceSwitch(a,active(b),log,turn);if(active(b).fainted)forceSwitch(b,active(a),log,turn)}}

function simulateBattle(playerRoster,playerPicks,opponentRoster,opponentPicks,seed,style="balanced",verbose=true,playerBuilds=state.playerBuilds,opponentBuilds=state.opponentBuilds,options={}){
  const rng=mulberry32(Number(seed)||1),p=createTeam(playerRoster,playerPicks,playerBuilds),o=createTeam(opponentRoster,opponentPicks,opponentBuilds),log=[];
  p.shields=clamp(Math.round(safeNumber(options.playerShields,options.shields??2)),0,2);
  o.shields=clamp(Math.round(safeNumber(options.opponentShields,options.shields??2)),0,2);
  let turn=0;
  while(turn<MAX_TURNS){
    const pActor=active(p),oActor=active(o);
    const pa=pActor.fastPending?{type:"wait"}:chooseAction(p,o,rng,style);
    const oa=oActor.fastPending?{type:"wait"}:chooseAction(o,p,rng,style);

    // Charged Moves resolve at the current turn boundary. They have energy cost,
    // but no move-specific PvP turn duration; the battle clock does not advance.
    const charged=[];
    if(pa.type==="charged")charged.push({team:p,other:o,action:pa,actor:pActor,label:"あなた"});
    if(oa.type==="charged")charged.push({team:o,other:p,action:oa,actor:oActor,label:"相手"});
    charged.sort((x,y)=>attackStat(y.actor)-attackStat(x.actor)||(rng()<.5?-1:1));
    if(charged.length){
      for(const item of charged){
        if(battleOver(p,o))break;
        const user=item.actor,target=active(item.other),move=item.action.move;
        if(active(item.team)!==user||!user||user.fainted||!move||user.energy<move.energy)continue;
        user.energy-=move.energy;
        const shield=shouldShield(item.other,user,move,rng,style);
        const dmg=shield?1:calcDamage(user,target,move);
        if(shield)item.other.shields-=1;
        target.currentHp-=dmg;
        if(verbose)log.push(`${turnLabel(turn)} ${user.name}の${move.name} → ${target.name} ${dmg}ダメージ${shield?"（シールド）":""}（ゲージ技・固有ターンなし）`);
        applyEffects(user,target,move,rng,log,turn);processFaints(p,o,log,turn);
      }
      if(battleOver(p,o))return finishBattle(p,o,turn,log,"KO");
      continue;
    }

    if(pa.type==="switch"&&active(p)===pActor&&!active(p).fainted&&p.switchCooldown===0){p.active=pa.index;p.switchCooldown=SWITCH_COOLDOWN_TURNS;if(verbose)log.push(`${turnLabel(turn)} あなたは${active(p).name}へ交代`)}
    if(oa.type==="switch"&&active(o)===oActor&&!active(o).fainted&&o.switchCooldown===0){o.active=oa.index;o.switchCooldown=SWITCH_COOLDOWN_TURNS;if(verbose)log.push(`${turnLabel(turn)} 相手は${active(o).name}へ交代`)}

    if(pa.type==="fast"&&active(p)===pActor&&!active(p).fastPending)active(p).fastPending={remaining:pa.move.turns,move:pa.move};
    if(oa.type==="fast"&&active(o)===oActor&&!active(o).fastPending)active(o).fastPending={remaining:oa.move.turns,move:oa.move};

    // One real PvP turn (0.5 seconds) passes here.
    turn+=1;
    p.switchCooldown=Math.max(0,p.switchCooldown-1);o.switchCooldown=Math.max(0,o.switchCooldown-1);
    const fastHits=[];
    for(const [team,other] of [[p,o],[o,p]]){
      const mon=active(team);
      if(mon?.fastPending){
        mon.fastPending.remaining-=1;
        if(mon.fastPending.remaining<=0){fastHits.push({attacker:mon,defender:active(other),move:mon.fastPending.move});mon.fastPending=null}
      }
    }
    const damages=fastHits.map(hit=>({...hit,damage:calcDamage(hit.attacker,hit.defender,hit.move)}));
    for(const hit of damages){
      if(!hit.attacker.fainted&&hit.defender){
        hit.attacker.energy=clamp(hit.attacker.energy+hit.move.energy,0,100);hit.defender.currentHp-=hit.damage;
        if(verbose)log.push(`${turnLabel(turn)} ${hit.attacker.name}の${hit.move.name} → ${hit.damage}ダメージ（${fastTiming(hit.move)}、E+${hit.move.energy}→${hit.attacker.energy}）`);
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
  return {winner,turns:turn,seconds:turn*TURN_MS/1000,reason,player:{alive:alive(p).length,hp:teamHpRatio(p),shields:p.shields},opponent:{alive:alive(o).length,hp:teamHpRatio(o),shields:o.shields},log:log.slice(-260)};
}

function escapeHtml(value){return String(value??"").replace(/[&<>'"]/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[ch]))}
function moveLabel(p){const fast=FAST_MOVES[p.fast]?.name||p.fast;const charged=(p.charged||[]).map(id=>CHARGED_MOVES[id]?.name||id).join(" / ");return `${fast} / ${charged}`}
function typeChips(types){return (types||[]).map(t=>`<span class="type-chip type-${escapeHtml(t)}">${escapeHtml(typeName(t))}</span>`).join("")}
const SPECIAL_SPRITE_SLUGS={
  ninetales_alola:"ninetales-alola",
  gastrodon_east_sea:"gastrodon-east",
  gastrodon_west_sea:"gastrodon-west",
  dudunsparce_two:"dudunsparce",
  sandslash_alola:"sandslash-alola",
  raichu_alola:"raichu-alola",
  electrode_hisuian:"electrode-hisui",
  deoxys_defense:"deoxys-defense",
  morpeko_full_belly:"morpeko",
  typhlosion_hisuian:"typhlosion-hisui",
  castform_rainy:"castform-rainy",
  castform_sunny:"castform-sunny",
  castform_snowy:"castform-snowy",
  muk_alola:"muk-alola",
  marowak_alola:"marowak-alola",
  samurott_hisuian:"samurott-hisui",
  aegislash_shield:"aegislash-shield",
  jellicent_female:"jellicent-f",
  stunfisk_galarian:"stunfisk-galar",
  darmanitan_zen:"darmanitan-zen",
  pyroar_female:"pyroar-f",
  darmanitan_standard:"darmanitan",
  gourgeist_super:"gourgeist-super",
  gourgeist_large:"gourgeist-large",
  gourgeist_average:"gourgeist",
  gourgeist_small:"gourgeist-small",
  eternatus_eternamax:"eternatus-eternamax",
  golem_alola:"golem-alola",
  slowking_galarian:"slowking-galar",
  zygarde_complete:"zygarde-complete",
  moltres_galarian:"moltres-galar",
  graveler_golem_alola:"graveler-alola",
  calyrex_ice_rider:"calyrex-ice",
  meowstic_female:"meowstic-f",
  meloetta_aria:"meloetta-aria",
  urshifu_single_strike:"urshifu",
  geodude_graveler_alola:"geodude-alola",
  eiscue_ice:"eiscue",
  slowbro_galarian:"slowbro-galar",
  zygarde_fifty_percent:"zygarde-50",
  zygarde_complete_fifty_percent:"zygarde-complete",
  slowpoke_slowbro_galarian:"slowpoke-galar"
};
const SPECIAL_SPRITE_FALLBACK_ONLY=new Set([
  "dunsparce_dudunsparce_two","dudunsparce_three","snorlax_wildarea_2024","ho_oh_s","mewtwo_a","raikou_s","latias_s"
]);
function normalizedSpriteKey(p){return String(p?.speciesId||p?.id||"").replace(/_shadow$/,'')}
function spriteUrl(p){
  const key=normalizedSpriteKey(p);
  if(SPECIAL_SPRITE_FALLBACK_ONLY.has(key))return "";
  if(SPECIAL_SPRITE_SLUGS[key])return `https://play.pokemonshowdown.com/sprites/gen5/${SPECIAL_SPRITE_SLUGS[key]}.png`;
  const dex=Math.max(1,Math.trunc(Number(p?.dex)||0));
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${dex}.png`;
}
function pokemonAvatar(p,size="normal"){
  const initial=escapeHtml(String(p?.name||"?").replace(/[（(].*/,"").slice(0,1)||"?");
  const url=spriteUrl(p);
  if(!url)return `<span class="pokemon-avatar avatar-${escapeHtml(size)}"><span class="avatar-fallback avatar-fallback-solid" aria-hidden="true">${initial}</span></span>`;
  return `<span class="pokemon-avatar avatar-${escapeHtml(size)}"><img src="${url}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span class="avatar-fallback avatar-fallback-solid" hidden aria-hidden="true">${initial}</span></span>`;
}

function rosterCard(side,index,id){
  const p=POKEMON[id],b=buildForSlot(side,index),card=document.createElement("article");card.className="roster-slot-card";
  if(!p||!b){card.textContent="データなし";return card;}
  if(!b.valid)card.classList.add("invalid-build");
  card.innerHTML=`
    <span class="slot-number">${index+1}</span>
    ${pokemonAvatar(p,"roster")}
    <div class="roster-main">
      <div class="roster-title"><strong>${escapeHtml(p.name)}</strong><span class="cp-chip">CP ${b.cp}</span></div>
      <div class="type-row">${typeChips(p.types)}${p.rank?`<span class="rank-chip">PvPoke #${p.rank}</span>`:""}${p.metaFeatured?'<span class="meta-chip">環境注目</span>':""}</div>
      <div class="build-summary"><span>Lv ${b.level}</span><span>個体値 ${b.atkIV}/${b.defIV}/${b.hpIV}</span><span>攻撃 ${b.atk.toFixed(1)}</span><span>防御 ${b.def.toFixed(1)}</span><span>HP ${b.hp}</span></div>
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
  document.getElementById("dialogHint").textContent=`${side==="player"?"あなた":"相手"}の${index+1}枠目を変更します。順位を確認できたポケモン、環境注目、名前順で表示します。相手チームと同じポケモンも登録できます。同じチーム内の重複だけ選択できません。`;
  renderPokemonOptions("");
  if(typeof dialog.showModal==="function")dialog.showModal();else dialog.setAttribute("open","");
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
    const duplicateWithinTeam=currentRoster.some((existing,i)=>i!==dialogTarget.index&&POKEMON[existing]?.dex===p.dex);
    button.disabled=duplicateWithinTeam;
    button.innerHTML=`<span class="pokemon-rank">${p.rank?`#${p.rank}`:(p.metaFeatured?"注目":"—")}</span>${pokemonAvatar(p,"option")}<span class="pokemon-option-main"><strong>${escapeHtml(p.name)}</strong>${p.metaFeatured?'<span class="meta-inline">環境注目</span>':""}<small>CP ${p.cp}・${escapeHtml(moveLabel(p))}</small><span class="type-row">${typeChips(p.types)}</span></span>${duplicateWithinTeam?'<span class="duplicate-label">このチームで登録済み</span>':""}`;
    return button;
  }));
  if(!ids.length){const empty=document.createElement("p");empty.className="empty-state";empty.textContent="該当するポケモンが見つかりません。";root.appendChild(empty)}
}
function chooseDialogPokemon(id){
  if(!dialogTarget||!POKEMON[id])return;
  const key=dialogTarget.side==="player"?"playerRoster":"opponentRoster";
  state[key][dialogTarget.index]=id;
  state[buildsKey(dialogTarget.side)][dialogTarget.index]=null;
  state.playerPicks=[];state.opponentPicks=[];state.opponentSelectionMeta=null;state.opponentRevealed=false;state.lastRecommendations=null;state.quickBattleNumber=0;clearAnalysisCaches();
  saveState();renderAll();
  document.getElementById("pokemonDialog").close();dialogTarget=null;
}

function renderPickGrid(id,roster,picks,side){
  const root=document.getElementById(id);
  root.replaceChildren(...roster.map((pid,index)=>{
    const p=effectivePokemon(side,index),button=document.createElement("button");button.type="button";button.className="pick-card";button.dataset.side=side;button.dataset.index=String(index);
    const order=picks.indexOf(index);if(order>=0)button.classList.add("is-picked");
    button.innerHTML=`<div class="pick-card-title">${pokemonAvatar(p,"pick")}<span><strong>${escapeHtml(p.name)}</strong><small>CP ${p.cp}・Lv ${p.level}・個体値 ${p.atkIV}/${p.defIV}/${p.hpIV}</small></span></div><span class="type-row">${typeChips(p.types)}</span><small>${escapeHtml(moveLabel(p))}</small>`;
    if(order>=0){const badge=document.createElement("span");badge.className="pick-order";badge.textContent=String(order+1);button.appendChild(badge)}
    return button;
  }));
}
function renderPublicRosterGrid(id,roster,side){
  const root=document.getElementById(id);if(!root)return;
  root.replaceChildren(...roster.map((pid,index)=>{
    const p=effectivePokemon(side,index),card=document.createElement("article");card.className="public-pick-card";
    card.innerHTML=`<div class="pick-card-title">${pokemonAvatar(p,"pick")}<span><strong>${escapeHtml(p.name)}</strong><small>CP ${p.cp}・Lv ${p.level}・個体値 ${p.atkIV}/${p.defIV}/${p.hpIV}</small></span></div><span class="type-row">${typeChips(p.types)}</span><small>${escapeHtml(moveLabel(p))}</small>`;
    return card;
  }));
}
function renderSelection(){
  renderPickGrid("playerSelection",state.playerRoster,state.playerPicks,"player");
  renderPublicRosterGrid("opponentSelectionPreview",state.opponentRoster,"opponent");
  document.getElementById("playerSelectionSummary").textContent=selectionNames(state.playerRoster,state.playerPicks)||"未選択";
  renderOpponentAiPanel();
  if(!opponentSelectionIsFresh()&&!opponentAiComputing)ensureOpponentSelection();
}
function selectionNames(roster,picks){return picks.map(i=>POKEMON[roster[i]]?.name||"?").join(" → ")}
function togglePick(side,index){
  if(side!=="player")return;
  const arr=state.playerPicks,at=arr.indexOf(index);
  if(at>=0)arr.splice(at,1);else if(arr.length<3)arr.push(index);
  state.opponentRevealed=false;state.lastRecommendations=null;state.quickBattleNumber=0;saveState();renderSelection();renderBattleLineups();renderMatch();
}
function renderLineup(id,roster,picks){const root=document.getElementById(id);const items=picks.map((i,j)=>{const span=document.createElement("span");span.className="lineup-pill";span.textContent=`${j===0?"先発":j===1?"引き先候補":"締め役"} ${POKEMON[roster[i]]?.name||"?"}`;return span});root.replaceChildren(...items);if(!items.length)root.textContent="未確定"}
function renderHiddenLineup(id){const root=document.getElementById(id);root.replaceChildren();const span=document.createElement("span");span.className="lineup-pill lineup-hidden";span.textContent="選出確定まで非公開";root.appendChild(span)}
function renderBattleLineups(){
  renderLineup("battlePlayerLineup",state.playerRoster,state.playerPicks);
  if(state.opponentRevealed)renderLineup("battleOpponentLineup",state.opponentRoster,state.opponentPicks);else renderHiddenLineup("battleOpponentLineup");
  renderOpponentBattleReason();
}

function showResult(result,batch=null){
  const box=document.getElementById("battleResult");box.className=`result-card ${result.winner==="player"?"win":"loss"}`;
  if(batch){
    box.innerHTML=`<h3>100試合の勝率分析</h3><p>あなたの推定勝率 <strong>${batch.playerPct.toFixed(1)}%</strong>（${batch.playerWins}勝 / ${batch.opponentWins}敗）</p><div class="metric-row"><div class="metric"><strong>${batch.avgSeconds.toFixed(1)}秒</strong><span>平均時間</span></div><div class="metric"><strong>${batch.avgAlive.toFixed(2)}</strong><span>平均残存数</span></div><div class="metric"><strong>${batch.seed}</strong><span>開始シード</span></div></div><p class="result-note">AI判断と確率効果を変えて100回実行した推定値です。</p>`;return;
  }
  const battleLabel=result.quickBattleNumber?`第${result.quickBattleNumber}試合・乱数シード ${result.seed}`:`乱数シード ${result.seed??"—"}`;
  box.innerHTML=`<h3>${result.winner==="player"?"あなたの勝利":"相手の勝利"}</h3><p>${battleLabel}<br>${result.reason==="KO"?"3体を倒して決着":"時間切れ判定"}・${result.seconds.toFixed(1)}秒</p><div class="metric-row"><div class="metric"><strong>${result.player.alive} - ${result.opponent.alive}</strong><span>残存ポケモン</span></div><div class="metric"><strong>${result.player.shields} - ${result.opponent.shields}</strong><span>残りシールド</span></div><div class="metric"><strong>${result.turns}</strong><span>経過ターン</span></div></div>`;
  const log=document.getElementById("battleLog");log.replaceChildren(...result.log.map(text=>{const li=document.createElement("li");li.textContent=text;return li}));if(!result.log.length){const li=document.createElement("li");li.textContent="ログなし";log.appendChild(li)}
}
function validPicks(){return state.playerPicks.length===3&&state.opponentPicks.length===3}
function readyForBattle(){return validPicks()&&state.opponentRevealed}
function currentSeed(){return Number(document.getElementById("seedInput").value)||20260719}
function currentStyle(){return document.getElementById("aiStyle").value}
function updateRunBattleButton(){
  const button=document.getElementById("runBattle");if(!button)return;
  const next=Math.max(0,Math.trunc(Number(state.quickBattleNumber)||0))+1;
  button.textContent=`第${next}試合を自動対戦`;
}
function runOne(record=false){
  if(!readyForBattle()){switchTab("selection");document.getElementById("selectionMessage").textContent="自分の3体を確定し、相手AIの選出を公開してください。";return null}
  const quickBattleNumber=record?0:Math.max(0,Math.trunc(Number(state.quickBattleNumber)||0))+1;
  const seed=record?currentSeed()+state.gameNumber-1:currentSeed()+quickBattleNumber-1;
  const result=simulateBattle(state.playerRoster,state.playerPicks,state.opponentRoster,state.opponentPicks,seed,currentStyle(),true,state.playerBuilds,state.opponentBuilds);
  result.seed=seed;
  if(!record){result.quickBattleNumber=quickBattleNumber;state.quickBattleNumber=quickBattleNumber}
  state.lastBattle=result;saveState();showResult(result);updateRunBattleButton();if(record)recordSimulatedWinner(result);return result;
}
function runBatch(){
  if(!readyForBattle()){switchTab("selection");document.getElementById("selectionMessage").textContent="自分の3体を確定し、相手AIの選出を公開してください。";return}
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
function uniqueLines(lines){
  const seen=new Set(),out=[];
  for(const line of lines){const key=line.join(",");if(seen.has(key))continue;seen.add(key);out.push(line)}
  return out;
}
function opponentSamplesFor(_line,opponentLines){return opponentLines}
function simulateLineEstimate(line,opponentLines,seed,style,repeats=3){
  let wins=0,losses=0,aliveSum=0,secondsSum=0;
  const lines=opponentLines.length?opponentLines:lineupPermutations();
  for(let oi=0;oi<lines.length;oi++){
    for(let repeat=0;repeat<repeats;repeat++){
      const battleSeed=(seed+oi*1009+repeat*7919)>>>0;
      const result=simulateBattle(state.playerRoster,line,state.opponentRoster,lines[oi],battleSeed,style,false,state.playerBuilds,state.opponentBuilds);
      if(result.winner==="player")wins++;else losses++;
      aliveSum+=result.player.alive;secondsSum+=result.seconds;
    }
  }
  const total=wins+losses;
  return {winPct:total?wins/total*100:0,wins,losses,total,avgAlive:total?aliveSum/total:0,avgSeconds:total?secondsSum/total:0,opponentLineCount:lines.length,repeats,weighting:"equal"};
}

const DUEL_CACHE=new Map();
const OPPONENT_DUEL_CACHE=new Map();
const OPPONENT_ROLE_CACHE=new Map();
function clearAnalysisCaches(){DUEL_CACHE.clear();OPPONENT_DUEL_CACHE.clear();OPPONENT_ROLE_CACHE.clear()}
function buildCacheSignature(roster,index,builds){
  const id=roster[index],b=normalizeBuild(POKEMON[id],builds?.[index]);
  return [id,b.level,b.atkIV,b.defIV,b.hpIV,b.fast,...b.charged].join(":");
}
function stringHash(value){let h=2166136261;for(const ch of String(value)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function summarizeDuel(outcomes,perspective="player"){
  const wins=outcomes.filter(x=>x.winner===perspective).length;
  const losses=outcomes.length-wins;
  const equal=outcomes.filter(x=>x.playerShields===x.opponentShields);
  const equalWins=equal.filter(x=>x.winner===perspective).length;
  const ownField=perspective==="player"?"playerShields":"opponentShields";
  const otherField=perspective==="player"?"opponentShields":"playerShields";
  const shieldDown=outcomes.filter(x=>x[ownField]<x[otherField]);
  const shieldDownWins=shieldDown.filter(x=>x.winner===perspective).length;
  const shieldUp=outcomes.filter(x=>x[ownField]>x[otherField]);
  const shieldUpWins=shieldUp.filter(x=>x.winner===perspective).length;
  const avgMargin=outcomes.reduce((sum,x)=>sum+(perspective==="player"?x.margin:-x.margin),0)/outcomes.length;
  const score=(wins-4.5)/4.5+((equalWins-1.5)/1.5)*.35+(shieldDownWins/Math.max(1,shieldDown.length))*.18+avgMargin*.3;
  return {wins,losses,equalWins,equalLosses:equal.length-equalWins,shieldDownWins,shieldDownTotal:shieldDown.length,shieldUpWins,shieldUpTotal:shieldUp.length,avgMargin,score,outcomes,record:`全9条件 ${wins}勝${losses}敗（同数${equalWins}勝${equal.length-equalWins}敗）`};
}
function headToHeadBySlots(playerIndex,opponentIndex){
  const pSig=buildCacheSignature(state.playerRoster,playerIndex,state.playerBuilds);
  const oSig=buildCacheSignature(state.opponentRoster,opponentIndex,state.opponentBuilds);
  const key=`${pSig}|${oSig}|shield9`;
  if(DUEL_CACHE.has(key))return DUEL_CACHE.get(key);
  const outcomes=[];
  for(const playerShields of [0,1,2]){
    for(const opponentShields of [0,1,2]){
      const seed=stringHash(`${key}|${playerShields}|${opponentShields}`);
      const result=simulateBattle(state.playerRoster,[playerIndex],state.opponentRoster,[opponentIndex],seed,"balanced",false,state.playerBuilds,state.opponentBuilds,{playerShields,opponentShields});
      const margin=clamp(result.player.hp-result.opponent.hp,-1,1);
      outcomes.push({playerShields,opponentShields,winner:result.winner,margin,seconds:result.seconds});
    }
  }
  const result=summarizeDuel(outcomes,"player");
  DUEL_CACHE.set(key,result);return result;
}
function duelIsStrong(duel){return duel.wins>=6&&duel.equalWins>=2}
function duelIsHard(duel){return duel.wins<=3&&duel.equalWins<=1}
function matchupGrade(duel){
  if(duel.wins>=8&&duel.equalWins>=2)return {label:"かなり有利",cls:"great"};
  if(duelIsStrong(duel))return {label:"有利",cls:"good"};
  if(duel.wins>=4)return {label:"互角寄り",cls:"bad"};
  if(duel.wins>=2)return {label:"不利",cls:"bad"};
  return {label:"かなり不利",cls:"danger"};
}
function shieldMatrixText(duel,perspective="player"){
  const ownField=perspective==="player"?"playerShields":"opponentShields";
  const otherField=perspective==="player"?"opponentShields":"playerShields";
  const winner=perspective;
  const ownLabel=perspective==="player"?"自":"AI";
  const otherLabel=perspective==="player"?"相手":"あなた";
  const rows=[0,1,2].map(own=>{
    const marks=[0,1,2].map(other=>duel.outcomes.find(x=>x[ownField]===own&&x[otherField]===other)?.winner===winner?"○":"×").join("");
    return `${ownLabel}${own}枚:${marks}`;
  });
  return `${rows.join(" / ")}（列＝${otherLabel}0・1・2枚）`;
}
function shieldRecord(duel){return shieldMatrixText(duel,"player")}

function opponentSelectionSignature(){
  const sideSig=side=>state[rosterKey(side)].map((id,index)=>buildCacheSignature(state[rosterKey(side)],index,state[buildsKey(side)])).join("|");
  return `${sideSig("player")}::${sideSig("opponent")}`;
}
function opponentSelectionIsFresh(){
  return Boolean(state.opponentSelectionMeta?.version===72&&state.opponentSelectionMeta?.signature===opponentSelectionSignature()&&state.opponentPicks.length===3);
}
function opponentDuel(opponentIndex,playerIndex){
  const key=`${playerIndex}:${opponentIndex}:shield9`;
  if(OPPONENT_DUEL_CACHE.has(key))return OPPONENT_DUEL_CACHE.get(key);
  const base=headToHeadBySlots(playerIndex,opponentIndex);
  const result=summarizeDuel(base.outcomes,"opponent");
  OPPONENT_DUEL_CACHE.set(key,result);return result;
}
function opponentShieldRecord(duel){return shieldMatrixText(duel,"opponent")}
function firstChargedTurns(mon,move){
  const fast=fastObject(mon);
  if(!fast||!move||safeNumber(fast.energy)<=0)return Infinity;
  return Math.ceil(move.energy/fast.energy)*fast.turns;
}
function fastestChargedProfile(mon){
  const moves=chargedObjects(mon).map(move=>({move,turns:firstChargedTurns(mon,move)})).sort((a,b)=>a.turns-b.turns||a.move.energy-b.move.energy);
  return moves[0]||null;
}
function bestPressureMove(attacker,defender){
  return chargedObjects(attacker).map(move=>({move,damage:calcDamage(attacker,defender,move),eff:effectiveness(move.type,defender.types),turns:firstChargedTurns(attacker,move)})).sort((a,b)=>(b.damage/Math.max(1,b.move.energy))-(a.damage/Math.max(1,a.move.energy))||b.damage-a.damage)[0]||null;
}
function moveEffectText(effect){
  if(!effect)return "";
  const stat=effect.stat==="attack"?"攻撃":"防御";
  const who=effect.target==="opponent"?"相手":"自分";
  return `${who}の${stat}${effect.delta>0?"上昇":"低下"}`;
}
function opponentMatchupReasons(opponentIndex,playerIndex){
  const attacker=effectivePokemon("opponent",opponentIndex),defender=effectivePokemon("player",playerIndex);
  if(!attacker||!defender)return [];
  const reasons=[],fast=fastObject(attacker),playerFast=fastObject(defender),pressure=bestPressureMove(attacker,defender);
  const fastEff=effectiveness(fast.type,defender.types),incomingFastEff=effectiveness(playerFast.type,attacker.types);
  if(fastEff>1.01)reasons.push(`通常技「${fast.name}」が効果抜群`);
  if(pressure?.eff>1.01)reasons.push(`ゲージ技「${pressure.move.name}」が効果抜群`);
  if(Number.isFinite(pressure?.turns))reasons.push(`「${pressure.move.name}」まで約${pressure.turns}ターン（${(pressure.turns*TURN_MS/1000).toFixed(1)}秒）`);
  if(incomingFastEff<.99)reasons.push(`${defender.name}の通常技「${playerFast.name}」を軽減`);
  const resistedCharged=chargedObjects(defender).filter(move=>effectiveness(move.type,attacker.types)<.99);
  if(resistedCharged.length)reasons.push(`${defender.name}の「${resistedCharged.slice(0,2).map(x=>x.name).join("・")}」を軽減`);
  if(attackStat(attacker)>attackStat(defender)*1.01)reasons.push("同時にゲージ技を押した場合はCMPを取りやすい");
  const effectMove=chargedObjects(attacker).find(move=>(move.effects||[]).length);
  if(effectMove)reasons.push(`「${effectMove.name}」の${moveEffectText(effectMove.effects[0])}も勝敗へ影響`);
  if(attacker.shadow)reasons.push("シャドウ補正で与ダメージが高い");
  if(!reasons.length)reasons.push("タイプだけでなく、技回転・耐久・実ダメージの総合で有利");
  return reasons.slice(0,4);
}
function opponentRoleMetrics(opponentIndex){
  if(OPPONENT_ROLE_CACHE.has(opponentIndex))return OPPONENT_ROLE_CACHE.get(opponentIndex);
  const mon=effectivePokemon("opponent",opponentIndex);
  const duels=state.playerRoster.map((_,playerIndex)=>({playerIndex,duel:opponentDuel(opponentIndex,playerIndex)}));
  const favorable=duels.filter(x=>duelIsStrong(x.duel)),neutral=duels.filter(x=>!duelIsStrong(x.duel)&&!duelIsHard(x.duel)),hard=duels.filter(x=>duelIsHard(x.duel));
  const zeroShieldWins=duels.filter(x=>x.duel.outcomes.find(o=>o.playerShields===0&&o.opponentShields===0)?.winner==="opponent");
  const oneShieldWins=duels.filter(x=>x.duel.outcomes.find(o=>o.playerShields===1&&o.opponentShields===1)?.winner==="opponent");
  const shieldDownWins=duels.reduce((sum,x)=>sum+x.duel.shieldDownWins,0);
  const avgScore=duels.reduce((sum,x)=>sum+x.duel.score,0)/duels.length;
  const fastest=fastestChargedProfile(mon);
  const speedBonus=Number.isFinite(fastest?.turns)?Math.max(0,(24-fastest.turns)/24):0;
  const result={
    opponentIndex,mon,duels,favorable,neutral,hard,zeroShieldWins,oneShieldWins,shieldDownWins,avgScore,fastest,
    leadScore:favorable.length*1.45+neutral.length*.25-hard.length*1.4+avgScore,
    safeScore:favorable.length*1.7+neutral.length*.65-hard.length*1.75+avgScore+speedBonus+shieldDownWins*.08,
    closerScore:zeroShieldWins.length*1.7+oneShieldWins.length*.55-hard.length*.55+avgScore*.6
  };
  OPPONENT_ROLE_CACHE.set(opponentIndex,result);return result;
}
function orderOpponentLine(line){
  const lead=line[0],a=opponentRoleMetrics(line[1]),b=opponentRoleMetrics(line[2]);
  if(a.safeScore>b.safeScore)return [lead,line[1],line[2]];
  if(b.safeScore>a.safeScore)return [lead,line[2],line[1]];
  return a.closerScore>=b.closerScore?[lead,line[2],line[1]]:[lead,line[1],line[2]];
}
function opponentLineScreenScore(line,playerLines){
  const ordered=orderOpponentLine(line);let total=0;
  for(const pLine of playerLines){
    const lead=opponentDuel(ordered[0],pLine[0]).score;
    const coverage=pLine.reduce((sum,playerIndex)=>sum+Math.max(...ordered.map(opponentIndex=>opponentDuel(opponentIndex,playerIndex).score)),0)/pLine.length;
    const pressure=ordered.reduce((sum,opponentIndex)=>sum+Math.max(...pLine.map(playerIndex=>opponentDuel(opponentIndex,playerIndex).score)),0)/ordered.length;
    total+=lead*1.2+coverage+pressure*.35;
  }
  const safe=opponentRoleMetrics(ordered[1]),closer=opponentRoleMetrics(ordered[2]);
  return total/playerLines.length+safe.safeScore*.05+closer.closerScore*.04;
}
function simulateOpponentLineEstimate(opponentLine,playerLines,seed,style,repeats=2){
  let wins=0,losses=0,aliveSum=0,secondsSum=0;
  for(let pi=0;pi<playerLines.length;pi++){
    for(let repeat=0;repeat<repeats;repeat++){
      const battleSeed=(seed+pi*1013+repeat*7937)>>>0;
      const result=simulateBattle(state.playerRoster,playerLines[pi],state.opponentRoster,opponentLine,battleSeed,style,false,state.playerBuilds,state.opponentBuilds);
      if(result.winner==="opponent")wins++;else losses++;
      aliveSum+=result.opponent.alive;secondsSum+=result.seconds;
    }
  }
  const total=wins+losses;
  return {winPct:total?wins/total*100:0,wins,losses,total,avgAlive:total?aliveSum/total:0,avgSeconds:total?secondsSum/total:0,playerLineCount:playerLines.length,repeats};
}
function opponentSelectionAnalysis(line){
  const roleNames=["先発","引き先候補","締め役"];
  const members=line.map((opponentIndex,roleIndex)=>{
    const metrics=opponentRoleMetrics(opponentIndex),name=metrics.mon.name;
    const strong=metrics.duels.filter(x=>duelIsStrong(x.duel)).sort((a,b)=>b.duel.score-a.duel.score).map(x=>({playerIndex:x.playerIndex,player:POKEMON[state.playerRoster[x.playerIndex]].name,duel:x.duel,reasons:opponentMatchupReasons(opponentIndex,x.playerIndex)}));
    const weak=metrics.duels.filter(x=>duelIsHard(x.duel)).sort((a,b)=>a.duel.score-b.duel.score).map(x=>({playerIndex:x.playerIndex,player:POKEMON[state.playerRoster[x.playerIndex]].name,duel:x.duel}));
    let roleReason="";
    if(roleIndex===0){
      roleReason=`想定初手6体に対して、全9シールド条件で安定して有利${metrics.favorable.length}・互角寄り${metrics.neutral.length}・明確な不利${metrics.hard.length}。初手対面の平均評価が最も高い候補です。`;
    }else if(roleIndex===1){
      const fastText=metrics.fastest?`最速は「${metrics.fastest.move.name}」まで約${metrics.fastest.turns}ターン。`:"";
      roleReason=`6体中${metrics.favorable.length}体へ全9条件で安定して有利、${metrics.neutral.length}体へ勝ち筋があり、9条件で明確に不利な相手は${metrics.hard.length}体。${fastText}交代後に追われても技を返しやすいため引き先候補です。`;
    }else{
      roleReason=`シールド0枚同士で${metrics.zeroShieldWins.length}/6体、1枚同士で${metrics.oneShieldWins.length}/6体に勝利。さらにシールド不利条件でも合計${metrics.shieldDownWins}勝しており、終盤のゲージ技圧力と残存HPを活かしやすいため締め役です。`;
    }
    return {opponentIndex,roleIndex,role:roleNames[roleIndex],name,metrics,strong,weak,roleReason};
  });
  const coverage=state.playerRoster.map((pid,playerIndex)=>{
    const candidates=line.map(opponentIndex=>({opponentIndex,duel:opponentDuel(opponentIndex,playerIndex)})).sort((a,b)=>b.duel.score-a.duel.score);
    const best=candidates[0],solid=candidates.filter(x=>duelIsStrong(x.duel));
    return {playerIndex,player:POKEMON[pid].name,bestOpponentIndex:best.opponentIndex,bestOpponent:POKEMON[state.opponentRoster[best.opponentIndex]].name,duel:best.duel,solid,reasons:opponentMatchupReasons(best.opponentIndex,playerIndex)};
  });
  const heavy=coverage.filter(x=>x.solid.length===0);
  const narrow=coverage.filter(x=>x.solid.length===1);
  const warnings=[];
  if(heavy.length)warnings.push(`${heavy.map(x=>x.player).join("・")}は、選出した3体の誰でも全9シールド条件で6勝以上かつ同数2勝以上を取れないため、相手AI側の重いポケモンです。`);
  if(narrow.length)warnings.push(`${narrow.slice(0,3).map(x=>`${x.player}への明確な回答は${POKEMON[state.opponentRoster[x.solid[0].opponentIndex]].name}だけ`).join("、")}。回答役を先に失うと崩れます。`);
  if(!warnings.length)warnings.push("あなたの6体すべてに、全9シールド条件で安定して勝てる回答を1体以上確保しています。");
  return {members,coverage,heavy,narrow,warnings};
}
function computeOpponentSelection(){
  OPPONENT_DUEL_CACHE.clear();OPPONENT_ROLE_CACHE.clear();
  const playerLines=lineupPermutations(),opponentLines=lineupPermutations(),seed=stringHash(opponentSelectionSignature()),style="balanced";
  const screened=opponentLines.map(line=>({line:orderOpponentLine(line),screenScore:opponentLineScreenScore(line,playerLines)})).sort((a,b)=>b.screenScore-a.screenScore);
  const candidates=uniqueLines(screened.map(x=>x.line)).slice(0,6);
  const validated=candidates.map((line,index)=>({line,...simulateOpponentLineEstimate(line,playerLines,seed+index*30001,style,2),analysis:opponentSelectionAnalysis(line)})).sort((a,b)=>b.winPct-a.winPct||b.avgAlive-a.avgAlive);
  const chosen=validated[0];
  return {version:72,signature:opponentSelectionSignature(),createdAt:Date.now(),line:chosen.line,winPct:chosen.winPct,wins:chosen.wins,losses:chosen.losses,total:chosen.total,playerLineCount:chosen.playerLineCount,repeats:chosen.repeats,avgAlive:chosen.avgAlive,analysis:chosen.analysis,alternatives:validated.slice(1,3).map(x=>({line:x.line,winPct:x.winPct,wins:x.wins,losses:x.losses}))};
}
function ensureOpponentSelection(force=false,onReady=null){
  if(!force&&opponentSelectionIsFresh()){if(typeof onReady==="function")onReady();return}
  if(opponentAiComputing)return;
  opponentAiComputing=true;renderOpponentAiPanel();
  setTimeout(()=>{
    let success=false;
    try{
      const meta=computeOpponentSelection();
      state.opponentSelectionMeta=meta;state.opponentPicks=[...meta.line];state.opponentRevealed=false;saveState();success=true;
    }catch(error){
      console.error(error);state.opponentPicks=[];state.opponentSelectionMeta=null;
      const message=document.getElementById("selectionMessage");if(message)message.textContent="相手AIの選出計算に失敗しました。6体や技設定を確認してください。";
    }finally{
      opponentAiComputing=false;renderSelection();renderBattleLineups();renderMatch();if(success&&typeof onReady==="function")onReady();
    }
  },40);
}
function opponentAnalysisHtml(meta,compact=false){
  const a=meta.analysis;
  const lineup=`<div class="ai-lineup">${meta.line.map((index,i)=>`<div class="ai-lineup-mon"><span>${["先発","引き先候補","締め役"][i]}</span>${pokemonAvatar(effectivePokemon("opponent",index),"pick")}<strong>${escapeHtml(POKEMON[state.opponentRoster[index]].name)}</strong></div>`).join("")}</div>`;
  const roles=a.members.map(member=>`<article class="ai-role-card"><div class="ai-role-head"><span>${escapeHtml(member.role)}</span><strong>${escapeHtml(member.name)}</strong></div><p>${escapeHtml(member.roleReason)}</p><div class="ai-targets"><b>刺さる相手</b>${member.strong.length?member.strong.slice(0,4).map(target=>`<div><strong>${escapeHtml(target.player)}</strong><span>${escapeHtml(target.duel.record)} / ${escapeHtml(opponentShieldRecord(target.duel))}</span><small>${escapeHtml(target.reasons.join("。"))}</small></div>`).join(""):'<p class="muted">全9シールド条件で安定して刺さる相手はいません。</p>'}</div></article>`).join("");
  const coverage=`<div class="coverage-board ai-coverage"><h4>あなたの6体への相手AIの回答</h4>${a.coverage.map(row=>`<div class="coverage-row"><span>${escapeHtml(row.player)}</span><span class="coverage-arrow">←</span><strong>${escapeHtml(row.bestOpponent)}</strong><em class="${duelIsStrong(row.duel)?"matchup-great":duelIsHard(row.duel)?"matchup-danger":"matchup-bad"}">${duelIsStrong(row.duel)?"相手有利":duelIsHard(row.duel)?"重い":"互角寄り"}<small>${escapeHtml(opponentShieldRecord(row.duel))}</small></em></div>`).join("")}</div>`;
  const warnings=`<section class="coach-section heavy-section"><h4>相手AI側の警戒点</h4><ul>${a.warnings.map(x=>`<li>${escapeHtml(x)}</li>`).join("")}</ul></section>`;
  const alternatives=meta.alternatives?.length?`<details class="ai-alternatives"><summary>次点の相手選出</summary>${meta.alternatives.map((alt,i)=>`<p>#${i+2} ${alt.line.map((index,j)=>`${j===0?"先発":"控え"}${POKEMON[state.opponentRoster[index]].name}`).join(" / ")}：相手側推定勝率 ${alt.winPct.toFixed(1)}%</p>`).join("")}</details>`:"";
  const basis=`<div class="simulation-basis"><strong>相手側 ${meta.wins}勝 ${meta.losses}敗 / ${meta.total}試合（${meta.winPct.toFixed(1)}%）</strong><span>あなたの60選出を等確率とし、各2乱数で検証。1対1は全9シールド条件で6勝以上かつ同数2勝以上を「刺さる」と判定し、あなたが現在選んだ3体は参照していません。</span></div>`;
  return `${basis}${lineup}${compact?coverage:`${roles}${coverage}${warnings}${alternatives}`}`;
}
function renderOpponentAiPanel(){
  const status=document.getElementById("opponentAiStatus"),summary=document.getElementById("opponentSelectionSummary"),content=document.getElementById("opponentAiContent");
  if(!status||!summary||!content)return;
  if(opponentAiComputing||!opponentSelectionIsFresh()){
    status.textContent="分析中";summary.textContent="60通りを分析中";content.innerHTML='<div class="analysis-loading"><strong>相手AIが選出中…</strong><span>あなたの6体だけを見て、36対面×9シールド条件・技回転・引き先性能を比較しています。</span></div>';return;
  }
  const meta=state.opponentSelectionMeta;
  if(!state.opponentRevealed){
    status.textContent="選出済み・非公開";summary.textContent="AI選出済み（非公開）";
    content.innerHTML=`<div class="ai-locked"><div class="ai-lock-icon">●</div><strong>相手AIは3体を確定済みです</strong><p>あなたの選出確定後に、3体と選出理由を公開します。現在選んでいる3体はAIへ渡していません。</p><small>評価根拠：あなたの60選出 × 2乱数 / 36対面をシールド0〜2枚の全9通りで検証</small></div>`;return;
  }
  status.textContent="選出公開";summary.textContent=selectionNames(state.opponentRoster,state.opponentPicks);
  content.innerHTML=opponentAnalysisHtml(meta,false);
}
function renderOpponentBattleReason(){
  const root=document.getElementById("opponentBattleReason");if(!root)return;
  if(!state.opponentRevealed||!opponentSelectionIsFresh()){root.hidden=true;root.innerHTML="";return}
  root.hidden=false;root.innerHTML=`<div class="recommendation-heading"><div><p class="step">OPPONENT PICK LOGIC</p><h3>相手AIがこの3体を選んだ理由</h3></div><span class="status-chip">こちらの6体のみ参照</span></div>${opponentAnalysisHtml(state.opponentSelectionMeta,false)}`;
}
function lineupScreenScore(line,opponentLines){
  let total=0;
  for(const oLine of opponentLines){
    const lead=headToHeadBySlots(line[0],oLine[0]).score;
    const opponentCoverage=oLine.reduce((sum,opponentIndex)=>sum+Math.max(...line.map(playerIndex=>headToHeadBySlots(playerIndex,opponentIndex).score)),0)/oLine.length;
    const playerPressure=line.reduce((sum,playerIndex)=>sum+Math.max(...oLine.map(opponentIndex=>headToHeadBySlots(playerIndex,opponentIndex).score)),0)/line.length;
    total+=lead*1.15+opponentCoverage+playerPressure*.35;
  }
  return total/opponentLines.length;
}
function recommendationAnalysis(line){
  const rows=state.opponentRoster.map((oid,opponentIndex)=>{
    const candidates=line.map(playerIndex=>({playerIndex,duel:headToHeadBySlots(playerIndex,opponentIndex)})).sort((a,b)=>b.duel.score-a.duel.score);
    const best=candidates[0],grade=matchupGrade(best.duel);
    const solidAnswers=candidates.filter(x=>duelIsStrong(x.duel));
    return {opponentIndex,opponent:POKEMON[oid].name,playerIndex:best.playerIndex,player:POKEMON[state.playerRoster[best.playerIndex]].name,score:best.duel.score,grade,duel:best.duel,record:shieldRecord(best.duel),all:candidates,solidAnswers};
  });
  const memberCoverage=line.map(playerIndex=>{
    const player=POKEMON[state.playerRoster[playerIndex]].name;
    const strong=state.opponentRoster.map((oid,opponentIndex)=>({opponent:POKEMON[oid].name,duel:headToHeadBySlots(playerIndex,opponentIndex)})).filter(x=>duelIsStrong(x.duel)).sort((a,b)=>b.duel.score-a.duel.score);
    const weak=state.opponentRoster.map((oid,opponentIndex)=>({opponent:POKEMON[oid].name,duel:headToHeadBySlots(playerIndex,opponentIndex)})).filter(x=>duelIsHard(x.duel)).sort((a,b)=>a.duel.score-b.duel.score);
    return {playerIndex,player,strong,weak};
  });
  const heavy=rows.filter(x=>x.solidAnswers.length===0).sort((a,b)=>a.score-b.score);
  const narrow=rows.filter(x=>x.solidAnswers.length===1).sort((a,b)=>a.score-b.score);
  const leadIndex=line[0],leadName=POKEMON[state.playerRoster[leadIndex]].name;
  const leadBad=rows.filter(x=>duelIsHard(headToHeadBySlots(leadIndex,x.opponentIndex))).map(x=>x.opponent);
  const warnings=[];
  if(heavy.length)warnings.push(`${heavy.map(x=>x.opponent).join("・")}は、この3体の誰を当てても全9シールド条件で安定して勝てないため重いです。`);
  if(narrow.length)warnings.push(`${narrow.slice(0,3).map(x=>`${x.opponent}は${x.solidAnswers[0] ? POKEMON[state.playerRoster[x.solidAnswers[0].playerIndex]].name : x.player}だけが明確な回答`).join("、")}。そのポケモンを別対面で消耗すると崩れやすいです。`);
  if(leadBad.length)warnings.push(`先発${leadName}は${leadBad.slice(0,4).join("・")}に全9条件で明確に不利なので、初手対面では即引き候補です。`);
  if(!warnings.length)warnings.push("相手6体すべてに全9シールド条件で安定した回答があり、明確な穴は小さい選出です。");
  return {rows,memberCoverage,heavy,narrow,warnings};
}
function renderRecommendations(results,currentEstimate=null){
  const panel=document.getElementById("recommendationPanel");panel.hidden=false;
  panel.innerHTML=`<div class="recommendation-heading"><div><p class="step">SELECTION COACH</p><h3>勝ち筋が太い選出候補 ✨</h3></div><span class="status-chip">全60候補を比較</span></div><p class="recommendation-intro">あなたの60通りを、各1対1対面のシールド0〜2枚×0〜2枚＝全9条件で一次比較し、上位候補を相手の60通り（先発を区別、控え順は同一）へ各3回、合計180試合で再検証しています。「刺さる」は全9条件で6勝以上かつ同数シールドで2勝以上を基準とします。表示％は大会の実使用率ではありません。</p>`;
  const grid=document.createElement("div");grid.className="recommendation-grid";
  results.forEach((result,rank)=>{
    const card=document.createElement("article");card.className="recommendation-card";
    const delta=currentEstimate==null?null:result.winPct-currentEstimate;
    const analysis=result.analysis||recommendationAnalysis(result.line);
    const heavyHtml=analysis.heavy.length
      ? analysis.heavy.slice(0,3).map(x=>`<li><strong>${escapeHtml(x.opponent)}</strong>：最善回答は${escapeHtml(x.player)}でも ${escapeHtml(x.record)}（${escapeHtml(x.duel.record)}）</li>`).join("")
      : '<li>相手6体すべてに、全9シールド条件で安定して勝てる回答があります。</li>';
    const coverageHtml=analysis.memberCoverage.map(member=>{
      const targets=member.strong.length?member.strong.map(x=>`${escapeHtml(x.opponent)}（全9条件 ${x.duel.wins}勝${x.duel.losses}敗・同数${x.duel.equalWins}勝）`).join("・"):"明確な有利対面なし";
      return `<div class="member-coverage"><strong>${escapeHtml(member.player)}</strong><span>→ ${targets}</span></div>`;
    }).join("");
    card.innerHTML=`
      <div class="recommendation-top"><span class="recommendation-rank">${rank===0?"👑 BEST":`#${rank+1}`}</span><div class="win-rate"><strong>${result.winPct.toFixed(1)}%</strong><small>全選出等確率の推定勝率</small></div></div>
      <div class="simulation-basis"><strong>${result.wins}勝 ${result.losses}敗 / ${result.total}試合</strong><span>相手${result.opponentLineCount}選出 × ${result.repeats}乱数。実際の使用率による重み付けはしていません。</span></div>
      <div class="recommended-line">${result.line.map((i,j)=>`<span>${j===0?"先発":"控え"} ${escapeHtml(POKEMON[state.playerRoster[i]].name)}</span>`).join("")}</div>
      ${delta==null?"":`<p class="delta ${delta>=0?"positive":"negative"}">現在選出比 ${delta>=0?"+":""}${delta.toFixed(1)}pt</p>`}
      <section class="coach-section"><h4>この3体が刺さる相手</h4><div class="member-coverage-list">${coverageHtml}</div></section>
      <section class="coach-section heavy-section"><h4>この3体で重い相手</h4><ul>${heavyHtml}</ul></section>
      <section class="coach-section"><h4>選出上の注意</h4><ul>${analysis.warnings.map(x=>`<li>${escapeHtml(x)}</li>`).join("")}</ul></section>
      <div class="coverage-board"><h4>相手6体への最善回答</h4>${analysis.rows.map(row=>`<div class="coverage-row"><span>${escapeHtml(row.opponent)}</span><span class="coverage-arrow">←</span><strong>${escapeHtml(row.player)}</strong><em class="matchup-${row.grade.cls}">${row.grade.label}<small>${escapeHtml(row.record)}</small></em></div>`).join("")}</div>
      <button class="apply-recommendation primary-button" data-line="${result.line.join(",")}" type="button">この選出を使う</button>`;
    grid.appendChild(card);
  });
  panel.appendChild(grid);
}
function estimateCurrentAcrossUnknown(seed,style){
  if(state.playerPicks.length!==3)return null;
  return simulateLineEstimate(state.playerPicks,lineupPermutations(),seed+70000,style,3).winPct;
}
function analyzeSelections(){
  const error=validateRosters();if(error){switchTab("roster");document.getElementById("rosterMessage").textContent=error;return}
  const button=document.getElementById("analyzeSelections");button.disabled=true;button.textContent="✨ 全60通りを分析中…";
  const panel=document.getElementById("recommendationPanel");panel.hidden=false;panel.innerHTML='<div class="analysis-loading"><strong>選出を探索中…</strong><span>60候補を対面データで比較し、上位候補を各180試合で再検証しています。</span></div>';
  setTimeout(()=>{
    const playerLines=lineupPermutations(),opponentLines=lineupPermutations(),seed=currentSeed(),style=currentStyle();
    const screened=playerLines.map(line=>({line,screenScore:lineupScreenScore(line,opponentLines)})).sort((a,b)=>b.screenScore-a.screenScore);
    const candidates=uniqueLines([...(state.playerPicks.length===3?[state.playerPicks]:[]),...screened.slice(0,6).map(x=>x.line)]).slice(0,7);
    const validated=candidates.map((line,index)=>({line,...simulateLineEstimate(line,opponentLines,seed+500000+index*20000,style,3),analysis:recommendationAnalysis(line)})).sort((a,b)=>b.winPct-a.winPct||b.avgAlive-a.avgAlive);
    const current=state.playerPicks.length===3?validated.find(x=>x.line.join(",")===state.playerPicks.join(","))?.winPct??estimateCurrentAcrossUnknown(seed,style):null;
    const top=validated.slice(0,3);
    state.lastRecommendations={createdAt:Date.now(),version:72,results:top};saveState();renderRecommendations(top,current);
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
  preview.innerHTML=`<h3>${escapeHtml(p.name)} / CP ${b.cp}</h3><p>Lv ${b.level}・個体値 ${b.atkIV}/${b.defIV}/${b.hpIV}</p><div class="metric-row"><div class="metric"><strong>${b.atk.toFixed(2)}</strong><span>攻撃実数値</span></div><div class="metric"><strong>${b.def.toFixed(2)}</strong><span>防御実数値</span></div><div class="metric"><strong>${b.hp}</strong><span>HP実数値</span></div></div><p class="result-note">${b.valid?"スーパーリーグ上限内です。":"CP1500を超えています。レベルまたは個体値を下げてください。"}</p>`;
}
function saveBuildFromDialog(){
  if(!buildTarget)return;const p=POKEMON[state[rosterKey(buildTarget.side)][buildTarget.index]],raw=readBuildForm(),b=normalizeBuild(p,raw);
  if(!b.valid){document.getElementById("buildMessage").textContent="CP1500を超えているため保存できません。";return}
  state[buildsKey(buildTarget.side)][buildTarget.index]=raw;state.playerPicks=[];state.opponentPicks=[];state.opponentSelectionMeta=null;state.opponentRevealed=false;state.lastRecommendations=null;state.quickBattleNumber=0;clearAnalysisCaches();saveState();renderAll();document.getElementById("buildDialog").close();buildTarget=null;
}
function renderDataLibrary(query=""){
  const d=DATA_INFO.diagnostics||{},q=String(query).trim().toLowerCase();
  document.getElementById("dataCountChip").textContent=`${DATA_INFO.count}体`;
  document.getElementById("dataMetrics").innerHTML=`<div class="metric"><strong>${DATA_INFO.count}</strong><span>収録ポケモン</span></div><div class="metric"><strong>${d.moveCountFast||0}</strong><span>通常技</span></div><div class="metric"><strong>${d.moveCountCharged||0}</strong><span>ゲージ技</span></div>`;
  const ids=META_ORDER.filter(id=>{const p=POKEMON[id],hay=[p.name,p.englishName,...p.types.map(typeName),...p.types,FAST_MOVES[p.fast]?.name,...p.charged.map(x=>CHARGED_MOVES[x]?.name)].join(" ").toLowerCase();return !q||hay.includes(q)}).slice(0,q?DATA_INFO.count:120);
  document.getElementById("dataList").replaceChildren(...ids.map(id=>{const p=POKEMON[id],b=p.rank1,row=document.createElement("article");row.className="data-row";row.innerHTML=`<span class="data-rank">${p.rank?`#${p.rank}<small>PvPoke</small>`:`—<small>順位未検証</small>`}</span>${pokemonAvatar(p,"data")}<div class="data-main"><strong>${escapeHtml(p.name)} ${p.metaFeatured?'<span class="meta-inline">環境注目</span>':""}</strong><small>${typeChips(p.types)} ${escapeHtml(moveLabel(p))}</small></div><div class="data-build">CP ${b.cp}<br>Lv ${b.level} / 個体値 ${b.atkIV}/${b.defIV}/${b.hpIV}</div>`;return row}));
  document.getElementById("dataDiagnostics").innerHTML=`<p><strong>データ元:</strong> ${escapeHtml(DATA_INFO.source)}</p><p><strong>順位:</strong> ${escapeHtml(EMBEDDED.rankLabel||"PvPoke総合順位")}</p><p>${escapeHtml(EMBEDDED.metaNote||"")}</p><p><strong>基準日:</strong> ${new Date(DATA_INFO.updatedAt).toLocaleDateString("ja-JP")}</p><p><strong>収録:</strong> 通常・フォルム ${d.baseForms||0}、シャドウ ${d.shadowForms||0}</p><p><strong>除外:</strong> ${d.excludedCount||0}件${d.excludedCount?`（${(d.excluded||[]).map(x=>`${escapeHtml(x.id)}: ${escapeHtml(x.reason)}`).join(" / ")}）`:"。数値データ不足による除外はありません。"}</p><p>各個体はCP1500以下でSCPが最大となるレベル・個体値を全4096通りから計算しています。攻撃寄り・CMP寄り・手入力にも切替可能です。</p>`;
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
  renderLineup("currentPlayerLineup",state.playerRoster,state.playerPicks);if(state.opponentRevealed)renderLineup("currentOpponentLineup",state.opponentRoster,state.opponentPicks);else renderHiddenLineup("currentOpponentLineup");
  const list=document.getElementById("historyList");list.replaceChildren(...state.history.map(h=>{const li=document.createElement("li");li.textContent=`Game ${h.game}: ${h.winner==="player"?"あなた":"相手"}勝利（${h.seconds.toFixed(1)}秒）`;return li}));
  if(!state.history.length){const li=document.createElement("li");li.textContent="まだ結果はありません。";list.appendChild(li)}
  document.getElementById("simulateGame").disabled=matchFinished();document.getElementById("nextSelection").disabled=matchFinished();
  const msg=document.getElementById("matchMessage");msg.textContent=state.playerScore>=targetWins()?"マッチ終了：あなたの勝利 🎉":state.opponentScore>=targetWins()?"マッチ終了：相手の勝利":"";
}
function resetMatch(){state.playerScore=0;state.opponentScore=0;state.gameNumber=1;state.history=[];state.playerPicks=[];state.opponentPicks=[];state.opponentSelectionMeta=null;state.opponentRevealed=false;state.lastRecommendations=null;saveState();renderSelection();renderMatch();renderBattleLineups();document.getElementById("recommendationPanel").hidden=true}
function resetAll(){if(!confirm("登録・個体値・技・選出・履歴を初期化しますか？"))return;state=defaultState();repairStateRosters();saveState();renderAll();switchTab("roster")}

function switchTab(name){document.querySelectorAll(".tab").forEach(button=>button.classList.toggle("is-active",button.dataset.tab===name));document.querySelectorAll(".panel").forEach(panel=>panel.classList.toggle("is-active",panel.id===name));if(name==="selection")renderSelection();if(name==="battle")renderBattleLineups();if(name==="match")renderMatch();if(name==="data")renderDataLibrary(document.getElementById("dataSearch")?.value||"");window.scrollTo({top:0,behavior:"smooth"})}
function startTimer(){clearInterval(timerId);timerValue=90;updateTimer();timerId=setInterval(()=>{timerValue--;updateTimer();if(timerValue<=0){clearInterval(timerId);timerId=null;document.getElementById("selectionMessage").textContent="選出時間が終了しました。"}},1000)}
function updateTimer(){const el=document.getElementById("timer");el.textContent=timerValue;el.closest(".timer-box").classList.toggle("is-low",timerValue<=15)}
function renderAll(){renderRosters();renderSelection();renderBattleLineups();renderMatch();renderDataLibrary(document.getElementById("dataSearch")?.value||"");updateTimer();updateRunBattleButton();if(state.lastRecommendations?.version===72&&state.lastRecommendations?.results?.length)renderRecommendations(state.lastRecommendations.results,null);else state.lastRecommendations=null}

function applyRecommendation(line){
  const parsed=String(line||"").split(",").map(Number).filter(n=>Number.isInteger(n)&&n>=0&&n<6);
  if(parsed.length!==3)return;
  state.playerPicks=parsed;state.opponentRevealed=false;state.quickBattleNumber=0;saveState();renderSelection();renderBattleLineups();renderMatch();
  document.getElementById("selectionMessage").textContent="おすすめ選出を反映しました ✨";
  switchTab("selection");
}

function wireEvents(){
  document.querySelectorAll(".tab").forEach(button=>button.addEventListener("click",()=>switchTab(button.dataset.tab)));
  document.getElementById("saveRosters").addEventListener("click",()=>{const error=validateRosters();document.getElementById("rosterMessage").textContent=error||"保存しました。相手AIがあなたの6体を分析します。";if(!error){state.playerPicks=[];state.opponentRevealed=false;state.quickBattleNumber=0;if(!opponentSelectionIsFresh()){state.opponentPicks=[];state.opponentSelectionMeta=null}saveState();renderSelection();switchTab("selection")}});
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
  document.getElementById("clearPicks").addEventListener("click",()=>{state.playerPicks=[];state.opponentRevealed=false;state.lastRecommendations=null;state.quickBattleNumber=0;saveState();renderSelection();renderBattleLineups();document.getElementById("recommendationPanel").hidden=true});
  document.getElementById("confirmPicks").addEventListener("click",()=>{
    if(state.playerPicks.length!==3){document.getElementById("selectionMessage").textContent="あなたの3体を、先発→控えの順に選んでください。";return}
    const finalize=()=>{clearInterval(timerId);state.opponentRevealed=true;document.getElementById("selectionMessage").textContent="両者の選出を公開しました。相手AIの理由も確認できます。";saveState();renderSelection();renderBattleLineups();renderMatch();switchTab("battle")};
    if(!opponentSelectionIsFresh()){document.getElementById("selectionMessage").textContent="相手AIが選出を計算中です…";ensureOpponentSelection(true,finalize);return}
    finalize();
  });
  document.getElementById("runBattle").addEventListener("click",()=>runOne(false));
  document.getElementById("runBatch").addEventListener("click",runBatch);
  document.getElementById("analyzeSelections").addEventListener("click",analyzeSelections);
  document.getElementById("simulateGame").addEventListener("click",()=>runOne(true));
  document.getElementById("nextSelection").addEventListener("click",()=>{state.playerPicks=[];state.opponentRevealed=false;state.lastRecommendations=null;state.quickBattleNumber=0;saveState();renderSelection();renderBattleLineups();switchTab("selection")});
  document.getElementById("newMatch").addEventListener("click",resetMatch);
  document.getElementById("matchFormat").addEventListener("change",event=>{state.format=Number(event.target.value);resetMatch()});
  document.getElementById("resetAll").addEventListener("click",resetAll);
  }

async function bootstrap(){
  hydrateEmbeddedData();wireEvents();repairStateRosters();renderAll();
  if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
}
if(typeof document!=="undefined")bootstrap();
