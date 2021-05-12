// Set up Banana-i18n to mock jQuery-i18n. As this is just for development/testing purposes,
// the locale is hard-coded to "en"
const Banana = require("banana-i18n");
const banana = new Banana();
const i18n = banana.i18n;
i18n.load = banana.load;
i18n.locale = "en";
const messages = require("../i18n/messages-example.json");
banana.load(messages, 'en');
const loaded = new Promise((resolve, reject) => resolve("loaded"));

export default i18n;
export {loaded};