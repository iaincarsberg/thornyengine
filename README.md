#Thorny Engine

Thorny Engine is a HTML5 game engine that attempts to bring traditional game 
development technologies to the open web, such as astar/funnel pathfinding,
an entity component system and a highly modifiable architecture.
The engine that allows developers to write game logic once, and have it work 
in Node.js and a myriad of modern browsers.

##Features

* Comprehensive unittests using the Jasmine BDD framework
* A* Pathfinder - Used to navigate around a simple node list
* Funnel Pathfinder - Used to find optimal paths through a polygone based level
* Customisable Level Formats - Comes out of the box with a polygone based level system, but is easily extensable to support square and hexagon based grids
* Supports modern browser and Node.js
* Entity Component System - Helps to separate and modularise complex game logic, making the code easier to write, test and debug

##Examples

###Entity Component System
```
/*global console Stats, window*/
require('./thorny/base')('./config/default.json', './demos/config.processing.json')(function ($) {
	var gameLoop = $('thorny core game-loop').factory();
	
	$.es().makeEntity()
		.addComponent('renderer', {
			system: 'processing',
			element: 'processing-canvas-1',
			width: 640,
			height: 480
		});
	
	$.es().makeEntity()
		.addTag('world')
		.addComponent('load-level', './content/levels/room1.json')
		.addComponent('load-level', './content/levels/room2.json')
		.triggers('world-loaded');
	
	// Spawn a dozen moving balls
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
	
	$.event().bind('world-loaded', function () {
		gameLoop.start(function () {
			// Process any object that needs to move.
			$.es().searchByComponents('moveable')
				.each(function (moveable) {
					moveable.data.execute(this);
				});

		}, function () {
			// Execute all of the renderer's
			$.es().searchByComponents('renderer')
				.each(function (renderer) {
					renderer.data.execute(this);
				});
		});
	});
});
```

##TODO
Following is a list of technologies that I would like to support in time.

http://www.mindcontrol.org/~hplus/epic/
	Used to make the moving of entities less jittery when there is a ton of
	network latency.

https://github.com/jadell/box2dnode or http://29a.ch/2010/4/17/box2d-2-flash-ported-javascript
	To allow objects to bounce around a level with real physics.
	
http://storymoto.gamamoto.com/
	To allow chained narrative.

https://github.com/substack/dnode
	Looks like it'll make syncing entities over the network really easy.