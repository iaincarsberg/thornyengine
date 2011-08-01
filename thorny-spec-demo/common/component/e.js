/*global window*/
(function (module) {
	/**
	 * Used to make an object observable
	 * @param object subject Contains the object that is to be observed
	 * @return object Containing the injected observable functionality.
	 */
	module.exports = function ($, module) {
		$.es().registerComponent('e', function () {
			return {
				name: 'component e'
			};
		});
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny-spec-demo/common/component/e')));