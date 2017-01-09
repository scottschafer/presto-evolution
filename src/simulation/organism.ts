import { Element } from './element';
import { ElementType } from './element';
import { World } from './world';
import { Point } from './point';
import { GenomeColorMap } from './genome-color-map';
import { Instruction } from './instruction';
import { Utils } from './utils';
import { InstructionResult } from './instruction';

export class Organism {

    genome: string;
    headSegment: Element;
    tailSegment: Element;
    activeSegment: Element;
    colorRGBA: number;

    // which way is the head pointing?
    headOrientation:number;
    headDirectionX: number;
    headDirectionY: number;

    // lifespan:
    lifespan: number;

    energy: number;
    numExposedPhotosynthesizeCells:number;
    sleepCount: number;
    wasBlocked:boolean;
    instructionsPerTurn: number;

    // for the linked list
    next:Organism;
    prev:Organism;

    constructor(genome:string, location:Point, world:World) {     
        this.initialize(genome, location, world);   
    }

    reset(world:World):void {
        this.numExposedPhotosynthesizeCells = 0;
        this.sleepCount = 0;
        this.wasBlocked = false;
        this.instructionsPerTurn = 1;

        // return all elements to the recycle pool
        var element:Element = this.headSegment;
        while (element) {
            var nextElement:Element = element.next;
            element.next = world.headElementInactive;
            world.headElementInactive = element;
            element = nextElement;
            world.headElementInactive.reset();
        }

        this.headSegment = this.tailSegment = this.activeSegment = null;
        this.next = this.prev = null;
    }

    initialize(genome:string, location:Point, world:World): void {
        this.reset(world);
        this.genome = genome;
        for (var i:number = 0; i < genome.length; i++) {
            var isOccluded = genome.length > 1;
            var element:Element = this.addSegment(genome[i], location, world, isOccluded);
        }
        if (genome == '*') {
            this.numExposedPhotosynthesizeCells = 1;
        }

        this.energy = 100 * genome.length;
        this.lifespan = world.parameters.lifespanPerSegment * genome.length;

        var randomizationLifespan = 1 +
            Utils.randRangeInt(-world.parameters.lifespanRandomizationPercent, world.parameters.lifespanRandomizationPercent) / 100;
        this.lifespan *= randomizationLifespan;

        this.randomizeOrientation();

        // get the color to use to display this genome
        this.colorRGBA = GenomeColorMap.getColorForGenome(genome).rgba;
    }

    addSegment(code:string, location:Point, world:World, isOccluded:boolean):Element {
        
        var instruction:Instruction = Instruction.instructionFromCode(code);
        if (! instruction) {
            throw "Unknown instruction: " + code;
        }

        var element:Element;
        var type:ElementType = (code == "*") ? ElementType.FOOD : ElementType.ORGANISM;
        if (world.headElementInactive) {
            element = world.headElementInactive;
            world.headElementInactive = world.headElementInactive.next;
            element.initialize(type, this);
        }
        else {
            element = new Element(type, this);
        }

        element.isOccluded = isOccluded;
        element.instruction = instruction;
        
        if (! this.headSegment) {
            this.headSegment = element;
        }
        if (this.tailSegment) {
            this.tailSegment.next = element;
        }
        this.tailSegment = element;

        if (isOccluded) {
            element.locationX = location.x; 
            element.locationY = location.y; 
        }
        else {
            world.put(location.x, location.y, element);
        }
        return element;
    }


