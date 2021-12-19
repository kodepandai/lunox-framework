import type { ObjectOf } from "../Types";
import type Application from "../Foundation/Application";
import type { Store } from "express-session";
import type Repository from "../Config/Repository";
import type { Configuration } from "../Contracts/Session";

class SessionManager {
  protected app: Application;

  protected session: ObjectOf<any>;

  constructor(app: Application) {
    this.app = app;
    this.session = {};
  }

  public setSession(session: any) {
    this.session = session;
    return this;
  }

  public all() {
    return this.session;
  }

  public put(key: string, value: any) {
    this.session[key] = value;
  }

  public has(key: string): boolean {
    return Object.keys(this.session).includes(key) && this.session[key] != null;
  }

  public exists(key: string): boolean {
    return Object.keys(this.session).includes(key);
  }

  public getDefaultDriver() {
    return "file";
  }

  public async getStore(session: any): Promise<Store> {
    const sessionStores: ObjectOf<string> = {
      file: "session-file-store",
    };
    const driverStore = sessionStores[this.getDefaultDriver()];
    try {
      const store = (await import(driverStore)).default(session);
      return new store(this.getStoreConfig());
    } catch (error) {
      throw new Error(
        `please install [${driverStore}] to use ${this.getDefaultDriver()} session driver`
      );
    }
  }

  private getStoreConfig() {
    switch (this.getDefaultDriver()) {
      case "file":
        return {
          path: this.getConfig().files,
          logFn: () => {},
        };

      default:
        return {};
    }
  }

  public getConfig(): Configuration {
    return this.app.make<Repository>("config").get("session");
  }
}
export default SessionManager;
