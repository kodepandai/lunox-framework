import type {
  Authenticatable,
  Credentials,
} from "../Contracts/Auth/Authenticatable";
import type { ObjectOf } from "../Types";
import type { UserProvider } from "../Contracts/Auth/UserProvider";
import type { ExtendedModel } from "../Database/Eloquent/Model";
import bcrypt from "bcryptjs";

class EloquentUserProvider implements UserProvider {
  model: typeof ExtendedModel;

  constructor(model: typeof ExtendedModel) {
    this.model = model;
  }
  public validateCredentials(
    user: Authenticatable,
    credentials: ObjectOf<any>
  ): boolean {
    return bcrypt.compareSync(credentials.password, user.getAuthPassword());
  }

  public async retrieveByCredentials(
    credentials: Credentials
  ): Promise<Authenticatable | undefined> {
    if (
      !credentials ||
      (Object.keys(credentials).length == 1 &&
        Object.keys(credentials).includes("password"))
    )
      return;
    let query = this.model.query();

    for (const key in credentials) {
      if (!key.includes("password")) query = query.where(key, credentials[key]);
    }
    return (await query.first()) as Authenticatable | undefined;
  }

  public async retrieveById(id: string): Promise<Authenticatable | undefined> {
    return (await this.model
      .query()
      .where(this.model.idColumn, id)
      .first()) as unknown as Authenticatable | undefined;
  }
}
export default EloquentUserProvider;
