var fs                 = require('fs'),
    path               = require('path'),
    globule            = require('globule'),
    vfs                = require('vinyl-fs'),
    through2           = require('through2'),
    PackageCollection  = require('./package_collection');

module.exports = getFiles;
module.exports.stream = stream;

function _createCollection(opts) {
    var config,
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

    bowerJson = opts.paths.bowerJson ?
        path.resolve(process.cwd(), opts.paths.bowerJson) :
        path.resolve(cwd, bowerJson || 'bower.json');

    bowerDirectory = opts.paths.bowerDirectory ?
        path.resolve(process.cwd(), opts.paths.bowerDirectory) :
        path.resolve(cwd, bowerDirectory || 'bower_components');

    if (!bowerJson || !fs.existsSync(bowerJson)) {
        throw new Error('bower.json file does not exist at ' + bowerJson);
    }

    if (!bowerDirectory || !fs.existsSync(bowerDirectory)) {
        throw new Error('Bower components directory does not exist at ' + bowerDirectory);
    }

    opts.includeDev = opts.includeDev || false;
    opts.includeSelf = opts.includeSelf || false;
    opts.paths = {
        bowerJson: bowerJson,
        bowerDirectory: bowerDirectory
    };

    return new PackageCollection(opts);
}

function _filter(files, filter) {
    if (typeof filter === 'string' || Array.isArray(filter)) {
        files = globule.match(filter, files);
    } else if (filter instanceof RegExp) {
        files = files.filter(function(file) {
            return filter.test(file);
        });
    } else if (typeof filter === 'function') {
        files = files.filter(filter);
    }

    return files;
}

function getFiles(filter, opts) {
    if (typeof filter !== 'string' && Array.isArray(filter) === false) {
        opts = filter;
        filter = null;
    }

    filter = opts.filter || filter;

    try {
        var collection = _createCollection(opts),
            files = _filter(collection.getFiles(), filter);

        return files || [];
    } catch (e) {
        throw e;
    }
}

function stream(filter, opts) {
    if (typeof filter !== 'string' && Array.isArray(filter) === false) {
        opts = filter;
        filter = null;
    }

    filter = opts.filter || filter;

    var collection = _createCollection(opts),
        bowerDirectory = collection.opts.paths.bowerDirectory,
        files = _filter(collection.getFiles(), filter),
        _stream = vfs.src(files, opts);

    _stream.pipe(through2.obj(function(file, enc, cb) {
        var _path = file.path.replace(bowerDirectory + path.sep, ''),
            _packageName = _path.split(path.sep).shift(),
            glob;

        file.package = _packageName;
        file.tag = null;

        if (opts.tags && opts.tags[_packageName]) {
            for (glob in opts.tags[_packageName]) {
                if (!globule.match(glob, _path)) {
                    continue;
                }

                file.tag = opts.tags[_packageName][glob];
            }
        }

        cb(null, file);
    }));

    return _stream;
}
