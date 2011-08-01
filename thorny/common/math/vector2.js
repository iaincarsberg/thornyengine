/*global window*/
(function (module) {
	var vector2;
	vector2 = function (x, y) {
		return {
			type: 'vector2',
			
			getX: function () {
				return x;
			},
			getY: function () {
				return y;
			},
			getSimpleCoords: function () {
				return [x, y];
			},
			getIntegerCoords: function () {
				return [Math.round(x), Math.round(y)];
			},

			/**
			 * Used to normalize a vector
			 * @param void
			 * @return vector Containing a normalised version of the vector
			 */
			normalize: function () {
				var dist = Math.sqrt((x * x) + (y * y));
				if (dist > 0) {
					dist = 1 / dist;
				}

				return vector2(
					x * dist,
					y * dist
				);
			},
			
			/**
			 * Used to add two vectors together
			 * @param vector v Containing the vector to add
			 * @return vector Containing the added values
			 */
			add: function (v) {
				return vector2(
					x + v.getX(),
					y + v.getY()
				);
			},

			/**
			 * Used to add two vectors together
			 * @param vector v Containing the vector to add
			 * @return vector Containing the added values
			 */
			sub: function (v) {
				return vector2(
					x - v.getX(),
					y - v.getY()
				);
			},

			/**
			 * Used to translate one vector by another, by a set distance
			 * @param vector Contains the vectors facing
			 * @param double distance Contains now much the actor is to translate
			 * @return void
			 */
			translate: function (facing, distance) {
				var v = facing.normalize();

				return this.add(vector2(
					v.getX() * distance,
					v.getY() * distance
				));
			},

			/**
			 * Used to return the cross product a 2D vector
			 * @param vector v Contains a vector
			 * @return double Containing the cross product
			 */
			cross: function (v) {
				return (x * v.getY()) - (y * v.getX());
			},

			/**
			 * Used to return the dot product a 2D vector
			 * @param vector v Contains a vector
			 * @return double Containing the dot product
			 */
			dot: function (v) {
				return (x * v.getX()) + (y * v.getY());
			},

			/**
			 * Used to find the magnitude of the vector
			 * @param void
			 * @return double Containing the magnitude
			 */
			magnitude: function () {
				return Math.sqrt((x * x) + (y * y));
			},

			/**
			 * Used to find the distance between two vectors.
			 * @param $.thorny.world.vector v Contains a vector
			 * @return double Containing the distance between two vectors
			 */
			distance: function (v) {
				var xx = (v.getX() - x),
					yy = (v.getY() - y);
				return Math.sqrt((xx * xx) + (yy * yy));
			},

			/**
			 * Used to find the angle between two vectors.
			 * @param vector v Contains the vector we want to know the angle 
			 * between.
			 * @return float Containing the angle to a specific vector
			 */
			angle: function (v) {
				return (Math.atan2(v.getY(), v.getX()) - Math.atan2(y, x));
			},

			/**
			 * Used to see if two vectors are the same 
			 * @param vector v Contains another vector to see if they are the same
			 * @return boolean If the parsed param matches true, otherwise false
			 */
			sameAs: function (v) {
				if (x === v.getX() && y === v.getY()) {
					return true;
				}
				return false;
			},

			/**
			 * Used to rotate a normalized vector around a get point.
			 * @param double n Containing the rotation amount
			 * @return vector Containing the rotated form
			 */
			rotate: function (n) {
				var 
					// Normalise the vector
					v = this.normalize(),
					
					// Find the angle
					ca = Math.cos(n),
					sa = Math.sin(n),
					
					// And translate the position.
					xx = v.getX() * ca - v.getY() * sa,
					yy = v.getX() * sa + v.getY() * ca;

				return vector2(xx, yy);
			},

			/**
			 * Used to rotate a normalized vector to face a specific point.
			 * @param vector vector Containing the target vector
			 * @return vector Containing the rotated form
			 */
			rotateToFace: function (vector) {
				var 
					v = this.sub(vector).normalize(),
					
					xx = v.getX() * -1,
					yy = v.getY() * -1;

				return vector2(xx, yy);
			},
			
			/**
			 * Used to convert a vector into an angle in radians
			 * @param void
			 * @return float Containing the angle of the vector in radians
			 */
			toRadians: function () {
				var v = this.normalize();
				return Math.atan2(v.getY(), v.getX());
			},
			
			/**
			 * Used to clone a vector
			 * @param void
			 * @return vector Containing the same coordinates as this
			 */
			clone: function () {
				return vector2(x, y);
			}
		};
	};
	
	// Expose the vector2 object.
	module.exports = function ($) {
		return {
			// Exposes the a creation method to the outside world.
			factory: vector2,

			/**
			 * Used to find an intersection between two points.
			 * @param vector2 
			 * @return obj|false if intersection happened returns array of x/y 
			 * otherwise fales.
			 */
			lineIntersection: function (v1, v2, v3, v4) {
				var 
					bx,
					by, 
					dx, 
					dy,
					b_dot_d_perp,
					cx,
					cy,
					t,
					u;

				bx = v2.getX() - v1.getX();
				by = v2.getY() - v1.getY();
				dx = v4.getX() - v3.getX();
				dy = v4.getY() - v3.getY();

				b_dot_d_perp = bx * dy - by * dx;
				if (b_dot_d_perp === 0) {
					return false;
				}

				cx = v3.getX() - v1.getX();
				cy = v3.getY() - v1.getY();
				t = (cx * dy - cy * dx) / b_dot_d_perp;

				if (t < 0 || t > 1) {
					return false;
				}

				u = (cx * by - cy * bx) / b_dot_d_perp;

				if (u < 0 || u > 1) {
					return false;
				}	

				return vector2(v1.getX() + t * bx, v1.getY() + t * by);
			},

			/**
			 * Used to find the centroid of a poly.
			 * @param vector v2 Contains the second point in a poly
			 * @param vector v3 Contains the third point in a poly
			 * @return vector Containing the centroid of a shape
			 */
			centroid: function (v1, v2, v3) {
				var 
					/**
					 * Used to find the midpoint along an edge of the poly
					 * @param p1 Contains a vector
					 * @param p2 Contains a vector
					 * @return vector Containing a mid point for a poly
					 */
					findEdgeMp = function (p1, p2) {
						return p1.translate(
							p2.sub(p1),
							(p1.distance(p2) / 2)
						);
					},

					mp1 = findEdgeMp(v1, v2),
					mp2 = findEdgeMp(v2, v3);

				return this.lineIntersection(v1, mp2, v3, mp1);
			},

			/**
			 * Used to see if a point is on the left of an edge
			 * @param object point Contains the point being checked
			 * @param object edge1 Contains one of the two vectors that makes up the edge
			 * @param object edge2 Contains the other vector that makes up the edge
			 * @return boolean True if on left, otherwise false
			 */
			isLeftOfEdge: function (point, edge1, edge2) {
				if (
					(edge2.getX() - edge1.getX()) * (point.getY() - edge1.getY()) - 
					(edge2.getY() - edge1.getY()) * (point.getX() - edge1.getX()) > 0
				) {
					return false;
				}
				return true;
			}
		};
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny/common/math/vector2')));