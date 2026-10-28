/**
 * Blog posts: a small add/edit/delete form that publishes to
 * blog-posts.json, and keeps sitemap.xml listing published posts.
 *
 * Nothing reaches GitHub until Save and publish is pressed. Until then
 * this just holds a queue of staged changes in memory, the same way
 * edit.js holds pending click-to-edit changes.
 */
(function () {
  'use strict';

  var OWNER = 'anispms';
  var REPO = 'konnexplay-website';
  var BRANCH = 'main';
  var FILE = 'blog-posts.json';
  var SITEMAP = 'sitemap.xml';

  var api = null;
  var onChange = null;
  var staged = [];        // [{kind:'set'|'delete', slug, post, imageFile}]
  var existing = null;    // last-known list of published posts, for the admin's own list
  var existingLoaded = false;

  function b64encodeText(s) { return btoa(unescape(encodeURIComponent(s))); }

  function b64FromFile(file) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () { resolve(String(r.result).split(',')[1]); };
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

  function findBySlug(arr, slug) {
    for (var i = 0; i < arr.length; i++) { if (arr[i].slug === slug) return i; }
    return -1;
  }

  /* ------------------------------------------------------------------ */
  /* Staging                                                              */

  function stagePost(data, imageFile) {
    for (var i = 0; i < staged.length; i++) {
      if (staged[i].slug === data.slug) {
        staged[i] = { kind: 'set', slug: data.slug, post: data, imageFile: imageFile || staged[i].imageFile || null };
        if (onChange) onChange();
        return;
      }
    }
    staged.push({ kind: 'set', slug: data.slug, post: data, imageFile: imageFile || null });
    if (onChange) onChange();
  }

  function stageDelete(slug) {
    for (var i = 0; i < staged.length; i++) {
      if (staged[i].slug === slug) { staged.splice(i, 1); if (onChange) onChange(); return; }
    }
    staged.push({ kind: 'delete', slug: slug });
    if (onChange) onChange();
  }

  function undoOne(i) { staged.splice(i, 1); if (onChange) onChange(); }
  function list() { return staged.slice(); }
  function clear() { staged.length = 0; if (onChange) onChange(); }

  function slugify(s) {
    return String(s || '').toLowerCase().trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80);
  }

  /* What the admin's own "existing posts" list shows: published posts,
     with any staged edit or delete folded in so the list reflects what
     will actually be live after the next publish. */
  function loadExisting() {
    if (existingLoaded) return Promise.resolve(existing);
    return getRemote(FILE)
      .then(function (r) {
        var arr = [];
        if (r) { try { arr = JSON.parse(r.text); } catch (e) { arr = []; } }
        existing = Array.isArray(arr) ? arr : [];
        existingLoaded = true;
        return existing;
      })
      .catch(function () { existing = []; existingLoaded = true; return existing; });
  }

  function previewList() {
    var base = (existing || []).slice();
    staged.forEach(function (c) {
      var i = findBySlug(base, c.slug);
      if (c.kind === 'delete') { if (i !== -1) base.splice(i, 1); }
      else if (i !== -1) base[i] = c.post;
      else base.push(c.post);
    });
    return base;
  }

  /* ------------------------------------------------------------------ */
  /* GitHub                                                               */

  function getRemote(path) {
    return api('/repos/' + OWNER + '/' + REPO + '/contents/' + encodeURIComponent(path) + '?ref=' + BRANCH)
      .then(function (r) {
        if (r.status === 404) return null;
        if (!r.ok) throw new Error('GitHub said ' + r.status + ' reading ' + path);
        return r.json();
      })
      .then(function (j) {
        if (!j) return null;
        return { sha: j.sha, text: decodeURIComponent(escape(atob((j.content || '').replace(/\n/g, '')))) };
      });
  }

  function putFile(path, b64, message, sha) {
    var body = { message: message, content: b64, branch: BRANCH };
    if (sha) body.sha = sha;
    return api('/repos/' + OWNER + '/' + REPO + '/contents/' + encodeURIComponent(path), {
      method: 'PUT', body: JSON.stringify(body)
    }).then(function (r) {
      if (r.ok) return r.json();
      return r.json().catch(function () { return {}; }).then(function (j) {
        throw new Error('GitHub said ' + r.status + ' writing ' + path + (j && j.message ? ': ' + j.message : ''));
      });
    });
  }

  function sitemapEntry(slug) {
    var today = new Date().toISOString().slice(0, 10);
    return '  <url><loc>https://konnexplay.com/blog/' + slug + '</loc><lastmod>' + today + '</lastmod></url>\n';
  }

  /* The sitemap is a nice-to-have for search engines, not the record of
     truth (blog-posts.json is). A failure here is logged but never stops
     the post itself from publishing. */
  function updateSitemap(addSlugs, removeSlugs) {
    if (!addSlugs.length && !removeSlugs.length) return Promise.resolve();
    return getRemote(SITEMAP).then(function (r) {
      if (!r) return;
      var text = r.text;
      removeSlugs.forEach(function (slug) {
        var esc = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        var re = new RegExp('[ \\t]*<url><loc>https://konnexplay\\.com/blog/' + esc + '</loc>.*?</url>\\n?', 'g');
        text = text.replace(re, '');
      });
      addSlugs.forEach(function (slug) {
        if (text.indexOf('>https://konnexplay.com/blog/' + slug + '<') !== -1) return;
        text = text.replace('</urlset>', sitemapEntry(slug) + '</urlset>');
      });
      return putFile(SITEMAP, b64encodeText(text), 'Update sitemap for blog posts', r.sha);
    }).catch(function () {});
  }

  /* ------------------------------------------------------------------ */
  /* Publishing                                                           */

  function publish(progress) {
    if (!staged.length) return Promise.resolve({ done: [], skipped: [] });

    var uploads = staged.filter(function (c) { return c.kind === 'set' && c.imageFile; });
    var u = 0;
    function uploadNext() {
      if (u >= uploads.length) return Promise.resolve();
      var c = uploads[u++];
      if (progress) progress('Uploading cover image for ' + c.slug);
      var ext = (c.imageFile.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
      var path = 'assets/blog/' + c.slug + '.' + ext;
      return b64FromFile(c.imageFile)
        .then(function (b64) {
          return getRemote(path).then(function (r) {
            return putFile(path, b64, 'Upload cover image for ' + c.slug, r ? r.sha : null);
          });
        })
        .then(function () { c.post.image = path; })
        .then(uploadNext);
    }

    return uploadNext().then(function () {
      if (progress) progress('Updating blog posts');
      return loadExisting().then(function (current) {
        var arr = current.slice();
        var addSlugs = [], removeSlugs = [];
        staged.forEach(function (c) {
          var i = findBySlug(arr, c.slug);
          if (c.kind === 'delete') {
            if (i !== -1) arr.splice(i, 1);
            removeSlugs.push(c.slug);
          } else {
            if (i !== -1) arr[i] = c.post; else arr.push(c.post);
            addSlugs.push(c.slug);
          }
        });
        return getRemote(FILE).then(function (r) {
          return putFile(FILE, b64encodeText(JSON.stringify(arr, null, 2) + '\n'), 'Update blog posts from the settings panel', r ? r.sha : null);
        }).then(function () {
          existing = arr;
          existingLoaded = true;
          return updateSitemap(addSlugs, removeSlugs);
        });
      });
    }).then(function () {
      return { done: staged.map(function (c) { return c.slug; }), skipped: [] };
    });
  }

  /* ------------------------------------------------------------------ */

  window.KX_BLOG = {
    init: function (opts) { api = opts.api; onChange = opts.onChange; },
    stagePost: stagePost,
    stageDelete: stageDelete,
    undoOne: undoOne,
    list: list,
    clear: clear,
    loadExisting: loadExisting,
    previewList: previewList,
    slugify: slugify,
    publish: publish
  };
})();
