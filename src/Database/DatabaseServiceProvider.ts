import { ServiceProvider } from "src";

class DatabaseServiceProvider extends ServiceProvider {
  public async register() {
    this.app.singleton("db", () => {});
  }
}

export default DatabaseServiceProvider;
