/*global window*/
(function (module) {
	module.exports = function ($) {
		return function () {
			return 'testy, world!';
		};
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny/node.js/test')));