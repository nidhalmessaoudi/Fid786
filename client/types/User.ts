import Doc from "./Doc";

export default interface User extends Doc {
  username: string;
  email: string;
}
