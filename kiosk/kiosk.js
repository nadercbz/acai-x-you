/* Açaí x You Bestell Terminal. Build it YOUR way: Größe, Sauce unten, Chia und Granola, Früchte, Crunches, Sauce oben, Zusammenfassung mit Becher Vorschau, Drinks.
   Regeln: Bestelllogik.md. Daten: menu.js (erzeugt von _build/build_menu.py). Interne Portionsrichtlinie: intern.js, nur im Küchenmonitor geladen.
   Demo: Bestellungen über localStorage und BroadcastChannel zwischen Tabs. Im Betrieb ersetzt eine API genau die Funktionen im Block API. */
(function(){
"use strict";
var M = window.MENU, R = M.rules, Q = new URLSearchParams(location.search), VIEW = Q.get("view") || "kiosk";
var app = document.getElementById("app"), stage = document.getElementById("stage");
var ING = {}; ["sauce", "chia", "fruit", "crunch"].forEach(function(g){ M.groups[g].forEach(function(i){ i.group = g; ING[i.id] = i; }); }); M.milks.forEach(function(i){ ING[i.id] = i; });
var SIZE = {}; M.sizes.forEach(function(s){ SIZE[s.id] = s; });
var COF = {}; M.drinks.coffee.items.forEach(function(c){ COF[c.id] = c; });
var FLAV = {}; M.drinks.matcha.flavors.forEach(function(f){ FLAV[f.id] = f; });
var LIME = {}; M.drinks.limeade.sorts.forEach(function(s){ LIME[s.id] = s; });
var SIG = {}; M.signatures.forEach(function(s){ SIG[s.id] = s; });

/* ---------------- Texte ---------------- */
var T = {
 de: {tap:"Tippen und Bowl bauen", what:"Worauf hast du Lust?", bowl:"Bowl bauen", bowlS:"Becher wählen, dann Schicht für Schicht nach deinem Geschmack.", drinks:"Drinks", drinksS:"Matcha, Limeades und Kaffee.",
      incl:"Toppings inklusive", from:"ab", cart:"Warenkorb", total:"Gesamt", next:"Weiter", back:"Zurück", skip:"Ohne, weiter", add:"In den Warenkorb", toCart:"Zum Warenkorb", pay:"Bezahlen",
      st_size:"Größe", st_sb:"Sauce unten", st_chia:"Chia und Granola", st_fruit:"Früchte", st_crunch:"Toppings und Crunches", st_st:"Sauce oben", st_sum:"Deine Bowl",
      h_size:"Wähl deinen Becher", h_sb:"Welche Sauce kommt unten rein?", h_chia:"Chia Pudding und Granola", h_fruit:"Deine Früchte", h_crunch:"Deine Crunches", h_st:"Und oben drauf?", h_sum:"So wird deine Bowl",
      n_sb:"Nimm so viele du willst. Alles inklusive.", n_chia_S:"Optional in der S. Normal, Schoko oder beides.", n_chia_ML:"Normal, Schoko oder beides. Du bestimmst die Menge.", n_fruit:"Nimm so viele du willst.", n_fruitML:"Kommt in beide Layer.",
      n_crunch:"Alles inklusive, nimm was du magst.", n_st:"Die Sauce zum Schluss.", same:"Wie unten", tipS:"Tipp: Mit bis zu 3 Saucen insgesamt schmeckt jede Schicht noch klar. Mehr geht natürlich auch.",
      tipF:"Tipp: 3 Früchte passen perfekt in einen Layer. Mehr geht natürlich auch.", tipC:"Tipp: Bis zu 4 Crunches geben den besten Biss. Mehr geht natürlich auch.",
      sigs:"Signatures", sigsS:"Unsere Lieblings Bowls. Antippen und nach Wunsch anpassen.",
      layers1:"1 Frucht und Topping Layer", layers2:"2 Frucht und Topping Layer", popular:"Beliebt", wenig:"wenig", normal:"normal", viel:"viel",
      l_sb:"Sauce unten", l_acai:"Açaí", l_chia:"Chia Pudding", l_gran:"Granola", l_cg:"Chia Pudding und Granola", l_top:"Früchte und Toppings", l_st:"Sauce oben", none:"ohne", edit:"ändern",
      allg:"Allergene deiner Bowl (Richtwert):", allgNone:"keine der 14 Hauptallergene in deiner Auswahl", spuren:"Spuren sind möglich. Frag uns gern.",
      more:"Drink dazu?", moreS:"Matcha, Limeade oder Kaffee passt perfekt.", noThanks:"Nein danke, zum Warenkorb", size:"Größe", milk:"Milch", flavor:"Sorte", kind:"Art", hot:"Heiß", ice:"Auf Eis",
      classic:"Classic Iced", flav:"Flavoured", empty:"Dein Warenkorb ist noch leer.", more2:"Noch was dazu", card:"Karte", cardS:"Girocard, Kreditkarte, Apple Pay, Google Pay", cash:"Bar an der Theke",
      cashS:"Du bekommst eine Nummer und zahlst an der Theke.", hold:"Bitte Karte oder Handy ans Terminal halten", paid:"Danke! Bezahlt.", cashDue:"Bitte jetzt an der Theke zahlen", number:"Deine Nummer",
      ready:"Wir bauen deine Bowl jetzt Schicht für Schicht.", readyS:"Deine Nummer erscheint auf dem Bildschirm, wenn alles fertig ist.", newOrder:"Neue Bestellung", filterOn:"Allergene", filterT:"Ich vermeide",
      filterS:"Wir markieren, was das enthält. Bestellen bleibt deine Entscheidung.", ok:"Fertig", still:"Bist du noch da?", stillS:"Gleich geht es zurück zum Start.", yes:"Ja, weiter", contains:"enthält",
      added:"Hinzugefügt: ", out:"heute aus"},
 en: {tap:"Tap to build your bowl", what:"What are you craving?", bowl:"Build a bowl", bowlS:"Pick your cup, then layer by layer, your way.", drinks:"Drinks", drinksS:"Matcha, limeades and coffee.",
      incl:"Toppings included", from:"from", cart:"Cart", total:"Total", next:"Next", back:"Back", skip:"Skip", add:"Add to cart", toCart:"Go to cart", pay:"Pay",
      st_size:"Size", st_sb:"Sauce bottom", st_chia:"Chia and granola", st_fruit:"Fruit", st_crunch:"Toppings and crunch", st_st:"Sauce on top", st_sum:"Your bowl",
      h_size:"Pick your cup", h_sb:"Which sauce goes in first?", h_chia:"Chia pudding and granola", h_fruit:"Your fruit", h_crunch:"Your crunch", h_st:"And on top?", h_sum:"Here is your bowl",
      n_sb:"Take as many as you like. All included.", n_chia_S:"Optional in the S. Regular, choco or both.", n_chia_ML:"Regular, choco or both. You decide how much.", n_fruit:"Take as many as you like.", n_fruitML:"Goes into both layers.",
      n_crunch:"All included, take what you like.", n_st:"The final drizzle.", same:"Same as bottom", tipS:"Tip: up to 3 sauces in total keep every layer clear. More is fine too.",
      tipF:"Tip: 3 fruits fit a layer perfectly. More is fine too.", tipC:"Tip: up to 4 crunches give the best bite. More is fine too.",
      sigs:"Signatures", sigsS:"Our favourite bowls. Tap and adjust as you like.",
      layers1:"1 fruit and topping layer", layers2:"2 fruit and topping layers", popular:"Popular", wenig:"light", normal:"regular", viel:"extra",
      l_sb:"Sauce bottom", l_acai:"Açaí", l_chia:"Chia pudding", l_gran:"Granola", l_cg:"Chia pudding and granola", l_top:"Fruit and toppings", l_st:"Sauce on top", none:"none", edit:"edit",
      allg:"Allergens in your bowl (guide value):", allgNone:"none of the 14 major allergens in your choice", spuren:"Traces possible. Just ask us.",
      more:"Add a drink?", moreS:"Matcha, limeade or coffee goes perfectly.", noThanks:"No thanks, go to cart", size:"Size", milk:"Milk", flavor:"Flavour", kind:"Type", hot:"Hot", ice:"Iced",
      classic:"Classic iced", flav:"Flavoured", empty:"Your cart is empty.", more2:"Add more", card:"Card", cardS:"Girocard, credit card, Apple Pay, Google Pay", cash:"Cash at the counter",
      cashS:"You get a number and pay at the counter.", hold:"Hold your card or phone to the terminal", paid:"Thank you! Paid.", cashDue:"Please pay at the counter now", number:"Your number",
      ready:"We are building your bowl layer by layer.", readyS:"Your number shows on the screen when it is ready.", newOrder:"New order", filterOn:"Allergens", filterT:"I avoid",
      filterS:"We mark what contains it. You decide.", ok:"Done", still:"Still there?", stillS:"Going back to start soon.", yes:"Yes, continue", contains:"contains",
      added:"Added: ", out:"sold out"}
};
var S = {lang: "de", screen: "attract", cart: [], filter: [], bowl: null, step: 0, sheet: null, dlg: null, toast: null, last: null};
function t(k){ return (T[S.lang][k] != null ? T[S.lang][k] : T.de[k]) || k; }
function nm(i){ return S.lang === "en" && i.name_en ? i.name_en : i.name; }
function eur(c){ return (c / 100).toFixed(2).replace(".", ",") + " €"; }
function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
var uidN = 1;
var STEPS = ["size", "sb", "chia", "fruit", "crunch", "st", "sum"];

/* ---------------- Bowl Logik ---------------- */
function newBowl(){ return {size: null, sb: {}, chia: {}, fruit: {}, crunch: {}, st: {}}; }
function keys(o){ return Object.keys(o || {}); }
function bowlAllergens(b){ var c = {}, m = {}; ["sb", "chia", "fruit", "crunch", "st"].forEach(function(k){ keys(b[k]).forEach(function(id){ var i = ING[id]; i.contains.forEach(function(n){ c[n] = 1; }); i.may.forEach(function(n){ m[n] = 1; }); }); });
  return {contains: keys(c).map(Number).sort(function(a, b){ return a - b; }), may: keys(m).map(Number).filter(function(n){ return !c[n]; }).sort(function(a, b){ return a - b; })}; }
function itemsOf(o){ return keys(o).map(function(id){ return {id: id, name: ING[id].name, name_en: ING[id].name_en, color: ING[id].color, amt: o[id]}; }); }
function amtTxt(a){ return a && a !== "normal" ? " (" + t(a) + ")" : ""; }
function listTxt(arr){ return arr.length ? arr.map(function(i){ return nm(i) + amtTxt(i.amt); }).join(", ") : t("none"); }
/* Schichtfolge laut Kundenmeeting 13.10.2026. Reihenfolge = Bau Reihenfolge, unten zuerst. */
function layers(b){
  var sz = b.size || "M", chia = {}, gran = {}; keys(b.chia).forEach(function(id){ if (id === "chia-pudding") chia[id] = b.chia[id]; else gran[id] = b.chia[id]; });
  var top = itemsOf(b.fruit).concat(itemsOf(b.crunch));
  var L = [{k: "sb", step: "sb", label: t("l_sb"), kind: "sauce", items: itemsOf(b.sb)}, {k: "acai1", step: "size", label: t("l_acai"), kind: "acai", items: []}];
  if (sz === "S"){
    L.push({k: "chia", step: "chia", label: t("l_chia"), kind: "chia", items: itemsOf(chia), optional: true});
    L.push({k: "gran", step: "chia", label: t("l_gran"), kind: "gran", items: itemsOf(gran), optional: true});
    L.push({k: "acai2", step: "size", label: t("l_acai"), kind: "acai", items: []});
    L.push({k: "top1", step: "fruit", label: t("l_top"), kind: "top", items: top, dome: true});
  } else {
    L[1].label = t("l_acai") + " · Layer 1";
    L.push({k: "cg", step: "chia", label: t("l_cg"), kind: "cg", items: itemsOf(chia).concat(itemsOf(gran))});
    L.push({k: "top1", step: "fruit", label: t("l_top") + " · Layer 1", kind: "top", items: top});
    L.push({k: "acai2", step: "size", label: t("l_acai") + " · Layer 2", kind: "acai", items: []});
    L.push({k: "top2", step: "fruit", label: t("l_top") + " · Layer 2", kind: "top", items: top, dome: true});
  }
  L.push({k: "st", step: "st", label: t("l_st"), kind: "drizzle", items: itemsOf(b.st)});
  return L;
}

/* ---------------- Becher Vorschau (SVG, grafisch, keine Fotos) ---------------- */
function rng(seed){ var s = seed % 2147483647; if (s <= 0) s += 2147483646; return function(){ s = s * 16807 % 2147483647; return (s - 1) / 2147483646; }; }
function cupSVG(b, w, activeStep){
  var L = layers(b), si = STEPS.indexOf(activeStep), id = "c" + (uidN++);
  var visited = function(step){ return STEPS.indexOf(step) < si || activeStep === "sum" || activeStep === undefined; };
  var H = {sauce: .55, acai: 2.1, chia: 1.25, gran: .75, cg: 1.7, top: 1.0};
  var inside = L.filter(function(l){ return !l.dome && l.kind !== "drizzle"; }).filter(function(l){ return !(l.optional && visited(l.step) && !l.items.length); });
  var units = inside.reduce(function(a, l){ return a + H[l.kind]; }, 0), y = 380, scale = 290 / units, r = rng(7), out = "";
  var X = function(yy){ var f = (yy - 90) / 290; return [30 + 30 * f, 270 - 30 * f]; };
  inside.forEach(function(l){
    var h = H[l.kind] * scale, y1 = y - h, ghost = (l.kind !== "acai" && !l.items.length && !visited(l.step)) || (l.kind === "sauce" && !l.items.length), on = l.step === activeStep && l.kind !== "acai";
    if (l.kind === "acai") out += '<rect x="0" y="' + y1 + '" width="300" height="' + (h + .5) + '" fill="url(#ac' + id + ')"/>';
    else if (ghost) out += '<rect x="0" y="' + y1 + '" width="300" height="' + h + '" fill="rgba(233,220,251,.06)"/><line x1="0" x2="300" y1="' + y1 + '" y2="' + y1 + '" stroke="rgba(233,220,251,.35)" stroke-dasharray="6 6"/>';
    else if (l.kind === "sauce"){ var n = l.items.length; l.items.forEach(function(it, i){ out += '<rect x="' + (300 * i / n) + '" y="' + y1 + '" width="' + (300 / n + 1) + '" height="' + (h + .5) + '" fill="' + it.color + '"/>'; }); }
    else {
      var base = l.kind === "top" ? "#4a1450" : (l.items[0] || {}).color || "#EDE6DA";
      if (l.kind === "cg"){ var hc = l.items.some(function(i){ return i.id === "chia-pudding"; }), gr = l.items.filter(function(i){ return i.id !== "chia-pudding"; });
        var hh = hc && gr.length ? h * .6 : (hc ? h : 0);
        if (hc){ out += '<rect x="0" y="' + (y - hh) + '" width="300" height="' + (hh + .5) + '" fill="#EDE6DA"/>'; for (var d = 0; d < 70; d++) out += '<circle cx="' + (r() * 300) + '" cy="' + (y - hh + r() * hh) + '" r="1.6" fill="#222"/>'; }
        if (gr.length){ var gy = y - hh, gh = h - hh; gr.forEach(function(g, i){ out += '<rect x="' + (300 * i / gr.length) + '" y="' + (gy - gh) + '" width="' + (300 / gr.length + 1) + '" height="' + (gh + .5) + '" fill="' + g.color + '"/>'; });
          for (var e = 0; e < 60; e++) out += '<circle cx="' + (r() * 300) + '" cy="' + (gy - gh + r() * gh) + '" r="' + (2 + r() * 3) + '" fill="rgba(60,30,10,.45)"/>'; }
      } else {
        out += '<rect x="0" y="' + y1 + '" width="300" height="' + (h + .5) + '" fill="' + base + '"/>';
        if (l.kind === "chia") for (var c2 = 0; c2 < 60; c2++) out += '<circle cx="' + (r() * 300) + '" cy="' + (y1 + r() * h) + '" r="1.6" fill="#222"/>';
        if (l.kind === "gran") for (var g2 = 0; g2 < 50; g2++) out += '<circle cx="' + (r() * 300) + '" cy="' + (y1 + r() * h) + '" r="' + (2 + r() * 3) + '" fill="rgba(60,30,10,.45)"/>';
        if (l.kind === "top") out += dots(l.items, y1, h, r, 26);
      }
    }
    if (on) out += '<rect x="2" y="' + (y1 + 1) + '" width="296" height="' + (h - 2) + '" fill="none" stroke="#FF4FA3" stroke-width="5"/>';
    y = y1;
  });
  // Krone oben (Früchte und Toppings über dem Rand) und Sauce Drizzle
  var dome = L.filter(function(l){ return l.dome; })[0], st = L[L.length - 1], topOut = "";
  var domeOn = dome.items.length > 0, domePath = "M30 92 C 40 40, 260 40, 270 92 Z";
  if (domeOn) topOut += '<path d="' + domePath + '" fill="#4a1450"/>' + '<g clip-path="url(#dm' + id + ')">' + dots(dome.items, 48, 46, rng(11), 40) + "</g>";
  else if (!visited("fruit")) topOut += '<path d="' + domePath + '" fill="rgba(233,220,251,.06)" stroke="rgba(233,220,251,.35)" stroke-dasharray="6 6"/>';
  if (st.items.length) st.items.forEach(function(s, i){ var pts = ""; for (var k = 0; k <= 10; k++) pts += (40 + k * 22) + "," + (62 + i * 9 + (k % 2 ? 16 : 0) - (k > 1 && k < 9 ? 10 : 0)) + " ";
    topOut += '<polyline points="' + pts + '" fill="none" stroke="' + s.color + '" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity=".95"/>'; });
  if (activeStep === "fruit" || activeStep === "crunch") topOut += '<path d="' + domePath + '" fill="none" stroke="#FF4FA3" stroke-width="5"/>';
  if (activeStep === "st") topOut += '<path d="M30 92 C 40 40, 260 40, 270 92" fill="none" stroke="#FF4FA3" stroke-width="5" stroke-dasharray="10 8"/>';
  var cup = "M30 90 L270 90 L240 380 Q240 386 234 386 L66 386 Q60 386 60 380 Z";
  return '<svg viewBox="0 0 300 400" width="' + w + '" height="' + (w * 400 / 300) + '" aria-hidden="true"><defs><clipPath id="cl' + id + '"><path d="' + cup + '"/></clipPath><clipPath id="dm' + id + '"><path d="' + domePath + '"/></clipPath>' +
    '<linearGradient id="ac' + id + '" x1="0" x2="1"><stop offset="0" stop-color="#2b0632"/><stop offset=".5" stop-color="#4a0d55"/><stop offset="1" stop-color="#2b0632"/></linearGradient></defs>' +
    topOut + '<g clip-path="url(#cl' + id + ')"><rect width="300" height="400" fill="rgba(255,255,255,.04)"/>' + out + "</g>" +
    '<path d="' + cup + '" fill="url(#gl' + id + ')" stroke="rgba(255,255,255,.65)" stroke-width="3"/><linearGradient id="gl' + id + '" x1="0" x2="1"><stop offset="0" stop-color="rgba(255,255,255,.14)"/><stop offset=".3" stop-color="rgba(255,255,255,0)"/><stop offset="1" stop-color="rgba(255,255,255,.06)"/></linearGradient>' +
    '<rect x="22" y="84" width="256" height="10" rx="5" fill="rgba(255,255,255,.55)"/></svg>';
}
function dots(items, y, h, r, n){
  if (!items.length) return ""; var o = "";
  for (var i = 0; i < n; i++){ var it = items[i % items.length], isC = ING[it.id] && ING[it.id].group === "crunch", cx = 30 + r() * 240, cy = y + 4 + r() * (h - 8);
    o += isC ? '<rect x="' + cx + '" y="' + cy + '" width="' + (5 + r() * 6) + '" height="' + (4 + r() * 5) + '" fill="' + it.color + '" stroke="rgba(0,0,0,.25)"/>' : '<circle cx="' + cx + '" cy="' + cy + '" r="' + (8 + r() * 6) + '" fill="' + it.color + '" stroke="rgba(0,0,0,.25)"/>'; }
  return o;
}

/* ---------------- Preise ---------------- */
function linePrice(l){
  if (l.type === "bowl") return SIZE[l.bowl.size].price;
  if (l.kind === "matcha") return (l.flavor ? M.drinks.matcha.flavoured : M.drinks.matcha.classic)[l.size];
  if (l.kind === "limeade") return M.drinks.limeade.price[l.size];
  return COF[l.item].price;
}
function lineTotal(l){ return linePrice(l) * l.qty; }
function totals(c){ var g7 = 0, g19 = 0; c.forEach(function(l){ if (l.type === "bowl") g7 += lineTotal(l); else g19 += lineTotal(l); });
  var v7 = Math.round(g7 * 7 / 107), v19 = Math.round(g19 * 19 / 119); return {gross: g7 + g19, vat7: v7, vat19: v19, net: g7 + g19 - v7 - v19}; }
function count(c){ return c.reduce(function(a, l){ return a + l.qty; }, 0); }
function lineTitle(l){
  if (l.type === "bowl") return l.bowl.sig ? l.bowl.sig + (l.bowl.sigId ? "" : (S.lang === "en" ? " (customised)" : " (angepasst)")) + " · " + l.bowl.size : SIZE[l.bowl.size].name;
  if (l.kind === "matcha") return l.flavor ? "Flavoured Matcha " + nm(FLAV[l.flavor]) : "Matcha Classic Iced";
  if (l.kind === "limeade") return LIME[l.sort].name;
  return COF[l.item].name;
}
function lineDetail(l){
  if (l.type === "bowl"){ var b = l.bowl, ch = itemsOf(b.chia);
    return [SIZE[b.size].cup, t("l_sb") + ": " + listTxt(itemsOf(b.sb)), ch.length ? listTxt(ch) : null, listTxt(itemsOf(b.fruit)), listTxt(itemsOf(b.crunch)), t("l_st") + ": " + listTxt(itemsOf(b.st))].filter(Boolean).join(" · "); }
  if (l.kind === "matcha") return l.size + " " + M.drinks.sizes[l.size] + " · " + nm(ING[l.milk]);
  if (l.kind === "limeade") return l.size + " " + M.drinks.sizes[l.size];
  return (l.temp === "ice" ? t("ice") : t("hot")) + (l.milk ? " · " + nm(ING[l.milk]) : "");
}
function lineImg(l){
  if (l.type === "bowl") return l.bowl.sigId && SIG[l.bowl.sigId] ? SIG[l.bowl.sigId].img : SIZE[l.bowl.size].img;
  if (l.kind === "matcha") return l.flavor ? FLAV[l.flavor].img : M.drinks.matcha.img;
  if (l.kind === "limeade") return LIME[l.sort].img;
  return COF[l.item].img;
}
function slugOf(l){ var a = lineImg(l).match(/p\/(.+)_400\.webp/); return a ? a[1] : ""; }
function addLine(l){ var key = JSON.stringify(l, function(k, v){ return k === "uid" || k === "qty" ? undefined : v; });
  for (var i = 0; i < S.cart.length; i++){ var k2 = JSON.stringify(S.cart[i], function(k, v){ return k === "uid" || k === "qty" ? undefined : v; }); if (k2 === key){ S.cart[i].qty = Math.min(R.max_qty, S.cart[i].qty + l.qty); return; } }
  l.uid = uidN++; S.cart.push(l); }

/* ---------------- API (Demo: localStorage; Betrieb: Server) ---------------- */
var bc = ("BroadcastChannel" in window) ? new BroadcastChannel("acaixyou") : null;
function db(){ try { return JSON.parse(localStorage.getItem("axy-orders") || "[]"); } catch(e){ return []; } }
function save(o){ try { localStorage.setItem("axy-orders", JSON.stringify(o)); } catch(e){} if (bc) bc.postMessage("orders"); }
function soldOut(){ try { return JSON.parse(localStorage.getItem("axy-sold") || "[]"); } catch(e){ return []; } }
function setSold(a){ try { localStorage.setItem("axy-sold", JSON.stringify(a)); } catch(e){} if (bc) bc.postMessage("sold"); }
function nextNumber(){ var d = new Date().toISOString().slice(0, 10), st; try { st = JSON.parse(localStorage.getItem("axy-seq") || "{}"); } catch(e){ st = {}; }
  if (st.d !== d) st = {d: d, n: R.order_start - 1}; st.n++; try { localStorage.setItem("axy-seq", JSON.stringify(st)); } catch(e){} return R.order_prefix + st.n; }
function buildOrder(method){
  var tt = totals(S.cart), now = new Date().toISOString();
  return {id: "o" + Date.now(), number: nextNumber(), created_at: now, language: S.lang,
    lines: S.cart.map(function(l){ var o = {type: l.type, slug: slugOf(l), name: lineTitle(l), detail: lineDetail(l), qty: l.qty, unit_price: linePrice(l), line_total: lineTotal(l), vat: l.type === "bowl" ? 7 : 19,
      station: l.type === "bowl" ? "theke" : "bar"}; if (l.type === "bowl") o.bowl = l.bowl; else o.drink = {kind: l.kind, size: l.size || null, flavor: l.flavor || null, sort: l.sort || null, item: l.item || null, temp: l.temp || null, milk: l.milk || null}; return o; }),
    totals: tt, payment: {method: method, status: method === "card" ? "paid" : "open"}, status: method === "card" ? "new" : "awaiting_payment",
    status_log: [{s: method === "card" ? "new" : "awaiting_payment", at: now}]};
}
function placeOrder(method){ var o = buildOrder(method), all = db(); all.push(o); save(all); return o; }
function advance(id, status){ var all = db(); all.forEach(function(o){ if (o.id === id){ o.status = status; o.status_log.push({s: status, at: new Date().toISOString()}); if (status === "new") o.payment.status = "paid"; } }); save(all); }

/* ---------------- Ansichten Gast ---------------- */
function toast(m){ S.toast = m; render(); setTimeout(function(){ if (S.toast === m){ S.toast = null; render(); } }, 2200); }
function render(){
  if (VIEW !== "kiosk") return;
  var h = "";
  switch (S.screen){
    case "attract": h = vAttract(); break;
    case "home": h = vTop() + vHome() + vBar(); break;
    case "build": h = vTop() + vBuild(); break;
    case "drinks": h = vTop() + vDrinks() + vBar(); break;
    case "cart": h = vTop() + vCart(); break;
    case "pay": h = vTop() + vPay(); break;
    case "wait": h = vTop() + '<div class="page full center"><h2 style="margin:0 60px">' + t("hold") + '</h2><div class="spin"></div></div>'; break;
    case "done": h = vDone(); break;
  }
  if (S.sheet) h += vSheet();
  if (S.dlg) h += vDlg();
  if (S.toast) h += '<div class="toast">' + esc(S.toast) + "</div>";
  app.innerHTML = h;
  var mm = app.querySelector(".build .main"); if (mm && S._scroll != null) mm.scrollTop = S._scroll;
  if (S.screen === "attract") startAttract();
}
function vTop(){
  return '<div class="top"><div class="brand" data-act="logo"><img src="assets/logo.png" alt="Açaí x You"><b>AÇAÍ<i>X</i>YOU</b></div><div class="tools">' +
    '<button class="chip' + (S.filter.length ? " on" : "") + '" data-act="afilter">' + t("filterOn") + (S.filter.length ? " (" + S.filter.length + ")" : "") + "</button>" +
    '<button class="chip' + (S.lang === "de" ? " on" : "") + '" data-act="lang" data-v="de">DE</button><button class="chip' + (S.lang === "en" ? " on" : "") + '" data-act="lang" data-v="en">EN</button></div></div>';
}
function vAttract(){
  return '<div class="attract" data-act="start"><img class="logo" src="assets/logo.png" alt="Açaí x You"><div class="vid"><video id="av" muted playsinline loop autoplay src="assets/attract.mp4"></video></div>' +
    '<h1 class="h">Build it <span class="your">YOUR</span> way.</h1><div class="tap">' + t("tap") + '</div>' +
    '<div class="langs"><button class="chip' + (S.lang === "de" ? " on" : "") + '" data-act="lang" data-v="de">Deutsch</button><button class="chip' + (S.lang === "en" ? " on" : "") + '" data-act="lang" data-v="en">English</button></div></div>';
}
function vHome(){
  return '<div class="page"><h2>' + t("what") + '</h2><p class="sub">100 % Açaí · 100 % You</p><div class="home">' +
    '<button class="big bowl" data-act="newBowl"><div class="txt"><b>' + t("bowl") + "</b><span>" + t("bowlS") + '</span><div class="price">S ' + eur(SIZE.S.price) + " · M " + eur(SIZE.M.price) + " · L " + eur(SIZE.L.price) + '</div><div class="badge">' + t("incl") + '</div></div><img src="' + SIZE.M.img_big + '" alt=""></button>' +
    '<button class="big" data-act="drinks"><div class="txt"><b>' + t("drinks") + "</b><span>" + t("drinksS") + '</span><div class="price">' + t("from") + " " + eur(220) + '</div></div><div class="drinks"><img src="' + COF["kaffee-cappuccino"].img + '" alt=""><img src="' + LIME["strawberry-limeade"].img + '" alt=""><img src="' + FLAV["flavor-erdbeere"].img + '" alt=""></div></button>' +
    "</div>" + '<div class="dsec" style="margin-top:26px">' + t("sigs") + " <small>" + t("sigsS") + '</small></div><div class="sigs">' + M.signatures.map(function(sg){
      return '<button class="sig" data-act="sig" data-v="' + sg.id + '"><img src="' + sg.img + '" alt=""><b>' + esc(sg.name) + "</b><span>" + esc(sg.zutaten) + '</span><i>' + eur(sg.price) + "</i></button>"; }).join("") + "</div></div>";
}
function vBar(){
  var tt = totals(S.cart).gross, n = count(S.cart);
  return '<div class="bar"><div class="tot"><small>' + t("cart") + " · " + n + '</small><b>' + eur(tt) + '</b></div>' + (S.screen === "drinks" ? '<button class="btn sec" data-act="home">' + t("back") + "</button>" : "") +
    '<button class="btn' + (n ? "" : " dis") + '" data-act="toCart">' + t("toCart") + "</button></div>";
}
function stepIdx(){ return STEPS.indexOf(S.step); }
function vBuild(){
  var b = S.bowl, st = S.step, i = stepIdx(), body = "";
  var prog = '<div class="steps">' + STEPS.map(function(s, k){ return '<span class="' + (k < i ? "ok" : k === i ? "on" : "") + '"></span>'; }).join("") + "</div>";
  if (st === "size") body = '<div class="sizes">' + M.sizes.map(function(s){ return '<button class="size' + (b.size === s.id ? " on" : "") + '" data-act="size" data-v="' + s.id + '">' + (s.popular ? '<span class="pop">' + t("popular") + "</span>" : "") +
      '<img src="' + s.img + '" alt=""><div><b>' + s.id + '</b><div class="cup">' + s.cup + '</div><div class="lay">' + (s.layers === 1 ? t("layers1") : t("layers2")) + '</div></div><div class="p">' + eur(s.price) + "</div></button>"; }).join("") + "</div>";
  else if (st === "sum") body = vSummary();
  else {
    var g = {sb: "sauce", st: "sauce", chia: "chia", fruit: "fruit", crunch: "crunch"}[st], sel = b[st], so = soldOut();
    var note = st === "chia" ? (b.size === "S" ? t("n_chia_S") : t("n_chia_ML")) : st === "fruit" ? t("n_fruit") + (b.size !== "S" ? " " + t("n_fruitML") : "") : t("n_" + st);
    body = '<p class="note">' + note + "</p>" + (st === "st" && keys(b.sb).length ? '<button class="chipbtn" data-act="same">' + t("same") + "</button>" : "") + '<div class="tiles">' + M.groups[g].map(function(it){
      var on = sel[it.id] != null, warn = it.contains.filter(function(n){ return S.filter.indexOf(String(n)) > -1; }), out = so.indexOf(it.id) > -1;
      var sw = '<div class="sw" style="background:' + it.color + '">' + (it.id === "chia-pudding" || it.id === "chiasamen" ? '<svg width="92" height="92">' + [10, 30, 50, 70, 22, 44, 66, 36, 58].map(function(x, k){ return '<circle cx="' + (x + 6) + '" cy="' + (16 + (k * 23) % 62) + '" r="3" fill="#222"/>'; }).join("") + "</svg>" : "") + "</div>";
      return '<div role="button" class="tile' + (on ? " on" : "") + (warn.length ? " warn" : "") + (out ? " out" : "") + '" data-act="tog" data-v="' + it.id + '">' + sw + '<div class="nm">' + esc(nm(it)) + "</div>" +
        (it.contains.length ? '<div class="al">' + it.contains.join(" · ") + "</div>" : "") + (warn.length ? '<div class="wt">' + t("contains") + " " + warn.map(function(n){ return M.short[n]; }).join(", ") + "</div>" : "") +
        (on ? '<div class="amt">' + R.amounts.map(function(a){ return '<span role="button" data-act="amt" data-v="' + it.id + '" data-d="' + a + '" class="' + (sel[it.id] === a ? "on" : "") + '">' + t(a) + "</span>"; }).join("") + "</div>" : "") + "</div>";
    }).join("") + "</div>";
    var n = keys(sel).length, ns = keys(b.sb).length + keys(b.st).filter(function(k){ return b.sb[k] == null; }).length, tip = (st === "sb" || st === "st") && ns > R.suggest.sauce_total ? t("tipS") : st === "fruit" && n > R.suggest.fruit ? t("tipF") : st === "crunch" && n > R.suggest.crunch ? t("tipC") : "";
    if (tip) body += '<div class="tip">' + tip + "</div>";
  }
  var side = st === "size" || st === "sum" ? "" : '<div class="mini"><small>' + (b.size ? "Bowl " + b.size : "Bowl") + "</small>" + cupSVG(b, 230, st) + '<div class="price">' + (b.size ? eur(SIZE[b.size].price) : "") + "</div></div>";
  var nextLbl = st === "sum" ? t("add") : st === "size" ? t("next") : (keys(b[st]).length ? t("next") : t("skip"));
  return '<div class="page"><div class="steplab">' + (i + 1) + " / " + STEPS.length + " · " + t("st_" + st) + '</div><h2 style="font-size:64px">' + t("h_" + st) + "</h2>" + prog +
    '<div class="build" style="' + (side ? "" : "grid-template-columns:1fr") + '"><div class="main">' + body + "</div>" + side + "</div></div>" +
    '<div class="bar"><button class="btn sec" data-act="stepBack">' + t("back") + '</button><div class="tot"><small>' + t("total") + '</small><b>' + eur(totals(S.cart).gross + (b.size ? SIZE[b.size].price : 0)) + "</b></div>" +
    '<button class="btn' + (st === "size" && !b.size ? " dis" : "") + '" data-act="stepNext">' + nextLbl + "</button></div>";
}
function vSummary(){
  var b = S.bowl, L = layers(b).filter(function(l){ return !(l.optional && !l.items.length); }), al = bowlAllergens(b);
  var li = L.map(function(l, k){ var d = l.kind === "acai" ? "Açaí Basis" : listTxt(l.items);
    return '<li><span class="n">' + (k + 1) + "</span><div><b>" + esc(l.label) + "</b><span>" + esc(d) + "</span></div>" + (l.kind !== "acai" ? '<button class="ed" data-act="goStep" data-v="' + l.step + '">' + t("edit") + "</button>" : "") + "</li>"; }).join("");
  return '<div class="sum"><div class="cupbig">' + (b.sigId ? '<img class="sigph" src="' + SIG[b.sigId].img_big + '" alt="">' : "") + cupSVG(b, b.sigId ? 280 : 400, "sum") + '<div class="h" style="font-size:44px;margin-top:4px">' + esc(b.sig ? b.sig : SIZE[b.size].name) + '</div><div style="font-size:24px;color:#E9DCFB">' + SIZE[b.size].cup + " · " + eur(SIZE[b.size].price) + '</div></div>' +
    '<div><ul class="layers">' + li + '</ul><div class="allg"><b>' + t("allg") + "</b> " + (al.contains.length ? al.contains.map(function(n){ return n + " " + M.short[n]; }).join(", ") : t("allgNone")) +
    (al.may.length ? ". " + (S.lang === "en" ? "May contain: " : "Kann enthalten: ") + al.may.map(function(n){ return n + " " + M.short[n]; }).join(", ") : "") + ". " + t("spuren") + "</div></div></div>";
}
function vDrinks(){
  var d = M.drinks, mt = d.matcha;
  return '<div class="page" style="overflow-y:auto"><h2>' + t("drinks") + '</h2><p class="sub">' + t("drinksS") + "</p>" +
    '<div class="dsec">Matcha <small>M ' + d.sizes.M + " · L " + d.sizes.L + "</small></div><div class=\"dgrid\">" +
    '<button class="dcard" data-act="openDrink" data-v="matcha" data-d=""><img src="' + mt.img + '" alt=""><b>Matcha<br>Classic Iced</b><span>' + eur(mt.classic.M) + " / " + eur(mt.classic.L) + "</span></button>" +
    mt.flavors.map(function(f){ return '<button class="dcard" data-act="openDrink" data-v="matcha" data-d="' + f.id + '"><img src="' + f.img + '" alt=""><b>Flavoured Matcha<br>' + esc(nm(f)) + "</b><span>" + eur(mt.flavoured.M) + " / " + eur(mt.flavoured.L) + "</span></button>"; }).join("") + "</div>" +
    '<div class="dsec">Limeades <small>M ' + d.sizes.M + " · L " + d.sizes.L + '</small></div><div class="dgrid">' + d.limeade.sorts.map(function(s){
      return '<button class="dcard" data-act="openDrink" data-v="limeade" data-d="' + s.id + '"><img src="' + s.img + '" alt=""><b>' + esc(s.name) + "</b><span>" + eur(d.limeade.price.M) + " / " + eur(d.limeade.price.L) + "</span></button>"; }).join("") + "</div>" +
    '<div class="dsec">' + (S.lang === "en" ? "Coffee" : "Kaffee") + " <small>" + t("hot") + " / " + t("ice") + '</small></div><div class="dgrid">' + d.coffee.items.map(function(c){
      return '<button class="dcard" data-act="openDrink" data-v="coffee" data-d="' + c.id + '"><img src="' + c.img + '" alt=""><b>' + esc(c.name) + "</b><span>" + eur(c.price) + "</span></button>"; }).join("") + "</div></div>";
}
function opts(act, list, cur){ return '<div class="opts">' + list.map(function(o){ return '<button class="' + (cur === o[0] ? "on" : "") + '" data-act="' + act + '" data-v="' + o[0] + '">' + esc(o[1]) + (o[2] ? "<small>" + o[2] + "</small>" : "") + "</button>"; }).join("") + "</div>"; }
function vSheet(){
  var l = S.sheet.l, d = M.drinks, h = "", milks = M.milks.map(function(m){ return [m.id, nm(m), m.contains.length ? m.contains.join(",") : ""]; });
  if (l.kind === "matcha"){
    var pr = l.flavor ? d.matcha.flavoured : d.matcha.classic;
    h += '<div class="opt"><h4>' + t("kind") + "</h4>" + opts("mKind", [["classic", t("classic")], ["flav", t("flav")]], l.flavor ? "flav" : "classic") + "</div>";
    if (l.flavor) h += '<div class="opt"><h4>' + t("flavor") + "</h4>" + opts("mFlav", d.matcha.flavors.map(function(f){ return [f.id, nm(f)]; }), l.flavor) + "</div>";
    h += '<div class="opt"><h4>' + t("milk") + "</h4>" + opts("milk", milks, l.milk) + "</div>";
    h += '<div class="opt"><h4>' + t("size") + "</h4>" + opts("dSize", [["M", "M " + d.sizes.M, eur(pr.M)], ["L", "L " + d.sizes.L, eur(pr.L)]], l.size) + "</div>";
  } else if (l.kind === "limeade"){
    h += '<div class="opt"><h4>' + t("flavor") + "</h4>" + opts("lSort", d.limeade.sorts.map(function(s){ return [s.id, s.name]; }), l.sort) + "</div>";
    h += '<div class="opt"><h4>' + t("size") + "</h4>" + opts("dSize", [["M", "M " + d.sizes.M, eur(d.limeade.price.M)], ["L", "L " + d.sizes.L, eur(d.limeade.price.L)]], l.size) + "</div>";
  } else {
    h += '<div class="opt"><h4>' + (S.lang === "en" ? "Coffee" : "Kaffee") + "</h4>" + opts("cItem", d.coffee.items.map(function(c){ return [c.id, c.name, eur(c.price)]; }), l.item) + "</div>";
    h += '<div class="opt"><h4>' + t("hot") + " / " + t("ice") + "</h4>" + opts("cTemp", [["hot", t("hot")], ["ice", t("ice")]], l.temp) + "</div>";
    if (COF[l.item].milk) h += '<div class="opt"><h4>' + t("milk") + "</h4>" + opts("milk", milks, l.milk) + "</div>";
  }
  return '<div class="scrim" data-act="closeSheet"></div><div class="sheet"><div class="hd"><img src="' + lineImg(l) + '" alt=""><div><b>' + esc(lineTitle(l)) + "</b><span>" + esc(lineDetail(l)) + "</span></div></div>" + h +
    '<div class="acts"><button class="btn sec" data-act="closeSheet">' + t("back") + '</button><button class="btn" data-act="addDrink">' + t("add") + " · " + eur(linePrice(l)) + "</button></div></div>";
}
function vCart(){
  var tt = totals(S.cart);
  return '<div class="page"><h2>' + t("cart") + '</h2><div class="cart">' + (S.cart.length ? S.cart.map(function(l){
    return '<div class="ln"><img src="' + lineImg(l) + '" alt=""><div class="t"><b>' + esc(lineTitle(l)) + "</b><span>" + esc(lineDetail(l)) + '</span></div><div class="q"><button data-act="lq" data-v="' + l.uid + '" data-d="-1">−</button><b>' + l.qty +
      '</b><button data-act="lq" data-v="' + l.uid + '" data-d="1">+</button></div><div class="p">' + eur(lineTotal(l)) + "</div></div>"; }).join("") : '<div class="empty">' + t("empty") + "</div>") + "</div></div>" +
    '<div class="bar"><button class="btn sec" data-act="home">' + t("more2") + '</button><div class="tot"><small>' + t("total") + " · MwSt 7 % " + eur(tt.vat7) + " · 19 % " + eur(tt.vat19) + "</small><b>" + eur(tt.gross) + "</b></div>" +
    '<button class="btn' + (S.cart.length ? "" : " dis") + '" data-act="toPay">' + t("pay") + "</button></div>";
}
function vPay(){
  return '<div class="page full"><h2>' + t("pay") + '</h2><p class="sub">' + t("total") + " " + eur(totals(S.cart).gross) + '</p><div class="pay"><button class="paybtn" data-act="payCard"><span class="ico">💳</span><span><b>' + t("card") + "</b><span>" + t("cardS") +
    '</span></span></button><button class="paybtn" data-act="payCash"><span class="ico">🪙</span><span><b>' + t("cash") + "</b><span>" + t("cashS") + '</span></span></button></div><div style="margin-top:40px"><button class="btn sec" data-act="toCart">' + t("back") + "</button></div></div>";
}
function receipt(o){
  var p = function(s, n){ s = String(s); while (s.length < n) s += " "; return s.slice(0, n); }, r = function(s, n){ s = String(s); while (s.length < n) s = " " + s; return s; };
  var out = "AÇAÍ X YOU\n[Betreiber, Adresse, USt-IdNr. je Standort]\n" + new Date(o.created_at).toLocaleString("de-DE") + "\nBestellung " + o.number + "  To Go\n------------------------------\n";
  o.lines.forEach(function(l){ out += p(l.qty + "x " + l.name, 22) + r(eur(l.line_total).replace(" ", ""), 8) + "\n"; });
  out += "------------------------------\n" + p("GESAMT", 22) + r(eur(o.totals.gross).replace(" ", ""), 8) + "\nMwSt 7% " + eur(o.totals.vat7).replace(" ", "") + "  MwSt 19% " + eur(o.totals.vat19).replace(" ", "") + "\n" + (o.payment.method === "card" ? "Bezahlt mit Karte" : "ZAHLUNG OFFEN, bitte an der Theke") + "\nTSE: [Seriennummer, Signatur, Transaktion]\n";
  return out;
}
function vDone(){ var o = S.last;
  return '<div class="done"><img src="assets/logo.png" alt=""><h2>' + (o.payment.method === "card" ? t("paid") : t("cashDue")) + '</h2><div class="sp" style="font-size:28px">' + t("number") + '</div><div class="nr">' + o.number + '</div><div class="thumbs">' + o.lines.map(function(l){ return '<img src="assets/p/' + l.slug + '_400.webp" alt="">'; }).join("") + "</div><p>" + t("ready") + '</p><p style="font-size:28px">' + t("readyS") + '</p><div class="receipt">' + esc(receipt(o)) + '</div><button class="btn" data-act="newOrder">' + t("newOrder") + "</button></div>"; }
function vDlg(){
  var d = S.dlg;
  if (d.type === "upsell") return '<div class="scrim"></div><div class="dlg"><h3>' + t("more") + "</h3><p>" + t("moreS") + '</p><div class="dgrid" style="margin:0">' +
    [["matcha", "", "Matcha", M.drinks.matcha.img], ["limeade", M.drinks.limeade.sorts[0].id, "Limeade", M.drinks.limeade.sorts[0].img], ["coffee", "kaffee-cappuccino", S.lang === "en" ? "Coffee" : "Kaffee", COF["kaffee-cappuccino"].img]].map(function(x){ return '<button class="dcard" data-act="upDrink" data-v="' + x[0] + '" data-d="' + x[1] + '"><img src="' + x[3] + '" alt=""><b>' + x[2] + "</b></button>"; }).join("") +
    '</div><div class="acts"><button class="btn sec" style="flex:1" data-act="upNo">' + t("noThanks") + "</button></div></div>";
  if (d.type === "idle") return '<div class="scrim"></div><div class="dlg"><h3>' + t("still") + "</h3><p>" + t("stillS") + ' (<span id="idl">' + d.left + '</span>)</p><div class="acts"><button class="btn" data-act="closeDlg">' + t("yes") + "</button></div></div>";
  if (d.type === "afilter") return '<div class="scrim" data-act="closeDlg"></div><div class="dlg"><h3>' + t("filterT") + "</h3><p>" + t("filterS") + '</p><div class="afilter">' + Object.keys(M.allergens).map(function(n){
    return '<button class="' + (S.filter.indexOf(n) > -1 ? "on" : "") + '" data-act="ftoggle" data-v="' + n + '">' + n + " " + M.short[n] + "</button>"; }).join("") + '</div><p style="margin:20px 0 0;font-size:22px">' + M.allergen_status + '</p><div class="acts"><button class="btn" data-act="closeDlg">' + t("ok") + "</button></div></div>";
  if (d.type === "pin") return '<div class="scrim" data-act="closeDlg"></div><div class="dlg"><h3>Team</h3><p>PIN: ' + "●".repeat(d.v.length) + "○".repeat(Math.max(0, 4 - d.v.length)) + '</p><div class="pin">' + [1, 2, 3, 4, 5, 6, 7, 8, 9, "×", 0, "OK"].map(function(k){ return '<button data-act="pin" data-v="' + k + '">' + k + "</button>"; }).join("") + "</div></div>";
  if (d.type === "admin"){ var so = soldOut(); return '<div class="scrim" data-act="closeDlg"></div><div class="dlg" style="top:200px;max-height:1500px;overflow:auto"><h3>Heute aus</h3><p>Tippen schaltet eine Zutat ab oder wieder an.</p><div class="afilter">' +
    Object.keys(ING).filter(function(id){ return ING[id].group; }).map(function(id){ return '<button class="' + (so.indexOf(id) > -1 ? "on" : "") + '" data-act="sold" data-v="' + id + '">' + esc(ING[id].name) + "</button>"; }).join("") +
    '</div><div class="acts"><button class="btn" data-act="closeDlg">Fertig</button></div></div>'; }
  return "";
}

/* ---------------- Attract, Leerlauf ---------------- */
function startAttract(){ var v = document.getElementById("av"); if (v){ try { var p = v.play(); if (p && p.catch) p.catch(function(){}); } catch(e){} } }
var idle = {a: 0, b: 0};
function resetIdle(){
  clearTimeout(idle.a); clearInterval(idle.b); if (S.dlg && S.dlg.type === "idle"){ S.dlg = null; render(); }
  if (S.screen === "attract" || S.screen === "done" || VIEW !== "kiosk") return;
  idle.a = setTimeout(function(){ S.dlg = {type: "idle", left: R.idle_warning_seconds}; render();
    idle.b = setInterval(function(){ if (!S.dlg || S.dlg.type !== "idle"){ clearInterval(idle.b); return; } S.dlg.left--; var el = document.getElementById("idl"); if (el) el.textContent = S.dlg.left; if (S.dlg.left <= 0){ clearInterval(idle.b); reset(); } }, 1000);
  }, R.idle_seconds * 1000);
}
function reset(){ S.screen = "attract"; S.cart = []; S.bowl = null; S.sheet = null; S.dlg = null; S.filter = []; render(); }
var doneT = 0;

/* ---------------- Aktionen ---------------- */
function go(step){ S.step = step; S._scroll = 0; }
var ACT = {
  start: function(){ S.screen = "home"; },
  lang: function(v){ S.lang = v; },
  home: function(){ S.screen = "home"; S.sheet = null; },
  drinks: function(){ S.screen = "drinks"; },
  newBowl: function(){ S.bowl = newBowl(); S.screen = "build"; go("size"); },
  sig: function(v){ var sg = M.signatures.filter(function(x){ return x.id === v; })[0]; if (!sg) return; S.bowl = JSON.parse(JSON.stringify(sg.bowl)); S.bowl.sig = sg.name; S.bowl.sigId = sg.id;
    var so = soldOut(); ["sb", "chia", "fruit", "crunch", "st"].forEach(function(k){ keys(S.bowl[k]).forEach(function(id){ if (so.indexOf(id) > -1) delete S.bowl[k][id]; }); }); S.screen = "build"; go("sum"); },
  size: function(v){ var b = S.bowl, first = !b.size; if (b.size !== v) b.sigId = null; b.size = v; if (first || !keys(b.chia).length) { b.chia = {}; SIZE[v].chia_default.forEach(function(id){ if (soldOut().indexOf(id) < 0) b.chia[id] = "normal"; }); } go("sb"); },
  tog: function(v){ if (soldOut().indexOf(v) > -1) return; S.bowl.sigId = null; var o = S.bowl[S.step]; if (o[v] != null) delete o[v]; else o[v] = "normal"; },
  amt: function(v, d){ S.bowl[S.step][v] = d; S.bowl.sigId = null; },
  same: function(){ S.bowl.sigId = null; S.bowl.st = JSON.parse(JSON.stringify(S.bowl.sb)); },
  goStep: function(v){ go(v); },
  stepBack: function(){ var i = stepIdx(); if (S.bowl._edit){ S.bowl._edit = false; } if (i === 0){ S.screen = "home"; S.bowl = null; } else go(STEPS[i - 1]); },
  stepNext: function(){ var i = stepIdx(), b = S.bowl; if (S.step === "size" && !b.size) return;
    if (S.step === "sum"){ var l = {type: "bowl", qty: 1, bowl: JSON.parse(JSON.stringify(b))}; addLine(l); S.bowl = null; S.screen = "home";
      var hasDrink = S.cart.some(function(x){ return x.type === "drink"; }); if (!hasDrink) S.dlg = {type: "upsell"}; else toast(t("added") + SIZE[l.bowl.size].name); return; }
    go(STEPS[i + 1]); },
  upDrink: function(v, d){ S.dlg = null; S.screen = "drinks"; ACT.openDrink(v, d); },
  upNo: function(){ S.dlg = null; S.screen = "cart"; },
  openDrink: function(v, d){
    var l = {type: "drink", kind: v, qty: 1};
    if (v === "matcha"){ l.flavor = d || null; l.milk = M.drinks.matcha.milk_default; l.size = "M"; }
    else if (v === "limeade"){ l.sort = d; l.size = "M"; }
    else { l.item = d; l.temp = "hot"; l.milk = COF[d].milk ? "kuhmilch" : null; }
    S.sheet = {l: l}; },
  mKind: function(v){ S.sheet.l.flavor = v === "flav" ? (S.sheet.l.flavor || M.drinks.matcha.flavors[0].id) : null; },
  mFlav: function(v){ S.sheet.l.flavor = v; }, milk: function(v){ S.sheet.l.milk = v; }, dSize: function(v){ S.sheet.l.size = v; }, lSort: function(v){ S.sheet.l.sort = v; },
  cItem: function(v){ var l = S.sheet.l; l.item = v; l.milk = COF[v].milk ? (l.milk || "kuhmilch") : null; }, cTemp: function(v){ S.sheet.l.temp = v; },
  addDrink: function(){ var l = S.sheet.l; S.sheet = null; addLine(l); toast(t("added") + lineTitle(l)); },
  closeSheet: function(){ S.sheet = null; },
  toCart: function(){ if (S.screen !== "pay" && !S.cart.length) return; S.screen = "cart"; },
  lq: function(v, d){ var l = S.cart.filter(function(x){ return String(x.uid) === v; })[0]; if (!l) return; l.qty = Math.min(R.max_qty, l.qty + (+d)); if (l.qty < 1) S.cart = S.cart.filter(function(x){ return x !== l; }); },
  toPay: function(){ if (S.cart.length) S.screen = "pay"; },
  payCard: function(){ S.screen = "wait"; render(); setTimeout(function(){ finish("card"); }, 2400); return "stop"; },
  payCash: function(){ finish("cash"); return "stop"; },
  newOrder: function(){ reset(); },
  logo: function(){},
  afilter: function(){ S.dlg = {type: "afilter"}; }, ftoggle: function(v){ var i = S.filter.indexOf(v); if (i > -1) S.filter.splice(i, 1); else S.filter.push(v); },
  closeDlg: function(){ S.dlg = null; },
  pin: function(v){ var d = S.dlg; if (v === "×") d.v = d.v.slice(0, -1); else if (v === "OK"){ if (d.v === "1234") S.dlg = {type: "admin"}; else { d.v = ""; } } else if (d.v.length < 4){ d.v += v; if (d.v === "1234") S.dlg = {type: "admin"}; } },
  sold: function(v){ var a = soldOut(), i = a.indexOf(v); if (i > -1) a.splice(i, 1); else a.push(v); setSold(a); }
};
function finish(method){ S.last = placeOrder(method); S.screen = "done"; S.cart = []; render(); clearTimeout(doneT); doneT = setTimeout(reset, R.done_reset_seconds * 1000); }
document.addEventListener("click", function(e){
  if (VIEW !== "kiosk") return;
  var b = e.target.closest("[data-act]"); if (!b) return; var act = b.getAttribute("data-act"); if (!ACT[act]) return;
  var mm = app.querySelector(".build .main"); S._scroll = mm ? mm.scrollTop : null;
  e.stopPropagation();
  var r = ACT[act](b.getAttribute("data-v"), b.getAttribute("data-d"));
  resetIdle(); if (r === "stop" && (act === "payCard" || act === "payCash")) return; render();
}, true);
var press = 0;
document.addEventListener("pointerdown", function(e){ if (VIEW !== "kiosk") return; resetIdle(); if (e.target.closest('[data-act="logo"]')) press = setTimeout(function(){ S.dlg = {type: "pin", v: ""}; render(); }, 2000); });
document.addEventListener("pointerup", function(){ clearTimeout(press); });

/* ---------------- Küchenmonitor und Abholmonitor ---------------- */
var I = window.INTERN || null;
function mins(o){ return Math.floor((Date.now() - new Date(o.created_at)) / 60000); }
function thumb(l){ return l.slug ? '<img class="th" src="assets/p/' + l.slug + '_400.webp" alt="">' : ""; }
function kdsBowl(l){
  var b = l.bowl, sz = b.size, L = layers(b).filter(function(x){ return !(x.optional && !x.items.length); });
  var steps = ["<li><b>Becher " + sz + " " + SIZE[sz].cup + "</b></li>"].concat(L.map(function(x){
    var d = x.kind === "acai" ? (I ? "Basis, beide Schichten zusammen Ø " + I.acai_g[sz] + " g, eher wenig" : "Basis") : (x.items.length ? x.items.map(function(i){ return i.name + (i.amt !== "normal" ? " <b>" + i.amt.toUpperCase() + "</b>" : ""); }).join(", ") : "ohne");
    return "<li>" + esc(x.label.replace(" · ", " ")) + ": " + d + "</li>"; }));
  var hint = "";
  if (I){ var h = [I.regel]; keys(b.fruit).forEach(function(id){ if (I.frucht[id] && I.frucht[id] !== "normal") h.push(ING[id].name + " " + I.frucht[id] + " je Layer"); });
    if (b.chia["chia-pudding"]) h.push("Chia Ø " + String(I.chia_g[sz]).replace(".", ",") + " g"); h.push("Sauce Ø " + String(I.sauce_g[sz]).replace(".", ",") + " g je Sauce");
    hint = '<div class="int">Intern: ' + esc(h.join(" · ")) + "</div>"; }
  return '<div class="bw">' + thumb(l) + "<b>" + l.qty + "× " + esc(l.name) + "</b><ol>" + steps.join("") + "</ol>" + hint + "</div>";
}
function kdsTicket(o){
  var late = mins(o) >= 8 && o.status !== "ready";
  var bowls = o.lines.filter(function(l){ return l.type === "bowl"; }).map(kdsBowl).join("");
  var dr = o.lines.filter(function(l){ return l.type === "drink"; }).map(function(l){ return '<div class="dr">' + thumb(l) + l.qty + "× <b>" + esc(l.name) + "</b> · " + esc(l.detail) + "</div>"; }).join("");
  var btn = {awaiting_payment: '<button class="y" data-k="paid" data-id="' + o.id + '">Bezahlt markieren</button>', "new": '<button data-k="prep" data-id="' + o.id + '">In Arbeit</button>', prep: '<button class="g" data-k="ready" data-id="' + o.id + '">Fertig, Nummer zeigen</button>', ready: '<button class="g" data-k="done" data-id="' + o.id + '">Abgeholt</button>'}[o.status] || "";
  return '<div class="tk' + (o.status === "awaiting_payment" ? " cash" : "") + (late ? " late" : "") + '"><div class="h"><b>' + o.number + "</b><span>" + mins(o) + " min · " + eur(o.totals.gross) + '</span></div><div class="md">To Go · ' + (o.payment.method === "card" ? "Karte" : "Bar") + "</div>" + bowls + (dr ? '<div class="bw"><b>Drinks (Bar)</b>' + dr + "</div>" : "") + '<div class="btns">' + btn + "</div></div>";
}
function renderKDS(){
  var all = db().filter(function(o){ return o.status !== "done"; }), every = db(), col = function(st){ return all.filter(function(o){ return o.status === st; }); };
  var sum = every.filter(function(o){ return o.payment.status === "paid"; }).reduce(function(a, o){ return a + o.totals.gross; }, 0), so = soldOut();
  app.innerHTML = '<div class="kds-top"><img src="assets/logo.png" alt=""><h1>Küchenmonitor · Bowl Bau</h1><span class="st">' + every.length + " Bestellungen · " + eur(sum) + ' bezahlt heute</span><button data-k="clear">Tag zurücksetzen</button></div><div class="kds-wrap"><div class="kds-cols">' +
    [["awaiting_payment", "Zahlung offen (Bar)"], ["new", "Neu"], ["prep", "In Arbeit"], ["ready", "Fertig"]].map(function(c){ return '<div class="kds-col"><h2>' + c[1] + " (" + col(c[0]).length + ")</h2>" + col(c[0]).map(kdsTicket).join("") + "</div>"; }).join("") +
    '</div><div class="kds-side"><h2>Portionsrichtlinie (intern)</h2><div class="rule">' + (I ? esc(I.regel) + "<br>Himbeeren " + I.frucht.himbeere + ", Blaubeeren " + I.frucht.blaubeere + ", Erdbeeren " + I.frucht.erdbeere + " je Layer. Mango, Kiwi, Trauben großzügig.<br>Açaí Ø S " + I.acai_g.S + " g, M " + I.acai_g.M + " g, L " + I.acai_g.L + " g.<br>" + esc(I.crunch) + ".<br>Nur für das Team, nicht für Gäste." : "Nur in der internen Fassung (Demo ohne Portionsrichtlinie).") +
    '</div><h2>Heute aus</h2><div class="sold">' + Object.keys(ING).filter(function(id){ return ING[id].group; }).map(function(id){ return '<button class="' + (so.indexOf(id) > -1 ? "off" : "") + '" data-k="sold" data-id="' + id + '">' + esc(ING[id].name) + "</button>"; }).join("") + "</div></div></div>";
}
function renderReady(){
  var all = db(), r = all.filter(function(o){ return o.status === "ready"; }), w = all.filter(function(o){ return o.status === "new" || o.status === "prep"; });
  app.innerHTML = '<div class="kds-top"><img src="assets/logo.png" alt=""><h1>Abholung</h1><span class="st">Build it YOUR way.</span></div><div class="ready"><div class="a"><h2>Fertig, hol dir deine Bowl!</h2>' + r.map(function(o){ return '<span class="num">' + o.number + '<span class="ph">' + o.lines.map(function(l){ return l.slug ? '<img src="assets/p/' + l.slug + '_400.webp" alt="">' : ""; }).join("") + "</span></span>"; }).join("") +
    '</div><div class="w"><h2>Wird gebaut</h2>' + w.map(function(o){ return '<span class="num">' + o.number + '<span class="ph">' + o.lines.map(function(l){ return l.slug ? '<img src="assets/p/' + l.slug + '_400.webp" alt="">' : ""; }).join("") + "</span></span>"; }).join("") + "</div></div>";
}
function kdsClick(e){
  var b = e.target.closest("[data-k]"); if (!b) return; var k = b.getAttribute("data-k"), id = b.getAttribute("data-id");
  if (k === "paid") advance(id, "new"); else if (k === "prep") advance(id, "prep"); else if (k === "ready") advance(id, "ready"); else if (k === "done") advance(id, "done");
  else if (k === "sold"){ var a = soldOut(), i = a.indexOf(id); if (i > -1) a.splice(i, 1); else a.push(id); setSold(a); }
  else if (k === "clear"){ if (confirm("Alle Bestellungen von heute löschen?")){ save([]); try { localStorage.removeItem("axy-seq"); } catch(x){} } }
  renderKDS();
}

/* ---------------- Start ---------------- */
function fit(){ if (VIEW !== "kiosk") return; var s = Math.min(innerWidth / 1080, innerHeight / 1920); stage.style.transform = "scale(" + s + ")"; stage.style.marginLeft = ((innerWidth - 1080 * s) / 2) + "px"; stage.style.marginTop = ((innerHeight - 1920 * s) / 2) + "px"; }
if (VIEW === "kds"){ document.body.className = "view-kds"; renderKDS(); document.addEventListener("click", kdsClick); setInterval(renderKDS, 15000); if (bc) bc.onmessage = renderKDS; window.addEventListener("storage", renderKDS); }
else if (VIEW === "ready"){ document.body.className = "view-ready"; renderReady(); setInterval(renderReady, 5000); if (bc) bc.onmessage = renderReady; window.addEventListener("storage", renderReady); }
else { addEventListener("resize", fit); fit(); render(); if (bc) bc.onmessage = function(m){ if (m.data === "sold") render(); }; }
window.AXY = {S: S, ACT: ACT, totals: totals, layers: layers, render: render, bowlAllergens: bowlAllergens};
})();
