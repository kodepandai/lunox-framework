import { Authenticatable, Model, Traitable } from "../../../src";

class User extends Traitable(Model).use(Authenticatable) {
  firstname!: string;
  lastname!: string;

  protected static appends = ["full_name"];

  protected static table = "users";

  protected static hidden = ["password"];

  public getFullNameAttribute() {
    return this.firstname + " " + this.lastname;
  }

  public getFirstnameAttribute() {
    return "Foo";
  }
}

export default User;
