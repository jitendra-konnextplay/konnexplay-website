/**
 * Analytics loader.
 *
 * The site had no measurement of any kind, so nobody could tell which sport
 * or city page actually brings venue owners in. Without that, every decision
 * about the site is a guess.
 *
 * This stays inert until an ID is set in the admin panel. Nothing is loaded,
 * no cookie is set, and no request leaves the page before then.
 *
 * Two providers are supported:
 *   plausible  - no cookies, no consent banner needed, privacy friendly
 *   ga4        - Google Analytics 4, the familiar option
 *
 * Beyond page views it records the things that matter commercially: a demo
 * form submitted, a call button pressed, WhatsApp opened. Those are the
 * numbers worth looking at, not raw visits.
 */
(function () {
  'use strict';

  var cfg = window.KX_ANALYTICS || {};
  var provider = (cfg.provider || '').toLowerCase();
  var id = (cfg.id || '').trim();
  if (!provider || !id) return;

  var track = function () {};

  function loadPlausible() {
    var s = document.createElement('script');
    s.defer = true;
    s.setAttribute('data-domain', id);
    s.src = 'https://plausible.io/js/script.hash.outbound-links.js';
    document.head.appendChild(s);
    window.plausible =
      window.plausible ||
      function () {
        (window.plausible.q = window.plausible.q || []).push(arguments);
      };
    track = function (name, props) {
      try { window.plausible(name, props ? { props: props } : undefined); } catch (e) {}
    };
  }

  function loadGa4() {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    // The site is one document with hash routes, so page views are sent by hand.
    gtag('config', id, { send_page_view: false });
    track = function (name, props) {
      try { gtag('event', name, props || {}); } catch (e) {}
    };
  }

  if (provider === 'plausible') loadPlausible();
  else if (provider === 'ga4') loadGa4();
  else return;

  /* ---- page views across routes ---- */

  var lastPath = null;
  function pageview() {
    var path = location.pathname === '/' ? '/home' : location.pathname;
    if (path === lastPath) return;
    lastPath = path;
    if (provider === 'ga4') {
      track('page_view', {
        page_location: location.href,
        page_path: path,
        page_title: document.title
      });
    }
    // Plausible reads the URL itself via script.hash.js.
  }
  pageview();
  window.addEventListener('popstate', function () { setTimeout(pageview, 250); });

  /* ---- the events that actually mean money ---- */

  function label(el) {
    var t = (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40);
    return t || el.getAttribute('aria-label') || 'unlabelled';
  }

  document.addEventListener(
    'click',
    function (e) {
      var a = e.target && e.target.closest ? e.target.closest('a,button') : null;
      if (!a) return;
      var href = (a.getAttribute('href') || '').toLowerCase();
      var where = a.closest('#kx-actionbar') ? 'action-bar' : 'page';

      if (href.indexOf('tel:') === 0) track('Call clicked', { where: where });
      else if (href.indexOf('wa.me') !== -1) track('WhatsApp clicked', { where: where });
      else if (href.indexOf('mailto:') === 0) track('Email clicked', { where: where });
      else if (href.indexOf('/demo') !== -1 || href.indexOf('/book-a-demo') !== -1)
        track('Demo CTA clicked', { where: where, label: label(a) });
      else if (href.indexOf('.dc.html') !== -1 && /film|story/i.test(href))
        track('Film opened', { label: label(a) });
    },
    true
  );

  // The demo form is the conversion. Count a real submission, not a click.
  document.addEventListener(
    'submit',
    function (e) {
      var f = e.target;
      if (!f || f.tagName !== 'FORM') return;
      if (!f.querySelector('input')) return;
      track('Demo request submitted', { page: location.pathname === '/' ? '/home' : location.pathname });
    },
    true
  );

  // Someone who reaches the bottom of a long page is genuinely reading it.
  var deep = false;
  window.addEventListener(
    'scroll',
    function () {
      if (deep) return;
      var h = document.documentElement;
      if (h.scrollHeight <= h.clientHeight + 200) return;
      var pct = (window.scrollY + h.clientHeight) / h.scrollHeight;
      if (pct >= 0.9) {
        deep = true;
        track('Read to the end', { page: location.pathname === '/' ? '/home' : location.pathname });
      }
    },
    { passive: true }
  );
})();
