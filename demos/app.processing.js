/*global console Stats, window*/
require('./thorny/base')('./config/default.json', './demos/config.processing.json')(function ($) {
	var 
		gameLoop = $('thorny core game-loop').factory(),
		stats = new Stats();
	
	// Add Stats - Start
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.left = '0px';
	stats.domElement.style.top = '0px';
	window.document.getElementById('main').appendChild(stats.domElement);
	// Add Stats - End
	
	$.es().makeEntity()
		.addTag('player')
		.addComponent('position', {
			position: {x: 10, y: 10}
		});
	
	///////////
	// START //
	///////////
	$.es().makeEntity()
		.addComponent('renderer', {
			system: 'processing',
			element: 'processing-canvas-1',
			width: 640,
			height: 480
		});
	/*
	$.es().makeEntity()
		.addComponent('renderer', {
			system: 'processing',
			element: 'processing-canvas-2',
			width: 320,
			height: 240
		});
	$.es().makeEntity()
		.addComponent('renderer', {
			system: 'processing',
			element: 'processing-canvas-3',
			width: 100,
			height: 480
		});
	*/
	
	$.es().makeEntity()
		.addTag('world')
		.addComponent('load-level', './content/levels/room1.json')
		.addComponent('load-level', './content/levels/room2.json')
		.triggers('world-loaded');
	
	// Spawn a dozen moving balls
	/*
	(function () {
		var i, x, y;
		for (i = 0; i < 12; i += 1) {
			x = Math.random() * 400 + 50;
			y = Math.random() * 450;
			
			$.es().makeEntity()
				.addComponent('drawable')
				.addComponent('position', {
					position: {
						x: x, 
						y: y
					}, 
					facing: {
						x: 1, 
						y: 0
					}
				})
				.addComponent('moveable', {
					speed: 5
				})
				.addComponent('follow-path', {
					name: 'side-to-side',
					route: [
						{x: 500, y: 0},
						{x: 50, y: 400}
					],
					type: 'cycle',
					active: true
				});
		}
	}());
	*/
	
	(function () {
		var fromClick = false, toClick = false, from, to, route, astar, path, funnel;
		
		astar = $('thorny level pathfinder astar');
		funnel = $('thorny level pathfinder funnel');
		window.jQuery('#processing-canvas-1').click(function (e) {
			var offset = window.jQuery(this).offset();
			
			if (! fromClick) {
				fromClick = $('thorny math vector2').factory(
					e.pageX - offset.left,
					e.pageY - offset.top
					);
				
			// Find a path through the level.
			} else {
				toClick = $('thorny math vector2').factory(
					e.pageX - offset.left,
					e.pageY - offset.top
					);
				
				$.getTag('world')
					.getComponent('load-level')
					.first(function (level) {
						from = level.data.xySearch($.getTag('world'), fromClick.getX(), fromClick.getY());
						to = level.data.xySearch($.getTag('world'), toClick.getX(), toClick.getY());
						
						if (from === false || to === false) {
							fromClick = false;
							return;
						}
						
						// Search the network.
						route = astar.search(from, to, 16);
						path = funnel.process(
							fromClick,
							toClick,
							route,
							8
						);
						
						var i, pathLength = path.length;
						for (i = pathLength; i > 0; i -= 1) {
							path.push(path[i]);
						}
						
						$.es().makeEntity()
							.addComponent('drawable')
							.addComponent('position', {
								position: {
									x: fromClick.getX(), 
									y: fromClick.getY()
								}
							})
							.addComponent('moveable', {
								speed: 64
							})
							.addComponent('follow-path', {
								name: 'side-to-side',
								route: path,
								type: 'cycle',
								active: true
							});
					});
				fromClick = false;
			}
		});
	}());
	
	
	$.event().bind('world-loaded', function () {
		gameLoop.start(function () {
			// Process any object that needs to move.
			$.es().searchByComponents('moveable')
				.each(function (moveable) {
					moveable.data.execute(this);
				});
			//gameLoop.stop();

		}, function () {
			// Execute all of the renderer's
			$.es().searchByComponents('renderer')
				.each(function (renderer) {
					renderer.data.execute(this);
				});
			
			// Update MrDoob's FPS counter.
			stats.update();
		});
	});
});