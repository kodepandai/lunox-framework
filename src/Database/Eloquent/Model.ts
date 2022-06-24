import { Model as ObjectionModel, StaticHookArguments } from "objection";
abstract class Model extends ObjectionModel {
  id?: number;
  created_at?: Date;
  updated_at?: Date;

  protected static fillable: string[] = [];

  protected static guarded: string[] = [];

  protected static timestamps = true;

  protected static table = "";

  protected static primaryKey = "id";


  static get tableName() {
    return this.table;
  }

  static get idColumn() {
    return this.primaryKey;
  }

  static beforeInsert(args: StaticHookArguments<any, any>) {
    // if timestamps is true, set created_at of all input to current date.
    if(this.timestamps){
      this.touchTimeStamps(args.inputItems, "created_at");
    }

    this.filterFillableAndGuardedInput(args.inputItems);
  }

  static beforeUpdate(args: StaticHookArguments<any, any>) {
    // if timestamps is true, set updated_at of all input to current date.
    if(this.timestamps){
      this.touchTimeStamps(args.inputItems, "updated_at");
    }
    
    this.filterFillableAndGuardedInput(args.inputItems);
  }

  protected static touchTimeStamps(inputItems: any[], key: string){
    inputItems.map(input =>{
      input[key] = new Date();
      return input;
    });
  }

  /**
   * filter input from fillable and guarded value.
   */
  protected static filterFillableAndGuardedInput(inputItems: any[]){
    // if fillable array is set, 
    // reject input that not listed in fillable array
    if(this.fillable.length>0){
      inputItems.map((input)=>{
        Object.keys(input).forEach(key=>{
          if(!this.fillable.includes(key)){
            delete input[key];
          }
        });
        return input;
      });
    }

    // if guarded array is set,
    // reject all input that listed in guarded array.
    if(this.guarded.length>0){
      inputItems.map((input)=>{
        this.guarded.forEach(key=>{
          delete input[key];
        });
        return input;
      });
    }
  }
}

export class ExtendedModel extends Model {}

export default Model;
