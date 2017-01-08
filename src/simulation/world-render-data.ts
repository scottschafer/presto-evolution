import { World } from './world';
import { Color } from './color';
import { ElementType } from './element';
import { WorldParameters } from './world-parameters';

/** 
 * A transfer object that is sent from the worker thread to the main rendering thread instructing it what to render.
 */

export class WorldRenderData {
    static _pixels: ArrayBuffer;
    static lastTopCritters: string;

    static elapsedTurns: number = 0;
    static startTime: number = 0;
    
    topTenList: any;
    pixels: ArrayBuffer;
    serializedWorld: string;
    turnsPerSecond: number;

    constructor(world: World, determineTopTen: boolean = false) {
        this.preparePixels(world);
        if (determineTopTen) {
            this.determineTopTenList(world);

            /*

            for now, skip this...

            var topTen: string = JSON.stringify(this.topTenList);
            // whenever the list changes, serialize the world
            if (WorldRenderData.lastTopCritters != topTen) {

                WorldRenderData.lastTopCritters = topTen;
                this.serializedWorld = JSON.stringify(world.serialize());
            }
            */
        }
    }

    private preparePixels(world: World) {
        var dim = WorldParameters.WORLDSIZE;
        var byteLength = dim * dim * 4;
        if (WorldRenderData._pixels == null || WorldRenderData._pixels.byteLength != byteLength) {
            WorldRenderData._pixels = new ArrayBuffer(byteLength);
        }
        this.pixels = WorldRenderData._pixels;
        var outBuffer = new Uint32Array(this.pixels);

        var black: number = new Color(0, 0, 0).rgba;
        var gray: number = new Color(128, 128, 128).rgba;
        var green: number = new Color(0, 255, 0).rgba;
        var darkgreen: number = new Color(0, 128, 0).rgba;

        var i: number = 0;
        for (var x: number = 0; x < dim; x++) {
            for (var y: number = 0; y < dim; y++) {
                var element = world.elements[x][y];

                if (element) {
                    switch (element.type) {
                        case ElementType.BARRIER:
                            outBuffer[i++] = gray;
                            break;

                        case ElementType.FOOD:
                            outBuffer[i++] = element.organism ? green : darkgreen;
                            break;

                        case ElementType.ORGANISM:
                            outBuffer[i++] = element.organism.colorRGBA;
                            break;
                    }
                }
                else {
                    outBuffer[i++] = black;
                }
            }
        }
    }

    private determineTopTenList(world: World) {

        // determine FPS
        var curTime = new Date().getTime();
        if (WorldRenderData.startTime) {
            this.turnsPerSecond = 1000 * WorldRenderData.elapsedTurns / (curTime - WorldRenderData.startTime);
        }
        WorldRenderData.startTime = curTime;
        WorldRenderData.elapsedTurns = 0;

        var genomesToCounts: any = {};
        var organism = world.headOrganism;
        while (organism) {
            var genome = organism.genome;
            if (genomesToCounts.hasOwnProperty(genome)) {
                ++genomesToCounts[genome].count;
            }
            else {
                genomesToCounts[genome] = {
                    genome: genome,
                    count: 1,
                    color: new Color(organism.colorRGBA).getAsCSS()
                }
            }
            organism = organism.next;
        }

        var sortedArray = [];
        for (var key in genomesToCounts) {
            sortedArray.push(genomesToCounts[key]);
        }
        sortedArray.sort(function (a, b) {
            return b.count - a.count;
        });

        this.topTenList = sortedArray.slice(0, 10);
        while (this.topTenList.length < 10) {
            this.topTenList.push({
                genome: ' - ',
                count: ' ',
                color: 'white'
            });
        }
    }

    getTransferableData() {
        var result = [];
        result.push(this.pixels);
        return result;
    }
}
