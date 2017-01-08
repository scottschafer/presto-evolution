import { Element } from './element';
import { ElementType } from './element';
import { Organism } from './organism';
import { Instruction } from './instruction';
import { World } from './world';
import { InstructionResult } from './instruction';

/********************
 * All instructions
 */
export class InstructionsAll {
    static all:Instruction[] = [];
}

/***********************************************************************
 |   "m": Move instruction
 ***********************************************************************/
export class InstructionMove extends Instruction {

    constructor() {
        super('m', 'Move the organism by one element in the current orientation of the head');
    }

    do(organism: Organism, world: World, element:Element) {
        organism.move(world, false);
    }
}
InstructionsAll.all.push(new InstructionMove());


/***********************************************************************
 |   "m": Move instruction
 ***********************************************************************/
export class InstructionMoveAndEat extends Instruction {

    constructor() {
        super('M', 'Move and eat any food or Photosyntheize cell in front of the head');
    }

    do(organism: Organism, world: World, element:Element) {
        organism.move(world, true);
    }
}
InstructionsAll.all.push(new InstructionMoveAndEat());

/***********************************************************************
 |   "H": hyper mode
 ***********************************************************************/
export class InstructionHyper extends Instruction {

    constructor() {
        super('H', 'Go to hypermode, execute more instructions per turn (resets at end)');
    }

    do(organism: Organism, world: World, element:Element) {
        organism.instructionsPerTurn = 3;
        return InstructionResult.EXECUTE_AGAIN;
    }
}
InstructionsAll.all.push(new InstructionHyper());


/***********************************************************************
 |   "*": Photosyntheize instruction
 ***********************************************************************/
export class InstructionPhotosynthesize extends Instruction {

    constructor() {
        super('*', 'Gains energy');
    }

    do(organism: Organism, world: World, element:Element) {
        /*
        if (! element.isOccluded) {
            organism.energy += world.parameters.energyGainedFromPhotosythesizing;
        } 
        */        
    }
}
InstructionsAll.all.push(new InstructionPhotosynthesize());

/***********************************************************************
 |   "Z": Sleep
 ***********************************************************************/
export class InstructionSleep extends Instruction {

    constructor() {
        super('Z', 'Sleep');
    }

    do(organism: Organism, world: World, element:Element) {
        organism.sleepCount += 5;
    }
}
InstructionsAll.all.push(new InstructionSleep());

/***********************************************************************
 |   "<": Turn left
 ***********************************************************************/
export class InstructionTurnLeft extends Instruction {

    constructor() {
        super('<', 'Turn left');
    }

    do(organism: Organism, world: World, element:Element) {
        organism.setOrientation((organism.headOrientation + 3) % 4);         
    }
}
InstructionsAll.all.push(new InstructionTurnLeft());

/***********************************************************************
 |   ">": Turn right
 ***********************************************************************/
export class InstructionTurnRight extends Instruction {

    constructor() {
        super('>', 'Turn right');
    }

    do(organism: Organism, world: World, element:Element) {
        organism.setOrientation((organism.headOrientation + 1) % 4);         
    }
}
InstructionsAll.all.push(new InstructionTurnRight());

/***********************************************************************
 |   "U": Orient up
 ***********************************************************************/
export class InstructionOrientUp extends Instruction {

    constructor() {
        super('U', 'Orient Up');
    }

    do(organism: Organism, world: World, element:Element) {
        organism.setOrientation(0);         
    }
}
InstructionsAll.all.push(new InstructionOrientUp());

/***********************************************************************
 |   "D": Orient down
 ***********************************************************************/
export class InstructionOrientDown extends Instruction {

    constructor() {
        super('D', 'Orient Down');
    }

    do(organism: Organism, world: World, element:Element) {
        organism.setOrientation(2);         
    }
}
InstructionsAll.all.push(new InstructionOrientDown());

/***********************************************************************
 |   "L": Orient left
 ***********************************************************************/
