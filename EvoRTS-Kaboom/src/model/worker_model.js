import * as g from "../game_logic"
/*/    move(dx, dy) {
      this.x += dx;
      this.y += dy;
    }
  
    collectResource(amount) {
      this.resourcesCollected += amount;
    }
  */
    
 function create_worker() {
    //camera follows player
	return add([
		sprite("robot"),   // sprite() component makes it render as a sprite
		//set position based on level grid
		pos((g.WORLD_WIDTH /2) * g.TILE_SIZE, (g.WORLD_HEIGHT /2) * g.TILE_SIZE),     // pos() component gives it position, also enables movement
		scale(vec2(0.5,0.5)),
		rotate(0),
		//area(),
    //body(),           // body() component makes it physical
		"collide",        // rotate() component gives it rotation
		anchor("center"), // anchor() component defines the pivot point (defaults to "topleft")
	])
	  
  }

  export default create_worker    