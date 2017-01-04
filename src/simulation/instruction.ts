/**
 * The various instructions, how they are displayed and what they do
 */

import { Element } from './element';
import { Organism } from './organism';
import { World } from './world';

export enum InstructionResult {
    DONT_ADVANCE,
    EXECUTE_AGAIN
}

/**
 * A definition for an instuction parameter that could be tweaked by the user. For example, how far can an organism see? 
 */
export class InstructionParameter {
    constructor(
        private _name:string,
        private _key:string,
        private _defaultValue:any
    ) {}

    get name():string { return this._name; }
    get key():string { return this._key; }
    get defaultValue():any { return this._defaultValue; }
}

/**
 * Base class for instructions
 */
export abstract class Instruction {

    static readonly DEFAULT_ENERGY_IMPACT : number = -.5;
    static _allInstructions:[Instruction];
    static _instructionMap:{[code: string]: Instruction} = {};

    private _parameters:any = {};

    static allCodes:string = ''; // all the instructions in code form

    /**
     * Initialize and register this instruction
     */
    constructor(
        private _code:string,           // a letter or symbol
        private _description:string,
        energyImpact:number = Instruction.DEFAULT_ENERGY_IMPACT,
        private _parameterDefinitions:[InstructionParameter] = null
        ) {

            Instruction.allCodes += _code;

            // fast lookup on code
            Instruction._instructionMap[_code] = this;

            // create the energy impact parameter, and add it to the definition array
            var energyImpactParam:InstructionParameter =
                new InstructionParameter("Energy impact", "energyImpact", Instruction.DEFAULT_ENERGY_IMPACT);
            if (this._parameterDefinitions == null) {
                this._parameterDefinitions = [energyImpactParam];
            }
            else {
                this._parameterDefinitions.push(energyImpactParam);
            }

            // now set up the default parameter values
            for (var i in this._parameterDefinitions) {
                var parameter:InstructionParameter = this._parameterDefinitions[i];
                this._parameters[parameter.key] = parameter.defaultValue;
            }

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
    get energyImpact():number { return this._parameters.energyImpact }

    abstract do(organism : Organism, world:World, element: Element):any;
}
