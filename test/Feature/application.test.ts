import { Application, DB } from "../../src";
import TestCase from "../TestCase";
beforeAll(() => {
  return TestCase.createApplication();
});
test("can run application", async () => {
  expect(app() instanceof Application).toBe(true);
});

afterAll(() => {
  // Closing the DB connection allows Jest to exit successfully.
  return DB.getDb().destroy();
});
