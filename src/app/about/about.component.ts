import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {toast, MaterializeAction} from "angular2-materialize";

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

  private _isOpen:boolean;

  @Input()
  get isOpen():boolean {
    return this._isOpen;
  }

  @Output() isOpenChange = new EventEmitter();

  set isOpen(val) {
    this._isOpen = val;
    this.isOpenChange.emit(this._isOpen);
  }  

  private modalActions = new EventEmitter<string|MaterializeAction>();

  sample:any = {
      "elements": {
        "1": [
          {
            "x": 127,
            "y": 104
          },
          {
            "x": 129,
            "y": 113
          },
          {
            "x": 133,
            "y": 111
          }
        ]
      },
      "organisms": [
        {
          "activeSegment": 0,
          "energy": 200,
          "genome": "1>mm0M",
          "headDirectionX": 1,
          "headDirectionY": 0,
          "headOrientation": 1,
          "instructionsPerTurn": 1,
          "lifespan": 311900,
          "positions": [
            {
              "x": 129,
              "y": 108
            },
            {
              "x": 128,
              "y": 108
            },
            {
              "x": 127,
              "y": 108
            },
            {
              "x": 127,
              "y": 109
            },
            {
              "x": 127,
              "y": 110
            },
            {
              "x": 128,
              "y": 110
            }
          ],
          "sleepCount": 0,
          "wasBlocked": false
        }
      ]
    };

  constructor() { }

  ngOnInit() {
  }


  ngOnChanges(changes) {
    if (this.isOpen) {
      setTimeout(() => {this.modalActions.emit({action:"modal",params:['open']})}, 500);
    }
    else {
      this.modalActions.emit({action:"modal",params:['close']});      
    }
  }

  close() {
    this.isOpen = false;
  }

}
