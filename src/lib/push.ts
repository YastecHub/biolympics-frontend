import { api } from "./api";

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const buffer = new ArrayBuffer(raw.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < raw.length; i++) view[i] = raw.charCodeAt(i);
  return view;
}

export function pushSupported(): boolean {
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

/** Subscribe this browser to web push and register the subscription server-side. */
export async function subscribeToPush(
  topics: { topic: string; target_id?: string }[] = [{ topic: "ALL" }],
): Promise<{ ok: boolean; reason?: string }> {
  if (!pushSupported()) return { ok: false, reason: "Push is not supported on this device." };

  const { public_key } = await api.pushPublicKey();
  if (!public_key) return { ok: false, reason: "Push is not configured on the server yet." };

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return { ok: false, reason: "Notifications were not allowed." };

  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(public_key),
  });

  const json = sub.toJSON();
  await api.subscribePush({
    endpoint: json.endpoint,
    keys: { p256dh: json.keys?.p256dh, auth: json.keys?.auth },
    preferences: topics,
    user_agent: navigator.userAgent,
  });
  return { ok: true };
}
