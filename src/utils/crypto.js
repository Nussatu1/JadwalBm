/**
 * Menghasilkan hash SHA-256 dari string input (menggunakan Web Crypto API bawaan browser)
 * @param {string} message - String password/teks yang akan di-hash
 * @returns {Promise<string>} - Hex string 64 karakter
 */
export async function sha256(message) {
  if (!message) return '';
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}
