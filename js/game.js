/* Game engine for Luffy's Voyage. Reads ISLANDS / ENDINGS / CREW_NAMES /
   CREW_ORDER / CREW_INITIALS / LUFFY_MOVES / ASSIST_MOVES from
   story-data.js and drives the state machine: arrival -> intro -> decision
   -> outcome -> [battle -> fruit] -> outro -> next island -> ... -> ending
   or game over. */

const SCENE_ART = {
  shipArt: `<svg viewBox="0 0 200 140" class="scene-art">
    <path d="M20 90 L180 90 L160 120 L40 120 Z" fill="var(--rope)" stroke="var(--ink)" stroke-width="3"/>
    <rect x="95" y="20" width="6" height="70" fill="var(--rope-dark)"/>
    <path d="M101 26 L150 50 L101 70 Z" fill="var(--cream)" stroke="var(--ink)" stroke-width="2"/>
    <path d="M60 40 Q100 20 140 40 L140 45 L60 45 Z" fill="var(--ocean-light)" opacity="0.5"/>
    <path d="M0 100 Q50 90 100 100 T200 100 L200 140 L0 140 Z" fill="var(--ocean-mid)"/>
  </svg>`,
  swordArt: `<svg viewBox="0 0 200 140" class="scene-art">
    <g stroke="var(--ink)" stroke-width="2">
      <rect x="55" y="20" width="8" height="70" fill="var(--ocean-pale)" transform="rotate(-20 59 55)"/>
      <rect x="45" y="82" width="28" height="10" fill="var(--rope-dark)" transform="rotate(-20 59 87)"/>
      <rect x="137" y="20" width="8" height="70" fill="var(--ocean-pale)" transform="rotate(20 141 55)"/>
      <rect x="127" y="82" width="28" height="10" fill="var(--rope-dark)" transform="rotate(20 141 87)"/>
      <rect x="96" y="15" width="8" height="78" fill="var(--cream)"/>
      <rect x="86" y="86" width="28" height="10" fill="var(--gold-dark)"/>
    </g>
  </svg>`,
  townArt: `<svg viewBox="0 0 200 140" class="scene-art">
    <rect x="10" y="60" width="40" height="55" fill="var(--cream-dark)" stroke="var(--ink)" stroke-width="2"/>
    <polygon points="10,60 30,40 50,60" fill="var(--red)" stroke="var(--ink)" stroke-width="2"/>
    <rect x="70" y="45" width="50" height="70" fill="var(--cream-dark)" stroke="var(--ink)" stroke-width="2"/>
    <polygon points="70,45 95,22 120,45" fill="var(--red-dark)" stroke="var(--ink)" stroke-width="2"/>
    <rect x="140" y="65" width="40" height="50" fill="var(--cream-dark)" stroke="var(--ink)" stroke-width="2"/>
    <polygon points="140,65 160,48 180,65" fill="var(--red)" stroke="var(--ink)" stroke-width="2"/>
    <rect x="0" y="115" width="200" height="10" fill="var(--rope)"/>
  </svg>`,
  flagArt: `<svg viewBox="0 0 200 140" class="scene-art">
    <rect x="95" y="10" width="8" height="120" fill="var(--rope-dark)"/>
    <path d="M103 18 L175 30 L103 58 Z" fill="var(--ink)" stroke="var(--ink)" stroke-width="2"/>
    <circle cx="132" cy="35" r="11" fill="var(--cream)"/>
    <circle cx="128" cy="33" r="2" fill="var(--ink)"/>
    <circle cx="136" cy="33" r="2" fill="var(--ink)"/>
    <path d="M124 40 Q132 45 140 40" stroke="var(--ink)" stroke-width="2" fill="none"/>
  </svg>`,
  boatImage: `<img src="assets/boat.webp" class="scene-art" alt="The Going Merry under sail">`
};

const STARTING_FOOD = 60;
const ISLAND_FOOD_DRAIN = 12;
const STARVATION_DAMAGE = 12;
const MASH_DURATION = 2500;
const MASH_THRESHOLD = 18;
const TYPE_DURATION = 4000;
const TYPE_CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ";

