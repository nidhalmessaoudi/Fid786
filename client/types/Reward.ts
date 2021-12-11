import Doc from "./Doc";
import Product from "./Product";

export default interface Reward extends Doc {
  product: Product;
  requiredPoints: number;
}
