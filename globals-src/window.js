import i18n, {loaded} from "./i18n/translate";

// <nowiki>
const $ = window.$;
const mw = window.mw;
const OO = window.OO;

// Pass through the i18n function, attaching the loaded promise
i18n.loaded = loaded;

export { $, OO, mw, i18n };
// </nowiki>