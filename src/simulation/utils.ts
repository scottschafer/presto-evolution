//module LibSim {
export class Utils {

    static randRangeInt(min:number, max:number):number {
        return Math.floor(min + (max - min + 1) * Math.random());
    }
}

//}