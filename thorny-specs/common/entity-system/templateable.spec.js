/*global console window describe xdescribe it expect runs waits*/
(function () {
	require.paths.unshift(__dirname + '/../../../');
	
	describe('the templateable system', function () {
		it('should have the following functions', function () {
			var ran = false;
			runs(function () {
				require('thorny/base')('./config/default.json')(function ($) {
					var
						e1 = $('thorny entity-system base').makeEntity();
						
					expect(typeof e1.makeTemplate).toEqual('function');
					expect(typeof e1.isTemplate).toEqual('function');
					expect(typeof e1.appendTemplate).toEqual('function');
					expect(typeof e1.useTag).toEqual('function');
					expect(typeof e1.concrete).toEqual('function');
					
					ran = true;
				});//instanceof thorny
			});
			waits(200);
			runs(function () {
				expect(ran).toBeTruthy();
			});
		});//it should have the following functions
		
		it('makeTemplate', function () {
			var ran = false;
			runs(function () {
				require('thorny/base')('./config/default.json')(function ($) {
					var
						e1 = $('thorny entity-system base').makeEntity(),
						e2 = $('thorny entity-system base').makeEntity(),
						e3 = $('thorny entity-system base').makeEntity(),
						e4 = $('thorny entity-system base').makeEntity(),
						e5 = $('thorny entity-system base').makeEntity();
						
					e1.makeTemplate();
					e2.makeTemplate();
					e3.makeTemplate();
					
					expect($.data('thorny entity-system templateable', 'templates')[e1.id]).toBeTruthy();
					expect($.data('thorny entity-system templateable', 'templates')[e2.id]).toBeTruthy();
					expect($.data('thorny entity-system templateable', 'templates')[e3.id]).toBeTruthy();
					expect($.data('thorny entity-system templateable', 'templates')[e4.id]).toBeFalsy();
					expect($.data('thorny entity-system templateable', 'templates')[e5.id]).toBeFalsy();
					
					ran = true;
				});//instanceof thorny
			});
			waits(200);
			runs(function () {
				expect(ran).toBeTruthy();
			});
		});//it makeTemplate
		
		it('isTemplate', function () {
			var ran = false;
			runs(function () {
				require('thorny/base')('./config/default.json')(function ($) {
					var
						e1 = $('thorny entity-system base').makeEntity(),
						e2 = $('thorny entity-system base').makeEntity(),
						e3 = $('thorny entity-system base').makeEntity(),
						e4 = $('thorny entity-system base').makeEntity(),
						e5 = $('thorny entity-system base').makeEntity(),
						e6 = $('thorny entity-system base').makeEntity($.defined('template')),
						e7 = $('thorny entity-system base').makeEntity($.defined('template')),
						e8 = $('thorny entity-system base').makeEntity($.defined('template'));
						
					e1.makeTemplate();
					e2.makeTemplate();
					e3.makeTemplate();
					
					expect(e1.isTemplate()).toBeTruthy();
					expect(e2.isTemplate()).toBeTruthy();
					expect(e3.isTemplate()).toBeTruthy();
					expect(e4.isTemplate()).toBeFalsy();
					expect(e5.isTemplate()).toBeFalsy();
					expect(e6.isTemplate()).toBeTruthy();
					expect(e7.isTemplate()).toBeTruthy();
					expect(e8.isTemplate()).toBeTruthy();
					
					ran = true;
				});//instanceof thorny
			});
			waits(200);
			runs(function () {
				expect(ran).toBeTruthy();
			});
		});//it isTemplate
		
		describe('appendTemplate', function () {
			it("should store the components name in the stored object", function () {
				var ran = false;
				runs(function () {
					require('thorny/base')('./config/default.json')(function ($) {
						var
							e1 = $('thorny entity-system base').makeEntity($.defined('template')),
							e2 = $('thorny entity-system base').makeEntity($.defined('template')),
							e3 = $('thorny entity-system base').makeEntity(),
							e4 = $('thorny entity-system base').makeEntity(),
							e5 = $('thorny entity-system base').makeEntity();

						e3.makeTemplate();

						expect(e1.appendTemplate('hello')).toBeTruthy();
						expect(e2.appendTemplate('world')).toBeTruthy();
						expect(e3.appendTemplate('hello')).toBeTruthy();
						expect(e4.appendTemplate('world')).toBeFalsy();
						expect(e5.appendTemplate('hello')).toBeFalsy();

						expect($.data('thorny entity-system templateable', 'components')[e1.id].length).toEqual(1);
						expect($.data('thorny entity-system templateable', 'components')[e2.id].length).toEqual(1);
						expect($.data('thorny entity-system templateable', 'components')[e3.id].length).toEqual(1);

						expect($.data('thorny entity-system templateable', 'components')[e1.id][0].name).toEqual('hello');
						expect($.data('thorny entity-system templateable', 'components')[e2.id][0].name).toEqual('world');
						expect($.data('thorny entity-system templateable', 'components')[e3.id][0].name).toEqual('hello');

						ran = true;
					});//instanceof thorny
				});
				waits(200);
				runs(function () {
					expect(ran).toBeTruthy();
				});
			});//it should store the components name in the stored object
			
			it("should the options in either an object or a function that returns an object.", function () {
				var ran = false;
				runs(function () {
					require('thorny/base')('./config/default.json')(function ($) {
						var 
							components = $.data('thorny entity-system templateable', 'components'),
							e1 = $.es().makeEntity($.defined('template')),
							e2 = $.es().makeEntity($.defined('template'));
							
						e1.appendTemplate('hello', {hello: 'world'});
						e2.appendTemplate('hello', function () {
							return {hello: 'world'};
							});
						
						expect(components[e1.id][0].name).toEqual('hello');
						expect(typeof components[e1.id][0].options).toEqual('object');
						expect(components[e1.id][0].options.hello).toEqual('world');
						
						expect(components[e2.id][0].name).toEqual('hello');
						expect(typeof components[e2.id][0].options).toEqual('function');
						expect(components[e2.id][0].options().hello).toEqual('world');
						
						
						ran = true;
					});//instanceof thorny
				});
				waits(200);
				runs(function () {
					expect(ran).toBeTruthy();
				});
			});//it should store the components name in the stored object
		});// desc appendTemplate
		
		describe('useTag', function () {
			it('should only be possible to add the following input permutations', function () {
				var ran = false;
				runs(function () {
					require('thorny/base')('./config/default.json')(function ($) {
						var
							e1 = $('thorny entity-system base').makeEntity($.defined('template')),
							e2 = $('thorny entity-system base').makeEntity(),
							e3 = $('thorny entity-system base').makeEntity($.defined('template')),
							e4 = $('thorny entity-system base').makeEntity(),
							e5 = $('thorny entity-system base').makeEntity($.defined('template')),
							e6 = $('thorny entity-system base').makeEntity(),
							e7 = $('thorny entity-system base').makeEntity($.defined('template')),
							e8 = $('thorny entity-system base').makeEntity();

						// Define us some entities to use.
						$('thorny entity-system base')
							.makeEntity($.defined('template'))
							.addTag('use');

						$('thorny entity-system base')
							.makeEntity()
							.addTag('dont-use');

						// Templates can use other templates
						expect(e1.useTag('use')).toBeTruthy();
						expect(e2.useTag('use')).toBeFalsy();

						// Nothing can use a non-template
						expect(e3.useTag('dont-use')).toBeFalsy();
						expect(e4.useTag('dont-use')).toBeFalsy();

						// Templates can use templates, as can non-templates
						expect(e5.useTag('use', $.defined('concrete'))).toBeTruthy();
						expect(e6.useTag('use', $.defined('concrete'))).toBeTruthy();

						// Nothing can use a non-template
						expect(e7.useTag('dont-use', $.defined('concrete'))).toBeFalsy();
						expect(e8.useTag('dont-use', $.defined('concrete'))).toBeFalsy();
						
						ran = true;
					});//instanceof thorny
				});
				waits(200);
				runs(function () {
					expect(ran).toBeTruthy();
				});
			});//it should only be possible to add the following input permutations
			
			it('should allow templates that extends other templates to concat a list of used components', function () {
				var ran = false;
				runs(function () {
					require('thorny/base')('./config/thorny-spec-demo.json')(function ($) {
						$.es()
							.makeEntity($.defined('template'))
							.addTag('first')
							.addComponent('a')
							.addComponent('c')
							.addComponent('e');
						$.es()
							.makeEntity($.defined('template'))
							.useTag('first')
							.addTag('second')
							.addComponent('b')
							.addComponent('d')
							.addComponent('f');
						
						var e = $.es().tag.get('second').concrete();
						
						expect(e.hasComponent('a')).toBeTruthy();
						expect(e.hasComponent('b')).toBeTruthy();
						expect(e.hasComponent('c')).toBeTruthy();
						expect(e.hasComponent('d')).toBeTruthy();
						expect(e.hasComponent('e')).toBeTruthy();
						expect(e.hasComponent('f')).toBeTruthy();
						
						ran = true;
					});//instanceof thorny
				});
				waits(200);
				runs(function () {
					expect(ran).toBeTruthy();
				});
			});// it should allow template extentions to concat a list of used components
		});// desc useTag
	});//desc the templateable system
}());