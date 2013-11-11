// this is an example build script; several actions are for demonstration purposes
var fs = require("fs"),
    requireLazy = require("require-lazy"),
    path = require("path"),
    options = {
        basePath: '/Users/eduardo/Sites/example',
        outputBaseDir: '/Users/eduardo/Sites/example',
        makeBuildRelativePath: function(x) {
                return path.normalize(path.join(__dirname, x));
        }
    },
    config = {
        "appDir": "./",
        "baseUrl": "./",
        "mainConfigFile": "./config.js",
        "dir": "../build/IRRELEVANT",
        "inlineText": true,
        "name": "main",
        "optimize": "none",
        "normalizeDirDefines": true,
        "paths": {
            "jquery": "empty:"
        },
        "GUARD": null
    };

    console.log(options.basePath);

// get a fresh copy of the files
// copyFileSync("../../../src/lib/lazy.js", __dirname + "/../public/scripts/lib/lazy.js");
// copyFileSync("../../../src/lib/lazy-builder.js", __dirname + "/../public/scripts/lib/lazy-builder.js");
// copyFileSync("../../../src/lib/promise-adaptor-jquery.js", __dirname + "/../public/scripts/lib/promise-adaptor-jquery.js");

requireLazy.build(options, config, function(modules, pmresult) { // this callback is optional
    var util = require("util"), path = require("path");
    fs.writeFileSync(path.join(options.outputBaseDir, "modules.js"), util.inspect(modules,{depth:null,colors:false}));
    fs.writeFileSync(path.join(options.outputBaseDir, "bundles.js"), util.inspect(pmresult.bundles,{depth:null,colors:false}));
    console.log("success");
});

// function copyFileSync(srcFile, destFile) {
//     var encoding = "utf8", content = fs.readFileSync(srcFile, encoding);
//     fs.writeFileSync(destFile, content, encoding);
// }