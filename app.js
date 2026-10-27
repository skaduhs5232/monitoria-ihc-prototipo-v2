/* MonitorIA v2 — telas reais em HTML (sem imagens de tela). */
const $ = (s, el = document) => el.querySelector(s);
const main = $('#conteudo');
const fmtData = d => d.toLocaleDateString('pt-BR');
const fmtHora = d => d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const aluno = id => ALUNOS.find(a => a.id === id);

/* Estado da sessão: decisões da monitoria e histórico (corrige E1-03). */
const state = {
  view: 'dashboard', selecionado: 'maria-oliveira', perfil: null, iaAluno: 'joao-pereira',
  decisoes: {},            // id -> {acao, detalhe, quando}
  historico: [],           // {quando, aluno, acao}
  feedback: {},            // chave -> 'util' | 'melhorar'
  filtro: { busca: '', prioridade: '', status: '' },
  logado: true
};
const PRIO = { 'ALTA': 'alta', 'MÉDIA': 'media', 'BAIXA': 'baixa' };

/* ---------- utilitários de interface ---------- */
let toastTimer, undoFn = null;
function toast(msg, undo) {
  const t = $('#toast');
  undoFn = undo || null;
  t.innerHTML = `<span>${esc(msg)}</span>` + (undo ? ' <button class="link light" id="btnUndo">Desfazer</button>' : '');
  t.classList.add('show');
  if (undo) $('#btnUndo').onclick = () => { const f = undoFn; undoFn = null; t.classList.remove('show'); f(); };
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), undo ? 8000 : 3500);
}
function dialog(title, bodyHtml, actions) {
  const d = $('#dialog');
  $('#dlgTitle').textContent = title;
  $('#dlgBody').innerHTML = bodyHtml;
  const box = $('#dlgActions'); box.innerHTML = '';
  actions.forEach(a => {
    const b = document.createElement('button');
    b.className = a.primary ? 'btn primary' : 'btn';
    b.textContent = a.label; b.value = a.value || '';
    b.onclick = ev => { if (a.onClick) { const keep = a.onClick(ev) === false; if (keep) { ev.preventDefault(); return; } } };
    box.appendChild(b);
  });
  d.showModal();
}
function tip(texto) { return `<button class="info" aria-label="O que significa?" data-tip="${esc(texto)}">ⓘ</button>`; }
function badge(p) { return `<span class="prio ${PRIO[p]}">${p}</span>`; }
function estadoDecisao(id) {
  const d = state.decisoes[id];
  if (!d) return `<p class="estado pendente" role="status">Aguardando decisão da monitoria</p>`;
  return `<p class="estado feito" role="status">✔ ${esc(d.acao)}${d.detalhe ? ' – ' + esc(d.detalhe) : ''}<br><small>Decidido por Maria Monitor (monitoria), hoje às ${fmtHora(d.quando)}. A IA apenas recomendou.</small></p>`;
}
function registrar(id, acao, detalhe, aoDesfazer) {
  const anterior = state.decisoes[id];
  const reg = { acao, detalhe, quando: new Date() };
  state.decisoes[id] = reg;
  state.historico.unshift({ quando: reg.quando, aluno: id, acao: acao + (detalhe ? ' – ' + detalhe : '') });
  render();
  toast(`${acao}: ${aluno(id).nome}.`, () => {
    if (anterior) state.decisoes[id] = anterior; else delete state.decisoes[id];
    state.historico.shift(); if (aoDesfazer) aoDesfazer(); render(); toast('Decisão desfeita.');
  });
}
function explicacao(id) {
  const a = aluno(id);
  const barras = a.fatores.map(([f, p]) => `<li><span>${esc(f)}</span><span class="bar"><i style="width:${p * 2}%"></i></span><b>${p}%</b></li>`).join('');
  dialog(`Explicação completa da IA – ${a.nome}`, `
    <p><b>Recomendação:</b> ${esc(a.recomendacao.texto)}</p>
    <p><b>Confiança da IA para este aluno:</b> ${a.confianca}% ${a.confianca < 50 ? '<span class="tag warn">baixa – valide os dados antes de agir</span>' : ''}</p>
    <p><b>Peso de cada fator na recomendação:</b></p><ul class="fatores">${barras}</ul>
    ${a.inconsistencias.length ? `<p><b>Dados com problema:</b></p><ul>${a.inconsistencias.map(i => `<li>⚠ ${esc(i)}</li>`).join('')}</ul>` : ''}
    <p><b>O que a IA não sabe:</b> situações pessoais não registradas; a recomendação depende da qualidade dos dados cadastrais.</p>
    <p class="nota">Fontes: dados do AVA e do cadastro (sistema) · decisão: sempre da monitoria.</p>`,
    [{ label: 'Fechar', primary: true }]);
}

