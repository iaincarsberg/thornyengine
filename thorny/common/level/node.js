/*global window*/
(function (module) {
	// Exposes the a creation method to the outside world.
	module.exports = function ($) {
		return {
			/**
			 * Used to create a new node in a network.
			 * @param object data Containing the contents of the node
			 * @param vararg id Containing the id in what ever form that is
			 * required at dev time.
			 * @return object Containing a node
			 */
			factory: function (data) {
				// Process the arguments into the id.
				var 
					// Contains the (hopfully)unique id for this node.
					id = this.formatArguments(arguments, 1),
					
					// Contains all neighbouring nodes.
					neighbours = $('thorny level node-collection').factory();
				
				/**
				 * Used to see if this node is 'the one they are looking for' :P
				 * @param string _id Contains a node reference
				 * @return boolean true is isNode otherwise false
				 */
				data.isNode = function (_id) {
					if (id === _id) {
						return true;
					}
					return false;
				};
				
				/**
				 * Used to return a nodes unique id.
				 * @param void
				 * @return string id Containing this nodes unquie reference
				 */
				data.getId = function () {
					return id;
				};
				
				/**
				 * Used to add neighbouring nodes.
				 * @param object node Contains a node that has become a
				 * neighbour to this node.
				 * @return this allowing object chaining
				 */
				data.addNeighbour = function (node, details) {
					// Check to see if someone is trying to neighbour themself
					if (this === node) {
						return false;
					}
					
					// Store the node in the neighbours collection along with 
					// any details that are associated with the node.
					if (neighbours.push(node, details) === false) {
						return false;
					}
					
					return this;
				};
				
				/**
				 * Used to return an active nodes neighbours.
				 * @param void
				 * @return array Containing neighbours
				 */
				data.getNeightbours = function () {
					return neighbours.iterator();
				};
				
				return data;
			},
			
			/**
			 * Used to format the arguments into a usable string.
			 * @param array arguments Contains a bunch of arguments
			 * @param int skip Used to allow the formatter to skip past known 
			 * arguments in a function call.
			 * @return string Containing the formatted arguments
			 */
			formatArguments: function (arguments, skip) {
				var i,
					ii,
					id = '';
				
				// Used to stip past know arugments, incases when the function
				// is used for more than its vararg.
				if (skip === undefined) {
					skip = 0;
				}
				
				for (i = skip, ii = arguments.length; i < ii; i += 1) {
					id += ((id.length === 0) ? '' : '-') + arguments[i];
				}
				
				return id;
			},
		};
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny/common/level/node')));