    /**
     * Execute the action of the current segment and make the next segment active
     */
    turnCrank(world:World) {
        var count = this.instructionsPerTurn;
        var originalCount = count;
        --this.lifespan;

        while (count--) {
            if (this.sleepCount) {
                --this.sleepCount;
                ++this.lifespan;
                continue;
            }

            // get the photosynthesis energy (does not accrue while sleeping)
            if (this.numExposedPhotosynthesizeCells && ! this.sleepCount) {
                this.energy += world.parameters.energyGainedFromPhotosythesizing +
                    (this.numExposedPhotosynthesizeCells - 1) * (world.parameters.energyGainedFromPhotosythesizing - world.parameters.energyTurnCost);
            }

            if (! this.activeSegment) {
                this.activeSegment = this.headSegment;
                this.instructionsPerTurn = 1;
                count = 0;
            }
            // adjust organism's energy by the instruction's impact
            this.energy -= world.parameters.energyTurnCost;

            // perform action
            var result = this.activeSegment.instruction.do(this, world, this.activeSegment);
                
            if ( result !== InstructionResult.DONT_ADVANCE) {

                // advance to the next segment/instruction
                if (this.activeSegment) {
                    this.activeSegment = this.activeSegment.next;
                }
            }

            if (result == InstructionResult.EXECUTE_AGAIN) {
                if (this.activeSegment) {
                    ++count;
                }
                else {
                    break;
                }
            }
        }
    }


    randomizeOrientation() {
        this.setOrientation(Utils.randRangeInt(0, 4) % 3);
    }

    setOrientation(orientation:number) {
        this.headOrientation = orientation;
        switch (orientation) {
            default:
                this.headDirectionX = 0;
                this.headDirectionY = -1;
                break;
            case 1:
                this.headDirectionX = 1;
                this.headDirectionY = 0;
                break;
            case 2:
                this.headDirectionX = 0;
                this.headDirectionY = 1;
                break;
            case 3:
                this.headDirectionX = -1;
                this.headDirectionY = 0;
                break;
        }
    }


    move(world:World, andEat:Boolean) {
        this.wasBlocked = false;

        this.headSegment.isOccluded = false;
        var destinationX:number = (this.headSegment.locationX + this.headDirectionX) & 255;
        var destinationY:number = (this.headSegment.locationY + this.headDirectionY) & 255;

        var elementAtDestination:Element = world.get(destinationX, destinationY);

        // if this is a Move & Eat instruction, and we are moving onto simple food, then gain energy and don't be blocked
        if (andEat && elementAtDestination && elementAtDestination.type == ElementType.FOOD && ! elementAtDestination.organism) {
            this.energy += world.parameters.spawnEnergyPerSegment * world.parameters.digestionEfficiency / 100;
            world.put(destinationX, destinationY, null);
            elementAtDestination = null;
        }

        if (elementAtDestination == null) {
            // there was nothing in the way, so move
            var element:Element = this.headSegment;

            var index = 0;
            while (element) {
                var lastX:number = element.locationX;
                var lastY:number = element.locationY;

                world.put(destinationX, destinationY, element);
                if (element.isOccluded) {
                    if (element.instruction.code === '*') {
                        ++this.numExposedPhotosynthesizeCells;
                    }
                    element.isOccluded = false;
                    break;
                }
                
                destinationX = lastX;
                destinationY = lastY;
                element = element.next;

                if (! element) {
                    world.put(destinationX, destinationY, null);
                }
            }
        }
        else {
            this.wasBlocked = true;
            if (andEat && elementAtDestination.organism != this) {
                switch (elementAtDestination.type) {
                    case ElementType.FOOD:
                        this.wasBlocked = false;
                        if (elementAtDestination.organism) {

                            var energyGain =
                                Math.max(0 /*world.parameters.lifespanPerSegment*/, 
                                    Math.min(elementAtDestination.organism.energy, world.parameters.biteStrength));
                            this.energy += energyGain * world.parameters.digestionEfficiency / 100;
                            elementAtDestination.organism.energy -= world.parameters.biteStrength;
                            if (elementAtDestination.organism.energy < 0) {
                                world.killOrganism(elementAtDestination.organism, true);
                            }
                        }
                        else {
                            this.energy += world.parameters.spawnEnergyPerSegment * world.parameters.digestionEfficiency / 100;
                            world.put(destinationX, destinationY, null);
                        }
                        break;
                }
            }
        }


        // does the energy cost for moving apply when an organism attempted to move but was blocked?
        
        // I really don't want to reward critters that curl up into a ball, as it makes for an uninteresting simulation, although it is
        // an effective defense. For now, the compromise is that if a critter attempts to move but is blocked, it loses half the energy
        // than it would had it moved.
        var energyCost = andEat ? world.parameters.energyMoveAndEatCost : world.parameters.energyMoveCost;
        if (this.wasBlocked) {
            energyCost /= 2;
        } 
        this.energy -= energyCost;

        // validate
        var validateOrganismAfterMove:Boolean = false;//true;
        var validateBoardAfterMove:Boolean = false;

        var locationMap:any = {};
        if (validateOrganismAfterMove) {
            var element:Element = this.headSegment;

            var index = 0;
            while (element) {
                var key:string = element.locationX + ',' + element.locationY;
                locationMap[key] = true;

                if (! element.isOccluded) {
                    if (world.get(element.locationX, element.locationY).organism != this) {
                        debugger;
                    }
                }
                if (! element.next && element != this.tailSegment) {
                    debugger;
                }
                element = element.next;
            }
        }

        if (validateBoardAfterMove) {
            for (var x = 0; x < 256; x++) {
                for (var y = 0; y < 256; y++) {
                    element = world.get(x, y);
                    if (element && element.organism == this) {
                        
                        var key:string = x + ',' + y;
                        if (! locationMap[key]) {
                            debugger;
                        }
                    }
                }
            }
        }

    }


