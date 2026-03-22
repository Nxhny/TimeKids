// public/js/i18n.js
// ─────────────────────────────────────────────────────────────────────────────
// TimeKids Internationalisation (i18n)
// Supports: English (en), French (fr), Spanish (es)
//
// Usage:
//   import { t, setLang, getLang, applyTranslations } from './i18n.js';
//   t('nav.all')          → "All Content" | "Tout le contenu" | "Todo el contenido"
//   applyTranslations()   → walks DOM and fills [data-i18n] elements
// ─────────────────────────────────────────────────────────────────────────────

export const LANGUAGES = {
  en: { label: 'English', flag: '🇬🇧' },
  fr: { label: 'Français', flag: '🇫🇷' },
  es: { label: 'Español',  flag: '🇪🇸' },
};

const TRANSLATIONS = {
  // ── Navigation ─────────────────────────────────────────────────────────
  'nav.discover':     { en: 'Discover',          fr: 'Découvrir',          es: 'Descubrir'           },
  'nav.all':          { en: 'All Content',        fr: 'Tout le contenu',    es: 'Todo el contenido'   },
  'nav.lullabies':    { en: 'Lullabies',          fr: 'Berceuses',          es: 'Canciones de cuna'   },
  'nav.stories':      { en: 'Bedtime Stories',    fr: 'Histoires du soir',  es: 'Cuentos para dormir' },
  'nav.favorites':    { en: 'Favourites',         fr: 'Favoris',            es: 'Favoritos'           },
  'nav.ambience':     { en: 'Ambience',           fr: 'Ambiance',           es: 'Ambiente'            },
  'nav.ambient':      { en: 'Ambient Sounds',     fr: 'Sons ambiants',      es: 'Sonidos ambientales' },
  'nav.library':      { en: 'My Library',         fr: 'Ma bibliothèque',    es: 'Mi biblioteca'       },
  'nav.playlists':    { en: 'Playlists',          fr: 'Playlists',          es: 'Listas de reproducción' },
  'nav.uploads':      { en: 'My Uploads',         fr: 'Mes ajouts',         es: 'Mis subidas'         },
  'nav.add_track':    { en: 'Add Track',          fr: 'Ajouter une piste',  es: 'Añadir pista'        },
  'nav.admin':        { en: 'Admin Panel',        fr: 'Panneau admin',      es: 'Panel de admin'      },
  'nav.logout':       { en: 'Logout',             fr: 'Se déconnecter',     es: 'Cerrar sesión'       },

  // ── Topbar ─────────────────────────────────────────────────────────────
  'topbar.timer':     { en: 'Timer',              fr: 'Minuterie',          es: 'Temporizador'        },
  'topbar.dark_mode': { en: 'Toggle dark mode',   fr: 'Mode sombre',        es: 'Modo oscuro'         },

  // ── Sleep timer ────────────────────────────────────────────────────────
  'timer.title':      { en: '⏱️ Sleep Timer',     fr: '⏱️ Minuterie sommeil', es: '⏱️ Temporizador de sueño' },
  'timer.5min':       { en: '5 minutes',          fr: '5 minutes',          es: '5 minutos'           },
  'timer.10min':      { en: '10 minutes',         fr: '10 minutes',         es: '10 minutos'          },
  'timer.20min':      { en: '20 minutes',         fr: '20 minutes',         es: '20 minutos'          },
  'timer.30min':      { en: '30 minutes',         fr: '30 minutes',         es: '30 minutos'          },
  'timer.60min':      { en: '1 hour',             fr: '1 heure',            es: '1 hora'              },
  'timer.cancel':     { en: '❌ Cancel timer',    fr: '❌ Annuler',          es: '❌ Cancelar'          },
  'timer.set':        { en: '⏱️ Sleep timer: {min} min', fr: '⏱️ Minuterie : {min} min', es: '⏱️ Temporizador: {min} min' },
  'timer.ended':      { en: '😴 Sleep timer ended — sweet dreams!', fr: '😴 Minuterie terminée — bonne nuit !', es: '😴 Temporizador terminado — ¡dulces sueños!' },

  // ── Dashboard page titles ──────────────────────────────────────────────
  'view.all':         { en: '🏠 All Content',     fr: '🏠 Tout le contenu', es: '🏠 Todo el contenido' },
  'view.lullaby':     { en: '🎵 Lullabies',       fr: '🎵 Berceuses',       es: '🎵 Canciones de cuna' },
  'view.story':       { en: '📖 Stories',         fr: '📖 Histoires',       es: '📖 Cuentos'          },
  'view.favorites':   { en: '❤️ Favourites',      fr: '❤️ Favoris',         es: '❤️ Favoritos'        },
  'view.ambient':     { en: '🌧️ Ambient Sounds',  fr: '🌧️ Sons ambiants',   es: '🌧️ Sonidos ambientales' },
  'view.my-uploads':  { en: '📤 My Uploads',      fr: '📤 Mes ajouts',      es: '📤 Mis subidas'      },

  // ── Free plan usage ────────────────────────────────────────────────────
  'usage.title':      { en: 'Free Plan Usage',    fr: 'Utilisation (gratuit)', es: 'Uso del plan gratuito' },
  'usage.lullabies':  { en: '🎵 Lullabies',       fr: '🎵 Berceuses',       es: '🎵 Canciones de cuna' },
  'usage.stories':    { en: '📖 Stories',         fr: '📖 Histoires',       es: '📖 Cuentos'          },

  // ── Continue listening ─────────────────────────────────────────────────
  'resume.sub':       { en: 'Continue where you left off', fr: 'Reprendre où vous en étiez', es: 'Continuar donde lo dejaste' },
  'resume.play':      { en: '▶ Continue',         fr: '▶ Reprendre',        es: '▶ Continuar'         },

  // ── Search / filter ────────────────────────────────────────────────────
  'search.placeholder': { en: 'Search tracks…',  fr: 'Rechercher…',         es: 'Buscar pistas…'      },
  'filter.all':         { en: 'All',              fr: 'Tous',                es: 'Todos'               },

  // ── Audio card badges ──────────────────────────────────────────────────
  'badge.lullaby':    { en: '🎵 Lullaby',         fr: '🎵 Berceuse',         es: '🎵 Canción de cuna'  },
  'badge.story':      { en: '📖 Story',           fr: '📖 Histoire',         es: '📖 Cuento'           },

  // ── Player ─────────────────────────────────────────────────────────────
  'player.no_track':  { en: 'No track selected',  fr: 'Aucune piste',        es: 'Sin pista seleccionada' },
  'player.loop_on':   { en: '🔁 Loop on',         fr: '🔁 Boucle activée',   es: '🔁 Bucle activado'   },
  'player.loop_off':  { en: '🔁 Loop off',        fr: '🔁 Boucle désactivée', es: '🔁 Bucle desactivado' },
  'player.muted':     { en: '🔇 Muted',           fr: '🔇 Muet',             es: '🔇 Silenciado'       },
  'player.unmuted':   { en: '🔊 Unmuted',         fr: '🔊 Son activé',       es: '🔊 Sonido activado'  },

  // ── Favourites ─────────────────────────────────────────────────────────
  'fav.added':        { en: 'Added to favourites! ❤️', fr: 'Ajouté aux favoris ! ❤️', es: '¡Añadido a favoritos! ❤️' },
  'fav.removed':      { en: 'Removed from favourites', fr: 'Retiré des favoris',      es: 'Eliminado de favoritos'   },
  'fav.btn':          { en: '🤍 Favourite',       fr: '🤍 Favori',           es: '🤍 Favorito'         },
  'fav.btn_active':   { en: '❤️ Favourited',      fr: '❤️ En favoris',       es: '❤️ En favoritos'     },

  // ── Add track modal ────────────────────────────────────────────────────
  'modal.add_title':  { en: '➕ Add a Track',     fr: '➕ Ajouter une piste', es: '➕ Añadir una pista' },
  'modal.tab_yt':     { en: '🎬 YouTube Link',    fr: '🎬 Lien YouTube',     es: '🎬 Enlace YouTube'   },
  'modal.tab_upload': { en: '📁 Upload MP3',      fr: '📁 Importer MP3',     es: '📁 Subir MP3'        },
  'modal.track_title':{ en: 'Track Title *',      fr: 'Titre de la piste *', es: 'Título de la pista *' },
  'modal.type':       { en: 'Type *',             fr: 'Type *',              es: 'Tipo *'              },
  'modal.category':   { en: 'Category *',         fr: 'Catégorie *',         es: 'Categoría *'         },
  'modal.yt_url':     { en: 'YouTube URL *',      fr: 'URL YouTube *',       es: 'URL de YouTube *'    },
  'modal.yt_hint':    { en: 'Supports youtube.com, youtu.be, and Shorts.', fr: 'Compatible youtube.com, youtu.be et Shorts.', es: 'Admite youtube.com, youtu.be y Shorts.' },
  'modal.desc':       { en: 'Description (optional)', fr: 'Description (optionnel)', es: 'Descripción (opcional)' },
  'modal.cancel':     { en: 'Cancel',             fr: 'Annuler',             es: 'Cancelar'            },
  'modal.add_btn':    { en: 'Add Track 🎵',       fr: 'Ajouter 🎵',         es: 'Añadir 🎵'           },
  'modal.upload_btn': { en: 'Upload 📤',          fr: 'Importer 📤',         es: 'Subir 📤'            },
  'modal.file_label': { en: 'Audio File * (max 20 MB)', fr: 'Fichier audio * (max 20 Mo)', es: 'Archivo de audio * (máx. 20 MB)' },
  'modal.select_type':{ en: 'Select…',            fr: 'Choisir…',            es: 'Seleccionar…'        },
  'modal.lullaby':    { en: '🎵 Lullaby',         fr: '🎵 Berceuse',         es: '🎵 Canción de cuna'  },
  'modal.story':      { en: '📖 Story',           fr: '📖 Histoire',         es: '📖 Cuento'           },
  'modal.upgrade':    { en: 'Upgrade →',          fr: 'Mettre à niveau →',   es: 'Actualizar →'        },
  'modal.adding':     { en: '⏳ Adding…',         fr: '⏳ Ajout…',           es: '⏳ Añadiendo…'       },
  'modal.uploading':  { en: '⏳ Uploading…',      fr: '⏳ Import…',          es: '⏳ Subiendo…'        },

  // ── YouTube player modal ───────────────────────────────────────────────
  'yt_modal.now_playing': { en: 'Now Playing',    fr: 'En cours de lecture', es: 'Reproduciendo'       },
  'yt_modal.add_pl':  { en: '📋 Add to Playlist', fr: '📋 Ajouter à une liste', es: '📋 Añadir a lista' },

  // ── Toast messages ─────────────────────────────────────────────────────
  'toast.track_added':   { en: '🎵 Track added!',    fr: '🎵 Piste ajoutée !',  es: '🎵 ¡Pista añadida!'  },
  'toast.uploaded':      { en: '📤 Uploaded!',        fr: '📤 Importé !',        es: '📤 ¡Subido!'         },
  'toast.deleted':       { en: 'Track deleted.',      fr: 'Piste supprimée.',    es: 'Pista eliminada.'    },
  'toast.pl_added':      { en: 'Added to playlist! 📋', fr: 'Ajouté à la liste ! 📋', es: '¡Añadido a la lista! 📋' },
  'toast.favs_fail':     { en: 'Failed to load favourites', fr: 'Erreur de chargement des favoris', es: 'Error al cargar favoritos' },
  'toast.create_pl_first':{ en: 'Create a playlist first!', fr: 'Créez d\'abord une liste !', es: '¡Crea una lista primero!' },

  // ── Empty states ───────────────────────────────────────────────────────
  'empty.nothing':    { en: 'Nothing here yet',   fr: 'Rien pour l\'instant', es: 'Nada por aquí aún'   },
  'empty.add_first':  { en: 'Add your first track or explore another section.', fr: 'Ajoutez votre première piste.', es: 'Añade tu primera pista.' },
  'empty.no_content': { en: 'Failed to load content', fr: 'Erreur de chargement', es: 'Error al cargar contenido' },

  // ── Plan / profile ─────────────────────────────────────────────────────
  'plan.free':        { en: '🌙 Free Plan',       fr: '🌙 Gratuit',          es: '🌙 Plan gratuito'    },
  'plan.premium':     { en: '⭐ Premium',         fr: '⭐ Premium',           es: '⭐ Premium'          },
  'plan.free_badge':  { en: 'Free Plan',          fr: 'Plan gratuit',        es: 'Plan gratuito'       },
  'plan.premium_badge':{ en: '⭐ Premium',        fr: '⭐ Premium',           es: '⭐ Premium'          },

  // ── Login page ─────────────────────────────────────────────────────────
  'login.title':      { en: 'Welcome back 👋',    fr: 'Bon retour 👋',       es: 'Bienvenido de nuevo 👋' },
  'login.subtitle':   { en: 'Sign in to continue your bedtime journey.', fr: 'Connectez-vous pour continuer.', es: 'Inicia sesión para continuar.' },
  'login.email':      { en: 'Email address',      fr: 'Adresse e-mail',      es: 'Correo electrónico'  },
  'login.password':   { en: 'Password',           fr: 'Mot de passe',        es: 'Contraseña'          },
  'login.btn':        { en: 'Sign In',            fr: 'Se connecter',        es: 'Iniciar sesión'      },
  'login.no_account': { en: "Don't have an account?", fr: "Pas encore de compte ?", es: '¿No tienes cuenta?' },
  'login.create':     { en: 'Create one free →',  fr: 'Créer un compte →',   es: 'Crear una gratis →'  },
  'login.redirecting':{ en: 'Welcome back! Redirecting…', fr: 'Bienvenue ! Redirection…', es: '¡Bienvenido! Redirigiendo…' },
  'login.error_fields':{ en: 'Please fill in all fields.', fr: 'Veuillez remplir tous les champs.', es: 'Por favor rellena todos los campos.' },
  'login.error_invalid':{ en: 'Invalid email or password.', fr: 'Email ou mot de passe incorrect.', es: 'Email o contraseña incorrectos.' },

  // ── Register page ──────────────────────────────────────────────────────
  'register.title':   { en: 'Create your account ✨', fr: 'Créer votre compte ✨', es: 'Crear tu cuenta ✨' },
  'register.subtitle':{ en: 'It only takes a moment.', fr: 'Cela ne prend qu\'un instant.', es: 'Solo toma un momento.' },
  'register.name':    { en: 'Your name',          fr: 'Votre prénom',        es: 'Tu nombre'           },
  'register.email':   { en: 'Email address',      fr: 'Adresse e-mail',      es: 'Correo electrónico'  },
  'register.password':{ en: 'Password',           fr: 'Mot de passe',        es: 'Contraseña'          },
  'register.pw_hint': { en: 'At least 8 characters', fr: 'Au moins 8 caractères', es: 'Al menos 8 caracteres' },
  'register.plan':    { en: 'Choose your plan',   fr: 'Choisissez votre plan', es: 'Elige tu plan'      },
  'register.btn':     { en: 'Create Account',     fr: 'Créer le compte',     es: 'Crear cuenta'        },
  'register.has_account': { en: 'Already have an account?', fr: 'Déjà un compte ?', es: '¿Ya tienes cuenta?' },
  'register.signin':  { en: 'Sign in →',          fr: 'Se connecter →',      es: 'Iniciar sesión →'    },
  'register.success': { en: 'Account created! Taking you to login…', fr: 'Compte créé ! Redirection…', es: '¡Cuenta creada! Redirigiendo…' },
  'register.pw_short':{ en: 'Password must be at least 8 characters.', fr: 'Mot de passe trop court (8 min).', es: 'La contraseña debe tener al menos 8 caracteres.' },
  'pw.weak':          { en: 'Weak',               fr: 'Faible',              es: 'Débil'               },
  'pw.fair':          { en: 'Fair',               fr: 'Correct',             es: 'Regular'             },
  'pw.good':          { en: 'Good',               fr: 'Bien',                es: 'Buena'               },
  'pw.strong':        { en: 'Strong 💪',          fr: 'Fort 💪',             es: 'Fuerte 💪'           },

  // ── Landing page ───────────────────────────────────────────────────────
  'landing.badge':    { en: '🌙 Audio-only · Safe for children', fr: '🌙 Audio uniquement · Sécurisé pour les enfants', es: '🌙 Solo audio · Seguro para niños' },
  'landing.h1a':      { en: 'Where Little Dreams',  fr: 'Là où les Rêves',   es: 'Donde los Sueños'    },
  'landing.h1b':      { en: 'Come Alive',           fr: 'Prennent Vie',       es: 'Cobran Vida'         },
  'landing.desc':     { en: 'Soothing lullabies and magical bedtime stories.', fr: 'Berceuses apaisantes et histoires magiques.', es: 'Canciones de cuna y cuentos mágicos.' },
  'landing.cta':      { en: 'Start for Free ✨',    fr: 'Commencer gratuitement ✨', es: 'Comenzar gratis ✨' },
  'landing.signin':   { en: 'I have an account',   fr: 'J\'ai déjà un compte', es: 'Ya tengo cuenta'   },
  'landing.features': { en: 'Everything you need for bedtime 💫', fr: 'Tout pour l\'heure du coucher 💫', es: 'Todo para la hora de dormir 💫' },
  'landing.features_sub': { en: 'Simple, calming, and completely safe for little ones.', fr: 'Simple, apaisant et sûr pour les petits.', es: 'Simple, tranquilizador y seguro para los pequeños.' },
  'landing.cta2':     { en: 'Ready for peaceful bedtimes? 🌙', fr: 'Prêt pour des nuits paisibles ? 🌙', es: '¿Listo para noches tranquilas? 🌙' },
  'landing.cta2_sub': { en: 'Join thousands of parents using TimeKids every night.', fr: 'Rejoignez des milliers de parents.', es: 'Únete a miles de padres que usan TimeKids.' },
  'landing.cta2_btn': { en: 'Create Free Account', fr: 'Créer un compte gratuit', es: 'Crear cuenta gratuita' },
  'landing.get_started': { en: 'Get Started Free', fr: 'Commencer gratuitement', es: 'Comenzar gratis' },

  // ── Admin ──────────────────────────────────────────────────────────────
  'admin.title':      { en: '⚙️ Admin Panel',     fr: '⚙️ Panneau admin',    es: '⚙️ Panel de administración' },
  'admin.overview':   { en: 'Overview',           fr: 'Vue d\'ensemble',     es: 'Resumen'             },
  'admin.all_audio':  { en: 'All Audio',          fr: 'Tout l\'audio',       es: 'Todo el audio'       },
  'admin.users':      { en: 'Users',              fr: 'Utilisateurs',        es: 'Usuarios'            },
  'admin.total_tracks':{ en: '🎵 Total Tracks',   fr: '🎵 Pistes au total',  es: '🎵 Pistas totales'   },
  'admin.total_users':{ en: '👥 Users',           fr: '👥 Utilisateurs',     es: '👥 Usuarios'         },
  'admin.total_favs': { en: '❤️ Favourites',      fr: '❤️ Favoris',          es: '❤️ Favoritos'        },

  // ── Playlists page ─────────────────────────────────────────────────────
  'pl.title':         { en: '📋 My Playlists',    fr: '📋 Mes playlists',    es: '📋 Mis listas'       },
  'pl.new_btn':       { en: '+ New Playlist',     fr: '+ Nouvelle liste',    es: '+ Nueva lista'       },
  'pl.new_label':     { en: 'New Playlist',       fr: 'Nouvelle playlist',   es: 'Nueva lista'         },
  'pl.modal_title':   { en: '📋 New Playlist',    fr: '📋 Nouvelle playlist', es: '📋 Nueva lista'     },
  'pl.name_label':    { en: 'Playlist Name *',    fr: 'Nom de la liste *',   es: 'Nombre de la lista *' },
  'pl.name_ph':       { en: 'e.g. Bedtime Classics', fr: 'ex. Classiques du soir', es: 'ej. Clásicos para dormir' },
  'pl.desc_label':    { en: 'Description',        fr: 'Description',         es: 'Descripción'         },
  'pl.create_btn':    { en: 'Create Playlist 📋', fr: 'Créer la liste 📋',   es: 'Crear lista 📋'      },
  'pl.play_all':      { en: '▶ Play All',         fr: '▶ Tout lire',         es: '▶ Reproducir todo'   },
  'pl.delete':        { en: '🗑️ Delete',          fr: '🗑️ Supprimer',        es: '🗑️ Eliminar'         },
  'pl.back':          { en: '← Back',             fr: '← Retour',            es: '← Volver'            },
  'pl.empty':         { en: 'No tracks yet. Go to the dashboard and add some!', fr: 'Aucune piste. Allez au tableau de bord !', es: 'Sin pistas. ¡Ve al panel y añade algunas!' },
  'pl.created':       { en: 'Playlist created! 🎉', fr: 'Liste créée ! 🎉',  es: '¡Lista creada! 🎉'   },
  'pl.deleted':       { en: 'Playlist deleted.',  fr: 'Liste supprimée.',    es: 'Lista eliminada.'    },
  'pl.track_removed': { en: 'Track removed.',     fr: 'Piste retirée.',      es: 'Pista eliminada.'    },
  'pl.confirm_delete':{ en: 'Delete "{name}"?',   fr: 'Supprimer « {name} » ?', es: '¿Eliminar "{name}"?' },
  'pl.tracks':        { en: 'track',              fr: 'piste',               es: 'pista'               },
  'pl.tracks_plural': { en: 'tracks',             fr: 'pistes',              es: 'pistas'              },
  'pl.add_to':        { en: '+ New Playlist',     fr: '+ Nouvelle liste',    es: '+ Nueva lista'       },

  // ── Profile page ───────────────────────────────────────────────────────
  'profile.title':    { en: 'My Profile',         fr: 'Mon profil',          es: 'Mi perfil'           },
  'profile.usage':    { en: '📊 Plan Usage',      fr: '📊 Utilisation',      es: '📊 Uso del plan'     },
  'profile.upgrade':  { en: '⭐ Go Premium',      fr: '⭐ Passer Premium',    es: '⭐ Ir a Premium'     },
  'profile.upgrade_desc': { en: 'Unlock unlimited uploads for just €4.99/month.', fr: 'Débloquez les téléchargements illimités pour 4,99 €/mois.', es: 'Desbloquea cargas ilimitadas por 4,99 €/mes.' },
  'profile.upgrade_btn': { en: 'Upgrade Now ✨',  fr: 'Mettre à niveau ✨',   es: 'Actualizar ahora ✨'  },
  'profile.my_uploads':{ en: '📤 My Uploads',     fr: '📤 Mes ajouts',       es: '📤 Mis subidas'      },
  'profile.add_track':{ en: '+ Add Track',        fr: '+ Ajouter une piste', es: '+ Añadir pista'      },
  'profile.lullabies_added': { en: '🎵 Lullabies Added', fr: '🎵 Berceuses ajoutées', es: '🎵 Canciones añadidas' },
  'profile.stories_added':   { en: '📖 Stories Added',   fr: '📖 Histoires ajoutées', es: '📖 Cuentos añadidos'   },
  'profile.favourites':{ en: '❤️ Favourites',     fr: '❤️ Favoris',          es: '❤️ Favoritos'        },
  'profile.no_uploads':{ en: 'No uploads yet',    fr: 'Aucun ajout pour l\'instant', es: 'Sin subidas aún' },
  'profile.go_dashboard': { en: 'Go to the dashboard to add your first track.', fr: 'Allez au tableau de bord pour ajouter une piste.', es: 'Ve al panel para añadir tu primera pista.' },

  // ── 404 ────────────────────────────────────────────────────────────────
  '404.h1':           { en: 'Lost in dreamland…', fr: 'Perdu dans les rêves…', es: 'Perdido en el país de los sueños…' },
  '404.desc':         { en: "This page seems to have drifted off to sleep.", fr: "Cette page s'est endormie.", es: "Esta página parece haberse dormido." },
  '404.home':         { en: '🏠 Go Home',         fr: '🏠 Accueil',          es: '🏠 Inicio'           },
  '404.back':         { en: '← Go Back',          fr: '← Retour',            es: '← Volver'            },



  // ── YouTube player ─────────────────────────────────────────────────────────
  'yt.error_title':    { en: 'Embedding disabled',      fr: 'Intégration désactivée',      es: 'Inserción desactivada'           },
  'yt.error_desc':     { en: 'The video owner has disabled playback outside YouTube.', fr: 'Le propriétaire a désactivé la lecture hors YouTube.', es: 'El propietario ha desactivado la reproducción fuera de YouTube.' },
  'yt.open_youtube':   { en: 'Open on YouTube',          fr: 'Ouvrir sur YouTube',          es: 'Abrir en YouTube'                },
  'yt.embed_warning':  { en: '⚠️ Some YouTube videos cannot be embedded — check that "Allow embedding" is enabled on the video.', fr: '⚠️ Certaines vidéos YouTube ne peuvent pas être intégrées — vérifiez que "Autoriser l'intégration" est activé.', es: '⚠️ Algunos vídeos de YouTube no pueden insertarse — asegúrate de que el vídeo permita la inserción.' },
  // ── Child profiles ─────────────────────────────────────────────────────────
  'child.nav':           { en: 'Child Profiles',     fr: 'Profils enfants',       es: 'Perfiles de niños'        },
  'child.title':         { en: '👶 Child Profiles',  fr: '👶 Profils enfants',    es: '👶 Perfiles de niños'     },
  'child.new_btn':       { en: '+ Add Child',         fr: '+ Ajouter un enfant',   es: '+ Añadir niño'            },
  'child.modal_add':     { en: '➕ Add Child Profile',fr: '➕ Ajouter un profil',  es: '➕ Añadir perfil'         },
  'child.modal_edit':    { en: '✏️ Edit Profile',     fr: '✏️ Modifier le profil', es: '✏️ Editar perfil'        },
  'child.avatar_label':  { en: 'Avatar',              fr: 'Avatar',                es: 'Avatar'                   },
  'child.pick_emoji':    { en: 'Pick an avatar below', fr: 'Choisissez un avatar', es: 'Elige un avatar'          },
  'child.name_label':    { en: "Child's Name *",      fr: 'Prénom *',              es: 'Nombre del niño *'        },
  'child.name_ph':       { en: 'e.g. Emma',           fr: 'ex. Emma',              es: 'ej. Emma'                 },
  'child.age_label':     { en: 'Age (optional)',       fr: 'Âge (optionnel)',       es: 'Edad (opcional)'          },
  'child.age_ph':        { en: 'e.g. 4',              fr: 'ex. 4',                 es: 'ej. 4'                    },
  'child.save_btn':      { en: 'Save Profile',         fr: 'Enregistrer',           es: 'Guardar perfil'           },
  'child.active_label':  { en: 'Currently selected profile', fr: 'Profil sélectionné', es: 'Perfil seleccionado'  },
  'child.clear_btn':     { en: 'Clear selection',     fr: 'Effacer',               es: 'Quitar selección'         },
  'child.active_tag':    { en: 'Active',              fr: 'Actif',                 es: 'Activo'                   },
  'child.select_btn':    { en: 'Select',              fr: 'Choisir',               es: 'Seleccionar'              },
  'child.edit_btn':      { en: 'Edit',                fr: 'Modifier',              es: 'Editar'                   },
  'child.years':         { en: 'years old',           fr: 'ans',                   es: 'años'                     },
  'child.selected':      { en: 'Profile selected',    fr: 'Profil sélectionné',    es: 'Perfil seleccionado'      },
  'child.cleared':       { en: 'Profile cleared',     fr: 'Profil effacé',         es: 'Perfil eliminado'         },
  'child.created':       { en: 'Profile created! 🎉', fr: 'Profil créé ! 🎉',      es: '¡Perfil creado! 🎉'       },
  'child.updated':       { en: 'Profile updated.',    fr: 'Profil mis à jour.',    es: 'Perfil actualizado.'      },
  'child.deleted':       { en: 'Profile deleted.',    fr: 'Profil supprimé.',      es: 'Perfil eliminado.'        },
  'child.confirm_delete':{ en: 'Delete this child profile?', fr: 'Supprimer ce profil ?', es: '¿Eliminar este perfil?' },
  'child.name_required': { en: 'Name is required.',   fr: 'Le prénom est requis.', es: 'El nombre es obligatorio.' },

  // ── Recently played ────────────────────────────────────────────────────────
  'recent.title':        { en: '🕐 Recently Played',  fr: '🕐 Récemment écouté',  es: '🕐 Escuchado recientemente' },
  'recent.empty':        { en: "Nothing played yet — start exploring!", fr: "Rien pour l'instant — commencez !", es: "¡Nada aún — comienza a explorar!" },

  // ── Onboarding ─────────────────────────────────────────────────────────────
  'onboard.welcome':     { en: 'Welcome to TimeKids! 🌙', fr: 'Bienvenue sur TimeKids ! 🌙', es: '¡Bienvenido a TimeKids! 🌙' },
  'onboard.sub':         { en: "Let's set up your first bedtime library.", fr: "Créons votre première bibliothèque.", es: "Vamos a crear tu primera biblioteca." },
  'onboard.step1':       { en: '1. Browse the library', fr: '1. Parcourez la bibliothèque', es: '1. Explora la biblioteca' },
  'onboard.step1_desc':  { en: 'Tap any card to start listening instantly.', fr: 'Appuyez sur une carte pour écouter.', es: 'Toca cualquier tarjeta para escuchar.' },
  'onboard.step2':       { en: '2. Add your own tracks', fr: '2. Ajoutez vos propres pistes', es: '2. Añade tus propias pistas' },
  'onboard.step2_desc':  { en: 'Paste a YouTube link or upload an MP3.', fr: 'Collez un lien YouTube ou importez un MP3.', es: 'Pega un enlace de YouTube o sube un MP3.' },
  'onboard.step3':       { en: '3. Create child profiles', fr: '3. Créez des profils enfants', es: '3. Crea perfiles para tus hijos' },
  'onboard.step3_desc':  { en: 'Switch between profiles for each child.', fr: 'Basculez entre les profils.', es: 'Cambia entre perfiles para cada niño.' },
  'onboard.start':       { en: 'Start Exploring ✨',   fr: 'Commencer ✨',           es: 'Empezar ✨'               },

  // ── Profile nav link ───────────────────────────────────────────────────────
  'nav.profile':         { en: 'My Profile',           fr: 'Mon profil',            es: 'Mi perfil'               },

  // ── Generic ────────────────────────────────────────────────────────────
  'delete.confirm':   { en: 'Delete this track?', fr: 'Supprimer cette piste ?', es: '¿Eliminar esta pista?' },
  'error.generic':    { en: 'Something went wrong.', fr: 'Une erreur est survenue.', es: 'Algo salió mal.'   },
  'language.label':   { en: 'Language',           fr: 'Langue',              es: 'Idioma'              },
};

// ── Core engine ────────────────────────────────────────────────────────────

const STORAGE_KEY = 'tk_lang';

/** Get current language code */
export function getLang() {
  return localStorage.getItem(STORAGE_KEY) || 'en';
}

/** Set language and persist */
export function setLang(code) {
  if (!LANGUAGES[code]) return;
  localStorage.setItem(STORAGE_KEY, code);
  applyTranslations();
  document.documentElement.lang = code;
  // Dispatch event so other modules can react
  window.dispatchEvent(new CustomEvent('langchange', { detail: { lang: code } }));
}

/**
 * Translate a key with optional variable interpolation.
 * @param {string} key — e.g. 'nav.all'
 * @param {Object} vars — e.g. { min: 10 } → replaces {min}
 */
export function t(key, vars = {}) {
  const lang  = getLang();
  const entry = TRANSLATIONS[key];
  if (!entry) { console.warn(`[i18n] Missing key: ${key}`); return key; }
  let str = entry[lang] ?? entry['en'] ?? key;
  for (const [k, v] of Object.entries(vars)) {
    str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
  }
  return str;
}

/**
 * Walk the DOM and fill all [data-i18n] elements.
 * Supports:
 *   data-i18n="key"               → sets textContent
 *   data-i18n-placeholder="key"   → sets placeholder attribute
 *   data-i18n-title="key"         → sets title attribute
 *   data-i18n-html="key"          → sets innerHTML (use carefully)
 */
export function applyTranslations(root = document) {
  root.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  root.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  root.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.title = t(el.dataset.i18nTitle);
  });
  root.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.dataset.i18nHtml);
  });
}

