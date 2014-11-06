var fs                 = require('fs'),
    path               = require('path'),
    minimatch          = require('minimatch'),
    PackageCollection  = require('./package_collection');

module.exports = function(opts) {
    var collection,
        files,
        config,
        bowerrc,
        bowerJson,
        bowerDirectory,
        cwd = process.cwd();

    opts = opts || {};
    opts.paths = opts.paths || {};

    if (typeof opts.paths === 'string') {
        cwd = path.resolve(cwd, opts.paths);
    } else {
        bowerrc = opts.paths.bowerrc;
    }

    bowerrc = path.resolve(cwd, bowerrc || '.bowerrc');

    if (fs.existsSync(bowerrc) && (config = JSON.parse(fs.readFileSync(bowerrc)))) {
        cwd = path.dirname(bowerrc);
        if (config.cwd) {
            cwd = path.resolve(cwd, config.cwd);
        }
        if (config.directory) {
            bowerDirectory = config.directory;
        }
    }

    bowerJson = opts.paths.bowerJson ? path.resolve(process.cwd(), opts.paths.bowerJson)
                                     : path.resolve(cwd, bowerJson || 'bower.json');

    bowerDirectory = opts.paths.bowerDirectory ?
        path.resolve(process.cwd(), opts.paths.bowerDirectory) :
        path.resolve(cwd, bowerDirectory || 'bower_components');

    if (!bowerJson || !fs.existsSync(bowerJson)) {
        throw new Error('bower.json file does not exist at ' + bowerJson);
    }

    if (!bowerDirectory || !fs.existsSync(bowerDirectory)) {
        throw new Error('Bower components directory does not exist at ' + bowerDirectory);
    }

    opts.base = opts.base || bowerDirectory;
    opts.includeDev = opts.includeDev || false;
    opts.includeSelf = opts.includeSelf || false;
    opts.paths = {
        bowerJson: bowerJson,
        bowerDirectory: bowerDirectory
    };

    try {
        collection = new PackageCollection(opts);
        files = collection.getFiles();

        if (opts.filter instanceof RegExp) {
            files = files.filter(function(file) {
                return opts.filter.test(file);
            });
        } else if (typeof opts.filter === 'function') {
            files = files.filter(opts.filter);
        } else if (typeof opts.filter === 'string') {
            files = files.filter(function(file) {
                return minimatch(file, opts.filter);
            });
        }
    } catch (e) {
        throw e;
    }

    return files || [];
};
