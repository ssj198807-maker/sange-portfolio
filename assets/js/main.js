/* =================================================================
   三哥个人网站 · 共享交互
   - Sticky nav
   - Scroll reveal
   - Copy to clipboard
   - Smooth scroll anchors
   ================================================================= */
(function () {
  'use strict';

  // ---- Sticky nav ----
  var nav = document.querySelector('.topnav');
  if (nav) {
    var onScroll = function () {
      if (window.scrollY > 80) nav.classList.add('is-stuck');
      else nav.classList.remove('is-stuck');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ---- Active link highlighting (基于当前 URL) ----
  var path = location.pathname.replace(/\/$/, '').split('/').pop() || 'index.html';
  document.querySelectorAll('.topnav__links a[href]').forEach(function (a) {
    var href = a.getAttribute('href');
    if (!href) return;
    if (href === path || (path === 'index.html' && href === 'index.html') ||
        (path === '' && href === 'index.html') ||
        (href === './' && (path === '' || path === 'index.html'))) {
      a.classList.add('is-current');
    }
  });

  // ---- Scroll reveal (一次性) ----
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var targets = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    targets.forEach(function (el) { io.observe(el); });
  }

  // ---- Copy to clipboard + toast ----
  var toast = document.getElementById('site-toast');
  var toastMsg = document.getElementById('toast-msg');
  var toastTimer = null;
  function showToast(text) {
    if (!toast) return;
    toastMsg.textContent = text;
    toast.classList.add('is-visible');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('is-visible');
    }, 2400);
  }
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
      resolve();
    });
  }
  document.addEventListener('click', function (event) {
    var target = event.target.closest('[data-copy]');
    if (!target) return;
    event.preventDefault();
    var text = target.getAttribute('data-copy') || '';
    var name = target.getAttribute('data-copy-name') || '内容';
    copyText(text).then(function () {
      showToast('已复制' + name + ': ' + text);
    });
  });

  // ---- Smooth scroll for in-page anchors ----
  document.addEventListener('click', function (event) {
    var a = event.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href');
    if (id.length < 2) return;
    var el = document.querySelector(id);
    if (!el) return;
    event.preventDefault();
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  });
})();
