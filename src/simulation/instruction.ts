/**
 * The base class for all instructions and related enums, etc.
 */

import { Element } from './element';
import { Organism } from './organism';
import { World } from './world';

/**
 * Possible results of an instruction do() function.
 * The default (return undefined) just advances to the next instruction
 */
export enum InstructionResult {
    DONT_ADVANCE, // don't advance to next instruction(used after an IF instruction succeeds)
    EXECUTE_AGAIN // execute the next instruction immediately
}

/**
 * Base class for instructions
 */
export abstract class Instruction {

    static readonly DEFAULT_ENERGY_IMPACT : number = -.5;
    static _allInstructions:[Instruction];
    static _instructionMap:{[code: string]: Instruction} = {};

    static allCodes:string = ''; // all the instructions in code form

    /**
     * Initialize and register this instruction
     */
    constructor(
        private _code:string,           // a letter or symbol
        private _description:string
        ) {

            Instruction.allCodes += _code;

            // fast lookup on code
            Instruction._instructionMap[_code] = this;

            // register this instruction in a static array
            if (! Instruction._allInstructions) {
                Instruction._allInstructions = [this];
            }
            else {
                Instruction._allInstructions.push(this);
            }
        }

    static get allInstructions():[Instruction] { return Instruction._allInstructions; }
    
    static instructionFromCode(code:string):Instruction {
        return Instruction._instructionMap[code];
    }
    get description():string { return this._description; }
    get code():string { return this._code; }

    abstract do(organism : Organism, world:World, element: Element):any;
}
