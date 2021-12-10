import Command from "./Command";
import fs from "fs";
import path from "path";

class MakeSeederCommand extends Command {
  protected signature = "make:seeder {name} : class name of seeder}";

  protected description = "make database seeder";

  public async handle() {
    this.info("making seeder...");
    const SeederName = this.argument("name");
    const seederStub = fs.readFileSync(base_path("../stub/seeder"), {
      encoding: "utf-8",
    });
    const content = seederStub.replace(/#SeederName/g, SeederName);
    fs.writeFileSync(
      path.join(
        base_path("../database/seeders"),
        this.argument("name") + ".ts"
      ),
      content
    );
    this.comment(`created seeder file ${this.argument("name")}`);
    return this.SUCCESS;
  }
}

export default MakeSeederCommand;
