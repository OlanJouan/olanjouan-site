/* Olan Jouan · l'artisan du web
   JavaScript vanilla : menu mobile, accordéon FAQ, formules,
   validation et envoi du formulaire, animations au scroll. */

(function () {
  "use strict";

  /* ===== Menu mobile ===== */
  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");

  if (burger && nav) {
    burger.addEventListener("click", function () {
      var ouvert = nav.classList.toggle("ouvert");
      burger.setAttribute("aria-expanded", ouvert ? "true" : "false");
      burger.setAttribute("aria-label", ouvert ? "Fermer le menu" : "Ouvrir le menu");
    });

    // Fermer le menu quand on clique sur un lien
    nav.querySelectorAll("a").forEach(function (lien) {
      lien.addEventListener("click", function () {
        nav.classList.remove("ouvert");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ===== Accordéon FAQ ===== */
  document.querySelectorAll(".faq-question").forEach(function (question) {
    question.addEventListener("click", function () {
      var reponse = question.parentElement.nextElementSibling
        || question.closest(".faq-item").querySelector(".faq-reponse");
      var dejaOuvert = question.getAttribute("aria-expanded") === "true";

      question.setAttribute("aria-expanded", dejaOuvert ? "false" : "true");
      if (reponse) {
        reponse.hidden = dejaOuvert;
      }
    });
  });

  /* ===== Boutons de formule : scroll + pré-remplissage ===== */
  var champFormule = document.getElementById("champ-formule");
  var encart = document.getElementById("formule-choisie");
  var encartNom = document.getElementById("formule-choisie-nom");
  var boutonRetirer = document.getElementById("formule-retirer");

  function afficherFormuleChoisie(formule) {
    if (champFormule) champFormule.value = formule;
    if (encart && encartNom) {
      encartNom.textContent = formule;
      encart.hidden = false;
    }
  }

  document.querySelectorAll("[data-formule]").forEach(function (bouton) {
    bouton.addEventListener("click", function (evenement) {
      var formule = bouton.getAttribute("data-formule");
      var contact = document.getElementById("contact");

      if (contact) {
        // Le formulaire est sur la même page (accueil)
        evenement.preventDefault();
        afficherFormuleChoisie(formule);
        contact.scrollIntoView({ behavior: "smooth" });
      } else {
        // Le formulaire est ailleurs (page tarifs) : on emporte la formule dans l'adresse.
        // On vise la racine « / » et non « index.html » : certains hébergeurs redirigent
        // index.html vers / et perdent le paramètre au passage.
        evenement.preventDefault();
        window.location.href = "/?formule=" + encodeURIComponent(formule) + "#contact";
      }
    });
  });

  // Arrivée depuis la page tarifs : on relit la formule dans l'adresse
  if (champFormule && window.location.search) {
    var formuleUrl = new URLSearchParams(window.location.search).get("formule");
    if (formuleUrl) afficherFormuleChoisie(formuleUrl.slice(0, 80));
  }

  /* ===== Arrivée sur une ancre depuis une autre page =====
     Le CSS complet est chargé sans bloquer l'affichage : quand le navigateur saute
     à l'ancre, la mise en page n'est pas encore définitive et il atterrit au mauvais
     endroit. On refait donc le saut une fois la page complètement chargée. */
  if (window.location.hash.length > 1) {
    var ancre = document.getElementById(window.location.hash.slice(1));
    if (ancre) {
      window.addEventListener("load", function () {
        ancre.scrollIntoView({ behavior: "instant", block: "start" });
      });
    }
  }

  if (boutonRetirer) {
    boutonRetirer.addEventListener("click", function () {
      if (champFormule) champFormule.value = "Non précisée";
      if (encart) encart.hidden = true;
    });
  }

  /* ===== Formulaire : validation + envoi Web3Forms ===== */
  var formulaire = document.getElementById("formulaire");
  var zoneErreur = document.getElementById("form-erreur");
  var boutonEnvoyer = document.getElementById("bouton-envoyer");

  function afficherErreur(message) {
    if (!zoneErreur) return;
    zoneErreur.textContent = message;
    zoneErreur.hidden = false;
    zoneErreur.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function cacherErreur() {
    if (!zoneErreur) return;
    zoneErreur.hidden = true;
    zoneErreur.textContent = "";
  }

  if (formulaire) {
    formulaire.addEventListener("submit", function (evenement) {
      evenement.preventDefault();
      cacherErreur();

      var nom = document.getElementById("nom");
      var activite = document.getElementById("activite");
      var telephone = document.getElementById("telephone");
      var email = document.getElementById("email");
      var message = document.getElementById("message");

      // Nettoyage visuel
      [nom, activite, telephone, email, message].forEach(function (champ) {
        if (champ) champ.classList.remove("champ-invalide");
      });

      // Champs obligatoires
      if (!nom.value.trim()) {
        nom.classList.add("champ-invalide");
        afficherErreur("Indiquez votre prénom et votre nom.");
        nom.focus();
        return;
      }

      if (!activite.value.trim()) {
        activite.classList.add("champ-invalide");
        afficherErreur("Indiquez votre activité, pour que je sache à qui je parle.");
        activite.focus();
        return;
      }

      // Au moins un moyen de contact : téléphone OU email
      var telRempli = telephone.value.trim() !== "";
      var emailRempli = email.value.trim() !== "";

      if (!telRempli && !emailRempli) {
        telephone.classList.add("champ-invalide");
        email.classList.add("champ-invalide");
        afficherErreur("Laissez-moi au moins un téléphone ou un email, sinon je ne peux pas vous répondre.");
        telephone.focus();
        return;
      }

      if (emailRempli && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        email.classList.add("champ-invalide");
        afficherErreur("Cet email ne semble pas valide. Vérifiez-le, ou laissez plutôt votre téléphone.");
        email.focus();
        return;
      }

      if (telRempli && !/^[0-9+\s().-]{6,20}$/.test(telephone.value.trim())) {
        telephone.classList.add("champ-invalide");
        afficherErreur("Ce numéro de téléphone ne semble pas valide. Vérifiez-le.");
        telephone.focus();
        return;
      }

      if (!message.value.trim()) {
        message.classList.add("champ-invalide");
        afficherErreur("Dites-moi quelques mots sur votre activité.");
        message.focus();
        return;
      }

      // Envoi vers Web3Forms
      boutonEnvoyer.disabled = true;
      boutonEnvoyer.textContent = "Envoi en cours…";

      var donnees = new FormData(formulaire);

      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: donnees,
        headers: { Accept: "application/json" }
      })
        .then(function (reponse) { return reponse.json(); })
        .then(function (resultat) {
          if (resultat.success) {
            if (window.OJSons) window.OJSons.succes();
            document.body.classList.add("transition-sortie");
            window.setTimeout(function () {
              window.location.href = "merci.html";
            }, 320);
          } else {
            throw new Error(resultat.message || "Échec de l'envoi");
          }
        })
        .catch(function () {
          afficherErreur("L'envoi n'a pas fonctionné. Réessayez dans un instant, ou écrivez-moi directement par email (adresse en bas de page).");
          boutonEnvoyer.disabled = false;
          boutonEnvoyer.textContent = "Envoyer ma demande";
        });
    });
  }

  /* ===== Apparition douce au scroll =====
     Le hero est exclu : son conteneur porte aussi la classe « conteneur », donc
     l'ancien sélecteur masquait le titre principal au chargement. Or c'est le plus
     gros élément visible d'entrée : le démarrer à opacity 0 le faisait clignoter
     et retardait le LCP. Il doit s'afficher immédiatement, sans animation.
     Si IntersectionObserver manque, la classe « apparait » n'est jamais posée :
     tout reste visible plutôt que bloqué à opacity 0. */
  var elements = document.querySelectorAll(
    "section:not(.hero) > .conteneur > *, .carte, .etapes-liste li, .faq-item"
  );

  if ("IntersectionObserver" in window) {
    var observateur = new IntersectionObserver(
      function (entrees) {
        entrees.forEach(function (entree) {
          if (entree.isIntersecting) {
            entree.target.classList.add("visible");
            observateur.unobserve(entree.target);
          }
        });
      },
      { threshold: 0.08 }
    );

    // Décalage en cascade : les éléments voisins (cartes, étapes, questions)
    // apparaissent l'un après l'autre. Le compteur est propre à chaque parent,
    // et plafonné pour que le dernier d'une longue liste n'attende pas trop.
    var parents = [];
    var rangs = [];

    elements.forEach(function (element) {
      // Déjà visible à l'arrivée sur la page : on n'anime pas, pour éviter
      // qu'une cascade de blocs ne se mette à bouger d'un coup au chargement.
      // Seul ce qui apparaît en scrollant plus bas est animé.
      if (element.getBoundingClientRect().top < window.innerHeight) return;

      var parent = element.parentElement;
      var i = parents.indexOf(parent);

      if (i === -1) {
        parents.push(parent);
        rangs.push(0);
        i = parents.length - 1;
      }

      var delai = rangs[i]++ * 80;
      if (delai > 400) delai = 400;
      if (delai > 0) element.style.transitionDelay = delai + "ms";

      element.classList.add("apparait");
      observateur.observe(element);
    });
  }

  /* ===== Hero : la maquette suit légèrement la souris (desktop uniquement) ===== */
  (function () {
    var hero = document.querySelector(".hero");
    if (!hero) return;

    var portable = hero.querySelector(".maquette-imac");
    var texte = hero.querySelector(".hero-texte");
    if (!portable) return;

    // Rien sur mobile, sur écran tactile, ni si l'utilisateur limite les animations.
    var reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var sansSurvol = window.matchMedia("(hover: none)").matches;
    if (reduit || sansSurvol || window.innerWidth < 900) return;

    var frame = null;
    var x = 0;
    var y = 0;

    function appliquer() {
      frame = null;
      portable.style.transform =
        "perspective(1300px) rotateY(" + (x * 8) + "deg) rotateX(" +
        (-y * 5) + "deg) translateX(" + (x * 9) + "px)";
      if (texte) texte.style.transform = "translateX(" + (x * -5) + "px)";
    }

    hero.addEventListener("mousemove", function (evenement) {
      var rect = hero.getBoundingClientRect();
      x = ((evenement.clientX - rect.left) / rect.width) * 2 - 1;
      y = ((evenement.clientY - rect.top) / rect.height) * 2 - 1;
      if (x < -1) x = -1; else if (x > 1) x = 1;
      if (y < -1) y = -1; else if (y > 1) y = 1;
      // Une seule frame en attente au maximum.
      if (frame === null) frame = window.requestAnimationFrame(appliquer);
    });

    hero.addEventListener("mouseleave", function () {
      if (frame !== null) {
        window.cancelAnimationFrame(frame);
        frame = null;
      }
      portable.style.transform = "";
      if (texte) texte.style.transform = "";
    });
  })();
})();

/* ===== Sons discrets + bouton marche/arrêt (présent sur toutes les pages) =====
   Sons synthétisés avec l'API Web Audio : aucun fichier à charger, rien à
   attendre. Actif par défaut, mémorisé dans localStorage, coupable en un clic. */
(function () {
  "use strict";

  var CLE_PREF = "oj-sons";
  var actif = window.localStorage.getItem(CLE_PREF) !== "non";
  var contexteAudio = null;

  function contexte() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!contexteAudio) contexteAudio = new AC();
    if (contexteAudio.state === "suspended") contexteAudio.resume();
    return contexteAudio;
  }

  function jouerMaintenant(frequence, duree, volume) {
    var ctx = contexte();
    if (!ctx) return;
    var oscillateur = ctx.createOscillator();
    var gain = ctx.createGain();
    oscillateur.type = "triangle";
    oscillateur.frequency.setValueAtTime(frequence, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duree);
    oscillateur.connect(gain);
    gain.connect(ctx.destination);
    oscillateur.start();
    oscillateur.stop(ctx.currentTime + duree);
  }

  function jouerTon(frequence, duree, volume, delai) {
    if (!actif) return;
    if (!delai) { jouerMaintenant(frequence, duree, volume); return; }
    window.setTimeout(function () { jouerMaintenant(frequence, duree, volume); }, delai);
  }

  // Volume nettement plus audible que le premier réglage (0.05 : quasi
  // inaudible sur la plupart des haut-parleurs). Triangle plutôt que sine :
  // plus de présence, ça se remarque sans devenir criard.
  function sonClic() { jouerTon(880, 0.11, 0.22); }
  function sonSucces() { jouerTon(660, 0.14, 0.22); jouerTon(990, 0.2, 0.22, 100); }

  window.OJSons = { clic: sonClic, succes: sonSucces };

  document.addEventListener("click", function (evenement) {
    if (evenement.target.closest(".btn")) sonClic();
  });

  var bouton = document.createElement("button");
  bouton.type = "button";
  bouton.className = "son-bascule";

  bouton.innerHTML =
    '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M11 5 6 9H2v6h4l5 4V5z"></path>' +
    '<path class="son-ondes" d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"></path>' +
    "</svg>";

  function majBouton() {
    bouton.classList.toggle("son-coupe", !actif);
    bouton.setAttribute("aria-pressed", actif ? "true" : "false");
    bouton.setAttribute("aria-label", actif ? "Désactiver les sons du site" : "Activer les sons du site");
  }
  majBouton();

  bouton.addEventListener("click", function () {
    actif = !actif;
    window.localStorage.setItem(CLE_PREF, actif ? "oui" : "non");
    majBouton();
    if (actif) jouerTon(880, 0.11, 0.22);
  });

  document.body.appendChild(bouton);
})();

/* ===== Barre de progression de lecture ===== */
(function () {
  "use strict";

  var barre = document.createElement("div");
  barre.className = "progression-lecture";
  document.body.appendChild(barre);

  var frame = null;

  function maj() {
    frame = null;
    var hauteur = document.documentElement.scrollHeight - window.innerHeight;
    var pourcentage = hauteur > 0 ? (window.scrollY / hauteur) * 100 : 0;
    barre.style.width = pourcentage + "%";
  }

  window.addEventListener("scroll", function () {
    if (frame === null) frame = window.requestAnimationFrame(maj);
  }, { passive: true });

  window.addEventListener("resize", maj);
  maj();
})();

/* ===== Parallaxe légère au scroll =====
   S'applique aux éléments qui portent [data-parallax="0.xx"]. Le facteur fixe
   l'amplitude du décalage. On lit aussi data-parallax-base pour ne pas écraser
   une éventuelle rotation ou tout autre transform déjà posé en CSS. */
(function () {
  "use strict";

  var elements = document.querySelectorAll("[data-parallax]");
  if (!elements.length) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var frame = null;

  function maj() {
    frame = null;
    var milieu = window.innerHeight / 2;

    elements.forEach(function (element) {
      var rect = element.getBoundingClientRect();
      var distance = rect.top + rect.height / 2 - milieu;
      var facteur = parseFloat(element.getAttribute("data-parallax")) || 0.1;
      var base = element.getAttribute("data-parallax-base") || "";
      element.style.transform = base + " translateY(" + (distance * facteur * -1).toFixed(1) + "px)";
    });
  }

  window.addEventListener("scroll", function () {
    if (frame === null) frame = window.requestAnimationFrame(maj);
  }, { passive: true });

  maj();
})();

/* ===== Transitions de page douces =====
   On n'intercepte jamais le clic (les ouvertures en nouvel onglet, les clics
   du milieu, etc. continuent de fonctionner normalement) : on ajoute juste
   une classe qui fait doucement disparaître la page pendant que le navigateur
   charge la suivante, pour éviter le blanc brutal. */
(function () {
  "use strict";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  function estUneNavigationInterne(lien) {
    if (!lien || lien.origin !== window.location.origin) return false;
    if (lien.target === "_blank" || lien.hasAttribute("download")) return false;
    var href = lien.getAttribute("href") || "";
    if (/^(mailto:|tel:|javascript:|#)/.test(href)) return false;
    return true;
  }

  document.addEventListener("click", function (evenement) {
    if (evenement.defaultPrevented || evenement.button !== 0) return;
    if (evenement.metaKey || evenement.ctrlKey || evenement.shiftKey || evenement.altKey) return;

    var lien = evenement.target.closest("a[href]");
    if (!lien || !estUneNavigationInterne(lien)) return;

    var memePage = lien.pathname === window.location.pathname;
    if (memePage && (lien.hash || lien.search === window.location.search)) return;

    document.body.classList.add("transition-sortie");
  });

  window.addEventListener("pageshow", function (evenement) {
    if (evenement.persisted) document.body.classList.remove("transition-sortie");
  });
})();

/* ===== Comparateur avant / après ===== */
(function () {
  "use strict";

  var curseur = document.getElementById("aa-curseur");
  var avant = document.getElementById("aa-avant");
  var diviseur = document.getElementById("aa-diviseur");
  var cadre = document.querySelector(".aa-cadre");
  if (!curseur || !avant || !diviseur || !cadre) return;

  function maj() {
    var v = curseur.value;
    avant.style.clipPath = "inset(0 " + (100 - v) + "% 0 0)";
    diviseur.style.left = v + "%";
  }

  curseur.addEventListener("input", maj);
  maj();

  /* Petite démo automatique : la première fois que le comparateur entre
     dans l'écran, le curseur balaie une fois de gauche à droite pour
     montrer qu'il est manipulable, puis se pose au centre et rend
     entièrement la main au visiteur. Coupée si l'utilisateur touche déjà
     le curseur (souris, tactile ou clavier) ou préfère moins de mouvement. */
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!("IntersectionObserver" in window)) return;

  var idAnimation = null;
  var demoDesactivee = false;
  var observateur = null;

  function definirValeur(v) {
    curseur.value = v;
    maj();
  }

  function assouplir(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  /* Désactive la démo pour de bon, quel que soit le moment où l'utilisateur
     touche le curseur : avant, pendant ou juste après le déclenchement de
     l'observateur. Sans ce verrou définitif, une interaction qui coïncide
     avec le déclenchement de l'observateur pouvait être écrasée par la
     démo qui démarre ou continue juste après. */
  function arreterDemo() {
    demoDesactivee = true;
    if (idAnimation !== null) {
      cancelAnimationFrame(idAnimation);
      idAnimation = null;
    }
    if (observateur) observateur.disconnect();
  }

  function jouerDemo() {
    if (demoDesactivee || document.activeElement === curseur) return;

    var depart = null;
    var duree = 2200;
    definirValeur(0);

    function etape(horodatage) {
      if (demoDesactivee) return;
      if (depart === null) depart = horodatage;
      var t = Math.min((horodatage - depart) / duree, 1);
      var valeur;
      if (t < 0.75) {
        valeur = assouplir(t / 0.75) * 100;
      } else {
        valeur = 100 - assouplir((t - 0.75) / 0.25) * 50;
      }
      definirValeur(valeur);
      if (t < 1) {
        idAnimation = requestAnimationFrame(etape);
      } else {
        definirValeur(50);
        idAnimation = null;
      }
    }

    idAnimation = requestAnimationFrame(etape);
  }

  ["pointerdown", "touchstart", "keydown", "focus"].forEach(function (evenement) {
    curseur.addEventListener(evenement, arreterDemo, { passive: true });
  });

  observateur = new IntersectionObserver(
    function (entrees, obs) {
      entrees.forEach(function (entree) {
        if (entree.isIntersecting) {
          jouerDemo();
          obs.disconnect();
        }
      });
    },
    { threshold: 0.4 }
  );
  observateur.observe(cadre);
})();

/* ===== Formulaire : petites coches de validation en temps réel =====
   Vient en complément de la validation au clic sur « Envoyer » (plus haut) :
   ici, on rassure ou on alerte dès que la personne quitte un champ. */
(function () {
  "use strict";

  var nom = document.getElementById("nom");
  var activite = document.getElementById("activite");
  var telephone = document.getElementById("telephone");
  var email = document.getElementById("email");
  var message = document.getElementById("message");
  if (!nom) return;

  function icone(champ) {
    return champ.parentElement.querySelector(".champ-icone");
  }

  function marquerValide(champ) {
    champ.classList.remove("champ-invalide");
    champ.classList.add("champ-valide");
    var ic = icone(champ);
    if (ic) ic.classList.add("visible");
  }

  function marquerNeutre(champ) {
    champ.classList.remove("champ-invalide", "champ-valide");
    var ic = icone(champ);
    if (ic) ic.classList.remove("visible");
  }

  function marquerInvalide(champ) {
    champ.classList.remove("champ-valide");
    var ic = icone(champ);
    if (ic) ic.classList.remove("visible");
    champ.classList.remove("champ-invalide");
    void champ.offsetWidth; // relance l'animation de secousse à chaque fois
    champ.classList.add("champ-invalide");
  }

  function valideRempli(champ) {
    if (!champ.value.trim()) marquerInvalide(champ);
    else marquerValide(champ);
  }

  function valideEmail() {
    var v = email.value.trim();
    if (!v) { marquerNeutre(email); return; }
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) marquerValide(email);
    else marquerInvalide(email);
  }

  function valideTelephone() {
    var v = telephone.value.trim();
    if (!v) { marquerNeutre(telephone); return; }
    if (/^[0-9+\s().-]{6,20}$/.test(v)) marquerValide(telephone);
    else marquerInvalide(telephone);
  }

  if (nom) nom.addEventListener("blur", function () { valideRempli(nom); });
  if (activite) activite.addEventListener("blur", function () { valideRempli(activite); });
  if (message) message.addEventListener("blur", function () { valideRempli(message); });
  if (email) email.addEventListener("blur", valideEmail);
  if (telephone) telephone.addEventListener("blur", valideTelephone);
})();
