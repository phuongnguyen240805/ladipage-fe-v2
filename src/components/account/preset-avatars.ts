/** Ids must match liora-monorepo `PRESET_AVATAR_IDS`. */
export const PRESET_AVATAR_IDS = [
  "kedi-01",
  "kedi-02",
  "kedi-03",
  "kedi-04",
  "kedi-05",
  "kedi-06",
  "kedi-07",
  "kedi-08",
  "kedi-09",
  "kedi-10",
  "kedi-11",
  "kedi-12",
] as const;

export type PresetAvatarId = (typeof PRESET_AVATAR_IDS)[number];

const PRESET_AVATAR_PREFIX = "preset:";

export type PresetHair = "none" | "short" | "side" | "bun" | "cap";
export type PresetMouth = "smile" | "grin" | "small";
export type PresetExtra = "none" | "glasses" | "bow" | "freckles";

export type PresetFace = {
  id: PresetAvatarId;
  bg: string;
  skin: string;
  hair: PresetHair;
  hairColor: string;
  mouth: PresetMouth;
  extra: PresetExtra;
};

export const PRESET_FACES: readonly PresetFace[] = [
  { id: "kedi-01", bg: "#FFC629", skin: "#F3C7A1", hair: "short", hairColor: "#0B2D5B", mouth: "smile", extra: "none" },
  { id: "kedi-02", bg: "#0B2D5B", skin: "#F3C7A1", hair: "bun", hairColor: "#FFC629", mouth: "grin", extra: "none" },
  { id: "kedi-03", bg: "#FFF6D1", skin: "#D9A066", hair: "side", hairColor: "#3A2A1A", mouth: "smile", extra: "glasses" },
  { id: "kedi-04", bg: "#FFC629", skin: "#8C5A3C", hair: "cap", hairColor: "#0B2D5B", mouth: "grin", extra: "none" },
  { id: "kedi-05", bg: "#0B2D5B", skin: "#F3C7A1", hair: "short", hairColor: "#FFC629", mouth: "small", extra: "bow" },
  { id: "kedi-06", bg: "#FFF6D1", skin: "#D9A066", hair: "bun", hairColor: "#0B2D5B", mouth: "smile", extra: "freckles" },
  { id: "kedi-07", bg: "#FFC629", skin: "#8C5A3C", hair: "none", hairColor: "#0B2D5B", mouth: "grin", extra: "glasses" },
  { id: "kedi-08", bg: "#0B2D5B", skin: "#F3C7A1", hair: "side", hairColor: "#FFC629", mouth: "smile", extra: "none" },
  { id: "kedi-09", bg: "#FFF6D1", skin: "#F3C7A1", hair: "cap", hairColor: "#0B2D5B", mouth: "small", extra: "none" },
  { id: "kedi-10", bg: "#FFC629", skin: "#D9A066", hair: "bun", hairColor: "#3A2A1A", mouth: "grin", extra: "bow" },
  { id: "kedi-11", bg: "#0B2D5B", skin: "#8C5A3C", hair: "short", hairColor: "#FFC629", mouth: "smile", extra: "freckles" },
  { id: "kedi-12", bg: "#FFF6D1", skin: "#D9A066", hair: "side", hairColor: "#0B2D5B", mouth: "grin", extra: "glasses" },
];

const FACE_BY_ID = new Map(PRESET_FACES.map((face) => [face.id, face]));

export type ResolvedAccountAvatar =
  | { kind: "preset"; id: PresetAvatarId }
  | { kind: "image"; src: string }
  | { kind: "empty" };

export function presetAvatarValue(id: PresetAvatarId): string {
  return `${PRESET_AVATAR_PREFIX}${id}`;
}

export function resolveAccountAvatar(value?: string | null): ResolvedAccountAvatar {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return { kind: "empty" };

  if (trimmed.startsWith(PRESET_AVATAR_PREFIX)) {
    const id = trimmed.slice(PRESET_AVATAR_PREFIX.length);
    if (FACE_BY_ID.has(id as PresetAvatarId)) {
      return { kind: "preset", id: id as PresetAvatarId };
    }
    return { kind: "empty" };
  }

  return { kind: "image", src: trimmed };
}

export function getPresetFace(id: PresetAvatarId): PresetFace {
  return FACE_BY_ID.get(id) ?? PRESET_FACES[0];
}
