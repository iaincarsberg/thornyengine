/*global console window describe xdescribe it expect runs waits*/
(function () {
	require.paths.unshift(__dirname + '/../');
	
	require('thorny/base')('./config/default.json')(function ($) {
		describe('a poly2', function () {
			it('should contain the following functions', function () {
				var 
					vector2 = $('thorny math vector2'),
					poly2 = $('thorny math poly2');

				expect(typeof poly2.factory).toEqual('function');
				expect(typeof poly2.findAngles).toEqual('function');
				expect(typeof poly2.findDistanceFromLineSegment).toEqual('function');

				describe('a poly2 factory', function () {
					it('should contain the following functions', function () {
						var 
							v1 = vector2.factory(0, 0),
							v2 = vector2.factory(0, 100),
							v3 = vector2.factory(100, 0),
							instance = poly2.factory(v1, v2, v3);

						// Node stuff, makes sure we're extending the core/node
						// object correctly.
						expect(typeof instance.isNode).toEqual('function');
						expect(typeof instance.getId).toEqual('function');
						expect(typeof instance.addNeighbour).toEqual('function');
						expect(typeof instance.getNeightbours).toEqual('function');

						// Poly2 stuff
						expect(typeof instance.getVector2s).toEqual('function');
						describe('getVector2s', function () {
							it('should return the vector2s within the poly2', function () {
								var 
									v1 = vector2.factory(0, 0),
									v2 = vector2.factory(0, 100),
									v3 = vector2.factory(100, 0),
									vector2s = poly2.factory(v1, v2, v3)
										.getVector2s();

								// Makesure the look right
								expect(vector2s[0].getSimpleCoords())
									.toEqual(v1.getSimpleCoords());
								expect(vector2s[1].getSimpleCoords())
									.toEqual(v2.getSimpleCoords());
								expect(vector2s[2].getSimpleCoords())
									.toEqual(v3.getSimpleCoords());

								vector2s[0] = vector2.factory(50, 50);
								vector2s[1] = vector2.factory(50, 50);
								vector2s[2] = vector2.factory(50, 50);

								// Refresh the vector2s
								vector2s = poly2.factory(v1, v2, v3)
									.getVector2s();

								// Makesure they are still different
								expect(vector2s[0].getSimpleCoords())
									.toEqual(v1.getSimpleCoords());
								expect(vector2s[1].getSimpleCoords())
									.toEqual(v2.getSimpleCoords());
								expect(vector2s[2].getSimpleCoords())
									.toEqual(v3.getSimpleCoords());
							});
						});//getVector2s

						expect(typeof instance.getMidpoint).toEqual('function');
						describe('getMidpoint', function () {
							it('should return the midpoint of a poly', function () {
								var 
									v1 = vector2.factory(0, 0),
									v2 = vector2.factory(0, 100),
									v3 = vector2.factory(100, 0),
									poly = poly2.factory(v1, v2, v3);

								expect(poly.getMidpoint().getIntegerCoords()).toEqual([33, 33]);
							});
						});//getMidpoint

						expect(typeof instance.sharesEdge).toEqual('function');
						describe('sharesEdge', function () {
							it('should detect a sharded edge', function () {
								var 
									v1 = vector2.factory(0, 0),
									v2 = vector2.factory(0, 100),
									v3 = vector2.factory(100, 0),
									v4 = vector2.factory(100, 100),
									v5 = vector2.factory(150, 100),
									p1 = poly2.factory(v1, v2, v3),
									p2 = poly2.factory(v2, v3, v4),
									p3 = poly2.factory(v3, v4, v5);

								expect(p1.sharesEdge(p2)).toBeTruthy();
								expect(p2.sharesEdge(p1)).toBeTruthy();
								expect(p2.sharesEdge(p3)).toBeTruthy();
								expect(p3.sharesEdge(p2)).toBeTruthy();
							});

							it("shouldn't detect a shared edge", function () {
								var 
									v1 = vector2.factory(0, 0),
									v2 = vector2.factory(0, 100),
									v3 = vector2.factory(100, 0),
									v4 = vector2.factory(100, 100),
									v5 = vector2.factory(150, 100),
									p1 = poly2.factory(v1, v2, v3),
									p2 = poly2.factory(v2, v3, v4),
									p3 = poly2.factory(v3, v4, v5);

								expect(p1.sharesEdge(p3)).toBeFalsy();
							});
						});//sharesEdge

						expect(typeof instance.isVector2Internal).toEqual('function');
						describe('isVector2Internal', function () {
							it('should detect is a vector2 is within a poly', function () {
								var 
									v1 = vector2.factory(0, 0),
									v2 = vector2.factory(0, 100),
									v3 = vector2.factory(100, 0),
									ps = [
										poly2.factory(v1, v2, v3),
										poly2.factory(v2, v3, v1),
										poly2.factory(v3, v1, v2),
										poly2.factory(v3, v2, v1),
										poly2.factory(v2, v1, v3),
										poly2.factory(v1, v3, v2)
									],
									counter = 0,
									i,	// Used for loop control
									ii;	// Used for loop delimiting

								for (i = 0, ii = ps.length; i < ii; i += 1) {
									expect(ps[i].isVector2Internal(vector2.factory(0, 0))).toBeTruthy();

									expect(ps[i].isVector2Internal(vector2.factory(0, 100))).toBeTruthy();
									expect(ps[i].isVector2Internal(vector2.factory(100, 0))).toBeTruthy();
									expect(ps[i].isVector2Internal(vector2.factory(40, 40))).toBeTruthy();
									expect(ps[i].isVector2Internal(vector2.factory(50, 0))).toBeTruthy();
									expect(ps[i].isVector2Internal(vector2.factory(0, 50))).toBeTruthy();
									expect(ps[i].isVector2Internal(vector2.factory(50, 50))).toBeTruthy();

									expect(ps[i].isVector2Internal(vector2.factory(50.00001, 50.00001))).toBeFalsy();
									expect(ps[i].isVector2Internal(vector2.factory(101, 0))).toBeFalsy();
									expect(ps[i].isVector2Internal(vector2.factory(0, 101))).toBeFalsy();
									expect(ps[i].isVector2Internal(vector2.factory(-1, -1))).toBeFalsy();
									expect(ps[i].isVector2Internal(vector2.factory(-1, 0))).toBeFalsy();
									expect(ps[i].isVector2Internal(vector2.factory(0, -1))).toBeFalsy();

									counter += 1;
								}

								//expect(counter).toEqual(ps.length);
							});
						});//isVector2Internal

						expect(typeof instance.uncommonVector2).toEqual('function');
						describe('uncommonVector2', function () {
							it('should find the uncommon point in a poly', function () {
								var 
									v1 = vector2.factory(0, 0),
									v2 = vector2.factory(0, 100),
									v3 = vector2.factory(100, 0),
									ps = [
										poly2.factory(v1, v2, v3),
										poly2.factory(v2, v3, v1),
										poly2.factory(v3, v1, v2),
										poly2.factory(v3, v2, v1),
										poly2.factory(v2, v1, v3),
										poly2.factory(v1, v3, v2)
									],
									counter = 0,
									i,	// Used for loop control
									ii;	// Used for loop delimiting

								// Loop over the permutations of possible poly2s
								for (i = 0, ii = ps.length; i < ii; i += 1) {
									expect(ps[i].uncommonVector2([v2, v3]))
										.toEqual(v1);
								}
								for (i = 0, ii = ps.length; i < ii; i += 1) {
									expect(ps[i].uncommonVector2([v1, v3]))
										.toEqual(v2);
								}
								for (i = 0, ii = ps.length; i < ii; i += 1) {
									expect(ps[i].uncommonVector2([v1, v2]))
										.toEqual(v3);
								}
							});//it
						});//uncommonVector2
					});//it
				});//desc factory

				describe('findAngles', function () {
					it('should find the internal angels in a poly2', function () {
						//console.log('TODO - write specs for findAngles');
					});
				});//desc poly2.findAngles

				describe('findDistanceFromLineSegment', function () {
					it('should find the distance from a line segment', function () {
						//console.log('TODO - write specs for findDistanceFromLineSegment');
					});
				});//desc poly2.findDistanceFromLineSegment
			});
		});// desc a poly2
	});//instanceof thorny
}());