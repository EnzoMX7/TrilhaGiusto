/**
 * Colégio Maxi · Trilha de Visita
 * Recebe o envio do site (fetch POST) e grava uma linha por família
 * na aba "Respostas" da planilha onde este script está anexado.
 *
 * COMO PUBLICAR:
 * 1. Abra (ou crie) uma planilha no Google Sheets.
 * 2. Menu Extensões → Apps Script.
 * 3. Apague o conteúdo padrão e cole este arquivo inteiro.
 * 4. Implantar → Nova implantação → tipo "App da Web".
 *    - Executar como: Eu (sua conta)
 *    - Quem pode acessar: Qualquer pessoa
 * 5. Autorize as permissões pedidas (é a sua própria planilha).
 * 6. Copie a URL do App da Web gerada e cole em
 *    assets/js/app.js, na constante CONFIG.SHEET_WEBAPP_URL.
 * 7. Sempre que editar este script, gere uma NOVA implantação
 *    (ou "Gerenciar implantações" → editar → nova versão) para
 *    que as mudanças valham na URL já em uso.
 */

const SHEET_NAME = "Respostas";

const COLUMNS = [
  "timestamp",
  "responsavel1_nome",
  "relacao_crianca",
  "whatsapp",
  "email",
  "responsavel2_nome",
  "escolaridade_responsavel1",
  "escolaridade_responsavel2",
  "cidade_bairro",
  "como_conheceu",
  "crianca_nome",
  "crianca_nascimento",
  "segmento_pretendido",
  "escola_atual",
  "primeira_experiencia_escolar",
  "q1_motivo_busca",
  "q2_valores_fortalecer",
  "q3_leitura_rotina",
  "q4_papel_familia",
  "q5_inegociavel",
  "q6_limites_rotina",
  "q7_alem_notas",
  "q8_o_que_pesou",
  "q9_acompanhamento",
  "q10_conversar_visita",
  "consentimento_lgpd",
  "investimento_educacao"
];

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUMNS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// ============================================================
// VOTOS · "O que levou vocês a buscar o Maxi neste momento?"
// Guarda uma contagem por opção, numa aba separada, para o site
// mostrar a porcentagem de respostas em tempo real.
// ============================================================
const VOTE_SHEET_NAME = "VotosMotivoBusca";

const VOTE_OPTIONS = [
  "Mudança de cidade/bairro",
  "Busca por mais excelência acadêmica",
  "Busca por outros valores/ambiente",
  "Primeira experiência escolar",
  "Indicação de outra família"
];

function getVoteSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(VOTE_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(VOTE_SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["opcao", "votos"]);
    VOTE_OPTIONS.forEach((opt) => sheet.appendRow([opt, 0]));
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getVotos_() {
  const sheet = getVoteSheet_();
  const data = sheet.getDataRange().getValues();
  const votos = {};
  for (let i = 1; i < data.length; i++) {
    votos[data[i][0]] = Number(data[i][1]) || 0;
  }
  return votos;
}

function incrementarVoto_(opcao) {
  const sheet = getVoteSheet_();
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === opcao) {
      sheet.getRange(i + 1, 2).setValue((Number(data[i][1]) || 0) + 1);
      return;
    }
  }
  sheet.appendRow([opcao, 1]); // opção não prevista originalmente
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    if (data.action === "incrementar_voto") {
      incrementarVoto_(data.opcao);
      return ContentService
        .createTextOutput(JSON.stringify({ ok: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const sheet = getSheet_();
    const row = COLUMNS.map((col) => data[col] !== undefined ? data[col] : "");
    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  if (e.parameter && e.parameter.action === "votos") {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, votos: getVotos_() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService
    .createTextOutput(JSON.stringify({ status: "online", sheet: SHEET_NAME }))
    .setMimeType(ContentService.MimeType.JSON);
}
