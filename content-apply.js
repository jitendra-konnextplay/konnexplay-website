/**
 * Applies content.json to the rendered site.
 *
 * The pages were built as a design build, with the phone number, email and
 * prices written directly into the markup in dozens of places. Rather than
 * rewrite all of that, this reads content.json and substitutes each value
 * wherever its default appears: in visible text, in tel: and mailto: and
 * wa.me links, and in anything the runtime renders later.
 *
 * Two directions matter:
 *   - nodes the runtime adds later still carry the authored defaults, so they
 *     are swapped default -> current;
 *   - when the admin panel previews an edit, the document already shows the
 *     current values, so it is swapped current -> next.
 * Keeping both makes the substitution reversible, so undo in the panel
 * genuinely puts the old text back.
 *
 * If content.json is missing or unreadable the site renders exactly as
 * authored.
 */
(function () {
  'use strict';

  // What the pages say as authored.
  var DEFAULTS = {
    phoneDisplay: '+91 77788 58901',
    phoneDigits: '917778858901',
    email: 'hello@konnexplay.com',
    starter: '12,000',
    pro: '18,000',
    setupWaived: '5,000',
    instagram: 'https://www.instagram.com/konnex_play/',
    address: '57-58, Shiva Park Society, Adajan, Surat 395009, Gujarat'
  };

  // What the document currently shows. Starts at the authored defaults.
  var current = {};
  Object.keys(DEFAULTS).forEach(function (k) { current[k] = DEFAULTS[k]; });

  var TEXT_KEYS = ['phoneDisplay', 'email', 'address', 'starter', 'pro', 'setupWaived'];
  var ATTR_KEYS = ['phoneDigits', 'email', 'instagram', 'phoneDisplay'];
  var ATTRS = ['href', 'content', 'aria-label', 'title', 'alt'];

  function flatten(c) {
    c = c || {};
    var contact = c.contact || {};
    var pricing = c.pricing || {};
    var company = c.company || {};
    var out = {};
    Object.keys(DEFAULTS).forEach(function (k) { out[k] = DEFAULTS[k]; });
    if (contact.phoneDisplay) out.phoneDisplay = contact.phoneDisplay;
    if (contact.phoneDigits) out.phoneDigits = contact.phoneDigits;
    if (contact.email) out.email = contact.email;
    if (contact.instagram) out.instagram = contact.instagram;
    if (pricing.starter) out.starter = pricing.starter;
    if (pricing.pro) out.pro = pricing.pro;
    if (pricing.setupWaived) out.setupWaived = pricing.setupWaived;
    if (company.address) out.address = company.address;
    return out;
  }

  function pairsBetween(from, to, keys) {
    var pairs = [];
    keys.forEach(function (k) {
      if (from[k] && to[k] && from[k] !== to[k]) pairs.push([from[k], to[k]]);
    });
    // tel: links carry the number without spaces.
    if (from.phoneDisplay !== to.phoneDisplay) {
      var a = from.phoneDisplay.replace(/\s/g, '');
      var b = to.phoneDisplay.replace(/\s/g, '');
      if (a !== b) pairs.push([a, b]);
    }
    // Longest first, so a shorter value never eats part of a longer one.
    return pairs.sort(function (x, y) { return y[0].length - x[0].length; });
  }

  function swapText(node, pairs) {
    var v = node.nodeValue;
    if (!v || v.length > 20000) return;
    var out = v;
    for (var i = 0; i < pairs.length; i++) {
      if (out.indexOf(pairs[i][0]) !== -1) out = out.split(pairs[i][0]).join(pairs[i][1]);
    }
    if (out !== v) node.nodeValue = out;
  }

  function swapAttrs(el, pairs) {
    if (!el || !el.getAttribute) return;
    for (var a = 0; a < ATTRS.length; a++) {
      var raw = el.getAttribute(ATTRS[a]);
      if (!raw) continue;
      var out = raw;
      for (var i = 0; i < pairs.length; i++) {
        if (out.indexOf(pairs[i][0]) !== -1) out = out.split(pairs[i][0]).join(pairs[i][1]);
      }
      if (out !== raw) el.setAttribute(ATTRS[a], out);
    }
  }

  function sweep(root, textPairs, attrPairs) {
    if (!root) return;
    if (!textPairs.length && !attrPairs.length) return;

    if (root.nodeType === 3) { swapText(root, textPairs); return; }
    if (root.nodeType !== 1 && root.nodeType !== 9 && root.nodeType !== 11) return;

    if (textPairs.length && document.createTreeWalker) {
      var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
      var batch = [];
      var n;
      while ((n = walker.nextNode())) {
        var p = n.parentNode;
        if (p && (p.nodeName === 'SCRIPT' || p.nodeName === 'STYLE')) continue;
        batch.push(n);
      }
      for (var i = 0; i < batch.length; i++) swapText(batch[i], textPairs);
    }
    if (attrPairs.length) {
      if (root.nodeType === 1) swapAttrs(root, attrPairs);
      if (root.querySelectorAll) {
        var els = root.querySelectorAll('[href],[content],[aria-label],[title],[alt]');
        for (var j = 0; j < els.length; j++) swapAttrs(els[j], attrPairs);
      }
    }
  }

  /** Bring the whole document from `current` to `next`. */
  function moveTo(next) {
    var t = pairsBetween(current, next, TEXT_KEYS);
    var a = pairsBetween(current, next, ATTR_KEYS);
    if (t.length || a.length) sweep(document.body || document.documentElement, t, a);
    current = next;
  }

  /** Nodes the runtime just added still carry the authored defaults. */
  function normaliseNew(node) {
    var t = pairsBetween(DEFAULTS, current, TEXT_KEYS);
    var a = pairsBetween(DEFAULTS, current, ATTR_KEYS);
    if (t.length || a.length) sweep(node, t, a);
  }

  /* Raw HTML from content.json's SEO fields (verification meta tags, a GTM
     snippet, a GTM noscript fallback, JSON-LD). <script> tags inserted via
     innerHTML never run, so each child is walked and, if it is a <script>,
     rebuilt as a real element. Nodes from the previous call are removed
     first so editing a field in the admin preview replaces rather than
     stacks them. */
  var injectedHead = [];
  var injectedBody = [];
  function inject(html, container, prepend, tracker) {
    tracker.forEach(function (n) { try { n.remove(); } catch (e) {} });
    tracker.length = 0;
    if (!html) return;
    var tmp = document.createElement('template');
    tmp.innerHTML = html;
    var kids = Array.prototype.slice.call(tmp.content.childNodes);
    if (prepend) kids.reverse();
    kids.forEach(function (node) {
      if (node.nodeType !== 1) return; // skip stray text/comments
      var el;
      if (node.tagName === 'SCRIPT') {
        el = document.createElement('script');
        for (var i = 0; i < node.attributes.length; i++) el.setAttribute(node.attributes[i].name, node.attributes[i].value);
        el.text = node.textContent;
      } else {
        el = node.cloneNode(true);
      }
      if (prepend) container.insertBefore(el, container.firstChild);
      else container.appendChild(el);
      tracker.push(el);
    });
  }
  var orgJsonLdEl = null;
  function applyOrgJsonLd(json) {
    if (!json) { if (orgJsonLdEl) { orgJsonLdEl.remove(); orgJsonLdEl = null; } return; }
    if (!orgJsonLdEl) {
      orgJsonLdEl = document.createElement('script');
      orgJsonLdEl.type = 'application/ld+json';
      orgJsonLdEl.id = 'kx-org-jsonld';
      document.head.appendChild(orgJsonLdEl);
    }
    orgJsonLdEl.textContent = json;
  }

  function applyConfig(c) {
    /* An empty string is still a string. Testing the type alone meant a blank
       endpoint in content.json wiped whatever config.js had set, on every page
       load, and the owner was left thinking the Apps Script was broken. Only a
       real value may replace what is already there. */
    if (c && c.leads && c.leads.endpoint) {
      window.KX_LEAD_ENDPOINT = c.leads.endpoint;
    }
    if (c && c.zoho) { window.KX_ZOHO = c.zoho; }
    window.KX_SEO = (c && c.seo) || {};
    inject(window.KX_SEO.headScripts || '', document.head, false, injectedHead);
    inject(window.KX_SEO.bodyScripts || '', document.body, true, injectedBody);
    applyOrgJsonLd(window.KX_SEO.organizationJsonLd || '');
    if (c && c.analytics && c.analytics.provider && c.analytics.id) {
      window.KX_ANALYTICS = c.analytics;
      if (!document.getElementById('kx-analytics')) {
        var sc = document.createElement('script');
        sc.id = 'kx-analytics';
        sc.src = 'analytics.js';
        document.head.appendChild(sc);
      }
    }
    moveTo(flatten(c));
  }

  // Watch for pages the runtime renders after load.
  if (window.MutationObserver) {
    var pending = [];
    var scheduled = false;
    var obs = new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) {
        var added = muts[i].addedNodes;
        for (var j = 0; j < added.length; j++) {
          if (added[j].nodeType === 1 || added[j].nodeType === 3) pending.push(added[j]);
        }
      }
      if (scheduled || !pending.length) return;
      scheduled = true;
      var run = function () {
        var batch = pending.slice();
        pending.length = 0;
        scheduled = false;
        obs.disconnect();
        for (var k = 0; k < batch.length; k++) {
          try { normaliseNew(batch[k]); } catch (e) {}
        }
        obs.observe(document.documentElement, { childList: true, subtree: true });
      };
      if (window.requestAnimationFrame) requestAnimationFrame(run); else setTimeout(run, 16);
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
  }

  // The admin panel previews unsaved edits by posting them in.
  window.addEventListener('message', function (e) {
    if (!e.data || e.data.type !== 'kx-preview-content') return;
    try { applyConfig(e.data.content); } catch (err) {}
    // Per-page title/description/slug/JSON-LD only get (re)computed when the
    // router recomputes its SEO tags. A real route change already does
    // that; this asks for the same recompute without navigating anywhere,
    // so editing one of those fields shows up without touching scroll
    // position (popstate would reset it, which a route change should but a
    // field edit should not).
    try { window.dispatchEvent(new Event('kx-seo-refresh')); } catch (err) {}
  });

  // The router (index.html) waits briefly on this before its first render,
  // so a URL naming a page by its admin-configured slug resolves correctly
  // from the start rather than needing a second pass once this lands.
  window.KX_SEO_READY = fetch('content.json', { cache: 'no-store' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (c) { if (c) applyConfig(c); return c; })
    .catch(function () { return null; });
})();
