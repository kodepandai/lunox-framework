export interface Configuration {
  driver: "file" | "cookie" | "database";
  lifetime: number;
  files: string;
  table: string;
  cookie: string;
  path: string;
  domain: string | null;
  http_only: boolean;
  same_site: "lax" | "strict" | "none" | null;
  secure: boolean;
}
