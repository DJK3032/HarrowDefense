/* Harrow Defense · site.js · 2026-08-28 investor build */
(function () {
  document.documentElement.classList.add('js');

  // ---- Constellation mesh background (skipped when reduced motion is requested) ----
  var canvas = document.getElementById('mesh-bg');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (canvas && !reduce) {
    var ctx = canvas.getContext('2d');
    var w, h, nodes = [];
    var NODE_COUNT = window.innerWidth < 640 ? 24 : 45;
    var CONNECT_DIST = 180;
    var RED = [196, 30, 58];
    var intensity = parseFloat(canvas.getAttribute('data-intensity') || '1');

    function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
    function initNodes() {
      nodes = [];
      for (var i = 0; i < NODE_COUNT; i++) {
        nodes.push({ x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25, r: Math.random() * 1.5 + 0.5 });
      }
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (var k = 0; k < nodes.length; k++) {
        var n = nodes[k]; n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }
      for (var i = 0; i < nodes.length; i++) {
        for (var j = i + 1; j < nodes.length; j++) {
          var dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT_DIST) {
            var alpha = (1 - dist / CONNECT_DIST) * 0.07 * intensity;
            ctx.strokeStyle = 'rgba(' + RED[0] + ',' + RED[1] + ',' + RED[2] + ',' + alpha + ')';
            ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke();
          }
        }
      }
      for (var m = 0; m < nodes.length; m++) {
        ctx.fillStyle = 'rgba(' + RED[0] + ',' + RED[1] + ',' + RED[2] + ',' + (0.2 * intensity) + ')';
        ctx.beginPath(); ctx.arc(nodes[m].x, nodes[m].y, nodes[m].r, 0, Math.PI * 2); ctx.fill();
      }
      requestAnimationFrame(draw);
    }
    window.addEventListener('resize', function () { resize(); initNodes(); });
    resize(); initNodes(); draw();
  }

  // ---- Scroll reveal ----
  var els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { if (entry.isIntersecting) entry.target.classList.add('visible'); });
    }, { threshold: 0.08 });
    els.forEach(function (el) { observer.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add('visible'); });
  }

  // ---- Drop-in image slots: show the fallback block when a photo has not been added yet ----
  document.querySelectorAll('img[data-fallback]').forEach(function (img) {
    var fb = document.getElementById(img.getAttribute('data-fallback'));
    function showFallback() { img.style.display = 'none'; if (fb) fb.style.display = 'flex'; }
    if (img.complete && img.naturalWidth === 0) showFallback();
    img.addEventListener('error', showFallback);
  });
})();
