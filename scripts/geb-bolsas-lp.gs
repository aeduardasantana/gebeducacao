/**
 * GEB EDUCAÇÃO — LP CONSULTA DE BOLSAS (v1)
 * Novo Apps Script, independente do Apps Script do catálogo.
 * Destino: CRM Central GEB (aba LEADS_BOLSAS_LP, sem alterar outras abas).
 * Publicar como Aplicativo da Web: executar como proprietário / acesso Qualquer pessoa.
 */
const BOLSAS_CFG = Object.freeze({
  spreadsheetId: PropertiesService.getScriptProperties().getProperty("BOLSAS_SHEET_ID") || "",
  tab: "LEADS_BOLSAS_LP",
  prefix: "GEB-BOL",
  timezone: "America/Sao_Paulo"
});

const BOLSAS_HEADERS = [
  "Criado em", "Protocolo", "Request ID", "Status comercial",
  "Nome", "WhatsApp", "E-mail", "Cidade", "UF", "Para quem",
  "Nível", "Áreas de interesse", "Curso desejado", "Outra opção de curso",
  "Modalidade", "Solicitação", "Aceite atendimento", "Aceite marketing",
  "Origem", "URL da página", "utm_source", "utm_medium",
  "utm_campaign", "utm_content", "utm_term"
];

/** Execute uma única vez pelo editor do Apps Script, antes de implantar. */
function configurarBolsas() {
  const sheet = bolsasSheet_();
  Logger.log("Aba preparada: " + sheet.getName());
  Logger.log("Arquivo: https://docs.google.com/spreadsheets/d/" + BOLSAS_CFG.spreadsheetId + "/edit");
}

/** Execute para verificar o acesso sem incluir lead fictício. */
function verificarBolsas() {
  const sheet = bolsasSheet_();
  Logger.log(JSON.stringify({aba:sheet.getName(), linhas:sheet.getLastRow(), colunas:sheet.getLastColumn()}));
}

function doPost(e) {
  const p = (e && e.parameter) || {};
  try {
    if (limpar_(p.website, 120)) return respostaPost_("Ignorado");
    const requestId = limpar_(p.requestId, 50);
    const name = limpar_(p.name, 110);
    const phone = limpar_(p.phone, 20).replace(/\D/g, "");
    const city = limpar_(p.city, 90);
    const uf = limpar_(p.state, 2).toUpperCase();
    const level = limpar_(p.level, 90);
    const beneficiary = limpar_(p.beneficiary, 80);
    const mode = limpar_(p.mode, 60);
    const intent = limpar_(p.intent, 100);
    const areas = limpar_(p.areasJoined, 400);
    const consent = p.consent === "on" || p.consent === "true";

    if (!/^[a-f0-9-]{32,36}$/i.test(requestId) || name.length < 2 ||
        !/^\d{10,11}$/.test(phone) || !city || !/^[A-Z]{2}$/.test(uf) ||
        !level || !beneficiary || !mode || !intent || !areas || !consent) {
      throw new Error("Dados obrigatórios inválidos.");
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      const sheet = bolsasSheet_();
      const found = buscarRegistro_(sheet,requestId);
      if (found) {
        CacheService.getScriptCache().put("bolsa:" + requestId,found,21600);
        return respostaPost_("Registrado");
      }

      const date = new Date();
      const number = sheet.getLastRow();
      const protocol = BOLSAS_CFG.prefix + "-" +
        Utilities.formatDate(date,BOLSAS_CFG.timezone,"yyyyMMdd") + "-" +
        String(number).padStart(6,"0");
      const row = [
        date, protocol, requestId, "Novo",
        name, phone, limpar_(p.email,140), city, uf, beneficiary,
        level, areas, limpar_(p.course1,110), limpar_(p.course2,110),
        mode, intent, true, p.marketing === "on" || p.marketing === "true",
        limpar_(p.source,100), limpar_(p.pageUrl,600),
        limpar_(p.utm_source,120), limpar_(p.utm_medium,120),
        limpar_(p.utm_campaign,150), limpar_(p.utm_content,150),
        limpar_(p.utm_term,150)
      ];
      sheet.appendRow(row.map((value,index) => index === 0 || typeof value === "boolean" ? value : seguroPlanilha_(value)));
      const rowNumber = sheet.getLastRow();
      sheet.getRange(rowNumber,6).setNumberFormat("@"); // DDD + telefone
      CacheService.getScriptCache().put("bolsa:" + requestId,protocol,21600);
      return respostaPost_("Registrado");
    } finally {
      lock.releaseLock();
    }
  } catch (error) {
    console.error("LP Bolsas doPost: " + error);
    return respostaPost_("Não registrado");
  }
}

