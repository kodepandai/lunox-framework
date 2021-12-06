import type { Application } from "src";
import type Repository from "src/Config/Repository";

class DatabaseManager {
  protected app: Application;
  constructor(app: Application) {
    this.app = app;
  }

  /**
   * Get connection configuration
   */
  protected configuration(name: string) {
    name = name || this.getDefaultConection();
    return name;
  }

  /**
   * Get default connection name
   */
  public getDefaultConection(): string {
    return this.app.make<Repository>("config").get("database.default");
  }
}

export default DatabaseManager;
