import { Engine } from "excalibur";
import { Player } from "./player";
import { loader } from "./resources";

class Game extends Engine {
    constructor() {
      super({width: 800, height: 600});
    }
    initialize() {
      const player = new Player();
      this.add(player);

      this.start(loader);
    }
  }
  
  export const game = new Game();
  game.initialize();