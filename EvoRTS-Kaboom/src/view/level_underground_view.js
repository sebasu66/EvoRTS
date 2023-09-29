import * as g from "../game_logic";  
//constants for each parameter type

//anchor 
const ANCHOR= {
    center: "center",
    top: "top",
    bottom: "bottom",
    left: "left",
    right: "right",
    topleft: "topleft",
    topright: "topright",
    bottomleft: "bottomleft",
    bottomright: "bottomright",
}

//Kabbom color constants reference: https://kaboomjs.com/#color
const COLOR= {
    RED: rgb(255, 0, 0),
    GREEN: rgb(0, 255, 0),
    BLUE: rgb(0, 0, 255),
    YELLOW: rgb(255, 255, 0),   
    CYAN: rgb(0, 255, 255),
    MAGENTA: rgb(255, 0, 255),
    BLACK: rgb(0, 0, 0),
    WHITE: rgb(255, 255, 255),
    GRAY: rgb(128, 128, 128),
    LIGHTGRAY: rgb(192, 192, 192),
    DARKGRAY: rgb(64, 64, 64),
    TRANSPARENT: rgb(0, 0, 0, 0),
}
//Material palettes
const COLOR_PALETTE_BRICK = [rgb(255, 255, 255),rgb(255, 0, 0),rgb(255, 255, 0),rgb(0, 0, 0)]
const COLOR_PALETTE_WOOD = [rgb(255, 255, 255),rgb(255, 0, 0),rgb(255, 255, 0),rgb(0, 0, 0)]
const COLOR_PALETTE_METAL = [rgb(255, 255, 255),rgb(255, 0, 0),rgb(255, 255, 0),rgb(0, 0, 0)]

//Cool gradient colors from 
const COLOR_GRADIENT_1 = [COLOR.RED, COLOR.YELLOW, COLOR.GREEN, COLOR.CYAN, COLOR.BLUE, COLOR.MAGENTA]
const COLOR_GRADIENT_ANIM_IRIDISCENT =[
    rgb(g.wiggle(128, 255, 8), 255, g.wiggle(128, 255, 4)),
    rgb(255, g.wiggle(128, 255, 8), g.wiggle(128, 255, 4)),
    rgb(g.wiggle(128, 255, 8), g.wiggle(128, 255, 4), 255),
    rgb(255, 128, g.wiggle(128, 255, 4)),
    rgb(g.wiggle(128, 255, 8), g.wiggle(128, 255, 4), 128),
]

//outline   
const OUTLINE={
    "black_1": {
        width: 1,
        color: rgb(0, 0, 0),
    },
    "black_2": {
        width: 2,
        color: rgb(0, 0, 0),
    },
    "black_3": {
        width: 3,
        color: rgb(0, 0, 0),
    },
    "lightBlue_1": {
        width: 1,
        color: rgb(0, 0, 255),
    },
}

const bkgColor=COLOR_PALETTE_METAL


function draw_level(levelGrid){
    setBackground(bkgColor)

    //draw a square for each cell in the grid with value "w"
    for(let i=0; i<levelGrid.length; i++){
        for(let j=0; j<levelGrid[i].length; j++){
            if(levelGrid[i][j] ==1){
                draw_rect(vec2(i*g.TILE_SIZE, j*g.TILE_SIZE), g.TILE_SIZE-2, g.TILE_SIZE-2,
                 ANCHOR.bottom, 10,0, COLOR_GRADIENT_1, OUTLINE.black_1)
            }
        }
    }
}

function draw_rect(pos = g.gridCellToXY(0, 0), width = g.TILE_SIZE, height = g.TILE_SIZE, anchor = ANCHOR.topleft, radius = 0, angle = 0, 
colors = COLOR_PALETTE_BRICK, outline = OUTLINE.lightBlue_1) {

    //caalculate a value from 0 to 1 proportional to the distance from the player
    /*let calcOpacity = 1
    if(g.getNearestPlayer(pos).player != null){
        let distance = g.getNearestPlayer(pos).distance
        let distanceProp = 1 - distance / 800
        distanceProp = clamp(distanceProp, 0, 1)
        calcOpacity = distanceProp
        //console.log(distance + "distance");
        //if LOS then opacity is 1
        // if(LOS(pos, g.getNearestPlayer(pos).player.pos)){
        //     calcOpacity = 1
        // }
    }*/

//console.log("drawing rect", pos, width, height, anchor, radius, angle, colors, outline)        
drawRect({
    pos: pos,
    width: width,
    height: height,
    //anchor: anchor,
    radius: radius,
    angle: angle,
   // color: rgb(255, 0, 0),
    colors: colors,
    outline: outline,
    opacity: 1,
})      
}   

function LOS(pos1, pos2){
    let line = getLine(pos1, pos2)
    let hits = getHits(line, "wall")
    console.log(line, hits);
    return hits.length == 0
}

export default draw_level