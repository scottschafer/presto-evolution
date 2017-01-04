//module LibSim {
    export class Point {
        x: number;
        y: number;
        
        constructor(x: number = 0, y: number = 0) {
            this.x = x;
            this.y = y;
        }
        
        add(point: Point) {
            return new Point(this.x + point.x, this.y + point.y);
        }

        randomize(size: number) {
            this.x = Math.floor(size * Math.random());
            this.y = Math.floor(size * Math.random());        
        }
    }
//}