import { ImageSource } from "excalibur";
import sword from "./images/sword.png"; // for parcelv2 this is configured in the .parcelrc

let Resources = {
  Sword: new ImageSource(sword)
};

export { Resources };