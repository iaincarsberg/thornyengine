/*global window requestAnimFrame animStartTime setTimeout console*/
(function (module) {
	module.exports = function ($) {
		return {
			factory: function () {
				return {
					start: function () {},
					end: function () {}
				};
			}
		};
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny/node.js/component/renderer')));