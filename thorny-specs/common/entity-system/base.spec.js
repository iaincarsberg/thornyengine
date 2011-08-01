/*global console window describe xdescribe it expect runs waits*/
(function () {
	require.paths.unshift(__dirname + '/../../../');
	require('thorny/base')('./config/default.json')(function ($) {
		describe('entity-system/base', function () {
			it('should have the following functions', function () {
				var es = $('thorny entity-system base');
				
				expect(typeof es.makeEntity).toEqual('function');
				expect(typeof es.getEntity).toEqual('function');
				expect(typeof es.tag).toEqual('object');
				
				describe('shortcuts', function () {
					it('should have a $.es() shortcut', function () {
						expect(typeof $.es().makeEntity).toEqual('function');
						expect(typeof $.es().getEntity).toEqual('function');
						expect(typeof $.es().tag).toEqual('object');
					});// it should have a $.es() shortcut
					
					it('should have a $.getTag() shortcut', function () {
						require('thorny/base')('./config/default.json')(function ($) {
							var entitys = [
								$.es().makeEntity().addTag('a'),
								$.es().makeEntity().addTag('b'),
								$.es().makeEntity().addTag('c')
							];
							
							expect($.getTag('a').id).toEqual(entitys[0].id);
							expect($.getTag('b').id).toEqual(entitys[1].id);
							expect($.getTag('c').id).toEqual(entitys[2].id);
						});
					});// it should have a $.getTag() shortcut
				});
				
				describe('entity', function () {
					it('should allow us to make entities', function () {
						expect(es.makeEntity().id).toEqual(1);
						expect(es.makeEntity().id).toEqual(2);
						expect(es.makeEntity().id).toEqual(3);
						expect(es.makeEntity().id).toEqual(4);
						expect(es.makeEntity().id).toEqual(5);
						
						expect($('thorny entity-system base').makeEntity().id).toEqual(6);
						expect($('thorny entity-system base').makeEntity().id).toEqual(7);
						expect($('thorny entity-system base').makeEntity().id).toEqual(8);
						expect($('thorny entity-system base').makeEntity().id).toEqual(9);
						expect($('thorny entity-system base').makeEntity().id).toEqual(10);
					});//it
					
					it('should get a specific entity', function () {
						var
							e1 = es.makeEntity(),
							e2 = es.makeEntity(),
							e3 = es.makeEntity(),
							e4 = es.makeEntity(),
							e5 = es.makeEntity();
						
						expect(es.getEntity(e1.id).id).toEqual(e1.id);
						expect(es.getEntity(e2.id).id).toEqual(e2.id);
						expect(es.getEntity(e3.id).id).toEqual(e3.id);
						expect(es.getEntity(e4.id).id).toEqual(e4.id);
						expect(es.getEntity(e5.id).id).toEqual(e5.id);
					});// it should get a specific entity
					
					// Test the injection system correctly the code for, tag
					describe('injected by: tag', function () {
						it('should contain the tags injected function addTag', function () {
							var entity = es.makeEntity();

							expect(typeof entity.addObserver).toEqual('function');
							expect(typeof entity.notifyObservers).toEqual('function');
							expect(typeof entity.remove).toEqual('function');
							
							expect(typeof entity.addTag).toEqual('function');
						});//it
						
						it('should add a tag', function () {
							var entity = es.makeEntity();
							
							entity.addTag('added tag');
							
							expect(es.tag.get('added tag')).toEqual(entity);
						});//it
					});//desc injected by: tag
					
					// Test the injection system correctly the code for, templateable
					describe('injected by: templateable', function () {
						it('should contain the templateable injected functions', function () {
							var entity = es.makeEntity();

							expect(typeof entity.addObserver).toEqual('function');
							expect(typeof entity.notifyObservers).toEqual('function');
							expect(typeof entity.remove).toEqual('function');
							
							expect(typeof entity.useTag).toEqual('function');
							expect(typeof entity.isTemplate).toEqual('function');
							expect(typeof entity.concrete).toEqual('function');
						});//it
						
						// ...
						
					});//desc injected by: templateable
					
					// Test the injection system correctly the code for, spawnable
					describe('injected by: spawnable', function () {
						it('should contain the templateable injected functions', function () {
							var entity = es.makeEntity();

							expect(typeof entity.addObserver).toEqual('function');
							expect(typeof entity.notifyObservers).toEqual('function');
							expect(typeof entity.remove).toEqual('function');
							
							expect(typeof entity.spawn).toEqual('function');
						});//it
						
						// ...
						
					});//desc injected by: spawnable
					
					// Test the injection system correctly the code for, component
					describe('injected by: component', function () {
						it('should contain the templateable injected functions', function () {
							var entity = es.makeEntity();

							expect(typeof entity.addObserver).toEqual('function');
							expect(typeof entity.notifyObservers).toEqual('function');
							expect(typeof entity.remove).toEqual('function');
							
							expect(typeof entity.addComponent).toEqual('function');
							expect(typeof entity.getComponent).toEqual('function');
						});//it
						
						// ...
						
					});//desc injected by: component
				});//desc entity
				
				describe('tag', function () {
					it('should have the following', function () {
						expect(typeof es.tag.create).toEqual('function');
						expect(typeof es.tag.get).toEqual('function');
						expect(typeof es.tag.remove).toEqual('function');
					});//it
				});//desc tagEntity
			});//it
		});//desc entity-system/base
	});//instanceof thorny
}());