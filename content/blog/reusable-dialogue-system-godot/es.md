**Orange Ember Studios** | Diálogos que trascienden un solo juego

Construir un sistema de diálogo desde cero en cada proyecto es reinventar la rueda. En Orange Ember Studios apostamos por uno reutilizable: que sirva tanto para un RPG narrativo como para un action-adventure o un prototipo de visual novel.

## La clave: tres capas

- **Datos** — contenido fuera del código, en recursos editables por cualquiera
- **Lógica** — motor que interpreta datos, evalúa condiciones y orquesta el flujo sin saber cómo se ve la UI
- **Presentación** — escena visual intercambiable sin tocar una línea de lógica

Cada capa se comunica por señales, sin acoplamiento entre ellas.

## Cómo lo construimos en Godot

### 1. Datos con Resources

Cada conversación es un recurso nativo (`.tres` / `.res`): edición visual desde el inspector para escritores no técnicos, Git-friendly con texto plano y herencia entre variantes (diálogo normal vs. jefe final).

### 2. Motor como Autoload

Un `DialogueManager` global procesa nodos de conversación y emite señales:

- `dialogue_started(resource)` → la UI se prepara
- `line_displayed(line_data)` → audio blip por carácter
- `choices_available(options)` → se renderizan las ramificaciones
- `dialogue_ended(resource)` → el juego reanuda el control

El manager no sabe si la UI es medieval o cyberpunk. Solo dispara datos.

### 3. UI intercambiable

Nodo independiente que cada juego sobrescribe: theming vía `Theme` de Godot, typewriter plugin configurable, BBCode para énfasis y nombres coloreados, retratos configurables desde el inspector.

### 4. Eventos embebidos

El diálogo dispara acciones del juego con marcadores:

- `[camera_shake:0.5]` — énfasis dramático
- `[set_flag:boss_defeated]` — estado persistente del mundo
- `[play_sfx:item_get]` — feedback auditivo

Esto convierte el diálogo en herramienta de game design, no en texto decorativo.

## Por qué nos importa

Cada proyecto nuevo hereda herramientas, no empieza de cero. Con esta arquitectura: mismo pipeline para escritores en todos los juegos, prototipado de escenas conversacionales en minutos, UI desacoplada y sistema escalable de un NPC simple a cinemáticas ramificadas complejas.

¿Tú cómo manejas los diálogos? ¿Sistema propio, plugin o herramienta externa? Cuéntanos tu experiencia.
