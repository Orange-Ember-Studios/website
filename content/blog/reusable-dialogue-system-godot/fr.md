**Orange Ember Studios** | Des dialogues qui dépassent un seul jeu

Construire un système de dialogue from scratch à chaque projet, c’est réinventer la roue. Chez Orange Ember Studios, nous investissons dans une stack réutilisable : elle doit servir un RPG narratif, un action-adventure ou un prototype de visual novel.

## La clé : trois couches

- **Données** — contenu hors du code, dans des ressources éditables par tous
- **Logique** — moteur qui interprète les données, évalue les conditions et orchestre le flux sans connaître l’UI
- **Présentation** — scène visuelle interchangeable sans toucher à la logique

Chaque couche communique par signaux, sans couplage fort entre elles.

## Comment nous le construisons dans Godot

### 1. Données avec Resources

Chaque conversation est une ressource native (`.tres` / `.res`) : édition visuelle dans l’inspecteur pour les auteurs non techniques, texte compatible Git et héritage entre variantes (dialogue normal vs. boss final).

### 2. Moteur en Autoload

Un `DialogueManager` global traite les nœuds de conversation et émet des signaux :

- `dialogue_started(resource)` → l’UI se prépare
- `line_displayed(line_data)` → blip audio par caractère
- `choices_available(options)` → les branches s’affichent
- `dialogue_ended(resource)` → le jeu reprend le contrôle

Le manager ne sait pas si l’UI est médiévale ou cyberpunk. Il n’émet que des données.

### 3. UI interchangeable

Nœud indépendant que chaque jeu surcharge : theming via `Theme` Godot, plugin typewriter configurable, BBCode pour l’emphase et les noms colorés, portraits configurables depuis l’inspecteur.

### 4. Événements embarqués

Le dialogue déclenche des actions de jeu avec des marqueurs :

- `[camera_shake:0.5]` — emphase dramatique
- `[set_flag:boss_defeated]` — état persistant du monde
- `[play_sfx:item_get]` — retour audio

Cela transforme le dialogue en outil de game design, pas en texte décoratif.

## Pourquoi c’est important pour nous

Chaque nouveau projet hérite d’outils au lieu de repartir de zéro. Avec cette architecture : le même pipeline pour les auteurs sur tous les jeux, prototypage de scènes conversationnelles en minutes, UI découplée et système qui scale d’un NPC simple à des cinématiques ramifiées complexes.

Comment gérez-vous les dialogues ? Système maison, plugin ou outil externe ? Partagez votre expérience.
