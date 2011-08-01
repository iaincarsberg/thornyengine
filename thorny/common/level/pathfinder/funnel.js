/*global window $ console*/
(function (module, undefined) {
	module.exports = function ($) {
		// Contains a renderer inject function, used for debugging.
		var renderer = false;
		
		return {
			/**
			 * Used to process an array of nodes into a list of points to travel
			 * though the network.
			 * @param object from Contains the from vector2
			 * @param object to Contains the to vector2
			 * @param array route Contains the result of the a* search though 
			 * the network.
			 * @param int radius Contains the radius of the entity moving though
			 * the network.
			 * @return array Containing the path
			 */
			process: function (from, to, route, radius) {
				var
					// Contains the edge of the shape
					edges = this.edgeify(route),
					// Will contain the inwardly projected points of the edge
					points;
				
				if (route.length === 0) {
					return [];
				}
				
				// If there is no radius set, then there is no point projecting 
				// the points inwards.
				if (radius === undefined || radius <= 0) {
					return this.funnel(from, to, edges, edges);
					
				// Otherwise we need to project them.
				} else {
					points = this.pointify(route, edges, radius);
					return this.funnel(from, to, edges, points);
				}
			},
			
			/**
			 * Used to turn the raw a* array into a list of edges.
			 * @param void
			 * @return object Containing functions to edgeify an array
			 */
			edgeify: function (route) {
				/*
				.:NOTE:.
				
				Edgeify works by walking around the parimiter of a complex 
				collection of polygons, and returns an ordered list that 
				details the shape of the collection.
				
				To process this data we take four steps, find the start point
				loop around one side of the shape, then find the end point, then 
				loop back around the other side of the shape.
				*/
				var
					edges = [],
					commonEdge,
					lastVector2,
					closedEdges = {},
					j_v2s,
					k_v2s,
					found,
					i,	// Used for loop control
					ii,	// Used for loop delimiting
					j,	// Used for loop control
					jj,	// Used for loop delimiting
					rj, // Used when mod 3'ing j
					k,	// Used for loop control
					kk,	// Used for loop delimiting
					rk; // Used when mod 3'ing j
				
				// If the route is empty return an empty edge list
				if (route.length === 0) {
					return [];
				
				// If the route has one node then return its vectors
				} else if (route.length === 1) {
					return route[0].getVector2s();
				}
				
				// 1) Find the first point.
				commonEdge = route[0].sharesEdge(route[1]);
				closedEdges[commonEdge[0].getSimpleCoords().concat(commonEdge[1].getSimpleCoords()).join('-')] = true;
				closedEdges[commonEdge[1].getSimpleCoords().concat(commonEdge[0].getSimpleCoords()).join('-')] = true;
				lastVector2 = route[0].uncommonVector2(commonEdge);
				edges.push(
					lastVector2
				);
				
				// 2) Loop over one side of the collection.
				for (i = 1, ii = route.length; i < ii; i += 1) {
					commonEdge = route[i].sharesEdge(route[i - 1]);
					closedEdges[commonEdge[0].getSimpleCoords().concat(commonEdge[1].getSimpleCoords()).join('-')] = true;
					closedEdges[commonEdge[1].getSimpleCoords().concat(commonEdge[0].getSimpleCoords()).join('-')] = true;
					
					// Localise the vectors between the two poly2s
					j_v2s = route[i - 1].getVector2s();
					k_v2s = route[i].getVector2s();
					
					found = false;
					
					for (j = 1, jj = j_v2s.length; j <= jj; j += 1) {
						// Mod 3 as we want to get 0-1, 1-2, 2-0
						rj = j % 3;
						
						// If we've found a solution this itereration don't
						// bother doing anymore checks.
						if (found) {
							continue;
						}
						
						if (closedEdges[j_v2s[rj].getSimpleCoords().concat(j_v2s[j - 1].getSimpleCoords()).join('-')]) {
							continue;
						}
						
						if (! (j_v2s[rj].sameAs(lastVector2) || j_v2s[j - 1].sameAs(lastVector2))) {
							continue;
						}
						
						for (k = 1, kk = k_v2s.length; k <= kk; k += 1) {
							// Mod 3 as we want to get 0-1, 1-2, 2-0
							rk = k % 3;
							
							if (closedEdges[k_v2s[rk].getSimpleCoords().concat(k_v2s[k - 1].getSimpleCoords()).join('-')]) {
								continue;
							}
							
							if (j_v2s[j - 1].sameAs(k_v2s[rk]) || j_v2s[j - 1].sameAs(k_v2s[k - 1])) {
								edges.push(
									j_v2s[j - 1]
								);
								lastVector2 = j_v2s[j - 1];
								found = true;
							} else if (j_v2s[rj].sameAs(k_v2s[rk]) || j_v2s[rj].sameAs(k_v2s[k - 1])) {
								edges.push(
									j_v2s[rj]
								);
								lastVector2 = j_v2s[rj];
								found = true;
							}
						}// for k_v2s
					}// for j_v2s
				}
				
				// 3) Find the opposite to the first point
				commonEdge = route[route.length - 1].sharesEdge(route[route.length - 2]);
				edges.push(
					route[route.length - 1].uncommonVector2(commonEdge)
				);
				
				// 4) Close the edge list.
				for (i = route.length - 1; i >= 1; i -= 1) {
					commonEdge = route[i - 1].sharesEdge(route[i]);
					
					for (j = 0, jj = edges.length; j < jj; j += 1) {
						if (edges[j].sameAs(commonEdge[0])) {
							if (! lastVector2.sameAs(commonEdge[1])) {
								lastVector2 = commonEdge[1];
								edges.push(commonEdge[1]);
							}
							
							break;
						} else if (edges[j].sameAs(commonEdge[1])) {
							if (! lastVector2.sameAs(commonEdge[0])) {
								lastVector2 = commonEdge[0];
								edges.push(commonEdge[0]);
							}
							
							break;
						}
					}
				}
				
				return edges;
			},
			
			/**
			 * Used to project points inward from the edges, allowing entities 
			 * with a radius to move though the network without clipping into
			 * any of the levels edges.
			 * @param arary edges Contains the edges of the processed a* path
			 * @param int radius Contains the radius of the entity moving though
			 * the network. 
			 * @return array of vector2s Which mark the safe interal bounderies
			 * based on the parsed radius.
			 */
			pointify: function (path, edges, radius) {
				var 
					route = [],// Contains the projected path
					edges_length = edges.length,// Contains the length of the edges
					edge1,	// Contains a vector2 in the projected polygone
					edge2,	// Contains a vector2 in the projected polygone
					goal,	// Contains a vector2 in the projected polygone
					i,		// Used for loop control
					ii,		// Used for loop delimiting
					j,		// Used for loop control
					jj,		// Used for loop delimiting
					angles,
					distanceFromLine,
					midpoint,
					intersect,
					goalInPoly2s,
					
					// Used to move the projection inwards or outwards 
					// depending if the interection point is inside one of 
					// the original polys
					intersectDirection,
					
					// Contains the result of Math.PI / 2
					halfPI = 1.5707963267948966;
				
				// Makesure the length is long enough to generate a valid list
				// of projected points.
				if (edges_length < 3) {
					return false;
				}
				
				// Iterate over the edges and project each point inwards.
				for (i = 0, ii = edges.length; i < ii; i += 1) {
					// Find each of the three points used in the projection.
					goal = edges[i];
					
					// Recreate the edge 0.1 away from the goal, this allows
					// the intersect point to always be the right angle away 
					// from a corner.
					edge1 = goal.translate(
						goal.rotateToFace(
							edges[(i + edges_length - 1) % edges_length]
							),
						0.1
						);
					edge2 = goal.translate(
						goal.rotateToFace(
							edges[(i + 1) % edges.length]
							),
						0.1
						);
					
					// If the above doesn't work try this method...
					midpoint = edge1.distance(edge2) / 2;
					
					// Project the intersection along the edge.
					intersect = edge1.translate(
						edge1.rotateToFace(edge2),
						midpoint
						);
					
					// Check to see if the midpoint is in either of the poly2s 
					// that have the goal point as one of its corners.
					intersectDirection = -1;
					for (j = 0, jj = path.length; j < jj; j += 1) {
						if (path[j].isVector2Internal(intersect)) {
							intersectDirection = 1;
							break;
						}
					}
					
					// Add the projected point to the route
					route.push(
						goal.translate(
							goal.rotateToFace(intersect),
							radius * intersectDirection
							)
						);
				}
				
				return route;
			},
			
			/**
			 * Used to process the edges and points into a usable path
			 * @param object from Contains the from vector2
			 * @param object to Contains the to vector2
			 * @param array edges Contains the edges of the a* path
			 * @param array points Contains the inward projected points of the 
			 * a* path
			 * @return array Containing the path through the network
			 */
			funnel: function (from, to, edges, points) {
				var
					size = edges.length,
					nodes = [],
					node = $('thorny level node'),
					v2 = $('thorny math vector2'),
					lineIntersection = $('thorny math vector2')
						.lineIntersection,// Contains the intersection function
					fromV2,
					toV2,
					distance,
					i,	// Used for loop control
					ii,	// Used for loop delimiting
					j,	// Used for loop control
					jj,	// Used for loop delimiting
					
					isValidLink = function (node_from, node_to) {
						var
							intersect,
							rk,
							k,	// Used for loop control
							kk;	// Used for loop delimiting
						
						for (k = 0, kk = size; k < kk; k += 1) {
							rk = (k + 1) % size;
							
							// Check for edge intersections
							if (lineIntersection(node_from, node_to, edges[k], edges[rk]) !== false) {
								return false;
							}
							
							// Check for intersections between the point and the projection
							if (! (i === k  || j === k)) {
								if (lineIntersection(node_from, node_to, points[k], edges[k]) !== false) {
									return false;
								}
							}
						}
						return true;
					};
				
				// Turn the from and to points into a node
				fromV2 = node.factory(from.clone(), 'funnel', 'from');
				toV2 = node.factory(to.clone(), 'funnel', 'to');
				
				// Turn all of the points into a node list
				for (i = 0, ii = size; i < ii; i += 1) {
					nodes.push(
						node.factory(
							points[i].clone(),
							'funnel',
							i
						)
					);
				}
				
				// Create the network links between each of the pointifyed nodes
				for (i = 0, ii = size; i < ii; i += 1) {
					for (j = 0, jj = size; j < jj; j += 1) {
						if (i === j) {
							continue;
						}
						if (isValidLink(nodes[i], nodes[j])) {
							distance = nodes[i].distance(nodes[j]);
							
							nodes[i].addNeighbour(nodes[j], {
								distanceTo: distance
							});
							
							nodes[j].addNeighbour(nodes[i], {
								distanceTo: distance
							});
						}
					}
				}
				
				// Network the from and to points in with the rest of the shape
				j = false;
				if (isValidLink(fromV2, toV2)) {
					distance = fromV2.distance(toV2);
					fromV2.addNeighbour(toV2, {
						distanceTo: distance
					});
					toV2.addNeighbour(fromV2, {
						distanceTo: distance
					});
				}
				for (i = 0, ii = size; i < ii; i += 1) {
					if (isValidLink(fromV2, nodes[i])) {
						distance = fromV2.distance(nodes[i]);
						fromV2.addNeighbour(nodes[i], {
							distanceTo: distance
						});
						nodes[i].addNeighbour(fromV2, {
							distanceTo: distance
						});
					}
				}
				for (i = 0, ii = size; i < ii; i += 1) {
					if (isValidLink(toV2, nodes[i])) {
						distance = toV2.distance(nodes[i]);
						toV2.addNeighbour(nodes[i], {
							distanceTo: distance
						});
						nodes[i].addNeighbour(toV2, {
							distanceTo: distance
						});
					}
				}
				/*
				// Debugging code, to show whats going on inside the funnel
				// algorithum during the path find process.
				if (renderer) {
					(function (renderer, nodes, fromV2, toV2) {
						var
							path,
							node,
							nes,
							ne,
							i,	// Used for loop control
							ii;	// Used for loop delimiting

						for (i = 0, ii = nodes.length; i < ii; i += 1) {
							path = [];
							node = nodes[i];
							nes = node.getNeightbours();
							
							while ((ne = nes.step())) {
								path.push(node);
								path.push(ne.node);
								path.push(node);
							}
							
							renderer.add('path', path);
						}
					}(renderer, nodes, fromV2, toV2));
				}
				*/
				
				return $('thorny level pathfinder astar').search(
					fromV2,
					toV2,
					undefined,
					function (from, to) {
						return from.distance(to);
					}
				);
			},//funnel
			
			/**
			 * Used to add debug data to the renderer
			 * @param function injected Contains a renderer inject function
			 * @return void
			 */
			renderer: function (injected) {
				renderer = injected;
			}
		};
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny/common/level/pathfinder/funnel')));