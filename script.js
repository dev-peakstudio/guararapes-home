/* ============================================================
   GUARARAPES · Home v2 — interações
   ============================================================ */

(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Loader → libera a coreografia do hero (is-ready) ──── */
  const loader = document.getElementById('loader');
  let sceneReady = false;
  const finishLoader = () => {
    if (sceneReady) return;
    sceneReady = true;
    if (loader) loader.classList.add('is-done');
    document.documentElement.classList.add('is-ready');
  };
  if (reduceMotion) finishLoader();
  else {
    window.addEventListener('load', () => {
      setTimeout(finishLoader, Math.max(0, 1250 - performance.now()));
    });
    setTimeout(finishLoader, 3500); // nunca prender o usuário
  }

  /* ── Hero: slideshow (vídeo → imagens, em loop) ────────── */
  const heroMedia = document.querySelector('.hero__media');
  if (heroMedia) {
    const slides = Array.from(heroMedia.querySelectorAll('.hero__slide'));
    const video = heroMedia.querySelector('.hero__video');
    if (slides.length > 1) {
      const IMG_MS = 5500;
      let idx = 0;
      let timer = null;
      const clear = () => { if (timer) { clearTimeout(timer); timer = null; } };
      const playVideo = () => {
        if (!video) return;
        try { video.currentTime = 0; } catch (e) {}
        const p = video.play();
        if (p && p.catch) p.catch(() => { clear(); timer = setTimeout(() => go(idx + 1), IMG_MS); });
      };
      const go = (n) => {
        clear();
        slides[idx].classList.remove('is-active');
        idx = (n + slides.length) % slides.length;
        const slide = slides[idx];
        slide.classList.add('is-active');
        if (video && slide.contains(video)) {
          playVideo();
        } else {
          if (video) { try { video.pause(); } catch (e) {} }
          timer = setTimeout(() => go(idx + 1), IMG_MS);
        }
      };
      if (video) {
        video.addEventListener('ended', () => go(idx + 1));
        video.addEventListener('error', () => go(idx + 1));
      }
      // slide 0 (vídeo) já está ativo no markup; reduced-motion mantém só o pôster
      if (!reduceMotion) playVideo();
    }
  }

  /* ── Header: estado sólido ao rolar ────────────────────── */
  const header = document.getElementById('header');
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 40);
    const hide = y > lastY && y > 200
      && !header.classList.contains('is-mega')
      && !header.classList.contains('is-open')
      && !header.contains(document.activeElement);
    header.classList.toggle('is-hidden', hide);
    lastY = y;
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ── Megamenu ──────────────────────────────────────────── */
  const backdrop = document.createElement('div');
  backdrop.className = 'mega-backdrop';
  document.body.appendChild(backdrop);

  const megaItems = Array.from(document.querySelectorAll('.nav__item.has-mega'));
  const isMobile = () => window.matchMedia('(max-width: 980px)').matches;
  let closeTimer = null;

  const closeAllMegas = (except) => {
    megaItems.forEach((item) => {
      if (item === except) return;
      item.querySelector('.nav__link').setAttribute('aria-expanded', 'false');
      item.querySelector('.mega').classList.remove('is-open');
    });
    if (!except) { backdrop.classList.remove('is-on'); header.classList.remove('is-mega'); }
  };

  const openMega = (item) => {
    clearTimeout(closeTimer);
    closeAllMegas(item);
    item.querySelector('.nav__link').setAttribute('aria-expanded', 'true');
    item.querySelector('.mega').classList.add('is-open');
    if (!isMobile()) { backdrop.classList.add('is-on'); header.classList.add('is-mega'); }
  };

  megaItems.forEach((item) => {
    const btn = item.querySelector('.nav__link');
    const mega = item.querySelector('.mega');

    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      if (open) { closeAllMegas(); btn.setAttribute('aria-expanded', 'false'); mega.classList.remove('is-open'); }
      else openMega(item);
    });

    if (!('ontouchstart' in window)) {
      item.addEventListener('mouseenter', () => { if (!isMobile()) openMega(item); });
      item.addEventListener('mouseleave', () => {
        if (isMobile()) return;
        closeTimer = setTimeout(() => closeAllMegas(), 180);
      });
      mega.addEventListener('mouseenter', () => clearTimeout(closeTimer));
      mega.addEventListener('mouseleave', () => {
        if (isMobile()) return;
        closeTimer = setTimeout(() => closeAllMegas(), 180);
      });
    }
  });

  backdrop.addEventListener('click', () => closeAllMegas());
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const openItem = megaItems.find((i) => i.querySelector('.mega.is-open'));
      closeAllMegas();
      if (openItem && !isMobile()) openItem.querySelector('.nav__link').focus();
      if (nav.classList.contains('is-open') || header.classList.contains('is-open')) closeMenu(true);
    }
  });
  // fecha megamenu quando o foco sai (teclado)
  document.addEventListener('focusin', (e) => {
    if (!e.target.closest('.nav__item.has-mega')) closeAllMegas();
  });

  /* ── Menu mobile ───────────────────────────────────────── */
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');

  const setInert = (on) => {
    const m = document.querySelector('main'); const f = document.querySelector('.footer');
    if (m) m.inert = on;
    if (f) f.inert = on;
  };
  const closeMenu = (returnFocus) => {
    setInert(false);
    header.classList.remove('is-open');
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    closeAllMegas();
    if (returnFocus) burger.focus();
  };

  burger.addEventListener('click', () => {
    const open = !header.classList.contains('is-open');
    header.classList.toggle('is-open', open);
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    setInert(open);
  });

  nav.querySelectorAll('a.nav__link, .mega__list a').forEach((link) => {
    link.addEventListener('click', () => { if (isMobile()) closeMenu(false); });
  });

  /* ── Idioma (demonstrativo, sincronizado) ──────────────── */
  const LANG_GROUPS = document.querySelectorAll('.lang');
  const setLang = (code) => {
    document.documentElement.lang = code;
    LANG_GROUPS.forEach((group) => {
      group.querySelectorAll('.lang__btn').forEach((b) => {
        const active = b.dataset.lang === code;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', String(active));
      });
    });
  };
  LANG_GROUPS.forEach((group) => {
    group.querySelectorAll('.lang__btn').forEach((btn) => {
      btn.addEventListener('click', () => setLang(btn.dataset.lang));
    });
  });

  /* dropdown de idioma (globo) no header */
  const langDropdown = document.querySelector('.header .lang');
  const langToggle = langDropdown && langDropdown.querySelector('.lang__toggle');
  if (langDropdown && langToggle) {
    const closeLang = () => { langDropdown.classList.remove('is-open'); langToggle.setAttribute('aria-expanded', 'false'); };
    langToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = !langDropdown.classList.contains('is-open');
      langDropdown.classList.toggle('is-open', open);
      langToggle.setAttribute('aria-expanded', String(open));
    });
    langDropdown.querySelectorAll('.lang__btn').forEach((b) => b.addEventListener('click', closeLang));
    document.addEventListener('click', (e) => { if (!e.target.closest('.header .lang')) closeLang(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLang(); });
  }

  /* ── Reveal on scroll (com redes de segurança) ──────────── */
  const revealEls = Array.from(document.querySelectorAll('.reveal, .reveal-mask'));
  const showEl = (el) => el.classList.add('is-visible');

  // varredura síncrona: revela qualquer elemento já dentro do viewport.
  // cobre saltos por âncora, bfcache e gatilhos perdidos do observer.
  const sweepReveals = () => {
    const vh = window.innerHeight;
    revealEls.forEach((el) => {
      if (el.classList.contains('is-visible')) return;
      const r = el.getBoundingClientRect();
      if (r.top < vh - 40 && r.bottom > 0 && r.width > 0) showEl(el);
    });
  };

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(showEl);
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { showEl(entry.target); io.unobserve(entry.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    revealEls.forEach((el) => io.observe(el));

    sweepReveals();
    window.addEventListener('load', sweepReveals);
    window.addEventListener('pageshow', sweepReveals);
    window.addEventListener('hashchange', () => setTimeout(sweepReveals, 80));
    let sweepTick = false;
    window.addEventListener('scroll', () => {
      if (sweepTick) return;
      sweepTick = true;
      setTimeout(() => { sweepReveals(); sweepTick = false; }, 200);
    }, { passive: true });
  }

  /* ── Big numbers ───────────────────────────────────────── */
  const counters = document.querySelectorAll('.count');
  const formatBR = (n) => n.toLocaleString('pt-BR');
  const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const dur = target > 200 ? 1600 : 1000;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      el.textContent = formatBR(Math.round(target * eased)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const sideCounters = Array.from(document.querySelectorAll('.numbers__item--side .count'));
  const startCount = (el) => {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    const lag = Math.max(0, sideCounters.indexOf(el)) * 120;
    setTimeout(() => animateCount(el), lag);
  };
  if (reduceMotion || !('IntersectionObserver' in window)) {
    counters.forEach((el) => { el.dataset.done = '1'; el.textContent = formatBR(parseInt(el.dataset.count, 10)) + (el.dataset.suffix || ''); });
  } else {
    const co = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { startCount(entry.target); co.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => co.observe(el));
    const sweepCounts = () => {
      const vh = window.innerHeight;
      counters.forEach((el) => {
        if (el.dataset.done) return;
        const r = el.getBoundingClientRect();
        if (r.top < vh - 40 && r.bottom > 0) startCount(el);
      });
    };
    window.addEventListener('load', sweepCounts);
    window.addEventListener('pageshow', sweepCounts);
    window.addEventListener('scroll', () => setTimeout(sweepCounts, 250), { passive: true });
  }

  /* ── Produtos: preview flutuante que segue o cursor ────── */
  const plist = document.getElementById('plist');
  const preview = document.getElementById('plistPreview');
  if (plist && preview && matchMedia('(hover: hover) and (pointer: fine)').matches && !reduceMotion) {
    const imgs = preview.querySelectorAll('img');
    let frontImg = 0;
    const swapPreview = (src) => {
      frontImg ^= 1;
      imgs[frontImg].src = src;
      imgs[frontImg].classList.add('is-top');
      imgs[frontImg ^ 1].classList.remove('is-top');
    };
    let raf = null;
    let mx = 0, my = 0, px = 0, py = 0;

    const loop = () => {
      px += (mx - px) * 0.12;
      py += (my - py) * 0.12;
      preview.style.transform = `translate(${px}px, ${py}px)`;
      raf = requestAnimationFrame(loop);
    };

    plist.addEventListener('mousemove', (e) => {
      mx = e.clientX + 28;
      my = e.clientY - preview.offsetHeight / 2;
      // não deixar sair da viewport
      mx = Math.min(mx, window.innerWidth - preview.offsetWidth - 16);
      my = Math.max(16, Math.min(my, window.innerHeight - preview.offsetHeight - 16));
    });

    plist.querySelectorAll('.plist__row').forEach((row) => {
      row.addEventListener('mouseenter', (e) => {
        if (!raf) {
          mx = e.clientX + 28;
          my = e.clientY - preview.offsetHeight / 2;
          px = mx; py = my;
        }
        swapPreview(row.dataset.img);
        preview.classList.add('is-on');
        if (!raf) loop();
      });
    });
    plist.addEventListener('mouseleave', () => {
      preview.classList.remove('is-on');
      if (raf) { cancelAnimationFrame(raf); raf = null; }
    });
  }

  /* ── Parallax do full-bleed ────────────────────────────── */
  const parallaxEls = document.querySelectorAll('.parallax');
  if (parallaxEls.length && !reduceMotion) {
    let ticking = false;
    const update = () => {
      parallaxEls.forEach((el) => {
        const rect = el.parentElement.getBoundingClientRect();
        const vh = window.innerHeight;
        if (rect.bottom < 0 || rect.top > vh) return;
        const progress = (rect.top + rect.height / 2 - vh / 2) / (vh / 2 + rect.height / 2);
        el.style.transform = `translateY(${progress * -6}%)`;
      });
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* ── Galeria: arrastar com o mouse ─────────────────────── */
  const track = document.getElementById('galleryTrack');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (track && finePointer) {
    let down = false, startX = 0, startScroll = 0, moved = false, lastDx = 0;

    track.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      e.preventDefault(); // mata o drag nativo da imagem
      down = true; moved = false; lastDx = 0;
      startX = e.clientX;
      startScroll = track.scrollLeft;
      track.classList.add('is-dragging');
      track.setPointerCapture(e.pointerId);
      dragCursor.classList.add('is-down');
    });
    track.addEventListener('pointermove', (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      lastDx = e.movementX;
      if (Math.abs(dx) > 4) moved = true;
      track.scrollLeft = startScroll - dx;
    });
    const endDrag = () => {
      if (!down) return;
      down = false;
      dragCursor.classList.remove('is-down');
      if (!moved) { track.classList.remove('is-dragging'); return; }
      // assenta no item mais próximo, com momentum na direção do gesto
      const items = Array.from(track.querySelectorAll('.gallery__item'));
      const tr = track.getBoundingClientRect();
      let target = items.reduce((a, b) =>
        Math.abs(b.getBoundingClientRect().left - tr.left) <
        Math.abs(a.getBoundingClientRect().left - tr.left) ? b : a);
      const i = items.indexOf(target);
      if (lastDx < -6 && i < items.length - 1) target = items[i + 1];
      if (lastDx > 6 && i > 0) target = items[i - 1];
      track.scrollTo({ left: track.scrollLeft + target.getBoundingClientRect().left - tr.left, behavior: reduceMotion ? 'auto' : 'smooth' });
      const rearm = () => track.classList.remove('is-dragging');
      if ('onscrollend' in window) track.addEventListener('scrollend', rearm, { once: true });
      else setTimeout(rearm, 500);
    };
    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);
    // evita clique fantasma após arrastar
    track.addEventListener('click', (e) => { if (moved) e.preventDefault(); }, true);

    /* ── dragger estilizado ── */
    const dragCursor = document.createElement('div');
    dragCursor.className = 'drag-cursor';
    dragCursor.setAttribute('aria-hidden', 'true');
    dragCursor.innerHTML =
      '<svg viewBox="0 0 12 12"><path d="M7.5 1.5 3 6l4.5 4.5"/></svg>' +
      '<span class="drag-cursor__label">Arraste</span>' +
      '<svg viewBox="0 0 12 12"><path d="M4.5 1.5 9 6 4.5 10.5"/></svg>';
    document.body.appendChild(dragCursor);
    track.classList.add('has-cursor');

    let cx = 0, cy = 0, vx = 0, vy = 0, cursorRaf = null;
    const cursorLoop = () => {
      vx += (cx - vx) * 0.28;
      vy += (cy - vy) * 0.28;
      dragCursor.style.transform = `translate(${vx}px, ${vy}px)`;
      cursorRaf = requestAnimationFrame(cursorLoop);
    };
    track.addEventListener('pointerenter', (e) => {
      cx = vx = e.clientX; cy = vy = e.clientY;
      dragCursor.classList.add('is-on');
      if (!cursorRaf && !reduceMotion) cursorLoop();
      if (reduceMotion) dragCursor.style.transform = `translate(${cx}px, ${cy}px)`;
    });
    track.addEventListener('pointermove', (e) => {
      cx = e.clientX; cy = e.clientY;
      if (reduceMotion) dragCursor.style.transform = `translate(${cx}px, ${cy}px)`;
    });
    track.addEventListener('pointerleave', () => {
      dragCursor.classList.remove('is-on', 'is-down');
      if (cursorRaf) { cancelAnimationFrame(cursorRaf); cursorRaf = null; }
    });
  }

  /* ── Scroll suave da página + roda vertical não sequestrada ── */
  const smoothOn = finePointer && !reduceMotion;
  if (smoothOn) {
    let target = window.scrollY, current = window.scrollY, raf = null;
    const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;
    const loop = () => {
      current += (target - current) * 0.115;
      if (Math.abs(target - current) < 0.5) {
        current = target;
        window.scrollTo({ top: current, behavior: 'instant' });
        raf = null;
        return;
      }
      window.scrollTo({ top: current, behavior: 'instant' });
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener('wheel', (e) => {
      if (e.ctrlKey) return; // zoom por pinça
      const overTrack = track && track.contains(e.target);
      if (overTrack && Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // gesto horizontal: o slider cuida
      e.preventDefault(); // roda vertical sobre o slider rola a PÁGINA, nunca o slider
      target = Math.max(0, Math.min(maxScroll(), target + e.deltaY));
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: false });
    // teclado, âncoras e barra de rolagem continuam nativos — só re-sincroniza
    window.addEventListener('scroll', () => {
      if (!raf) { target = current = window.scrollY; }
    }, { passive: true });
  } else if (track) {
    // sem scroll suave: ainda assim impede o snap horizontal de consumir a roda vertical
    track.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        window.scrollBy(0, e.deltaY);
      }
    }, { passive: false });
  }

  /* ── Galeria: contagem e progresso ─────────────────────── */
  const galBar = document.getElementById('galBar');
  const galCurrent = document.getElementById('galCurrent');
  const galHint = document.getElementById('galHint');
  if (track && galBar) {
    const total = track.querySelectorAll('.gallery__item').length;
    const updateGal = () => {
      const max = track.scrollWidth - track.clientWidth;
      const p = max > 0 ? track.scrollLeft / max : 0;
      const frac = Math.max(0.1, Math.min(1, track.clientWidth / track.scrollWidth));
      galBar.style.width = (frac * 100) + '%';
      galBar.style.left = (p * (100 - frac * 100)) + '%';
      if (galCurrent) {
        const idx = Math.min(total, Math.max(1, Math.round(p * (total - 1)) + 1));
        const txt = String(idx).padStart(2, '0');
        if (txt !== galCurrent.textContent) {
          if (reduceMotion) galCurrent.textContent = txt;
          else {
            galCurrent.classList.remove('is-in');
            galCurrent.classList.add('is-out');
            setTimeout(() => {
              galCurrent.textContent = txt;
              galCurrent.classList.remove('is-out');
              galCurrent.style.translate = '0 100%';
              requestAnimationFrame(() => {
                galCurrent.style.translate = '';
                galCurrent.classList.add('is-in');
              });
            }, 180);
          }
        }
      }
      if (galHint) galHint.classList.toggle('is-hidden', track.scrollLeft > 30);
    };
    track.addEventListener('scroll', updateGal, { passive: true });
    updateGal();
  }
})();