/* ---------- telas ---------- */
const views = {
  dashboard() {
    const lista = ALUNOS.filter(a => a.prioridade !== 'BAIXA' || true).slice().sort((x, y) => ['ALTA', 'MÉDIA', 'BAIXA'].indexOf(x.prioridade) - ['ALTA', 'MÉDIA', 'BAIXA'].indexOf(y.prioridade));
    const sel = aluno(state.selecionado);
    const m = METRICAS;
    return `
    <div class="page-head"><div><h1>Olá, Maria Monitor!</h1><p>A IA encontrou situações que precisam da sua atenção hoje, ${fmtData(HOJE)}.</p></div><span class="pill on">Monitoramento inteligente ativo</span></div>
    <section class="cards" aria-label="Indicadores">
      ${['total', 'primeiro', 'aguardando', 'ativacao', 'prioridades'].map(k => `<div class="card kpi"><span>${m[k].l} ${tip(m[k].def)}</span><strong>${m[k].v}</strong></div>`).join('')}
    </section>
    <section class="panel">
      <h2>Painel Inteligente de Apoio à Decisão</h2>
      <div class="grid3">
        <div class="box">
          <h3>Estudantes priorizados pela IA <span class="tag">Análise gerada por IA</span></h3>
          <ul class="lista" role="listbox" aria-label="Estudantes priorizados">
            ${lista.map(a => `<li><button class="row ${a.id === sel.id ? 'sel' : ''}" data-sel="${a.id}" role="option" aria-selected="${a.id === sel.id}">
              <span class="av" aria-hidden="true">👤</span><span class="who"><b>${esc(a.nome)}</b><small>Curso: ${esc(a.curso)}</small></span>
              <span class="st ${a.statusTipo}">${esc(a.status)}</span>${badge(a.prioridade)}</button></li>`).join('')}
          </ul>
          <p class="conf">Confiança da IA para <b>${esc(sel.nome)}</b> ${tip('Probabilidade estimada pela IA de que a recomendação para o aluno selecionado está correta, com base nos dados disponíveis. Abaixo de 50%: valide os dados antes de agir.')}
            <span class="bar"><i style="width:${sel.confianca}%"></i></span><b>${sel.confianca}%</b></p>
        </div>
        <div class="box">
          <h3>Por que a IA priorizou ${esc(sel.nome)}?</h3>
          <ul class="checks">${sel.fatores.map(([f]) => `<li>✔ ${esc(f)}</li>`).join('')}</ul>
          <p class="hint">🧠 ${esc(sel.recomendacao.texto)}</p>
          <button class="link" data-perfil="${sel.id}">Abrir perfil completo de ${esc(sel.nome)} →</button>
        </div>
        <div class="box">
          <h3>Decisão da Monitoria</h3>
          ${estadoDecisao(sel.id)}
          <div class="acoes">
            <button class="btn primary" data-dec="aceitar">Aceitar recomendação</button>
            <button class="btn" data-dec="ajustar">Ajustar estratégia</button>
            <button class="btn" data-dec="rejeitar">Rejeitar recomendação</button>
            <button class="btn" data-dec="reanalise">Solicitar nova análise</button>
            <button class="btn" data-dec="explicar">Ver explicação completa</button>
          </div>
          <p class="nota">A decisão final pertence à monitoria. A IA apenas recomenda ações de apoio.</p>
        </div>
      </div>
      ${feedbackBar('dash-' + sel.id, 'Essa recomendação foi útil?')}
    </section>`;
  },

  alunos() {
    if (state.perfil) return perfil(aluno(state.perfil));
    const f = state.filtro;
    const lista = ALUNOS.filter(a => (!f.busca || (a.nome + a.curso).toLowerCase().includes(f.busca.toLowerCase()))
      && (!f.prioridade || a.prioridade === f.prioridade) && (!f.status || a.statusTipo === f.status));
    return `
    <div class="page-head"><div><h1>Alunos</h1><p>Lista de alunos acompanhados (amostra de ${ALUNOS.length} de 1.030, dados fictícios). Selecione um aluno para ver o perfil.</p></div></div>
    <section class="panel">
      <form class="filtros" id="formFiltro" role="search" onsubmit="return false">
        <label>Buscar <input type="search" id="fBusca" value="${esc(f.busca)}" placeholder="Nome ou curso" /></label>
        <label>Prioridade <select id="fPrio"><option value="">Todas</option>${['ALTA', 'MÉDIA', 'BAIXA'].map(p => `<option ${f.prioridade === p ? 'selected' : ''}>${p}</option>`).join('')}</select></label>
        <label>Situação <select id="fStatus"><option value="">Todas</option><option value="critico" ${f.status === 'critico' ? 'selected' : ''}>Aguardando primeiro acesso</option><option value="alerta" ${f.status === 'alerta' ? 'selected' : ''}>Sem acesso / irregular</option></select></label>
      </form>
      <table class="tabela"><thead><tr><th>Aluno</th><th>Curso</th><th>Situação no AVA</th><th>Prioridade</th><th>Decisão</th><th></th></tr></thead>
      <tbody>${lista.map(a => `<tr><td><b>${esc(a.nome)}</b></td><td>${esc(a.curso)}</td><td class="st ${a.statusTipo}">${esc(a.status)}</td><td>${badge(a.prioridade)}</td>
        <td>${state.decisoes[a.id] ? '✔ ' + esc(state.decisoes[a.id].acao) : 'Pendente'}</td><td><button class="btn small" data-perfil="${a.id}">Abrir perfil</button></td></tr>`).join('') || '<tr><td colspan="6">Nenhum aluno encontrado com esses filtros.</td></tr>'}</tbody></table>
    </section>`;
  },

  comunicacao() {
    const sel = aluno(state.selecionado);
    const bloqueado = sel.inconsistencias.length > 0;
    const m = METRICAS;
    return `
    <div class="page-head"><div><h1>Comunicação Inteligente</h1><p>Envie mensagens mais assertivas com apoio da Inteligência Artificial.</p></div><span class="pill on">IA auxiliando comunicação</span></div>
    <section class="cards four">${['enviadas', 'resposta', 'reativados'].map(k => `<div class="card kpi"><span>${m[k].l} ${tip(m[k].def)}</span><strong>${m[k].v}</strong></div>`).join('')}
      <div class="card kpi"><span>Canal mais efetivo ${tip('Canal com maior taxa de resposta nos ' + PERIODO + '.')}</span><strong>WhatsApp</strong></div></section>
    <section class="panel"><div class="grid2">
      <div class="box"><h3>Central de Comunicação Assistida por IA</h3>
        <ul class="lista">${ALUNOS.filter(a => a.prioridade !== 'BAIXA').map(a => `<li><button class="row ${a.id === sel.id ? 'sel' : ''}" data-sel="${a.id}"><span class="who"><b>${esc(a.nome)}</b><small>${esc(a.curso)}</small></span><span class="st ${a.statusTipo}">${esc(a.status)}</span>${badge(a.prioridade)}</button></li>`).join('')}</ul>
        <button class="link" data-view="alunos">Ver todos os alunos →</button></div>
      <div class="box"><h3>Assistente de Mensagem IA – ${esc(sel.nome)}</h3>
        ${bloqueado ? `<div class="alert">⚠ A IA não recomenda envio automático para ${esc(sel.nome)}: ${sel.inconsistencias.map(esc).join('; ')}. Atualize os dados no perfil antes de enviar.</div>` : ''}
        <label class="msg">Mensagem sugerida pela IA (editável)<textarea id="txtMsg" rows="4">${esc(sel.mensagem)}</textarea></label>
        <p><b>Canal recomendado:</b> ${esc(sel.recomendacao.canal)} · <b>Confiança da IA:</b> ${sel.confianca}%</p>
        ${estadoDecisao(sel.id)}
        <div class="acoes row-acoes">
          <button class="btn primary" data-msg="enviar">Aprovar e enviar mensagem</button>
          <button class="btn" data-msg="nova">Gerar nova sugestão</button>
          <button class="btn" data-msg="cancelar">Cancelar recomendação</button>
        </div>
        <p class="nota">A IA cria sugestões, mas Maria Monitor decide o que será enviado. Nada é enviado sem confirmação.</p></div>
    </div>${feedbackBar('com-' + sel.id, 'Essa abordagem funcionou?')}</section>`;
  },

  ia() {
    const a = aluno(state.iaAluno);
    return `
    <div class="page-head"><div><h1>Central de Inteligência Artificial</h1><p>Entenda como a IA apoia suas decisões no acompanhamento dos estudantes.</p></div><span class="pill on">IA explicável · Monitor no controle</span></div>
    <section class="cards four"><div class="card kpi"><span>${METRICAS.precisao.l} ${tip(METRICAS.precisao.def)}</span><strong>${METRICAS.precisao.v}</strong></div>
      <div class="card kpi"><span>Decisões da monitoria nesta sessão</span><strong>${state.historico.length}</strong></div></section>
    <section class="panel"><div class="grid3">
      <div class="box"><h3>Como a IA chegou nesta recomendação?</h3>
        <label>Aluno analisado <select id="iaSel">${ALUNOS.map(x => `<option value="${x.id}" ${x.id === a.id ? 'selected' : ''}>${esc(x.nome)}</option>`).join('')}</select></label>
        <p>Classificação: ${badge(a.prioridade)} · Confiança da IA: <b>${a.confianca}%</b></p>
        <ul class="fatores">${a.fatores.map(([f, p]) => `<li><span>${esc(f)}</span><span class="bar"><i style="width:${p * 2}%"></i></span><b>${p}%</b></li>`).join('')}</ul>
        <p class="nota">A IA analisa múltiplos fatores, mas o julgamento final sempre pertence à monitoria.</p></div>
      <div class="box"><h3>O que a IA ainda não sabe</h3><ul class="checks warn"><li>⚠ Não interpreta situações pessoais não registradas</li><li>⚠ Pode precisar de atualização dos dados</li><li>⚠ Depende da qualidade das informações disponíveis</li></ul>
        <p class="nota">Quando houver dúvida (confiança abaixo de 50%), a IA pede validação da monitoria.</p></div>
      <div class="box"><h3>Controle da Monitoria</h3>
        ${['Revisar recomendações antes das ações', 'Solicitar explicação detalhada', 'Validar novos aprendizados'].map((t, i) => `<label class="chk"><input type="checkbox" checked data-ctrl="${i}" /> ${t}</label>`).join('')}
        <p class="nota">Você mantém o controle sobre as decisões e ações realizadas com apoio da IA.</p></div>
    </div></section>`;
  },

  relatorios() {
    const hist = state.historico.map(h => `<tr><td>${fmtData(h.quando)} ${fmtHora(h.quando)}</td><td>${esc(aluno(h.aluno).nome)}</td><td>${esc(h.acao)}</td><td>Maria Monitor</td></tr>`).join('');
    return `
    <div class="page-head"><div><h1>Relatórios Inteligentes</h1><p>Período: ${PERIODO} (até ${fmtData(HOJE)}). Dados fictícios.</p></div></div>
    <section class="cards">${['total', 'primeiro', 'ativacao', 'reativados', 'precisao'].map(k => `<div class="card kpi"><span>${METRICAS[k].l} ${tip(METRICAS[k].def)}</span><strong>${METRICAS[k].v}</strong></div>`).join('')}</section>
    <section class="panel"><div class="grid2">
      <div class="box"><h3>Efetividade dos canais ${tip('Taxa de resposta por canal nos ' + PERIODO + '.')}</h3>
        <ul class="fatores"><li><span>WhatsApp</span><span class="bar"><i style="width:78%"></i></span><b>78%</b></li><li><span>E-mail</span><span class="bar"><i style="width:42%"></i></span><b>42%</b></li><li><span>Contato manual</span><span class="bar"><i style="width:28%"></i></span><b>28%</b></li></ul></div>
      <div class="box"><h3>Aprendizado da IA</h3><ul class="checks"><li>✔ WhatsApp apresentou maior taxa de resposta nesta turma</li><li>✔ Contatos nos primeiros dias aumentaram a ativação</li></ul>
        <p class="nota">As recomendações são atualizadas com base nos resultados, mas continuam sendo validadas pela monitoria.</p></div>
    </div>
    <div class="box"><h3>Histórico de decisões da monitoria (esta sessão)</h3>
      <table class="tabela"><thead><tr><th>Data/hora</th><th>Aluno</th><th>Decisão</th><th>Quem decidiu</th></tr></thead><tbody>${hist || '<tr><td colspan="4">Nenhuma decisão registrada ainda. As decisões tomadas no Dashboard, em Alunos e em Comunicação aparecem aqui.</td></tr>'}</tbody></table></div></section>`;
  },

  ajuda() {
    return `
    <div class="page-head"><div><h1>Central de Ajuda</h1><p>Encontre orientações para utilizar melhor o MonitorIA.</p></div></div>
    <section class="panel"><label class="busca">Como podemos ajudar? <input type="search" id="ajudaBusca" placeholder="Ex.: privacidade, confiança, decisão" /></label>
    <div id="faq">${AJUDA.map((x, i) => `<details class="faq" data-txt="${esc((x.t + ' ' + x.c).toLowerCase())}" ${x.id ? `id="${x.id}"` : ''}><summary>${esc(x.t)}</summary><p>${x.c}</p></details>`).join('')}</div>
    <p id="semResultado" class="nota" hidden>Nenhum tópico encontrado.</p></section>`;
  }
};

