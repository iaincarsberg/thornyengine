/*global console window describe xdescribe it expect runs waits*/
(function () {
	require.paths.unshift(__dirname + '/../../../');
	
	describe('the component system', function () {
		//////////////////////////////////////////////////////////////////////
		// feature checking //////////////////////////////////////////////////
		//////////////////////////////////////////////////////////////////////
		it('should have the following functions', function () {
			var ran = false;
			runs(function () {
				require('thorny/base')('./config/default.json')(function ($) {
					// Injected into entity-system
					expect(typeof $.es().registerComponent).toEqual('function');
					expect(typeof $.es().searchByComponents).toEqual('function');
					
					var entity = $.es().makeEntity();
					
					// Injected into entity
					expect(typeof entity.addComponent).toEqual('function');
					expect(typeof entity.getComponent).toEqual('function');
					expect(typeof entity.hasComponent).toEqual('function');
					expect(typeof entity.executeComponent).toEqual('function');
					
					// The component system doesn't return anything, it just injects
					// functionality directly into entity, and the entity-system.
					expect($.es().component).toBeFalsy();
					
					ran = true;
				});//instanceof thorny
			});
			waits(200);
			runs(function () {
				expect(ran).toBeTruthy();
			});
		});//it should have the following functions
		
		//////////////////////////////////////////////////////////////////////
		// injected into entity-system ///////////////////////////////////////
		//////////////////////////////////////////////////////////////////////
		describe('injected into entity-system', function () {
			describe('.registerComponent', function () {
				it('should add a component to the component list', function () {
					var ran = false;
					runs(function () {
						require('thorny/base')('./config/default.json')(function ($) {
							
							$.es().registerComponent('a', function () {
								return {
									hello: 'world'
								};
							});
							
							var data = $.data(
								'thorny entity-system component',
								'registered-components'
								);
							
							expect(typeof data.a()).toEqual('object');
							expect(typeof data.a().hello).toEqual('string');
							expect(data.a().hello).toEqual('world');
							
							ran = true;
						});//instanceof thorny
					});
					waits(200);
					runs(function () {
						expect(ran).toBeTruthy();
					});
				});// it should add a component to the component list
				
				it('should contain the following functions', function () {
					var ran = false;
					runs(function () {
						require('thorny/base')('./config/default.json')(function ($) {
							
							$.es().registerComponent('a', function () {});
							
							var data = $.data(
								'thorny entity-system component',
								'registered-components'
								).a;
							
							expect(typeof data).toEqual('function');
							
							// Invoke the componenet.
							data = data();
							
							expect(data.isUnique).toBeTruthy();
							expect(data.processAsCollection).toBeFalsy();
							expect(typeof data.attach).toMatch('function');
							expect(typeof data.update).toMatch('function');
							expect(typeof data.execute).toMatch('function');
							
							ran = true;
						});//instanceof thorny
					});
					waits(200);
					runs(function () {
						expect(ran).toBeTruthy();
					});
				});// should contain the following functions
				
				it("shouldn't allow a component to be registered with the same name", function () {
					var ran = false;
					runs(function () {
						require('thorny/base')('./config/default.json')(function ($) {
							
							$.es().registerComponent('a', function () {});
							
							try {
								$.es().registerComponent('a', function () {});
								expect(false).toBeTruthy();
								
							} catch (e) {
								expect(e.message).toEqual('entity-system.registerComponent("a"); has already been registered');
								expect(true).toBeTruthy();
							}
							
							ran = true;
						});//instanceof thorny
					});
					waits(200);
					runs(function () {
						expect(ran).toBeTruthy();
					});
				});// it shouldn't allow a component to be registered with the same name
			});// desc registerComponent
			
			describe('.searchByComponents', function () {
				it('should have the following functions', function () {
					var ran = false;
					runs(function () {
						require('thorny/base')('./config/default.json')(function ($) {
							expect(typeof $.es().searchByComponents('a')).toEqual('object');
							expect(typeof $.es().searchByComponents('a').data).toEqual('object');
							expect(typeof $.es().searchByComponents('a').data.length).toEqual('number');
							expect(typeof $.es().searchByComponents('a').each).toEqual('function');
							expect(typeof $.es().searchByComponents('a').first).toEqual('function');

							ran = true;
						});//instanceof thorny
					});
					waits(200);
					runs(function () {
						expect(ran).toBeTruthy();
					});
				});//it should have the following functions
				
				it("should preform a simple map operation and return the result", function () {
					var ran = false;
					runs(function () {
						require('thorny/base')('./config/thorny-spec-demo.json')(function ($) {
							var 
								i,	// Used for loop control
								ii,	// Used for loop control as a limit
								results;

							for (i = 0; i < 10; i += 1) {
								$.es().makeEntity()
									.addComponent('a');
							}
							
							results = $.es().searchByComponents('a').data;
							
							// Makesure there are 10 results
							expect(results.length).toMatch(10);
							
							// Check that the id's are rolling correctly.
							for (i = 0, ii = results.length; i < ii; i += 1) {
								expect(results[i].id).toMatch((i + 1));
							}
							
							ran = true;
						});//instanceof thorny
					});
					waits(200);
					runs(function () {
						expect(ran).toBeTruthy();
					});
				});// it should preform a simple map operation and return the result
				
				it("should preform a more complex map operation and return the result", function () {
					var ran = false;
					runs(function () {
						require('thorny/base')('./config/thorny-spec-demo.json')(function ($) {
							var
								entityA = $.es().makeEntity()
									.addComponent('a'),
								entityAB = $.es().makeEntity()
									.addComponent('a')
									.addComponent('b'),
								entityABC = $.es().makeEntity()
									.addComponent('a')
									.addComponent('b')
									.addComponent('c'),
								entityBC = $.es().makeEntity()
									.addComponent('b')
									.addComponent('c'),
								entityC = $.es().makeEntity()
									.addComponent('c');
							
							expect($.es().searchByComponents('a').data.length)
								.toMatch(3);
							expect($.es().searchByComponents('b').data.length)
								.toMatch(3);
							expect($.es().searchByComponents('c').data.length)
								.toMatch(3);
							expect($.es().searchByComponents('a', 'b').data.length)
								.toMatch(2);
							expect($.es().searchByComponents('b', 'a').data.length)
								.toMatch(2);
							expect($.es().searchByComponents('a', 'c').data.length)
								.toMatch(1);
							expect($.es().searchByComponents('c', 'a').data.length)
								.toMatch(1);
							expect($.es().searchByComponents('b', 'c').data.length)
								.toMatch(2);
							expect($.es().searchByComponents('c', 'b').data.length)
								.toMatch(2);
							expect($.es().searchByComponents('a', 'b', 'c').data.length)
								.toMatch(1);
							expect($.es().searchByComponents('b', 'a', 'c').data.length)
								.toMatch(1);
							expect($.es().searchByComponents('c', 'b', 'a').data.length)
								.toMatch(1);
							
							ran = true;
						});//instanceof thorny
					});
					waits(200);
					runs(function () {
						expect(ran).toBeTruthy();
					});
				});// it should preform a more complex map operation and return the result
				
				describe('has an each function', function () {
					it("should map the required compoents into the each callback", function () {
						var ran = false;
						runs(function () {
							require('thorny/base')('./config/thorny-spec-demo.json')(function ($) {
								var entites;
								$.es().makeEntity()
									.addTag('entity 1')
									.addComponent('a')
									.addComponent('b')
									.addComponent('c');
								$.es().makeEntity()
									.addTag('entity 2')
									.addComponent('a')
									.addComponent('b')
									.addComponent('c');
								
								entites = ['entity 1', 'entity 2'];
								$.es()
									.searchByComponents('a')
									.each(function (a) {
										expect($.getTag(entites.shift()).id)
											.toEqual(this.id);
										
										expect(a.data.name)
											.toEqual('component a');
									});
									
								entites = ['entity 1', 'entity 2'];
								$.es()
									.searchByComponents('a', 'b')
									.each(function (a, b) {
										expect($.getTag(entites.shift()).id)
											.toEqual(this.id);

										expect(a.data.name)
											.toEqual('component a');
										expect(b.data.name)
											.toEqual('component b');
									});
									
								entites = ['entity 1', 'entity 2'];
								$.es()
									.searchByComponents('a', 'b', 'c')
									.each(function (a, b, c) {
										expect($.getTag(entites.shift()).id)
											.toEqual(this.id);

										expect(a.data.name)
											.toEqual('component a');
										expect(b.data.name)
											.toEqual('component b');
										expect(c.data.name)
											.toEqual('component c');
									});
								
								ran = true;
							});//instanceof thorny
						});
						waits(200);
						runs(function () {
							expect(ran).toBeTruthy();
						});
					});// it should preform a more complex map operation and return the result
					
					it('should world with components that have the .isUnique flag', function () {
						// TODO
					});// it
				});// desc has an each function
				
				describe('has a first function', function () {
					it("should map the required compoents into the each callback", function () {
						var ran = false;
						runs(function () {
							require('thorny/base')('./config/thorny-spec-demo.json')(function ($) {
								$.es().makeEntity()
									.addTag('entity 1')
									.addComponent('a')
									.addComponent('b')
									.addComponent('c');
								$.es().makeEntity()
									.addTag('entity 2')
									.addComponent('a')
									.addComponent('b')
									.addComponent('c');
								
								$.es()
									.searchByComponents('a')
									.first(function (a) {
										expect($.getTag('entity 1').id)
											.toEqual(this.id);
										expect(a.data.name)
											.toEqual('component a');
										
										ran = true;
									});
							});//instanceof thorny
						});
						waits(200);
						runs(function () {
							expect(ran).toBeTruthy();
						});
					});// it should preform a more complex map operation and return the result
					
					it('should world with components that have the .isUnique flag', function () {
						// TODO
					});// it
				});// desc has an each function
			});// desc searchByComponents
		});// desc injected into entity-system
		
		//////////////////////////////////////////////////////////////////////
		// injected into entity //////////////////////////////////////////////
		//////////////////////////////////////////////////////////////////////
		describe('injected into entity', function () {
			describe('.addComponent', function () {
				it('should add an entry in the local entities object the first time an entity has a component added', function () {
					var ran = false;
					runs(function () {
						require('thorny/base')('./config/thorny-spec-demo.json')(function ($) {
							var 
								entity = $.es().makeEntity(),
								data = $.data(
									'thorny entity-system component',
									'entities'
									);
							
							expect(typeof data).toEqual('object');
							expect(data).toEqual({});
							
							// Add component a to the entity
							entity.addComponent('a');
							expect(typeof data[entity.id]).toEqual('object');
							expect(data[entity.id].hasOwnProperty('a')).toBeTruthy();
							expect(data[entity.id].a.name).toEqual('component a');
							
							ran = true;
						});//instanceof thorny
					});
					waits(200);
					runs(function () {
						expect(ran).toBeTruthy();
					});
				});//it should add an entry in the local entities object the first time an entity has a component added
				
				it('should add a new known component', function () {
					var ran = false;
					runs(function () {
						require('thorny/base')('./config/thorny-spec-demo.json')(function ($) {
							var 
								entity = $.es().makeEntity(),
								data = $.data(
									'thorny entity-system component',
									'entities'
									);
							
							expect(typeof data).toEqual('object');
							expect(data).toEqual({});
							
							// Add component a to the entity
							entity.addComponent('a');
							expect(typeof data[entity.id]).toEqual('object');
							expect(data[entity.id].hasOwnProperty('a')).toBeTruthy();
							expect(data[entity.id].hasOwnProperty('b')).toBeFalsy();
							expect(data[entity.id].hasOwnProperty('c')).toBeFalsy();
							expect(data[entity.id].a.name).toEqual('component a');
							
							// Add component b to the entity
							entity.addComponent('b');
							expect(typeof data[entity.id]).toEqual('object');
							expect(data[entity.id].hasOwnProperty('a')).toBeTruthy();
							expect(data[entity.id].hasOwnProperty('b')).toBeTruthy();
							expect(data[entity.id].hasOwnProperty('c')).toBeFalsy();
							expect(data[entity.id].a.name).toEqual('component a');
							expect(data[entity.id].b.name).toEqual('component b');
							
							// Add component c to the entity
							entity.addComponent('c');
							expect(typeof data[entity.id]).toEqual('object');
							expect(data[entity.id].hasOwnProperty('a')).toBeTruthy();
							expect(data[entity.id].hasOwnProperty('b')).toBeTruthy();
							expect(data[entity.id].hasOwnProperty('c')).toBeTruthy();
							expect(data[entity.id].a.name).toEqual('component a');
							expect(data[entity.id].b.name).toEqual('component b');
							expect(data[entity.id].c.name).toEqual('component c');
							
							ran = true;
						});//instanceof thorny
					});
					waits(200);
					runs(function () {
						expect(ran).toBeTruthy();
					});
				});//it should add a new known component
				
				it("shouldn't allow an 'isUnique' component to be added multiple times", function () {
					var ran = false;
					runs(function () {
						require('thorny/base')('./config/thorny-spec-demo.json')(function ($) {
							var 
								entity = $.es().makeEntity(),
								data = $.data(
									'thorny entity-system component',
									'entities'
									);
							
							expect(typeof data).toEqual('object');
							expect(data).toEqual({});
							
							// Add component a to the entity
							entity.addComponent('a');
							expect(typeof data[entity.id]).toEqual('object');
							expect(data[entity.id].hasOwnProperty('a')).toBeTruthy();
							expect(data[entity.id].a.name).toEqual('component a');
							
							// Try to add a second unique a...
							try {
								entity.addComponent('a');
								expect(false).toBeTruthy();
								
							} catch (e) {
								expect(e.message).toEqual('entity.addComponent(a, "undefined"); in unique, can cannot be added multiple times to one entity');
								expect(true).toBeTruthy();
							}
							
							ran = true;
						});//instanceof thorny
					});
					waits(200);
					runs(function () {
						expect(ran).toBeTruthy();
					});
				});// it shouldn't allow an 'isUnique' component to be added multiple times
				
				it("should allow an '!isUnique' component to be added multiple times", function () {
					var ran = false;
					runs(function () {
						require('thorny/base')('./config/thorny-spec-demo.json')(function ($) {
							var 
								entity = $.es().makeEntity(),
								data = $.data(
									'thorny entity-system component',
									'entities'
									);
							
							expect(typeof data).toEqual('object');
							expect(data).toEqual({});
							
							// Add component a to the entity
							entity.addComponent('notunique');
							entity.addComponent('notunique');
							entity.addComponent('notunique');
							
							expect(typeof data[entity.id]).toEqual('object');
							expect(data[entity.id].hasOwnProperty('notunique')).toBeTruthy();
							expect(data[entity.id].notunique.length).toEqual(3);
							expect(data[entity.id].notunique[0].name).toEqual('component notunique');
							expect(data[entity.id].notunique[1].name).toEqual('component notunique');
							expect(data[entity.id].notunique[2].name).toEqual('component notunique');
							
							ran = true;
						});//instanceof thorny
					});
					waits(200);
					runs(function () {
						expect(ran).toBeTruthy();
					});
				});// it should allow an '!isUnique' component to be added multiple times
				
				it("should wrap an 'inUnique' component in an array at the 0th index", function () {
					var ran = false;
					runs(function () {
						require('thorny/base')('./config/thorny-spec-demo.json')(function ($) {
							var 
								entity = $.es().makeEntity(),
								data = $.data(
									'thorny entity-system component',
									'entities'
									);
							
							expect(typeof data).toEqual('object');
							expect(data).toEqual({});
							
							// Add component a to the entity
							entity.addComponent('a');
							expect(typeof data[entity.id]).toEqual('object');
							expect(data[entity.id].hasOwnProperty('a')).toBeTruthy();
							expect(typeof data[entity.id].a).toEqual('object');
							
							ran = true;
						});//instanceof thorny
					});
					waits(200);
					runs(function () {
						expect(ran).toBeTruthy();
					});
				});// it should wrap an 'inUnique' component in an array at the 0th index
				
				it("should append '!inUnique' components at the correct incromenting index", function () {
					var ran = false;
					runs(function () {
						require('thorny/base')('./config/thorny-spec-demo.json')(function ($) {
							var 
								i,	// Used for loop control
								entity = $.es().makeEntity(),
								data = $.data(
									'thorny entity-system component',
									'entities'
									);
							
							expect(typeof data).toEqual('object');
							expect(data).toEqual({});
							
							// Add component a to the entity
							for (i = 1; i <= 3; i += 1) {
								entity.addComponent('notunique');
								expect(typeof data[entity.id].notunique).toEqual('object');
								expect(data[entity.id].notunique.length).toEqual(i);
								expect(data[entity.id].notunique[i - 1].name).toEqual('component notunique');
							}
							
							ran = true;
						});//instanceof thorny
					});
					waits(200);
					runs(function () {
						expect(ran).toBeTruthy();
					});
				});// it should append '!inUnique' components at the correct incromenting index
				
				it("should't add a new component to the entity if the entity is marked as a template", function () {
					var ran = false;
					runs(function () {
						require('thorny/base')('./config/thorny-spec-demo.json')(function ($) {
							var entity = $.es().makeEntity($.defined('template'))
									.addComponent('a')
									.addComponent('b')
									.addComponent('c'),
								data = $.data(
									'thorny entity-system component',
									'entities'
									);
							
							expect(data).toMatch({});
							expect(data[entity.id]).toBeFalsy();
							
							ran = true;
						});//instanceof thorny
					});
					waits(200);
					runs(function () {
						expect(ran).toBeTruthy();
					});
				});// it should't add a new componet to the entity if the entity is marked as a template
			});// desc addComponent
			
			describe('getComponent', function () {
				it("should return the attached unique component in an array on length 1", function () {
					var ran = false;
					runs(function () {
						require('thorny/base')('./config/thorny-spec-demo.json')(function ($) {
							var entity = $.es().makeEntity()
								.addComponent('a')
								.addComponent('b')
								.addComponent('c');
								
							expect(typeof entity.getComponent('a')).toEqual('object');
							expect(typeof entity.getComponent('a').data).toEqual('object');
							expect(typeof entity.getComponent('b').data).toEqual('object');
							expect(typeof entity.getComponent('c').data).toEqual('object');
							expect(entity.getComponent('a').data.name).toEqual('component a');
							expect(entity.getComponent('b').data.name).toEqual('component b');
							expect(entity.getComponent('c').data.name).toEqual('component c');
							expect(entity.getComponent('d')).toBeFalsy();
							expect(entity.getComponent('e')).toBeFalsy();
							expect(entity.getComponent('d').data).toBeFalsy();
							expect(entity.getComponent('e').data).toBeFalsy();

							ran = true;
						});//instanceof thorny
					});
					waits(200);
					runs(function () {
						expect(ran).toBeTruthy();
					});
				});// it should return the attached unique component in an array on length 1
				
				it("should return multiple non-unique components of the same type", function () {
					var ran = false;
					runs(function () {
						require('thorny/base')('./config/thorny-spec-demo.json')(function ($) {
							var entity = $.es().makeEntity()
								.addComponent('notunique')
								.addComponent('notunique')
								.addComponent('notunique');
								
							expect(typeof entity.getComponent('notunique')).toEqual('object');
							expect(typeof entity.getComponent('notunique').data).toEqual('object');
							expect(entity.getComponent('notunique').data.length).toEqual(3);
							expect(entity.getComponent('a')).toBeFalsy();
							expect(entity.getComponent('b')).toBeFalsy();
							expect(entity.getComponent('c')).toBeFalsy();
							expect(entity.getComponent('d')).toBeFalsy();
							expect(entity.getComponent('e')).toBeFalsy();

							ran = true;
						});//instanceof thorny
					});
					waits(200);
					runs(function () {
						expect(ran).toBeTruthy();
					});
				});// it should return multiple non-unique components of the same type.
				
				it("should return false when there are no components of the requested type attached", function () {
					var ran = false;
					runs(function () {
						require('thorny/base')('./config/thorny-spec-demo.json')(function ($) {
							var entity = $.es().makeEntity();
							
							expect(entity.getComponent('notunique')).toBeFalsy();
							expect(entity.getComponent('a')).toBeFalsy();
							expect(entity.getComponent('b')).toBeFalsy();
							expect(entity.getComponent('c')).toBeFalsy();
							expect(entity.getComponent('d')).toBeFalsy();
							expect(entity.getComponent('e')).toBeFalsy();

							ran = true;
						});//instanceof thorny
					});
					waits(200);
					runs(function () {
						expect(ran).toBeTruthy();
					});
				});// it should return false when there are no components of the requested type attached
				
				it('should return an each function, that allows us to iterate over the collection easily', function () {
					var 
						ran = 0;
					runs(function () {
						require('thorny/base')('./config/thorny-spec-demo.json')(function ($) {
							var entity = $.es().makeEntity()
								.addComponent('notunique', 0)
								.addComponent('notunique', 1)
								.addComponent('notunique', 2);
								
							entity
								.getComponent('notunique')
								.each(function (item) {
									expect(typeof item.isUnique).toEqual('boolean');
									expect(typeof item.processAsCollection).toEqual('boolean');
									expect(typeof item.attach).toEqual('function');
									expect(typeof item.update).toEqual('function');
									expect(typeof item.execute).toEqual('function');
									
									expect(item.someUniqueValue).toMatch(ran);
									
									ran += 1;
								});
						});//instanceof thorny
					});
					waits(200);
					runs(function () {
						expect(ran).toEqual(3);
					});
				});// it should return an each function, that allows us to iterate over the collection easily
			});// desc getComponent
			
			describe('hasComponent', function () {
				it("should return true when a module has a specific component", function () {
					var ran = false;
					runs(function () {
						require('thorny/base')('./config/thorny-spec-demo.json')(function ($) {
							var entity = $.es().makeEntity()
								.addComponent('a')
								.addComponent('b')
								.addComponent('c')
								.addComponent('d')
								.addComponent('e')
								.addComponent('notunique')
								.addComponent('notunique')
								.addComponent('notunique');
							
							expect(entity.hasComponent('a')).toBeTruthy();
							expect(entity.hasComponent('b')).toBeTruthy();
							expect(entity.hasComponent('c')).toBeTruthy();
							expect(entity.hasComponent('d')).toBeTruthy();
							expect(entity.hasComponent('e')).toBeTruthy();
							expect(entity.hasComponent('notunique')).toBeTruthy();
							
							ran = true;
						});//instanceof thorny
					});
					waits(200);
					runs(function () {
						expect(ran).toBeTruthy();
					});
				});// it should return true when a module has a specific component
				
				it("should return false when a module isn't attached to an entity", function () {
					var ran = false;
					runs(function () {
						require('thorny/base')('./config/thorny-spec-demo.json')(function ($) {
							var entity = $.es().makeEntity();
							
							expect(entity.hasComponent('a')).toBeFalsy();
							expect(entity.hasComponent('b')).toBeFalsy();
							expect(entity.hasComponent('c')).toBeFalsy();
							expect(entity.hasComponent('d')).toBeFalsy();
							expect(entity.hasComponent('e')).toBeFalsy();
							expect(entity.hasComponent('notunique')).toBeFalsy();
							
							ran = true;
						});//instanceof thorny
					});
					waits(200);
					runs(function () {
						expect(ran).toBeTruthy();
					});
				});// it should return false when a module isn't attached to an entity
			});// desc hasComponent
			
			describe('executeComponent', function () {
				// ...
				
			});// desc executeComponent
		});// desc injected into entity
	});//desc the component system
}());