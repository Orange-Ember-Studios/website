**Orange Ember Studios** | La lumière qui raconte des histoires

L’éclairage dynamique n’est pas un ornement : c’est le langage silencieux qui guide le regard du joueur et transforme un décor plat en monde vivant. Dans notre studio, la lumière est un outil de game design.

## Le défi

Beaucoup d’indés évitent la lumière dynamique par peur des performances. Avec Godot 4, le coût est souvent modeste et l’impact visuel, énorme.

## Notre approche dans Godot

### 1. Ambiance de base

`CanvasModulate` (2D) / `WorldEnvironment` (3D) fixent le ton global. Bleu froid pour les donjons, ambre chaud pour les intérieurs.

### 2. Sources lumineuses

`PointLight2D` / `OmniLight3D` comme enfants d’objets émissifs. Ombres dynamiques uniquement là où elles apportent une valeur narrative.

### 3. Normal maps en 2D

Textures normales sur les sprites + lumière directionnelle → profondeur qui trompe l’œil. Un mur 2D peut sembler 3D avec une simple normal map.

### 4. Occlusion intelligente

`LightOccluder2D` avec polygones découpés à la main pour des ombres nettes sans géométrie inutile.

### 5. Lumière en mouvement

Paramètres animés en code (`energy`, `color`, `range`) : scintillement de torches, lampe du joueur, cycle jour/nuit avec tween.

### 6. Shaders volumétriques (3D)

`FogVolume` + shader personnalisé → faisceaux de lumière à travers les fenêtres et brouillard éclairé par les lampadaires.

## Résultat

Des mondes qui semblent vivants. Le joueur ne pense pas « belle lumière »—il pense « c’est réel ».

Comment gérez-vous l’éclairage dans vos projets ? Privilégiez-vous les performances ou l’atmosphère ? Nous lisons vos retours.
