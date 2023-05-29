const { subtle } = globalThis.crypto;

const ab2base64 = (buf: ArrayBuffer) => window.btoa(String.fromCharCode.apply(null, new Uint8Array(buf) as any));

function _base64ToArrayBuffer(base64: string) {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

async function deriveKey(password: string, salt: string, iterations: number, keyLength: number, digest: string) {
    const pwUtf8 = new TextEncoder().encode(password);
    const saltUtf8 = new TextEncoder().encode(salt);
    const importedKey = await subtle.importKey(
        'raw',
        pwUtf8,
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
    );
    const derivedKeyArray = await subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: saltUtf8,
            iterations,
            hash: { name: digest }
        },
        importedKey,
        keyLength * 8
    );
    return new Uint8Array(derivedKeyArray);
}

export async function encryptDeriveAES(plaintext: string, password: string) {
    const key = await deriveKey(password, "my_salt", 100000, 32, 'SHA-256');
    const iv = crypto.getRandomValues(new Uint8Array(16));
    const alg = { name: 'AES-CBC', iv: iv };
    const keyObject = await subtle.importKey('raw', key, alg, false, ['encrypt']);
    const plaintextArray = new TextEncoder().encode(plaintext);
    const encryptedArray = await subtle.encrypt(alg, keyObject, plaintextArray);
    return { encrypted: ab2base64(Array.from(new Uint8Array(encryptedArray)) as any), iv: ab2base64(Array.from(iv) as any) };
}

export async function decryptDeriveAES(encrypted: string, password: string, iv: string) {
    const key = await deriveKey(password, "my_salt", 100000, 32, 'SHA-256');
    const alg = { name: 'AES-CBC', iv: new Uint8Array(_base64ToArrayBuffer(iv)) };
    const keyObject = await subtle.importKey('raw', key, alg, false, ['decrypt']);
    const encryptedArray = new Uint8Array(_base64ToArrayBuffer(encrypted));
    const decryptedArray = await subtle.decrypt(alg, keyObject, encryptedArray);
    return new TextDecoder().decode(decryptedArray);
}

const test = async () => {
    const plaintext = `my_plaintext`,
        password = `my_password`
    const { encrypted, iv } = await encryptDeriveAES(plaintext, password)
    const decrypted = await decryptDeriveAES(encrypted, password, iv)
    console.log({ encrypted, iv })
    console.log({ decrypted })
}

// test();