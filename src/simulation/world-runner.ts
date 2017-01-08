
import { World } from './world';
import { WorldParameters } from './world-parameters';
import { WorldRenderData } from './world-render-data';

/** 
 * A transfer object that is sent from the worker thread to the main rendering thread instructing it what to render.
 */

export class WorldRunner {
  public static MIN_RENDER_MS: number = 16;
  public static MIN_SURVEY_MS: number = 100;
  world: World;
  params:WorldParameters;
  worker: Worker;
  private static instance:WorldRunner;
  paused:boolean = false;


  constructor(params:WorldParameters = null, serializedWorld = null) {
    
    if (! params) {
      params = new WorldParameters();
    }
    this.params = params;
    this.world = new World(params);

    if (serializedWorld) {
      this.world.deserialize(JSON.parse(serializedWorld));
    }

  /*
    // TODO: use a web worker thread
    var worker:Worker = this.createThread();
    window.setInterval(function() {
      worker.postMessage('interval');
    }, 1000);
    */
  }

  run(callback:Function) {
    var lastRenderMS = 0;
    var lastTopTenSurveyMS = 0;
    var self = this;

    function turnCrank() {
      ++WorldRenderData.elapsedTurns;
      var interval = (10 - self.params.speed);
      interval *= interval * 5;

      if (! self.paused) {
        self.world.turnCrank();

        // send a render "event"
        var curTime = new Date().getTime();
        var elapsedRenderTime = curTime - lastRenderMS;
        var elaspedTopTenSurvey = curTime - lastTopTenSurveyMS;
        var surveyTopTen = elaspedTopTenSurvey > WorldRunner.MIN_SURVEY_MS;

        if (elapsedRenderTime > WorldRunner.MIN_RENDER_MS) {
          lastRenderMS = curTime;
          if (surveyTopTen) {
            lastTopTenSurveyMS = curTime;
          }
          var renderData:WorldRenderData = new WorldRenderData(self.world, surveyTopTen);
          callback(renderData);
        }
      }

      setTimeout(turnCrank, interval);
    }

    turnCrank();
  }

  public static workerThreadFunction() {
    var world:World = new World(new WorldParameters());
    var self : any = this;
    self.postMessage('starting up');

    var worldRunner: WorldRunner = new WorldRunner();
    self.addEventListener('message', function(e:any) {
      self.postMessage('got message: ' + e.data);
      world.turnCrank();
    });
  }


  setObstacles(obstacles: number): void {
    this.world.setObstacles(obstacles);
  }

  reset(): void {
    this.world.reset();
  }

  insert(genome:string):void {
    this.world.insert(genome);
  }

/*
  Experimental code....

  private createWorkerUrl(resolve: Function): string {
    const resolveString = resolve.toString();
    const webWorkerTemplate = `
        self.addEventListener('message', function(e) {
            postMessage((${resolveString})(e.data));
        });
    `;
    const blob = new Blob([webWorkerTemplate], { type: 'text/javascript' });
    return URL.createObjectURL(blob);
  }

  private static threadFunction(): void {
    //var params:WorldParameters = new WorldParameters();
    //var world:World = new World(params);

    onmessage = function(e) {
      debugger;
      console.log('threadFunction received ' + e.data);
      window.postMessage('I am a message sent FROM the worker', '*');
    }
  }

  createThread(): Worker {
    var worker = new Worker("./alifelib/dist/index.js");
    worker.onmessage = ev => {
        window.alert(ev.data);
    };
    return worker;
  }
  */
}
