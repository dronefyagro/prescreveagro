/**
 * PRESCREVE AGRO — API segura para Google Apps Script
 *
 * Depois de atualizar este arquivo, publique uma NOVA versão do App da Web.
 * Executar como: proprietário da planilha.
 * Acesso: qualquer pessoa (a API aplica autenticação própria).
 */

const ALLOWED_KEYS = Object.freeze([
  "clientes", "fazendas", "talhoes", "produtos",
  "responsaveis", "receituarios", "diretrizes", "usuarios"
]);
const ADMIN_ONLY_WRITE_KEYS = Object.freeze(["usuarios"]);
const SESSION_SECONDS = 21600;
const MAX_VALUE_BYTES = 900000;
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW_SECONDS = 600;

function doGet() {
  return jsonResponse_({ok:false, error:"method_not_allowed"});
}

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    const action = String(body.action || "");

    if (action === "login") return login_(body);
    if (action === "logout") return logout_(body);

    const session = requireSession_(body.token);
    if (action === "get") return getValue_(body, session);
    if (action === "set") return setValue_(body, session);

    return jsonResponse_({ok:false, error:"unknown_action"});
  } catch (err) {
    console.error(err && err.stack ? err.stack : err);
    return jsonResponse_({ok:false, error:"server_error"});
  }
}

function login_(body) {
  const username = String(body.username || "").trim().toLowerCase();
  const password = String(body.password || "");
  if (!username || !password) return jsonResponse_({ok:false, error:"invalid_credentials"});

  const cache = CacheService.getScriptCache();
  const attemptsKey = "login_attempts_" + safeKey_(username);
  const attempts = Number(cache.get(attemptsKey) || 0);
  if (attempts >= MAX_LOGIN_ATTEMPTS) {
    return jsonResponse_({ok:false, error:"too_many_attempts"});
  }

  const users = readJsonArray_("usuarios");
  const user = users.find(function(item) {
    return String(item.usuario || "").trim().toLowerCase() === username &&
      String(item.ativo || "Ativo") !== "Inativo";
  });

  let valid = false;
  if (user) {
    if (user.senhaHash) valid = timingSafeEqual_(String(user.senhaHash), sha256Hex_(password));
    else if (user.senha !== undefined) valid = timingSafeEqual_(String(user.senha), password);
  }

  if (!valid) {
    cache.put(attemptsKey, String(attempts + 1), LOGIN_WINDOW_SECONDS);
    return jsonResponse_({ok:false, error:"invalid_credentials"});
  }

  cache.remove(attemptsKey);
  const token = Utilities.getUuid() + Utilities.getUuid();
  const session = {
    id:String(user.id || ""),
    nome:String(user.nome || user.usuario || ""),
    usuario:String(user.usuario || ""),
    papel:String(user.papel || "Técnico")
  };
  cache.put("session_" + token, JSON.stringify(session), SESSION_SECONDS);
  return jsonResponse_({ok:true, token:token, user:session, expiresIn:SESSION_SECONDS});
}

function logout_(body) {
  const token = String(body.token || "");
  if (token) CacheService.getScriptCache().remove("session_" + token);
  return jsonResponse_({ok:true});
}

function getValue_(body) {
  const key = validateKey_(body.key);
  const value = readRaw_(key);
  return jsonResponse_({ok:true, key:key, value:value || null, version:version_(value)});
}

function setValue_(body, session) {
  const key = validateKey_(body.key);
  if (ADMIN_ONLY_WRITE_KEYS.indexOf(key) >= 0 && session.papel !== "Administrador") {
    return jsonResponse_({ok:false, error:"forbidden"});
  }

  const value = typeof body.value === "string" ? body.value : "";
  if (Utilities.newBlob(value).getBytes().length > MAX_VALUE_BYTES) {
    return jsonResponse_({ok:false, error:"payload_too_large"});
  }
  try { JSON.parse(value); }
  catch (_) { return jsonResponse_({ok:false, error:"invalid_json"}); }

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return jsonResponse_({ok:false, error:"busy"});

  try {
    const current = readRaw_(key);
    const currentVersion = version_(current);
    const expected = body.expectedVersion === undefined || body.expectedVersion === null
      ? null : String(body.expectedVersion);

    if (expected !== null && expected !== currentVersion) {
      return jsonResponse_({ok:false, error:"conflict", currentVersion:currentVersion});
    }

    const sheet = getSheet_(key, true);
    sheet.getRange(1, 1).setValue(value);
    SpreadsheetApp.flush();
    return jsonResponse_({ok:true, key:key, version:version_(value)});
  } finally {
    lock.releaseLock();
  }
}

function requireSession_(token) {
  const raw = CacheService.getScriptCache().get("session_" + String(token || ""));
  if (!raw) throw new AuthError_();
  return JSON.parse(raw);
}

function AuthError_() {}
AuthError_.prototype = Object.create(Error.prototype);

function validateKey_(key) {
  key = String(key || "");
  if (ALLOWED_KEYS.indexOf(key) < 0) throw new Error("invalid_key");
  return key;
}

function readRaw_(key) {
  const sheet = getSheet_(key, false);
  if (!sheet) return "";
  const value = sheet.getRange(1, 1).getValue();
  return value ? String(value) : "";
}

function readJsonArray_(key) {
  const raw = readRaw_(key);
  if (!raw) return [];
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
}

function getSheet_(key, createIfMissing) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(key);
  if (!sheet && createIfMissing) sheet = ss.insertSheet(key);
  return sheet;
}

function version_(value) {
  return sha256Hex_(String(value || ""));
}

function sha256Hex_(value) {
  return Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    value,
    Utilities.Charset.UTF_8
  ).map(function(byte) {
    const normalized = byte < 0 ? byte + 256 : byte;
    return ("0" + normalized.toString(16)).slice(-2);
  }).join("");
}

function timingSafeEqual_(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function safeKey_(value) {
  return sha256Hex_(value).slice(0, 32);
}

function jsonResponse_(obj) {
  if (obj && obj.error === "server_error" && arguments.callee.caller &&
      arguments.callee.caller.name === "doPost") {
    // Mantém detalhes internos fora da resposta pública.
  }
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Recuperação inicial, para ser executada manualmente pelo proprietário
 * SOMENTE quando a aba usuarios estiver vazia.
 */
function configurarAdministradorInicial() {
  const existing = readJsonArray_("usuarios");
  if (existing.length) throw new Error("A aba usuarios já possui contas.");

  const ui = SpreadsheetApp.getUi();
  const userPrompt = ui.prompt("Prescreve Agro", "Nome de usuário administrador:", ui.ButtonSet.OK_CANCEL);
  if (userPrompt.getSelectedButton() !== ui.Button.OK) return;
  const passPrompt = ui.prompt("Prescreve Agro", "Senha temporária forte:", ui.ButtonSet.OK_CANCEL);
  if (passPrompt.getSelectedButton() !== ui.Button.OK) return;

  const username = userPrompt.getResponseText().trim();
  const password = passPrompt.getResponseText();
  if (username.length < 3 || password.length < 12) {
    throw new Error("Use usuário com 3+ caracteres e senha com 12+ caracteres.");
  }

  const users = [{
    id:Utilities.getUuid(),
    nome:"Administrador",
    usuario:username,
    papel:"Administrador",
    ativo:"Ativo",
    senhaHash:sha256Hex_(password)
  }];
  getSheet_("usuarios", true).getRange(1, 1).setValue(JSON.stringify(users));
  SpreadsheetApp.flush();
}
