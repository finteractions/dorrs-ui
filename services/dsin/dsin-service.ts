function generate(value: string): string {
    if (value === '') return '';

    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    const numericPart = value.split("").map((char) => {
        if (alphabet.includes(char)) {
            return (alphabet.indexOf(char) + 10).toString();
        } else {
            return char;
        }
    }).join("");

    const digits = numericPart.split("").map(Number);

    for (let i = 0; i < digits.length; i += 2) {
        digits[i] = (digits[i] * 2) % 9;
    }

    const sum = digits.reduce((acc, curr) => acc + curr, 0);

    const checkDigit = sum % 10;

    return `${numericPart}${checkDigit}`;
}

const dsinService = {
    generate
}

export default dsinService;
