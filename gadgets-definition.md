# Gadgets definition
This file contains the gadget definitions to use on the `MediaWiki:Gadgets-definition` page.

## Version 3 only
These are lines used for XFDcloser version 3 (from before this repository was set up).
```
* XFDcloser[ResourceLoader|rights=extendedconfirmed|type=general]|XFDcloser.js
* XFDcloser-core[ResourceLoader|dependencies=mediawiki.util,mediawiki.api,mediawiki.Title,oojs-ui-core,oojs-ui-widgets,oojs-ui-windows,jquery.ui,ext.gadget.libExtraUtil,ext.gadget.morebits|hidden|type=general]|XFDcloser-core.js|XFDcloser.css
```

## Version 4 beta plus version 3
These are lines to use when XFDcloser version 4 is available for beta testing.
```
XFDcloser[ResourceLoader|dependencies=mediawiki.user|rights=extendedconfirmed|type=general]|XFDcloser.js
* XFDcloser-core[ResourceLoader|dependencies=mediawiki.util,mediawiki.api,mediawiki.Title,oojs-ui-core,oojs-ui-widgets,oojs-ui-windows,jquery.ui,ext.gadget.libExtraUtil,ext.gadget.morebits|hidden|type=general]|XFDcloser-core.js|XFDcloser.css
* XFDcloser-core-beta[ResourceLoader|dependencies=mediawiki.util,mediawiki.api,mediawiki.Title,oojs-ui-core,oojs-ui-widgets,oojs-ui-windows,oojs-ui.styles.icons-interactions,oojs-ui.styles.icons-content,oojs-ui.styles.icons-moderation,oojs-ui.styles.icons-alerts,ext.gadget.libExtraUtil|hidden|type=general]|XFDcloser-core-beta.js|XFDcloser.css
```

## Version 4 plus version 4 beta
These are lines to use when XFDcloser version 4 is ready for general use.
```
* XFDcloser[ResourceLoader|dependencies=mediawiki.user|rights=extendedconfirmed|type=general]|XFDcloser.js
* XFDcloser-core[ResourceLoader|dependencies=mediawiki.util,mediawiki.api,mediawiki.Title,oojs-ui-core,oojs-ui-widgets,oojs-ui-windows,oojs-ui.styles.icons-interactions,oojs-ui.styles.icons-content,oojs-ui.styles.icons-moderation,oojs-ui.styles.icons-alerts,ext.gadget.libExtraUtil|hidden|type=general]|XFDcloser-core.js|XFDcloser.css
* XFDcloser-core-beta[ResourceLoader|dependencies=mediawiki.util,mediawiki.api,mediawiki.Title,oojs-ui-core,oojs-ui-widgets,oojs-ui-windows,oojs-ui.styles.icons-interactions,oojs-ui.styles.icons-content,oojs-ui.styles.icons-moderation,oojs-ui.styles.icons-alerts,ext.gadget.libExtraUtil|hidden|type=general]|XFDcloser-core-beta.js|XFDcloser.css
```