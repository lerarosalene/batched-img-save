export const API = BROWSER_ENV === "chrome" ? chrome : browser;
export const ACTION = BROWSER_ENV === "chrome" ? API.action : API.browserAction;
