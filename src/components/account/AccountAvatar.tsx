import Image from "next/image";
import {
  getPresetFace,
  resolveAccountAvatar,
  type PresetAvatarId,
  type PresetExtra,
  type PresetFace,
  type PresetHair,
  type PresetMouth,
} from "./preset-avatars";

type AccountAvatarProps = {
  avatar?: string | null;
  alt: string;
  size: number;
  fallbackInitial?: string;
  fallbackSrc?: string;
};

export function AccountAvatar({
  avatar,
  alt,
  size,
  fallbackInitial,
  fallbackSrc,
}: AccountAvatarProps) {
  const resolved = resolveAccountAvatar(avatar);

  if (resolved.kind === "preset") {
    return (
      <span
        className="inline-flex shrink-0 overflow-hidden rounded-full border border-kedi-navy/10"
        style={{ width: size, height: size }}
      >
        <PresetAvatarFace id={resolved.id} title={alt} />
      </span>
    );
  }

  const src = resolved.kind === "image" ? resolved.src : fallbackSrc;
  if (src) {
    return (
      <span
        className="inline-flex shrink-0 overflow-hidden rounded-full border border-kedi-navy/10"
        style={{ width: size, height: size }}
      >
        <Image src={src} alt={alt} width={size} height={size} className="h-full w-full object-cover" />
      </span>
    );
  }

  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full border border-kedi-navy/10 bg-brand-50 text-xs font-semibold text-kedi-navy dark:border-kedi-yellow/30 dark:bg-kedi-yellow/20 dark:text-kedi-yellow"
      style={{ width: size, height: size }}
    >
      {fallbackInitial?.trim() || "?"}
    </span>
  );
}

function PresetAvatarFace({ id, title }: { id: PresetAvatarId; title?: string }) {
  const face = getPresetFace(id);
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full" role="img" aria-label={title || undefined}>
      <circle cx="32" cy="32" r="32" fill={face.bg} />
      <g className="kedi-avatar-bob">
        <Hair face={face} />
        <circle cx="32" cy="36" r="16" fill={face.skin} />
        <g className="kedi-avatar-eyes">
          <circle cx="26" cy="35" r="2.1" fill="#0B2D5B" />
          <circle cx="38" cy="35" r="2.1" fill="#0B2D5B" />
        </g>
        <Mouth mouth={face.mouth} />
        <Extra extra={face.extra} accent={face.bg === "#0B2D5B" ? "#FFC629" : "#0B2D5B"} />
      </g>
    </svg>
  );
}

function Hair({ face }: { face: PresetFace }) {
  return <HairShape hair={face.hair} color={face.hairColor} />;
}

function HairShape({ hair, color }: { hair: PresetHair; color: string }) {
  if (hair === "none") return null;
  if (hair === "bun") {
    return (
      <>
        <ellipse cx="32" cy="24" rx="15" ry="8" fill={color} />
        <circle cx="44" cy="18" r="6" fill={color} />
      </>
    );
  }
  if (hair === "side") {
    return <path d="M16 30c2-14 12-18 22-16 6 1 12 6 12 14H16z" fill={color} />;
  }
  if (hair === "cap") {
    return (
      <>
        <path d="M16 30c1-12 10-16 16-16s15 4 16 16H16z" fill={color} />
        <rect x="14" y="28" width="36" height="5" rx="2" fill={color} />
      </>
    );
  }
  return <ellipse cx="32" cy="22" rx="16" ry="9" fill={color} />;
}

function Mouth({ mouth }: { mouth: PresetMouth }) {
  if (mouth === "grin") {
    return <path d="M24 42c2.5 5 13.5 5 16 0" fill="none" stroke="#0B2D5B" strokeWidth="2" strokeLinecap="round" />;
  }
  if (mouth === "small") {
    return <path d="M28 43h8" fill="none" stroke="#0B2D5B" strokeWidth="2" strokeLinecap="round" />;
  }
  return <path d="M26 42c2 3 10 3 12 0" fill="none" stroke="#0B2D5B" strokeWidth="2" strokeLinecap="round" />;
}

function Extra({ extra, accent }: { extra: PresetExtra; accent: string }) {
  if (extra === "glasses") {
    return (
      <g fill="none" stroke="#0B2D5B" strokeWidth="1.6">
        <circle cx="26" cy="35" r="4.2" />
        <circle cx="38" cy="35" r="4.2" />
        <path d="M30.2 35h3.6" />
      </g>
    );
  }
  if (extra === "bow") {
    return <path d="M46 24l6 3-6 3 6 3-6 3-3-4.5L40 36l6-3-6-3 6-3 3 4.5z" fill={accent} />;
  }
  if (extra === "freckles") {
    return (
      <g fill="#0B2D5B">
        <circle cx="22" cy="40" r="0.7" />
        <circle cx="24.5" cy="42" r="0.7" />
        <circle cx="41" cy="40" r="0.7" />
        <circle cx="39" cy="42" r="0.7" />
      </g>
    );
  }
  return null;
}
