// src/utils/crypto.js

// ---------- Helper: Convert ArrayBuffer to Hex ----------
function bufferToHex(buffer) {
  const byteArray = new Uint8Array(buffer);
  return Array.from(byteArray)
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

// ---------- Helper: Convert PEM to ArrayBuffer ----------
function pemToArrayBuffer(pem) {
  const base64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "");

  const binary = atob(base64);
  const buffer = new ArrayBuffer(binary.length);
  const view = new Uint8Array(buffer);

  for (let i = 0; i < binary.length; i++) {
    view[i] = binary.charCodeAt(i);
  }

  return buffer;
}

// ---------- 1️⃣ Normalize Keyword ----------
export function normalizeKeyword(keyword) {
  return keyword.trim().toLowerCase();
}

// ---------- 2️⃣ SHA256 Hash ----------
export async function sha256Hex(input) {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);

  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  return bufferToHex(hashBuffer);
}

// ---------- 3️⃣ Import RSA Private Key (PSS) ----------
async function importPrivateKey(pemKey) {
  const keyBuffer = pemToArrayBuffer(pemKey);

  return await crypto.subtle.importKey(
    "pkcs8",
    keyBuffer,
    {
      name: "RSA-PSS",
      hash: "SHA-256"
    },
    false,
    ["sign"]
  );
}

// ---------- 3b️⃣ Import RSA Public Key (SPKI) ----------
async function importPublicKey(pemKey) {
  const base64 = pemKey
    .replace(/-----BEGIN PUBLIC KEY-----/, "")
    .replace(/-----END PUBLIC KEY-----/, "")
    .replace(/\s/g, "");

  const binary = atob(base64);
  const buffer = new ArrayBuffer(binary.length);
  const view = new Uint8Array(buffer);

  for (let i = 0; i < binary.length; i++) {
    view[i] = binary.charCodeAt(i);
  }

  return await crypto.subtle.importKey(
    "spki",
    buffer,
    {
      name: "RSA-PSS",
      hash: "SHA-256"
    },
    false,
    ["verify"]
  );
}

// ---------- 4️⃣ Sign Hash using RSA-PSS ----------
export async function signHashHex(hashHex, pemPrivateKey) {
  const privateKey = await importPrivateKey(pemPrivateKey);

  const encoder = new TextEncoder();
  const data = encoder.encode(hashHex);

  const signatureBuffer = await crypto.subtle.sign(
    {
      name: "RSA-PSS",
      saltLength: 32
    },
    privateKey,
    data
  );

  return bufferToHex(signatureBuffer);
}

// ---------- 5️⃣ Verify Signature using RSA-PSS ----------
export async function verifySignatureHex(hashHex, signatureHex, pemPublicKey) {
  const publicKey = await importPublicKey(pemPublicKey);
  const encoder = new TextEncoder();
  const data = encoder.encode(hashHex);

  return await crypto.subtle.verify(
    {
      name: "RSA-PSS",
      saltLength: 32
    },
    publicKey,
    Uint8Array.from(signatureHex.match(/.{1,2}/g) || [], (byte) => parseInt(byte, 16)),
    data
  );
}
