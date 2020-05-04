# XFDcloser
This is the source code for version 4 of the Wikipedia gadget [XFDcloser](https://en.wikipedia.org/wiki/Wikipedia:XFDcloser).

## Installation instructions and user guide
Will be available at [https://en.wikipedia.org/wiki/Wikipedia:XFDcloser](https://en.wikipedia.org/wiki/Wikipedia:XFDcloser). Currently, that page is for version 3.

## Repository structure
- `dist\` contains the files that have been built from source files: "core" files that contain the bulk of the code, "loader" files that load the corresponding core file only if some basic checks pass, and CSS styles.
   - `dist\core.js` contains bundled and transpiled code, with a source map. Loaded when doing on-wiki testing (see "On-wiki testing" section below).
   - `dist\core.min.js` is the minified version of core.js.
   - `dist\core-gadget.js` is the final version, including comments about it being a global gadget file. It is published to:
      - [MediaWiki:Gadget-XFDcloser-core-beta.js](https://en.wikipedia.org/wiki/MediaWiki:Gadget-XFDcloser-core-beta.js) for beta testing.
      - [MediaWiki:Gadget-XFDcloser-core.js](https://en.wikipedia.org/wiki/MediaWiki:Gadget-XFDcloser-core.js) to update the *live version* of the script, once the other versions have been adequately tested.
   - `dist\loader-dev.js` is a loader for the testing the development version, used when doing on-wiki testing (see "On-wiki testing" section below).
   - `dist\loader-gadget.js` is a loader for the gadget version. It is published to [MediaWiki:Gadget-XFDcloser.js](https://en.wikipedia.org/wiki/MediaWiki:Gadget-XFDcloser.js) (the *live version* of the script), once the other versions have been adequately tested.
   - `dist\styles-gadget.css` is the stylesheet for the gadget version. It is published to [MediaWiki:Gadget-XFDcloser-core.css](https://en.wikipedia.org/wiki/MediaWiki:Gadget-XFDcloser-core.css) (the *live version* of the stylesheet).
- `xfdcloser-src\` contains the main source code for the app, split into modules, which may be written in ES6. Code here can assume that the ResourceLoader modules (as specified in the loaders, or in [MediaWiki:Gadgets-definition](https://en.wikipedia.org/wiki/MediaWiki:Gadgets-definition) as applicable) have been loaded and that the DOM is ready.
   - `App.js` is the entry point
   - Related code should be placed in the same module.
   - Small pieces of code, not particularly related to anything, can be placed in `xfdcloser-src\util.js`
- `loader-src\` contains the code to load the main code if the current page passes checks, written in ES5. This is split into the core code for various checks, as well as "top" and "bottom" loader code, for development and gadget versions. Due to the splitting, these files are not valid javascript (until concatenated in the build step), and so they are named as .js.txt files.
- `styles-src\styles.css` is the stylesheet for the script. The rules here are concatenated with top and bottom comments to build the gadget version's stylesheet.
- `server.js` is a simple node server to allow testing via the [localhost import trick](https://en.wikipedia.org/wiki/Wikipedia:User_scripts/Guide#Loading_it_from_a_localhost_web_server).
- The source code is bundled, transpiled, minified, and concatenated using `npm run build`. This writes the files to the `dist\` directory. To only build the development versions (`dist\core.js` and `dist\loader-dev.js`), use `npm run build:dev` instead.

### Tooling
- **eslint** for ES6 linting
- **jshint** for ES5 linting ([ESLint doesn't support override for ecmaVersion](https://github.com/sindresorhus/eslint-config-xo/issues/16#issuecomment-190302577))
- **stylelint** for CSS linting
- **browserify** with **babelify** for bundling, transpiling, and source-mapping
- **uglifyjs** for minifying
- **concat-cli** for concatenation

## On-wiki testing
### Testwiki
1. Add code like the following to [your common.js](https://test.wikipedia.org/wiki/Special:MyPage/common.js):

   ```js
   // Dev version of XFDcloser
   var xfdcDevUrl = "http://localhost:8125/dist/loader-dev.js";
   mw.loader.getScript(xfdcDevUrl).catch(function(e) {
	   e.message += " " + xfdcDevUrl;
	   console.error(e);
   });
   ```

2. Set up mock XFD discussions. A development version of Twinkle is available as a gadget, and can be used to nominate pages for deletion.
3. Run `node server` in a terminal (in the directory where your local repistory is located)
4. Now when you visit the XFD log/discussion pages, the most recently built version of the script will be loaded.

### English Wikipedia
1. Add code like the following to [your common.js](https://en.wikipedia.org/wiki/Special:MyPage/common.js), replacing `YOURUSERNAME` with your user name:

   ```js
   // <nowiki>
   var XFDC_SANDBOX = true;
   var XFDC_MAKE_SANDBOX_CONFIG = function(config) {
      config.user.isSysop = true;
      config.user.sig = config.user.isSysop ? '~~~~' : '<small>[[Wikipedia:NACD|(non-admin closure)]]</small> ~~~~';
      config.xfd.path = 'User:YOURUSERNAME/sandbox/' + config.xfd.path;
      config.xfd.subpagePath = 'User:YOURUSERNAME/sandbox/' + config.xfd.subpagePath;
      config.script.advert = ' ([[User:YOURUSERNAME/XFDcloser/sandbox.js|XFDcloser/sandbox]])';
      config.script.version += '-sandbox';
      config.xfd.ns_logpages = 2; // User
      config.xfd.ns_unlink = ['3']; // User_talk
      console.log('[XFDcloser] isSysop: ' + config.user.isSysop);
      return config;
   };
   // </nowiki>
   var xfdcDevUrl = "http://localhost:8125/dist/loader-dev.js";
   mw.loader.getScript(xfdcDevUrl).catch(function(e) {
      e.message += " " + xfdcDevUrl;
      console.error(e);
   });
   ```

2. Create XFD log/discussion pages in your userspace, similar to [User:Evad37/sandbox/Wikipedia:Templates_for_discussion/Log/2016_August_31](https://en.wikipedia.org/wiki/User:Evad37/sandbox/Wikipedia:Templates_for_discussion/Log/2016_August_31)
3. Run `node server` in a terminal (in the directory where your local repistory is located)
4. Now when you visit the XFD log/discussion pages (including in your userspace), the most recently built version of the script will be loaded.

## Planned features
A general overview of planned features:
- [ ] Redo interface using OOUI, similar to Rater
- [ ] Preferences, similar to Rater
- [ ] Rename option for CfD, and possibly some other feature requests on WT:XFDC
- [ ] Possibly add handling for closing requested moves
### Roadmap
- [ ] Complete the v4 rewrite
- [ ] Get beta testers to try out the new version. Fix/adjust things as they get reported.
- [ ] Release the new version generally.