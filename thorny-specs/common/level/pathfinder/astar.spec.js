/*global console window describe it expect runs waits*/
(function () {
	require.paths.unshift(__dirname + '/../');
	
	describe('the astar pathfinding system', function () {
		it('should have the following functions', function () {
			var ran = false;
			runs(function () {
				require('thorny/base')('./config/default.json')(function ($) {
					var astar = $('thorny level pathfinder astar');
					
					expect(typeof astar.search).toEqual('function');
					expect(typeof astar.__specs).toEqual('function');
					
					ran = true;
				});//instanceof thorny
			});
			waits(200);
			runs(function () {
				expect(ran).toBeTruthy();
			});
		});//it should have the following functions
		
		describe('has a search function', function () {
			it('should find a path through a simple 2d mesh level', function () {
				var ran = false;
				runs(function () {
					require('thorny/base')('./config/default.json')(function ($) {
						$.es().makeEntity()
							.addTag('world')
							.addComponent('load-level', './thorny-spec-demo/files/level/poly.json')
							.triggers('loaded');
						
						$.event().bind('loaded', function () {
							$.getTag('world')
								.getComponent('load-level')
								.first(function (level) {
									var 
										astar = $('thorny level pathfinder astar'),
										path,
										iterator,
										expected,
										i,	// Used for loop control
										ii;	// Used for loop delimiting
									
									// Search the network.
									path = astar.search(
										level.data.xySearch($.getTag('world'), 0, 0),
										level.data.xySearch($.getTag('world'), 50, 150),
										32
										);
									
									iterator = level.data.iterator();
									
									expected = [
										iterator.stepTo(0).node.getMidpoint(),
										iterator.stepTo(1).node.getMidpoint(),
										iterator.stepTo(2).node.getMidpoint()
									];
									
									// Makesure the example path is long enough
									expect(path.length).toEqual(3);

									// Then loop over the collection and expect the 
									// return to match the expected route.
									for (i = 0, ii = expected.length; i < ii; i += 1) {
										expect(path[i].getSimpleCoords())
											.toEqual(expected[i].getSimpleCoords());
									}
									
									ran = true;
								});
						});
					});//instanceof thorny
				});
				waits(50);
				runs(function () {
					expect(ran).toBeTruthy();
				});
			});//it should find a path through a simple 2d mesh level
			
			it('should find a path through a multiple 2d meshs', function () {
				var ran = false;
				runs(function () {
					require('thorny/base')('./config/default.json')(function ($) {
						$.es().makeEntity()
							.addTag('world')
							.addComponent('load-level', './thorny-spec-demo/files/level/multi/one.json')
							.addComponent('load-level', './thorny-spec-demo/files/level/multi/two.json')
							.addComponent('load-level', './thorny-spec-demo/files/level/multi/three.json')
							.triggers('loaded');
						
						$.event().bind('loaded', function () {
							$.getTag('world')
								.getComponent('load-level')
								.first(function (level) {
									var 
										astar = $('thorny level pathfinder astar'),
										path,
										iterator,
										expected,
										i,	// Used for loop control
										ii;	// Used for loop delimiting
										
									// Search the network.
									path = astar.search(
										level.data.xySearch($.getTag('world'), 0, 0),
										level.data.xySearch($.getTag('world'), 300, 100),
										1
										);
									
									iterator = level.data.iterator();
									
									expected = [
										[  33, 33 ], [ 67, 67 ],
										[ 133, 33 ], [ 167, 67 ],
										[ 233, 33 ], [ 267, 67 ]
									];
									
									// Makesure the example path is long enough
									expect(path.length).toEqual(6);
									
									// Then loop over the collection and expect the 
									// return to match the expected route.
									for (i = 0, ii = expected.length; i < ii; i += 1) {
										expect(path[i].getIntegerCoords())
											.toEqual(expected[i]);
									}
									
									ran = true;
								});
						});
					});//instanceof thorny
				});
				waits(200);
				runs(function () {
					expect(ran).toBeTruthy();
				});
			});//it should find a path through a multiple 2d meshs
		});// desc has a search function
		
		describe('has a __specs object', function () {
			// TODO
		});// desc has a __specs object
	});// desc the core node system
}());