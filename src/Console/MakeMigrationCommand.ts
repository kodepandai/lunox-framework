import DB from "../Support/Facades/DB";
import Command from "./Command";

class MakeMigrationCommand extends Command {

  protected signature = "make:migration {migration_name : name of migration}";
  
  protected description = "make database migration";

  public async handle(){
    this.info("making migration...");
    await DB.getDb().migrate.make(this.argument("migration_name"));
    this.comment(`created migration file ${this.argument("migration_name")}`);
    return this.SUCCESS;
  }
}

export default MakeMigrationCommand;