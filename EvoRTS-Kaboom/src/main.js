import * as g from './game_logic';
//import controllers
import createLevel from './controller/level_underground_controller';
import create_player from './controller/worker_controller';

createLevel();
create_player();

//set camera scale to 1
camScale(0.5)
//loadSpriteAtlas("sprites/floor_tile2.png", {
//	"floor": { x: 2, y: 2, width: 32, height: 32 },
//	"wall": { x: 2, y: 614, width: 32, height: 32 },
//	})