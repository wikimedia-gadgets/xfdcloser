# XFDcloser
This is the source code for version 4 of the Wikipedia gadget [XFDcloser](https://en.wikipedia.org/wiki/Wikipedia:XFDcloser).

## Installation instructions and user guide
Will be available at [https://en.wikipedia.org/wiki/Wikipedia:XFDcloser](https://en.wikipedia.org/wiki/Wikipedia:XFDcloser). Currently, that page is for version 3.

## Repository structure
- `bin\` contains scripts to run with node. To run, type `node bin\FILENAME` in the terminal (`.js` extensions are optional)
   - `server.js` is a simple node server to allow testing via the [localhost import trick](https://en.wikipedia.org/wiki/Wikipedia:User_scripts/Guide#Loading_it_from_a_localhost_web_server).
   - `testall.js` facilitates the npm script `test:all` (see "npm scripts" section below)
- `dist\` contains the files that have been built from source files: "core" files that contain the bulk of the code, "loader" files that load the corresponding core file only if some basic checks pass, and CSS styles.
   - `dist\core.js` contains bundled and transpiled code, with a source map. Loaded when doing on-wiki testing (see "On-wiki testing" section below).
   - `dist\core.min.js` is the minified version of core.js.
   - `dist\core-gadget.js` is the final version, including comments about it being a global gadget file. It is published to:
      - [MediaWiki:Gadget-XFDcloser-core-beta.js](https://en.wikipedia.org/wiki/MediaWiki:Gadget-XFDcloser-core-beta.js) for beta testing.
      - [MediaWiki:Gadget-XFDcloser-core.js](https://en.wikipedia.org/wiki/MediaWiki:Gadget-XFDcloser-core.js) to update the *live version* of the script, once the other versions have been adequately tested.
   - `dist\loader-dev.js` is a loader for the testing the development version, used when doing on-wiki testing (see "On-wiki testing" section below).
   - `dist\loader-gadget.js` is a loader for the gadget version. It is published to [MediaWiki:Gadget-XFDcloser.js](https://en.wikipedia.org/wiki/MediaWiki:Gadget-XFDcloser.js) (the *live version* of the script), once the other versions have been adequately tested.
   - `dist\styles-gadget.css` is the stylesheet for the gadget version. It is published to [MediaWiki:Gadget-XFDcloser-core.css](https://en.wikipedia.org/wiki/MediaWiki:Gadget-XFDcloser-core.css) (the *live version* of the stylesheet).
- `globals-src\` contains the source code used to build the file `globals.js` in the root directory. This setup allows the globals `$`, `mw`, and `OO` to  be sourced from either the window object, or from npm packages and mocking, depending on whether code is being built for deployment or being tested in a Node environment.
- `loader-src\` contains the code to load the main code if the current page passes checks, written in ES5. This is split into the core code for various checks, as well as "top" and "bottom" loader code, for development and gadget versions. Due to the splitting, these files are not valid javascript (until concatenated in the build step), and so they are named as .js.txt files.
- `mocks\` contains mocks/shims used for testing purposes only.
- `styles-src\styles.css` is the stylesheet for the script. The rules here are concatenated with top and bottom comments to build the gadget version's stylesheet.
- `test\` contains the unit tests, organised by the file being tested
- `xfdcloser-src\` contains the main source code for the app, split into modules, which may be written in ES6. Code here can assume that the ResourceLoader modules (as specified in the loaders, or in [MediaWiki:Gadgets-definition](https://en.wikipedia.org/wiki/MediaWiki:Gadgets-definition) as applicable) have been loaded and that the DOM is ready.
   - `App.js` is the entry point
   - Related code should be placed in the same module.
   - Small pieces of code, not particularly related to anything, can be placed in `xfdcloser-src\util.js`

### npm scripts
- `npm run test`: Run units tests. To only run some tests, change the relevent `describe` or `it` functions to `describe.only` or `it.only`
   - `npm run test:all`: Run all units tests, removing anny occurances of `.only`
- `npm run lint`: Lints files, with the --fix option turned on
- `npm run build`: Lints and unit tests the source files, then builds distribution files (bundles, transpiles, minifies, and concatenates)
   - `npm run build:dev`: Same as above, but builds just the development versions of files (skips the minifaction and concatenation steps). Saves some time when building for on-wiki testing.
   - `npm run build:quickdev`: Only builds the development versions of files. Skips the linting and testing as well as the minifaction and concatenation. Very quick, but use with caution as the automated checks aren't being run!  
- A few other scripts are available, mostly helper scripts for the above rather than scripts to run by themselves.

### Tooling
- **eslint** for ES6 linting
- **jshint** for ES5 linting ([ESLint doesn't support override for ecmaVersion](https://github.com/sindresorhus/eslint-config-xo/issues/16#issuecomment-190302577))
- **stylelint** for CSS linting
- **browserify** with **babelify** for bundling, transpiling, and source-mapping
- **uglifyjs** for minifying
- **concat-cli** for concatenation
- **mocha** for unit testing

## On-wiki testing
On-wiki testing is conducted at the [Test Wikipedia](https://test.wikipedia.org/wiki/Main_Page) (testwiki).
- Note that the `extendedconfirmed` permission does not exist there, so the gadget definition lines need to be adjusted accordingly when testing non-admin accounts.

### Testing development version
1. Ensure the XFDcloser gadget is *not* enabled in your preferences.
2. Add code like the following to [your common.js](https://test.wikipedia.org/wiki/Special:MyPage/common.js):

   ```js
   // Dev version of XFDcloser
   var xfdcDevUrl = "http://localhost:8125/dist/loader-dev.js";
   mw.loader.getScript(xfdcDevUrl).catch(function(e) {
	   e.message += " " + xfdcDevUrl;
	   console.error(e);
   });
   ```

3. Set up mock XFD discussions. A development version of Twinkle is available as a gadget, and can be used to nominate pages for deletion.
4. First time only: create the /dist/ folder so the build script doesn't throw an error.
5. Run `npm run build:dev`.
6. Run `node bin/server` in a terminal (in the directory where your local repistory is located).
7. Now when you visit the XFD log/discussion pages, the most recently built version of the script will be loaded.

### Testing deployment
1. Comment out or remove the code that load the development version from [your common.js](https://test.wikipedia.org/wiki/Special:MyPage/common.js)
2. Ensure the XFDcloser gadget is enabled in your preferences.
3. Deploy to testwiki (see "Repository structure" section above for what goes where)
4. Set up mock XFD discussions. A development version of Twinkle is available as a gadget, and can be used to nominate pages for deletion.
5. Now when you visit the XFD log/discussion pages, the testwiki gadget with the files you deployed will be loaded.

## Deployment
As XFDcloser is a gadget, you must have interface-admin rights to deploy to the wiki.
1. Ensure:
   - changes are committed and merged to master branch on GitHub rep 
   - you are currently on the master branch, and synced with GitHub repo
2. Bump the version number. See the comments in the `bin\version.js` file for how to do this from the terminal. 
3. Commit the version change, and push/sync to GitHub repo
4. Run a full build: run `npm run build` in terminal
5. You are now ready to deploy: see the comments in the `bin\deploy.js` file for how to do this from the terminal.

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