/*global window*/
(function (module) {
	/**
	 * Used to make an object observable
	 * @param object subject Contains the object that is to be observed
	 * @return object Containing the injected observable functionality.
	 */
	module.exports = function ($, module) {
		$.onInit(module, function () {
			$.data(module, 'positions', {});
			
			$.es().registerComponent('drawable', function () {});
		});
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny/common/component/drawable')));