/*global console window describe xdescribe it expect runs waits*/
(function () {
	require.paths.unshift(__dirname + '/../../../');
	
	describe('the moveable component', function () {
		it('should have the following functions', function () {
			var ran = false;
				
			runs(function () {
				require('thorny/base')('./config/default.json')(function ($) {
					var entity = $.es().makeEntity()
						.addComponent('position', {position: {x: 1, y: 2}})
						.addComponent('moveable');
					
					expect(typeof entity.getComponent('moveable').data).toEqual('object');
					expect(entity.getComponent('moveable').data.isUnique).toBeTruthy();
					expect(entity.getComponent('moveable').data.processAsCollection).toBeFalsy();
					expect(typeof entity.getComponent('moveable').data.attach).toEqual('function');
					expect(typeof entity.getComponent('moveable').data.update).toEqual('function');
					expect(typeof entity.getComponent('moveable').data.execute).toEqual('function');
					expect(typeof entity.getComponent('moveable').data.expose).toEqual('function');
					expect(typeof entity.getComponent('moveable').data.inject).toEqual('function');
					expect(typeof entity.getComponent('moveable').data.getMoveDistance).toEqual('function');
					expect(typeof entity.getComponent('moveable').each).toEqual('function');
					expect(typeof entity.getComponent('moveable').first).toEqual('function');
					
					ran = true;
				});//instanceof thorny
			});
			waits(200);
			runs(function () {
				expect(ran).toBeTruthy();
			});
		});// it should have the following functions
		
		describe('has an attach function', function () {
			it('should require the position component be present', function () {
				var ran = false;

				runs(function () {
					require('thorny/base')('./config/default.json')(function ($) {
						var entity = $.es().makeEntity();
						
						try {
							entity.addComponent('moveable');
							expect(false).toBeTruthy();
							
						} catch (e) {
							expect(true).toBeTruthy();
							expect(e.message).toEqual('entity.addComponent(moveable, "undefined"); Failed to attach to the entity.');
							expect(entity.hasComponent('moveable')).toBeFalsy();
							
							ran = true;
						}
					});//instanceof thorny
				});
				waits(200);
				runs(function () {
					expect(ran).toBeTruthy();
				});
			});// it should require the position component be present
			
			it('should successfully attach to an entity with the position component', function () {
				var ran = false;

				runs(function () {
					require('thorny/base')('./config/default.json')(function ($) {
						var 
							entity = $.es().makeEntity()
								.addComponent('position')
								.addComponent('moveable'),
							data = $.data('thorny component moveable', 'moveable');
						
						// Check the types.
						expect(typeof data[1].position).toEqual('object');
						expect(typeof data[1].facing).toEqual('object');
						expect(typeof data[1].user_facing).toEqual('object');
						expect(typeof data[1].speed).toEqual('number');
						expect(typeof data[1].easing).toEqual('string');
						expect(typeof data[1].current_speed).toEqual('number');
						expect(typeof data[1].injected_processors).toEqual('object');
						expect(typeof data[1].injected_processors.length).toEqual('number');
						
						// Check the contents.
						expect(data[1].position.getSimpleCoords()).toEqual([0, 0]);
						expect(data[1].facing.getSimpleCoords()).toEqual([0, 0]);
						expect(data[1].user_facing.getSimpleCoords()).toEqual([0, 0]);
						expect(data[1].speed).toEqual(1);
						expect(data[1].easing).toEqual('linear');
						expect(data[1].current_speed).toEqual(0);
						expect(data[1].injected_processors).toEqual([]);
						
						ran = true;
					});//instanceof thorny
				});
				waits(200);
				runs(function () {
					expect(ran).toBeTruthy();
				});
			});// it should successfully attach to an entity with the position component
			
			it('should allow customisation of the default values', function () {
				var ran = false;
				runs(function () {
					require('thorny/base')('./config/default.json')(function ($) {
						var 
							entity = $.es().makeEntity().addComponent('position', {
								position: {x: 44, y: 99},
								facing: {x: 50, y: 50}
							})
							.addComponent('moveable', {
								user_facing: {x: 1, y: 0},
								speed: 10,
								easing: 'cycle'
							}),
							data = $.data('thorny component moveable', 'moveable');
						
						// Check the types.
						expect(typeof data[1].position).toEqual('object');
						expect(typeof data[1].facing).toEqual('object');
						expect(typeof data[1].user_facing).toEqual('object');
						expect(typeof data[1].speed).toEqual('number');
						expect(typeof data[1].easing).toEqual('string');
						expect(typeof data[1].current_speed).toEqual('number');
						expect(typeof data[1].injected_processors).toEqual('object');
						expect(typeof data[1].injected_processors.length).toEqual('number');
						
						// Check the contents.
						expect(data[1].position.getSimpleCoords()).toEqual([44, 99]);
						expect(data[1].facing.getSimpleCoords()).toEqual([0.7071067811865476, 0.7071067811865476]);
						expect(data[1].user_facing.getSimpleCoords()).toEqual([1, 0]);
						expect(data[1].speed).toEqual(10);
						expect(data[1].easing).toEqual('cycle');
						expect(data[1].current_speed).toEqual(0);
						expect(data[1].injected_processors).toEqual([]);
						
						ran = true;
					});//instanceof thorny
				});
				waits(200);
				runs(function () {
					expect(ran).toBeTruthy();
				});
			});// it should allow customisation of the default values
		});// desc has an attach function
		
		describe('has an execute function', function () {
			it("shouldn't move an entity forwards", function () {
				var ran = false;
				runs(function () {
					require('thorny/base')('./config/default.json')(function ($) {
						// This shouldn't move becaue the facing is 0,0 which
						// indicates this entity isn't moving.
						var 
							entity = $.es().makeEntity()
								.addComponent('position')
								.addComponent('moveable'),
							data = $.data('thorny component moveable', 'moveable')[1];
						
						// Execute the component
						entity.executeComponent('moveable');
						
						expect(data.position.getSimpleCoords()).toEqual([0, 0]);
						
						ran = true;
					});//instanceof thorny
				});
				waits(200);
				runs(function () {
					expect(ran).toBeTruthy();
				});
			});// it shouldn't move an entity forwards
			
			describe('how entities should displace over time', function () {
				it('should move an entity forwards 50 units in 1000ms', function () {
					var ran = false;
					runs(function () {
						require('thorny/base')('./config/default.json')(function ($) {
							$.time().tick();
							var 
								entity = $.es().makeEntity()
									.addComponent('position', {facing: {x: 1, y: 0}})
									.addComponent('moveable', {speed: 50}),
								data = $.data('thorny component moveable', 'moveable')[1];

							// Execute the component with a 1000ms to move
							entity.executeComponent('moveable', {
								time: $.time().now() + 1000
							});

							expect(data.position.getSimpleCoords()).toEqual([50, 0]);

							ran = true;
						});//instanceof thorny
					});
					waits(200);
					runs(function () {
						expect(ran).toBeTruthy();
					});
				});// it should move an entity forwards 100 units in 1000ms
				
				it('should move an entity forwards 50 units in 500ms', function () {
					var ran = false;
					runs(function () {
						require('thorny/base')('./config/default.json')(function ($) {
							$.time().tick();
							var 
								entity = $.es().makeEntity()
									.addComponent('position', {facing: {x: 1, y: 0}})
									.addComponent('moveable', {speed: 100}),
								data = $.data('thorny component moveable', 'moveable')[1];

							// Execute the component with a 1000ms to move
							entity.executeComponent('moveable', {
								time: $.time().now() + 500
							});

							expect(data.position.getSimpleCoords()).toEqual([50, 0]);

							ran = true;
						});//instanceof thorny
					});
					waits(200);
					runs(function () {
						expect(ran).toBeTruthy();
					});
				});// it should move an entity forwards 100 units in 1000ms
				
				it('should move an entity forwards 100 units in 1000ms', function () {
					var ran = false;
					runs(function () {
						require('thorny/base')('./config/default.json')(function ($) {
							$.time().tick();
							var 
								entity = $.es().makeEntity()
									.addComponent('position', {facing: {x: 1, y: 0}})
									.addComponent('moveable', {speed: 100}),
								data = $.data('thorny component moveable', 'moveable')[1];

							// Execute the component with a 1000ms to move
							entity.executeComponent('moveable', {
								time: $.time().now() + 1000
							});

							expect(data.position.getSimpleCoords()).toEqual([100, 0]);

							ran = true;
						});//instanceof thorny
					});
					waits(200);
					runs(function () {
						expect(ran).toBeTruthy();
					});
				});// it should move an entity forwards 100 units in 1000ms
			});// desc how entities should displace over time
		});// desc has an execute function
		
		describe('has an expose function', function () {
			it('should expose the objects internal state', function () {
				var ran = false;
				runs(function () {
					require('thorny/base')('./config/default.json')(function ($) {
						var 
							entity = $.es().makeEntity()
								.addComponent('position', {position: {x: 1, y: 2}, facing: {x: 1, y: 1}})
								.addComponent('moveable', {speed: 123, easing: 'cycle'}),
							data = entity.getComponent('moveable').data.expose(entity);
						
						// Check the contents.
						expect(data.position.getSimpleCoords()).toEqual([1, 2]);
						expect(data.facing.getSimpleCoords()).toEqual([0.7071067811865475, 0.7071067811865475]);
						expect(data.user_facing.getSimpleCoords()).toEqual([0, 0]);
						expect(data.speed).toEqual(123);
						expect(data.easing).toEqual('cycle');
						expect(data.current_speed).toEqual(0);
						expect(data.injected_processors).toEqual([]);
						
						ran = true;
					});//instanceof thorny
				});
				waits(200);
				runs(function () {
					expect(ran).toBeTruthy();
				});
			});// it should expose the objects internal state
		});// desc has an expose function
		
		describe('has an inject function', function () {
			it('should ', function () {
				var ran = false;
				runs(function () {
					require('thorny/base')('./config/default.json')(function ($) {
						var 
							entity = $.es().makeEntity()
								.addComponent('position', {facing: {x: 1, y: 0}})
								.addComponent('moveable', {speed: 100}),
							data = $.data('thorny component moveable', 'moveable')[1];
						
						entity.getComponent('moveable').data.inject(entity, function () {
							return 'world';
						});
						
						expect(data.injected_processors.length).toEqual(1);
						expect(data.injected_processors[0]()).toEqual('world');
						
						ran = true;
					});//instanceof thorny
				});
				waits(200);
				runs(function () {
					expect(ran).toBeTruthy();
				});
			});// it should 
		});// desc has an inject function
		
		describe('has an getMoveDistance function', function () {
			it('should should update the last_exec_time', function () {
				var ran = false;
				runs(function () {
					require('thorny/base')('./config/default.json')(function ($) {
						var 
							entity = $.es().makeEntity()
								.addComponent('position', {position: {x: 1, y: 2}})
								.addComponent('moveable'),
							func = entity.getComponent('moveable').data.getMoveDistance,
							obj = {speed: 1000, last_exec_time: 0};
						
						// call the getMoveDistance function.
						func(1000, obj);
						
						expect(obj.last_exec_time).toEqual(1000);
						
						ran = true;
					});//instanceof thorny
				});
				waits(200);
				runs(function () {
					expect(ran).toBeTruthy();
				});
			});// it should should update the last_exec_time
			
			it('should return the movement distance based on speed and time elipsed since last call', function () {
				var ran = false;
				runs(function () {
					require('thorny/base')('./config/default.json')(function ($) {
						var 
							entity = $.es().makeEntity()
								.addComponent('position')
								.addComponent('moveable'),
							func = entity.getComponent('moveable').data.getMoveDistance;

						// Movement in 1 second
						expect(func(1000, {speed:    1, last_exec_time: 0}))
							.toEqual(1);
						expect(func(1000, {speed:   10, last_exec_time: 0}))
							.toEqual(10);
						expect(func(1000, {speed:  100, last_exec_time: 0}))
							.toEqual(100);
						expect(func(1000, {speed: 1000, last_exec_time: 0}))
							.toEqual(1000);

						// Movement in 0.5 second
						expect(func(500, {speed:    1, last_exec_time: 0}))
							.toEqual(0.5);
						expect(func(500, {speed:   10, last_exec_time: 0}))
							.toEqual(5);
						expect(func(500, {speed:  100, last_exec_time: 0}))
							.toEqual(50);
						expect(func(500, {speed: 1000, last_exec_time: 0}))
							.toEqual(500);

						// Movement in 0.25 second
						expect(func(250, {speed:    1, last_exec_time: 0}))
							.toEqual(0.25);
						expect(func(250, {speed:   10, last_exec_time: 0}))
							.toEqual(2.5);
						expect(func(250, {speed:  100, last_exec_time: 0}))
							.toEqual(25);
						expect(func(250, {speed: 1000, last_exec_time: 0}))
							.toEqual(250);

						// Movement in 0.125 second
						expect(func(125, {speed:    1, last_exec_time: 0}))
							.toEqual(0.125);
						expect(func(125, {speed:   10, last_exec_time: 0}))
							.toEqual(1.25);
						expect(func(125, {speed:  100, last_exec_time: 0}))
							.toEqual(12.5);
						expect(func(125, {speed: 1000, last_exec_time: 0}))
							.toEqual(125);
						
						ran = true;
					});//instanceof thorny
				});
				waits(200);
				runs(function () {
					expect(ran).toBeTruthy();
				});
			});// it should return the movement distance based on speed and time elipsed since last call
		});// desc has an getMoveDistance function
	});// desc the moveable component
}());