const AJUDA = [
  { t: 'Primeiros passos', c: 'No Dashboard, veja os alunos priorizados pela IA, entenda o motivo e registre sua decisão. Em Alunos, busque e filtre qualquer aluno e abra o perfil.' },
  { id: 'privacidade', t: 'Privacidade e Dados (LGPD)', c: 'Texto de exemplo do protótipo: o MonitorIA usa apenas dados de acesso ao AVA, dados cadastrais e histórico de contatos, para apoiar o acompanhamento do primeiro acesso. Os dados são tratados conforme a LGPD (Lei nº 13.709/2018). Nenhuma mensagem é enviada ao aluno sem aprovação da monitoria.' },
  { t: 'O que significa a confiança da IA?', c: 'É a estimativa da IA de que a recomendação para aquele aluno está correta, com base nos dados disponíveis. Abaixo de 50%, valide os dados antes de agir.' },
  { t: 'Quem decide: eu ou a IA?', c: 'A monitoria decide. A IA recomenda; toda decisão fica registrada com seu nome, data e hora, e pode ser desfeita logo após ser tomada.' },
  { t: 'Como desfazer uma decisão?', c: 'Logo após decidir, use "Desfazer" na mensagem de confirmação. Você também pode registrar outra decisão no perfil do aluno.' }
];

