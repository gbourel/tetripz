# Tetripz 🎮

Un jeu de blocs façon Tetris, en **HTML, CSS et JavaScript vanilla**. Aucun framework, aucune dépendance.

## Pour tester

Le jeu est disponible ici : [https://gbourel.github.io/tetripz/](https://gbourel.github.io/tetripz/)

## Jouer

Ouvrez `index.html` dans votre navigateur. Cliquez sur **JOUER**.

| Touche | Action |
| --- | --- |
| ← / → | Déplacer la pièce |
| ↑ | Tourner |
| ↓ | Descendre plus vite |
| Espace | Chute instantanée |
| P | Pause / reprendre |
| R | Recommencer |

Des boutons tactiles sont disponibles sur mobile. Le bouton **MENU**, à côté de **PAUSE**, permet de quitter une partie en cours (même en pause) et de choisir un autre niveau sans perdre le record.

## Fonctionnalités

- Sept pièces et tirage aléatoire par sac de 7
- Pièce fantôme et aperçu de la prochaine pièce
- Score, lignes, niveaux, accélération progressive
- Meilleur score enregistré localement
- Design néon responsive
- Retour au menu depuis une partie en cours ou en pause, sans effacer le meilleur score
- Un seul sélecteur de niveau dans l'ordre : 0 (jeu normal sans effet), puis 1 (houle douce) à 4 (houle extrême)
- Houle, zoom aléatoire et effet de vision double uniquement pour les niveaux 1 à 4
- Rotation très prononcée au niveau 3 et tours complets, avec vitesse ondulante et sens aléatoire, au niveau 4
- Vision multiple : une copie translucide aux niveaux 1 et 2 ; aux niveaux 3 et 4, jusqu'à trois copies (vision triple ou quadruple) apparaissent et disparaissent aléatoirement, plus souvent au niveau 4. Chaque copie a des mouvements, un zoom, une teinte, une saturation et une opacité indépendants, distincts du plateau réel
- Couleurs des briques du jeu et de l'aperçu variant progressivement en teinte et saturation aux niveaux 3 et 4 (plus vite et plus fortement au niveau 4)
- Carrés légèrement élastiques : rebond, rotation discrète, côtés courbés et coins s'arrondissant au fil du temps, indépendamment pour chaque carré, aux niveaux 2 à 4
- Classement mondial Top 10 par niveau d'effets : publication **facultative** proposée uniquement après une partie battant le record personnel ; le pseudo n'est demandé qu'après avoir choisi « PUBLIER MON RECORD »

## Activer le classement mondial (Supabase)

Le classement est prêt côté jeu, mais **reste désactivé tant que Supabase n'est pas configuré**. Le jeu, le record local et les autres effets continuent de fonctionner sans lui.

1. Créer/sélectionner un projet dans [Supabase](https://supabase.com/dashboard).
2. Exécuter le fichier [`supabase/leaderboard.sql`](supabase/leaderboard.sql) dans **SQL Editor**. Il crée la table `public.scores`, son index et les règles RLS pour la lecture publique et l'envoi anonyme.
3. Copier l'URL de ce projet (`https://<ref>.supabase.co`) et sa clé **publishable** (`sb_publishable_...`) depuis le tableau de bord Supabase.
4. Renseigner uniquement les constantes `SUPABASE_URL` et `SUPABASE_PUBLISHABLE_KEY` en haut de `script.js`, puis publier le jeu. **Ne jamais inclure une clé secrète ou `service_role` dans GitHub Pages.**
5. Vérifier le classement avec **CLASSEMENT**, puis faire une partie battant son record local et choisir **PUBLIER MON RECORD**. Aucun pseudo n'est demandé avant ce choix ; le jeu n'envoie jamais de score automatiquement.

Le Top 10 est séparé pour chacun des cinq niveaux d'effets (0 à 4). Le record local s'enregistre toujours automatiquement dans `localStorage`, qu'il soit publié ou non. La saisie du pseudo est optionnelle et il n'y a pas de création de compte.

**Limite de sécurité :** sans compte ni validation côté serveur, un score envoyé par le navigateur peut être truqué, et la table peut être spammée. Les permissions de base empêchent la modification/suppression par les visiteurs et valident le format, mais **ne prouvent pas** la réalité d'une partie ; prévoir des protections serveur si le classement devient compétitif.

## Version du jeu

Version actuelle : **v1.9.0** (proposition de publication volontaire des nouveaux records et classement mondial par niveau).

Le numéro de version est affiché discrètement dans le pied de page du jeu et défini dans `index.html` (élément `#app-version`).

**À chaque modification publiée du jeu**, incrémenter la version dans `index.html` et mettre à jour la version indiquée ici :
- Correctif ou petit ajustement : `1.0.0 → 1.0.1`
- Nouvelle fonctionnalité : `1.0.1 → 1.1.0`
- Changement majeur : `1.1.0 → 2.0.0`

Cette incrémentation est une convention de maintenance : elle doit être appliquée à chaque prochaine modification, elle n'est pas automatique.

## Licence

Projet de démonstration, libre à adapter pour un usage personnel.
