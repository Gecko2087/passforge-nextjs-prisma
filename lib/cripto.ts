import { getRuntimeEnv } from "./runtime";

const encoder = new TextEncoder();
async function encryptionKey() {
  const secret = getRuntimeEnv().ENCRYPTION_KEY;
  // Exactly 256 random bits, provided privately. No passphrases or cheapened KDF.
  if (!/^[a-f\d]{64}$/i.test(secret ?? "")) throw new Error("Invalid encryption configuration");
  const bytes = Uint8Array.from(secret.match(/../g)!, hex => parseInt(hex, 16));
  return crypto.subtle.importKey("raw", bytes, "AES-GCM", false, ["encrypt", "decrypt"]);
}
function encode(bytes: Uint8Array) { return btoa(String.fromCharCode(...bytes)); }
function decode(value: string) { return Uint8Array.from(atob(value), char => char.charCodeAt(0)); }

// Authenticated context prevents moving ciphertext to another owner or record.
export async function encryptPassword(password: string, ownerId: string, recordId: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const result = await crypto.subtle.encrypt({ name: "AES-GCM", iv, tagLength: 128,
    additionalData: encoder.encode(`passforge:v1:${ownerId}:${recordId}`) },
    await encryptionKey(), encoder.encode(password));
  return `v1.${encode(iv)}.${encode(new Uint8Array(result))}`;
}
export async function decryptPassword(envelope: string, ownerId: string, recordId: string) {
  const parts = envelope.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") throw new Error("Unsupported ciphertext");
  const result = await crypto.subtle.decrypt({ name: "AES-GCM", iv: decode(parts[1]), tagLength: 128,
    additionalData: encoder.encode(`passforge:v1:${ownerId}:${recordId}`) },
    await encryptionKey(), decode(parts[2]));
  return new TextDecoder().decode(result);
}
