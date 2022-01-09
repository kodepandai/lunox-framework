import type { Trait } from "../Support/Traitable";
import type Model from "../Database/Eloquent/Model";

const Authenticatable: Trait<typeof Model> = (s) =>
  class extends s {
    password!: string;
    getAuthPassword() {
      return this.password;
    }
    getAuthIdentifierName() {
      return Object.getOwnPropertyDescriptor(this.constructor, "primaryKey")
        ?.value;
    }

    getAuthIdentifier() {
      const idColumn: string = this.getAuthIdentifierName() || "id";
      return this[idColumn as "id"];
    }
  };

export default Authenticatable;