function makeInitialState() {
  return {
    islandIdx: 0,
    decisionIdx: 0,
    stage: "arrival",
    stats: { bond: 50, resolve: 50, infamy: 10 },
    food: STARTING_FOOD,
    points: 0,
    crew: {},
    roster: {
      luffy: { id: "luffy", name: "Monkey D. Luffy", hp: 120, maxHp: 120, alive: true, fruit: null }
    },
    lastOutcome: "",
    lastOutcomeNote: "",
    starvationNote: null,
    battle: null,
    gameOverReason: ""
  };
}

let state = makeInitialState();

function clamp100(n) {
  return Math.max(0, Math.min(100, n));
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function addPoints(n) {
  state.points += n;
}

function currentIsland() {
  return ISLANDS[state.islandIdx];
}

function aliveMembers() {
  return CREW_ORDER.filter((id) => state.roster[id] && state.roster[id].alive);
}

function lowestHpAliveMember() {
  const alive = aliveMembers().map((id) => state.roster[id]);
  return alive.sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
}

function pickRetaliationTarget() {
  const alive = aliveMembers();
  if (alive.length === 1) return alive[0];
  const weighted = [];
  alive.forEach((id) => {
    const weight = id === "luffy" ? 3 : 1;
    for (let i = 0; i < weight; i++) weighted.push(id);
  });
  return weighted[Math.floor(Math.random() * weighted.length)];
}

function addCompanion(flagId) {
  state.roster[flagId] = { id: flagId, name: CREW_NAMES[flagId], hp: 90, maxHp: 90, alive: true, fruit: null };
}

function damageMember(id, amount, context) {
  const member = state.roster[id];
  member.hp = Math.max(0, member.hp - amount);
  if (member.hp <= 0) {
    member.alive = false;
    if (id === "luffy") {
      state.stage = "gameover";
      state.gameOverReason = `${member.name} finally goes down${context === "hunger" ? ", worn thin by hunger," : ""}, and the voyage ends here.`;
      return { gameOver: true, message: state.gameOverReason };
    }
    return { gameOver: false, message: `${member.name} takes ${amount} damage and can fight no more. ${member.name} is gone for good.` };
  }
  return { gameOver: false, message: `${member.name} takes ${amount} damage.` };
}

function applyEffects(effects) {
  if (!effects) return;
  state.stats.bond = clamp100(state.stats.bond + (effects.bond || 0));
  state.stats.resolve = clamp100(state.stats.resolve + (effects.resolve || 0));
  state.stats.infamy = clamp100(state.stats.infamy + (effects.infamy || 0));
  state.food = clamp100(state.food + (effects.food || 0));
}

function resolveOutro(island) {
  if (Array.isArray(island.outro)) return island.outro;
  for (const decision of island.decisions) {
    for (const option of decision.options) {
      if (option.flag && state.crew[option.flag] && island.outro[option.flag]) {
        return island.outro[option.flag];
      }
    }
  }
  return island.outro.default;
}

function crewTagsHtml(includeFallen) {
  const names = CREW_ORDER.filter((id) => state.roster[id]).map((id) => state.roster[id]);
  const shown = includeFallen ? names : names.filter((m) => m.alive);
  if (shown.length === 0) {
    return `<div class="crew-tag-list"><span class="crew-tag">SAILING SOLO</span></div>`;
  }
  return `<div class="crew-tag-list">${shown
    .map((m) => `<span class="crew-tag${m.alive ? "" : " crew-tag-fallen"}">${m.name.toUpperCase()}${m.alive ? "" : " (FALLEN)"}</span>`)
    .join("")}</div>`;
}

/* ---------- top bars: stats, sidebar, trail map ---------- */

function updateStatTiles() {
  document.getElementById("bondValue").textContent = state.stats.bond;
  document.getElementById("resolveValue").textContent = state.stats.resolve;
  document.getElementById("infamyValue").textContent = state.stats.infamy;
  document.getElementById("foodValue").textContent = state.food;
  document.getElementById("bondFill").style.width = state.stats.bond + "%";
  document.getElementById("resolveFill").style.width = state.stats.resolve + "%";
  document.getElementById("infamyFill").style.width = state.stats.infamy + "%";
  document.getElementById("foodFill").style.width = state.food + "%";
  const foodTile = document.getElementById("foodTile");
  foodTile.classList.toggle("stat-tile-warning", state.food <= 25);
}

function renderSidebar() {
  const sidebar = document.getElementById("crewSidebar");
  const cards = CREW_ORDER.filter((id) => state.roster[id])
    .map((id) => {
      const m = state.roster[id];
      const pct = Math.round((m.hp / m.maxHp) * 100);
      return `
        <li class="crew-card${m.alive ? "" : " crew-card-dead"}">
          <div class="crew-card-top">
            <span class="crew-badge">${CREW_INITIALS[id]}</span>
            <div class="crew-card-name-wrap">
              <span class="crew-card-name">${m.name}</span>
              ${m.fruit ? `<span class="crew-fruit-tag">${m.fruit}</span>` : ""}
            </div>
          </div>
          ${
            m.alive
              ? `<div class="crew-hp-bar"><div class="crew-hp-fill" style="width:${pct}%"></div></div>
                 <span class="crew-hp-text">HP ${m.hp}/${m.maxHp}</span>`
              : `<span class="crew-fallen-text">FALLEN</span>`
          }
        </li>`;
    })
    .join("");
  sidebar.innerHTML = `
    <p class="sidebar-heading">YOUR CREW</p>
    <ul class="crew-list">${cards}</ul>
    <p class="sidebar-heading sidebar-heading-points">SCORE</p>
    <p class="points-display">${state.points} PTS</p>
  `;
}

function renderTrailMap() {
  const map = document.getElementById("trailMap");
  map.style.gridTemplateColumns = `repeat(${ISLANDS.length}, 1fr)`;
  map.innerHTML = "";
  ISLANDS.forEach((island, idx) => {
    const node = document.createElement("div");
    node.className = "trail-node";
    if (idx < state.islandIdx || state.stage === "end") node.classList.add("visited");
    if (idx === state.islandIdx && state.stage !== "end") node.classList.add("current");
    node.innerHTML = `<div class="trail-dot">${idx + 1}</div><div class="trail-label">${island.name}</div>`;
    map.appendChild(node);
  });
}

/* ---------- main render dispatcher ---------- */

function showModal(html) {
  const overlay = document.getElementById("modalOverlay");
  const card = document.getElementById("modalCard");
  card.innerHTML = html;
  overlay.hidden = false;
  document.getElementById("scenePanel").inert = true;
}

function hideModal() {
  const overlay = document.getElementById("modalOverlay");
  overlay.hidden = true;
  document.getElementById("modalCard").innerHTML = "";
  document.getElementById("scenePanel").inert = false;
}

function render() {
  updateStatTiles();
  renderSidebar();
  renderTrailMap();
  const panel = document.getElementById("scenePanel");

  if (state.stage === "gameover") {
    hideModal();
    return renderGameOver(panel);
  }
  if (state.stage === "end") {
    hideModal();
    return renderEnding(panel);
  }

  const island = currentIsland();
  const art = SCENE_ART[island.art] || "";

  if (state.stage === "arrival") {
    hideModal();
    return renderArrival(panel, island, art);
  }
  if (state.stage === "intro") {
    hideModal();
    return renderIntro(panel, island);
  }
  if (state.stage === "decision") return renderDecisionModal(island);
  if (state.stage === "outcome") return renderOutcomeModal(island);
  if (state.stage === "battle") {
    hideModal();
    return renderBattle(panel, island);
  }
  if (state.stage === "fruit") {
    hideModal();
    return renderFruit(panel, island, art);
  }
  if (state.stage === "outro") {
    hideModal();
    return renderOutro(panel, island, art);
  }
}

/* ---------- narrative stages ---------- */

function renderArrival(panel, island, art) {
  const note = state.starvationNote;
  state.starvationNote = null;
  const media = island.photo
    ? `<img src="${island.photo}" class="arrival-photo" alt="${island.name}">`
    : art;
  panel.innerHTML = `
    <p class="arrival-eyebrow">NEW LOCATION</p>
    <p class="scene-region">${island.region}</p>
    <h2 class="scene-title">${island.name}</h2>
    ${media}
    <p class="arrival-tagline">${island.tagline}</p>
    ${note ? `<p class="scene-warning">${note}</p>` : ""}
    <button class="continue-btn" id="continueBtn">MAKE LANDFALL</button>
  `;
  document.getElementById("continueBtn").addEventListener("click", () => {
    state.stage = "intro";
    render();
  });
}

function renderIntro(panel, island) {
  panel.innerHTML = `
    <p class="scene-region">${island.region}</p>
    <h2 class="scene-title">${island.name}</h2>
    ${island.intro.map((p) => `<p class="scene-text">${p}</p>`).join("")}
    <button class="continue-btn" id="continueBtn">SET COURSE</button>
  `;
  document.getElementById("continueBtn").addEventListener("click", () => {
    state.decisionIdx = 0;
    state.stage = island.decisions.length ? "decision" : "outro";
    if (!island.decisions.length) advancePastDecisions(island);
    render();
  });
}

function renderDecisionModal(island) {
  const decision = island.decisions[state.decisionIdx];
  showModal(`
    <p class="modal-eyebrow modal-eyebrow-decision">DECISION</p>
    <p class="modal-prompt">${decision.prompt}</p>
    <ul class="choice-list">
      ${decision.options.map((opt, i) => `<li><button class="choice-btn" data-idx="${i}">${opt.label}</button></li>`).join("")}
    </ul>
  `);
  document.querySelectorAll("#modalCard .choice-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const opt = decision.options[parseInt(btn.dataset.idx, 10)];
      applyEffects(opt.effects);
      state.lastOutcomeNote = "";
      if (opt.flag) {
        state.crew[opt.flag] = true;
        if (CREW_NAMES[opt.flag] && !state.roster[opt.flag]) {
          addCompanion(opt.flag);
          addPoints(50);
        }
      }
      if (opt.damage) {
        const result = damageMember("luffy", opt.damage, "decision");
        state.lastOutcomeNote = result.message;
      }
      state.lastOutcome = opt.outcome;
      if (state.stage !== "gameover") state.stage = "outcome";
      render();
    });
  });
}

