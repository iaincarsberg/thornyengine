/*global window*/
(function (module) {
	module.exports = function ($) {
		return {
			parse: function () {
				return 'parsed';
			},
			network: function () {
				return 'networked';
			}
		};
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny-spec-demo/common/level/fake/shape')));