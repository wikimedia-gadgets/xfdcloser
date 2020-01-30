# XFDcloser
This is the source code for version 4 of the Wikipedia gadget [XFDcloser](https://en.wikipedia.org/wiki/Wikipedia:XFDcloser).

## Installation instructions and user guide
Will be available at [https://en.wikipedia.org/wiki/Wikipedia:XFDcloser](https://en.wikipedia.org/wiki/Wikipedia:XFDcloser). Currently, that page is for version 3.

## Repository structure
- `index.js` is the on-wiki entry point, written in ES5. This is published to [MediaWiki:Gadget-XFDcloser.js](https://en.wikipedia.org/wiki/MediaWiki:Gadget-XFDcloser.js) (when deploying). 
   - `index-loader.js` is similar, but is designed for testing changes to the sandbox version of XFDCloser in userspace. It is deployed to [User:Evad37/XFDcloser/sandbox.js](https://en.wikipedia.org/wiki/User:Evad37/XFDcloser/sandbox.js) for sandbox testing and development, or [User:Evad37/XFDcloser/beta.js](https://en.wikipedia.org/wiki/User:Evad37/XFDcloser/beta.js) for beta testing
- `xfdcloser-src\` contains the main source code for the app, split into modules, which may be written in ES6. Code here can assume that the ResourceLoader modules specified in the above files have been loaded and that the DOM is ready.
   - `App.js` is the entry point
   - Related code should be placed in the same module.
   - Small pieces of code, not particularly related to anything, can be placed in `xfdcloser-src\util.js`
- The source code is bundled, transpiled, and minified using `npm run build`. This writes two files to the `dist\` directory:
   - `dist\core.js` contains bundled and transpiled code, with a source map. It is published to [User:Evad37/XFDcloser/sandbox/core.js](https://en.wikipedia.org/wiki/User:Evad37/XFDcloser/sandbox/core.js), for testing/debugging purposes.
   - `dist\core.min.js` is the minified version.  It is published to [MediaWiki:Gadget-XFDcloser-core.js](https://en.wikipedia.org/wiki/MediaWiki:Gadget-XFDcloser-core.js) (the *live version* of the script), once the sandbox version has been adequately tested. Or [User:Evad37/XFDcloser/beta/core.js](https://en.wikipedia.org/wiki/User:Evad37/rater/beta/app.js) for beta testing.

### Tooling
- **eslint** for ES6 linting
- **jshint** for ES5 linting ([ESLint doesn't support override for ecmaVersion](https://github.com/sindresorhus/eslint-config-xo/issues/16#issuecomment-190302577))
- **browserify** with **babelify** for bundling, transpiling, and source-mapping
- **uglifyjs** for minifying

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