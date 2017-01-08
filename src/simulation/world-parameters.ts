export class WorldParameters {

  static readonly WORLDSIZE: number = 256;

  // simulation parameters
  speed: number = 10;
  maximumOrganisms:number = 30000;
  initialSeedCount: number = 1000;
  foodDropSpeed: number = 50;

  // the percentage of times a newly spawned offspring will have a mutation
  mutationRate: number = 15;

  // the amount of energy required to spawn a new offspring
  spawnEnergyPerSegment: number = 250;

  // lifespan
  lifespanPerSegment: number = 25000;
  lifespanRandomizationPercent: number = 10;

  energyTurnCost: number = 1;
  energyMoveCost: number = 4;
  energyMoveAndEatCost: number = 15;
  energyGainedFromPhotosythesizing: number = 1.25;
  biteStrength: number = 500;
  digestionEfficiency:number = 75;

  constructor() {
  }
}