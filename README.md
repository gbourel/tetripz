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

Des boutons tactiles sont disponibles sur mobile.

## Fonctionnalités

- Sept pièces et tirage aléatoire par sac de 7
- Pièce fantôme et aperçu de la prochaine pièce
- Score, lignes, niveaux, accélération progressive
- Meilleur score enregistré localement
- Design néon responsive

## Version du jeu

Version actuelle : **v1.0.0** (point de départ du suivi des versions).

Le numéro de version est affiché discrètement dans le pied de page du jeu et défini dans `index.html` (élément `#app-version`).

**À chaque modification publiée du jeu**, incrémenter la version dans `index.html` et mettre à jour la version indiquée ici :
- Correctif ou petit ajustement : `1.0.0 → 1.0.1`
- Nouvelle fonctionnalité : `1.0.1 → 1.1.0`
- Changement majeur : `1.1.0 → 2.0.0`

Cette incrémentation est une convention de maintenance : elle doit être appliquée à chaque prochaine modification, elle n'est pas automatique.

## Licence

Projet de démonstration, libre à adapter pour un usage personnel.
