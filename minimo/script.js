/* Invólucro CONSTANTE (Parte 2). Não faz parte do que a LLM gerou.
   Mesma geometria de menu do Baseline original (ihc/proto / anapsaraujo).
   Telas geradas nesta condição: Frame (P0), Dashboard (P1), Alunos (P2), Relatórios (P3).
   Comunicação / Inteligência Artificial / Ajuda → toast (módulo não gerado). */
(function () {
  const cond = (window.MONITORIA_CONDITION || 'B').toUpperCase();
  const prefix = cond + '_';

  const screens = {
    frame: {
      src: prefix + 'P0_frame.png',
      alt: 'Frame Master do MonitorIA (' + cond + ')'
    },
    dashboard: {
      src: prefix + 'P1_dashboard.png',
      alt: 'Dashboard do MonitorIA (' + cond + ')'
    },
    alunos: {
      src: prefix + 'P2_alunos.png',
      alt: 'Alunos do MonitorIA (' + cond + ')'
    },
    relatorios: {
      src: prefix + 'P3_relatorios.png',
      alt: 'Relatórios do MonitorIA (' + cond + ')'
    }
  };

  const screenImage = document.querySelector('#screenImage');
  const toast = document.querySelector('#toast');
  let toastTimer;
  let current = 'dashboard';

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  function syncActionVisibility() {
    document.querySelectorAll('[data-only]').forEach(el => {
      el.hidden = el.dataset.only !== current;
    });
  }

  function loadScreen(screenName) {
    const screen = screens[screenName];
    if (!screen) {
      showToast('Módulo "' + screenName + '" não foi gerado nesta condição.');
      return;
    }
    screenImage.classList.add('is-changing');
    setTimeout(() => {
      current = screenName;
      screenImage.src = screen.src;
      screenImage.alt = screen.alt;
      screenImage.onload = () => screenImage.classList.remove('is-changing');
      syncActionVisibility();
    }, 130);
  }

  document.querySelectorAll('[data-screen]').forEach(button => {
    button.addEventListener('click', () => {
      const target = button.dataset.screen;
      if (screens[target]) loadScreen(target);
      else showToast('Módulo "' + (button.getAttribute('aria-label') || target) + '" não foi gerado nesta condição.');
    });
  });

  document.querySelectorAll('[data-action]').forEach(button => {
    button.addEventListener('click', () => {
      showToast(button.dataset.action);
    });
  });

  // 0 Frame | 1 Dashboard | 2 Alunos | 5 Relatórios
  const keyboardMap = {
    '0': 'frame',
    '1': 'dashboard',
    '2': 'alunos',
    '5': 'relatorios'
  };
  document.addEventListener('keydown', event => {
    const screenName = keyboardMap[event.key];
    if (screenName) loadScreen(screenName);
  });

  syncActionVisibility();
})();
