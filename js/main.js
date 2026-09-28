(function(){
  // Chaque paire = une compétence, et le projet qui la prouve
  const paires = [
    {cle:'c',    nom:'C',          type:'langage', preuve:'Gestion de scolarité et Crazy Circus', cible:'p-scolarite'},
    {cle:'java', nom:'Java',       type:'langage', preuve:'Graphe : 51 tests JUnit passés',       cible:'p-graphe'},
    {cle:'sql',  nom:'SQL',        type:'langage', preuve:'KDou : indicateurs décisionnels',     cible:'p-kdou'},
    {cle:'js',   nom:'JavaScript', type:'langage', preuve:'Memory, mon jeu de SAÉ : 15 modules',                  cible:'p-memory'},
    {cle:'css',  nom:'HTML · CSS', type:'web',     preuve:'Ce site, écrit à la main',             cible:'p-site'},
    {cle:'git',  nom:'Git',        type:'outil',   preuve:'Tous les projets versionnés sur GitHub', cible:'projets'}
  ];
  const plateau = document.getElementById('plateau');
  const compte = document.getElementById('compte');
  const preuves = document.getElementById('preuves');
  const consigne = document.getElementById('consigne');
  const fin = document.getElementById('fin');
  const finTexte = document.getElementById('fin-texte');
  let ouvertes = [], trouvees = 0, coups = 0, bloque = false;

  function melanger(t){ for(let i=t.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [t[i],t[j]]=[t[j],t[i]]; } return t; }

  function majCompte(){
    compte.textContent = trouvees + ' / 6 paires · ' + coups + (coups>1?' coups':' coup');
  }

  function distribuer(){
    plateau.innerHTML=''; preuves.innerHTML=''; ouvertes=[]; trouvees=0; coups=0; bloque=false;
    fin.hidden = true; consigne.hidden = false; majCompte();
    melanger(paires.flatMap(p=>[p,p])).forEach((p,i)=>{
      const b = document.createElement('button');
      b.type='button'; b.className='carte'; b.dataset.cle=p.cle;
      b.setAttribute('aria-label','Carte '+(i+1)+', face cachée');
      let fen=''; for(let k=0;k<9;k++) fen += '<i'+(Math.random()<.34?' class="on"':'')+'></i>';
      b.innerHTML = '<span class="int"><span class="face dos">'+fen+'</span><span class="face recto"><b'+(p.nom.replace(/[^A-Za-z]/g,'').length>6?' class="long"':'')+'>'+p.nom+'</b><small>'+p.type+'</small></span></span>';
      b.addEventListener('click', ()=>retourner(b,p,i));
      plateau.appendChild(b);
    });
  }

  function retourner(b,p,i){
    if(bloque || b.classList.contains('ouverte') || b.classList.contains('trouvee')) return;
    b.classList.add('ouverte'); b.setAttribute('aria-label','Carte '+(i+1)+', '+p.nom);
    ouvertes.push(b);
    if(ouvertes.length<2) return;
    coups++;
    const [a,c] = ouvertes;
    if(a.dataset.cle === c.dataset.cle){
      a.classList.add('trouvee'); c.classList.add('trouvee');
      a.classList.remove('ouverte'); c.classList.remove('ouverte');
      ouvertes=[]; trouvees++; montrerPreuve(p);
    } else {
      bloque = true;
      setTimeout(()=>{
        ouvertes.forEach((x)=>{ x.classList.remove('ouverte'); x.setAttribute('aria-label', x.getAttribute('aria-label').replace(/, .*$/, ', face cachée')); });
        ouvertes=[]; bloque=false;
      }, 850);
    }
    majCompte();
    if(trouvees===6){
      consigne.hidden = true;
      finTexte.textContent = 'Les six paires en ' + coups + ' coups.';
      fin.hidden = false;
    }
  }

  function montrerPreuve(p){
    consigne.textContent = 'Bien vu. Cliquez sur une preuve pour aller au projet.';
    const li = document.createElement('li');
    li.innerHTML = '<b>'+p.nom+'</b><a href="#'+p.cible+'">'+p.preuve+'</a>';
    li.querySelector('a').addEventListener('click', ()=>{
      const art = document.getElementById(p.cible);
      if(art && art.classList.contains('projet')){
        art.classList.add('eclaire'); setTimeout(()=>art.classList.remove('eclaire'), 2200);
      }
    });
    preuves.prepend(li);
  }

  document.getElementById('rejouer').addEventListener('click', distribuer);
  distribuer();

  // ----- Crazy Circus : les piles bougent coup par coup -----
  (function(){
    const scene = document.getElementById('scene');
    const etape = document.getElementById('etape');
    const btn = document.getElementById('cirque-btn');
    const animaux = {
      lion:{nom:'Lion', couleur:'#CBC3E3'},
      ours:{nom:'Ours', couleur:'#ff9d8a'},
      elephant:{nom:'Éléphant', couleur:'#9fd8c9'}
    };
    const X = [28, 72], H = 26, G = 4, BASE = 10;
    const coups = [
      {type:'G', texte:'Le sommet de gauche passe à droite.'},
      {type:'G', texte:'Le nouveau sommet de gauche passe à droite.'},
      {type:'S', texte:'Les deux sommets échangent leur place.'},
      {type:'D', texte:'Le sommet de droite revient à gauche. Objectif atteint.'}
    ];
    const el = {};
    Object.keys(animaux).forEach(k=>{
      const d = document.createElement('span');
      d.className = 'animal'; d.textContent = animaux[k].nom; d.style.background = animaux[k].couleur;
      scene.appendChild(d); el[k] = d;
    });
    let piles, i, minuterie = null, enPause = false;
    const reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function placer(k, p, h){ el[k].style.left = X[p]+'%'; el[k].style.bottom = (BASE + h*(H+G))+'px'; }
    function tout(){ piles.forEach((pile,p)=>pile.forEach((k,h)=>placer(k,p,h))); }
    function texte(titre, t){ etape.innerHTML = '<b>'+titre+'</b>'+t; }

    function depart(){
      piles = [['ours','lion','elephant'], []]; i = 0;
      Object.values(el).forEach(d=>d.classList.remove('actif'));
      tout(); texte('Départ', 'Tous les animaux sont sur le podium de gauche.');
    }

    // un déplacement : on soulève, on traverse, on repose
    function deplacer(k, de, vers, fin, haut){
      el[k].classList.add('actif');
      el[k].style.bottom = (BASE + 3*(H+G) + 12 + (haut||0))+'px';
      setTimeout(()=>{ el[k].style.left = X[vers]+'%'; }, 380);
      setTimeout(()=>{ piles[vers].push(k); placer(k, vers, piles[vers].length-1); }, 900);
      setTimeout(()=>{ el[k].classList.remove('actif'); fin && fin(); }, 1300);
    }

    function jouer(){
      if(i >= coups.length){ minuterie = setTimeout(()=>{ depart(); suite(); }, 2200); return; }
      const c = coups[i]; texte('Coup '+(i+1)+' / '+coups.length, c.texte); i++;
      if(c.type === 'S'){
        const a = piles[0].pop(), b = piles[1].pop();
        deplacer(a, 0, 1, null); deplacer(b, 1, 0, suite, H+G);
      } else {
        const de = c.type==='G' ? 0 : 1, vers = 1-de;
        deplacer(piles[de].pop(), de, vers, suite);
      }
    }
    function suite(){ if(!enPause) minuterie = setTimeout(jouer, 900); }

    btn.addEventListener('click', ()=>{
      enPause = !enPause; btn.textContent = enPause ? 'Lecture' : 'Pause';
      if(enPause) clearTimeout(minuterie); else suite();
    });

    depart();
    if(reduit){ enPause = true; btn.textContent = 'Lecture'; } else suite();
  })();

  // Boutons Copier : presse-papier, sinon sélection du texte
  document.querySelectorAll('[data-copie]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const el = document.getElementById(btn.dataset.copie);
      const texte = el.textContent.trim();
      const ok = ()=>{ btn.textContent='Copié'; btn.classList.add('ok'); setTimeout(()=>{ btn.textContent='Copier'; btn.classList.remove('ok'); }, 1600); };
      const repli = ()=>{ const r=document.createRange(); r.selectNodeContents(el); const s=getSelection(); s.removeAllRanges(); s.addRange(r); btn.textContent='Sélectionné'; setTimeout(()=>{ btn.textContent='Copier'; },1600); };
      try{
        if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(texte).then(ok, repli); }
        else repli();
      }catch(e){ repli(); }
    });
  });
})();
