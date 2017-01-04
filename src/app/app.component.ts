import {Component, OnInit, ElementRef, EventEmitter} from '@angular/core';
import {toast, MaterializeAction} from "angular2-materialize";
import {WebWorkerService} from "./web-worker/web-worker.service";
import * as Simulation from '../simulation/lib.module';
declare var $:any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [WebWorkerService]
})
export class AppComponent implements OnInit {

  private modalActions = new EventEmitter<string|MaterializeAction>();

  obstacles:number = 0;

  private worldRunner : Simulation.WorldRunner;
  private allInstructions:Simulation.Instruction[] = [];

  private worker:Worker;
  params: Simulation.WorldParameters;
  renderPixels:Object;
  topTen:any;
  userGenome: string;

  constructor(private elementRef: ElementRef, private _webWorkerService: WebWorkerService) {

    var useWebWorker = false;

    this.params = new Simulation.WorldParameters();
    this.worldRunner = new Simulation.WorldRunner(this.params);

    this.allInstructions = Simulation.InstructionsAll.all;

    /*
    if (useWebWorker) {
    // eventually get this working.
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
    else */ {

      var self = this;
      this.worldRunner.run(
        function(renderData:Simulation.WorldRenderData):void {
          self.renderPixels = renderData.getTransferableData();
          if (renderData.topTenList) {
            
            // the following line allows for stopping the update of the list, useful for tweaking the styling in the browser:
            //    if (self.topTen && self.topTen[9].genome) {} else

            self.topTen = renderData.topTenList;
          }
        }
      );
    }

  }

  ngOnInit(): void {
    //toast("...and Materialize works as well!");
    var elem = $(this.elementRef.nativeElement);
    
    elem.find(".collapsible-header").addClass("active");
    elem.find(".collapsible").collapsible({accordion: false});

    setTimeout(() => { this.openAbout() }, 1000); 
  }

  onObstacleChange(val:any) {
      this.worldRunner.setObstacles(val);
  }

  resetWorld(): void {
    this.worldRunner.reset();
    this.worldRunner.setObstacles(this.obstacles);
  }

  insert(genome:string) {
    if (!genome) {
      toast('Enter one or more instructions first.', 2000);
      return;
    }
    var allCodes:string = "";
    this.allInstructions.forEach(function(instruction:Simulation.Instruction) {
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
    this.modalActions.emit({action:"modal",params:['open']});
  }

  closeAbout() {
    this.modalActions.emit({action:"modal",params:['close']});
  }

}
