// public/js/i18n.js
// ─────────────────────────────────────────────────────────────────────────────
// TimeKids Internationalisation (i18n)
// Supports: English (en), French (fr), Spanish (es)
// ─────────────────────────────────────────────────────────────────────────────

export const LANGUAGES = {
  en: { label: 'English',  flag: '🇬🇧' },
  fr: { label: 'Français', flag: '🇫🇷' },
  es: { label: 'Español',  flag: '🇪🇸' },
};

const TRANSLATIONS = {
  // ── Navigation ─────────────────────────────────────────────────────────
  'nav.discover':     { en: 'Discover',          fr: 'Découvrir',            es: 'Descubrir'               },
  'nav.all':          { en: 'All Content',        fr: 'Tout le contenu',      es: 'Todo el contenido'       },
  'nav.lullabies':    { en: 'Lullabies',          fr: 'Berceuses',            es: 'Canciones de cuna'       },
  'nav.stories':      { en: 'Bedtime Stories',    fr: 'Histoires du soir',    es: 'Cuentos para dormir'     },
  'nav.favorites':    { en: 'Favourites',         fr: 'Favoris',              es: 'Favoritos'               },
  'nav.ambience':     { en: 'Ambience',           fr: 'Ambiance',             es: 'Ambiente'                },
  'nav.ambient':      { en: 'Ambient Sounds',     fr: 'Sons ambiants',        es: 'Sonidos ambientales'     },
  'nav.library':      { en: 'My Library',         fr: 'Ma bibliothèque',      es: 'Mi biblioteca'           },
  'nav.playlists':    { en: 'Playlists',          fr: 'Playlists',            es: 'Listas de reproducción'  },
  'nav.uploads':      { en: 'My Uploads',         fr: 'Mes ajouts',           es: 'Mis subidas'             },
  'nav.add_track':    { en: 'Add Track',          fr: 'Ajouter une piste',    es: 'Añadir pista'            },
  'nav.admin':        { en: 'Admin Panel',        fr: 'Panneau admin',        es: 'Panel de administración' },
  'nav.logout':       { en: 'Logout',             fr: 'Se déconnecter',       es: 'Cerrar sesión'           },
  'nav.profile':      { en: 'My Profile',         fr: 'Mon profil',           es: 'Mi perfil'               },

  // ── Topbar ─────────────────────────────────────────────────────────────
  'topbar.timer':     { en: 'Timer',              fr: 'Minuterie',            es: 'Temporizador'            },
  'language.label':   { en: 'Language',           fr: 'Langue',               es: 'Idioma'                  },

  // ── Sleep timer ─────────────────────────────────────────────────────────
  'timer.title':      { en: '⏱️ Sleep Timer',     fr: '⏱️ Minuterie',         es: '⏱️ Temporizador'         },
  'timer.5min':       { en: '5 minutes',          fr: '5 minutes',            es: '5 minutos'               },
  'timer.10min':      { en: '10 minutes',         fr: '10 minutes',           es: '10 minutos'              },
  'timer.20min':      { en: '20 minutes',         fr: '20 minutes',           es: '20 minutos'              },
  'timer.30min':      { en: '30 minutes',         fr: '30 minutes',           es: '30 minutos'              },
  'timer.60min':      { en: '1 hour',             fr: '1 heure',              es: '1 hora'                  },
  'timer.cancel':     { en: '❌ Cancel timer',    fr: '❌ Annuler',            es: '❌ Cancelar'              },
  'timer.set':        { en: '⏱️ Sleep timer: {min} min', fr: '⏱️ Minuterie : {min} min', es: '⏱️ Temporizador: {min} min' },
  'timer.ended':      { en: '😴 Sweet dreams!',   fr: '😴 Bonne nuit !',      es: '😴 ¡Dulces sueños!'      },

  // ── View titles ─────────────────────────────────────────────────────────
  'view.all':         { en: '🏠 All Content',     fr: '🏠 Tout le contenu',   es: '🏠 Todo el contenido'    },
  'view.lullaby':     { en: '🎵 Lullabies',       fr: '🎵 Berceuses',         es: '🎵 Canciones de cuna'    },
  'view.story':       { en: '📖 Stories',         fr: '📖 Histoires',         es: '📖 Cuentos'              },
  'view.favorites':   { en: '❤️ Favourites',      fr: '❤️ Favoris',           es: '❤️ Favoritos'            },
  'view.ambient':     { en: '🌧️ Ambient Sounds',  fr: '🌧️ Sons ambiants',     es: '🌧️ Sonidos ambientales'  },
  'view.my-uploads':  { en: '📤 My Uploads',      fr: '📤 Mes ajouts',        es: '📤 Mis subidas'          },

  // ── Usage ────────────────────────────────────────────────────────────────
  'usage.title':      { en: 'Free Plan Usage',    fr: 'Utilisation (gratuit)', es: 'Uso del plan gratuito'  },
  'usage.lullabies':  { en: '🎵 Lullabies',       fr: '🎵 Berceuses',         es: '🎵 Canciones de cuna'    },
  'usage.stories':    { en: '📖 Stories',         fr: '📖 Histoires',         es: '📖 Cuentos'              },

  // ── Continue listening ───────────────────────────────────────────────────
  'resume.sub':       { en: 'Continue listening', fr: 'Reprendre l\'écoute',  es: 'Continuar escuchando'    },
  'resume.play':      { en: '▶ Continue',         fr: '▶ Reprendre',          es: '▶ Continuar'             },

  // ── Search / filter ──────────────────────────────────────────────────────
  'search.placeholder': { en: 'Search tracks…',  fr: 'Rechercher…',           es: 'Buscar pistas…'          },
  'filter.all':         { en: 'All',              fr: 'Tous',                  es: 'Todos'                   },

  // ── Audio badges ─────────────────────────────────────────────────────────
  'badge.lullaby':    { en: '🎵 Lullaby',         fr: '🎵 Berceuse',           es: '🎵 Canción de cuna'      },
  'badge.story':      { en: '📖 Story',           fr: '📖 Histoire',           es: '📖 Cuento'               },

  // ── Player ───────────────────────────────────────────────────────────────
  'player.no_track':  { en: 'No track selected',  fr: 'Aucune piste',          es: 'Sin pista seleccionada'  },
  'player.loop_on':   { en: '🔁 Loop on',         fr: '🔁 Boucle activée',     es: '🔁 Bucle activado'       },
  'player.loop_off':  { en: '🔁 Loop off',        fr: '🔁 Boucle désactivée',  es: '🔁 Bucle desactivado'    },
  'player.muted':     { en: '🔇 Muted',           fr: '🔇 Muet',               es: '🔇 Silenciado'           },
  'player.unmuted':   { en: '🔊 Unmuted',         fr: '🔊 Son activé',         es: '🔊 Sonido activado'      },

  // ── Favourites ───────────────────────────────────────────────────────────
  'fav.added':        { en: 'Added to favourites! ❤️', fr: 'Ajouté aux favoris ! ❤️', es: '¡Añadido a favoritos! ❤️' },
  'fav.removed':      { en: 'Removed from favourites', fr: 'Retiré des favoris',       es: 'Eliminado de favoritos'   },
  'fav.btn':          { en: '🤍 Favourite',       fr: '🤍 Favori',             es: '🤍 Favorito'              },
  'fav.btn_active':   { en: '❤️ Favourited',      fr: '❤️ En favoris',         es: '❤️ En favoritos'          },

  // ── Add track modal ───────────────────────────────────────────────────────
  'modal.add_title':  { en: '➕ Add a Track',     fr: '➕ Ajouter une piste',  es: '➕ Añadir una pista'      },
  'modal.tab_yt':     { en: '🎬 YouTube Link',    fr: '🎬 Lien YouTube',       es: '🎬 Enlace YouTube'        },
  'modal.tab_upload': { en: '📁 Upload MP3',      fr: '📁 Importer MP3',       es: '📁 Subir MP3'             },
  'modal.track_title':{ en: 'Track Title *',      fr: 'Titre de la piste *',   es: 'Título de la pista *'    },
  'modal.type':       { en: 'Type *',             fr: 'Type *',                es: 'Tipo *'                  },
  'modal.category':   { en: 'Category *',         fr: 'Catégorie *',           es: 'Categoría *'             },
  'modal.yt_url':     { en: 'YouTube URL *',      fr: 'URL YouTube *',         es: 'URL de YouTube *'        },
  'modal.yt_hint':    { en: 'Supports youtube.com, youtu.be, and Shorts.', fr: 'Compatible youtube.com, youtu.be et Shorts.', es: 'Admite youtube.com, youtu.be y Shorts.' },
  'modal.desc':       { en: 'Description (optional)', fr: 'Description (optionnel)', es: 'Descripción (opcional)' },
  'modal.cancel':     { en: 'Cancel',             fr: 'Annuler',               es: 'Cancelar'                },
  'modal.add_btn':    { en: 'Add Track 🎵',       fr: 'Ajouter 🎵',           es: 'Añadir 🎵'               },
  'modal.upload_btn': { en: 'Upload 📤',          fr: 'Importer 📤',           es: 'Subir 📤'                },
  'modal.file_label': { en: 'Audio File * (max 20 MB)', fr: 'Fichier audio * (max 20 Mo)', es: 'Archivo de audio * (máx. 20 MB)' },
  'modal.select_type':{ en: 'Select…',            fr: 'Choisir…',              es: 'Seleccionar…'            },
  'modal.lullaby':    { en: '🎵 Lullaby',         fr: '🎵 Berceuse',           es: '🎵 Canción de cuna'      },
  'modal.story':      { en: '📖 Story',           fr: '📖 Histoire',           es: '📖 Cuento'               },
  'modal.adding':     { en: '⏳ Adding…',         fr: '⏳ Ajout…',             es: '⏳ Añadiendo…'            },
  'modal.uploading':  { en: '⏳ Uploading…',      fr: '⏳ Import…',            es: '⏳ Subiendo…'             },

  // ── YouTube player ────────────────────────────────────────────────────────
  'yt_modal.now_playing': { en: 'Now Playing',    fr: 'En cours de lecture',   es: 'Reproduciendo'           },
  'yt_modal.add_pl':  { en: '📋 Add to Playlist', fr: '📋 Ajouter à une liste', es: '📋 Añadir a lista'      },
  'yt.error_title':   { en: 'Embedding disabled', fr: 'Intégration désactivée', es: 'Inserción desactivada'  },
  'yt.error_desc':    { en: 'The video owner has disabled playback outside YouTube.', fr: 'Le propriétaire a désactivé la lecture hors YouTube.', es: 'El propietario ha desactivado la reproducción fuera de YouTube.' },
  'yt.open_youtube':  { en: 'Open on YouTube',    fr: 'Ouvrir sur YouTube',    es: 'Abrir en YouTube'        },

  'yt.testing':    { en: 'Testing…',           fr: 'Test en cours…',         es: 'Probando…'                },
  'yt.embeddable': { en: 'Embeddable!',         fr: 'Intégrable !',           es: '¡Insertable!'             },
  'yt.still_save': { en: 'You can still save it — users will open it on YouTube.', fr: 'Vous pouvez quand même le sauvegarder — les utilisateurs l\'ouvriront sur YouTube.', es: 'Puedes guardarlo igualmente — los usuarios lo abrirán en YouTube.' },
  'yt.embed_warning': { en: '⚠️ Some videos disable embedding — they will open on YouTube instead.', fr: '⚠️ Certaines vidéos désactivent l\'intégration — elles s\'ouvriront sur YouTube.', es: '⚠️ Algunos vídeos desactivan la inserción — se abrirán en YouTube.' },

  // ── Toasts ────────────────────────────────────────────────────────────────
  'toast.track_added':    { en: '🎵 Track added!',     fr: '🎵 Piste ajoutée !',  es: '🎵 ¡Pista añadida!'   },
  'toast.uploaded':       { en: '📤 Uploaded!',         fr: '📤 Importé !',        es: '📤 ¡Subido!'          },
  'toast.deleted':        { en: 'Track deleted.',       fr: 'Piste supprimée.',    es: 'Pista eliminada.'     },
  'toast.pl_added':       { en: 'Added to playlist! 📋', fr: 'Ajouté à la liste ! 📋', es: '¡Añadido a la lista! 📋' },
  'toast.favs_fail':      { en: 'Failed to load favourites', fr: 'Erreur favoris', es: 'Error al cargar favoritos' },
  'toast.create_pl_first':{ en: 'Create a playlist first!', fr: 'Créez d\'abord une liste !', es: '¡Crea una lista primero!' },

  // ── Empty states ──────────────────────────────────────────────────────────
  'empty.no_results': { en: 'No results',         fr: 'Aucun résultat',      es: 'Sin resultados'          },
  'empty.nothing':    { en: 'Nothing here yet',   fr: 'Rien pour l\'instant',  es: 'Nada por aquí aún'       },
  'empty.add_first':  { en: 'Add your first track or explore another section.', fr: 'Ajoutez votre première piste.', es: 'Añade tu primera pista.' },
  'empty.no_content': { en: 'Failed to load content', fr: 'Erreur de chargement', es: 'Error al cargar'      },

  // ── Plan ─────────────────────────────────────────────────────────────────
  'plan.free':         { en: '🌙 Free Plan',      fr: '🌙 Gratuit',            es: '🌙 Plan gratuito'        },
  'plan.premium':      { en: '⭐ Premium',        fr: '⭐ Premium',             es: '⭐ Premium'              },
  'plan.free_badge':   { en: 'Free Plan',         fr: 'Plan gratuit',          es: 'Plan gratuito'           },
  'plan.premium_badge':{ en: '⭐ Premium',        fr: '⭐ Premium',             es: '⭐ Premium'              },

  // ── Login ─────────────────────────────────────────────────────────────────
  'login.title':       { en: 'Welcome back 👋',   fr: 'Bon retour 👋',         es: 'Bienvenido de nuevo 👋'  },
  'login.subtitle':    { en: 'Sign in to continue your bedtime journey.', fr: 'Connectez-vous pour continuer.', es: 'Inicia sesión para continuar.' },
  'login.email':       { en: 'Email address',     fr: 'Adresse e-mail',        es: 'Correo electrónico'      },
  'login.password':    { en: 'Password',          fr: 'Mot de passe',          es: 'Contraseña'              },
  'login.btn':         { en: 'Sign In',           fr: 'Se connecter',          es: 'Iniciar sesión'          },
  'login.no_account':  { en: "Don't have an account?", fr: "Pas encore de compte ?", es: '¿No tienes cuenta?' },
  'login.create':      { en: 'Create one free →', fr: 'Créer un compte →',     es: 'Crear una gratis →'      },
  'login.redirecting': { en: 'Welcome back! Redirecting…', fr: 'Bienvenue ! Redirection…', es: '¡Bienvenido! Redirigiendo…' },
  'login.error_fields':{ en: 'Please fill in all fields.', fr: 'Veuillez remplir tous les champs.', es: 'Por favor rellena todos los campos.' },
  'login.error_invalid':{ en: 'Invalid email or password.', fr: 'Email ou mot de passe incorrect.', es: 'Email o contraseña incorrectos.' },

  // ── Register ──────────────────────────────────────────────────────────────
  'register.title':    { en: 'Create your account ✨', fr: 'Créer votre compte ✨', es: 'Crear tu cuenta ✨' },
  'register.subtitle': { en: 'It only takes a moment.', fr: 'Cela ne prend qu\'un instant.', es: 'Solo toma un momento.' },
  'register.name':     { en: 'Your name',         fr: 'Votre prénom',          es: 'Tu nombre'               },
  'register.email':    { en: 'Email address',     fr: 'Adresse e-mail',        es: 'Correo electrónico'      },
  'register.password': { en: 'Password',          fr: 'Mot de passe',          es: 'Contraseña'              },
  'register.pw_hint':  { en: 'At least 8 characters', fr: 'Au moins 8 caractères', es: 'Al menos 8 caracteres' },
  'register.plan':     { en: 'Choose your plan',  fr: 'Choisissez votre plan', es: 'Elige tu plan'           },
  'register.btn':      { en: 'Create Account',    fr: 'Créer le compte',       es: 'Crear cuenta'            },
  'register.has_account': { en: 'Already have an account?', fr: 'Déjà un compte ?', es: '¿Ya tienes cuenta?' },
  'register.signin':   { en: 'Sign in →',         fr: 'Se connecter →',        es: 'Iniciar sesión →'        },
  'register.success':  { en: 'Account created! Redirecting…', fr: 'Compte créé ! Redirection…', es: '¡Cuenta creada! Redirigiendo…' },
  'register.pw_short': { en: 'Password must be at least 8 characters.', fr: 'Mot de passe trop court (8 min).', es: 'La contraseña debe tener al menos 8 caracteres.' },
  'pw.weak':           { en: 'Weak',              fr: 'Faible',                es: 'Débil'                   },
  'pw.fair':           { en: 'Fair',              fr: 'Correct',               es: 'Regular'                 },
  'pw.good':           { en: 'Good',              fr: 'Bien',                  es: 'Buena'                   },
  'pw.strong':         { en: 'Strong 💪',         fr: 'Fort 💪',               es: 'Fuerte 💪'               },

  // ── Landing ───────────────────────────────────────────────────────────────
  'landing.badge':     { en: '🌙 Audio-only · Safe for children', fr: '🌙 Audio uniquement · Sécurisé pour les enfants', es: '🌙 Solo audio · Seguro para niños' },
  'landing.h1a':       { en: 'Where Little Dreams',  fr: 'Là où les Rêves',    es: 'Donde los Sueños'        },
  'landing.h1b':       { en: 'Come Alive',           fr: 'Prennent Vie',        es: 'Cobran Vida'             },
  'landing.cta':       { en: 'Start for Free ✨',    fr: 'Commencer gratuitement ✨', es: 'Comenzar gratis ✨' },
  'landing.signin':    { en: 'I have an account',    fr: 'J\'ai déjà un compte', es: 'Ya tengo cuenta'       },
  'landing.get_started': { en: 'Get Started Free',  fr: 'Commencer gratuitement', es: 'Comenzar gratis'      },
  'landing.features':  { en: 'Everything you need for bedtime 💫', fr: 'Tout pour l\'heure du coucher 💫', es: 'Todo para la hora de dormir 💫' },
  'landing.cta2':      { en: 'Ready for peaceful bedtimes? 🌙', fr: 'Prêt pour des nuits paisibles ? 🌙', es: '¿Listo para noches tranquilas? 🌙' },
  'landing.cta2_btn':  { en: 'Create Free Account', fr: 'Créer un compte gratuit', es: 'Crear cuenta gratuita' },
  'landing.h1a':       { en: 'Where Little Dreams',  fr: 'Là où les Rêves',    es: 'Donde los Sueños'        },
  'landing.h1b':       { en: 'Come Alive',           fr: 'Prennent Vie',        es: 'Cobran Vida'             },

  // ── Admin ─────────────────────────────────────────────────────────────────
  'admin.title':       { en: '⚙️ Admin Panel',    fr: '⚙️ Panneau admin',      es: '⚙️ Panel de administración' },
  'admin.overview':    { en: 'Overview',          fr: 'Vue d\'ensemble',        es: 'Resumen'                 },
  'admin.all_audio':   { en: 'All Audio',         fr: 'Tout l\'audio',          es: 'Todo el audio'           },
  'admin.users':       { en: 'Users',             fr: 'Utilisateurs',           es: 'Usuarios'                },
  'admin.total_tracks':{ en: '🎵 Total Tracks',   fr: '🎵 Pistes au total',     es: '🎵 Pistas totales'       },
  'admin.total_users': { en: '👥 Users',          fr: '👥 Utilisateurs',        es: '👥 Usuarios'             },
  'admin.total_favs':  { en: '❤️ Favourites',     fr: '❤️ Favoris',             es: '❤️ Favoritos'            },

  // ── Playlists ─────────────────────────────────────────────────────────────
  'pl.title':          { en: '📋 My Playlists',   fr: '📋 Mes playlists',       es: '📋 Mis listas'           },
  'pl.new_btn':        { en: '+ New Playlist',    fr: '+ Nouvelle liste',       es: '+ Nueva lista'           },
  'pl.new_label':      { en: 'New Playlist',      fr: 'Nouvelle playlist',      es: 'Nueva lista'             },
  'pl.modal_title':    { en: '📋 New Playlist',   fr: '📋 Nouvelle playlist',   es: '📋 Nueva lista'          },
  'pl.name_label':     { en: 'Playlist Name *',   fr: 'Nom de la liste *',      es: 'Nombre de la lista *'    },
  'pl.name_ph':        { en: 'e.g. Bedtime Classics', fr: 'ex. Classiques du soir', es: 'ej. Clásicos para dormir' },
  'pl.desc_label':     { en: 'Description',       fr: 'Description',            es: 'Descripción'             },
  'pl.create_btn':     { en: 'Create Playlist 📋', fr: 'Créer la liste 📋',     es: 'Crear lista 📋'          },
  'pl.play_all':       { en: '▶ Play All',        fr: '▶ Tout lire',            es: '▶ Reproducir todo'       },
  'pl.delete':         { en: '🗑️ Delete',         fr: '🗑️ Supprimer',           es: '🗑️ Eliminar'             },
  'pl.back':           { en: '← Back',            fr: '← Retour',               es: '← Volver'                },
  'pl.empty':          { en: 'No tracks yet. Go to the dashboard and add some!', fr: 'Aucune piste. Allez au tableau de bord !', es: 'Sin pistas. ¡Ve al panel y añade algunas!' },
  'pl.created':        { en: 'Playlist created! 🎉', fr: 'Liste créée ! 🎉',    es: '¡Lista creada! 🎉'       },
  'pl.deleted':        { en: 'Playlist deleted.',  fr: 'Liste supprimée.',      es: 'Lista eliminada.'        },
  'pl.track_removed':  { en: 'Track removed.',     fr: 'Piste retirée.',        es: 'Pista eliminada.'        },
  'pl.confirm_delete': { en: 'Delete "{name}"?',   fr: 'Supprimer « {name} » ?', es: '¿Eliminar "{name}"?'   },
  'pl.tracks':         { en: 'track',              fr: 'piste',                 es: 'pista'                   },
  'pl.tracks_plural':  { en: 'tracks',             fr: 'pistes',                es: 'pistas'                  },

  // ── Profile ───────────────────────────────────────────────────────────────
  'profile.edit_btn':      { en: 'Edit Profile',         fr: 'Modifier le profil',    es: 'Editar perfil'             },
  'profile.change_pw_btn': { en: 'Change Password',       fr: 'Changer le mot de passe', es: 'Cambiar contraseña'       },
  'pl.reorder_saved':      { en: 'Order saved.',           fr: 'Ordre sauvegardé.',       es: 'Orden guardado.'           },
  'profile.title':     { en: 'My Profile',        fr: 'Mon profil',             es: 'Mi perfil'               },
  'profile.usage':     { en: '📊 Plan Usage',     fr: '📊 Utilisation',         es: '📊 Uso del plan'         },
  'profile.upgrade':   { en: '⭐ Go Premium',     fr: '⭐ Passer Premium',       es: '⭐ Ir a Premium'         },
  'profile.upgrade_btn': { en: 'Upgrade Now ✨',  fr: 'Mettre à niveau ✨',      es: 'Actualizar ahora ✨'      },
  'profile.my_uploads':{ en: '📤 My Uploads',     fr: '📤 Mes ajouts',          es: '📤 Mis subidas'          },
  'profile.add_track': { en: '+ Add Track',       fr: '+ Ajouter une piste',   es: '+ Añadir pista'          },
  'profile.lullabies_added': { en: '🎵 Lullabies Added', fr: '🎵 Berceuses ajoutées', es: '🎵 Canciones añadidas' },
  'profile.stories_added':   { en: '📖 Stories Added',   fr: '📖 Histoires ajoutées', es: '📖 Cuentos añadidos'   },
  'profile.favourites':{ en: '❤️ Favourites',     fr: '❤️ Favoris',             es: '❤️ Favoritos'            },
  'profile.no_uploads':{ en: 'No uploads yet',    fr: 'Aucun ajout pour l\'instant', es: 'Sin subidas aún'    },
  'profile.go_dashboard': { en: 'Go to dashboard to add your first track.', fr: 'Allez au tableau de bord pour ajouter une piste.', es: 'Ve al panel para añadir tu primera pista.' },

  // ── Child profiles ────────────────────────────────────────────────────────
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
  'child.active_label':  { en: 'Currently selected',  fr: 'Profil sélectionné',    es: 'Perfil seleccionado'      },
  'child.clear_btn':     { en: 'Clear',               fr: 'Effacer',               es: 'Quitar'                   },
  'child.active_tag':    { en: 'Active',              fr: 'Actif',                 es: 'Activo'                   },
  'child.select_btn':    { en: 'Select',              fr: 'Choisir',               es: 'Seleccionar'              },
  'child.edit_btn':      { en: 'Edit',                fr: 'Modifier',              es: 'Editar'                   },
  'child.years':         { en: 'years old',           fr: 'ans',                   es: 'años'                     },
  'child.selected':      { en: 'Profile selected',    fr: 'Profil sélectionné',    es: 'Perfil seleccionado'      },
  'child.cleared':       { en: 'Profile cleared',     fr: 'Profil effacé',         es: 'Perfil quitado'           },
  'child.created':       { en: 'Profile created! 🎉', fr: 'Profil créé ! 🎉',      es: '¡Perfil creado! 🎉'       },
  'child.updated':       { en: 'Profile updated.',    fr: 'Profil mis à jour.',    es: 'Perfil actualizado.'      },
  'child.deleted':       { en: 'Profile deleted.',    fr: 'Profil supprimé.',      es: 'Perfil eliminado.'        },
  'child.confirm_delete':{ en: 'Delete this child profile?', fr: 'Supprimer ce profil ?', es: '¿Eliminar este perfil?' },
  'child.name_required': { en: 'Name is required.',   fr: 'Le prénom est requis.', es: 'El nombre es obligatorio.' },

  // ── Recently played ───────────────────────────────────────────────────────
  'recent.title':        { en: '🕐 Recently Played',  fr: '🕐 Récemment écouté',  es: '🕐 Escuchado recientemente' },
  'recent.empty':        { en: 'Nothing played yet — start exploring!', fr: 'Rien pour l\'instant !', es: '¡Nada aún — comienza a explorar!' },

  // ── Onboarding ────────────────────────────────────────────────────────────
  'onboard.welcome':     { en: 'Welcome to TimeKids! 🌙', fr: 'Bienvenue sur TimeKids ! 🌙', es: '¡Bienvenido a TimeKids! 🌙' },
  'onboard.sub':         { en: "Let's set up your first bedtime library.", fr: "Créons votre première bibliothèque.", es: "Vamos a crear tu primera biblioteca." },
  'onboard.step1':       { en: '1. Browse the library', fr: '1. Parcourez la bibliothèque', es: '1. Explora la biblioteca' },
  'onboard.step1_desc':  { en: 'Tap any card to start listening instantly.', fr: 'Appuyez sur une carte pour écouter.', es: 'Toca cualquier tarjeta para escuchar.' },
  'onboard.step2':       { en: '2. Add your own tracks', fr: '2. Ajoutez vos propres pistes', es: '2. Añade tus propias pistas' },
  'onboard.step2_desc':  { en: 'Paste a YouTube link or upload an MP3.', fr: 'Collez un lien YouTube ou importez un MP3.', es: 'Pega un enlace de YouTube o sube un MP3.' },
  'onboard.step3':       { en: '3. Create child profiles', fr: '3. Créez des profils enfants', es: '3. Crea perfiles para tus hijos' },
  'onboard.step3_desc':  { en: 'Switch between profiles for each child.', fr: 'Basculez entre les profils.', es: 'Cambia entre perfiles para cada niño.' },
  'onboard.start':       { en: 'Start Exploring ✨',   fr: 'Commencer ✨',           es: 'Empezar ✨'               },

  // ── Forgot / Reset password ────────────────────────────────────────────────
  'forgot.link':          { en: 'Forgot password?',       fr: 'Mot de passe oublié ?',    es: '¿Olvidaste tu contraseña?'  },
  'forgot.title':         { en: 'Reset your password 🔑', fr: 'Réinitialisez votre mot de passe 🔑', es: 'Restablecer contraseña 🔑' },
  'forgot.subtitle':      { en: "We'll send a reset link to your email.", fr: 'Nous vous enverrons un lien de réinitialisation.', es: 'Te enviaremos un enlace de restablecimiento.' },
  'forgot.send_btn':      { en: 'Send Reset Link',        fr: 'Envoyer le lien',          es: 'Enviar enlace'               },
  'forgot.sent_title':    { en: 'Check your inbox!',      fr: 'Vérifiez votre boîte mail !', es: '¡Revisa tu bandeja!'      },
  'forgot.sent_desc':     { en: "We've sent a reset link. It expires in 1 hour.", fr: "Nous avons envoyé un lien (valable 1 heure).", es: "Hemos enviado el enlace (válido 1 hora)." },
  'forgot.back_login':    { en: '← Back to Login',        fr: '← Retour à la connexion',  es: '← Volver al inicio'         },

  'reset.title':          { en: 'Set new password 🔑',    fr: 'Nouveau mot de passe 🔑',   es: 'Nueva contraseña 🔑'         },
  'reset.subtitle':       { en: 'Enter your new password below.', fr: 'Entrez votre nouveau mot de passe ci-dessous.', es: 'Ingresa tu nueva contraseña.' },
  'reset.new_pw':         { en: 'New Password',           fr: 'Nouveau mot de passe',      es: 'Nueva contraseña'            },
  'reset.confirm_pw':     { en: 'Confirm Password',       fr: 'Confirmer le mot de passe', es: 'Confirmar contraseña'        },
  'reset.btn':            { en: 'Update Password',        fr: 'Mettre à jour',             es: 'Actualizar contraseña'       },
  'reset.mismatch':       { en: "Passwords don't match.", fr: 'Les mots de passe ne correspondent pas.', es: 'Las contraseñas no coinciden.' },
  'reset.success':        { en: 'Password updated! Redirecting to login…', fr: 'Mot de passe mis à jour ! Redirection…', es: '¡Contraseña actualizada! Redirigiendo…' },

  // ── Settings ───────────────────────────────────────────────────────────────
  'settings.nav':               { en: 'Settings',              fr: 'Paramètres',              es: 'Configuración'               },
  'settings.title':             { en: '⚙️ Settings',           fr: '⚙️ Paramètres',            es: '⚙️ Configuración'            },
  'settings.profile_section':   { en: 'Profile Information',   fr: 'Informations de profil',  es: 'Información del perfil'      },
  'settings.email_label':       { en: 'Email (read-only)',      fr: 'Email (lecture seule)',   es: 'Email (solo lectura)'        },
  'settings.save_profile':      { en: 'Save Name',             fr: 'Enregistrer le nom',      es: 'Guardar nombre'              },
  'settings.saved':             { en: 'Saved!',                fr: 'Enregistré !',             es: '¡Guardado!'                  },
  'settings.password_section':  { en: 'Change Password',       fr: 'Changer le mot de passe', es: 'Cambiar contraseña'          },
  'settings.current_pw':        { en: 'Current Password',      fr: 'Mot de passe actuel',     es: 'Contraseña actual'           },
  'settings.save_password':     { en: 'Update Password',       fr: 'Mettre à jour',           es: 'Actualizar contraseña'       },
  'settings.pw_updated':        { en: 'Password updated successfully.', fr: 'Mot de passe mis à jour.', es: 'Contraseña actualizada.'  },
  'settings.language_desc':     { en: 'Choose the language for the entire app.', fr: 'Choisissez la langue de l\'application.', es: 'Elige el idioma de la aplicación.' },
  'settings.appearance':        { en: 'Appearance',            fr: 'Apparence',               es: 'Apariencia'                  },
  'settings.theme_desc':        { en: 'Switch between light and dark mode.', fr: 'Basculez entre les modes clair et sombre.', es: 'Cambia entre modo claro y oscuro.' },
  'settings.light_mode':        { en: 'Light',                 fr: 'Clair',                   es: 'Claro'                       },
  'settings.dark_mode':         { en: 'Dark',                  fr: 'Sombre',                  es: 'Oscuro'                      },
  'settings.danger_zone':       { en: 'Danger Zone',           fr: 'Zone de danger',          es: 'Zona de peligro'             },
  'settings.delete_desc':       { en: 'Permanently delete your account and all data. This cannot be undone.', fr: 'Supprimer définitivement votre compte. Irréversible.', es: 'Eliminar tu cuenta permanentemente. No se puede deshacer.' },
  'settings.delete_btn':        { en: '🗑️ Delete My Account',  fr: '🗑️ Supprimer mon compte', es: '🗑️ Eliminar mi cuenta'        },
  'settings.delete_confirm_title': { en: 'Delete Account',    fr: 'Supprimer le compte',     es: 'Eliminar cuenta'             },
  'settings.delete_confirm_desc':  { en: 'This will permanently delete your account, uploads, playlists, and favourites. Enter your password to confirm.', fr: 'Cela supprimera définitivement votre compte. Entrez votre mot de passe pour confirmer.', es: 'Esto eliminará permanentemente tu cuenta. Ingresa tu contraseña para confirmar.' },
  'settings.confirm_pw_label':  { en: 'Your Password',        fr: 'Votre mot de passe',      es: 'Tu contraseña'               },


  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  'kbd.title':      { en: 'Keyboard Shortcuts',     fr: 'Raccourcis clavier',       es: 'Atajos de teclado'         },
  'kbd.play_pause': { en: 'Play / Pause',            fr: 'Lecture / Pause',          es: 'Reproducir / Pausar'       },
  'kbd.seek':       { en: 'Seek −10s / +10s',        fr: 'Avancer/reculer −10s',     es: 'Avanzar/retroceder −10s'   },
  'kbd.prev':       { en: 'Previous track',           fr: 'Piste précédente',         es: 'Pista anterior'            },
  'kbd.next':       { en: 'Next track',               fr: 'Piste suivante',           es: 'Pista siguiente'           },
  'kbd.volume':     { en: 'Volume up / down',         fr: 'Volume +/−',               es: 'Volumen +/−'               },
  'kbd.mute':       { en: 'Toggle mute',              fr: 'Couper/activer le son',    es: 'Silenciar/activar sonido'  },
  'kbd.help':       { en: 'Show / hide this help',    fr: 'Afficher/masquer l\'aide', es: 'Mostrar/ocultar esta ayuda' },
  // ── Generic ───────────────────────────────────────────────────────────────
  'delete.confirm':    { en: 'Delete this track?',    fr: 'Supprimer cette piste ?', es: '¿Eliminar esta pista?' },
  'error.generic':     { en: 'Something went wrong.', fr: 'Une erreur est survenue.', es: 'Algo salió mal.'      },

  // ── 404 ───────────────────────────────────────────────────────────────────
  '404.h1':            { en: 'Lost in dreamland…',    fr: 'Perdu dans les rêves…',  es: 'Perdido en el país de los sueños…' },
  '404.desc':          { en: 'This page has drifted off to sleep.', fr: 'Cette page s\'est endormie.', es: 'Esta página se ha dormido.' },
  '404.home':          { en: '🏠 Go Home',            fr: '🏠 Accueil',             es: '🏠 Inicio'               },
  '404.back':          { en: '← Go Back',             fr: '← Retour',               es: '← Volver'                },

  // ─── Reset Password — Lien invalide ────────────────────────────────────
  'reset.invalid_title': {
    en: 'Invalid or expired link',
    fr: 'Lien invalide ou expiré',
    es: 'Enlace inválido o expirado',
  },
  'reset.invalid_desc': {
    en: 'This reset link has expired or is invalid. Please request a new one.',
    fr: 'Ce lien a expiré ou est invalide. Veuillez en demander un nouveau.',
    es: 'Este enlace ha expirado o es inválido. Por favor solicita uno nuevo.',
  },
  'reset.invalid_link': {
    en: 'Request New Link',
    fr: 'Demander un nouveau lien',
    es: 'Solicitar nuevo enlace',
  },

  // ─── Forgot Password — Panneau gauche ────────────────────────────────
  'forgot.panel_title_part1': {
    en: 'No worries',
    fr: 'Pas de souci',
    es: 'No te preocupes',
  },
  'forgot.panel_title_part2': {
    en: 'it happens 🌙',
    fr: 'c\'arrive à tout le monde 🌙',
    es: 'le pasa a todo el mundo 🌙',
  },
  'forgot.panel_desc': {
    en: 'Enter your email address and we\'ll send you a link to reset your password.',
    fr: 'Entrez votre adresse e-mail et nous vous enverrons un lien de réinitialisation.',
    es: 'Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.',
  },
  'forgot.feature_inbox': {
    en: 'Check your inbox after submitting',
    fr: 'Vérifiez votre boîte de réception après soumission',
    es: 'Revisa tu bandeja después de enviar',
  },
  'forgot.feature_expiry': {
    en: 'Link expires in 1 hour',
    fr: 'Le lien expire dans 1 heure',
    es: 'El enlace expira en 1 hora',
  },
  'forgot.feature_secure': {
    en: 'Secure reset via Supabase',
    fr: 'Réinitialisation sécurisée via Supabase',
    es: 'Restablecimiento seguro a través de Supabase',
  },
};

