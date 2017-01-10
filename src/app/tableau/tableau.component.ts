/**
 * The "tableau" component allows you to inspect a given critter, step through it and watch its behavior.
 * 
 * Currently this is just used in the about component, but it might be nice in the future to be able to click
 * on an organism and view it in this UI. 
 */

import { Component, OnInit, ElementRef } from '@angular/core';
import { World } from '../../simulation/world';
import { WorldParameters } from '../../simulation/world-parameters';
import { Organism } from '../../simulation/organism';
import { Instruction } from '../../simulation/instruction';
import { Element } from '../../simulation/element';
import { ElementType } from '../../simulation/element';

declare var $: any;

@Component({
  selector: 'tableau',
  templateUrl: './tableau.component.html',
  styleUrls: ['./tableau.component.scss'],
  inputs: ['sample', 'parameters', 'genome', 'displayed']
})
export class TableauComponent implements OnInit {

  static readonly NUM_SAMPLES = 80;

  sample: Object;
  parameters:WorldParameters;
  displayed: boolean = false;

  turn: number = 0;
  world: World;
  samples: any;
  organism: Organism;
  maxEnergy: number;
  instructions: Array<Instruction>;
  currentInstructionIndex: number;

  boundingX: number;
  boundingY: number;
  boundingW: number;
  boundingH: number;

  timePerFrame: number = 500;
  playing: boolean = true;

  private canvas: HTMLCanvasElement;

  constructor(private elementRef: ElementRef) {
  }

  ngOnInit() {
    this.canvas = $(this.elementRef.nativeElement).find('canvas')[0];

    if (! this.parameters) {
      this.parameters = new WorldParameters();
      this.parameters.initialSeedCount = 0;
      this.parameters.foodDropSpeed = 0;
      this.parameters.spawnEnergyPerSegment = 50;
      this.parameters.digestionEfficiency = 100;
    }

    this.world = new World(this.parameters);

    var sample = this.sample;

    // load up the world.
    //
    // TODO: find an organism with the specified genome as close to the center as possible.

    this.world.deserialize(sample);
    this.organism = this.world.headOrganism;
    this.maxEnergy = this.organism.getSpawnEnergy(this.world);
    this.samples = [];

    var minX = Infinity;
    var minY = Infinity;
    var maxX = -Infinity;
    var maxY = -Infinity;

    this.instructions = [];
    var e: Element = this.organism.headSegment;
    while (e) {
      this.instructions.push(e.instruction);
      e = e.next;
      ++i;
    }

    this.samples.push(sample);

    for (var i = 0; i < TableauComponent.NUM_SAMPLES; i++) {
      this.world.turnCrank();

      // determine bounding rectangle of organism
      var organism = this.world.headOrganism;
      if (! organism) {
        break;
      }
      var e: Element = organism.headSegment;
      while (e) {

        minX = Math.min(minX, e.locationX);
        minY = Math.min(minY, e.locationY);
        maxX = Math.max(maxX, e.locationX);
        maxY = Math.max(maxY, e.locationY);

        e = e.next;
      }

      //this.samples.push(this.world.serialize());
    }
    this.world.deserialize(sample);

    var border = 4;
    this.boundingX = minX - border;
    this.boundingY = minY - border;
    this.boundingW = maxX - minX + border + border;
    this.boundingH = maxY - minY + border + border;

    var self = this;
    function renderOneTurn() {
      var stop = (self.turn + 1) >= TableauComponent.NUM_SAMPLES; // stop or loop? For now, just loop until paused.
      if (self.playing && self.displayed) {
        if (stop) {
          self.playing = false;
        }
        else {
          self.turn = (self.turn + 1) % TableauComponent.NUM_SAMPLES;
        }
        self.renderTurn();
      }
      setTimeout(renderOneTurn, self.timePerFrame);
    }
    renderOneTurn();
  }

  ngOnChanges(changes) {
  }

  renderTurn() {
    if (this.turn == 0) {
      this.world.deserialize(this.samples[0]);
    }
    //this.world.deserialize(this.samples[this.turn]);
    this.world.turnCrank();
    this.organism = this.world.headOrganism;

    var ctx: CanvasRenderingContext2D = this.canvas.getContext('2d');
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 255, 255);

    var zoom = 256 / Math.max(this.boundingH, this.boundingW);

    if (this.organism) {
      var i = 0;
      var e: Element = this.organism.headSegment;
      while (e) {
        if (e == this.organism.activeSegment || ((i == 0) && !this.organism.activeSegment)) {
          this.currentInstructionIndex = i;
        }
        ++i;
        e = e.next;
      }
    }

    for (var xi = 0; xi < 256; xi++) {
      for (var yi = 0; yi < 256; yi++) {
        var e: Element = this.world.get(xi, yi);

        if (e) {
          if (e.type == ElementType.FOOD) {
            ctx.fillStyle = "green";
          }
          else if (e.type == ElementType.BARRIER) {
            ctx.fillStyle = "gray";
          }
          else {
            ctx.fillStyle = "red";
          }
          var x = (xi - this.boundingX) * zoom;
          var y = (yi - this.boundingY) * zoom;

          ctx.fillRect(x, y, zoom, zoom);

          if (this.organism && e == this.organism.headSegment) {
            ctx.strokeStyle = "White";
            ctx.lineWidth = 5;
            ctx.beginPath();
            var cx = x + zoom / 2;
            var cy = y + zoom / 2;
            var dx = this.organism.headDirectionX * zoom;
            var dy = this.organism.headDirectionY * zoom;
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + dx / 2, cy + dy / 2);

            ctx.stroke();
          }
        }
      }
    }

    if (this.organism) {
      this.maxEnergy = this.organism.getSpawnEnergy(this.world);
    }
  }

  slower() {
    this.timePerFrame *= 1.25;
    this.playing = true;
  }

  faster() {
    this.timePerFrame *= .75;
    this.playing = true;
  }

  replay() {
    this.turn = -1;
    this.playing = true;
  }

  togglePlay() {
    this.playing = ! this.playing;
    if (this.playing && this.turn >= (TableauComponent.NUM_SAMPLES-1)) {
      this.turn = -1;
    }
  }

  step() {
    this.playing = false;
    this.renderTurn();
  }
}
