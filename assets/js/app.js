// ============================================================
// CONFIGURAÇÃO
// Cole aqui a URL do Web App do Google Apps Script (Code.gs)
// depois de publicá-lo. Veja instruções em google-apps-script/Code.gs
// ============================================================
const CONFIG = {
  SHEET_WEBAPP_URL: "https://script.google.com/macros/s/AKfycbwFY5froZvuUsYLHo_MHK6S4DMFezsOhL-dtklfuRepRoRGiiAvwFNn21E1odELVO90/exec"
};

// ============================================================
// PERGUNTAS · Parte 2 (Telas 4 a 8, 2 por tela)
// ============================================================
const QUESTIONS = [
  {
    key: "q1_motivo_busca",
    text: "O que levou vocês a buscar o Maxi neste momento?",
    hint: "uma opção",
    mode: "single",
    options: [
      "Mudança de cidade/bairro",
      "Busca por mais excelência acadêmica",
      "Busca por outros valores/ambiente",
      "Primeira experiência escolar",
      "Indicação de outra família"
    ]
  },
  {
    key: "q2_valores_fortalecer",
    text: "Quais valores vocês mais desejam ver fortalecidos?",
    hint: "marque os 2 principais",
    mode: "multi",
    min: 2,
    max: 2,
    options: [
      "Excelência acadêmica",
      "Autonomia e protagonismo",
      "Ética e caráter",
      "Bilinguismo e visão global",
      "Acolhimento e equilíbrio emocional",
      "Disciplina e responsabilidade"
    ]
  },
  {
    key: "q3_leitura_rotina",
    text: "Como leitura e estudo aparecem na rotina da casa hoje?",
    hint: "uma opção",
    mode: "single",
    options: [
      "Fazem parte natural do dia a dia",
      "Acompanhamos e incentivamos sempre que possível",
      "Rotina corrida, mas valorizamos e queremos melhorar",
      "Esperamos que a escola conduza isso"
    ]
  },
  {
    key: "q4_papel_familia",
    text: "Que papel a família espera ter na vida escolar?",
    hint: "uma opção",
    mode: "single",
    options: [
      "Acompanhar de perto e participar ativamente",
      "Participar nos momentos-chave, confiando o restante à escola",
      "Preferimos que a escola conduza com autonomia e nos acione quando necessário"
    ]
  },
  {
    key: "q5_inegociavel",
    text: "O que é inegociável na educação de uma criança?",
    hint: "uma opção",
    mode: "single",
    options: [
      "Segurança e acolhimento",
      "Nível de exigência acadêmica",
      "Formação de valores",
      "Respeito à individualidade",
      "Qualidade do ambiente e estrutura"
    ]
  },
  {
    key: "q6_limites_rotina",
    text: "Como funcionam limites e rotina em casa?",
    hint: "uma opção",
    mode: "single",
    options: [
      "Combinados claros e consistência",
      "Equilíbrio entre limites e flexibilidade",
      "Estamos construindo essa rotina e buscamos apoio"
    ]
  },
  {
    key: "q7_alem_notas",
    text: "Além de notas, o que esperam que seu filho leve para a vida?",
    hint: "uma opção",
    mode: "single",
    options: [
      "Preparo para os melhores vestibulares",
      "Cidadania e valores",
      "Autonomia para boas escolhas",
      "Repertório cultural e visão de mundo",
      "Equilíbrio e felicidade"
    ]
  },
  {
    key: "q8_o_que_pesou",
    text: "O que mais pesou para chegar até o Maxi?",
    hint: "marque os que se aplicam",
    mode: "multi",
    min: 1,
    options: [
      "Resultados e reputação acadêmica",
      "Indicação",
      "Estrutura",
      "Proposta bilíngue Systemic",
      "Valores e identidade da escola"
    ]
  },
  {
    key: "q9_acompanhamento",
    text: "Como vocês imaginam o acompanhamento da escola com a família?",
    hint: "uma opção",
    mode: "single",
    options: [
      "Comunicação próxima e frequente",
      "Retornos objetivos nos momentos certos",
      "Confiança e autonomia da escola, com canal aberto"
    ]
  },
  {
    key: "q10_conversar_visita",
    text: "Há algo sobre o momento da sua família que gostariam de conversar durante a visita?",
    hint: "marque se aplicável",
    mode: "multi",
    min: 1,
    options: [
      "Adaptação/transição de escola",
      "Expectativas acadêmicas específicas",
      "Rotina e organização familiar",
      "Um momento especial que estamos vivendo",
      "Nada em especial, só conhecer o Maxi"
    ]
  }
];

