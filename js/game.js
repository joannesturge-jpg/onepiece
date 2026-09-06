/* Game engine for Luffy's Voyage. Reads ISLANDS / ENDINGS / CREW_NAMES
   from story-data.js and drives a small state machine: intro -> decision
   -> outcome -> outro -> next island -> ... -> ending. */

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
  </svg>`
};

const state = {
  islandIdx: 0,
  decisionIdx: 0,
  stage: "intro",
  stats: { bond: 50, resolve: 50, infamy: 10 },
  crew: {},
  lastOutcome: ""
};

function clamp(n) {
  return Math.max(0, Math.min(100, n));
}

function applyEffects(effects) {
  if (!effects) return;
  state.stats.bond = clamp(state.stats.bond + (effects.bond || 0));
  state.stats.resolve = clamp(state.stats.resolve + (effects.resolve || 0));
  state.stats.infamy = clamp(state.stats.infamy + (effects.infamy || 0));
}

function currentIsland() {
  return ISLANDS[state.islandIdx];
}

function resolveOutro(island) {
  if (Array.isArray(island.outro)) return island.outro;
  for (const decision of island.decisions) {
    for (const option of decision.options) {
      if (option.flag && state.crew[option.flag]) {
        if (island.outro[option.flag]) return island.outro[option.flag];
      }
    }
  }
  return island.outro.default;
}

function updateStatBars() {
  document.getElementById("bondFill").style.width = state.stats.bond + "%";
  document.getElementById("resolveFill").style.width = state.stats.resolve + "%";
  document.getElementById("infamyFill").style.width = state.stats.infamy + "%";
}

function renderTrailMap() {
  const map = document.getElementById("trailMap");
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

function crewTagsHtml() {
  const names = Object.keys(state.crew).filter((k) => state.crew[k]).map((k) => CREW_NAMES[k]);
  if (names.length === 0) {
    return `<div class="crew-tag-list"><span class="crew-tag">SAILING SOLO</span></div>`;
  }
  return `<div class="crew-tag-list">${names.map((n) => `<span class="crew-tag">${n.toUpperCase()}</span>`).join("")}</div>`;
}

function render() {
  updateStatBars();
  renderTrailMap();
  const panel = document.getElementById("scenePanel");

  if (state.stage === "end") {
    renderEnding(panel);
    return;
  }

  const island = currentIsland();
  const art = SCENE_ART[island.art] || "";

  if (state.stage === "intro") {
    panel.innerHTML = `
      <p class="scene-region">${island.region}</p>
      <h2 class="scene-title">${island.name}</h2>
      ${art}
      ${island.intro.map((p) => `<p class="scene-text">${p}</p>`).join("")}
      <button class="continue-btn" id="continueBtn">SET COURSE</button>
    `;
    document.getElementById("continueBtn").addEventListener("click", () => {
      state.decisionIdx = 0;
      state.stage = island.decisions.length ? "decision" : "outro";
      render();
    });
    return;
  }

  if (state.stage === "decision") {
    const decision = island.decisions[state.decisionIdx];
    panel.innerHTML = `
      <p class="scene-region">${island.region}</p>
      <h2 class="scene-title">${island.name}</h2>
      ${art}
      <p class="prompt-text">${decision.prompt}</p>
      <ul class="choice-list">
        ${decision.options.map((opt, i) => `<li><button class="choice-btn" data-idx="${i}">${opt.label}</button></li>`).join("")}
      </ul>
    `;
    panel.querySelectorAll(".choice-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const opt = decision.options[parseInt(btn.dataset.idx, 10)];
        applyEffects(opt.effects);
        if (opt.flag) state.crew[opt.flag] = true;
        state.lastOutcome = opt.outcome;
        state.stage = "outcome";
        render();
      });
    });
    return;
  }

  if (state.stage === "outcome") {
    panel.innerHTML = `
      <p class="scene-region">${island.region}</p>
      <h2 class="scene-title">${island.name}</h2>
      ${art}
      <p class="scene-outcome">${state.lastOutcome}</p>
      <button class="continue-btn" id="continueBtn">CONTINUE</button>
    `;
    document.getElementById("continueBtn").addEventListener("click", () => {
      const nextDecisionIdx = state.decisionIdx + 1;
      if (nextDecisionIdx < island.decisions.length) {
        state.decisionIdx = nextDecisionIdx;
        state.stage = "decision";
      } else {
        state.stage = "outro";
      }
      render();
    });
    return;
  }

  if (state.stage === "outro") {
    const outroText = resolveOutro(island);
    panel.innerHTML = `
      <p class="scene-region">${island.region}</p>
      <h2 class="scene-title">${island.name}</h2>
      ${art}
      ${outroText.map((p) => `<p class="scene-text">${p}</p>`).join("")}
      ${crewTagsHtml()}
      <button class="continue-btn" id="continueBtn">${state.islandIdx + 1 < ISLANDS.length ? "SAIL ONWARD" : "REACH THE GRAND LINE"}</button>
    `;
    document.getElementById("continueBtn").addEventListener("click", () => {
      if (state.islandIdx + 1 < ISLANDS.length) {
        state.islandIdx += 1;
        state.stage = "intro";
      } else {
        state.stage = "end";
      }
      render();
    });
    return;
  }
}

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
    ${crewTagsHtml()}
    <p class="prompt-text">FINAL STATS</p>
    <p class="scene-text">Crew Bond: ${state.stats.bond} / Resolve: ${state.stats.resolve} / Infamy: ${state.stats.infamy}</p>
    <button class="continue-btn" id="restartBtn">SAIL AGAIN FROM FOOSHA</button>
  `;
  document.getElementById("restartBtn").addEventListener("click", () => {
    state.islandIdx = 0;
    state.decisionIdx = 0;
    state.stage = "intro";
    state.stats = { bond: 50, resolve: 50, infamy: 10 };
    state.crew = {};
    state.lastOutcome = "";
    render();
  });
}

render();