function perfil(a) {
  const hist = (a.historico || []).map(h => `<li><b>${fmtData(h.d)} ${fmtHora(h.d)}</b> – ${esc(h.t)}</li>`).join('');
  const meus = state.historico.filter(h => h.aluno === a.id).map(h => `<li><b>${fmtData(h.quando)} ${fmtHora(h.quando)}</b> – ${esc(h.acao)} (Maria Monitor)</li>`).join('');
  return `
  <div class="page-head"><div><button class="link" id="voltarLista">← Voltar à lista de alunos</button><h1>Perfil do Aluno – ${esc(a.nome)}</h1><p>Análise inteligente e acompanhamento do primeiro acesso.</p></div><span class="pill on">IA analisando dados do estudante</span></div>
  <section class="panel"><div class="grid3">
    <div class="box"><h3>${esc(a.nome)}</h3><p>Curso: ${esc(a.curso)}</p>
      <p>Status AVA: <b class="st ${a.statusTipo}">${esc(a.status)}</b> ${badge(a.prioridade)}</p>
      <dl class="dados"><dt>Data de matrícula</dt><dd>${fmtData(a.matricula)}</dd><dt>Canal utilizado</dt><dd>${esc(a.canal)}</dd>
      <dt>Situação do e-mail</dt><dd class="${a.emailStatus === 'Não ativado' ? 'ruim' : ''}">${esc(a.emailStatus)}</dd><dt>Telefone</dt><dd class="${a.telefone !== 'Confirmado' ? 'ruim' : ''}">${esc(a.telefone)}</dd></dl></div>
    <div class="box ${a.inconsistencias.length ? 'atencao' : ''}">
      ${a.inconsistencias.length ? `<h3>⚠ A IA encontrou uma inconsistência</h3><p>Não foi possível confirmar com segurança o melhor canal de comunicação.</p><ul>${a.inconsistencias.map(i => `<li>⚠ ${esc(i)}</li>`).join('')}</ul>` : `<h3>Recomendação da IA</h3><p>${esc(a.recomendacao.texto)}</p>`}
      <p>Nível de confiança da IA: <span class="bar"><i style="width:${a.confianca}%"></i></span> <b>${a.confianca}%</b></p>
      ${a.confianca < 50 ? '<p class="nota">Confiança reduzida devido à ausência de dados suficientes. A IA está aguardando validação humana.</p>' : ''}
      <h4>Histórico da análise</h4><ol class="timeline">${hist}${meus}${!hist && !meus ? '<li>Sem eventos registrados.</li>' : ''}</ol></div>
    <div class="box"><h3>Decisão da Monitoria</h3>${estadoDecisao(a.id)}
      <div class="acoes">
        <button class="btn primary" data-pdec="atualizar">Atualizar dados cadastrais</button>
        <button class="btn" data-pdec="canal">Alterar canal de comunicação</button>
        <button class="btn" data-pdec="reanalise">Solicitar nova análise da IA</button>
        <button class="btn" data-pdec="rejeitar">Rejeitar recomendação</button>
        <button class="btn" data-pdec="manual">Registrar intervenção manual</button>
        <button class="btn" data-pdec="explicar">Ver explicação completa</button>
      </div>
      <p class="nota">A monitoria mantém o controle da decisão. Nenhuma ação será executada automaticamente.</p></div>
  </div></section>`;
}

