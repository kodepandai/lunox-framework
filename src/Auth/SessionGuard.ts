import type {
  Authenticatable,
  Credentials,
} from "../Contracts/Auth/Authenticatable";
import type { StatefulGuard } from "../Contracts/Auth/StatefulGuard";
import type { UserProvider } from "../Contracts/Auth/UserProvider";
import type SessionManager from "../Session/SessionManager";
import GuardHelper from "./GuardHelpers";

class SessionGuard extends GuardHelper implements StatefulGuard {
  name: string;
  provider!: UserProvider;
  session: SessionManager;
  lastAttempted: Authenticatable | undefined;

  protected loggedOut = false;

  constructor(name: string, provider: UserProvider, session: SessionManager) {
    super();
    this.name = name;
    this.provider = provider;
    this.session = session;
  }
  public async validate(credentials: Credentials): Promise<boolean> {
    this.lastAttempted = await this.provider.retrieveByCredentials(credentials);
    return this.hasValidCredentials(this.lastAttempted, credentials);
  }

  public async once(credentials: Credentials) {
    if (await this.validate(credentials)) {
      this.setUser(this.lastAttempted as Authenticatable);
      return true;
    }
    return false;
  }

  public async attempt(
    credentials: Credentials = { password: "" },
    remember = false
  ) {
    if (remember) {
      // TODO: implement auth via remember
    }
    const user = await this.provider.retrieveByCredentials(credentials);
    if (this.hasValidCredentials(user, credentials)) {
      await this.login(user as Authenticatable, remember);
      return true;
    }
    return false;
  }

  protected hasValidCredentials(
    user: Authenticatable | undefined,
    credentials: Credentials
  ) {
    return (
      user != undefined && this.provider.validateCredentials(user, credentials)
    );
  }

  public async login(user: Authenticatable, remember?: boolean) {
    await this.updateSession(user.getAuthIdentifier());
    if (remember) {
      // TODO: implement login via remember
    }
    this.setUser(user);
  }

  public logout(): void {
    this.clearUserDataFromStorage();
    this._user = undefined;
    this.loggedOut = true;
  }

  public setUser(user: Authenticatable) {
    this._user = user;
    this.loggedOut = false;
    return this;
  }

  public getName() {
    return `login_${this.name}_${sha1("session")}`;
  }

  protected async updateSession(id: string) {
    await this.session.migrate(true);
    this.session.put(this.getName(), id);
  }

  public async user<T=Authenticatable>(): Promise<T|undefined> {
    if (this.loggedOut) {
      return;
    }
    if (this._user) {
      return this._user as unknown as T;
    }

    const id = this.session.get(this.getName());
    if (id) {
      this._user = await this.provider.retrieveById(id);
    }

    // TODO: implement get user from remember
    return this._user as unknown as T;
  }

  protected clearUserDataFromStorage(){
    this.session.remove(this.getName());
  }
}

export default SessionGuard;
