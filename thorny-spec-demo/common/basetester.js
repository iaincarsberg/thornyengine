/*global window*/
(function (module) {
	module.exports = function ($, module) {
		$.onInit(module, function () {
			if (! $.data(module, 'incromented')) {
				$.data(module, 'incromented', 0);
			}
			var val = $.data(module, 'incromented');
			$.data(module, 'incromented', val += 1);
		});
		
		
		return {
			getModule: function () {
				return module;
			},
			getIncromented: function () {
				return $.data(module, 'incromented');
			}
		};
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny-spec-demo/common/basetester')));