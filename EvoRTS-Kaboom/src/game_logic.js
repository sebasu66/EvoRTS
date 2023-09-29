import kaboom from "kaboom"

kaboom()


const TILE_SIZE = 24;
const WORLD_WIDTH = 100;
const WORLD_HEIGHT = 60;


const seconds = (n = 1) => time() * n
const wiggle = (from =1, to=1, duration=1) => wave(from,to, seconds(duration))
const gridCellToXY = (row=1,col =1)=> vec2(row,col).scale((WORLD_WIDTH - TILE_SIZE*2) / 2, (WORLD_HEIGHT - TILE_SIZE*2) / 1).add(TILE_SIZE, TILE_SIZE)

let playerInstances = [];

function getNearestPlayer(pos = vec2(0, 0)) {
  let nearestPlayer = null;
  let nearestDistance = 1000000;
  for (let i = 0; i < playerInstances.length; i++) {
	let player = playerInstances[i];
	let distance = pos.sub(player.pos).len();
	if (distance < nearestDistance) {
	  nearestPlayer = player;
	  nearestDistance = distance;
	}
  }
  return {"player": nearestPlayer, "distance": nearestDistance};	
}

function pushPlayerInstance(player) {
  playerInstances.push(player);
}

export { WORLD_WIDTH, WORLD_HEIGHT, TILE_SIZE, seconds, wiggle, gridCellToXY, getNearestPlayer, pushPlayerInstance };
