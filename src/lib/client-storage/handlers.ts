import { clientIndexedDb, type CreatedEmailRecord, type FacebookAuthRecord } from "./indexed-db";

type HandlerPayload = Record<string, unknown> | undefined;

function payloadObject(payload?: HandlerPayload) {
  return payload && typeof payload === "object" ? payload : {};
}

function getPayloadUid(payload?: HandlerPayload) {
  const objectPayload = payloadObject(payload);
  return String(objectPayload.uid || "").trim();
}

export async function handleClientStorageRequest(channel: string, payload?: HandlerPayload) {
  const objectPayload = payloadObject(payload);

  switch (channel) {
    case "db:get-settings":
      return clientIndexedDb.getSettings();

    case "db:save-settings":
      return clientIndexedDb.saveSettings(objectPayload);

    case "db:get-facebook-auth":
      return clientIndexedDb.getFacebookAuth();

    case "db:save-facebook-auth":
      return clientIndexedDb.saveFacebookAuth(objectPayload as Omit<FacebookAuthRecord, "id" | "updatedAt">);

    case "db:clear-facebook-auth":
      return clientIndexedDb.clearFacebookAuth();

    case "db:purge-uid-data":
      return clientIndexedDb.purgeUidData(getPayloadUid(payload));

    case "db:get-ads-accounts":
      return clientIndexedDb.getResourceRows("ads", getPayloadUid(payload));

    case "db:save-ads-list":
      return clientIndexedDb.saveResourceRows("ads", getPayloadUid(payload), (objectPayload.rows as []) || []);

    case "db:get-bm-accounts":
      return clientIndexedDb.getResourceRows("bm", getPayloadUid(payload));

    case "db:save-bm-list":
      return clientIndexedDb.saveResourceRows("bm", getPayloadUid(payload), (objectPayload.rows as []) || []);

    case "db:get-page-accounts":
      return clientIndexedDb.getResourceRows("page", getPayloadUid(payload));

    case "db:save-page-list":
      return clientIndexedDb.saveResourceRows("page", getPayloadUid(payload), (objectPayload.rows as []) || []);

    case "db:get-friends-accounts":
      return clientIndexedDb.getResourceRows("friends", getPayloadUid(payload));

    case "db:save-friends-list":
      return clientIndexedDb.saveResourceRows("friends", getPayloadUid(payload), (objectPayload.rows as []) || []);

    case "created_emails:list":
      return clientIndexedDb.listCreatedEmails();

    case "created_emails:save":
      await clientIndexedDb.saveCreatedEmail(objectPayload as CreatedEmailRecord);
      return { ok: true };

    case "setting:get":
      return clientIndexedDb.getSetting(String(objectPayload.key || ""));

    case "setting:set":
      await clientIndexedDb.setSetting(String(objectPayload.key || ""), objectPayload.value);
      return { ok: true };

    case "setting:get-setting":
      return clientIndexedDb.getModuleSetting(
        String(objectPayload.moduleSlug || ""),
        String(objectPayload.key || ""),
        objectPayload.defaultValue
      );

    case "setting:update-setting":
      return clientIndexedDb.setModuleSetting(
        String(objectPayload.moduleSlug || ""),
        String(objectPayload.key || ""),
        objectPayload.value
      );

    default:
      throw new Error(`Unknown client storage channel: ${channel}`);
  }
}
