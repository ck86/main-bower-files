var fs                 = require('fs'),
    path               = require('path'),
    PackageCollection  = require('./package_collection');

module.exports = function(opts) {
    var collection,
        files,
        bowerrcJson,
        defaults = {
            paths: {
                bowerJson:      './bower.json',
                bowerrc:        './.bowerrc',
                bowerDirectory: './bower_components'
            }
        };

    opts = opts || {};

    if (!opts.paths) {
        opts.paths = {};
    }

    if (typeof opts.paths === 'string'){
        opts.paths = {
            bowerJson        : path.join(opts.paths, defaults.paths.bowerJson),
            bowerrc          : path.join(opts.paths, defaults.paths.bowerrc),
            bowerDirectory   : path.join(opts.paths, defaults.paths.bowerDirectory)
        };
    }

    opts.paths.bowerJson        = opts.paths.bowerJson      || defaults.paths.bowerJson;
    opts.paths.bowerrc          = opts.paths.bowerrc        || defaults.paths.bowerrc;
    opts.paths.bowerDirectory   = opts.paths.bowerDirectory || defaults.paths.bowerDirectory;

    if (fs.existsSync(opts.paths.bowerrc)){
        bowerrcJson = JSON.parse(fs.readFileSync(opts.paths.bowerrc));

        if (bowerrcJson && bowerrcJson.directory) {
            opts.paths.bowerDirectory = path.dirname(opts.paths.bowerrc);
            opts.paths.bowerDirectory = path.join(
                opts.paths.bowerDirectory,
                '/',
                bowerrcJson.directory
            );
        }
    }

    if (!opts.paths.bowerJson || !fs.existsSync(opts.paths.bowerJson)){
        throw new Error('bower.json file does not exist at ' + opts.paths.bowerJson);
    }

    if (!opts.paths.bowerDirectory || !fs.existsSync(opts.paths.bowerDirectory)){
        throw new Error('Bower components directory does not exist at ' +
            opts.paths.bowerDirectory);
    }

    if (!opts.base) {
        opts.base = opts.paths.bowerDirectory;
    }

    if (!opts.includeDev) {
        opts.includeDev = false;
    }

    try {
        collection = new PackageCollection(opts);
        files = collection.getFiles();

        if (opts.filter instanceof RegExp) {
            files = files.filter(function(file) {
                return opts.filter.test(file);
            });
        } else if (typeof opts.filter === 'function') {
            files = files.filter(opts.filter);
        }
    } catch (e) {
        throw e;
    }

    return files || [];
};
