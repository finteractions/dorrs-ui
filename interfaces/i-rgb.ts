export interface IRGB {
    red: number;
    green: number;
    blue: number;

    toStyleString: (percentage: number) => {}
}

export class RGB implements IRGB {
    red: number;
    green: number;
    blue: number;

    constructor(_red: number, _green: number, _blue: number) {
        this.red = _red;
        this.green = _green;
        this.blue = _blue;
    }

    toStyleString = (percentage: number) => {
        if (this.red === 0 && this.green === 0 && this.blue === 0) {
            return {};
        } else {
            return {backgroundColor: `rgb(${this.red}, ${this.green}, ${this.blue}, ${percentage}`}
        }
    }

}
