/* ═══════════════════════════════════════════════════════════════════════════
   TIMONIA — SOURCE UNIQUE DE VÉRITÉ  (référentiel v2.1 exécutable)
   ---------------------------------------------------------------------------
   Ce fichier est la SEULE définition du modèle métier. Les 3 dashboards
   (client, partner mandataire/admin, fiche dossier) le chargent et le lisent —
   ils ne redéfinissent JAMAIS étapes, types, tarifs ni barème en local.
   → C'est la règle §7 du référentiel : « un module de config partagé ».

   Chargement (script classique, compatible file://) :
     <script src="timonia-config.js"></script>
   puis utiliser  window.T  ci-dessous.
═══════════════════════════════════════════════════════════════════════════ */
(function (global) {

  /* ── 1. PIPELINE UNIQUE — 7 ÉTAPES ─────────────────────────────────────
     UNE seule liste d'étapes pour TOUS les types de projet.
     Le type de projet n'est qu'un filtre / tag, jamais un pipeline séparé.
     bloc = quel bloc CLIENT s'active (0 = amont/qualif, hors bloc). */
  var PIPELINE = [
    { n:'01', key:'nouveaux_inscrits', mand:'Nouveaux inscrits',                          client:'Conseil Flash',            bloc:0,
      desc:"Lead entrant — vérifier la recevabilité de la demande et prendre contact sous 24 h." },
    { n:'02', key:'relance_qualif',    mand:'Relance · Appel qualif fixé',                client:'Conseil Flash',            bloc:0,
      desc:"Relance du prospect et prise de RDV pour le Conseil Flash (15 min offert)." },
    { n:'03', key:'qualif_fait',       mand:'Appel qualif fait · Devis audit envoyé',     client:'Conseil Flash',            bloc:0,
      desc:"Conseil Flash réalisé, situation qualifiée, objectifs formalisés. Devis d'audit envoyé." },
    { n:'04', key:'audit_cours',       mand:'Audit en cours',                             client:'Audit stratégique',        bloc:1,
      desc:"Déclenché après paiement du forfait Bloc 1." },
    { n:'05', key:'audit_livre',       mand:'Audit livré & facturé · Devis mise en œuvre envoyé', client:'Audit stratégique', bloc:1,
      desc:"Livrable remis, audit facturé, devis de mise en œuvre envoyé. SAISIE OBLIGATOIRE de la variable du bien avant de passer en mise en œuvre." },
    { n:'06', key:'oeuvre',            mand:'Mise en œuvre opérationnelle',               client:'Mise en œuvre',            bloc:2,
      desc:"Mandat de délégation totale signé. Phase terrain (recherche, coordination des artisans, urbanisme). L'acompte (Rénovation) et la facturation intermédiaire s'émettent depuis l'onglet Facturation, à la main." },
    { n:'07', key:'finalisation',      mand:'Finalisation & livraison',                   client:'Finalisation & livraison', bloc:3,
      desc:"Signature notaire / réception des travaux par le client / remise des clés. Émission de la facture du solde final." },
    { n:'08', key:'archive',           mand:'Projet finalisé · Devis prochaine étape envoyé', client:'Projet livré',         bloc:3,
      desc:"Clôture (gagné). Devis de la prochaine étape envoyé. Déclenche le CTA client « Prêt pour la prochaine étape avec Timonia ? »." },
  ];

  /* ── 1B. PIPELINE B2B — PRESCRIPTEURS (apporteurs d'affaires) ─────────────
     Pipeline séparé du parcours client : agences, notaires, courtiers, syndics…
     qui recommandent Timonia. 6 étapes fixes, indépendantes du pipeline BtoC. */
  var PRESCRIPTEUR_PIPELINE = [
    { n:'1', key:'nouveau',    label:'Nouveaux prospects',     color:'#94A3B8' },
    { n:'2', key:'prospect',   label:'Prospects',              color:'#7F77DD' },
    { n:'3', key:'contact',    label:'1er contact établi',      color:'#378ADD' },
    { n:'4', key:'demo',       label:'Démo',                    color:'#EDA100' },
    { n:'5', key:'interesse',  label:'Intéressé',                color:'#FF8352' },
    { n:'6', key:'signe',      label:'Partenariat signé',        color:'#5FA694' },
  ];
  var PRESC_SECTEURS = ['Agence immobilière','Notaire','Courtier en travaux','Syndic','Banque / Courtier crédit','Autre'];

  /* ── 2. LES 3 BLOCS CLIENT ──────────────────────────────────────────────
     Synchro : étape 02-03 → Bloc 1 · 04-05 → Bloc 2 · 06-07 → Bloc 3. */
  var BLOCS = [
    { id:1, title:'Audit Stratégique',        etapes:['04','05'], color:'#378ADD', bg:'#E6F1FB', fg:'#185FA5' },
    { id:2, title:'Mise en Œuvre',            etapes:['06'],      color:'#E8833A', bg:'#FCEEE1', fg:'#993C1D' },
    { id:3, title:'Finalisation & Livraison', etapes:['07','08'], color:'#5FA694', bg:'#E1F5EE', fg:'#0F6E56' },
  ];

  /* ── 3. LES 5 TYPES DE PROJET ───────────────────────────────────────────
     bloc1            = forfait audit TTC (encaissé au départ)
     variable         = donnée du bien à saisir à l'étape 03 (bloque 03→04 si null-requis)
     acompte_autorise = un acompte Bloc 2 est légalement possible (Rénovation seule)
     solde            = comment se calcule le solde du Bloc 3
       - forfait : montant fixe (honoraires « en sus », audit NON déduit)
       - pct     : base(réel) × taux %  (− acompte déjà versé si acompte_autorise)
     ⚠️ SIMPLIFICATION 2.1 : plus AUCUNE déduction du Bloc 1 pour Mise en
        location / Mise en vente (source d'erreur supprimée). audit_deductible=false partout. */
  var TYPES = {
    'recherche-location': {
      label:'Recherche location', short:'🔑 Recherche loc.', icon:'🔑', color:'#1e63f0',
      livrable:'Votre Feuille de Route Locative',
      bloc1:149, audit_deductible:false, acompte_autorise:false,
      variable:null,
      solde:{ mode:'forfait', montant:2220, label:'Forfait 2 220 € TTC' } },
    'recherche-achat': {
      label:'Recherche achat', short:'🏠 Recherche achat', icon:'🏠', color:'#0ba592',
      livrable:"Votre Rapport d'Expertise Vénale et Foncière",
      bloc1:790, audit_deductible:false, acompte_autorise:false,
      variable:null,
      solde:{ mode:'forfait', montant:9900, label:'Forfait 9 900 € TTC' } },
    'mise-location': {
      label:'Mise en location', short:'📋 Mise en loc.', icon:'📋', color:'#7F77DD',
      livrable:"Votre Rapport d'Ingénierie Locative",
      bloc1:490, audit_deductible:false, acompte_autorise:false,
      variable:{ key:'surface', label:'Surface', unit:'m²', reelLabel:'Surface réelle', bloc3:false },
      solde:{ mode:'pct', taux:13, base:'surface', unitaire:true, label:'Surface m² × 13 €' } },
    'mise-vente': {
      label:'Mise en vente', short:'🏷️ Mise en vente', icon:'🏷️', color:'#EDA100',
      livrable:"Votre Rapport d'Expertise Vénale et Foncière",
      bloc1:790, audit_deductible:false, acompte_autorise:false,
      variable:{ key:'prix', label:'Prix estimé', unit:'€', reelLabel:'Prix réel acté', bloc3:true },
      solde:{ mode:'pct', taux:5, base:'prix', label:'Prix réel acté × 5 %' } },
    'renovation': {
      label:'Rénovation', short:'🔧 Rénovation', icon:'🔧', color:'#E24B4A',
      livrable:'Votre Plan de Vol de Rénovation Énergétique et Technique',
      bloc1:2200, audit_deductible:false, acompte_autorise:true,
      variable:{ key:'travaux', label:'Montant estimé des travaux', unit:'€', reelLabel:'Montant réel final des travaux', bloc3:true },
      solde:{ mode:'pct', taux:10, base:'travaux', label:'Travaux réels × 10 % − acompte versé' } },
  };
  var TYPE_ORDER = ['recherche-location','recherche-achat','mise-location','mise-vente','renovation'];

  /* ── 4. RÔLES & COMMISSION ──────────────────────────────────────────────
     roleCompte  ∈ client · mandataire · manager · admin   (droits)
     specialite  ∈ lead · sale · front · back              (barème commission)
     commission = %rôle × (TTC encaissé ÷ 1,20)  · total mandataires 60 % · siège 40 %. */
  var TVA = 1.20;
  var BAREME = { lead:10, sale:10, front:20, back:20 };   // Σ = 60 %  → siège 40 %
  var PLAFOND_MANDATAIRES = 60;
  var ROLE_LABELS = { lead:'Lead', sale:'Sale', front:'Front', back:'Back', manager:'Manager' };
  var ROLE_DESC   = { lead:'Commercial B2B', sale:'Commercial B2C', front:'Agent terrain', back:'Agent bureau', manager:'Encadrement d\'équipe' };
  var ROLE_COLORS = { lead:'#378ADD', sale:'#5FA694', front:'#FF8352', back:'#7F77DD', manager:'#EDA100' };
  var MANAGER_PLAFOND_PCT = 5; // % max, réglable par manager, prélevé sur la part siège (jamais sur ses propres dossiers)

  /* ── 5. FACTURE — objet indépendant du pipeline ─────────────────────────
     Un dossier a 0 à 3 factures (bloc 1 / bloc 2 acompte / bloc 3 solde).
     Machine à états. Le mandataire peut proposer/corriger un montant ; il part
     alors en « à valider » (manager/admin) avant d'être émis au client. */
  var FACTURE_STATUTS = {
    demande: { label:'À émettre (demandée)', cls:'bo', desc:"Émission demandée par le mandataire — attend l'émission par l'admin." },
    emise:   { label:'Émise',                cls:'bb', desc:'Facture émise et uploadée par l\'admin. Commission GELÉE (taux + montant figés).' },
    payee:   { label:'Payée',                cls:'bg', desc:'Encaissée. Commission exigible → versable au mandataire.' },
  };

  /* ── 6. STATUT DOSSIER (distinct de l'étape) ────────────────────────────── */
  var DOSSIER_STATUTS = {
    en_cours: { label:'En cours',           cls:'bb' },
    cloture:  { label:'Clôturé (gagné)',    cls:'bg' },   // étape 07
    abandonne:{ label:'Abandonné (perdu)',  cls:'br' },
  };

  /* ── HELPERS ─────────────────────────────────────────────────────────── */
  function etape(n){ return PIPELINE.find(function(e){return e.n===n;}); }
  function etapeIndex(n){ return PIPELINE.findIndex(function(e){return e.n===n;}); }
  function blocForEtape(n){ var e=etape(n); if(!e||!e.bloc) return null; return BLOCS.find(function(b){return b.id===e.bloc;}); }
  function type(k){ return TYPES[k]||null; }
  function livrableFor(k){ var t=TYPES[k]; return t?t.livrable:'Votre livrable'; }

  /* commission HT figée pour un rôle sur un montant TTC encaissé */
  function commission(role, montantTTC){
    var pct = BAREME[role]||0;
    return Math.round(pct/100 * ((+montantTTC||0)/TVA));
  }
  /* commission HT du manager sur l'équipe (% réglable 0-5, prélevé sur la part siège) */
  function commissionManager(teamPct, montantTTC){
    var pct = Math.max(0, Math.min(MANAGER_PLAFOND_PCT, +teamPct||0));
    return Math.round(pct/100 * ((+montantTTC||0)/TVA));
  }
  function totalPct(pctObj){ return ['lead','sale','front','back'].reduce(function(s,r){return s+(+(pctObj&&pctObj[r])||0);},0); }
  function pctSiege(pctObj){ return 100 - totalPct(pctObj); }

  /* Solde du Bloc 3 selon le type, la valeur réelle saisie et l'acompte versé.
     valeurReelle = m² réels / prix acté / travaux réels ; acompteVerse en € TTC. */
  function soldeBloc3(typeKey, valeurReelle, acompteVerse){
    var t = TYPES[typeKey]; if(!t) return 0;
    var s = t.solde, v = +valeurReelle||0, ac = +acompteVerse||0;
    if(s.mode==='forfait') return s.montant;
    if(s.mode==='pct'){
      var brut = s.unitaire ? v*s.taux : v*(s.taux/100);   // ×13€ (unitaire) vs ×5%/×8%
      return Math.max(0, Math.round(brut - ac));           // garde-fou anti-solde négatif
    }
    return 0;
  }

  /* Champ variable obligatoire à saisir à l'étape 03 (bloque 03→04). null si aucun. */
  function variableEtape03(typeKey){ var t=TYPES[typeKey]; return (t&&t.variable)?t.variable:null; }


  /* ── PLAN DE VOL — sous-missions par étape (source unique) ────────────────
     PLAN_COMMON : étapes 01-05 et 07-08, communes à tous les types.
     PLAN_TERRAIN : étape 06 (mise en œuvre), spécifique au type de projet.
     Déplacé depuis la vue Dossier — les vues ne redéfinissent plus ces listes. */
  var PLAN_COMMON={
  '01':[{id:'e1a',label:'Vérifier la recevabilité de la demande',resp:'cabinet'},{id:'e1b',label:'Premier contact sous 24 h',resp:'cabinet'}],
  '02':[{id:'e2a',label:'Relancer le prospect',resp:'cabinet'},{id:'e2b',label:'Fixer le RDV Conseil Flash (15 min offert)',resp:'cabinet'}],
  '03':[{id:'e3a',label:'Réaliser le Conseil Flash',resp:'cabinet'},{id:'e3b',label:'Qualifier la situation et formaliser les objectifs',resp:'cabinet'},{id:'e3c',label:"Établir et envoyer le devis d'audit",resp:'cabinet'}],
  '04':[{id:'e4z1',label:"Réaliser l'audit (technique / énergétique / marché)",resp:'cabinet'},{id:'e4z2',label:'Vérifier l\'éligibilité aux aides',resp:'cabinet'},{id:'e4z3',label:'Collecter les pièces & justificatifs',resp:'client'}],
  '05':[{id:'e5a',label:'Rédiger et remettre le livrable au client',resp:'cabinet',doc:true},{id:'e5v',label:'⭐ Saisir la donnée obligatoire du bien',resp:'cabinet',gateVar:true},{id:'e5b',label:'Envoyer le devis de mise en œuvre',resp:'client'}],
  '07':[{id:'e8a',label:'Signature notaire / réception par le client / remise des clés',resp:'client'},{id:'e8r',label:'⭐ Saisir le montant réel (régularisation du solde)',resp:'cabinet',gateReel:true},{id:'e8b',label:'Émettre la facture du solde final (onglet Facturation)',resp:'cabinet'}],
  '08':[{id:'e9a',label:'Archiver le dossier',resp:'cabinet'},{id:'e9b',label:'Envoyer le devis de la prochaine étape',resp:'cabinet'}],
  };
  var PLAN_TERRAIN={
  'recherche-location':[{id:'e4a',label:'Préparer le dossier locataire',resp:'cabinet'},{id:'e4b',label:'Rechercher les biens & déposer les candidatures',resp:'cabinet'},{id:'e4c',label:'Organiser les visites',resp:'cabinet'},{id:'e4d',label:'Retour client post-visite',resp:'client'}],
  'recherche-achat':[{id:'e4a',label:'Sourcer les biens à fort potentiel',resp:'cabinet'},{id:'e4b',label:'Visites avec focus technique',resp:'cabinet'},{id:'e4c',label:'Montage du financement',resp:'partenaire'},{id:'e4d',label:"Offre d'achat & négociation",resp:'cabinet'}],
  'mise-location':[{id:'e4a',label:"Rédiger l'annonce & photos",resp:'cabinet'},{id:'e4b',label:'Publier & gérer les candidatures',resp:'cabinet'},{id:'e4c',label:'Sélection des candidats & visites',resp:'cabinet'}],
  'mise-vente':[{id:'e4a',label:"Rédiger l'annonce & diagnostics",resp:'cabinet'},{id:'e4b',label:'Publier & organiser les visites',resp:'cabinet'},{id:'e4c',label:'Réception & analyse des offres',resp:'cabinet'}],
  'renovation':[{id:'e4a',label:'Mise en concurrence des artisans (courtage travaux)',resp:'cabinet'},{id:'e4b',label:'Obtention et validation des devis',resp:'cabinet'},{id:'e4c',label:'Sélection des prestataires',resp:'client'},{id:'e4d',label:'Coordination & mise en relation des artisans',resp:'cabinet'}],
  };

  /* ── TRANSITIONS — moteur du pipeline ──────────────────────────────────────
     Chaque passage d'étape est déclenché par un ÉVÉNEMENT, pas par le mandataire.
     mode 'auto'   : le système avance seul (paiement, validation client, plan complet).
     mode 'manuel' : le mandataire enregistre un fait réel PROUVÉ (horodatage + récap).
     → 5 transitions auto / 7. Le clic du client fait avancer le dossier. */
  var TRANSITIONS = [
    { from:'01', to:'02', mode:'manuel', event:'contact.effectue',    label:'Premier contact enregistré',
      preuve:{ requis:['ts_appel','canal'], optionnel:['compte_rendu'],
               note:'Date/heure + canal obligatoires. Récap facultatif.' } },
    { from:'02', to:'03', mode:'manuel', event:'conseil_flash.fait',  label:'Conseil Flash réalisé — le devis d\u2019audit part automatiquement',
      preuve:{ requis:['ts_appel','compte_rendu'], optionnel:['duree','enregistrement'],
               note:'Compte-rendu obligatoire (rédigé ou généré par IA depuis les notes/l\u2019enregistrement).',
               ia_prefill:['situation','objectif_bullets'],
               ia_note:'Le récap IA pré-remplit Situation et Objectifs du dossier — zéro double saisie.' },
      v2:'Téléphonie intégrée (Aircall/Ringover) : appel + transcript IA automatiques → transition 100 % auto.' },
    { from:'03', to:'04', mode:'auto',   event:'paiement.audit',      label:'Paiement du Bloc 1 reçu (webhook paiement)' },
    { from:'04', to:'05', mode:'auto',   event:'client.audit_valide', label:'Audit validé par le client dans monespace',
      prerequis:'livrable.remis', prerequisLabel:'Livrable d\u2019audit déposé par le mandataire (notifie le client)',
      effets:['facture.audit.emise','devis.oeuvre.emis'],
      effetsLabel:'La validation émet automatiquement la facture d\u2019audit ET le devis de mise en œuvre',
      relances:{jours:[3,7], puis:'signal_rouge',
        note:'Sans validation : relances client automatiques J+3 et J+7, puis signal rouge sur la fiche client. Jamais de validation automatique silencieuse.'} },
    { from:'05', to:'06', mode:'auto',   event:'client.devis_valide', label:'Devis de mise en œuvre validé par le client dans monespace',
      garde:'variable_bien_saisie', gardeLabel:'Variable du bien saisie (blocage sinon)' },
    { from:'06', to:'07', mode:'auto',   event:'planvol.complet',     label:'100 % des sous-missions terrain (étape 06) réalisées' },
    { from:'07', to:'08', mode:'auto',   event:'paiement.solde',      label:'Facture de solde payée — clôture automatique' },
  ];
  function transitionFrom(n){ return TRANSITIONS.find(function(t){return t.from===n;})||null; }

  /* ── BUS D'ÉVÉNEMENTS — canal client ↔ mandataire ─────────────────────────
     Démo : localStorage partagé (même origine — serveur local ou GitHub Pages).
     Production : table evenements (dossier_id, event, payload, ts) + API/webhook.
     Le contrat est identique : une liste ordonnée d'événements par dossier,
     rejouée pour reconstruire l'étape courante. Les événements sont la vérité. */
  var EVENTS = {
    list: function(dossierId){ try{ return JSON.parse(localStorage.getItem('tim_events_'+dossierId))||[]; }catch(e){ return []; } },
    push: function(dossierId, event, payload){
      var l = EVENTS.list(dossierId);
      l.push({ event:event, ts:new Date().toISOString(), payload:payload||{} });
      localStorage.setItem('tim_events_'+dossierId, JSON.stringify(l));
      return l;
    },
    clear: function(dossierId){ localStorage.removeItem('tim_events_'+dossierId); localStorage.removeItem('tim_evapp_'+dossierId); },
  };

  global.T = {
    PIPELINE, BLOCS, TYPES, TYPE_ORDER, TVA, BAREME, PLAFOND_MANDATAIRES, MANAGER_PLAFOND_PCT,
    ROLE_LABELS, ROLE_DESC, ROLE_COLORS, FACTURE_STATUTS, DOSSIER_STATUTS,
    PRESCRIPTEUR_PIPELINE, PRESC_SECTEURS,
    PLAN_COMMON, PLAN_TERRAIN, TRANSITIONS, transitionFrom, EVENTS,
    etape, etapeIndex, blocForEtape, type, livrableFor,
    commission, commissionManager, totalPct, pctSiege, soldeBloc3, variableEtape03,
    VERSION: '2.3',
  };
})(window);