function feedbackBar(chave, pergunta) {
  const f = state.feedback[chave];
  return `<div class="feedback"><span>${pergunta}</span>
    <button class="btn small ${f === 'util' ? 'on' : ''}" data-fb="${chave}|util" aria-pressed="${f === 'util'}">👍 Sim</button>
    <button class="btn small ${f === 'melhorar' ? 'on' : ''}" data-fb="${chave}|melhorar" aria-pressed="${f === 'melhorar'}">👎 Precisa melhorar</button>
    ${f ? '<span class="nota">Obrigado! Seu feedback foi registrado.</span>' : ''}</div>`;
}

/* ---------- ações ---------- */
function formAjuste(id, titulo, opcoes, acao) {
  dialog(titulo, `<label>Escolha<select id="dlgOpt">${opcoes.map(o => `<option>${esc(o)}</option>`).join('')}</select></label>`,
    [{ label: 'Cancelar' }, { label: 'Confirmar', primary: true, onClick: () => registrar(id, acao, $('#dlgOpt').value) }]);
}
function decidir(id, tipo) {
  const a = aluno(id);
  switch (tipo) {
    case 'aceitar': return registrar(id, 'Recomendação aceita pela monitoria', a.recomendacao.canal);
    case 'ajustar': return formAjuste(id, `Ajustar estratégia – ${a.nome}`, ['Trocar canal para e-mail', 'Trocar canal para WhatsApp', 'Contato telefônico manual', 'Adiar contato por 2 dias'], 'Estratégia ajustada');
    case 'rejeitar': return formAjuste(id, `Rejeitar recomendação – ${a.nome}`, ['Recomendação não se aplica a este aluno', 'Dados do aluno estão incorretos', 'Já houve contato fora do sistema', 'Outro motivo'], 'Recomendação rejeitada');
    case 'reanalise': return registrar(id, 'Nova análise solicitada à IA');
    case 'explicar': return explicacao(id);
    case 'atualizar': return dialog(`Atualizar dados cadastrais – ${a.nome}`,
      `<label>E-mail <input id="dE" type="email" value="${a.id.replace('-', '.')}@exemplo.edu.br" /></label><label>Telefone <input id="dT" type="tel" value="(85) 9 0000-0000" /></label><p class="nota">Dados fictícios do protótipo.</p>`,
      [{ label: 'Cancelar' }, { label: 'Salvar dados', primary: true, onClick: () => { const antes = { e: a.emailStatus, t: a.telefone, i: a.inconsistencias }; a.emailStatus = 'Ativado'; a.telefone = 'Confirmado'; a.inconsistencias = []; registrar(id, 'Dados cadastrais atualizados', '', () => { a.emailStatus = antes.e; a.telefone = antes.t; a.inconsistencias = antes.i; }); } }]);
    case 'canal': return formAjuste(id, `Alterar canal de comunicação – ${a.nome}`, ['WhatsApp', 'E-mail pessoal', 'Telefone', 'SMS'], 'Canal de comunicação alterado');
    case 'manual': return dialog(`Registrar intervenção manual – ${a.nome}`, `<label>Descrição <textarea id="dM" rows="3" placeholder="Ex.: liguei para o aluno e expliquei o primeiro acesso"></textarea></label>`,
      [{ label: 'Cancelar' }, { label: 'Registrar', primary: true, onClick: () => registrar(id, 'Intervenção manual registrada', $('#dM').value.trim()) }]);
  }
}
function mensagem(tipo) {
  const a = aluno(state.selecionado);
  if (tipo === 'enviar') {
    const txt = $('#txtMsg').value.trim();
    const aviso = a.inconsistencias.length ? `<div class="alert">⚠ Atenção: ${a.inconsistencias.map(esc).join('; ')}. A mensagem pode não ser entregue.</div>` : '';
    return dialog('Confirmar envio', `${aviso}<p>Enviar esta mensagem para <b>${esc(a.nome)}</b> por <b>${esc(a.canal)}</b>?</p><blockquote>${esc(txt)}</blockquote>`,
      [{ label: 'Voltar e revisar' }, { label: 'Confirmar envio', primary: true, onClick: () => registrar(a.id, 'Mensagem aprovada e enviada', a.canal) }]);
  }
  if (tipo === 'nova') { a.mensagem = `Oi, ${a.nome.split(' ')[0]}! Tudo bem? Seu acesso ao AVA está liberado. Se tiver qualquer dificuldade para entrar, responda esta mensagem que a monitoria ajuda você.`; render(); return toast('Nova sugestão gerada pela IA. Revise antes de enviar.'); }
  if (tipo === 'cancelar') return registrar(a.id, 'Recomendação de mensagem cancelada');
}