function renderOutcomeModal(island) {
  showModal(`
    <p class="modal-eyebrow modal-eyebrow-outcome">WHAT HAPPENED</p>
    <p class="modal-outcome-text">${state.lastOutcome}</p>
    ${state.lastOutcomeNote ? `<p class="scene-warning">${state.lastOutcomeNote}</p>` : ""}
    <button class="continue-btn" id="modalContinueBtn">CONTINUE</button>
  `);
  document.getElementById("modalContinueBtn").addEventListener("click", () => {
    const nextDecisionIdx = state.decisionIdx + 1;
    if (nextDecisionIdx < island.decisions.length) {
      state.decisionIdx = nextDecisionIdx;
      state.stage = "decision";
    } else {
      advancePastDecisions(island);
    }
    render();
  });
}

function advancePastDecisions(island) {
  if (island.villain && (!island.villain.requiresFlag || state.crew[island.villain.requiresFlag])) {
    startBattle(island.villain);
  } else {
    state.stage = "outro";
  }
}

function renderOutro(panel, island, art) {
  const outroText = resolveOutro(island);
  const isLast = state.islandIdx + 1 >= ISLANDS.length;
  panel.innerHTML = `
    <p class="scene-region">${island.region}</p>
    <h2 class="scene-title">${island.name}</h2>
    ${art}
    ${outroText.map((p) => `<p class="scene-text">${p}</p>`).join("")}
    ${crewTagsHtml(false)}
    <button class="continue-btn" id="continueBtn">${isLast ? "REACH THE GRAND LINE" : "SAIL ONWARD"}</button>
  `;
  document.getElementById("continueBtn").addEventListener("click", () => {
    if (isLast) {
      state.stage = "end";
    } else {
      goToNextIsland();
    }
    render();
  });
}

