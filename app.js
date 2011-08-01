/*global console*/
require('./thorny/base')('./config/default.json')(function ($) {
	// in thorny/common/tags/pathfinder.js - start
	$.es().makeEntity($.defined('template'))
		.addTag('funnel-pathfinder')
		.addComponent('search-for-node-at')
		.addComponent('pathfinder', 'funnel');
	// in thorny/common/tags/pathfinder.js - end
	
	// in thorny/common/tags/actor.js - start
	$.es().makeEntity($.defined('template'))
		.addTag('actor')
		.addComponent('position')
		.addComponent('route');
	// in thorny/common/tags/actor.js - end
	
	// Load the game world.
	$.es().makeEntity()
		.addTag('world')
		.addComponent('load-level', './content/levels/room1.json')
		.addComponent('load-level', './content/levels/room2.json')
		.triggers('world-loaded');

	// Add a renderer.
	$.es().makeEntity()
		.addTag('renderer')
		.addComponent('renderer', {
			type: 'Steppe',
			startOn: 'world-loaded',
			bindTo: 'player'
		});
	
	// Wait for the level to be loaded.
	$.event.bind('world-loaded', function () {
		$.getTag('world')
			.useTag('funnel-pathfinder');
		
		// Spawn the player
		$.es().makeEntity()
			.addTag('player')
			.useTag('actor')
			.addComponent('controller', 'human')
			.updateComponent(
				'position', 
				$('thorny math vector2').factory(0, 0)
				)
			.spawn();
	});
	
	// Listen for a click event and update the players route.
	$.event.bind('click', function (event) {
		$.getTag('player')
			.updateComponent(
				'route', 
				$.getTag('world')
					.executeComponent('pathfinder', {
						from: $.getTag('player').position,
						to: $('thorny math vector2').factory(event.clientX, event.clientY)
					})
				);
	});
	
	/*
	GOAL
	
	$.es().makeEntity()
		.addTag('game')
		.addComponent('game-loop', {
			startOn: 'world-loaded',
			endOn: 'quit-game'
			})
		.addComponent('mr-doob-stats');
		
	$.es().makeEntity()
		.addTag('renderer')
		.addComponent('renderer', 'ajb.steppe');
	
	$.es().makeEntity()
		.addTag('world')
		.addComponent('load-level', './content/levels/room1.json')
		.addComponent('load-level', './content/levels/room2.json')
		.triggers('world-loaded');
		
	$.es().makeEntity()
		.addTag('player')
		.useTag('actor')
		.addComponent('controller', {
			type: 'keyboard-mouse'
			});
	
	var spawnZombie = function () {
		$.es().makeEntity()
			.useTag('actor')
			.addComponent('controller', {
				type: 'ai',
				targets: $.getTag('player')
				})
			.updateComponent('position', {// position is apart of actor
				x: (Math.random() * 100), 
				y: (Math.random() * 100)
				})
			.spawn();
	};
	
	$.event.bind('world-loaded', function () {
		$.getTag('world')
			.addComponent('pathfinder', 'funnel');
		
		var i;
		for (i = 0; i < 10; i += 1) {
			spawnZombie();
		}
	});
	*/
});