/// <reference types="svelte" />
/// <reference types="vite/client" />
interface Window {
  _ctx: {
    csrf_token: string;
    view: string;
    data: any;
  };
}