function goToNextIsland() {
  state.islandIdx += 1;
  state.food = clamp100(state.food - ISLAND_FOOD_DRAIN);
  if (state.food <= 0) {
    const targetId = pickRetaliationTarget();
    const result = damageMember(targetId, STARVATION_DAMAGE, "hunger");
    state.starvationNote = `Supplies run out. ${result.message}`;
    if (result.gameOver) return;
  }
  addPoints(10);
  state.stage = "arrival";
}

/* ---------- devil fruit ---------- */

function renderFruit(panel, island, art) {
  const fruit = island.fruit;
  const options = aliveMembers()
    .map((id) => `<li><button class="choice-btn" data-id="${id}">Give it to ${state.roster[id].name}</button></li>`)
    .join("");
  panel.innerHTML = `
    <p class="scene-region">${island.region}</p>
    <h2 class="scene-title">A Devil Fruit Discovery</h2>
    ${art}
    <p class="scene-text"><strong>${fruit.name}</strong>, ${fruit.shortName}. ${fruit.description}</p>
    <p class="prompt-text">Who should eat it?</p>
    <ul class="choice-list">${options}</ul>
  `;
  panel.querySelectorAll(".choice-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const member = state.roster[btn.dataset.id];
      member.maxHp += fruit.bonusHp;
      member.hp = Math.min(member.maxHp, member.hp + fruit.bonusHp);
      member.fruit = fruit.name;
      addPoints(40);
      state.stage = "outro";
      render();
    });
  });
}

