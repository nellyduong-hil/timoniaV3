/* ═══════════════════════════════════════════════════════════════════════════
   auth.js — Home in Love  |  Authentification & routing
   ───────────────────────────────────────────────────────────────────────────
   RÈGLES :
   - Les rôles sont des DONNÉES, pas des conditions (if/else interdit)
   - projetType n'appartient PAS au profil utilisateur
   - Ajouter un rôle = ajouter une entrée dans ROLES uniquement
   - L'inscription crée toujours un compte "client"
   - La promotion de rôle est réservée à superadmin / manager
   ═══════════════════════════════════════════════════════════════════════════ */


/* ─────────────────────────────────────────────────────────────────────────
   RÔLES
   redirect  : page cible après login
   label     : libellé affiché dans l'UI
   active    : false = rôle déclaré, page pas encore déployée
   canPromote: ce rôle peut-il promouvoir d'autres utilisateurs ?
   ───────────────────────────────────────────────────────────────────────── */
const ROLES = {

  /* ── Externes ── */
  client: {
    redirect  : 'dashboard.html',
    label     : 'Client',
    active    : true,
    canPromote: false,
  },
  partenaire: {
    redirect  : 'partenaire.html',
    label     : 'Partenaire',
    active    : false,
    canPromote: false,
  },

  /* ── Commerciaux ── */
  lead_btob: {
    redirect  : 'commercial.html',
    label     : 'Lead BtoB',
    active    : false,
    canPromote: false,
  },
  sales_btoc: {
    redirect  : 'commercial.html',
    label     : 'Sales BtoC',
    active    : false,
    canPromote: false,
  },

  /* ── Opérationnels (même vue, rémunérations distinctes) ── */
  ops_production: {
    redirect  : 'mandataire.html',
    label     : 'Opérationnel Production',
    active    : true,
    canPromote: false,
  },
  ops_restitution: {
    redirect  : 'mandataire.html',
    label     : 'Opérationnel Restitution',
    active    : false,
    canPromote: false,
  },

  /* ── Management ── */
  manager: {
    redirect  : 'manager.html',
    label     : 'Manager',
    active    : false,
    canPromote: true,
  },
  superadmin: {
    redirect  : 'admin.html',
    label     : 'Super Administrateur',
    active    : true,
    canPromote: true,
  },
};


/* ─────────────────────────────────────────────────────────────────────────
   COMPTES DÉMO
   ─────────────────────────────────────────────────────────────────────────
   RÈGLE STRICTE :
   - Pas de projetType ici — les projets sont portés par DEMO_PROJECTS
   - Pas de partenaire / entreprise — attributs métier, pas auth
   - 3 comptes actifs MVP : client, ops_production, superadmin
   ───────────────────────────────────────────────────────────────────────── */
const DEMO_PASSWORD = 'homeinlove2026';

const DEMO_USERS = [

  /* ── CLIENT — 6 projets attachés dans dashboard.js ── */
  {
    id       : 'usr_client_01',
    email    : 'client@demo.fr',
    password : DEMO_PASSWORD,
    role     : 'client',
    prenom   : 'Sophie',
    nom      : 'Martin',
    avatar   : 'SM',
    phone    : '+33 6 12 34 56 78',
    createdAt: '2026-01-01',
  },

  /* ── OPÉRATIONNEL PRODUCTION (label UI : "Mandataire") ── */
  {
    id       : 'usr_ops_01',
    email    : 'ops@homeinlove.fr',
    password : DEMO_PASSWORD,
    role     : 'ops_production',
    prenom   : 'Claire',
    nom      : 'Dupont',
    avatar   : 'CD',
    phone    : '+33 6 98 76 54 32',
    createdAt: '2025-06-01',
  },

  /* ── SUPER ADMIN ── */
  {
    id       : 'usr_admin_01',
    email    : 'admin@homeinlove.fr',
    password : DEMO_PASSWORD,
    role     : 'superadmin',
    prenom   : 'Admin',
    nom      : 'HIL',
    avatar   : 'AH',
    phone    : null,
    createdAt: '2025-01-01',
  },
];


/* ─────────────────────────────────────────────────────────────────────────
   HELPERS AUTH
   ───────────────────────────────────────────────────────────────────────── */

/**
 * Tente de connecter un utilisateur.
 * @returns {object|null} user ou null si identifiants incorrects
 */
function authLogin(email, password) {
  const user = DEMO_USERS.find(
    u => u.email.toLowerCase() === email.trim().toLowerCase()
      && u.password === password
  );
  if (!user) return null;
  sessionStorage.setItem('hil_user', JSON.stringify(user));
  return user;
}

/**
 * Connecte et redirige selon le rôle.
 * Rôle inactif → coming_soon.html (pas de crash)
 * @returns {object|null}
 */
function authLoginAndRedirect(email, password) {
  const user = authLogin(email, password);
  if (!user) return null;

  const roleConfig = ROLES[user.role];

  if (!roleConfig) {
    console.warn('[HIL Auth] Rôle inconnu :', user.role);
    window.location.href = 'login.html';
    return null;
  }

  window.location.href = roleConfig.active
    ? roleConfig.redirect
    : 'coming_soon.html';

  return user;
}

/**
 * Récupère l'utilisateur connecté depuis la session.
 * @returns {object|null}
 */
function authGetUser() {
  const raw = sessionStorage.getItem('hil_user');
  return raw ? JSON.parse(raw) : null;
}

/**
 * Déconnecte et redirige vers login.
 */
function authLogout() {
  sessionStorage.removeItem('hil_user');
  window.location.href = 'login.html';
}

/**
 * Supprime la session sans redirection.
 * Utilisé sur login.html au chargement de page.
 */
function authLogoutSilent() {
  sessionStorage.removeItem('hil_user');
}

/**
 * Guard de page — vérifie connexion ET rôle autorisé.
 *
 * Usage :
 *   const user = authRequire(['client']);
 *   const user = authRequire(['ops_production', 'superadmin']);
 *   const user = authRequire(); // tout rôle connecté
 *
 * @param {string[]} [allowedRoles] - vide = tous les rôles acceptés
 * @returns {object|null} user ou null + redirect si non autorisé
 */
function authRequire(allowedRoles) {
  const user = authGetUser();

  if (!user) {
    window.location.href = 'login.html';
    return null;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      window.location.href = 'login.html';
      return null;
    }
  }

  return user;
}

/**
 * Vérifie si l'utilisateur a un rôle spécifique.
 * Usage UI : if (authHasRole('superadmin')) { ... }
 * @param {string} role
 * @returns {boolean}
 */
function authHasRole(role) {
  const user = authGetUser();
  return user ? user.role === role : false;
}

/**
 * Vérifie si l'utilisateur connecté peut promouvoir d'autres utilisateurs.
 * @returns {boolean}
 */
function authCanPromote() {
  const user = authGetUser();
  if (!user) return false;
  return ROLES[user.role]?.canPromote === true;
}

/**
 * Retourne le libellé UI d'un rôle.
 * @param {string} role
 * @returns {string}
 */
function authRoleLabel(role) {
  return ROLES[role]?.label || role;
}
