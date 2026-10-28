/**
 * Click-to-edit for the whole site.
 *
 * The settings panel next to this could change sixteen numbers. Everything a
 * visitor actually reads, the headings, the paragraphs, the photographs, the
 * buttons and where they go, lived inside the page files and could only be
 * changed by editing code. That is not a content management system, and asking
 * for one was fair.
 *
 * How it works, because the honest explanation matters for trusting it.
 *
 * The preview on the right is the real site, served from the same place, so
 * this page is allowed to reach inside it. Turning editing on marks everything
 * changeable. Clicking a piece of text lets you type over it. Clicking a
 * picture lets you replace the file. Clicking a link lets you change where it
 * goes.
 *
 * Nothing is saved as you type. Each change is written down as "in this file,
 * this exact text becomes that text". When you publish, each page file is
 * fetched from GitHub, the replacements are made in it, and it is written
 * back. That is why the confirmation can tell you exactly what is about to
 * change, and why nothing can be altered that you did not touch.
 *
 * A sentence that appears in more than one place changes in all of them. That
 * is almost always what is wanted, and the count is shown before you agree.
 *
 * What this deliberately does not do: animations. They are code, not content,
 * and pretending a panel can edit them would only break the site.
 */
(function () {
  'use strict';

  var OWNER = 'anispms';
  var REPO = 'konnexplay-website';
  var BRANCH = 'main';

  /* Which file builds which route. The names match the dc-import names in
     index.html, which are the file names. Nav and Footer are on every page. */
  var ROUTE_FILE = {
    home: 'Home.dc.html',
    platform: 'Platform.dc.html',
    pricing: 'Pricing.dc.html',
    faq: 'FAQ.dc.html',
    contact: 'Contact.dc.html',
    about: 'About.dc.html',
    resources: 'Blog.dc.html',
    blog: 'Blog Posts.dc.html',
    research: 'Research.dc.html',
    india: 'India.dc.html',
    'channel-manager': 'Channel manager.dc.html',
    demo: 'Book a demo.dc.html',
    legal: 'Legal.dc.html',
    city: 'City.dc.html',
    sport: 'Sport.dc.html'
  };
  var ALWAYS = ['Nav.dc.html', 'Footer.dc.html'];

  var ALIAS = {
    'book-a-demo': 'demo', bookademo: 'demo', book: 'demo', 'book-demo': 'demo',
    faqs: 'faq', price: 'pricing', plans: 'pricing'
  };

  /* The files this session has fetched, so a search does not refetch. */
  var cache = {};
  /* Pending changes, in the order they were made. */
  var changes = [];
  var editing = false;

  var api = null;   // set by the host page: api(path, opts) -> fetch promise
  var onChange = null;

  function frame() { return document.getElementById('frame'); }
  function doc() {
    var f = frame();
    try { return f && f.contentDocument; } catch (e) { return null; }
  }

  function currentRoute() {
    var d = doc();
    if (!d) return 'home';
    var raw = ((d.defaultView.location.hash || '#/home').replace(/^#\/?/, '').split('?')[0] || 'home');
    var first = raw.split('/')[0] || 'home';
    return ALIAS[first] || first;
  }

  /** Every file the current page could have come from, nearest first. */
  function candidateFiles() {
    var r = currentRoute();
    var list = [];
    if (ROUTE_FILE[r]) list.push(ROUTE_FILE[r]);
    ALWAYS.forEach(function (f) { if (list.indexOf(f) === -1) list.push(f); });
    return list;
  }

  function getFile(name) {
    if (cache[name]) return Promise.resolve(cache[name]);
    return fetch('../' + encodeURIComponent(name) + '?t=' + Date.now())
      .then(function (r) {
        if (!r.ok) throw new Error('Could not read ' + name);
        return r.text();
      })
      .then(function (t) { cache[name] = t; return t; });
  }

  function countIn(text, needle) {
    if (!needle) return 0;
    var n = 0, i = 0;
    while ((i = text.indexOf(needle, i)) !== -1) { n++; i += needle.length; }
    return n;
  }

  /**
   * Find which page file a piece of text came from.
   *
   * Resolves { file, count } or null. Searching the real source rather than
   * guessing from the DOM is what makes the replacement safe: if the text is
   * not found, nothing is offered and nothing can go wrong.
   */
  function locate(needle) {
    var files = candidateFiles();
    var i = 0;
    function step() {
      if (i >= files.length) return Promise.resolve(null);
      var f = files[i++];
      return getFile(f).then(function (text) {
        var n = countIn(text, needle);
        if (n > 0) return { file: f, count: n };
        return step();
      }).catch(step);
    }
    return step();
  }

  /* ------------------------------------------------------------------ */
  /* Recording changes                                                   */

  function record(kind, file, find, replace, count, label) {
    // Editing the same thing twice should not stack up two entries.
    for (var i = 0; i < changes.length; i++) {
      if (changes[i].kind === kind && changes[i].file === file && changes[i].replace === find) {
        changes[i].replace = replace;
        if (changes[i].find === replace) changes.splice(i, 1);
        if (onChange) onChange();
        return;
      }
    }
    if (find === replace) return;
    changes.push({ kind: kind, file: file, find: find, replace: replace, count: count || 1, label: label || '' });
    if (onChange) onChange();
  }

  function list() { return changes.slice(); }
  function clear() { changes.length = 0; cache = {}; if (onChange) onChange(); }
  function undoOne(i) { changes.splice(i, 1); if (onChange) onChange(); }

  /* ------------------------------------------------------------------ */
  /* Edit mode inside the preview                                        */

  var STYLE_ID = 'kx-edit-style';
  var CSS =
    '[data-kxedit]{outline:1px dashed rgba(13,197,154,.55);outline-offset:2px;cursor:text}' +
    '[data-kxedit]:hover{outline:2px solid #0DC59A;background:rgba(13,197,154,.08)}' +
    '[data-kxedit-img]{outline:2px dashed #0DC59A;outline-offset:3px;cursor:pointer}' +
    '[data-kxedit-img]:hover{outline:3px solid #0DC59A}' +
    '[data-kxedit-link]{outline:1px dashed rgba(13,27,62,.5);outline-offset:2px}' +
    '[data-kxedit-link]:hover{outline:2px solid #0D1B3E}' +
    '[data-kxediting]{outline:2px solid #0DC59A !important;background:#FFFDF2 !important}' +
    '.kx-edit-tip{position:fixed;left:12px;bottom:12px;z-index:2147483000;background:#0D1B3E;color:#fff;' +
    'padding:9px 14px;border-radius:999px;font:600 12px/1.4 Inter,system-ui,sans-serif;pointer-events:none}';

  function isTextHolder(el) {
    if (!el || el.nodeType !== 1) return false;
    if (el.closest('#kx-actionbar, .kx-edit-tip, header')) return false;
    if (/^(SCRIPT|STYLE|SVG|PATH|VIDEO|IMG|BR|HR|INPUT|TEXTAREA|SELECT|OPTION)$/.test(el.tagName)) return false;
    // one text node and nothing else: the smallest thing worth editing
    if (el.children.length !== 0) return false;
    var t = (el.textContent || '').trim();
    return t.length >= 2 && t.length <= 2000;
  }

  function mark(d) {
    var all = d.querySelectorAll('body *');
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (el.tagName === 'IMG' && /assets\//.test(el.getAttribute('src') || '')) {
        el.setAttribute('data-kxedit-img', '1');
      } else if (el.tagName === 'A' && el.getAttribute('href')) {
        el.setAttribute('data-kxedit-link', '1');
        if (isTextHolder(el)) el.setAttribute('data-kxedit', '1');
      } else if (isTextHolder(el)) {
        el.setAttribute('data-kxedit', '1');
      }
    }
  }

  function unmark(d) {
    ['data-kxedit', 'data-kxedit-img', 'data-kxedit-link', 'data-kxediting'].forEach(function (a) {
      var n = d.querySelectorAll('[' + a + ']');
      for (var i = 0; i < n.length; i++) n[i].removeAttribute(a);
    });
    var c = d.querySelectorAll('[contenteditable]');
    for (var j = 0; j < c.length; j++) c[j].removeAttribute('contenteditable');
  }

  var handlers = null;

  function attach() {
    var d = doc();
    if (!d || !d.body) return false;

    if (!d.getElementById(STYLE_ID)) {
      var st = d.createElement('style');
      st.id = STYLE_ID;
      st.textContent = CSS;
      d.head.appendChild(st);
    }
    mark(d);

    if (!d.querySelector('.kx-edit-tip')) {
      var tip = d.createElement('div');
      tip.className = 'kx-edit-tip';
      tip.textContent = 'Editing on. Click any text, picture or link.';
      d.body.appendChild(tip);
    }

    handlers = {
      click: function (e) {
        var el = e.target;
        if (!el || el.nodeType !== 1) return;

        var img = el.closest ? el.closest('[data-kxedit-img]') : null;
        if (img) { e.preventDefault(); e.stopPropagation(); pickImage(img); return; }

        var text = el.closest ? el.closest('[data-kxedit]') : null;
        if (text) {
          e.preventDefault();
          e.stopPropagation();
          if (e.altKey && text.matches('[data-kxedit-link]')) { editLink(text); return; }
          editText(text);
          return;
        }

        var link = el.closest ? el.closest('[data-kxedit-link]') : null;
        if (link) { e.preventDefault(); e.stopPropagation(); editLink(link); }
      }
    };
    d.addEventListener('click', handlers.click, true);

    // Links must not navigate while editing.
    handlers.stop = function (e) { if (editing) { e.preventDefault(); } };
    d.addEventListener('submit', handlers.stop, true);

    // The site re-renders as you scroll, so newly built nodes need marking.
    handlers.mo = new (d.defaultView.MutationObserver || window.MutationObserver)(function () {
      clearTimeout(handlers.t);
      handlers.t = setTimeout(function () { if (editing) mark(d); }, 250);
    });
    handlers.mo.observe(d.documentElement, { childList: true, subtree: true });
    return true;
  }

  function detach() {
    var d = doc();
    if (!d) return;
    if (handlers) {
      try { d.removeEventListener('click', handlers.click, true); } catch (e) {}
      try { d.removeEventListener('submit', handlers.stop, true); } catch (e) {}
      try { handlers.mo.disconnect(); } catch (e) {}
      handlers = null;
    }
    unmark(d);
    var s = d.getElementById(STYLE_ID); if (s) s.remove();
    var t = d.querySelector('.kx-edit-tip'); if (t) t.remove();
  }

  /* ------------------------------------------------------------------ */
  /* The three kinds of edit                                             */

  function editText(el) {
    var before = (el.textContent || '');
    el.setAttribute('data-kxediting', '1');
    el.setAttribute('contenteditable', 'true');
    el.focus();

    function finish() {
      el.removeAttribute('contenteditable');
      el.removeAttribute('data-kxediting');
      el.removeEventListener('blur', finish);
      el.removeEventListener('keydown', key);
      var after = (el.textContent || '');
      if (after === before) return;
      if (!after.trim()) { el.textContent = before; return; }

      locate(before).then(function (hit) {
        if (!hit) {
          el.textContent = before;
          say('That sentence could not be found in the page file, so it was left alone. It is probably built by code rather than written in the page.');
          return;
        }
        record('text', hit.file, before, after, hit.count, before.trim().slice(0, 60));
      });
    }
    function key(e) {
      if (e.key === 'Escape') { el.textContent = before; el.blur(); }
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); el.blur(); }
    }
    el.addEventListener('blur', finish);
    el.addEventListener('keydown', key);
  }

  function editLink(el) {
    var before = el.getAttribute('href') || '';
    var after = window.prompt('Where should this link go?\n\nText: ' + (el.textContent || '').trim().slice(0, 60), before);
    if (after === null || after === before) return;
    var findStr = 'href="' + before + '"';
    locate(findStr).then(function (hit) {
      if (!hit) return locate("href='" + before + "'").then(function (h2) {
        if (!h2) { say('That link could not be found in the page file, so it was left alone.'); return; }
        record('link', h2.file, "href='" + before + "'", "href='" + after + "'", h2.count, (el.textContent || '').trim().slice(0, 40) + ' → ' + after);
      });
      record('link', hit.file, findStr, 'href="' + after + '"', hit.count, (el.textContent || '').trim().slice(0, 40) + ' → ' + after);
    });
  }

  var pendingImage = null;

  function pickImage(img) {
    pendingImage = img;
    var input = document.getElementById('kx-file');
    if (!input) return;
    input.value = '';
    input.accept = 'image/*';
    input.click();
  }

  /** Called by the host page when a file has been chosen. */
  function fileChosen(file) {
    if (!pendingImage || !file) return;
    var img = pendingImage;
    pendingImage = null;

    var src = (img.getAttribute('src') || '').split('?')[0];
    if (!src) return;
    if (file.size > 20 * 1024 * 1024) { say('That file is larger than 20 MB. Please use a smaller one.'); return; }

    var reader = new FileReader();
    reader.onload = function () {
      var b64 = String(reader.result).split(',')[1];
      // Replacing the file itself updates it everywhere it is used, which is
      // what is meant by "change this photo".
      for (var i = 0; i < changes.length; i++) {
        if (changes[i].kind === 'file' && changes[i].file === src) { changes[i].b64 = b64; changes[i].label = file.name; if (onChange) onChange(); preview(); return; }
      }
      changes.push({ kind: 'file', file: src, b64: b64, count: 1, label: file.name });
      if (onChange) onChange();
      preview();
    };
    reader.readAsDataURL(file);

    function preview() {
      try {
        var url = URL.createObjectURL(file);
        img.src = url;
      } catch (e) {}
    }
  }

  function say(msg) { if (window.KX_EDIT_SAY) window.KX_EDIT_SAY(msg); else alert(msg); }

  /* ------------------------------------------------------------------ */
  /* Publishing                                                          */

  function b64encodeText(s) {
    return btoa(unescape(encodeURIComponent(s)));
  }

  /**
   * Apply every pending change, one file at a time.
   *
   * Each file is fetched fresh from GitHub immediately before it is written,
   * so an edit made somewhere else in the meantime is not silently discarded:
   * if the text is no longer there, that change is reported as skipped rather
   * than forced.
   */
  function publish(progress) {
    var byFile = {};
    changes.forEach(function (c) {
      if (c.kind === 'file') { byFile['@' + c.file] = [c]; return; }
      (byFile[c.file] = byFile[c.file] || []).push(c);
    });

    var names = Object.keys(byFile);
    var done = [], skipped = [];
    var i = 0;

    function next() {
      if (i >= names.length) return Promise.resolve({ done: done, skipped: skipped });
      var key = names[i++];
      var edits = byFile[key];

      if (key.charAt(0) === '@') {
        var path = key.slice(1);
        if (progress) progress('Uploading ' + path);
        return putFile(path, edits[0].b64, 'Replace ' + path + ' from the settings panel')
          .then(function () { done.push(path); })
          .catch(function (e) { skipped.push(path + ': ' + e.message); })
          .then(next);
      }

      if (progress) progress('Updating ' + key);
      return getRemote(key)
        .then(function (r) {
          var text = r.text;
          var applied = 0;
          edits.forEach(function (c) {
            if (text.indexOf(c.find) === -1) { skipped.push(key + ': "' + (c.label || c.find).slice(0, 40) + '" was not found, it may have been changed elsewhere'); return; }
            text = text.split(c.find).join(c.replace);
            applied++;
          });
          if (!applied) return;
          return putFile(key, b64encodeText(text), 'Edit ' + key + ' from the settings panel', r.sha)
            .then(function () { done.push(key + ' (' + applied + ')'); });
        })
        .catch(function (e) { skipped.push(key + ': ' + e.message); })
        .then(next);
    }
    return next();
  }

  function getRemote(path) {
    return api('/repos/' + OWNER + '/' + REPO + '/contents/' + encodeURIComponent(path) + '?ref=' + BRANCH)
      .then(function (r) {
        if (!r.ok) throw new Error('GitHub said ' + r.status + ' reading it');
        return r.json();
      })
      .then(function (j) {
        return { sha: j.sha, text: decodeURIComponent(escape(atob((j.content || '').replace(/\n/g, '')))) };
      });
  }

  function putFile(path, b64, message, sha) {
    var body = { message: message, content: b64, branch: BRANCH };
    if (sha) body.sha = sha;
    else {
      // An existing binary still needs its sha, so look it up first.
      return api('/repos/' + OWNER + '/' + REPO + '/contents/' + encodeURIComponent(path) + '?ref=' + BRANCH)
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (j) {
          var b = { message: message, content: b64, branch: BRANCH };
          if (j && j.sha) b.sha = j.sha;
          return api('/repos/' + OWNER + '/' + REPO + '/contents/' + encodeURIComponent(path), {
            method: 'PUT', body: JSON.stringify(b)
          });
        })
        .then(function (r) { if (!r.ok) throw new Error('GitHub said ' + r.status + ' writing it'); return r.json(); });
    }
    return api('/repos/' + OWNER + '/' + REPO + '/contents/' + encodeURIComponent(path), {
      method: 'PUT', body: JSON.stringify(body)
    }).then(function (r) {
      if (!r.ok) throw new Error('GitHub said ' + r.status + ' writing it');
      return r.json();
    });
  }

  /* ------------------------------------------------------------------ */

  window.KX_EDIT = {
    init: function (opts) { api = opts.api; onChange = opts.onChange; },
    on: function () {
      if (editing) return true;
      if (!attach()) return false;
      editing = true;
      return true;
    },
    off: function () { editing = false; detach(); },
    isOn: function () { return editing; },
    reattach: function () { if (editing) { detach(); attach(); } },
    list: list,
    clear: clear,
    undoOne: undoOne,
    fileChosen: fileChosen,
    publish: publish,
    routeFile: function () { return candidateFiles()[0]; }
  };
})();
