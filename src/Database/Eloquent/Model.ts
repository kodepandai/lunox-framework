import {
  Model as ObjectionModel,
  ModelOptions,
  Pojo,
  StaticHookArguments,
} from "objection";
import { Str } from "../../Support";
import type { ObjectOf } from "../../Types";
abstract class Model extends ObjectionModel {
  id?: number;
  created_at?: Date;
  updated_at?: Date;

  protected static fillable: string[] = [];

  protected static guarded: string[] = [];

  protected static timestamps = true;

  protected static table = "";

  protected static primaryKey = "id";

  protected attributes: ObjectOf<any> = {};

  static get tableName() {
    return this.table;
  }

  static get idColumn() {
    return this.primaryKey;
  }

  static beforeInsert(args: StaticHookArguments<any, any>) {
    // if timestamps is true, set created_at of all input to current date.
    if (this.timestamps) {
      this.touchTimeStamps(args.inputItems, "created_at");
    }

    this.filterFillableAndGuardedInput(args.inputItems);
  }

  static beforeUpdate(args: StaticHookArguments<any, any>) {
    // if timestamps is true, set updated_at of all input to current date.
    if (this.timestamps) {
      this.touchTimeStamps(args.inputItems, "updated_at");
    }

    this.filterFillableAndGuardedInput(args.inputItems);
  }

  /**
   * Parse external data to Model instance
   * we can set custom attribute here by running setXxxAttribute methods.
   */
  $parseJson(json: Pojo, opt?: ModelOptions | undefined): Pojo {
    json = super.$parseJson(json, opt);
    get_class_methods(this)
      .join(";")
      .match(/(?<=(set))(.*?)(?=Attribute)/g)
      ?.forEach((attribute) => {
        const snakeAttribute = Str.snake(attribute);
        (this as any)["set" + attribute + "Attribute"](json[snakeAttribute]);
      });
    json = { ...json, ...this.attributes };
    return json;
  }

  /**
   * Parse data from database to Model instance.
   * We can get custom attribute here by running getXxxAttribute methods.
   */
  $parseDatabaseJson(json: Pojo): Pojo {
    json = super.$parseDatabaseJson(json);
    const jsonKeys = Object.keys(json);
    get_class_methods(this)
      .join(";")
      .match(/(?<=(get))(.*?)(?=Attribute)/g)
      ?.forEach((attribute) => {
        const snakeAttribute = Str.snake(attribute);
        // only run getXxxAtribute for selected columns.
        if (jsonKeys.includes(snakeAttribute)) {
          json[snakeAttribute] = (this as any)[
            "get" + attribute + "Attribute"
          ]();
        }
      });
    return json;
  }

  protected static touchTimeStamps(inputItems: any[], key: string) {
    inputItems.map((input) => {
      input[key] = new Date();
      return input;
    });
  }

  /**
   * filter input from fillable and guarded value.
   */
  protected static filterFillableAndGuardedInput(inputItems: any[]) {
    // if fillable array is set,
    // reject input that not listed in fillable array
    if (this.fillable.length > 0) {
      inputItems.map((input) => {
        Object.keys(input).forEach((key) => {
          if (!this.fillable.includes(key)) {
            delete input[key];
          }
        });
        return input;
      });
    }

    // if guarded array is set,
    // reject all input that listed in guarded array.
    if (this.guarded.length > 0) {
      inputItems.map((input) => {
        this.guarded.forEach((key) => {
          delete input[key];
        });
        return input;
      });
    }
  }
}

export class ExtendedModel extends Model {}

export default Model;