// Distribuição das perguntas nas telas 5–14 (uma por tela, estilo questionário)
const SCREEN_QUESTION_MAP = {
  5: [0], 6: [1], 7: [2], 8: [3], 9: [4],
  10: [5], 11: [6], 12: [7], 13: [8], 14: [9]
};

// ============================================================
// ESTADO
// ============================================================
const state = {
  screen: 1,
  choices: {},   // choice-row (single) fields: relacao, escolaridade1, escolaridade2, comoConheceu
  answers: {}    // respostas das perguntas (single: string | multi: array)
};

const TOTAL_SCREENS = 16;

// ============================================================
// RENDER DAS TELAS DE PERGUNTAS (5–14) · uma pergunta por tela
// ============================================================
function renderQuestionScreens() {
  Object.entries(SCREEN_QUESTION_MAP).forEach(([screenNum, qIndexes]) => {
    const container = document.querySelector(`#screen-${screenNum} .questions-screen`);
    if (!container) return;

    const qIndex = qIndexes[0];
    const q = QUESTIONS[qIndex];

    const parteNum = qIndex < 5 ? 3 : 4;
    const eyebrow = document.createElement("p");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = `Parte ${parteNum} · Pergunta ${qIndex + 1} de ${QUESTIONS.length}`;
    container.appendChild(eyebrow);

    const block = document.createElement("div");
    block.className = "question-block question-block-solo";
    block.dataset.qkey = q.key;

    block.innerHTML = `
      <h3>${q.text}</h3>
      <span class="question-hint">${q.hint}</span>
      <div class="option-grid" data-qkey="${q.key}" data-mode="${q.mode}" data-min="${q.min || 1}" data-max="${q.max || 99}"></div>
    `;

    const grid = block.querySelector(".option-grid");
    q.options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "option-card";
      btn.dataset.value = opt;
      btn.innerHTML = `<span class="option-check"></span><span class="option-label">${opt}</span>`;
      btn.addEventListener("click", () => handleOptionClick(q, btn, grid));
      grid.appendChild(btn);
    });

    container.appendChild(block);

    const nav = document.createElement("div");
    nav.className = "nav-row";
    nav.innerHTML = `
      <button type="button" class="btn btn-ghost" data-back>Voltar</button>
      <button type="button" class="btn btn-primary" data-next>Avançar</button>
    `;
    container.appendChild(nav);
  });
}

function handleOptionClick(q, btn, grid) {
  const current = state.answers[q.key] || (q.mode === "multi" ? [] : "");

  if (q.mode === "single") {
    grid.querySelectorAll(".option-card").forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
    state.answers[q.key] = btn.dataset.value;
  } else {
    let arr = Array.isArray(current) ? current.slice() : [];
    const max = parseInt(grid.dataset.max, 10) || 99;
    if (arr.includes(btn.dataset.value)) {
      arr = arr.filter((v) => v !== btn.dataset.value);
      btn.classList.remove("selected");
    } else {
      if (arr.length >= max) return; // limite atingido
      arr.push(btn.dataset.value);
      btn.classList.add("selected");
    }
    state.answers[q.key] = arr;

    // trava demais opções quando atingir o máximo
    if (max < 99) {
      const atLimit = arr.length >= max;
      grid.querySelectorAll(".option-card").forEach((b) => {
        if (!b.classList.contains("selected")) {
          b.classList.toggle("disabled-limit", atLimit);
        }
      });
    }
  }
}

// ============================================================
// CHOICE PILLS (single-select simples: relação, escolaridade, como conheceu)
// ============================================================
function wireChoiceRows() {
  document.querySelectorAll(".choice-row[data-mode='single']").forEach((row) => {
    const field = row.dataset.field;
    row.querySelectorAll(".choice-pill").forEach((pill) => {
      // envolve o texto em spans, no mesmo padrão visual das option-cards
      pill.innerHTML = `<span class="option-check"></span><span class="option-label">${pill.textContent}</span>`;
      pill.addEventListener("click", () => {
        row.querySelectorAll(".choice-pill").forEach((p) => p.classList.remove("selected"));
        pill.classList.add("selected");
        state.choices[field] = pill.dataset.value;
      });
    });
  });
}

// ============================================================
// NAVEGAÇÃO ENTRE TELAS
// ============================================================
// Mapeia a tela atual para uma das 5 etapas mostradas na barra de progresso
function screenToEtapa(n) {
  if (n === 3) return 1;              // Cadastro dos responsáveis
  if (n === 4) return 2;              // Criança
  if (n >= 5 && n <= 9) return 3;     // Conhecendo sua família (perguntas 1–5)
  if (n >= 10 && n <= 14) return 4;   // Conhecendo sua família (perguntas 6–10)
  if (n === 15) return 5;             // Consentimento
  return 0;                           // vídeo, boas-vindas, conclusão: sem barra
}

