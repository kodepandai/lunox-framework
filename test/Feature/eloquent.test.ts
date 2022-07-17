import User from "../app/Model/User";
import TestCase from "../TestCase";

TestCase.make();

describe("eloquent model feature test", () => {
  test("hidden attribute should be hidden from json but still accessible from model instance", async () => {
    const user = await User.query().first();
    if (user) {
      expect(Object.keys(JSON.parse(JSON.stringify(user)))).not.toContain(
        "password"
      );
      expect(user.password).toBeDefined();
    }
  });

  it("can access custom attribute via getter", async () => {
    const user = await User.query().first();
    if (user) {
      expect(user).toMatchObject({
        username: "user",
        email: "user@example.mail",
        firstname: "Mr. John", // firstname is overrided by getter
        full_name: "Mr. John Doe", // custom attribute
      });
    }
  });

  test("appended attribute should be available on json", async () => {
    // without appends, attribute still accessible on model instance
    // but no it json
    const user1 = await User.query().first();
    if (user1) {
      expect(user1.full_name).toBeDefined();
      expect(Object.keys(JSON.parse(JSON.stringify(user1)))).not.toContain(
        "full_name"
      );
    }

    // with appends, attribute should be available on json.
    User.setAppends(["full_name"]);
    const user2 = await User.query().first();
    if (user2) {
      expect(Object.keys(JSON.parse(JSON.stringify(user2)))).toContain(
        "full_name"
      );
    }
  });

});
