import type { Kernel } from "../src";
import app from "./bootstrap/app";

class TestCase {
  public static async createApplication() {
    try {
      await app.make<Kernel>("HttpKernel", { app }).start(false);
    } catch (error) {
      console.log("fail to create application", error);
    }
  }
}

export default TestCase;
