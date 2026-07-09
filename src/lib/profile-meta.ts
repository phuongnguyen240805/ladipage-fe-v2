import type { AccountInfo, AccountUpdatePayload } from "@liora/api-types";

export interface ProfileSocialLinks {
  facebook: string;
  x: string;
  linkedin: string;
  instagram: string;
}

export interface ProfileMeta {
  bio: string;
  social: ProfileSocialLinks;
}

const PROFILE_META_PREFIX = "__LIORA_PROFILE_META__:";

export const EMPTY_PROFILE_SOCIAL: ProfileSocialLinks = {
  facebook: "",
  x: "",
  linkedin: "",
  instagram: "",
};

export function emptyProfileMeta(): ProfileMeta {
  return { bio: "", social: { ...EMPTY_PROFILE_SOCIAL } };
}

/** @deprecated Legacy remark JSON — used only as fallback when dedicated BE fields are empty */
export function parseProfileRemark(remark?: string | null): ProfileMeta {
  if (!remark?.trim()) return emptyProfileMeta();

  if (remark.startsWith(PROFILE_META_PREFIX)) {
    try {
      const parsed = JSON.parse(remark.slice(PROFILE_META_PREFIX.length)) as {
        bio?: string;
        social?: Partial<ProfileSocialLinks>;
      };
      return {
        bio: parsed.bio ?? "",
        social: { ...EMPTY_PROFILE_SOCIAL, ...parsed.social },
      };
    } catch {
      return { bio: remark, social: { ...EMPTY_PROFILE_SOCIAL } };
    }
  }

  return { bio: remark, social: { ...EMPTY_PROFILE_SOCIAL } };
}

export function resolveProfileFromAccount(
  profile?: AccountInfo | null
): ProfileMeta {
  if (!profile) return emptyProfileMeta();

  const legacy = parseProfileRemark(profile.remark);

  return {
    bio: profile.bio || legacy.bio,
    social: {
      facebook: profile.socialFacebook || legacy.social.facebook,
      x: profile.socialX || legacy.social.x,
      linkedin: profile.socialLinkedin || legacy.social.linkedin,
      instagram: profile.socialInstagram || legacy.social.instagram,
    },
  };
}

export function buildProfileUpdatePayload(
  patch: ProfileMeta & {
    nickname?: string;
    email?: string;
    phone?: string;
  }
): AccountUpdatePayload {
  return {
    nickname: patch.nickname,
    email: patch.email,
    phone: patch.phone,
    bio: patch.bio,
    socialFacebook: patch.social.facebook,
    socialX: patch.social.x,
    socialLinkedin: patch.social.linkedin,
    socialInstagram: patch.social.instagram,
  };
}

export function splitDisplayName(name?: string | null): {
  firstName: string;
  lastName: string;
} {
  const trimmed = name?.trim() ?? "";
  if (!trimmed) return { firstName: "", lastName: "" };
  const parts = trimmed.split(/\s+/);
  return { firstName: parts[0] ?? "", lastName: parts.slice(1).join(" ") };
}

export function joinDisplayName(firstName: string, lastName: string): string {
  return [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");
}

/** Tên hiển thị header / dropdown — ưu tiên nickname, username, phần local của email. */
export function resolveAccountDisplayName(
  profile?: AccountInfo | null,
  fallback = "Owner",
): string {
  const nickname = profile?.nickname?.trim();
  const username = profile?.username?.trim();
  const email = profile?.email?.trim();

  if (nickname) return nickname;
  if (username) return username;
  if (email) {
    const localPart = email.split("@")[0]?.trim();
    if (localPart) return localPart;
  }

  return fallback;
}

export function resolveAccountInitial(
  profile?: AccountInfo | null,
  fallback = "O",
): string {
  const displayName = resolveAccountDisplayName(profile, "");
  const initial = displayName.trim().charAt(0).toUpperCase();
  return initial || fallback;
}