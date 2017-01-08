
import {Organism} from "./organism";
import {Instruction} from "./instruction";

/**
 * Element - something that occupies one of the cells on the 2D board. 
 * 
 * Could be a segment of a critter, or something inanimate (food or barrier)
 */

export enum ElementType {
	BARRIER,
	FOOD,
	POISON,
	ORGANISM
}

export class Element {

	type: ElementType;      // the type of this element
	
	organism: Organism;    // the parent organism, or null if this is not alive
	next: Element;         // if in an organism, a reference to the next cell
	instruction: Instruction;
	locationX: number;
	locationY: number;
	isOccluded: boolean; 

	constructor(type: ElementType, organism : Organism = null) {
		this.initialize(type, organism);
	}

	reset() {
		this.organism = null;
		this.next = null;
		this.instruction = null;
	}
	
	initialize(type: ElementType, organism : Organism = null) {
		this.type = type;
		this.organism = organism;

		if (type == ElementType.ORGANISM && ! organism) {
			throw 'Element must have an organism object if of ORGANISM type!';
		}
	}
}
