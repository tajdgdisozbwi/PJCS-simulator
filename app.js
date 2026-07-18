"use strict";

const STORAGE_KEY = "pjcs-simulator-v01";

const defaultState = () => ({
  playerRoster: Array.from({ length: 6 }, () => ({ name: "", cp: "" })),
  opponentRoster: Array.from({ length: 6 }, () => ({ name: "", cp: "" })),
  playerPicks: [],
  opponentPicks: [],
  format: 3,
  playerScore: 0,
  opponentScore: 0,
  gameNumber: 1,
  history: []
});

let state = loadState();
let timerId = null;
let timerValue = 90;

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return parsed ? { ...defaultState(), ...parsed } : defaultState();
  } catch {
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function rosterRow(side, index, value) {
  const wrapper = document.createElement("div");
  wrapper.className = "roster-row";

  const number = document.createElement("span");
  number.className = "slot-number";
  number.textContent = String(index + 1);

  const name = document.createElement("input");
  name.type = "text";
  name.autocomplete = "off";
  name.placeholder = "ポケモン名";
  name.value = value.name;
  name.dataset.side = side;
  name.dataset.index = String(index);
  name.dataset.field = "name";
  name.setAttribute("aria-label", `${side === "player" ? "あなた" : "相手"} ${index + 1}匹目の名前`);

  const cp = document.createElement("input");
  cp.type = "number";
  cp.inputMode = "numeric";
  cp.min = "10";
  cp.max = "1500";
  cp.placeholder = "CP";
  cp.value = value.cp;
  cp.dataset.side = side;
  cp.dataset.index = String(index);
  cp.dataset.field = "cp";
  cp.setAttribute("aria-label", `${side === "player" ? "あなた" : "相手"} ${index + 1}匹目のCP`);

  wrapper.append(number, name, cp);
  return wrapper;
}

function renderRosters() {
  const player = document.getElementById("playerRoster");
  const opponent = document.getElementById("opponentRoster");
  player.replaceChildren(...state.playerRoster.map((p, i) => rosterRow("player", i, p)));
  opponent.replaceChildren(...state.opponentRoster.map((p, i) => rosterRow("opponent", i, p)));
  updateReadyCounts();
}

function completeCount(roster) {
  return roster.filter(p => p.name.trim() && Number(p.cp) > 0 && Number(p.cp) <= 1500).length;
}

function updateReadyCounts() {
  document.getElementById("playerReady").textContent = `${completeCount(state.playerRoster)} / 6`;
  document.getElementById("opponentReady").textContent = `${completeCount(state.opponentRoster)} / 6`;
}

function updateRosterFromInput(event) {
  const input = event.target;
  if (!(input instanceof HTMLInputElement) || !input.dataset.side) return;
  const rosterKey = input.dataset.side === "player" ? "playerRoster" : "opponentRoster";
  const index = Number(input.dataset.index);
  const field = input.dataset.field;
  state[rosterKey][index][field] = input.value;
  updateReadyCounts();
  saveState();
}

function validateRosters() {
  const all = [...state.playerRoster, ...state.opponentRoster];
  if (all.some(p => !p.name.trim())) return "12枠すべてにポケモン名を入力してください。";
  if (all.some(p => !(Number(p.cp) >= 10 && Number(p.cp) <= 1500))) return "CPは10～1500で入力してください。";
  const duplicate = roster => {
    const names = roster.map(p => p.name.trim().toLowerCase());
    return new Set(names).size !== names.length;
  };
  if (duplicate(state.playerRoster) || duplicate(state.opponentRoster)) return "同じ側の6体に同名ポケモンがあります。";
  return "";
}

function renderSelection() {
  renderPickGrid("playerSelection", state.playerRoster, state.playerPicks, "player");
  renderPickGrid("opponentSelection", state.opponentRoster, state.opponentPicks, "opponent");
  updateSelectionSummary();
}

function renderPickGrid(id, roster, picks, side) {
  const root = document.getElementById(id);
  const cards = roster.map((p, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "pick-card";
    button.dataset.side = side;
    button.dataset.index = String(index);
    const order = picks.indexOf(index);
    if (order >= 0) button.classList.add("is-picked");

    const strong = document.createElement("strong");
    strong.textContent = p.name || `未登録 ${index + 1}`;
    const small = document.createElement("small");
    small.textContent = p.cp ? `CP ${p.cp}` : "CP未入力";
    button.append(strong, small);
    if (order >= 0) {
      const badge = document.createElement("span");
      badge.className = "pick-order";
      badge.textContent = String(order + 1);
      button.appendChild(badge);
    }
    return button;
  });
  root.replaceChildren(...cards);
}

function togglePick(side, index) {
  const key = side === "player" ? "playerPicks" : "opponentPicks";
  const picks = state[key];
  const existing = picks.indexOf(index);
  if (existing >= 0) {
    picks.splice(existing, 1);
  } else if (picks.length < 3) {
    picks.push(index);
  }
  saveState();
  renderSelection();
  renderMatch();
}

function pickNames(roster, picks) {
  return picks.map(i => roster[i]?.name || `枠${i + 1}`);
}

function updateSelectionSummary() {
  const p = pickNames(state.playerRoster, state.playerPicks);
  const o = pickNames(state.opponentRoster, state.opponentPicks);
  document.getElementById("playerSelectionSummary").textContent = p.length ? p.join(" → ") : "未選択";
  document.getElementById("opponentSelectionSummary").textContent = o.length ? o.join(" → ") : "未選択";
}

function switchTab(name) {
  document.querySelectorAll(".tab").forEach(btn => btn.classList.toggle("is-active", btn.dataset.tab === name));
  document.querySelectorAll(".panel").forEach(panel => panel.classList.toggle("is-active", panel.id === name));
  if (name === "selection") renderSelection();
  if (name === "match") renderMatch();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function startTimer() {
  clearInterval(timerId);
  timerValue = 90;
  updateTimer();
  timerId = setInterval(() => {
    timerValue -= 1;
    updateTimer();
    if (timerValue <= 0) {
      clearInterval(timerId);
      timerId = null;
      document.getElementById("selectionMessage").textContent = "選出時間が終了しました。";
    }
  }, 1000);
}

function updateTimer() {
  const el = document.getElementById("timer");
  el.textContent = String(timerValue);
  el.closest(".timer-box").classList.toggle("is-low", timerValue <= 15);
}

function renderLineup(id, roster, picks) {
  const root = document.getElementById(id);
  const pills = pickNames(roster, picks).map((name, index) => {
    const span = document.createElement("span");
    span.className = "lineup-pill";
    span.textContent = `${index === 0 ? "先発" : `控え${index}`} ${name}`;
    return span;
  });
  root.replaceChildren(...pills);
  if (!pills.length) root.textContent = "未確定";
}

function targetWins() {
  return Math.ceil(Number(state.format) / 2);
}

function matchFinished() {
  return state.playerScore >= targetWins() || state.opponentScore >= targetWins();
}

function renderMatch() {
  document.getElementById("matchFormat").value = String(state.format);
  document.getElementById("playerScore").textContent = String(state.playerScore);
  document.getElementById("opponentScore").textContent = String(state.opponentScore);
  document.getElementById("gameNumber").textContent = `GAME ${state.gameNumber}`;
  document.getElementById("targetWins").textContent = `${targetWins()}勝先取`;
  renderLineup("currentPlayerLineup", state.playerRoster, state.playerPicks);
  renderLineup("currentOpponentLineup", state.opponentRoster, state.opponentPicks);

  const list = document.getElementById("historyList");
  const items = state.history.map(item => {
    const li = document.createElement("li");
    li.textContent = `Game ${item.game}: ${item.winner === "player" ? "あなた" : "相手"}が勝利（${item.player.join(" / ")} vs ${item.opponent.join(" / ")}）`;
    return li;
  });
  list.replaceChildren(...items);
  if (!items.length) {
    const li = document.createElement("li");
    li.textContent = "まだ結果はありません。";
    list.appendChild(li);
  }

  const disabled = matchFinished();
  document.getElementById("playerWin").disabled = disabled;
  document.getElementById("opponentWin").disabled = disabled;
  document.getElementById("nextSelection").disabled = disabled;
  const msg = document.getElementById("matchMessage");
  if (state.playerScore >= targetWins()) msg.textContent = "マッチ終了：あなたの勝利です。";
  else if (state.opponentScore >= targetWins()) msg.textContent = "マッチ終了：相手の勝利です。";
  else msg.textContent = "";
}

function recordWinner(winner) {
  if (matchFinished()) return;
  if (state.playerPicks.length !== 3 || state.opponentPicks.length !== 3) {
    document.getElementById("matchMessage").textContent = "両者の3体選出を確定してください。";
    return;
  }
  state.history.push({
    game: state.gameNumber,
    winner,
    player: pickNames(state.playerRoster, state.playerPicks),
    opponent: pickNames(state.opponentRoster, state.opponentPicks)
  });
  if (winner === "player") state.playerScore += 1;
  else state.opponentScore += 1;
  if (!matchFinished()) state.gameNumber += 1;
  saveState();
  renderMatch();
}

function resetMatch() {
  state.playerScore = 0;
  state.opponentScore = 0;
  state.gameNumber = 1;
  state.history = [];
  state.playerPicks = [];
  state.opponentPicks = [];
  saveState();
  renderSelection();
  renderMatch();
}

function resetAll() {
  if (!confirm("登録・選出・履歴をすべて初期化しますか？")) return;
  state = defaultState();
  saveState();
  renderAll();
  switchTab("roster");
}

function renderAll() {
  renderRosters();
  renderSelection();
  renderMatch();
  updateTimer();
}

document.addEventListener("input", updateRosterFromInput);

document.querySelectorAll(".tab").forEach(button => {
  button.addEventListener("click", () => switchTab(button.dataset.tab));
});

document.getElementById("saveRosters").addEventListener("click", () => {
  const error = validateRosters();
  const msg = document.getElementById("rosterMessage");
  if (error) {
    msg.textContent = error;
    return;
  }
  msg.textContent = "保存しました。";
  saveState();
  renderSelection();
  switchTab("selection");
});

document.addEventListener("click", event => {
  const card = event.target.closest(".pick-card");
  if (!card) return;
  togglePick(card.dataset.side, Number(card.dataset.index));
});

document.getElementById("startTimer").addEventListener("click", startTimer);
document.getElementById("clearPicks").addEventListener("click", () => {
  state.playerPicks = [];
  state.opponentPicks = [];
  saveState();
  renderSelection();
});
document.getElementById("confirmPicks").addEventListener("click", () => {
  const msg = document.getElementById("selectionMessage");
  if (state.playerPicks.length !== 3 || state.opponentPicks.length !== 3) {
    msg.textContent = "両者とも3体を選んでください。";
    return;
  }
  clearInterval(timerId);
  timerId = null;
  msg.textContent = "選出を確定しました。";
  saveState();
  renderMatch();
  switchTab("match");
});

document.getElementById("matchFormat").addEventListener("change", event => {
  state.format = Number(event.target.value);
  resetMatch();
});
document.getElementById("playerWin").addEventListener("click", () => recordWinner("player"));
document.getElementById("opponentWin").addEventListener("click", () => recordWinner("opponent"));
document.getElementById("nextSelection").addEventListener("click", () => {
  state.playerPicks = [];
  state.opponentPicks = [];
  saveState();
  renderSelection();
  switchTab("selection");
});
document.getElementById("newMatch").addEventListener("click", resetMatch);
document.getElementById("resetAll").addEventListener("click", resetAll);

document.getElementById("dataFile").addEventListener("change", async event => {
  const file = event.target.files?.[0];
  if (!file) return;
  const preview = document.getElementById("dataPreview");
  try {
    const parsed = JSON.parse(await file.text());
    preview.textContent = JSON.stringify(parsed, null, 2).slice(0, 6000);
  } catch (error) {
    preview.textContent = `JSONを読み込めませんでした: ${error.message}`;
  }
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
}

renderAll();
