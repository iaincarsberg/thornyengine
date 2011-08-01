/*global window*/
(function (module) {
	module.exports = function ($) {
		return function () {
			return 'test, world!';
		};
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny/browser/test')));