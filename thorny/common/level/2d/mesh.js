/*global window*/
(function (module) {
	/**
	 * Used to make an object observable
	 * @param object subject Contains the object that is to be observed
	 * @return object Containing the injected observable functionality.
	 */
	module.exports = function ($, module) {
		var base = {};
		
		/**
		 * Used to parse the data into a specific format.
		 * @param string name Contains the levels name
		 * @param object level Contains the object collection
		 * @param array data Contains the level data
		 * @return object Containing a node-collection
		 */
		base.parse = function (name, level, data) {
			var 
				// Acts as a temporary cache for found vertices, this allows corner
				// vertices that are common to multiple faces to share a common 
				// object which reduces memory usage, and makes comparison easier.
				vertices = {},
				uniqueVertices = 0,
				i,	// Used for loop control
				ii,	// Used for loop delimiting
				vs, // Will contains all vertices within this poly.
				j,	// Used for loop control
				jj,	// Used for loop delimiting
				vert,
				key;

			for (i = 0, ii = data.length; i < ii; i += 1) {
				// The goal with vs is to store vectors, and was we want three
				// vectors we must loop over the sub-record and store found
				// vectors in this list.
				vs = [];

				for (j = 0, jj = data[i].length; j < jj; j += 1) {
					vert = data[i][j];

					// The goal here is to create the minimum number of vector2
					// objects as possible, so if multiple polys all share a 
					// commonly position vertice then in memory there should 
					// only be one instance of that point.
					// So this code creats a crude key, and maintains a list 
					// of currently discoverted nodes, if a node is refound
					// then a new vector2 isn't created.
					key = vert.x + '-' + vert.y;
					if (vertices[key] === undefined) {
						vertices[key] = $('thorny level node').factory(
							$('thorny math vector2').factory(
								vert.x + level.getX(),
								vert.y + level.getY()
								),
							name,
							'vector2',
							uniqueVertices
						);
						uniqueVertices += 1;
					}

					// Store the vertex in the list.
					vs.push(vertices[key]);
				}

				// Makesure we have the correct number of vertices.
				if (vs.length !== 3) {
					throw new Error("Thorny.level: Invalid level data, all poly2's must contain 3 vertices.");
				}
				
				// Store the poly in the collection.
				level.push(
					$('thorny math poly2').factory(vs[0], vs[1], vs[2])
				);
			}
			
			return level;
		};
		
		/**
		 * Used to network nodes together
		 * @param object level Contains the object collection
		 * @return object Containing a node-collection
		 */
		base.network = function (level) {
			var
				parent,						// Will contain a parent node
				parents = level.iterator(),	// Contains all parent nodes
				child,						// Will contain a child node
				children = level.iterator(),// Contains all chilren nodes
				edge;						// Will contain the 
											// neighbouring edge.
			
			// We're going to iterate over this collection twice so we 
			// can pair each of the polys together.
			while ((parent = parents.step())) {
				while ((child = children.step())) {
					// See if the parent shares an edge with the child
					if ((edge = parent.node.sharesEdge(child.node))) {
						// If it does then they are neighbours
						parent.node.addNeighbour(child.node, {
							distanceTo: parent.node.getMidpoint()
								.distance(child.node.getMidpoint()),
							edgeWidth: edge[0].distance(edge[1])
						});
					}
				}
				children.rewind();
			}
			return level;
		};
		
		/**
		 * Used to search for a specific node within this level
		 * @param object entity Contains the entity that owns the map
		 * @param int x Contains the x coordinate
		 * @param int y Contains the y coordinate
		 * @param boolean findClosest Used to find the cloest node
		 * @return object Containing a node within this level
		 */
		base.xySearch = function (entity, x, y, findClosest) {
			var 
				point,
				nodes,
				node,
				goalGoal = false,
				bestNode = false,
				distance = false,
				distanceToBestNode = false;
			
			if (findClosest === undefined) {
				findClosest = false;
			}
			
			// Convert the xy coords into a vector
			point = $('thorny math vector2').factory(x, y);
			
			entity
				.getComponent('load-level')
				.each(function (level) {
					if (goalGoal !== false) {
						return;
					}
					
					// Check to see if the clicked xy is within
					// the bounds of this level, but only on direct
					// search mode, if we want to find the closest 
					// node then we need to ask every poly within
					// every level in the collcetion.
					if (! findClosest &&
						(
							x < level.data.getX() || x > (level.data.getX() + level.data.getWidth()) ||
							y < level.data.getY() || y > (level.data.getY() + level.data.getHeight())
						)
					) {
						return;
					}

					// Loop over each node within this level
					nodes = level.data.iterator();
					while ((node = nodes.step().node)) {
						if (node.isVector2Internal(point)) {
							goalGoal = node;
							return;
						}

						// If we want to find the closest match
						if (findClosest) {
							distance = point.distance(node);

							// See if the distance is better than 
							// the current best.
							if (
								distanceToBestNode === false ||
								distance < distanceToBestNode
							) {
								bestNode = node;
								distanceToBestNode = distance;
							}
						}
					}	
				});
			
			// If the goal node was found, return it
			if (goalGoal) {
				return goalGoal;
			}
			
			// If we're meant to find the closest node return it
			if (findClosest) {
				return bestNode;
			}
			
			// Otherwise return false.
			return false;
		};
		
		return base;
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny/common/level/2d/mesh')));