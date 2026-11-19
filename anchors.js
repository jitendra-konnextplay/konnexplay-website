/**
 * In-page anchors, e.g. the Platform page's jump list ("Venue management",
 * "Booking engine", "Channel manager"), written as plain anchors like
 * #venue-management.
 *
 * This intercepts those links and, when a matching element exists on the
 * page, scrolls to it with the fixed header's height accounted for.
 */
(function () {
  'use strict';

  /* The header is fixed, so stopping exactly at the element hides its heading
     behind it. Measure the header rather than guessing. */
  function headerOffset() {
    try {
      var h = document.querySelector('header');
      if (!h) return 16;
      var pos = getComputedStyle(h).position;
      if (pos !== 'fixed' && pos !== 'sticky') return 16;
      return Math.round(h.getBoundingClientRect().height) + 16;
    } catch (e) {
      return 90;
    }
  }

  function scrollToId(id) {
    var el = document.getElementById(id);
    if (!el) return false;
    var top = el.getBoundingClientRect().top + window.pageYOffset - headerOffset();
    try {
      window.scrollTo({ top: top, behavior: 'smooth' });
    } catch (e) {
      window.scrollTo(0, top);
    }
    // Keep keyboard focus with the eye.
    try {
      var prev = el.getAttribute('tabindex');
      if (prev === null) el.setAttribute('tabindex', '-1');
      el.focus({ preventScroll: true });
      if (prev === null) {
        el.addEventListener('blur', function once() {
          el.removeAttribute('tabindex');
          el.removeEventListener('blur', once);
        });
      }
    } catch (e) {}
    return true;
  }

  document.addEventListener(
    'click',
    function (e) {
      var a = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
      if (!a) return;
      var href = a.getAttribute('href') || '';
      if (href === '#') return;
      var id = href.slice(1);
      if (!id) return;
      if (!document.getElementById(id)) return; // not on this page: let it be
      e.preventDefault();
      scrollToId(id);
    },
    true
  );
})();
