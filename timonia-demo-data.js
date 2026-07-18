/* ═══════════════════════════════════════════════════════════════════════════
   TIMONIA — DONNÉES DÉMO PARTAGÉES (un seul jeu pour tous les écrans)
   ---------------------------------------------------------------------------
   Chargé APRÈS timonia-config.js :
     <script src="timonia-config.js"></script>
     <script src="timonia-demo-data.js"></script>
   Expose window.TDATA = { MANDATAIRES, DOSSIERS }.
   → Remplace les tableaux dupliqués dans chaque dashboard (source de bugs).
   En production, ces données viendront de l'API ; ce fichier est le contrat.
═══════════════════════════════════════════════════════════════════════════ */
(function (global) {

  /* Comptes (roleCompte = droits · spec = barème commission) */
  var MANDATAIRES = [
    {trig:'CG1',nom:'Clara Guerin', color:'#FF8352',roleCompte:'mandataire',spec:'front',zone:'Lyon · Rhône',    actif:true, email:'cg@timonia.fr',   date_inscription:'2023-11-02',tel:'06 71 20 33 14'},
    {trig:'SL1',nom:'Sophie Leroux',color:'#378ADD',roleCompte:'manager',   spec:'lead', zone:'Rhône · Ain',    actif:true, email:'sl@timonia.fr',   date_inscription:'2023-09-15',tel:'06 62 45 18 07',equipe:['CG1','AM1'],teamPct:5},
    {trig:'AM1',nom:'Axel Martin',  color:'#5FA694',roleCompte:'mandataire',spec:'sale', zone:'Lyon métropole', actif:true, email:'am@timonia.fr',   date_inscription:'2023-12-01',tel:'06 88 09 51 42'},
    {trig:'RP1',nom:'Remi Payet',   color:'#7F77DD',roleCompte:'mandataire',spec:'back', zone:'National',       actif:true, email:'rp@timonia.fr',   date_inscription:'2024-01-10',tel:'06 14 77 26 90'},
    {trig:'ND1',nom:'Nelly Duong',  color:'#5FA694',roleCompte:'admin',     spec:null,   zone:'Siège',          actif:true, email:'admin@demo.fr',  date_inscription:'2023-06-01',tel:null},
    {trig:null, nom:'Lucas Bernard',color:'#EDA100',roleCompte:'mandataire',spec:null,   zone:null,             actif:false,email:'lucas@gmail.com', date_inscription:'2024-03-18',tel:null},
    {trig:null, nom:'Marie Torres', color:'#E24B4A',roleCompte:'mandataire',spec:null,   zone:null,             actif:false,email:'marie@outlook.fr',date_inscription:'2024-03-20',tel:null},
  ];

  /* Dossiers — modèle unique aligné sur la config.
     factures : objets indépendants { bloc, kind, montant, statut, ts }
       statut ∈ demande (demandée par le mandataire) · emise (émise par l'admin) · payee
       ts     = date de référence de la facture (demande, puis émission) — ISO */
  var DOSSIERS = [
    {id:'D001',clientId:'C001',ref:'TIM-2024-087',nom:'M. Bernard Chaumont',email:'b.chaumont@gmail.com',tel:'06 12 34 56 78',
     type:'renovation',etape:'06',statut:'en_cours',created:'2024-01-03',
     equipe:{lead:'SL1',sale:'AM1',front:'CG1',back:'RP1'},pct:{lead:10,sale:10,front:20,back:20},
     situation:"Locataire impayé 14 mois. DPE-F bloquant. Succession en cours.",
     objectif_bullets:["Récupérer le bien (procédure impayés)","Rénover pour passer du DPE F au DPE C","Remettre en location à ~900 €/mois"],
     variables:{travaux:24800,travauxReel:null},
     client:{statut:'Propriétaire bailleur',adresse:'24 rue de la Paix, 69003 Lyon',canal:'Téléphone (matin)',dernier_contact:'18 mars 2024'},
     bien:{adresse:'14 rue Pasteur, 69007 Lyon',type:'Appartement T3',surface:'62 m²',dpe:'F — 342 kWh/m².an',valeur:'185 000 € (2023)',loyer:'620 €/mois (sous-évalué)'},
     factures:[{bloc:1,kind:'audit',montant:2200,statut:'payee',ts:'2024-02-15T10:12:00'},{bloc:2,kind:'acompte',montant:1240,statut:'emise',ts:'2024-03-10T09:30:00'}],
     messages_pub:[{from:'client',nom:'M. Chaumont',text:"Bonjour, j'ai des questions sur les devis.",ts:'2024-03-18T11:42:00'}],
     messages_priv:[{from:'admin',nom:'Nelly D.',text:'Dossier prioritaire.',ts:'2024-03-15T09:00:00'}],
     photos:[{date:'28 fév. 2024',caption:'État initial du logement avant travaux'},{date:'12 mars 2024',caption:'Coordination artisans — isolation par l\'extérieur'}],
     docs:[{name:"Rapport d'audit complet",type:'PDF',cat:'info'},{name:'Devis artisans × 3 (RGE)',type:'PDF',cat:'valid',status:'attente'},{name:'Facture Audit — 2 200 €',type:'PDF',cat:'valid',status:'valide'}]},

    {id:'D002',clientId:'C002',ref:'TIM-2024-095',nom:'Mme Fatou Diallo',email:'f.diallo@gmail.com',tel:'06 22 33 44 55',
     type:'renovation',etape:'04',statut:'en_cours',created:'2024-01-15',
     equipe:{lead:'SL1',sale:null,front:'CG1',back:null},pct:{lead:10,sale:0,front:20,back:0},
     situation:"Rénovation énergétique complète. DPE-G.",objectif_bullets:["Passer en DPE-C et remettre en location"],
     variables:{travaux:null,travauxReel:null},
     factures:[{bloc:1,kind:'audit',montant:2200,statut:'emise',ts:'2024-02-02T09:00:00'}],
     messages_pub:[],messages_priv:[],photos:[],docs:[]},

    {id:'D003',clientId:'C003',ref:'TIM-2024-101',nom:'Mme Sylvie Morel',email:'s.morel@gmail.com',tel:'06 33 44 55 66',
     type:'recherche-location',etape:'01',statut:'en_cours',created:'2024-03-28',
     equipe:{lead:null,sale:'AM1',front:null,back:null},pct:{lead:0,sale:10,front:0,back:0},
     situation:"Recherche T2/T3 Lyon 7e, budget 850 €/mois.",objectif_bullets:["Trouver et sécuriser un logement avant septembre 2024"],
     variables:{},factures:[],messages_pub:[],messages_priv:[],photos:[],docs:[]},

    {id:'D004',clientId:'C004',ref:'TIM-2024-100',nom:'M. Karim Benali',email:'k.benali@gmail.com',tel:'06 44 55 66 77',
     type:'recherche-location',etape:'02',statut:'en_cours',created:'2024-03-26',
     equipe:{lead:'SL1',sale:null,front:null,back:null},pct:{lead:10,sale:0,front:0,back:0},
     situation:"Recherche location Lyon 6e.",objectif_bullets:["Trouver un logement rapidement"],
     variables:{},factures:[],messages_pub:[],messages_priv:[],photos:[],docs:[]},

    {id:'D005',clientId:'C005',ref:'TIM-2024-096',nom:'M. Omar Traore',email:'o.traore@gmail.com',tel:'06 55 66 77 88',
     type:'recherche-achat',etape:'04',statut:'en_cours',created:'2024-03-25',
     equipe:{lead:'SL1',sale:'AM1',front:null,back:null},pct:{lead:10,sale:10,front:0,back:0},
     situation:"Achat investissement Lyon.",objectif_bullets:["Rendement locatif 6 % minimum","Budget 150–200 k€","Secteur Lyon 7e/8e ou Villeurbanne"],
     variables:{},factures:[{bloc:1,kind:'audit',montant:790,statut:'emise',ts:'2024-03-27T14:00:00'}],
     messages_pub:[],messages_priv:[],photos:[],docs:[]},

    {id:'D006',clientId:'C006',ref:'TIM-2024-086',nom:'Mme Nora Khelil',email:'n.khelil@gmail.com',tel:'06 66 77 88 99',
     type:'mise-vente',etape:'05',statut:'en_cours',created:'2024-03-15',
     equipe:{lead:'SL1',sale:null,front:'CG1',back:'RP1'},pct:{lead:10,sale:0,front:20,back:20},
     situation:"Bien à vendre, Lyon 3e. Diagnostics à jour.",objectif_bullets:["Vendre au meilleur prix sous 4 mois"],
     variables:{prix:320000,prixReel:null},
     factures:[{bloc:1,kind:'audit',montant:790,statut:'payee',ts:'2024-03-20T11:00:00'}],
     messages_pub:[],messages_priv:[],photos:[],docs:[]},

    {id:'D007',clientId:'C007',ref:'TIM-2024-070',nom:'M. Antoine Roux',email:'a.roux@gmail.com',tel:'',
     type:'recherche-location',etape:'01',statut:'abandonne',created:'2024-02-01',
     equipe:{lead:'AM1',sale:null,front:null,back:null},pct:{lead:10,sale:0,front:0,back:0},
     situation:"Non joignable après 5 relances.",objectif_bullets:["—"],
     variables:{},factures:[],
     messages_pub:[],messages_priv:[{from:'admin',nom:'Nelly D.',text:'Dossier abandonné — non joignable.',ts:'2024-03-15T10:00:00'}],photos:[],docs:[]},

    {id:'D008',clientId:'C008',ref:'TIM-2024-054',nom:'Mme Hélène Fabre',email:'h.fabre@gmail.com',tel:'06 77 88 99 00',
     type:'mise-location',etape:'08',statut:'cloture',created:'2023-11-20',
     equipe:{lead:'SL1',sale:null,front:'CG1',back:'RP1'},pct:{lead:10,sale:0,front:20,back:20},
     situation:"Mise en location T3 Villeurbanne, 68 m².",objectif_bullets:["Relouer au prix du marché"],
     variables:{surface:68,surfaceReel:68},
     factures:[{bloc:1,kind:'audit',montant:490,statut:'payee',ts:'2023-11-28T10:00:00'},{bloc:3,kind:'solde',montant:884,statut:'payee',ts:'2024-01-12T16:00:00'}],
     messages_pub:[],messages_priv:[],photos:[],docs:[]},

    {id:'D009',clientId:'C001',ref:'TIM-2024-112',nom:'M. Bernard Chaumont',email:'b.chaumont@gmail.com',tel:'06 12 34 56 78',
     type:'mise-location',etape:'03',statut:'en_cours',created:'2024-03-19',
     equipe:{lead:null,sale:null,front:'CG1',back:'RP1'},pct:{lead:0,sale:0,front:20,back:20},
     situation:"Suite du dossier D001 (rénovation) : remise en location du bien après travaux (~900 €/mois).",
     objectif_bullets:["Relouer à ~900 €/mois dès réception des travaux","Locataire solvable (GLI)"],
     variables:{surface:62,surfaceReel:null},
     bien:{adresse:'14 rue Pasteur, 69007 Lyon',type:'Appartement T3',surface:'62 m²',dpe:'F — objectif C (dossier réno lié)'},
     factures:[],messages_pub:[],messages_priv:[],photos:[],docs:[]},
  ];

  /* Pipeline B2B — prescripteurs (apporteurs d'affaires), indépendant du pipeline client.
     owner = trig du mandataire qui suit la relation. */
  var PRESCRIPTEURS = [
    {id:'P001',nom:'Agence Century 21 Part-Dieu',contact:'Julien Roche',email:'j.roche@century21-partdieu.fr',tel:'04 78 12 34 56',secteur:'Agence immobilière',etape:'nouveau',owner:'AM1',created:'2024-03-28',notes:'',
     adresse:'12 rue Garibaldi, 69003 Lyon',canal:'Email',dernier_contact:'28 mars 2024',criteres:[],messages:[]},
    {id:'P002',nom:'Étude Notariale Girard & Associés',contact:'Me Sophie Girard',email:'s.girard@notaires-lyon.fr',tel:'04 72 00 11 22',secteur:'Notaire',etape:'prospect',owner:'SL1',created:'2024-03-10',notes:"Rencontrée au salon de l'immobilier.",
     adresse:'',canal:'Téléphone',dernier_contact:'12 mars 2024',criteres:[],messages:[]},
    {id:'P003',nom:'Batiment Pro Rénovation',contact:'Karim Zidi',email:'k.zidi@batipro.fr',tel:'06 45 22 11 09',secteur:'Courtier en travaux',etape:'contact',owner:'AM1',created:'2024-02-20',notes:'',
     adresse:'',canal:'',dernier_contact:'',criteres:[],messages:[]},
    {id:'P004',nom:'Syndic Immo Gestion',contact:'Nadia Ferrand',email:'n.ferrand@immogestion.fr',tel:'04 78 55 44 33',secteur:'Syndic',etape:'demo',owner:'SL1',created:'2024-01-15',notes:'Démo prévue le 15 avril.',
     adresse:'',canal:'',dernier_contact:'',criteres:[],messages:[]},
    {id:'P005',nom:'Orpi Lyon 6e',contact:'Thomas Marchand',email:'t.marchand@orpi-lyon6.fr',tel:'04 78 99 88 77',secteur:'Agence immobilière',etape:'interesse',owner:'AM1',created:'2023-12-05',notes:'Attend validation de son réseau.',
     adresse:'',canal:'',dernier_contact:'',criteres:['Commission apporteur : 5 % HT du forfait Bloc 1 pour tout client signé'],messages:[]},
    {id:'P006',nom:'Crédit Immo Conseil',contact:'Laura Petit',email:'l.petit@creditimmoconseil.fr',tel:'06 11 22 33 44',secteur:'Banque / Courtier crédit',etape:'signe',owner:'SL1',created:'2023-10-01',notes:'Partenariat signé — apporteur actif.',
     adresse:'22 cours Lafayette, 69003 Lyon',canal:'Téléphone',dernier_contact:'2 mars 2024',criteres:['Commission apporteur : 5 % HT du forfait Bloc 1','Exclusivité sectorielle : Lyon 3e / 6e / 8e','Reversement sous 30 jours après encaissement client'],messages:[{from:'admin',nom:'Nelly D.',text:'Contrat de partenariat signé et archivé.',ts:'2023-10-05T09:00:00'}]},
  ];


  /* ── ENTITÉ CLIENT — un client, N dossiers (parcours en chaîne) ───────────
     En production : table clients, dossiers.client_id (FK). */
  var CLIENTS = [
    {id:'C001',prenom:'Bernard',nom:'M. Bernard Chaumont',email:'b.chaumont@gmail.com',tel:'06 12 34 56 78',adresse:'8 avenue Berthelot, 69007 Lyon'},
    {id:'C002',prenom:'Fatou',  nom:'Mme Fatou Diallo',   email:'f.diallo@gmail.com', tel:'06 22 33 44 55'},
    {id:'C003',prenom:'Sylvie', nom:'Mme Sylvie Morel',   email:'s.morel@gmail.com',  tel:'06 33 44 55 66'},
    {id:'C004',prenom:'Karim',  nom:'M. Karim Benali',    email:'k.benali@gmail.com', tel:'06 44 55 66 77'},
    {id:'C005',prenom:'Omar',   nom:'M. Omar Traore',     email:'o.traore@gmail.com', tel:'06 55 66 77 88'},
    {id:'C006',prenom:'Nora',   nom:'Mme Nora Khelil',    email:'n.khelil@gmail.com', tel:'06 66 77 88 99'},
    {id:'C007',prenom:'Antoine',nom:'M. Antoine Roux',    email:'a.roux@gmail.com',   tel:''},
    {id:'C008',prenom:'Helene', nom:'Mme Helene Fabre',   email:'h.fabre@gmail.com',  tel:'06 77 88 99 00'},
  ];
  function dossiersOf(clientId){ return DOSSIERS.filter(function(d){ return d.clientId===clientId; }); }

  global.TDATA = { MANDATAIRES: MANDATAIRES, DOSSIERS: DOSSIERS, PRESCRIPTEURS: PRESCRIPTEURS, CLIENTS: CLIENTS, dossiersOf: dossiersOf };
})(window);
