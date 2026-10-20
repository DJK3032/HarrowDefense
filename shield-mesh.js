/* Harrow shield live mesh: home hero animation */
(function(){
  var NS = 'http://www.w3.org/2000/svg';
  var root = document.getElementById('shieldMesh');
  if (!root) return;

  // ---- Geometry ----
  // Shield: flat top with soft corners, straight sides, curving to a point.
  function shieldPath(inset){
    var L=60+inset, R=420-inset, T=36+inset, S=262, B=496-inset*1.6, C=240, r=16;
    return 'M'+(L+r)+','+T+' L'+(R-r)+','+T+' Q'+R+','+T+' '+R+','+(T+r)+
      ' L'+R+','+S+' C'+R+','+(S+130)+' '+(C+90)+','+(B-48)+' '+C+','+B+
      ' C'+(C-90)+','+(B-48)+' '+L+','+(S+130)+' '+L+','+S+
      ' L'+L+','+(T+r)+' Q'+L+','+T+' '+(L+r)+','+T+' Z';
  }
  // Harrow H, traced from the logo: each upright's top and bottom is cut on a
  // full-width diagonal that rises toward the centre, so the tips point inward.
  function hPath(){
    var x0=150,x1=192,x2=288,x3=330, yT=100, yB=364, cT=45, cB=33, mT=214, mB=256;
    return 'M'+x0+','+(yT+cT)+' L'+x1+','+yT+' L'+x1+','+mT+' L'+x2+','+mT+
      ' L'+x2+','+yT+' L'+x3+','+(yT+cT)+' L'+x3+','+(yB-cB)+' L'+x2+','+yB+
      ' L'+x2+','+mB+' L'+x1+','+mB+' L'+x1+','+yB+' L'+x0+','+(yB-cB)+' Z';
  }
  var outer = shieldPath(0);
  ['sm-body','sm-rim','sm-clip-path'].forEach(function(id){ document.getElementById(id).setAttribute('d', outer); });
  document.getElementById('sm-rim-inner').setAttribute('d', shieldPath(9));
  var hd = hPath();
  document.getElementById('sm-h-face').setAttribute('d', hd);
  document.getElementById('sm-h-glow').setAttribute('d', hd);

  // ---- Seeded RNG so the mesh is the same on every load ----
  var seed = 20261020;
  function rnd(){ seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }

  // ---- Inside test against the real path ----
  var probe = document.getElementById('sm-body');
  var svg = root.querySelector('svg');
  function inside(x,y){
    if (probe.isPointInFill && svg.createSVGPoint){
      var p = svg.createSVGPoint(); p.x=x; p.y=y;
      try { return probe.isPointInFill(p); } catch(e){}
    }
    if (y < 44 || x < 66 || x > 414) return false;
    if (y <= 262) return true;
    var t = (y-262)/(486-262); var hw = 174*Math.sqrt(Math.max(0,1-t*t));
    return Math.abs(x-240) < hw;
  }
  function underH(x,y){ return x>140 && x<340 && y>92 && y<372 && !(x>198 && x<282 && (y<206 || y>264)); }

  // ---- Nodes: jittered grid, kept inside the shield, a few placed on the rim ----
  var nodes = [];
  var step = 34;
  for (var gy=50; gy<490; gy+=step){
    for (var gx=70; gx<412; gx+=step){
      var x = gx + (rnd()-.5)*step*.9, y = gy + (rnd()-.5)*step*.9;
      var m = 12;
      if (!inside(x-m,y-m) || !inside(x+m,y-m) || !inside(x-m,y+m) || !inside(x+m,y+m) || underH(x,y)) continue;
      nodes.push({x:x,y:y,r:1.4+rnd()*1.6,hub:false,links:[]});
    }
  }
  // brighter hubs
  for (var k=0;k<6;k++){ var n = nodes[Math.floor(rnd()*nodes.length)]; n.hub=true; n.r=3.2; }

  // ---- Edges: each node to its 3 nearest neighbours ----
  var edges = [], seen = {};
  nodes.forEach(function(a,i){
    var d = nodes.map(function(b,j){ return {j:j, d:(a.x-b.x)*(a.x-b.x)+(a.y-b.y)*(a.y-b.y)}; })
                 .filter(function(o){ return o.j!==i; }).sort(function(p,q){ return p.d-q.d; }).slice(0,3);
    d.forEach(function(o){
      if (o.d > 70*70) return;
      var key = i<o.j ? i+'-'+o.j : o.j+'-'+i;
      if (seen[key]) return; seen[key]=1;
      var e = {a:i,b:o.j}; edges.push(e); a.links.push(e); nodes[o.j].links.push(e);
    });
  });

  // ---- Draw ----
  var gE = document.getElementById('sm-edges'), gN = document.getElementById('sm-nodes'),
      gH = document.getElementById('sm-halos'), gP = document.getElementById('sm-packets');
  edges.forEach(function(e){
    var l = document.createElementNS(NS,'line');
    l.setAttribute('x1',nodes[e.a].x); l.setAttribute('y1',nodes[e.a].y);
    l.setAttribute('x2',nodes[e.b].x); l.setAttribute('y2',nodes[e.b].y);
    l.setAttribute('class','edge'); gE.appendChild(l); e.el = l;
  });
  nodes.forEach(function(n){
    var c = document.createElementNS(NS,'circle');
    c.setAttribute('cx',n.x); c.setAttribute('cy',n.y); c.setAttribute('r',n.r); c.setAttribute('class','node');
    var pop = (0.7 + rnd()*1.2).toFixed(2);
    c.style.animationDelay = pop+'s, '+(1.8+rnd()*4).toFixed(2)+'s';
    c.style.setProperty('--bd',(2.6+rnd()*3.6).toFixed(2)+'s');
    gN.appendChild(c); n.el = c;
    if (n.hub){
      var h = document.createElementNS(NS,'circle');
      h.setAttribute('cx',n.x); h.setAttribute('cy',n.y); h.setAttribute('r',n.r+1); h.setAttribute('class','halo');
      h.style.animationDelay = (2+rnd()*3).toFixed(2)+'s'; gH.appendChild(h);
    }
  });

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  // ---- Packets: hop node to node along the mesh ----
  var packets = [], running = false, ready = false, visible = true, last = 0, spawnAt = 0, MAX = 7;
  function flash(n){
    var f = document.createElementNS(NS,'circle');
    f.setAttribute('cx',n.x); f.setAttribute('cy',n.y); f.setAttribute('r',n.r+.6); f.setAttribute('class','spark');
    gP.appendChild(f); setTimeout(function(){ if (f.parentNode) f.parentNode.removeChild(f); }, 700);
  }
  function spawn(){
    var start = nodes[Math.floor(Math.random()*nodes.length)];
    if (!start.links.length) return;
    var dot = document.createElementNS(NS,'circle'); dot.setAttribute('r',2.1); dot.setAttribute('class','packet');
    gP.appendChild(dot);
    packets.push({el:dot, at:start, hops:2+Math.floor(Math.random()*5), edge:null, t:0, dur:0, from:null, to:null});
  }
  function nextHop(p){
    var opts = p.at.links; var e = opts[Math.floor(Math.random()*opts.length)];
    p.edge = e; p.from = p.at; p.to = nodes[e.a]===p.at ? nodes[e.b] : nodes[e.a];
    var len = Math.hypot(p.to.x-p.from.x, p.to.y-p.from.y);
    p.t = 0; p.dur = 260 + len*9; e.el.classList.add('lit');
  }
  function frame(ts){
    if (!running) return;
    var dt = last ? Math.min(ts-last, 50) : 16; last = ts;
    if (ts > spawnAt && packets.length < MAX){ spawn(); spawnAt = ts + 280 + Math.random()*520; }
    for (var i=packets.length-1;i>=0;i--){
      var p = packets[i];
      if (!p.edge){ nextHop(p); }
      p.t += dt;
      var k = Math.min(1, p.t/p.dur), e = k<.5 ? 2*k*k : 1-Math.pow(-2*k+2,2)/2;
      p.el.setAttribute('cx', p.from.x + (p.to.x-p.from.x)*e);
      p.el.setAttribute('cy', p.from.y + (p.to.y-p.from.y)*e);
      if (k >= 1){
        p.edge.el.classList.remove('lit'); flash(p.to); p.at = p.to; p.edge = null; p.hops--;
        if (p.hops <= 0){ gP.removeChild(p.el); packets.splice(i,1); }
      }
    }
    requestAnimationFrame(frame);
  }
  function start(){ if (running || !ready || !visible || document.hidden) return; running = true; last = 0; requestAnimationFrame(frame); }
  function stop(){ running = false; }
  if ('IntersectionObserver' in window){
    new IntersectionObserver(function(en){ visible = en[0].isIntersecting; visible ? start() : stop(); }).observe(root);
  }
  document.addEventListener('visibilitychange', function(){ document.hidden ? stop() : start(); });
  setTimeout(function(){ ready = true; start(); }, 1900);
})();
