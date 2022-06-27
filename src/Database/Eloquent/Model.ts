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
  [key: string]: any;

  protected static fillable: string[] = [];

  protected static guarded: string[] = [];

  /**
   * Append custom attributes to external data
   */
  protected static appends: string[] = [];

  /**
   * Hide attributes from external data.
   */
  protected static hidden: string[] = [];

  protected static timestamps = true;

  protected static table = "";

  protected static primaryKey = "id";

  /**
   * this to hold setter and getter methods
   * eg: setXXXAttribute, getXXXAttribute
   */
  protected setters: string[] = [];
  protected getters: string[] = [];

  protected attributes: ObjectOf<any> = {};

  constructor() {
    super();

    // collect getter and setter methods.
    this.setters =
      get_class_methods(this)
        .join(";")
        .match(/(?<=(set))(.*?)(?=Attribute)/g) || [];
    this.getters =
      get_class_methods(this)
        .join(";")
        .match(/(?<=(get))(.*?)(?=Attribute)/g) || [];
  }

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

    this.setters.forEach((attribute) => {
      const snakeAttribute = Str.snake(attribute);
      this["set" + attribute + "Attribute"](json[snakeAttribute]);
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

    // attach json to attributes, so it can be modified by user.
    this.attributes = json;

    this.getters.forEach((attribute) => {
      const snakeAttribute = Str.snake(attribute);
      // attach getter and setter to internal attribute
      Object.defineProperty(this, snakeAttribute, {
        // set getter using getXXXAttribute.
        get: this["get" + attribute + "Attribute"],
        // set setter to direct modify on attribute.
        set(v) {
          json[snakeAttribute] = v;
        },

        // this is necessary to make this property editable.
        configurable: true,
      });
    });
    return json;
  }

  /**
   * Format data from internal to external
   * this will run on when toJson method is called.
   */
  $formatJson(json: Pojo): Pojo {
    json = super.$formatJson(json);
    this.getters.forEach((attribute) => {
      // get original database keys from json.attributes
      const attributeKeys = Object.keys(json.attributes);

      const snakeAttribute = Str.snake(attribute);

      // if attribute listed in append or attribute is real,
      // just update attribute directly by run getter
      if (
        (this.constructor as any).appends.includes(snakeAttribute) ||
        attributeKeys.includes(snakeAttribute)
      ) {
        json[snakeAttribute] = this[snakeAttribute];
      }
    });

    // delete attributes, getter and setter so not exposed to external data
    delete json.attributes;
    delete json.setters;
    delete json.getters;

    // delete hidden attributes from external json.
    // but still available on Model instance.
    (this.constructor as any).hidden.forEach((h: string) => {
      delete json[h];
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