export class InstructionOrientLeft extends Instruction {

    constructor() {
        super('L', 'Orient Left');
    }

    do(organism: Organism, world: World, element:Element) {
        organism.setOrientation(3);         
    }
}
InstructionsAll.all.push(new InstructionOrientLeft());

/***********************************************************************
 |   "R": Orient right
 ***********************************************************************/
export class InstructionOrientRight extends Instruction {

    constructor() {
        super('R', 'Orient Right');
    }

    do(organism: Organism, world: World, element:Element) {
        organism.setOrientation(1);         
    }
}
InstructionsAll.all.push(new InstructionOrientRight());

/***********************************************************************
 |   "0": Test if facing food
 ***********************************************************************/
export class InstructionIfFoodFacing extends Instruction {

    constructor() {
        super('0', 'Test if facing food');
    }

    do(organism: Organism, world: World, element:Element) {
        if (! organism.testIfFacing(ElementType.FOOD, world)) {
            organism.doNotIf();
            return InstructionResult.DONT_ADVANCE;
        }
    }
}
InstructionsAll.all.push(new InstructionIfFoodFacing());

/***********************************************************************
 |   "1": Test if NOT facing food
 ***********************************************************************/
export class InstructionIfNotFoodFacing extends Instruction {

    constructor() {
        super('1', 'Test if NOT facing food');
    }

    do(organism: Organism, world: World, element:Element) {
        if (organism.testIfFacing(ElementType.FOOD, world)) {
            organism.doNotIf();
            return InstructionResult.DONT_ADVANCE;
        }
    }
}
InstructionsAll.all.push(new InstructionIfNotFoodFacing());

/***********************************************************************
 |   "2": Test if blocked
 ***********************************************************************/
export class InstructionIfBlocked extends Instruction {

    constructor() {
        super('2', 'Test if blocked');
    }

    do(organism: Organism, world: World, element:Element) {
        if (! organism.wasBlocked) {
            organism.doNotIf();
            return InstructionResult.DONT_ADVANCE;
        }
    }
}
InstructionsAll.all.push(new InstructionIfBlocked());

/***********************************************************************
 |   "3": Test if NOT blocked
 ***********************************************************************/
export class InstructionIfNotBlocked extends Instruction {

    constructor() {
        super('3', 'Test if NOT blocked');
    }

    do(organism: Organism, world: World, element:Element) {
        if (organism.wasBlocked) {
            organism.doNotIf();
            return InstructionResult.DONT_ADVANCE;
        }
    }
}
InstructionsAll.all.push(new InstructionIfNotBlocked());

/***********************************************************************
 |   "4": Flip coin, test if Heads
 ***********************************************************************/
export class InstructionIfRandom extends Instruction {

    constructor() {
        super('4', 'Flip coin, test if Heads');
    }

    do(organism: Organism, world: World, element:Element) {
        if (Math.random() < .5) {
            organism.doNotIf();
            return InstructionResult.DONT_ADVANCE;
        }
    }
}
InstructionsAll.all.push(new InstructionIfRandom());

/***********************************************************************
 |   "e": Else
 ***********************************************************************/
export class InstructionElse extends Instruction {

    constructor() {
        super('e', 'Else');
    }

    do(organism: Organism, world: World, element:Element) {
        organism.energy += world.parameters.energyTurnCost * .75;
        return InstructionResult.EXECUTE_AGAIN;
    }
}
InstructionsAll.all.push(new InstructionElse());

/***********************************************************************
 |   "r": Restart
 ***********************************************************************/
export class InstructionRestart extends Instruction {

    constructor() {
        super('r', 'Restart at beginning');
    }

    do(organism: Organism, world: World, element:Element) {
        organism.activeSegment = null;
//        organism.energy += world.parameters.energyTurnCost * .75;
        return InstructionResult.DONT_ADVANCE;
    }
}
InstructionsAll.all.push(new InstructionRestart());
