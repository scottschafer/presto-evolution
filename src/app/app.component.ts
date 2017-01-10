import { Component, OnInit, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import { toast, MaterializeAction } from "angular2-materialize";
import { WebWorkerService } from "./web-worker/web-worker.service";
import * as Simulation from '../simulation/lib.module';
declare var $: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [WebWorkerService]
})
export class AppComponent implements OnInit {

  obstacles: number = 0;

  private worldRunner: Simulation.WorldRunner;
  private allInstructions: Simulation.Instruction[] = [];

  private worker: Worker;
  params: Simulation.WorldParameters;
  renderPixels: Object;
  topTen: any;
  userGenome: string;
  turnsPerSecond: number;
  magnifying: boolean = true;

  private _isAboutOpen: boolean;

  constructor(private elementRef: ElementRef, private _webWorkerService: WebWorkerService) {

    var useWebWorker = false;

    this.params = new Simulation.WorldParameters();

    var serializedWorld;
    // serializedWorld = window.localStorage ? window.localStorage['serializedWorld'] : null;
    this.worldRunner = new Simulation.WorldRunner(this.params, serializedWorld);

    this.allInstructions = Simulation.InstructionsAll.all;

    /*
    if (useWebWorker) {
    // eventually get the simulation running in a web worker...
      var promise:Promise<any> = this._webWorkerService.run( 
        function(){

              var someMod = require('someModule');

              var self = this;
              self.postMessage('starting up');

              var worldRunner: WorldRunner = new WorldRunner();
              self.addEventListener('message', function(e) {
                self.postMessage('got message: ' + e.data);
                worldRunner.world.turnCrank();
              });
            }
        );
      this.worker = this._webWorkerService.getWorker(promise);

      this.worker.onmessage = function(e) {
        console.log('Message received from worker: ' + e.data);
      }


      var x = 0;
      var self = this;    
      setInterval(function() {
        self.worker.postMessage([('hey there, worker #' + (++x))]);
      }, 1000);
        
    }
    else */

    {

      var self = this;
      this.worldRunner.run(
        function (renderData: Simulation.WorldRenderData): void {
          self.renderPixels = renderData.getTransferableData();
          if (renderData.topTenList) {

            // the following line allows for stopping the update of the list, useful for tweaking the styling in the browser:
            //    if (self.topTen && self.topTen[9].genome) {} else

            self.topTen = renderData.topTenList;

            if (renderData.serializedWorld && window.localStorage) {
              window.localStorage['serializedWorld'] = renderData.serializedWorld;
            }

            if (renderData.turnsPerSecond) {
              self.turnsPerSecond = renderData.turnsPerSecond;
            }
          }
        }
      );
    }

  }

  ngOnInit(): void {
    var elem = $(this.elementRef.nativeElement);

    setTimeout(() => {
      $(".collapsible-initexpand").find(".collapsible-header").addClass("active");
      $(".collapsible-initexpand").collapsible({ accordion: false });
    }, 100);
  }

  onObstacleChange(val: any) {
    this.worldRunner.setObstacles(val);
  }

  resetWorld(): void {
    this.worldRunner.reset();
    this.worldRunner.setObstacles(this.obstacles);
  }

  insert(genome: string) {
    if (!genome) {
      toast('Enter one or more instructions first.', 2000);
      return;
    }
    var allCodes: string = "";
    this.allInstructions.forEach(function (instruction: Simulation.Instruction) {
      allCodes += instruction.code;
    });
    for (var i = 0; i < genome.length; i++) {
      if (allCodes.indexOf(genome[i]) == -1) {
        toast('"' + genome[i] + '" is not a valid instruction.', 2000);
        return;
      }
    }
    this.worldRunner.insert(genome);
  }

  openAbout() {
    this.isAboutOpen = true;
  }

  @Input()
  get isAboutOpen(): boolean {
    return this._isAboutOpen;
  }

  @Output() isAboutOpenChange = new EventEmitter();

  set isAboutOpen(val) {
    this._isAboutOpen = val;
    this.worldRunner.paused = val;
    this.isAboutOpenChange.emit(this._isAboutOpen);
  }  
}
