**Orange Ember Studios** | Light that tells stories

Dynamic lighting is not decoration—it is the silent language that guides the player’s eye and turns a flat set into a living world. In our studio, light is a game design tool.

## The challenge

Many indie teams avoid dynamic light because of performance fears. With Godot 4, the cost is often modest and the visual impact is huge.

## Our approach in Godot

### 1. Base ambience

`CanvasModulate` (2D) / `WorldEnvironment` (3D) set the global tone. Cool blue for dungeons, warm amber for interiors.

### 2. Light sources

`PointLight2D` / `OmniLight3D` as children of emissive objects. Dynamic shadows only where they add narrative value.

### 3. Normal maps in 2D

Normal textures on sprites + directional light → depth that tricks the eye. A flat 2D wall can feel 3D with a normal map alone.

### 4. Smart occlusion

`LightOccluder2D` with hand-trimmed polygons for crisp shadows without unnecessary geometry.

### 5. Moving light

Parameters animated in code (`energy`, `color`, `range`): torch flicker, player flashlight, day/night cycle with tweens.

### 6. Volumetric shaders (3D)

`FogVolume` + custom shader → light shafts through windows and fog lit by street lamps.

## Result

Worlds that feel alive. The player does not think “nice lighting”—they think “this feels real.”

How do you handle lighting in your projects? Do you prioritize performance or atmosphere? We would love to hear your approach.
