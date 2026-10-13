/* Açaí x You Website. Technik 1:1 wie Bam Bird: GSAP ScrollSmoother (weiches Scrollen),
   ScrollTrigger mit pin und scrub, Videos werden beim Scrollen vor und zurück gespult,
   Text wird Wort für Wort eingeblendet, Laufschrift und Parallax laufen mit dem Scrollen. */
(function(){
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
  var mobile = window.matchMedia("(max-width:820px)").matches;
  var reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
  document.body.classList.add("loading");

  /* ---------- Videos komplett als Blob laden (sonst ruckelt das Spulen), mit Fortschritt ---------- */
  var vids = [].slice.call(document.querySelectorAll("video[data-src]"));
  var loaded = vids.map(function(){return 0;}), totals = vids.map(function(){return 1;});
  var bar = document.querySelector(".ld-bar i"), num = document.querySelector(".ld-num span");
  function progress(){
    var a = 0, b = 0;
    for (var i = 0; i < vids.length; i++){ a += loaded[i]; b += totals[i]; }
    var p = Math.min(100, Math.round(a / b * 100));
    bar.style.width = p + "%"; num.textContent = p;
  }
  function loadVideo(v, i){
    var url = v.getAttribute("data-src") + (mobile ? "_m.mp4" : ".mp4");
    return fetch(url).then(function(r){
      if (!r.ok || !r.body) throw new Error("http");
      totals[i] = +r.headers.get("content-length") || 3e6;
      var reader = r.body.getReader(), chunks = [];
      function pump(){
        return reader.read().then(function(res){
          if (res.done) return new Blob(chunks, {type:"video/mp4"});
          chunks.push(res.value); loaded[i] += res.value.length; progress();
          return pump();
        });
      }
      return pump();
    }).then(function(blob){
      v.src = URL.createObjectURL(blob);
      loaded[i] = totals[i]; progress();
      return new Promise(function(res){
        function ok(){ try { v.currentTime = 0.001; } catch(e){} res(); }   // erstes Bild sicher zeigen
        if (v.readyState >= 1) return ok();
        v.addEventListener("loadedmetadata", ok, {once:true});
        setTimeout(res, 4000);
      });
    }).catch(function(){
      v.src = url; loaded[i] = totals[i]; progress();
    });
  }
  var timeout = new Promise(function(res){ setTimeout(res, 20000); });
  /* Bilder der gepinnten Sektionen nicht lazy: vorher dekodieren, damit die Höhen stimmen */
  var pinImgs = [].slice.call(document.querySelectorAll(".sizes img, .sig img, .dk img")).map(function(im){
    return (im.decode ? im.decode() : Promise.resolve()).catch(function(){});
  });
  var fonts = (document.fonts && document.fonts.ready) ? document.fonts.ready.catch(function(){}) : Promise.resolve();
  Promise.race([Promise.all(vids.map(loadVideo).concat([fonts], pinImgs)), timeout]).then(start);

  /* Ziel Zeit für ein Video setzen, weich nachgezogen */
  function scrubber(v){
    var target = 0, cur = 0;
    gsap.ticker.add(function(){
      if (!v.duration) return;
      cur += (target - cur) * 0.35;
      if (Math.abs(v.currentTime - cur) > 0.012) { try { v.currentTime = cur; } catch(e){} }
    });
    return function(p){ if (v.duration) target = Math.max(0, Math.min(v.duration - 0.05, p * v.duration)); };
  }

  function start(){
    document.getElementById("loader").classList.add("done");
    document.body.classList.remove("loading");

    if (!reduce) ScrollSmoother.create({ wrapper:"#smooth-wrapper", content:"#smooth-content", smooth:1.2, smoothTouch:0.1, effects:true, normalizeScroll:false });

    /* 1 Hero: M Bowl dreht sich 360 Grad, Claim kommt rein */
    gsap.from(".hero-claim h1 span", {yPercent:110, opacity:0, rotate:6, stagger:.12, duration:1, ease:"back.out(1.6)", delay:.35});
    gsap.from(".hero-claim .kicker", {opacity:0, y:10, duration:.8, delay:.2});
    var heroSet = scrubber(document.getElementById("v-hero"));
    ScrollTrigger.create({ trigger:".hero-pin", start:"top top", end:"+=1600", pin:true, scrub:true,
      onUpdate:function(s){ heroSet(s.progress); } });
    gsap.to(".hero-claim", { yPercent:-40, opacity:0, ease:"none",
      scrollTrigger:{ trigger:".hero", start:"top top", end:"+=1400", scrub:true } });

    /* 2 Wort für Wort einblenden */
    document.querySelectorAll(".reveal").forEach(function(el){
      el.innerHTML = el.textContent.trim().split(/\s+/).map(function(w){ return '<span class="w">' + w + '</span>'; }).join(" ");
      gsap.to(el.querySelectorAll(".w"), { opacity:1, stagger:.1, ease:"none",
        scrollTrigger:{ trigger:el, start:"top 75%", end:"bottom 45%", scrub:true } });
    });
    gsap.from(".statement .big", { xPercent:-12, opacity:0, ease:"none",
      scrollTrigger:{ trigger:".statement", start:"top 90%", end:"top 40%", scrub:true } });

    /* 3 Laufschrift läuft mit dem Scrollen, Zeilen gegenläufig */
    gsap.utils.toArray(".mq").forEach(function(m, i){
      var dir = i % 2 ? 1 : -1;
      gsap.fromTo(m, {xPercent: dir < 0 ? 0 : -30}, {xPercent: dir < 0 ? -30 : 0, ease:"none",
        scrollTrigger:{ trigger:m.parentNode, start:"top bottom", end:"bottom top", scrub:true } });
    });

    /* 4 HERZSTÜCK: Explosionsansicht, Labels 1 bis 6 erscheinen von unten nach oben,
       dann fügt sich die Bowl zusammen und jedes Label geht, sobald seine Schicht im Becher ist */
    var bdV = document.getElementById("v-build");
    var bdSet = scrubber(bdV);
    var labels = gsap.utils.toArray(".labels li");
    gsap.set(labels, {yPercent: mobile ? 0 : -50, y:0});   // Mitte des Labels sitzt auf der Schicht (--y)
    var IN = .36, VS = .40, VE = .94;              // Labels bis IN, Video spult von VS bis VE
    var bdTl = gsap.timeline({ scrollTrigger:{ trigger:".bd-pin", start:"top top", end:"+=3400", pin:true, scrub:true,
      onUpdate:function(s){ bdSet(Math.max(0, Math.min(1, (s.progress - VS) / (VE - VS)))); } } });
    bdTl.to({}, {duration:1}, 0);                  // Zeitachse 0 bis 1 = Scrollfortschritt
    labels.forEach(function(l, i){
      var fromX = l.classList.contains("r") ? 30 : -30;
      bdTl.fromTo(l, {opacity:0, x: mobile ? 0 : fromX, y: mobile ? 12 : 0}, {opacity:1, x:0, y:0, duration:.035, ease:"power2.out"}, .05 + i * .05);
      if (!mobile) {
        var out = parseFloat(l.getAttribute("data-out"));      // Anteil am Video, wann die Schicht im Becher ist
        bdTl.to(l, {opacity:0, x:-fromX * .5, duration:.03}, VS + out * (VE - VS) - .03);
      } else {
        bdTl.to(l, {opacity:.35, duration:.03}, VS + parseFloat(l.getAttribute("data-out")) * (VE - VS) - .03);
      }
    });
    bdTl.fromTo(".bd-done", {opacity:0, scale:.6}, {opacity:1, scale:1, duration:.04, ease:"back.out(2)"}, VE - .02);
    gsap.from(".bd-head > *", { y:40, opacity:0, stagger:.1,
      scrollTrigger:{ trigger:".build", start:"top 70%", end:"top 20%", scrub:true } });

    /* 5 Größen fahren horizontal durch (gleiche Funktion für die Drink Reihen) */
    function hrow(section, pin, track){
      var tr = document.querySelector(track);
      function dist(){ return Math.max(0, tr.scrollWidth - window.innerWidth + 40); }
      gsap.to(tr, { x:function(){ return -dist(); }, ease:"none",
        scrollTrigger:{ trigger:pin, start:"top top", end:function(){ return "+=" + (dist() + 400); }, pin:true, scrub:true, invalidateOnRefresh:true } });
      gsap.from(section + " .card, " + section + " .dcard", { y:80, rotate:4, opacity:0, stagger:.08,
        scrollTrigger:{ trigger:section, start:"top 85%", end:"top 35%", scrub:true } });
      if (document.querySelector(section + " .dk-head")) gsap.from(section + " .dk-head > *", { y:40, opacity:0, stagger:.1,
        scrollTrigger:{ trigger:section, start:"top 85%", end:"top 40%", scrub:true } });
    }
    hrow(".sizes", ".sz-pin", ".sz-track");

    /* 5b Signatures: Karten kommen, das Foto wächst groß ein und driftet danach leicht nach oben */
    gsap.from(".sig-card", { y:80, opacity:0, stagger:.1,
      scrollTrigger:{ trigger:".sig-grid", start:"top 90%", end:"top 50%", scrub:true } });
    gsap.utils.toArray(".sig-card").forEach(function(card){
      var ph = card.querySelector(".sig-ph");
      gsap.timeline({ scrollTrigger:{ trigger:card, start:"top 95%", end:"bottom 15%", scrub:true } })
        .fromTo(ph, {y:90, scale:.55, rotate:-10, opacity:0}, {y:0, scale:1, rotate:0, opacity:1, duration:.4, ease:"power2.out"})
        .to(ph, {y:-26, duration:.6, ease:"none"});
    });

    /* 6 Drinks: Zutaten fliegen hoch */
    var drSet = scrubber(document.getElementById("v-drinks"));
    var drTl = gsap.timeline({ scrollTrigger:{ trigger:".dr-pin", start:"top top", end:"+=2200", pin:true, scrub:true,
      onUpdate:function(s){ drSet(Math.min(1, s.progress / .8)); } } });
    drTl.from(".dr-text > *:not(.tag)", {y:40, opacity:0, stagger:.05, duration:.2})
        .to({}, {duration:.5})
        .from(".tag", {scale:0, rotate:-30, duration:.15, ease:"back.out(2)"})
        .to({}, {duration:.15});

    /* 7 Drink Karte: Limeades, Matcha, Kaffee laufen je als horizontale Reihe */
    hrow(".dk-lim", ".dk-lim .dk-pin", ".dk-lim .dk-track");
    hrow(".dk-mat", ".dk-mat .dk-pin", ".dk-mat .dk-track");
    hrow(".dk-kaf", ".dk-kaf .dk-pin", ".dk-kaf .dk-track");
    gsap.from(".end-row img", { y:120, opacity:0, stagger:.12,
      scrollTrigger:{ trigger:".end-row", start:"top 100%", end:"top 60%", scrub:true } });

    /* 8 Parallax in den Laden Bildern */
    gsap.utils.toArray(".pimg img").forEach(function(img){
      gsap.fromTo(img, {yPercent:-8}, {yPercent:8, ease:"none",
        scrollTrigger:{ trigger:img.parentNode, start:"top bottom", end:"bottom top", scrub:true } });
    });
    gsap.utils.toArray(".sto-grid figure").forEach(function(f){
      gsap.from(f, { y:120, opacity:0, ease:"power2.out",
        scrollTrigger:{ trigger:f, start:"top 95%", end:"top 55%", scrub:true } });
    });

    /* 10 Franchise: Punkte kommen nacheinander */
    gsap.from(".fr-list li", { x:-30, opacity:0, stagger:.05,
      scrollTrigger:{ trigger:".fr-cols", start:"top 85%", end:"bottom 70%", scrub:true } });

    /* Parallax: .par Elemente mit data-speed laufen über ScrollSmoother effects */

    /* 11 Schluss: Logo springt */
    gsap.from(".end-logo", { scale:.6, rotate:-10, opacity:0, ease:"back.out(2)",
      scrollTrigger:{ trigger:".end", start:"top 75%", end:"top 35%", scrub:true } });

    /* Kopfleiste: Links weich scrollen */
    document.querySelectorAll('.bar a[href^="#"]').forEach(function(a){
      a.addEventListener("click", function(e){
        var t = document.querySelector(a.getAttribute("href")); if (!t) return;
        e.preventDefault();
        var sm = ScrollSmoother.get();
        if (sm) sm.scrollTo(t, true, "top top"); else t.scrollIntoView({behavior:"smooth"});
      });
    });

    ScrollTrigger.refresh();
    window.addEventListener("load", function(){ ScrollTrigger.refresh(); });
    [].slice.call(document.querySelectorAll("img")).forEach(function(im){ if (!im.complete) im.addEventListener("load", function(){ ScrollTrigger.refresh(); }, {once:true}); });
  }
})();
