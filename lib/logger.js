require('colors');

var colors = ['red', 'blue', 'magenta', 'grey', 'yellow', 'green'];

module.exports = function() {
	var args = Array.prototype.slice.call(arguments);

	args = args.map(function(arg, i) {
		return arg[colors[i]];
	});

	console.log.apply(console.log, args);
};
