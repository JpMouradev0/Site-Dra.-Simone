/* ===================================================
   INSTITUTO SIMONE GUIMARÃES - JavaScript
   Funcionalidades: Navbar scroll, Mobile menu,
   Carrossel de depoimentos, Scroll reveal,
   Back to top, Ano atual, Formulário
   =================================================== */

(function () {
  'use strict';

  // ── Ano atual no rodapé ──────────────────────────
  var yearEl = document.getElementById('currentYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ── NAVBAR scroll behavior ───────────────────────
  var navbar = document.getElementById('navbar');

  function handleNavbarScroll() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll();

  // ── Smooth scroll para âncoras da nav ────────────
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (href === '#') return;
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      var offset = 88;
      var top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: top, behavior: 'smooth' });

      // Fecha menu mobile se estiver aberto
      var navLinks = document.getElementById('navLinks');
      var navToggle = document.getElementById('navToggle');
      if (navLinks && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Abrir menu');
        document.body.style.overflow = '';
      }
    });
  });

  // ── Mobile menu toggle ───────────────────────────
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var isOpen = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
      document.body.style.overflow = isOpen ? 'hidden' : '';

      // Animate hamburger → X
      var spans = navToggle.querySelectorAll('span');
      if (isOpen) {
        spans[0].style.cssText = 'transform: translateY(7px) rotate(45deg)';
        spans[1].style.cssText = 'opacity: 0; transform: scaleX(0)';
        spans[2].style.cssText = 'transform: translateY(-7px) rotate(-45deg)';
      } else {
        spans.forEach(function (s) { s.style.cssText = ''; });
      }
    });

    // Fecha menu com Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Abrir menu');
        document.body.style.overflow = '';
        var spans = navToggle.querySelectorAll('span');
        spans.forEach(function (s) { s.style.cssText = ''; });
        navToggle.focus();
      }
    });
  }

  // ── Carrossel de Depoimentos ─────────────────────
  var track = document.getElementById('depoimentosTrack');
  var prevBtn = document.getElementById('prevBtn');
  var nextBtn = document.getElementById('nextBtn');
  var dotsContainer = document.getElementById('carouselDots');

  if (track && prevBtn && nextBtn && dotsContainer) {
    var cards = track.querySelectorAll('.depoimento-card');
    var total = cards.length;
    var current = 0;
    var autoInterval = null;

    // Cria dots
    cards.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', 'Depoimento ' + (i + 1));
      dot.setAttribute('aria-selected', String(i === 0));
      dot.dataset.index = i;
      dot.addEventListener('click', function () { goTo(parseInt(this.dataset.index)); });
      dotsContainer.appendChild(dot);
    });

    function goTo(index) {
      current = (index + total) % total;
      track.style.transform = 'translateX(-' + (current * 100) + '%)';
      dotsContainer.querySelectorAll('.carousel-dot').forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
        dot.setAttribute('aria-selected', String(i === current));
      });
    }

    prevBtn.addEventListener('click', function () { goTo(current - 1); resetAuto(); });
    nextBtn.addEventListener('click', function () { goTo(current + 1); resetAuto(); });

    // Auto-advance
    function startAuto() {
      autoInterval = setInterval(function () { goTo(current + 1); }, 5000);
    }
    function resetAuto() {
      clearInterval(autoInterval);
      startAuto();
    }
    startAuto();

    // Touch/Swipe support
    var touchStartX = 0;
    var touchEndX = 0;
    track.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    track.addEventListener('touchend', function (e) {
      touchEndX = e.changedTouches[0].screenX;
      var diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) { goTo(current + 1); } else { goTo(current - 1); }
        resetAuto();
      }
    }, { passive: true });

    // Keyboard navigation
    track.parentElement.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { goTo(current - 1); resetAuto(); }
      if (e.key === 'ArrowRight') { goTo(current + 1); resetAuto(); }
    });
  }

  // ── Scroll Reveal (Intersection Observer) ────────
  var revealEls = document.querySelectorAll(
    '.servico-card, .diferencial-card, .qualificacao-item, .stat-card, .sobre-grid, .footer-brand, .footer-links, .footer-contato'
  );

  revealEls.forEach(function (el) { el.classList.add('scroll-reveal'); });

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(function (el) { observer.observe(el); });

  // Stagger animation for grids
  document.querySelectorAll('.servicos-grid, .diferenciais-grid, .qualificacoes-grid').forEach(function (grid) {
    Array.from(grid.children).forEach(function (child, i) {
      child.style.transitionDelay = (i * 80) + 'ms';
    });
  });

  // ── Back to Top Button ───────────────────────────
  var backToTop = document.getElementById('backToTop');

  if (backToTop) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 400) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }, { passive: true });

    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── Active Nav Link Highlight (Scroll Spy) ───────
  var sections = document.querySelectorAll('section[id], footer[id]');
  var navLinkEls = document.querySelectorAll('.nav-link');

  function updateActiveLink() {
    var active = '';
    sections.forEach(function (section) {
      var top = section.getBoundingClientRect().top;
      if (top <= 120) { active = section.id; }
    });
    navLinkEls.forEach(function (link) {
      var href = link.getAttribute('href').replace('#', '');
      link.style.color = href === active ? 'var(--gold-light)' : '';
    });
  }
  window.addEventListener('scroll', updateActiveLink, { passive: true });

  // ── Hero background subtle parallax ─────────────
  var hero = document.getElementById('hero');
  if (hero) {
    window.addEventListener('scroll', function () {
      var scrolled = window.scrollY;
      if (scrolled < window.innerHeight) {
        hero.style.backgroundPositionY = (scrolled * 0.3) + 'px';
      }
    }, { passive: true });
  }

  // ── Formulário de Agendamento ───────────────────
  var ctaForm = document.getElementById('ctaForm');
  var ctaSubmitBtn = document.getElementById('ctaSubmitBtn');
  var ctaFormSuccess = document.getElementById('ctaFormSuccess');

  if (ctaForm && ctaSubmitBtn && ctaFormSuccess) {
    // Máscara de telefone
    var phoneInput = document.getElementById('ctaPhone');
    if (phoneInput) {
      phoneInput.addEventListener('input', function (e) {
        var value = e.target.value.replace(/\D/g, '');
        if (value.length <= 11) {
          if (value.length > 6) {
            value = '(' + value.slice(0, 2) + ') ' + value.slice(2, 7) + '-' + value.slice(7);
          } else if (value.length > 2) {
            value = '(' + value.slice(0, 2) + ') ' + value.slice(2);
          } else if (value.length > 0) {
            value = '(' + value;
          }
        }
        e.target.value = value;
      });
    }

    ctaForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = document.getElementById('ctaName').value.trim();
      var phone = document.getElementById('ctaPhone').value.trim();
      var email = document.getElementById('ctaEmail').value.trim();
      var service = document.getElementById('ctaService').value;
      var message = document.getElementById('ctaMessage').value.trim();

      if (!name || !phone) {
        // Shake effect on button
        ctaSubmitBtn.style.animation = 'shake 0.5s ease';
        setTimeout(function () { ctaSubmitBtn.style.animation = ''; }, 500);
        return;
      }

      // Build WhatsApp message
      var serviceNames = {
        'avaliacao': 'Avaliação Neuropsicológica',
        'tdah': 'TDAH & Autismo (ABA)',
        'vr': 'Avaliação com Realidade Virtual',
        'tcc': 'Terapia Cognitivo-Comportamental',
        'infantil': 'Psicologia Infantil',
        'outro': 'Outro serviço'
      };

      var whatsappMsg = 'Olá, Dra. Simone! Gostaria de agendar uma consulta.\n\n';
      whatsappMsg += '*Nome:* ' + name + '\n';
      whatsappMsg += '*Telefone:* ' + phone + '\n';
      if (email) whatsappMsg += '*E-mail:* ' + email + '\n';
      if (service) whatsappMsg += '*Serviço:* ' + (serviceNames[service] || service) + '\n';
      if (message) whatsappMsg += '*Mensagem:* ' + message + '\n';

      var encodedMsg = encodeURIComponent(whatsappMsg);
      var whatsappUrl = 'https://wa.me/5571992557562?text=' + encodedMsg;

      // Show success state
      ctaForm.style.display = 'none';
      ctaFormSuccess.style.display = 'block';

      // Open WhatsApp after short delay
      setTimeout(function () {
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      }, 800);

      // Reset form after 5 seconds
      setTimeout(function () {
        ctaForm.reset();
        ctaForm.style.display = '';
        ctaFormSuccess.style.display = 'none';
      }, 5000);
    });
  }

  // ── Preload critical images on hover ─────────────
  var navLogo = document.querySelector('.nav-logo');
  if (navLogo) {
    navLogo.addEventListener('mouseenter', function () {
      var img = new Image();
      img.src = 'assets/foto-dra-simone.jpg';
    });
  }

  console.log('Instituto Simone Guimarães - Site carregado com sucesso!');
})();
