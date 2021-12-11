import Doc from "./Doc";
import Store from "./Store";

export default interface Product extends Doc {
  name: string;
  description: string;
  photos: [string];
  price: number;
  fidPoints: number;
  deliveryTime: number;
  availability: "In Stock" | "Out Of Stock";
  store: Store;
  owner: {
    username: string;
    email: string;
  };
}
