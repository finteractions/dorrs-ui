function generate(value: string): string {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    const numericPart = value.split("").map((char) => {
        if (alphabet.includes(char)) {
            return (alphabet.indexOf(char) + 10).toString();
        } else {
            return char;
        }
    }).join("");

    const paddedNumericPart = numericPart.padEnd(8, "0");

    const digits = paddedNumericPart.split("").map(Number);

    for (let i = 0; i < digits.length; i += 2) {
        digits[i] = (digits[i] * 2) % 9;
    }

    const sum = digits.reduce((acc, curr) => acc + curr, 0);

    const checkDigit = sum % 10;

    return `${paddedNumericPart}${checkDigit}`;
}

const dsinService = {
    generate
}

export default dsinService;
