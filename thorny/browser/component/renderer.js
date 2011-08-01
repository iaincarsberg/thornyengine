/*global window Processing console*/
(function (module) {
	/**
	 * Used to build the attach options.
	 * @param object $ Contains a reference to thorny
	 * @param object options Contains the attachment specific options
	 * @return object Containing the attached options
	 */
	var attachOptions = function ($, options) {
		if (typeof options !== 'object') {
			options = {};
		}
		return $._.extend((function () {
			return {
				system: false
			};
		}()), options);
	};
	
	module.exports = function ($) {
		$.onInit(module, function () {
			$.data(module, 'draw', {});
			$.es().registerComponent('renderer', function () {
				return {
					/**
					 * Used to attach a renderer to an entity
					 * @param object entity Contains the entity we're adding 
					 * a renderer to.
					 * @param string file Contains the file to load
					 * @return void
					 */
					attach: function (entity, options) {
						options = attachOptions($, options);
						
						$.data(module, 'draw')[entity.id] = 
							$('thorny renderer ' + options.system)
								.attach(options);
					},
					
					/**
					 * Used to execute the renderer
					 * @param void
					 * @return void
					 */
					execute: function (entity) {
						$.data(module, 'draw')[entity.id]();
					}
				};
			});
		});
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny/browser/component/renderer')));