// Real captures only. One timer per visible, playing gallery; no idle rendering loop.
const galleryMotion = matchMedia('(prefers-reduced-motion: reduce)');
const SLIDE_DURATION = 5500;
const DISSOLVE_DURATION = 700;

for (const gallery of document.querySelectorAll('[data-gallery]')) {
  const slides = [...gallery.querySelectorAll('.capture-button')];
  const controls = gallery.querySelector('.gallery-controls');
  const play = gallery.querySelector('.gallery-play');
  const count = gallery.querySelector('.gallery-count');
  const progress = gallery.querySelector('.gallery-progress span');
  const name = slides[0].dataset.name;
  let index = 0, desired = 0, timer = 0, cleanup = 0, ticket = 0;
  let visible = false, hovered = false, focused = false, busy = false;
  let paused = galleryMotion.matches, touch = null, suppressClick = false;
  let progressAnimation = null;
  controls.hidden = false;

  function stop() {
    clearTimeout(timer);
    timer = 0;
    progressAnimation?.cancel();
    progressAnimation = null;
  }
  function updatePlayback() {
    stop();
    play.setAttribute('aria-pressed', String(paused));
    play.setAttribute('aria-label', `${paused ? 'Play' : 'Pause'} ${name} slideshow`);
    count.setAttribute('aria-live', paused || focused ? 'polite' : 'off');
    if (paused || !visible || hovered || focused || busy || document.hidden || document.documentElement.classList.contains('viewer-open')) return;
    // Reduced-motion users may explicitly play; transitions/progress remain still.
    if (!galleryMotion.matches && typeof progress.animate === 'function') {
      progressAnimation = progress.animate([{transform:'scaleX(0)'},{transform:'scaleX(1)'}], {duration:SLIDE_DURATION,fill:'forwards'});
    }
    timer = setTimeout(() => show(index + 1), SLIDE_DURATION);
  }
  async function show(next) {
    desired = (next + slides.length) % slides.length;
    const targetIndex = desired, currentTicket = ++ticket;
    busy = true;
    stop();
    const target = slides[targetIndex], img = target.querySelector('img');
    img.loading = 'eager';
    try { await img.decode(); }
    catch {
      if (currentTicket === ticket) {
        busy = false; paused = true;
        count.textContent = 'Image unavailable';
        updatePlayback();
      }
      return;
    }
    if (currentTicket !== ticket) return;
    clearTimeout(cleanup);
    const outgoing = slides[index];
    const restoreFocus = document.activeElement === outgoing;
    for (const slide of slides) {
      slide.hidden = slide !== outgoing && slide !== target;
      slide.inert = slide !== target;
      slide.classList.toggle('is-active', slide === target);
    }
    target.hidden = false;
    // Establish the new plane before crossfading, without a layout read.
    if (target !== outgoing && !galleryMotion.matches) {
      target.animate([{opacity:0},{opacity:1}], {duration:DISSOLVE_DURATION,easing:'cubic-bezier(.16,1,.3,1)'});
    }
    if (restoreFocus) target.focus({preventScroll:true});
    index = targetIndex;
    count.textContent = `${String(index+1).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`;
    cleanup = setTimeout(() => {
      for (const slide of slides) slide.hidden = slide !== target;
    }, galleryMotion.matches ? 0 : DISSOLVE_DURATION);
    busy = false;
    updatePlayback();
  }
  function move(delta) { paused = true; show(desired + delta); }
  gallery.querySelector('.gallery-previous').addEventListener('click', () => move(-1));
  gallery.querySelector('.gallery-next').addEventListener('click', () => move(1));
  play.addEventListener('click', () => {
    paused = !paused;
    // Explicit Play overrides the pause caused by focusing this same control.
    if (!paused) focused = false;
    updatePlayback();
  });
  gallery.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  gallery.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') { hovered = true; updatePlayback(); } });
  gallery.addEventListener('pointerleave', () => { hovered = false; updatePlayback(); });
  gallery.addEventListener('focusin', () => { focused = true; updatePlayback(); });
  gallery.addEventListener('focusout', event => { focused = gallery.contains(event.relatedTarget); updatePlayback(); });
  const stage = gallery.querySelector('.capture-slides');
  stage.addEventListener('pointerdown', event => {
    suppressClick = false;
    if (event.pointerType === 'touch') touch = {x:event.clientX,y:event.clientY};
  });
  stage.addEventListener('pointerup', event => {
    if (!touch) return;
    const dx=event.clientX-touch.x,dy=event.clientY-touch.y;
    touch=null;
    if (Math.abs(dx)>45 && Math.abs(dx)>Math.abs(dy)*1.5) { suppressClick=true; move(dx<0?1:-1); }
  });
  stage.addEventListener('pointercancel', () => { touch=null; });
  stage.addEventListener('click', event => {
    if (suppressClick) { event.preventDefault(); event.stopImmediatePropagation(); suppressClick=false; }
  }, true);
  new IntersectionObserver(entries => {
    visible=entries[0].isIntersecting && entries[0].intersectionRatio>=.35;
    updatePlayback();
  }, {threshold:[0,.35]}).observe(gallery);
  document.addEventListener('visibilitychange', updatePlayback);
  document.querySelector('.image-viewer').addEventListener('close', updatePlayback);
  new MutationObserver(updatePlayback).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
  galleryMotion.addEventListener('change', () => { paused=galleryMotion.matches; updatePlayback(); });
  slides.forEach((slide,i) => { slide.inert=i!==0; });
  updatePlayback();
}
