/*global window*/
(function (module) {
	/**
	 * Used to observe an observable object.
	 * @param object subject Contains the object that is to observe something else.
	 * @return object Containing the injected observer functionality.
	 */
	module.exports = function ($) {
		return function (subject) {
			/**
			 * Used to execute an event on the observer
			 * @param string eventName Contains the name of the triggered event
			 * @param object observable Contains the thing we're looking at
			 * @return void
			 */
			subject.notify = function (eventName, observable) {
				if (typeof this[eventName] === 'function') {
					// We dont want any of the observer to break anything not
					// related to it, so we surpress any errors.
					try {
						this[eventName](observable);
						return true;
					} catch (e) {
						// Surpress any errors that are caused by our
						// handler function.
						try {
							// Check to see if we have a handler to handle
							// any errors that happen, if we do then
							// execute it.
							if (typeof this.notifyHandler === 'function') {
								this.notifyHandler(e);
								return true;
							}
							
						} catch (ee) {
							// Do nothing.
						}
					}
				}
				return false;
			};
			
			return subject;
		};
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny/common/core/observer')));