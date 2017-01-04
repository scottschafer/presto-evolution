import { NgModule } from '@angular/core';

import { WorldParameters } from './world-parameters';
import { WorldRenderData } from './world-render-data';
import { WorldRunner } from './world-runner';
import { InstructionsAll } from './instructions-all';
import { Instruction } from './instruction';

@NgModule({
    declarations: [
    ],
    imports: [
    ],
    exports: [
    	WorldParameters,
      WorldRenderData,
      WorldRunner,
      InstructionsAll
    ]
})
export class SimulationModule { }

export * from './world-parameters';
export * from './world-render-data';
export * from './world-runner';
export * from './instructions-all';
export * from './instruction';
