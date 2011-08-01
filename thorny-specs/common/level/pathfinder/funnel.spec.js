/*global console window describe xdescribe it expect runs waits*/
(function () {
	require.paths.unshift(__dirname + '/../');
	
	
	describe('the astar funnel system', function () {
		it('should have the following functions', function () {
			var ran = false;
			runs(function () {
				require('thorny/base')('./config/default.json')(function ($) {
					var funnel = $('thorny level pathfinder funnel');

					expect(typeof funnel.process).toEqual('function');
					expect(typeof funnel.edgeify).toEqual('function');
					expect(typeof funnel.pointify).toEqual('function');
					expect(typeof funnel.funnel).toEqual('function');
					
					ran = true;
				});//instanceof thorny
			});
			waits(200);
			runs(function () {
				expect(ran).toBeTruthy();
			});
		});//it should have the following functions
		
		describe('has a process function', function () {
			it('should process a simple a* result set into a path', function () {
				var ran = false;
				runs(function () {
					require('thorny/base')('./config/default.json')(function ($) {
						var 
							astar  = $('thorny level pathfinder astar'),
							funnel = $('thorny level pathfinder funnel'),
							fromClick,
							toClick,
							from,
							to,
							route,
							path,
							expected,
							i,	// Used for loop control
							ii;	// Used for loop delimiting
							
						// Load the levels
						$.es().makeEntity()
							.addTag('world')
							.addComponent('load-level', './thorny-spec-demo/files/level/room1.json')
							.addComponent('load-level', './thorny-spec-demo/files/level/room2.json')
							.triggers('loaded');
							
						// Listen for the loaded event.
						$.event().bind('loaded', function () {
							$.getTag('world')
								.getComponent('load-level')
								.first(function (level) {
									// Test one
									fromClick = $('thorny math vector2').factory(496, 50);
									toClick = $('thorny math vector2').factory(108, 340);
									from = level.data.xySearch($.getTag('world'), fromClick.getX(), fromClick.getY());
									to = level.data.xySearch($.getTag('world'), toClick.getX(), toClick.getY());
									
									// Search the network.
									route = astar.search(from, to, 16);
									path = funnel.process(
										fromClick,
										toClick,
										route,
										8
									);
									
									expected = [
										[496, 50],
										[346.9021048893677, 138.82161461266867],
										[108, 340]
									];

									expect(path.length).toEqual(expected.length);
									for (i = 0, ii = path.length; i < ii; i += 1) {
										expect(path[i].getSimpleCoords())
											.toEqual(expected[i]);
									}
									

									// Test two
									fromClick = $('thorny math vector2').factory(504, 54);
									toClick = $('thorny math vector2').factory(56, 458);
									from = level.data.xySearch($.getTag('world'), fromClick.getX(), fromClick.getY());
									to = level.data.xySearch($.getTag('world'), toClick.getX(), toClick.getY());
									
									route = astar.search(from, to, 16);
									path = funnel.process(
										fromClick,
										toClick,
										route,
										8
									);
									
									expected = [
										[504, 54],
										[427.438320875638, 116.38829388709452],
										[427.73361032928375, 171.04725945468473],
										[246.30525363717314, 366.28527956868874],
										[214.8145449315424, 360.96798414640267],
										[56, 458]
									];

									expect(path.length).toEqual(expected.length);
									for (i = 0, ii = path.length; i < ii; i += 1) {
										expect(path[i].getSimpleCoords())
											.toEqual(expected[i]);
									}

									// Test three
									fromClick = $('thorny math vector2').factory(280, 434);
									toClick = $('thorny math vector2').factory(114, 144);
									from = level.data.xySearch($.getTag('world'), fromClick.getX(), fromClick.getY());
									to = level.data.xySearch($.getTag('world'), toClick.getX(), toClick.getY());
									
									route = astar.search(from, to, 16);
									path = funnel.process(
										fromClick,
										toClick,
										route,
										8
									);
									
									expected = [
										[280, 434],
										[332.9183139651247, 259.859691291925],
										[304.6472248043002, 237.8797646649217],
										[114, 144]
									];

									expect(path.length).toEqual(expected.length);
									for (i = 0, ii = path.length; i < ii; i += 1) {
										expect(path[i].getSimpleCoords())
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
			});//it should process a simple a* result set into a path
		});// desc has a process function
		
		describe('has a edgeify function', function () {
			it('should process a simple a* result set into a list of edges', function () {
				var ran = false;
				runs(function () {
					require('thorny/base')('./config/default.json')(function ($) {
						// Load the levels
						$.es().makeEntity()
							.addTag('world')
							.addComponent('load-level', './thorny-spec-demo/files/level/poly.json')
							.triggers('loaded');
							
						// Listen for the loaded event.
						$.event().bind('loaded', function () {
							$.getTag('world')
								.getComponent('load-level')
								.first(function (level) {
									var
										funnel = $('thorny level pathfinder funnel'),
										iterator = level.data.iterator(),
										item,
										route = [],
										path,
										expected,
										i,	// Used for loop control
										ii;	// Used for loop delimiting

									while ((item = iterator.step().node)) {
										route.push(item);
									}

									expect(route.length).toEqual(3);
									path = funnel.edgeify(route);

									expected = [
										iterator.stepTo(0).node.getVector2s()[0].getSimpleCoords(),
										iterator.stepTo(0).node.getVector2s()[1].getSimpleCoords(),
										iterator.stepTo(1).node.getVector2s()[2].getSimpleCoords(),
										iterator.stepTo(2).node.getVector2s()[2].getSimpleCoords(),
										iterator.stepTo(0).node.getVector2s()[2].getSimpleCoords()
									];

									expect(path.length).toEqual(expected.length);
									for (i = 0, ii = expected.length; i < ii; i += 1) {
										expect(path[i].getSimpleCoords())
											.toEqual(expected[i]);
									}

									ran = true;
								});
						});// event().bind loaded
					});
				});
				waits(200);
				runs(function () {
					expect(ran).toBeTruthy();
				});
			});// it should process a simple a* result set into a list of edges
			
			it('should process a simple a* result set into a list of edges', function () {
				var ran = false;
				runs(function () {
					require('thorny/base')('./config/default.json')(function ($) {
						// Load the levels
						$.es().makeEntity()
							.addTag('world')
							.addComponent('load-level', './thorny-spec-demo/files/level/poly.json')
							.triggers('loaded');
							
						// Listen for the loaded event.
						$.event().bind('loaded', function () {
							$.getTag('world')
								.getComponent('load-level')
								.first(function (level) {
									var
										funnel = $('thorny level pathfinder funnel'),
										iterator = level.data.iterator(),
										item,
										route = [],
										path,
										expected,
										i,	// Used for loop control
										ii;	// Used for loop delimiting

									while ((item = iterator.step().node)) {
										if (route.length < 2) {
											route.push(item);
										}
									}

									expect(route.length).toEqual(2);
									path = funnel.edgeify(route);

									expected = [
										iterator.stepTo(0).node.getVector2s()[0].getSimpleCoords(),
										iterator.stepTo(0).node.getVector2s()[1].getSimpleCoords(),
										iterator.stepTo(1).node.getVector2s()[2].getSimpleCoords(),
										iterator.stepTo(0).node.getVector2s()[2].getSimpleCoords()
									];

									expect(path.length).toEqual(expected.length);
									for (i = 0, ii = expected.length - 1; i < ii; i += 1) {
										expect(path[i].getSimpleCoords())
											.toEqual(expected[i]);
									}

									ran = true;
								});
						});// event().bind loaded
					});//instanceof thorny
				});
				waits(200);
				runs(function () {
					expect(ran).toBeTruthy();
				});
			});//it should process a simple a* result set into a list of edges
			
			it('should find the edges in a complex single-level poly network', function () {
				var ran = false;
				runs(function () {
					require('thorny/base')('./config/default.json')(function ($) {
						// Load the levels
						$.es().makeEntity()
							.addTag('world')
							.addComponent('load-level', './thorny-spec-demo/files/level/room.json')
							.triggers('loaded');
							
						// Listen for the loaded event.
						$.event().bind('loaded', function () {
							$.getTag('world')
								.getComponent('load-level')
								.first(function (level) {
									var 
										funnel = $('thorny level pathfinder funnel'),
										astar  = $('thorny level pathfinder astar'),
										from,
										to,
										route,
										edges,
										expected,
										i,	// Used for loop control
										ii;	// Used for loop delimiting

									expected = [
										[212, 334],
										[243, 359],
										[325, 261],
										[423, 441],
										[246, 486],
										[183, 438],
										[211, 368],
										[198, 358]
									];
									
									from = level.data.xySearch($.getTag('world'), 218, 350);
									to = level.data.xySearch($.getTag('world'), 330, 354);
									
									route = astar.search(
										from,
										to,
										16
										);
									
									edges = funnel.edgeify(route);

									expect(edges.length).toEqual(expected.length);
									for (i = 0, ii = edges.length; i < ii; i += 1) {
										expect(edges[i].getSimpleCoords())
											.toEqual(expected[i]);
									}

									ran = true;
								});
						});// event().bind loaded
					});//instanceof thorny
				});
				waits(200);
				runs(function () {
					expect(ran).toBeTruthy();
				});
			});//it should find the edges in a complex single-level poly network
			
			it('should find the edges in a complex multi-level poly network', function () {
				var ran = false;
				runs(function () {
					require('thorny/base')('./config/default.json')(function ($) {
						// Load the levels
						$.es().makeEntity()
							.addTag('world')
							.addComponent('load-level', './thorny-spec-demo/files/level/room1.json')
							.addComponent('load-level', './thorny-spec-demo/files/level/room2.json')
							.triggers('loaded');
							
						// Listen for the loaded event.
						$.event().bind('loaded', function () {
							$.getTag('world')
								.getComponent('load-level')
								.first(function (level) {
									var 
										funnel = $('thorny level pathfinder funnel'),
										astar  = $('thorny level pathfinder astar'),
										from,
										to,
										route,
										edges,
										expected,
										i,	// Used for loop control
										ii;	// Used for loop delimiting

									expected = [
										[212, 334],
										[243, 359],
										[325, 261],
										[423, 441],
										[246, 486],
										[183, 438],
										[211, 368],
										[198, 358]
									];
									
									
									from = level.data.xySearch($.getTag('world'), 218, 350);
									to = level.data.xySearch($.getTag('world'), 330, 354);
									
									route = astar.search(
										from,
										to,
										16
										);
									edges = funnel.edgeify(route);

									expect(edges.length).toEqual(expected.length);
									for (i = 0, ii = edges.length; i < ii; i += 1) {
										expect(edges[i].getSimpleCoords())
											.toEqual(expected[i]);
									}

									ran = true;
									
									ran = true;
								});
						});// event().bind loaded
					});//instanceof thorny
				});
				waits(200);
				runs(function () {
					expect(ran).toBeTruthy();
				});
			});//it should find the edges in a complex multi-level poly network
		});// desc has a edgeify function
		
		describe('has a pointify function', function () {
			it('should process a list of edges into a list of internal points', function () {
				var ran = false;
				runs(function () {
					require('thorny/base')('./config/default.json')(function ($) {
						// Load the levels
						$.es().makeEntity()
							.addTag('world')
							.addComponent('load-level', './thorny-spec-demo/files/level/poly.json')
							.triggers('loaded');
							
						// Listen for the loaded event.
						$.event().bind('loaded', function () {
							$.getTag('world')
								.getComponent('load-level')
								.first(function (level) {
									var
										funnel = $('thorny level pathfinder funnel'),
										iterator = level.data.iterator(),
										pointifyed,// Will the pointifyed data
										path = [
											iterator.stepTo(0).node,
											iterator.stepTo(1).node
										],
										edges = [
											iterator.stepTo(0).node.getVector2s()[0],
											iterator.stepTo(0).node.getVector2s()[2],
											iterator.stepTo(1).node.getVector2s()[2],
											iterator.stepTo(0).node.getVector2s()[1]
										];

									pointifyed = $('thorny level pathfinder funnel').pointify(path, edges, 50);

									expect(pointifyed.length).toEqual(4);
									expect(pointifyed[0].getIntegerCoords()).toEqual([35, 35]);
									expect(pointifyed[1].getIntegerCoords()).toEqual([35, 65]);
									expect(pointifyed[2].getIntegerCoords()).toEqual([65, 65]);
									expect(pointifyed[3].getIntegerCoords()).toEqual([65, 35]);

									// We round because its possible there will be
									// slight rounding errors.
									expect(Math.round(pointifyed[0].distance(edges[0]))).toEqual(50);
									expect(Math.round(pointifyed[1].distance(edges[1]))).toEqual(50);
									expect(Math.round(pointifyed[2].distance(edges[2]))).toEqual(50);
									expect(Math.round(pointifyed[3].distance(edges[3]))).toEqual(50);
									
									ran = true;
								});
						});// event().bind loaded
					});//instanceof thorny
				});
				waits(200);
				runs(function () {
					expect(ran).toBeTruthy();
				});
			});//it should process a list of edges into a list of internal points
		});// desc has a pointify function
		
		describe('has a funnel function', function () {
			it('should process an edge/edge input into a path', function () {
				// TODO
			});//it
			
			it('should process an edge/point input into a path', function () {
				var ran = false;
				runs(function () {
					require('thorny/base')('./config/default.json')(function ($) {
						// Load the levels
						$.es().makeEntity()
							.addTag('world')
							.addComponent('load-level', './thorny-spec-demo/files/level/room.json')
							.triggers('loaded');
							
						// Listen for the loaded event.
						$.event().bind('loaded', function () {
							$.getTag('world')
								.getComponent('load-level')
								.first(function (level) {
									var
										funnel = $('thorny level pathfinder funnel'),
										astar  = $('thorny level pathfinder astar'),
										from,
										to,
										fromClick,
										toClick,
										path,
										edges,
										projected,
										radius = 16;
									
									from = level.data.xySearch($.getTag('world'), 124, 342);
									to = level.data.xySearch($.getTag('world'), 304, 430);
									
									fromClick = $('thorny math vector2').factory(124, 342);
									toClick = $('thorny math vector2').factory(304, 430);
									
									
									// Find the path around the level.
									path = astar.search(
										from,
										to,
										(radius * 2)
										);
									
									// Find the paths edges
									edges = $('thorny level pathfinder funnel').edgeify(path);
									
									// Project the edges inwards.
									projected = $('thorny level pathfinder funnel').pointify(path, edges, radius);
									
									// Execute the funnel
									path = $('thorny level pathfinder funnel').funnel(fromClick, toClick, edges, projected);
													
									ran = true;
								});
						});// event().bind loaded
					});//instanceof thorny
				});
				waits(200);
				runs(function () {
					expect(ran).toBeTruthy();
				});
			});//it should process an edge/point input into a path
		});// desc has a funnel function
	});// desc the astar funnel system
}());