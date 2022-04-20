import { DB } from "../../src";
import User from "../app/Model/User";
import TestCase from "../TestCase";

TestCase.make();

describe("Database Testing", () => {
  test("can use query builder to access database", async()=>{
    const users = await DB.table("users").first();
    expect(users).toMatchObject({
      username: "user",
      email: "user@example.mail",
      fullname: "John Doe",
    });
  });

  test("can use Model to access database", async ()=>{
    const users = await User.query().first();
    expect(users).toMatchObject({
      username: "user",
      email: "user@example.mail",
      fullname: "John Doe",
    });
  });
});