/* ---------- renderização e eventos ---------- */
function render() {
  if (!state.logado) {
    main.innerHTML = `<section class="panel login"><h1>Entrar no MonitorIA</h1><label>E-mail <input type="email" value="maria.monitor@exemplo.edu.br" /></label><label>Senha <input type="password" value="prototipo" /></label><button class="btn primary" id="btnEntrar">Entrar</button><p class="nota">Login simulado (protótipo).</p></section>`;
    $('#btnEntrar').onclick = () => { state.logado = true; render(); };
    return;
  }
  main.innerHTML = views[state.view]();
  document.querySelectorAll('.nav button').forEach(b => {
    const ativo = b.dataset.view === state.view;
    b.classList.toggle('active', ativo); b.setAttribute('aria-current', ativo ? 'page' : 'false');
  });
}
function irPara(view) { state.view = view; if (view !== 'alunos') state.perfil = null; render(); main.focus(); }

document.addEventListener('click', ev => {
  const t = ev.target.closest('button, [data-view]');
  if (!t) return;
  const d = t.dataset;
  if (d.view) { ev.preventDefault(); if (d.view === 'alunos') state.perfil = null; return irPara(d.view); }
  if (d.sel) { state.selecionado = d.sel; return render(); }
  if (d.perfil) { state.perfil = d.perfil; state.view = 'alunos'; render(); return main.focus(); }
  if (d.dec) return decidir(state.selecionado, d.dec);
  if (d.pdec) return decidir(state.perfil, d.pdec);
  if (d.msg) return mensagem(d.msg);
  if (d.fb) { const [k, v] = d.fb.split('|'); state.feedback[k] = v; render(); return toast('Feedback registrado. Obrigado!'); }
  if (d.tip) return dialog('O que significa?', `<p>${esc(d.tip)}</p>`, [{ label: 'Entendi', primary: true }]);
  if (t.id === 'voltarLista') { state.perfil = null; return render(); }
  if (t.id === 'btnSair') { state.logado = false; return render(); }
  if (t.id === 'btnNotif') { $('#notifCount').hidden = true; return dialog('Notificações', '<ul><li>João Pereira: mensagem não entregue (e-mail não ativado).</li><li>Maria Oliveira: aguardando primeiro acesso ao AVA.</li></ul>', [{ label: 'Fechar', primary: true }]); }
});
document.addEventListener('input', ev => {
  const id = ev.target.id;
  if (id === 'fBusca') { state.filtro.busca = ev.target.value; render(); const i = $('#fBusca'); i.focus(); i.setSelectionRange(i.value.length, i.value.length); }
  if (id === 'ajudaBusca') {
    const q = ev.target.value.toLowerCase().trim(); let n = 0;
    document.querySelectorAll('.faq').forEach(f => { const ok = !q || f.dataset.txt.includes(q); f.hidden = !ok; if (ok) n++; if (q && ok) f.open = true; });
    $('#semResultado').hidden = n > 0;
  }
});
document.addEventListener('change', ev => {
  const id = ev.target.id;
  if (id === 'fPrio') { state.filtro.prioridade = ev.target.value; render(); }
  if (id === 'fStatus') { state.filtro.status = ev.target.value; render(); }
  if (id === 'iaSel') { state.iaAluno = ev.target.value; render(); }
  if (ev.target.dataset.ctrl !== undefined) toast(ev.target.checked ? 'Controle ativado.' : 'Controle desativado.');
});
render();
