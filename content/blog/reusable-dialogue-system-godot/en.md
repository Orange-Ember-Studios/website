**Orange Ember Studios** | Dialogues that scale beyond one game

Building a dialogue system from scratch on every project is reinventing the wheel. At Orange Ember Studios we invest in one reusable stack: it should work for a narrative RPG, an action-adventure, or a visual novel prototype.

## The key: three layers

- **Data** — content outside code, in resources editable by anyone
- **Logic** — an engine that interprets data, evaluates conditions, and orchestrates flow without knowing how the UI looks
- **Presentation** — a swappable visual scene without touching logic

Each layer communicates through signals, with no tight coupling between them.

## How we build it in Godot

### 1. Data with Resources

Each conversation is a native resource (`.tres` / `.res`): visual editing in the inspector for non-technical writers, Git-friendly plain text, and inheritance between variants (normal dialogue vs. final boss).

### 2. Engine as Autoload

A global `DialogueManager` processes conversation nodes and emits signals:

- `dialogue_started(resource)` → UI prepares
- `line_displayed(line_data)` → audio blip per character
- `choices_available(options)` → branches render
- `dialogue_ended(resource)` → game resumes control

The manager does not know whether the UI is medieval or cyberpunk. It only emits data.

### 3. Swappable UI

An independent node each game overrides: theming via Godot `Theme`, configurable typewriter plugin, BBCode for emphasis and colored names, portraits configurable from the inspector.

### 4. Embedded events

Dialogue triggers game actions with markers:

- `[camera_shake:0.5]` — dramatic emphasis
- `[set_flag:boss_defeated]` — persistent world state
- `[play_sfx:item_get]` — audio feedback

That turns dialogue into a game design tool, not decorative text.

## Why it matters to us

Every new project inherits tools instead of starting from zero. With this architecture: the same pipeline for writers across games, conversational scenes prototyped in minutes, decoupled UI, and a system that scales from a single NPC to complex branching cinematics.

How do you handle dialogue? Custom system, plugin, or external tool? Share your experience.