/* ---------- battles ---------- */

function startBattle(villainConfig) {
  state.battle = {
    config: villainConfig,
    hp: villainConfig.maxHp,
    log: [`${villainConfig.name} squares up to fight!`],
    defendFactor: null
  };
  state.stage = "battle";
}

function battleMoves() {
  const moves = LUFFY_MOVES.slice();
  CREW_ORDER.forEach((id) => {
    if (id !== "luffy" && state.roster[id] && state.roster[id].alive && ASSIST_MOVES[id]) {
      moves.push(ASSIST_MOVES[id]);
    }
  });
  return moves;
}

function renderBattle(panel, island) {
  const battle = state.battle;
  const pct = Math.round((battle.hp / battle.config.maxHp) * 100);
  const moves = battleMoves();
  panel.innerHTML = `
    <p class="scene-region">${island.region}</p>
    <h2 class="scene-title battle-title">Battle: ${battle.config.name}</h2>
    <div class="boss-hp-row">
      <span class="boss-hp-label">${battle.config.name}</span>
      <span class="boss-hp-numbers">${battle.hp} / ${battle.config.maxHp}</span>
    </div>
    <div class="gauge boss-gauge"><div class="gauge-fill boss-fill" style="width:${pct}%"></div></div>
    <ul class="battle-log">
      ${battle.log.slice(0, 3).map((line) => `<li>${line}</li>`).join("")}
    </ul>
    <p class="prompt-text">Choose your move</p>
    <div class="move-grid">
      ${moves.map((m, i) => `<button class="move-btn" data-idx="${i}">${m.label}</button>`).join("")}
    </div>
  `;
  panel.querySelectorAll(".move-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      executeMove(moves[parseInt(btn.dataset.idx, 10)], island);
    });
  });
}

