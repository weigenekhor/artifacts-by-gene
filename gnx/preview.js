const preview = document.querySelector('.product-window');

if ('IntersectionObserver' in window) {
  const figures = document.querySelectorAll('.architecture .principle-figure');
  const visible = new Set();
  const update = element => element.toggleAttribute('data-in-view', visible.has(element) && !document.hidden);
  const observer = new IntersectionObserver(entries => {
    for (const { target, isIntersecting } of entries) {
      if (isIntersecting) visible.add(target);
      else visible.delete(target);
      update(target);
    }
  });
  const observed = [...figures];
  if (preview) observed.push(preview);
  observed.forEach(element => observer.observe(element));
  document.addEventListener('visibilitychange', () => observed.forEach(update));

  document.querySelector('.architecture .principle-cycle')?.setAttribute('data-motion-ready', '');
}

if (preview) {
  const { apps } = JSON.parse(document.getElementById('artifacts-data').textContent);
  const cards = preview.querySelector('.engine-tiles');
  const workspace = preview.querySelector('.engine-workspace');
  const screens = workspace.querySelector('.engine-workspace-screens');
  const galleryLink = preview.querySelector('.workspace-gallery-link');
  const rail = preview.querySelector('.product-rail');
  const home = rail.querySelector('[data-workspace-home]');
  const railToggle = rail.querySelector('[data-toggle-rail]');
  const infoToggle = rail.querySelector('[data-toggle-info]');
  const info = preview.querySelector('.workspace-info');
  const closeInfo = info.querySelector('[data-close-info]');
  const narrow = matchMedia('(max-width: 760px)');
  let returnToCard = null;

  function setRail(open) {
    preview.toggleAttribute('data-rail-open', open);
    railToggle.setAttribute('aria-expanded', String(open));
    railToggle.setAttribute('aria-label', open ? 'Collapse application navigation' : 'Expand application navigation');
  }

  function setInfo(open) {
    if (open) {
      const now = new Date();
      const months = Math.max(0, (now.getFullYear() - 2025) * 12 + now.getMonth() - 7);
      const years = Math.floor(months / 12);
      info.querySelector('[data-info-age]').textContent = years ? `${years}y ${months % 12}m` : `${months}m`;
    }
    preview.toggleAttribute('data-info-open', open);
    infoToggle.setAttribute('aria-expanded', String(open));
    info.setAttribute('aria-hidden', String(!open));
    info.inert = !open;
  }

  function renderScreen(screen, index) {
    const figure = document.createElement('figure');
    const frame = document.createElement('div');
    frame.className = 'engine-workspace-image';
    frame.style.setProperty('--capture-ratio', `${screen.width} / ${screen.height}`);
    frame.toggleAttribute('data-crop-shell', screen.width === 3100 && screen.height === 1900);
    if (index) {
      const caption = document.createElement('figcaption');
      caption.textContent = screen.caption;
      figure.append(caption);
    }

    const image = new Image(screen.width, screen.height);
    image.alt = screen.caption;
    image.decoding = 'async';
    image.loading = index ? 'lazy' : 'eager';
    image.sizes = `${index ? 'auto, ' : ''}(max-width: 760px) 76vw, min(90vw, 1280px)`;
    image.addEventListener('error', () => {
      const message = document.createElement('p');
      message.textContent = 'This preview could not load. Use View screenshots below.';
      image.replaceWith(message);
    }, { once: true });
    image.srcset = screen.sources.map(source => `${source.src}?v=${screen.sha256.slice(0, 12)} ${source.width}w`).join(', ');
    image.src = `${screen.sources[0].src}?v=${screen.sha256.slice(0, 12)}`;
    frame.append(image);
    figure.append(frame);
    return figure;
  }

  function selectEngine(app, trigger) {
    const id = app?.id ?? '';
    if ((preview.dataset.engineOpen ?? '') === id) return;
    if (app) preview.dataset.engineOpen = id;
    else delete preview.dataset.engineOpen;
    cards.hidden = Boolean(app);
    workspace.hidden = !app;
    galleryLink.hidden = !app;
    const workspaceScreens = app?.images.filter(screen => screen.workspacePreview !== false) ?? [];
    screens.replaceChildren(...workspaceScreens.map(renderScreen));
    for (const link of rail.querySelectorAll('a')) {
      if (link === home ? !app : link.dataset.workspace === id) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }
    if (!app) return;

    workspace.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    workspace.setAttribute('aria-label', `${app.name} workspace preview`);
    galleryLink.href = `#${app.id}`;
    if (cards.contains(trigger)) {
      returnToCard = trigger;
      workspace.focus({ preventScroll: true });
    }
  }

  railToggle.hidden = false;
  infoToggle.hidden = false;
  railToggle.addEventListener('click', () => {
    const open = !preview.hasAttribute('data-rail-open');
    if (open && narrow.matches) setInfo(false);
    setRail(open);
  });
  infoToggle.addEventListener('click', () => {
    const open = !preview.hasAttribute('data-info-open');
    if (open && narrow.matches) setRail(false);
    setInfo(open);
  });
  closeInfo.addEventListener('click', () => {
    infoToggle.focus({ preventScroll: true });
    setInfo(false);
  });
  narrow.addEventListener('change', () => {
    if (narrow.matches && preview.hasAttribute('data-info-open')) setRail(false);
  });

  preview.addEventListener('click', event => {
    const link = event.target.closest('[data-workspace], [data-workspace-home]');
    if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (narrow.matches) {
      setRail(false);
      setInfo(false);
    }
    selectEngine(apps.find(app => app.id === link.dataset.workspace), link);
    if (link === home) returnToCard = null;
  });

  preview.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (preview.hasAttribute('data-info-open')) closeInfo.click();
    else if (preview.hasAttribute('data-rail-open')) {
      setRail(false);
      railToggle.focus({ preventScroll: true });
    } else if (preview.hasAttribute('data-engine-open')) {
      selectEngine();
      (returnToCard ?? home).focus({ preventScroll: true });
      returnToCard = null;
    } else return;
    event.preventDefault();
  });
}
