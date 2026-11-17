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
- Bande-son en boucle avec bouton pour l'activer ou l'arrêter, et volume réglable (mémorisé dans le navigateur)
- Thème arcade psychédélique et responsive : tétriminos décoratifs, quadrillage, reflets multicolores, panneaux néon et animations respectant « réduire les animations ».
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

## Musique de fond

Le jeu lit la musique `tetripz.mp3` en boucle pendant les parties (pause et fin de partie : arrêt temporaire). Le son ne démarre qu'après le clic **JOUER**, conformément aux restrictions des navigateurs. Le bouton **COUPER / ACTIVER** et le curseur de volume restent disponibles sur ordinateur et mobile. Les préférences `tetripz-music` et `tetripz-volume` sont conservées dans `localStorage`.

**Déploiement du MP3 :** le fichier audio joint doit être placé à la **racine du dépôt GitHub**, sous le nom exact `tetripz.mp3` (à côté de `index.html`). Le code et l'interface peuvent être publiés indépendamment, mais **la musique n'est pas audible tant que le fichier binaire n'est pas présent sur GitHub Pages**.

## Version du jeu

Version actuelle : **v1.12.0** (nouvel habillage psychédélique inspiré de Tetris, sans modifier le fonctionnement du jeu).

## Licence

Projet de démonstration, libre à adapter pour un usage personnel.
