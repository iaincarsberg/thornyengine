/*global window*/
(function (module) {
	module.exports = function ($) {
		return 'hello, world!';
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./block')));