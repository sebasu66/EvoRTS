export default class EntityStats {
  constructor() {
    this.stamina = 100;
    this.strength = 10;
    this.speed = 5;
    this.carryCapacity = 50;
    this.perception = 50;
    this.perceptionRadius = 10;
    this.health = 100;
    this.regenSpeed = 1;
    this.weapons = [];
    this.cargo = [];
    this.cargoWeight = 0;
    this.xp = 0;
    this.level = 1;
    this.instructions = [];
    this.mode = "idle";
    this.memory = {};
    this.destination = null;_instrucit
  }

   static MODES= ["idle", "moveTo", "gather", "build", "fight", "flee", "rest", "patrol", "follow", "explore", "inspect", "repair",
    "deliver", "comunicate" ];

}
