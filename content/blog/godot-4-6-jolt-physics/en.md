**Orange Ember Studios** | Precision craft in code and play

In a pure physics 3D game—like the one we are polishing with **Ember Roll: Kinetic Drift**—every millisecond counts. A ball rolling at high speed through obstacles needs a physics engine that does not “wobble” when chaos scales up.

## The technical challenge

With legacy engines, extreme-speed rolling often leads to:

- Penetration between thin colliders
- Unpredictable bounces on ramps and rails
- A third-person camera that fights the movement

For us, that is not a minor bug—it is **user-experience debt**.

## Our bet on Godot 4.6: Jolt Physics by default

Godot 4.6 removes the experimental label and makes **Jolt**—the same engine powering AAA titles—the default 3D physics engine for new projects. More stability, better performance in dense scenes, and more predictable simulation: exactly what we want at a premium **software engineering** level, not just “game feel.”

## How we implement it (behind the scenes)

### 1. Physics architecture

- `RigidBody3D` for the ball, with Continuous Collision Detection enabled
- Custom `PhysicsMaterial`: high friction + low bounce → rolling feel, not pinball
- Separate collision layers (ball / obstacles / triggers) for debugging without touching gameplay

### 2. Kinetic control (GDScript)

We apply torque aligned to the camera axis, not world space:

- The player feels they are **turning** the ball, not pushing an abstract vector
- On slopes, gravity + friction do the rest; we only modulate intent

### 3. Third-person camera

`SpringArm3D` + `Camera3D` with smoothed follow (lerp) and arm collision mask:

- Prevents the camera from clipping through walls on tight corners
- Dynamic offset by speed: farther when the ball accelerates, closer in technical sections

### 4. Iteration in the 4.6 editor

We use the new Play mode option to slow down or speed up the game to inspect contacts frame by frame—without extra debug scripts. That is **craftsmanship**: less pipeline friction, more time polishing feel.

## Studio result

Fewer micro-corrections after contact, cleaner curves on complex levels, and a physics foundation that scales like a serious product—not a prototype.

Have you migrated a 3D project to Godot 4.6? Did you notice a difference with Jolt on platforms, balls, or vehicles? Share your case, or try this stack in a minimal scene and tell us how it behaves.
