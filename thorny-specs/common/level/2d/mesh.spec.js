/*global console window describe it expect runs waits*/
(function () {
	require.paths.unshift(__dirname + '/../');
	
	describe('the 2d mesh level format', function () {
		it('should have the following functions', function () {
			var ran = false;
			runs(function () {
				require('thorny/base')('./config/default.json')(function ($) {
					var level = $('thorny level 2d mesh');
					
					expect(typeof level.parse).toEqual('function');
					expect(typeof level.network).toEqual('function');
					
					ran = true;
				});//instanceof thorny
			});
			waits(200);
			runs(function () {
				expect(ran).toBeTruthy();
			});
		});//it should have the following functions
		
		describe('the parse function', function () {
			it('should have the following functions', function () {
				var ran = false;
				runs(function () {
					require('thorny/base')('./config/default.json')(function ($) {
						$.openFile('./content/levels/room.json', function (data) {
							data = $.json.parse(data);
							var 
								level = $.level(),
								dataType = level.dataType(data.type),
								parsed = level.parse(data, dataType);
							
							// collection
							expect(typeof parsed.iterator).toEqual('function');
							expect(typeof parsed.push).toEqual('function');
							expect(typeof parsed.remove).toEqual('function');
							expect(typeof parsed.search).toEqual('function');
							
							// node
							expect(typeof parsed.isNode).toEqual('function');
							expect(typeof parsed.getId).toEqual('function');
							expect(typeof parsed.addNeighbour).toEqual('function');
							expect(typeof parsed.getNeightbours).toEqual('function');
							
							// vector
							expect(typeof parsed.getX).toEqual('function');
							expect(typeof parsed.getY).toEqual('function');
							expect(typeof parsed.getSimpleCoords).toEqual('function');
							expect(typeof parsed.getIntegerCoords).toEqual('function');
							expect(typeof parsed.normalize).toEqual('function');
							expect(typeof parsed.add).toEqual('function');
							expect(typeof parsed.sub).toEqual('function');
							expect(typeof parsed.translate).toEqual('function');
							expect(typeof parsed.cross).toEqual('function');
							expect(typeof parsed.dot).toEqual('function');
							expect(typeof parsed.magnitude).toEqual('function');
							expect(typeof parsed.distance).toEqual('function');
							expect(typeof parsed.sameAs).toEqual('function');
							expect(typeof parsed.rotate).toEqual('function');
							expect(typeof parsed.angle).toEqual('function');
							expect(typeof parsed.rotateToFace).toEqual('function');
							expect(typeof parsed.toRadians).toEqual('function');
							expect(typeof parsed.clone).toEqual('function');
							
							// level
							expect(typeof parsed.getWidth).toEqual('function');
							expect(typeof parsed.getHeight).toEqual('function');
							expect(typeof parsed.loadedLevelType).toEqual('string');
							expect(parsed.loadedLevelType).toEqual('2d mesh');
							
							ran = true;
						});
					});//instanceof thorny
				});
				waits(200);
				runs(function () {
					expect(ran).toBeTruthy();
				});
			});//it should have the following functions
			
			describe('under normal usage', function () {
				it('should process a json file into a collection', function () {
					var ran = false;
					runs(function () {
						require('thorny/base')('./config/default.json')(function ($) {
							$.openFile('./thorny-spec-demo/files/level/poly.json', function (data) {
								data = $.json.parse(data);
								var 
									level = $.level(),
									dataType = level.dataType(data.type),
									parsed = level.parse(data, dataType),
									expectedVector2s = [
										[
											[0, 0],
											[100, 0],
											[0, 100]
										],
										[
											[0, 100],
											[100, 0],
											[100, 100]
										],
										[
											[0, 100],
											[100, 100],
											[50, 150]
										]
									],
									item,		// Will temporerially contain each of the three items, one at a time.
									counter = 0,// Used to count how many items we find
									vector2s,	// Will contains vector2s
									iterator = parsed.iterator();
								
								
								// Loop over each of the items within the collection.
								while ((item = iterator.step().node)) {
									expect(typeof item).toEqual('object');
									expect(typeof item.getVector2s).toEqual('function');

									vector2s = item.getVector2s();
									expect(vector2s.length).toEqual(3);
									
									expect(vector2s[0].getSimpleCoords()).toEqual(expectedVector2s[counter][0]);
									expect(vector2s[1].getSimpleCoords()).toEqual(expectedVector2s[counter][1]);
									expect(vector2s[2].getSimpleCoords()).toEqual(expectedVector2s[counter][2]);

									counter += 1;
								}

								expect(counter).toEqual(3);
								
								ran = true;
							});
						});//instanceof thorny
					});
					waits(200);
					runs(function () {
						expect(ran).toBeTruthy();
					});
				});//it should process a json file into a collection
			});// desc under normal usage
		});// desc the parse function
		
		describe('the network function', function () {
			it('should have the following functions', function () {
				var ran = false;
				runs(function () {
					require('thorny/base')('./config/default.json')(function ($) {
						$.openFile('./thorny-spec-demo/files/level/poly.json', function (data) {
							data = $.json.parse(data);
							var 
								level = $.level(),
								dataType = level.dataType(data.type),
								parsed = level.parse(data, dataType),
								networked = level.network(parsed, dataType);
							
							// collection
							expect(typeof networked.iterator).toEqual('function');
							expect(typeof networked.push).toEqual('function');
							expect(typeof networked.remove).toEqual('function');
							expect(typeof networked.search).toEqual('function');
							
							// node
							expect(typeof networked.isNode).toEqual('function');
							expect(typeof networked.getId).toEqual('function');
							expect(typeof networked.addNeighbour).toEqual('function');
							expect(typeof networked.getNeightbours).toEqual('function');
							
							// vector
							expect(typeof networked.getX).toEqual('function');
							expect(typeof networked.getY).toEqual('function');
							expect(typeof networked.getSimpleCoords).toEqual('function');
							expect(typeof networked.getIntegerCoords).toEqual('function');
							expect(typeof networked.normalize).toEqual('function');
							expect(typeof networked.add).toEqual('function');
							expect(typeof networked.sub).toEqual('function');
							expect(typeof networked.translate).toEqual('function');
							expect(typeof networked.cross).toEqual('function');
							expect(typeof networked.dot).toEqual('function');
							expect(typeof networked.magnitude).toEqual('function');
							expect(typeof networked.distance).toEqual('function');
							expect(typeof networked.sameAs).toEqual('function');
							expect(typeof networked.rotate).toEqual('function');
							expect(typeof networked.angle).toEqual('function');
							expect(typeof networked.rotateToFace).toEqual('function');
							expect(typeof networked.toRadians).toEqual('function');
							expect(typeof networked.clone).toEqual('function');
							
							// level
							expect(typeof networked.getWidth).toEqual('function');
							expect(networked.getWidth()).toEqual(100);
							expect(typeof networked.getHeight).toEqual('function');
							expect(networked.getHeight()).toEqual(160);
							expect(typeof networked.loadedLevelType).toEqual('string');
							expect(networked.loadedLevelType).toEqual('2d mesh');
							
							ran = true;
						});
					});//instanceof thorny
				});
				waits(200);
				runs(function () {
					expect(ran).toBeTruthy();
				});
			});//it should have the following functions
			
			describe('under normal usage', function () {
				it('should process a node-collection into a network', function () {
					var ran = false;
					runs(function () {
						require('thorny/base')('./config/default.json')(function ($) {
							$.openFile('./thorny-spec-demo/files/level/poly.json', function (data) {
								data = $.json.parse(data);
								var 
									level = $.level(),
									dataType = level.dataType(data.type),
									parsed = level.parse(data, dataType),
									networked = level.network(parsed, dataType),
									iterator = networked.iterator();
								
								// Makesure we have the right number of networks
								iterator.rewind();
								expect(iterator.step().node.getNeightbours().getLength())
									.toEqual(1);
								expect(iterator.step().node.getNeightbours().getLength())
									.toEqual(2);
								expect(iterator.step().node.getNeightbours().getLength())
									.toEqual(1);
								expect(iterator.step())
									.toBeFalsy();


								// The first node should network to the second
								iterator.rewind();
								neightbours = iterator.step().node.getNeightbours();
								vector2s = neightbours.step().node.getVector2s();
								expect(vector2s[0].getSimpleCoords()).toEqual([0, 100]);
								expect(vector2s[1].getSimpleCoords()).toEqual([100, 0]);
								expect(vector2s[2].getSimpleCoords()).toEqual([100, 100]);

								// The second node should network to the first and third
								neightbours = iterator.step().node.getNeightbours();
								vector2s = neightbours.step().node.getVector2s();
								expect(vector2s[0].getSimpleCoords()).toEqual([0, 0]);
								expect(vector2s[1].getSimpleCoords()).toEqual([100, 0]);
								expect(vector2s[2].getSimpleCoords()).toEqual([0, 100]);
								vector2s = neightbours.step().node.getVector2s();
								expect(vector2s[0].getSimpleCoords()).toEqual([0, 100]);
								expect(vector2s[1].getSimpleCoords()).toEqual([100, 100]);
								expect(vector2s[2].getSimpleCoords()).toEqual([50, 150]);

								// The third node should network to the second
								neightbours = iterator.step().node.getNeightbours();
								vector2s = neightbours.step().node.getVector2s();
								expect(vector2s[0].getSimpleCoords()).toEqual([0, 100]);
								expect(vector2s[1].getSimpleCoords()).toEqual([100, 0]);
								expect(vector2s[2].getSimpleCoords()).toEqual([100, 100]);
								
								ran = true;
							});
						});//instanceof thorny
					});
					waits(200);
					runs(function () {
						expect(ran).toBeTruthy();
					});
				});//it should process a node-collection into a network
				
				it('should correctly set the distance between nodes', function () {
					var ran = false;
					runs(function () {
						require('thorny/base')('./config/default.json')(function ($) {
							$.openFile('./thorny-spec-demo/files/level/poly.json', function (data) {
								data = $.json.parse(data);
								var 
									level = $.level(),
									dataType = level.dataType(data.type),
									parsed = level.parse(data, dataType),
									networked = level.network(parsed, dataType),
									iterator = networked.iterator();
								
								// The first node should network to the second
								iterator.rewind();
								neightbours = iterator.current().node.getNeightbours();
								expect(parseInt(neightbours.step().details.distanceTo, 10))
									.toEqual(47);

								iterator.next();
								neightbours = iterator.current().node.getNeightbours();
								expect(parseInt(neightbours.step().details.distanceTo, 10))
									.toEqual(47);
								expect(parseInt(neightbours.step().details.distanceTo, 10))
									.toEqual(52);

								iterator.next();
								neightbours = iterator.current().node.getNeightbours();
								expect(parseInt(neightbours.step().details.distanceTo, 10))
									.toEqual(52);
								
								ran = true;
							});
						});//instanceof thorny
					});
					waits(200);
					runs(function () {
						expect(ran).toBeTruthy();
					});
				});//it should correctly set the distance between nodes
			});// desc under normal usage
		});// desc the network function
	});// the 2d mesh level format
}());