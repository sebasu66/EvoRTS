import kaboom from "kaboom"
import World from './models/world_model';
import * as g from './game_logic';

kaboom()

loadSprite("robot", "sprites/bean.png",width=32, height=32)
//load sprite tileset
loadSpriteAtlas("sprites/floor_tile2.png", {
	"floor": { x: 2, y: 2, width: 32, height: 32 },
	"wall": { x: 2, y: 614, width: 32, height: 32 },
	})

	const world = new World();
setGravity(0)

	setBackground(5,5,5,1)
	console.log(world.terreno);
	//top down level based on grid
	const level = addLevel(
		world.terreno, {
		tileHeight: g.TILE_SIZE,
		tileWidth: g.TILE_SIZE,
		"pos": vec2(0, 0),
		tiles:{
			"F":()=>[
				sprite("floor"),
			area()],
			"W":()=>[
				sprite("wall"),
			area(),
			"collide",
			pos(),
		body({isStatic: true}),
	]
		}
	})

	//camera follows player
	const player = add([
		sprite("robot"),   // sprite() component makes it render as a sprite
		//set position based on level grid
		pos((g.WORLD_WIDTH /2) * g.TILE_SIZE, (g.WORLD_HEIGHT /2) * g.TILE_SIZE),     // pos() component gives it position, also enables movement
		scale(vec2(0.5,0.5)),
		rotate(0),
		area(),
		"collide",        // rotate() component gives it rotation
		anchor("center"), // anchor() component defines the pivot point (defaults to "topleft")
	])
	player.onUpdate(() => {
		// Set the viewport center to player.pos
		camPos(player.worldPos())
	})
	
	//player movement
	onKeyPress("left", () => {
		player.move(-g.TILE_SIZE, 0)
	})

	onKeyPress("right", () => {
		player.move(g.TILE_SIZE, 0)
	}
	)	

	onKeyPress("up", () => {
		player.move(0, -g.TILE_SIZE)
	})

	onKeyPress("down", () => {
		player.move(0, g.TILE_SIZE)
	}	
	)
	