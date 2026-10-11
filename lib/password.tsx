export interface PasswordConfig {
    hasLowercase?: boolean
    hasUppercase?: boolean
    hasNumbers?: boolean
    hasSymbols?: boolean
    length?: number
}

export const generatePassword = ({
    hasLowercase = true,
    hasUppercase = false,
    hasNumbers = false,
    hasSymbols = false,
    length = 8
}: PasswordConfig = {}) => {

    if (!Number.isInteger(length) || length < 4 || length > 128) {
        throw new RangeError('La longitud debe estar entre 4 y 128.');
    }
    const groups = [
        hasLowercase && 'abcdefghijklmnopqrstuvwxyz',
        hasUppercase && 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        hasNumbers && '0123456789',
        hasSymbols && '!@#$%^&*()_+~`|}{[]:;?><,./-=',
    ].filter((group): group is string => Boolean(group));
    if (!groups.length) {
        throw new RangeError('Selecciona al menos un grupo de caracteres.');
    }
    const pool = groups.join('');
    const chars = groups.map(group => group[randomIndex(group.length)]);
    while (chars.length < length) chars.push(pool[randomIndex(pool.length)]);
    for (let i = chars.length - 1; i > 0; i--) {
        const j = randomIndex(i + 1);
        [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    return chars.join('');
}

function randomIndex(size: number) {
    const byte = new Uint8Array(1);
    const ceiling = 256 - (256 % size);
    do { globalThis.crypto.getRandomValues(byte); } while (byte[0] >= ceiling);
    return byte[0] % size;
}
