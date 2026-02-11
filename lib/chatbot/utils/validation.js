/**
 * Validates an Ecuadorian ID (Cédula) using the Modulo 10 algorithm.
 * @param {string} cedula - 10-digit ID string.
 * @returns {boolean} - True if valid.
 */
export function validateCedula(cedula) {
    if (!cedula || typeof cedula !== 'string') return false;

    // 1. Must be numeric and 10 digits
    const cleanCedula = cedula.replace(/\D/g, '');
    if (cleanCedula.length !== 10) return false;

    // 2. Province code (first 2 digits) must be 01-24 or 30
    const province = parseInt(cleanCedula.substring(0, 2));
    if (!((province >= 1 && province <= 24) || province === 30)) return false;

    // 3. Third digit must be < 6 for natural persons
    const thirdDigit = parseInt(cleanCedula.charAt(2));
    if (thirdDigit >= 6) return false;

    // 4. Modulo 10 logic
    const coeficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let sum = 0;

    for (let i = 0; i < coeficients.length; i++) {
        let val = parseInt(cleanCedula.charAt(i)) * coeficients[i];
        if (val >= 10) val -= 9;
        sum += val;
    }

    const checkDigit = parseInt(cleanCedula.charAt(9));
    const nextTen = Math.ceil(sum / 10) * 10;
    const computedCheckDigit = (nextTen - sum) % 10;

    return checkDigit === computedCheckDigit;
}
