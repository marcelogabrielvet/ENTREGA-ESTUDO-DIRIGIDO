/**
 * Recebe as entregas dos Estudos Dirigidos.
 * - Salva as fotos numa pasta do seu Google Drive (uma subpasta por entrega).
 * - Registra cada entrega numa Planilha Google, com a nota calculada automaticamente.
 *
 * Como instalar: veja o LEIA-ME.md do repositório.
 */

const NOME_PLANILHA = 'Entregas - Estudos Dirigidos';
const NOME_PASTA = 'Entregas - Estudos Dirigidos (fotos)';
const ESTUDOS = { semio: 'Semiologia Veterinária', imagem: 'Diagnóstico por Imagem' };
const TURMAS = ['Matutino', 'Noturno'];
const MAX_FOTOS = 12;
const CABECALHO = ['Data/hora', 'Estudo dirigido', 'Nome', 'Matrícula', 'Turma', 'Nº de fotos', 'Pasta das fotos',
  'Categoria (A/B/C)', 'Uso de IA (S/N)', 'Nota', 'Observação da correção'];

/** Rode esta função uma vez (botão "Executar") para criar a planilha e a pasta e autorizar o script. */
function configurar() {
  const ss = planilha_();
  pasta_();
  Logger.log('Planilha: ' + ss.getUrl());
  Logger.log('Pasta das fotos: ' + pasta_().getUrl());
}

function planilha_() {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty('PLANILHA_ID');
  if (id) { try { return SpreadsheetApp.openById(id); } catch (e) {} }
  const ss = SpreadsheetApp.create(NOME_PLANILHA);
  ss.setSpreadsheetLocale('en_US');
  const ent = ss.getSheets()[0].setName('Entregas');
  ent.getRange('D:D').setNumberFormat('@');
  ent.getRange(1, 1, 1, CABECALHO.length).setValues([CABECALHO]).setFontWeight('bold').setBackground('#e7ecff');
  ent.setFrozenRows(1);
  ent.setColumnWidths(1, CABECALHO.length, 150);
  const cfg = ss.insertSheet('Configuração');
  cfg.getRange('A1:B1').setValues([['Nota máxima', 10]]).setFontWeight('bold');
  cfg.getRange('A3:A7').setValues([
    ['Categoria A = manuscrito e coerente → nota máxima'],
    ['Categoria B = manuscrito, mas aleatório → metade da nota'],
    ['Categoria C = não manuscrito / sem relação → zero'],
    ['Uso de IA = S → desconto de 30% na nota'],
    ['Preencha as colunas H e I da aba Entregas (ou peça ao Claude); a nota (coluna J) é calculada sozinha.'],
  ]);
  props.setProperty('PLANILHA_ID', ss.getId());
  return ss;
}

/** Ajuste único: idioma das fórmulas, matrícula como texto e fórmulas de nota em todas as linhas. */
function ajustar() {
  const ss = planilha_();
  ss.setSpreadsheetLocale('en_US');
  const sh = ss.getSheetByName('Entregas');
  sh.getRange('D:D').setNumberFormat('@');
  for (let r = 2; r <= sh.getLastRow(); r++) formulaNota_(sh, r);
}

function formulaNota_(sh, r) {
  sh.getRange(r, 10).setFormula(
    '=IF(H' + r + '="","",IF(H' + r + '="A",\'Configuração\'!$B$1,IF(H' + r + '="B",\'Configuração\'!$B$1/2,0))*IF(I' + r + '="S",0.7,1))');
}

function pasta_() {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty('PASTA_ID');
  if (id) { try { return DriveApp.getFolderById(id); } catch (e) {} }
  const p = DriveApp.createFolder(NOME_PASTA);
  props.setProperty('PASTA_ID', p.getId());
  return p;
}

function resposta_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Teste rápido: abrir a URL do app da web no navegador deve mostrar {"ok":true,...}. */
function doGet() {
  return resposta_({ ok: true, status: 'Recebimento de estudos dirigidos ativo' });
}

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    const ed = String(d.ed || '');
    const nome = String(d.nome || '').trim().slice(0, 120);
    const matricula = String(d.matricula || '').trim().slice(0, 40);
    const turma = String(d.turma || '');
    const fotos = Array.isArray(d.fotos) ? d.fotos : [];
    if (!ESTUDOS[ed]) return resposta_({ ok: false, erro: 'Estudo dirigido inválido.' });
    if (!nome || !matricula) return resposta_({ ok: false, erro: 'Preencha nome e matrícula.' });
    if (TURMAS.indexOf(turma) < 0) return resposta_({ ok: false, erro: 'Selecione a turma.' });
    if (!fotos.length || fotos.length > MAX_FOTOS) return resposta_({ ok: false, erro: 'Envie de 1 a ' + MAX_FOTOS + ' fotos.' });

    const agora = new Date();
    const carimbo = Utilities.formatDate(agora, 'America/Sao_Paulo', 'yyyy-MM-dd HH:mm');
    const sub = pasta_().createFolder([ESTUDOS[ed], turma, nome, matricula, carimbo].join(' - '));
    fotos.forEach(function (b64, i) {
      const bytes = Utilities.base64Decode(String(b64));
      if (bytes.length > 5 * 1024 * 1024) throw new Error('Foto muito grande.');
      sub.createFile(Utilities.newBlob(bytes, 'image/jpeg', 'folha-' + ('0' + (i + 1)).slice(-2) + '.jpg'));
    });

    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      const sh = planilha_().getSheetByName('Entregas');
      sh.appendRow([carimbo, ESTUDOS[ed], nome, matricula, turma, fotos.length, sub.getUrl(), '', '', '', '']);
      const r = sh.getLastRow();
      formulaNota_(sh, r);
    } finally { lock.releaseLock(); }

    return resposta_({ ok: true, protocolo: carimbo, fotos: fotos.length });
  } catch (err) {
    return resposta_({ ok: false, erro: 'Falha ao salvar: ' + err.message });
  }
}
