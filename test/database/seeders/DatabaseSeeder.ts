import { DB, Seeder } from "../../../src";

class DatabaseSeeder extends Seeder {
  public async run() {
    await DB.table("users").insert({
      username: "user",
      email: "user@example.mail",
      firstname: "John",
      lastname: "Doe",
      password: "password",
    });
  }
}

export default DatabaseSeeder;
