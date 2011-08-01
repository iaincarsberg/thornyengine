/*global console window describe xdescribe it expect runs waits*/
(function () {
	require.paths.unshift(__dirname + '/../../../');
	require('thorny/base')('./config/default.json')(function ($) {
		describe('entity-system/tag', function () {
			it('should have the following functions', function () {
				var tag = $('thorny entity-system tag');
				
				expect(typeof tag.create).toEqual('function');
				expect(typeof tag.get).toEqual('function');
				expect(typeof tag.remove).toEqual('function');
				
				describe('create', function () {
					it('should create a new tag ', function () {
						var
							e1 = $('thorny entity-system base').makeEntity(),
							e2 = $('thorny entity-system base').makeEntity(),
							e3 = $('thorny entity-system base').makeEntity();
						
						$('thorny entity-system base').tag.create(e1, 'eee1');
						$('thorny entity-system base').tag.create(e2, 'eee2');
						$('thorny entity-system base').tag.create(e3, 'eee3');
						
						// Test the entity-tags object is built correctly
						expect($.data('thorny entity-system tag', 'entity-tags')[1][0].entity)
							.toEqual(e1);
						expect($.data('thorny entity-system tag', 'entity-tags')[2][0].entity)
							.toEqual(e2);
						expect($.data('thorny entity-system tag', 'entity-tags')[3][0].entity)
							.toEqual(e3);
						
						// Test the tags-entity object is built correctly
						expect($.data('thorny entity-system tag', 'tags-entity').eee1.entity)
							.toEqual(e1);
						expect($.data('thorny entity-system tag', 'tags-entity').eee2.entity)
							.toEqual(e2);
						expect($.data('thorny entity-system tag', 'tags-entity').eee3.entity)
							.toEqual(e3);
					});//it
					
					it('should be possible to tag one entity multiple times', function () {
						var e1 = $('thorny entity-system base').makeEntity();
						
						$('thorny entity-system base').tag.create(e1, 'eee1');
						$('thorny entity-system base').tag.create(e1, 'eee2');
						$('thorny entity-system base').tag.create(e1, 'eee3');
						
						// Test the entity-tags object is built correctly
						expect($.data('thorny entity-system tag', 'entity-tags')[4][0].entity)
							.toEqual(e1);
						expect($.data('thorny entity-system tag', 'entity-tags')[4][1].entity)
							.toEqual(e1);
						expect($.data('thorny entity-system tag', 'entity-tags')[4][2].entity)
							.toEqual(e1);
						
						// Test the tags-entity object is built correctly
						expect($.data('thorny entity-system tag', 'tags-entity').eee1.entity)
							.toEqual(e1);
						expect($.data('thorny entity-system tag', 'tags-entity').eee2.entity)
							.toEqual(e1);
						expect($.data('thorny entity-system tag', 'tags-entity').eee3.entity)
							.toEqual(e1);
					});
				});//desc create
				
				describe('get', function () {
					it('should get an entity using an attached tag', function () {
						var
							e1 = $('thorny entity-system base').makeEntity(),
							e2 = $('thorny entity-system base').makeEntity(),
							e3 = $('thorny entity-system base').makeEntity();
						
						$('thorny entity-system base').tag.create(e1, 'eee1');
						$('thorny entity-system base').tag.create(e2, 'eee2');
						$('thorny entity-system base').tag.create(e3, 'eee3');
						
						// Test the entity-tags object is built correctly
						expect($('thorny entity-system base').tag.get('eee1'))
							.toEqual(e1);
						expect($('thorny entity-system base').tag.get('eee2'))
							.toEqual(e2);
						expect($('thorny entity-system base').tag.get('eee3'))
							.toEqual(e3);
					});//it
					
					it('should get an entity using an attached tag, and work when one entity has multiple tags', function () {
						var e1 = $('thorny entity-system base').makeEntity();
						
						$('thorny entity-system base').tag.create(e1, 'eee1');
						$('thorny entity-system base').tag.create(e1, 'eee2');
						$('thorny entity-system base').tag.create(e1, 'eee3');
						
						// Test the entity-tags object is built correctly
						expect($('thorny entity-system base').tag.get('eee1'))
							.toEqual(e1);
						expect($('thorny entity-system base').tag.get('eee2'))
							.toEqual(e1);
						expect($('thorny entity-system base').tag.get('eee3'))
							.toEqual(e1);
					});//it
				});//desc get
				
				describe('remove', function () {
					it('should remove a tag from an eitity', function () {
						var ran = false;
						runs(function () {
							require('thorny/base')('./config/default.json')(function ($) {
								var
									e1 = $('thorny entity-system base').makeEntity(),
									e2 = $('thorny entity-system base').makeEntity(),
									e3 = $('thorny entity-system base').makeEntity();
								
								$('thorny entity-system base').tag.create(e1, 'eee1');
								$('thorny entity-system base').tag.create(e2, 'eee2');
								$('thorny entity-system base').tag.create(e3, 'eee3');
								
								// Test the entity-tags object is built correctly
								expect($('thorny entity-system base').tag.get('eee1'))
									.toEqual(e1);
								expect($('thorny entity-system base').tag.get('eee2'))
									.toEqual(e2);
								expect($('thorny entity-system base').tag.get('eee3'))
									.toEqual(e3);
									
								$('thorny entity-system base').tag.remove('eee1');
								$('thorny entity-system base').tag.remove('eee2');
								$('thorny entity-system base').tag.remove('eee3');
								
								expect($('thorny entity-system base').tag.get('eee1'))
									.toEqual(false);
								expect($('thorny entity-system base').tag.get('eee2'))
									.toEqual(false);
								expect($('thorny entity-system base').tag.get('eee3'))
									.toEqual(false);
								expect($('thorny entity-system base').tag.get('something-ive-not-set'))
									.toEqual(false);
									
								expect(e1.id).toEqual(1);
								expect(e2.id).toEqual(2);
								expect(e3.id).toEqual(3);
								ran = true;
							});//instanceof thorny
						});
						waits(200);
						runs(function () {
							expect(ran).toBeTruthy();
						});
					});//it
					
					it('should remove a single tag from an entity with multiple tags', function () {
						var ran = false;
						runs(function () {
							require('thorny/base')('./config/default.json')(function ($) {
								var e1 = $('thorny entity-system base').makeEntity();
								
								$('thorny entity-system base').tag.create(e1, 'eee1');
								$('thorny entity-system base').tag.create(e1, 'eee2');
								$('thorny entity-system base').tag.create(e1, 'eee3');
								
								// Test the entity-tags object is built correctly
								expect($('thorny entity-system base').tag.get('eee1'))
									.toEqual(e1);
								expect($('thorny entity-system base').tag.get('eee2'))
									.toEqual(e1);
								expect($('thorny entity-system base').tag.get('eee3'))
									.toEqual(e1);
									
								$('thorny entity-system base').tag.remove('eee1');
								$('thorny entity-system base').tag.remove('eee2');
								
								expect($('thorny entity-system base').tag.get('eee1'))
									.toEqual(false);
								expect($('thorny entity-system base').tag.get('eee2'))
									.toEqual(false);
								expect($('thorny entity-system base').tag.get('eee3'))
									.toEqual(e1);
								expect($('thorny entity-system base').tag.get('something-ive-not-set'))
									.toEqual(false);
									
								expect(e1.id).toEqual(1);
								ran = true;
							});//instanceof thorny
						});
						waits(200);
						runs(function () {
							expect(ran).toBeTruthy();
						});
					});//it
				});//desc remove
				
				describe('entity.remove', function () {
					it('When an entity is removed all internal references would be removed aswell', function () {
						var ran = false;
						runs(function () {
							require('thorny/base')('./config/default.json')(function ($) {
								var
									e1 = $('thorny entity-system base').makeEntity(),
									e2 = $('thorny entity-system base').makeEntity(),
									e3 = $('thorny entity-system base').makeEntity();
								
								$('thorny entity-system base').tag.create(e1, 'eee1');
								$('thorny entity-system base').tag.create(e2, 'eee2');
								$('thorny entity-system base').tag.create(e3, 'eee3');
								
								// Remove the entities.
								e1.remove();
								e2.remove();
								e3.remove();
								
								// Test the entity-tags object is built correctly
								expect($.data('thorny entity-system tag', 'entity-tags')[1])
									.toEqual(undefined);
								expect($.data('thorny entity-system tag', 'entity-tags')[2])
									.toEqual(undefined);
								expect($.data('thorny entity-system tag', 'entity-tags')[3])
									.toEqual(undefined);
								
								// Test the tags-entity object is built correctly
								expect($.data('thorny entity-system tag', 'tags-entity').eee1)
									.toEqual(undefined);
								expect($.data('thorny entity-system tag', 'tags-entity').eee2)
									.toEqual(undefined);
								expect($.data('thorny entity-system tag', 'tags-entity').eee3)
									.toEqual(undefined);
									
								ran = true;
							});//instanceof thorny
						});
						waits(200);
						runs(function () {
							expect(ran).toBeTruthy();
						});
					});//it
					
					it('When an entity is removed all internal references would be removed aswell', function () {
						var ran = false;
						runs(function () {
							require('thorny/base')('./config/default.json')(function ($) {
								var
									e1 = $('thorny entity-system base').makeEntity(),
									e2 = $('thorny entity-system base').makeEntity(),
									e3 = $('thorny entity-system base').makeEntity();
								
								$('thorny entity-system base').tag.create(e1, 'eee1');
								$('thorny entity-system base').tag.create(e2, 'eee2');
								$('thorny entity-system base').tag.create(e3, 'eee3');
								
								// Remove the entities.
								e1.remove();
								e2.remove();
								e3.remove();
								
								// Test the entity-tags object is built correctly
								expect($('thorny entity-system base').tag.get('eee1'))
									.toEqual(false);
								expect($('thorny entity-system base').tag.get('eee2'))
									.toEqual(false);
								expect($('thorny entity-system base').tag.get('eee3'))
									.toEqual(false);
									
								ran = true;
							});//instanceof thorny
						});
						waits(200);
						runs(function () {
							expect(ran).toBeTruthy();
						});
					});//it
				});//desc entity.remove
			});//it
		});//desc entity-system/base
	});//instanceof thorny
}());