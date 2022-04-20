import { Authenticatable, Model, Traitable } from "../../../src";

class User extends Traitable(Model).use(Authenticatable) {
  protected static table = "users";
}

export default User;