/**
 * Build and inject the language switcher widget into a target element.
 * @param {string|HTMLElement} target — selector or element
 */
export function renderLanguageSwitcher(target) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return;

  const current = getLang();
  const options = Object.entries(LANGUAGES).map(([code, meta]) => `
    <button class="lang-opt ${code === current ? 'active' : ''}" data-lang="${code}" title="${meta.label}">
      <span class="lang-flag">${meta.flag}</span>
      <span class="lang-name">${meta.label}</span>
    </button>
  `).join('');

  el.innerHTML = `
    <div class="lang-switcher">
      <div class="lang-current">
        <span>${LANGUAGES[current].flag}</span>
        <span class="lang-current-label">${LANGUAGES[current].label}</span>
        <span style="font-size:.7rem;opacity:.6;">▾</span>
      </div>
      <div class="lang-dropdown">${options}</div>
    </div>`;

  el.querySelectorAll('.lang-opt').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      setLang(btn.dataset.lang);
      // Re-render switcher to reflect new active state
      renderLanguageSwitcher(target);
      // Close dropdown
      el.querySelector('.lang-dropdown')?.classList.remove('open');
    });
  });

  el.querySelector('.lang-current')?.addEventListener('click', e => {
    e.stopPropagation();
    el.querySelector('.lang-dropdown')?.classList.toggle('open');
  });

  document.addEventListener('click', () => {
    el.querySelector('.lang-dropdown')?.classList.remove('open');
  });
}

// Auto-apply on import
document.addEventListener('DOMContentLoaded', () => {
  applyTranslations();
  document.documentElement.lang = getLang();
});
