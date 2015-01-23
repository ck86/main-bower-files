var mainBowerFiles  = require('../'),
    through2        = require('through2');

require('should');

describe('main-bower-files::stream', function() {
    function expect(expectedFiles) {
        function run(path, options, done) {
            options = options || {};

            var srcFiles = [],
                stream;

            if (!options.paths) {
                options.paths = {};
            }

            if (!options.paths.bowerJson) {
                options.paths.bowerJson = __dirname + path;
            }

            if (!options.paths.bowerrc) {
                options.paths.bowerrc = __dirname + '/.bowerrc';
            }

            stream = mainBowerFiles.stream(options);

            stream.pipe(through2.obj(function(file, enc, cb) {
                srcFiles.push({
                    package: file.package,
                    tag: file.tag
                });

                cb(null, file);
            }));

            stream.on('error', done);

            stream.on('end', function() {
                srcFiles.should.be.eql(expectedFiles);
                done();
            });
        }

        return {
            fromConfig: function(path, options) {
                return {
                    when: function(done) {
                        run(path, options, done);
                    }
                };
            }
        };
    }

    it('should return a stream with expected tags', function(done) {
        var options = {
            tags: {
                multi: {
                    '**/*.js': 'js',
                    '**/*.css': 'css'
                }
            }
        };

        expect([
            { package: 'simple', tag: null },
            { package: 'overwritten', tag: null },
            { package: 'multi', tag: 'css' },
            { package: 'multi', tag: 'css' },
            { package: 'hasPackageNoBower', tag: null },
            { package: 'deepPaths', tag: null },
            { package: 'decoy', tag: null }
        ]).fromConfig('/_bower.json', options).when(done);
    });
});
