/*global window*/
(function (module) {
	module.exports = function ($, module) {
		$.onInit(module, function () {
			// Used to create an instance specific unique id.
			$.data(module, 'nextId', (function () {
				var instance = 0;
				return function () {
					return (instance += 1);
				};
			}()));
			
			// Contains a collection of modules which need to inject functionality
			$.data(module, 'injectors', []);
		});
			
		/**
		 * Used to create an entity.
		 * @param array varargs Contains any arguments supplied to customise 
		 * this entity.
		 * @return object Containing an entity
		 */
		var base = function (varargs) {
			var 
				i,	// Used for loop control
				ii,	// Used for loop delimiting
				
				key, 
				// Create a new entity.
				entity = $('thorny core observable')({
					id: $.data(module, 'nextId')(),
					
					/**
					 * Used to remove this entity.
					 * @param void
					 * @return void
					 */
					remove: function () {
						this.notifyObservers('remove');
					}
				}),
				
				// Grab the injectors, and apply them.
				injectors = $.data(module, 'injectors'),
				i,	// Used for loop control
				ii;	// Used for loop delimiting
			
			// If the varargs isn't an array make it one.
			if (varargs === undefined) {
				varargs = [];
			}
			
			// Execute all injector code.
			for (i = 0, ii = injectors.length; i < ii; i += 1) {
				injectors[i](entity);
			}
			
			// Loop over the varargs
			for (i = 0, ii = varargs.length; i < ii; i += 1) {
				switch (varargs[i]) {
				case $.defined('template'):
					entity.makeTemplate();
					break;
				case $.defined('---'):

					break;
				}
			}
			
			// Return the newly created entity.
			return entity;
		};
		
		/**
		 * Used to allow code to be injected into every entity that gets
		 * created.
		 * @param function code Contains code to be injected into every 
		 * entity that gets created.
		 * @return void
		 */
		base.inject = function (code) {
			if (typeof code === 'function') {
				$.data(module, 'injectors').push(code);
			}
		};
		
		return base;
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny/common/entity-system/entity')));