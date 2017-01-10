import { Component, OnInit, ElementRef, ComponentRef, Input, Output, EventEmitter } from '@angular/core';
declare var $:any;

@Component({
  selector: 'app-world-view',
  templateUrl: './world-view.component.html',
  styleUrls: ['./world-view.component.css'],
  inputs: ['pixels', 'worldSize', 'magnifying'],
  outputs: ['magnifying']
})
export class WorldViewComponent implements OnInit {

  pixels:Array<ArrayBuffer>;
  worldSize:number;
  _magnifying: boolean;

  private lastWidth:number = 0;
  private lastHeight:number = 0;
  private canvasOnScreen:HTMLCanvasElement;
  private canvasOffScreen:HTMLCanvasElement;

  private magnification:number = 5;
  private magnificationSize: number = 20;
  private magnificationX: number = 128;
  private magnificationY: number = 128;
  private mouseDown: boolean = false;

  @Input()
  get magnifying():boolean {
    return this._magnifying;
  }

  @Output() magnifyingChange = new EventEmitter();

  set magnifying(val) {
    this._magnifying = val;
    this.magnifyingChange.emit(this._magnifying);
  }  
  
  constructor(private elementRef: ElementRef) {
  }

  ngOnInit() {  

    $(window).mouseup( () => {
      this.mouseDown = false;
    });

    this.canvasOffScreen = $(this.elementRef.nativeElement).find('.off-screen-canvas')[0]; 
    this.canvasOnScreen = $(this.elementRef.nativeElement).find('.on-screen-canvas')[0]; 
  }

   clicked(event) {
    var size = $(this.canvasOnScreen).width();
    this.magnificationX = 256 * event.clientX / size;
    this.magnificationY = 256 * event.clientY / size;
    this.magnifying = true;
    event.preventDefault();
  }

  mousedown(event) {
    this.mouseDown = true;
    this.clicked(event);
  }

  mousemove(event) {
    if (this.mouseDown) {
      this.clicked(event);
    }
  }

  mouseup(event) {
    this.mouseDown = false;
  }

  ngOnChanges(changes) {
    if (this.elementRef) {
      this.updatePixels();
    }
  }


  /**
   * Resize the canvas to fit the parent container, if necessary
   */
  ngDoCheck() {
    if (! this.canvasOffScreen) {
    }
    if (! this.canvasOnScreen) {
    }

    var parent = $(this.elementRef.nativeElement).parent();

    // because every application needs some ugly magic numbers in it:
    var w:number = parent.width() - 20; 
    var h:number = Math.max(100, $(window).height() - 250);

    var dim = Math.min(w,h);
    $(this.canvasOnScreen).css({width: (dim + 'px'), height: (dim + 'px')}); 
    $(this.canvasOffScreen).css({width: (dim + 'px'), height: (dim + 'px')}); 
  }

  /**
   * Copy from the pixels buffer to the canvas
   */
  private updatePixels() {
      if (this.pixels && this.pixels.length && this.canvasOnScreen) {

      var inBuffer: ArrayBuffer = this.pixels[0];

      var canvas: HTMLCanvasElement = this.canvasOffScreen;
      if (canvas) {
        var ctx: CanvasRenderingContext2D = canvas.getContext('2d');
        var dim = this.worldSize;//Math.sqrt(inBuffer.byteLength/4);

        var imageData: ImageData = ctx.createImageData(dim, dim);
        var test = true;
        if (test) {
          var buf8:any = new Uint8ClampedArray(inBuffer);
          imageData.data.set(buf8);
        }
        else {
          var iOut = 0;
          for (var iIn: number = 0; iIn < inBuffer.byteLength; iIn++) {
            imageData.data[iOut++] = inBuffer[iIn];
          }
        }
        ctx.putImageData(imageData, 0, 0);
        ctx.webkitImageSmoothingEnabled = false;
        (<any>ctx).mozImageSmoothingEnabled = (<any>ctx).msImageSmoothingEnabled = (<any>ctx).webkitImageSmoothingEnabled = 
          (<any>ctx).imageSmoothingEnabled = false;

        if (this.mouseDown || this.magnifying) {
          var srcX = this.magnificationX - this.magnificationSize / 2;
          var srcY = this.magnificationY - this.magnificationSize / 2;
          var destX = this.magnificationX - this.magnificationSize / 2 * this.magnification;
          var destY = this.magnificationY  - this.magnificationSize / 2 * this.magnification;
          var destSize = this.magnification * this.magnificationSize;

          ctx.drawImage(canvas,srcX,srcY,this.magnificationSize,this.magnificationSize,
            destX,destY,destSize, destSize);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.strokeRect(destX, destY, destSize, destSize);
        }
      }

      this.canvasOnScreen.getContext('2d').drawImage(canvas, 0, 0, 256, 256, 0, 0, 256, 256);
    }
  }
}
