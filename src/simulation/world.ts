import { WorldParameters } from './world-parameters';
import { Element } from './element';
import { ElementType } from './element';
import { Instruction } from './instruction';
import { InstructionsAll } from './instructions-all';
import { Organism } from './organism';
import { Point } from './point';
import { Utils } from './utils';

//module LibSim {
    export class World {
        readonly MAX_WORLD_SIZE : number = 256;//1024;
        elements : Element[][];
        parameters: WorldParameters;
        headOrganism: Organism;
        numOrganisms: number = 0;
        turn: number = 1;

        foodElement:Element = new Element(ElementType.FOOD);
        barrierElement:Element = new Element(ElementType.BARRIER);

        // recycle killed organisms to reduce garbage collection
        headOrganismInactive: Organism;

        newObstacles:any = undefined;

        constructor(parameters: WorldParameters) {
            
            new InstructionsAll();

            this.parameters = parameters;

            this.elements = [];
            for (var i: number = 0; i < this.MAX_WORLD_SIZE; i++) {
                this.elements.push([]);

                for (var j: number = 0; j < this.MAX_WORLD_SIZE; j++) {
                    this.elements[i].push(null);
                }
            }

            this.reset();
        }

        /**
         * Remove all elements and organisms from the board
         */
        reset(): void {
            for (var i: number = 0; i < this.MAX_WORLD_SIZE; i++) {
                for (var j: number = 0; j < this.MAX_WORLD_SIZE; j++) {
                    this.elements[i][j] = null;
                }
            }
            this.headOrganism = null;
            this.headOrganismInactive = null;
            this.numOrganisms = 0;

            //var organism:Organism = this.createOrganism("M*MM", this.getEmptyLocation());

            for (var i: number = 0; i < this.parameters.initialFoodCount; i++) {
                var location: Point = this.getEmptyLocation();

                var organism:Organism = this.createOrganism("*", location);
                organism.energy = Utils.randRangeInt(-1000, organism.getSpawnEnergy(this));
            }
            /*
            organism.energy = Utils.randRangeInt(0, organism.getSpawnEnergy(this));

            for (var i: number = 0; i < this.parameters.initialFoodCount; i++) {
                var location: Point = this.getEmptyLocation();

                var organism:Organism = this.createOrganism("M", location);
                organism.energy = Utils.randRangeInt(0, organism.getSpawnEnergy(this));
            }
            */
        }

        validate(): void {
            var organism:Organism = this.headOrganism;
            while (organism) {
                var segment:Element = organism.headSegment;
                var lastX = segment.locationX;
                var lastY = segment.locationY;
                while (segment) {
                    if (segment.organism != organism) {
                        throw "segment organism bad";                        
                    }
                    var elementAtPosition = this.elements[segment.locationX][segment.locationY];
                    if (! elementAtPosition) {
                        throw "`xxx`";
                    }
                    if (elementAtPosition.organism != organism) {
                        throw "board is bad";
                    }
                    if (elementAtPosition.isOccluded) {
                        throw "element is occluded";
                    }

                    segment = segment.next;

                    if (segment) {
                        if (segment.locationX == lastX && segment.locationY == lastY) {
                            if (! segment.isOccluded) {
                                throw "should be occluded";
                            }
                        }
                        else {
                            if (segment.isOccluded) {
                                debugger;
                                throw "incorrectly occluded";
                            }
                        }
                        lastX = segment.locationX;
                        lastY = segment.locationY;
                    }
                }

                organism = organism.next;
            }
        }

        /**
         * Find and return an empty location on the board
         */
        getEmptyLocation(): Point {
            var result : Point = new Point();

            while (true) { // assume there will always be some empty location on the board
                result.randomize(WorldParameters.WORLDSIZE);
                if (this.elements[result.x][result.y] == null) {
                    return result;
                }
            }
        }

        /**
         * Put an element on the board
         */
        put(x:number, y:number, element:Element) {
            
            x &= 255;
            y &= 255;

                this.elements[x][y] = element;
/*
            if (element == null || ! this.elements[x][y]) {
                this.elements[x][y] = element;
            }
            else {
                if (element.organism != this.elements[x][y].organism) {
                        debugger;
                    throw "WHAT???"
                }
            }
*/            
            if (element) {
                element.locationX = x;
                element.locationY = y;
            }
        }

        /**
         * Get an element from the board
         */
        get(x:number, y:number):Element {
            //x = (x + this.parameters.size) % this.parameters.size;
            //y = (y + this.parameters.size) % this.parameters.size;
            return this.elements[x & 255][y & 255];
        }


        /**
         * Process the actions of all organisms on the board
         */

        
        turnCrank(): void {
            this.prepareObstacles();

            var organism:Organism = this.headOrganism;

            //console.log("turn #" + this.turn++);
            ++this.turn;
            var i = 0;

            while (organism) {
                if (i > 65535) {
                    debugger;
                }
//                var nextOrganism:Organism = organism.next;
                //this.validate();
                // die if energy is below zero
                var nextOrganism:Organism;
                nextOrganism = undefined;
                if ((organism.energy < 0 && organism.genome != '*') || organism.lifespan < 0) {
                    nextOrganism = organism.next;
                    this.killOrganism(organism);
                }
                else {
                    organism.turnCrank(this);
                    // spawn if energy is above threshhold
                    if (this.numOrganisms < this.parameters.maximumOrganisms) {
                        organism.spawnIfAble(this);
                    }
                }
                if (nextOrganism !== undefined) {
                    organism = nextOrganism;
                }
                else {
                    organism = organism.next;
                }
                ++i;
            }


            if ((this.turn % 100) == 0) {
                //this.validate();
            }

            if (this.parameters.foodDropSpeed) {
                if (this.parameters.foodDropSpeed >= 99 || ((this.turn % (100-this.parameters.foodDropSpeed)) == 0)) {
                    for (var i = 0; i < 5; i++) {
                        var location: Point = this.getEmptyLocation();
                        this.put(location.x, location.y, this.foodElement);
                    }
                }
            }
        }

        insert(genome:string) {
            var location: Point = this.getEmptyLocation();
            this.createOrganism(genome,location);
        }

        createOrganism(genome:string, location:Point):Organism {
            // ensure the world position is empty
            if (this.elements[location.x][location.y]) {
                return null;
            }

            // create the new organism and its segments

            var organism:Organism;
            var recycle:boolean = true;
            if (recycle && this.headOrganismInactive) {
                organism = this.headOrganismInactive;
                this.headOrganismInactive = this.headOrganismInactive.next;
                organism.next = organism.prev = null;
                organism.initialize(genome,location, this);
            }
            else {
                organism = new Organism(genome, location, this);
            }
            this.addOrganism(organism);
            return organism;
        }

        /**
         * Link the organism into the world
         */
        addOrganism(organism:Organism) {

            ++this.numOrganisms;

            var oldHead:Organism = this.headOrganism;
            this.headOrganism = organism;
            if (oldHead) {
                oldHead.prev = organism;
                organism.next = oldHead;
            }
        }

        killOrganism(organism:Organism, wasEaten:Boolean = false) {

            --this.numOrganisms;

            if (organism == this.headOrganism) {
                this.headOrganism = organism.next;
                if (this.headOrganism) {
                    this.headOrganism.prev = null;
                }
            }
            else {
                if (organism.next) {
                    organism.next.prev = organism.prev;
                }
                if (organism.prev) {
                    organism.prev.next = organism.next;
                }
            }

            var segment:Element = organism.headSegment;
            if (organism.genome == '*') {
                this.put(segment.locationX, segment.locationY, null);
                return;
            }

            while (segment) {
                this.put(segment.locationX, segment.locationY, null);
                segment = segment.next;
            }

            segment = organism.headSegment;

            while (segment) {
                if (segment.isOccluded) {
                    break;
                }

                if (! wasEaten) {
                    this.put(segment.locationX, segment.locationY, this.foodElement);
                }

                segment = segment.next;
            }

            organism.reset();
            organism.next = this.headOrganismInactive;
            this.headOrganismInactive = organism;
        }

        setObstacles(obstacles:number):void {
            this.newObstacles = obstacles;
        }

        private prepareObstacles(): void {
            if (this.newObstacles === undefined) {
                return;
            }
            var obstacles = this.newObstacles;
            this.newObstacles = undefined;

            // clear existing obstacles
            for (var x: number = 0; x < this.MAX_WORLD_SIZE; x++) {
                for (var y: number = 0; y < this.MAX_WORLD_SIZE; y++) {
                    if (this.elements[x][y] && this.elements[x][y].type == ElementType.BARRIER) {
                        this.put(x,y,null);
                    }
                }
            }

            var points:Point[] = [];
            switch (obstacles) {
                case 1:
                    for (var a = 0; a < 124; a++) {
                        points.push(new Point(a,a));
                        points.push(new Point(255-a,a));
                        points.push(new Point(a,255-a));
                        points.push(new Point(255-a,255-a));
                    }
                    break;
                case 2:
                    for (var a = 2; a < 254; a++) {
                        points.push(new Point(a,2));
                        points.push(new Point(a,253));
                        points.push(new Point(2,a));
                        points.push(new Point(253,a));
                    }
                    break;
            }

            var self = this;

            points.forEach(function(point:Point) {
                if (self.elements[point.x][point.y] && self.elements[point.x][point.y].organism) {
                    self.killOrganism(self.elements[point.x][point.y].organism, true);
                }
                self.put(point.x, point.y, self.barrierElement);
            });
        }
    }
//}