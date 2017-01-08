/**
 * Genomes are assigned a color (essentially at random) for visual tracking purposes
 */


import {Color} from "./color";

export class GenomeColorMap {

	private static colorIndex: number = 0;
	private static colors = [
	/*RED"*/			new Color ( 0xFF, 0x00, 0x00 ),
	/*BLUE"*/		    new Color ( 0x00, 0x00, 0xFF ),
	/*LIGHT_BLUE" */	new Color ( 0x80, 0x80, 0xFF ),
	/*PINK"*/   		new Color ( 0xFF, 0x00, 0xFF ),
	/*MAROON"*/	    	new Color ( 0x80, 0x00, 0x00 ),
	/*BROWN"*/	    	new Color ( 110,	50, 20 ),
	/*OLIVE"*/  		new Color ( 0x80, 0x80, 0x00 ),
	/*NAVY"*/   		new Color ( 0x00, 0x00, 0x80 ),
	/*PURPLE"*/ 		new Color ( 0x80, 0x00, 0x80 ),
	/*TEAL"*/   		new Color ( 0x00, 0x80, 0x80 ),
	/*GRAY"*/   		new Color ( 0x80, 0x80, 0x80 ),
	/*ORANGE"*/	    	new Color ( 0xFF, 0x80, 0x00 ),

	/*SKY"*/			new Color (  93, 186, 202 ),
	/*GLASS"*/		    new Color ( 153, 204, 204 ),
	/*MARIGOLD"*/   	new Color ( 255, 175,  24 ),
	/*LAVENDER"*/   	new Color ( 187,  86, 195 ),
	/*VIOLET"*/	    	new Color (  89,  24, 187 )
	];

	private static _genomeColorMap:{[genome: string]: Color} = {
		"*": new Color(0, 255, 0)
	};

	static getColorForGenome(genome:string) {
		var result = GenomeColorMap._genomeColorMap[genome];
		if (! result) {
			result = GenomeColorMap.colors[GenomeColorMap.colorIndex];
			GenomeColorMap._genomeColorMap[genome] = result;
			GenomeColorMap.colorIndex = (GenomeColorMap.colorIndex + 1) % GenomeColorMap.colors.length;
		}
		return result;
	}
}
