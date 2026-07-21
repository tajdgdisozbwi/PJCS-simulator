"use strict";

const STORAGE_KEY = "pjcs-simulator-v103";
const OLD_STORAGE_KEYS = [];
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

const PLAYER_DEFAULT = [];

// 2026-07-19 snapshot. PvPoke rank is performance simulation, not literal usage %.
// Recent-source tags are kept separately so the UI never invents a usage percentage.
const CURRENT_META = {
  lickilicky:{rank:2,score:93.7,sources:["PvPoke 2026-07-19","2026実戦データ"]},
  tinkaton:{rank:3,score:92.6,sources:["PvPoke 2026-07-19"]},
  altaria:{rank:4,score:92.2,sources:["PvPoke 2026-07-19","2026実戦データ"]},
  empoleon:{rank:5,score:92.2,sources:["PvPoke 2026-07-19","2026実戦データ"]},
  empoleon_shadow:{rank:7,score:91.9,sources:["PvPoke 2026-07-19"]},
  quagsire_shadow:{rank:8,score:91.8,sources:["PvPoke 2026-07-19","2026実戦データ"]},
  quagsire:{rank:9,score:91.7,sources:["PvPoke 2026-07-19"]},
  jellicent:{rank:10,score:91.6,sources:["PvPoke 2026-07-19","2026実戦データ"]},
  forretress:{rank:11,score:91.5,sources:["PvPoke 2026-07-19","2026実戦データ"]},
  ninetales:{rank:12,score:91.5,sources:["PvPoke 2026-07-19"]},
  ninetales_shadow:{rank:13,score:91.1,sources:["PvPoke 2026-07-19"]},
  feraligatr:{rank:14,score:91.0,sources:["PvPoke 2026-07-19"]},
  forretress_shadow:{rank:15,score:91.0,sources:["PvPoke 2026-07-19"]},
  jumpluff:{rank:17,score:90.9,sources:["PvPoke 2026-07-19"]},
  clodsire:{rank:18,score:90.8,sources:["PvPoke 2026-07-19"]},
  corviknight:{rank:19,score:90.8,sources:["PvPoke 2026-07-19","2026実戦データ"]},
  fearow:{rank:20,score:90.7,sources:["PvPoke 2026-07-19"]},
  azumarill:{rank:21,score:90.6,sources:["PvPoke 2026-07-19"]},
  guzzlord:{rank:24,score:90.5,sources:["PvPoke 2026-07-19","2026実戦データ"]},
  lapras:{rank:25,score:90.4,sources:["PvPoke 2026-07-19"]},
  furret:{rank:27,score:90.3,sources:["PvPoke 2026-07-19"]},
  seismitoad:{rank:31,score:90.2,sources:["PvPoke 2026-07-19"]},
  umbreon:{rank:32,score:90.2,sources:["PvPoke 2026-07-19"]},
  medicham:{rank:33,score:90.1,sources:["PvPoke 2026-07-19"]},
  talonflame:{rank:34,score:90.1,sources:["PvPoke 2026-07-19"]},
  dragonair_dragonite_normal:{rank:35,score:90.0,sources:["PvPoke 2026-07-19"]},
  greedent:{rank:39,score:89.7,sources:["PvPoke 2026-07-19"]},
  diggersby:{rank:41,score:89.6,sources:["PvPoke 2026-07-19"]},
  dusclops_dusknoir_normal:{rank:42,score:89.6,sources:["PvPoke 2026-07-19"]},
  cradily:{rank:44,score:89.5,sources:["PvPoke 2026-07-19","2026実戦データ"]},
  wigglytuff:{rank:48,score:89.5,sources:["PvPoke 2026-07-19","2026実戦データ"]},
  clefable:{rank:52,score:89.3,sources:["PvPoke 2026-07-19"]},
  mantine:{rank:53,score:89.3,sources:["PvPoke 2026-07-19"]},
  mandibuzz:{rank:55,score:89.2,sources:["PvPoke 2026-07-19"]},
  dewgong:{rank:56,score:89.1,sources:["PvPoke 2026-07-19"]},
  gastrodon:{rank:57,score:89.1,sources:["PvPoke 2026-07-19"]},
  malamar:{rank:58,score:89.1,sources:["PvPoke 2026-07-19","2026実戦データ"]},
  drapion_shadow:{rank:60,score:89.0,sources:["PvPoke 2026-07-19","2026実戦データ"]},
  charjabug:{rank:61,score:88.9,sources:["PvPoke 2026-07-19","2026実戦データ"]},
  swampert:{rank:62,score:88.8,sources:["PvPoke 2026-07-19","2026実戦データ"]},
  bastiodon:{rank:64,score:88.7,sources:["PvPoke 2026-07-19"]},
  stunfisk_galarian:{rank:67,score:88.5,sources:["PvPoke 2026-07-19"]},
  registeel:{rank:68,score:88.4,sources:["PvPoke 2026-07-19"]},
  stunfisk:{rank:69,score:88.4,sources:["PvPoke 2026-07-19","GameWith 2026-07-17"]},
  pelipper:{rank:75,score:88.1,sources:["PvPoke 2026-07-19"]},
  toxapex:{rank:97,score:87.2,sources:["PvPoke 2026-07-19"]},
  miltank:{rank:100,score:87.0,sources:["PvPoke 2026-07-19"]},
  annihilape:{rank:146,score:85.5,sources:["PvPoke 2026-07-19","GameWith 2026-07-17"]}
};

const META_BENCHMARK = [
  "lickilicky","tinkaton","altaria","empoleon","quagsire_shadow","jellicent","forretress","ninetales_shadow",
  "feraligatr","jumpluff","clodsire","corviknight","fearow","azumarill","guzzlord","lapras","cradily","stunfisk"
].filter(id=>POKEMON[id]);

const SAFE_SWAP_POOL = new Set(["lickilicky","jellicent","clodsire","corviknight","cradily","umbreon","dunsparce_dudunsparce_two","stunfisk","furret","malamar"]);
const CLOSER_POOL = new Set(["empoleon","empoleon_shadow","ninetales_shadow","feraligatr","quagsire_shadow","talonflame","stunfisk","azumarill","guzzlord","cradily"]);
const PRESSURE_POOL = new Set(["altaria","tinkaton","forretress","forretress_shadow","jumpluff","fearow","annihilape","malamar","corviknight"]);

const OPPONENT_ARCHETYPES = [
  ["altaria","empoleon","lickilicky","quagsire_shadow","jumpluff","forretress_shadow"],
  ["tinkaton","jellicent","ninetales_shadow","clodsire","corviknight","feraligatr"],
  ["altaria","empoleon","cradily","malamar","forretress","quagsire_shadow"],
  ["lickilicky","tinkaton","jellicent","jumpluff","ninetales_shadow","clodsire"],
  ["annihilape","stunfisk","furret","corviknight","azumarill","cradily"],
  ["fearow","quagsire_shadow","lickilicky","empoleon","jumpluff","ninetales_shadow"],
  ["guzzlord","corviknight","jellicent","tinkaton","cradily","feraligatr"],
  ["malamar","forretress","lickilicky","clodsire","altaria","empoleon"],
  ["stunfisk","annihilape","lickilicky","jumpluff","corviknight","quagsire_shadow"],
  ["cradily","empoleon","altaria","jellicent","ninetales_shadow","tinkaton"]
].map(team=>team.filter(id=>POKEMON[id])).filter(team=>team.length===6);

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
  return {playerRoster:Array(6).fill(null),opponentRoster:[],playerBuilds:Array(6).fill(null),opponentBuilds:Array(6).fill(null),playerPicks:[],opponentPicks:[],opponentSelectionMeta:null,opponentRevealed:false,opponentPartySeed:(Date.now()>>>0),opponentPartyMeta:null,format:3,playerScore:0,opponentScore:0,gameNumber:1,history:[],lastBattle:null,lastRecommendations:null,quickBattleNumber:0};
}
function loadState(){
  try{
    const raw=localStorage.getItem(STORAGE_KEY);
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
function applyCurrentMetaSnapshot(){
  for(const [id,meta] of Object.entries(CURRENT_META)){
    if(!POKEMON[id])continue;
    POKEMON[id].rank=meta.rank;
    POKEMON[id].metaScore=meta.score;
    POKEMON[id].metaFeatured=true;
    POKEMON[id].metaSources=[...meta.sources];
    POKEMON[id].metaIndex=(110-meta.rank)*1.25+meta.score;
  }
  META_ORDER=[...Object.keys(POKEMON)].sort((a,b)=>{
    const pa=POKEMON[a],pb=POKEMON[b];
    return (pb.metaIndex||0)-(pa.metaIndex||0)||(pa.rank||9999)-(pb.rank||9999)||pa.name.localeCompare(pb.name,"ja");
  });
}
function pokemonWeaknesses(p){
  const out=[];
  for(const type of Object.keys(TYPE_JP))if(effectiveness(type,p.types)>1.01)out.push(type);
  return out;
}
function pokemonAttackTypes(p){
  const types=new Set();
  const fast=FAST_MOVES[p.fast];if(fast)types.add(fast.type);
  for(const id of p.charged||[]){const move=CHARGED_MOVES[id];if(move)types.add(move.type)}
  return [...types];
}
const META_DUEL_CACHE=new Map();
function genericMetaDuel(aId,bId){
  const key=`${aId}|${bId}|9`;if(META_DUEL_CACHE.has(key))return META_DUEL_CACHE.get(key);
  const outcomes=[];
  for(const aShields of [0,1,2])for(const bShields of [0,1,2]){
    const seed=stringHash(`meta|${key}|${aShields}|${bShields}`);
    const result=simulateBattle([aId],[0],[bId],[0],seed,"balanced",false,[null],[null],{playerShields:aShields,opponentShields:bShields});
    outcomes.push({playerShields:aShields,opponentShields:bShields,winner:result.winner,margin:clamp(result.player.hp-result.opponent.hp,-1,1)});
  }
  const summary=summarizeDuel(outcomes,"player");META_DUEL_CACHE.set(key,summary);return summary;
}
function teamMetaScore(team){
  const valid=team.filter(id=>POKEMON[id]);if(valid.length!==6)return -Infinity;
  const dexes=valid.map(id=>POKEMON[id].dex);if(new Set(dexes).size!==6)return -Infinity;
  let score=0;
  for(const id of valid){
    const p=POKEMON[id],meta=CURRENT_META[id];
    score+=(meta?.score||84)*1.15+Math.max(0,55-(meta?.rank||120))*.18;
  }
  // Actual 9-shield coverage against a current benchmark.
  for(const target of META_BENCHMARK){
    const duels=valid.map(id=>genericMetaDuel(id,target)).sort((a,b)=>b.score-a.score);
    const answers=duels.filter(duelIsStrong).length;
    score+=duels[0].score*5+Math.min(answers,2)*2.8;
    if(!answers)score-=8;
  }
  // Weakness overlap and move diversity.
  const weaknessCounts={};const attackTypes=new Set();const ownTypes=new Set();
  for(const id of valid){
    const p=POKEMON[id];p.types.forEach(t=>ownTypes.add(t));pokemonAttackTypes(p).forEach(t=>attackTypes.add(t));
    pokemonWeaknesses(p).forEach(t=>weaknessCounts[t]=(weaknessCounts[t]||0)+1);
  }
  score+=attackTypes.size*1.2+ownTypes.size*.65;
  for(const count of Object.values(weaknessCounts)){if(count>=4)score-=(count-3)*7;else if(count===3)score-=2.5}
  const safe=valid.filter(id=>SAFE_SWAP_POOL.has(id)).length,closer=valid.filter(id=>CLOSER_POOL.has(id)).length,pressure=valid.filter(id=>PRESSURE_POOL.has(id)).length;
  score+=Math.min(safe,2)*4+Math.min(closer,3)*2.3+Math.min(pressure,3)*1.8;
  if(!safe)score-=10;if(!closer)score-=7;
  return score;
}
function candidateOpponentTeams(seed){
  const rng=mulberry32(seed>>>0),candidates=[];
  const flex=["lickilicky","tinkaton","altaria","empoleon","quagsire_shadow","jellicent","forretress","ninetales_shadow","feraligatr","jumpluff","clodsire","corviknight","fearow","azumarill","guzzlord","lapras","cradily","stunfisk","malamar","annihilape","furret"].filter(id=>POKEMON[id]);
  for(const base of OPPONENT_ARCHETYPES){
    candidates.push([...base]);
    for(let n=0;n<4;n++){
      const team=[...base],replaceIndex=Math.floor(rng()*6);
      const shuffled=[...flex].sort(()=>rng()-.5);
      for(const id of shuffled){
        if(team.includes(id))continue;
        if(team.some(x=>POKEMON[x]?.dex===POKEMON[id]?.dex))continue;
        team[replaceIndex]=id;break;
      }
      candidates.push(team);
    }
  }
  const seen=new Set();return candidates.filter(team=>{const key=[...team].sort().join("|");if(seen.has(key))return false;seen.add(key);return true});
}
function opponentPartyExplanation(team,score){
  const safe=team.filter(id=>SAFE_SWAP_POOL.has(id)).map(id=>POKEMON[id].name);
  const closer=team.filter(id=>CLOSER_POOL.has(id)).map(id=>POKEMON[id].name);
  const pressure=team.filter(id=>PRESSURE_POOL.has(id)).map(id=>POKEMON[id].name);
  const covered=META_BENCHMARK.filter(target=>team.some(id=>duelIsStrong(genericMetaDuel(id,target))));
  const weak=META_BENCHMARK.filter(target=>!team.some(id=>duelIsStrong(genericMetaDuel(id,target))));
  return {score,coverage:`基準メタ${covered.length}/${META_BENCHMARK.length}体に、9シールド条件で明確な回答あり`,safe:safe.length?`引き先候補：${safe.slice(0,3).join("・")}`:"明確な引き先候補なし",closer:closer.length?`締め役候補：${closer.slice(0,3).join("・")}`:"締め役候補なし",pressure:pressure.length?`対面圧力：${pressure.slice(0,3).join("・")}`:"",weak:weak.map(id=>POKEMON[id].name)};
}
function generateStrongOpponentRoster(forceDifferent=false){
  let seed=(Number(state.opponentPartySeed)||Date.now())>>>0;
  if(forceDifferent)seed=(seed+0x9E3779B9)>>>0;
  const oldKey=(state.opponentRoster||[]).join("|");
  let ranked=candidateOpponentTeams(seed).map(team=>({team,score:teamMetaScore(team)})).sort((a,b)=>b.score-a.score);
  if(forceDifferent)ranked=ranked.filter(x=>x.team.join("|")!==oldKey).concat(ranked.filter(x=>x.team.join("|")===oldKey));
  const top=ranked.slice(0,Math.min(5,ranked.length));
  const pick=top[Math.floor(mulberry32(seed^0xA5A5A5A5)()*top.length)]||ranked[0];
  state.opponentPartySeed=seed;state.opponentRoster=[...pick.team];state.opponentBuilds=Array(6).fill(null);
  state.opponentPartyMeta={version:10,generatedAt:Date.now(),...opponentPartyExplanation(pick.team,pick.score),sources:["PvPoke 2026-07-19","GameWith 2026-07-17","GO Battle Log設計"]};
  state.opponentPicks=[];state.opponentSelectionMeta=null;state.opponentRevealed=false;state.lastRecommendations=null;state.quickBattleNumber=0;
  clearAnalysisCaches();
}
function repairStateRosters(){
  const player=Array.from({length:6},(_,i)=>POKEMON[state.playerRoster?.[i]]?state.playerRoster[i]:null);
  const seenDex=new Set();
  state.playerRoster=player.map(id=>{if(!id)return null;const dex=POKEMON[id].dex;if(seenDex.has(dex))return null;seenDex.add(dex);return id});
  if(!Array.isArray(state.opponentRoster)||state.opponentRoster.length!==6||state.opponentRoster.some(id=>!POKEMON[id]))generateStrongOpponentRoster(false);
  state.playerBuilds=Array.from({length:6},(_,i)=>state.playerBuilds?.[i]||null);
  state.opponentBuilds=Array.from({length:6},(_,i)=>state.opponentBuilds?.[i]||null);
  state.playerPicks=(state.playerPicks||[]).filter(i=>i>=0&&i<6&&state.playerRoster[i]).slice(0,3);
  state.opponentPicks=(state.opponentPicks||[]).filter(i=>i>=0&&i<6).slice(0,3);
  state.opponentRevealed=Boolean(state.opponentRevealed);
  state.quickBattleNumber=Math.max(0,Math.trunc(Number(state.quickBattleNumber)||0));
  if(!state.opponentSelectionMeta||state.opponentSelectionMeta.version!==10)state.opponentSelectionMeta=null;
  saveState();
}
function hydrateEmbeddedData(){
  FAST_MOVES=structuredClone(EMBEDDED.fast);
  CHARGED_MOVES=structuredClone(EMBEDDED.charged);
  POKEMON=structuredClone(EMBEDDED.pokemon);
  META_ORDER=[...EMBEDDED.order].filter(id=>POKEMON[id]);
  applyCurrentMetaSnapshot();
  DATA_INFO={source:EMBEDDED.source,count:META_ORDER.length,loaded:true,updatedAt:EMBEDDED.updatedAt,diagnostics:EMBEDDED.diagnostics};
  repairStateRosters();
  const when=new Date(DATA_INFO.updatedAt).toLocaleDateString("ja-JP");
  setDataBanner("SLメタ統合データを読み込みました",`${DATA_INFO.count}体・技 ${DATA_INFO.diagnostics.moveCountFast+DATA_INFO.diagnostics.moveCountCharged}種・メタ基準 2026/7/19`,"ready");
}

function effectiveness(type,defTypes){return defTypes.reduce((m,t)=>{if(IMMUNE[type]?.includes(t))return m*0.390625;if(SUPER[type]?.includes(t))return m*1.6;if(RESIST[type]?.includes(t))return m*0.625;return m},1)}
function stageMult(stage){return STAGE[String(clamp(stage,-4,4))]||1}
const AEGISLASH_BLADE_BASE={baseAtk:272,baseDef:97,baseSta:155};
function isAegislash(mon){return normalizedSpriteKey(mon)==="aegislash_shield"}
function aegislashFormName(form){return form==="blade"?"ブレードフォルム":"シールドフォルム"}
function attackStat(mon){return mon.atk*stageMult(mon.attackStage)*(mon.shadow?SHADOW_ATTACK:1)}
function defenseStat(mon){return mon.def*stageMult(mon.defenseStage)*(mon.shadow?SHADOW_DEFENSE:1)}
function aegislashBladeStats(mon){
  if(!isAegislash(mon))return null;
  if(mon.bladeStats)return mon.bladeStats;
  if(Number.isFinite(mon.level)&&Number.isFinite(mon.atkIV)&&Number.isFinite(mon.defIV)&&Number.isFinite(mon.hpIV))return statsFor(AEGISLASH_BLADE_BASE,mon.level,mon.atkIV,mon.defIV,mon.hpIV);
  return null;
}
function chargedCmpStat(mon){
  const blade=aegislashBladeStats(mon);
  if(blade&&(mon.battleForm==="shield"||!mon.battleForm))return blade.atk*stageMult(mon.attackStage||0)*(mon.shadow?SHADOW_ATTACK:1);
  return attackStat(mon);
}
function calcDamageWithAttack(attacker,defender,move,attackValue){if(!attacker||!defender||!move)return 1;const stab=attacker.types.includes(move.type)?STAB:1;const eff=effectiveness(move.type,defender.types);return Math.max(1,Math.floor(.5*move.power*(attackValue/Math.max(1,defenseStat(defender)))*stab*eff*1.2999999523)+1)}
function calcDamage(attacker,defender,move){return calcDamageWithAttack(attacker,defender,move,attackStat(attacker))}
function projectedChargedDamage(attacker,defender,move){return calcDamageWithAttack(attacker,defender,move,chargedCmpStat(attacker))}
function fastDamage(attacker,defender,move){return isAegislash(attacker)&&attacker.battleForm==="shield"?1:calcDamage(attacker,defender,move)}
function fastEnergy(attacker,move){return isAegislash(attacker)&&attacker.battleForm==="shield"?6:safeNumber(move?.energy,0)}
function setAegislashForm(mon,form,log=null,turn=0,reason=""){
  if(!isAegislash(mon)||!mon.shieldStats||!mon.bladeStats)return false;
  const next=form==="blade"?"blade":"shield";
  if(mon.battleForm===next)return false;
  const stats=next==="blade"?mon.bladeStats:mon.shieldStats;
  mon.battleForm=next;mon.atk=stats.atk;mon.def=stats.def;mon.cp=stats.cp;
  if(log){const detail=`攻撃${stats.atk.toFixed(1)}・防御${stats.def.toFixed(1)}・CP${stats.cp}`;log.push(`${turnLabel(turn)} ${logMon(mon)}へフォルムチェンジ（${reason||aegislashFormName(next)}／${detail}）`)}
  return true;
}
function resetAegislashOnEntry(mon){if(isAegislash(mon))setAegislashForm(mon,"shield")}
function prepareSwitchOut(mon,log=null,turn=0){
  if(!mon)return;
  mon.fastPending=null;
  mon.attackStage=0;
  mon.defenseStage=0;
  if(isAegislash(mon))setAegislashForm(mon,"shield",log,turn,"交代");
}
function monFromId(id,build=null){
  const p=POKEMON[id]||Object.values(FALLBACK_POKEMON)[0],b=normalizeBuild(p,build);
  const mon={...p,...b,id,maxHp:b.hp,currentHp:b.hp,energy:0,attackStage:0,defenseStage:0,fastPending:null,fainted:false,battleForm:null};
  if(isAegislash(mon)){
    mon.shieldStats={atk:b.atk,def:b.def,hp:b.hp,cp:b.cp};
    mon.bladeStats=statsFor(AEGISLASH_BLADE_BASE,b.level,b.atkIV,b.defIV,b.hpIV);
    mon.battleForm="shield";
  }
  return mon;
}
function createTeam(roster,picks,builds,side){
  const party=picks.map(i=>monFromId(roster[i],builds?.[i]));
  for(const mon of party)mon.battleSide=side;
  return {party,active:0,shields:2,switchCooldown:0,side};
}
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
  return [...available].sort((a,b)=>(projectedChargedDamage(mon,opp,b)/Math.max(1,b.energy))-(projectedChargedDamage(mon,opp,a)/Math.max(1,a.energy)))[0];
}
function matchupScore(mon,opp){
  if(!mon||!opp)return 0;
  const fast=fastObject(mon);
  const ownCharged=chargedObjects(mon);
  const own=(fastDamage(mon,opp,fast)/fast.turns)+(ownCharged.length?Math.max(...ownCharged.map(m=>projectedChargedDamage(mon,opp,m)/Math.max(1,m.energy)))*3:0);
  const of=fastObject(opp);
  const theirCharged=chargedObjects(opp);
  const theirs=(fastDamage(opp,mon,of)/of.turns)+(theirCharged.length?Math.max(...theirCharged.map(m=>projectedChargedDamage(opp,mon,m)/Math.max(1,m.energy)))*3:0);
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
    const maxDamage=Math.max(...available.map(move=>projectedChargedDamage(mon,opp,move)));
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
    log.push(`${turnLabel(turn)} ${logMon(receiver)}の${effect.stat==="attack"?"攻撃":"防御"}が${effect.delta>0?"上昇":"低下"}（${receiver[key]}段階）`);
  }
}
function turnLabel(turn){return `${(turn*TURN_MS/1000).toFixed(1)}秒`}
function fastTiming(move){return `${move.turns}ターン / ${(move.turns*TURN_MS/1000).toFixed(1)}秒`}
function logMon(mon){
  if(!mon?.id)return escapeHtml(mon?.name||"?");
  const form=isAegislash(mon)?(mon.battleForm||"shield"):"base";
  return `[[MON:${encodeURIComponent(mon.id)}|${form}|${mon.battleSide||"unknown"}]]`;
}
function forceSwitch(team,opp,log,turn){const options=alive(team).filter(i=>i!==team.active);if(!options.length)return;let best=options[0],score=-Infinity;for(const i of options){const s=matchupScore(team.party[i],opp);if(s>score){score=s;best=i}}team.active=best;team.party[best].fastPending=null;resetAegislashOnEntry(team.party[best]);log.push(`${turnLabel(turn)} ${logMon(active(team))}を繰り出した`)}
function processFaints(a,b,log,turn){const am=active(a),bm=active(b);if(am&&am.currentHp<=0&&!am.fainted){am.fainted=true;am.currentHp=0;am.fastPending=null;log.push(`${turnLabel(turn)} ${logMon(am)}がひんし`)}if(bm&&bm.currentHp<=0&&!bm.fainted){bm.fainted=true;bm.currentHp=0;bm.fastPending=null;log.push(`${turnLabel(turn)} ${logMon(bm)}がひんし`)}if(!battleOver(a,b)){if(active(a).fainted)forceSwitch(a,active(b),log,turn);if(active(b).fainted)forceSwitch(b,active(a),log,turn)}}

