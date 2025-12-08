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

    const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
    const numberChars = "0123456789";
    const symbolChars = "!@#$%^&*()_+~`|}{[]:;?><,./-=";

    let charPool = "";
    if (hasUppercase) charPool += uppercaseChars;
    if (hasLowercase) charPool += lowercaseChars;
    if (hasNumbers) charPool += numberChars;
    if (hasSymbols) charPool += symbolChars;

    if (charPool.length === 0) {
        charPool = lowercaseChars;
    }

    let password = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charPool.length);
        password += charPool.charAt(randomIndex);
    }

    return password;
}