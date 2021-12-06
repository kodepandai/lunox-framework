import type { ObjectOf } from "../Types";
import type Repository from "src/Config/Repository";
import type { Configuration } from "src/Contracts/Database";
import type Application from "../Foundation/Application";

class DatabaseManager {
  protected app: Application;
  protected config: ObjectOf<any> = {};
  protected driver: any;
  protected db: any;

  constructor(app: Application) {
    this.app = app;
  }

  /**
   * Get connection configuration
   */
  protected configuration(name: string | null = null): Configuration {
    name = name || this.getDefaultConnection();
    if (this.config[name]) {
      return this.config[name];
    }
    const connection = this.app
      .make<Repository>("config")
      .get("database.connections");
    if (connection[name] === null) {
      throw new Error(`Database connection [${name}] not configured.`);
    }
    this.config[name] = connection[name];
    return connection[name];
  }

  /**
   * Get default connection name
   */
  public getDefaultConnection(): string {
    return this.app.make<Repository>("config").get("database.default");
  }

  /**
   * Boot registered driver to application
   */
  public async bootDriver() {
    const client = this.getDefaultConnection();
    if (this.isUsingKnex(client)) {
      this.driver = (await import("knex")).default;
    } else {
      // TODO: implement mongodb based driver
      throw new Error(`currently [${client}] database driver not supported`);
    }
  }

  /**
   * make connection to database
   */
  public async makeConnection() {
    const name = this.getDefaultConnection();
    const config = this.configuration(name);
    const driver: ObjectOf<string> = {
      mysql: "mysql",
      pgsql: "pg",
      sqlite: "sqlite3",
    };
    this.db = this.driver({
      client: driver[config.driver],
      connection: {
        host: config.host,
        user: config.username,
        password: config.password,
        database: config.database,
      },
    });
  }

  /**
   * check is connection using knexjs
   */
  private isUsingKnex(name: string) {
    return ["mysql", "sqlite", "pgsql"].includes(name);
  }

  public async table(table: string) {
    return this.db(table);
  }
}

export default DatabaseManager;
