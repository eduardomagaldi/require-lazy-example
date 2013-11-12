/*jslint node: true, unparam: true, nomen: true */
/*global exec */

'use strict';

var fs = require("fs"),
    requireLazy = require("require-lazy"),
    path = require("path"),
    options = {
        basePath: './',
        outputBaseDir: './jsmin',
        makeBuildRelativePath: function (x) {
            return path.normalize(path.join(__dirname, x));
        }
    },
    config = {
        "appDir": "./",
        "baseUrl": "./js",
        "mainConfigFile": "./js/config.js",
        "dir": "../jsmin",
        "inlineText": true,
        "name": "main",
        "optimize": "none",
        "normalizeDirDefines": true
    };

// get a fresh copy of the files
// copyFileSync("../../../src/lib/lazy.js", __dirname + "/../public/scripts/lib/lazy.js");
// copyFileSync("../../../src/lib/lazy-builder.js", __dirname + "/../public/scripts/lib/lazy-builder.js");
// copyFileSync("../../../src/lib/promise-adaptor-jquery.js", __dirname + "/../public/scripts/lib/promise-adaptor-jquery.js");
console.time('done');
console.time('a');
console.timeEnd('a');

requireLazy.build(options, config, function (modules, pmresult) { // this callback is optional
    console.timeEnd('done');
    console.log(modules);
    console.log();
    console.log(pmresult);
    var util = require("util"), path = require("path");
    fs.writeFileSync(path.join(options.outputBaseDir, "modules.js"), util.inspect(modules, {depth: null, colors: false}));
    fs.writeFileSync(path.join(options.outputBaseDir, "bundles.js"), util.inspect(pmresult.bundles, {depth: null, colors: false}));
});

// function copyFileSync(srcFile, destFile) {
//     var encoding = "utf8", content = fs.readFileSync(srcFile, encoding);
//     fs.writeFileSync(destFile, content, encoding);
// }
