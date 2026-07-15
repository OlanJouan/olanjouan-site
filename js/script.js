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
      var metier = document.getElementById("metier");
      var telephone = document.getElementById("telephone");
      var email = document.getElementById("email");
      var message = document.getElementById("message");

      // Nettoyage visuel
      [nom, metier, telephone, email, message].forEach(function (champ) {
        if (champ) champ.classList.remove("champ-invalide");
      });

      // Champs obligatoires
      if (!nom.value.trim()) {
        nom.classList.add("champ-invalide");
        afficherErreur("Indiquez votre prénom et votre nom.");
        nom.focus();
        return;
      }

      if (!metier.value.trim()) {
        metier.classList.add("champ-invalide");
        afficherErreur("Indiquez votre métier, pour que je sache à qui je parle.");
        metier.focus();
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

  /* ===== Apparition douce au scroll ===== */
  var elements = document.querySelectorAll("section > .conteneur > *, .carte, .etapes-liste li, .faq-item");

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

    elements.forEach(function (element) {
      element.classList.add("apparait");
      observateur.observe(element);
    });
  }
})();
