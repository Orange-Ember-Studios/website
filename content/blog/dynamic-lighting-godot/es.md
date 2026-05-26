**Orange Ember Studios** | Luz que cuenta historias

La iluminación dinámica no es adorno: es el lenguaje silencioso que guía la mirada del jugador y transforma un escenario plano en un mundo vivo. En nuestro estudio, la luz es herramienta de game design.

## El desafío

Muchos indies evitan la luz dinámica por miedo al rendimiento. Pero con Godot 4, el costo suele ser bajo y el impacto visual, altísimo.

## Nuestro enfoque en Godot

### 1. Ambiente base

`CanvasModulate` (2D) / `WorldEnvironment` (3D) fijan el tono global. Azul nocturno para mazmorras, ámbar cálido para interiores.

### 2. Fuentes de luz

`PointLight2D` / `OmniLight3D` como hijos de objetos emisores. Sombras dinámicas solo donde aportan valor narrativo.

### 3. Normal maps en 2D

Texturas normales en sprites + luz direccional → profundidad que engaña al ojo. Una pared 2D se siente 3D con solo añadir normal map.

### 4. Oclusión inteligente

`LightOccluder2D` con polígonos recortados a mano para sombras nítidas sin geometría innecesaria.

### 5. Luz en movimiento

Parámetros animados por código (`energy`, `color`, `range`): parpadeo de antorchas, linterna del jugador, ciclo día/noche con tween.

### 6. Shaders volumétricos (3D)

`FogVolume` + shader personalizado → rayos de luz que atraviesan ventanas y niebla iluminada por faroles.

## Resultado

Mundos que se sienten vivos. El jugador no piensa «bonita luz», piensa «esto es real».

¿Tú cómo manejas la iluminación? ¿Priorizas rendimiento o atmósfera? Te leemos.
