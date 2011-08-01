/*global console window describe it expect runs waits*/
(function () {
	require.paths.unshift(__dirname + '/../');
	
	describe('the core node-collection system', function () {
		it('should have the following functions', function () {
			var ran = false;
			runs(function () {
				require('thorny/base')('./config/default.json')(function ($) {
					var node = $('thorny level node-collection');
					
					expect(typeof node.factory).toEqual('function');
					
					ran = true;
				});//instanceof thorny
			});
			waits(200);
			runs(function () {
				expect(ran).toBeTruthy();
			});
		});//it should have the following functions
		
		describe('has a factory function, that is used to create and manage a collection of nodes', function () {
			it('should have the following functions', function () {
				var ran = false;
				runs(function () {
					require('thorny/base')('./config/default.json')(function ($) {
						var
							node = $('thorny level node-collection'),
							n_1 = node.factory({}, 'node');

						expect(typeof n_1.push).toEqual('function');
						expect(typeof n_1.remove).toEqual('function');
						expect(typeof n_1.search).toEqual('function');
						expect(typeof n_1.iterator).toEqual('function');
						ran = true;
					});//instanceof thorny
				});
				waits(200);
				runs(function () {
					expect(ran).toBeTruthy();
				});
			});//it should have the following functions
			
			describe('that has a push function', function () {
				it('should allow you to push new nodes into the collection', function () {
					var ran = false;
					runs(function () {
						require('thorny/base')('./config/default.json')(function ($) {
							/**
							 * This test isn't going to test much, as we need the 
							 * search function to really see if its working.
							 */
							var 
								collection = $('thorny level node-collection').factory(),
								node = $('thorny level node');

							try {
								collection.push(node.factory({}, 'node'));

								// Issue a victory cookie.
								expect(true).toBeTruthy();

							} catch (e) {
								// Force a generic error, as this should never be
								// gotten to.
								expect(false).toBeTruthy();
							}
							
							ran = true;
						});//instanceof thorny
					});
					waits(200);
					runs(function () {
						expect(ran).toBeTruthy();
					});
				});//it should allow you to push new nodes into the collection
				
				it('should allow us to chain node pushes', function () {
					var ran = false;
					runs(function () {
						require('thorny/base')('./config/default.json')(function ($) {
							var 
								collection = $('thorny level node-collection').factory(),
								node = $('thorny level node');

							try {
								collection
									.push(node.factory({}, 'node', 1))
									.push(node.factory({}, 'node', 2))
									.push(node.factory({}, 'node', 3))
									.push(node.factory({}, 'node', 4))
									.push(node.factory({}, 'node', 5));

								// Issue a victory cookie.
								expect(true).toBeTruthy();

							} catch (e) {
								// Force a generic error, as this should never be
								// gotten to.
								expect(false).toBeTruthy();
							}
							
							ran = true;
						});//instanceof thorny
					});
					waits(200);
					runs(function () {
						expect(ran).toBeTruthy();
					});
				});//it should allow us to chain node pushes
			});// desc that has a push function
			
			describe('that has a remove function', function () {
				it('should allow pushed nodes to be removed', function () {
					// TODO
				});
			});// desc that has a remove function
			
			describe('that has a search function', function () {
				it('should allow you to find a specific node in the collection', function () {
					var ran = false;
					runs(function () {
						require('thorny/base')('./config/default.json')(function ($) {
							var 
								collection = $('thorny level node-collection').factory(),
								node = $('thorny level node'),
								v_1 = node.factory({}, 'node', 1),
								v_2 = node.factory({}, 'node', 2),
								v_3 = node.factory({}, 'node', 3),
								v_4 = node.factory({}, 'node', 4);

							collection.push(v_1);

							expect(collection.search('node-1').node).toEqual(v_1);
							expect(collection.search('node', 1).node).toEqual(v_1);
							expect(collection.search('node-2').node).toBeFalsy();
							expect(collection.search('node', 2).node).toBeFalsy();

							collection
								.push(v_2)
								.push(v_3)
								.push(v_4);

							expect(collection.search('node-2').node).toEqual(v_2);
							expect(collection.search('node-3').node).toEqual(v_3);
							expect(collection.search('node-4').node).toEqual(v_4);
							expect(collection.search('node-5').node).toBeFalsy();
							
							ran = true;
						});//instanceof thorny
					});
					waits(200);
					runs(function () {
						expect(ran).toBeTruthy();
					});
				});//it should allow you to find a specific node in the collection
			});// desc that has a search function
			
			describe('that has a iterator function', function () {
				it('should allow you to loop over the collection', function () {
					var ran = false;
					runs(function () {
						require('thorny/base')('./config/default.json')(function ($) {
							var
								collection = $('thorny level node-collection').factory(),
								node = $('thorny level node'),
								v_1 = node.factory({}, 'node', 1),
								v_2 = node.factory({}, 'node', 2),
								v_3 = node.factory({}, 'node', 3),
								v_4 = node.factory({}, 'node', 4),
								iterator,	// Contains an instance of the collection iterator
								next,		// Contains the next item in the collection
								currentNode;// Used to see which node-n value we're expecting to see.

							collection.push(v_1);

							iterator = collection.iterator();
							currentNode = 0;
							while ((next = iterator.step().node)) {
								expect(next.getId()).toEqual('node-' + (currentNode += 1));
							}

							collection
								.push(v_2)
								.push(v_3)
								.push(v_4);

							iterator = collection.iterator();
							currentNode = 0;
							while ((next = iterator.step().node)) {
								expect(next.getId()).toEqual('node-' + (currentNode += 1));
							}

							iterator.rewind();
							currentNode = 0;
							while ((next = iterator.step().node)) {
								expect(next.getId()).toEqual('node-' + (currentNode += 1));
							}
							
							
							ran = true;
						});//instanceof thorny
					});
					waits(200);
					runs(function () {
						expect(ran).toBeTruthy();
					});
				});//it should allow you to loop over the collection
			});// desc that has a iterator function
		});// has a factory function that is used to create and manage a collection of nodes
		
		describe('a node collection', function () {
			it('should be able to extend the collection by injecting functionality', function () {
				var ran = false;
				runs(function () {
					require('thorny/base')('./config/default.json')(function ($) {
						var
							node = $('thorny level node-collection').factory({
								lorem: function () {
									return 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
								}
							});

						expect(typeof node.lorem).toEqual('function');
						expect(node.lorem()).toEqual('Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.');
						
						ran = true;
					});//instanceof thorny
				});
				waits(200);
				runs(function () {
					expect(ran).toBeTruthy();
				});
			});//it should be able to extend the collection by injecting functionality
			
			it('should be able to extend from a node', function () {
				var ran = false;
				runs(function () {
					require('thorny/base')('./config/default.json')(function ($) {
						var
							node = $('thorny level node'),
							collection = $('thorny level node-collection'),
							nested;

						nested = collection.factory(node.factory({
							lorem: function () {
								return 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
							}
						}));

						expect(typeof nested.isNode).toEqual('function');
						expect(typeof nested.getId).toEqual('function');
						expect(typeof nested.addNeighbour).toEqual('function');
						expect(typeof nested.getNeightbours).toEqual('function');
						expect(typeof nested.push).toEqual('function');
						expect(typeof nested.remove).toEqual('function');
						expect(typeof nested.search).toEqual('function');
						expect(typeof nested.iterator).toEqual('function');
						expect(typeof nested.lorem).toEqual('function');
						expect(nested.lorem()).toEqual('Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.');
						
						ran = true;
					});//instanceof thorny
				});
				waits(200);
				runs(function () {
					expect(ran).toBeTruthy();
				});
			});//it should be able to extend from a node
		});// desc a node collection
	});// desc the core node-collection system
}());