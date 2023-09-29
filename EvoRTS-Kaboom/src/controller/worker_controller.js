import create_worker from '../model/worker_model';
import * as g from '../game_logic'

function create_player() {

    //load robot sprite
    loadSprite("robot", "../sprites/bean.png")

    const player = create_worker();
    
    g.pushPlayerInstance(player);

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
    
  
  }
export default create_player 