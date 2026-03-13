export const UGC_SCENE_PRESET_IDS = [
  "studio_tabletop",
  "kitchen_counter",
  "home_office_desk",
  "outdoor_lifestyle",
  "minimal_gradient_backdrop"
] as const;

export const UGC_AVATAR_PRESET_IDS = [
  "no_avatar",
  "creator_friendly_expert",
  "creator_energetic_host",
  "creator_professional_reviewer"
] as const;

export type UGCScenePreset = {
  id: (typeof UGC_SCENE_PRESET_IDS)[number];
  label: string;
  description: string;
};

export type UGCAvatarPreset = {
  id: (typeof UGC_AVATAR_PRESET_IDS)[number];
  label: string;
  description: string;
};

export const UGC_SCENE_PRESETS: UGCScenePreset[] = [
  {
    id: "studio_tabletop",
    label: "Studio Tabletop",
    description: "Producto protagonista con iluminacion limpia y fondo controlado."
  },
  {
    id: "kitchen_counter",
    label: "Kitchen Counter",
    description: "Escena domestica para marcas food, wellness y lifestyle."
  },
  {
    id: "home_office_desk",
    label: "Home Office Desk",
    description: "Contexto de productividad para software, gadgets y B2B light."
  },
  {
    id: "outdoor_lifestyle",
    label: "Outdoor Lifestyle",
    description: "Ambiente exterior aspiracional para contenido social dinamico."
  },
  {
    id: "minimal_gradient_backdrop",
    label: "Minimal Gradient Backdrop",
    description: "Set abstracto para piezas graficas directas de performance."
  }
];

export const UGC_AVATAR_PRESETS: UGCAvatarPreset[] = [
  {
    id: "no_avatar",
    label: "No Avatar",
    description: "Solo producto y elementos de escena sin presencia humana."
  },
  {
    id: "creator_friendly_expert",
    label: "Friendly Expert Creator",
    description: "Perfil explicativo en tono educativo para anuncios de demostracion."
  },
  {
    id: "creator_energetic_host",
    label: "Energetic Host Creator",
    description: "Perfil dinamico para formatos cortos de alto ritmo."
  },
  {
    id: "creator_professional_reviewer",
    label: "Professional Reviewer Creator",
    description: "Perfil analitico orientado a comparativas y beneficios funcionales."
  }
];
