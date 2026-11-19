/**
 * Site configuration.
 *
 * KX_LEAD_ENDPOINT is the Google Apps Script Web App URL that stores demo
 * requests in a Google Sheet and emails you. Setup: backend/README.md.
 *
 * While this is empty the demo form still works: it hands the lead to
 * WhatsApp exactly as before. Filling it in adds a saved record and an
 * email alert, so a lead survives even if the visitor never presses send
 * in WhatsApp.
 */
window.KX_LEAD_ENDPOINT = '';

/* Build id for the page files. Rewritten by tools-stamp-version.js. */
window.KX_BUILD = 'fccb1629';
