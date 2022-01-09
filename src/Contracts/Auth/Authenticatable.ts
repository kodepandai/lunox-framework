import type { ExtendedModel } from "../../Database/Eloquent/Model";

export interface Authenticatable extends ExtendedModel {
  getAuthIdentifierName(): string;
  getAuthPassword(): string;
  getAuthIdentifier(): string;
}

export interface Credentials {
  password: string;
  [key: string]: string;
}
