const screens = {
  dashboard: {
    src: 'assets/dashboard.png',
    alt: 'Dashboard Inteligente do MonitorIA'
  },
  alunos: {
    src: 'assets/alunos.png',
    alt: 'Perfil do Aluno com tratamento de inconsistências'
  },
  comunicacao: {
    src: 'assets/comunicacao.png',
    alt: 'Comunicação Inteligente do MonitorIA'
  },
  ia: {
    src: 'assets/ia.png',
    alt: 'Central de Inteligência Artificial do MonitorIA'
  },
  relatorios: {
    src: 'assets/relatorios.png',
    alt: 'Relatórios Inteligentes do MonitorIA'
  },
  ajuda: {
    src: 'assets/ajuda.png',
    alt: 'Central de Ajuda do MonitorIA'
  }
};

const screenImage = document.querySelector('#screenImage');
const toast = document.querySelector('#toast');
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

function loadScreen(screenName) {
  const screen = screens[screenName];
  if (!screen) return;

  screenImage.classList.add('is-changing');

  setTimeout(() => {
    screenImage.src = screen.src;
    screenImage.alt = screen.alt;
    screenImage.onload = () => screenImage.classList.remove('is-changing');
    showHotspotsFor(screenName);
  }, 130);
}

document.querySelectorAll('[data-screen]').forEach(button => {
  button.addEventListener('click', () => {
    loadScreen(button.dataset.screen);
  });
});

// Correção C-01: cada tela mostra apenas os seus próprios botões de ação.
function showHotspotsFor(screenName) {
  document.querySelectorAll('[data-only]').forEach(b => { b.hidden = b.dataset.only !== screenName; });
  document.querySelector('#explain').hidden = true;
}
showHotspotsFor('dashboard');

document.querySelectorAll('[data-explain]').forEach(button => {
  button.addEventListener('click', () => { document.querySelector('#explain').hidden = false; document.querySelector('#explainClose').focus(); });
});
document.querySelector('#explainClose').addEventListener('click', () => { document.querySelector('#explain').hidden = true; });

document.querySelectorAll('[data-action]').forEach(button => {
  button.addEventListener('click', () => {
    showToast(button.dataset.action);
  });
});

// Atalhos úteis para apresentação em sala.
// 1 Dashboard | 2 Alunos | 3 Comunicação | 4 IA | 5 Relatórios | 6 Ajuda
const keyboardMap = {
  '1': 'dashboard',
  '2': 'alunos',
  '3': 'comunicacao',
  '4': 'ia',
  '5': 'relatorios',
  '6': 'ajuda'
};

document.addEventListener('keydown', event => {
  const screenName = keyboardMap[event.key];
  if (screenName) loadScreen(screenName);
});
