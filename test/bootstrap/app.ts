import { Application, Kernel } from "../../src";
import path from "path";
import "../../src/helpers";

const basePath = path.join(get_current_dir(import.meta.url), "..");
const app = new Application(basePath);

app.singleton("HttpKernel", Kernel);
export default app;
