/**
 * PRESCREVE AGRO — API de dados (Google Apps Script)
 *
 * Como publicar:
 * 1. Crie uma Planilha Google nova (vazia, pode deixar sem nome de abas).
 * 2. Nela, vá em Extensões > Apps Script.
 * 3. Apague o conteúdo padrão do Code.gs e cole todo este arquivo.
 * 4. Clique em "Implantar" > "Nova implantação" > tipo "App da Web".
 *    - Executar como: Eu (sua conta)
 *    - Quem pode acessar: Qualquer pessoa
 * 5. Autorize as permissões pedidas (é a sua própria planilha).
 * 6. Copie a URL do App da Web gerada — é ela que entra em API_BASE_URL no index.html.
 *
 * Cada "key" (clientes, fazendas, talhoes, produtos, responsaveis,
 * receituarios, diretrizes, usuarios) vira uma aba na planilha, e o
 * conteúdo inteiro daquela lista fica salvo como um único JSON na célula A1.
 * Simples e suficiente para o volume de dados desta plataforma.
 */

function doGet(e) {
  const key = e.parameter.key;
  if (!key) return jsonResponse_({ error: "missing key" });
  const sheet = getSheet_(key);
  const value = sheet.getRange(1, 1).getValue();
  return jsonResponse_({ key: key, value: value ? String(value) : null });
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  const key = body.key;
  const value = body.value;
  if (!key) return jsonResponse_({ error: "missing key" });
  const sheet = getSheet_(key);
  sheet.getRange(1, 1).setValue(value);
  return jsonResponse_({ key: key, value: value });
}

function getSheet_(key) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(key);
  if (!sheet) {
    sheet = ss.insertSheet(key);
    sheet.getRange(1, 1).setValue("");
  }
  return sheet;
}

function jsonResponse_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
