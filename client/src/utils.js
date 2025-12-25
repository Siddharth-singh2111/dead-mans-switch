// client/src/utils.js

// --- HELPER FUNCTIONS ---
export const bufferToHex = (buffer) => {
  return [...new Uint8Array(buffer)]
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

export const hexToBuffer = (hexString) => {
  return new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
};

// --- 1. ENCRYPTION (Upload) ---
export const encryptFile = async (file) => {
  // A. Generate a random AES-256 Key
  const key = await window.crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true, // Extractable (so we can split it)
    ["encrypt", "decrypt"]
  );

  // B. Generate Random Noise (IV)
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  // C. Encrypt the File
  const fileBuffer = await file.arrayBuffer();
  const encryptedContent = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    fileBuffer
  );

  // D. Export the Key to Hex String
  const exportedKey = await window.crypto.subtle.exportKey("raw", key);
  const keyHex = bufferToHex(exportedKey);
  const ivHex = bufferToHex(iv);

  // E. SPLIT THE KEY (Zero Knowledge)
  // Server gets first 32 chars. You get last 32 chars.
  const serverKeyPart = keyHex.slice(0, 32); 
  const trusteeKeyPart = keyHex.slice(32);   

  return {
    encryptedBlob: new Blob([encryptedContent]),
    iv: ivHex,
    serverKeyPart,
    trusteeKeyPart
  };
};

// --- 2. DECRYPTION (Unlock) ---
export const decryptFile = async (encryptedBlob, serverKeyPart, trusteeKeyPart, ivHex) => {
  try {
    // A. Recombine the Key
    const fullKeyHex = serverKeyPart + trusteeKeyPart;
    const fullKeyBuffer = hexToBuffer(fullKeyHex);

    // B. Import Key back to Browser Engine
    const key = await window.crypto.subtle.importKey(
      "raw",
      fullKeyBuffer,
      "AES-GCM",
      true,
      ["decrypt"]
    );

    // C. Decrypt
    const iv = hexToBuffer(ivHex);
    const fileBuffer = await encryptedBlob.arrayBuffer();

    const decryptedContent = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      key,
      fileBuffer
    );

    return new Blob([decryptedContent]);
  } catch (e) {
    console.error("Decryption Failed:", e);
    throw new Error("Invalid Key or Corrupted File");
  }
};