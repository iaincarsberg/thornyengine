/*global window console*/
(function (module) {
	var 
		/**
		 * Used to build the attach options.
		 * @param object $ Contains a reference to thorny
		 * @param object options Contains the attachment specific options
		 * @return object Containing the attached options
		 */
		attachOptions = function ($, options) {
			if (typeof options !== 'object') {
				options = {};
			}
			return $._.extend((function () {
				return {
					// Required
					// Contains the path name
					name: false,
					
					// Contains the route that is to be followed
					route: [],
					
					// Contains the loop type, can be 'once' or 'cycle'
					type: 'once',
					
					// Used to flag this path as being a retainable path, 
					// non-retainable paths will be dropped when a new path is
					// added to an entity.
					// Non-retained paths will also be dropped once completed 
					// if type is set to 'once'
					retain: false,
					
					// Used to conjunction with 'retain' to force a new path 
					// to become the currently active path for the owning 
					// moveable entity.
					force_active: true
				};
			}()), options);
		},
	
		/**
		 * Used to build the attach options.
		 * @param object $ Contains a reference to thorny
		 * @param object options Contains the attachment specific options
		 * @return object Containing the attached options
		 */
		executeOptions = function ($, options) {
			if (typeof options !== 'object') {
				options = {};
			}
			return $._.extend((function () {
				return {
					direction: false,
					position:  false,
					distance:  false,
					goal:      false
				};
			}()), options);
		};
	
	/**
	 * Used to make an object observable
	 * @param object subject Contains the object that is to be observed
	 * @return object Containing the injected observable functionality.
	 */
	module.exports = function ($, module) {
		$.onInit(module, function () {
			$.data(module, 'paths', {});
			
			$.es().registerComponent('follow-path', function () {
				return {
					// You can have multiple paths
					isUnique: false,
					
					// And we want to process all of them at once, so we can 
					// select the correct path.
					processAsCollection: true,
					
					attach: function (entity, options) {
						var base = this;
						
						// The position is required.
						if (! entity.hasComponent('position') ||
							! entity.hasComponent('moveable')) {
							return false;
						}
						
						// Build the options.
						options = attachOptions($, options);
						
						// The path must be named
						if (options.name === false) {
							return false;
						}
						
						// If this is the first path for this entity, build a
						// container for them.
						if ($.data(module, 'paths')[entity.id] === undefined) {
							$.data(module, 'paths')[entity.id] = {};
						}
						
						// Build a new path object.
						$.data(module, 'paths')[entity.id][options.name] = {
							route: base.vectorifyRoute(options.route),
							type:  options.type,
							retain: options.retain,
							force_active: options.force_active,
							
							// Contains the id of the next item in the route
							node: false,
							
							// Contains the current target in the route
							target: false
						};
						
						// Inject a hook to execute this function per 
						// moveable update.
						entity.getComponent('moveable')
							.data
							.inject(entity, function (entity, data) {
								return base.execute(
									entity,
									$._.extend({path: $.data(module, 'paths')[entity.id][options.name]}, data)
									);
							});
					},
					
					/**
					 * Used to follow a path around the world.
					 * @param object entity Contains the entity currently
					 * being executed.
					 * @param object|undefined moveable Contains a reference 
					 * to entities moveable component
					 * @param distance|undefined distance Contains the 
					 * distance the moveable is able to move this tick.
					 * @return void
					 */
					execute: function (entity, options) {
						//if (moveable.position.getX() > 500 || moveable.position.getX() < 50) {
						//	moveable.facing = $('thorny math vector2').factory(moveable.facing.getX() * -1, 0);
						//}
						options = executeOptions($, options);
						
						// Makesure the options are valid
						if (options.path      === false ||
							options.direction === false ||
							options.position  === false || 
						    options.distance  === false ||
						    options.goal      === false
						) {
							return;
						}
						
						var
							node,
							newPosition,
							goalX;
						
						if (options.path.node === false) {
							options.path.node = 0;
							options.path.target = options.path.route[options.path.node];
							options.direction = options.position.rotateToFace(options.path.target);
						}
						
						// If we're close to the goal
						if (options.path.target && 
							options.position.distance(options.path.target) < options.distance
						) {
							options.path.node += 1;
							
							if (options.path.type === 'once') {
								if (options.path.node === options.path.route.length) {
									options.path.target = false;
									
								} else {
									options.path.target = options.path.route[
										options.path.node
										];
								}
								
							} else if (options.path.type === 'cycle') {
								options.path.target = options.path.route[
									(options.path.node % options.path.route.length)
									];
							}
							
							if (options.path.target) {
								options.direction = options.position.rotateToFace(options.path.target);
								
							} else {
								options.direction = $('thorny math vector2').factory(0, 0);
							}
						}
						
						return options;
					},
					
					expose: function (entity) {
						return $.data(module, 'moveable')[entity.id];
					},
					
					inject: function (entity, name, code) {
						// TODO
						// The Idea here is that other components such as the
						// pathfinder and collision detector can inject 
						// functionality into this
						var self = $.data(module, 'moveable')[entity.id];
						
						if (self.validity_tests[name] !== undefined) {
							throw new Error('TODO - Inject cannot replace the functionality in "' + name + '"');
						}
						
						self.validity_tests[name] = code;
					},
					
					/**
					 * Used to vectorify the route.
					 * @param array route Contains the route [{x:0, y:0}, ...
					 * @return array Containing a collection of vector2s
					 */
					vectorifyRoute: function (route) {
						var i, ii, node, vector2s = [], v2;
						for (i = 0, ii = route.length; i < ii; i += 1) {
							node = route[i];
							
							// Makesure the node looks right
							if (typeof(node) !== 'object') {
								continue;
							}
							
							// If we have an object thats basically {x:0,y:0}
							if (
								node.x !== undefined &&
								node.y !== undefined
							) {
								v2 = $('thorny math vector2')
									.factory(node.x, node.y);
								
							// If we have an existing vector2
							} else if (
								node.getX !== undefined &&
								node.getY !== undefined &&
								typeof node.getX === 'function' &&
								typeof node.getY === 'function'
							) {
								v2 = node;
								
							// Otherwise
							} else {
								continue;
							}
							
							vector2s.push(v2);
						}
						
						return vector2s;
					}
				};
			});
		});
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny/common/component/follow-path')));