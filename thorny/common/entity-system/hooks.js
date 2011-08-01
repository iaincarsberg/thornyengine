/*global window*/
(function (module) {
	module.exports = function ($, module) {
		$.onInit(module, function () {
			var postponeTrigger = {};
			
			$.es().inject.entity(function (entity) {
				/**
				 * Used to hook the $.openFile function directly into an 
				 * entity, which allows us to trigger async events.
				 * @param string path Contains the path to the file we're 
				 * opening for use.
				 * @param function callback Contains a callback that will be
				 * parsed the loaded file.
				 * @reutrn this to allow object chaining
				 */
				entity.openFile = function (path, callback) {
					var entity = this;
					
					if (postponeTrigger[entity.id] === undefined) {
						postponeTrigger[entity.id] = {
							count: 0,
							events: []
						};
					}
					
					postponeTrigger[entity.id].count += 1;
					
					$.openFile(path, function (data) {
						callback(data);
						postponeTrigger[entity.id].count -= 1;
						
						// If this was the last item to complete then trigger 
						// any bound events.
						if (postponeTrigger[entity.id].count === 0) {
							var 
								i,
								ii,
								events = postponeTrigger[entity.id].events;
							
							for (i = 0, ii = events.length; i < ii; i += 1) {
								entity.triggers(events[i]);
							}
						}
					});
					
					return this;
				};
				
				/**
				 * Used to trigger an event once async operations have been 
				 * completed.
				 * @param string varargs Contains the event names we're 
				 * wanting to trigger once a chain of operations has completed.
				 * @return this to allow object chaining
				 */
				entity.triggers = function () {
					var
						i,
						ii,
						events;
					
					if (postponeTrigger[entity.id] === undefined ||
						postponeTrigger[entity.id].count === 0
					) {
						// Trigger the realtime event
						for (i = 0, ii = arguments.length; i < ii; i += 1) {
							// Trigger the belatable event
							$.event().trigger(arguments[i], true);
						}
						
					} else {
						var events = postponeTrigger[entity.id].events;
						
						// Store the belatable event
						for (i = 0, ii = arguments.length; i < ii; i += 1) {
							if (! $._.include(events, arguments[i])) {
								events.push(arguments[i]);
							}
						}
					}
					
					return this;
				};
			});
		});
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny/common/entity-system/hooks')));