    testIfFacing(elementType:ElementType, world:World, distance:number = 15): boolean {

        var locationX:number = this.headSegment.locationX;
        var locationY:number = this.headSegment.locationY;

        var photosynthesizeInstruction = Instruction.instructionFromCode('*');

        while (distance--) {
            locationX = (locationX + this.headDirectionX) & 255; // wrap
            locationY = (locationY + this.headDirectionY) & 255;
            var element = world.get(locationX, locationY);
            if (element) {
                if (element.organism == this) {
                    return false; // we saw ourselves, so no
                }
                if (element.type == elementType) {
                    return true;
                }
            }
        }
        return false;
    }

    doNotIf():void {
        // for now, just skip an instruction
        if (this.activeSegment) {
            var next:Element = this.activeSegment.next; //skip to end
            
            // search for Else instruction
            var testNext:Element = this.activeSegment.next;
            while (testNext) {
                if (testNext.instruction.code == 'e') {
                    next = testNext;
                    break;
                }
                testNext = testNext.next;
            } 
            this.activeSegment = next;
            if (this.activeSegment) {
                this.activeSegment = this.activeSegment.next;
            }
        }
    }

    getSpawnEnergy(world:World):number {
        return world.parameters.spawnEnergyPerSegment * this.genome.length;
    }

    spawnIfAble(world:World) {
        if (this.energy < this.getSpawnEnergy(world)) {
            return;
        }

        // start with a copy of the parent's genome
        var genome:string = this.genome;

        // possibly mutate the genome of the offspring
        var mutationChance = Utils.randRangeInt(0, 100);
        if (mutationChance < world.parameters.mutationRate) {
            genome = this.mutateGenome(genome);
        }

        // create the child just behind the tail
        //var worldSize:number = world.parameters.size;

        var locationX = (this.tailSegment.locationX - this.headDirectionX) & 255;
        var locationY = (this.tailSegment.locationY - this.headDirectionY) & 255;

        if (world.get(locationX, locationY) != null) {
            for (var dx:number = -1; dx <= 1; dx++) {
                for (var dy:number = -1; dy <= 1; dy++) {
                    var nx = (this.tailSegment.locationX + dx) & 255;
                    var ny = (this.tailSegment.locationY + dy) & 255;
                    if (dx && dy && world.get(nx, ny) == null) {
                        locationX = nx;
                        locationY = ny;
                        dx = 10;
                        break;
                    }
                }
            } 
        }
        if (world.get(locationX, locationY) == null) {
            var child:Organism = new Organism(genome, new Point(locationX, locationY), world);

            // divide the energy between the parent and the child
            this.energy = child.energy = this.energy / 2;

            world.addOrganism(child);
        }
        else {
            //this.energy /= 2;
        }
    }

