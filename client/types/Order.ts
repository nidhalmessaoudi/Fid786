import Doc from "./Doc";
import Product from "./Product";
import User from "./User";

export default interface Order extends Doc {
  product: Product;
  state: "pending" | "delivered";
  price: number;
  amount: number;
  buyer: User;
  seller: User;
}
