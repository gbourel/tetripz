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
- Meilleur score enregistré localement **par niveau d'effets (0 à 4)**
- Design néon responsive
- Retour au menu depuis une partie en cours ou en pause, sans effacer le meilleur score
- Un seul sélecteur de niveau dans l'ordre : 0 (jeu normal sans effet), puis 1 (houle douce) à 4 (houle extrême)
- Houle, zoom aléatoire et effet de vision double uniquement pour les niveaux 1 à 4
- Rotation très prononcée au niveau 3 et tours complets, avec vitesse ondulante et sens aléatoire, au niveau 4
- Vision multiple : une copie translucide aux niveaux 1 et 2 ; aux niveaux 3 et 4, jusqu'à trois copies (vision triple ou quadruple) apparaissent et disparaissent aléatoirement, plus souvent au niveau 4. Chaque copie a des mouvements, un zoom, une teinte, une saturation et une opacité indépendants, distincts du plateau réel
- Couleurs des briques du jeu et de l'aperçu variant progressivement en teinte et saturation aux niveaux 3 et 4 (plus vite et plus fortement au niveau 4)
- Carrés légèrement élastiques : rebond, rotation discrète, côtés courbés et coins s'arrondissant au fil du temps, indépendamment pour chaque carré, aux niveaux 2 à 4
- Classement mondial Top 10 par niveau d'effets : publication **facultative** proposée uniquement après une partie battant le record personnel ; le pseudo n'est demandé qu'après avoir choisi « PUBLIER MON RECORD »

## Classement mondial

Le Top 10 est séparé pour chacun des cinq niveaux d'effets (0 à 4). Le record local s'enregistre automatiquement et **séparément pour chaque difficulté** (`tetripz-best-0` à `tetripz-best-4`), qu'il soit publié ou non. Le pseudo reste facultatif, seulement après un nouveau record du niveau choisi.

L'ancien record commun (`tetripz-best`) est conservé dans le navigateur sans être attribué à un niveau précis, car sa difficulté d'origine est inconnue. Les records par niveau commencent à zéro si aucun score correspondant n'était déjà enregistré.

## Version du jeu

Version actuelle : **v1.10.0** (record local distinct pour chaque niveau de difficulté, avec affichage et publication adaptés).

## Licence

Projet de démonstration, libre à adapter pour un usage personnel.