// ── Core engine ────────────────────────────────────────────────────────────

const STORAGE_KEY = 'tk_lang';

export function getLang() {
  return localStorage.getItem(STORAGE_KEY) || 'en';
}

export function setLang(code) {
  if (!LANGUAGES[code]) return;
  localStorage.setItem(STORAGE_KEY, code);
  document.documentElement.lang = code;
  applyTranslations();
  window.dispatchEvent(new CustomEvent('langchange', { detail: { lang: code } }));
}

export function t(key, vars = {}) {
  const lang  = getLang();
  const entry = TRANSLATIONS[key];
  if (!entry) { console.warn(`[i18n] Missing key: "${key}"`); return key; }
  let str = entry[lang] ?? entry['en'] ?? key;
  for (const [k, v] of Object.entries(vars)) {
    str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
  }
  return str;
}

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
}

// ── Language Switcher Widget ───────────────────────────────────────────────

// Track which elements have the close-on-outside-click listener, to avoid duplicates
const _closerAttached = new WeakSet();

export function renderLanguageSwitcher(target) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return;

  const current = getLang();
  const lang    = LANGUAGES[current];

  el.innerHTML = `
    <div class="lang-switcher" role="navigation" aria-label="Language selector">
      <button class="lang-current" aria-haspopup="listbox" aria-expanded="false" title="${t('language.label')}">
        <span class="lang-flag" aria-hidden="true">${lang.flag}</span>
        <span class="lang-current-label">${lang.label}</span>
        <span class="lang-caret" aria-hidden="true">▾</span>
      </button>
      <div class="lang-dropdown" role="listbox" aria-label="Select language">
        ${Object.entries(LANGUAGES).map(([code, meta]) => `
          <button class="lang-opt ${code === current ? 'active' : ''}"
            data-lang="${code}"
            role="option"
            aria-selected="${code === current}"
            title="${meta.label}">
            <span class="lang-flag">${meta.flag}</span>
            <span class="lang-name">${meta.label}</span>
            ${code === current ? '<span class="lang-check">✓</span>' : ''}
          </button>`).join('')}
      </div>
    </div>`;

  const btn      = el.querySelector('.lang-current');
  const dropdown = el.querySelector('.lang-dropdown');

  // Toggle dropdown
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const isOpen = dropdown.classList.contains('open');
    dropdown.classList.toggle('open', !isOpen);
    btn.setAttribute('aria-expanded', String(!isOpen));
  });

  // Option click
  el.querySelectorAll('.lang-opt').forEach(opt => {
    opt.addEventListener('click', e => {
      e.stopPropagation();
      setLang(opt.dataset.lang);
      // Re-render to update active state
      renderLanguageSwitcher(el);
      dropdown.classList.remove('open');
    });
  });

  // Close on outside click (attach only once per document)
  if (!_closerAttached.has(document)) {
    document.addEventListener('click', () => {
      document.querySelectorAll('.lang-dropdown.open').forEach(d => {
        d.classList.remove('open');
        const parent = d.closest('.lang-switcher');
        if (parent) parent.querySelector('.lang-current')?.setAttribute('aria-expanded', 'false');
      });
    });
    _closerAttached.add(document);
  }
}

// Auto-apply translations when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    applyTranslations();
    document.documentElement.lang = getLang();
  });
} else {
  applyTranslations();
  document.documentElement.lang = getLang();
}