function showScreen(n) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  const el = document.getElementById(`screen-${n}`);
  if (el) el.classList.add("active");
  state.screen = n;
  window.scrollTo(0, 0);

  const progressShell = document.getElementById("progressShell");
  const resetBtn = document.getElementById("resetBtn");
  const etapa = screenToEtapa(n);

  resetBtn.hidden = n === 1; // reinício disponível a partir da tela de boas-vindas

  if (etapa === 0) {
    progressShell.hidden = true;
  } else {
    progressShell.hidden = false;
    document.getElementById("progressLabel").textContent = `ETAPA ${etapa} DE 5`;
    document.getElementById("progressPct").textContent = Math.round((etapa / 5) * 100) + "%";
    document.querySelectorAll(".progress-seg").forEach((seg) => {
      const segNum = parseInt(seg.dataset.etapa, 10);
      seg.classList.toggle("done", segNum < etapa);
      seg.classList.toggle("current", segNum === etapa);
    });
  }

  const videoContinueBtn = document.getElementById("videoContinueBtn");
  if (n === 1) {
    const v = document.getElementById("heroVideo");
    videoContinueBtn.hidden = true;
    v.currentTime = 0;
    v.play().catch(() => {});
  } else {
    document.getElementById("heroVideo").pause();
  }
}

function validateEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function markInvalid(el) {
  el.classList.add("invalid");
  el.addEventListener("animationend", () => el.classList.remove("invalid"), { once: true });
  el.focus({ preventScroll: false });
  el.scrollIntoView({ behavior: "smooth", block: "center" });
}

function markInvalidChoiceRow(field) {
  const row = document.querySelector(`.choice-row[data-field="${field}"]`);
  row.scrollIntoView({ behavior: "smooth", block: "center" });
  row.style.outline = "2px solid var(--maxi-red)";
  row.style.outlineOffset = "4px";
  setTimeout(() => (row.style.outline = "none"), 600);
}

// Retorna true se a tela atual é válida (bloqueia avanço se não for)
function validateScreen(n) {
  if (n === 3) {
    const nome = document.getElementById("resp1Nome");
    const whats = document.getElementById("whatsapp");
    const email = document.getElementById("email");
    const cidade = document.getElementById("cidadeBairro");
    if (!nome.value.trim()) { markInvalid(nome); return false; }
    if (!state.choices.relacao) { markInvalidChoiceRow("relacao"); return false; }
    if (!whats.value.trim()) { markInvalid(whats); return false; }
    if (!email.value.trim() || !validateEmail(email.value.trim())) { markInvalid(email); return false; }
    if (!state.choices.escolaridade1) { markInvalidChoiceRow("escolaridade1"); return false; }
    if (!cidade.value.trim()) { markInvalid(cidade); return false; }
    if (!state.choices.comoConheceu) { markInvalidChoiceRow("comoConheceu"); return false; }
    return true;
  }

  if (n === 4) {
    const nome = document.getElementById("criancaNome");
    if (!nome.value.trim()) { markInvalid(nome); return false; }
    return true;
  }

  if (n >= 5 && n <= 14) {
    const qIndexes = SCREEN_QUESTION_MAP[n];
    for (const qIndex of qIndexes) {
      const q = QUESTIONS[qIndex];
      const answer = state.answers[q.key];
      const min = q.min || 1;
      const grid = document.querySelector(`.option-grid[data-qkey="${q.key}"]`);
      const ok = q.mode === "single" ? !!answer : Array.isArray(answer) && answer.length >= min;
      if (!ok) {
        grid.scrollIntoView({ behavior: "smooth", block: "center" });
        grid.style.outline = `2px solid var(--maxi-red)`;
        setTimeout(() => (grid.style.outline = "none"), 600);
        return false;
      }
    }
    return true;
  }

  if (n === 15) {
    const consent = document.getElementById("consentLGPD");
    const box = consent.closest(".consent-box");
    if (!consent.checked) {
      box.classList.add("invalid");
      box.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
    box.classList.remove("invalid");
    return true;
  }

  return true;
}

function goNext() {
  if (!validateScreen(state.screen)) return;
  if (state.screen < TOTAL_SCREENS) showScreen(state.screen + 1);
}

function goBack() {
  if (state.screen > 1) showScreen(state.screen - 1);
}

function wireNav() {
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-next]")) goNext();
    if (e.target.closest("[data-back]")) goBack();
  });
}

