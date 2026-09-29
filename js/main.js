// Initialisation du jeu de Memory
const paires = [
  { cle: 'c', nom: 'C', type: 'langage', preuve: 'Gestion de scolarité et Crazy Circus', cible: 'p-scolarite' },
  { cle: 'java', nom: 'Java', type: 'langage', preuve: 'Graphe : 51 tests JUnit passés', cible: 'p-graphe' },
  { cle: 'sql', nom: 'SQL', type: 'langage', preuve: 'KDou : indicateurs décisionnels', cible: 'p-kdou' },
  { cle: 'js', nom: 'JavaScript', type: 'langage', preuve: 'Memory, mon jeu de SAÉ : 15 modules', cible: 'p-memory' },
  { cle: 'css', nom: 'HTML · CSS', type: 'web', preuve: 'Ce site, écrit à la main', cible: 'p-site' },
  { cle: 'git', nom: 'Git', type: 'outil', preuve: 'Tous les projets versionnés sur GitHub', cible: 'projets' }
];

const plateau = document.getElementById('plateau');
const compte = document.getElementById('compte');
const preuves = document.getElementById('preuves');
const consigne = document.getElementById('consigne');
const fin = document.getElementById('fin');
const finTexte = document.getElementById('fin-texte');

let ouvertes = [];
let trouvees = 0;
let coups = 0;
let bloque = false;

function melanger(tableau) {
  for (let i = tableau.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tableau[i], tableau[j]] = [tableau[j], tableau[i]];
  }
  return tableau;
}

function majCompte() {
  const texteCoups = coups > 1 ? ' coups' : ' coup';
  compte.textContent = `${trouvees} / 6 paires · ${coups}${texteCoups}`;
}

function distribuer() {
  plateau.innerHTML = '';
  preuves.innerHTML = '';
  ouvertes = [];
  trouvees = 0;
  coups = 0;
  bloque = false;
  fin.hidden = true;
  consigne.hidden = false;
  majCompte();

  let cartesDoubles = [];
  paires.forEach(p => {
    cartesDoubles.push(p, p);
  });
  cartesDoubles = melanger(cartesDoubles);

  cartesDoubles.forEach((p, index) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'carte';
    b.dataset.cle = p.cle;
    b.setAttribute('aria-label', `Carte ${index + 1}, face cachée`);

    let fen = '';
    for (let n = 0; n < 9; n++) {
      const active = Math.random() < 0.34 ? ' class="on"' : '';
      fen += `<i${active}></i>`;
    }

    const nomSansSpeciaux = p.nom.replace(/[^A-Za-z]/g, '');
    const classeLong = nomSansSpeciaux.length > 6 ? ' class="long"' : '';

    b.innerHTML = `
      <span class="int">
        <span class="face dos">${fen}</span>
        <span class="face recto">
          <b${classeLong}>${p.nom}</b>
          <small>${p.type}</small>
        </span>
      </span>
    `;

    b.addEventListener('click', () => retourner(b, p, index));
    plateau.appendChild(b);
  });
}

function retourner(b, p, i) {
  if (bloque || b.classList.contains('ouverte') || b.classList.contains('trouvee')) {
    return;
  }

  b.classList.add('ouverte');
  b.setAttribute('aria-label', `Carte ${i + 1}, ${p.nom}`);
  ouvertes.push(b);

  if (ouvertes.length < 2) return;

  coups++;
  const [c1, c2] = ouvertes;

  if (c1.dataset.cle === c2.dataset.cle) {
    c1.classList.add('trouvee');
    c2.classList.add('trouvee');
    c1.classList.remove('ouverte');
    c2.classList.remove('ouverte');
    ouvertes = [];
    trouvees++;
    montrerPreuve(p);
  } else {
    bloque = true;
    setTimeout(() => {
      ouvertes.forEach(carte => {
        carte.classList.remove('ouverte');
        const ancienAria = carte.getAttribute('aria-label');
        carte.setAttribute('aria-label', ancienAria.replace(/, .*$/, ', face cachée'));
      });
      ouvertes = [];
      bloque = false;
    }, 850);
  }

  majCompte();

  if (trouvees === 6) {
    consigne.hidden = true;
    finTexte.textContent = `Les six paires en ${coups} coups.`;
    fin.hidden = false;
  }
}

function montrerPreuve(p) {
  consigne.textContent = 'Bien vu. Cliquez sur une preuve pour aller au projet.';
  const li = document.createElement('li');
  li.innerHTML = `<b>${p.nom}</b><a href="#${p.cible}">${p.preuve}</a>`;

  li.querySelector('a').addEventListener('click', () => {
    const art = document.getElementById(p.cible);
    if (art && art.classList.contains('projet')) {
      art.classList.add('eclaire');
      setTimeout(() => {
        art.classList.remove('eclaire');
      }, 2200);
    }
  });
  preuves.prepend(li);
}

const btnRejouer = document.getElementById('rejouer');
if (btnRejouer) {
  btnRejouer.addEventListener('click', distribuer);
}
distribuer();

