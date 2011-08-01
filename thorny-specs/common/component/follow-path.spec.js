/*global console window describe xdescribe it expect runs waits*/
(function () {
	require.paths.unshift(__dirname + '/../../../');
	
	describe('the follow-path component', function () {
		it('should have the following functions', function () {
			var ran = false;
				
			runs(function () {
				require('thorny/base')('./config/default.json')(function ($) {
					var entity = $.es().makeEntity()
						.addComponent('position')
						.addComponent('moveable')
						.addComponent('follow-path', {name: 'route-1'});
					
					expect(typeof entity.getComponent('follow-path')).toEqual('object');
					expect(typeof entity.getComponent('follow-path').data).toEqual('object');
					expect(typeof entity.getComponent('follow-path').data.length).toEqual('number');
					expect(entity.getComponent('follow-path').data.length).toEqual(1);
					
					expect(typeof entity.getComponent('follow-path').data[0].isUnique).toEqual('boolean');
					expect(typeof entity.getComponent('follow-path').data[0].processAsCollection).toEqual('boolean');
					expect(entity.getComponent('follow-path').data[0].isUnique).toBeFalsy();
					expect(entity.getComponent('follow-path').data[0].processAsCollection).toBeTruthy();
					
					expect(typeof entity.getComponent('follow-path').data[0].attach).toEqual('function');
					expect(typeof entity.getComponent('follow-path').data[0].update).toEqual('function');
					expect(typeof entity.getComponent('follow-path').data[0].execute).toEqual('function');
					expect(typeof entity.getComponent('follow-path').data[0].expose).toEqual('function');
					expect(typeof entity.getComponent('follow-path').data[0].inject).toEqual('function');
					expect(typeof entity.getComponent('follow-path').data[0].vectorifyRoute).toEqual('function');
					
					expect(typeof entity.getComponent('follow-path').each).toEqual('function');
					expect(typeof entity.getComponent('follow-path').first).toEqual('function');
					
					ran = true;
				});//instanceof thorny
			});
			waits(200);
			runs(function () {
				expect(ran).toBeTruthy();
			});
		});// it should have the following functions
		
		describe('has an attach function', function () {
			it("shouldn't attach without the position component", function () {
				var ran = false;

				runs(function () {
					require('thorny/base')('./config/default.json')(function ($) {
						try {
							var entity = $.es().makeEntity()
								.addComponent('moveable')
								.addComponent('follow-path');
							expect(false).toBeTruthy();
							
						} catch (e) {
							expect(e.message).toEqual('entity.addComponent(moveable, "undefined"); Failed to attach to the entity.');
							expect(true).toBeTruthy();
						}
						
						ran = true;
					});//instanceof thorny
				});
				waits(200);
				runs(function () {
					expect(ran).toBeTruthy();
				});
			});// it shouldn't attach without the position component
			
			it("shouldn't attach without the moveable component", function () {
				var ran = false;

				runs(function () {
					require('thorny/base')('./config/default.json')(function ($) {
						try {
							var entity = $.es().makeEntity()
								.addComponent('position')
								.addComponent('follow-path');
							expect(false).toBeTruthy();
							
						} catch (e) {
							expect(e.message).toEqual('entity.addComponent(follow-path, "undefined"); Failed to attach to the entity.');
							expect(true).toBeTruthy();
						}
						
						ran = true;
					});//instanceof thorny
				});
				waits(200);
				runs(function () {
					expect(ran).toBeTruthy();
				});
			});// it shouldn't attach without the moveable component
			
			it("shouldn't attach without a name param", function () {
				var ran = false;

				runs(function () {
					require('thorny/base')('./config/default.json')(function ($) {
						var entity1, entity2;
						
						try {
							entity1 = $.es().makeEntity()
								.addComponent('position')
								.addComponent('moveable')
								.addComponent('follow-path');
							expect(false).toBeTruthy();
							
						} catch (e1) {
							expect(e1.message).toEqual('entity.addComponent(follow-path, "undefined"); Failed to attach to the entity.');
							expect(true).toBeTruthy();
						}
						
						try {
							entity2 = $.es().makeEntity()
								.addComponent('position')
								.addComponent('moveable')
								.addComponent('follow-path', {hello: 'world'});
							expect(false).toBeTruthy();
							
						} catch (e2) {
							expect(e2.message).toEqual("entity.addComponent(follow-path, \"{\"hello\":\"world\"}\"); Failed to attach to the entity.");
							expect(true).toBeTruthy();
						}
						
						ran = true;
					});//instanceof thorny
				});
				waits(200);
				runs(function () {
					expect(ran).toBeTruthy();
				});
			});// it shouldn't attach without a name param
			
			describe("the process of adding a new path to an entity, that should be stored within the $.data('paths')", function () {
				it("should add a new element based on the used name using the defaults", function () {
					var ran = false;
					
					runs(function () {
						require('thorny/base')('./config/default.json')(function ($) {
							var 
								data = $.data('thorny component follow-path', 'paths'),
								entity = $.es().makeEntity()
								.addComponent('position')
								.addComponent('moveable')
								.addComponent('follow-path', {name: 'route-1'});

							expect(typeof data[entity.id]).toEqual('object');
							expect(typeof data[entity.id]['route-1']).toEqual('object');
							expect(typeof data[entity.id]['route-1'].route).toEqual('object');
							expect(typeof data[entity.id]['route-1'].route.length).toEqual('number');
							expect(typeof data[entity.id]['route-1'].type).toEqual('string');
							expect(typeof data[entity.id]['route-1'].node).toEqual('boolean');
							expect(typeof data[entity.id]['route-1'].target).toEqual('boolean');
							expect(typeof data[entity.id]['route-1'].retain).toEqual('boolean');
							expect(typeof data[entity.id]['route-1'].force_active).toEqual('boolean');
							
							expect(data[entity.id]['route-1'].route).toEqual([]);
							expect(data[entity.id]['route-1'].type).toEqual('once');
							expect(data[entity.id]['route-1'].node).toBeFalsy();
							expect(data[entity.id]['route-1'].target).toBeFalsy();
							expect(data[entity.id]['route-1'].retain).toBeTruthy();
							expect(data[entity.id]['route-1'].force_active).toBeTruthy();
							
							ran = true;
						});//instanceof thorny
					});
					waits(200);
					runs(function () {
						expect(ran).toBeTruthy();
					});
				});// it should add a new element based on the used name using the defaults
				
				it("should add a new element using custom values", function () {
					var ran = false;
					
					runs(function () {
						require('thorny/base')('./config/default.json')(function ($) {
							var 
								data = $.data('thorny component follow-path', 'paths'),
								e1 = $.es().makeEntity()
								.addComponent('position')
								.addComponent('moveable')
								.addComponent('follow-path', {
									name: 'route-1',
									type: 'cycle',
									retain: true
								}),
								e2 = $.es().makeEntity()
								.addComponent('position')
								.addComponent('moveable')
								.addComponent('follow-path', {
									name: 'route-1',
									type: 'linear',
									retain: false,
									force_active: false
								});
							
							// entity 1
							expect(data[e1.id]['route-1'].route).toEqual([]);
							expect(data[e1.id]['route-1'].type).toEqual('cycle');
							expect(data[e1.id]['route-1'].node).toBeFalsy();
							expect(data[e1.id]['route-1'].target).toBeFalsy();
							expect(data[e1.id]['route-1'].retain).toBeTruthy();
							expect(data[e1.id]['route-1'].force_active).toBeTruthy();
							
							// entity 2
							expect(data[e2.id]['route-1'].route).toEqual([]);
							expect(data[e2.id]['route-1'].type).toEqual('linear');
							expect(data[e2.id]['route-1'].node).toBeFalsy();
							expect(data[e2.id]['route-1'].target).toBeFalsy();
							expect(data[e2.id]['route-1'].retain).toBeFalsy();
							expect(data[e2.id]['route-1'].force_active).toBeFalsy();
							
							ran = true;
						});//instanceof thorny
					});
					waits(200);
					runs(function () {
						expect(ran).toBeTruthy();
					});
				});// it should add a new element using custom values
			});// desc the process of adding a new path to an entity, that should be stored within the $.data('paths')
		});// desc has an attach function
		
		describe('has an update function', function () {
			// TODO
		});// desc has an update function
		
		describe('has an execute function', function () {
			// TODO
		});// desc has an execute function
		
		describe('has an expose function', function () {
			// TODO
		});// desc has an expose function
		
		describe('has an inject function', function () {
			// TODO
		});// desc has an inject function
		
		describe('has an vectorifyRoute function', function () {
			// TODO
		});// desc has an vectorifyRoute function
	});// desc the follow-path component
}());