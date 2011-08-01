/*global console window describe xdescribe it expect runs waits*/
(function () {
	require.paths.unshift(__dirname + '/../../../');
	
	describe('the event system', function () {
		it('should have the following functions', function () {
			var ran = false;
			runs(function () {
				require('thorny/base')('./config/default.json')(function ($) {
					var 
						// We want to get the global version first, otherwise
						// the direct call will bind the object to the global
						// namespace automagicially.
						eventSystemGlobal = $.event(),
						eventSystemDirect = $('thorny core event');
					
					// Test the direct implementation
					expect(typeof eventSystemDirect.bind).toEqual('function');
					expect(typeof eventSystemDirect.trigger).toEqual('function');
					
					// Test the global implementation
					expect(typeof eventSystemGlobal.bind).toEqual('function');
					expect(typeof eventSystemGlobal.trigger).toEqual('function');
					
					ran = true;
				});//instanceof thorny
			});
			waits(200);
			runs(function () {
				expect(ran).toBeTruthy();
			});
		});//it should have the following functions
		
		describe('the bind and trigger functions', function () {
			it('should allow us to bind and trigger events in the system', function () {
				var ran = false;
				runs(function () {
					require('thorny/base')('./config/default.json')(function ($) {
						var
							helloWorld = false,
							eatLotsOfCake = false,
							calls = 0;
						
						$.event().bind('hello-world', function () {
								helloWorld = true;
							});
						$.event().bind('eat-lots-of-cake', function () {
								eatLotsOfCake = true;
							});
						$.event().bind('incroment-calls', function () {
								calls += 1;
							});
						
						$.event().trigger('hello-world');
						$.event().trigger('eat-lots-of-cake');
						
						$.event().trigger('incroment-calls');
						$.event().trigger('incroment-calls');
						$.event().trigger('incroment-calls');
						$.event().trigger('incroment-calls');
						$.event().trigger('incroment-calls');
						$.event().trigger('incroment-calls');
						
						expect(helloWorld).toBeTruthy();
						expect(eatLotsOfCake).toBeTruthy();
						expect(calls).toEqual(6);
						
						ran = true;
					});//instanceof thorny
				});
				waits(200);
				runs(function () {
					expect(ran).toBeTruthy();
				});
			});//it should allow us to bind and trigger events in the system
		});// desc the bind and trigger functions
		
		describe('belated events', function () {
			it('should allow us to trigger an event, then bind the listener', function () {
				/**
				 * The reasioning behind belated binding is that it keeps the 
				 * flow of the code logical, meaning you so something that 
				 * takes a while, that requires a callback.
				 * How while callbacks rock, sometimes its better to have an
				 * event that is listened to, so you can bind multiple actions
				 * to a specific event.
				 * How to validate the belated bit, say your loading a level
				 * you tell the system which levels your loading, then you
				 * process that request. Using the normal flow you'd have to
				 * have the code to handle the processing of the loaded levels
				 * before you load them, which looks odd. Belated events lets
				 * the code logically flow.
				 */
				var 
					ran = false,
					helloWorld = false;
				runs(function () {
					require('thorny/base')('./config/default.json')(function ($) {
						$.es().makeEntity()
							.triggers('hello-world');
						
						$.event().bind('hello-world', function () {
							helloWorld = true;
						});	
						
						ran = true;
					});//instanceof thorny
				});
				waits(200);
				runs(function () {
					expect(ran).toBeTruthy();
					expect(helloWorld).toBeTruthy();
				});
			});//it should have the following functions
		});// desc belated events
	});// desc the event system
}());