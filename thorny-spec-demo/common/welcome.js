/*global window*/
(function (module) {
	module.exports = function ($) {
		return function (whom) {
			if (whom === undefined) {
				whom = 'developer';
			}
			return 'Welcome, ' + whom + '!';
		};
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny-spec-demo/common/welcome')));