import { DB, Seeder } from "../../../src";
import bcrypt from "bcryptjs";

class DatabaseSeeder extends Seeder{
  public async run() {
    await DB.table("users").insert({
      username: "user",
      email: "user@example.mail",
      fullname: "John Doe",
      password: bcrypt.hashSync("password", bcrypt.genSaltSync(10)),
    });
  }
}

export default DatabaseSeeder;