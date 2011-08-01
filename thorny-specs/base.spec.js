/*global console window describe it expect runs waits beforeEach*/
(function () {
	/**
	 * Just a note, most of the testing in here will be making sure thorny binds
	 * correctly to the browser.
	 */
	
	require.paths.unshift(__dirname + '/../../');
	
	describe('The base module interface', function () {
		it('should return a function', function () {
			expect(typeof require('thorny/base')).toEqual('function');
		});
		
		it('should return a function when the first returned function is called', function () {
			expect(typeof require('thorny/base')()).toEqual('function');
		});
		
		describe('the third function', function () {
			it('should exeucte a callback', function () {
				var ran = false;
				runs(function () {
					require('thorny/base')()(function () {
						ran = true;
					});
				});
				waits(200);
				runs(function () {
					expect(ran).toBeTruthy();
				});
			});// it
			
			it('should load a module file, and make its functionality available.', function () {
				var ran = false;
				runs(function () {
					require('thorny/base')('thorny-spec-demo welcome')(function ($) {
						expect($('thorny-spec-demo welcome')()).toEqual('Welcome, developer!');
						expect($('thorny-spec-demo welcome')('dave')).toEqual('Welcome, dave!');
						ran = true;
					});
				});
				waits(200);
				runs(function () {
					expect(ran).toBeTruthy();
				});
			});//it
			
			it('should load a config file, and make the contained modules functionality available.', function () {
				var ran = false;
				runs(function () {
					require('thorny/base')('./config/thorny-spec-demo.json')(function ($) {
						expect($('thorny-spec-demo welcome')()).toEqual('Welcome, developer!');
						expect($('thorny-spec-demo welcome')('dave')).toEqual('Welcome, dave!');
						ran = true;
					});
				});
				waits(200);
				runs(function () {
					expect(ran).toBeTruthy();
				});
			});//it
			
			describe('data', function () {
				it('should manipulate the instances data', function () {
					var ran = false;
					runs(function () {
						require('thorny/base')('./config/default.json')(function ($, path) {
							expect($.data(path, 'key')).toEqual(false);
							$.data(path, 'key', 'value');
							expect($.data(path, 'key')).toEqual('value');
							
							ran = true;
						});
					});
					waits(200);
					runs(function () {
						expect(ran).toBeTruthy();
					});
				});//it
				
				it('should only manipulate the local instances data', function () {
					var execs = 0;
					runs(function () {
						require('thorny/base')('./config/default.json')(function ($, module) {
							$.data(module, 'key', 'value');
							expect($.data(module, 'key')).toEqual('value');
							
							execs += 1;
						});
						
						require('thorny/base')('./config/default.json')(function ($, module) {
							expect($.data(module, 'key')).toEqual(false);
							
							execs += 1;
						});
					});
					waits(200);
					runs(function () {
						expect(execs).toEqual(2);
					});
				});//it
			});//desc data
			
			describe('onInit and module', function () {
				it('should manipulate the instances data', function () {
					var ran = false;
					runs(function () {
						require('thorny/base')('./config/thorny-spec-demo.json')(function ($) {
							expect($('thorny-spec-demo basetester').getModule()).toEqual('thorny-spec-demo basetester');
							expect($('thorny-spec-demo basetester').getIncromented()).toEqual(1);
							expect($('thorny-spec-demo basetester').getIncromented()).toEqual(1);
							expect($('thorny-spec-demo basetester').getIncromented()).toEqual(1);
							expect($('thorny-spec-demo basetester').getIncromented()).toEqual(1);
							expect($('thorny-spec-demo basetester').getIncromented()).toEqual(1);
							
							ran = true;
						});
					});
					waits(200);
					runs(function () {
						expect(ran).toBeTruthy();
					});
				});//it
			});//desc onInit and module
			
			describe('the autoexec config flag', function () {
				it('should allow modules to be automatically executed', function () {
					var ran = false;
					runs(function () {
						require('thorny/base')('./config/thorny-spec-demo.json')(function ($) {
							expect(typeof $.catch_phrases).toEqual('function');
							expect(typeof $.catch_phrases()).toEqual('object');
							expect(typeof $.catch_phrases().arnie).toEqual('object');
							expect(typeof $.catch_phrases().glados).toEqual('object');
							
							expect($.catch_phrases().arnie.join(' ')).toEqual("I'll be back");
							expect($.catch_phrases().glados.join(' ')).toEqual("the cake is a lie");
							
							ran = true;
						});
					});
					waits(200);
					runs(function () {
						expect(ran).toBeTruthy();
					});
				});//it
			});//desc autoexec
			
			describe('the omitIfNodejs config flag', function () {
				// TODO
			});
			
			describe('the omitIfBrowser config flag', function () {
				// TODO
			});
			
			describe('registerGlobal', function () {
				it('should allow you to register a new global', function () {
					var ran = false;
					runs(function () {
						require('thorny/base')()(function ($) {
							$.registerGlobal('g1', function () {
								return 'g-1';
							});
							$.registerGlobal('g2', function () {
								return 'g-2';
							});
							$.registerGlobal('g3', function () {
								return 'g-3';
							});
							
							expect(typeof $.g1).toEqual('function');
							expect(typeof $.g2).toEqual('function');
							expect(typeof $.g3).toEqual('function');
							
							expect($.g1()).toEqual('g-1');
							expect($.g2()).toEqual('g-2');
							expect($.g3()).toEqual('g-3');
							
							ran = true;
						});
					});
					waits(200);
					runs(function () {
						expect(ran).toBeTruthy();
					});
				});//it
				
				it("should't allow a global to be registered multiple times.", function () {
					var ran = false;
					runs(function () {
						require('thorny/base')()(function ($) {
							$.registerGlobal('g1', function () {
								return 'g-1';
							});
							
							try {
								$.registerGlobal('g1', function () {
									return 'not-g-1';
								});
								expect(false).toBeTruthy();
								
							} catch (e) {
								expect(e.message.replace(/[\t\r\n]/g, '').replace(/"/g, "'").replace(/[ ]/g, ''))
									.toEqual("handle.registerGlobal(g1, function () {return 'not-g-1';}); global already registered.".replace(/[ ]/g, ''));
								expect(true).toBeTruthy();
							}
							
							expect($.g1()).toEqual('g-1');
							
							ran = true;
						});
					});
					waits(200);
					runs(function () {
						expect(ran).toBeTruthy();
					});
				});//it
				
				it("should't allow you to register a non function.", function () {
					var ran = false;
					runs(function () {
						require('thorny/base')()(function ($) {
							try {
								$.registerGlobal('g1', {
									g1: 'rox'
								});
								expect(false).toBeTruthy();
								
							} catch (e) {
								expect(e.message.replace(/[\t\r\n]/g, ''))
									.toEqual("handle.registerGlobal(g1, [object Object]); module can only be a function.");
								expect(true).toBeTruthy();
							}
							
							expect($.g1).toEqual(undefined);
							
							ran = true;
						});
					});
					waits(200);
					runs(function () {
						expect(ran).toBeTruthy();
					});
				});//it
			});//desc registerGlobal
			
			describe('defined, getDefined and hasDefined', function () {
				it('should issue a unique id', function () {
					var ran = false;
					runs(function () {
						require('thorny/base')('./config/thorny-spec-demo.json')(function ($) {
							expect($.defined('var 1')).toEqual('0x1');
							expect($.defined('var 2')).toEqual('0x2');
							expect($.defined('var 3')).toEqual('0x3');
							expect($.defined('var 4')).toEqual('0x4');
							expect($.defined('var 5')).toEqual('0x5');
							
							expect($.getDefined('0x1')).toEqual('var 1');
							expect($.getDefined('0x2')).toEqual('var 2');
							expect($.getDefined('0x3')).toEqual('var 3');
							expect($.getDefined('0x4')).toEqual('var 4');
							expect($.getDefined('0x5')).toEqual('var 5');
							
							ran = true;
						});
					});
					waits(200);
					runs(function () {
						expect(ran).toBeTruthy();
					});
				});//it
				
				it('Just makeing sure the codes are instance specific.', function () {
					var ran = false;
					runs(function () {
						require('thorny/base')('./config/thorny-spec-demo.json')(function ($) {
							expect($.defined('variable 1')).toEqual('0x1');
							expect($.defined('variable 2')).toEqual('0x2');
							expect($.defined('variable 3')).toEqual('0x3');
							expect($.defined('variable 4')).toEqual('0x4');
							expect($.defined('variable 5')).toEqual('0x5');
							
							expect($.getDefined('0x1')).toEqual('variable 1');
							expect($.getDefined('0x2')).toEqual('variable 2');
							expect($.getDefined('0x3')).toEqual('variable 3');
							expect($.getDefined('0x4')).toEqual('variable 4');
							expect($.getDefined('0x5')).toEqual('variable 5');
							
							ran = true;
						});
					});
					waits(200);
					runs(function () {
						expect(ran).toBeTruthy();
					});
				});//it
				
				
				it('Test to see if a specific defined value is in a list using hasDefined.', function () {
					var ran = false;
					runs(function () {
						require('thorny/base')('./config/thorny-spec-demo.json')(function ($) {
							var data = [
								'hello, world',
								'omg',
								'the',
								$.defined('cake'),
								$.defined('is a'),
								$.defined('lie')
							];
							
							expect($.hasDefined('hello, world', data)).toBeFalsy();
							expect($.hasDefined('omg', data)).toBeFalsy();
							expect($.hasDefined('the', data)).toBeFalsy();
							expect($.hasDefined('cake', data)).toBeTruthy();
							expect($.hasDefined('is a', data)).toBeTruthy();
							expect($.hasDefined('lie', data)).toBeTruthy();
							
							ran = true;
						});
					});
					waits(200);
					runs(function () {
						expect(ran).toBeTruthy();
					});
				});//it
			});// desc defined and getDefined
		});// desc
	});//desc
}());