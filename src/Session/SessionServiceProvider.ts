import ServiceProvider from "../Support/ServiceProvider";
import SessionManager from "./SessionManager";

class SessionServiceProvider extends ServiceProvider {
  async register() {
    // register session manager
    this.app.singleton("session", () => new SessionManager(this.app));
  }

  async boot() {}
}

export default SessionServiceProvider;
