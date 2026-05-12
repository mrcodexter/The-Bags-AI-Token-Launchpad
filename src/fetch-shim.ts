const _fetch = window.fetch.bind(window);
export default _fetch;
export const fetch = _fetch;
export const Headers = window.Headers;
export const Request = window.Request;
export const Response = window.Response;
