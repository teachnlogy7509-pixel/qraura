(function () {
  "use strict";
  var CFG = window.APP_CONFIG || {};
  var $app = document.getElementById("app");
  var sb = null, session = null;

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function toast(msg) {
    var t = document.getElementById("toast");
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove("show"); }, 2400);
  }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function uid() { return Math.random().toString(36).slice(2, 10); }
  function safeUrl(u) {
    u = String(u || "").trim();
    if (!u) return "";
    if (/^(https?:\/\/|mailto:|tel:|upi:\/\/)/i.test(u)) return u;
    if (/^[a-z][a-z0-9+.-]*:/i.test(u)) return ""; // block javascript:, data:, etc.
    return "https://" + u;
  }
  function digits(s) { return String(s || "").replace(/[^\d+]/g, ""); }
  function shareUrl(slug) { return location.origin + "/s/" + slug; }
  function configured() { return CFG.SUPABASE_URL && CFG.SUPABASE_URL.indexOf("YOUR-PROJECT") < 0 && window.supabase; }

  /* ---------- QR rendering (own renderer: colors + shapes, PNG + SVG) ---------- */
  function makeModules(text) {
    var q = new window.QRCodeLib(-1, 2); // auto size, level H (30% recovery)
    q.addData(text); q.make();
    var n = q.getModuleCount(), m = [];
    for (var r = 0; r < n; r++) { m[r] = []; for (var c = 0; c < n; c++) m[r][c] = q.isDark(r, c); }
    return m;
  }
  function inFinder(r, c, n) {
    return (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
  }
  function qrCanvas(text, style, px) {
    style = style || {}; px = px || 1024;
    var m = makeModules(text), n = m.length, margin = 4, total = n + margin * 2, s = px / total;
    var cv = document.createElement("canvas"); cv.width = cv.height = px;
    var g = cv.getContext("2d");
    g.fillStyle = style.bg || "#ffffff"; g.fillRect(0, 0, px, px);
    g.fillStyle = style.fg || "#111111";
    var shape = style.shape || "square";
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) {
      if (!m[r][c]) continue;
      var x = (c + margin) * s, y = (r + margin) * s;
      if (shape === "dots" && !inFinder(r, c, n)) {
        g.beginPath(); g.arc(x + s / 2, y + s / 2, s * 0.46, 0, 6.2832); g.fill();
      } else if (shape === "rounded") {
        var rad = s * 0.35; g.beginPath();
        if (g.roundRect) g.roundRect(x, y, s + 0.5, s + 0.5, rad); else g.rect(x, y, s + 0.5, s + 0.5);
        g.fill();
      } else g.fillRect(x, y, s + 0.5, s + 0.5);
    }
    return cv;
  }
  function qrSvg(text, style) {
    style = style || {};
    var m = makeModules(text), n = m.length, margin = 4, total = n + margin * 2, shape = style.shape || "square";
    var d = [];
    var out = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + total + " " + total + '" shape-rendering="' + (shape === "square" ? "crispEdges" : "geometricPrecision") + '">' +
      '<rect width="100%" height="100%" fill="' + esc(style.bg || "#ffffff") + '"/><g fill="' + esc(style.fg || "#111111") + '">';
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) {
      if (!m[r][c]) continue;
      var x = c + margin, y = r + margin;
      if (shape === "dots" && !inFinder(r, c, n)) out += '<circle cx="' + (x + 0.5) + '" cy="' + (y + 0.5) + '" r="0.46"/>';
      else if (shape === "rounded") out += '<rect x="' + x + '" y="' + y + '" width="1.02" height="1.02" rx="0.35"/>';
      else d.push("M" + x + " " + y + "h1v1h-1z");
    }
    if (d.length) out += '<path d="' + d.join("") + '"/>';
    return out + "</g></svg>";
  }
  function download(blob, name) {
    var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  }
  function fname(t) { return (String(t || "qr").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "qr"); }
  function dlPng(q) { qrCanvas(shareUrl(q.slug), q.style, 1024).toBlob(function (b) { download(b, fname(q.title) + ".png"); }, "image/png"); }
  function dlSvg(q) { download(new Blob([qrSvg(shareUrl(q.slug), q.style)], { type: "image/svg+xml" }), fname(q.title) + ".svg"); }

  /* ---------- block types ---------- */
  var TYPES = {
    text:     { icon: "📝", name: "Text / Message", fields: [["label", "Heading (optional)"], ["value", "Text", "area"]] },
    link:     { icon: "🔗", name: "Link",           fields: [["label", "Button name"], ["value", "URL (https://...)"]] },
    image:    { icon: "🖼️", name: "Photo",          fields: [["label", "Caption (optional)"]], upload: "image/*" },
    file:     { icon: "📎", name: "File / PDF",     fields: [["label", "File name"]], upload: "*/*" },
    video:    { icon: "▶️", name: "Video (YouTube/link)", fields: [["label", "Title (optional)"], ["value", "Video URL"]] },
    phone:    { icon: "📞", name: "Phone call",     fields: [["label", "Name"], ["value", "Phone number"]] },
    whatsapp: { icon: "💬", name: "WhatsApp",       fields: [["label", "Name"], ["value", "Number with country code, e.g. 919876543210"], ["extra", "Pre-filled message (optional)"]] },
    email:    { icon: "✉️", name: "Email",          fields: [["label", "Name"], ["value", "Email address"]] },
    location: { icon: "📍", name: "Location",       fields: [["label", "Place name"], ["value", "Address or Google Maps link"]] },
    upi:      { icon: "💸", name: "UPI payment",    fields: [["label", "Payee name"], ["value", "UPI ID (name@bank)"]] }
  };
  function newBlock(type) { return { id: uid(), type: type, label: "", value: "", extra: "", url: "", path: "" }; }

  function youtubeEmbed(u) {
    var m = String(u).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
    return m ? "https://www.youtube-nocookie.com/embed/" + m[1] : "";
  }
  function renderBlock(b) {
    var T = TYPES[b.type]; if (!T) return "";
    var lb = b.label ? '<div class="lb">' + esc(b.label) + "</div>" : "";
    var v = b.value || "";
    switch (b.type) {
      case "text": return '<div class="vb">' + lb + '<div class="tx">' + esc(v) + "</div></div>";
      case "link": { var u = safeUrl(v); return u ? '<div class="vb"><a class="act" target="_blank" rel="noopener noreferrer" href="' + esc(u) + '">' + esc(b.label || v) + "</a></div>" : ""; }
      case "image": { var iu = safeUrl(b.url || v); return iu ? '<div class="vb">' + lb + '<img loading="lazy" alt="' + esc(b.label || "image") + '" src="' + esc(iu) + '"></div>' : ""; }
      case "file": { var fu = safeUrl(b.url || v); return fu ? '<div class="vb"><a class="act" target="_blank" rel="noopener noreferrer" href="' + esc(fu) + '">📎 ' + esc(b.label || "Download file") + "</a></div>" : ""; }
      case "video": { var e = youtubeEmbed(v), vu = safeUrl(v);
        if (e) return '<div class="vb">' + lb + '<iframe src="' + e + '" allowfullscreen loading="lazy"></iframe></div>';
        return vu ? '<div class="vb"><a class="act" target="_blank" rel="noopener noreferrer" href="' + esc(vu) + '">▶️ ' + esc(b.label || "Watch video") + "</a></div>" : ""; }
      case "phone": return '<div class="vb"><a class="act" href="tel:' + esc(digits(v)) + '">📞 ' + esc(b.label ? b.label + " – " + v : v) + "</a></div>";
      case "whatsapp": return '<div class="vb"><a class="act" target="_blank" rel="noopener noreferrer" href="https://wa.me/' + esc(digits(v).replace(/^\+/, "")) + (b.extra ? "?text=" + encodeURIComponent(b.extra) : "") + '">💬 ' + esc(b.label || "WhatsApp") + "</a></div>";
      case "email": return '<div class="vb"><a class="act" href="mailto:' + esc(v) + '">✉️ ' + esc(b.label ? b.label + " – " + v : v) + "</a></div>";
      case "location": { var q = /^https?:\/\//i.test(v) ? v : "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(v);
        return '<div class="vb"><a class="act" target="_blank" rel="noopener noreferrer" href="' + esc(q) + '">📍 ' + esc(b.label || v) + "</a></div>"; }
      case "upi": return '<div class="vb"><a class="act" href="upi://pay?pa=' + encodeURIComponent(v) + "&pn=" + encodeURIComponent(b.label || "") + '">💸 Pay ' + esc(b.label || v) + "</a><div class=\"small\">" + esc(v) + "</div></div>";
    }
    return "";
  }

  /* ---------- views ---------- */
  function setupScreen() {
    $app.innerHTML = '<div class="wrap"><div class="card"><h2>⚙️ Setup baaki hai</h2><p>Supabase ki keys <code>config.js</code> mein daalo (SUPABASE_URL aur SUPABASE_ANON_KEY), phir page reload karo.</p></div></div>';
  }

  function nav() {
    return '<div class="nav"><div class="logo" data-go="#/">' + esc(CFG.APP_NAME || "QRaura") + '</div><div class="row">' +
      (session ? '<span class="small">' + esc(session.user.email || "") + '</span><button class="btn ghost sm" id="logout">Logout</button>' : "") + "</div></div>";
  }
  function bindNav() {
    var l = $("#logout"); if (l) l.onclick = function () { sb.auth.signOut(); };
    document.querySelectorAll("[data-go]").forEach(function (e) { e.onclick = function () { location.hash = e.getAttribute("data-go"); }; });
  }

  function authView() {
    $app.innerHTML = '<div class="wrap">' + nav() +
      '<div class="hero"><h1>Apna <span class="grad">QR</span> banao.<br>Sab kuch usme chhupao.</h1>' +
      "<p>Text, photo, file, link, WhatsApp, UPI – jo marzi add karo. Koi bhi scan kare to sab kuch mil jayega. Unlimited QR, free download.</p></div>" +
      '<div class="card auth"><div class="row" style="margin-bottom:12px"><button class="btn grow" id="tabin">Login</button><button class="btn ghost grow" id="tabup">Sign up</button></div>' +
      '<form id="af"><label class="field"><span>Email</span><input type="email" id="em" required autocomplete="email"></label>' +
      '<label class="field"><span>Password (min 6)</span><input type="password" id="pw" required minlength="6" autocomplete="current-password"></label>' +
      '<div class="err" id="ae"></div><button class="btn" style="width:100%" id="asub">Login</button></form></div>' +
      '<div class="feat"><div>📝 Text, links, contact<br><span class="small">Sab ek QR mein</span></div><div>🖼️ Photos &amp; files<br><span class="small">10MB tak upload</span></div><div>🔒 Password lock<br><span class="small">Sirf jise aap password do</span></div><div>🎨 Colors &amp; shapes<br><span class="small">PNG / SVG download</span></div></div></div>';
    bindNav();
    var mode = "in";
    function setMode(m) { mode = m; $("#tabin").className = "btn grow" + (m === "in" ? "" : " ghost"); $("#tabup").className = "btn grow" + (m === "up" ? "" : " ghost"); $("#asub").textContent = m === "in" ? "Login" : "Create account"; }
    $("#tabin").onclick = function () { setMode("in"); }; $("#tabup").onclick = function () { setMode("up"); };
    $("#af").onsubmit = async function (e) {
      e.preventDefault(); var err = $("#ae"); err.textContent = ""; $("#asub").disabled = true;
      var email = $("#em").value.trim(), pass = $("#pw").value;
      var res = mode === "in" ? await sb.auth.signInWithPassword({ email: email, password: pass }) : await sb.auth.signUp({ email: email, password: pass });
      $("#asub").disabled = false;
      if (res.error) { err.textContent = res.error.message; return; }
      if (mode === "up" && !res.data.session) err.textContent = "Account ban gaya! Email check karke confirm karo, phir login karo.";
    };
  }

  var cache = [];
  async function dashboard() {
    $app.innerHTML = '<div class="wrap">' + nav() + '<div class="row" style="justify-content:space-between;margin-bottom:14px"><h2 style="margin:0">Mere QR codes</h2><button class="btn" id="new">＋ Naya QR</button></div><div id="list" class="small">Loading…</div></div>';
    bindNav(); $("#new").onclick = function () { location.hash = "#/new"; };
    var r = await sb.from("qr_codes").select("*").order("created_at", { ascending: false });
    if (r.error) { $("#list").textContent = "Error: " + r.error.message; return; }
    cache = r.data;
    if (!cache.length) { $("#list").innerHTML = '<div class="card" style="text-align:center">Abhi koi QR nahi hai.<br><br><button class="btn" id="new2">Pehla QR banao</button></div>'; $("#new2").onclick = function () { location.hash = "#/new"; }; return; }
    var h = '<div class="grid">';
    cache.forEach(function (q) {
      h += '<div class="card qrcard" data-id="' + q.id + '"><canvas></canvas><h3>' + esc(q.title) + "</h3>" +
        '<div class="meta">' + (q.is_active ? '<span class="pill ok">Active</span>' : '<span class="pill bad">Off</span>') + (q.has_password ? ' <span class="pill">🔒 Locked</span>' : "") + " · 👁 " + q.scan_count + " scans · " + q.blocks.length + " items</div>" +
        '<div class="row"><button class="btn sm" data-a="png">PNG</button><button class="btn sm" data-a="svg">SVG</button><button class="btn sm ghost" data-a="copy">Copy link</button></div>' +
        '<div class="row"><button class="btn sm ghost" data-a="open">Open</button><button class="btn sm ghost" data-a="edit">Edit</button><button class="btn sm danger" data-a="del">Delete</button></div></div>';
    });
    $("#list").innerHTML = h + "</div>";
    document.querySelectorAll(".qrcard").forEach(function (el) {
      var q = cache.filter(function (x) { return x.id === el.getAttribute("data-id"); })[0];
      var cv = qrCanvas(shareUrl(q.slug), q.style, 400), tgt = $("canvas", el);
      tgt.width = 400; tgt.height = 400; tgt.getContext("2d").drawImage(cv, 0, 0);
      el.onclick = async function (e) {
        var a = e.target.getAttribute && e.target.getAttribute("data-a"); if (!a) return;
        if (a === "png") dlPng(q); else if (a === "svg") dlSvg(q);
        else if (a === "copy") { try { await navigator.clipboard.writeText(shareUrl(q.slug)); toast("Link copy ho gaya"); } catch (x) { prompt("Copy link:", shareUrl(q.slug)); } }
        else if (a === "open") window.open(shareUrl(q.slug), "_blank");
        else if (a === "edit") location.hash = "#/edit/" + q.id;
        else if (a === "del" && confirm("Ye QR delete karna hai? Printed QR kaam karna band kar dega.")) {
          var d = await sb.from("qr_codes").delete().eq("id", q.id);
          if (d.error) toast(d.error.message); else { cleanupFiles(q.blocks); dashboard(); }
        }
      };
    });
  }
  function cleanupFiles(blocks) {
    var paths = (blocks || []).map(function (b) { return b.path; }).filter(Boolean);
    if (paths.length) sb.storage.from("qr-files").remove(paths);
  }

  var ST = null; // editor state
  async function editor(id) {
    ST = { id: null, slug: null, title: "", description: "", blocks: [], style: { fg: "#111111", bg: "#ffffff", shape: "square" }, password: "", clearPw: false, hasPw: false, active: true };
    if (id) {
      var r = await sb.from("qr_codes").select("*").eq("id", id).single();
      if (r.error) { toast("QR nahi mila"); location.hash = "#/"; return; }
      var q = r.data; ST.id = q.id; ST.slug = q.slug; ST.title = q.title; ST.description = q.description; ST.blocks = q.blocks || []; ST.style = q.style || ST.style; ST.hasPw = q.has_password; ST.active = q.is_active;
    }
    drawEditor();
  }
  function blockEditor(b, i) {
    var T = TYPES[b.type];
    var h = '<div class="blk" data-i="' + i + '"><div class="h"><span>' + T.icon + " " + T.name + '</span><span class="row"><button class="btn sm ghost" data-b="up">↑</button><button class="btn sm ghost" data-b="down">↓</button><button class="btn sm danger" data-b="rm">✕</button></span></div>';
    T.fields.forEach(function (f) {
      h += '<label class="field"><span>' + esc(f[1]) + "</span>" + (f[2] === "area" ? '<textarea data-f="' + f[0] + '">' + esc(b[f[0]]) + "</textarea>" : '<input data-f="' + f[0] + '" value="' + esc(b[f[0]]) + '">') + "</label>";
    });
    if (T.upload) {
      h += '<div class="field"><span>' + (b.url ? "✅ Uploaded" : "File chuno (max 10MB)") + '</span><input type="file" data-up accept="' + T.upload + '"></div>';
      if (b.type === "image" && b.url) h += '<img src="' + esc(b.url) + '" style="max-width:100%;max-height:140px;border-radius:8px">';
    }
    return h + "</div>";
  }
  function drawEditor() {
    var h = '<div class="wrap">' + nav() + '<div class="row" style="margin-bottom:12px"><button class="btn ghost sm" data-go="#/">← Back</button><h2 style="margin:0">' + (ST.id ? "QR edit karo" : "Naya QR") + '</h2></div><div class="two"><div>' +
      '<div class="card" style="margin-bottom:12px"><label class="field"><span>QR ka naam</span><input id="t" maxlength="120" value="' + esc(ST.title) + '" placeholder="e.g. Mera Visiting Card"></label>' +
      '<label class="field"><span>Description (scan karne par upar dikhega)</span><textarea id="d" maxlength="1000">' + esc(ST.description) + "</textarea></label></div>" +
      '<div class="card" style="margin-bottom:12px"><b>Content add karo</b><div class="adds" style="margin:10px 0">' +
      Object.keys(TYPES).map(function (k) { return '<button class="btn sm" data-add="' + k + '">' + TYPES[k].icon + " " + TYPES[k].name + "</button>"; }).join("") +
      '</div><div id="blocks">' + (ST.blocks.length ? ST.blocks.map(blockEditor).join("") : '<div class="small">Upar se kuch add karo.</div>') + "</div></div>" +
      '<div class="card"><b>Settings</b><div class="row" style="margin-top:10px"><label class="field grow"><span>QR color</span><input type="color" id="fg" value="' + esc(ST.style.fg) + '"></label><label class="field grow"><span>Background</span><input type="color" id="bg" value="' + esc(ST.style.bg) + '"></label>' +
      '<label class="field grow"><span>Shape</span><select id="sh"><option value="square">Square</option><option value="rounded">Rounded</option><option value="dots">Dots</option></select></label></div>' +
      '<label class="field"><span>🔒 Password lock ' + (ST.hasPw ? "(abhi ON hai – naya likho ya khali chhodo = same rahe)" : "(optional)") + '</span><input id="pw" type="text" autocomplete="off" placeholder="' + (ST.hasPw ? "naya password" : "khali = koi lock nahi") + '"></label>' +
      (ST.hasPw ? '<label class="small"><input type="checkbox" id="clr"> Password hata do</label><br><br>' : "") +
      '<label class="small"><input type="checkbox" id="act"' + (ST.active ? " checked" : "") + '> QR active hai (band karoge to scan par "not found" aayega)</label></div></div>' +
      '<div class="sticky card preview"><b>Preview</b><canvas id="pv"></canvas><div class="small" id="pvt"></div><div class="err" id="ee"></div><button class="btn" style="width:100%" id="save">💾 Save</button>' +
      '<div class="row" id="dlrow" style="display:none"><button class="btn sm" id="dpng">PNG</button><button class="btn sm" id="dsvg">SVG</button><button class="btn sm ghost" id="dcp">Copy link</button></div></div></div></div>';
    $app.innerHTML = h; bindNav();
    $("#sh").value = ST.style.shape;
    wireEditor(); updatePreview();
  }
  function collect() {
    ST.title = $("#t").value; ST.description = $("#d").value;
    ST.style = { fg: $("#fg").value, bg: $("#bg").value, shape: $("#sh").value };
    ST.active = $("#act").checked; ST.password = $("#pw").value; ST.clearPw = !!($("#clr") && $("#clr").checked);
  }
  function updatePreview() {
    var st = { fg: $("#fg").value, bg: $("#bg").value, shape: $("#sh").value };
    var pv = $("#pv"), url = ST.slug ? shareUrl(ST.slug) : location.origin + "/s/preview1";
    var cv = qrCanvas(url, st, 560); pv.width = pv.height = 560; var g = pv.getContext("2d"); g.drawImage(cv, 0, 0);
    pv.style.opacity = ST.slug ? 1 : 0.55;
    $("#pvt").textContent = ST.slug ? shareUrl(ST.slug) : "Save karoge tab asli QR banega";
    $("#dlrow").style.display = ST.slug ? "flex" : "none";
  }
  function wireEditor() {
    ["fg", "bg", "sh"].forEach(function (k) { $("#" + k).oninput = updatePreview; });
    document.querySelectorAll("[data-add]").forEach(function (b) { b.onclick = function () { collect(); ST.blocks.push(newBlock(b.getAttribute("data-add"))); var keep = [ST.password, ST.clearPw]; drawEditor(); $("#pw").value = keep[0]; }; });
    document.querySelectorAll(".blk").forEach(function (el) {
      var i = +el.getAttribute("data-i"), b = ST.blocks[i];
      el.querySelectorAll("[data-f]").forEach(function (inp) { inp.oninput = function () { b[inp.getAttribute("data-f")] = inp.value; }; });
      el.onclick = function (e) {
        var a = e.target.getAttribute && e.target.getAttribute("data-b"); if (!a) return;
        collect(); var pw = ST.password;
        if (a === "rm") { if (b.path) sb.storage.from("qr-files").remove([b.path]); ST.blocks.splice(i, 1); }
        else if (a === "up" && i > 0) { ST.blocks.splice(i - 1, 0, ST.blocks.splice(i, 1)[0]); }
        else if (a === "down" && i < ST.blocks.length - 1) { ST.blocks.splice(i + 1, 0, ST.blocks.splice(i, 1)[0]); }
        drawEditor(); $("#pw").value = pw;
      };
      var up = $("[data-up]", el);
      if (up) up.onchange = async function () {
        var f = up.files[0]; if (!f) return;
        if (f.size > 10 * 1024 * 1024) { toast("File 10MB se badi hai"); up.value = ""; return; }
        toast("Uploading…");
        var ext = (f.name.split(".").pop() || "bin").replace(/[^a-z0-9]/gi, "").slice(0, 8) || "bin";
        var path = session.user.id + "/" + uid() + uid() + "." + ext;
        var r = await sb.storage.from("qr-files").upload(path, f, { contentType: f.type || "application/octet-stream", upsert: false });
        if (r.error) { toast(r.error.message); return; }
        if (b.path) sb.storage.from("qr-files").remove([b.path]);
        b.path = path; b.url = sb.storage.from("qr-files").getPublicUrl(path).data.publicUrl;
        if (!b.label && b.type === "file") b.label = f.name;
        collect(); var pw = ST.password; drawEditor(); $("#pw").value = pw; toast("Upload ho gaya ✅");
      };
    });
    $("#save").onclick = save;
    $("#dpng").onclick = function () { dlPng({ slug: ST.slug, title: ST.title, style: ST.style }); };
    $("#dsvg").onclick = function () { dlSvg({ slug: ST.slug, title: ST.title, style: ST.style }); };
    $("#dcp").onclick = async function () { try { await navigator.clipboard.writeText(shareUrl(ST.slug)); toast("Link copy ho gaya"); } catch (e) { prompt("Copy link:", shareUrl(ST.slug)); } };
  }
  async function save() {
    collect(); var err = $("#ee"); err.textContent = "";
    if (!ST.title.trim()) { err.textContent = "Naam likho."; return; }
    if (!ST.blocks.length) { err.textContent = "Kam se kam ek content add karo."; return; }
    var blocks = ST.blocks.map(function (b) { return { id: b.id, type: b.type, label: b.label || "", value: b.value || "", extra: b.extra || "", url: b.url || "", path: b.path || "" }; });
    var pw = ST.clearPw ? "" : (ST.password ? ST.password : null);
    $("#save").disabled = true;
    var r = await sb.rpc("qr_save", { p_id: ST.id, p_title: ST.title.trim(), p_description: ST.description, p_blocks: blocks, p_style: ST.style, p_password: pw, p_active: ST.active });
    $("#save").disabled = false;
    if (r.error) { err.textContent = r.error.message; return; }
    var q = r.data; ST.id = q.id; ST.slug = q.slug; ST.hasPw = q.has_password;
    toast("Saved ✅");
    var target = "#/edit/" + q.id;
    if (location.hash === target) route(); else location.hash = target; // reload editor in "saved" state
  }

  /* ---------- public viewer ---------- */
  async function viewer(slug) {
    $app.innerHTML = '<div class="view"><p class="small" style="text-align:center">Loading…</p></div>';
    var pw = null;
    async function load() {
      var r = await sb.rpc("qr_scan", { p_slug: slug, p_password: pw });
      if (r.error) { $app.innerHTML = '<div class="view"><div class="card">Error: ' + esc(r.error.message) + "</div></div>"; return; }
      var d = r.data;
      if (d.status === "not_found") { $app.innerHTML = '<div class="view"><h1>😕</h1><p class="desc">Ye QR nahi mila ya band kar diya gaya hai.</p><div class="foot"><a href="/">QRaura par apna QR banao</a></div></div>'; return; }
      if (d.status === "locked" || d.status === "wrong_password") {
        $app.innerHTML = '<div class="view"><h1>🔒 ' + esc(d.title || "") + '</h1><p class="desc">Ye QR password se locked hai.</p><form id="lf" class="card"><label class="field"><span>Password</span><input id="lp" type="password" required autofocus></label><div class="err">' + (d.status === "wrong_password" ? "Galat password" : "") + '</div><button class="btn" style="width:100%">Unlock</button></form></div>';
        $("#lf").onsubmit = function (e) { e.preventDefault(); pw = $("#lp").value; load(); };
        return;
      }
      document.title = d.title + " – " + (CFG.APP_NAME || "QRaura");
      $app.innerHTML = '<div class="view"><h1>' + esc(d.title) + "</h1>" + (d.description ? '<p class="desc">' + esc(d.description) + "</p>" : "") +
        (d.blocks || []).map(renderBlock).join("") + '<div class="foot">Made with <a href="/">' + esc(CFG.APP_NAME || "QRaura") + "</a> · apna QR banao</div></div>";
    }
    load();
  }

  /* ---------- router ---------- */
  async function route() {
    var m = location.pathname.match(/^\/s\/([a-z0-9]+)\/?$/i);
    if (m) return viewer(m[1].toLowerCase());
    if (!session) return authView();
    var h = location.hash || "#/";
    if (h === "#/new") return editor(null);
    var e = h.match(/^#\/edit\/([0-9a-f-]{36})$/i);
    if (e) return editor(e[1]);
    return dashboard();
  }

  (async function init() {
    if (!configured()) return setupScreen();
    sb = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY);
    if (/^\/s\//.test(location.pathname)) return route();
    var s = await sb.auth.getSession(); session = s.data.session;
    sb.auth.onAuthStateChange(function (ev, sess) { var had = !!session; session = sess; if (had !== !!sess) route(); });
    window.addEventListener("hashchange", route);
    route();
  })();
})();
