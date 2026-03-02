/**
 * F.L.A.M.E – Encriptação AES-256-GCM (Client-Side)
 *
 * Usa a Web Crypto API nativa do browser (padrão militar).
 * - Derivação de chave: PBKDF2 (SHA-256, 100 000 iterações)
 * - Encriptação: AES-256-GCM (256-bit key, 96-bit IV)
 * - Nenhum dado em texto claro é enviado ao servidor.
 *
 * Referência: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto
 */

// ────────────────────────────────────────────
// Helpers: conversão entre ArrayBuffer e Base64
// ────────────────────────────────────────────

function bufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function base64ToBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

// ────────────────────────────────────────────
// Derivação de chave via PBKDF2
// ────────────────────────────────────────────

const PBKDF2_ITERATIONS = 100_000;

/**
 * Deriva uma chave AES-256 a partir de uma senha e um salt.
 *
 * @param password  Senha do utilizador (nunca enviada ao servidor)
 * @param salt      Salt aleatório (16 bytes)
 * @returns         CryptoKey pronta para AES-GCM
 */
async function deriveKey(
    password: string,
    salt: Uint8Array
): Promise<CryptoKey> {
    const encoder = new TextEncoder();

    // Importar a senha como chave "raw"
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        "PBKDF2",
        false,
        ["deriveKey"]
    );

    // Derivar chave AES-256
    return crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: PBKDF2_ITERATIONS,
            hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
    );
}

// ────────────────────────────────────────────
// Encriptação AES-256-GCM
// ────────────────────────────────────────────

export interface EncryptedPayload {
    /** Conteúdo encriptado (ciphertext em base64) */
    ciphertext: string;
    /** Initialization Vector (base64) — único por item */
    iv: string;
    /** Salt usado na derivação da chave (base64) */
    salt: string;
}

/**
 * Encripta texto com AES-256-GCM.
 *
 * @param plaintext  Texto em claro a encriptar
 * @param password   Senha do utilizador
 * @returns          Payload encriptado { ciphertext, iv, salt }
 */
export async function encryptText(
    plaintext: string,
    password: string
): Promise<EncryptedPayload> {
    const encoder = new TextEncoder();

    // Gerar salt e IV aleatórios
    const salt = crypto.getRandomValues(new Uint8Array(16)); // 128-bit
    const iv = crypto.getRandomValues(new Uint8Array(12));    // 96-bit (recomendado para GCM)

    // Derivar chave
    const key = await deriveKey(password, salt);

    // Encriptar
    const cipherBuffer = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        encoder.encode(plaintext)
    );

    return {
        ciphertext: bufferToBase64(cipherBuffer),
        iv: bufferToBase64(iv.buffer),
        salt: bufferToBase64(salt.buffer),
    };
}

// ────────────────────────────────────────────
// Desencriptação AES-256-GCM
// ────────────────────────────────────────────

/**
 * Desencripta um payload previamente encriptado com encryptText.
 *
 * @param payload    { ciphertext, iv, salt } em base64
 * @param password   Senha do utilizador (a mesma usada para encriptar)
 * @returns          Texto original em claro
 * @throws           Se a senha estiver errada ou os dados forem corrompidos
 */
export async function decryptText(
    payload: EncryptedPayload,
    password: string
): Promise<string> {
    const decoder = new TextDecoder();

    const salt = new Uint8Array(base64ToBuffer(payload.salt));
    const iv = new Uint8Array(base64ToBuffer(payload.iv));
    const cipherBuffer = base64ToBuffer(payload.ciphertext);

    // Derivar a mesma chave
    const key = await deriveKey(password, salt);

    // Desencriptar
    const plainBuffer = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        cipherBuffer
    );

    return decoder.decode(plainBuffer);
}

// ────────────────────────────────────────────
// Utilitários de verificação
// ────────────────────────────────────────────

/**
 * Verifica se a Web Crypto API está disponível no browser atual.
 */
export function isCryptoAvailable(): boolean {
    return (
        typeof crypto !== "undefined" &&
        typeof crypto.subtle !== "undefined" &&
        typeof crypto.getRandomValues !== "undefined"
    );
}

/**
 * Gera uma senha aleatória segura (para sugestão ao utilizador).
 */
export function generateSecurePassword(length = 24): string {
    const charset =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    const values = crypto.getRandomValues(new Uint8Array(length));
    return Array.from(values, (v) => charset[v % charset.length]).join("");
}
