const { subtle } = globalThis.crypto;

const convertATOB = (text: string): string => Buffer.from(text, 'base64').toString('binary');
const convertBTOA = (text: string): string => Buffer.from(text, 'binary').toString('base64');

function ab2str(buf: ArrayBuffer): string {
    return String.fromCharCode.apply(null, new Uint8Array(buf) as any);
}

const ab2base64 = (buf: ArrayBuffer): string => convertBTOA(String.fromCharCode.apply(null, new Uint8Array(buf) as any));

async function exportPublicKey(key: CryptoKey): Promise<string> {
    const exported = await subtle.exportKey("spki", key);
    const exportedAsString = ab2str(exported);
    const exportedAsBase64 = convertBTOA(exportedAsString);
    return exportedAsBase64;
}

async function exportPrivateKey(key: CryptoKey): Promise<string> {
    const exported = await subtle.exportKey("pkcs8", key);
    const exportedAsString = ab2str(exported);
    const exportedAsBase64 = convertBTOA(exportedAsString);
    return exportedAsBase64;
}

function str2ab(str: string): ArrayBuffer {
    const buf = new ArrayBuffer(str.length);
    const bufView = new Uint8Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

function importPublicKey(key64: string): Promise<CryptoKey> {
    const binaryDerString = convertATOB(key64);
    const binaryDer = str2ab(binaryDerString);
    return subtle.importKey(
        "spki",
        binaryDer,
        {
            name: "RSA-OAEP",
            hash: "SHA-256",
        },
        true,
        ["encrypt"]
    );
}

function importPrivateKey(key64: string): Promise<CryptoKey> {
    const binaryDerString = convertATOB(key64);
    const binaryDer = str2ab(binaryDerString);
    return subtle.importKey(
        "pkcs8",
        binaryDer,
        {
            name: "RSA-OAEP",
            hash: "SHA-256",
        },
        true,
        ["decrypt"]
    );
}

function getMessageEncoding(text: string): Uint8Array {
    let enc = new TextEncoder();
    return enc.encode(text);
}

function getMessageDecoding(enc: ArrayBuffer): string {
    let dec = new TextDecoder();
    return dec.decode(enc);
}

function _arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = "";
    let bytes = new Uint8Array(buffer);
    let len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return convertBTOA(binary);
}

function _base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary_string = atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

export const generateKeys = async (): Promise<{ publicKey: string; privateKey: string }> => {
    const keys = await subtle.generateKey(
        {
            name: "RSA-OAEP",
            // Consider using a 4096-bit key for systems that require long-term security
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
    );
    return { publicKey: await exportPublicKey(keys.publicKey), privateKey: await exportPrivateKey(keys.privateKey) };
};

export async function encryptData(plaintext: string, publicKey: string): Promise<string> {
    let encoded = getMessageEncoding(plaintext);
    const encryptedData = await subtle.encrypt(
        {
            name: "RSA-OAEP",
        },
        await importPublicKey(publicKey),
         encoded
    ); 
    return ab2base64(encryptedData)
}

export async function decryptData(ciphertext: string, privateKey: string): Promise<string> {
    console.log(`ciphertext: `, ciphertext)
    const decryptedData = await subtle.decrypt(
        { name: "RSA-OAEP" },
        await importPrivateKey(privateKey),
        _base64ToArrayBuffer(ciphertext)
    );
    return getMessageDecoding(decryptedData)
}