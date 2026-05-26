**Orange Ember Studios** | Craft de precisión en código y juego

En un juego 3D de física pura—como el que estamos puliendo con **Ember Roll: Kinetic Drift**—cada milisegundo cuenta. Una bola que rueda a alta velocidad entre obstáculos exige un motor que no “tiemble” cuando el caos escala.

## El desafío técnico

Con motores legacy, el rolling a velocidad extrema suele traer:

- Penetraciones entre colliders finos
- Rebotes impredecibles en rampas y rails
- Cámara en tercera persona que “pelea” con el movimiento

Para nosotros, eso no es un bug menor: es deuda de **experiencia de usuario**.

## Nuestra apuesta con Godot 4.6: Jolt Physics por defecto

Godot 4.6 elimina la etiqueta experimental y convierte a **Jolt**—el mismo motor que impulsa títulos AAA—en el motor 3D por defecto en proyectos nuevos. Más estabilidad, mejor rendimiento en escenas densas y simulación más predecible: exactamente lo que buscamos al nivel de un **software engineering** premium, no solo “game feel”.

## Cómo lo implementamos (behind the scenes)

### 1. Arquitectura de física

- `RigidBody3D` para la bola, con Continuous Collision Detection activado
- `PhysicsMaterial` custom: fricción alta + rebote bajo → sensación de rodadura, no de pinball
- Capas de colisión separadas (bola / obstáculos / triggers) para depurar sin tocar gameplay

### 2. Control kinético (GDScript)

Aplicamos torque alineado al eje de la cámara, no al mundo:

- El jugador siente que “gira” la bola, no que empuja un vector abstracto
- En pendientes, la gravedad + fricción hacen el resto; nosotros solo modulamos intención

### 3. Cámara tercera persona

`SpringArm3D` + `Camera3D` con seguimiento suavizado (lerp) y collision mask del brazo:

- Evita que la cámara atraviese muros en curvas cerradas
- Offset dinámico según velocidad: más lejos cuando la bola acelera, más cerca en zonas técnicas

### 4. Iteración en el editor 4.6

Usamos la nueva opción de ralentizar/acelerar el juego en Play para inspeccionar contactos frame a frame—sin scripts de debug extra. Eso es **craftsmanship**: menos fricción en el pipeline, más tiempo puliendo sensación.

## Resultado en estudio

Menos micro-correcciones post-contacto, curvas más limpias en niveles complejos y una base física que escala como producto serio—no como prototipo.

¿Ya migraste un proyecto 3D a Godot 4.6? ¿Notaste diferencia con Jolt en plataformas, bolas o vehículos? Cuéntanos tu caso o prueba este stack en una escena mínima y comparte qué tal se comporta.
