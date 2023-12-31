import * as g from "../game_logic";

class level_underground_model {
    constructor(deathLimit = 3, birthLimit = 4, iterations = 3, fillProb = 0.36) {
        this.count =0;
        this.birthLimit = birthLimit;
        this.deathLimit = deathLimit;
        this.iterations = iterations;
        this.terrain = this.refinedCellularAutomataCave(fillProb, this.iterations, this.birthLimit, this.deathLimit);
      this.stringArray = this.setStringArray(this.terrain);
      }
          
    refinedCellularAutomataCave(fillProb = 0.2, iterations = 3, birthLimit = 4, deathLimit = 3) {       
           // definir un array bidimencional de 0s y 1s aleatorios
            let cave = [];  
            for (let i = 0; i < g.WORLD_WIDTH; i++) {
              cave.push([]);
              for (let j = 0; j < g.WORLD_HEIGHT; j++) {
                if (i > (g.WORLD_WIDTH/2)-5 && i < (g.WORLD_WIDTH/2)+5 && j > (g.WORLD_HEIGHT/2)-5 && j < (g.WORLD_HEIGHT/2)+5) {
                  cave[i].push(0);
                } else if (i === 0 || j === 0 || i == g.WORLD_WIDTH - 1 || j == g.WORLD_HEIGHT - 1) {
                  cave[i].push(1);
                } else {
                  cave[i].push(Math.random() < fillProb ? 1 : 0);
                }
              }
            }
            for(let a=0; a<iterations; a++){
                cave = this.doSimulationStep(cave);
            }
            //one dimensionall String array
            
            

            //console.log(caveOneDimention);
            
            return cave;

}

setStringArray(cave){
  let caveOneDimention= [];
  for (let i = 0; i < g.WORLD_WIDTH; i++) {
   let row = ""
    for (let j = 0; j < g.WORLD_HEIGHT; j++) {
      let s = cave[i][j] === 1 ? "W" : " ";
      row = row + s;
            }
    caveOneDimention.push(row);
  }
  return caveOneDimention;
}

//Returns the number of cells in a ring around (x,y) that are alive. 
countAliveNeighbours( map, x, y){
 this.count= 0;
	for(let i=-1; i<2; i++){
		for(let j=-1; j<2; j++){
			let neighbour_x = x+i;
			let neighbour_y = y+j;
			//If we're looking at the middle point 
			if(i == 0 && j == 0){
				//Do nothing, we don't want to add ourselves in! 
			}
			//In case the index we're looking at it off the edge of the map 
			else if(neighbour_x < 0 || neighbour_y < 0 || neighbour_x >= map.length || neighbour_y >= map[0].length){
				this.count = this.count + 1;
			}
			//Otherwise, a normal check of the neighbour 
			else if(map[neighbour_x][neighbour_y]){
				this.count = this.count + 1;
			}
		}
	}
    return this.count;
}

 doSimulationStep( oldMap){
	let newMap = [];
	//Loop over each row and column of the map 
	for(let x=0; x<oldMap.length; x++){
        //Create the new row
        newMap.push([]);
		for(let y=0; y<oldMap[0].length; y++){
			let nbs = this.countAliveNeighbours(oldMap, x, y);
			//The new value is based on our simulation rules 
			//First, if a cell is alive but has too few neighbours, kill it. 
			if(oldMap[x][y] == 1){
				if(nbs < this.deathLimit){
            newMap[x][y] = 0;
  				}
 				else{
 					newMap[x][y] = 1;
  				}
  			} //Otherwise, if the cell is dead now, check if it has the right number of neighbours to be 'born' 
  			else{
  				if(nbs > this.birthLimit){
					newMap[x][y] = 1;   
				}
				else{
            newMap[x][y] = 0;
				}
			}
		}
	}
	return newMap;
}
    
}

export default level_underground_model 