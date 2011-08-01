/*global window console*/
(function (module) {
	/**
	 * Contains the instance of the poly2, this ensures each poly within the
	 * system has a unique id.
	 * @var int instance
	 */
	var instance = 0;
	
	// Exposes the a creation method to the outside world.
	module.exports = function ($) {
		var raw_poly2 = {
			/**
			 * Used to create a new polygon, its common parse no params, then call 
			 * setVertex to set the internal state.
			 * @param vector2|undefined v1 Contains a vector
			 * @param vector2|undefined v2 Contains a vector
			 * @param vector2|undefined v3 Contains a vector
			 * @return object Containing a polygone
			 */
			factory: function (v1, v2, v3) {
				var
					midpoint = $('thorny level node').factory(
						$('thorny math vector2')
							.centroid(v1, v2, v3),
						'poly2',
						instance += 1
					);
				
				midpoint.type = 'poly2';
				
				/**
				 * Used to access the raw fectors witin the node.
				 * We can directly return references to the vector2s
				 * as the vector2s expose no way to alter there 
				 * internal value.
				 * @param void
				 * @return array Contains the raw polys nodes
				 */
				midpoint.getVector2s = function () {
					return [
						v1,
						v2,
						v3
					];
				};
				
				/**
				 * Used to get the midpoint of a poly.
				 * We can directly return references to the midpoint
				 * as the vector2 exposes no way to alter the
				 * internal value.
				 * @param void
				 * @return vector2 Containing the midpoint of the poly2
				 */
				midpoint.getMidpoint = function () {
					return midpoint;
				};
				
				/**
				 * Used to see if two polys share a common edge.
				 * @param poly2 poly2 Contains a remove poly
				 * @return boolean true is edge is shared
				 */
				midpoint.sharesEdge = function (poly2) {
					if (this.sameAs(poly2)) {
						return false;
					}
					
					var
						common = [],
						local = this.getVector2s(),
						remote = poly2.getVector2s(),
						i,	// Used for loop control
						ii,	// Used for loop delimiting
						j,	// Used for loop control
						jj;	// Used for loop delimiting

					for (i = 0, ii = local.length; i < ii; i += 1) {
						for (j = 0, jj = remote.length; j < jj; j += 1) {
							if (local[i].sameAs(remote[j])) {
								common.push(local[i]);
							}
						}
					}
					
					if (common.length === 2) {
						return common;
					}
					
					return false;
				};
				
				/**
				 * Used to find the uncommonVector2 in a poly
				 * @param array Contains an array of vector2s that make up an 
				 * edge in this poly2
				 * @return object Containing a vector2
				 */
				midpoint.uncommonVector2 = function (edge) {
					var 
						v2s = this.getVector2s(),
						isUncommon,
						i,	// Used for loop control
						ii,	// Used for loop delimiting
						j,	// Used for loop control
						jj;	// Used for loop delimiting
					
					// Loop over all of the nodes vector2s
					for (i = 0, ii = v2s.length; i < ii; i += 1) {
						isUncommon = true;
						
						// Loop over the parsed edge
						for (j = 0, jj = edge.length; j < jj; j += 1) {
							// If the vector2 is in the edge then its not the
							// uncommon point.
							if (v2s[i].sameAs(edge[j])) {
								isUncommon = false;
							}
						}
						
						// Return the uncommon vector2
						if (isUncommon) {
							return v2s[i];
						}
					}
					
					// Return false encase there is no uncommon point.
					return false;
				};
				
				/**
				 * Used to see if a point is within this shape.
				 * @param object point Contains a vector2
				 * @return boolean
				 * @url http://mathworld.wolfram.com/TriangleInterior.html
				 * @note thanks to footyfish and andrewjbaker for spending a
				 * lonely wednesday everning in april helping me get this 
				 * working right.
				 */
				midpoint.isVector2Internal = function (point) {
					if (point.sameAs(v1) || point.sameAs(v2) || point.sameAs(v3)) {
						return true;
					}
					
					var
						u = v2.sub(v1),
						w = v3.sub(v1),
						a = (point.cross(w) - v1.cross(w)) / u.cross(w),
						b = -(point.cross(u) - v1.cross(u)) / u.cross(w),
						c = a + b;
					
					if ((a >= 0) && (b >= 0) && (c <= 1)) {
						return true;
					}
					
					return false;
				};
				
				return midpoint;
			},//factory
			
			/**
			 * Used to find the internal angles within a poly
			 * @param object v1 Contains a vector2
			 * @param object v2 Contains a vector2
			 * @param object v3 Contains a vector2
			 * @return array Containing all internal angles
			 */
			findAngles: function (v1, v2, v3) {
				var
					a = v1.distance(v2),
					b = v2.distance(v3),
					c = v3.distance(v1);

				return [
					Math.acos((a * a + c * c - b * b) / (2 * a * c)),
					Math.acos((b * b + a * a - c * c) / (2 * b * a)),
					Math.acos((c * c + b * b - a * a) / (2 * c * b))
				];
			},//findAngles
			
			/**
			 * Used to find the distance from the line-segment.
			 * @param array angles Contains all three internal angles of in the poly
			 * @param object goal Contains the target location the actor would like 
			 *        to move to.
			 * @param object edge1 Contains one of the two vectors that makes up the edge
			 * @param object edge2 Contains the other vector that makes up the edge
			 * @return double Containing the distance between the actor and edge
			 */
			findDistanceFromLineSegment: function (angles, goal, edge1, edge2) {
				var
					e1g = edge1.distance(goal),
					e2g = edge2.distance(goal),
					insideProjection = true,
					distance;

				// Check to makesure the line segment is within the projection
				// of the line.
				if (angles[0] > 1.5707963267948966 || angles[1] > 1.5707963267948966) {
					insideProjection = false;
					if (e1g > e2g) {
						distance = e2g;
					} else {
						distance = e1g;
					}

				} else {
					distance = Math.sin(angles[0]) * e1g;
				}
				
				return {
					distance: distance,
					insideProjection: insideProjection
				};
			},//findDistanceFromLineSegment
		};
		
		return raw_poly2;
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny/common/math/poly2')));