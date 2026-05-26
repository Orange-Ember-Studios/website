**Orange Ember Studios** | Craft de précision en code et en jeu

Dans un jeu 3D axé sur la physique pure—comme celui que nous peaufinons avec **Ember Roll: Kinetic Drift**—chaque milliseconde compte. Une bille roulant à grande vitesse entre des obstacles exige un moteur qui ne « vacille » pas quand le chaos s’intensifie.

## Le défi technique

Avec les moteurs hérités, le rolling à vitesse extrême entraîne souvent :

- Des pénétrations entre colliders fins
- Des rebonds imprévisibles sur rampes et rails
- Une caméra troisième personne qui lutte contre le mouvement

Pour nous, ce n’est pas un bug mineur : c’est une dette d’**expérience utilisateur**.

## Notre pari sur Godot 4.6 : Jolt Physics par défaut

Godot 4.6 retire l’étiquette expérimentale et fait de **Jolt**—le même moteur que les titres AAA—le moteur physique 3D par défaut des nouveaux projets. Plus de stabilité, de meilleures performances dans les scènes denses et une simulation plus prévisible : exactement ce que nous visons au niveau d’un **software engineering** premium, pas seulement du « game feel ».

## Comment nous l’implémentons (behind the scenes)

### 1. Architecture physique

- `RigidBody3D` pour la bille, avec Continuous Collision Detection activé
- `PhysicsMaterial` personnalisé : friction élevée + rebond faible → sensation de roulement, pas de flipper
- Couches de collision séparées (bille / obstacles / triggers) pour déboguer sans toucher au gameplay

### 2. Contrôle cinétique (GDScript)

Nous appliquons un couple aligné sur l’axe de la caméra, pas sur le monde :

- Le joueur a l’impression de **tourner** la bille, pas de pousser un vecteur abstrait
- Sur les pentes, gravité + friction font le reste ; nous modulons seulement l’intention

### 3. Caméra troisième personne

`SpringArm3D` + `Camera3D` avec suivi lissé (lerp) et collision mask du bras :

- Évite que la caméra traverse les murs dans les virages serrés
- Offset dynamique selon la vitesse : plus loin quand la bille accélère, plus proche dans les sections techniques

### 4. Itération dans l’éditeur 4.6

Nous utilisons la nouvelle option Play pour ralentir ou accélérer le jeu et inspecter les contacts image par image—sans scripts de debug supplémentaires. C’est du **craftsmanship** : moins de friction dans le pipeline, plus de temps pour peaufiner la sensation.

## Résultat en studio

Moins de micro-corrections après contact, des courbes plus propres sur les niveaux complexes et une base physique qui scale comme un produit sérieux—pas comme un prototype.

Avez-vous migré un projet 3D vers Godot 4.6 ? Avez-vous constaté une différence avec Jolt sur plateformes, billes ou véhicules ? Partagez votre cas, ou testez cette stack dans une scène minimale et dites-nous comment elle se comporte.