function executeMove(move, island) {
  if (move.defend) {
    const ally = lowestHpAliveMember();
    ally.hp = Math.min(ally.maxHp, ally.hp + move.heal);
    state.battle.log.unshift(`You brace for impact. ${ally.name} steadies up.`);
    state.battle.defendFactor = move.reduceFactor;
    bossRetaliate(island);
    render();
    return;
  }
  if (move.qte === "mash") {
    runMashQTE(move, (dmg) => {
      applyPlayerDamage(dmg, move, island);
    });
    return;
  }
  if (move.qte === "type") {
    runTypeQTE(move, (dmg, recoil) => {
      if (recoil) {
        const result = damageMember("luffy", recoil, "recoil");
        state.battle.log.unshift(`You overextend and take ${recoil} damage.`);
        if (result.gameOver) {
          render();
          return;
        }
      }
      applyPlayerDamage(dmg, move, island);
    });
    return;
  }
  const dmg = rand(move.dmg[0], move.dmg[1]);
  applyPlayerDamage(dmg, move, island);
}

function applyPlayerDamage(dmg, move, island) {
  state.battle.hp = Math.max(0, state.battle.hp - dmg);
  state.battle.log.unshift(`${move.label} hits ${state.battle.config.name} for ${dmg} damage!`);
  bossRetaliate(island);
  render();
}

function bossRetaliate(island) {
  if (state.battle.hp <= 0) {
    finishBattleWon(island);
    return;
  }
  const targetId = pickRetaliationTarget();
  let dmg = rand(state.battle.config.retaliation[0], state.battle.config.retaliation[1]);
  if (state.battle.defendFactor) {
    dmg = Math.round(dmg * (1 - state.battle.defendFactor));
  }
  state.battle.defendFactor = null;
  const result = damageMember(targetId, dmg, "battle");
  state.battle.log.unshift(result.message);
}

function finishBattleWon(island) {
  addPoints(state.battle.config.rewardPoints);
  state.battle.log.unshift(`${state.battle.config.name} is defeated!`);
  state.battle = null;
  state.stage = island.fruit ? "fruit" : "outro";
}

/* ---------- quick time events ---------- */

