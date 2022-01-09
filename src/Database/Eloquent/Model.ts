import { Model as ObjectionModel } from "objection";
import Str from "../../Support/Str";
abstract class Model extends ObjectionModel {
  id?: number;
  created_at?: Date;
  updated_at?: Date;

  protected static timestamps = true;

  protected static table = "";

  protected static primaryKey = "id";

  static get tableName() {
    return this.table || Str.plural(this.name.toLowerCase());
  }

  static get idColumn() {
    return this.primaryKey;
  }

  $beforeUpdate() {
    if ((this.constructor as any).timestamps) {
      this.updated_at = new Date();
    }
  }
}

export class ExtendedModel extends Model {}

export default Model;