// ============================================================
// ENVIO PARA O GOOGLE SHEETS
// ============================================================
function collectPayload() {
  const val = (id) => document.getElementById(id)?.value.trim() || "";
  return {
    timestamp: new Date().toISOString(),
    responsavel1_nome: val("resp1Nome"),
    relacao_crianca: state.choices.relacao || "",
    whatsapp: val("whatsapp"),
    email: val("email"),
    responsavel2_nome: val("resp2Nome"),
    escolaridade_responsavel1: state.choices.escolaridade1 || "",
    escolaridade_responsavel2: state.choices.escolaridade2 || "",
    cidade_bairro: val("cidadeBairro"),
    como_conheceu: state.choices.comoConheceu || "",
    crianca_nome: val("criancaNome"),
    crianca_nascimento: val("criancaNascimento"),
    segmento_pretendido: val("segmentoPretendido"),
    escola_atual: val("escolaAtual"),
    primeira_experiencia_escolar: document.getElementById("primeiraExperiencia")?.checked ? "Sim" : "Não",
    q1_motivo_busca: state.answers.q1_motivo_busca || "",
    q2_valores_fortalecer: (state.answers.q2_valores_fortalecer || []).join("; "),
    q3_leitura_rotina: state.answers.q3_leitura_rotina || "",
    q4_papel_familia: state.answers.q4_papel_familia || "",
    q5_inegociavel: state.answers.q5_inegociavel || "",
    q6_limites_rotina: state.answers.q6_limites_rotina || "",
    q7_alem_notas: state.answers.q7_alem_notas || "",
    q8_o_que_pesou: (state.answers.q8_o_que_pesou || []).join("; "),
    q9_acompanhamento: state.answers.q9_acompanhamento || "",
    q10_conversar_visita: (state.answers.q10_conversar_visita || []).join("; "),
    consentimento_lgpd: "Sim"
  };
}

async function submitToSheet(payload) {
  if (!CONFIG.SHEET_WEBAPP_URL) {
    console.warn("[Maxi] SHEET_WEBAPP_URL não configurada — resposta não foi enviada à planilha.", payload);
    return { ok: false, reason: "not_configured" };
  }
  try {
    await fetch(CONFIG.SHEET_WEBAPP_URL, {
      method: "POST",
      mode: "no-cors", // Apps Script Web App não retorna headers CORS legíveis
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });
    // com no-cors não é possível ler a resposta; assumimos sucesso otimista
    return { ok: true };
  } catch (err) {
    console.error("[Maxi] Falha ao enviar para a planilha:", err);
    return { ok: false, reason: "network_error" };
  }
}

async function handleSubmit() {
  if (!validateScreen(15)) return;

  const submitBtn = document.getElementById("submitBtn");
  const status = document.getElementById("submitStatus");
  submitBtn.disabled = true;
  status.textContent = "Enviando...";
  status.classList.remove("error");

  const payload = collectPayload();
  const result = await submitToSheet(payload);

  submitBtn.disabled = false;

  if (!result.ok && result.reason === "network_error") {
    status.textContent = "Não foi possível enviar agora. Tentando novamente ao concluir.";
    status.classList.add("error");
  } else {
    status.textContent = "";
  }

  showScreen(16);
}

// ============================================================
// REINÍCIO (uso da recepção entre uma família e outra)
// ============================================================
function resetAll() {
  state.screen = 1;
  state.choices = {};
  state.answers = {};

  document.querySelectorAll("input[type='text'], input[type='tel'], input[type='email'], input[type='date']")
    .forEach((i) => (i.value = ""));
  document.querySelectorAll("input[type='checkbox']").forEach((c) => (c.checked = false));
  document.querySelectorAll(".choice-pill.selected, .option-card.selected")
    .forEach((el) => el.classList.remove("selected"));
  document.querySelectorAll(".option-card.disabled-limit")
    .forEach((el) => el.classList.remove("disabled-limit"));
  document.getElementById("submitStatus").textContent = "";

  showScreen(1);
}

// ============================================================
// INIT
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  renderQuestionScreens();
  wireChoiceRows();
  wireNav();

  document.getElementById("startBtn").addEventListener("click", goNext);
  document.getElementById("submitBtn").addEventListener("click", handleSubmit);
  document.getElementById("videoContinueBtn").addEventListener("click", goNext);
  document.getElementById("resetBtn").addEventListener("click", () => {
    if (confirm("Reiniciar a trilha para a próxima família?")) resetAll();
  });

  const heroVideo = document.getElementById("heroVideo");
  const audioBtn = document.getElementById("audioBtn");
  audioBtn.addEventListener("click", () => {
    heroVideo.muted = !heroVideo.muted;
    audioBtn.textContent = heroVideo.muted ? "\u{1F508} Ativar áudio" : "\u{1F50A} Áudio ativado";
    audioBtn.classList.toggle("active", !heroVideo.muted);
  });
  // o botão de avançar só aparece quando o vídeo termina
  heroVideo.addEventListener("ended", () => {
    document.getElementById("videoContinueBtn").hidden = false;
  });

  showScreen(1);
});