    private mutateGenome(genome:string): string {

        // 0 = random insertion
        // 1 = random deletion
        // 2 = random change of existing instruction
        // 3 = random swapping of two adjacent instructions
        var mutationType = Utils.randRangeInt(0,3);

        var allInstructions:string = Instruction.allCodes;

        var newGenome = '';
        switch (mutationType) {
            case 0:
            // copy the genome, randomly inserting one instruction
                var whereIndex = Utils.randRangeInt(0, genome.length);
                for (var i = 0; i <= genome.length; i++) {
                    if (i == whereIndex) {
                        newGenome += allInstructions[Utils.randRangeInt(0, allInstructions.length - 1)];
                    }
                    if (i < genome.length) {
                        newGenome += genome[i];
                    }
                }
                break;

            case 1:
                // randomly remove one instruction (if there's more than one to begin with)
                if (genome.length == 1) {
                    newGenome = genome;
                }
                else {
                    var whereIndex = Utils.randRangeInt(0, genome.length - 1);
                    for (var i = 0; i < genome.length; i++) {
                        if (i != whereIndex) {
                            newGenome += genome[i];
                        }
                    }
                }
                break;

            case 2:
                // randomly change an existing instruction
                var whereIndex = Utils.randRangeInt(0, genome.length - 1);
                for (var i = 0; i < genome.length; i++) {
                    if (i == whereIndex) {
                        newGenome += allInstructions[Utils.randRangeInt(0, allInstructions.length - 1)];
                    }
                    else {
                        newGenome += genome[i];
                    }
                }
                break;

            case 3:
                // randomly swap two instructions
                if (genome.length == 1) {
                    newGenome = genome;
                }
                else if (genome.length == 2) {
                    newGenome = genome[1] + genome[0];
                }
                else {
                    var whereIndex = Utils.randRangeInt(0, genome.length - 2);
                    for (var i = 0; i < genome.length; i++) {
                        if (i == whereIndex) {
                            // swap
                            newGenome += genome[i+1] + genome[i];
                            ++i;
                        }
                        else {
                            newGenome += genome[i];
                        }
                    }
                }
                break;
        
        }
        return newGenome;
    }

    serialize() {

        var result = {
            genome: this.genome,
            headOrientation: this.headOrientation,
            headDirectionX: this.headDirectionX,
            headDirectionY: this.headDirectionY,
            lifespan: this.lifespan,
            energy: this.energy,
            sleepCount: this.sleepCount,
            wasBlocked: this.wasBlocked,
            instructionsPerTurn: this.instructionsPerTurn,
            positions: [],
            activeSegment: 0
        };

        var e:Element = this.headSegment;
        var i = 0;
        while (e) {
            if (e == this.activeSegment) {
                result.activeSegment = i;
            }
            result.positions.push({x:e.locationX,y:e.locationY});
            e = e.next;
            ++i;
        }

        return result;
    }

    deserialize(data, world:World) {
        //this.initialize(data.genome, new Point(data.positions[0].x,data.positions[0].y), world);
        this.headOrientation = data.headOrientation;
        this.headDirectionX = data.headDirectionX;
        this.headDirectionY = data.headDirectionY;
        this.lifespan = data.lifespan;
        this.energy = data.energy;
        this.sleepCount = data.sleepCount;
        this.wasBlocked = data.wasBlocked;
        this.instructionsPerTurn = data.instructionsPerTurn;

        var e:Element = this.headSegment;
        var i = 0;
        while (e) {
            if (i == data.activeSegment) {
                this.activeSegment = e;
            }
            world.put(data.positions[i].x, data.positions[i].y, e);
            if (i == 0) {
                e.isOccluded = false;
            }
            else {
                e.isOccluded = (data.positions[i].x == data.positions[i-1].x) && (data.positions[i].y == data.positions[i-1].y); 
            }
            e = e.next;
            ++i;
        }

    }
}
