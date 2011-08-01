/*global window*/
(function (module) {
	/**
	 * Used to make an object observable
	 * @param object subject Contains the object that is to be observed
	 * @return object Containing the injected observable functionality.
	 */
	module.exports = function ($, module) {
		// Contains the base object
		var base = {};
		
		$.onInit(module, function () {
			// Bind the entity-system to the thorny object.
			$.registerGlobal('time', function () {
				return base;
			});
		});
		
		/**
		 * Contains the time since the last tick();
		 * @var int Contains the number of ms since the epoch
		 */
		base.time = new Date().getTime();
		
		/**
		 * Used to get the time.
		 * @param void
		 * @return int Contains the number of ms since the epoch
		 */
		base.now = function () {
			return this.time;
		};
		
		/**
		 * Used to process the now time.
		 * @param void
		 * @return void
		 */
		base.tick = function () {
			this.time = new Date().getTime();
		};
		
		return base;
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny/common/core/time')));