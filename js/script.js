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
            window.location.href = "merci.html";
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

  /* ===== Barre de progression de lecture ===== */
  (function () {
    var barre = document.getElementById("barre-progression");
    if (!barre) return;

    var frame = null;

    function mettreAJour() {
      frame = null;
      var hauteur = document.documentElement.scrollHeight - window.innerHeight;
      var pourcentage = hauteur > 0 ? (window.scrollY / hauteur) * 100 : 0;
      barre.style.width = pourcentage + "%";
    }

    window.addEventListener("scroll", function () {
      if (frame === null) frame = window.requestAnimationFrame(mettreAJour);
    }, { passive: true });
    window.addEventListener("resize", mettreAJour);
    mettreAJour();
  })();

  /* ===== Monogramme : le trait se dessine tout seul à l'arrivée ===== */
  (function () {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    document.querySelectorAll(".logo-mark circle, .logo-mark path").forEach(function (forme, i) {
      if (typeof forme.getTotalLength !== "function") return;
      var longueur = forme.getTotalLength();
      forme.style.strokeDasharray = longueur;
      forme.style.strokeDashoffset = longueur;
      // Force le recalcul de style avant de lancer la transition, sinon le
      // navigateur applique directement l'état final sans jamais animer.
      forme.getBoundingClientRect();
      forme.style.transition = "stroke-dashoffset .9s cubic-bezier(.2,.7,.2,1) " + (i * 0.15) + "s";
      forme.style.strokeDashoffset = "0";
    });
  })();

  /* ===== Boutons magnétiques (CTA principaux, desktop uniquement) ===== */
  (function () {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    document.querySelectorAll(".btn-grand, .contact-appel-num").forEach(function (bouton) {
      var frame = null;

      bouton.addEventListener("pointermove", function (evenement) {
        var rect = bouton.getBoundingClientRect();
        var x = evenement.clientX - rect.left - rect.width / 2;
        var y = evenement.clientY - rect.top - rect.height / 2;

        if (frame === null) {
          frame = window.requestAnimationFrame(function () {
            frame = null;
            bouton.style.transform = "translate(" + (x * 0.18) + "px, " + (y * 0.35) + "px)";
          });
        }
      });

      bouton.addEventListener("pointerleave", function () {
        bouton.style.transform = "";
      });
    });
  })();

  /* ===== Bascule 3D des cartes au survol (desktop uniquement) ===== */
  (function () {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    document.querySelectorAll(".realisation-carte, .pour-qui-carte").forEach(function (carte) {
      var frame = null;

      carte.addEventListener("pointermove", function (evenement) {
        var rect = carte.getBoundingClientRect();
        var x = (evenement.clientX - rect.left) / rect.width - 0.5;
        var y = (evenement.clientY - rect.top) / rect.height - 0.5;

        if (frame === null) {
          frame = window.requestAnimationFrame(function () {
            frame = null;
            carte.style.transform =
              "perspective(900px) rotateX(" + (y * -6) + "deg) rotateY(" + (x * 8) + "deg) translateY(-4px)";
          });
        }
      });

      carte.addEventListener("pointerleave", function () {
        carte.style.transform = "";
      });
    });
  })();

  /* ===== Trace d'encre au curseur (clin d'œil au monogramme, desktop uniquement) ===== */
  (function () {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    var canevas = document.createElement("canvas");
    canevas.className = "trace-encre";
    canevas.setAttribute("aria-hidden", "true");
    document.body.appendChild(canevas);
    var ctx = canevas.getContext("2d");
    if (!ctx) return;

    var particules = [];

    function redimensionner() {
      canevas.width = window.innerWidth;
      canevas.height = window.innerHeight;
    }
    redimensionner();
    window.addEventListener("resize", redimensionner);

    document.addEventListener("pointermove", function (evenement) {
      if (evenement.pointerType && evenement.pointerType !== "mouse") return;
      particules.push({ x: evenement.clientX, y: evenement.clientY, vie: 1 });
      if (particules.length > 40) particules.shift();
    });

    function dessiner() {
      ctx.clearRect(0, 0, canevas.width, canevas.height);
      particules.forEach(function (p) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5 * p.vie, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(196, 87, 46, " + (0.35 * p.vie) + ")";
        ctx.fill();
        p.vie -= 0.035;
      });
      particules = particules.filter(function (p) { return p.vie > 0; });
      window.requestAnimationFrame(dessiner);
    }
    window.requestAnimationFrame(dessiner);
  })();

  /* ===== Simulateur Google : comparateur avant / après à glisser ===== */
  (function () {
    var compare = document.getElementById("simulateur-compare");
    var curseur = document.getElementById("simulateur-curseur");
    if (!compare || !curseur) return;

    function definirPosition(pourcent) {
      if (pourcent < 0) pourcent = 0;
      else if (pourcent > 100) pourcent = 100;
      compare.style.setProperty("--pos", pourcent + "%");
      curseur.setAttribute("aria-valuenow", Math.round(pourcent));
    }

    function pourcentDepuisEvenement(evenement) {
      var rect = compare.getBoundingClientRect();
      var x = evenement.clientX - rect.left;
      return (x / rect.width) * 100;
    }

    var enTrain = false;
    var utilisateurADeplace = false;

    compare.addEventListener("pointerdown", function (evenement) {
      enTrain = true;
      utilisateurADeplace = true;
      compare.classList.add("simulateur-actif");
      compare.setPointerCapture(evenement.pointerId);
      definirPosition(pourcentDepuisEvenement(evenement));
    });

    compare.addEventListener("pointermove", function (evenement) {
      if (!enTrain) return;
      definirPosition(pourcentDepuisEvenement(evenement));
    });

    function relacher() {
      enTrain = false;
      compare.classList.remove("simulateur-actif");
    }

    compare.addEventListener("pointerup", relacher);
    compare.addEventListener("pointercancel", relacher);

    curseur.addEventListener("keydown", function (evenement) {
      var actuel = parseFloat(curseur.getAttribute("aria-valuenow"));
      if (isNaN(actuel)) actuel = 50;

      if (evenement.key === "ArrowLeft") { utilisateurADeplace = true; definirPosition(actuel - 5); evenement.preventDefault(); }
      else if (evenement.key === "ArrowRight") { utilisateurADeplace = true; definirPosition(actuel + 5); evenement.preventDefault(); }
      else if (evenement.key === "Home") { utilisateurADeplace = true; definirPosition(0); evenement.preventDefault(); }
      else if (evenement.key === "End") { utilisateurADeplace = true; definirPosition(100); evenement.preventDefault(); }
    });

    // Petite invitation au premier passage en vue : un va-et-vient discret
    // pour montrer que le curseur se glisse, sans jamais gêner la lecture.
    var reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduit && "IntersectionObserver" in window) {
      var observateurInvite = new IntersectionObserver(function (entrees) {
        entrees.forEach(function (entree) {
          if (!entree.isIntersecting || utilisateurADeplace) return;
          observateurInvite.unobserve(compare);

          var depart = null;
          var duree = 1400;

          function etape(temps) {
            if (utilisateurADeplace) return;
            if (depart === null) depart = temps;
            var t = Math.min((temps - depart) / duree, 1);
            var valeur = 30 + Math.sin(t * Math.PI * 2) * 16 * (1 - t);
            definirPosition(valeur);
            if (t < 1) window.requestAnimationFrame(etape);
            else definirPosition(30);
          }
          window.requestAnimationFrame(etape);
        });
      }, { threshold: 0.5 });
      observateurInvite.observe(compare);
    }
  })();
})();
