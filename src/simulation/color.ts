export class Color {
    private _r : number = 0;
    private _g : number = 0;
    private _b : number = 0;
    private _a : number = 0;
    private _rgba: number = 0;
    
    public static readonly isLittleEndian: boolean = (function():boolean {
        var buf:any = new ArrayBuffer(4);
        var data32 = new Uint32Array(buf);
        var data8 = new Uint8Array(buf);
        
    // Determine whether Uint32 is little- or big-endian.
        data32[0] = 0x0a0b0c0d;
        
        var isLittleEndian = true;
        if (data8[0] === 0x0a && data8[1] === 0x0b && data8[2] === 0x0c && data8[3] === 0x0d) {
            return false;
        }
        return true;
    })();

    constructor(r : number, g : number = null, b : number = null, a : number = 255) {

        if (g === null) {
            if (Color.isLittleEndian) {
                this._b = (r >> 16) & 0xff;
                this._g = (r >> 8) & 0xff;
                this._r = (r) & 0xff;
                this._a = 255;
            }
            else {
                this._a = (r >> 16) & 0xff;
                this._r = (r >> 8) & 0xff;
                this._g = (r) & 0xff;
                this._b = 255;
            }
            this._rgba = r;
            return; 
        }
        else {
            this._r = r;
            this._g = g;
            this._b = b;
            this._a = a;
        }

        if (Color.isLittleEndian) {
            this._rgba = this._a << 24 | this._b << 16 | this._g << 8 | this._r;
        }
        else {
            this._rgba = this._r << 24 | this._g << 16 | this._b << 8 | this._a;
        }
    }

    get r(): number {
        return this._r;
    }

    get g(): number {
        return this._g;
    }

    get b(): number {
        return this._b;
    }

    get rgba(): number {
        return this._rgba;
    }

    getAsCSS(): string {
        return "rgba(" + this._r + "," + this._g + "," + this._b + "," + this._a + ")";
    }
}
