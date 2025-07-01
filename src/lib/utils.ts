import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sanitizeText(text: string): string {
  // A basic sanitizer to remove script tags and prevent XSS.
  // For more robust sanitization, a library like DOMPurify would be better.
  return text.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
}

const ENCRYPTION_KEY_NAME = 'mindspark-crypto-key';
const ENCRYPTED_API_KEY_NAME = 'googleAiApiKey_encrypted';

async function exportKey(key: CryptoKey): Promise<string> {
    const exported = await window.crypto.subtle.exportKey('jwk', key);
    return JSON.stringify(exported);
}

async function importKey(jwkString: string): Promise<CryptoKey> {
    const jwk = JSON.parse(jwkString);
    return window.crypto.subtle.importKey(
        'jwk',
        jwk,
        { name: 'AES-GCM' },
        true,
        ['encrypt', 'decrypt']
    );
}

async function getEncryptionKey(): Promise<CryptoKey> {
    const storedKey = localStorage.getItem(ENCRYPTION_KEY_NAME);
    if (storedKey) {
        return importKey(storedKey);
    }
    const newKey = await window.crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
    const exportedKey = await exportKey(newKey);
    localStorage.setItem(ENCRYPTION_KEY_NAME, exportedKey);
    return newKey;
}

export async function encryptApiKey(apiKey: string): Promise<void> {
    if (!apiKey) {
        localStorage.removeItem(ENCRYPTED_API_KEY_NAME);
        localStorage.removeItem('googleAiApiKey'); 
        return;
    }
    try {
        const key = await getEncryptionKey();
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const encoder = new TextEncoder();
        const encodedApiKey = encoder.encode(apiKey);

        const encryptedData = await window.crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            key,
            encodedApiKey
        );

        const ivAndEncryptedData = new Uint8Array(iv.length + encryptedData.byteLength);
        ivAndEncryptedData.set(iv);
        ivAndEncryptedData.set(new Uint8Array(encryptedData), iv.length);
        
        const base64String = btoa(String.fromCharCode(...ivAndEncryptedData));
        localStorage.setItem(ENCRYPTED_API_KEY_NAME, base64String);
        localStorage.removeItem('googleAiApiKey');
    } catch(e) {
        console.error("Encryption failed:", e);
        throw new Error("Could not securely store API key.");
    }
}

export async function decryptApiKey(): Promise<string> {
    const base64String = localStorage.getItem(ENCRYPTED_API_KEY_NAME);
    if (!base64String) {
        const oldKey = localStorage.getItem('googleAiApiKey');
        if (oldKey) {
            await encryptApiKey(oldKey);
            return oldKey;
        }
        return '';
    }

    try {
        const key = await getEncryptionKey();
        const ivAndEncryptedData = Uint8Array.from(atob(base64String), c => c.charCodeAt(0));
        
        const iv = ivAndEncryptedData.slice(0, 12);
        const encryptedData = ivAndEncryptedData.slice(12);

        const decryptedData = await window.crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            key,
            encryptedData
        );

        const decoder = new TextDecoder();
        return decoder.decode(decryptedData);
    } catch (e) {
        console.error("Decryption failed:", e);
        localStorage.removeItem(ENCRYPTED_API_KEY_NAME);
        localStorage.removeItem(ENCRYPTION_KEY_NAME);
        return '';
    }
}

export function removeApiKey() {
    localStorage.removeItem(ENCRYPTED_API_KEY_NAME);
    localStorage.removeItem(ENCRYPTION_KEY_NAME);
    localStorage.removeItem('googleAiApiKey');
}

const RATE_LIMIT_COUNT = 5; // 5 requests per minute
const RATE_LIMIT_DURATION = 60 * 1000; // 1 minute in ms

export function checkRateLimit(key: string): { allowed: boolean; retryAfter?: number } {
    const recordsKey = `rate_limit_${key}`;
    const records = localStorage.getItem(recordsKey);
    const now = Date.now();

    if (!records) {
        localStorage.setItem(recordsKey, JSON.stringify([now]));
        return { allowed: true };
    }

    const timestamps: number[] = JSON.parse(records);
    const recentTimestamps = timestamps.filter(ts => now - ts < RATE_LIMIT_DURATION);

    if (recentTimestamps.length >= RATE_LIMIT_COUNT) {
        const oldestRequest = recentTimestamps.length > 0 ? recentTimestamps[0] : now;
        const retryAfter = Math.ceil((oldestRequest + RATE_LIMIT_DURATION - now) / 1000);
        return { allowed: false, retryAfter: Math.max(0, retryAfter) };
    }

    recentTimestamps.push(now);
    localStorage.setItem(recordsKey, JSON.stringify(recentTimestamps));
    return { allowed: true };
}

export function getCurrentProviderAndKey() {
  const provider = localStorage.getItem("llmProvider") || "google";
  const apiKey = localStorage.getItem(`apiKey_${provider}`) || "";
  return { provider, apiKey };
}