function simulateBattle(playerRoster,playerPicks,opponentRoster,opponentPicks,seed,style="balanced",verbose=true,playerBuilds=state.playerBuilds,opponentBuilds=state.opponentBuilds,options={}){
  const rng=mulberry32(Number(seed)||1),p=createTeam(playerRoster,playerPicks,playerBuilds,"player"),o=createTeam(opponentRoster,opponentPicks,opponentBuilds,"opponent"),log=[];
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
    charged.sort((x,y)=>chargedCmpStat(y.actor)-chargedCmpStat(x.actor)||(rng()<.5?-1:1));
    if(charged.length){
      for(const item of charged){
        if(battleOver(p,o))break;
        const user=item.actor,target=active(item.other),move=item.action.move;
        if(active(item.team)!==user||!user||user.fainted||!move||user.energy<move.energy)continue;
        user.energy-=move.energy;
        // Pokémon GO: Aegislash changes to Blade Forme immediately before its Charged Attack.
        if(isAegislash(user)&&user.battleForm==="shield")setAegislashForm(user,"blade",verbose?log:null,turn,"ゲージ技を使用");
        const shield=shouldShield(item.other,user,move,rng,style);
        const dmg=shield?1:calcDamage(user,target,move);
        if(shield)item.other.shields-=1;
        target.currentHp-=dmg;
        if(verbose)log.push(`${turnLabel(turn)} ${logMon(user)}の${move.name} → ${logMon(target)} ${dmg}ダメージ${shield?"（シールド）":""}（ゲージ技・固有ターンなし）`);
        // Aegislash returns to Shield Forme after it uses a Protect Shield.
        if(shield&&isAegislash(target)&&target.battleForm==="blade")setAegislashForm(target,"shield",verbose?log:null,turn,"シールドを使用");
        applyEffects(user,target,move,rng,log,turn);processFaints(p,o,log,turn);
      }
      if(battleOver(p,o))return finishBattle(p,o,turn,log,"KO");
      continue;
    }

    if(pa.type==="switch"&&active(p)===pActor&&!active(p).fainted&&p.switchCooldown===0){prepareSwitchOut(pActor,verbose?log:null,turn);p.active=pa.index;active(p).fastPending=null;resetAegislashOnEntry(active(p));p.switchCooldown=SWITCH_COOLDOWN_TURNS;if(verbose)log.push(`${turnLabel(turn)} あなたは${logMon(active(p))}へ交代`)}
    if(oa.type==="switch"&&active(o)===oActor&&!active(o).fainted&&o.switchCooldown===0){prepareSwitchOut(oActor,verbose?log:null,turn);o.active=oa.index;active(o).fastPending=null;resetAegislashOnEntry(active(o));o.switchCooldown=SWITCH_COOLDOWN_TURNS;if(verbose)log.push(`${turnLabel(turn)} 相手は${logMon(active(o))}へ交代`)}

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
    const damages=fastHits.map(hit=>({...hit,damage:fastDamage(hit.attacker,hit.defender,hit.move),energyGain:fastEnergy(hit.attacker,hit.move)}));
    for(const hit of damages){
      if(!hit.attacker.fainted&&hit.defender){
        hit.attacker.energy=clamp(hit.attacker.energy+hit.energyGain,0,100);hit.defender.currentHp-=hit.damage;
        const shieldCharge=isAegislash(hit.attacker)&&hit.attacker.battleForm==="shield";
        const fastLabel=shieldCharge?`チャージ（${hit.move.name}相当）`:hit.move.name;
        const stanceNote=shieldCharge?"・シールド仕様":"";
        if(verbose)log.push(`${turnLabel(turn)} ${logMon(hit.attacker)}の${fastLabel} → ${hit.damage}ダメージ（${fastTiming(hit.move)}、E+${hit.energyGain}→${hit.attacker.energy}${stanceNote}）`);
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
  "dudunsparce_three","snorlax_wildarea_2024","ho_oh_s","mewtwo_a","raikou_s","latias_s"
]);
const SAME_APPEARANCE_ALT_SPRITES=new Set([
  "dunsparce_dudunsparce_two","slowking_2022","slowbro_2021","slowpoke_slowbro_2021"
]);
function normalizedSpriteKey(p){return String(p?.speciesId||p?.id||"").replace(/_shadow$/,'')}
function isAlternateSpriteForm(p){const form=String(p?.form||"");return Boolean(form)&&!form.endsWith("_NORMAL")}
function spriteUrl(p){
  const key=normalizedSpriteKey(p);
  if(SPECIAL_SPRITE_FALLBACK_ONLY.has(key))return "";
  if(key==="aegislash_shield")return p?.battleForm==="blade"?"https://play.pokemonshowdown.com/sprites/gen6/aegislash-blade.png":"https://play.pokemonshowdown.com/sprites/gen6/aegislash-shield.png";
  if(SPECIAL_SPRITE_SLUGS[key])return `https://play.pokemonshowdown.com/sprites/gen5/${SPECIAL_SPRITE_SLUGS[key]}.png`;
  if(isAlternateSpriteForm(p)&&!SAME_APPEARANCE_ALT_SPRITES.has(key))return "";
  const dex=Math.max(1,Math.trunc(Number(p?.dex)||0));
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${dex}.png`;
}
function shadowBadge(){
  return `<span class="shadow-mark" title="シャドウポケモン" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M12 2.5c1.1 2.6 3.8 3.7 5.4 5.9 1.2 1.6 1.7 3.2 1.3 5.2-.6 3.6-3.3 6.1-6.7 6.1s-6.1-2.5-6.7-6.1c-.4-2 .1-3.6 1.3-5.2 1.1-1.5 2.7-2.5 3.7-4.1.6 1.8.3 3.2-.3 4.4 1.6-1.3 2.5-3.2 2-6.2Z"/><path class="shadow-mark-cut" d="M8.5 14.2c1.1.8 2.2 1.2 3.5 1.2s2.4-.4 3.5-1.2c-.6 1.9-1.8 3-3.5 3s-2.9-1.1-3.5-3Z"/></svg></span>`;
}
function pokemonDisplayName(p){
  if(isAegislash(p)&&p?.battleForm)return `ギルガルド（${p.battleForm==="blade"?"ブレード":"シールド"}）`;
  return String(p?.name||"ポケモン");
}
function pokemonAvatar(p,size="normal"){
  const displayName=pokemonDisplayName(p);
  const initial=escapeHtml(displayName.replace(/[（(].*/,"").slice(0,1)||"?");
  const url=spriteUrl(p);
  const label=escapeHtml(displayName);
  const shadowClass=p?.shadow?" is-shadow":"";
  const badge=p?.shadow?shadowBadge():"";
  if(!url)return `<span class="pokemon-avatar avatar-${escapeHtml(size)}${shadowClass}" title="${label}"><span class="avatar-fallback avatar-fallback-solid" aria-hidden="true">${initial}</span>${badge}</span>`;
  return `<span class="pokemon-avatar avatar-${escapeHtml(size)}${shadowClass}" title="${label}"><img src="${url}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span class="avatar-fallback avatar-fallback-solid" hidden aria-hidden="true">${initial}</span>${badge}</span>`;
}
function spriteToken(p,size="inline"){
  if(!p)return '<span class="sprite-token sprite-missing" aria-label="データなし">?</span>';
  const label=pokemonDisplayName(p);
  return `<span class="sprite-token" role="img" aria-label="${escapeHtml(label)}" title="${escapeHtml(label)}">${pokemonAvatar(p,size)}<span class="sr-only">${escapeHtml(label)}</span></span>`;
}
function selectedBattlePokemon(){
  const mons=[];
  for(let i=0;i<6;i++){
    const p=effectivePokemon("player",i);if(p)mons.push(p);
    const o=effectivePokemon("opponent",i);if(o)mons.push(o);
  }
  return mons;
}
function renderLegacyLogWithSprites(text){
  const candidates=[...new Map(selectedBattlePokemon().map(p=>[p.name,p])).values()].sort((a,b)=>b.name.length-a.name.length);
  const parts=[];let cursor=0;
  while(cursor<text.length){
    let best=null;
    for(const p of candidates){const at=text.indexOf(p.name,cursor);if(at<0)continue;if(!best||at<best.at||(at===best.at&&p.name.length>best.p.name.length))best={at,p};}
    if(!best){parts.push(escapeHtml(text.slice(cursor)));break;}
    if(best.at>cursor)parts.push(escapeHtml(text.slice(cursor,best.at)));
    parts.push(spriteToken(best.p,"log"));cursor=best.at+best.p.name.length;
  }
  return parts.join("");
}
function logSpriteToken(p,side="unknown"){
  const normalized=side==="player"?"player":side==="opponent"?"opponent":"unknown";
  const label=normalized==="player"?"あなた":normalized==="opponent"?"相手":"陣営不明";
  return `<span class="battle-log-mon side-${normalized}" aria-label="${label}の${escapeHtml(pokemonDisplayName(p))}"><span class="log-side-label">${label}</span>${spriteToken(p,"log")}</span>`;
}
function battleLogHtml(text){
  const source=String(text??"");
  const regex=/\[\[MON:([^|\]]+)(?:\|([^|\]]+))?(?:\|([^\]]+))?\]\]/g;
  let html="",cursor=0,match,found=false;
  while((match=regex.exec(source))){
    found=true;html+=escapeHtml(source.slice(cursor,match.index));
    const id=decodeURIComponent(match[1]),form=match[2]||"base",side=match[3]||"unknown";
    const base=POKEMON[id]||selectedBattlePokemon().find(p=>p.id===id);
    const display=base&&isAegislash(base)?{...base,battleForm:form==="blade"?"blade":"shield"}:base;
    html+=logSpriteToken(display,side);
    cursor=regex.lastIndex;
  }
  if(found)return html+escapeHtml(source.slice(cursor));
  return renderLegacyLogWithSprites(source);
}


