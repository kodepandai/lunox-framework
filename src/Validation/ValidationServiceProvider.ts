import ServiceProvider from "../Support/ServiceProvider";
import Factory from "./Factory";
import Validator from "../Support/Facades/Validator";
import DB from "../Support/Facades/DB";

class ValidationServiceProvider extends ServiceProvider {
  async register() {
    this.app.singleton("validator", () => {
      return new Factory(this.app);
    });
  }
  async boot() {
    Validator.extend("unique", async (args, value) => {
      if (!args || args.length < 2 || args.length > 4) {
        throw new Error(
          "Invalid rule args, the usage must be unique:table,value,?ignored,?ignoredColumn=id"
        );
      }
      const [table, column, ignored, ignoredColumn = "id"] = args;
      const dupplicate = await DB.table(table).where(column, value).first();
      if (
        ignored &&
        dupplicate?.[ignoredColumn].toString() == ignored.toString()
      ) {
        return true;
      }
      if (dupplicate) return false;
      return true;
    });
  }
}

export default ValidationServiceProvider;
