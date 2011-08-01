/*global window*/
(function (module) {
	var 
		/**
		 * Used to expose the default options
		 * @param void
		 * @return object Containing the default options
		 */
		defaultOptions = function () {
			return {
			
			};
		},
	
		/**
		 * Used to expose the execute default options
		 * @param void
		 * @return object Containing the default options
		 */
		executeOptions = function () {
			return {
				from: false,
				to: false
			};
		};
	
	/**
	 * Used to make an object observable
	 * @param object subject Contains the object that is to be observed
	 * @return object Containing the injected observable functionality.
	 */
	module.exports = function ($, module) {
		$.es().registerComponent('pathfindable', function () {
			return {
				attach: function (entity, options) {
					// Without a loaded level its not possible to attatch the
					// pathfindable component.
					//if (! entity.hasComponent('load-level')) {
					//	return false;
					//}
					
					//options = $._.extend(defaultOptions(), options);
					
					// Process a level to make it pathfindable
				},
				
				execute: function (entity, options) {
					options = $._.extend(executeOptions(), options);
					
					// The from and to must be set.
					if (! options.from || ! options.to) {
						return false;
					}
				}
			};
		});
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny/common/component/pathfindable')));