function rosterCard(side,index,id){
  const card=document.createElement("article");card.className="roster-slot-card";
  if(!id||!POKEMON[id]){
    card.classList.add("empty-roster-slot");
    card.innerHTML=`<span class="slot-number">${index+1}</span><div class="empty-slot-icon">＋</div><div class="roster-main"><strong>未選択</strong><small>ここを押してポケモンを登録</small></div><button class="change-pokemon primary-button" data-side="player" data-index="${index}" type="button">選ぶ</button>`;
    return card;
  }
  const p=POKEMON[id],b=buildForSlot(side,index);
  if(!b.valid)card.classList.add("invalid-build");
  const sourceText=(p.metaSources||[]).slice(0,2).join(" / ");
  card.innerHTML=`
    <span class="slot-number">${index+1}</span>
    ${pokemonAvatar(p,"roster")}
    <div class="roster-main">
      <div class="roster-title"><strong>${escapeHtml(p.name)}</strong><span class="cp-chip">CP ${b.cp}</span></div>
      <div class="type-row">${typeChips(p.types)}${p.rank?`<span class="rank-chip">PvPoke #${p.rank}</span>`:""}${p.metaFeatured?'<span class="meta-chip">現環境候補</span>':""}</div>
      <div class="build-summary"><span>Lv ${b.level}</span><span>個体値 ${b.atkIV}/${b.defIV}/${b.hpIV}</span><span>攻撃 ${b.atk.toFixed(1)}</span><span>防御 ${b.def.toFixed(1)}</span><span>HP ${b.hp}</span></div>
      <small class="roster-moves">${escapeHtml(moveLabel({...p,...b}))}</small>
      ${side==="opponent"&&sourceText?`<small class="meta-source-mini">${escapeHtml(sourceText)}</small>`:""}
    </div>
    ${side==="player"?`<div class="roster-actions"><button class="build-pokemon secondary-button" data-side="${side}" data-index="${index}" type="button">個体・技</button><button class="change-pokemon ghost-button" data-side="${side}" data-index="${index}" type="button">変更</button></div>`:'<span class="ai-lock-chip">AI選出対象</span>'}`;
  return card;
}
function renderRosters(){
  document.getElementById("playerRoster").replaceChildren(...Array.from({length:6},(_,i)=>rosterCard("player",i,state.playerRoster[i])));
  document.getElementById("opponentRoster").replaceChildren(...Array.from({length:6},(_,i)=>rosterCard("opponent",i,state.opponentRoster[i])));
  document.getElementById("playerReady").textContent=`${state.playerRoster.filter(Boolean).length} / 6`;
  document.getElementById("opponentReady").textContent="AI自動生成";
  const info=document.getElementById("opponentGenerationInfo");
  if(info&&state.opponentPartyMeta){const m=state.opponentPartyMeta;info.innerHTML=`<strong>今回の相手6体</strong><span>${escapeHtml(m.coverage)}</span><span>${escapeHtml(m.safe)} / ${escapeHtml(m.closer)}</span>${m.weak?.length?`<span>残る注意対象：${escapeHtml(m.weak.join("・"))}</span>`:"<span>基準メタに明確な穴なし</span>"}`}
  const chip=document.getElementById("poolChip");if(chip)chip.textContent=`${DATA_INFO.count}体`;
}
function validateRosters(){
  if(state.playerRoster.length!==6||state.playerRoster.some(id=>!POKEMON[id]))return "あなたの6体をすべて登録してください。";
  const dexes=state.playerRoster.map(id=>POKEMON[id].dex);
  if(new Set(dexes).size!==6)return "あなたの同じ6体内では、同じポケモン（フォルム・シャドウ違いを含む）を重複登録できません。";
  if(state.opponentRoster.length!==6||state.opponentRoster.some(id=>!POKEMON[id]))return "相手AIの6体生成に失敗しました。再生成してください。";
  return "";
}
function openPokemonDialog(side,index){
  if(side!=="player")return;
  dialogTarget={side,index};
  const dialog=document.getElementById("pokemonDialog");
  const input=document.getElementById("pokemonSearch");
  input.value="";
  document.getElementById("dialogHint").textContent=`あなたの${index+1}枠目を選びます。相手AIと同じポケモンは使用可能です。あなたの6体内の同種重複だけ選択できません。`;
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
  const key="playerRoster";
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
    if(!p){button.disabled=true;button.classList.add("empty-pick-card");button.textContent="未登録";return button;}
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
    if(!p){card.classList.add("empty-pick-card");card.textContent="未登録";return card;}
    card.innerHTML=`<div class="pick-card-title">${pokemonAvatar(p,"pick")}<span><strong>${escapeHtml(p.name)}</strong><small>CP ${p.cp}・Lv ${p.level}・個体値 ${p.atkIV}/${p.defIV}/${p.hpIV}</small></span></div><span class="type-row">${typeChips(p.types)}</span><small>${escapeHtml(moveLabel(p))}</small>`;
    return card;
  }));
}
function renderSelection(){
  renderPickGrid("playerSelection",state.playerRoster,state.playerPicks,"player");
  renderPublicRosterGrid("opponentSelectionPreview",state.opponentRoster,"opponent");
  document.getElementById("playerSelectionSummary").textContent=selectionNames(state.playerRoster,state.playerPicks)||"未選択";
  renderSelectionScorePanel();
  renderOpponentAiPanel();
  if(state.playerRoster.every(id=>POKEMON[id])&&!opponentSelectionIsFresh()&&!opponentAiComputing)ensureOpponentSelection();
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
  const log=document.getElementById("battleLog");log.replaceChildren(...result.log.map(text=>{const li=document.createElement("li");li.innerHTML=battleLogHtml(text);return li}));if(!result.log.length){const li=document.createElement("li");li.textContent="ログなし";log.appendChild(li)}
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
function opponentLineLikelihoodScore(line){
  const ordered=orderOpponentLine(line);
  const leadDuels=state.playerRoster.map((_,playerIndex)=>opponentDuel(ordered[0],playerIndex));
  const leadAvg=leadDuels.reduce((sum,duel)=>sum+duel.wins/9,0)/Math.max(1,leadDuels.length);
  const leadStrong=leadDuels.filter(duelIsStrong).length/6;
  const coverageRows=state.playerRoster.map((_,playerIndex)=>{
    const duels=ordered.map(opponentIndex=>opponentDuel(opponentIndex,playerIndex));
    const best=[...duels].sort((a,b)=>b.score-a.score)[0];
    return {best,strong:duels.filter(duelIsStrong).length};
  });
  const coverageAvg=coverageRows.reduce((sum,row)=>sum+row.best.wins/9,0)/6;
  const covered=coverageRows.filter(row=>duelIsStrong(row.best)).length/6;
  const depth=coverageRows.reduce((sum,row)=>sum+Math.min(2,row.strong)/2,0)/6;
  const memberRows=ordered.map(opponentIndex=>{
    const duels=state.playerRoster.map((_,playerIndex)=>opponentDuel(opponentIndex,playerIndex));
    const best=[...duels].sort((a,b)=>b.score-a.score)[0];
    return {bestWins:best.wins,strong:duels.filter(duelIsStrong).length};
  });
  const relevance=memberRows.reduce((sum,row)=>sum+row.bestWins/9,0)/3;
  const deadSlots=memberRows.filter(row=>row.bestWins<=3&&row.strong===0).length;
  const safe=Math.max(opponentRoleMetrics(ordered[1]).safeScore,opponentRoleMetrics(ordered[2]).safeScore);
  const closer=Math.max(opponentRoleMetrics(ordered[1]).closerScore,opponentRoleMetrics(ordered[2]).closerScore);
  const roleFit=(scoreClamp((safe+8)/20)+scoreClamp((closer+5)/18))/2;
  const score=clamp(.22*(.7*leadAvg+.3*leadStrong)+.38*(.65*coverageAvg+.35*covered)+.15*depth+.15*relevance+.10*roleFit-deadSlots*.08,0,1);
  return {line:ordered,score,leadAvg,leadStrong,coverageAvg,covered,depth,relevance,deadSlots,roleFit};
}
function opponentLineDistribution(lines=lineupPermutations()){
  const scored=uniqueLines(lines.map(line=>orderOpponentLine(line))).map(line=>opponentLineLikelihoodScore(line)).sort((a,b)=>b.score-a.score);
  const maxScore=scored[0]?.score||0,temperature=.095;
  const raw=scored.map(row=>Math.exp((row.score-maxScore)/temperature)+.015);
  const total=raw.reduce((sum,value)=>sum+value,0)||1;
  return scored.map((row,index)=>({...row,probability:raw[index]/total}));
}
function normalizeOpponentEntries(opponentLines){
  if(!opponentLines?.length)return opponentLineDistribution();
  if(Array.isArray(opponentLines[0]))return opponentLines.map(line=>({line,probability:1/opponentLines.length,score:0}));
  const total=opponentLines.reduce((sum,row)=>sum+(Number(row.probability)||0),0)||1;
  return opponentLines.map(row=>({...row,probability:(Number(row.probability)||0)/total}));
}
function opponentSamplesFor(_line,opponentLines){return normalizeOpponentEntries(opponentLines)}
function simulateLineEstimate(line,opponentLines,seed,style,repeats=3){
  let rawWins=0,rawLosses=0,weightedWin=0,weightedAlive=0,weightedSeconds=0;
  const entries=normalizeOpponentEntries(opponentLines);
  for(let oi=0;oi<entries.length;oi++){
    const entry=entries[oi];let lineWins=0,lineAlive=0,lineSeconds=0;
    for(let repeat=0;repeat<repeats;repeat++){
      const battleSeed=(seed+oi*1009+repeat*7919)>>>0;
      const result=simulateBattle(state.playerRoster,line,state.opponentRoster,entry.line,battleSeed,style,false,state.playerBuilds,state.opponentBuilds);
      if(result.winner==="player"){rawWins++;lineWins++}else rawLosses++;
      lineAlive+=result.player.alive;lineSeconds+=result.seconds;
    }
    weightedWin+=entry.probability*(lineWins/repeats);
    weightedAlive+=entry.probability*(lineAlive/repeats);
    weightedSeconds+=entry.probability*(lineSeconds/repeats);
  }
  const total=entries.length*repeats;
  const wins=Math.round(weightedWin*total),losses=total-wins;
  return {winPct:weightedWin*100,wins,losses,total,rawWins,rawLosses,avgAlive:weightedAlive,avgSeconds:weightedSeconds,opponentLineCount:entries.length,repeats,weighting:"selection-likelihood",topOpponentProbability:(entries[0]?.probability||0)*100,top10Share:entries.slice(0,10).reduce((sum,row)=>sum+row.probability,0)*100};
}

const DUEL_CACHE=new Map();
const OPPONENT_DUEL_CACHE=new Map();
const OPPONENT_ROLE_CACHE=new Map();
const PLAYER_META_DUEL_CACHE=new Map();
const PARTY_SCORE_CACHE=new Map();
const SELECTION_SCORE_CACHE=new Map();
let partyScorePendingSignature=null;
function clearAnalysisCaches(){DUEL_CACHE.clear();OPPONENT_DUEL_CACHE.clear();OPPONENT_ROLE_CACHE.clear();PLAYER_META_DUEL_CACHE.clear();PARTY_SCORE_CACHE.clear();SELECTION_SCORE_CACHE.clear();partyScorePendingSignature=null}
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
  return Boolean(state.opponentSelectionMeta?.version===12&&state.opponentSelectionMeta?.signature===opponentSelectionSignature()&&state.opponentPicks.length===3);
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
  const energyPerFast=isAegislash(mon)?6:safeNumber(fast?.energy);
  if(!fast||!move||energyPerFast<=0)return Infinity;
  return Math.ceil(move.energy/energyPerFast)*fast.turns;
}
function fastestChargedProfile(mon){
  const moves=chargedObjects(mon).map(move=>({move,turns:firstChargedTurns(mon,move)})).sort((a,b)=>a.turns-b.turns||a.move.energy-b.move.energy);
  return moves[0]||null;
}
function bestPressureMove(attacker,defender){
  return chargedObjects(attacker).map(move=>({move,damage:projectedChargedDamage(attacker,defender,move),eff:effectiveness(move.type,defender.types),turns:firstChargedTurns(attacker,move)})).sort((a,b)=>(b.damage/Math.max(1,b.move.energy))-(a.damage/Math.max(1,a.move.energy))||b.damage-a.damage)[0]||null;
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
  if(incomingFastEff<.99)reasons.push(`${defender.name}の通常技「${playerFast.name}」を${formatMultiplier(incomingFastEff)}で受ける`);
  const resistedCharged=chargedObjects(defender).filter(move=>effectiveness(move.type,attacker.types)<.99);
  if(resistedCharged.length)reasons.push(...resistedCharged.slice(0,2).map(move=>`${defender.name}の「${move.name}」を${formatMultiplier(effectiveness(move.type,attacker.types))}で受ける`));
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
function weightedOpponentLineDraw(distribution,seed){
  const rng=mulberry32((seed^0x6D2B79F5)>>>0);let r=rng(),cumulative=0;
  for(let index=0;index<distribution.length;index++){
    cumulative+=distribution[index].probability;
    if(r<=cumulative||index===distribution.length-1)return {entry:distribution[index],rank:index+1,roll:r};
  }
  return {entry:distribution[0],rank:1,roll:r};
}
function computeOpponentSelection(){
  OPPONENT_DUEL_CACHE.clear();OPPONENT_ROLE_CACHE.clear();
  const playerLines=lineupPermutations(),distribution=opponentLineDistribution(),seed=stringHash(opponentSelectionSignature()),style="balanced";
  const draw=weightedOpponentLineDraw(distribution,seed),chosenEstimate=simulateOpponentLineEstimate(draw.entry.line,playerLines,seed,style,2);
  const alternatives=distribution.filter(row=>canonicalSelectionLineKey(row.line)!==canonicalSelectionLineKey(draw.entry.line)).slice(0,2).map((row,index)=>{
    const estimate=simulateOpponentLineEstimate(row.line,playerLines,seed+(index+1)*30001,style,2);
    return {line:row.line,probability:row.probability,selectionRank:distribution.indexOf(row)+1,winPct:estimate.winPct,wins:estimate.wins,losses:estimate.losses};
  });
  return {version:12,signature:opponentSelectionSignature(),createdAt:Date.now(),line:draw.entry.line,selectionRank:draw.rank,selectionProbability:draw.entry.probability,uniformProbability:1/Math.max(1,distribution.length),top10Share:distribution.slice(0,10).reduce((sum,row)=>sum+row.probability,0),winPct:chosenEstimate.winPct,wins:chosenEstimate.wins,losses:chosenEstimate.losses,total:chosenEstimate.total,playerLineCount:chosenEstimate.playerLineCount,repeats:chosenEstimate.repeats,avgAlive:chosenEstimate.avgAlive,analysis:opponentSelectionAnalysis(draw.entry.line),alternatives};
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
  const basis=`<div class="simulation-basis"><strong>相手側 ${meta.wins}勝 ${meta.losses}敗 / ${meta.total}試合（${meta.winPct.toFixed(1)}%）</strong><span>相手AIは画面の予測と同じ選出確率モデルから1回抽選。抽選後、その選出をあなたの60選出へ各2乱数で検証。1対1は全9シールド条件で6勝以上かつ同数2勝以上を「刺さる」と判定し、あなたが現在選んだ3体は参照していません。</span></div>`;
  return `${basis}${lineup}${compact?coverage:`${roles}${coverage}${warnings}${alternatives}`}`;
}
function renderOpponentAiPanel(){
  const status=document.getElementById("opponentAiStatus"),summary=document.getElementById("opponentSelectionSummary"),content=document.getElementById("opponentAiContent");
  if(!status||!summary||!content)return;
  if(!state.playerRoster.every(id=>POKEMON[id])){
    status.textContent="待機中";summary.textContent="あなたの6体を登録してください";content.innerHTML='<div class="analysis-loading"><strong>相手の3体選出はまだ開始していません</strong><span>あなたの6体が揃うと、相手AIが公開6体を基に60通りを自動分析します。</span></div>';return;
  }
  if(opponentAiComputing||!opponentSelectionIsFresh()){
    status.textContent="分析中";summary.textContent="60通りを分析中";content.innerHTML='<div class="analysis-loading"><strong>相手AIが選出中…</strong><span>あなたの6体だけを見て、36対面×9シールド条件・技回転・引き先性能を比較しています。</span></div>';return;
  }
  const meta=state.opponentSelectionMeta;
  if(!state.opponentRevealed){
    status.textContent="選出済み・非公開";summary.textContent="AI選出済み（非公開）";
    content.innerHTML=`<div class="ai-locked"><div class="ai-lock-icon">●</div><strong>相手AIは3体を確定済みです</strong><p>あなたの選出確定後に、3体と選出理由を公開します。現在選んでいる3体はAIへ渡していません。</p><small>選出方法：公開6体への刺さり方から60通りへ確率を付け、その分布から1回抽選。確定後に対戦評価</small></div>`;return;
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
  const entries=normalizeOpponentEntries(opponentLines);let total=0;
  for(const entry of entries){
    const oLine=entry.line;
    const lead=headToHeadBySlots(line[0],oLine[0]).score;
    const opponentCoverage=oLine.reduce((sum,opponentIndex)=>sum+Math.max(...line.map(playerIndex=>headToHeadBySlots(playerIndex,opponentIndex).score)),0)/oLine.length;
    const playerPressure=line.reduce((sum,playerIndex)=>sum+Math.max(...oLine.map(opponentIndex=>headToHeadBySlots(playerIndex,opponentIndex).score)),0)/line.length;
    total+=(lead*1.15+opponentCoverage+playerPressure*.35)*entry.probability;
  }
  return total;
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
  panel.innerHTML=`<div class="recommendation-heading"><div><p class="step">SELECTION COACH</p><h3>勝ち筋が太い選出候補 ✨</h3></div><span class="status-chip">相手の選出確率を反映</span></div><p class="recommendation-intro">あなたの60通りを9シールド条件で一次比較し、相手の60選出は公開6体への刺さり方から選出確率を推定して重み付けします。上位候補を各3回、合計180試合相当で再検証します。表示％は大会の実測使用率ではなく、この相手6体に対する合理的選出モデルです。</p>`;
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
  return simulateLineEstimate(state.playerPicks,opponentLineDistribution(),seed+70000,style,3).winPct;
}
function analyzeSelections(){
  const error=validateRosters();if(error){switchTab("roster");document.getElementById("rosterMessage").textContent=error;return}
  const button=document.getElementById("analyzeSelections");button.disabled=true;button.textContent="✨ 全60通りを分析中…";
  const panel=document.getElementById("recommendationPanel");panel.hidden=false;panel.innerHTML='<div class="analysis-loading"><strong>選出を探索中…</strong><span>60候補を対面データで比較し、上位候補を各180試合で再検証しています。</span></div>';
  setTimeout(()=>{
    const playerLines=lineupPermutations(),opponentLines=opponentLineDistribution(),seed=currentSeed(),style=currentStyle();
    const screened=playerLines.map(line=>({line,screenScore:lineupScreenScore(line,opponentLines)})).sort((a,b)=>b.screenScore-a.screenScore);
    const candidates=uniqueLines([...(state.playerPicks.length===3?[state.playerPicks]:[]),...screened.slice(0,6).map(x=>x.line)]).slice(0,7);
    const validated=candidates.map((line,index)=>({line,...simulateLineEstimate(line,opponentLines,seed+500000+index*20000,style,3),analysis:recommendationAnalysis(line)})).sort((a,b)=>b.winPct-a.winPct||b.avgAlive-a.avgAlive);
    const current=state.playerPicks.length===3?validated.find(x=>x.line.join(",")===state.playerPicks.join(","))?.winPct??estimateCurrentAcrossUnknown(seed,style):null;
    const top=validated.slice(0,3);
    state.lastRecommendations={createdAt:Date.now(),version:11.2,results:top};saveState();renderRecommendations(top,current);
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
  document.getElementById("dataList").replaceChildren(...ids.map(id=>{const p=POKEMON[id],b=p.rank1,row=document.createElement("article");row.className="data-row";row.innerHTML=`<span class="data-rank">${p.rank?`#${p.rank}<small>性能順位</small>`:`—<small>指数未検証</small>`}</span>${pokemonAvatar(p,"data")}<div class="data-main"><strong>${escapeHtml(p.name)} ${p.metaFeatured?'<span class="meta-inline">環境注目</span>':""}</strong><small>${typeChips(p.types)} ${escapeHtml(moveLabel(p))}</small></div><div class="data-build">CP ${b.cp}<br>Lv ${b.level} / 個体値 ${b.atkIV}/${b.defIV}/${b.hpIV}</div>`;return row}));
  document.getElementById("dataDiagnostics").innerHTML=`<p><strong>数値データ元:</strong> ${escapeHtml(DATA_INFO.source)}</p><p><strong>メタ評価:</strong> PvPoke総合性能順位（2026-07-19）を軸に、GameWithの2026-07-17環境レポートと2026年実戦採用データを別タグで補足しています。GO Battle Logは使用状況を分析する設計ですが、公開画面から完全な全体使用率を固定取得できないため、架空の使用率％は表示しません。</p><p><strong>基準日:</strong> ${new Date(DATA_INFO.updatedAt).toLocaleDateString("ja-JP")}</p><p><strong>収録:</strong> 通常・フォルム ${d.baseForms||0}、シャドウ ${d.shadowForms||0}</p><p><strong>除外:</strong> ${d.excludedCount||0}件${d.excludedCount?`（${(d.excluded||[]).map(x=>`${escapeHtml(x.id)}: ${escapeHtml(x.reason)}`).join(" / ")}）`:"。数値データ不足による除外はありません。"}</p><p>各個体はCP1500以下でSCPが最大となるレベル・個体値を全4096通りから計算しています。攻撃寄り・CMP寄り・手入力にも切替可能です。</p>`;
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
function regenerateOpponentParty(showMessage=true){
  generateStrongOpponentRoster(true);
  state.playerScore=0;state.opponentScore=0;state.gameNumber=1;state.history=[];state.playerPicks=[];state.opponentPicks=[];state.opponentSelectionMeta=null;state.opponentRevealed=false;state.lastRecommendations=null;
  saveState();renderAll();
  if(showMessage){const msg=document.getElementById("rosterMessage");if(msg)msg.textContent="最新メタ候補から、相性補完の異なる相手6体を再生成しました。";switchTab("roster")}
}
function resetMatch(){state.playerScore=0;state.opponentScore=0;state.gameNumber=1;state.history=[];state.playerPicks=[];state.opponentPicks=[];state.opponentSelectionMeta=null;state.opponentRevealed=false;state.lastRecommendations=null;saveState();renderSelection();renderMatch();renderBattleLineups();document.getElementById("recommendationPanel").hidden=true}
function resetAll(){if(!confirm("あなたの登録・個体値・技・選出・履歴を初期化しますか？"))return;state=defaultState();applyCurrentMetaSnapshot();generateStrongOpponentRoster(false);repairStateRosters();saveState();renderAll();switchTab("roster")}

function switchTab(name){document.querySelectorAll(".tab").forEach(button=>button.classList.toggle("is-active",button.dataset.tab===name));document.querySelectorAll(".panel").forEach(panel=>panel.classList.toggle("is-active",panel.id===name));if(name==="selection")renderSelection();if(name==="battle")renderBattleLineups();if(name==="match")renderMatch();if(name==="data")renderDataLibrary(document.getElementById("dataSearch")?.value||"");window.scrollTo({top:0,behavior:"smooth"})}
function startTimer(){clearInterval(timerId);timerValue=90;updateTimer();timerId=setInterval(()=>{timerValue--;updateTimer();if(timerValue<=0){clearInterval(timerId);timerId=null;document.getElementById("selectionMessage").textContent="選出時間が終了しました。"}},1000)}
function updateTimer(){const el=document.getElementById("timer");el.textContent=timerValue;el.closest(".timer-box").classList.toggle("is-low",timerValue<=15)}
function renderAll(){renderRosters();renderSelection();renderBattleLineups();renderMatch();renderDataLibrary(document.getElementById("dataSearch")?.value||"");updateTimer();updateRunBattleButton();if(state.lastRecommendations?.version===11.2&&state.lastRecommendations?.results?.length)renderRecommendations(state.lastRecommendations.results,null);else state.lastRecommendations=null}

function applyRecommendation(line){
  const parsed=String(line||"").split(",").map(Number).filter(n=>Number.isInteger(n)&&n>=0&&n<6);
  if(parsed.length!==3)return;
  state.playerPicks=parsed;state.opponentRevealed=false;state.quickBattleNumber=0;saveState();renderSelection();renderBattleLineups();renderMatch();
  document.getElementById("selectionMessage").textContent="おすすめ選出を反映しました ✨";
  switchTab("selection");
}

function wireEvents(){
  document.querySelectorAll(".tab").forEach(button=>button.addEventListener("click",()=>switchTab(button.dataset.tab)));
  document.getElementById("regenerateOpponent").addEventListener("click",()=>regenerateOpponentParty(true));
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
  document.getElementById("newMatch").addEventListener("click",()=>regenerateOpponentParty(true));
  document.getElementById("matchFormat").addEventListener("change",event=>{state.format=Number(event.target.value);resetMatch()});
  document.getElementById("resetAll").addEventListener("click",resetAll);
  }


const LIVE_RANKINGS_URL="https://raw.githubusercontent.com/pvpoke/pvpoke/master/src/data/rankings/all/overall/rankings-1500.json";
const LIVE_META_CACHE_KEY="pjcs-live-rankings-v09";
const OPPONENT_POOL_TARGET=120;
const OPPONENT_BENCHMARK_TARGET=60;
let META_BOOTSTRAP_READY=false;
const FALLBACK_MOVESET_OVERRIDES={
  annihilape:["LOW_KICK","RAGE_FIST","ICE_PUNCH"],
  cradily:["ACID","ROCK_TOMB","GRASS_KNOT"],
  lickilicky:["ROLLOUT","BODY_SLAM","SHADOW_BALL"],
  tinkaton:["FAIRY_WIND","GIGATON_HAMMER","BULLDOZE"],
  altaria:["DRAGON_BREATH","SKY_ATTACK","FLAMETHROWER"],
  empoleon:["METAL_SOUND","HYDRO_CANNON","DRILL_PECK"],
  quagsire_shadow:["MUD_SHOT","AQUA_TAIL","MUD_BOMB"],
  quagsire:["MUD_SHOT","AQUA_TAIL","MUD_BOMB"],
  jellicent:["HEX","SURF","SHADOW_BALL"],
  forretress:["VOLT_SWITCH","SAND_TOMB","ROCK_TOMB"],
  ninetales:["EMBER","WEATHER_BALL_FIRE","ENERGY_BALL"],
  ninetales_shadow:["EMBER","WEATHER_BALL_FIRE","ENERGY_BALL"],
  feraligatr:["SHADOW_CLAW","HYDRO_CANNON","ICE_BEAM"],
  jumpluff:["FAIRY_WIND","ENERGY_BALL","ACROBATICS"],
  clodsire:["POISON_STING","EARTHQUAKE","STONE_EDGE"],
  corviknight:["SAND_ATTACK","AIR_CUTTER","PAYBACK"],
  fearow:["PECK","DRILL_PECK","DRILL_RUN"],
  azumarill:["BUBBLE","ICE_BEAM","PLAY_ROUGH"],
  guzzlord:["DRAGON_TAIL","BRUTAL_SWING","SLUDGE_BOMB"],
  lapras:["PSYWAVE","SPARKLING_ARIA","ICE_BEAM"],
  furret:["SUCKER_PUNCH","SWIFT","TRAILBLAZE"]
};

function normalizeFastMoveId(id){
  const raw=String(id||"").replace(/_FAST$/,'');
  if(FAST_MOVES[raw])return raw;
  if(FAST_MOVES[`${raw}_FAST`])return `${raw}_FAST`;
  return null;
}
function normalizeChargedMoveId(id){
  const raw=String(id||"");
  if(CHARGED_MOVES[raw])return raw;
  const aliases={WEATHER_BALL_FIRE:"WEATHER_BALL_FIRE",WEATHER_BALL_WATER:"WEATHER_BALL_WATER",WEATHER_BALL_ICE:"WEATHER_BALL_ICE"};
  return aliases[raw]&&CHARGED_MOVES[aliases[raw]]?aliases[raw]:null;
}
function findPokemonIdForRanking(speciesId){
  if(POKEMON[speciesId])return speciesId;
  const wanted=String(speciesId||"").toLowerCase();
  return Object.keys(POKEMON).find(id=>String(POKEMON[id].speciesId||id).toLowerCase()===wanted)||null;
}
function applyOneMoveset(id,moveset,source="PvPoke"){
  const p=POKEMON[id];if(!p||!Array.isArray(moveset)||moveset.length<2)return false;
  const fast=normalizeFastMoveId(moveset[0]);
  const charged=moveset.slice(1).map(normalizeChargedMoveId).filter(Boolean);
  const legalFast=(p.legalFast||[]).includes(fast);
  const legalCharged=charged.filter(move=>(p.legalCharged||[]).includes(move));
  if(!fast||!legalFast||legalCharged.length<1)return false;
  p.fast=fast;p.charged=legalCharged.slice(0,2);p.movesetSource=source;return true;
}
function applyFallbackMovesets(){
  let count=0;
  for(const [id,moveset] of Object.entries(FALLBACK_MOVESET_OVERRIDES))if(applyOneMoveset(id,moveset,"PvPoke 2026-07 fallback"))count++;
  return count;
}
function applyLiveRankings(rankings,sourceLabel="PvPoke live"){
  if(!Array.isArray(rankings)||rankings.length<100)throw new Error("ランキングデータが不完全です");
  const matched=[];let movesetCount=0;
  rankings.forEach((row,index)=>{
    const id=findPokemonIdForRanking(row.speciesId);if(!id)return;
    const p=POKEMON[id];p.rank=index+1;p.metaScore=safeNumber(row.score,0);p.metaFeatured=index<150;p.roleScores=Array.isArray(row.scores)?row.scores.map(Number):null;p.liveRating=safeNumber(row.rating,0);p.metaSources=[sourceLabel];
    if(applyOneMoveset(id,row.moveset||[],sourceLabel))movesetCount++;
    matched.push(id);
  });
  const seen=new Set(matched);META_ORDER=[...matched,...META_ORDER.filter(id=>!seen.has(id))];
  DATA_INFO.liveMeta=true;DATA_INFO.liveMovesetCount=movesetCount;DATA_INFO.liveRankedCount=matched.length;DATA_INFO.liveUpdatedAt=Date.now();DATA_INFO.source=`${EMBEDDED.source} + ${sourceLabel}`;
  clearAnalysisCaches();META_DUEL_CACHE.clear();
  return {matched:matched.length,movesetCount};
}
async function syncLiveRankings(){
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),8000);
  try{
    setDataBanner("最新SL技構成を確認中","PvPokeの現行ランキングと推奨技を照合しています。","loading");
    const response=await fetch(LIVE_RANKINGS_URL,{cache:"no-store",signal:controller.signal});
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    const rankings=await response.json();const result=applyLiveRankings(rankings,"PvPoke live");
    try{localStorage.setItem(LIVE_META_CACHE_KEY,JSON.stringify({savedAt:Date.now(),rankings}));}catch{}
    setDataBanner("最新SL技構成を反映しました",`${result.movesetCount}体の推奨技を現行PvPokeと照合・候補プール${opponentCandidatePool().length}体`,"ready");
    return true;
  }catch(error){
    try{
      const cached=JSON.parse(localStorage.getItem(LIVE_META_CACHE_KEY)||"null");
      if(cached?.rankings&&Date.now()-cached.savedAt<1000*60*60*24*21){
        const result=applyLiveRankings(cached.rankings,"PvPoke cached");
        setDataBanner("保存済みSL技構成を反映しました",`${result.movesetCount}体を直近キャッシュから照合しました。`,"ready");return true;
      }
    }catch{}
    const fallback=applyFallbackMovesets();
    DATA_INFO.liveMeta=false;DATA_INFO.liveMovesetCount=fallback;
    setDataBanner("内蔵技構成で起動しました",`通信できなかったため、主要${fallback}体の監査済み技構成と内蔵データを使用します。`,"warning");
    return false;
  }finally{clearTimeout(timeout)}
}
function roleValue(id,index){
  const p=POKEMON[id],scores=p?.roleScores;
  if(Array.isArray(scores)&&Number.isFinite(Number(scores[index])))return Number(scores[index]);
  if(index===2&&SAFE_SWAP_POOL.has(id))return 90;
  if(index===1&&CLOSER_POOL.has(id))return 90;
  if((index===0||index===3)&&PRESSURE_POOL.has(id))return 90;
  return 78;
}
function opponentCandidatePool(){
  const out=[],seen=new Set();
  for(const id of META_ORDER){
    const p=POKEMON[id];if(!p||!p.fast||(p.charged||[]).length<2)continue;
    if(seen.has(id))continue;seen.add(id);out.push(id);
    if(out.length>=OPPONENT_POOL_TARGET)break;
  }
  if(out.length<100){for(const id of Object.keys(POKEMON)){if(!seen.has(id)&&POKEMON[id].fast&&(POKEMON[id].charged||[]).length>=2){seen.add(id);out.push(id)}if(out.length>=100)break}}
  return out;
}
function metaBenchmarkPool(){return opponentCandidatePool().slice(0,OPPONENT_BENCHMARK_TARGET)}
function quickMatchupIndex(attackerId,defenderId){
  const a=POKEMON[attackerId],d=POKEMON[defenderId];if(!a||!d)return -99;
  const fast=FAST_MOVES[a.fast];const charged=(a.charged||[]).map(id=>CHARGED_MOVES[id]).filter(Boolean);
  const fastPressure=fast?(isAegislash(a)?(1/Math.max(1,fast.turns))*0.45:effectiveness(fast.type,d.types)*(fast.power/Math.max(1,fast.turns))*0.45):0;
  const chargedPressure=charged.length?Math.max(...charged.map(m=>effectiveness(m.type,d.types)*(m.power/Math.max(30,m.energy)))):0;
  const incomingFast=FAST_MOVES[d.fast];const incomingMoves=(d.charged||[]).map(id=>CHARGED_MOVES[id]).filter(Boolean);
  const incoming=Math.max(incomingFast?effectiveness(incomingFast.type,a.types):1,...incomingMoves.map(m=>effectiveness(m.type,a.types)));
  const stat=Math.log(Math.max(1,(a.rank1?.atk||a.atk||100)*(a.rank1?.def||a.def||100)*(a.rank1?.hp||a.hp||100)))/20;
  return fastPressure+chargedPressure*1.25-incoming*.55+stat;
}
function quickTeamScore(team){
  if(team.length!==6||new Set(team.map(id=>POKEMON[id]?.dex)).size!==6)return -Infinity;
  let score=0;const weaknesses={},attackTypes=new Set(),ownTypes=new Set();
  for(const id of team){const p=POKEMON[id];score+=(p.metaScore||Math.max(70,100-(p.rank||180)*.12))*1.2;score+=roleValue(id,2)*.025+roleValue(id,1)*.02+roleValue(id,0)*.012;p.types.forEach(t=>ownTypes.add(t));pokemonAttackTypes(p).forEach(t=>attackTypes.add(t));pokemonWeaknesses(p).forEach(t=>weaknesses[t]=(weaknesses[t]||0)+1)}
  for(const target of metaBenchmarkPool())score+=Math.max(...team.map(id=>quickMatchupIndex(id,target)))*.45;
  score+=attackTypes.size*1.3+ownTypes.size*.7;
  for(const count of Object.values(weaknesses)){if(count>=4)score-=(count-3)*10;else if(count===3)score-=3}
  if(!team.some(id=>roleValue(id,2)>=86))score-=12;if(!team.some(id=>roleValue(id,1)>=86))score-=10;
  return score;
}
function deepTeamScore(team){
  let score=quickTeamScore(team);const benchmark=metaBenchmarkPool().slice(0,24);
  for(const target of benchmark){const duels=team.map(id=>genericMetaDuel(id,target)).sort((a,b)=>b.score-a.score);score+=duels[0].score*4.2+Math.min(2,duels.filter(duelIsStrong).length)*2.2;if(!duels.some(duelIsStrong))score-=7}
  return score;
}
function weightedPick(pool,rng,usedDex){
  const available=pool.filter(id=>!usedDex.has(POKEMON[id].dex));if(!available.length)return null;
  const weights=available.map(id=>Math.max(1,150-(POKEMON[id].rank||150))+(POKEMON[id].metaScore||80));const total=weights.reduce((a,b)=>a+b,0);let r=rng()*total;
  for(let i=0;i<available.length;i++){r-=weights[i];if(r<=0)return available[i]}return available.at(-1);
}
function candidateOpponentTeams(seed){
  const rng=mulberry32(seed>>>0),pool=opponentCandidatePool(),candidates=[];
  const rolePools={safe:pool.filter(id=>roleValue(id,2)>=86),closer:pool.filter(id=>roleValue(id,1)>=86),lead:pool.filter(id=>roleValue(id,0)>=86||roleValue(id,3)>=86)};
  for(let n=0;n<240;n++){
    const team=[],usedDex=new Set();
    for(const role of ["safe","closer","lead"]){const id=weightedPick(rolePools[role].length?rolePools[role]:pool,rng,usedDex);if(id){team.push(id);usedDex.add(POKEMON[id].dex)}}
    while(team.length<6){const id=weightedPick(pool,rng,usedDex);if(!id)break;team.push(id);usedDex.add(POKEMON[id].dex)}
    if(team.length===6)candidates.push(team);
  }
  for(const base of OPPONENT_ARCHETYPES)if(base.length===6)candidates.push([...base]);
  const seen=new Set();return candidates.filter(team=>{const key=[...team].sort().join("|");if(seen.has(key))return false;seen.add(key);return true});
}
function complementPairDetails(aId,bId){
  const a=POKEMON[aId],b=POKEMON[bId];
  const aWeak=pokemonWeaknesses(a),bWeak=pokemonWeaknesses(b);
  const aCovered=aWeak.filter(type=>effectiveness(type,b.types)<1);
  const bCovered=bWeak.filter(type=>effectiveness(type,a.types)<1);
  return {aId,bId,aCovered,bCovered,total:aCovered.length+bCovered.length};
}
function opponentPartyExplanation(team,score){
  const benchmark=metaBenchmarkPool();
  const covered=benchmark.filter(target=>team.some(id=>quickMatchupIndex(id,target)>4.2));
  const uncovered=benchmark.filter(id=>!covered.includes(id));
  const assignment=distinctOpponentRoleAssignment(team);
  const leadIds=[assignment.lead,...team.filter(id=>id!==assignment.lead).sort((a,b)=>Math.max(roleValue(b,0),roleValue(b,3))-Math.max(roleValue(a,0),roleValue(a,3)))].slice(0,2);
  const safeIds=[assignment.safe,...team.filter(id=>id!==assignment.safe).sort((a,b)=>roleValue(b,2)-roleValue(a,2))].slice(0,2);
  const closerIds=[assignment.closer,...team.filter(id=>id!==assignment.closer).sort((a,b)=>roleValue(b,1)-roleValue(a,1))].slice(0,2);
  const attackTypes=[...new Set(team.flatMap(id=>pokemonAttackTypes(POKEMON[id])))];
  const weaknessCounts={};
  for(const id of team)for(const type of pokemonWeaknesses(POKEMON[id]))weaknessCounts[type]=(weaknessCounts[type]||0)+1;
  const sharedWeaknesses=Object.entries(weaknessCounts).filter(([,count])=>count>=3).sort((a,b)=>b[1]-a[1]);
  const pairs=[];
  for(let i=0;i<team.length;i++)for(let j=i+1;j<team.length;j++){const pair=complementPairDetails(team[i],team[j]);if(pair.total)pairs.push(pair)}
  pairs.sort((a,b)=>b.total-a.total);
  return {
    score,coveredIds:covered,weakIds:uncovered.slice(0,6),safeIds,closerIds,leadIds,
    attackTypes,sharedWeaknesses,complementPairs:pairs.slice(0,3),
    poolSize:opponentCandidatePool().length,benchmarkSize:benchmark.length
  };
}

function generateStrongOpponentRoster(forceDifferent=false){
  let seed=(Number(state.opponentPartySeed)||Date.now())>>>0;if(forceDifferent)seed=(seed+0x9E3779B9)>>>0;
  const oldKey=(state.opponentRoster||[]).join("|");const candidates=candidateOpponentTeams(seed);
  const quick=candidates.map(team=>({team,quick:quickTeamScore(team)})).sort((a,b)=>b.quick-a.quick).slice(0,6);
  let ranked=quick.map(x=>({team:x.team,score:deepTeamScore(x.team)})).sort((a,b)=>b.score-a.score);
  if(forceDifferent)ranked=ranked.filter(x=>x.team.join("|")!==oldKey).concat(ranked.filter(x=>x.team.join("|")===oldKey));
  const top=ranked.slice(0,Math.min(4,ranked.length));const pick=top[Math.floor(mulberry32(seed^0xA5A5A5A5)()*top.length)]||ranked[0];
  state.opponentPartySeed=seed;state.opponentRoster=[...pick.team];state.opponentBuilds=Array(6).fill(null);
  state.opponentPartyMeta={version:11.1,generatedAt:Date.now(),...opponentPartyExplanation(pick.team,pick.score),sources:[DATA_INFO.liveMeta?"PvPoke live":"PvPoke fallback","内蔵対戦エンジン"]};
  state.opponentPicks=[];state.opponentSelectionMeta=null;state.opponentRevealed=false;state.lastRecommendations=null;state.quickBattleNumber=0;clearAnalysisCaches();
}
function repairStateRosters(){
  const player=Array.from({length:6},(_,i)=>POKEMON[state.playerRoster?.[i]]?state.playerRoster[i]:null),seenDex=new Set();
  state.playerRoster=player.map(id=>{if(!id)return null;const dex=POKEMON[id].dex;if(seenDex.has(dex))return null;seenDex.add(dex);return id});
  const invalidOpponent=!Array.isArray(state.opponentRoster)||state.opponentRoster.length!==6||state.opponentRoster.some(id=>!POKEMON[id])||state.opponentPartyMeta?.version!==11.1;
  if(invalidOpponent){
    if(META_BOOTSTRAP_READY)generateStrongOpponentRoster(false);
    else{
      const used=new Set(),seedTeam=[];
      for(const id of opponentCandidatePool()){const dex=POKEMON[id].dex;if(used.has(dex))continue;used.add(dex);seedTeam.push(id);if(seedTeam.length===6)break}
      state.opponentRoster=seedTeam;state.opponentBuilds=Array(6).fill(null);state.opponentPartyMeta={version:11.1,generatedAt:Date.now(),coveredIds:[],weakIds:[],safeIds:[],closerIds:[],leadIds:[],attackTypes:[],sharedWeaknesses:[],complementPairs:[],poolSize:opponentCandidatePool().length,benchmarkSize:metaBenchmarkPool().length};
    }
  }
  state.playerBuilds=Array.from({length:6},(_,i)=>state.playerBuilds?.[i]||null);state.opponentBuilds=Array.from({length:6},(_,i)=>state.opponentBuilds?.[i]||null);
  state.playerPicks=(state.playerPicks||[]).filter(i=>i>=0&&i<6&&state.playerRoster[i]).slice(0,3);state.opponentPicks=(state.opponentPicks||[]).filter(i=>i>=0&&i<6).slice(0,3);
  state.opponentRevealed=Boolean(state.opponentRevealed);state.quickBattleNumber=Math.max(0,Math.trunc(Number(state.quickBattleNumber)||0));if(!state.opponentSelectionMeta||state.opponentSelectionMeta.version!==10)state.opponentSelectionMeta=null;saveState();
}
function formatMultiplier(value){
  const v=Number(value);if(Math.abs(v-1)<1e-6)return "×1.0";if(Math.abs(v-1.6)<1e-6)return "×1.6";if(Math.abs(v-2.56)<1e-6)return "×2.56";if(Math.abs(v-.625)<1e-6)return "×0.625";if(Math.abs(v-.390625)<1e-6)return "×0.391";if(Math.abs(v-.244140625)<1e-6)return "×0.244";return `×${v.toFixed(3).replace(/0+$/,'').replace(/\.$/,'')}`;
}
function opponentMatchupReasons(opponentIndex,playerIndex){
  const attacker=effectivePokemon("opponent",opponentIndex),defender=effectivePokemon("player",playerIndex);if(!attacker||!defender)return [];
  const reasons=[],fast=fastObject(attacker),playerFast=fastObject(defender),pressure=bestPressureMove(attacker,defender);const fastEff=effectiveness(fast.type,defender.types),incomingFastEff=effectiveness(playerFast.type,attacker.types);
  if(isAegislash(attacker))reasons.push(`シールド中：通常技1ダメージ・E+6（${fast.turns}T）`);
  else reasons.push(`通常技 ${fast.name}：${formatMultiplier(fastEff)}`);
  if(pressure){
    const chargedDetail=isAegislash(attacker)
      ? `ブレードフォルムの攻撃実数値で計算・相性${formatMultiplier(pressure.eff)}・約${pressure.turns}T`
      : `相性${formatMultiplier(pressure.eff)}・約${pressure.turns}T`;
    reasons.push(`ゲージ技 ${pressure.move.name}：${chargedDetail}`);
  }
  if(incomingFastEff<1)reasons.push(`相手の${playerFast.name}を${formatMultiplier(incomingFastEff)}に抑える`);
  const resisted=chargedObjects(defender).map(move=>({move,eff:effectiveness(move.type,attacker.types)})).filter(x=>x.eff<1).sort((a,b)=>a.eff-b.eff);
  if(resisted.length)reasons.push(`${resisted[0].move.name}を${formatMultiplier(resisted[0].eff)}に抑える`);
  if(chargedCmpStat(attacker)>chargedCmpStat(defender)*1.01)reasons.push(isAegislash(attacker)?"ブレード変化後はCMPを取りやすい":"CMPを取りやすい");
  const effectMove=chargedObjects(attacker).find(move=>(move.effects||[]).length);if(effectMove)reasons.push(`${effectMove.name}：${moveEffectText(effectMove.effects[0])}`);
  return reasons.slice(0,5);
}
function shieldMatrixVisual(duel,perspective="player"){
  const own=perspective==="player"?"playerShields":"opponentShields";
  const other=perspective==="player"?"opponentShields":"playerShields";
  const rowLabel=perspective==="player"?"あなた":"相手AI";
  const colLabel=perspective==="player"?"相手AI":"あなた";
  let cells='<span class="shield-corner">盾</span>'+[0,1,2].map(n=>`<span class="shield-head">${n}</span>`).join('');
  for(const ownS of [0,1,2]){
    cells+=`<span class="shield-head">${ownS}</span>`;
    for(const otherS of [0,1,2]){
      const row=duel.outcomes.find(x=>x[own]===ownS&&x[other]===otherS);
      const win=row?.winner===perspective;
      cells+=`<span class="shield-cell ${win?'is-win':'is-loss'}" title="${rowLabel}${ownS}枚・${colLabel}${otherS}枚">${win?'○':'×'}</span>`;
    }
  }
  return `<div class="shield-matrix-panel"><div class="matrix-axis"><b>行：${rowLabel}</b><span>列：${colLabel}</span></div><div class="shield-matrix" aria-label="行は${rowLabel}、列は${colLabel}のシールド枚数">${cells}</div></div>`;
}
function visualMon(p,size="pick",showName=true){return `<span class="visual-mon">${spriteToken(p,size)}${showName?`<strong>${escapeHtml(p.name)}</strong>`:''}</span>`}
function outcomeDots(duel,perspective="opponent"){
  const own=perspective==="player"?"playerShields":"opponentShields",other=perspective==="player"?"opponentShields":"playerShields";
  const actor=perspective==="player"?"あなた":"相手AI",target=perspective==="player"?"相手AI":"あなた";
  return `<span class="outcome-dots" aria-label="9シールド条件">${[0,1,2].flatMap(a=>[0,1,2].map(b=>{const row=duel.outcomes.find(x=>x[own]===a&&x[other]===b);const win=row?.winner===perspective;return `<i class="${win?'dot-win':'dot-loss'}" title="${actor}${a}枚・${target}${b}枚：${win?'勝ち':'負け'}"></i>`})).join('')}</span>`;
}
function matchupVisual(attacker,defender,duel,reasons,perspective="opponent"){
  const wins=perspective==="opponent"?duel.wins:9-duel.wins;
  const label=wins>=6?"有利":wins<=3?"不利":"互角";
  const actorLabel=perspective==="opponent"?"相手AI":"あなた";
  const targetLabel=perspective==="opponent"?"あなた":"相手AI";
  return `<article class="matchup-visual compact-matchup">
    <div class="duel-actors"><div><span>${actorLabel}</span>${spriteToken(attacker,"option")}</div><b>→</b><div><span>${targetLabel}</span>${spriteToken(defender,"option")}</div></div>
    <div class="matchup-score"><strong>${wins}/9</strong><span>${label}</span>${outcomeDots(duel,perspective)}</div>
    <div class="reason-chips">${(reasons||[]).slice(0,4).map(x=>`<span>${escapeHtml(x)}</span>`).join('')}</div>
    <details class="shield-details"><summary>シールド9条件</summary>${shieldMatrixVisual(duel,perspective)}</details>
  </article>`;
}
function answerCard(playerMon,aiMon,duel,perspective="opponent"){
  const wins=perspective==="opponent"?duel.wins:9-duel.wins;
  return `<article class="answer-card">
    <div class="answer-flow"><div><span>あなた</span>${spriteToken(playerMon,"option")}</div><b>⇩</b><div><span>AI回答</span>${spriteToken(aiMon,"option")}</div></div>
    <div class="answer-score"><strong>${wins}/9</strong><span>${wins>=6?'明確な回答':wins>=4?'五分付近':'回答不足'}</span></div>
    ${outcomeDots(duel,perspective)}
  </article>`;
}
function opponentAnalysisHtml(meta,compact=false){
  const a=meta.analysis;
  const lineup=`<div class="ai-lineup visual-lineup sprite-only-lineup">${meta.line.map((index,i)=>`<div class="ai-lineup-mon"><span class="role-badge">${["先発","引き先","締め"][i]}</span>${spriteToken(effectivePokemon("opponent",index),"pick")}</div>`).join("")}</div>`;
  const summary=`<div class="visual-summary"><div><strong>${meta.winPct.toFixed(1)}%</strong><span>抽選後の対戦評価</span></div><div><strong>${meta.selectionRank||"—"}位</strong><span>予測分布内</span></div><div><strong>${((meta.selectionProbability||0)*100).toFixed(1)}%</strong><span>この選出の抽選確率</span></div></div><p class="selection-draw-note">均等なら約${((meta.uniformProbability||1/60)*100).toFixed(1)}%。3体選出画面と同じ分布から抽選されています。</p>`;
  const roles=a.members.map(member=>{
    const mon=effectivePokemon("opponent",member.opponentIndex);
    const targets=member.strong.slice(0,2).map(target=>matchupVisual(mon,effectivePokemon("player",target.playerIndex),target.duel,target.reasons,"opponent")).join('');
    return `<section class="visual-role-section"><div class="visual-role-head sprite-role-head">${spriteToken(mon,"pick")}<span class="role-badge">${escapeHtml(member.role)}</span><div class="role-stats"><b>有利 ${member.metrics.favorable.length}</b><b>互角 ${member.metrics.neutral.length}</b><b>不利 ${member.metrics.hard.length}</b></div></div>${targets||'<p class="muted">明確な有利対面なし</p>'}</section>`;
  }).join('');
  const coverage=`<section class="visual-coverage answer-board-section"><div class="board-title"><h4>あなたの6体への最善回答</h4><small>上＝あなた　下＝相手AIの回答</small></div><div class="answer-board">${a.coverage.map(row=>answerCard(effectivePokemon("player",row.playerIndex),effectivePokemon("opponent",row.bestOpponentIndex),row.duel,"opponent")).join('')}</div></section>`;
  const warningCards=`<div class="warning-cards sprite-warning-cards">${a.heavy.slice(0,3).map(row=>`<div class="warning-card explicit-warning"><span>相手AIの3体では</span>${spriteToken(effectivePokemon("player",row.playerIndex),"inline")}<strong>への明確な回答なし</strong></div>`).join('')}${a.narrow.slice(0,3).map(row=>{const answer=row.solid[0];return `<div class="warning-card narrow explicit-warning"><span>あなたの</span>${spriteToken(effectivePokemon("player",row.playerIndex),"inline")}<span>に有利なのはAIの</span>${spriteToken(effectivePokemon("opponent",answer?.opponentIndex),"inline")}<strong>${answer?.duel?.wins||0}/9</strong></div>`}).join('')}</div>`;
  const alternatives=meta.alternatives?.length?`<details class="ai-alternatives"><summary>次点の相手選出</summary>${meta.alternatives.map((alt,i)=>`<div class="alternative-line"><b>#${i+2}</b>${alt.line.map(index=>spriteToken(effectivePokemon("opponent",index),"option")).join('')}<em>予測${((alt.probability||0)*100).toFixed(1)}%・対戦評価${alt.winPct.toFixed(1)}%</em></div>`).join('')}</details>`:"";
  return `${summary}${lineup}${compact?coverage:`${roles}${coverage}${warningCards}${alternatives}`}<p class="basis-note">公開されたあなたの6体だけを参照。現在選択中の3体は相手AIへ渡していません。</p>`;
}
function recommendationAnswerCard(row){
  const player=effectivePokemon('player',row.playerIndex),opponent=effectivePokemon('opponent',row.opponentIndex);
  return `<article class="answer-card player-answer"><div class="answer-flow"><div><span>相手AI</span>${spriteToken(opponent,'option')}</div><b>⇩</b><div><span>あなたの回答</span>${spriteToken(player,'option')}</div></div><div class="answer-score"><strong>${row.duel.wins}/9</strong><span>${row.duel.wins>=6?'明確な回答':row.duel.wins>=4?'五分付近':'回答不足'}</span></div>${outcomeDots(row.duel,'player')}</article>`;
}

function distinctOpponentRoleAssignment(team){
  let best={lead:team[0],safe:team[1]||team[0],closer:team[2]||team[0],score:-Infinity};
  for(const lead of team)for(const safe of team)for(const closer of team){
    if(new Set([lead,safe,closer]).size<3)continue;
    const score=Math.max(roleValue(lead,0),roleValue(lead,3))*6+roleValue(safe,2)*8+roleValue(closer,1)*6;
    if(score>best.score)best={lead,safe,closer,score};
  }
  return best;
}
function distinctPlayerRoleAssignment(metrics){
  let best={lead:metrics[0],safe:metrics[1]||metrics[0],closer:metrics[2]||metrics[0],score:-Infinity};
  for(const lead of metrics)for(const safe of metrics)for(const closer of metrics){
    if(new Set([lead.playerIndex,safe.playerIndex,closer.playerIndex]).size<3)continue;
    const score=lead.leadNorm*6+safe.safeNorm*8+closer.closerNorm*6;
    if(score>best.score)best={lead,safe,closer,score};
  }
  return best;
}
function buildSignatureForSide(side){
  const roster=state[rosterKey(side)],builds=state[buildsKey(side)];
  return roster.map((id,index)=>id&&POKEMON[id]?buildCacheSignature(roster,index,builds):"empty").join("|");
}
function playerMetaDuel(playerIndex,targetId){
  const playerSig=buildCacheSignature(state.playerRoster,playerIndex,state.playerBuilds),key=`${playerSig}|meta:${targetId}|shield9`;
  if(PLAYER_META_DUEL_CACHE.has(key))return PLAYER_META_DUEL_CACHE.get(key);
  const outcomes=[];
  for(const playerShields of [0,1,2])for(const opponentShields of [0,1,2]){
    const seed=stringHash(`${key}|${playerShields}|${opponentShields}`);
    const result=simulateBattle(state.playerRoster,[playerIndex],[targetId],[0],seed,"balanced",false,state.playerBuilds,[null],{playerShields,opponentShields});
    outcomes.push({playerShields,opponentShields,winner:result.winner,margin:clamp(result.player.hp-result.opponent.hp,-1,1)});
  }
  const summary=summarizeDuel(outcomes,"player");PLAYER_META_DUEL_CACHE.set(key,summary);return summary;
}
function weaknessBalance(mons){
  const counts={},items=[];
  for(const mon of mons){for(const type of pokemonWeaknesses(mon)){counts[type]=(counts[type]||0)+1;items.push({mon,type,covered:mons.some(other=>other.id!==mon.id&&effectiveness(type,other.types)<1)})}}
  const covered=items.filter(x=>x.covered).length,total=items.length;
  const overlapPenalty=Object.values(counts).reduce((sum,count)=>sum+(count>=3?(count-2)**1.35:0),0);
  const concentration=scoreClamp(1-overlapPenalty/12);
  return {counts,items,covered,total,coverRate:total?covered/total:1,concentration,shared:Object.entries(counts).filter(([,count])=>count>=3).sort((a,b)=>b[1]-a[1])};
}
function offensiveCoverage(mons,benchmarkIds){
  const attackTypes=[...new Set(mons.flatMap(mon=>pokemonAttackTypes(mon)))];
  const pressured=benchmarkIds.filter(id=>{const target=monFromId(id);return mons.some(mon=>[fastObject(mon),...chargedObjects(mon)].some(move=>move&&effectiveness(move.type,target.types)>1.01))});
  return {attackTypes,pressured,pressureRate:benchmarkIds.length?pressured.length/benchmarkIds.length:0};
}
function playerMetaRoleMetrics(playerIndex,benchmarkIds){
  const mon=effectivePokemon("player",playerIndex),duels=benchmarkIds.map(targetId=>({targetId,duel:playerMetaDuel(playerIndex,targetId)}));
  const favorable=duels.filter(x=>duelIsStrong(x.duel)),hard=duels.filter(x=>duelIsHard(x.duel)),neutral=duels.filter(x=>!duelIsStrong(x.duel)&&!duelIsHard(x.duel));
  const zeroWins=duels.filter(x=>x.duel.outcomes.find(o=>o.playerShields===0&&o.opponentShields===0)?.winner==="player").length;
  const oneWins=duels.filter(x=>x.duel.outcomes.find(o=>o.playerShields===1&&o.opponentShields===1)?.winner==="player").length;
  const shieldDown=duels.reduce((sum,x)=>sum+x.duel.shieldDownWins,0),fastest=fastestChargedProfile(mon);
  const n=Math.max(1,duels.length),speed=Number.isFinite(fastest?.turns)?scoreClamp((24-fastest.turns)/18):0;
  const leadNorm=scoreClamp((favorable.length+.45*neutral.length-.35*hard.length)/n);
  const safeNorm=scoreClamp((favorable.length+.72*neutral.length-.42*hard.length)/n+speed*.12+(shieldDown/(n*3))*.12);
  const closerNorm=scoreClamp((zeroWins+.52*oneWins)/(n*1.52)-hard.length/n*.12+(strongestChargedProfile(mon)?.power||0)/1000);
  return {playerIndex,mon,duels,favorable,neutral,hard,zeroWins,oneWins,shieldDown,fastest,leadNorm,safeNorm,closerNorm};
}
function componentRow(label,points,max,reason){
  const safePoints=clamp(Number(points)||0,0,max),pct=max?safePoints/max*100:0;
  return `<article class="score-component"><div class="component-head"><strong>${escapeHtml(label)}</strong><b>${safePoints.toFixed(1)}<small> / ${max}点</small></b></div><div class="component-bar"><i style="width:${pct.toFixed(1)}%"></i></div><p>${reason}</p></article>`;
}
function computePlayerPartyScore(){
  const benchmark=metaBenchmarkPool(),deepBenchmark=benchmark.slice(0,24),mons=state.playerRoster.map((_,i)=>effectivePokemon("player",i));
  const quickRows=benchmark.map(targetId=>{const target=monFromId(targetId),scores=mons.map(mon=>quickMatchupMon(mon,target));return {targetId,best:Math.max(...scores),answers:scores.filter(x=>x>4.2).length}});
  const quickCovered=quickRows.filter(x=>x.answers>0),deepRows=deepBenchmark.map(targetId=>{const duels=mons.map((_,i)=>playerMetaDuel(i,targetId));return {targetId,duels,best:[...duels].sort((a,b)=>b.score-a.score)[0],answers:duels.filter(duelIsStrong).length}});
  const deepCovered=deepRows.filter(x=>x.answers>0),metaPoints=18*(quickCovered.length/Math.max(1,benchmark.length))+12*(deepCovered.length/Math.max(1,deepBenchmark.length));
  const weakness=weaknessBalance(mons),defensePoints=12*weakness.coverRate+8*weakness.concentration;
  const offense=offensiveCoverage(mons,benchmark),offensePoints=8*Math.min(1,offense.attackTypes.length/10)+7*offense.pressureRate;
  const roleMetrics=mons.map((_,i)=>playerMetaRoleMetrics(i,deepBenchmark));
  const roleAssignment=distinctPlayerRoleAssignment(roleMetrics),bestLead=roleAssignment.lead,bestSafe=roleAssignment.safe,bestCloser=roleAssignment.closer;
  const rolePoints=roleAssignment.score;
  const redundancy=quickRows.reduce((sum,row)=>sum+Math.min(2,row.answers)/2,0)/Math.max(1,quickRows.length);
  const quality=mons.reduce((sum,mon)=>sum+scoreClamp(((mon.metaScore||Math.max(70,100-(mon.rank||180)*.12))-70)/30),0)/mons.length;
  const depthPoints=8*redundancy+7*quality;
  const total=Math.round(metaPoints+defensePoints+offensePoints+rolePoints+depthPoints);
  const holes=deepRows.filter(row=>row.answers===0).slice(0,6).map(row=>row.targetId);
  const singleAnswers=deepRows.filter(row=>row.answers===1).slice(0,6).map(row=>row.targetId);
  return {total,components:{metaPoints,defensePoints,offensePoints,rolePoints,depthPoints},benchmarkCount:benchmark.length,quickCovered:quickCovered.length,deepCount:deepBenchmark.length,deepCovered:deepCovered.length,weakness,offense,bestLead,bestSafe,bestCloser,redundancy,quality,holes,singleAnswers};
}
function partyScoreHtml(result){
  const c=result.components,shared=result.weakness.shared;
  const weaknesses=shared.length?shared.map(([type,count])=>`<span class="type-cover-chip type-${escapeHtml(type)}">${escapeHtml(typeName(type))}<em>${count}体</em></span>`).join(''):'<span class="good-note">3体以上で重なる弱点なし</span>';
  const holes=result.holes.length?result.holes.map(id=>spriteToken(POKEMON[id],"option")).join(''):'<span class="good-note">上位24体に明確な未回答なし</span>';
  return `<div class="score-card-head">${scoreRing(result.total,"6体パーティ評価")}<div><p class="step">TEAM BUILD SCORE</p><h3>あなたの6体パーティ評価</h3><p>アプリ独自式。現環境候補への実戦回答と、タイプ・役割の構造を分けて採点します。</p></div></div><div class="score-components">${componentRow('環境への回答',c.metaPoints,30,`上位${result.benchmarkCount}体へ簡易回答 ${result.quickCovered}体。上位${result.deepCount}体を9シールド条件で再検証し、明確な回答 ${result.deepCovered}体。`)}${componentRow('守備・弱点補完',c.defensePoints,20,`各ポケモンの弱点を別の味方が×1未満で受けられる割合 ${(result.weakness.coverRate*100).toFixed(0)}%。弱点集中も減点します。`)}${componentRow('技の攻撃範囲',c.offensePoints,15,`${result.offense.attackTypes.length}タイプの攻撃技を持ち、基準メタの${(result.offense.pressureRate*100).toFixed(0)}%へ効果抜群技を用意。`)}${componentRow('役割の完成度',c.rolePoints,20,`初手 ${Math.round(result.bestLead.leadNorm*100)}、引き先 ${Math.round(result.bestSafe.safeNorm*100)}、締め ${Math.round(result.bestCloser.closerNorm*100)}の適性指数から採点。`)}${componentRow('回答の厚み・個体性能',c.depthPoints,15,`1つの相手へ回答を2体以上持つ厚み ${(result.redundancy*100).toFixed(0)}%。現環境での個体性能も加味。`)}</div><div class="score-explain-grid"><section><h4>役割の中心</h4><div class="score-role-lane"><span>初手</span>${spriteToken(result.bestLead.mon,"option")}<em>有利${result.bestLead.favorable.length}・不利${result.bestLead.hard.length}</em></div><div class="score-role-lane"><span>引き先</span>${spriteToken(result.bestSafe.mon,"option")}<em>互角以上${result.bestSafe.favorable.length+result.bestSafe.neutral.length}/${result.deepCount}</em></div><div class="score-role-lane"><span>締め</span>${spriteToken(result.bestCloser.mon,"option")}<em>0盾勝利${result.bestCloser.zeroWins}/${result.deepCount}</em></div></section><section><h4>減点ポイント</h4><div class="score-chip-row">${weaknesses}</div><div class="score-hole-row"><span>上位24体で回答が薄い</span><div>${holes}</div></div></section></div><details class="score-formula"><summary>100点の配点を見る</summary><p>環境回答30点、守備補完20点、攻撃範囲15点、役割完成度20点、回答の厚み・現環境性能15点です。PvPoke順位だけでなく、現在の技構成で9通りのシールド対面を再計算します。</p></details>`;
}
function renderPlayerPartyScore(){
  const root=document.getElementById("playerPartyScorePanel");if(!root)return;
  if(state.playerRoster.some(id=>!id||!POKEMON[id])){root.innerHTML='<div class="score-empty"><strong>6体を登録するとパーティを100点満点で採点します</strong><span>環境回答・弱点補完・技範囲・初手／引き先／締めを評価します。</span></div>';return}
  const signature=`party111|${buildSignatureForSide("player")}|${META_ORDER.slice(0,60).join(',')}`;
  if(PARTY_SCORE_CACHE.has(signature)){root.innerHTML=partyScoreHtml(PARTY_SCORE_CACHE.get(signature));return}
  root.innerHTML='<div class="score-loading"><strong>6体パーティを採点中…</strong><span>上位60体への簡易評価と、上位24体への9シールド対面を確認しています。</span></div>';
  if(partyScorePendingSignature===signature)return;partyScorePendingSignature=signature;
  setTimeout(()=>{try{const result=computePlayerPartyScore();PARTY_SCORE_CACHE.set(signature,result);if(buildSignatureForSide("player")&&signature===`party111|${buildSignatureForSide("player")}|${META_ORDER.slice(0,60).join(',')}`)root.innerHTML=partyScoreHtml(result)}catch(error){console.error(error);root.innerHTML='<div class="score-empty">採点に失敗しました。技・個体値を確認してください。</div>'}finally{if(partyScorePendingSignature===signature)partyScorePendingSignature=null}},30);
}
function playerSelectionRoleMetrics(index){
  const mon=effectivePokemon("player",index),duels=state.opponentRoster.map((_,opponentIndex)=>({opponentIndex,duel:headToHeadBySlots(index,opponentIndex)}));
  const favorable=duels.filter(x=>duelIsStrong(x.duel)),hard=duels.filter(x=>duelIsHard(x.duel)),neutral=duels.filter(x=>!duelIsStrong(x.duel)&&!duelIsHard(x.duel));
  const zeroWins=duels.filter(x=>x.duel.outcomes.find(o=>o.playerShields===0&&o.opponentShields===0)?.winner==="player").length;
  const oneWins=duels.filter(x=>x.duel.outcomes.find(o=>o.playerShields===1&&o.opponentShields===1)?.winner==="player").length;
  const shieldDown=duels.reduce((sum,x)=>sum+x.duel.shieldDownWins,0),fastest=fastestChargedProfile(mon),speed=Number.isFinite(fastest?.turns)?scoreClamp((24-fastest.turns)/18):0;
  const safeNorm=scoreClamp((favorable.length+.7*neutral.length-.4*hard.length)/6+speed*.12+(shieldDown/18)*.12);
  const closerNorm=scoreClamp((zeroWins+.5*oneWins)/9-hard.length/6*.12+(strongestChargedProfile(mon)?.power||0)/1000);
  return {index,mon,duels,favorable,hard,neutral,zeroWins,oneWins,shieldDown,fastest,safeNorm,closerNorm};
}
function canonicalSelectionLineKey(line){
  if(!Array.isArray(line)||line.length!==3)return "";
  const backs=[Number(line[1]),Number(line[2])].sort((a,b)=>a-b);
  return `${Number(line[0])}|${backs[0]}|${backs[1]}`;
}
function computeSelectionScore(line){
  const key=`selection111|${buildSignatureForSide("player")}|${buildSignatureForSide("opponent")}|${line.join(',')}`;if(SELECTION_SCORE_CACHE.has(key))return SELECTION_SCORE_CACHE.get(key);
  const opponentLines=opponentLineDistribution(),allLines=lineupPermutations(),ranked=allLines.map(candidate=>({line:candidate,value:lineupScreenScore(candidate,opponentLines)})).sort((a,b)=>b.value-a.value);
  const selectedValue=lineupScreenScore(line,opponentLines),epsilon=1e-9;
  const rank=clamp(1+ranked.filter(row=>row.value>selectedValue+epsilon).length,1,Math.max(1,ranked.length));
  const tieCount=ranked.filter(row=>Math.abs(row.value-selectedValue)<=epsilon).length;
  const percentile=ranked.length<=1?1:clamp(1-(rank-1)/(ranked.length-1),0,1);
  const rows=state.opponentRoster.map((_,opponentIndex)=>{const duels=line.map(playerIndex=>({playerIndex,duel:headToHeadBySlots(playerIndex,opponentIndex)})).sort((a,b)=>b.duel.score-a.duel.score);return {opponentIndex,best:duels[0],answers:duels.filter(x=>duelIsStrong(x.duel))}});
  const strongRows=rows.filter(row=>row.answers.length>0),avgBestWins=rows.reduce((sum,row)=>sum+row.best.duel.wins,0)/6;
  const tacticalPoints=clamp(30*percentile,0,30),coveragePoints=15*(strongRows.length/6)+10*(avgBestWins/9);
  const leadDuels=state.opponentRoster.map((_,opponentIndex)=>headToHeadBySlots(line[0],opponentIndex)),leadAvg=leadDuels.reduce((s,d)=>s+d.wins,0)/6,leadHard=leadDuels.filter(duelIsHard).length,leadPoints=10*(leadAvg/9)+5*(1-leadHard/6);
  const safe=playerSelectionRoleMetrics(line[1]),closer=playerSelectionRoleMetrics(line[2]),rolePoints=8*safe.safeNorm+7*closer.closerNorm;
  const redundancy=rows.reduce((sum,row)=>sum+Math.min(2,row.answers.length)/2,0)/6;
  const selectedMons=line.map(index=>effectivePokemon("player",index)),weakness=weaknessBalance(selectedMons),supportPoints=7*redundancy+3*(weakness.coverRate*.65+weakness.concentration*.35);
  const total=Math.round(clamp(tacticalPoints+coveragePoints+leadPoints+rolePoints+supportPoints,0,100)),heavy=rows.filter(row=>row.answers.length===0),narrow=rows.filter(row=>row.answers.length===1);
  const likelyOpponentLines=opponentLines.slice(0,3).map(row=>({line:row.line,probability:row.probability,score:row.score,coverage:row.covered,deadSlots:row.deadSlots}));
  const top10Share=opponentLines.slice(0,10).reduce((sum,row)=>sum+row.probability,0);
  const result={total,rank,tieCount,selectionCount:ranked.length,tacticalPoints,coveragePoints,leadPoints,rolePoints,supportPoints,strongRows,avgBestWins,leadAvg,leadHard,safe,closer,redundancy,weakness,rows,heavy,narrow,line,likelyOpponentLines,top10Share};SELECTION_SCORE_CACHE.set(key,result);return result;
}
function selectionScoreHtml(result){
  const lead=effectivePokemon("player",result.line[0]);
  const heavy=result.heavy.length?result.heavy.map(row=>spriteToken(effectivePokemon("opponent",row.opponentIndex),"option")).join(''):'<span class="good-note">相手6体すべてに回答あり</span>';
  const narrow=result.narrow.length?result.narrow.map(row=>{const answer=row.answers[0];return `<span class="single-answer-chip explicit-answer"><span>相手の</span>${spriteToken(effectivePokemon("opponent",row.opponentIndex),"inline")}<span>に明確に勝てるのは、あなたの</span>${spriteToken(effectivePokemon("player",answer.playerIndex),"inline")}<strong>${answer.duel.wins}/9</strong></span>`}).join(''):'<span class="good-note">回答の1体依存は小さい</span>';
  const likely=`<section class="opponent-prediction"><div class="prediction-title"><h4>相手が出してきそうな選出</h4><small>あなたの選択中3体は見ず、公開6体だけで推定</small></div>${result.likelyOpponentLines.map((row,index)=>`<div class="predicted-line"><span>#${index+1}</span><div>${row.line.map((opponentIndex,i)=>`<span class="predicted-mon"><small>${i===0?'先発':'控え'}</small>${spriteToken(effectivePokemon('opponent',opponentIndex),'inline')}</span>`).join('')}</div><strong>${(row.probability*100).toFixed(1)}%</strong></div>`).join('')}<p>60通りを均等に扱う場合は1選出あたり約1.7%。上位10選出で推定確率の${(result.top10Share*100).toFixed(0)}%です。相手AIの実戦選出も、この同じ確率分布から1回抽選します。</p></section>`;
  return `<div class="score-card-head">${scoreRing(result.total,"3体選出評価")}<div><p class="step">PICK SCORE</p><h3>この3体選出の評価</h3><p>相手の公開6体だけを使い、相手の実際の3体を覗かず採点しています。</p></div></div><div class="score-components selection-score-components">${componentRow('選出順位による得点',result.tacticalPoints,30,`順位は ${result.rank}位${result.tieCount>1?`タイ（同点${result.tieCount}通り）`:''} / ${result.selectionCount}通り。1位ほど30点に近づき、最下位は0点です。控え2体の並び順は区別しません。`)}${componentRow('相手6体への回答力',result.coveragePoints,25,`明確な回答 ${result.strongRows.length}/6体。各相手への最善対面は平均 ${result.avgBestWins.toFixed(1)}/9勝。`)}${componentRow('先発の安定性',result.leadPoints,15,`先発の平均 ${result.leadAvg.toFixed(1)}/9勝。明確に不利な初手は${result.leadHard}体。`)}${componentRow('引き先・締めの成立',result.rolePoints,15,`引き先指数 ${Math.round(result.safe.safeNorm*100)}、締め指数 ${Math.round(result.closer.closerNorm*100)}。技回転と0盾性能を含みます。`)}${componentRow('回答の厚み・3体補完',result.supportPoints,10,`2体以上で回答できる厚み ${(result.redundancy*100).toFixed(0)}%。3体内の弱点補完率 ${(result.weakness.coverRate*100).toFixed(0)}%。`)}</div>${likely}<div class="score-explain-grid"><section><h4>役割配置</h4><div class="score-role-lane"><span>先発</span>${spriteToken(lead,"option")}<em>平均${result.leadAvg.toFixed(1)}/9</em></div><div class="score-role-lane"><span>引き先</span>${spriteToken(result.safe.mon,"option")}<em>互角以上${result.safe.favorable.length+result.safe.neutral.length}/6</em></div><div class="score-role-lane"><span>締め</span>${spriteToken(result.closer.mon,"option")}<em>0盾勝利${result.closer.zeroWins}/6</em></div></section><section><h4>選出リスク</h4><div class="score-hole-row"><span>3体全員で重い</span><div>${heavy}</div></div><div class="score-hole-row"><span>回答が1体だけ</span><div>${narrow}</div></div></section></div><details class="score-formula"><summary>100点の配点を見る</summary><p>選出順位による得点30点、相手6体への回答25点、先発15点、引き先・締め15点、回答の厚みと3体補完10点です。相手60選出は、先発の通り22%、6体への回答範囲38%、回答の厚み15%、採用3体それぞれの刺さり15%、引き先・締め適性10%で選出確率を推定します。</p></details>`;
}
function renderSelectionScorePanel(){
  const root=document.getElementById("selectionScorePanel");if(!root)return;
  if(state.playerPicks.length!==3){root.innerHTML=`<div class="score-empty"><strong>3体を選ぶと、その場で100点満点の選出評価を表示します</strong><span>1体目を先発、2体目を引き先、3体目を締めとして採点します。</span></div>`;return}
  try{root.innerHTML=selectionScoreHtml(computeSelectionScore([...state.playerPicks]))}catch(error){console.error(error);root.innerHTML='<div class="score-empty">選出の採点に失敗しました。6体や技設定を確認してください。</div>'}
}

function renderRecommendations(results,currentEstimate=null){
  const panel=document.getElementById("recommendationPanel");panel.hidden=false;
  panel.innerHTML=`<div class="recommendation-heading"><div><p class="step">SELECTION COACH</p><h3>勝ち筋が太い選出</h3></div><span class="status-chip">選出確率モデル×180試合相当</span></div><p class="basis-note">％は相手の60選出を等確率にせず、公開6体への刺さり・先発適性・回答範囲・死に枠の少なさで重み付けした推定値です。</p>`;
  const grid=document.createElement("div");grid.className="recommendation-grid visual-recommendations";
  results.forEach((result,rank)=>{
    const analysis=result.analysis||recommendationAnalysis(result.line),card=document.createElement("article");card.className="recommendation-card";
    const delta=currentEstimate==null?null:result.winPct-currentEstimate;
    const lineup=`<div class="visual-lineup player-lineup sprite-only-lineup">${result.line.map((i,j)=>`<div class="ai-lineup-mon"><span class="role-badge">${j===0?'先発':j===1?'引き先':'締め'}</span>${spriteToken(effectivePokemon('player',i),'pick')}</div>`).join('')}</div>`;
    const memberCards=analysis.memberCoverage.map(member=>{
      const mon=effectivePokemon('player',member.playerIndex);
      const targets=member.strong.slice(0,3).map(x=>{const oi=state.opponentRoster.findIndex(id=>POKEMON[id].name===x.opponent);return `<span class="target-chip">${spriteToken(effectivePokemon('opponent',oi),'option')}<em>${x.duel.wins}/9</em></span>`}).join('');
      return `<div class="member-visual sprite-member">${spriteToken(mon,'pick')}<b>→</b><div class="target-chip-list">${targets||'<span class="muted">明確な有利対面なし</span>'}</div></div>`;
    }).join('');
    const heavy=analysis.heavy.slice(0,4).map(x=>`<div class="heavy-chip">${spriteToken(effectivePokemon('opponent',x.opponentIndex),'option')}<span>最善でも${x.duel.wins}/9</span></div>`).join('')||'<span class="good-note">相手6体すべてに回答あり</span>';
    const warnings=[
      ...analysis.heavy.slice(0,3).map(x=>`<div class="warning-card">${spriteToken(effectivePokemon('opponent',x.opponentIndex),'option')}<span>3体とも苦手</span></div>`),
      ...analysis.narrow.slice(0,3).map(x=>`<div class="warning-card narrow explicit-warning"><span>相手の</span>${spriteToken(effectivePokemon('opponent',x.opponentIndex),'inline')}<span>に勝てるのは</span>${spriteToken(effectivePokemon('player',x.solidAnswers[0]?.playerIndex),'inline')}<strong>${x.solidAnswers[0]?.duel?.wins||0}/9</strong></div>`)
    ].join('')||'<span class="good-note">回答の偏りは小さい</span>';
    card.innerHTML=`<div class="recommendation-top"><span class="recommendation-rank">${rank===0?'👑 BEST':`#${rank+1}`}</span><div class="win-rate"><strong>${result.winPct.toFixed(1)}%</strong><small>重み付き換算 ${result.wins}勝${result.losses}敗 / ${result.total}</small></div></div>${lineup}${delta==null?'':`<p class="delta ${delta>=0?'positive':'negative'}">現在選出比 ${delta>=0?'+':''}${delta.toFixed(1)}pt</p>`}<section class="visual-section"><h4>刺さる対面</h4>${memberCards}</section><section class="visual-section"><h4>重い相手</h4><div class="heavy-chip-list">${heavy}</div></section><section class="visual-section"><h4>回答の偏り</h4><div class="warning-cards">${warnings}</div></section><section class="visual-coverage answer-board-section"><div class="board-title"><h4>相手6体への回答表</h4><small>上＝相手AI　下＝あなたの回答</small></div><div class="answer-board">${analysis.rows.map(recommendationAnswerCard).join('')}</div></section><button class="apply-recommendation primary-button" data-line="${result.line.join(',')}" type="button">この選出を使う</button>`;
    grid.appendChild(card);
  });
  panel.appendChild(grid);
}

function typeChipList(types){return (types||[]).map(type=>`<span class="balance-type-chip type-${escapeHtml(type)}">${escapeHtml(typeName(type))}</span>`).join('')}
function scoreClamp(value){return clamp(Number.isFinite(Number(value))?Number(value):0,0,1)}
function scoreGrade(score){if(score>=90)return {label:"大会級",cls:"elite"};if(score>=80)return {label:"かなり良い",cls:"great"};if(score>=70)return {label:"良い",cls:"good"};if(score>=60)return {label:"要調整",cls:"fair"};return {label:"改善余地大",cls:"weak"}}
function scoreRing(score,label="SCORE"){
  const value=clamp(Math.round(score),0,100),grade=scoreGrade(value);
  return `<div class="score-ring score-${grade.cls}" style="--score:${value};--score-angle:${(value*3.6).toFixed(1)}deg" role="img" aria-label="${label} ${value}点"><div><strong>${value}</strong><span>/100</span><small>${escapeHtml(grade.label)}</small></div></div>`;
}
function strongestChargedProfile(mon){
  return chargedObjects(mon).map(move=>({move,turns:firstChargedTurns(mon,move),power:safeNumber(move.power),efficiency:safeNumber(move.power)/Math.max(1,safeNumber(move.energy))})).sort((a,b)=>b.power-a.power||b.efficiency-a.efficiency)[0]||null;
}
function quickMatchupMon(attacker,defender){
  if(!attacker||!defender)return -99;
  const fast=fastObject(attacker),charged=chargedObjects(attacker);
  const fastPressure=fast?(isAegislash(attacker)?(1/Math.max(1,fast.turns))*.45:effectiveness(fast.type,defender.types)*(safeNumber(fast.power)/Math.max(1,fast.turns))*.45):0;
  const chargedPressure=charged.length?Math.max(...charged.map(move=>effectiveness(move.type,defender.types)*(safeNumber(move.power)/Math.max(30,safeNumber(move.energy))))):0;
  const incomingFast=fastObject(defender),incomingMoves=chargedObjects(defender);
  const incoming=Math.max(incomingFast?effectiveness(incomingFast.type,attacker.types):1,...incomingMoves.map(move=>effectiveness(move.type,attacker.types)));
  const stat=Math.log(Math.max(1,attacker.atk*attacker.def*attacker.hp))/20;
  return fastPressure+chargedPressure*1.25-incoming*.55+stat;
}
function teamRoleDetail(id,role,benchmark){
  const mon=monFromId(id),scores=benchmark.map(target=>quickMatchupMon(mon,monFromId(target)));
  const favorable=scores.filter(v=>v>4.2).length,hard=scores.filter(v=>v<1.4).length,neutral=Math.max(0,scores.length-favorable-hard);
  const fastest=fastestChargedProfile(mon),strongest=strongestChargedProfile(mon),roleIndex=role==="lead"?0:role==="safe"?2:1;
  const roleScore=Math.round(roleValue(id,roleIndex));
  let why=[];
  if(role==="lead"){
    why=[`基準${benchmark.length}体へ先手圧力 ${favorable}体`,`明確に苦しい ${hard}体`,fastest?`${fastest.move.name}まで約${fastest.turns}T`:"ゲージ到達データなし"];
  }else if(role==="safe"){
    why=[`互角以上 ${favorable+neutral}/${benchmark.length}体`,`明確に苦しい ${hard}体`,fastest?`最速${fastest.move.name} 約${fastest.turns}T`:"ゲージ到達データなし"];
  }else{
    why=[strongest?`${strongest.move.name} 威力${strongest.power}`:"主力ゲージ技なし",`締め役指数 ${roleScore}`,`攻撃タイプ ${pokemonAttackTypes(mon).map(typeName).join("・")}`];
  }
  return {id,role,roleScore,favorable,neutral,hard,fastest,strongest,why};
}
function roleExplainCard(label,id,role,benchmark){
  if(!id||!POKEMON[id])return `<article class="role-explain-card"><span class="role-label">${escapeHtml(label)}</span><small>候補なし</small></article>`;
  const detail=teamRoleDetail(id,role,benchmark),mon=POKEMON[id];
  return `<article class="role-explain-card"><header>${spriteToken(mon,"option")}<div><span class="role-label">${escapeHtml(label)}</span><strong>${detail.roleScore}</strong><small>役割指数</small></div></header><div class="role-reason-pills">${detail.why.map(x=>`<span>${escapeHtml(x)}</span>`).join('')}</div></article>`;
}
function complementDirection(fromId,toId,types){
  if(!types?.length)return '';
  const to=POKEMON[toId];
  const chips=types.map(type=>`<span class="type-cover-chip type-${escapeHtml(type)}"><b>${escapeHtml(typeName(type))}</b><em>${formatMultiplier(effectiveness(type,to.types))}</em></span>`).join('');
  return `<div class="complement-direction"><span class="complement-owner">弱点側</span>${spriteToken(POKEMON[fromId],"inline")}<b class="coverage-arrow">→</b><span class="complement-owner">受ける側</span>${spriteToken(to,"inline")}<div class="complement-multipliers">${chips}</div><span class="multiplier-note">で受ける</span></div>`;
}
function opponentPartyBalanceHtml(meta){
  if(!meta)return '';
  const benchmark=metaBenchmarkPool(),covered=(meta.coveredIds||[]).length,benchmarkCount=meta.benchmarkSize||benchmark.length;
  const maxShared=(meta.sharedWeaknesses||[])[0]?.[1]||0;
  const leadId=(meta.leadIds||[])[0],safeId=(meta.safeIds||[])[0],closerId=(meta.closerIds||[])[0];
  const pairs=(meta.complementPairs||[]).map(pair=>`<article class="complement-card detailed"><div class="complement-pair-head">${spriteToken(POKEMON[pair.aId],"option")}<b>⇄</b>${spriteToken(POKEMON[pair.bId],"option")}<strong>${pair.total}タイプを補完</strong></div>${complementDirection(pair.aId,pair.bId,pair.aCovered)}${complementDirection(pair.bId,pair.aId,pair.bCovered)}</article>`).join('');
  const shared=(meta.sharedWeaknesses||[]).length?`<div class="shared-weakness-row"><span>重複弱点</span>${meta.sharedWeaknesses.map(([type,count])=>`<span class="type-cover-chip type-${escapeHtml(type)}">${escapeHtml(typeName(type))}<em>${count}体</em></span>`).join('')}</div>`:'<div class="shared-weakness-row is-good"><b>✓</b><span>3体以上で重なる弱点なし</span></div>';
  const holes=(meta.weakIds||[]).length?`<div class="party-hole-list">${meta.weakIds.map(id=>spriteToken(POKEMON[id],"option")).join('')}<span>残る注意対象</span></div>`:'<div class="party-complete"><b>✓</b><span>基準メタへの明確な穴は小さい</span></div>';
  return `<section class="party-balance"><div class="party-balance-title"><strong>この6体がバランス良い理由</strong><small>役割指数・技回転・タイプ補完を表示</small></div><div class="party-metrics"><div><strong>${covered}/${benchmarkCount}</strong><span>基準メタへ回答</span></div><div><strong>${(meta.attackTypes||[]).length}</strong><span>攻撃タイプ</span></div><div><strong>${maxShared||'0'}</strong><span>最大弱点重複</span></div></div><section><h4>役割が成立する根拠</h4><div class="role-explain-grid">${roleExplainCard('初手圧力',leadId,'lead',benchmark)}${roleExplainCard('引き先',safeId,'safe',benchmark)}${roleExplainCard('締め',closerId,'closer',benchmark)}</div></section><section><h4>弱点補完の軸</h4><div class="complement-grid">${pairs||'<small class="muted">強い相互補完ペアを検出できませんでした。</small>'}</div>${shared}</section><section class="attack-coverage"><h4>技の攻撃範囲</h4><div>${typeChipList(meta.attackTypes)}</div></section>${holes}</section>`;
}
function renderRosters(){
  document.getElementById("playerRoster").replaceChildren(...Array.from({length:6},(_,i)=>rosterCard("player",i,state.playerRoster[i])));
  document.getElementById("opponentRoster").replaceChildren(...Array.from({length:6},(_,i)=>rosterCard("opponent",i,state.opponentRoster[i])));
  document.getElementById("playerReady").textContent=`${state.playerRoster.filter(Boolean).length} / 6`;
  document.getElementById("opponentReady").textContent="AI自動生成";
  const info=document.getElementById("opponentGenerationInfo");if(info)info.innerHTML=opponentPartyBalanceHtml(state.opponentPartyMeta);
  renderPlayerPartyScore();
  const chip=document.getElementById("poolChip");if(chip)chip.textContent=`${DATA_INFO.count}体`;
}
function renderDataLibrary(query=""){
  const d=DATA_INFO.diagnostics||{},q=String(query).trim().toLowerCase();document.getElementById("dataCountChip").textContent=`${DATA_INFO.count}体`;
  document.getElementById("dataMetrics").innerHTML=`<div class="metric"><strong>${DATA_INFO.count}</strong><span>収録ポケモン</span></div><div class="metric"><strong>${DATA_INFO.liveMovesetCount||0}</strong><span>最新推奨技を照合</span></div><div class="metric"><strong>${opponentCandidatePool().length}</strong><span>相手AI候補</span></div>`;
  const ids=META_ORDER.filter(id=>{const p=POKEMON[id],hay=[p.name,p.englishName,...p.types.map(typeName),...p.types,FAST_MOVES[p.fast]?.name,...p.charged.map(x=>CHARGED_MOVES[x]?.name)].join(" ").toLowerCase();return !q||hay.includes(q)}).slice(0,q?DATA_INFO.count:140);
  document.getElementById("dataList").replaceChildren(...ids.map(id=>{const p=POKEMON[id],b=p.rank1,row=document.createElement("article");row.className="data-row";row.innerHTML=`<span class="data-rank">${p.rank?`#${p.rank}<small>性能順位</small>`:`—<small>未照合</small>`}</span>${pokemonAvatar(p,"data")}<div class="data-main"><strong>${escapeHtml(p.name)} ${p.movesetSource?'<span class="meta-inline">技照合済み</span>':''}</strong><small>${typeChips(p.types)} ${escapeHtml(moveLabel(p))}</small></div><div class="data-build">CP ${b.cp}<br>Lv ${b.level}</div>`;return row}));
  document.getElementById("dataDiagnostics").innerHTML=`<p><strong>技構成:</strong> ${DATA_INFO.liveMeta?'起動時に現行PvPokeランキングJSONを取得し、収録ポケモン全体の推奨技を合法技と照合しています。':'通信できなかったため、監査済み主要技＋内蔵スナップショットです。'}</p><p><strong>照合数:</strong> ${DATA_INFO.liveMovesetCount||0}体 / 順位一致 ${DATA_INFO.liveRankedCount||0}体</p><p><strong>相手AI:</strong> 上位${opponentCandidatePool().length}体から候補を作成し、基準${metaBenchmarkPool().length}体への技相性、耐性、役割、弱点集中を評価。上位構築は9シールド対面で再検証します。</p><p><strong>倍率:</strong> 弱点×1.6、二重弱点×2.56、耐性×0.625、二重耐性・無効相当×0.391、重複時×0.244を使用します。</p><p><strong>ギルガルド:</strong> 登場時はシールド。シールド中の通常技は1ダメージ・E+6固定。ゲージ技直前にブレードへ変化し、シールド使用後または交代時にシールドへ戻ります。攻撃・防御・CP・CMP・ドット絵も現在フォルムへ連動します。</p><p><strong>数値データ元:</strong> ${escapeHtml(DATA_INFO.source)}</p><p><strong>収録:</strong> 通常・フォルム ${d.baseForms||0}、シャドウ ${d.shadowForms||0}</p>`;
}
function renderAll(){renderRosters();renderSelection();renderBattleLineups();renderMatch();renderDataLibrary(document.getElementById("dataSearch")?.value||"");updateTimer();updateRunBattleButton();if(state.lastRecommendations?.version===11.2&&state.lastRecommendations?.results?.length)renderRecommendations(state.lastRecommendations.results,null);else state.lastRecommendations=null}

async function bootstrap(){
  hydrateEmbeddedData();applyFallbackMovesets();wireEvents();repairStateRosters();renderAll();
  const live=await syncLiveRankings();
  META_BOOTSTRAP_READY=true;
  generateStrongOpponentRoster(false);repairStateRosters();renderAll()
  if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
}
if(typeof document!=="undefined")bootstrap();