function runMashQTE(move, onComplete) {
  const panel = document.getElementById("scenePanel");
  let count = 0;
  const startTime = performance.now();

  panel.innerHTML = `
    <p class="qte-heading">MASH THE SPACE BAR</p>
    <p class="qte-sub">${move.label}</p>
    <div class="gauge qte-timerbar"><div class="gauge-fill qte-timerfill" id="qteTimerFill"></div></div>
    <p class="qte-count" id="qteCount">0</p>
    <button class="continue-btn qte-tap-btn" id="qteTapBtn" type="button">TAP</button>
  `;
  const countEl = document.getElementById("qteCount");
  const fillEl = document.getElementById("qteTimerFill");
  const tapBtn = document.getElementById("qteTapBtn");

  function bump() {
    count++;
    countEl.textContent = String(count);
  }
  function keyHandler(e) {
    if (e.code === "Space") {
      e.preventDefault();
      bump();
    }
  }
  tapBtn.addEventListener("click", bump);
  document.addEventListener("keydown", keyHandler);

  function tick() {
    const elapsed = performance.now() - startTime;
    const pct = Math.max(0, 1 - elapsed / MASH_DURATION);
    fillEl.style.width = pct * 100 + "%";
    if (elapsed >= MASH_DURATION) {
      document.removeEventListener("keydown", keyHandler);
      const bonus = Math.round((Math.min(count, MASH_THRESHOLD) / MASH_THRESHOLD) * move.bonusMax);
      const dmg = rand(move.base[0], move.base[1]) + bonus;
      onComplete(dmg);
      return;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function runTypeQTE(move, onComplete) {
  const panel = document.getElementById("scenePanel");
  let code = "";
  for (let i = 0; i < move.codeLength; i++) {
    code += TYPE_CHARSET[Math.floor(Math.random() * TYPE_CHARSET.length)];
  }
  let typed = 0;
  let finished = false;
  const startTime = performance.now();
  const shuffled = shuffle(code.split(""));

  panel.innerHTML = `
    <p class="qte-heading">TYPE THE CODE</p>
    <p class="qte-sub">${move.label}</p>
    <div class="gauge qte-timerbar"><div class="gauge-fill qte-timerfill" id="qteTimerFill"></div></div>
    <p class="qte-code" id="qteCode">${code
      .split("")
      .map((c) => `<span class="qte-letter">${c}</span>`)
      .join("")}</p>
    <div class="qte-letter-btns">
      ${shuffled.map((c) => `<button class="qte-letter-btn" data-ch="${c}">${c}</button>`).join("")}
    </div>
  `;
  const letterEls = Array.from(document.querySelectorAll("#qteCode .qte-letter"));
  const fillEl = document.getElementById("qteTimerFill");

  function finish(success) {
    if (finished) return;
    finished = true;
    document.removeEventListener("keydown", keyHandler);
    if (success) {
      const elapsed = performance.now() - startTime;
      let dmg;
      if (elapsed < 1200) dmg = move.hitDmg[1];
      else if (elapsed < 2500) dmg = Math.round((move.hitDmg[0] + move.hitDmg[1]) / 2);
      else dmg = move.hitDmg[0];
      onComplete(dmg, null);
    } else {
      const dmg = rand(move.missDmg[0], move.missDmg[1]);
      onComplete(dmg, move.selfRecoil || null);
    }
  }

  function handleChar(ch) {
    if (finished) return;
    if (ch === code[typed]) {
      letterEls[typed].classList.add("qte-letter-hit");
      typed++;
      if (typed >= code.length) finish(true);
    }
  }

  function keyHandler(e) {
    handleChar(e.key.toUpperCase());
  }
  document.addEventListener("keydown", keyHandler);
  panel.querySelectorAll(".qte-letter-btn").forEach((btn) => {
    btn.addEventListener("click", () => handleChar(btn.dataset.ch));
  });

  function tick() {
    if (finished) return;
    const elapsed = performance.now() - startTime;
    const pct = Math.max(0, 1 - elapsed / TYPE_DURATION);
    fillEl.style.width = pct * 100 + "%";
    if (elapsed >= TYPE_DURATION) {
      finish(false);
      return;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ---------- ending / game over ---------- */

function pickEnding() {
  for (const ending of ENDINGS) {
    if (state.stats.resolve >= ending.minResolve && state.stats.bond >= ending.minBond) {
      return ending;
    }
  }
  return ENDINGS[ENDINGS.length - 1];
}

function renderEnding(panel) {
  const ending = pickEnding();
  panel.innerHTML = `
    <p class="scene-region">The Grand Line Awaits</p>
    <h2 class="ending-title">${ending.title}</h2>
    ${SCENE_ART.flagArt}
    <p class="scene-text">${ending.text}</p>
    <p class="prompt-text">YOUR CREW</p>
    ${crewTagsHtml(true)}
    <p class="prompt-text">FINAL STATS</p>
    <p class="scene-text">Crew Bond: ${state.stats.bond} / Resolve: ${state.stats.resolve} / Infamy: ${state.stats.infamy} / Food: ${state.food}</p>
    <p class="scene-text">Final Score: ${state.points} points</p>
    <button class="continue-btn" id="restartBtn">SAIL AGAIN FROM FOOSHA</button>
  `;
  document.getElementById("restartBtn").addEventListener("click", restartGame);
}

function renderGameOver(panel) {
  panel.innerHTML = `
    <p class="scene-region">The Voyage Ends</p>
    <h2 class="ending-title gameover-title">GAME OVER</h2>
    ${SCENE_ART.swordArt}
    <p class="scene-outcome">${state.gameOverReason}</p>
    <p class="prompt-text">YOUR CREW</p>
    ${crewTagsHtml(true)}
    <p class="prompt-text">FINAL SCORE</p>
    <p class="scene-text">${state.points} points</p>
    <button class="continue-btn" id="restartBtn">TRY AGAIN FROM FOOSHA</button>
  `;
  document.getElementById("restartBtn").addEventListener("click", restartGame);
}

function restartGame() {
  state = makeInitialState();
  render();
}

render();
