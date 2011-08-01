/*global console window describe xdescribe it expect runs waits*/
(function () {
	require.paths.unshift(__dirname + '/../../../');
	require('thorny/base')('./config/default.json')(function ($) {
		describe('a vector2', function () {
			it('should contain the following functions', function () {
				var vector2 = $('thorny math vector2');
				
				expect(typeof vector2.factory).toEqual('function');
				expect(typeof vector2.centroid).toEqual('function');
				expect(typeof vector2.isLeftOfEdge).toEqual('function');
				expect(typeof vector2.lineIntersection).toEqual('function');
				
				describe('factory', function () {
					it('should expose the following functions', function () {
						var v2 = vector2.factory();
						
						expect(typeof v2.getX).toEqual('function');
						expect(typeof v2.getY).toEqual('function');
						expect(typeof v2.getSimpleCoords).toEqual('function');
						expect(typeof v2.getIntegerCoords).toEqual('function');
						expect(typeof v2.normalize).toEqual('function');
						expect(typeof v2.add).toEqual('function');
						expect(typeof v2.sub).toEqual('function');
						expect(typeof v2.translate).toEqual('function');
						expect(typeof v2.cross).toEqual('function');
						expect(typeof v2.dot).toEqual('function');
						expect(typeof v2.magnitude).toEqual('function');
						expect(typeof v2.distance).toEqual('function');
						expect(typeof v2.sameAs).toEqual('function');
						expect(typeof v2.rotate).toEqual('function');
						expect(typeof v2.angle).toEqual('function');
						expect(typeof v2.rotateToFace).toEqual('function');
						expect(typeof v2.toRadians).toEqual('function');
						expect(typeof v2.clone).toEqual('function');
						
						describe('getX', function () {
							it('should correctly expose the x value', function () {
								var 
									v1 = vector2.factory(10, 0),
									v2 = vector2.factory(-99, 0),
									v3 = vector2.factory(1234567890, 0),
									v4 = vector2.factory(-1234567890, 0),
									v5 = vector2.factory(0, 0);

								expect(v1.getX()).toEqual(10);
								expect(v2.getX()).toEqual(-99);
								expect(v3.getX()).toEqual(1234567890);
								expect(v4.getX()).toEqual(-1234567890);
								expect(v5.getX()).toEqual(0);
							});
						});

						describe('getY', function () {
							it('should correctly expose the y value', function () {
								var
									v1 = vector2.factory(0, 10),
									v2 = vector2.factory(0, -99),
									v3 = vector2.factory(0, 1234567890),
									v4 = vector2.factory(0, -1234567890),
									v5 = vector2.factory(0, 0);

								expect(v1.getY()).toEqual(10);
								expect(v2.getY()).toEqual(-99);
								expect(v3.getY()).toEqual(1234567890);
								expect(v4.getY()).toEqual(-1234567890);
								expect(v5.getY()).toEqual(0);
							});
						});

						describe('getSimpleCoords', function () {
							it('should expose an array containing the x/y values stored within the vector2', function () {
								var
									v1 = vector2.factory(0, 0),
									v2 = vector2.factory(1234567890, -1234567890),
									v3 = vector2.factory(0.00000001, 10.99999999),
									v4 = vector2.factory(123.45, 678.90),
									v5 = vector2.factory(-1, -1);

								expect(v1.getSimpleCoords()).toEqual([0, 0]);
								expect(v2.getSimpleCoords()).toEqual([1234567890, -1234567890]);
								expect(v3.getSimpleCoords()).toEqual([0.00000001, 10.99999999]);
								expect(v4.getSimpleCoords()).toEqual([123.45, 678.90]);
								expect(v5.getSimpleCoords()).toEqual([-1, -1]);
							});
						});

						describe('getIntegerCoords', function () {
							it('should convert the decimal point accurate vector into integers', function () {
								expect(vector2.factory(10, 10).getIntegerCoords()).toEqual([10, 10]);
								expect(vector2.factory(0.930493, 0.12534553).getIntegerCoords()).toEqual([1, 0]);
								expect(vector2.factory(100.34344, 9.9999999).getIntegerCoords()).toEqual([100, 10]);
								expect(vector2.factory(5.0000001, 45.43553).getIntegerCoords()).toEqual([5, 45]);
								expect(vector2.factory(3857.343, 74746.1).getIntegerCoords()).toEqual([3857, 74746]);
							});
						});

						describe('normalize', function () {
							it('should normalise a vector', function () {
								expect(vector2.factory(10, 0).normalize().getSimpleCoords()).toEqual([1, 0]);
								expect(vector2.factory(0, 10).normalize().getSimpleCoords()).toEqual([0, 1]);
								expect(vector2.factory(-10, 0).normalize().getSimpleCoords()).toEqual([-1, 0]);
								expect(vector2.factory(0, -10).normalize().getSimpleCoords()).toEqual([0, -1]);

								expect(vector2.factory(10, 10).normalize().getSimpleCoords()).toEqual([0.7071067811865475, 0.7071067811865475]);
								expect(vector2.factory(10, -10).normalize().getSimpleCoords()).toEqual([0.7071067811865475, -0.7071067811865475]);
								expect(vector2.factory(-10, 10).normalize().getSimpleCoords()).toEqual([-0.7071067811865475, 0.7071067811865475]);
								expect(vector2.factory(-10, -10).normalize().getSimpleCoords()).toEqual([-0.7071067811865475, -0.7071067811865475]);
							});
						});

						describe('add', function () {
							it('should add two vectors together resulting in a 3rd', function () {
								expect(
									vector2.factory(0, 0)
										.add(
											vector2.factory(10, 10)
											)
										.getSimpleCoords()
									).toEqual([10, 10]);

								expect(
									vector2.factory(-13, 13)
										.add(
											vector2.factory(13, -13)
											)
										.getSimpleCoords()
									).toEqual([0, 0]);

								expect(
									vector2.factory(99, 43)
										.add(
											vector2.factory(101, -13)
											)
										.getSimpleCoords()
									).toEqual([200, 30]);

								expect(
									vector2.factory(17, 9)
										.add(
											vector2.factory(-83, -13)
											)
										.getSimpleCoords()
									).toEqual([-66, -4]);

								expect(
									vector2.factory(17, 9)
										.add(
											vector2.factory(45, 2)
											)
										.getSimpleCoords()
									).toEqual([62, 11]);
							});
						});

						describe('sub', function () {
							it('should subtract two vectors from one another and return a third', function () {
								expect(
									vector2.factory(0, 0)
										.sub(
											vector2.factory(10, 10)
											)
										.getSimpleCoords()
									).toEqual([-10, -10]);

								expect(
									vector2.factory(20, 10)
										.sub(
											vector2.factory(10, 10)
											)
										.getSimpleCoords()
									).toEqual([10, 0]);

								expect(
									vector2.factory(-99, 50)
										.sub(
											vector2.factory(45, 10)
											)
										.getSimpleCoords()
									).toEqual([-144, 40]);

								expect(
									vector2.factory(56, -1)
										.sub(
											vector2.factory(-57, 1)
											)
										.getSimpleCoords()
									).toEqual([113, -2]);

								expect(
									vector2.factory(0, 0)
										.sub(
											vector2.factory(0, 0)
											)
										.getSimpleCoords()
									).toEqual([0, 0]);
							});
						});

						describe('translate', function () {
							it('should move a vector by a set amount', function () {
								expect(
									vector2.factory(0, 0)
										.translate(
											vector2.factory(1, 0),
											10
											)
										.getSimpleCoords()
									).toEqual([10, 0]);

								expect(
									vector2.factory(60, 0)
										.translate(
											vector2.factory(1, 1),
											10
											)
										.getSimpleCoords()
									).toEqual([67.07106781186548, 7.071067811865475]);

								expect(
									vector2.factory(0, 0)
										.translate(
											vector2.factory(-1, 1),
											10
											)
										.getSimpleCoords()
									).toEqual([-7.071067811865475, 7.071067811865475]);
							});
						});

						describe('cross', function () {
							it('should return the crossed value of a vector', function () {
								expect(
									vector2.factory(10, 10)
										.cross(
											vector2.factory(10, 10)
											)
									).toEqual(0);

								expect(
									vector2.factory(10, 10)
										.cross(
											vector2.factory(0, 10)
											)
									).toEqual(100);

								expect(
									vector2.factory(0, 10)
										.cross(
											vector2.factory(10, 0)
											)
									).toEqual(-100);

								expect(
									vector2.factory(-10, 10)
										.cross(
											vector2.factory(10, 10)
											)
									).toEqual(-200);

								expect(
									vector2.factory(0, 0)
										.cross(
											vector2.factory(10, 10)
											)
									).toEqual(0);
							});
						});

						describe('dot', function () {
							it('should find the dot product of two vectors', function () {
								expect(
									vector2.factory(0, 0)
										.dot(
											vector2.factory(0, 0)
											)
									).toEqual(0);

								expect(
									vector2.factory(10, 10)
										.dot(
											vector2.factory(10, 10)
											)
									).toEqual(200);

								expect(
									vector2.factory(10, 10)
										.dot(
											vector2.factory(0, 10)
											)
									).toEqual(100);

								expect(
									vector2.factory(7, 8)
										.dot(
											vector2.factory(3, -3)
											)
									).toEqual(-3);
							});
						});

						describe('magnitude', function () {
							it('should return the magnitude of a vector', function () {
								expect(
									vector2.factory(10, 10)
										.magnitude()
									).toEqual(Math.sqrt(200));

								expect(
									vector2.factory(30, 5)
										.magnitude()
									).toEqual(Math.sqrt(925));
							});
						});

						describe('distance', function () {
							it('should find the distance between two points', function () {
								expect(
									vector2.factory(0, 0)
										.distance(
											vector2.factory(10, 0)
											)
									).toEqual(10);

								expect(
									vector2.factory(0, 0)
										.distance(
											vector2.factory(10, 10)
											)
									).toEqual(14.142135623730951);

								expect(
									vector2.factory(0, 0)
										.distance(
											vector2.factory(10, -10)
											)
									).toEqual(14.142135623730951);
							});
						});

						describe('sameAs', function () {
							it('should match the internal values within the vector', function () {
								expect(
									vector2.factory(0, 0)
										.sameAs(
											vector2.factory(0, 0)
											)
									).toBeTruthy();

								expect(
									vector2.factory(10, 58)
										.sameAs(
											vector2.factory(10, 58)
											)
									).toBeTruthy();

								expect(
									vector2.factory(0.324567865432345, 45.234565432)
										.sameAs(
											vector2.factory(0.324567865432345, 45.234565432)
											)
									).toBeTruthy();

								expect(
									vector2.factory(1234678432, 567876543)
										.sameAs(
											vector2.factory(1234678432, 567876543)
											)
									).toBeTruthy();
							});

							it('shouldnt match the following', function () {
								expect(
									vector2.factory(1234678432, 567876543)
										.sameAs(
											vector2.factory(765434567, 435363636)
											)
									).toBeFalsy();

								expect(
									vector2.factory(0.3435263463, 1)
										.sameAs(
											vector2.factory(99, 8)
											)
									).toBeFalsy();

								expect(
									vector2.factory(87628, 7654367.346743)
										.sameAs(
											vector2.factory(0.234567876543212, 34)
											)
									).toBeFalsy();

								expect(
									vector2.factory(45678543, 435.34565432)
										.sameAs(
											vector2.factory(3456.3265, 4567)
											)
									).toBeFalsy();
							});
						});

						describe('rotate', function () {
							it('should allow you to rotate a vector', function () {
								/**
								 * We use translate to give us real world testable
								 * values, then the getIntegerCoords to avoid any
								 * rounding issues.
								 */
								
								expect(
									vector2.factory(0, 0)
										.translate(
											vector2.factory(10, 0).rotate(0 * 0.0174532925),
											10
											)
										.getIntegerCoords()
									).toEqual([10, 0]);

								expect(
									vector2.factory(0, 0)
										.translate(
											vector2.factory(10, 0).rotate(90 * 0.0174532925),
											10
											)
										.getIntegerCoords()
									).toEqual([0, 10]);

								expect(
									vector2.factory(0, 0)
										.translate(
											vector2.factory(10, 0).rotate(180 * 0.0174532925),
											10
											)
										.getIntegerCoords()
									).toEqual([-10, 0]);

								expect(
									vector2.factory(0, 0)
										.translate(
											vector2.factory(10, 0).rotate(270 * 0.0174532925),
											10
											)
										.getIntegerCoords()
									).toEqual([0, -10]);

								expect(
									vector2.factory(0, 0)
										.translate(
											vector2.factory(10, 0).rotate(45 * 0.0174532925),
											10
											)
										.getIntegerCoords()
									).toEqual([7, 7]);
							});
						});

						describe('angle', function () {
							it('should return the angle between two vectors', function () {
								var degRad = Math.PI / 180;

								expect(
									vector2.factory(0, 0)
										.angle(
											vector2.factory(10, 0)
											)
									).toEqual(0 * degRad);

								expect(
									vector2.factory(0, 0)
										.angle(
											vector2.factory(0, 10)
											)
									).toEqual(90 * degRad);

								expect(
									vector2.factory(0, 0)
										.angle(
											vector2.factory(-10, 0)
											)
									).toEqual(180 * degRad);

								// For 270degrees I need to use -90 as the angle
								// function retuns +-0/180
								expect(
									vector2.factory(0, 0)
										.angle(
											vector2.factory(0, -10)
											)
									).toEqual(-90 * degRad);
							});
						});

						describe('rotateToFace', function () {
							it('should rotate a vector so that it faces a specific location', function () {
								expect(
									vector2.factory(0, 0)
										.translate(
											vector2.factory(0, 0).rotateToFace(vector2.factory(1, 0)),
											10
											)
										.getIntegerCoords()
									).toEqual([10, 0]);

								expect(
									vector2.factory(0, 0)
										.translate(
											vector2.factory(0, 0).rotateToFace(vector2.factory(0, 1)),
											10
											)
										.getIntegerCoords()
									).toEqual([0, 10]);

								expect(
									vector2.factory(0, 0)
										.translate(
											vector2.factory(0, 0).rotateToFace(vector2.factory(-1, 0)),
											10
											)
										.getIntegerCoords()
									).toEqual([-10, 0]);

								expect(
									vector2.factory(0, 0)
										.translate(
											vector2.factory(0, 0).rotateToFace(vector2.factory(0, -1)),
											10
											)
										.getIntegerCoords()
									).toEqual([0, -10]);

								expect(
									vector2.factory(0, 0)
										.translate(
											vector2.factory(0, 0).rotateToFace(vector2.factory(1, 1)),
											10
											)
										.getIntegerCoords()
									).toEqual([7, 7]);
							});
						});

						describe('toRadians', function () {
							it('should convert degrees to radians', function () {
								var v2 = vector2.factory,
									degRad = Math.PI / 180;

								expect(vector2.factory(0, 0).toRadians()).toEqual(0 * degRad);	
								expect(vector2.factory(0, 1).toRadians()).toEqual(90 * degRad);
								expect(vector2.factory(-1, 0).toRadians()).toEqual(180 * degRad);
								expect(vector2.factory(0, -1).toRadians()).toEqual(-90 * degRad);
							});
						});

						describe('clone', function () {
							it('should duplicate a vector2 into a new vector2', function () {
								var v1 = vector2.factory(34, 66);

								// v1 will === v1, which is true
								expect(v1).toBe(v1);

								// but a clone of v1 is not === v1
								expect(v1.clone()).toNotBe(v1);

								// Check that the values are the same
								expect(
									v1
										.clone()
										.sameAs(vector2.factory(34, 66))
									).toBeTruthy();
							});
						});
					});// end of exposed functions
				});// end of factory
				
				describe('lineIntersection', function () {
					it('should detect a valid intersection between two lines in a cross', function () {
						var
							v1 = vector2.factory(0, 0),
							v2 = vector2.factory(10, 10),
							v3 = vector2.factory(10, 0),
							v4 = vector2.factory(0, 10);

						expect(
							vector2.lineIntersection(v1, v2, v3, v4)
								.getSimpleCoords()
							).toEqual([5, 5]);
					});

					it('should detect a valid intersection between two lines in a cross', function () {
						var
							v1 = vector2.factory(5, 0),
							v2 = vector2.factory(5, 10),
							v3 = vector2.factory(0, 5),
							v4 = vector2.factory(10, 5);

						expect(
							vector2.lineIntersection(v1, v2, v3, v4)
								.getSimpleCoords()
							).toEqual([5, 5]);
					});

					it("should't detect any intersection", function () {
						var
							v1 = vector2.factory(0, 0),
							v2 = vector2.factory(0, 10),
							v3 = vector2.factory(10, 0),
							v4 = vector2.factory(10, 10);

						expect(
							vector2.lineIntersection(v1, v2, v3, v4)
							).toBeFalsy();
					});

					it("should't detect any intersection", function () {
						var
							v1 = vector2.factory(0, 0),
							v2 = vector2.factory(10, 10),
							v3 = vector2.factory(10, 0),
							v4 = vector2.factory(5.1, 4.9);

						expect(
							vector2.lineIntersection(v1, v2, v3, v4)
							).toBeFalsy();
					});
				});// endof lineIntersection
				
				describe('centroid', function () {
					it('should find the centroid in a simple 2d polygone', function () {
						var
							v1 = vector2.factory(0, 0),
							v2 = vector2.factory(10, 0),
							v3 = vector2.factory(10, 10);

						expect(
							vector2.centroid(v1, v2, v3)
								.getIntegerCoords()
							).toEqual([7, 3]);
					});
				});// endof centroid
				
				describe('isLeftOfEdge', function () {
					it('should determine which side of a line a point is', function () {
						expect(
							vector2
								.isLeftOfEdge(
									vector2.factory(10, 1), 
									vector2.factory(20, 0), 
									vector2.factory(0, 0)
									)
							).toBeTruthy();
						
						expect(
							vector2
								.isLeftOfEdge(
									vector2.factory(10, -1), 
									vector2.factory(20, 0), 
									vector2.factory(0, 0)
									)
							).toBeFalsy();

						expect(
							vector2
								.isLeftOfEdge(
									vector2.factory(11, 10), 
									vector2.factory(10, 20), 
									vector2.factory(10, 0)
									)
							).toBeFalsy();
							
						expect(
							vector2
								.isLeftOfEdge(
									vector2.factory(9, 10), 
									vector2.factory(10, 20), 
									vector2.factory(10, 0)
									)
							).toBeTruthy();
					});
				});// endof isLeftOfEdge
			});// it
		});//a vector2
	});//instanceof thorny
}());