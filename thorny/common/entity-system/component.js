/*global window*/
(function (module) {
	module.exports = function ($, module) {
		$.onInit(module, function () {
			$.data(module, 'registered-components', {});
			$.data(module, 'entities', {});
			
			$.es().inject.entity(function (entity) {
				/**
				 * Used to add components to this entity
				 * @param string name Contains the name of a component that is
				 * to be added to this entity
				 * @param object options Contains component specific options
				 * or a concrete entity.
				 * @return this Allowing for object chaining
				 */
				entity.addComponent = function (name, options) {
					var component = $.data(module, 'registered-components')[name];
					if (component === undefined) {
						throw new Error(
							'entity.addComponent(' + name + ', "' + 
							JSON.stringify(options) + '"); is unknown'
						);
					}
					
					// Invoke the new component.
					component = component();
					
					// If a component is unique then it can only be added once.
					if (component.isUnique && this.hasComponent(name)) {
						throw new Error(
							'entity.addComponent(' + name + ', "' + 
							JSON.stringify(options) + '"); in unique, can cannot be added multiple times to one entity'
						);
					}
					
					// If we're dealing with a template then we don't want to
					// store any additional component data.
					if (this.isTemplate()) {
						this.appendTemplate(name, options);
						return this;
					}
					
					// If the component === false then it means it wasn't 
					// attached to the entity.
					if (component.attach(entity, options) === false) {
						throw new Error(
							'entity.addComponent(' + name + ', "' + 
							JSON.stringify(options) + '"); Failed to attach to the entity.'
						);
					}
					
					// If this is the first component to be added to an entity
					// then we need to crate an object for them to be stored
					// inside of.
					if ($.data(module, 'entities')[this.id] === undefined) {
						$.data(module, 'entities')[this.id] = {};
					}
					
					// Insert the component into the entities collection;
					if (component.isUnique) {
						// Store the component
						$.data(module, 'entities')[this.id][name] = component;
						
					} else {
						// Check to see if this item exists, if it doesn't 
						// make an empty array, then push the new item into it.
						if ($.data(module, 'entities')[this.id][name] === undefined) {
							$.data(module, 'entities')[this.id][name] = [];
						}
						$.data(module, 'entities')[this.id][name].push(component);
					}
					
					// object chaining hoooo
					return this;
				};
				
				/**
				 * Used to get a component attached to an entity
				 * @param string name Contains the name of a component that is
				 * already attached to an entity, but we want to access
				 * @return object Containing the component
				 */
				entity.getComponent = function (name) {
					if ($.data(module, 'entities')[this.id] !== undefined &&
						$.data(module, 'entities')[this.id][name] !== undefined
					) {
						return {
							data: $.data(module, 'entities')[this.id][name],
							
							/**
							 * Used to allow easy process of attached data.
							 * @param function callback Called on each item 
							 * within the return component list.
							 * @return void
							 */
							each: function (callback) {
								var data = this.data;
								if (data.length === undefined) {
									data = [data];
								}
								
								$._.each(data, callback);
							},
							
							/**
							 * Used to allow easy access to the first item in
							 * the collection
							 * @param function callback Called on the first 
							 * item within the return component list.
							 * @return void
							 */
							first: function (callback) {
								var data = this.data;
								if (data.length === undefined) {
									data = [data];
								}
								
								if (data[0] !== undefined) {
									callback(data[0]);
								}
							}
						};
					}
					return false;
				};
				
				/**
				 * Used to see if a component has a specific entity
				 * @param string name Contains the name of the entity
				 * @return boolean True if the entity has a specific component
				 */
				entity.hasComponent = function (name) {
					if ($.data(module, 'entities')[this.id] !== undefined &&
						$.data(module, 'entities')[this.id][name] !== undefined
					) {
						return true;
					}
					return false;
				};
				
				/**
				 * Used to execute a component
				 * @param string name Contains the name of the entity
				 * @param object options Contains options to customise 
				 * the execution.
				 * @return boolean True if the entity has a specific component
				 */
				entity.executeComponent = function (name, options) {
					/*
					TODO
					I'm thinking that having the .isUnique = false flag set
					one execute function should revice all the data, then 
					processes the collection to provide a result.
					
					For example.
					With the path finder, one loaded level will have a portion
					of the whole level, and another instance will have another
					portion.
					
					Doing the following would likley result in no path being found.
					
					collection[0]
						.execute({from: {x: 0, y: 0}, to: {x: 50, y: 50}})
					
					
					However doing would allow the execute function to process
					based on the whole dataset, or on one dataset depending on
					the needs of the component.
					
					collection[0]
						.execute(
							{from: {x: 0, y: 0}, to: {x: 50, y: 50}},
							collection
						)
					
					*/
					var thisEntity = this;
					this.getComponent(name)
						.each(function (component) {
							component.execute(thisEntity, options);
						});
				};
			});
			
			$.es().inject.system(function (es) {
				/**
				 * Used to register a new component with the system.
				 * @param string name Contains the name of component.
				 * @param function callback Used to inject the new component
				 * @return void
				 */
				es.registerComponent = function (name, callback) {
					if ($.data(module, 'registered-components')[name] !== undefined) {
						throw new Error(
							'entity-system.registerComponent("' + name + '"); has already been registered'
						);
					}
					
					$.data(module, 'registered-components')[name] = function () {
						return $._.extend(
							(function () {
								return {
									/**
									 * Used to see if there can be more than one 
									 * of something.
									 * @param boolean True is an entity can only 
									 * ever have one instance of this entity.
									 */
									isUnique: true,

									/**
									 * Allows a collection of components to be 
									 * processed by one component.
									 * @param boolean True should be processed as
									 * a collection of components, False should be
									 * processed as individual items.
									 */
									processAsCollection: false,

									/**
									 * Called when a component is attached to an
									 * entity within the system.
									 * @param object entity Contains the entity 
									 * were attaching to.
									 * @param object Contains peoperties the 
									 * component will use.
									 * @return void
									 */
									attach: function (entity, options) {},

									/**
									 * Used to update the state of the entity.
									 * @param object entity Contains the entity
									 * @param object Contains peoperties the 
									 * component will use.
									 * @return void
									 */
									update: function (entity, options) {},

									/**
									 * Used to execute the component.
									 * @param object entity Contains the entity
									 * @param object Contains peoperties the 
									 * component will use.
									 * @param optional array Contains all 
									 * instances of this entity.
									 * @return void
									 */
									execute: function (entity, options, collection) {},
									
									/**
									 * Used to make component data available 
									 * to the rest of the system.
									 * @param object entity Contains the entity
									 * @return object Containing data related 
									 * to this component
									 */
									expose: function (entity) {
										// TODO - write unit tests in the spec
									},
									
									/**
									 * Used to inject code into a system
									 * @param object entity Contains the entity
									 * @param string name Contains the name of 
									 * what we're injecting
									 * @param object code Contains what we're
									 * injecting
									 * @return void
									 */
									inject: function (entity, name, code) {
										// TODO - write unit tests in the spec
									}
								};
							}()),
							callback()
							);
					};
				};
				
				/**
				 * Used to search for a list of entities that have the 
				 * required components.
				 * @param vararg Contains the names of components that may be
				 * attached to entities.
				 * @return array of Entities that have the reqested component
				 */
				es.searchByComponents = function () {
					var 
						varargs = arguments,
						varargsLength = varargs.length,
						data = $.data(module, 'entities'),
						mapped;
					
					return {
						// underscore.js rocks mah socks :D
						data: $._
							.map(data, function (components, entity_id) {
								return $.es().getEntity(entity_id);
							})
							.reduce(function (collection, entity, id) {
								var 
									matches = 0,
									i, // for loop current
									ii;// for loop limit

								// Loop over the varargs.
								for (i = 0, ii = varargsLength; i < ii; i += 1) {
									if (entity.hasComponent(varargs[i])) {
										matches += 1;
									}
								}

								// If the matched items === the number of varargs
								// then we have a valid reduce keeper.
								if (varargsLength === matches) {
									collection.push(entity);
								}

								// Return the active collection that was started
								// with the third param, which is an [].
								return collection;
							}, []),
						
						/**
						 * Used to allow easy process of attached data.
						 * @param function callback Called on each item 
						 * within the return component list.
						 * @return void
						 */
						each: function (callback) {
							$._.each(this.data, function (entity) {
								var 
									params = [],
									i, // for loop current
									ii;// for loop limit
								
								
								// Loop over the varargs.
								for (i = 0, ii = varargsLength; i < ii; i += 1) {
									params.push(entity.getComponent(varargs[i]));
								}
								
								callback.apply(entity, params);
							});
						},
						
						/**
						 * Used to allow easy access to the first item in
						 * the collection
						 * @param function callback Called on the first 
						 * item within the return component list.
						 * @return void
						 */
						first: function (callback) {
							var 
								entity = this.data[0],
								params = [],
								i, // for loop current
								ii;// for loop limit
							
							
							// Loop over the varargs.
							for (i = 0, ii = varargsLength; i < ii; i += 1) {
								params.push(entity.getComponent(varargs[i]));
							}
							
							callback.apply(entity, params);
						}
					};
				};
			});
		});
		
		return false;
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny/common/entity-system/component')));