import { Authenticatable, Model, Traitable } from "../../../src";

class User extends Traitable(Model).use(Authenticatable) {
  firstname!: string;
  lastname!: string;

  protected static append = ["full_name"];

  protected static table = "users";

  public getFullNameAttribute() {
    return this.firstname + " " + this.lastname;
  }
}

export default User;
