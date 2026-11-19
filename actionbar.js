/**
 * Sticky action bar for phones.
 *
 * A venue owner reading the pricing page on a phone had to scroll to the
 * footer, or back up to the header, to reach you. Every extra step loses
 * people. This keeps Call, WhatsApp and Book a demo one thumb away on any
 * page, at any scroll position.
 *
 * It uses the same number and text as the rest of the site, and reads them
 * from the live page so the admin panel's changes flow through here too.
 *
 * Hidden on desktop, where the header already carries the demo button.
 */
(function () {
  'use strict';

  var DEFAULT_DIGITS = '917778858901';
  var DEFAULT_DISPLAY = '+91 77788 58901';

  function currentNumber() {
    // content-apply.js may have swapped the number; read what the page shows.
    try {
      var tel = document.querySelector('a[href^="tel:"]');
      if (tel) {
        var d = (tel.getAttribute('href') || '').replace(/\D/g, '');
        if (d.length >= 10) return d;
      }
      var wa = document.querySelector('a[href*="wa.me/"]');
      if (wa) {
        var m = (wa.getAttribute('href') || '').match(/wa\.me\/(\d+)/);
        if (m) return m[1];
      }
    } catch (e) {}
    return DEFAULT_DIGITS;
  }

  var ICON = {
    phone:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    whatsapp:
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91C21.95 6.45 17.5 2 12.04 2zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.23 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.47c-.17 0-.43.06-.66.31-.22.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.14-1.18-.06-.11-.22-.17-.47-.29z"/></svg>',
    calendar:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>'
  };

  function build() {
    if (document.getElementById('kx-actionbar')) return;
    var digits = currentNumber();
    /* This used to search document.body.innerText for the number. Reading the
       whole document's text forces a full layout and text pass, one of the
       most expensive things you can ask a browser for, and it happened during
       the load. The digits were already resolved on the line above; the
       readable form is just those digits spaced out, and it is only ever used
       for the Call link's aria-label. */
    var display = DEFAULT_DISPLAY;
    if (digits && digits.length === 12 && digits.indexOf('91') === 0) {
      display = '+91 ' + digits.slice(2, 7) + ' ' + digits.slice(7);
    }

    var bar = document.createElement('nav');
    bar.id = 'kx-actionbar';
    bar.setAttribute('aria-label', 'Contact KonnexPlay');
    bar.innerHTML =
      '<a href="tel:+' + digits + '" aria-label="Call KonnexPlay on ' + display + '">' + ICON.phone + 'Call</a>' +
      '<a href="https://wa.me/' + digits + '?text=' +
        encodeURIComponent('Hi, I run a venue and want to know about KonnexPlay.') +
        '" target="_blank" rel="noopener" aria-label="Message KonnexPlay on WhatsApp">' + ICON.whatsapp + 'WhatsApp</a>' +
      '<a class="kx-primary" href="/demo" aria-label="Book a 20-minute demo">' + ICON.calendar + 'Book a demo</a>';

    document.body.appendChild(bar);

    /* Offering "Book a demo" on the demo page is a button back to where you
       already are. Track the route and let Call and WhatsApp share the bar. */
    var markRoute = function () {
      var onDemo = location.pathname.indexOf('/demo') === 0;
      bar.classList.toggle('kx-on-demo', onDemo);
    };
    markRoute();
    window.addEventListener('popstate', markRoute);

    // Keep the number in step if the admin panel changes it.
    if (window.MutationObserver) {
      var sync = function () {
        var d = currentNumber();
        var call = bar.querySelector('a[href^="tel:"]');
        var wa = bar.querySelector('a[href*="wa.me/"]');
        if (call && call.getAttribute('href') !== 'tel:+' + d) call.setAttribute('href', 'tel:+' + d);
        if (wa) {
          var href = wa.getAttribute('href') || '';
          var next = href.replace(/wa\.me\/\d+/, 'wa.me/' + d);
          if (next !== href) wa.setAttribute('href', next);
        }
      };
      var t = null;
      new MutationObserver(function () {
        clearTimeout(t);
        t = setTimeout(sync, 600);
      }).observe(document.documentElement, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(build, 1200); });
  } else {
    setTimeout(build, 1200);
  }
})();
