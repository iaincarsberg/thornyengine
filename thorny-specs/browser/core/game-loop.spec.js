/*global console window describe it expect runs waits*/
(function (isBrowser) {
	if (! isBrowser) {
		return;
	}
	
	require.paths.unshift(__dirname + '/../');
	
	describe('the game-loop system', function () {
		it('should have the following functions', function () {
			var ran = false;
			runs(function () {
				require('thorny/base')('./config/default.json')(function ($) {
					var gameLoop = $('thorny core game-loop');
					
					expect(typeof gameLoop.factory).toEqual('function');
					expect(typeof gameLoop.factory().start).toEqual('function');
					expect(typeof gameLoop.factory().stop).toEqual('function');
					
					ran = true;
				});//instanceof thorny
			});
			waits(200);
			runs(function () {
				expect(ran).toBeTruthy();
			});
		});//it should have the following functions
		
		describe('has a start function', function () {
			it('should call the tick every 25ms', function () {
				var ran = false,
					loops = 0,
					gameLoop;
				
				runs(function () {
					require('thorny/base')('./config/default.json')(function ($) {
						gameLoop = $('thorny core game-loop').factory({
							simulationTicksPerSecond: 25,
							maxFrameSkip: 25,
							useInterpolation: true
						});
						
						gameLoop.start(function () {
							loops += 1;
							ran = true;
							
						}, function () {
							//
						});
						
					});//instanceof thorny
				});
				waits(200);
				runs(function () {
					gameLoop.stop();
					expect(loops).toBeTruthy(8);
					expect(ran).toBeTruthy();
				});
			});//it should call the tick every 25ms
			
			it('should call the tick every 50ms', function () {
				var ran = false,
					loops = 0,
					gameLoop;
				
				runs(function () {
					require('thorny/base')('./config/default.json')(function ($) {
						gameLoop = $('thorny core game-loop').factory({
							simulationTicksPerSecond: 25,
							maxFrameSkip: 25,
							useInterpolation: true
						});
						
						gameLoop.start(function () {
							loops += 1;
							ran = true;
							
						}, function () {
							//
						});
						
					});//instanceof thorny
				});
				waits(200);
				runs(function () {
					gameLoop.stop();
					expect(loops).toBeTruthy(4);
					expect(ran).toBeTruthy();
				});
			});//it should call the tick every 50ms
			
			describe('that requires two functions', function () {
				describe('the first function is used to update the world', function () {
					it('should be parsed the current timestamp in 25ms incroments', function () {
						var ran = false,
							last,
							loops = 0,
							gameLoop;

						runs(function () {
							require('thorny/base')('./config/default.json')(function ($) {
								gameLoop = $('thorny core game-loop').factory({
									simulationTicksPerSecond: 25,
									maxFrameSkip: 25,
									useInterpolation: true
								});

								gameLoop.start(function (timestamp) {
									loops += 1;
									if (last === undefined) {
										last = timestamp;
										return;
									}
									expect(timestamp - last).toEqual(40);//1000 / 25
									
									last = timestamp;
									ran = true;

								}, function () {
									//
								});

							});//instanceof thorny
						});
						waits(200);
						runs(function () {
							gameLoop.stop();
							expect(loops).toBeTruthy(8);
							expect(ran).toBeTruthy();
						});
					});// it should be parsed the current timestamp in 25ms incroments
					
					it('should be parsed the current timestamp in 50ms incroments', function () {
						var ran = false,
							last,
							loops = 0,
							gameLoop;

						runs(function () {
							require('thorny/base')('./config/default.json')(function ($) {
								gameLoop = $('thorny core game-loop').factory({
									simulationTicksPerSecond: 50,
									maxFrameSkip: 25,
									useInterpolation: true
								});

								gameLoop.start(function (timestamp) {
									loops += 1;
									if (last === undefined) {
										last = timestamp;
										return;
									}
									expect(timestamp - last).toEqual(20);//1000 / 25
									
									last = timestamp;
									ran = true;

								}, function () {
									//
								});

							});//instanceof thorny
						});
						waits(200);
						runs(function () {
							gameLoop.stop();
							expect(loops).toBeTruthy(4);
							expect(ran).toBeTruthy();
						});
					});// it should be parsed the current timestamp in 50ms incroments
				});// desc the first function is used to update the world
				
				describe('the second function is used to render the world', function () {
					it('should be parsed the current timestamp', function () {
						
					});// desc should be parsed the current timestamp
				});// desc the second function is used to render the world
			});// desc that requires two functions
			
			it('should use entity interpolation', function () {
				// TODO
			});// it should use entity interpolation
			
			it("shouldn't use entity  interpolation", function () {
				// TODO
			});// it shouldn't use entity  interpolation
			
			it('should skip a render call to a minimum of 25 frames', function () {
				// TODO
			});// it should skip a render call to a minimum of 25 frames
		});// has a start function
		
		describe('has a end function', function () {
			it('should have the following functions', function () {
				var ran = false;
				runs(function () {
					require('thorny/base')('./config/default.json')(function ($) {
						// TODO
						ran = true;
					});//instanceof thorny
				});
				waits(200);
				runs(function () {
					expect(ran).toBeTruthy();
				});
			});//it should have the following functions
		});// has a end function
	});// desc the game-loop system
}((typeof window !== 'undefined') ? true : false));