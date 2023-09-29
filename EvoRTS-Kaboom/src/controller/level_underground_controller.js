import level_underground_model from "../model/level_underground_model";
import draw_level from "../view/level_underground_view";
import * as g from '../game_logic'

function createLevel(){
    setGravity(0)
	const model = new level_underground_model()
	const levelGrid = model.terrain
	const levelString = model.stringArray	

	//top down level based on grid
	
	/*const level = addLevel(
		levelString, {
		tileHeight: g.TILE_SIZE,
		tileWidth: g.TILE_SIZE,
		pos: new vec2(0, 0),
		tiles:{
			"F":()=>[
				sprite("floor"),
			area()],
			"W":()=>[
				pos(),
			area({ shape: new Polygon([vec2(0), vec2(28), vec2(-28, 28)]) }),
			"wall",
			body({isStatic: true}),
	]
		}
	}
	
	)*/
	//console.log(levelGrid)	
	draw_level(levelGrid)

	onDraw(() => {
		
			draw_level(levelGrid)
		
		})
		


}

export default createLevel