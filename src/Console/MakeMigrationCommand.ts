import Command from "./Command";

class MakeMigrationCommand extends Command {

  protected signature = "make:migration {migration_name : name of migration}";
  
  protected description = "make database migration";

  public async handle(){
    this.info("making migration...");
    console.log(this.options());
    // this.shellExec(`knex migrate:make ${this.args} `)
    return this.SUCCESS;
  }
}

export default MakeMigrationCommand;