# LUNOX-FRAMEWORK
This is Lunox Framework. What is Lunox? Lunox is Laravel-Flavoured NodeJs framework. See full documentation [here](https://github.com/kodepintar/lunox)

## Installation
Lunox currently only support ESM module. So make sure your package.json has `"type": "module"`. Please use latest nodejs and typescript version. Using `pnpm` as package manager is recomended. Type this command to add lunox in your nodejs application:
```bash
pnpm add lunox
```
## Optional Dependencies
### View - Svelte
If you are using view (lunox using svelte as template engine), make sure svelte is also installed as dependency (not dev dependency), because we need `svelte/internal` as ssr component renderer. For development, we are using vite as frontend tooling. Add vite as dev dependency
```bash
pnpm add svelte
pnpm add vite -D
```

### Storage - S3 Adapter
By default, Filesytem manager is using local driver. If you want to use amazon s3 driver, please make sure `@slynova/flydrive-s3` adapter is also installed as dependency.
```bash
pnpm add @slynova/flydrive-s3
```