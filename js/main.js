// init
(function(){
  // liste paires
  var paires = [
    {cle:'c', nom:'C', type:'langage', preuve:'Gestion de scolarité et Crazy Circus', cible:'p-scolarite'},
    {cle:'java', nom:'Java', type:'langage', preuve:'Graphe : 51 tests JUnit passés', cible:'p-graphe'},
    {cle:'sql', nom:'SQL', type:'langage', preuve:'KDou : indicateurs décisionnels', cible:'p-kdou'},
    {cle:'js', nom:'JavaScript', type:'langage', preuve:'Memory, mon jeu de SAÉ : 15 modules', cible:'p-memory'},
    {cle:'css', nom:'HTML · CSS', type:'web', preuve:'Ce site, écrit à la main', cible:'p-site'},
    {cle:'git', nom:'Git', type:'outil', preuve:'Tous les projets versionnés sur GitHub', cible:'projets'}
  ];

  var plateau = document.getElementById('plateau');
  var compte = document.getElementById('compte');
  var preuves = document.getElementById('preuves');
  var consigne = document.getElementById('consigne');
  var fin = document.getElementById('fin');
  var finTexte = document.getElementById('fin-texte');

  var ouvertes = [];
  var trouvees = 0;
  var coups = 0;
  var bloque = false;

  // melange
  function melanger(tableau){
    var temp;
    var indexHasard;
    for(var i = tableau.length - 1; i > 0; i--){
      indexHasard = Math.floor(Math.random() * (i + 1));
      temp = tableau[i];
      tableau[i] = tableau[indexHasard];
      tableau[indexHasard] = temp;
    }
    return tableau;
  }

  function majCompte(){
    var texteCoups = ' coup';
    if(coups > 1){
      texteCoups = ' coups';
    }
    compte.textContent = trouvees + ' / 6 paires · ' + coups + texteCoups;
  }

  // plateau
  function distribuer(){
    plateau.innerHTML = '';
    preuves.innerHTML = '';
    ouvertes = [];
    trouvees = 0;
    coups = 0;
    bloque = false;
    fin.hidden = true;
    consigne.hidden = false;
    majCompte();

    var cartesDoubles = [];
    for(var k = 0; k < paires.length; k++){
      cartesDoubles.push(paires[k]);
      cartesDoubles.push(paires[k]);
    }
    cartesDoubles = melanger(cartesDoubles);

    for(var idx = 0; idx < cartesDoubles.length; idx++){
      (function(index){
        var p = cartesDoubles[index];
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'carte';
        b.dataset.cle = p.cle;
        b.setAttribute('aria-label', 'Carte ' + (index + 1) + ', face cachée');

        var fen = '';
        for(var n = 0; n < 9; n++){
          var active = '';
          if(Math.random() < 0.34){
            active = ' class="on"';
          }
          fen += '<i' + active + '></i>';
        }

        var classeLong = '';
        var nomSansSpeciaux = p.nom.replace(/[^A-Za-z]/g, '');
        if(nomSansSpeciaux.length > 6){
          classeLong = ' class="long"';
        }

        var htmlCarte = '<span class="int">' +
            '<span class="face dos">' + fen + '</span>' +
            '<span class="face recto"><b' + classeLong + '>' + p.nom + '</b><small>' + p.type + '</small></span>' +
            '</span>';

        b.innerHTML = htmlCarte;
        b.addEventListener('click', function(){
          retourner(b, p, index);
        });
        plateau.appendChild(b);
      })(idx);
    }
  }

  function retourner(b, p, i){
    if(bloque == true){
      return;
    }
    if(b.classList.contains('ouverte') || b.classList.contains('trouvee')){
      return;
    }

    b.classList.add('ouverte');
    b.setAttribute('aria-label', 'Carte ' + (i + 1) + ', ' + p.nom);
    ouvertes.push(b);

    if(ouvertes.length < 2){
      return;
    }

    coups = coups + 1;
    var c1 = ouvertes[0];
    var c2 = ouvertes[1];

    if(c1.dataset.cle === c2.dataset.cle){
      c1.classList.add('trouvee');
      c2.classList.add('trouvee');
      c1.classList.remove('ouverte');
      c2.classList.remove('ouverte');
      ouvertes = [];
      trouvees = trouvees + 1;
      montrerPreuve(p);
    } else {
      bloque = true;
      setTimeout(function(){
        for(var j = 0; j < ouvertes.length; j++){
          ouvertes[j].classList.remove('ouverte');
          var ancienAria = ouvertes[j].getAttribute('aria-label');
          ouvertes[j].setAttribute('aria-label', ancienAria.replace(/, .*$/, ', face cachée'));
        }
        ouvertes = [];
        bloque = false;
      }, 850);
    }

    majCompte();

    if(trouvees === 6){
      consigne.hidden = true;
      finTexte.textContent = 'Les six paires en ' + coups + ' coups.';
      fin.hidden = false;
    }
  }

  function montrerPreuve(p){
    consigne.textContent = 'Bien vu. Cliquez sur une preuve pour aller au projet.';
    var li = document.createElement('li');
    li.innerHTML = '<b>' + p.nom + '</b><a href="#' + p.cible + '">' + p.preuve + '</a>';

    var lien = li.querySelector('a');
    lien.addEventListener('click', function(){
      var art = document.getElementById(p.cible);
      if(art && art.classList.contains('projet')){
        art.classList.add('eclaire');
        setTimeout(function(){
          art.classList.remove('eclaire');
        }, 2200);
      }
    });
    preuves.prepend(li);
  }

  var btnRejouer = document.getElementById('rejouer');
  if(btnRejouer){
    btnRejouer.addEventListener('click', distribuer);
  }
  distribuer();

  // cirque
  (function(){
    var scene = document.getElementById('scene');
    var etape = document.getElementById('etape');
    var btn = document.getElementById('cirque-btn');
    if(!scene || !etape || !btn) return;

    var animaux = {
      lion: {nom:'Lion', couleur:'#CBC3E3'},
      ours: {nom:'Ours', couleur:'#ff9d8a'},
      elephant: {nom:'Éléphant', couleur:'#9fd8c9'}
    };

    var X = [28, 72];
    var H = 26;
    var G = 4;
    var BASE = 10;

    var coups = [
      {type:'G', texte:'Le sommet de gauche passe à droite.'},
      {type:'G', texte:'Le nouveau sommet de gauche passe à droite.'},
      {type:'S', texte:'Les deux sommets échangent leur place.'},
      {type:'D', texte:'Le sommet de droite revient à gauche. Objectif atteint.'}
    ];

    var el = {};
    var clefs = Object.keys(animaux);
    for(var k = 0; k < clefs.length; k++){
      var cle = clefs[k];
      var d = document.createElement('span');
      d.className = 'animal';
      d.textContent = animaux[cle].nom;
      d.style.background = animaux[cle].couleur;
      scene.appendChild(d);
      el[cle] = d;
    }

    var piles;
    var idxCoup;
    var minuterie = null;
    var enPause = false;
    var reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function placer(k, p, h){
      el[k].style.left = X[p] + '%';
      el[k].style.bottom = (BASE + h * (H + G)) + 'px';
    }

    function tout(){
      for(var p = 0; p < piles.length; p++){
        for(var h = 0; h < piles[p].length; h++){
          placer(piles[p][h], p, h);
        }
      }
    }

    function texte(titre, t){
      etape.innerHTML = '<b>' + titre + '</b>' + t;
    }

    function depart(){
      piles = [['ours', 'lion', 'elephant'], []];
      idxCoup = 0;
      var elKeys = Object.keys(el);
      for(var m = 0; m < elKeys.length; m++){
        el[elKeys[m]].classList.remove('actif');
      }
      tout();
      texte('Départ', 'Tous les animaux sont sur le podium de gauche.');
    }

    function deplacer(k, de, vers, finFn, haut){
      el[k].classList.add('actif');
      var offsetHaut = 0;
      if(haut){
        offsetHaut = haut;
      }
      el[k].style.bottom = (BASE + 3 * (H + G) + 12 + offsetHaut) + 'px';

      setTimeout(function(){
        el[k].style.left = X[vers] + '%';
      }, 380);

      setTimeout(function(){
        piles[vers].push(k);
        placer(k, vers, piles[vers].length - 1);
      }, 900);

      setTimeout(function(){
        el[k].classList.remove('actif');
        if(finFn){
          finFn();
        }
      }, 1300);
    }

    function jouer(){
      if(idxCoup >= coups.length){
        minuterie = setTimeout(function(){
          depart();
          suite();
        }, 2200);
        return;
      }

      var c = coups[idxCoup];
      texte('Coup ' + (idxCoup + 1) + ' / ' + coups.length, c.texte);
      idxCoup++;

      if(c.type === 'S'){
        var a = piles[0].pop();
        var b = piles[1].pop();
        deplacer(a, 0, 1, null);
        deplacer(b, 1, 0, suite, H + G);
      } else {
        var de = 0;
        if(c.type !== 'G'){
          de = 1;
        }
        var vers = 1 - de;
        deplacer(piles[de].pop(), de, vers, suite);
      }
    }

    function suite(){
      if(!enPause){
        minuterie = setTimeout(jouer, 900);
      }
    }

    btn.addEventListener('click', function(){
      enPause = !enPause;
      if(enPause){
        btn.textContent = 'Lecture';
        clearTimeout(minuterie);
      } else {
        btn.textContent = 'Pause';
        suite();
      }
    });

    depart();
    if(reduit){
      enPause = true;
      btn.textContent = 'Lecture';
    } else {
      suite();
    }
  })();

  // copier
  var btnsCopie = document.querySelectorAll('[data-copie]');
  for(var cIdx = 0; cIdx < btnsCopie.length; cIdx++){
    (function(btnItem){
      btnItem.addEventListener('click', function(){
        var targetId = btnItem.getAttribute('data-copie');
        var elCible = document.getElementById(targetId);
        if(!elCible) return;
        var texte = elCible.textContent.trim();

        function ok(){
          btnItem.textContent = 'Copié';
          btnItem.classList.add('ok');
          setTimeout(function(){
            btnItem.textContent = 'Copier';
            btnItem.classList.remove('ok');
          }, 1600);
        }

        function fallback(){
          var r = document.createRange();
          r.selectNodeContents(elCible);
          var s = window.getSelection();
          s.removeAllRanges();
          s.addRange(r);
          btnItem.textContent = 'Sélectionné';
          setTimeout(function(){
            btnItem.textContent = 'Copier';
          }, 1600);
        }

        if(navigator.clipboard && navigator.clipboard.writeText){
          navigator.clipboard.writeText(texte).then(ok, fallback);
        } else {
          fallback();
        }
      });
    })(btnsCopie[cIdx]);
  }
})();

// menu
(function(){
  var top = document.getElementById('main-header');
  var btn = document.getElementById('burger-btn');
  if(!top || !btn) return;

  function regler(ouvert){
    top.classList.toggle('ouvert', ouvert);
    btn.setAttribute('aria-expanded', ouvert);
    btn.setAttribute('aria-label', ouvert ? 'Fermer le menu' : 'Ouvrir le menu');
  }

  btn.addEventListener('click', function(){
    var isOpen = top.classList.contains('ouvert');
    regler(!isOpen);
  });

  var liens = top.querySelectorAll('nav a');
  for(var l = 0; l < liens.length; l++){
    liens[l].addEventListener('click', function(){
      regler(false);
    });
  }

  document.addEventListener('click', function(e){
    if(!top.contains(e.target)){
      regler(false);
    }
  });

  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape'){
      regler(false);
    }
  });
})();