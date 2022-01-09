import type { Authenticatable, Credentials } from "./Authenticatable";

export interface UserProvider {
  validateCredentials(user: Authenticatable, credentials: Credentials): boolean;
  retrieveByCredentials(
    credentials: Credentials
  ): Promise<Authenticatable | undefined>;
  retrieveById(id: string): Promise<Authenticatable | undefined>;
}
