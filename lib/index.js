var fs                 = require('fs'),
    path               = require('path'),
    PackageCollection  = require('./package_collection');

module.exports = function(opts) {
    var collection,
        files,
        config,
        cwd            = process.cwd(),
        bowerrc        = './.bowerrc',
        bowerJson      = './bower.json',
        bowerDirectory = './bower_components';

    opts = opts || {};
    opts.paths = opts.paths || {};

    if (typeof opts.paths === 'string') {
        cwd = path.resolve(cwd, opts.paths);
    } else {
        bowerrc        = opts.paths.bowerrc || bowerrc;
        bowerJson      = opts.paths.bowerJson || bowerJson;
        bowerDirectory = opts.paths.bowerDirectory || bowerDirectory;
    }

    bowerrc = path.resolve(cwd, bowerrc);

    if (fs.existsSync(bowerrc) && (config = JSON.parse(fs.readFileSync(bowerrc)))) {
        cwd = path.dirname(bowerrc);
        if (config.cwd) {
            cwd = path.resolve(cwd, config.cwd);
        }
        if (config.directory) {
            bowerDirectory = config.directory;
        }
    }

    bowerJson      = path.resolve(cwd, bowerJson);
    bowerDirectory = path.resolve(cwd, bowerDirectory);

    if (!bowerJson || !fs.existsSync(bowerJson)) {
        throw new Error('bower.json file does not exist at ' + bowerJson);
    }

    if (!bowerDirectory || !fs.existsSync(bowerDirectory)) {
        throw new Error('Bower components directory does not exist at ' + bowerDirectory);
    }

    opts.base = opts.base || bowerDirectory;
    opts.includeDev = opts.includeDev || false;
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
        }
    } catch (e) {
        throw e;
    }

    return files || [];
};
