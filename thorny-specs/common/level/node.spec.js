/*global console window describe it expect runs waits*/
(function () {
	require.paths.unshift(__dirname + '/../');
	
	describe('the core node system', function () {
		it('should have the following functions', function () {
			var ran = false;
			runs(function () {
				require('thorny/base')('./config/default.json')(function ($) {
					var node = $('thorny level node');
					
					expect(typeof node.factory).toEqual('function');
					expect(typeof node.formatArguments).toEqual('function');
					
					ran = true;
				});//instanceof thorny
			});
			waits(200);
			runs(function () {
				expect(ran).toBeTruthy();
			});
		});//it should have the following functions
		
		
		describe('has a factory function', function () {
			it('should have the following functions', function () {
				var ran = false;
				runs(function () {
					require('thorny/base')('./config/default.json')(function ($) {
						var
							node = $('thorny level node'),
							n_1 = node.factory({}, 'node');

						expect(typeof n_1.isNode).toEqual('function');
						expect(typeof n_1.getId).toEqual('function');
						expect(typeof n_1.addNeighbour).toEqual('function');
						expect(typeof n_1.getNeightbours).toEqual('function');

						ran = true;
					});//instanceof thorny
				});
				waits(200);
				runs(function () {
					expect(ran).toBeTruthy();
				});
			});//it should have the following functions
			
			describe('has an extensible factory function', function () {
				it('should allow you to parse in a object, and include those customisations into returned object', function () {
					var ran = false;
					runs(function () {
						require('thorny/base')('./config/default.json')(function ($) {
							var
								node = $('thorny level node'),
								n_1 = node.factory({
									dance: function () {
										return false;
									},
									sayWhat: function () {
										return 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
									}
								}, 'node');
							
							expect(typeof n_1.dance).toEqual('function');
							expect(typeof n_1.sayWhat).toEqual('function');
							expect(n_1.sayWhat()).toEqual('Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.');

							ran = true;
						});//instanceof thorny
					});
					waits(200);
					runs(function () {
						expect(ran).toBeTruthy();
					});
				});// it should allow you to parse in a object, and include those customisations into returned object
			});// desc has an extensible factory function
			
			describe('has a function isNode', function () {
				it('should know its own id', function () {
					var ran = false;
					runs(function () {
						require('thorny/base')('./config/default.json')(function ($) {
							var node = $('thorny level node').factory({}, 'node');
							
							expect(node.isNode('node')).toBeTruthy();//'Check to see if the node know its own id'
							expect(node.isNode('some-other-node')).toBeFalsy();//'Makesure it doesnt think its someone else.'
							
							ran = true;
						});//instanceof thorny
					});
					waits(200);
					runs(function () {
						expect(ran).toBeTruthy();
					});
				});//it should know its own id
			});// desc has a function isNode
			
			describe('has a function getId', function () {
				it('should know its own id', function () {
					var ran = false;
					runs(function () {
						require('thorny/base')('./config/default.json')(function ($) {
							expect($('thorny level node').factory({}, 'node').getId()).toEqual('node');
							expect($('thorny level node').factory({}, 'poly', 1).getId()).toEqual('poly-1');
							expect($('thorny level node').factory({}, 'random', 'object', 'of', 'death').getId()).toEqual('random-object-of-death');
							expect($('thorny level node').factory({}, 1, 2, 3, 4, 5).getId()).toEqual('1-2-3-4-5');
							
							ran = true;
						});//instanceof thorny
					});
					waits(200);
					runs(function () {
						expect(ran).toBeTruthy();
					});
				});//it should know its own id
			});// desc has a function getId
			
			describe('has a function addNeighbour', function () {
				it('should have the following functions', function () {
					var ran = false;
					runs(function () {
						require('thorny/base')('./config/default.json')(function ($) {
							var node = $('thorny level node');

							expect(typeof node.factory).toEqual('function');
							expect(typeof node.formatArguments).toEqual('function');

							ran = true;
						});//instanceof thorny
					});
					waits(200);
					runs(function () {
						expect(ran).toBeTruthy();
					});
				});//it should have the following functions
			});// desc has a function addNeighbour
			
			describe('has a function getNeightbours', function () {
				it('should be able to correctly network nodes', function () {
					var ran = false;
					runs(function () {
						require('thorny/base')('./config/default.json')(function ($) {
							var 
								node = $('thorny level node'),
								n_1 = node.factory({}, 'node', 1),
								n_2 = node.factory({}, 'node', 2),
								n_3 = node.factory({}, 'node', 3),
								n_4 = node.factory({}, 'node', 4),
								n_5 = node.factory({}, 'node', 5),
								neighbours;

							expect(n_1.getNeightbours().getLength()).toEqual(0);
							expect(n_1.addNeighbour(n_1)).toBeFalsy();
							expect(n_1.getNeightbours().getLength()).toEqual(0);// As you can't network to your self


							expect(n_1.addNeighbour(n_2)).toBeTruthy();
							expect(n_1.getNeightbours().getLength()).toEqual(1);

							expect(n_1.addNeighbour(n_2)).toBeFalsy();
							expect(n_1.getNeightbours().getLength()).toEqual(1);// As your already networked to 2

							expect(n_1.getNeightbours().current().node).toEqual(n_2);

							expect(n_1.addNeighbour(n_3)).toBeTruthy();
							expect(n_1.getNeightbours().getLength()).toEqual(2);

							neighbours = n_1.getNeightbours();
							expect(neighbours.step().node).toEqual(n_2);
							expect(neighbours.step().node).toEqual(n_3);
							
							ran = true;
						});//instanceof thorny
					});
					waits(200);
					runs(function () {
						expect(ran).toBeTruthy();
					});
				});//it should be able to correctly network nodes
			});// desc has a function getNeightbours
		});// desc has a factory function
		
		describe('has a formatArguments function', function () {
			it('should correctly reform the following inputs', function () {
				var ran = false;
				runs(function () {
					require('thorny/base')('./config/default.json')(function ($) {
						var
							node = $('thorny level node'),
							func = function () {
								return false;
							};

						expect(node.formatArguments(['hello'])).toEqual('hello');
						expect(node.formatArguments(['hello', 'world'])).toEqual('hello-world');
						expect(node.formatArguments(['level', 1])).toEqual('level-1');
						expect(node.formatArguments(['object', {}])).toEqual('object-[object Object]');
						expect(node.formatArguments(['function', func]).replace(/[\t\r\n]/g, '').replace(/[ ]/g, '')).toEqual("function-function () {return false;}".replace(/[ ]/g, ''));
						expect(node.formatArguments(['Lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipisicing'])).toEqual('Lorem-ipsum-dolor-sit-amet-consectetur-adipisicing');
						expect(node.formatArguments(['Lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipisicing'], 3)).toEqual('sit-amet-consectetur-adipisicing');
						expect(node.formatArguments(['Lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipisicing'], 5)).toEqual('consectetur-adipisicing');

						ran = true;
					});//instanceof thorny
				});
				waits(200);
				runs(function () {
					expect(ran).toBeTruthy();
				});
			});// it should correctly reform the following inputs
		});// desc has a formatArguments function
	});// desc the core node system
}());