/**
 * Consulta apenas protocolo associado a um identificador aleatório.
 * Não entrega nome, telefone nem outras informações pessoais por URL.
 * A LP consome este retorno como script (JSONP), sem depender de CORS.
 */
function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.action !== "status") {
    return ContentService.createTextOutput("GEB Educação — LP Bolsas API ativa")
      .setMimeType(ContentService.MimeType.TEXT);
  }
  const requestId = limpar_(p.requestId, 50);
  const callback = limpar_(p.callback, 60);
  if (!/^[a-f0-9-]{32,36}$/i.test(requestId) || callback !== "__gebBolsasStatus") {
    return ContentService.createTextOutput("/* solicitação inválida */")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  let protocol = CacheService.getScriptCache().get("bolsa:" + requestId);
  if (!protocol) {
    try {
      protocol = buscarRegistro_(bolsasSheet_(),requestId);
      if (protocol) CacheService.getScriptCache().put("bolsa:" + requestId,protocol,21600);
    } catch (error) {
      console.error("LP Bolsas doGet: " + error);
    }
  }
  const payload = JSON.stringify({
    success:!!protocol,
    requestId:requestId,
    protocol:protocol || ""
  });
  return ContentService.createTextOutput("__gebBolsasStatus(" + payload + ");")
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function bolsasSheet_() {
  if (!BOLSAS_CFG.spreadsheetId) throw new Error("Configure a propriedade BOLSAS_SHEET_ID antes de executar.");
  const book = SpreadsheetApp.openById(BOLSAS_CFG.spreadsheetId);
  let sheet = book.getSheetByName(BOLSAS_CFG.tab);
  if (!sheet) sheet = book.insertSheet(BOLSAS_CFG.tab);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1,1,1,BOLSAS_HEADERS.length).setValues([BOLSAS_HEADERS]);
    sheet.setFrozenRows(1);
    sheet.getRange(1,1,1,BOLSAS_HEADERS.length).setFontWeight("bold").setBackground("#171717").setFontColor("#FFFFFF");
    sheet.getRange("A:A").setNumberFormat("dd/MM/yyyy HH:mm:ss");
    sheet.getRange("F:F").setNumberFormat("@");
  }
  return sheet;
}

function buscarRegistro_(sheet,requestId) {
  if (sheet.getLastRow() < 2) return "";
  const cell = sheet.getRange(2,3,sheet.getLastRow()-1,1)
    .createTextFinder(requestId).matchEntireCell(true).findNext();
  return cell ? String(sheet.getRange(cell.getRow(),2).getValue()) : "";
}

function limpar_(value,max) {
  return String(value == null ? "" : value).replace(/[\x00-\x1F\x7F]/g," ").trim().slice(0,max);
}

function seguroPlanilha_(value) {
  const s = String(value == null ? "" : value);
  // Evita fórmulas inseridas por visitantes em células de texto.
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function respostaPost_(message) {
  // O retorno do POST vai para iframe oculto; a confirmação é feita por doGet(status).
  return HtmlService.createHtmlOutput("<!doctype html><html lang='pt-BR'><meta charset='utf-8'><body>" +
    message.replace(/[&<>]/g,"") + "</body></html>")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}