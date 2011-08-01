/*global window*/
(function (module) {
	/**
	 * Used to observe an observable object.
	 * @param object subject Contains the object that is to observe something else.
	 * @return object Containing the injected observer functionality.
	 */
	module.exports = function ($, module) {
		// Contains the base event system
		var base = {};
		
		// Bind the event system to the global object.
		$.onInit(module, function () {
			$.data(module, 'observable', $('thorny core observable')({}));
			
			// Sometimes you may went to trigger an event before its been 
			//  bound this is where belated comes in to the rescue.
			$.data(module, 'belated', {});
			
			$.registerGlobal('event', function () {
				return base;
			});
		});
		
		/**
		 * Used to bind to an event
		 * @param string|object eventType Contains the type of the event that 
		 * we're expecting to be called, and we want to respond to.
		 * @param function callback Contains the code that is executed when an
		 * event is triggered
		 * @reutrn void
		 */
		base.bind = function (eventType, callback) {
			var data = {};
			data[eventType] = callback;
			
			$.data(module, 'observable').addObserver(
				$('thorny core observer')(data)
				);
			
			// Check to see if there is a belated event we need to trigger.
			if ($.data(module, 'belated')[eventType]) {
				$.data(module, 'belated')[eventType] = undefined;
				this.trigger(eventType);
			}
		};
		
		/**
		 * Used to trigger an event
		 * @param string eventType Contains the type of event being triggered
		 * @param boolean|undefined belatable True if this event is belatable,
		 * otherwise False|undefined
		 * @return void
		 */
		base.trigger = function (eventType, belatable) {
			var executed = $.data(module, 'observable').notifyObservers(eventType);
			
			// If no events we're triggered then we have a belated event.
			if (belatable === true && executed === 0) {
				$.data(module, 'belated')[eventType] = true;
			}
		};
		
		// Return the event system
		return base;
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny/common/core/event')));