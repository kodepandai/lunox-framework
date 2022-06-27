import { DB } from "../../src";
import User from "../app/Model/User";
import TestCase from "../TestCase";

TestCase.make();

describe("Database Testing", () => {
  test("can use query builder to access database", async () => {
    const user = await DB.table("users").first();
    expect(user).toMatchObject({
      username: "user",
      email: "user@example.mail",
    });
  });

  test("can use Model to access database", async () => {
    const user = (await User.query().first()) || {};

    // appended attributes should available on json.
    expect(Object.keys(JSON.parse(JSON.stringify(user)))).toContain(
      "full_name"
    );
    // but not in user instance
    expect(user).not.toContain("full_name");

    expect(user).toMatchObject({
      username: "user",
      email: "user@example.mail",
      firstname: "Foo", //firstname is overided by getter
      full_name: "Foo Doe", //custom attribute
    });
  });
});
