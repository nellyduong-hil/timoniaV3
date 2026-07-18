# Home in Love — Démo cliquable
Déployer sur GitHub Pages : pousser ce dossier tel quel (index.html à la racine du repo, branche main, Settings → Pages).
Parcours démo :
1. index.html → landing. « Mon espace » exige une connexion.
2. login.html → comptes démo en 1 clic (mot de passe : homeinlove2026)
   - client@demo.fr → dashboard.html (espace client Timonia, dossier D001)
   - ops@homeinlove.fr → mandataire.html (kanban + dossiers + moteur de transitions)
   - admin@homeinlove.fr → admin.html (kanban admin + facturation)
3. Depuis un dossier : badge « 👤 Fiche client » → fiche-client.html.
4. Démo « le client est le manager » : ouvrir dossier.html?id=D002 (onglet mandataire) et dashboard.html?id=D002 (onglet client) → cliquer « ✅ Je valide » côté client → le dossier avance seul.
Les rôles/redirects sont pilotés par js/auth.js (rôles = données). Les règles métier par timonia-config.js (source unique).
