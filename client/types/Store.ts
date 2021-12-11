import Doc from "./Doc";

export default interface Store extends Doc {
  name: string;
  location: string;
  subUrl: string;
  logo: string;
  owner: string;
}
