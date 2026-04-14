export const tagTranslations: Record<string, Record<string, string>> = {
  en: {
    Immersion: "Immersion",
    Postmortem: "Postmortem",
    "Inverse Pulse": "Inverse Pulse",
    "Exact Slice": "Exact Slice",
    GameDev: "GameDev",
    Godot: "Godot",
    Pizza: "Pizza",
    Future: "Future",
    Gaming: "Gaming",
    Technology: "Technology",
    Design: "Design",
    Masterpieces: "Masterpieces",
    Studio: "Studio",
    Story: "Story",
    Founding: "Founding",
    TechStack: "Tech Stack",
    Technical: "Technical",
  },
  es: {
    Immersion: "Inmersión",
    Postmortem: "Postmortem",
    "Inverse Pulse": "Inverse Pulse",
    "Exact Slice": "Exact Slice",
    GameDev: "Desarrollo",
    Godot: "Godot",
    Pizza: "Pizza",
    Future: "Futuro",
    Gaming: "Videojuegos",
    Technology: "Tecnología",
    Design: "Diseño",
    Masterpieces: "Obras Maestras",
    Studio: "Estudio",
    Story: "Historia",
    Founding: "Fundación",
    TechStack: "Stack Tecnológico",
    Technical: "Técnico",
  },
  fr: {
    Immersion: "Immersion",
    Postmortem: "Postmortem",
    "Inverse Pulse": "Inverse Pulse",
    "Exact Slice": "Exact Slice",
    GameDev: "Dév de Jeux",
    Godot: "Godot",
    Pizza: "Pizza",
    Future: "Futur",
    Gaming: "Jeux Vidéo",
    Technology: "Technologie",
    Design: "Design",
    Masterpieces: "Chefs-d'œuvre",
    Studio: "Studio",
    Story: "Histoire",
    Founding: "Fondation",
    TechStack: "Stack Technique",
    Technical: "Technique",
  },
};

// Mapeo de keys a clases de color de fondo completas (para compatibilidad con PremiumSelect)
export const tagColors: Record<string, string> = {
  GameDev: "bg-blue-500",
  Godot: "bg-void-500",
  "Exact Slice": "bg-ember-500",
  Pizza: "bg-rose-500",
  Immersion: "bg-emerald-500",
  "Inverse Pulse": "bg-pink-500",
  Future: "bg-sky-500",
  Design: "bg-amber-500",
  Technology: "bg-teal-500",
  Studio: "bg-rose-500",
  Postmortem: "bg-violet-500",
  Gaming: "bg-pink-500",
  Masterpieces: "bg-amber-500",
  Story: "bg-teal-500",
  Founding: "bg-sky-500",
  TechStack: "bg-emerald-500",
  Technical: "bg-purple-500",
};

// Map of localized names to the background class for lookup
const tagColorLookup: Record<string, string> = {
  ...tagColors,
  // Spanish
  Historia: "bg-teal-500",
  Fundación: "bg-sky-500",
  StackTecnológico: "bg-emerald-500",
  "Stack Tecnológico": "bg-emerald-500",
  Desarrollo: "bg-blue-500",
  // French
  Histoire: "bg-teal-500",
  Fondation: "bg-sky-500",
  StackTechnique: "bg-emerald-500",
  "Stack Technique": "bg-emerald-500",
  "Dév de Jeux": "bg-blue-500",
  Técnico: "bg-purple-500",
  Technique: "bg-purple-500",
};

export const getTagColor = (tag: string): string => {
  if (tagColorLookup[tag]) return tagColorLookup[tag];

  for (const lang in tagTranslations) {
    for (const [key, value] of Object.entries(tagTranslations[lang])) {
      if (value === tag) {
        if (tagColors[key]) return tagColors[key];
      }
    }
  }

  // Fallback a un color basado en hash
  const fallbacks = [
    "bg-blue-500",
    "bg-void-500",
    "bg-ember-500",
    "bg-emerald-500",
    "bg-sky-500",
    "bg-rose-500",
    "bg-amber-500",
    "bg-violet-500",
    "bg-teal-500",
    "bg-pink-500",
  ];
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  return fallbacks[Math.abs(hash) % fallbacks.length];
};

/**
 * IMPORTANTE: Para que Tailwind CSS detecte las clases, éstas deben estar escritas
 * como strings literales completos. El uso de interpolación dinámica con modificadores
 * de opacidad (ej: ${color}/10) suele fallar en el escaneo estático.
 */
export const getTagStyle = (tag: string): string => {
  const bgClass = getTagColor(tag);

  const styles: Record<string, string> = {
    "bg-blue-500": "text-blue-400 bg-blue-500/10 hover:border-blue-500/50",
    "bg-ember-500": "text-ember-400 bg-ember-500/10 hover:border-ember-500/50",
    "bg-void-500": "text-void-400 bg-void-500/10 hover:border-void-500/50",
    "bg-emerald-500":
      "text-emerald-400 bg-emerald-500/10 hover:border-emerald-500/50",
    "bg-sky-500": "text-sky-400 bg-sky-500/10 hover:border-sky-500/50",
    "bg-rose-500": "text-rose-400 bg-rose-500/10 hover:border-rose-500/50",
    "bg-amber-500": "text-amber-400 bg-amber-500/10 hover:border-amber-500/50",
    "bg-violet-500":
      "text-violet-400 bg-violet-500/10 hover:border-violet-500/50",
    "bg-teal-500": "text-teal-400 bg-teal-500/10 hover:border-teal-500/50",
    "bg-pink-500": "text-pink-400 bg-pink-500/10 hover:border-pink-500/50",
    // Fallbacks opcionales si se usan colores estándar
    "bg-purple-500":
      "text-purple-400 bg-purple-500/10 hover:border-purple-500/50",
    "bg-orange-500":
      "text-orange-400 bg-orange-500/10 hover:border-orange-500/50",
  };

  const variant =
    styles[bgClass] || "text-ash-100 bg-white/10 hover:border-white/20";

  return `text-[10px] font-bold uppercase tracking-widest py-1 px-3 border border-white/10 rounded-full transition-all duration-300 ${variant}`;
};
