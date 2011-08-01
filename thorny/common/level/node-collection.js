/*global window console*/
(function (module) {
	// Exposes the a creation method to the outside world.
	module.exports = function ($) {
		return {
			/**
			 * Used to contain a collection of nodes and allow for the stored 
			 * nodes to be searched etc.
			 *  @param object data Contains collection customisations
			 * @return object Containing warppers for building a collection of
			 * node objects.
			 */
			factory: function (data) {
				/**
				 * NOTE!!!
				 * 
				 * We're storing the nodes in a key-value-pair and an
				 * array because kvp has faster lookups and the array
				 * has a faster loop access, and because a node can only
				 * be added or removed from the collection via these exposed 
				 * function, due to data scoping it should be safe. The only
				 * real would be from a function like:
				 *       collection.getCollectionArray()
				 * as you could set the returned array to [], but
				 * I'm blocking that using the iterator object in a function.
				 */
				
				var
					collectionKvp = {},		// Stores the key-value-paired 
											// data for quick access
					collectionArray = [],	// Stores data for use with the 
											// iterator function
					associationData = {};	// Contains data that details a 
											// specific relationship between a
											// collection and a contained node.
				
				if (data === undefined) {
					data = {};
				}
				
				/**
				 * Used to add a node to a collection
				 * @param object node Containing an extended node
				 * @param object details Contains details on this relationship
				 * @return this allowing object chaining
				 */
				data.push = function (node, details) {
					// Makesure all the injected node based object exist 
					// in the parsed object, if they do then we can be 
					// sure its a valid node, or something is trying hard 
					// to fake it.
					if (node.isNode === undefined || 
						node.getId === undefined || 
						node.addNeighbour === undefined || 
						node.getNeightbours === undefined
					) {
						throw new Error(
							"Thorny level.node_collection: Parsed non-node based object."
						);
					}
					
					// Check to see if the item already exists in the 
					// collection, if it does then we don't need to add
					// it again.
					if (collectionKvp[node.getId()] !== undefined) {
						return false;
					}
					
					// Store the node ready for kvp access, and iterator 
					// access, go team :)
					collectionKvp[node.getId()] = node;
					collectionArray.push(node);
					
					// Makesure we have a semi-valid looking details collection
					if (details === undefined) {
						details = {};
					}
					// Store the association data
					associationData[node.getId()] = details;
					
					return this;
				};
				
				/**
				 * Used to remove a node from the collection.
				 * @param object|string Contains a reference to a node 
				 * that needs to be deleted.
				 * @return this allowing object chaining
				 */
				data.remove = function (node) {
					return this;
				};
				
				/**
				 * Used to allow the collection to be searched.
				 * @param vararg Contains the id of the node being 
				 * searched for within the collection.
				 * @return node|false If a node is found it is returned, 
				 * otherwise false is returned.
				 */
				data.search = function () {
					var id = $('thorny level node')
						.formatArguments(arguments);
					
					if (collectionKvp[id] !== undefined) {
						return {
							node: collectionKvp[id],
							details: associationData[collectionKvp[id].getId()]
						};
					}
					return false;
				};
				
				/**
				 * Used to provide a handleing object to iterate over the
				 * contained collection of nodes.
				 * @param void
				 * @return object Containing iteration access controls
				 */
				data.iterator = function () {
					var
						position = 0;	// Contains the position within the collection.
					
					return {
						/**
						 * Forward to the next element
						 * @param void
						 * @return void
						 */
						next: function () {
							position += 1;
						},
						
						/**
						 * Rewind to the first element.
						 * @param void
						 * @return void
						 */
						rewind: function () {
							position = 0;
						},
						
						/**
						 * Used to access the current item within the 
						 * iterator's dataset.
						 * @param void
						 * @return void
						 */
						current: function () {
							var node = collectionArray[position];
							
							if (node === undefined) {
								return false;
							}
							return {
								node: node,
								details: associationData[node.getId()]
							};
						},
						
						/**
						 * Checks if the iterator is valid
						 * iterator's dataset.
						 * @param void
						 * @return void
						 */
						valid: function () {
							if (position < collectionArray.length) {
								return true;
							}
							return false;
						},
						
						/**
						 * Get the key of the current element
						 * iterator's dataset.
						 * @param void
						 * @return void
						 */
						key: function () {
							return position;
						},
						
						/**
						 * Returns the current element, and moves the 
						 * position onto the next item in the collection.
						 * @param void
						 * @return node|false
						 */
						step: function () {
							// Contains the next item within the collection.
							var next = false;
							
							if (this.valid()) {
								next = this.current();
								this.next(); 
							}
							
							return next;
						},
						
						/**
						 * Used to see how long a collection is.
						 * @param void
						 * @return integer Containing the collection length
						 */
						getLength: function () {
							return collectionArray.length;
						},
						
						/**
						 * This function is used to grab an item from the
						 * iterator at a specific index.
						 * @param int key Contains the key in the array version 
						 * of the data.
						 * @return object Containing the node and its 
						 * associated data
						 */
						stepTo: function (key) {
							position = key;
							
							return this.step();
						}
					};
				};
				
				return data;
			},
		};
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny/common/level/node-collection')));