/* ============================================================
   PRODUTOS — 3 versões de interação (avaliação)
   ============================================================ */
(function () {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const A = 'assets/';
  const PRODUTOS = [
    { id:'decorativos', num:'01', name:'MDF Decorativos', sub:'9 linhas', cover:A+'ambiente-quarto-verde.jpg', lines:[
      {name:'Colors',img:A+'ambiente-quarto-verde.jpg'},{name:'Áris',img:A+'ambiente-cozinha-escura.jpg'},{name:'Madeiras do Brasil',img:A+'catalog-madeiras-brasil.jpg'},{name:'Madeiras do Mundo',img:A+'catalog-madeiras-mundo.jpg'},{name:'Madeiras Geométricas',img:A+'catalog-geometricas.jpg'},{name:'Comfort',img:A+'catalog-comfort.jpg'},{name:'Flex',img:A+'catalog-flex.jpg'},{name:'Magma',img:A+'catalog-magma.jpg'},{name:'Metalic',img:A+'catalog-metalic.jpg'} ] },
    { id:'cru', num:'02', name:'MDF Cru', sub:'8 produtos', cover:A+'mdf-cru-chapas.jpg', lines:[
      {name:'G-Door',img:A+'mdf-cru-chapas.jpg'},{name:'HDF Cru - Super Core',img:A+'chapas-mdf-still.jpg'},{name:'MDF Cru - Standard',img:A+'mdf-cru-chapas.jpg'},{name:'MDF Leve',img:A+'textura-madeira-clara.jpg'},{name:'MDF Ultraleve',img:A+'textura-tile-1.jpg'},{name:'Mega MDF',img:A+'fabrica-chapas-leque.jpg'},{name:'MultiRipas',img:A+'textura-marchetaria.jpg'},{name:'RUC Cru',img:A+'mdf-ruc-chapas.jpg'} ] },
    { id:'ruc', num:'03', name:'MDF RUC', sub:'12 acabamentos', cover:A+'mdf-ruc-chapas.jpg', lines:[
      {name:'RUC Areia',img:A+'textura-tile-2.jpg'},{name:'RUC Branco TX',img:A+'textura-madeira-clara.jpg'},{name:'RUC Brisa',img:A+'textura-tile-1.jpg'},{name:'RUC Carvalho Natural',img:A+'textura-carvalho-dourado.jpg'},{name:'RUC Cru',img:A+'mdf-ruc-chapas.jpg'},{name:'RUC Freijó',img:A+'textura-nogueira-still.jpg'},{name:'RUC Grafite',img:A+'textura-tile-6.jpg'},{name:'RUC Lume',img:A+'textura-tile-5.jpg'},{name:'RUC Maxi Branco',img:A+'textura-tile-1.jpg'},{name:'RUC Nuvem',img:A+'textura-tile-3.jpg'},{name:'RUC Savana',img:A+'textura-carvalho-dourado.jpg'},{name:'RUC Tauari',img:A+'textura-madeira-clara.jpg'} ] },
    { id:'compensados', num:'04', name:'Compensados Guaraply', sub:'Estruturais e não estruturais', cover:A+'compensado-chapas.jpg', lines:[
      {name:'Estruturais',img:A+'compensado-chapas.jpg'},{name:'Não estruturais',img:A+'veneer-textura.jpg'} ] },
  ];

  /* V1 · painéis expansíveis */
  function buildV1(mount){
    const panels = PRODUTOS.map(cat => {
      let lines='', last=null;
      cat.lines.forEach(l => {
        if (l.group && l.group !== last){ lines += `<li class="pv1-lgroup">${l.group}</li>`; last = l.group; }
        lines += `<li class="pv1-line"><span class="pv1-thumb" style="background-image:url('${l.img}')"></span><span class="pv1-lname">${l.name}</span></li>`;
      });
      return `<button class="pv1-panel" type="button" style="--bg:url('${cat.cover}')" aria-expanded="false">
        <span class="pv1-face"><span class="pv1-cue" aria-hidden="true">+</span><span class="pv1-num">${cat.num}</span><span class="pv1-pname">${cat.name}</span></span>
        <span class="pv1-open"><span class="pv1-open-head"><h3>${cat.name}</h3><p>${cat.desc}</p><span class="pv1-spec">${cat.spec}</span></span><ul class="pv1-lines">${lines}</ul></span>
      </button>`;
    }).join('');
    mount.innerHTML = `<div class="pv1-panels" role="tablist" aria-label="Categorias de produto">${panels}</div>
      <div class="container"><p class="pv1-hint" aria-hidden="true">Passe o mouse (ou toque) para abrir uma categoria</p></div>`;
    const wrap = mount.querySelector('.pv1-panels');
    wrap.querySelectorAll('.pv1-panel').forEach(panel => {
      panel.addEventListener('click', () => {
        const open = !panel.classList.contains('is-open');
        wrap.querySelectorAll('.pv1-panel').forEach(p => { p.classList.remove('is-open'); p.setAttribute('aria-expanded','false'); });
        if (open){ panel.classList.add('is-open'); panel.setAttribute('aria-expanded','true'); }
      });
    });
  }

  /* V2 · lista + palco */
  function buildV2(mount){
    mount.innerHTML = `<div class="pv2-split">
      <div class="pv2-cats" role="tablist" aria-label="Categorias de produto"></div>
      <div class="pv2-stage"><div class="pv2-stage-head"><h3 class="pv2-stitle"></h3><span class="pv2-sspec"></span></div><div class="pv2-grid"></div></div>
    </div>`;
    const cats = mount.querySelector('.pv2-cats'), grid = mount.querySelector('.pv2-grid');
    const stitle = mount.querySelector('.pv2-stitle'), sspec = mount.querySelector('.pv2-sspec');
    let active = -1;
    function render(cat){
      stitle.textContent = cat.name; sspec.textContent = cat.spec;
      let h='', last=null;
      cat.lines.forEach((l,i) => {
        if (l.group && l.group !== last){ h += `<div class="pv2-cgroup">${l.group}</div>`; last = l.group; }
        h += `<a class="pv2-card" href="#" style="animation-delay:${Math.min(i,10)*32}ms"><span class="pv2-cimg"><span style="background-image:url('${l.img}')"></span></span><span class="pv2-clabel">${l.name}</span></a>`;
      });
      grid.innerHTML = h;
    }
    function setActive(i){
      if (i === active) return; active = i;
      cats.querySelectorAll('.pv2-cat').forEach((c,j) => { c.classList.toggle('is-active', j===i); c.setAttribute('aria-selected', j===i?'true':'false'); });
      render(PRODUTOS[i]);
    }
    PRODUTOS.forEach((cat,idx) => {
      const b = document.createElement('button'); b.className='pv2-cat'; b.type='button'; b.setAttribute('role','tab');
      b.innerHTML = `<span class="pv2-cnum">${cat.num}</span><span class="pv2-cname">${cat.name}</span><span class="pv2-cdesc">${cat.desc}</span>`;
      b.addEventListener('mouseenter', () => setActive(idx));
      b.addEventListener('focus', () => setActive(idx));
      b.addEventListener('click', (e) => { e.preventDefault(); setActive(idx); });
      cats.appendChild(b);
    });
    setActive(0);
  }

  /* V3 · abas + filmstrip */
  function buildV3(mount){
    mount.innerHTML = `<div class="container"><div class="pv3-tabs" role="tablist" aria-label="Categorias de produto"><span class="pv3-ink" aria-hidden="true"></span></div>
      <div class="pv3-lead"><p class="pv3-ldesc"></p><span class="pv3-lspec"></span></div></div>
      <div class="pv3-strip" tabindex="0" aria-label="Linhas — arraste para explorar"></div>
      <div class="container pv3-foot"><span class="pv3-hint" aria-hidden="true">Arraste para explorar →</span></div>`;
    const tabsEl = mount.querySelector('.pv3-tabs'), ink = mount.querySelector('.pv3-ink'), strip = mount.querySelector('.pv3-strip');
    const ldesc = mount.querySelector('.pv3-ldesc'), lspec = mount.querySelector('.pv3-lspec');
    let active = -1;
    function moveInk(tab){ ink.style.left = tab.offsetLeft + 'px'; ink.style.width = tab.offsetWidth + 'px'; }
    function render(cat){
      let h='', last=null, i=0;
      cat.lines.forEach(l => {
        const g = (l.group && l.group !== last) ? `<span class="pv3-cgroup">${l.group}</span>` : '';
        if (l.group) last = l.group;
        h += `<a class="pv3-card" href="#" style="animation-delay:${Math.min(i,12)*30}ms"><span class="pv3-cimg"><span style="background-image:url('${l.img}')"></span></span><span class="pv3-clabel">${l.name}</span>${g}</a>`;
        i++;
      });
      strip.innerHTML = h; strip.scrollLeft = 0;
      if (!reduce){ strip.removeAttribute('data-anim'); void strip.offsetWidth; strip.setAttribute('data-anim',''); }
    }
    function setActive(idx){
      if (idx === active) return; active = idx;
      const tabs = tabsEl.querySelectorAll('.pv3-tab');
      tabs.forEach((t,i) => { t.classList.toggle('is-active', i===idx); t.setAttribute('aria-selected', i===idx?'true':'false'); });
      ldesc.style.opacity = 0;
      const cat = PRODUTOS[idx]; lspec.textContent = cat.spec;
      setTimeout(() => { ldesc.textContent = cat.desc; ldesc.style.opacity = 1; }, reduce ? 0 : 160);
      render(cat); moveInk(tabs[idx]);
    }
    PRODUTOS.forEach((cat,idx) => {
      const t = document.createElement('button'); t.className='pv3-tab'; t.type='button'; t.setAttribute('role','tab');
      t.innerHTML = `<span class="pv3-tname">${cat.name}</span>`;
      t.addEventListener('click', () => setActive(idx));
      t.addEventListener('mouseenter', () => setActive(idx));
      t.addEventListener('focus', () => setActive(idx));
      tabsEl.appendChild(t);
    });
    setActive(0);
    window.addEventListener('resize', () => { const a = tabsEl.querySelectorAll('.pv3-tab')[active]; if (a) moveInk(a); });
    // arrastar
    let down=false, sx=0, sl=0, moved=false;
    strip.addEventListener('pointerdown', e => { if (e.pointerType==='mouse' && e.button!==0) return; down=true; moved=false; sx=e.clientX; sl=strip.scrollLeft; strip.classList.add('is-drag'); strip.setPointerCapture(e.pointerId); });
    strip.addEventListener('pointermove', e => { if(!down) return; const dx=e.clientX-sx; if(Math.abs(dx)>4) moved=true; strip.scrollLeft = sl - dx; });
    const end = () => { down=false; strip.classList.remove('is-drag'); };
    strip.addEventListener('pointerup', end);
    strip.addEventListener('pointercancel', end);
    strip.addEventListener('click', e => { if (moved) e.preventDefault(); }, true);
  }

  /* Lançamentos 2026 — textura (padrão) → ambiente (hover) */
  const LANCAMENTOS = [
    { line:'Linha Madeiras do Mundo', lineEn:'Woods of the World', items:[
      { name:'Carvalho Nórdico', en:'Nordic Oak', tex:'Deep Wood',  swatch:A+'textura-tile-1.jpg', amb:A+'ambiente-minimal-branco.jpg' },
      { name:'Fresno Douro',     en:'Douro Ash',  tex:'Syncro Ash', swatch:A+'textura-tile-2.jpg', amb:A+'ambiente-tv-noz.jpg' },
    ]},
    { line:'Linha Colors', lineEn:'Colors', items:[
      { name:'Doce de Leite', en:'Dulce de Leche', tex:'Matt', color:'#ad8e6b', amb:A+'ambiente-living-claro.jpg' },
      { name:'Marrom Sépia',  en:'Sepia Brown',    tex:'Matt', color:'#3a2b27', amb:A+'ambiente-cozinha-escura.jpg' },
      { name:'Verde Oliva',   en:'Olive Green',    tex:'Matt', color:'#3f4a26', amb:A+'ambiente-quarto-verde.jpg' },
    ]},
  ];
  function buildLancamentos(mount){
    const flat = LANCAMENTOS.flatMap(g => g.items.map(it => ({ ...it, line: g.line.replace(/^Linha\s+/i, '') })));
    mount.innerHTML = '<div class="lanc-row">' + flat.map(it => {
      const bg = it.color ? `style="background:${it.color}"` : `style="background-image:url('${it.swatch}')"`;
      return `<article class="lanc-card" tabindex="0" aria-label="${it.name} — ${it.line}">
        <span class="lanc-media">
          <span class="lanc-sw" ${bg}></span>
          <span class="lanc-amb" style="background-image:url('${it.amb}')"></span>
        </span>
        <span class="lanc-name">${it.name}</span>
        <span class="lanc-line">${it.line}</span>
      </article>`;
    }).join('') + '</div>';

    const row = mount.querySelector('.lanc-row');
    const cards = Array.from(row.querySelectorAll('.lanc-card'));
    cards.forEach(c => c.addEventListener('click', () => c.classList.toggle('is-amb')));

    const section = mount.closest('.lancamentos');
    const ctrl = section && section.querySelector('[data-lanc-ctrl]');
    if (!ctrl || !cards.length) return;
    const aL = '<svg viewBox="0 0 24 24" class="ico"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>';
    const aR = '<svg viewBox="0 0 24 24" class="ico"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
    ctrl.innerHTML =
      '<span class="lanc-count"><b data-cur>01</b>/<span>' + String(cards.length).padStart(2, '0') + '</span></span>' +
      '<span class="lanc-track"><span class="lanc-thumb" data-thumb></span></span>' +
      '<span class="lanc-arrows"><button class="lanc-arrow" type="button" data-prev aria-label="Lançamentos anteriores">' + aL + '</button>' +
      '<button class="lanc-arrow" type="button" data-next aria-label="Próximos lançamentos">' + aR + '</button></span>';
    const cur = ctrl.querySelector('[data-cur]');
    const thumb = ctrl.querySelector('[data-thumb]');
    const prev = ctrl.querySelector('[data-prev]');
    const next = ctrl.querySelector('[data-next]');
    const step = () => (cards[0] ? cards[0].getBoundingClientRect().width + 8 : 260);
    const update = () => {
      const max = row.scrollWidth - row.clientWidth;
      const sl = row.scrollLeft;
      const wpct = Math.max(14, Math.min(100, (row.clientWidth / row.scrollWidth) * 100));
      thumb.style.width = wpct + '%';
      thumb.style.left = (max > 1 ? (sl / max) * (100 - wpct) : 0) + '%';
      cur.textContent = String(Math.min(cards.length, Math.round(sl / step()) + 1)).padStart(2, '0');
      prev.disabled = sl <= 2;
      next.disabled = sl >= max - 2;
    };
    prev.addEventListener('click', () => row.scrollBy({ left: -step(), behavior: reduce ? 'auto' : 'smooth' }));
    next.addEventListener('click', () => row.scrollBy({ left: step(), behavior: reduce ? 'auto' : 'smooth' }));
    row.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* PRODUTOS · painéis expansíveis (Figma 6262-386) */
  function buildPanels(mount) {
    const arrow = '<svg viewBox="0 0 24 24" class="ico"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
    mount.innerHTML = '<div class="panels">' + PRODUTOS.map((cat, i) => {
      const lines = cat.lines.map(l =>
        '<li><a class="panel__line" href="#"><span class="panel__thumb"><img src="' + l.img + '" alt="" loading="lazy" decoding="async" /></span><span class="panel__lname">' + l.name + '</span></a></li>'
      ).join('');
      return '<section class="panel" data-i="' + i + '" style="--cover:url(\'' + cat.cover + '\')">' +
        '<span class="panel__media" aria-hidden="true"></span>' +
        '<span class="panel__scrim" aria-hidden="true"></span>' +
        '<button class="panel__toggle" type="button" aria-expanded="false" aria-label="Abrir ' + cat.name + '"></button>' +
        '<div class="panel__label">' +
          '<span class="panel__num">' + cat.num + '</span>' +
          '<span class="panel__title">' + cat.name + '</span>' +
          '<span class="panel__sub">' + cat.sub + '</span>' +
        '</div>' +
        '<div class="panel__open">' +
          '<div class="panel__open-head">' +
            '<span class="panel__head-text"><span class="panel__num">' + cat.num + '</span><span class="panel__title">' + cat.name + '</span><span class="panel__sub">' + cat.sub + '</span></span>' +
            '<a class="panel__all" href="#">Ver todos ' + arrow + '</a>' +
          '</div>' +
          '<ul class="panel__grid">' + lines + '</ul>' +
        '</div>' +
      '</section>';
    }).join('') + '</div>';

    const wrap = mount.querySelector('.panels');
    const panels = Array.from(wrap.querySelectorAll('.panel'));
    const setExpanded = (p, on) => { const t = p.querySelector('.panel__toggle'); if (t) t.setAttribute('aria-expanded', String(on)); };
    const open = (i) => {
      wrap.classList.add('has-open');
      panels.forEach((p, j) => { const on = j === i; p.classList.toggle('is-open', on); setExpanded(p, on); });
    };
    const closeAll = () => {
      wrap.classList.remove('has-open');
      panels.forEach(p => { p.classList.remove('is-open'); setExpanded(p, false); });
    };
    const hoverable = matchMedia('(hover: hover) and (pointer: fine)').matches;
    panels.forEach((p, i) => {
      p.querySelector('.panel__toggle').addEventListener('click', () => {
        if (p.classList.contains('is-open')) closeAll(); else open(i);
      });
      if (hoverable) p.addEventListener('mouseenter', () => open(i));
    });
    if (hoverable) wrap.addEventListener('mouseleave', closeAll);
  }

  const builders = { panels: buildPanels, v1: buildV1, v2: buildV2, v3: buildV3, lanc: buildLancamentos };
  document.querySelectorAll('[data-prod]').forEach(mount => {
    const fn = builders[mount.getAttribute('data-prod')];
    if (fn) fn(mount);
  });

  /* ░░ Newsletter — assinatura (protótipo) ░░ */
  const newsForm = document.querySelector('.news__form');
  if (newsForm) {
    newsForm.addEventListener('submit', e => {
      e.preventDefault();
      const email = newsForm.querySelector('input[type="email"]');
      if (email && (!email.value || !email.checkValidity())) { email.focus(); return; }
      newsForm.querySelectorAll('.news__input, .news__btn').forEach(el => { el.hidden = true; });
      const thanks = newsForm.querySelector('.news__thanks');
      if (thanks) { thanks.hidden = false; thanks.focus && thanks.focus(); }
    });
  }
})();

/* ░░ Quem somos — carrossel 1/5 (Figma 6070-8) ░░ */
(function () {
  'use strict';
  const root = document.querySelector('[data-about-carousel]');
  if (!root) return;
  const slides = Array.from(root.querySelectorAll('.about__slide'));
  if (slides.length < 2) return;
  const section = root.closest('.about');
  const cur = section && section.querySelector('[data-about-cur]');
  const prev = section && section.querySelector('[data-about-prev]');
  const next = section && section.querySelector('[data-about-next]');
  let i = 0;
  const go = (n) => {
    slides[i].classList.remove('is-active');
    i = (n + slides.length) % slides.length;
    slides[i].classList.add('is-active');
    if (cur) cur.textContent = String(i + 1);
  };
  if (prev) prev.addEventListener('click', () => go(i - 1));
  if (next) next.addEventListener('click', () => go(i + 1));
})();
