(function () {
  "use strict";
  var CFG = window.APP_CONFIG || {};
  var BRAND = CFG.APP_NAME || "Qrown", IG = "ashish30945", TG = "Ashish_Thakur1", MAIL = "ashishrathor7566@gmail.com";
  var $app = document.getElementById("app");
  var sb = null, session = null;

  /* ---------- helpers ---------- */
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function toast(msg) { var t = document.getElementById("toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove("show"); }, 2500); }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function uid() { return Math.random().toString(36).slice(2, 10); }
  function safeUrl(u) { u = String(u || "").trim(); if (!u) return ""; if (/^(https?:\/\/|mailto:|tel:|upi:\/\/)/i.test(u)) return u; if (/^[a-z][a-z0-9+.-]*:/i.test(u)) return ""; return "https://" + u; }
  function digits(s) { return String(s || "").replace(/[^\d+]/g, ""); }
  function shareUrl(slug) { return location.origin + "/s/" + slug; }
  function configured() { return CFG.SUPABASE_URL && CFG.SUPABASE_URL.indexOf("YOUR-PROJECT") < 0 && window.supabase; }
  async function copyText(v, msg) { try { await navigator.clipboard.writeText(v); toast(msg || "Copy ho gaya ✅"); } catch (e) { prompt("Copy karo:", v); } }

  /* ---------- v3: language, theme, zip, files, alerts ---------- */
  var LANG = "hg"; try { LANG = localStorage.getItem("qn_lang") || "hg"; } catch (e) {}
  if (["hg", "en", "hi"].indexOf(LANG) < 0) LANG = "hg";
  var DICT = { en: {}, hi: {} }, RXT = [];
  function T3(hg, en, hi) { DICT.en[hg] = en; DICT.hi[hg] = hi; }
  function R3(re, en, hi) { RXT.push([re, en, hi]); }
  function tr(s) {
    if (LANG === "hg" || !s) return s; var str = String(s), k = str.trim(); if (!k) return s;
    var lead = str.slice(0, str.indexOf(k)), tail = str.slice(lead.length + k.length), d = DICT[LANG][k];
    if (d != null) return lead + d + tail;
    for (var i = 0; i < RXT.length; i++) { if (RXT[i][0].test(k)) return lead + k.replace(RXT[i][0], LANG === "en" ? RXT[i][1] : RXT[i][2]) + tail; }
    return s;
  }
  var trObs = null, trBusy = false;
  function trNode(n, shallow) {
    if (n.nodeType === 3) {
      var p = n.parentNode; if (p && /^(SCRIPT|STYLE|TEXTAREA)$/.test(p.nodeName)) return;
      if (n.__o === undefined || n.nodeValue !== n.__t) n.__o = n.nodeValue;
      var t = tr(n.__o); n.__t = t; if (n.nodeValue !== t) n.nodeValue = t;
    } else if (n.nodeType === 1) {
      if (/^(SCRIPT|STYLE)$/.test(n.nodeName)) return;
      ["placeholder", "aria-label", "title"].forEach(function (a) {
        if (!n.hasAttribute(a)) return; var key = "__o_" + a, cur = n.getAttribute(a);
        if (n[key] === undefined || cur !== n["__t_" + a]) n[key] = cur;
        var t2 = tr(n[key]); n["__t_" + a] = t2; if (cur !== t2) n.setAttribute(a, t2);
      });
      if (!shallow) for (var c = n.firstChild; c; c = c.nextSibling) trNode(c);
    }
  }
  function applyLang() {
    try { localStorage.setItem("qn_lang", LANG); } catch (e) {}
    document.documentElement.lang = LANG === "en" ? "en" : "hi";
    if (trObs) { trObs.disconnect(); trObs = null; }
    trBusy = true; trNode(document.body); trBusy = false;
    $$(".lgp button").forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-lg2") === LANG); });
    if (LANG !== "hg") {
      trObs = new MutationObserver(function (ms) {
        if (trBusy) return; trBusy = true;
        ms.forEach(function (m) { if (m.type === "childList") { for (var i = 0; i < m.addedNodes.length; i++) trNode(m.addedNodes[i]); } else trNode(m.target, m.type === "attributes"); });
        trBusy = false;
      });
      trObs.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["placeholder", "aria-label", "title"] });
    }
  }
  function setLang(l) { LANG = l; applyLang(); }
  function pill() { return '<div class="lgp">' + [["hg", "HG"], ["en", "EN"], ["hi", "हिं"]].map(function (x) { return '<button type="button" data-lg2="' + x[0] + '" class="' + (LANG === x[0] ? "on" : "") + '">' + x[1] + "</button>"; }).join("") + "</div>"; }
  function bindPill() { $$(".lgp button").forEach(function (b) { b.onclick = function () { setLang(b.getAttribute("data-lg2")); }; }); }
  ["alert", "confirm", "prompt"].forEach(function (f) { var o = window[f].bind(window); window[f] = function (m, d) { return o(tr(m), d); }; });

  var THEME = "dark"; try { THEME = localStorage.getItem("qn_theme") || "dark"; } catch (e) {}
  function applyTheme() {
    document.documentElement.classList.toggle("light", THEME === "light");
    var m = document.querySelector("meta[name=theme-color]"); if (m) m.content = THEME === "light" ? "#f8f4ea" : "#07070c";
    try { localStorage.setItem("qn_theme", THEME); } catch (e) {}
  }
  var VTS = [["gold", "Gold", "linear-gradient(135deg,#f8e2a0,#b8821f)"], ["light", "Light", "linear-gradient(135deg,#ffffff,#e6d8b5)"], ["royal", "Royal", "linear-gradient(135deg,#dfe3ff,#5563d6)"], ["emerald", "Emerald", "linear-gradient(135deg,#c8f7de,#1d8f5f)"], ["rose", "Rose", "linear-gradient(135deg,#ffd9e4,#d1396b)"], ["ocean", "Ocean", "linear-gradient(135deg,#cdf3ff,#1b86b0)"], ["sunset", "Sunset", "linear-gradient(135deg,#ffe6bd,#d4561a)"]];
  function istLocal(iso) { if (!iso) return ""; try { return new Date(iso).toLocaleString("sv-SE", { timeZone: "Asia/Kolkata" }).slice(0, 16).replace(" ", "T"); } catch (e) { return ""; } }
  function fmtIST(iso) { try { return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" }); } catch (e) { return ""; } }
  function fmtShort(iso) { try { return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }); } catch (e) { return ""; } }

  /* zip (store only) */
  var CRCT = null;
  function crc32(u) {
    if (!CRCT) { CRCT = new Uint32Array(256); for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; CRCT[n] = c >>> 0; } }
    var x = 0xFFFFFFFF; for (var i = 0; i < u.length; i++) x = CRCT[(x ^ u[i]) & 255] ^ (x >>> 8); return (x ^ 0xFFFFFFFF) >>> 0;
  }
  function makeZip(files) {
    var enc = new TextEncoder(), parts = [], cd = [], off = 0, d = new Date();
    var dt = ((d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1)) & 0xFFFF, dd = (((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()) & 0xFFFF;
    files.forEach(function (f) {
      var nm = enc.encode(f.name), crc = crc32(f.data), sz = f.data.length;
      var lh = new DataView(new ArrayBuffer(30)); lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true); lh.setUint16(10, dt, true); lh.setUint16(12, dd, true); lh.setUint32(14, crc, true); lh.setUint32(18, sz, true); lh.setUint32(22, sz, true); lh.setUint16(26, nm.length, true);
      parts.push(lh.buffer, nm, f.data);
      var ch = new DataView(new ArrayBuffer(46)); ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint16(8, 0x0800, true); ch.setUint16(12, dt, true); ch.setUint16(14, dd, true); ch.setUint32(16, crc, true); ch.setUint32(20, sz, true); ch.setUint32(24, sz, true); ch.setUint16(28, nm.length, true); ch.setUint32(42, off, true);
      cd.push(ch.buffer, nm); off += 30 + nm.length + sz;
    });
    var csz = 0; cd.forEach(function (x) { csz += x.byteLength; });
    var end = new DataView(new ArrayBuffer(22)); end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true); end.setUint32(12, csz, true); end.setUint32(16, off, true);
    return new Blob(parts.concat(cd, [end.buffer]), { type: "application/zip" });
  }
  async function zipAll(list) {
    if (!list.length) return toast("Koi QR nahi hai");
    toast("ZIP ban rahi hai… " + list.length + " QR");
    var files = [], used = {}, enc = new TextEncoder(), txt = [];
    for (var i = 0; i < list.length; i++) {
      var q = list[i], cv = qrFramed(shareUrl(q.slug), q.style, 1024), b = await new Promise(function (r) { cv.toBlob(r, "image/png"); });
      var nm = fname(q.title), n = nm, c = 2; while (used[n]) n = nm + "-" + c++; used[n] = 1;
      files.push({ name: n + ".png", data: new Uint8Array(await b.arrayBuffer()) });
      files.push({ name: "svg/" + n + ".svg", data: enc.encode(qrSvg(shareUrl(q.slug), q.style)) });
      txt.push(q.title + " – " + shareUrl(q.slug));
    }
    files.push({ name: "links.txt", data: enc.encode(txt.join("\r\n") + "\r\n") });
    download(makeZip(files), "qrown-qr-codes.zip"); toast("ZIP download ho gayi ✅");
  }

  /* shared storage files (duplicate-safe) */
  function qPaths(q) { var p = (q.blocks || []).map(function (x) { return x.path; }); if (q.view && q.view.cover_path) p.push(q.view.cover_path); return p.filter(Boolean); }
  async function dropFiles(paths, exceptId) {
    paths = (paths || []).filter(Boolean); if (!paths.length) return;
    var r = await sb.from("qr_codes").select("id,blocks,view"), used = {};
    (r.data || []).forEach(function (x) { if (x.id === exceptId) return; (x.blocks || []).forEach(function (b) { if (b.path) used[b.path] = 1; }); if (x.view && x.view.cover_path) used[x.view.cover_path] = 1; });
    var del = paths.filter(function (p) { return !used[p]; }); if (del.length) sb.storage.from("qr-files").remove(del);
  }

  /* activity / alerts */
  var actCount = 0, actLast = -1, actTimer = null;
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function setBadge(n) { var b = $("#bellb"); if (b) { b.textContent = n > 99 ? "99+" : n; b.classList.toggle("on", n > 0); } }
  function notifyNew(diff) {
    if (lsGet("qn_notif") !== "1") return;
    var msg = diff + " naya scan / lead aaya 🔔";
    if (document.visibilityState === "visible") { toast(msg); return; }
    if ("Notification" in window && Notification.permission === "granted" && navigator.serviceWorker) {
      navigator.serviceWorker.ready.then(function (reg) { reg.showNotification(BRAND, { body: tr(msg), tag: "qrown-activity", renotify: true, data: { url: "/" } }); }).catch(function () {});
    }
  }
  async function pollActivity() {
    if (!session || !sb) return;
    var r; try { r = await sb.rpc("qr_activity", { p_since: null }); } catch (e) { return; } if (!r || r.error || !r.data) return;
    var n = (r.data.scans || 0) + (r.data.leads || 0); actCount = n; setBadge(n);
    if (actLast >= 0 && n > actLast) notifyNew(n - actLast); actLast = n;
  }
  function startActivity() {
    if (actTimer) return; actTimer = setInterval(pollActivity, 60000);
    document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible") pollActivity(); });
    pollActivity();
  }
  async function activitySheet() {
    sheet('<h2>Notifications</h2><div class="loading" style="min-height:120px"><div class="spin"></div></div>');
    var r = await sb.rpc("qr_activity", { p_since: null });
    if (r.error) { sheet("<h2>Notifications</h2><p class=\"hint center\">" + esc(r.error.message) + "</p>"); return; }
    var it = (r.data && r.data.items) || [];
    sheet("<h2>Notifications</h2>" + (it.length ? it.map(function (x) {
      return '<div class="nrow' + (x.s ? " seen" : " new") + '"><span class="ni">' + (x.k === "scan" ? "📷" : "📨") + '</span><span><b>' + esc(x.t) + "</b><small>" + (x.k === "scan" ? "Scan hua" : "Naya lead") + (x.x ? " · " + esc(x.x) : "") + " · " + esc(fmtShort(x.at)) + "</small></span></div>";
    }).join("") + '<p class="hint center" style="margin:14px 0 0">Dekhne ke 12 ghante baad ye notifications apne aap hat jaati hain.</p><button class="btn ghost block" id="nclr" style="margin-top:12px">' + ic("trash") + " Abhi saaf karo</button>" : '<p class="hint center" style="margin:20px 0">Koi nayi notification nahi hai.</p><p class="hint center">Dekhne ke 12 ghante baad notifications apne aap hat jaati hain.</p>'),
    function (sh) { var b = $("#nclr", sh); if (b) b.onclick = async function () { await sb.rpc("qr_notif_clear"); actCount = 0; actLast = 0; setBadge(0); toast("Saaf ho gaya"); activitySheet(); }; });
    if (it.some(function (x) { return !x.s; })) { await sb.rpc("qr_notif_seen"); }
    actCount = 0; actLast = 0; setBadge(0);
  }

  /* ---------- icons ---------- */
  var IC = {
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    scan: '<path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2"/><path d="M4 12h16"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/>',
    download: '<path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 18.7l1-1"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m21 16-5-5-9 9"/>',
    file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
    text: '<path d="M5 6h14M12 6v13M9 19h6"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    chat: '<path d="M21 12a8 8 0 0 1-11.8 7L4 20l1.1-4.8A8 8 0 1 1 21 12z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    pin: '<path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    rupee: '<path d="M6 5h12M6 10h12M9 5c5 0 6 5 0 5l7 9"/>',
    hash: '<path d="M5 9h14M5 15h14M10 4 8 20M16 4l-2 16"/>',
    qr: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><path d="M14 14h3v3h-3zM20 14v.01M17 20h4M20 17v.01"/>',
    chev: '<path d="m9 6 6 6-6 6"/>',
    back: '<path d="m15 6-6 6 6 6"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    up: '<path d="M12 19V5m0 0-5 5m5-5 5 5"/>',
    down: '<path d="M12 5v14m0 0-5-5m5 5 5-5"/>',
    logout: '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 8l-4 4 4 4M6 12h10"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3"/>',
    check: '<path d="m5 12 5 5 9-10"/>',
    crown: '<path d="M3 8l4 4 5-7 5 7 4-4-2 11H5z"/>',
    phoneapp: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
    ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    power: '<path d="M12 3v9M6.3 6.3a8 8 0 1 0 11.4 0"/>',
    wifi: '<path d="M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0"/><circle cx="12" cy="19.2" r="1"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    shield: '<path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z"/><path d="m9 12 2 2 4-4"/>',
    bell: '<path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4zM10 21h4"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    share: '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="m8.2 10.8 7.6-3.6M8.2 13.2l7.6 3.6"/>',
    list: '<path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6M16 4.5a3.5 3.5 0 0 1 0 7M18.5 14.5c2 .7 3 2.5 3 5.5"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.3 3 14.7 0 18M12 3c-3 3.3-3 14.7 0 18"/>',
    insta: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1.1"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>',
    send: '<path d="M21 3 3 10.5l7 2.5 2.5 7z"/><path d="m10 13 11-10"/>'
  };
  function ic(n, size) { return '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"' + (size ? ' style="font-size:' + size + 'px"' : "") + ">" + (IC[n] || "") + "</svg>"; }
  var LOGO = '<svg viewBox="0 0 64 64" fill="none"><defs><linearGradient id="gg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f8e2a0"/><stop offset=".55" stop-color="#dcaa48"/><stop offset="1" stop-color="#b07a1c"/></linearGradient></defs><path d="M8 24l13 12 11-22 11 22 13-12-5 24H13z" fill="url(#gg)" stroke="url(#gg)" stroke-width="3" stroke-linejoin="round"/><rect x="13" y="51" width="38" height="6" rx="3" fill="url(#gg)"/><circle cx="8" cy="22" r="4" fill="#e6303f"/><circle cx="32" cy="12" r="4.5" fill="#e6303f"/><circle cx="56" cy="22" r="4" fill="#e6303f"/><g fill="#1b1305"><rect x="22" y="38" width="5" height="5" rx="1"/><rect x="30" y="38" width="5" height="5" rx="1"/><rect x="38" y="38" width="5" height="5" rx="1"/><rect x="26" y="44" width="5" height="4" rx="1"/><rect x="34" y="44" width="5" height="4" rx="1"/></g></svg>';

  /* ---------- QR rendering (colors + shapes, PNG + SVG) ---------- */
  function makeModules(text) { var q = new window.QRCodeLib(-1, 2); q.addData(text); q.make(); var n = q.getModuleCount(), m = []; for (var r = 0; r < n; r++) { m[r] = []; for (var c = 0; c < n; c++) m[r][c] = q.isDark(r, c); } return m; }
  function inFinder(r, c, n) { return (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7); }
  function safeStyle(st) {
    st = st || {}; var fg = st.fg || "#111111", bg = st.bg || "#ffffff", L1 = lum(fg), L2 = lum(bg);
    if (L1 >= L2 || (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05) < 4) { fg = "#111111"; if (lum(bg) < 0.35) bg = "#ffffff"; }
    return { fg: fg, bg: bg, shape: st.shape, logo: st.logo || "", frame: st.frame || "", ch: st.ch || "Q" };
  }
  function qrCanvas(text, style, px) {
    style = safeStyle(style); px = px || 1024;
    var m = makeModules(text), n = m.length, margin = 4, total = n + margin * 2, s = px / total;
    var cv = document.createElement("canvas"); cv.width = cv.height = px; var g = cv.getContext("2d");
    g.fillStyle = style.bg || "#ffffff"; g.fillRect(0, 0, px, px); g.fillStyle = style.fg || "#111111";
    var shape = style.shape || "square";
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) {
      if (!m[r][c]) continue; var x = (c + margin) * s, y = (r + margin) * s;
      if (shape === "dots" && !inFinder(r, c, n)) { g.beginPath(); g.arc(x + s / 2, y + s / 2, s * 0.5, 0, 6.2832); g.fill(); }
      else if (shape === "rounded") { var u = r > 0 && m[r - 1][c], dn = r < n - 1 && m[r + 1][c], lf = c > 0 && m[r][c - 1], rt = c < n - 1 && m[r][c + 1], R = s * 0.42, w = s + 0.5;
        var tl = !u && !lf ? R : 0, tr = !u && !rt ? R : 0, br = !dn && !rt ? R : 0, bl = !dn && !lf ? R : 0;
        g.beginPath(); g.moveTo(x + tl, y); g.lineTo(x + w - tr, y); if (tr) g.arcTo(x + w, y, x + w, y + tr, tr); else g.lineTo(x + w, y);
        g.lineTo(x + w, y + w - br); if (br) g.arcTo(x + w, y + w, x + w - br, y + w, br); else g.lineTo(x + w, y + w);
        g.lineTo(x + bl, y + w); if (bl) g.arcTo(x, y + w, x, y + w - bl, bl); else g.lineTo(x, y + w);
        g.lineTo(x, y + tl); if (tl) g.arcTo(x, y, x + tl, y, tl); else g.lineTo(x, y); g.closePath(); g.fill(); }
      else g.fillRect(x, y, s + 0.5, s + 0.5);
    }
    if (style.logo === "crown" || style.logo === "letter") {
      var ls = px * 0.24, cx = px / 2, pad = ls * 0.1;
      g.fillStyle = style.bg; rr(g, cx - ls / 2 - pad, cx - ls / 2 - pad, ls + pad * 2, ls + pad * 2, ls * 0.28); g.fill();
      g.fillStyle = style.fg; g.beginPath(); g.arc(cx, cx, ls * 0.46, 0, 6.2832); g.fill();
      g.fillStyle = style.bg;
      if (style.logo === "crown") { g.save(); var k = ls * 0.5 / 24; g.translate(cx - 12 * k, cx - 11.5 * k); g.scale(k, k); g.fill(new Path2D("M3 8l4 4 5-7 5 7 4-4-2 11H5z")); g.restore(); }
      else { g.font = "800 " + Math.round(ls * 0.56) + "px Inter,Arial,sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(style.ch, cx, cx + ls * 0.03); }
    }
    return cv;
  }
  function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  function qrFramed(text, style, px) {
    var st = safeStyle(style), cv = qrCanvas(text, style, px), ft = String(st.frame || "").trim().slice(0, 16); if (!ft) return cv;
    var bh = Math.round(px * 0.17), o = document.createElement("canvas"); o.width = px; o.height = px + bh; var g = o.getContext("2d");
    g.fillStyle = st.bg; g.fillRect(0, 0, o.width, o.height); g.drawImage(cv, 0, 0);
    var ph = bh * 0.62, pw = Math.min(px * 0.8, Math.max(px * 0.4, ft.length * ph * 0.42 + ph * 1.4)), x = (px - pw) / 2, y = px + (bh - ph) / 2 - bh * 0.14;
    g.fillStyle = st.fg; rr(g, x, y, pw, ph, ph / 2); g.fill();
    g.fillStyle = st.bg; g.font = "800 " + Math.round(ph * 0.46) + "px Inter,Arial,sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(ft.toUpperCase(), px / 2, y + ph / 2 + 1);
    return o;
  }
  function qrSvg(text, style) {
    style = safeStyle(style); var m = makeModules(text), n = m.length, margin = 4, total = n + margin * 2, shape = style.shape || "square", d = [];
    var out = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + total + " " + total + '" shape-rendering="' + (shape === "square" ? "crispEdges" : "geometricPrecision") + '"><rect width="100%" height="100%" fill="' + esc(style.bg || "#ffffff") + '"/><g fill="' + esc(style.fg || "#111111") + '">';
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) {
      if (!m[r][c]) continue; var x = c + margin, y = r + margin;
      if (shape === "dots" && !inFinder(r, c, n)) out += '<circle cx="' + (x + 0.5) + '" cy="' + (y + 0.5) + '" r="0.5"/>';
      else if (shape === "rounded") { var u = r > 0 && m[r - 1][c], dn = r < n - 1 && m[r + 1][c], lf = c > 0 && m[r][c - 1], rt = c < n - 1 && m[r][c + 1], R = 0.42, w = 1.02;
        var tl = !u && !lf ? R : 0, tr = !u && !rt ? R : 0, br = !dn && !rt ? R : 0, bl = !dn && !lf ? R : 0;
        d.push("M" + (x + tl) + " " + y + "H" + (x + w - tr) + (tr ? "A" + tr + " " + tr + " 0 0 1 " + (x + w) + " " + (y + tr) : "") + "V" + (y + w - br) + (br ? "A" + br + " " + br + " 0 0 1 " + (x + w - br) + " " + (y + w) : "") + "H" + (x + bl) + (bl ? "A" + bl + " " + bl + " 0 0 1 " + x + " " + (y + w - bl) : "") + "V" + (y + tl) + (tl ? "A" + tl + " " + tl + " 0 0 1 " + (x + tl) + " " + y : "") + "Z"); }
      else d.push("M" + x + " " + y + "h1v1h-1z");
    }
    if (d.length) out += '<path d="' + d.join("") + '"/>';
    out += "</g>";
    if (style.logo === "crown" || style.logo === "letter") {
      var ls = total * 0.24, c = total / 2, k = ls * 0.5 / 24;
      out += '<rect x="' + (c - ls * 0.6) + '" y="' + (c - ls * 0.6) + '" width="' + ls * 1.2 + '" height="' + ls * 1.2 + '" rx="' + ls * 0.3 + '" fill="' + esc(style.bg) + '"/><circle cx="' + c + '" cy="' + c + '" r="' + ls * 0.46 + '" fill="' + esc(style.fg) + '"/>';
      out += style.logo === "crown" ? '<path transform="translate(' + (c - 12 * k) + " " + (c - 11.5 * k) + ") scale(" + k + ')" fill="' + esc(style.bg) + '" d="M3 8l4 4 5-7 5 7 4-4-2 11H5z"/>' : '<text x="' + c + '" y="' + (c + ls * 0.2) + '" text-anchor="middle" font-family="Arial,sans-serif" font-weight="800" font-size="' + ls * 0.56 + '" fill="' + esc(style.bg) + '">' + esc(style.ch) + "</text>";
    }
    var ft = String(style.frame || "").trim().slice(0, 16);
    if (ft) {
      var bh = total * 0.17, ph = bh * 0.62, pw = Math.min(total * 0.8, Math.max(total * 0.4, ft.length * ph * 0.42 + ph * 1.4));
      out = out.replace('viewBox="0 0 ' + total + " " + total + '"', 'viewBox="0 0 ' + total + " " + (total + bh) + '"').replace('<rect width="100%" height="100%"', '<rect width="100%" height="100%"');
      out += '<rect y="' + total + '" width="' + total + '" height="' + bh + '" fill="' + esc(style.bg) + '"/><rect x="' + (total - pw) / 2 + '" y="' + (total + (bh - ph) / 2 - bh * 0.14) + '" width="' + pw + '" height="' + ph + '" rx="' + ph / 2 + '" fill="' + esc(style.fg) + '"/><text x="' + total / 2 + '" y="' + (total + (bh - ph) / 2 - bh * 0.14 + ph * 0.66) + '" text-anchor="middle" font-family="Arial,sans-serif" font-weight="800" font-size="' + ph * 0.46 + '" fill="' + esc(style.bg) + '">' + esc(ft.toUpperCase()) + "</text>";
    }
    return out + "</svg>";
  }
  function paint(canvas, text, style, px, plain) { var cv = plain ? qrCanvas(text, style, px) : qrFramed(text, style, px); canvas.width = cv.width; canvas.height = cv.height; canvas.getContext("2d").drawImage(cv, 0, 0); }
  function download(blob, name) { var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000); }
  function fname(t) { return (String(t || "qr").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "qr"); }
  function dlPng(q) { qrFramed(shareUrl(q.slug), q.style, 1024).toBlob(function (b) { download(b, fname(q.title) + ".png"); }, "image/png"); }
  function wrapText(g, t, x, y, maxW, lh, maxLines) {
    var words = String(t || "").split(/\s+/), line = "", n = 0;
    for (var i = 0; i < words.length; i++) { var test = line ? line + " " + words[i] : words[i]; if (g.measureText(test).width > maxW && line) { g.fillText(line, x, y); y += lh; line = words[i]; if (++n >= maxLines) return y; } else line = test; }
    if (line) { g.fillText(line, x, y); y += lh; } return y;
  }
  function dlPoster(q) {
    var W = 1080, H = 1500, cv = document.createElement("canvas"); cv.width = W; cv.height = H; var g = cv.getContext("2d");
    var gr = g.createLinearGradient(0, 0, W, H); gr.addColorStop(0, "#0b0a10"); gr.addColorStop(1, "#1a0b10"); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.strokeStyle = "#dcaa48"; g.lineWidth = 6; rr(g, 36, 36, W - 72, H - 72, 48); g.stroke();
    g.textAlign = "center"; g.fillStyle = "#e8c15c"; g.font = "700 34px Arial,sans-serif"; g.fillText("Q R O W N", W / 2, 120);
    g.fillStyle = "#fff"; g.font = "800 72px Arial,sans-serif"; var y = wrapText(g, q.title, W / 2, 230, 860, 84, 2);
    if (q.description) { g.fillStyle = "#b9b3c4"; g.font = "400 36px Arial,sans-serif"; y = wrapText(g, q.description, W / 2, y + 6, 840, 48, 2); }
    var qs = 760, qc = qrFramed(shareUrl(q.slug), q.style, 1024), qh = qs * qc.height / qc.width, qy = Math.max(y + 20, 380);
    g.fillStyle = "#fff"; rr(g, (W - qs) / 2 - 26, qy - 26, qs + 52, qh + 52, 40); g.fill(); g.drawImage(qc, (W - qs) / 2, qy, qs, qh);
    var by = qy + qh + 110; g.fillStyle = "#e8c15c"; g.font = "800 64px Arial,sans-serif"; g.fillText("SCAN KARO", W / 2, by);
    g.fillStyle = "#b9b3c4"; g.font = "400 34px Arial,sans-serif"; g.fillText("Camera se scan karo – sab kuch dikh jayega", W / 2, by + 58);
    g.fillStyle = "#6f6a7d"; g.font = "400 28px Arial,sans-serif"; g.fillText("Made with Qrown by Rathod", W / 2, H - 80);
    cv.toBlob(function (b) { download(b, fname(q.title) + "-poster.png"); }, "image/png");
  }
  function dlSvg(q) { download(new Blob([qrSvg(shareUrl(q.slug), q.style)], { type: "image/svg+xml" }), fname(q.title) + ".svg"); }
  function lum(hex) { var h = String(hex).replace("#", ""); if (h.length === 3) h = h.replace(/./g, "$&$&"); var v = [0, 2, 4].map(function (i) { var c = parseInt(h.substr(i, 2), 16) / 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; }

  /* ---------- block types ---------- */
  var TYPES = {
    text:     { icon: "text",  name: "Text / Message", fields: [["label", "Heading (optional)", "text"], ["value", "Text likho…", "area"]] },
    link:     { icon: "link",  name: "Link", fields: [["label", "Button name", "text"], ["value", "https://…", "text"]] },
    image:    { icon: "image", name: "Photo", fields: [["label", "Caption (optional)", "text"]], upload: "image/*", maxMB: 15, hint: "Photo chuno (max 15MB)" },
    file:     { icon: "file",  name: "PDF / Document", fields: [["label", "File ka naam", "text"]], upload: ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,application/pdf", maxMB: 40, hint: "PDF ya document chuno (max 40MB)" },
    detail:   { icon: "hash",  name: "Number / Detail", fields: [["label", "Title (Account No, IFSC…)", "text"], ["value", "Value", "text"]] },
    phone:    { icon: "phone", name: "Phone call", fields: [["label", "Naam", "text"], ["value", "Phone number", "text"]] },
    whatsapp: { icon: "chat",  name: "WhatsApp", fields: [["label", "Naam", "text"], ["value", "Number country code ke saath (919876543210)", "text"], ["extra", "Pehle se likha message (optional)", "text"]] },
    email:    { icon: "mail",  name: "Email", fields: [["label", "Naam", "text"], ["value", "Email address", "text"]] },
    location: { icon: "pin",   name: "Location", fields: [["label", "Jagah ka naam", "text"], ["value", "Address ya Google Maps link", "text"]] },
    contact:  { icon: "user",  name: "Contact card (Save)", fields: [["label", "Poora naam", "text"], ["value", "Phone number", "text"], ["extra", "Email (optional)", "text"]] },
    wifi:     { icon: "wifi",  name: "Wi-Fi", fields: [["label", "Wi-Fi naam (SSID)", "text"], ["value", "Wi-Fi password (open ho to khali)", "text"]] },
    upi:      { icon: "rupee", name: "UPI payment", fields: [["label", "Payee ka naam", "text"], ["value", "UPI ID (name@bank)", "text"]] },
    links:    { icon: "list",  name: "Link-in-bio (saare links)", fields: [["label", "Section ka naam (optional)", "text"]] },
    social:   { icon: "globe", name: "Social links", fields: [] },
    lead:     { icon: "users", name: "Lead form (details maango)", fields: [["label", "Form ka heading (jaise Mujhse sampark karo)", "text"], ["value", "Button ka text (jaise Bhejo)", "text"]] }
  };
  var SOC = {
    instagram: ["Instagram", "linear-gradient(45deg,#f9a03f,#dd2a7b 55%,#8134af)", "IG", function (h) { return "https://instagram.com/" + h; }],
    youtube: ["YouTube", "#e52d27", "YT", function (h) { return "https://youtube.com/@" + h; }],
    facebook: ["Facebook", "#1877f2", "f", function (h) { return "https://facebook.com/" + h; }],
    x: ["X (Twitter)", "#111111", "X", function (h) { return "https://x.com/" + h; }],
    telegram: ["Telegram", "#229ed9", "TG", function (h) { return "https://t.me/" + h; }],
    linkedin: ["LinkedIn", "#0a66c2", "in", function (h) { return "https://linkedin.com/in/" + h; }],
    snapchat: ["Snapchat", "#d9b300", "SC", function (h) { return "https://snapchat.com/add/" + h; }],
    threads: ["Threads", "#222222", "@", function (h) { return "https://threads.net/@" + h; }],
    github: ["GitHub", "#333333", "GH", function (h) { return "https://github.com/" + h; }],
    whatsapp: ["WhatsApp", "#25d366", "WA", function (h) { return "https://wa.me/" + digits(h).replace(/^\+/, ""); }],
    website: ["Website", "#7a5cff", "www", function (h) { return h; }]
  };
  function socUrl(p, v) {
    v = String(v || "").trim(); var sd = SOC[p]; if (!v || !sd) return "";
    if (/^https?:\/\//i.test(v) || (v.indexOf("/") > 0 && v.split("/")[0].indexOf(".") > 0)) return safeUrl(v);
    var h = v.replace(/^@/, "").replace(/\s+/g, ""); if (!h) return "";
    return safeUrl(sd[3](p === "whatsapp" || p === "website" ? h : encodeURIComponent(h)));
  }
  function newBlock(type, label) { var b = { id: uid(), type: type, label: label || "", value: "", extra: "", url: "", path: "" }; if (type === "links") b.items = [{ t: "", u: "" }]; if (type === "social") b.items = [{ p: "instagram", v: "" }]; return b; }
  var TPLS = {
    card: { n: "💼 Visiting Card", t: "Mera Visiting Card", d: "Mujhse milne ke liye shukriya!", b: [["contact", "Aapka naam"], ["whatsapp", "WhatsApp"], ["email", "Email"], ["link", "Website"], ["location", "Office"]] },
    shop: { n: "🏪 Dukaan / Menu", t: "Meri Dukaan", d: "Menu, location aur payment", b: [["text", "Aaj ka offer"], ["phone", "Call karo"], ["location", "Dukaan ka pata"], ["upi", "Dukaan ka naam"], ["whatsapp", "Order on WhatsApp"]] },
    pay: { n: "💸 UPI Payment", t: "Payment karo", d: "UPI se seedha pay karo", b: [["upi", "Aapka naam"], ["detail", "Account No"], ["detail", "IFSC"]] },
    wifi: { n: "📶 Guest Wi-Fi", t: "Guest Wi-Fi", d: "Connect karne ke liye scan karo", b: [["wifi", "Wi-Fi naam"], ["text", "Rules"]] },
    event: { n: "🎉 Event Invite", t: "Aap aamantrit hain!", d: "Hamare event mein zaroor aana", b: [["text", "Event ki details"], ["location", "Venue"], ["phone", "Contact"], ["link", "RSVP link"]] },
    bio: { n: "🔗 Link-in-bio", t: "Mere saare links", d: "Ek jagah mere saare links", b: [["links", "Mere links"], ["social", ""], ["whatsapp", "WhatsApp"]] },
    secret: { n: "🤫 Secret message (1 baar)", t: "Secret message", d: "Ye message sirf ek baar dikhega", b: [["text", "Secret message"]], max: 1 },
    lead: { n: "📨 Enquiry form", t: "Mujhse sampark karo", d: "Details bharo, main aapse sampark karunga", b: [["text", "Hamare baare mein"], ["lead", "Mujhse sampark karo"], ["whatsapp", "WhatsApp"]] }
  };

  function action(href, icon, title, sub, external) { return '<a class="vb" ' + (external ? 'target="_blank" rel="noopener noreferrer" ' : "") + 'href="' + esc(href) + '"><span class="vi">' + ic(icon) + '</span><span class="vt"><b>' + esc(title) + "</b>" + (sub ? "<small>" + esc(sub) + "</small>" : "") + '</span><span class="vch">' + ic("chev") + "</span></a>"; }
  function card(icon, inner) { return '<div class="vb"><span class="vi">' + ic(icon) + '</span><span class="vt">' + inner + "</span></div>"; }
  function linkify(t) { return esc(t).replace(/(https?:\/\/[^\s<]+)/g, function (m) { var tail = ""; var x = m.match(/(?:[.,;:!?)]|&quot;|&#39;)+$/); if (x) { tail = x[0]; m = m.slice(0, -tail.length); } return '<a href="' + m + '" target="_blank" rel="noopener noreferrer">' + m + "</a>" + tail; }); }
  function dlUrl(u, name) { return u + (u.indexOf("?") < 0 ? "?" : "&") + "download=" + encodeURIComponent(name || "file"); }
  function hostOf(u) { try { return new URL(u).hostname.replace(/^www\./, ""); } catch (e) { return u; } }
  function wifiStr(ssid, pw) { var e = function (x) { return String(x || "").replace(/([\\;,:"])/g, "\\$1"); }; return "WIFI:T:" + (pw ? "WPA" : "nopass") + ";S:" + e(ssid) + ";" + (pw ? "P:" + e(pw) + ";" : "") + ";"; }
  function devType() { var u = navigator.userAgent; return /ipad|tablet/i.test(u) ? "tablet" : /mobi|android|iphone/i.test(u) ? "mobile" : "desktop"; }
  function vcf(n, t, e) { var c = function (x) { return String(x || "").replace(/[\r\n]+/g, " ").replace(/([,;\\])/g, "\\$1"); }; return "BEGIN:VCARD\r\nVERSION:3.0\r\nFN:" + c(n) + "\r\nN:;" + c(n) + ";;;\r\nTEL;TYPE=CELL:" + c(t) + "\r\n" + (e ? "EMAIL:" + c(e) + "\r\n" : "") + "END:VCARD\r\n"; }
  function renderBlock(b) {
    var T = TYPES[b.type]; if (!T) return ""; var v = b.value || "";
    switch (b.type) {
      case "text": return '<div class="vb col txb">' + (b.label ? '<div class="txh">' + esc(b.label) + "</div>" : "") + '<div class="tx">' + linkify(v) + '</div><button class="btn sm ghost cpy" data-copy="' + esc(v) + '">' + ic("copy") + " Copy text</button></div>";
      case "link": { var u = safeUrl(v); return u ? action(u, "link", b.label || hostOf(u), b.label ? hostOf(u) : "Kholne ke liye dabao", true) : ""; }
      case "image": { var iu = safeUrl(b.url || v); return iu ? '<figure class="vb col pic"><div class="ph sk"><img data-zoom="' + esc(iu) + '" data-cap="' + esc(b.label || "") + '" decoding="async" loading="lazy" alt="' + esc(b.label || "photo") + '" src="' + esc(iu) + '"></div>' + (b.label ? '<figcaption class="cap">' + esc(b.label) + "</figcaption>" : "") + '<div class="row2"><button class="btn sm ghost" data-view="' + esc(iu) + '" data-cap="' + esc(b.label || "") + '">' + ic("eye") + ' Zoom</button><a class="btn sm ghost" href="' + esc(dlUrl(iu, b.label || "photo")) + '">' + ic("download") + " Save</a></div></figure>" : ""; }
      case "file": { var fu = safeUrl(b.url || v); if (!fu) return ""; var fx = ((b.path || "").split(".").pop() || "file").toUpperCase().slice(0, 4); var fname = b.label || "Document"; return '<div class="vb col filec"><div class="frow"><span class="fext">' + esc(fx) + '</span><span class="vt"><b>' + esc(fname) + "</b><small>Document</small></span></div>" + '<div class="row2"><a class="btn sm" target="_blank" rel="noopener noreferrer" href="' + esc(fu) + '">' + ic("eye") + ' Dekho</a><a class="btn sm ghost" href="' + esc(dlUrl(fu, /\.[a-z0-9]{2,5}$/i.test(fname) ? fname : fname + "." + fx.toLowerCase())) + '">' + ic("download") + " Download</a></div></div>"; }
      case "detail": return '<div class="vb"><span class="vi">' + ic("hash") + '</span><span class="vt">' + (b.label ? "<small>" + esc(b.label) + "</small>" : "") + "<b>" + esc(v) + '</b></span><button class="btn sm ghost" data-copy="' + esc(v) + '" aria-label="Copy">' + ic("copy") + "</button></div>";
      case "phone": return '<div class="vb"><span class="vi">' + ic("phone") + '</span><span class="vt"><b>' + esc(b.label || "Call karo") + "</b><small>" + esc(v) + '</small></span><button class="btn sm ghost" data-copy="' + esc(v) + '" aria-label="Copy">' + ic("copy") + '</button><a class="btn sm" href="tel:' + esc(digits(v)) + '">Call</a></div>';
      case "whatsapp": return action("https://wa.me/" + digits(v).replace(/^\+/, "") + (b.extra ? "?text=" + encodeURIComponent(b.extra) : ""), "chat", b.label || "WhatsApp", "Chat kholo", true);
      case "email": return action("mailto:" + v, "mail", b.label || "Email bhejo", v);
      case "location": { var isU = /^https?:\/\//i.test(v), lu = isU ? v : "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(v);
        return '<div class="vb col locc"><a class="frow" style="color:inherit;text-decoration:none" target="_blank" rel="noopener noreferrer" href="' + esc(lu) + '"><span class="vi">' + ic("pin") + '</span><span class="vt"><b>' + esc(b.label || (isU ? "Location" : v)) + "</b><small>" + esc(b.label && !isU ? v : "Maps mein kholo") + '</small></span><span class="vch">' + ic("chev") + "</span></a>" +
          (isU ? "" : '<iframe class="map" loading="lazy" referrerpolicy="no-referrer" title="Map" src="https://maps.google.com/maps?q=' + encodeURIComponent(v) + '&output=embed&z=15"></iframe>') + "</div>"; }
      case "contact": return '<div class="vb col"><div class="frow"><span class="vi">' + ic("user") + '</span><span class="vt"><b>' + esc(b.label || "Contact") + "</b><small>" + esc(v) + (b.extra ? " · " + esc(b.extra) : "") + '</small></span></div><div class="row2"><button class="btn sm" data-vcf data-n="' + esc(b.label || "") + '" data-t="' + esc(v) + '" data-e="' + esc(b.extra || "") + '">' + ic("download") + ' Save contact</button>' + (digits(v) ? '<a class="btn sm ghost" href="tel:' + esc(digits(v)) + '">' + ic("phone") + " Call</a>" : "") + "</div></div>";
      case "wifi": return '<div class="vb col"><div class="frow"><span class="vi">' + ic("wifi") + '</span><span class="vt"><small>Wi-Fi</small><b>' + esc(b.label || "Wi-Fi") + "</b>" + (v ? "<small>Password: " + esc(v) + "</small>" : "<small>Open network</small>") + '</span>' + (v ? '<button class="btn sm ghost" data-copy="' + esc(v) + '" aria-label="Copy">' + ic("copy") + "</button>" : "") + '</div><canvas class="wq" data-wifi="' + esc(wifiStr(b.label, v)) + '"></canvas><p class="hint center" style="margin:8px 0 0">Dusre phone se is QR ko scan karke seedha connect karo</p></div>';
      case "upi": return '<div class="vb col"><a class="frow" style="color:inherit;text-decoration:none" href="upi://pay?pa=' + encodeURIComponent(v) + "&pn=" + encodeURIComponent(b.label || "") + '"><span class="vi">' + ic("rupee") + '</span><span class="vt"><b>Pay ' + esc(b.label || "") + "</b><small>" + esc(v) + '</small></span><span class="vch">' + ic("chev") + '</span></a><button class="btn sm ghost block" style="margin-top:10px" data-copy="' + esc(v) + '">' + ic("copy") + " UPI ID copy karo</button></div>";
      case "links": { var li = (b.items || []).filter(function (x) { return x && safeUrl(x.u); }); if (!li.length) return ""; return '<div class="vb col lib">' + (b.label ? '<div class="txh">' + esc(b.label) + "</div>" : "") + li.map(function (x) { var u = safeUrl(x.u); return '<a class="lbtn" target="_blank" rel="noopener noreferrer" href="' + esc(u) + '"><span>' + esc(x.t || hostOf(u)) + (x.t ? "<small>" + esc(hostOf(u)) + "</small>" : "") + "</span>" + ic("chev") + "</a>"; }).join("") + "</div>"; }
      case "social": { var so = (b.items || []).filter(function (x) { return x && socUrl(x.p, x.v); }); if (!so.length) return ""; return '<div class="vb col soc">' + (b.label ? '<div class="txh sh">' + esc(b.label) + "</div>" : "") + so.map(function (x) { var sd = SOC[x.p]; return '<a class="sb" target="_blank" rel="noopener noreferrer" href="' + esc(socUrl(x.p, x.v)) + '"><i style="background:' + sd[1] + '">' + (x.p === "instagram" ? ic("insta", 21) : esc(sd[2])) + "</i><span><b>" + esc(sd[0]) + "</b><small>" + esc(String(x.v).replace(/^https?:\/\/(www\.)?/i, "")) + "</small></span></a>"; }).join("") + "</div>"; }
      case "lead": return '<form class="vb col leadf" data-lead autocomplete="off"><div class="txh">' + esc(b.label || "Mujhse sampark karo") + '</div><input name="n" maxlength="80" placeholder="Aapka naam" aria-label="Aapka naam"><input name="p" type="tel" maxlength="30" inputmode="tel" placeholder="Phone number" aria-label="Phone number"><textarea name="m" maxlength="600" placeholder="Message (optional)" aria-label="Message"></textarea><div class="err" style="margin-top:8px"></div><button class="btn" type="submit">' + ic("send") + " " + esc(b.value || "Bhejo") + "</button></form>";
    }
    return "";
  }
  function lightbox(url, cap) {
    var o = document.createElement("div"); o.className = "lb";
    o.innerHTML = '<div class="lbt"><button class="icon-btn" aria-label="Close">' + ic("back") + '</button><span>' + esc(cap || "") + '</span><a class="icon-btn" aria-label="Save" href="' + esc(dlUrl(url, cap || "photo")) + '">' + ic("download") + '</a></div><div class="lbs"><img alt="" src="' + esc(url) + '"></div>';
    document.body.appendChild(o); document.body.style.overflow = "hidden";
    function close() { o.remove(); document.body.style.overflow = ""; }
    $(".icon-btn", o).onclick = close; var im = $("img", o); im.onclick = function () { o.classList.toggle("z"); };
  }
  function bindViewer() {
    $$("img[data-zoom]").forEach(function (im) { var ph = im.parentNode, done = function () { ph.classList.remove("sk"); }; if (im.complete) done(); else { im.onload = done; im.onerror = function () { ph.classList.remove("sk"); ph.innerHTML = '<div class="cap" style="padding:20px;text-align:center">Photo load nahi hui</div>'; }; } im.onclick = function () { lightbox(im.getAttribute("data-zoom"), im.getAttribute("data-cap")); }; });
    $$("[data-view]").forEach(function (b) { b.onclick = function () { lightbox(b.getAttribute("data-view"), b.getAttribute("data-cap")); }; });
    $$(".view > .vb, .view > .shr").forEach(function (e, i) { e.style.animation = "rise .5s both"; e.style.animationDelay = Math.min(i, 12) * 70 + "ms"; });
    $$("[data-vcf]").forEach(function (b) { b.onclick = function () { download(new Blob([vcf(b.getAttribute("data-n"), b.getAttribute("data-t"), b.getAttribute("data-e"))], { type: "text/vcard" }), fname(b.getAttribute("data-n") || "contact") + ".vcf"); toast("Contact file download ho gayi ✅"); }; });
    $$("canvas.wq").forEach(function (c) { try { paint(c, c.getAttribute("data-wifi"), { fg: "#111111", bg: "#ffffff", shape: "square" }, 360, true); } catch (e) {} });
    var sh = $("#vshare"); if (sh) sh.onclick = function () { var d = { title: document.title, url: location.href }; if (navigator.share) navigator.share(d).catch(function () {}); else copyText(location.href, "Link copy ho gaya ✅"); };
    var cl = $("#vcopy"); if (cl) cl.onclick = function () { copyText(location.href, "Link copy ho gaya ✅"); };
    $$("form[data-lead]").forEach(function (f) {
      f.onsubmit = async function (e) {
        e.preventDefault(); var n = f.elements.n.value.trim(), p = f.elements.p.value.trim(), m = f.elements.m.value.trim(), er = $(".err", f), bt = $("button", f); er.textContent = "";
        if (!n && !p && !m) { er.textContent = "Kuch to likho"; return; }
        bt.disabled = true; var r = await sb.rpc("qr_lead_submit", { p_slug: curSlug, p_name: n, p_phone: p, p_msg: m, p_password: curPw });
        if (r.error) { bt.disabled = false; er.textContent = /too many/i.test(r.error.message) ? "Bahut zyada requests, thodi der baad try karo" : "Bhej nahi paaye, dobara try karo"; return; }
        f.innerHTML = '<div class="ok">Shukriya! Aapki details bhej di gayi hain ✅</div>';
      };
    });
  }

  /* ---------- shell, nav, sheets ---------- */
  function userMd() { return (session && session.user && session.user.user_metadata) || {}; }
  function userName() { var md = userMd(); return md.name || md.username || (session && session.user.email ? session.user.email.split("@")[0] : "User"); }
  function userHandle() { var md = userMd(); return md.username || (session && session.user.email ? session.user.email.split("@")[0] : ""); }

  function shell(active, inner, noNav) {
    $app.innerHTML = '<div class="screen rise' + (noNav ? " noNav" : "") + '">' + inner + "</div>" + (noNav ? "" :
      '<nav class="nav"><div>' +
      '<button data-go="#/" class="' + (active === "home" ? "on" : "") + '">' + ic("home") + "<span>Home</span></button>" +
      '<button class="fab" data-scan="1" aria-label="QR Scan"><span class="c">' + ic("scan") + "</span></button>" +
      '<button data-go="#/profile" class="' + (active === "profile" ? "on" : "") + '">' + ic("user") + "<span>Profile</span></button></div></nav>");
    bindGo(); window.scrollTo(0, 0);
  }
  function bindGo() {
    $$("[data-go]").forEach(function (e) { e.onclick = function () { var h = e.getAttribute("data-go"); if (location.hash === h) route(); else location.hash = h; }; });
    $$("[data-scan]").forEach(function (e) { e.onclick = openScanner; });
  }
  function sheet(html, mount) {
    closeSheet(); var o = document.createElement("div"); o.className = "sheet-ov"; o.innerHTML = '<div class="sheet"><div class="grab"></div>' + html + "</div>";
    document.body.appendChild(o); o.onclick = function (e) { if (e.target === o) closeSheet(); }; if (mount) mount($(".sheet", o)); return o;
  }
  function closeSheet() { var o = document.querySelector(".sheet-ov"); if (o) o.remove(); }

  /* ---------- PWA install + copy delegation ---------- */
  var deferredPrompt = null;
  var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
  var isStandalone = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone;
  function canInstall() { return !isStandalone && (deferredPrompt || isIOS); }
  async function doInstall() {
    if (deferredPrompt) { deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; }
    else if (isIOS) alert("iPhone par: Safari mein Share (⬆️) dabao → 'Add to Home Screen'.");
    else alert("Browser menu (⋮) → 'Install app' ya 'Add to Home screen' chuno.");
  }
  window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); deferredPrompt = e; });
  window.addEventListener("appinstalled", function () { toast("App install ho gaya ✅"); });
  document.addEventListener("click", function (e) { var t = e.target.closest && e.target.closest("[data-copy]"); if (t) { e.preventDefault(); copyText(t.getAttribute("data-copy")); } });
  if ("serviceWorker" in navigator) window.addEventListener("load", function () { navigator.serviceWorker.register("/sw.js").catch(function () {}); });

  /* ---------- QR scanner (camera + upload) ---------- */
  function loadScript(src) { return new Promise(function (res, rej) { var t = document.createElement("script"); t.src = src; t.onload = res; t.onerror = rej; document.head.appendChild(t); }); }
  var jsqrP = null;
  function getJsQR() {
    if (window.jsQR) return Promise.resolve(window.jsQR);
    if (!jsqrP) jsqrP = loadScript("https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js").catch(function () { return loadScript("https://unpkg.com/jsqr@1.4.0/dist/jsQR.js"); }).then(function () { return window.jsQR; }).catch(function () { jsqrP = null; return null; });
    return jsqrP;
  }
  var bd = null;
  function jsqrOn(J, cv, x, y, w, h) {
    var g = cv.getContext("2d", { willReadFrequently: true }), id = g.getImageData(x, y, w, h);
    var c = J(id.data, id.width, id.height, { inversionAttempts: "attemptBoth" }); return c && c.data ? c.data : null;
  }
  async function decodeCanvas(cv, deep) {
    if ("BarcodeDetector" in window) { try { bd = bd || new window.BarcodeDetector({ formats: ["qr_code"] }); var r = await Promise.race([bd.detect(cv), new Promise(function (res) { setTimeout(function () { res(null); }, 1500); })]); if (r && r.length && r[0].rawValue) return r[0].rawValue; } catch (e) {} }
    var J = await getJsQR(); if (!J) return null;
    var W = cv.width, H = cv.height, t = jsqrOn(J, cv, 0, 0, W, H); if (t) return t;
    // centre crop (QR usually in the middle of the frame, bigger = easier to read)
    var cw = Math.round(W * 0.7), ch = Math.round(H * 0.7); t = jsqrOn(J, cv, Math.round((W - cw) / 2), Math.round((H - ch) / 2), cw, ch); if (t) return t;
    if (deep) { // overlapping tiles for photos where the QR is small
      var tw = Math.round(W * 0.6), th = Math.round(H * 0.6), xs = [0, W - tw], ys = [0, H - th];
      for (var i = 0; i < 2; i++) for (var j = 0; j < 2; j++) { t = jsqrOn(J, cv, xs[i], ys[j], tw, th); if (t) return t; }
    }
    return null;
  }
  async function decodeBitmap(bmp) {
    var cv = document.createElement("canvas"), sizes = [1600, 1000, 640];
    for (var i = 0; i < sizes.length; i++) {
      var sc = Math.min(1, sizes[i] / Math.max(bmp.width, bmp.height)); cv.width = Math.round(bmp.width * sc); cv.height = Math.round(bmp.height * sc);
      var g = cv.getContext("2d", { willReadFrequently: true }); g.fillStyle = "#fff"; g.fillRect(0, 0, cv.width, cv.height); g.drawImage(bmp, 0, 0, cv.width, cv.height);
      var t = await decodeCanvas(cv, true); if (t) return t;
      if (sc === 1 && i > 0) break;
    }
    return null;
  }
  function isOurHost(h) { return h === location.hostname || /^(www\.)?qrown\.in$/.test(h) || /^(qrown|qraura)\.[a-z0-9-]+\.workers\.dev$/.test(h); }
  function camError(x) {
    var n = x && x.name;
    if (n === "NotAllowedError" || n === "SecurityError") return "Camera ki permission band hai. Browser/site settings mein Camera → Allow karo, ya neeche Gallery se QR upload karo.";
    if (n === "NotFoundError" || n === "OverconstrainedError") return "Is device mein camera nahi mila. Gallery se QR upload karo.";
    if (n === "NotReadableError" || n === "AbortError") return "Camera kisi aur app mein chal raha hai. Wo app band karke 'Dobara try' dabao.";
    return "Camera start nahi hua. 'Dobara try' dabao ya Gallery se QR upload karo.";
  }
  async function getCam() {
    var tries = [{ video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false }, { video: { facingMode: "environment" }, audio: false }, { video: true, audio: false }], err;
    for (var i = 0; i < tries.length; i++) { try { return await navigator.mediaDevices.getUserMedia(tries[i]); } catch (x) { err = x; if (x && (x.name === "NotAllowedError" || x.name === "SecurityError")) break; } }
    throw err;
  }
  function openScanner() {
    if ($(".scan")) return; closeSheet();
    var ov = document.createElement("div"); ov.className = "scan";
    ov.innerHTML = '<video id="sv" playsinline muted autoplay></video><div class="top"><button class="icon-btn" id="sx" aria-label="Band karo">' + ic("x") + '</button><b>QR Scan</b><span style="width:44px"></span></div><div class="frame"><i></i><i></i><i></i><i></i></div>' +
      '<div class="bot"><p id="sst">Camera chalu ho raha hai…</p><div class="row" id="stools" style="justify-content:center;margin-bottom:10px;display:none"><button class="btn sm ghost" id="storch" type="button" style="display:none">🔦 Torch</button><button class="btn sm ghost" id="szoom" type="button" style="display:none">🔍 Zoom 1x</button></div><div class="row" style="justify-content:center;gap:10px"><button class="btn ghost" id="sretry" type="button" style="display:none">Dobara try</button><label class="btn ghost" style="cursor:pointer">' + ic("image") + ' Gallery se QR upload<input id="sfile" type="file" accept="image/*" hidden></label></div></div><div class="res" id="sres"></div>';
    document.body.appendChild(ov);
    var stream = null, alive = true, vid = $("#sv", ov), st = $("#sst", ov), cv = document.createElement("canvas");
    function stop() { alive = false; if (stream) stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; }
    function close() { stop(); ov.remove(); }
    function done(text) {
      stop(); $(".frame", ov).style.display = "none"; $(".bot", ov).style.display = "none";
      try { var u = new URL(text); if (isOurHost(u.hostname) && /^\/s\/[A-Za-z0-9]+\/?$/.test(u.pathname)) { ov.remove(); location.href = location.origin + u.pathname; return; } } catch (e) {}
      var link = /^https?:\/\//i.test(text) ? safeUrl(text) : "";
      $("#sres", ov).innerHTML = '<div class="sheet"><div class="grab"></div><h2>QR mil gaya ✅</h2><div class="vb" style="margin-top:14px"><span class="vi">' + ic(link ? "link" : "text") + '</span><span class="vt"><small>QR mein likha hai</small><div class="tx">' + esc(text) + '</div></span></div><div class="row">' +
        (link ? '<a class="btn grow" target="_blank" rel="noopener noreferrer" href="' + esc(link) + '">' + ic("ext") + " Open</a>" : "") + '<button class="btn ghost grow" data-copy="' + esc(text) + '">' + ic("copy") + ' Copy</button></div><div class="row" style="margin-top:10px"><button class="btn line block" id="sagain">' + ic("scan") + " Dobara scan karo</button></div>" +
        (link ? '<p class="hint center" style="margin:12px 0 0">⚠️ Link kholne se pehle dekh lo ki aap use jaante ho.</p>' : "") + "</div>";
      $("#sagain", ov).onclick = function () { ov.remove(); openScanner(); };
    }
    $("#sx", ov).onclick = close;
    $("#sretry", ov).onclick = function () { ov.remove(); openScanner(); };
    $("#sfile", ov).onchange = async function (e) {
      var f = e.target.files[0]; if (!f) return; st.textContent = "Image padh raha hoon…";
      try {
        var bmp; try { bmp = await createImageBitmap(f, { imageOrientation: "from-image" }); } catch (e1) { bmp = await createImageBitmap(f); }
        var t = await decodeBitmap(bmp); if (t) done(t); else st.textContent = "Is image mein QR nahi mila. QR poora, saaf aur seedha dikhna chahiye (screenshot sabse achha).";
      } catch (x) { st.textContent = "Image khul nahi paayi. Dusri photo/screenshot try karo."; }
      e.target.value = "";
    };
    (async function () {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { st.textContent = "Camera is browser mein nahi chal raha (Chrome/Safari mein kholo). Gallery se QR upload karo."; return; }
      try {
        stream = await getCam();
        if (!alive) { stop(); return; }
        vid.srcObject = stream; await vid.play(); st.textContent = "QR ko frame ke andar laao"; if (!("BarcodeDetector" in window)) getJsQR();
        var tr = stream.getVideoTracks()[0], caps = (tr && tr.getCapabilities && tr.getCapabilities()) || {};
        try { if (caps.focusMode && caps.focusMode.indexOf("continuous") >= 0) tr.applyConstraints({ advanced: [{ focusMode: "continuous" }] }); } catch (e) {}
        var tools = $("#stools", ov);
        if (caps.torch) { tools.style.display = "flex"; var tb = $("#storch", ov), on = false; tb.style.display = ""; tb.onclick = function () { on = !on; tr.applyConstraints({ advanced: [{ torch: on }] }).catch(function () {}); tb.textContent = on ? "🔦 Torch ON" : "🔦 Torch"; }; }
        if (caps.zoom && caps.zoom.max > 1.5) { tools.style.display = "flex"; var zb = $("#szoom", ov), zs = [1, Math.min(2, caps.zoom.max), Math.min(3, caps.zoom.max)], zi = 0; zb.style.display = ""; zb.onclick = function () { zi = (zi + 1) % zs.length; tr.applyConstraints({ advanced: [{ zoom: zs[zi] }] }).catch(function () {}); zb.textContent = "🔍 Zoom " + zs[zi].toFixed(zs[zi] % 1 ? 1 : 0) + "x"; }; }
      } catch (x) { st.textContent = camError(x); $("#sretry", ov).style.display = ""; return; }
      var ctx = cv.getContext("2d", { willReadFrequently: true }), busy = false, tick = 0;
      var timer = setInterval(async function () {
        if (!alive) return clearInterval(timer); if (busy || !vid.videoWidth) return; busy = true; tick++;
        try { var sc = Math.min(1, 1000 / Math.max(vid.videoWidth, vid.videoHeight)); cv.width = Math.round(vid.videoWidth * sc); cv.height = Math.round(vid.videoHeight * sc); ctx.drawImage(vid, 0, 0, cv.width, cv.height); var t = await decodeCanvas(cv, tick % 4 === 0); if (t && alive) { clearInterval(timer); done(t); } } catch (e) {}
        busy = false;
      }, 150);
    })();
  }

  /* ---------- welcome / auth ---------- */
  function authView() {
    $app.innerHTML = '<div class="welcome rise">' + pill() + '<div class="brand"><div class="mark">' + LOGO + '</div><h1>' + esc(BRAND) + '</h1><span class="tag">' + ic("crown", 13) + ' PREMIUM QR VAULT</span><div style="margin-top:10px;font-size:12px;letter-spacing:.18em;color:var(--faint)">BY RATHOD</div><p>Apna QR banao. Sab kuch ek scan mein.</p></div>' +
      '<div class="card" style="padding:18px"><div class="seg"><button id="tnew" type="button" class="on">' + ic("plus") + ' New user</button><button id="told" type="button">' + ic("user") + ' Old user</button></div>' +
      '<form id="sf"><label class="inp">' + ic("user") + '<input id="sn" required maxlength="40" placeholder="Aapka naam" autocomplete="name" aria-label="Aapka naam"></label>' +
      '<label class="inp">' + ic("lock") + '<input type="password" id="sp" required minlength="6" placeholder="Password (kam se kam 6)" autocomplete="new-password" aria-label="Password"></label>' +
      '<div class="hint" style="margin:-2px 0 12px">Username aapke naam se apne aap ban jayega ✨</div><div class="err" id="se"></div><button class="btn block" id="ssub">Account banao</button></form>' +
      '<form id="lf2" style="display:none"><label class="inp">' + ic("user") + '<input id="lu" required autocapitalize="off" autocomplete="username" placeholder="Username (jaise neetu4821)" aria-label="Username"></label>' +
      '<label class="inp">' + ic("lock") + '<input type="password" id="lp2" required placeholder="Password" autocomplete="current-password" aria-label="Password"></label><div class="err" id="le"></div><button class="btn block" id="lsub">Login</button></form></div>' +
      '<button class="btn ghost block" id="scan2" style="margin-top:2px">' + ic("scan") + " QR scan karo / upload karo</button>" +
      '<div class="perks"><span>' + ic("file") + ' PDF 40MB</span><span>' + ic("rupee") + " UPI</span><span>" + ic("lock") + " Password lock</span><span>" + ic("download") + ' PNG / SVG</span></div><div class="links"><a href="/terms">Terms</a><a href="/privacy">Privacy</a><a href="/contact">Contact admin</a><a href="https://teachnlogy7509-pixel.github.io/RATHOD-HUB/rathod-hub-versions.html" target="_blank" rel="noopener">Rathod Hub family</a></div></div>';
    function tab(isNew) { $("#sf").style.display = isNew ? "" : "none"; $("#lf2").style.display = isNew ? "none" : ""; $("#tnew").className = isNew ? "on" : ""; $("#told").className = isNew ? "" : "on"; }
    bindPill(); $("#tnew").onclick = function () { tab(true); }; $("#told").onclick = function () { tab(false); }; $("#scan2").onclick = openScanner;
    $("#sf").onsubmit = async function (e) {
      e.preventDefault(); var err = $("#se"); err.textContent = ""; $("#ssub").disabled = true;
      var name = $("#sn").value.trim(), pass = $("#sp").value, username = "";
      try {
        var res = await fetch(CFG.SUPABASE_URL + "/functions/v1/signup", { method: "POST", headers: { "Content-Type": "application/json", apikey: CFG.SUPABASE_ANON_KEY }, body: JSON.stringify({ name: name, password: pass }) });
        var d = await res.json(); if (!res.ok || !d.username) throw new Error(d.error || "Account nahi ban paaya"); username = d.username;
      } catch (x) { err.textContent = x.message; $("#ssub").disabled = false; return; }
      sessionStorage.setItem("qr_new_username", username);
      var li = await sb.auth.signInWithPassword({ email: username + "@qraura.app", password: pass }); $("#ssub").disabled = false;
      if (li.error) err.textContent = "Account ban gaya! Username: " + username + " – ab Old user se login karo. (" + li.error.message + ")";
    };
    $("#lf2").onsubmit = async function (e) {
      e.preventDefault(); var err = $("#le"); err.textContent = ""; $("#lsub").disabled = true;
      var un = $("#lu").value.trim().toLowerCase().replace(/^@/, "").replace(/@qraura\.app$/, "");
      var li = await sb.auth.signInWithPassword({ email: un + "@qraura.app", password: $("#lp2").value }); $("#lsub").disabled = false;
      if (li.error) err.textContent = /invalid/i.test(li.error.message) ? "Username ya password galat hai" : li.error.message;
    };
  }

  /* ---------- home ---------- */
  var COLS = "id,owner,slug,title,description,blocks,style,has_password,is_active,public_index,expires_at,max_scans,starts_at,folder,view,scan_count,last_scanned_at,created_at,updated_at";
  var cache = [], LC = {}, curFolder = null;
  function renderList() {
    var folders = []; cache.forEach(function (q) { if (q.folder && folders.indexOf(q.folder) < 0) folders.push(q.folder); }); folders.sort();
    if (curFolder && curFolder !== "__none" && folders.indexOf(curFolder) < 0) curFolder = null;
    var none = cache.filter(function (q) { return !q.folder; }).length;
    $("#fch").innerHTML = folders.length ? '<div class="fchips"><button class="chip' + (curFolder === null ? " on" : "") + '" data-fo="">' + "<span>Sab</span> (" + cache.length + ")</button>" +
      folders.map(function (f) { return '<button class="chip' + (curFolder === f ? " on" : "") + '" data-fo="' + esc(f) + '">' + ic("folder", 14) + " " + esc(f) + " (" + cache.filter(function (q) { return q.folder === f; }).length + ")</button>"; }).join("") +
      (none && none < cache.length ? '<button class="chip' + (curFolder === "__none" ? " on" : "") + '" data-fo="__none"><span>Bina folder</span> (' + none + ")</button>" : "") + "</div>" : "";
    $$("[data-fo]").forEach(function (b) { b.onclick = function () { var v = b.getAttribute("data-fo"); curFolder = v === "" ? null : v; renderList(); }; });
    var shown = cache.filter(function (q) { return curFolder === null ? true : curFolder === "__none" ? !q.folder : q.folder === curFolder; });
    $("#cnt").textContent = cache.length ? shown.length + " total" : "";
    var zb = $("#zipb"); zb.style.display = shown.length ? "" : "none"; zb.onclick = function () { zipAll(shown); };
    $("#list").innerHTML = shown.map(function (q) {
      var expd = (q.expires_at && new Date(q.expires_at) < new Date()) || (q.max_scans && q.scan_count >= q.max_scans), soon = q.starts_at && new Date(q.starts_at) > new Date();
      return '<button class="qi" data-id="' + q.id + '"><canvas></canvas><span class="m"><b>' + esc(q.title) + '</b><span class="meta"><span>' + ic("eye", 14) + " " + q.scan_count + "</span><span>" + ic("file", 14) + " " + q.blocks.length + "</span>" + (q.has_password ? "<span>" + ic("lock", 14) + " Locked</span>" : "") + (q.public_index ? "<span>" + ic("link", 14) + " Google</span>" : "") + (LC[q.id] ? "<span>📨 " + LC[q.id] + "</span>" : "") + (q.folder ? "<span>" + ic("folder", 14) + " " + esc(q.folder) + "</span>" : "") + (expd ? "<span>⏳ Expired</span>" : soon ? "<span>⏰ Schedule</span>" : q.max_scans || q.expires_at ? "<span>⏳ Limit</span>" : "") + '<span><i class="dot' + (q.is_active ? "" : " off") + '"></i> ' + (q.is_active ? "Active" : "Off") + '</span></span></span><span class="go">' + ic("chev") + "</span></button>";
    }).join("");
    $$(".qi").forEach(function (el) {
      var q = cache.filter(function (x) { return x.id === el.getAttribute("data-id"); })[0];
      paint($("canvas", el), shareUrl(q.slug), q.style, 192, true); el.onclick = function () { qrSheet(q); };
    });
  }
  async function home() {
    var nu = sessionStorage.getItem("qr_new_username");
    shell("home",
      '<div class="hello"><div class="avatar">' + esc(userName().charAt(0).toUpperCase()) + '</div><div class="t"><small>Namaste 👋</small><b>' + esc(userName()) + '</b></div><button class="icon-btn bell" id="bell" aria-label="Notifications">' + ic("bell") + '<span class="bb" id="bellb"></span></button><span class="vip">' + ic("crown", 13) + " VIP</span></div>" +
      (nu ? '<div class="banner"><b>🎉 Account ban gaya!</b><div class="u">@' + esc(nu) + '</div><div class="hint">Ye aapka <b>username</b> hai. Login ke liye yaad rakho ya screenshot lo. Password bhoolne par recover nahi hoga.</div><div class="row" style="margin-top:12px"><button class="btn sm grow" id="cpu">' + ic("copy") + ' Copy username</button><button class="btn sm ghost grow" id="cls">Samajh gaya</button></div></div>' : "") +
      '<button class="cta" id="newqr"><span class="ct"><b>Naya QR banao</b><small>Text, photo, PDF, UPI – sab chhupao</small></span><span class="pl">' + ic("plus") + "</span></button>" +
      '<div class="stats" id="stats"><div class="stat"><b>–</b><small>QR codes</small></div><div class="stat"><b>–</b><small>Scans</small></div><div class="stat"><b>–</b><small>Locked</small></div></div>' +
      '<div class="sect"><h2>Mere QR codes</h2><button class="btn sm ghost zipb" id="zipb" style="display:none">' + ic("download", 15) + ' ZIP</button><span id="cnt"></span></div><div id="fch"></div><div id="list"><div class="loading"><div class="spin"></div></div></div>');
    $("#newqr").onclick = function () { location.hash = "#/new"; };
    $("#bell").onclick = activitySheet; setBadge(actCount); pollActivity();
    if (nu) { $("#cpu").onclick = function () { copyText(nu, "Username copy ho gaya ✅"); }; $("#cls").onclick = function () { sessionStorage.removeItem("qr_new_username"); $(".banner").remove(); }; }
    var rs = await Promise.all([sb.from("qr_codes").select(COLS).order("created_at", { ascending: false }), sb.rpc("qr_lead_counts")]), r = rs[0];
    if (r.error) { $("#list").innerHTML = '<div class="empty">Error: ' + esc(r.error.message) + "</div>"; return; }
    cache = r.data; LC = (rs[1] && !rs[1].error && rs[1].data) || {};
    var scans = cache.reduce(function (a, q) { return a + (q.scan_count || 0); }, 0), locked = cache.filter(function (q) { return q.has_password; }).length;
    $("#stats").innerHTML = '<div class="stat"><b>' + cache.length + "</b><small>QR codes</small></div><div class=\"stat\"><b>" + scans + "</b><small>Scans</small></div><div class=\"stat\"><b>" + locked + "</b><small>Locked</small></div>";
    if (!cache.length) { $("#cnt").textContent = ""; $("#list").innerHTML = '<div class="empty"><div class="em">' + ic("qr") + '</div><b style="color:var(--txt);font-size:17px">Abhi koi QR nahi hai</b><p style="margin:6px 0 16px">Pehla QR banao aur scan karke dekho.</p><button class="btn" id="e1">' + ic("plus") + " Pehla QR banao</button></div>"; $("#e1").onclick = function () { location.hash = "#/new"; }; return; }
    renderList();
  }
  async function shareQr(q) {
    var cv = qrFramed(shareUrl(q.slug), q.style, 1024), blob = await new Promise(function (r) { cv.toBlob(r, "image/png"); });
    var text = q.title + " – " + shareUrl(q.slug);
    try { var file = new File([blob], fname(q.title) + ".png", { type: "image/png" }); if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], text: text, title: q.title }); return; } } catch (e) { if (e && e.name === "AbortError") return; }
    download(blob, fname(q.title) + ".png"); window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank"); toast("QR image download ho gayi – WhatsApp mein attach karo");
  }
  async function dupQr(q) {
    toast("Copy ban rahi hai…");
    var r = await sb.rpc("qr_save", { p_id: null, p_title: (q.title + " (copy)").slice(0, 120), p_description: q.description, p_blocks: q.blocks, p_style: q.style, p_password: null, p_active: true, p_public: false, p_limits: { expires_at: q.expires_at, max_scans: q.max_scans, starts_at: q.starts_at }, p_folder: q.folder || "", p_view: q.view || {} });
    if (r.error) return toast(r.error.message);
    closeSheet(); toast(q.has_password ? "Copy ban gayi ✅ (password copy nahi hota – naya lagao)" : "Copy ban gayi ✅"); home();
  }
  async function leadsSheet(q) {
    sheet("<h2>Leads</h2><p class=\"hint center\">" + esc(q.title) + '</p><div class="loading" style="min-height:120px"><div class="spin"></div></div>');
    var r = await sb.rpc("qr_leads_list", { p_id: q.id });
    if (r.error) { sheet("<h2>Leads</h2><p class=\"hint center\">" + esc(r.error.message) + "</p>"); return; }
    var L = r.data || [];
    sheet("<h2>Leads (" + L.length + ")</h2><p class=\"hint center\">" + esc(q.title) + "</p>" + (L.length ? '<div class="row nw" style="margin-bottom:14px"><button class="btn grow" data-l="csv">' + ic("download") + ' CSV download</button><button class="btn danger grow" data-l="clr">' + ic("trash") + " Sab saaf karo</button></div>" +
      L.map(function (x) { return '<div class="ldr"><b>' + esc(x.name || "—") + "</b><small>" + esc(fmtShort(x.at)) + "</small>" + (x.msg ? "<p>" + esc(x.msg) + "</p>" : "") + (x.phone ? '<div class="row nw"><a class="btn sm ghost grow" href="tel:' + esc(digits(x.phone)) + '">' + ic("phone") + " " + esc(x.phone) + '</a><a class="btn sm ghost grow" target="_blank" rel="noopener noreferrer" href="https://wa.me/' + esc(digits(x.phone).replace(/^\+/, "")) + '">' + ic("chat") + " WhatsApp</a></div>" : "") + "</div>"; }).join("") : '<p class="hint center" style="margin:20px 0">Abhi koi lead nahi aayi.</p>'),
      function (sh) {
        sh.onclick = async function (e) {
          var b = e.target.closest("[data-l]"); if (!b) return; var a = b.getAttribute("data-l");
          if (a === "csv") { var q2 = function (s) { return '"' + String(s == null ? "" : s).replace(/"/g, '""') + '"'; }; var csv = "\ufeffName,Phone,Message,Time\r\n" + L.map(function (x) { return [x.name, x.phone, x.msg, fmtIST(x.at)].map(q2).join(","); }).join("\r\n"); download(new Blob([csv], { type: "text/csv;charset=utf-8" }), fname(q.title) + "-leads.csv"); }
          else if (a === "clr") { if (!confirm("Saari leads delete karni hain?")) return; var d = await sb.rpc("qr_leads_clear", { p_id: q.id }); if (d.error) toast(d.error.message); else { LC[q.id] = 0; toast("Saaf ho gaya"); leadsSheet(q); } }
        };
      });
  }
  function qrSheet(q) {
    var hasLead = (q.blocks || []).some(function (b) { return b.type === "lead"; });
    sheet('<h2>' + esc(q.title) + '</h2><canvas class="bigqr"></canvas><div class="linkpill">' + ic("link", 15) + " " + esc(shareUrl(q.slug)) + '</div>' +
      '<div class="row nw" style="margin-bottom:12px"><button class="btn grow" data-a="png">' + ic("download") + ' PNG</button><button class="btn line grow" data-a="svg">' + ic("download") + ' SVG</button><button class="btn ghost grow" data-a="copy">' + ic("copy") + " Link</button></div>" +
      '<div class="row nw" style="margin-bottom:12px"><button class="btn ghost grow" data-a="poster">' + ic("image") + ' Poster</button><button class="btn ghost grow" data-a="stats">' + ic("chart") + " Analytics</button></div>" +
      '<div class="row nw" style="margin-bottom:12px"><button class="btn ghost grow" data-a="wa">' + ic("share") + ' WhatsApp / Share</button><button class="btn ghost grow" data-a="dup">' + ic("copy") + " Duplicate</button></div>" +
      '<button class="lrow" data-a="open">' + ic("ext") + ' Page kholo<span class="sub">scan jaisa dikhega</span></button><button class="lrow" data-a="edit">' + ic("edit") + ' Edit karo</button><button class="lrow" data-a="rename">' + ic("text") + ' Naam badlo</button>' +
      '<button class="lrow" data-a="folder">' + ic("folder") + ' Folder badlo<span class="sub">' + esc(q.folder || "—") + "</span></button>" + (hasLead ? '<button class="lrow" data-a="leads">' + ic("users") + " Leads" + (LC[q.id] ? " (" + LC[q.id] + ")" : "") + "</button>" : "") +
      '<div class="lrow" style="cursor:default">' + ic("power") + 'QR active<span class="sub"><label class="sw" style="min-height:0"><input type="checkbox" id="actsw"' + (q.is_active ? " checked" : "") + '></label></span></div><button class="lrow red" data-a="del">' + ic("trash") + " Delete karo</button>",
      function (sh) {
        paint($(".bigqr", sh), shareUrl(q.slug), q.style, 460);
        $("#actsw", sh).onchange = async function (e) { var on = e.target.checked; var rr = await save_(q, { p_active: on }); if (rr.error) { toast(rr.error.message); e.target.checked = !on; } else { q.is_active = on; toast(on ? "QR active ✅" : "QR band kar diya"); } };
        sh.onclick = async function (e) {
          var b = e.target.closest("[data-a]"); if (!b) return; var a = b.getAttribute("data-a");
          if (a === "png") dlPng(q); else if (a === "svg") dlSvg(q); else if (a === "copy") copyText(shareUrl(q.slug), "Link copy ho gaya ✅"); else if (a === "poster") dlPoster(q); else if (a === "stats") statsSheet(q);
          else if (a === "wa") shareQr(q); else if (a === "dup") dupQr(q); else if (a === "leads") leadsSheet(q);
          else if (a === "open") { if (q.max_scans && !confirm("Is QR par scan limit hai – page kholne se ek scan gina jayega. Kholna hai?")) return; window.open(shareUrl(q.slug), "_blank"); }
          else if (a === "edit") { closeSheet(); location.hash = "#/edit/" + q.id; }
          else if (a === "folder") { var ex = []; cache.forEach(function (x) { if (x.folder && ex.indexOf(x.folder) < 0) ex.push(x.folder); }); var fn = prompt("Folder ka naam (khali chhodo = folder hatao)" + (ex.length ? "\nMojooda: " + ex.join(", ") : "") + ":", q.folder || ""); if (fn === null) return; var fr = await save_(q, { p_folder: fn.trim().slice(0, 30) }); if (fr.error) toast(fr.error.message); else { toast("Folder badal gaya ✅"); closeSheet(); home(); } }
          else if (a === "rename") { var nn = prompt("Naya naam:", q.title); if (nn === null || !nn.trim()) return; var rr = await save_(q, { p_title: nn.trim() }); if (rr.error) toast(rr.error.message); else { toast("Naam badal gaya ✅"); closeSheet(); home(); } }
          else if (a === "del") { if (!confirm("Ye QR delete karna hai? Print kiya hua QR kaam karna band kar dega.")) return; var d = await sb.from("qr_codes").delete().eq("id", q.id); if (d.error) toast(d.error.message); else { dropFiles(qPaths(q), q.id); closeSheet(); toast("Delete ho gaya"); home(); } }
        };
      });
  }
  async function statsSheet(q) {
    sheet("<h2>Analytics</h2><p class=\"hint center\">" + esc(q.title) + '</p><div class="loading" style="min-height:120px"><div class="spin"></div></div>');
    var r = await sb.rpc("qr_stats", { p_id: q.id });
    if (r.error) { sheet("<h2>Analytics</h2><p class=\"hint center\">" + esc(r.error.message) + "</p>"); return; }
    var d = r.data, days = d.days || [], mx = Math.max(1, Math.max.apply(null, days.map(function (x) { return x.n; }))), dv = d.dev || {}, tot = Math.max(1, Object.keys(dv).reduce(function (a, k) { return a + dv[k]; }, 0));
    var names = { mobile: "📱 Mobile", desktop: "💻 Desktop", tablet: "📟 Tablet", other: "Other" };
    var last = d.last ? new Date(d.last).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—";
    sheet("<h2>Analytics</h2><p class=\"hint center\">" + esc(q.title) + '</p><div class="an3"><div><b>' + (d.total || 0) + "</b><span>Total scans</span></div><div><b>" + (d.today || 0) + "</b><span>Aaj</span></div><div><b>" + last + "</b><span>Last scan</span></div></div>" +
      '<h3 class="anh">Pichhle 14 din</h3><div class="bars">' + days.map(function (x) { return '<div class="bar" title="' + x.d + ": " + x.n + '"><i style="height:' + Math.max(4, Math.round(x.n / mx * 100)) + '%"></i><small>' + (+x.d.slice(8)) + "</small></div>"; }).join("") + "</div>" +
      '<h3 class="anh">Device</h3>' + (Object.keys(dv).length ? Object.keys(dv).map(function (k) { return '<div class="dvr"><span>' + (names[k] || k) + '</span><div class="dvb"><i style="width:' + Math.round(dv[k] / tot * 100) + '%"></i></div><b>' + dv[k] + "</b></div>"; }).join("") : '<p class="hint">Abhi koi scan nahi hua.</p>') + '<p class="hint center" style="margin-top:14px">Sirf time aur device type gina jata hai – naam, IP ya location nahi.</p>');
  }
  function save_(q, over) {
    var a = { p_id: q.id, p_title: q.title, p_description: q.description, p_blocks: q.blocks, p_style: q.style, p_password: null, p_active: q.is_active };
    for (var k in over) a[k] = over[k]; return sb.rpc("qr_save", a);
  }

  /* ---------- profile ---------- */
  async function profile() {
    shell("profile",
      '<div class="pbig"><div class="avatar">' + esc(userName().charAt(0).toUpperCase()) + "</div><b>" + esc(userName()) + '</b><button class="unchip" id="cpun">@' + esc(userHandle()) + " " + ic("copy", 15) + '</button><div style="margin-top:12px"><span class="vip">' + ic("crown", 13) + " VIP MEMBER</span></div></div>" +
      '<div class="stats" id="pst"><div class="stat"><b>–</b><small>QR codes</small></div><div class="stat"><b>–</b><small>Scans</small></div><div class="stat"><b>–</b><small>Locked</small></div></div><div class="acc"><button type="button" class="acch" data-acc>' + ic("user") + '<b>Account</b>' + ic("chev") + '</button><div class="accb"><button class="lrow" id="pn">' + ic("edit") + ' Naam badlo<span class="sub">' + ic("chev") + '</span></button><button class="lrow" id="pp">' + ic("key") + ' Password badlo<span class="sub">' + ic("chev") + '</span></button><button class="lrow" id="ps">' + ic("scan") + ' QR scan / upload<span class="sub">' + ic("chev") + "</span></button>" +
      (canInstall() || !isStandalone ? '<button class="lrow" id="pi">' + ic("phoneapp") + ' App install karo<span class="sub">' + ic("chev") + "</span></button>" : "") + "</div></div>" +
      '<div class="acc"><button type="button" class="acch" data-acc>' + ic("gear") + '<b>Settings</b>' + ic("chev") + '</button><div class="accb accp"><p class="hint" style="margin:0 0 8px">Theme</p><div class="seg" id="thseg" style="margin-bottom:14px"><button type="button" data-th="dark" class="' + (THEME === "dark" ? "on" : "") + '">🌙 Dark</button><button type="button" data-th="light" class="' + (THEME === "light" ? "on" : "") + '">☀️ Light</button></div>' +
      '<p class="hint" style="margin:0 0 8px">Language / भाषा</p><div class="seg" id="lgseg" style="margin-bottom:14px">' + [["hg", "Hinglish"], ["en", "English"], ["hi", "हिन्दी"]].map(function (x) { return '<button type="button" data-lg3="' + x[0] + '" class="' + (LANG === x[0] ? "on" : "") + '">' + x[1] + "</button>"; }).join("") + '</div>' +
      '<div class="sw"><div class="tx"><b>Scan alerts</b><small>Naya scan ya lead aane par notification (app khula ya background mein ho tab)</small></div><input type="checkbox" id="ntf"></div></div></div>' +
      '<div class="acc open"><button type="button" class="acch" data-acc>' + ic("crown") + '<b>Rathod Hub family – Join karo</b>' + ic("chev") + '</button><div class="accb"><a class="lrow hubrow" href="https://teachnlogy7509-pixel.github.io/RATHOD-HUB/" target="_blank" rel="noopener" style="text-decoration:none">' + ic("crown") + '<span class="ht"><b>Rathod Hub</b><small>Original Rathod Hub app</small></span><span class="sub joinb">Join karo ' + ic("ext", 14) + '</span></a><a class="lrow hubrow" href="https://teachnlogy7509-pixel.github.io/RATHOD-HUB-2.0/" target="_blank" rel="noopener" style="text-decoration:none">' + ic("crown") + '<span class="ht"><b>Rathod Hub 2.0</b><small>Naya version – aur features</small></span><span class="sub joinb">Join karo ' + ic("ext", 14) + '</span></a><a class="lrow hubrow" href="https://teachnlogy7509-pixel.github.io/RATHOD-HUB-3.0/" target="_blank" rel="noopener" style="text-decoration:none">' + ic("crown") + '<span class="ht"><b>Rathod Hub 3.0</b><small>Latest version</small></span><span class="sub joinb">Join karo ' + ic("ext", 14) + '</span></a></div></div>' +
      '<div class="sect"><h2>Help &amp; Info</h2></div><div class="group"><a class="lrow" href="/contact" style="text-decoration:none">' + ic("insta") + ' Contact admin<span class="sub">@' + IG + '</span></a><a class="lrow" href="https://t.me/' + TG + '" target="_blank" rel="noopener" style="text-decoration:none">' + ic("send") + ' Telegram<span class="sub">@' + TG + '</span></a><a class="lrow" href="mailto:' + MAIL + '" style="text-decoration:none">' + ic("mail") + ' Email<span class="sub">' + MAIL + '</span></a><a class="lrow" href="/terms" style="text-decoration:none">' + ic("file") + ' Terms &amp; Conditions<span class="sub">' + ic("chev") + '</span></a><a class="lrow" href="/privacy" style="text-decoration:none">' + ic("shield") + ' Privacy Policy<span class="sub">' + ic("chev") + '</span></a><button class="lrow" id="psh">' + ic("ext") + ' App share karo<span class="sub">' + ic("chev") + '</span></button></div>' +
      '<div class="group"><button class="lrow red" id="plo">' + ic("logout") + " Logout</button></div>" +
      '<p class="hint center" style="margin-top:20px">' + ic("shield", 14) + " Aapka data secure hai · Qrown</p>");
    $("#cpun").onclick = function () { copyText(userHandle(), "Username copy ho gaya ✅"); };
    $("#pn").onclick = function () { editProfile("name"); }; $("#pp").onclick = function () { editProfile("pass"); }; $("#ps").onclick = openScanner;
    $$("[data-acc]").forEach(function (b) { b.onclick = function () { b.parentNode.classList.toggle("open"); }; });
    var pi = $("#pi"); if (pi) pi.onclick = doInstall;
    $$("[data-th]").forEach(function (b) { b.onclick = function () { THEME = b.getAttribute("data-th"); applyTheme(); $$("[data-th]").forEach(function (x) { x.classList.toggle("on", x === b); }); }; });
    $$("[data-lg3]").forEach(function (b) { b.onclick = function () { setLang(b.getAttribute("data-lg3")); $$("[data-lg3]").forEach(function (x) { x.classList.toggle("on", x === b); }); }; });
    var nt = $("#ntf"); nt.checked = lsGet("qn_notif") === "1" && (!("Notification" in window) || Notification.permission === "granted");
    nt.onchange = async function () {
      if (!nt.checked) { lsSet("qn_notif", "0"); toast("Alerts band"); return; }
      if ("Notification" in window) { var pm = Notification.permission === "granted" ? "granted" : await Notification.requestPermission(); if (pm !== "granted") { nt.checked = false; toast("Browser settings mein notification allow karo"); return; } }
      lsSet("qn_notif", "1"); toast("Alerts ON 🔔");
    };
    $("#psh").onclick = async function () { var d = { title: BRAND, text: BRAND + " – apna QR banao, sab kuch ek scan mein 👑", url: location.origin }; if (navigator.share) { try { await navigator.share(d); } catch (e) {} } else copyText(location.origin, "App ka link copy ho gaya ✅"); }; $("#plo").onclick = function () { sb.auth.signOut(); };
    var r = await sb.from("qr_codes").select("scan_count,has_password");
    if (!r.error) $("#pst").innerHTML = '<div class="stat"><b>' + r.data.length + "</b><small>QR codes</small></div><div class=\"stat\"><b>" + r.data.reduce(function (a, q) { return a + q.scan_count; }, 0) + "</b><small>Scans</small></div><div class=\"stat\"><b>" + r.data.filter(function (q) { return q.has_password; }).length + "</b><small>Locked</small></div>";
  }
  async function editProfile(kind) {
    if (kind === "name") {
      var n = prompt("Naya naam (username nahi badlega):", userMd().name || ""); if (n === null || !n.trim()) return;
      var r = await sb.auth.updateUser({ data: { name: n.trim().slice(0, 40) } }); if (r.error) return toast(r.error.message);
      session = (await sb.auth.getSession()).data.session; toast("Naam badal gaya ✅"); route();
    } else {
      var p = prompt("Naya password (kam se kam 6 akshar):"); if (p === null) return; if (p.length < 6) return toast("Password bahut chhota hai");
      var r2 = await sb.auth.updateUser({ password: p }); toast(r2.error ? r2.error.message : "Password badal gaya ✅");
    }
  }

  /* ---------- editor ---------- */
  var PRESETS = [{ fg: "#111111", bg: "#ffffff", n: "Classic" }, { fg: "#6b4300", bg: "#fff4d6", n: "Gold" }, { fg: "#2b1a7a", bg: "#f1edff", n: "Royal" }, { fg: "#0b5d3b", bg: "#eafff4", n: "Emerald" }, { fg: "#8a1538", bg: "#fff0f4", n: "Rose" }];
  var ST = null;
  function uploadFile(path, file, onProgress) {
    return new Promise(function (resolve, reject) {
      sb.auth.getSession().then(function (r) {
        var tok = r.data.session && r.data.session.access_token; if (!tok) return reject(new Error("login expire ho gaya, dobara login karo"));
        var x = new XMLHttpRequest();
        x.open("POST", CFG.SUPABASE_URL + "/storage/v1/object/qr-files/" + path.split("/").map(encodeURIComponent).join("/"));
        x.setRequestHeader("Authorization", "Bearer " + tok); x.setRequestHeader("apikey", CFG.SUPABASE_ANON_KEY); x.setRequestHeader("x-upsert", "false"); x.setRequestHeader("cache-control", "max-age=31536000");
        x.upload.onprogress = function (e) { if (e.lengthComputable) onProgress(Math.round(e.loaded / e.total * 100)); };
        x.onload = function () { if (x.status >= 200 && x.status < 300) return resolve(); var m = "status " + x.status; try { m = JSON.parse(x.responseText).message || m; } catch (e) {} reject(new Error(m)); };
        x.onerror = function () { reject(new Error("network error")); };
        x.setRequestHeader("Content-Type", file.type || "application/octet-stream"); x.send(file);
      });
    });
  }
  async function squeeze(file) {
    if (file.type && !/^image\/(jpeg|png|webp|bmp)$/.test(file.type)) return file;
    if (file.size < 350 * 1024) return file;
    try {
      var bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
      var k = Math.min(1, 1920 / Math.max(bmp.width, bmp.height)), w = Math.round(bmp.width * k), h = Math.round(bmp.height * k);
      var c = document.createElement("canvas"); c.width = w; c.height = h; var g = c.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, w, h); g.drawImage(bmp, 0, 0, w, h);
      var blob = await new Promise(function (r) { c.toBlob(r, "image/jpeg", 0.82); });
      if (blob && blob.size < file.size) return new File([blob], "photo.jpg", { type: "image/jpeg" });
    } catch (e) {}
    return file;
  }
  async function editor(id) {
    ST = { id: null, slug: null, title: "", description: "", blocks: [], style: { fg: "#111111", bg: "#ffffff", shape: "square" }, password: "", lockOn: false, hasPw: false, active: true, pub: false, exp: "", max: "", start: "", folder: "", view: {} };
    if (id) {
      $app.innerHTML = '<div class="loading"><div class="spin"></div></div>';
      var r = await sb.from("qr_codes").select(COLS).eq("id", id).single();
      if (r.error) { toast("QR nahi mila"); location.hash = "#/"; return; }
      var q = r.data; ST.id = q.id; ST.slug = q.slug; ST.title = q.title; ST.description = q.description; ST.blocks = q.blocks || []; ST.style = q.style || ST.style; ST.hasPw = q.has_password; ST.lockOn = q.has_password; ST.active = q.is_active; ST.pub = !!q.public_index; ST.max = q.max_scans ? String(q.max_scans) : ""; ST.exp = istLocal(q.expires_at); ST.start = istLocal(q.starts_at); ST.folder = q.folder || ""; ST.view = q.view || {};
    }
    drawEditor();
  }
  function itemRow(type, it, j) {
    var rm = '<button type="button" class="rmi" data-b="itrm" aria-label="Hatao">' + ic("x") + "</button>";
    if (type === "links") return '<div class="itr two" data-j="' + j + '"><div class="stk"><label class="inp"><input data-it="t" maxlength="60" placeholder="Button ka naam" value="' + esc(it.t || "") + '"></label><label class="inp"><input data-it="u" placeholder="https://…" value="' + esc(it.u || "") + '"></label></div>' + rm + "</div>";
    return '<div class="itr" data-j="' + j + '"><label class="inp" style="flex:0 0 120px"><select data-it="p">' + Object.keys(SOC).map(function (k) { return '<option value="' + k + '"' + ((it.p || "instagram") === k ? " selected" : "") + ">" + SOC[k][0] + "</option>"; }).join("") + '</select></label><label class="inp"><input data-it="v" maxlength="120" placeholder="@username ya link" value="' + esc(it.v || "") + '"></label>' + rm + "</div>";
  }
  function blockHtml(b, i) {
    var T = TYPES[b.type];
    var h = '<div class="blk" data-i="' + i + '"><div class="h"><span class="bd">' + ic(T.icon) + "</span><b>" + esc(T.name) + '</b><button data-b="up" aria-label="Upar">' + ic("up") + '</button><button data-b="down" aria-label="Neeche">' + ic("down") + '</button><button class="rm" data-b="rm" aria-label="Hatao">' + ic("trash") + "</button></div>";
    T.fields.forEach(function (f) { h += '<label class="inp' + (f[2] === "area" ? " area" : "") + '">' + (f[2] === "area" ? '<textarea data-f="' + f[0] + '" placeholder="' + esc(f[1]) + '">' + esc(b[f[0]]) + "</textarea>" : '<input data-f="' + f[0] + '" placeholder="' + esc(f[1]) + '" value="' + esc(b[f[0]]) + '">') + "</label>"; });
    if (b.type === "links" || b.type === "social") {
      b.items = b.items || [];
      h += '<div class="its">' + b.items.map(function (it, j) { return itemRow(b.type, it, j); }).join("") + '</div><button type="button" class="btn sm ghost block" data-b="itadd">' + ic("plus") + (b.type === "links" ? " Link jodo" : " Social account jodo") + "</button>";
    }
    if (T.upload) {
      h += '<label class="upl' + (b.url ? " done" : "") + '">' + ic(b.url ? "check" : "download") + "<span>" + (b.url ? "Upload ho gaya – badalne ke liye dabao" : esc(T.hint)) + '</span><input type="file" data-up accept="' + T.upload + '"></label><div class="upbar" style="display:none"><div class="upline"><div class="upfill"></div></div><div class="hint uptxt" style="margin-top:6px"></div></div>';
      if (b.type === "image" && b.url) h += '<img class="thumb" src="' + esc(b.url) + '" alt="">';
    }
    return h + "</div>";
  }
  function drawEditor() {
    var y = window.scrollY;
    var h = '<div class="topbar"><button class="icon-btn" data-go="#/" aria-label="Back">' + ic("back") + "</button><h1>" + (ST.id ? "QR edit karo" : "Naya QR") + '</h1><span style="width:44px"></span></div>' +
      '<div class="card pv"><canvas id="pv"></canvas><div class="pi"><small id="pvt"></small><div class="row" id="dlrow" style="display:none"><button class="btn sm" id="dpng">' + ic("download") + ' PNG</button><button class="btn sm line" id="dsvg">SVG</button><button class="btn sm ghost" id="dcp" aria-label="Link copy">' + ic("copy") + "</button></div></div></div>" +
      (!ST.id && !ST.blocks.length && !ST.title ? '<div class="card"><h3>' + ic("crown", 17) + ' Quick template</h3><div class="chips">' + Object.keys(TPLS).map(function (k) { return '<button type="button" class="chip" data-tpl="' + k + '">' + TPLS[k].n + "</button>"; }).join("") + "</div></div>" : "") +
      '<div class="card"><h3>' + ic("text", 17) + ' Details</h3><label class="inp">' + ic("qr") + '<input id="t" maxlength="120" placeholder="QR ka naam (jaise Mera Card)" value="' + esc(ST.title) + '"></label><label class="inp area"><textarea id="d" maxlength="1000" placeholder="Description – scan karne par upar dikhega (optional)">' + esc(ST.description) + '</textarea></label><label class="inp" style="margin-bottom:0">' + ic("folder") + '<input id="fo" list="fl" maxlength="30" placeholder="Folder (optional) – jaise Dukaan, Shaadi" value="' + esc(ST.folder) + '"><datalist id="fl">' + folderNames().map(function (f) { return '<option value="' + esc(f) + '">'; }).join("") + "</datalist></label></div>" +
      '<div class="card"><h3>' + ic("file", 17) + ' Content (scan par ye sab dikhega)</h3><div id="blocks">' + (ST.blocks.length ? ST.blocks.map(blockHtml).join("") : '<p class="hint" style="margin:0 0 12px">Abhi kuch add nahi kiya. Neeche se shuru karo 👇</p>') + '</div><button class="btn line block" id="addb">' + ic("plus") + " Content add karo</button></div>" +
      '<div class="card"><h3>' + ic("qr", 17) + ' QR ka design</h3><div class="presets">' + PRESETS.map(function (p, i) { return '<button type="button" data-p="' + i + '" aria-label="' + p.n + '" class="' + (ST.style.fg === p.fg && ST.style.bg === p.bg ? "on" : "") + '" style="background:linear-gradient(135deg,' + p.fg + " 50%," + p.bg + ' 50%)"></button>'; }).join("") + "</div>" +
      '<div class="colors"><label>QR rang<input type="color" id="fg" value="' + esc(ST.style.fg) + '"></label><label>Background<input type="color" id="bg" value="' + esc(ST.style.bg) + '"></label></div><div class="warn" id="cw" style="display:none">⚠️ QR dark aur background light rakho, warna scan nahi hoga.</div>' +
      '<div class="seg" style="margin:0 0 4px">' + ["square", "rounded", "dots"].map(function (s) { return '<button type="button" data-sh="' + s + '" class="' + (ST.style.shape === s ? "on" : "") + '">' + { square: "Square", rounded: "Rounded", dots: "Dots" }[s] + "</button>"; }).join("") + "</div>" +
      '<p class="hint" style="margin:14px 0 6px">Center logo</p><div class="seg" style="margin:0">' + [["", "Off"], ["crown", "👑 Crown"], ["letter", "Letter"]].map(function (o) { return '<button type="button" data-lg="' + o[0] + '" class="' + ((ST.style.logo || "") === o[0] ? "on" : "") + '">' + o[1] + "</button>"; }).join("") + "</div>" +
      '<p class="hint" style="margin:14px 0 6px">Frame text (QR ke neeche)</p><div class="seg" style="margin:0 0 8px">' + [["", "Off"], ["SCAN ME", "SCAN ME"], ["SCAN KARO", "SCAN KARO"]].map(function (o) { return '<button type="button" data-fr="' + o[0] + '" class="' + ((ST.style.frame || "") === o[0] ? "on" : "") + '">' + o[1] + "</button>"; }).join("") + '</div><label class="inp" style="margin:0">' + ic("text") + '<input id="frt" maxlength="16" placeholder="Ya apna text likho (jaise MENU)" value="' + esc(ST.style.frame || "") + '"></label></div>' +
      '<div class="card"><h3>' + ic("shield", 17) + ' Security</h3><div class="sw"><div class="tx"><b>Password lock</b><small>Scan karne wale ko password dena padega</small></div><input type="checkbox" id="lk"' + (ST.lockOn ? " checked" : "") + '></div>' +
      '<label class="inp" id="pwbox" style="margin:12px 0 0;' + (ST.lockOn ? "" : "display:none") + '">' + ic("key") + '<input id="pw" type="text" autocomplete="off" placeholder="' + (ST.hasPw ? "Naya password (khali = wahi rahega)" : "QR ka password") + '" value="' + esc(ST.password) + '"></label>' +
      '<div class="sw" style="margin-top:8px"><div class="tx"><b>QR active hai</b><small>Band karoge to scan par "not found" aayega</small></div><input type="checkbox" id="act"' + (ST.active ? " checked" : "") + "></div>" +
      '<div class="sw" style="margin-top:8px"><div class="tx"><b>Google par dikhao</b><small>ON karoge to is QR ka title aur text Google search mein aa sakta hai (password lock ke saath nahi chalega)</small></div><input type="checkbox" id="pub"' + (ST.pub && !ST.lockOn ? " checked" : "") + "></div></div>" +
      '<div class="card"><h3>' + ic("eye", 17) + ' Scan page ka look</h3><p class="hint" style="margin:-4px 0 12px">Scan karne wale ko page kaisa dikhega – theme, cover photo aur welcome message.</p><p class="hint" style="margin:0 0 8px">Theme</p><div class="vts">' + VTS.map(function (t) { return '<button type="button" data-vtc="' + t[0] + '" class="' + ((ST.view.theme || "gold") === t[0] ? "on" : "") + '"><i style="background:' + t[2] + '"></i>' + t[1] + "</button>"; }).join("") + "</div>" +
      '<p class="hint" style="margin:14px 0 6px">Welcome message (optional)</p><label class="inp area"><textarea id="wm" maxlength="300" placeholder="Scan karte hi pehle ye message dikhega…">' + esc(ST.view.welcome || "") + "</textarea></label>" +
      '<label class="upl' + (ST.view.cover_url ? " done" : "") + '">' + ic(ST.view.cover_url ? "check" : "image") + "<span>" + (ST.view.cover_url ? "Cover photo lag gayi – badalne ke liye dabao" : "Cover photo chuno (optional, max 15MB)") + '</span><input type="file" id="cvup" accept="image/*"></label><div class="upbar" id="cvbar" style="display:none"><div class="upline"><div class="upfill"></div></div><div class="hint uptxt" style="margin-top:6px"></div></div>' +
      (ST.view.cover_url ? '<img class="thumb" src="' + esc(ST.view.cover_url) + '" alt=""><button type="button" class="btn sm danger" id="cvrm" style="margin-top:10px">' + ic("trash") + " Cover hatao</button>" : "") + "</div>" +
      '<div class="card"><h3>' + ic("power", 17) + ' Schedule &amp; Self-destruct</h3><p class="hint" style="margin:-4px 0 12px">Optional – QR sirf tay samay par khule, aur limit poori hone par apne aap band ho jaye.</p><p class="hint" style="margin:0 0 6px">Shuru hone ka samay (khali = abhi se)</p><label class="inp">' + ic("power") + '<input id="st" type="datetime-local" value="' + esc(ST.start) + '"></label><p class="hint" style="margin:0 0 6px">Khatam hone ka samay (khali = kabhi nahi)</p><label class="inp">' + ic("power") + '<input id="ex" type="datetime-local" value="' + esc(ST.exp) + '"></label>' +
      '<label class="inp">' + ic("eye") + '<input id="mx" type="number" min="1" max="1000000" inputmode="numeric" placeholder="Max scans (khali = unlimited)" value="' + esc(ST.max) + '"></label><button type="button" class="chip' + (ST.max === "1" ? " on" : "") + '" id="one">🔥 Sirf 1 baar dikhao (secret)</button><p class="hint" style="margin:10px 0 0">Time India (IST) ke hisaab se hai.</p></div>' +
      '<div class="err" id="ee" style="text-align:center"></div><div class="savebar"><div><button class="btn block" id="save">' + ic("check") + " Save karo</button></div></div>";
    $app.innerHTML = '<div class="screen noNav">' + h + "</div>"; bindGo(); window.scrollTo(0, y); wireEditor(); updatePreview();
  }
  function folderNames() { var ex = []; cache.forEach(function (x) { if (x.folder && ex.indexOf(x.folder) < 0) ex.push(x.folder); }); return ex.sort(); }
  function updatePreview() {
    ST.style = { fg: ST.style.fg, bg: ST.style.bg, shape: ST.style.shape, logo: ST.style.logo || "", frame: ST.style.frame || "", ch: ((ST.title || "Q").trim().charAt(0) || "Q").toUpperCase() };
    paint($("#pv"), ST.slug ? shareUrl(ST.slug) : location.origin + "/s/preview1", ST.style, 360);
    $("#pv").style.opacity = ST.slug ? 1 : 0.6; $("#pvt").textContent = ST.slug ? shareUrl(ST.slug) : "Save karoge tab asli QR banega"; $("#dlrow").style.display = ST.slug ? "flex" : "none";
    $("#cw").style.display = lum(ST.style.fg) > lum(ST.style.bg) - 0.25 ? "block" : "none";
  }
  function wireEditor() {
    $("#t").oninput = function (e) { ST.title = e.target.value; }; $("#d").oninput = function (e) { ST.description = e.target.value; };
    $("#fg").oninput = function (e) { ST.style.fg = e.target.value; $$(".presets button").forEach(function (b) { b.classList.remove("on"); }); updatePreview(); };
    $("#bg").oninput = function (e) { ST.style.bg = e.target.value; $$(".presets button").forEach(function (b) { b.classList.remove("on"); }); updatePreview(); };
    $$("[data-p]").forEach(function (b) { b.onclick = function () { var p = PRESETS[+b.getAttribute("data-p")]; ST.style.fg = p.fg; ST.style.bg = p.bg; drawEditor(); }; });
    $$("[data-lg]").forEach(function (b) { b.onclick = function () { ST.style.logo = b.getAttribute("data-lg"); drawEditor(); }; });
    $$("[data-fr]").forEach(function (b) { b.onclick = function () { ST.style.frame = b.getAttribute("data-fr"); drawEditor(); }; });
    $("#frt").oninput = function (e) { ST.style.frame = e.target.value; updatePreview(); };
    $("#mx").oninput = function (e) { ST.max = e.target.value; }; $("#ex").onchange = function (e) { ST.exp = e.target.value; }; $("#st").onchange = function (e) { ST.start = e.target.value; };
    $("#one").onclick = function () { ST.max = ST.max === "1" ? "" : "1"; $("#mx").value = ST.max; $("#one").classList.toggle("on", ST.max === "1"); };
    $("#fo").oninput = function (e) { ST.folder = e.target.value; }; $("#wm").oninput = function (e) { ST.view.welcome = e.target.value; };
    $$("[data-vtc]").forEach(function (b) { b.onclick = function () { ST.view.theme = b.getAttribute("data-vtc"); $$("[data-vtc]").forEach(function (x) { x.classList.toggle("on", x === b); }); }; });
    var cvr = $("#cvrm"); if (cvr) cvr.onclick = function () { if (ST.view.cover_path) dropFiles([ST.view.cover_path], ST.id); delete ST.view.cover_url; delete ST.view.cover_path; drawEditor(); };
    var cvu = $("#cvup"); if (cvu) cvu.onchange = async function () {
      var f = cvu.files[0]; if (!f) return; if (f.type && f.type.indexOf("image/") !== 0) { toast("Sirf photo chuno"); cvu.value = ""; return; } if (f.size > 15 * 1048576) { toast("File 15MB se badi hai"); cvu.value = ""; return; }
      var ext = (f.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8) || "jpg"; toast("Photo optimize ho rahi hai…"); var f2 = await squeeze(f); if (f2 !== f) { f = f2; ext = "jpg"; }
      var bar = $("#cvbar"); bar.style.display = "block"; var fill = $(".upfill", bar), txt = $(".uptxt", bar), path = session.user.id + "/" + uid() + uid() + "." + ext;
      try { await uploadFile(path, f, function (p) { fill.style.width = p + "%"; txt.textContent = "Uploading " + p + "% (" + (f.size / 1048576).toFixed(1) + " MB)"; }); } catch (e) { bar.style.display = "none"; toast("Upload fail: " + e.message); return; }
      if (ST.view.cover_path) dropFiles([ST.view.cover_path], ST.id);
      ST.view.cover_path = path; ST.view.cover_url = sb.storage.from("qr-files").getPublicUrl(path).data.publicUrl; drawEditor(); toast("Upload ho gaya ✅");
    };
    $$("[data-tpl]").forEach(function (b) { b.onclick = function () { var T = TPLS[b.getAttribute("data-tpl")]; ST.title = T.t; ST.description = T.d; ST.max = T.max ? String(T.max) : ""; ST.blocks = T.b.map(function (x) { return newBlock(x[0], x[1]); }); drawEditor(); toast("Template laga diya – ab details bharo ✍️"); }; });
    $$("[data-sh]").forEach(function (b) { b.onclick = function () { ST.style.shape = b.getAttribute("data-sh"); drawEditor(); }; });
    $("#lk").onchange = function (e) { ST.lockOn = e.target.checked; $("#pwbox").style.display = ST.lockOn ? "" : "none"; if (ST.lockOn && ST.pub) { ST.pub = false; $("#pub").checked = false; toast("Password lock ON hai, isliye Google par dikhana band kiya"); } }; $("#pub").onchange = function (e) { if (e.target.checked && ST.lockOn) { e.target.checked = false; toast("Pehle password lock band karo"); return; } ST.pub = e.target.checked; }; $("#pw").oninput = function (e) { ST.password = e.target.value; }; $("#act").onchange = function (e) { ST.active = e.target.checked; };
    $("#addb").onclick = function () {
      sheet('<h2>Kya add karna hai?</h2><p class="hint center" style="margin:0 0 16px">Video save nahi hota. Baaki sab chalega.</p><div class="tiles">' + Object.keys(TYPES).map(function (k) { return '<button class="tile" data-add="' + k + '"><span class="bd">' + ic(TYPES[k].icon) + "</span>" + esc(TYPES[k].name) + "</button>"; }).join("") + "</div>", function (sh) {
        sh.onclick = function (e) { var b = e.target.closest("[data-add]"); if (!b) return; ST.blocks.push(newBlock(b.getAttribute("data-add"))); closeSheet(); drawEditor(); window.scrollTo(0, document.body.scrollHeight); };
      });
    };
    $$(".blk").forEach(function (el) {
      var i = +el.getAttribute("data-i"), b = ST.blocks[i];
      $$("[data-f]", el).forEach(function (inp) { inp.oninput = function () { b[inp.getAttribute("data-f")] = inp.value; }; });
      $$("[data-it]", el).forEach(function (inp) { inp.oninput = inp.onchange = function () { var jr = inp.closest(".itr"); if (jr && b.items[+jr.getAttribute("data-j")]) b.items[+jr.getAttribute("data-j")][inp.getAttribute("data-it")] = inp.value; }; });
      el.onclick = function (e) {
        var bt = e.target.closest("[data-b]"); if (!bt) return; var a = bt.getAttribute("data-b");
        if (a === "itadd") { b.items = b.items || []; b.items.push(b.type === "links" ? { t: "", u: "" } : { p: "instagram", v: "" }); if (b.items.length > 30) b.items.pop(); }
        else if (a === "itrm") { var jr = bt.closest(".itr"); if (jr) b.items.splice(+jr.getAttribute("data-j"), 1); }
        else if (a === "rm") { if (b.path) dropFiles([b.path], ST.id); ST.blocks.splice(i, 1); }
        else if (a === "up" && i > 0) ST.blocks.splice(i - 1, 0, ST.blocks.splice(i, 1)[0]);
        else if (a === "down" && i < ST.blocks.length - 1) ST.blocks.splice(i + 1, 0, ST.blocks.splice(i, 1)[0]);
        drawEditor();
      };
      var up = $("[data-up]", el);
      if (up) up.onchange = async function () {
        var f = up.files[0]; if (!f) return; var T = TYPES[b.type], ext = (f.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8) || "bin";
        if (/^(video|audio)\//.test(f.type) || /^(mp4|mov|mkv|avi|webm|m4v|3gp|flv|wmv|mpg|mpeg|mp3|wav)$/.test(ext)) { toast("Video/audio save nahi ho sakta 🚫"); up.value = ""; return; }
        if (b.type === "image" && f.type && f.type.indexOf("image/") !== 0) { toast("Sirf photo chuno"); up.value = ""; return; }
        if (f.size > T.maxMB * 1024 * 1024) { toast("File " + T.maxMB + "MB se badi hai"); up.value = ""; return; }
        if (b.type === "image") { toast("Photo optimize ho rahi hai…"); var f2 = await squeeze(f); if (f2 !== f) { f = f2; ext = "jpg"; } }
        var bar = $(".upbar", el); bar.style.display = "block"; var fill = $(".upfill", bar), txt = $(".uptxt", bar), path = session.user.id + "/" + uid() + uid() + "." + ext;
        try { await uploadFile(path, f, function (p) { fill.style.width = p + "%"; txt.textContent = "Uploading " + p + "% (" + (f.size / 1048576).toFixed(1) + " MB)"; }); } catch (e) { bar.style.display = "none"; toast("Upload fail: " + e.message); return; }
        if (b.path) dropFiles([b.path], ST.id);
        b.path = path; b.url = sb.storage.from("qr-files").getPublicUrl(path).data.publicUrl; if (!b.label && b.type === "file") b.label = f.name;
        drawEditor(); toast("Upload ho gaya ✅");
      };
    });
    $("#save").onclick = save;
    $("#dpng").onclick = function () { dlPng({ slug: ST.slug, title: ST.title, style: ST.style }); }; $("#dsvg").onclick = function () { dlSvg({ slug: ST.slug, title: ST.title, style: ST.style }); }; $("#dcp").onclick = function () { copyText(shareUrl(ST.slug), "Link copy ho gaya ✅"); };
  }
  async function save() {
    var err = $("#ee"); err.textContent = "";
    if (!ST.title.trim()) { err.textContent = "QR ka naam likho."; $("#t").focus(); return; }
    if (!ST.blocks.length) { err.textContent = "Kam se kam ek content add karo."; return; }
    var pw = null;
    if (!ST.lockOn) pw = ST.hasPw ? "" : null; else if (ST.password) pw = ST.password; else if (!ST.hasPw) { err.textContent = "Password lock ON hai – password likho."; return; }
    ST.style.ch = ((ST.title || "Q").trim().charAt(0) || "Q").toUpperCase();
    var blocks = ST.blocks.map(function (b) { var o = { id: b.id, type: b.type, label: b.label || "", value: b.value || "", extra: b.extra || "", url: b.url || "", path: b.path || "" }; if (b.type === "links") o.items = (b.items || []).filter(function (x) { return x && String(x.u || "").trim(); }).slice(0, 30).map(function (x) { return { t: String(x.t || "").trim().slice(0, 60), u: String(x.u).trim().slice(0, 500) }; }); if (b.type === "social") o.items = (b.items || []).filter(function (x) { return x && String(x.v || "").trim(); }).slice(0, 30).map(function (x) { return { p: SOC[x.p] ? x.p : "instagram", v: String(x.v).trim().slice(0, 200) }; }); return o; });
    var empt = ST.blocks.filter(function (b) { return (b.type === "links" || b.type === "social") && !blocks.filter(function (x) { return x.id === b.id; })[0].items.length; }).length;
    if (empt && blocks.length === empt) { err.textContent = "Links / social mein kam se kam ek entry bharo."; return; }
    if (ST.start && ST.exp && ST.start >= ST.exp) { err.textContent = "Shuru hone ka samay khatam hone se pehle hona chahiye."; return; }
    var vw = {}; if (ST.view.theme && ST.view.theme !== "gold") vw.theme = ST.view.theme; if ((ST.view.welcome || "").trim()) vw.welcome = ST.view.welcome.trim().slice(0, 300); if (ST.view.cover_url) { vw.cover_url = ST.view.cover_url; vw.cover_path = ST.view.cover_path || ""; }
    $("#save").disabled = true;
    var r = await sb.rpc("qr_save", { p_id: ST.id, p_title: ST.title.trim(), p_description: ST.description, p_blocks: blocks, p_style: ST.style, p_password: pw, p_active: ST.active, p_public: ST.pub && !ST.lockOn, p_limits: { expires_at: ST.exp ? ST.exp + ":00+05:30" : null, starts_at: ST.start ? ST.start + ":00+05:30" : null, max_scans: ST.max ? Math.max(1, parseInt(ST.max, 10) || 1) : null }, p_folder: (ST.folder || "").trim(), p_view: vw });
    $("#save").disabled = false; if (r.error) { err.textContent = r.error.message; return; }
    var q = r.data, isNew = !ST.id; ST.id = q.id; ST.slug = q.slug; ST.hasPw = q.has_password; ST.lockOn = q.has_password; ST.pub = !!q.public_index; ST.password = ""; ST.max = q.max_scans ? String(q.max_scans) : "";
    if (isNew) history.replaceState(null, "", "#/edit/" + q.id);
    drawEditor(); toast("Save ho gaya ✅ – ab QR download karo");
  }

  /* ---------- public viewer ---------- */
  var curSlug = "", curPw = null;
  async function viewer(slug) {
    curSlug = slug; curPw = null;
    $app.innerHTML = '<div class="loading"><div class="spin"></div></div>'; var pw = null;
    function setVt(t) { document.body.setAttribute("data-vt", VTS.some(function (x) { return x[0] === t; }) ? t : "gold"); }
    var NF = '<div class="foot"><a href="/">Qrown par apna QR banao →</a></div>', MK = '<div class="mark" style="margin:0 auto 18px;animation:none">' + LOGO + "</div>";
    async function load0() {
      var r = await sb.rpc("qr_scan", { p_slug: slug, p_password: pw, p_dev: devType() });
      if (r.error) { setVt("gold"); $app.innerHTML = '<div class="view"><div class="card">Error: ' + esc(r.error.message) + "</div></div>"; return; }
      var d = r.data, vw = d.view || {}; setVt(vw.theme);
      if (d.status === "not_found") { $app.innerHTML = '<div class="view rise"><div class="vhead" style="margin-top:80px">' + MK + '<h1>QR nahi mila</h1><p>Ye QR band kar diya gaya hai ya galat hai.</p></div>' + NF + "</div>"; return; }
      if (d.status === "expired") { $app.innerHTML = '<div class="view rise"><div class="vhead" style="margin-top:80px">' + MK + '<h1>QR expire ho gaya</h1><p>' + esc(d.title || "") + ' – iski limit ya date poori ho chuki hai.</p></div>' + NF + "</div>"; return; }
      if (d.status === "notyet") { $app.innerHTML = '<div class="view rise"><div class="vhead" style="margin-top:80px">' + MK + '<h1>QR abhi shuru nahi hua</h1><p>' + esc(d.title || "") + " – ye " + esc(fmtIST(d.starts_at)) + ' ko khulega</p></div>' + NF + "</div>"; return; }
      if (d.status === "locked" || d.status === "wrong_password") {
        $app.innerHTML = '<div class="view rise"><div class="vhead" style="margin-top:50px"><div class="mark" style="margin:0 auto 18px;animation:none">' + ic("lock", 38).replace("class=\"i\"", 'class="i" style="stroke:#f8e2a0"') + "</div><h1>" + esc(d.title || "Locked QR") + '</h1><p>Ye QR password se locked hai</p></div><form id="lf" class="card"><label class="inp">' + ic("key") + '<input id="lp" type="password" required autofocus placeholder="Password daalo" aria-label="Password"></label><div class="err">' + (d.status === "wrong_password" ? "Galat password" : "") + '</div><button class="btn block">' + ic("lock") + " Unlock karo</button></form></div>";
        $("#lf").onsubmit = function (e) { e.preventDefault(); pw = $("#lp").value; curPw = pw; load(); }; return;
      }
      document.title = d.title + " – " + (CFG.APP_NAME || "Qrown");
      var cvu = safeUrl(vw.cover_url || ""), wm = String(vw.welcome || "").trim();
      $app.innerHTML = '<div class="view"><div class="vhead rise"><div class="chip">' + ic("qr", 14) + ' QROWN</div><h1>' + esc(d.title) + "</h1>" + (d.description ? "<p>" + linkify(d.description) + "</p>" : "") + "</div>" + (d.left != null ? '<div class="vb burn"><span class="vi">⏳</span><span class="vt"><b>Self-destruct QR</b><small>' + (d.left > 0 ? "Ye QR sirf " + d.left + " baar aur khulega" : "Ye aakhri baar hai – iske baad QR band ho jayega") + "</small></span></div>" : "") + (d.blocks || []).map(renderBlock).join("") + '<div class="shr"><button class="btn ghost" id="vshare">' + ic("ext") + ' Share</button><button class="btn ghost" id="vcopy">' + ic("copy") + ' Link copy</button></div><div class="foot">Made with <a href="/">Qrown</a> · apna QR banao</div><div class="links"><a href="/terms">Terms</a><a href="/privacy">Privacy</a><a href="https://instagram.com/' + IG + '" target="_blank" rel="noopener noreferrer">Report this QR</a></div>' +
        (cvu || wm ? '<div class="cov' + (cvu ? "" : " nocv") + '" id="cov"><h1>' + esc(d.title) + "</h1>" + (wm ? "<p>" + esc(wm) + "</p>" : "") + '<button class="btn" id="covb">Kholo ✨</button></div>' : "") + "</div>";
      bindViewer();
      var cov = $("#cov"); if (cov) { if (cvu) cov.style.backgroundImage = "url(" + JSON.stringify(cvu) + ")"; document.body.style.overflow = "hidden"; $("#covb").onclick = function () { cov.classList.add("out"); document.body.style.overflow = ""; setTimeout(function () { cov.remove(); }, 520); }; }
      var rb = document.querySelector('meta[name=robots]'); if (rb && !rb.hasAttribute("data-pub")) rb.content = "noindex,nofollow";
    }
    async function load() { await load0(); var v = $(".view"); if (v && !$(".lgp", v)) { v.insertAdjacentHTML("afterbegin", pill()); bindPill(); } }
    load();
  }


  /* ---------- v3: translations (Hinglish -> English / Hindi) ---------- */
  [
    // viewer
    ["Copy text", "Copy text", "टेक्स्ट कॉपी करें"], ["Kholne ke liye dabao", "Tap to open", "खोलने के लिए दबाएँ"], ["Zoom", "Zoom", "ज़ूम"], ["Save", "Save", "सेव करें"],
    ["Document", "Document", "दस्तावेज़"], ["Dekho", "View", "देखें"], ["Download", "Download", "डाउनलोड"], ["Call karo", "Call", "कॉल करें"], ["Call", "Call", "कॉल"],
    ["Chat kholo", "Open chat", "चैट खोलें"], ["Email bhejo", "Send email", "ईमेल भेजें"], ["Maps mein kholo", "Open in Maps", "मैप्स में खोलें"], ["Save contact", "Save contact", "कॉन्टैक्ट सेव करें"],
    ["Open network", "Open network", "ओपन नेटवर्क"], ["Dusre phone se is QR ko scan karke seedha connect karo", "Scan this QR from another phone to connect instantly", "दूसरे फ़ोन से यह QR स्कैन करके सीधे कनेक्ट करें"],
    ["UPI ID copy karo", "Copy UPI ID", "UPI ID कॉपी करें"], ["Share", "Share", "शेयर करें"], ["Link copy", "Copy link", "लिंक कॉपी करें"],
    ["· apna QR banao", "· create your own QR", "· अपना QR बनाएँ"], ["Terms", "Terms", "नियम"], ["Privacy", "Privacy", "गोपनीयता"], ["Report this QR", "Report this QR", "इस QR की रिपोर्ट करें"],
    ["Self-destruct QR", "Self-destruct QR", "सेल्फ़-डिस्ट्रक्ट QR"], ["Ye aakhri baar hai – iske baad QR band ho jayega", "This is the last time – the QR will close after this", "यह आख़िरी बार है – इसके बाद QR बंद हो जाएगा"],
    ["QR nahi mila", "QR not found", "QR नहीं मिला"], ["Ye QR band kar diya gaya hai ya galat hai.", "This QR has been turned off or is invalid.", "यह QR बंद कर दिया गया है या ग़लत है।"],
    ["Qrown par apna QR banao →", "Create your own QR on Qrown →", "Qrown पर अपना QR बनाएँ →"], ["QR expire ho gaya", "QR expired", "QR की अवधि समाप्त हो गई"],
    ["QR abhi shuru nahi hua", "This QR hasn't started yet", "यह QR अभी शुरू नहीं हुआ"],
    ["Ye QR password se locked hai", "This QR is locked with a password", "यह QR पासवर्ड से लॉक है"], ["Password daalo", "Enter password", "पासवर्ड डालें"], ["Unlock karo", "Unlock", "अनलॉक करें"], ["Galat password", "Wrong password", "ग़लत पासवर्ड"],
    ["Aapka naam", "Your name", "आपका नाम"], ["Phone number", "Phone number", "फ़ोन नंबर"], ["Message (optional)", "Message (optional)", "संदेश (ज़रूरी नहीं)"], ["Bhejo", "Send", "भेजें"],
    ["Mujhse sampark karo", "Contact me", "मुझसे संपर्क करें"], ["Shukriya! Aapki details bhej di gayi hain ✅", "Thank you! Your details have been sent ✅", "धन्यवाद! आपकी जानकारी भेज दी गई है ✅"],
    ["Kuch to likho", "Please write something", "कुछ तो लिखें"], ["Bahut zyada requests, thodi der baad try karo", "Too many requests, try again later", "बहुत ज़्यादा अनुरोध, थोड़ी देर बाद कोशिश करें"],
    ["Bhej nahi paaye, dobara try karo", "Couldn't send, please try again", "भेज नहीं पाए, दोबारा कोशिश करें"], ["Kholo ✨", "Open ✨", "खोलें ✨"],
    ["Photo load nahi hui", "Photo failed to load", "फ़ोटो लोड नहीं हुई"], ["Copy ho gaya ✅", "Copied ✅", "कॉपी हो गया ✅"], ["Link copy ho gaya ✅", "Link copied ✅", "लिंक कॉपी हो गया ✅"],
    ["Contact file download ho gayi ✅", "Contact file downloaded ✅", "कॉन्टैक्ट फ़ाइल डाउनलोड हो गई ✅"], ["Username copy ho gaya ✅", "Username copied ✅", "यूज़रनेम कॉपी हो गया ✅"],
    ["Facebook", "Facebook", "फ़ेसबुक"],
    // blocks (editor + add sheet)
    ["Text / Message", "Text / Message", "टेक्स्ट / संदेश"], ["Link", "Link", "लिंक"], ["Photo", "Photo", "फ़ोटो"], ["PDF / Document", "PDF / Document", "PDF / दस्तावेज़"], ["Number / Detail", "Number / Detail", "नंबर / डिटेल"],
    ["Phone call", "Phone call", "फ़ोन कॉल"], ["Email", "Email", "ईमेल"], ["Location", "Location", "लोकेशन"], ["Contact card (Save)", "Contact card (Save)", "कॉन्टैक्ट कार्ड (सेव)"], ["UPI payment", "UPI payment", "UPI पेमेंट"],
    ["Link-in-bio (saare links)", "Link-in-bio (all links)", "लिंक-इन-बायो (सारे लिंक)"], ["Social links", "Social links", "सोशल लिंक"], ["Lead form (details maango)", "Lead form (collect details)", "लीड फ़ॉर्म (जानकारी माँगें)"],
    ["Heading (optional)", "Heading (optional)", "शीर्षक (ज़रूरी नहीं)"], ["Text likho…", "Write text…", "टेक्स्ट लिखें…"], ["Button name", "Button name", "बटन का नाम"], ["Caption (optional)", "Caption (optional)", "कैप्शन (ज़रूरी नहीं)"],
    ["Photo chuno (max 15MB)", "Choose photo (max 15MB)", "फ़ोटो चुनें (अधिकतम 15MB)"], ["PDF ya document chuno (max 40MB)", "Choose PDF or document (max 40MB)", "PDF या दस्तावेज़ चुनें (अधिकतम 40MB)"],
    ["Upload ho gaya – badalne ke liye dabao", "Uploaded – tap to change", "अपलोड हो गया – बदलने के लिए दबाएँ"], ["File ka naam", "File name", "फ़ाइल का नाम"], ["Naam", "Name", "नाम"], ["Poora naam", "Full name", "पूरा नाम"],
    ["Value", "Value", "वैल्यू"], ["Jagah ka naam", "Place name", "जगह का नाम"], ["Address ya Google Maps link", "Address or Google Maps link", "पता या Google Maps लिंक"], ["Email (optional)", "Email (optional)", "ईमेल (ज़रूरी नहीं)"],
    ["Email address", "Email address", "ईमेल पता"], ["Wi-Fi naam (SSID)", "Wi-Fi name (SSID)", "Wi-Fi नाम (SSID)"], ["Wi-Fi password (open ho to khali)", "Wi-Fi password (leave empty if open)", "Wi-Fi पासवर्ड (ओपन हो तो खाली)"],
    ["Payee ka naam", "Payee name", "पाने वाले का नाम"], ["Section ka naam (optional)", "Section name (optional)", "सेक्शन का नाम (ज़रूरी नहीं)"], ["Form ka heading (jaise Mujhse sampark karo)", "Form heading (e.g. Contact me)", "फ़ॉर्म का शीर्षक (जैसे मुझसे संपर्क करें)"],
    ["Button ka text (jaise Bhejo)", "Button text (e.g. Send)", "बटन का टेक्स्ट (जैसे भेजें)"], ["Button ka naam", "Button name", "बटन का नाम"], ["@username ya link", "@username or link", "@username या लिंक"],
    ["Link jodo", "Add link", "लिंक जोड़ें"], ["Social account jodo", "Add social account", "सोशल अकाउंट जोड़ें"], ["Hatao", "Remove", "हटाएँ"], ["Upar", "Up", "ऊपर"], ["Neeche", "Down", "नीचे"],
    ["Kya add karna hai?", "What do you want to add?", "क्या जोड़ना है?"], ["Video save nahi hota. Baaki sab chalega.", "Videos can't be saved. Everything else works.", "वीडियो सेव नहीं होता। बाकी सब चलेगा।"],
    // home / nav
    ["Home", "Home", "होम"], ["Profile", "Profile", "प्रोफ़ाइल"], ["Namaste 👋", "Hello 👋", "नमस्ते 👋"], ["Naya QR banao", "Create new QR", "नया QR बनाएँ"],
    ["Text, photo, PDF, UPI – sab chhupao", "Hide text, photos, PDF, UPI – everything", "टेक्स्ट, फ़ोटो, PDF, UPI – सब छुपाएँ"], ["QR codes", "QR codes", "QR कोड"], ["Scans", "Scans", "स्कैन"], ["Locked", "Locked", "लॉक्ड"],
    ["Mere QR codes", "My QR codes", "मेरे QR कोड"], ["Abhi koi QR nahi hai", "No QR yet", "अभी कोई QR नहीं है"], ["Pehla QR banao aur scan karke dekho.", "Create your first QR and scan it.", "पहला QR बनाएँ और स्कैन करके देखें।"],
    ["Pehla QR banao", "Create first QR", "पहला QR बनाएँ"], ["Sab", "All", "सभी"], ["Bina folder", "No folder", "बिना फ़ोल्डर"], ["Google", "Google", "Google"], ["⏳ Expired", "⏳ Expired", "⏳ समाप्त"], ["⏳ Limit", "⏳ Limit", "⏳ सीमा"],
    ["⏰ Schedule", "⏰ Scheduled", "⏰ शेड्यूल"], ["Active", "Active", "चालू"], ["Off", "Off", "बंद"], ["Account ban gaya!", "Account created!", "अकाउंट बन गया!"], ["Copy username", "Copy username", "यूज़रनेम कॉपी करें"], ["Samajh gaya", "Got it", "समझ गया"],
    ["Notifications", "Notifications", "नोटिफ़िकेशन"], ["Sab dekh liya", "Mark all as seen", "सब देख लिया"], ["Dekhne ke 12 ghante baad ye notifications apne aap hat jaati hain.", "Notifications disappear automatically 12 hours after you view them.", "देखने के 12 घंटे बाद ये नोटिफ़िकेशन अपने आप हट जाती हैं।"], ["Dekhne ke 12 ghante baad notifications apne aap hat jaati hain.", "Notifications disappear automatically 12 hours after you view them.", "देखने के 12 घंटे बाद नोटिफ़िकेशन अपने आप हट जाती हैं।"], ["Koi nayi notification nahi hai.", "No new notifications.", "कोई नई नोटिफ़िकेशन नहीं है।"], ["Abhi saaf karo", "Clear now", "अभी साफ़ करें"], ["Saaf ho gaya", "Cleared", "साफ़ हो गया"], ["Scan hua", "Scanned", "स्कैन हुआ"], ["Naya lead", "New lead", "नई लीड"],
    ["Pichhle 7 din mein koi naya scan ya lead nahi aaya.", "No new scans or leads in the last 7 days.", "पिछले 7 दिन में कोई नया स्कैन या लीड नहीं आई।"],
    // QR sheet
    ["PNG", "PNG", "PNG"], ["SVG", "SVG", "SVG"], ["Poster", "Poster", "पोस्टर"], ["Analytics", "Analytics", "एनालिटिक्स"], ["Page kholo", "Open page", "पेज खोलें"], ["scan jaisa dikhega", "looks like a scan", "स्कैन जैसा दिखेगा"],
    ["Edit karo", "Edit", "एडिट करें"], ["Naam badlo", "Rename", "नाम बदलें"], ["QR active", "QR active", "QR चालू"], ["Delete karo", "Delete", "डिलीट करें"], ["WhatsApp / Share", "WhatsApp / Share", "WhatsApp / शेयर"],
    ["Duplicate", "Duplicate", "डुप्लिकेट"], ["Folder badlo", "Change folder", "फ़ोल्डर बदलें"], ["Leads", "Leads", "लीड्स"], ["CSV download", "Download CSV", "CSV डाउनलोड"], ["Sab saaf karo", "Clear all", "सब साफ़ करें"],
    ["Abhi koi lead nahi aayi.", "No leads yet.", "अभी कोई लीड नहीं आई।"], ["Total scans", "Total scans", "कुल स्कैन"], ["Aaj", "Today", "आज"], ["Last scan", "Last scan", "आख़िरी स्कैन"], ["Pichhle 14 din", "Last 14 days", "पिछले 14 दिन"],
    ["Device", "Device", "डिवाइस"], ["Abhi koi scan nahi hua.", "No scans yet.", "अभी कोई स्कैन नहीं हुआ।"], ["Sirf time aur device type gina jata hai – naam, IP ya location nahi.", "Only time and device type are counted – no name, IP or location.", "सिर्फ़ समय और डिवाइस का प्रकार गिना जाता है – नाम, IP या लोकेशन नहीं।"],
    ["Naya naam:", "New name:", "नया नाम:"], ["Naam badal gaya ✅", "Name changed ✅", "नाम बदल गया ✅"], ["Delete ho gaya", "Deleted", "डिलीट हो गया"], ["QR active ✅", "QR active ✅", "QR चालू ✅"], ["QR band kar diya", "QR turned off", "QR बंद कर दिया"],
    ["Ye QR delete karna hai? Print kiya hua QR kaam karna band kar dega.", "Delete this QR? A printed QR will stop working.", "यह QR डिलीट करना है? प्रिंट किया हुआ QR काम करना बंद कर देगा।"],
    // profile / settings
    ["Account", "Account", "अकाउंट"], ["Password badlo", "Change password", "पासवर्ड बदलें"], ["QR scan / upload", "QR scan / upload", "QR स्कैन / अपलोड"], ["App install karo", "Install app", "ऐप इंस्टॉल करें"],
    ["Help & Info", "Help & Info", "मदद और जानकारी"], ["Contact admin", "Contact admin", "एडमिन से संपर्क"], ["Terms & Conditions", "Terms & Conditions", "नियम और शर्तें"], ["Privacy Policy", "Privacy Policy", "प्राइवेसी पॉलिसी"],
    ["App share karo", "Share app", "ऐप शेयर करें"], ["Logout", "Logout", "लॉगआउट"], ["VIP MEMBER", "VIP MEMBER", "VIP सदस्य"], ["Aapka data secure hai · Qrown", "Your data is secure · Qrown", "आपका डेटा सुरक्षित है · Qrown"],
    ["Settings", "Settings", "सेटिंग्स"], ["Theme", "Theme", "थीम"], ["Language / भाषा", "Language / भाषा", "भाषा / Language"], ["Scan alerts", "Scan alerts", "स्कैन अलर्ट"],
    ["Naya scan ya lead aane par notification (app khula ho ya background mein ho tab)", "Notification when a new scan or lead arrives (while the app is open or in background)", "नया स्कैन या लीड आने पर नोटिफ़िकेशन (ऐप खुला या बैकग्राउंड में हो तब)"],
    ["Rathod Hub family – Join karo", "Rathod Hub family – Join us", "Rathod Hub परिवार – जुड़ें"], ["Original Rathod Hub app", "Original Rathod Hub app", "ओरिजिनल Rathod Hub ऐप"], ["Naya version – aur features", "New version – more features", "नया वर्ज़न – और फ़ीचर्स"], ["Latest version", "Latest version", "लेटेस्ट वर्ज़न"], ["Join karo", "Join", "जुड़ें"], ["Telegram", "Telegram", "टेलीग्राम"], ["Telegram par message karo", "Message on Telegram", "टेलीग्राम पर मैसेज करें"], ["Email bhejo", "Send email", "ईमेल भेजें"],
    ["Secure & Safe App", "Secure & Safe App", "सुरक्षित और सेफ़ ऐप"], ["100% free · Koi ads nahi", "100% free · No ads", "100% फ़्री · कोई विज्ञापन नहीं"], ["Aapka password secure hash mein save hota hai – hum bhi use padh nahi sakte", "Your password is stored as a secure hash – even we can't read it", "आपका पासवर्ड सुरक्षित हैश में सेव होता है – हम भी उसे पढ़ नहीं सकते"], ["Signup ke liye email ya phone number nahi maangte", "We don't ask for email or phone number to sign up", "साइन-अप के लिए ईमेल या फ़ोन नंबर नहीं माँगते"], ["Connection HTTPS se encrypted hai", "Connection is encrypted with HTTPS", "कनेक्शन HTTPS से एन्क्रिप्टेड है"], ["Password lock laga kar QR ko private rakh sakte ho", "Keep your QR private with a password lock", "पासवर्ड लॉक लगाकर QR को प्राइवेट रख सकते हैं"], ["Hum aapka data kisi ko bechte nahi", "We never sell your data", "हम आपका डेटा किसी को नहीं बेचते"], ["Apna QR aur files kabhi bhi delete kar sakte ho", "Delete your QRs and files any time", "अपना QR और फ़ाइलें कभी भी डिलीट कर सकते हैं"], ["Made with ❤ by Rathod · Qrown", "Made with ❤ by Rathod · Qrown", "❤ से बनाया – Rathod · Qrown"], ["Secure & Safe App · Aapka data protected", "Secure & Safe App · Your data is protected", "सुरक्षित और सेफ़ ऐप · आपका डेटा सुरक्षित"],
    ["Alerts ON 🔔", "Alerts ON 🔔", "अलर्ट चालू 🔔"], ["Alerts band", "Alerts off", "अलर्ट बंद"], ["Browser settings mein notification allow karo", "Allow notifications in browser settings", "ब्राउज़र सेटिंग्स में नोटिफ़िकेशन की अनुमति दें"],
    ["Password badal gaya ✅", "Password changed ✅", "पासवर्ड बदल गया ✅"],
    // auth
    ["Apna QR banao. Sab kuch ek scan mein.", "Make your QR. Everything in one scan.", "अपना QR बनाएँ। सब कुछ एक स्कैन में।"], ["New user", "New user", "नया यूज़र"], ["Old user", "Old user", "पुराना यूज़र"],
    ["Password (kam se kam 6)", "Password (at least 6)", "पासवर्ड (कम से कम 6)"], ["Username aapke naam se apne aap ban jayega ✨", "Your username will be created automatically from your name ✨", "यूज़रनेम आपके नाम से अपने आप बन जाएगा ✨"],
    ["Account banao", "Create account", "अकाउंट बनाएँ"], ["Username (jaise neetu4821)", "Username (e.g. neetu4821)", "यूज़रनेम (जैसे neetu4821)"], ["Password", "Password", "पासवर्ड"], ["Login", "Login", "लॉगिन"],
    ["QR scan karo / upload karo", "Scan / upload QR", "QR स्कैन / अपलोड करें"], ["PDF 40MB", "PDF 40MB", "PDF 40MB"], ["Password lock", "Password lock", "पासवर्ड लॉक"], ["PNG / SVG", "PNG / SVG", "PNG / SVG"],
    ["Username ya password galat hai", "Wrong username or password", "यूज़रनेम या पासवर्ड ग़लत है"], ["Rathod Hub family", "Rathod Hub family", "Rathod Hub परिवार"],
    // editor
    ["Naya QR", "New QR", "नया QR"], ["QR edit karo", "Edit QR", "QR एडिट करें"], ["Quick template", "Quick template", "क्विक टेम्पलेट"], ["Details", "Details", "डिटेल्स"], ["QR ka naam (jaise Mera Card)", "QR name (e.g. My Card)", "QR का नाम (जैसे मेरा कार्ड)"],
    ["Description – scan karne par upar dikhega (optional)", "Description – shown at the top on scan (optional)", "विवरण – स्कैन पर ऊपर दिखेगा (ज़रूरी नहीं)"], ["Folder (optional) – jaise Dukaan, Shaadi", "Folder (optional) – e.g. Shop, Wedding", "फ़ोल्डर (ज़रूरी नहीं) – जैसे दुकान, शादी"],
    ["Content (scan par ye sab dikhega)", "Content (shown on scan)", "कंटेंट (स्कैन पर यह सब दिखेगा)"], ["Content add karo", "Add content", "कंटेंट जोड़ें"], ["Abhi kuch add nahi kiya. Neeche se shuru karo 👇", "Nothing added yet. Start below 👇", "अभी कुछ नहीं जोड़ा। नीचे से शुरू करें 👇"],
    ["QR ka design", "QR design", "QR का डिज़ाइन"], ["QR rang", "QR colour", "QR का रंग"], ["Background", "Background", "बैकग्राउंड"], ["Square", "Square", "चौकोर"], ["Rounded", "Rounded", "गोल कोने"], ["Dots", "Dots", "डॉट्स"],
    ["Center logo", "Center logo", "सेंटर लोगो"], ["Frame text (QR ke neeche)", "Frame text (below QR)", "फ़्रेम टेक्स्ट (QR के नीचे)"], ["Ya apna text likho (jaise MENU)", "Or write your own text (e.g. MENU)", "या अपना टेक्स्ट लिखें (जैसे MENU)"],
    ["Security", "Security", "सुरक्षा"], ["Scan karne wale ko password dena padega", "Scanner must enter the password", "स्कैन करने वाले को पासवर्ड देना होगा"], ["QR active hai", "QR is active", "QR चालू है"],
    ["Band karoge to scan par \"not found\" aayega", "If turned off, scan shows \"not found\"", "बंद करने पर स्कैन में \"not found\" आएगा"], ["Google par dikhao", "Show on Google", "Google पर दिखाएँ"],
    ["ON karoge to is QR ka title aur text Google search mein aa sakta hai (password lock ke saath nahi chalega)", "If ON, this QR's title and text can appear in Google search (not with password lock)", "ON करने पर इस QR का टाइटल और टेक्स्ट Google सर्च में आ सकता है (पासवर्ड लॉक के साथ नहीं चलेगा)"],
    ["Scan page ka look", "Scan page look", "स्कैन पेज का लुक"], ["Scan karne wale ko page kaisa dikhega – theme, cover photo aur welcome message.", "How the page looks to the scanner – theme, cover photo and welcome message.", "स्कैन करने वाले को पेज कैसा दिखेगा – थीम, कवर फ़ोटो और वेलकम मैसेज।"],
    ["Welcome message (optional)", "Welcome message (optional)", "वेलकम मैसेज (ज़रूरी नहीं)"], ["Scan karte hi pehle ye message dikhega…", "This message shows first when scanned…", "स्कैन करते ही पहले यह संदेश दिखेगा…"],
    ["Cover photo chuno (optional, max 15MB)", "Choose cover photo (optional, max 15MB)", "कवर फ़ोटो चुनें (ज़रूरी नहीं, अधिकतम 15MB)"], ["Cover photo lag gayi – badalne ke liye dabao", "Cover photo added – tap to change", "कवर फ़ोटो लग गई – बदलने के लिए दबाएँ"], ["Cover hatao", "Remove cover", "कवर हटाएँ"],
    ["Schedule & Self-destruct", "Schedule & Self-destruct", "शेड्यूल और सेल्फ़-डिस्ट्रक्ट"], ["Optional – QR sirf tay samay par khule, aur limit poori hone par apne aap band ho jaye.", "Optional – QR opens only in the set time, and closes automatically when the limit is reached.", "ज़रूरी नहीं – QR सिर्फ़ तय समय पर खुले, और सीमा पूरी होने पर अपने आप बंद हो जाए।"],
    ["Shuru hone ka samay (khali = abhi se)", "Start time (empty = from now)", "शुरू होने का समय (खाली = अभी से)"], ["Khatam hone ka samay (khali = kabhi nahi)", "End time (empty = never)", "ख़त्म होने का समय (खाली = कभी नहीं)"],
    ["Max scans (khali = unlimited)", "Max scans (empty = unlimited)", "अधिकतम स्कैन (खाली = असीमित)"], ["🔥 Sirf 1 baar dikhao (secret)", "🔥 Show only once (secret)", "🔥 सिर्फ़ 1 बार दिखाएँ (सीक्रेट)"], ["Time India (IST) ke hisaab se hai.", "Time is in India time (IST).", "समय भारत (IST) के अनुसार है।"],
    ["Save karo", "Save", "सेव करें"], ["QR ka naam likho.", "Write the QR name.", "QR का नाम लिखें।"], ["Kam se kam ek content add karo.", "Add at least one content block.", "कम से कम एक कंटेंट जोड़ें।"], ["Template laga diya – ab details bharo ✍️", "Template applied – now fill in details ✍️", "टेम्पलेट लग गया – अब डिटेल्स भरें ✍️"],
    ["Save ho gaya ✅ – ab QR download karo", "Saved ✅ – now download your QR", "सेव हो गया ✅ – अब QR डाउनलोड करें"], ["Save karoge tab asli QR banega", "Real QR is created when you save", "सेव करने पर असली QR बनेगा"],
    ["Upload ho gaya ✅", "Uploaded ✅", "अपलोड हो गया ✅"], ["Photo optimize ho rahi hai…", "Optimizing photo…", "फ़ोटो ऑप्टिमाइज़ हो रही है…"],
    // scanner
    ["QR Scan", "QR Scan", "QR स्कैन"], ["Camera chalu ho raha hai…", "Starting camera…", "कैमरा चालू हो रहा है…"], ["Dobara try", "Try again", "दोबारा कोशिश"], ["Gallery se QR upload", "Upload QR from gallery", "गैलरी से QR अपलोड"],
    ["QR mil gaya ✅", "QR found ✅", "QR मिल गया ✅"], ["QR mein likha hai", "QR says", "QR में लिखा है"], ["Dobara scan karo", "Scan again", "दोबारा स्कैन करें"], ["Open", "Open", "खोलें"], ["Copy", "Copy", "कॉपी"],
    ["⚠️ Link kholne se pehle dekh lo ki aap use jaante ho.", "⚠️ Check that you trust the link before opening it.", "⚠️ लिंक खोलने से पहले देख लें कि आप उसे जानते हैं।"],
    // templates
    ["💼 Visiting Card", "💼 Visiting Card", "💼 विज़िटिंग कार्ड"], ["🏪 Dukaan / Menu", "🏪 Shop / Menu", "🏪 दुकान / मेन्यू"], ["💸 UPI Payment", "💸 UPI Payment", "💸 UPI पेमेंट"], ["📶 Guest Wi-Fi", "📶 Guest Wi-Fi", "📶 गेस्ट Wi-Fi"],
    ["🎉 Event Invite", "🎉 Event Invite", "🎉 इवेंट इनवाइट"], ["🔗 Link-in-bio", "🔗 Link-in-bio", "🔗 लिंक-इन-बायो"], ["🤫 Secret message (1 baar)", "🤫 Secret message (once)", "🤫 सीक्रेट मैसेज (1 बार)"], ["📨 Enquiry form", "📨 Enquiry form", "📨 इन्क्वायरी फ़ॉर्म"]
  ].forEach(function (x) { T3(x[0], x[1], x[2]); });
  R3(/^Password: (.*)$/, "Password: $1", "पासवर्ड: $1");
  R3(/^Pay (.+)$/, "Pay $1", "$1 को भुगतान करें");
  R3(/^Ye QR sirf (\d+) baar aur khulega$/, "This QR will open only $1 more time(s)", "यह QR सिर्फ़ $1 बार और खुलेगा");
  R3(/^(.*) – iski limit ya date poori ho chuki hai\.$/, "$1 – its limit or date has ended.", "$1 – इसकी सीमा या तारीख़ पूरी हो चुकी है।");
  R3(/^(.*) – ye (.+) ko khulega$/, "$1 – opens on $2", "$1 – $2 को खुलेगा");
  R3(/^(\d+) total$/, "$1 total", "कुल $1");
  R3(/^(\d+) naya scan \/ lead aaya 🔔$/, "$1 new scan / lead 🔔", "$1 नया स्कैन / लीड आई 🔔");
  R3(/^Uploading (\d+)% \((.+)\)$/, "Uploading $1% ($2)", "अपलोड हो रहा है $1% ($2)");
  R3(/^Leads \((\d+)\)$/, "Leads ($1)", "लीड्स ($1)");
  R3(/^File (\d+)MB se badi hai$/, "File is bigger than $1MB", "फ़ाइल $1MB से बड़ी है");

  /* ---------- info pages (public) ---------- */
  var UPDATED = "8 October 2026";
  function docPage(title, body) {
    $app.innerHTML = '<div class="screen noNav rise doc"><div class="topbar"><a class="icon-btn" href="/" aria-label="Home" style="text-decoration:none">' + ic("back") + '</a><h1 style="font-size:17px">' + esc(BRAND) + '</h1><span style="width:44px"></span></div>' + body +
      '<div class="links"><a href="/">Home</a><a href="/terms">Terms</a><a href="/privacy">Privacy</a><a href="/contact">Contact</a></div><p class="hint center" style="margin-top:16px">© 2026 ' + esc(BRAND) + '</p></div>';
    document.title = title + " – " + BRAND; window.scrollTo(0, 0);
  }
  function legalView(kind) {
    if (kind === "terms") return docPage("Terms & Conditions",
      '<h1>Terms &amp; Conditions</h1><p class="upd">Last updated: ' + UPDATED + '</p>' +
      '<p>Welcome to ' + BRAND + '. By creating an account or using the app and website you agree to these terms. If you do not agree, please do not use ' + BRAND + '.</p>' +
      '<h2>1. What ' + BRAND + ' does</h2><p>' + BRAND + ' lets you create QR codes that open a page containing the content you add – text, links, photos, PDFs/documents, phone numbers, UPI IDs and similar details. Anyone who scans the QR (or has its link) can see that content, unless you protect it with a password.</p>' +
      '<h2>2. Your account</h2><ul><li>You sign up with a name and password. A username is generated for you.</li><li>You are responsible for keeping your username and password safe. Because we do not collect an email address, <b>a lost password cannot be recovered</b>.</li><li>You must be at least 13 years old to use ' + BRAND + '.</li></ul>' +
      '<h2>3. Your content</h2><p>You own the content you add. You are fully responsible for it and for having the right to share it. You give ' + BRAND + ' permission to store and display it so the service can work.</p>' +
      '<h2>4. What you must not do</h2><ul><li>Upload or share anything illegal, abusive, hateful, sexually explicit, or that exploits or harms children.</li><li>Run scams, phishing, fake payment requests, malware or misleading links.</li><li>Infringe copyright, trademarks or anyone\'s privacy; impersonate another person or business.</li><li>Upload video or audio files – they are not allowed.</li><li>Abuse, overload, reverse-engineer or attack the service.</li></ul>' +
      '<div class="note">Do not put highly sensitive details (Aadhaar, card numbers, OTPs, passwords) in a QR unless you use the password lock and fully understand the risk. Content in a QR you share is visible to whoever can open it.</div>' +
      '<h2>5. Limits</h2><p>Photos up to 15 MB, PDFs/documents up to 40 MB, up to 100 QR codes per account. We may change limits or features at any time.</p>' +
      '<h2>6. Payments</h2><p>' + BRAND + ' only displays UPI IDs/links you add. We do not process, hold or guarantee any payment. Verify details before paying anyone.</p>' +
      '<h2>7. Removal and suspension</h2><p>We may remove content, disable QR codes or suspend accounts that break these terms or the law, with or without notice. To report a QR, contact the admin (see Contact).</p>' +
      '<h2>8. No warranty</h2><p>' + BRAND + ' is provided "as is". We try to keep it available and secure but cannot promise it will always be error-free or uninterrupted, or that content will never be lost.</p>' +
      '<h2>9. Limitation of liability</h2><p>To the maximum extent allowed by law, ' + BRAND + ' and its admin are not liable for indirect or consequential losses, or for content created by users.</p>' +
      '<h2>10. Changes</h2><p>We may update these terms. Continuing to use ' + BRAND + ' after changes means you accept them.</p>' +
      '<h2>11. Contact</h2><p>Questions? Message the admin on Instagram <a href="https://instagram.com/' + IG + '" target="_blank" rel="noopener noreferrer">@' + IG + '</a>.</p>');
    if (kind === "privacy") return docPage("Privacy Policy",
      '<h1>Privacy Policy</h1><p class="upd">Last updated: ' + UPDATED + '</p>' +
      '<p>Your privacy matters. This policy explains what ' + BRAND + ' collects and how it is used.</p>' +
      '<h2>1. What we collect</h2><ul><li><b>Scan statistics:</b> when a QR is opened we record the time and a coarse device type (mobile / desktop / tablet) so the QR owner can see simple analytics. We do not record your name, IP address or location.</li><li><b>Lead forms:</b> if a QR owner adds a form, the name, phone number and message you type into it are sent to that QR owner (not shown publicly). Only fill it in if you are happy to share those details with them.</li><li><b>Local settings &amp; alerts:</b> your theme, language and notification choice are stored only on your own device.</li><li><b>Account:</b> the name you enter, an auto-generated username, and your password (stored only as a secure hash – we cannot read it). We do not ask for your email or phone number to sign up.</li><li><b>Content you add:</b> text, links, photos, PDFs/documents, phone numbers, UPI IDs, locations and other details you put in a QR, plus QR settings such as colours and password lock.</li><li><b>Usage counts:</b> how many times each QR was opened and when it was last opened. We do not record who scanned it.</li><li><b>Technical data:</b> our hosting and database providers may keep standard server logs (such as IP address and device/browser type) for security and reliability.</li></ul>' +
      '<h2>2. Who can see your content</h2><p>Content inside a QR is <b>public to anyone who has the QR or its link</b>, unless you enable the password lock. Uploaded photos and files have web addresses that can be opened by anyone who knows the address. Only add what you are comfortable sharing.</p>' +
      '<h2>3. Camera and scanning</h2><p>The scanner uses your camera only while it is open, and scanning happens on your device. Photos you pick to read a QR are processed on your device and are not uploaded. On some browsers a small open-source decoding script may be loaded from a public CDN.</p>' +
      '<h2>4. How we use data</h2><p>Only to run the service: show your QR content, let you log in, count scans, keep the service secure and prevent abuse. We do not sell your data and we do not show ads.</p>' +
      '<h2>5. Service providers</h2><p>' + BRAND + ' uses Supabase (login, database and file storage), Cloudflare (hosting) and GitHub (code). They process data on our behalf under their own privacy policies.</p>' +
      '<h2>6. Storage on your device</h2><p>Your login session is stored in your browser (local storage) so you stay signed in. The app may cache its own files to work like an installed app.</p>' +
      '<h2>7. Your choices</h2><ul><li>You can edit or delete any QR and its uploaded files at any time from the app.</li><li>You can change your name and password in Profile.</li><li>To delete your whole account and data, message the admin on Instagram <a href="https://instagram.com/' + IG + '" target="_blank" rel="noopener noreferrer">@' + IG + '</a>.</li></ul>' +
      '<h2>8. Children</h2><p>' + BRAND + ' is not meant for children under 13.</p>' +
      '<h2>9. Changes</h2><p>We may update this policy and will change the date above when we do.</p>' +
      '<h2>10. Contact</h2><p>Privacy questions: Instagram <a href="https://instagram.com/' + IG + '" target="_blank" rel="noopener noreferrer">@' + IG + '</a>.</p>');
    var faq = [["Password bhool gaya, kya karun?", "Hum email nahi lete, isliye password recover nahi hota. Admin se Instagram par sampark karo – naya account banana pad sakta hai."],
      ["Kya video upload ho sakta hai?", "Nahi. Sirf photos (15MB tak), PDF/documents (40MB tak), text, links, numbers, UPI aadi save hote hain."],
      ["Mera QR scan nahi ho raha?", "QR ka rang dark aur background light rakho, aur print saaf aur bada rakho. Camera ko seedha rakho."],
      ["QR ka naam badal sakte hain? Link badlega kya?", "Haan, naam kabhi bhi badlo. QR ka link aur printed QR wahi rehta hai."],
      ["Kisi galat ya spam QR ki report kaise karun?", "Admin ko Instagram, Telegram ya Email par QR ka link bhejo. Hum check karke hata denge."]];
    return docPage("Contact Admin",
      '<h1>Contact Admin</h1><p class="upd">Help, report ya feedback – seedha admin se baat karo.</p>' +
      '<a class="contact" href="https://instagram.com/' + IG + '" target="_blank" rel="noopener noreferrer"><span class="ci">' + ic("insta", 26) + '</span><span><b>@' + IG + '</b><small>Instagram par DM karo · Admin</small></span></a>' +
      '<a class="contact" style="margin-top:12px" href="https://t.me/' + TG + '" target="_blank" rel="noopener noreferrer"><span class="ci">' + ic("send", 26) + '</span><span><b>@' + TG + '</b><small>Telegram par message karo</small></span></a>' +
      '<a class="contact" style="margin-top:12px" href="mailto:' + MAIL + '"><span class="ci">' + ic("mail", 26) + '</span><span><b>' + MAIL + '</b><small>Email bhejo</small></span></a>' +
      '<div class="note">Report karte waqt QR ka link (jaise ' + esc(location.origin) + '/s/abc123) zaroor bhejo.</div>' +
      '<h2>FAQ</h2>' + faq.map(function (f) { return '<details class="faq"><summary>' + esc(f[0]) + "</summary><p>" + esc(f[1]) + "</p></details>"; }).join(""));
  }

  /* ---------- router ---------- */
  async function route() {
    closeSheet(); document.body.style.overflow = "";
    if (!/^\/s\//i.test(location.pathname)) document.body.removeAttribute("data-vt");
    var lg = location.pathname.match(/^\/(terms|privacy|contact)\/?$/); if (lg) return legalView(lg[1]);
    var m = location.pathname.match(/^\/s\/([a-z0-9]+)\/?$/i); if (m) return viewer(m[1].toLowerCase());
    if (!session) return authView();
    var h = location.hash || "#/";
    if (h === "#/new") return editor(null);
    if (h === "#/profile") return profile();
    var e = h.match(/^#\/edit\/([0-9a-f-]{36})$/i); if (e) return editor(e[1]);
    return home();
  }
  function setupScreen() { $app.innerHTML = '<div class="welcome"><div class="card"><h3>⚙️ Setup baaki hai</h3><p>Supabase keys <code>config.js</code> mein daalo aur reload karo.</p></div></div>'; }

  (async function init() {
    applyTheme(); applyLang();
    if (!configured()) return setupScreen();
    sb = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY);
    if (/^\/(s\/|terms|privacy|contact)/.test(location.pathname)) return route();
    var s = await sb.auth.getSession(); session = s.data.session; if (session) startActivity();
    sb.auth.onAuthStateChange(function (ev, sess) { var had = !!session; session = sess; if (sess) startActivity(); if (had !== !!sess) route(); });
    window.addEventListener("hashchange", route); route();
  })();
})();
