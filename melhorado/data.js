/* Modelo de dados único (corrige E1-07): todas as telas leem daqui.
   Dados fictícios, os mesmos nomes e números do Baseline publicado. */
const HOJE = new Date();
function diasAtras(n, h = 9, m = 0) {
  const d = new Date(HOJE); d.setDate(d.getDate() - n); d.setHours(h, m, 0, 0); return d;
}

const ALUNOS = [
  {
    id: 'maria-oliveira', nome: 'Maria Oliveira', curso: 'Assistente Administrativo',
    status: 'Aguardando primeiro acesso ao AVA', statusTipo: 'critico', prioridade: 'ALTA',
    diasSemAcesso: null, matricula: diasAtras(12), canal: 'WhatsApp', emailStatus: 'Ativado',
    telefone: 'Confirmado', confianca: 87,
    fatores: [
      ['Tempo sem acessar o AVA', 45], ['Histórico de tentativas de contato', 30],
      ['Situação cadastral', 15], ['Respostas anteriores', 10]
    ],
    recomendacao: { canal: 'WhatsApp', texto: 'Contato via WhatsApp, que apresentou maior efetividade em situações semelhantes.' },
    mensagem: 'Olá, Maria! Percebemos que seu primeiro acesso ao AVA ainda não foi realizado. Estamos aqui para ajudar você nessa primeira etapa da sua jornada.',
    inconsistencias: []
  },
  {
    id: 'joao-pereira', nome: 'João Pereira', curso: 'Técnico em Logística',
    status: 'Aguardando primeiro acesso ao AVA', statusTipo: 'critico', prioridade: 'ALTA',
    diasSemAcesso: null, matricula: diasAtras(10), canal: 'E-mail institucional', emailStatus: 'Não ativado',
    telefone: 'Necessita confirmação', confianca: 42,
    fatores: [
      ['Tempo sem acessar o AVA', 45], ['Histórico de tentativas de contato', 30],
      ['Situação cadastral', 15], ['Respostas anteriores', 10]
    ],
    recomendacao: { canal: 'Atualizar dados antes do contato', texto: 'Atualizar os dados de contato ou escolher outro canal antes de enviar qualquer mensagem.' },
    mensagem: 'Olá, João! Percebemos que seu primeiro acesso ao AVA ainda não foi realizado. Estamos aqui para ajudar você nessa primeira etapa da sua jornada.',
    inconsistencias: ['E-mail institucional ainda não ativado', 'Última mensagem enviada não foi entregue', 'Telefone precisa de confirmação'],
    historico: [
      { d: diasAtras(2, 9, 12), t: 'IA identificou risco' },
      { d: diasAtras(2, 9, 15), t: 'Tentativa de contato realizada (e-mail)' },
      { d: diasAtras(2, 9, 18), t: 'Problema encontrado: mensagem não entregue' }
    ]
  },
  {
    id: 'joao-pedro-souza', nome: 'João Pedro Souza', curso: 'Logística',
    status: 'Sem acesso há 15 dias', statusTipo: 'alerta', prioridade: 'MÉDIA',
    diasSemAcesso: 15, matricula: diasAtras(40), canal: 'WhatsApp', emailStatus: 'Ativado',
    telefone: 'Confirmado', confianca: 74,
    fatores: [['Tempo sem acessar o AVA', 55], ['Histórico de tentativas de contato', 25], ['Respostas anteriores', 20]],
    recomendacao: { canal: 'WhatsApp', texto: 'Mensagem de retomada via WhatsApp.' },
    mensagem: 'Olá, João Pedro! Sentimos sua falta no AVA. Podemos ajudar você a retomar?',
    inconsistencias: []
  },
  {
    id: 'ana-clara-lima', nome: 'Ana Clara Lima', curso: 'Recursos Humanos',
    status: 'Acesso irregular', statusTipo: 'alerta', prioridade: 'MÉDIA',
    diasSemAcesso: 6, matricula: diasAtras(45), canal: 'E-mail', emailStatus: 'Ativado',
    telefone: 'Confirmado', confianca: 68,
    fatores: [['Frequência de acesso', 50], ['Atividades pendentes', 30], ['Respostas anteriores', 20]],
    recomendacao: { canal: 'E-mail', texto: 'E-mail com lembrete das atividades pendentes.' },
    mensagem: 'Olá, Ana Clara! Você tem atividades pendentes no AVA. Conte conosco se precisar de ajuda.',
    inconsistencias: []
  },
  {
    id: 'lucas-ferreira', nome: 'Lucas Ferreira', curso: 'Comércio Exterior',
    status: 'Sem acesso há 10 dias', statusTipo: 'alerta', prioridade: 'BAIXA',
    diasSemAcesso: 10, matricula: diasAtras(50), canal: 'WhatsApp', emailStatus: 'Ativado',
    telefone: 'Confirmado', confianca: 61,
    fatores: [['Tempo sem acessar o AVA', 60], ['Respostas anteriores', 40]],
    recomendacao: { canal: 'WhatsApp', texto: 'Lembrete leve via WhatsApp.' },
    mensagem: 'Olá, Lucas! Lembrete: seu curso continua disponível no AVA.',
    inconsistencias: []
  }
];

/* Indicadores com definição, base e período (corrige E1-09). Dados fictícios. */
const PERIODO = 'últimos 30 dias';
const METRICAS = {
  total: { v: '1.030', l: 'Total de alunos acompanhados', def: 'Alunos dos editais de gratuidade sob acompanhamento desta monitoria.' },
  primeiro: { v: '726', l: 'Primeiro acesso realizado', def: 'Alunos que já entraram ao menos uma vez no AVA (726 de 1.030).' },
  aguardando: { v: '304', l: 'Aguardando primeiro acesso', def: 'Alunos que ainda não entraram no AVA (304 de 1.030).' },
  ativacao: { v: '70%', l: 'Taxa de ativação', def: 'Primeiro acesso realizado ÷ total acompanhado (726 ÷ 1.030).' },
  prioridades: { v: '45', l: 'Prioridades identificadas pela IA', def: 'Casos com prioridade ALTA ou MÉDIA na análise de hoje.' },
  enviadas: { v: '428', l: 'Mensagens enviadas', def: `Mensagens aprovadas pela monitoria e enviadas nos ${PERIODO}.` },
  resposta: { v: '76%', l: 'Taxa de resposta', def: `Mensagens com resposta do aluno ÷ mensagens enviadas (${PERIODO}).` },
  reativados: { v: '186', l: 'Alunos reativados após contato', def: `Alunos que acessaram o AVA após um contato da monitoria (${PERIODO}).` },
  precisao: { v: '87%', l: 'Recomendações úteis', def: `Recomendações avaliadas como "Útil" pela monitoria ÷ recomendações avaliadas (${PERIODO}).` }
};
