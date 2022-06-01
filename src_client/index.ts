const SSR = import.meta.env.SSR;
export const csrf_token = () => (SSR ? "" : window._ctx?.csrf_token);