// Animation Crazy Circus
(function() {
  const scene = document.getElementById('scene');
  const etape = document.getElementById('etape');
  const btn = document.getElementById('cirque-btn');
  if (!scene || !etape || !btn) return;

  const animaux = {
    lion: { nom: 'Lion', couleur: '#CBC3E3' },
    ours: { nom: 'Ours', couleur: '#ff9d8a' },
    elephant: { nom: 'Éléphant', couleur: '#9fd8c9' }
  };

  const X = [28, 72];
  const H = 26;
  const G = 4;
  const BASE = 10;

  const coups = [
    { type: 'G', texte: 'Le sommet de gauche passe à droite.' },
    { type: 'G', texte: 'Le nouveau sommet de gauche passe à droite.' },
    { type: 'S', texte: 'Les deux sommets échangent leur place.' },
    { type: 'D', texte: 'Le sommet de droite revient à gauche. Objectif atteint.' }
  ];

  const el = {};
  Object.keys(animaux).forEach(cle => {
    const d = document.createElement('span');
    d.className = 'animal';
    d.textContent = animaux[cle].nom;
    d.style.background = animaux[cle].couleur;
    scene.appendChild(d);
    el[cle] = d;
  });

  let piles;
  let idxCoup;
  let minuterie = null;
  let enPause = false;
  const reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function placer(k, p, h) {
    el[k].style.left = `${X[p]}%`;
    el[k].style.bottom = `${BASE + h * (H + G)}px`;
  }

  function tout() {
    piles.forEach((pile, p) => {
      pile.forEach((cle, h) => placer(cle, p, h));
    });
  }

  function texte(titre, t) {
    etape.innerHTML = `<b>${titre}</b>${t}`;
  }

  function depart() {
    piles = [['ours', 'lion', 'elephant'], []];
    idxCoup = 0;
    Object.keys(el).forEach(k => el[k].classList.remove('actif'));
    tout();
    texte('Départ', 'Tous les animaux sont sur le podium de gauche.');
  }

  function deplacer(k, de, vers, finFn, haut = 0) {
    el[k].classList.add('actif');
    el[k].style.bottom = `${BASE + 3 * (H + G) + 12 + haut}px`;

    setTimeout(() => {
      el[k].style.left = `${X[vers]}%`;
    }, 380);

    setTimeout(() => {
      piles[vers].push(k);
      placer(k, vers, piles[vers].length - 1);
    }, 900);

    setTimeout(() => {
      el[k].classList.remove('actif');
      if (finFn) finFn();
    }, 1300);
  }

  function jouer() {
    if (idxCoup >= coups.length) {
      minuterie = setTimeout(() => {
        depart();
        suite();
      }, 2200);
      return;
    }

    const c = coups[idxCoup];
    texte(`Coup ${idxCoup + 1} / ${coups.length}`, c.texte);
    idxCoup++;

    if (c.type === 'S') {
      const a = piles[0].pop();
      const b = piles[1].pop();
      deplacer(a, 0, 1, null);
      deplacer(b, 1, 0, suite, H + G);
    } else {
      const de = c.type === 'G' ? 0 : 1;
      const vers = 1 - de;
      deplacer(piles[de].pop(), de, vers, suite);
    }
  }

  function suite() {
    if (!enPause) minuterie = setTimeout(jouer, 900);
  }

  btn.addEventListener('click', () => {
    enPause = !enPause;
    btn.textContent = enPause ? 'Lecture' : 'Pause';
    if (enPause) {
      clearTimeout(minuterie);
    } else {
      suite();
    }
  });

  depart();
  if (reduit) {
    enPause = true;
    btn.textContent = 'Lecture';
  } else {
    suite();
  }
})();

// Copie dans le presse-papier
document.querySelectorAll('[data-copie]').forEach(btnItem => {
  btnItem.addEventListener('click', () => {
    const targetId = btnItem.getAttribute('data-copie');
    const elCible = document.getElementById(targetId);
    if (!elCible) return;

    const texte = elCible.textContent.trim();

    const ok = () => {
      btnItem.textContent = 'Copié';
      btnItem.classList.add('ok');
      setTimeout(() => {
        btnItem.textContent = 'Copier';
        btnItem.classList.remove('ok');
      }, 1600);
    };

    const fallback = () => {
      const r = document.createRange();
      r.selectNodeContents(elCible);
      const s = window.getSelection();
      s.removeAllRanges();
      s.addRange(r);
      btnItem.textContent = 'Sélectionné';
      setTimeout(() => {
        btnItem.textContent = 'Copier';
      }, 1600);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texte).then(ok, fallback);
    } else {
      fallback();
    }
  });
});

// Menu mobile
const topHeader = document.getElementById('main-header');
const burgerBtn = document.getElementById('burger-btn');

if (topHeader && burgerBtn) {
  const regler = (ouvert) => {
    topHeader.classList.toggle('ouvert', ouvert);
    burgerBtn.setAttribute('aria-expanded', ouvert);
    burgerBtn.setAttribute('aria-label', ouvert ? 'Fermer le menu' : 'Ouvrir le menu');
  };

  burgerBtn.addEventListener('click', () => {
    regler(!topHeader.classList.contains('ouvert'));
  });

  topHeader.querySelectorAll('nav a').forEach(lien => {
    lien.addEventListener('click', () => regler(false));
  });

  document.addEventListener('click', (e) => {
    if (!topHeader.contains(e.target)) regler(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') regler(false);
  });
}