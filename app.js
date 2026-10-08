(function () {
  "use strict";
  var CFG = window.APP_CONFIG || {};
  var BRAND = CFG.APP_NAME || "Qrown", IG = "ashish30945";
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
    shield: '<path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z"/><path d="m9 12 2 2 4-4"/>'
  };
  function ic(n, size) { return '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"' + (size ? ' style="font-size:' + size + 'px"' : "") + ">" + (IC[n] || "") + "</svg>"; }
  var LOGO = '<svg viewBox="0 0 64 64" fill="none"><defs><linearGradient id="gg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f8e2a0"/><stop offset=".55" stop-color="#dcaa48"/><stop offset="1" stop-color="#b07a1c"/></linearGradient></defs><path d="M8 24l13 12 11-22 11 22 13-12-5 24H13z" fill="url(#gg)" stroke="url(#gg)" stroke-width="3" stroke-linejoin="round"/><rect x="13" y="51" width="38" height="6" rx="3" fill="url(#gg)"/><circle cx="8" cy="22" r="4" fill="#e6303f"/><circle cx="32" cy="12" r="4.5" fill="#e6303f"/><circle cx="56" cy="22" r="4" fill="#e6303f"/><g fill="#1b1305"><rect x="22" y="38" width="5" height="5" rx="1"/><rect x="30" y="38" width="5" height="5" rx="1"/><rect x="38" y="38" width="5" height="5" rx="1"/><rect x="26" y="44" width="5" height="4" rx="1"/><rect x="34" y="44" width="5" height="4" rx="1"/></g></svg>';

  /* ---------- QR rendering (colors + shapes, PNG + SVG) ---------- */
  function makeModules(text) { var q = new window.QRCodeLib(-1, 2); q.addData(text); q.make(); var n = q.getModuleCount(), m = []; for (var r = 0; r < n; r++) { m[r] = []; for (var c = 0; c < n; c++) m[r][c] = q.isDark(r, c); } return m; }
  function inFinder(r, c, n) { return (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7); }
  function qrCanvas(text, style, px) {
    style = style || {}; px = px || 1024;
    var m = makeModules(text), n = m.length, margin = 4, total = n + margin * 2, s = px / total;
    var cv = document.createElement("canvas"); cv.width = cv.height = px; var g = cv.getContext("2d");
    g.fillStyle = style.bg || "#ffffff"; g.fillRect(0, 0, px, px); g.fillStyle = style.fg || "#111111";
    var shape = style.shape || "square";
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) {
      if (!m[r][c]) continue; var x = (c + margin) * s, y = (r + margin) * s;
      if (shape === "dots" && !inFinder(r, c, n)) { g.beginPath(); g.arc(x + s / 2, y + s / 2, s * 0.46, 0, 6.2832); g.fill(); }
      else if (shape === "rounded") { g.beginPath(); if (g.roundRect) g.roundRect(x, y, s + 0.5, s + 0.5, s * 0.35); else g.rect(x, y, s + 0.5, s + 0.5); g.fill(); }
      else g.fillRect(x, y, s + 0.5, s + 0.5);
    }
    return cv;
  }
  function qrSvg(text, style) {
    style = style || {}; var m = makeModules(text), n = m.length, margin = 4, total = n + margin * 2, shape = style.shape || "square", d = [];
    var out = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + total + " " + total + '" shape-rendering="' + (shape === "square" ? "crispEdges" : "geometricPrecision") + '"><rect width="100%" height="100%" fill="' + esc(style.bg || "#ffffff") + '"/><g fill="' + esc(style.fg || "#111111") + '">';
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) {
      if (!m[r][c]) continue; var x = c + margin, y = r + margin;
      if (shape === "dots" && !inFinder(r, c, n)) out += '<circle cx="' + (x + 0.5) + '" cy="' + (y + 0.5) + '" r="0.46"/>';
      else if (shape === "rounded") out += '<rect x="' + x + '" y="' + y + '" width="1.02" height="1.02" rx="0.35"/>';
      else d.push("M" + x + " " + y + "h1v1h-1z");
    }
    if (d.length) out += '<path d="' + d.join("") + '"/>';
    return out + "</g></svg>";
  }
  function paint(canvas, text, style, px) { var cv = qrCanvas(text, style, px); canvas.width = canvas.height = px; canvas.getContext("2d").drawImage(cv, 0, 0); }
  function download(blob, name) { var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000); }
  function fname(t) { return (String(t || "qr").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "qr"); }
  function dlPng(q) { qrCanvas(shareUrl(q.slug), q.style, 1024).toBlob(function (b) { download(b, fname(q.title) + ".png"); }, "image/png"); }
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
    upi:      { icon: "rupee", name: "UPI payment", fields: [["label", "Payee ka naam", "text"], ["value", "UPI ID (name@bank)", "text"]] }
  };
  function newBlock(type) { return { id: uid(), type: type, label: "", value: "", extra: "", url: "", path: "" }; }

  function action(href, icon, title, sub, external) { return '<a class="vb" ' + (external ? 'target="_blank" rel="noopener noreferrer" ' : "") + 'href="' + esc(href) + '"><span class="vi">' + ic(icon) + '</span><span class="vt"><b>' + esc(title) + "</b>" + (sub ? "<small>" + esc(sub) + "</small>" : "") + '</span><span class="vch">' + ic("chev") + "</span></a>"; }
  function card(icon, inner) { return '<div class="vb"><span class="vi">' + ic(icon) + '</span><span class="vt">' + inner + "</span></div>"; }
  function linkify(t) { return esc(t).replace(/(https?:\/\/[^\s<]+)/g, function (m) { var tail = ""; var x = m.match(/(?:[.,;:!?)]|&quot;|&#39;)+$/); if (x) { tail = x[0]; m = m.slice(0, -tail.length); } return '<a href="' + m + '" target="_blank" rel="noopener noreferrer">' + m + "</a>" + tail; }); }
  function dlUrl(u, name) { return u + (u.indexOf("?") < 0 ? "?" : "&") + "download=" + encodeURIComponent(name || "file"); }
  function hostOf(u) { try { return new URL(u).hostname.replace(/^www\./, ""); } catch (e) { return u; } }
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
      case "upi": return '<div class="vb col"><a class="frow" style="color:inherit;text-decoration:none" href="upi://pay?pa=' + encodeURIComponent(v) + "&pn=" + encodeURIComponent(b.label || "") + '"><span class="vi">' + ic("rupee") + '</span><span class="vt"><b>Pay ' + esc(b.label || "") + "</b><small>" + esc(v) + '</small></span><span class="vch">' + ic("chev") + '</span></a><button class="btn sm ghost block" style="margin-top:10px" data-copy="' + esc(v) + '">' + ic("copy") + " UPI ID copy karo</button></div>";
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
    var sh = $("#vshare"); if (sh) sh.onclick = function () { var d = { title: document.title, url: location.href }; if (navigator.share) navigator.share(d).catch(function () {}); else copyText(location.href, "Link copy ho gaya ✅"); };
    var cl = $("#vcopy"); if (cl) cl.onclick = function () { copyText(location.href, "Link copy ho gaya ✅"); };
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
  async function decodeCanvas(cv) {
    if ("BarcodeDetector" in window) { try { bd = bd || new window.BarcodeDetector({ formats: ["qr_code"] }); var r = await Promise.race([bd.detect(cv), new Promise(function (res) { setTimeout(function () { res(null); }, 1500); })]); if (r && r.length && r[0].rawValue) return r[0].rawValue; } catch (e) {} }
    var J = await getJsQR();
    if (J) { var g = cv.getContext("2d"), id = g.getImageData(0, 0, cv.width, cv.height); var c = J(id.data, id.width, id.height, { inversionAttempts: "attemptBoth" }); if (c && c.data) return c.data; }
    return null;
  }
  function openScanner() {
    if ($(".scan")) return; closeSheet();
    var ov = document.createElement("div"); ov.className = "scan";
    ov.innerHTML = '<video id="sv" playsinline muted autoplay></video><div class="top"><button class="icon-btn" id="sx" aria-label="Band karo">' + ic("x") + '</button><b>QR Scan</b><span style="width:44px"></span></div><div class="frame"><i></i><i></i><i></i><i></i></div>' +
      '<div class="bot"><p id="sst">Camera chalu ho raha hai…</p><label class="btn ghost" style="cursor:pointer">' + ic("image") + ' Gallery se QR upload<input id="sfile" type="file" accept="image/*" hidden></label></div><div class="res" id="sres"></div>';
    document.body.appendChild(ov);
    var stream = null, alive = true, vid = $("#sv", ov), st = $("#sst", ov), cv = document.createElement("canvas");
    function stop() { alive = false; if (stream) stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; }
    function close() { stop(); ov.remove(); }
    function done(text) {
      stop(); $(".frame", ov).style.display = "none"; $(".bot", ov).style.display = "none";
      try { var u = new URL(text); if (u.origin === location.origin && /^\/s\/[A-Za-z0-9]+\/?$/.test(u.pathname)) { ov.remove(); location.href = u.pathname; return; } } catch (e) {}
      var link = /^https?:\/\//i.test(text) ? safeUrl(text) : "";
      $("#sres", ov).innerHTML = '<div class="sheet"><div class="grab"></div><h2>QR mil gaya ✅</h2><div class="vb" style="margin-top:14px"><span class="vi">' + ic(link ? "link" : "text") + '</span><span class="vt"><small>QR mein likha hai</small><div class="tx">' + esc(text) + '</div></span></div><div class="row">' +
        (link ? '<a class="btn grow" target="_blank" rel="noopener noreferrer" href="' + esc(link) + '">' + ic("ext") + " Open</a>" : "") + '<button class="btn ghost grow" data-copy="' + esc(text) + '">' + ic("copy") + ' Copy</button></div><div class="row" style="margin-top:10px"><button class="btn line block" id="sagain">' + ic("scan") + " Dobara scan karo</button></div>" +
        (link ? '<p class="hint center" style="margin:12px 0 0">⚠️ Link kholne se pehle dekh lo ki aap use jaante ho.</p>' : "") + "</div>";
      $("#sagain", ov).onclick = function () { ov.remove(); openScanner(); };
    }
    $("#sx", ov).onclick = close;
    $("#sfile", ov).onchange = async function (e) {
      var f = e.target.files[0]; if (!f) return; st.textContent = "Image padh raha hoon…";
      try {
        var bmp = await createImageBitmap(f), sc = Math.min(1, 1400 / Math.max(bmp.width, bmp.height));
        cv.width = Math.round(bmp.width * sc); cv.height = Math.round(bmp.height * sc); cv.getContext("2d", { willReadFrequently: true }).drawImage(bmp, 0, 0, cv.width, cv.height);
        var t = await decodeCanvas(cv); if (t) done(t); else st.textContent = "Is image mein QR nahi mila. Saaf aur poora QR wali photo chuno.";
      } catch (x) { st.textContent = "Image khul nahi paayi."; }
      e.target.value = "";
    };
    (async function () {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { st.textContent = "Camera is browser mein nahi chal raha. Gallery se QR upload karo."; return; }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
        if (!alive) { stop(); return; }
        vid.srcObject = stream; await vid.play(); st.textContent = "QR ko frame ke andar laao"; if (!("BarcodeDetector" in window)) getJsQR();
      } catch (x) { st.textContent = "Camera ki permission nahi mili. Gallery se QR upload kar sakte ho."; return; }
      var ctx = cv.getContext("2d", { willReadFrequently: true }), busy = false;
      var timer = setInterval(async function () {
        if (!alive) return clearInterval(timer); if (busy || !vid.videoWidth) return; busy = true;
        try { var sc = Math.min(1, 720 / Math.max(vid.videoWidth, vid.videoHeight)); cv.width = Math.round(vid.videoWidth * sc); cv.height = Math.round(vid.videoHeight * sc); ctx.drawImage(vid, 0, 0, cv.width, cv.height); var t = await decodeCanvas(cv); if (t && alive) { clearInterval(timer); done(t); } } catch (e) {}
        busy = false;
      }, 200);
    })();
  }

  /* ---------- welcome / auth ---------- */
  function authView() {
    $app.innerHTML = '<div class="welcome rise"><div class="brand"><div class="mark">' + LOGO + '</div><h1>' + esc(BRAND) + '</h1><span class="tag">' + ic("crown", 13) + ' PREMIUM QR VAULT</span><p>Apna QR banao. Sab kuch ek scan mein.</p></div>' +
      '<div class="card" style="padding:18px"><div class="seg"><button id="tnew" type="button" class="on">' + ic("plus") + ' New user</button><button id="told" type="button">' + ic("user") + ' Old user</button></div>' +
      '<form id="sf"><label class="inp">' + ic("user") + '<input id="sn" required maxlength="40" placeholder="Aapka naam" autocomplete="name" aria-label="Aapka naam"></label>' +
      '<label class="inp">' + ic("lock") + '<input type="password" id="sp" required minlength="6" placeholder="Password (kam se kam 6)" autocomplete="new-password" aria-label="Password"></label>' +
      '<div class="hint" style="margin:-2px 0 12px">Username aapke naam se apne aap ban jayega ✨</div><div class="err" id="se"></div><button class="btn block" id="ssub">Account banao</button></form>' +
      '<form id="lf2" style="display:none"><label class="inp">' + ic("user") + '<input id="lu" required autocapitalize="off" autocomplete="username" placeholder="Username (jaise neetu4821)" aria-label="Username"></label>' +
      '<label class="inp">' + ic("lock") + '<input type="password" id="lp2" required placeholder="Password" autocomplete="current-password" aria-label="Password"></label><div class="err" id="le"></div><button class="btn block" id="lsub">Login</button></form></div>' +
      '<button class="btn ghost block" id="scan2" style="margin-top:2px">' + ic("scan") + " QR scan karo / upload karo</button>" +
      '<div class="perks"><span>' + ic("file") + ' PDF 40MB</span><span>' + ic("rupee") + " UPI</span><span>" + ic("lock") + " Password lock</span><span>" + ic("download") + ' PNG / SVG</span></div><div class="links"><a href="/terms">Terms</a><a href="/privacy">Privacy</a><a href="/contact">Contact admin</a></div></div>';
    function tab(isNew) { $("#sf").style.display = isNew ? "" : "none"; $("#lf2").style.display = isNew ? "none" : ""; $("#tnew").className = isNew ? "on" : ""; $("#told").className = isNew ? "" : "on"; }
    $("#tnew").onclick = function () { tab(true); }; $("#told").onclick = function () { tab(false); }; $("#scan2").onclick = openScanner;
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
  var COLS = "id,owner,slug,title,description,blocks,style,has_password,is_active,scan_count,last_scanned_at,created_at,updated_at";
  var cache = [];
  async function home() {
    var nu = sessionStorage.getItem("qr_new_username");
    shell("home",
      '<div class="hello"><div class="avatar">' + esc(userName().charAt(0).toUpperCase()) + '</div><div class="t"><small>Namaste 👋</small><b>' + esc(userName()) + '</b></div><span class="vip">' + ic("crown", 13) + " VIP</span></div>" +
      (nu ? '<div class="banner"><b>🎉 Account ban gaya!</b><div class="u">@' + esc(nu) + '</div><div class="hint">Ye aapka <b>username</b> hai. Login ke liye yaad rakho ya screenshot lo. Password bhoolne par recover nahi hoga.</div><div class="row" style="margin-top:12px"><button class="btn sm grow" id="cpu">' + ic("copy") + ' Copy username</button><button class="btn sm ghost grow" id="cls">Samajh gaya</button></div></div>' : "") +
      '<button class="cta" id="newqr"><span class="ct"><b>Naya QR banao</b><small>Text, photo, PDF, UPI – sab chhupao</small></span><span class="pl">' + ic("plus") + "</span></button>" +
      '<div class="stats" id="stats"><div class="stat"><b>–</b><small>QR codes</small></div><div class="stat"><b>–</b><small>Scans</small></div><div class="stat"><b>–</b><small>Locked</small></div></div>' +
      '<div class="sect"><h2>Mere QR codes</h2><span id="cnt"></span></div><div id="list"><div class="loading"><div class="spin"></div></div></div>');
    $("#newqr").onclick = function () { location.hash = "#/new"; };
    if (nu) { $("#cpu").onclick = function () { copyText(nu, "Username copy ho gaya ✅"); }; $("#cls").onclick = function () { sessionStorage.removeItem("qr_new_username"); $(".banner").remove(); }; }
    var r = await sb.from("qr_codes").select(COLS).order("created_at", { ascending: false });
    if (r.error) { $("#list").innerHTML = '<div class="empty">Error: ' + esc(r.error.message) + "</div>"; return; }
    cache = r.data;
    var scans = cache.reduce(function (a, q) { return a + (q.scan_count || 0); }, 0), locked = cache.filter(function (q) { return q.has_password; }).length;
    $("#stats").innerHTML = '<div class="stat"><b>' + cache.length + "</b><small>QR codes</small></div><div class=\"stat\"><b>" + scans + "</b><small>Scans</small></div><div class=\"stat\"><b>" + locked + "</b><small>Locked</small></div>";
    $("#cnt").textContent = cache.length ? cache.length + " total" : "";
    if (!cache.length) { $("#list").innerHTML = '<div class="empty"><div class="em">' + ic("qr") + '</div><b style="color:var(--txt);font-size:17px">Abhi koi QR nahi hai</b><p style="margin:6px 0 16px">Pehla QR banao aur scan karke dekho.</p><button class="btn" id="e1">' + ic("plus") + " Pehla QR banao</button></div>"; $("#e1").onclick = function () { location.hash = "#/new"; }; return; }
    $("#list").innerHTML = cache.map(function (q) {
      return '<button class="qi" data-id="' + q.id + '"><canvas></canvas><span class="m"><b>' + esc(q.title) + '</b><span class="meta"><span>' + ic("eye", 14) + " " + q.scan_count + "</span><span>" + ic("file", 14) + " " + q.blocks.length + "</span>" + (q.has_password ? "<span>" + ic("lock", 14) + " Locked</span>" : "") + '<span><i class="dot' + (q.is_active ? "" : " off") + '"></i> ' + (q.is_active ? "Active" : "Off") + '</span></span></span><span class="go">' + ic("chev") + "</span></button>";
    }).join("");
    $$(".qi").forEach(function (el) {
      var q = cache.filter(function (x) { return x.id === el.getAttribute("data-id"); })[0];
      paint($("canvas", el), shareUrl(q.slug), q.style, 192); el.onclick = function () { qrSheet(q); };
    });
  }
  function qrSheet(q) {
    sheet('<h2>' + esc(q.title) + '</h2><canvas class="bigqr"></canvas><div class="linkpill">' + ic("link", 15) + " " + esc(shareUrl(q.slug)) + '</div>' +
      '<div class="row nw" style="margin-bottom:12px"><button class="btn grow" data-a="png">' + ic("download") + ' PNG</button><button class="btn line grow" data-a="svg">' + ic("download") + ' SVG</button><button class="btn ghost grow" data-a="copy">' + ic("copy") + " Link</button></div>" +
      '<button class="lrow" data-a="open">' + ic("ext") + ' Page kholo<span class="sub">scan jaisa dikhega</span></button><button class="lrow" data-a="edit">' + ic("edit") + ' Edit karo</button><button class="lrow" data-a="rename">' + ic("text") + ' Naam badlo</button>' +
      '<div class="lrow" style="cursor:default">' + ic("power") + 'QR active<span class="sub"><label class="sw" style="min-height:0"><input type="checkbox" id="actsw"' + (q.is_active ? " checked" : "") + '></label></span></div><button class="lrow red" data-a="del">' + ic("trash") + " Delete karo</button>",
      function (sh) {
        paint($(".bigqr", sh), shareUrl(q.slug), q.style, 460);
        $("#actsw", sh).onchange = async function (e) { var on = e.target.checked; var rr = await save_(q, { p_active: on }); if (rr.error) { toast(rr.error.message); e.target.checked = !on; } else { q.is_active = on; toast(on ? "QR active ✅" : "QR band kar diya"); } };
        sh.onclick = async function (e) {
          var b = e.target.closest("[data-a]"); if (!b) return; var a = b.getAttribute("data-a");
          if (a === "png") dlPng(q); else if (a === "svg") dlSvg(q); else if (a === "copy") copyText(shareUrl(q.slug), "Link copy ho gaya ✅");
          else if (a === "open") window.open(shareUrl(q.slug), "_blank");
          else if (a === "edit") { closeSheet(); location.hash = "#/edit/" + q.id; }
          else if (a === "rename") { var nn = prompt("Naya naam:", q.title); if (nn === null || !nn.trim()) return; var rr = await save_(q, { p_title: nn.trim() }); if (rr.error) toast(rr.error.message); else { toast("Naam badal gaya ✅"); closeSheet(); home(); } }
          else if (a === "del") { if (!confirm("Ye QR delete karna hai? Print kiya hua QR kaam karna band kar dega.")) return; var d = await sb.from("qr_codes").delete().eq("id", q.id); if (d.error) toast(d.error.message); else { var ps = (q.blocks || []).map(function (x) { return x.path; }).filter(Boolean); if (ps.length) sb.storage.from("qr-files").remove(ps); closeSheet(); toast("Delete ho gaya"); home(); } }
        };
      });
  }
  function save_(q, over) {
    var a = { p_id: q.id, p_title: q.title, p_description: q.description, p_blocks: q.blocks, p_style: q.style, p_password: null, p_active: q.is_active };
    for (var k in over) a[k] = over[k]; return sb.rpc("qr_save", a);
  }

  /* ---------- profile ---------- */
  async function profile() {
    shell("profile",
      '<div class="pbig"><div class="avatar">' + esc(userName().charAt(0).toUpperCase()) + "</div><b>" + esc(userName()) + '</b><button class="unchip" id="cpun">@' + esc(userHandle()) + " " + ic("copy", 15) + '</button><div style="margin-top:12px"><span class="vip">' + ic("crown", 13) + " VIP MEMBER</span></div></div>" +
      '<div class="stats" id="pst"><div class="stat"><b>–</b><small>QR codes</small></div><div class="stat"><b>–</b><small>Scans</small></div><div class="stat"><b>–</b><small>Locked</small></div></div><div class="sect"><h2>Account</h2></div>' +
      '<div class="group"><button class="lrow" id="pn">' + ic("edit") + ' Naam badlo<span class="sub">' + ic("chev") + '</span></button><button class="lrow" id="pp">' + ic("key") + ' Password badlo<span class="sub">' + ic("chev") + '</span></button><button class="lrow" id="ps">' + ic("scan") + ' QR scan / upload<span class="sub">' + ic("chev") + "</span></button>" +
      (canInstall() || !isStandalone ? '<button class="lrow" id="pi">' + ic("phoneapp") + ' App install karo<span class="sub">' + ic("chev") + "</span></button>" : "") + "</div>" +
      '<div class="sect"><h2>Help &amp; Info</h2></div><div class="group"><a class="lrow" href="/contact" style="text-decoration:none">' + ic("chat") + ' Contact admin<span class="sub">@' + IG + '</span></a><a class="lrow" href="/terms" style="text-decoration:none">' + ic("file") + ' Terms &amp; Conditions<span class="sub">' + ic("chev") + '</span></a><a class="lrow" href="/privacy" style="text-decoration:none">' + ic("shield") + ' Privacy Policy<span class="sub">' + ic("chev") + '</span></a><button class="lrow" id="psh">' + ic("ext") + ' App share karo<span class="sub">' + ic("chev") + '</span></button></div>' +
      '<div class="group"><button class="lrow red" id="plo">' + ic("logout") + " Logout</button></div>" +
      '<p class="hint center" style="margin-top:20px">' + ic("shield", 14) + " Aapka data secure hai · Qrown</p>");
    $("#cpun").onclick = function () { copyText(userHandle(), "Username copy ho gaya ✅"); };
    $("#pn").onclick = function () { editProfile("name"); }; $("#pp").onclick = function () { editProfile("pass"); }; $("#ps").onclick = openScanner;
    var pi = $("#pi"); if (pi) pi.onclick = doInstall;
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
    ST = { id: null, slug: null, title: "", description: "", blocks: [], style: { fg: "#111111", bg: "#ffffff", shape: "square" }, password: "", lockOn: false, hasPw: false, active: true };
    if (id) {
      $app.innerHTML = '<div class="loading"><div class="spin"></div></div>';
      var r = await sb.from("qr_codes").select(COLS).eq("id", id).single();
      if (r.error) { toast("QR nahi mila"); location.hash = "#/"; return; }
      var q = r.data; ST.id = q.id; ST.slug = q.slug; ST.title = q.title; ST.description = q.description; ST.blocks = q.blocks || []; ST.style = q.style || ST.style; ST.hasPw = q.has_password; ST.lockOn = q.has_password; ST.active = q.is_active;
    }
    drawEditor();
  }
  function blockHtml(b, i) {
    var T = TYPES[b.type];
    var h = '<div class="blk" data-i="' + i + '"><div class="h"><span class="bd">' + ic(T.icon) + "</span><b>" + esc(T.name) + '</b><button data-b="up" aria-label="Upar">' + ic("up") + '</button><button data-b="down" aria-label="Neeche">' + ic("down") + '</button><button class="rm" data-b="rm" aria-label="Hatao">' + ic("trash") + "</button></div>";
    T.fields.forEach(function (f) { h += '<label class="inp' + (f[2] === "area" ? " area" : "") + '">' + (f[2] === "area" ? '<textarea data-f="' + f[0] + '" placeholder="' + esc(f[1]) + '">' + esc(b[f[0]]) + "</textarea>" : '<input data-f="' + f[0] + '" placeholder="' + esc(f[1]) + '" value="' + esc(b[f[0]]) + '">') + "</label>"; });
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
      '<div class="card"><h3>' + ic("text", 17) + ' Details</h3><label class="inp">' + ic("qr") + '<input id="t" maxlength="120" placeholder="QR ka naam (jaise Mera Card)" value="' + esc(ST.title) + '"></label><label class="inp area"><textarea id="d" maxlength="1000" placeholder="Description – scan karne par upar dikhega (optional)">' + esc(ST.description) + "</textarea></label></div>" +
      '<div class="card"><h3>' + ic("file", 17) + ' Content (scan par ye sab dikhega)</h3><div id="blocks">' + (ST.blocks.length ? ST.blocks.map(blockHtml).join("") : '<p class="hint" style="margin:0 0 12px">Abhi kuch add nahi kiya. Neeche se shuru karo 👇</p>') + '</div><button class="btn line block" id="addb">' + ic("plus") + " Content add karo</button></div>" +
      '<div class="card"><h3>' + ic("qr", 17) + ' QR ka design</h3><div class="presets">' + PRESETS.map(function (p, i) { return '<button type="button" data-p="' + i + '" aria-label="' + p.n + '" class="' + (ST.style.fg === p.fg && ST.style.bg === p.bg ? "on" : "") + '" style="background:linear-gradient(135deg,' + p.fg + " 50%," + p.bg + ' 50%)"></button>'; }).join("") + "</div>" +
      '<div class="colors"><label>QR rang<input type="color" id="fg" value="' + esc(ST.style.fg) + '"></label><label>Background<input type="color" id="bg" value="' + esc(ST.style.bg) + '"></label></div><div class="warn" id="cw" style="display:none">⚠️ QR dark aur background light rakho, warna scan nahi hoga.</div>' +
      '<div class="seg" style="margin:0">' + ["square", "rounded", "dots"].map(function (s) { return '<button type="button" data-sh="' + s + '" class="' + (ST.style.shape === s ? "on" : "") + '">' + { square: "Square", rounded: "Rounded", dots: "Dots" }[s] + "</button>"; }).join("") + "</div></div>" +
      '<div class="card"><h3>' + ic("shield", 17) + ' Security</h3><div class="sw"><div class="tx"><b>Password lock</b><small>Scan karne wale ko password dena padega</small></div><input type="checkbox" id="lk"' + (ST.lockOn ? " checked" : "") + '></div>' +
      '<label class="inp" id="pwbox" style="margin:12px 0 0;' + (ST.lockOn ? "" : "display:none") + '">' + ic("key") + '<input id="pw" type="text" autocomplete="off" placeholder="' + (ST.hasPw ? "Naya password (khali = wahi rahega)" : "QR ka password") + '" value="' + esc(ST.password) + '"></label>' +
      '<div class="sw" style="margin-top:8px"><div class="tx"><b>QR active hai</b><small>Band karoge to scan par "not found" aayega</small></div><input type="checkbox" id="act"' + (ST.active ? " checked" : "") + "></div></div>" +
      '<div class="err" id="ee" style="text-align:center"></div><div class="savebar"><div><button class="btn block" id="save">' + ic("check") + " Save karo</button></div></div>";
    $app.innerHTML = '<div class="screen noNav">' + h + "</div>"; bindGo(); window.scrollTo(0, y); wireEditor(); updatePreview();
  }
  function updatePreview() {
    ST.style = { fg: ST.style.fg, bg: ST.style.bg, shape: ST.style.shape };
    paint($("#pv"), ST.slug ? shareUrl(ST.slug) : location.origin + "/s/preview1", ST.style, 360);
    $("#pv").style.opacity = ST.slug ? 1 : 0.6; $("#pvt").textContent = ST.slug ? shareUrl(ST.slug) : "Save karoge tab asli QR banega"; $("#dlrow").style.display = ST.slug ? "flex" : "none";
    $("#cw").style.display = lum(ST.style.fg) > lum(ST.style.bg) - 0.25 ? "block" : "none";
  }
  function wireEditor() {
    $("#t").oninput = function (e) { ST.title = e.target.value; }; $("#d").oninput = function (e) { ST.description = e.target.value; };
    $("#fg").oninput = function (e) { ST.style.fg = e.target.value; $$(".presets button").forEach(function (b) { b.classList.remove("on"); }); updatePreview(); };
    $("#bg").oninput = function (e) { ST.style.bg = e.target.value; $$(".presets button").forEach(function (b) { b.classList.remove("on"); }); updatePreview(); };
    $$("[data-p]").forEach(function (b) { b.onclick = function () { var p = PRESETS[+b.getAttribute("data-p")]; ST.style.fg = p.fg; ST.style.bg = p.bg; drawEditor(); }; });
    $$("[data-sh]").forEach(function (b) { b.onclick = function () { ST.style.shape = b.getAttribute("data-sh"); drawEditor(); }; });
    $("#lk").onchange = function (e) { ST.lockOn = e.target.checked; $("#pwbox").style.display = ST.lockOn ? "" : "none"; }; $("#pw").oninput = function (e) { ST.password = e.target.value; }; $("#act").onchange = function (e) { ST.active = e.target.checked; };
    $("#addb").onclick = function () {
      sheet('<h2>Kya add karna hai?</h2><p class="hint center" style="margin:0 0 16px">Video save nahi hota. Baaki sab chalega.</p><div class="tiles">' + Object.keys(TYPES).map(function (k) { return '<button class="tile" data-add="' + k + '"><span class="bd">' + ic(TYPES[k].icon) + "</span>" + esc(TYPES[k].name) + "</button>"; }).join("") + "</div>", function (sh) {
        sh.onclick = function (e) { var b = e.target.closest("[data-add]"); if (!b) return; ST.blocks.push(newBlock(b.getAttribute("data-add"))); closeSheet(); drawEditor(); window.scrollTo(0, document.body.scrollHeight); };
      });
    };
    $$(".blk").forEach(function (el) {
      var i = +el.getAttribute("data-i"), b = ST.blocks[i];
      $$("[data-f]", el).forEach(function (inp) { inp.oninput = function () { b[inp.getAttribute("data-f")] = inp.value; }; });
      el.onclick = function (e) {
        var bt = e.target.closest("[data-b]"); if (!bt) return; var a = bt.getAttribute("data-b");
        if (a === "rm") { if (b.path) sb.storage.from("qr-files").remove([b.path]); ST.blocks.splice(i, 1); }
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
        if (b.path) sb.storage.from("qr-files").remove([b.path]);
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
    var blocks = ST.blocks.map(function (b) { return { id: b.id, type: b.type, label: b.label || "", value: b.value || "", extra: b.extra || "", url: b.url || "", path: b.path || "" }; });
    $("#save").disabled = true;
    var r = await sb.rpc("qr_save", { p_id: ST.id, p_title: ST.title.trim(), p_description: ST.description, p_blocks: blocks, p_style: ST.style, p_password: pw, p_active: ST.active });
    $("#save").disabled = false; if (r.error) { err.textContent = r.error.message; return; }
    var q = r.data, isNew = !ST.id; ST.id = q.id; ST.slug = q.slug; ST.hasPw = q.has_password; ST.lockOn = q.has_password; ST.password = "";
    if (isNew) history.replaceState(null, "", "#/edit/" + q.id);
    drawEditor(); toast("Save ho gaya ✅ – ab QR download karo");
  }

  /* ---------- public viewer ---------- */
  async function viewer(slug) {
    $app.innerHTML = '<div class="loading"><div class="spin"></div></div>'; var pw = null;
    async function load() {
      var r = await sb.rpc("qr_scan", { p_slug: slug, p_password: pw });
      if (r.error) { $app.innerHTML = '<div class="view"><div class="card">Error: ' + esc(r.error.message) + "</div></div>"; return; }
      var d = r.data;
      if (d.status === "not_found") { $app.innerHTML = '<div class="view rise"><div class="vhead" style="margin-top:80px"><div class="mark" style="margin:0 auto 18px;animation:none">' + LOGO + '</div><h1>QR nahi mila</h1><p>Ye QR band kar diya gaya hai ya galat hai.</p></div><div class="foot"><a href="/">Qrown par apna QR banao →</a></div></div>'; return; }
      if (d.status === "locked" || d.status === "wrong_password") {
        $app.innerHTML = '<div class="view rise"><div class="vhead" style="margin-top:50px"><div class="mark" style="margin:0 auto 18px;animation:none">' + ic("lock", 38).replace("class=\"i\"", 'class="i" style="stroke:#f8e2a0"') + "</div><h1>" + esc(d.title || "Locked QR") + '</h1><p>Ye QR password se locked hai</p></div><form id="lf" class="card"><label class="inp">' + ic("key") + '<input id="lp" type="password" required autofocus placeholder="Password daalo" aria-label="Password"></label><div class="err">' + (d.status === "wrong_password" ? "Galat password" : "") + '</div><button class="btn block">' + ic("lock") + " Unlock karo</button></form></div>";
        $("#lf").onsubmit = function (e) { e.preventDefault(); pw = $("#lp").value; load(); }; return;
      }
      document.title = d.title + " – " + (CFG.APP_NAME || "Qrown");
      $app.innerHTML = '<div class="view"><div class="vhead rise"><div class="chip">' + ic("qr", 14) + ' QROWN</div><h1>' + esc(d.title) + "</h1>" + (d.description ? "<p>" + linkify(d.description) + "</p>" : "") + "</div>" + (d.blocks || []).map(renderBlock).join("") + '<div class="shr"><button class="btn ghost" id="vshare">' + ic("ext") + ' Share</button><button class="btn ghost" id="vcopy">' + ic("copy") + ' Link copy</button></div><div class="foot">Made with <a href="/">Qrown</a> · apna QR banao</div><div class="links"><a href="/terms">Terms</a><a href="/privacy">Privacy</a><a href="https://instagram.com/' + IG + '" target="_blank" rel="noopener noreferrer">Report this QR</a></div></div>'; bindViewer();
      var rb = document.querySelector('meta[name=robots]'); if (rb) rb.content = "noindex,nofollow";
    }
    load();
  }


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
      '<h2>1. What we collect</h2><ul><li><b>Account:</b> the name you enter, an auto-generated username, and your password (stored only as a secure hash – we cannot read it). We do not ask for your email or phone number to sign up.</li><li><b>Content you add:</b> text, links, photos, PDFs/documents, phone numbers, UPI IDs, locations and other details you put in a QR, plus QR settings such as colours and password lock.</li><li><b>Usage counts:</b> how many times each QR was opened and when it was last opened. We do not record who scanned it.</li><li><b>Technical data:</b> our hosting and database providers may keep standard server logs (such as IP address and device/browser type) for security and reliability.</li></ul>' +
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
      ["Kisi galat ya spam QR ki report kaise karun?", "Admin ko Instagram par QR ka link bhejo. Hum check karke hata denge."]];
    return docPage("Contact Admin",
      '<h1>Contact Admin</h1><p class="upd">Help, report ya feedback – seedha admin se baat karo.</p>' +
      '<a class="contact" href="https://instagram.com/' + IG + '" target="_blank" rel="noopener noreferrer"><span class="ci">' + ic("chat", 26) + '</span><span><b>@' + IG + '</b><small>Instagram par DM karo · Admin</small></span></a>' +
      '<div class="note">Report karte waqt QR ka link (jaise ' + esc(location.origin) + '/s/abc123) zaroor bhejo.</div>' +
      '<h2>FAQ</h2>' + faq.map(function (f) { return '<details class="faq"><summary>' + esc(f[0]) + "</summary><p>" + esc(f[1]) + "</p></details>"; }).join(""));
  }

  /* ---------- router ---------- */
  async function route() {
    closeSheet();
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
    if (!configured()) return setupScreen();
    sb = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY);
    if (/^\/(s\/|terms|privacy|contact)/.test(location.pathname)) return route();
    var s = await sb.auth.getSession(); session = s.data.session;
    sb.auth.onAuthStateChange(function (ev, sess) { var had = !!session; session = sess; if (had !== !!sess) route(); });
    window.addEventListener("hashchange", route); route();
  })();
})();
