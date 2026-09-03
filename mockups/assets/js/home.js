const menuButton = document.querySelector('.menu-button');
const mainNav = document.querySelector('.main-nav');

if (menuButton && mainNav) {
  menuButton.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('is-open');

    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
  });
}

const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

if (finePointer.matches) {
  const cursor = document.createElement('div');
  const cursorVisual = document.createElement('span');
  const cursorPaw = document.createElement('img');
  const cursorLabel = document.createElement('span');
  let cursorFrame = 0;
  let cursorX = -100;
  let cursorY = -100;

  cursor.className = 'custom-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  cursorVisual.className = 'custom-cursor__visual';
  cursorPaw.className = 'custom-cursor__paw';
  cursorPaw.src = 'assets/paw-cursor.svg';
  cursorPaw.alt = '';
  cursorLabel.className = 'custom-cursor__label';
  cursorVisual.append(cursorPaw, cursorLabel);
  cursor.append(cursorVisual);
  document.body.append(cursor);
  document.documentElement.classList.add('has-custom-cursor');

  const renderCursor = () => {
    cursor.style.setProperty('--cursor-x', `${cursorX}px`);
    cursor.style.setProperty('--cursor-y', `${cursorY}px`);
    cursorFrame = 0;
  };

  const setCursorState = (target) => {
    const interactive = target.closest('a, button');
    const card = target.closest('.product-card');
    const formControl = target.closest('input, textarea, select, [contenteditable="true"]');
    let state = '';
    let label = '';

    if (formControl) {
      state = 'is-hidden';
    } else if (card) {
      state = 'is-action';
      label = 'ВЫБРАТЬ';
    } else if (interactive) {
      state = 'is-action';

      if (interactive.matches('[href^="mailto:"]')) {
        label = 'ПИСАТЬ';
      } else if (interactive.matches('[href^="tel:"]')) {
        label = 'ЗВОНИТЬ';
      } else if (interactive.matches('button')) {
        label = 'НАЖАТЬ';
      } else {
        label = 'ПЕРЕЙТИ';
      }
    }

    cursor.classList.remove('is-action', 'is-hidden', 'has-label');

    if (state) {
      cursor.classList.add(state);
    }

    cursorLabel.textContent = label;
    cursor.classList.toggle('has-label', Boolean(label));
  };

  document.addEventListener('pointermove', (event) => {
    cursorX = event.clientX;
    cursorY = event.clientY;
    cursor.classList.add('is-visible');
    cursor.classList.toggle('is-flipped', cursorX > window.innerWidth - 130);

    if (!cursorFrame) {
      cursorFrame = window.requestAnimationFrame(renderCursor);
    }
  });

  document.addEventListener('pointerover', (event) => setCursorState(event.target));
  document.addEventListener('pointerdown', () => cursor.classList.add('is-pressed'));
  document.addEventListener('pointerup', () => cursor.classList.remove('is-pressed'));
  document.addEventListener('pointercancel', () => cursor.classList.remove('is-pressed'));
  document.documentElement.addEventListener('mouseleave', () => cursor.classList.remove('is-visible'));
  document.documentElement.addEventListener('mouseenter', () => cursor.classList.add('is-visible'));
}
