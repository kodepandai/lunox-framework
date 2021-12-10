import {Model as ObjectionModel} from "objection";
import Str from "../../Support/Str";
abstract class Model extends ObjectionModel {

  id?: number;
  created_at?: Date;
  updated_at?: Date;

  protected static timestamps = true;

  protected static table = "";

  static get tableName(){
    return this.table || Str.plural(this.name.toLowerCase());
  }

  $beforeUpdate() {
    if((this.constructor as any).timestamps){
      this.updated_at = new Date();
    }
  }

}

export default Model;