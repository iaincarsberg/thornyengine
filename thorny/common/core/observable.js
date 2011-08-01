/*global window*/
(function (module) {
	/**
	 * Used to make an object observable
	 * @param object subject Contains the object that is to be observed
	 * @return object Containing the injected observable functionality.
	 */
	module.exports = function ($) {
		return function (subject) {
			var observers = [];
			
			/**
			 * Used to allow other observers to observe us
			 * @param object o Contains an object that is observing us
			 * @return void
			 */
			subject.addObserver = function (o) {
				if ((typeof o === 'function' || typeof o === 'object') && typeof o.notify === 'function') {
					observers.push(o);
					
					// Notify the observer that we just added them.
					try {
						o.notify('onRegister', this);
						
					} catch (e) {
						// Do nothing.
					}
				}
			};
			
			/**
			 * Used to notify any observers
			 * @param string eventName Contains the type of event that just 
			 * happened.
			 * @return int Containing the number of executed events
			 */
			subject.notifyObservers = function (eventName) {
				var
					executed = 0, // Contains the number of executed observers
					i,			  // Used for loop control
					ii;			  // Used for loop delimiting
				for (i = 0, ii = observers.length; i < ii; i += 1) {
					// We dont want any of the observers to break the chain of 
					// update, so we surpress any errors.
					try {
						// Notify the observers
						if (observers[i].notify(eventName, this)) {
							// If something was notified then incroment the 
							// executed counter.
							executed += 1;
						}
						
					} catch (e) {
						// Do nothing.
					}
				}
				return executed;
			};
			
			return subject;
		};
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny/common/core/observable')));