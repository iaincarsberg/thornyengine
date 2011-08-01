/******************************************************************************
 ** File: /thorny/base.js                                                    **
 ******************************************************************************/
/*global console window setInterval clearInterval _*/
/**
 * This is the base module which is the main access point for all interaction
 * with the thorny engine.
 *
 * @package thorny
 * @author Iain Carsberg <iain.carsberg.name>
 * @copyright Copyright (c) 2011, Iain Carsberg
 * @link http://dev.thornyengine.com/2011/05/24/state-of-te/
 */
(function (module) {
	require.paths.unshift(__dirname + '/../');
	
	var
		dirname = __dirname + '/../',
		
		/**
		 * Used to determine if we're dealing with a browser based enviroment 
		 * or a node.js enviroment.
		 * @var boolean
		 */
		isBrowser = (typeof window !== 'undefined') ? true : false,

		/**
		 * Contains a json parser
		 * @var object
		 */
		json = JSON || require('lib/json.js'),
		
		/**
		 * Used to see if a string should point to a file.
		 * @string string string Contains the string we're testing to see if 
		 * its a file or not.
		 * @return boolean
		 */
		isFile = function (string) {
			if (string.substr(0, 2) === './') {
				return true;
			}
			return false;
		},

		/**
		 * Used to open a specific file on disk, or via ajax if in browser mode.
		 * @param string path Contains the path to a file
		 * @param function callback Called once the file has been opened
		 * @return string Containing the contents of a file
		 * @throws "Thorny main.openFile encounted 'exception'"
		 * @throws node.js fs.readFile exception
		 */
		openFile = function (path, callback) {
			if (isBrowser) {
				window.jQuery.ajax({
					url: path.substr(1),
					success: callback,
					error: function (d, e) {
						throw new Error("Thorny main.openFile encounted '" + e + "'");
					},
					
					// We set the dataType to text encase the file is 
					// transmitted as a .json, which automatically gets
					// parsed into javascript. We don't want this to happen
					// because we want it act exactly the same as nodes
					// readFile from the fs module.
					dataType: 'text'						
				});
				
			} else {
				var fs = require('fs');
				
				fs.readFile(
					__dirname + '/../' + path, 
					function (err, data) {
						if (err) {
							throw new Error(err);
						}
						callback(data.toString());
					}
				);
			}
		},
		
		/**
		 * Used to load a module.
		 * @param string modules Contains the name of the module to load
		 * @return object Containing the module
		 * @throws Unknown module
		 */
		loadModule = function (module) {
			var 
				i,	// Used for loop control
				ii,	// Used for loop delimiting
				
				// Contains the root node in the modules path
				root = module.shift(),
				moduleLength = module.length,
				src,
				
				// Contains the path to the module we're trying to load.
				//   domain_path: is the browser/node.js path
				//   common_path: is the common path
				domain_path = root,
				common_path = root,
				
				/**
				 * Used to safly require modules.
				 * @param string path Containing a path to a possible module
				 * @reutrn object|false Containing the module if it exists, 
				  * otherwise false
				 */
				_require = function (path) {
					try {
						// If we're in node.js mode we need to do something a
						// bit more complex to see if a module exists or not.
						if (! isBrowser) {
							// The complex bit is to check to see if the source
							// file exists, on disk, if it does, require it, if
							// not return false.
							if (require('fs').statSync(path + '.js')) {
								return {
									path: path,
									func: require(path)
								};
								
							} else {
								return false;
							}
							
						// In browser land we just return the require function 
						// as it returns false if the module doesn't exist.
						} else {
							var func = require(path);
							if (func !== false) {
								return {
									path: path,
									func: func
								};
							}
							return false;
						}
						
					} catch (e) {
						return false;
					}
				};
			
			// Build the protential path to the protential domain or common 
			// implementation.
			if (moduleLength > 0) {
				domain_path += (isBrowser) ? '/browser' : '/node.js';
				common_path += '/common';
				
				for (i = 0, ii = moduleLength; i < ii; i += 1) {
					domain_path += '/' + module[i];
					common_path += '/' + module[i];
				}
			}
			
			// We want to return objects in order of importance, so domain,
			// common and error.
			return _require(domain_path) || 
			       _require(common_path) || 
			       (function () {
						throw new Error('Unknown module "' + root + ((module.length > 0) ? ' ' : '') + module.join(' ') + '", dont forget that a module must be in a common/browser/node.js subdirectory, ie thorny/common/math/vector2.js');
					}());
		},

		/**
		 * Used to add the modules to the namespace
		 * @param object file Contains a file object
		 * @param object namespace Contains everything currently loaded into 
		 * memory relating to the engine, and the game project.
		 * @return object Containing the modules
		 */
		addModuleToNamespace = function (file, namespace) {
			var
				i,	// Used for loop control
				ii,	// Used for loop delimiting
				modules,
				module,
				pointer,
				loaded,
				modulesLength;
			
			modules = file.path.split(' ');
			modulesLength = modules.length;
			
			pointer = namespace;
			for (i = 0, ii = modulesLength; i < ii; i += 1) {
				module = modules[i];
				if (pointer[module] === undefined) {
					if (i === (modulesLength - 1)) {
						loaded = loadModule(modules);
						pointer['* ' + module] = loaded.func;
						
						if (file.autoexec) {
							file.module = loaded.func;
						}
					} else {
						pointer[module] = {};
					}
				}
				
				pointer = pointer[module];
			}
		},
		
		/**
		 * Used to build an ordered list of modules that need loading into the
		 * game engine.
		 * @param array newItems Contains the source files.
		 * @param function callback Called once all of the class paths have been
		 * discovered and ordered.
		 * @return array Containing all files that need loading
		 */
		buildModuleList = function (newItems, callback) {
			var 
				i,	// Used for loop control
				ii,	// Used for loop delimiting
			
				// Will contain the final list
				list = [],
				
				// Will contain the open list, includes objects, and ./ files
				itemsArray = [],
				
				// Will contain the recursive function to iterate through the
				// itemsArray and populate the list.
				loop,
				
				// Used in the for in below.
				key;
			
			// Convert the newItems object into an array.
			for (i = 0, ii = newItems.length; i < ii; i += 1) {
				itemsArray.push(newItems[i]);
			}
			
			/**
			 * Used to loop over the itemsArray and populate the list array with
			 * modules in the order they need to be loaded.
			 * @param void
			 * @return void
			 */
			loop = function () {
				// If the itemsArray is empty execute the callback.
				if (itemsArray.length === 0) {
					if (typeof callback === 'function') {
						callback(list);
					}
					
					return false;
				}
				
				var 
					// Set file to be the 0th item from the itemsArray
					file = itemsArray.shift(),
					
					// Determine if a module should be automatically executed.
					doAutoexec = false,
					
					// Determine if a module is a component.
					isComponent = false;
				
				// Its possible to place objects in the config files to preform
				// specific actions, this block detects those features and sets
				// the internal state if required.
				if (typeof file === 'object') {
					// Autoexec will automatically execute a block of code on 
					// startup, this allows modules to setup the state for 
					// complex combination modules.
					// See 'common/entity-system/base' for an example.
					if (file.autoexec !== undefined && 
						file.autoexec === true
					) {
						doAutoexec = true;
					}
					
					// If the logic is within the ./module/browser/ directory
					// and you don't want it executing in side of node.js
					// based envrioments then use the omitIfNodejs flag.
					if (file.omitIfNodejs !== undefined &&
						file.omitIfNodejs === true &&
						! isBrowser
					) {
						return loop();
					}
					
					// Alternativly
					// If the logic is within the ./module/node.js/ directory
					// and you don't want it executing in browser based 
					// envrioments then use the omitIfBrowser flag.
					if (file.omitIfBrowser !== undefined &&
						file.omitIfBrowser === true &&
						isBrowser
					) {
						return loop();
					}
					
					// Expose the path to the rest of the loop
					file = file.path;
				}
				
				// If the module is a component then flag this module for
				// automatic execution.
				if (file.indexOf(' component ') > 0 &&
					file.indexOf(' component ') === file.indexOf(' ')
				) {
					isComponent = true;
				}
				
				// Detect if the file is a node path, ie './thorny/...'
				if (isFile(file)) {
					openFile(file, function (data) {
						// parse the data and prepend it onto the itemsArray
						itemsArray = json.parse(data).concat(itemsArray);
						
						// and recurse
						loop();
					});
				
				// Otherwise just push the item into the list, and recurse.
				} else {
					list.push({
						path: file,
						autoexec: (doAutoexec || isComponent),
						module: false
					});
					loop();
				}
			};
			
			// Start the recursive loop...
			loop();
		},
		
		/**
		 * Used to add load of the requested modules in to the engines namespace.
		 * @param array files Contains a list of all required modules.
		 * @param function callback Called once all modules have been loaded 
		 * into the namespace.
		 * @return void
		 */
		processModules = function (files, callback) {
			var
				namespace = {},
				i,	// Used for loop control
				ii;	// Used for loop delimiting
			for (i = 0, ii = files.length; i < ii; i += 1) {
				// Adds a module to the namespace
				addModuleToNamespace(
					files[i],
					namespace
				);
			}
			
			// Start the callback execution process.
			callback(namespace);
		};

	/**
	 * Used to export the base object
	 * @param void
	 * @reutrn void
	 * @throws "./thorny/base: Expects a callback function." which is 
	 * externally uncatachable as its an asyncronus exception.
	 */
	module.exports = function () {
		// Store the arguments temporarily so we can return a function to 
		// collect the callback from the app.js file.
		var varargs = arguments;
		
		// Return a function that accepts a callback to declutter this functions
		// param list, allowing us to process the arguments array in its 
		// unaltered state.
		return function (callback) {
			var
				// The load counter and interval are used to count the number of
				// loaded modules that are listed within the above varargs.
				// We need to declair them this far up because the 
				// processModules is outside of this instance scope, so its
				// possible for multiple interval loaders to trigger based on
				// a single loadCounter === 0 event.
				loadCounter = 0,
				interval = false,
				
				// Contains module instance data
				moduleInstanceData = {},
				
				// Contains a list of initiated modules
				initiatedModules = {};
			
			buildModuleList(varargs, function (list) {
				processModules(list, function (namespace) {
					// If the callback was specified, and its a function execute it.
					if (callback === undefined ||
						typeof callback !== 'function'
					) {
						throw new Error('./thorny/base: Expects a callback function.');
					}
					
					/**
					 * Used to find an item in a collection.
					 * @param string path Contains the item we're looking for
					 * @return object Containing either a required module or a
					 * handler which can be used to find the target.
					 */
					var handle = function (path) {
						// We return a self executing anon function so we can 
						// localise the namespace, which allows us to chain 
						// calls using .find()
						return (function (path) {
							var 
								nsHandle,
								nsFind,
								localNamespace = namespace;
							
							/**
							 * Used to find an item in a collection.
							 * @param string path Contains the item we're 
							 * looking for
							 * @return object Containing either a required 
							 * module or a handler which can be used to find
							 * the target.
							 */
							nsHandle = function (path) {
								if (path === undefined) {
									path = '';
								}
								
								var
									breadcrums = path.split(' '),
									leaf = localNamespace,
									i,	// Used for loop control
									ii;	// Used for loop delimiting
								
								// Loop over the paths breadcrums
								for (i = 0, ii = breadcrums.length; i < ii; i += 1) {
									// Check to see if the leaf exists, if it does 
									// then do nothing, if it doesn't then 
									// reutrn false.
									if (! (leaf = nsFind(breadcrums[i], (i === (ii - 1)) ? true : false))) {
										return false;
									}
								}
								
								return leaf;
							};
							
							/**
							 * Used to find an item in a collection.
							 * @param string item Contains the item we're 
							 * looking for
							 * @return object Containing either a required 
							 * module or a handler which can be used to find
							 * the target.
							 */
							nsHandle.find = nsFind = function (wrapper) {
								if (localNamespace[wrapper] === undefined) {
									if (localNamespace['* ' + wrapper] !== undefined) {
										// If we find a leaf node, we want to 
										// inject the handle into it, which
										// will allow other modules to access
										// loaded content.
										var leafnode = (localNamespace = localNamespace['* ' + wrapper]);
										return leafnode(handle, path);
									}
									
									return false;
								}
								
								localNamespace = localNamespace[wrapper];
								if (typeof localNamespace === 'object') {
									return {
										find: nsFind
									};
									
								} else {
									return localNamespace;
								}
							};
							
							return nsHandle(path);
						}(path || ''));
					};
					
					/**
					 * Used to find an item in a collection.
					 * @param string item Contains the item we're looking for
					 * @return object Containing either a required module or a
					 * handler which can be used to find the target.
					 */
					handle.find = function (item) {
						return handle(item);
					};
					
					/**
					 * Used to store instance data.
					 * @param string module Contains the module being accessed
					 * @param string key Contains the unique key within that
					 * module relating to a block of data.
					 * @reutrn object|false Object if its stored, otherwise false
					 */
					handle.data = function (module, key, value) {
						if (value === undefined) {
							value = false;
						}
						
						if (! moduleInstanceData[module]) {
							moduleInstanceData[module] = {};
						}
						
						if (! moduleInstanceData[module][key]) {
							moduleInstanceData[module][key] = value;
						}
						
						return moduleInstanceData[module][key];
					};
					
					/**
					 * Used to call a block of code only when the page is
					 * initiating for the first time.
					 * @param string module Contains the name of the module
					 * being initated
					 * @param function callback Contains the logic to execute 
					 * on page initiation.
					 * @return void
					 */
					handle.onInit = function (module, callback) {
						if (initiatedModules[module] === undefined) {
							initiatedModules[module] = true;
							callback();
						}
					};
					
					(function () {
						var 
							defines = {},
							count = 1;
						
						/**
						 * Used to access defined variables.
						 * @param string variable Contains the name of a defined 
						 * value that is being looked up.
						 * @return string Containing a defined value
						 */
						handle.defined = function (variable) {
							if (defines[variable] !== undefined) {
								return defines[variable];
							}
							defines[variable] = '0x' + count;
							count += 1;
							return defines[variable];
						};
						
						/**
						 * Used to get the name of the unique code.
						 * @param string variable Contains the unique code
						 * @return string Containing the variable name
						 */
						handle.getDefined = function (code) {
							var key;
							for (key in defines) {
								if (defines.hasOwnProperty(key) && defines[key] === code) {
									return key;
								}
							}
							return false;
						};
						
						/**
						 * Used to see if a value was defined within a list of
						 * arguments supplied.
						 * @param string variable Contains the target defined
						 * @param object items Contains a list of arguments
						 * @return boolean True if variable is in the arguments
						 */
						handle.hasDefined = function (variable, items) {
							var 
								i,	// Used for loop control
								ii,	// Used for loop delimiting
								key,
								vari = handle.defined(variable);
							
							for (i = 0, ii = items.length; i < ii; i += 1) {
								if (items[i] === vari) {
									return true;
								}
							}
							return false;
						};
					}());
					
					/**
					 * Used to register additional modules into the handle.
					 * @param string name Contains the name of the globally
					 * available module.
					 * @param string name Contains the name of the object
					 * @param object module Contains the module.
					 * @return void
					 */
					handle.registerGlobal = function (name, module) {
						if (handle[name] !== undefined) {
							throw new Error(
								'handle.registerGlobal(' + name + ', ' + 
								module + '); global already registered.'
								);
						}
						if (typeof(module) !== 'function') {
							throw new Error(
								'handle.registerGlobal(' + name + ', ' + 
								module + '); module can only be a function.'
								);
						}
						
						// Inject the new globally available shortcut.
						handle[name] = module;
					};
					
					// Add the openFile function to the handle object.
					handle.openFile = openFile;
					
					// Add the ability to parse json to the handle object.
					handle.json = json;
					
					/**
					 * Used to add underscore to thorny.
					 * @param void
					 * @return void
					 */
					if (isBrowser) {
						require('lib/underscore.js');
						handle._ = _;
						
					} else {
						handle._ = require('lib/underscore.js');
					}
					
					// Handle any automatically executing code.
					(function () {
						var 
							item,
							i,	// Used for loop control
							ii;	// Used for loop delimiting
						
						for (i = 0, ii = list.length; i < ii; i += 1) {
							item = list[i];
							
							if (item.autoexec) {
								item.module(handle, item.path);
							}
						}
					}());
					
					// Return the handle.
					callback(handle);
				});//processModules
			});
		};
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny/base')));
/******************************************************************************
 ** File: /thorny/math/vector2.js                                            **
 ******************************************************************************/
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
/******************************************************************************
 ** File: /thorny/math/poly2.js                                              **
 ******************************************************************************/
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
/******************************************************************************
 ** File: /thorny/core/observable.js                                         **
 ******************************************************************************/
/*global window*/
(function (module) {
	/**
	 * Used to make an object observable
	 * @param object subject Contains the object that is to be observed
	 * @return object Containing the injected observable functionality.
	 */
	module.exports = function ($) {
		return function (subject) {
			var observers = [];
			
			/**
			 * Used to allow other observers to observe us
			 * @param object o Contains an object that is observing us
			 * @return void
			 */
			subject.addObserver = function (o) {
				if ((typeof o === 'function' || typeof o === 'object') && typeof o.notify === 'function') {
					observers.push(o);
					
					// Notify the observer that we just added them.
					try {
						o.notify('onRegister', this);
						
					} catch (e) {
						// Do nothing.
					}
				}
			};
			
			/**
			 * Used to notify any observers
			 * @param string eventName Contains the type of event that just 
			 * happened.
			 * @return int Containing the number of executed events
			 */
			subject.notifyObservers = function (eventName) {
				var
					executed = 0, // Contains the number of executed observers
					i,			  // Used for loop control
					ii;			  // Used for loop delimiting
				for (i = 0, ii = observers.length; i < ii; i += 1) {
					// We dont want any of the observers to break the chain of 
					// update, so we surpress any errors.
					try {
						// Notify the observers
						if (observers[i].notify(eventName, this)) {
							// If something was notified then incroment the 
							// executed counter.
							executed += 1;
						}
						
					} catch (e) {
						// Do nothing.
					}
				}
				return executed;
			};
			
			return subject;
		};
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny/common/core/observable')));
/******************************************************************************
 ** File: /thorny/core/observer.js                                           **
 ******************************************************************************/
/*global window*/
(function (module) {
	/**
	 * Used to observe an observable object.
	 * @param object subject Contains the object that is to observe something else.
	 * @return object Containing the injected observer functionality.
	 */
	module.exports = function ($) {
		return function (subject) {
			/**
			 * Used to execute an event on the observer
			 * @param string eventName Contains the name of the triggered event
			 * @param object observable Contains the thing we're looking at
			 * @return void
			 */
			subject.notify = function (eventName, observable) {
				if (typeof this[eventName] === 'function') {
					// We dont want any of the observer to break anything not
					// related to it, so we surpress any errors.
					try {
						this[eventName](observable);
						return true;
					} catch (e) {
						// Surpress any errors that are caused by our
						// handler function.
						try {
							// Check to see if we have a handler to handle
							// any errors that happen, if we do then
							// execute it.
							if (typeof this.notifyHandler === 'function') {
								this.notifyHandler(e);
								return true;
							}
							
						} catch (ee) {
							// Do nothing.
						}
					}
				}
				return false;
			};
			
			return subject;
		};
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny/common/core/observer')));
/******************************************************************************
 ** File: /thorny/core/event.js                                              **
 ******************************************************************************/
/*global window*/
(function (module) {
	/**
	 * Used to observe an observable object.
	 * @param object subject Contains the object that is to observe something else.
	 * @return object Containing the injected observer functionality.
	 */
	module.exports = function ($, module) {
		// Contains the base event system
		var base = {};
		
		// Bind the event system to the global object.
		$.onInit(module, function () {
			$.data(module, 'observable', $('thorny core observable')({}));
			
			// Sometimes you may went to trigger an event before its been 
			//  bound this is where belated comes in to the rescue.
			$.data(module, 'belated', {});
			
			$.registerGlobal('event', function () {
				return base;
			});
		});
		
		/**
		 * Used to bind to an event
		 * @param string|object eventType Contains the type of the event that 
		 * we're expecting to be called, and we want to respond to.
		 * @param function callback Contains the code that is executed when an
		 * event is triggered
		 * @reutrn void
		 */
		base.bind = function (eventType, callback) {
			var data = {};
			data[eventType] = callback;
			
			$.data(module, 'observable').addObserver(
				$('thorny core observer')(data)
				);
			
			// Check to see if there is a belated event we need to trigger.
			if ($.data(module, 'belated')[eventType]) {
				$.data(module, 'belated')[eventType] = undefined;
				this.trigger(eventType);
			}
		};
		
		/**
		 * Used to trigger an event
		 * @param string eventType Contains the type of event being triggered
		 * @param boolean|undefined belatable True if this event is belatable,
		 * otherwise False|undefined
		 * @return void
		 */
		base.trigger = function (eventType, belatable) {
			var executed = $.data(module, 'observable').notifyObservers(eventType);
			
			// If no events we're triggered then we have a belated event.
			if (belatable === true && executed === 0) {
				$.data(module, 'belated')[eventType] = true;
			}
		};
		
		// Return the event system
		return base;
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny/common/core/event')));
/******************************************************************************
 ** File: /thorny/core/game-loop.js                                          **
 ******************************************************************************/
/*global window requestAnimFrame animStartTime setTimeout console*/
(function (module) {
	/**
	 * Shim layer with setTimeout fallback
	 * @param function callback makes the loop happen
	 * @param dom element Contains the focus
	 * @return void
	 * @url http://paulirish.com/2011/requestanimationframe-for-smart-animating/
	 */
	window.requestAnimFrame = (function () {
		return	window.requestAnimationFrame		|| 
				window.webkitRequestAnimationFrame	|| 
				window.mozRequestAnimationFrame		|| 
				window.oRequestAnimationFrame		|| 
				window.msRequestAnimationFrame		|| 
				function (callback, element) {
					window.setTimeout(callback, 1000 / 60);
				};
	}());
	
	/**
	 * Used to return the number of ms since 1970
	 * @param void
	 * @reutrn int Containing the number of ms since the epoch
	 */
	window.animStartTime = (function () {
		return	window.animationStartTime		||
				window.webkitAnimationStartTime	||
				window.oAnimationStartTime		||
				window.msAnimationStartTime		||
				function () {
					if (window.mozAnimationStartTime) {
						return window.mozAnimationStartTime;
					}
					return new Date().getTime();
				};
	}());
	
	module.exports = function ($) {
		return {
			factory: function (options) {
				var
					interpolation = 0,
					gameLoopEnabled = false,
					hasStats = (window.Stats) ? true : false,
					dewittersGameLoop;
				
				// Set the options to an object
				if (options === undefined) {
					options = {};
				}
				
				// Set default values within the game loop
				if (options.simulationTicksPerSecond === undefined) {
					options.simulationTicksPerSecond = 25;
				}
				if (options.maxFrameSkip === undefined) {
					options.maxFrameSkip = 25;
				}
				// Some rendering systems manually handle there own
				// interpolation, such as css3 transforms, allowing the engine
				// to disable the automatic interpolation allows us to support
				// these kinds of renderer.
				if (options.useInterpolation === undefined) {
					options.useInterpolation = true;
				}
				
				
				/**
				 * Implements the gameloop found below.
				 * @param int gameTick Contains the initial game tick.
				 * @param function loopControl Used to provide the game loop iteration
				 * @param function updateGame
				 * @param function updateGame Called per 'simulationTicksPerSecond'
				 * which updates the simulation.
				 * @param string loopStyle Contains the type of loop that
				 * should be used.
				 * @param function displayGame Called per frame unless the
				 * FPS is below the 'simulationTicksPerSecond' then the 
				 * screen is rendered once per 'maxFrameSkip'.
				 * @url http://www.koonsolo.com/news/dewitters-gameloop/ 
				 * Contains an artical on which the following code is based.
				 */
				dewittersGameLoop = function (gameTick, loopControl, loopStyle, updateGame, displayGame) {
					var 
						// Contains an instance of this game loop object.
						gameLoop = this,

						// This converts the 'simulationTicksPerSecond' into a usable 
						// value by the game loop.
						skipTicks = 1000 / options.simulationTicksPerSecond,

						// Localise the maxFrameskip, used when the fps falls below the
						// target 'simulationTicksPerSecond' to ensure we're still 
						// displaying graphical content to the user.
						maxFrameskip = options.maxFrameSkip,

						// Contains the time of when the nextgame tick will be processed.
						nextGameTick = gameTick,

						// Contains now many simulations were processed, this is used with
						// the maxFrameskip to ensure the scene is rendered during 
						// complex simulations.
						loops,

						// When the FPS is high enough to outpace the skipTicks we
						// sometimes need to interpolate all objects within the 
						// simulation, this is to prevent objects jittering about as the
						// simulation processes slower than the fps.
						interpolation,

						// Contains the last gameTick, used in conjunction with the fps.
						lastGameTick = gameTick,
						
						// Will contain different kinds of looping mechanic.
						loopStyles = {},
						
						// Will contain the main loop code.
						loop;
					
					/**
					 * Used to progress the game simulation, process inputs and render
					 * the scene allowing players to play.
					 * @param int gameTick Contains the current frame in ms
					 * @return void
					 */
					loopStyles.interpolation = function (gameTick) {
						// Reset the processed loops.
						loops = 0;

						// We're executing the simulation based on a fixed number of
						// milliseconds, unless the fps drops below the simulation
						// ticks per second.
						while (gameTick > nextGameTick && loops < maxFrameskip) {
							updateGame(nextGameTick);

							nextGameTick += skipTicks;
							loops += 1;
						}

						// Set interpolation to 0, this is encase no updateGame calls
						// were made, and we're just rendering the scene.
						interpolation = 0;

						// As the updateGame wasn't called we need to interpolate the 
						// game state, otherwise objects will jump and jitter around.
						if (loops === 0) {
							interpolation = (gameTick + skipTicks - nextGameTick) / (skipTicks);
						}
						
						// Render the current state of the simulation
						displayGame(interpolation);

						// Execute the loop control, this is basically the loop bit of
						// the game loop :P
						loopControl(loop);
					};
					
					/**
					 * Used to progress the game simulation, process inputs and render
					 * the scene allowing players to play.
					 * @param int gameTick Contains the current frame in ms
					 * @return void
					 */
					loopStyles.noInterpolation = function (gameTick) {
						// Reset the processed loops.
						loops = 0;

						// We're executing the simulation based on a fixed number of
						// milliseconds, unless the fps drops below the simulation
						// ticks per second.
						while (gameTick > nextGameTick && loops < maxFrameskip) {
							updateGame(nextGameTick);
							displayGame();

							nextGameTick += skipTicks;
							loops += 1;
						}

						// Execute the loop control, this is basically the loop bit of
						// the game loop :P
						loopControl(loop);
					};
					
					// Set the correct loop style into the loop variable
					loop = loopStyles[loopStyle];

					// Fire the first hz.
					loop(gameTick);
				};//dewittersGameLoop
				
				return {
					/**
					 * Used to start the game loop
					 * @param void
					 * @return void
					 */
					start: function (updateGame, displayGame) {
						gameLoopEnabled = true;
						
						dewittersGameLoop(
							animStartTime(),
							function (loop) {
								// Makesure the gameloop is still enabled, if it isn't
								// then exit out.
								if (! gameLoopEnabled) {
									return;
								}
								
								requestAnimFrame(function () {
									loop(animStartTime());
								});
							},
							((options.useInterpolation) ? 'interpolation' : 'noInterpolation'),
							updateGame,
							displayGame
						);
					},
					
					/**
					 * Used to stop the game loop
					 * @param void
					 * @return void
					 */
					stop: function () {
						gameLoopEnabled = false;
						interpolation = 0;
					}
				};
			},// factory
		};
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny/browser/core/game-loop')));
/******************************************************************************
 ** File: /thorny/entity-system/base.js                                      **
 ******************************************************************************/
/*global window*/
(function (module) {
	module.exports = function ($, module) {
		// We need to declair the base object before we register the global 
		// version otherwise when we do $('thorny entity-system ...') it loses
		// scope.
		var base = {};
		
		// There is a bunch of stuff we need to do, so do it :D
		$.onInit(module, function () {
			// Bind the entity-system to the thorny object.
			$.registerGlobal('es', function () {
				return base;
			});
			
			// Used to get a specific tag from the entity system
			$.registerGlobal('getTag', function (tag) {
				return $.es().tag.get(tag);
			});
			
			// Contains a list of all known entities.
			$.data(module, 'entities', {});
		});
		
		/**
		 * Used to create a new entity
		 * @param void
		 * @return object Containing an entity
		 */
		base.makeEntity = function () {
			var entity = $('thorny entity-system entity')(arguments);
			
			$.data(module, 'entities')[entity.id] = $('thorny core observer')({
				entity: entity,
				
				/**
				 * Called when an entity is removed.
				 * @param void
				 * @return void
				 */
				remove: function (entity) {
					// Mark the entity as undefined in the collection.
					$.data(module, 'entities')[entity.id] = undefined;
				}
			});
			
			return entity;
		};
		
		/**
		 * Used to get an entity based on its id from the collection.
		 * @param int entityId Contains an entity id
		 * @return object Containing an entity
		 */
		base.getEntity = function (entityId) {
			if ($.data(module, 'entities')[entityId] !== undefined) {
				return $.data(module, 'entities')[entityId].entity;
			}
			return false;
		};
		
		base.inject = {
			/**
			 * Exposes the entity inject function
			 * @param function callback Contains the injector.
			 * @reutrn void
			 */
			entity: function (callback) {
				$('thorny entity-system entity').inject(callback);
			},
			
			/**
			 * Inject stuff into the entity system base class
			 * @param function callback
			 * @reutrn void
			 */
			system: function (callback) {
				callback(base);
			}
		};
		
		/**
		 * Used to access the tagging system.
		 * @param void
		 * @return object Containg the tagging system
		 */
		base.tag = $('thorny entity-system tag');

		/**
		 * Used to access the templating system.
		 * @param void
		 * @return object Containg the templating system
		 */
		base.template = $('thorny entity-system templateable');

		/**
		 * Used to access the spawn system.
		 * @param void
		 * @return object Containg the spawn system
		 */
		base.spawn = $('thorny entity-system spawnable');

		/**
		 * Used to access the component system.
		 * @param void
		 * @return object Containg the component system
		 */
		base.component = $('thorny entity-system component');
		
		return base;
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny/common/entity-system/base')));
/******************************************************************************
 ** File: /thorny/entity-system/hooks.js                                     **
 ******************************************************************************/
/*global window*/
(function (module) {
	module.exports = function ($, module) {
		$.onInit(module, function () {
			var postponeTrigger = {};
			
			$.es().inject.entity(function (entity) {
				/**
				 * Used to hook the $.openFile function directly into an 
				 * entity, which allows us to trigger async events.
				 * @param string path Contains the path to the file we're 
				 * opening for use.
				 * @param function callback Contains a callback that will be
				 * parsed the loaded file.
				 * @reutrn this to allow object chaining
				 */
				entity.openFile = function (path, callback) {
					var entity = this;
					
					if (postponeTrigger[entity.id] === undefined) {
						postponeTrigger[entity.id] = {
							count: 0,
							events: []
						};
					}
					
					postponeTrigger[entity.id].count += 1;
					
					$.openFile(path, function (data) {
						callback(data);
						postponeTrigger[entity.id].count -= 1;
						
						// If this was the last item to complete then trigger 
						// any bound events.
						if (postponeTrigger[entity.id].count === 0) {
							var 
								i,
								ii,
								events = postponeTrigger[entity.id].events;
							
							for (i = 0, ii = events.length; i < ii; i += 1) {
								entity.triggers(events[i]);
							}
						}
					});
					
					return this;
				};
				
				/**
				 * Used to trigger an event once async operations have been 
				 * completed.
				 * @param string varargs Contains the event names we're 
				 * wanting to trigger once a chain of operations has completed.
				 * @return this to allow object chaining
				 */
				entity.triggers = function () {
					var
						i,
						ii,
						events;
					
					if (postponeTrigger[entity.id] === undefined ||
						postponeTrigger[entity.id].count === 0
					) {
						// Trigger the realtime event
						for (i = 0, ii = arguments.length; i < ii; i += 1) {
							// Trigger the belatable event
							$.event().trigger(arguments[i], true);
						}
						
					} else {
						var events = postponeTrigger[entity.id].events;
						
						// Store the belatable event
						for (i = 0, ii = arguments.length; i < ii; i += 1) {
							if (! $._.include(events, arguments[i])) {
								events.push(arguments[i]);
							}
						}
					}
					
					return this;
				};
			});
		});
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny/common/entity-system/hooks')));
/******************************************************************************
 ** File: /thorny/entity-system/entity.js                                    **
 ******************************************************************************/
/*global window*/
(function (module) {
	module.exports = function ($, module) {
		$.onInit(module, function () {
			// Used to create an instance specific unique id.
			$.data(module, 'nextId', (function () {
				var instance = 0;
				return function () {
					return (instance += 1);
				};
			}()));
			
			// Contains a collection of modules which need to inject functionality
			$.data(module, 'injectors', []);
		});
			
		/**
		 * Used to create an entity.
		 * @param array varargs Contains any arguments supplied to customise 
		 * this entity.
		 * @return object Containing an entity
		 */
		var base = function (varargs) {
			var 
				i,	// Used for loop control
				ii,	// Used for loop delimiting
				
				key, 
				// Create a new entity.
				entity = $('thorny core observable')({
					id: $.data(module, 'nextId')(),
					
					/**
					 * Used to remove this entity.
					 * @param void
					 * @return void
					 */
					remove: function () {
						this.notifyObservers('remove');
					}
				}),
				
				// Grab the injectors, and apply them.
				injectors = $.data(module, 'injectors'),
				i,	// Used for loop control
				ii;	// Used for loop delimiting
			
			// If the varargs isn't an array make it one.
			if (varargs === undefined) {
				varargs = [];
			}
			
			// Execute all injector code.
			for (i = 0, ii = injectors.length; i < ii; i += 1) {
				injectors[i](entity);
			}
			
			// Loop over the varargs
			for (i = 0, ii = varargs.length; i < ii; i += 1) {
				switch (varargs[i]) {
				case $.defined('template'):
					entity.makeTemplate();
					break;
				case $.defined('---'):

					break;
				}
			}
			
			// Return the newly created entity.
			return entity;
		};
		
		/**
		 * Used to allow code to be injected into every entity that gets
		 * created.
		 * @param function code Contains code to be injected into every 
		 * entity that gets created.
		 * @return void
		 */
		base.inject = function (code) {
			if (typeof code === 'function') {
				$.data(module, 'injectors').push(code);
			}
		};
		
		return base;
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny/common/entity-system/entity')));
/******************************************************************************
 ** File: /thorny/entity-system/tag.js                                       **
 ******************************************************************************/
/*global window*/
(function (module) {
	module.exports = function ($, module) {
		$.onInit(module, function () {
			$('thorny entity-system entity').inject(function (entity) {
				/**
				 * Used to add the ability to add tags from the entity.
				 * @param string tag Contains the tag that is being 
				 * added to the entity.
				 * @return this Allowing for object chaining
				 */
				entity.addTag = function (tag) {
					$.es().tag.create(this, tag);
					return this;
				};
			});
			
			/**
			 * Contains the entity to tag relationships
			 * @var object
			 */
			$.data(module, 'entity-tags', {});
			
			/**
			 * Contains the tag to entity relationships
			 * @var object
			 */
			$.data(module, 'tags-entity', {});
		});
		
		return {
			/**
			 * Used to create tag an entity
			 * @param object entity Containing the subject of the tag
			 * @param string tag Contains the name of the tag
			 * @return this Allowing object chaining
			 */
			create: function (entity, tag) {
				// Create a link beween the entity and the tag.
				var link = $('thorny core observer')({
					entity: entity,
					tag: tag,
					
					/**
					 * Called when an entity is removed.
					 * @param object entity Contains the entity that we used to
					 * be observing, but has now been removed.
					 * @return void
					 */
					remove: function (entity) {
						if ($.data(module, 'entity-tags')[entity.id] !== undefined) {
							// fetch the entities tag
							var 
								tags = $.data(module, 'entity-tags')[entity.id],
								i,	// Used for loop control
								ii;	// Used for loop delimiting
							
							// Remove all the tags from this collection
							for (i = 0, ii = tags.length; i < ii; i += 1) {
								$.data(module, 'tags-entity')[tags[i].tag] = undefined;
							}
							
							// Mark the entity as undefined in the collection.
							$.data(module, 'entity-tags')[entity.id] = undefined;
						}
					}
				});
				
				// Inject the observer instance into the entity.
				entity.addObserver(link);
				
				// If this is the first time this entity has been tagged, then 
				// we need to create an array for its tags.
				if ($.data(module, 'entity-tags')[entity.id] === undefined) {
					$.data(module, 'entity-tags')[entity.id] = [];
				}
				
				$.data(module, 'entity-tags')[entity.id].push(link);
				$.data(module, 'tags-entity')[tag] = link;
				
				return this;
			},
			
			/**
			 * Used to get a tagged entity.
			 * @param string tag Contains the name of the tag
			 * @return object That contains the tagged entity
			 */
			get: function (tag) {
				if ($.data(module, 'tags-entity')[tag] !== undefined) {
					return $.data(module, 'tags-entity')[tag].entity;
				}
				return false;
			},
			
			/**
			 * Used to remove a tagged entity.
			 * @param string tag Contains the name of the tag
			 * @return this Allowing object chaining
			 */
			remove: function (tag) {
				// fetch the entities tag
				var id = $.data(module, 'tags-entity')[tag].id;
				
				// Mark the entity as undefined in the collection.
				$.data(module, 'tags-entity')[tag] = undefined;
				$.data(module, 'entity-tags')[id] = undefined;
				
				return this;
			}
		};
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny/common/entity-system/tag')));
/******************************************************************************
 ** File: /thorny/entity-system/templateable.js                              **
 ******************************************************************************/
/*global window*/
(function (module) {
	module.exports = function ($, module) {
		$.onInit(module, function () {
			$('thorny entity-system entity').inject(function (entity) {
				/**
				 * This will flag an entity as being a template, if useTag is 
				 * called on a none templated entity it will fail.
				 * What this does is bacisally prevents 'addComponent' from
				 * functioning normally, so rarther than adding components
				 * directly to the entity, it builds a list of calls made to
				 * 'addComponent' so they can be replayed when 'concrete' is 
				 * called at a later point.
				 * @param void
				 * @return this Allowing for object chaining
				 */
				entity.makeTemplate = function () {
					$.data(module, 'templates')[this.id] = true;
					return this;
				};
				
				/**
				 * Used to see if an entity is a template
				 * @param void
				 * @return boolean
				 */
				entity.isTemplate = function () {
					if ($.data(module, 'templates')[entity.id] !== undefined) {
						return $.data(module, 'templates')[entity.id];
					}
					return false;
				};
				
				/**
				 * Used to add items to a template.
				 * @param string component Contains the name of a component to
				 * append to this template
				 * @param object options Contains component specific options
				 * @return boolean if template was added
				 */
				entity.appendTemplate = function (component, options) {
					// We only want to append a template if we are a template.
					if (! this.isTemplate()) {
						return false;
					}
					
					// Makesure instanciate the components list for this 
					// entity.
					if ($.data(module, 'components')[this.id] === undefined) {
						$.data(module, 'components')[this.id] = [];
					}
					
					// And append the component
					$.data(module, 'components')[this.id].push({
						name: component,
						options: options
					});
					
					return true;
				};
				
				/**
				 * Used to turn a template entity into a real entity.
				 * @param string tag Contains a tag that is linked to a
				 * template entity. 
				 * @return this Allowing for object chaining
				 */
				entity.useTag = function (tag) {
					var 
						makeConcrete = $.hasDefined('concrete', arguments),
						components = [];
					tag = $('thorny entity-system base').tag.get(tag);
					
					// If the relationship between the two tags is invalid get
					// us out of here asap.
					//
					//  If the tag doesn't exist it can't be used
					//  ! tag
					//
					//  If the $.defined('concrete') argument is used then the
					//  tag MUST be a template.
					//  (
					//      makeConcrete && 
					//      ! tag.isTemplate()
					//  )
					//
					//  If the $.defined('concrete') ISNT sent, then both this
					//  and the tag MUST be templates.
					//  (
					//      ! makeConcrete && 
					//      (
					//          ! this.isTemplate() || 
					//          ! tag.isTemplate()
					//      )
					//  )
					// )
					if (! tag ||
						(
							makeConcrete && 
							! tag.isTemplate()
						) ||
						(
							! makeConcrete && 
							(
								! this.isTemplate() || 
								! tag.isTemplate()
							)
						)
					) {
						return false;
					}
					
					
					// Concat the tag components into the local variable
					if ($.data(module, 'components')[tag.id] !== undefined) {
						components = components.concat($.data(module, 'components')[tag.id]);
					}
					
					// Concat the this components into the local variable
					if ($.data(module, 'components')[this.id] !== undefined) {
						components = components.concat($.data(module, 'components')[this.id]);
					}
					
					// And put the local variable back in the components.
					$.data(module, 'components')[this.id] = components;
					
					// Make 'this' a concrete entity.
					if (makeConcrete) {
						this.concrete();
					}
					
					return this;
				};
				
				/**
				 * This follows on from isTemplate and useTag, once a template
				 * has been created and useTag'ed the entity needs to have the
				 * 'concrete' function called to turn the list of calls to 
				 * 'addComponent' into active components.
				 * @param void
				 * @return this Allowing for object chaining
				 */
				entity.concrete = function () {
					var 
						i, // for loop current
						ii,// for loop limit
						component,
						components = $.data(module, 'components')[this.id];
						
					// Remove the template tag from this entity.
					$.data(module, 'templates')[this.id] = undefined;
					
					for (i = 0, ii = components.length; i < ii; i += 1) {
						component = components[i];
						if (component.name === undefined) {
							continue;
						}
						
						if (typeof component.options === 'function') {
							this.addComponent(component.name, component.options());
							
						} else {
							this.addComponent(component.name, component.options);
						}
					}
					
					return this;
				};
			});
			
			$.data(module, 'templates', {});
			$.data(module, 'components', {});
		});
		
		
		return {
			
		};
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny/common/entity-system/templateable')));
/******************************************************************************
 ** File: /thorny/entity-system/spawnable.js                                 **
 ******************************************************************************/
/*global window*/
(function (module) {
	module.exports = function ($, module) {
		$.onInit(module, function () {
			$('thorny entity-system entity').inject(function (entity) {
				/**
				 * Exposes the entity to the main game loop, where it can be 
				 * interacted with.
				 * @param void
				 * @return this Allowing for object chaining
				 */
				entity.spawn = function () {
					return this;
				};
			});
		});
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny/common/entity-system/spawnable')));
/******************************************************************************
 ** File: /thorny/entity-system/component.js                                 **
 ******************************************************************************/
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
						return false;
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
				 * @return boolean True if the entity has a specific component
				 */
				entity.executeComponent = function (name) {
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
							component.execute(thisEntity);
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
/******************************************************************************
 ** File: /thorny/component/load-level.js                                    **
 ******************************************************************************/
/*global window*/
(function (module) {
	/**
	 * Used to make an object observable
	 * @param object subject Contains the object that is to be observed
	 * @return object Containing the injected observable functionality.
	 */
	module.exports = function ($, module) {
		$.onInit(module, function () {
			$.data(module, 'loaded-levels', {});
			
			$.es().registerComponent('load-level', function () {
				return {
					/**
					 * Contains an instance of the $.level() module.
					 * @var object level
					 */
					data: false,
					
					/**
					 * One entity can have multiple loads loaded, the ideal would 
					 * be to use one entity as a world, for example
					 * 
					 * $.es().makeEntity()
					 *   .addTag('world')
					 *   .addComponent('load-level', 'some/map/file.format')
					 *   .addComponent('load-level', 'some/other/map/file.format');
					 */
					isUnique: false,
					processAsCollection: true,
					asynchronousAttachEvent: 'load-level-completed',

					/**
					 * Used to attach a level to an entity.
					 * @param object entity Contains the entity we're attatching a
					 * level to.
					 * @param string file Contains the file to load
					 * @return void
					 * @throws 'Thorny.level: Attempted to load malformed level'
					 * @throws component.load-level.attach(n, "path.json"); unable to attach file because type not mesh'
					 */
					attach: function (entity, file) {
						var level = this;
						if (typeof file !== 'string') {
							return false;
						}
						
						// Open the required level
						entity.openFile(file, function (data) {
							// If the level is already loaded, then do nothing.
							if (level.data !== false) {
								return;
							}
							
							// Parse the json data.
							data = $.json.parse(data);
							
							// Makesure the data isn't invalid.
							$.level().validateNotMalformed(data);
							
							var 
								i,
								ii,
								components = entity
									.getComponent('load-level');
							
							// An entity can only ever have one type of level
							// attached, so we need to check the others.
							components.each(function (level) {
								if (level.data !== false &&
									level.data.loadedLevelType !== data.type
								) {
									throw new Error(
										'component.load-level.attach(' + entity.id + ', "' + file + '"); unable to attach file because type not ' + level.data.level.loadedLevelType
									);
								}
							});
							
							// Load the level
							level.data = $.level(data);
							
							// Network seperate levels together.
							components.each(function (existingLevel) {
								// We don't want to network a level to its self.
								if (level === existingLevel || 
									existingLevel.data === false
								) {
									return;
								}
								
								
								var i, ii, distance, from, to;
								for (i = 0, ii = data.network.length; i < ii; i += 1) {
									if (data.network[i].name === existingLevel.data.name) {
										//from = level.data.iterator().stepTo(data.from).node;
										//to = existingLevel.data.iterator().stepTo(data.to).node;
										from = level.data.iterator().stepTo(data.network[i].from).node;
										to = existingLevel.data.iterator().stepTo(data.network[i].to).node;
										
										distance = from.distance(to);
										
										from.addNeighbour(to, {distanceTo: distance});
										to.addNeighbour(from, {distanceTo: distance});
									}
								}
							});
						});
					}
				};
			});// registerComponent load-level
		});// onInit
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny/common/component/load-level')));
/******************************************************************************
 ** File: /thorny/component/pathfindable.js                                  **
 ******************************************************************************/
/*global window*/
(function (module) {
	var 
		/**
		 * Used to expose the default options
		 * @param void
		 * @return object Containing the default options
		 */
		defaultOptions = function () {
			return {
			
			};
		},
	
		/**
		 * Used to expose the execute default options
		 * @param void
		 * @return object Containing the default options
		 */
		executeOptions = function () {
			return {
				from: false,
				to: false
			};
		};
	
	/**
	 * Used to make an object observable
	 * @param object subject Contains the object that is to be observed
	 * @return object Containing the injected observable functionality.
	 */
	module.exports = function ($, module) {
		$.es().registerComponent('pathfindable', function () {
			return {
				attach: function (entity, options) {
					// Without a loaded level its not possible to attatch the
					// pathfindable component.
					//if (! entity.hasComponent('load-level')) {
					//	return false;
					//}
					
					//options = $._.extend(defaultOptions(), options);
					
					// Process a level to make it pathfindable
				},
				
				execute: function (entity, options) {
					options = $._.extend(executeOptions(), options);
					
					// The from and to must be set.
					if (! options.from || ! options.to) {
						return false;
					}
				}
			};
		});
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny/common/component/pathfindable')));
/******************************************************************************
 ** File: /thorny/component/renderer.js                                      **
 ******************************************************************************/
/*global window Processing console*/
(function (module) {
	/**
	 * Used to build the attach options.
	 * @param object $ Contains a reference to thorny
	 * @param object options Contains the attachment specific options
	 * @return object Containing the attached options
	 */
	var attachOptions = function ($, options) {
		if (typeof options !== 'object') {
			options = {};
		}
		return $._.extend((function () {
			return {
				system: false
			};
		}()), options);
	};
	
	module.exports = function ($) {
		$.onInit(module, function () {
			$.data(module, 'draw', {});
			$.es().registerComponent('renderer', function () {
				return {
					/**
					 * Used to attach a renderer to an entity
					 * @param object entity Contains the entity we're adding 
					 * a renderer to.
					 * @param string file Contains the file to load
					 * @return void
					 */
					attach: function (entity, options) {
						options = attachOptions($, options);
						
						$.data(module, 'draw')[entity.id] = 
							$('thorny renderer ' + options.system)
								.attach(options);
					},
					
					/**
					 * Used to execute the renderer
					 * @param void
					 * @return void
					 */
					execute: function (entity) {
						$.data(module, 'draw')[entity.id]();
					}
				};
			});
		});
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny/browser/component/renderer')));
/******************************************************************************
 ** File: /thorny/component/drawable.js                                      **
 ******************************************************************************/
/*global window*/
(function (module) {
	/**
	 * Used to make an object observable
	 * @param object subject Contains the object that is to be observed
	 * @return object Containing the injected observable functionality.
	 */
	module.exports = function ($, module) {
		$.onInit(module, function () {
			$.data(module, 'positions', {});
			
			$.es().registerComponent('drawable', function () {});
		});
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny/common/component/drawable')));
/******************************************************************************
 ** File: /thorny/component/position.js                                      **
 ******************************************************************************/
/*global window*/
(function (module) {
	/**
	 * Used to build the attach options.
	 * @param object $ Contains a reference to thorny
	 * @param object options Contains the attachment specific options
	 * @return object Containing the attached options
	 */
	var attachOptions = function ($, options) {
		if (typeof options !== 'object') {
			options = {};
		}
		return $._.extend((function () {
			return {
				position: {x: 0, y: 0},
				facing: {x: 0, y: 0}
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
			$.data(module, 'positions', {});
			
			$.es().registerComponent('position', function () {
				return {
					attach: function (entity, options) {
						options = attachOptions($, options);
						$.data(module, 'positions')[entity.id] = {
							position: $('thorny math vector2').factory(options.position.x, options.position.y),
							facing: $('thorny math vector2').factory(options.facing.x, options.facing.y).normalize()
						};
					},

					execute: function (entity) {
						return $.data(module, 'positions')[entity.id];
					},
					
					expose: function (entity) {
						return $.data(module, 'positions')[entity.id];
					}
				};
			});
		});
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny/common/component/position')));
/******************************************************************************
 ** File: /thorny/component/moveable.js                                      **
 ******************************************************************************/
/*global window*/
(function (module) {
	/**
	 * Used to build the attach options.
	 * @param object $ Contains a reference to thorny
	 * @param object options Contains the attachment specific options
	 * @return object Containing the attached options
	 */
	var attachOptions = function ($, options) {
		if (typeof options !== 'object') {
			options = {};
		}
		return $._.extend((function () {
			return {
				user_facing: {x: 0, y: 0},
				speed: 1,
				easing: 'linear'// TODO
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
			$.data(module, 'moveable', {});
			
			$.es().registerComponent('moveable', function () {
				return {
					attach: function (entity, options) {
						// The position is required.
						if (! entity.hasComponent('position')) {
							return false;
						}
						
						// Build the options.
						options = attachOptions($, options);
						
						// Build a new movable object.
						$.data(module, 'moveable')[entity.id] = $._.extend(
							entity.getComponent('position').data.expose(entity), {
								user_facing: $('thorny math vector2').factory(options.user_facing.x, options.user_facing.y).normalize(),
								speed: options.speed,
								easing: options.easing,
								current_speed: 0,
								injected_processors: []
							}
						);
					},

					execute: function (entity) {
						var 
							i, 
							ii,
							self = $.data(module, 'moveable')[entity.id],
							processor,
							changes,
							
							// Localised data to allow the processor's to 
							// change the values without requiring access to
							// the internal state.
							direction = self.facing,
							position = self.position, 
							distance = self.speed,
							goal = self.position.translate(
								self.facing,
								distance
								);
						
						// Execute any injected processors.
						for (i = 0, ii = self.injected_processors.length; i < ii; i += 1) {
							processor = self.injected_processors[i];
							
							// Execute the processor code.
							changes = processor(entity, {
								direction: direction,
								position:  position,
								distance:  distance,
								goal:      goal
							});
							
							// Move the changed values back out of the changes
							// object, so that they can used by other
							// processors, and finally inserted into
							// the position.
							direction = changes.direction;
							position  = changes.position;
							distance  = changes.distance;
							goal      = changes.goal;
						}
						
						
						// If a direction is set, update it.
						if (direction) {
							// Set the position and direction back into the 
							// position component.
							self.facing = direction;
							self.position = position.translate(
								direction,
								distance
								);
						}
					},
					
					expose: function (entity) {
						return $.data(module, 'moveable')[entity.id];
					},
					
					inject: function (entity, code) {
						// TODO
						// The Idea here is that other components such as the
						// pathfinder and collision detector can inject 
						// functionality into this
						var self = $.data(module, 'moveable')[entity.id];
						
						self.injected_processors.push(code);
					}
				};
			});
		});
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny/common/component/moveable')));
/******************************************************************************
 ** File: /thorny/component/follow-path.js                                   **
 ******************************************************************************/
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
					name: false,
					route: [],
					type: 'once',
					active: false
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
							node: false,
							route: base.vectorifyRoute(options.route),
							type:  options.type,
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
/******************************************************************************
 ** File: /thorny/level/base.js                                              **
 ******************************************************************************/
/*global window*/
(function (module) {
	// Exposes the a creation method to the outside world.
	module.exports = function ($, module) {
		// Will contain the level system
		var base = {};
		
		$.onInit(module, function () {
			/**
			 * Used to access the level system
			 * @param string|undefined data If string will load the level and 
			 * parse its contents into something usable.
			 * @return object Containing a processed node-collection
			 *
			 *
			 * Usage:
			 * $.level().parse()
			 * $.level('./content/level/room.json');
			 */
			$.registerGlobal('level', function (data) {
				if (data === undefined) {
					return base;
				}
				
				// Makesure the data pretends to be good
				base.validateNotMalformed(data);
				
				// Parse and network the data.
				var
					dataType  = base.dataType(data.type),
					parsed    = base.parse(data, dataType),
					networked = base.network(parsed, dataType);
				
				return networked;
			});
		});
		
		/**
		 * Used to select code to parse and network the loaded file
		 * @param string type Contains the data type
		 * @param boolean|undefined isCompletePath If true uses type as the 
		 * selector, If false|undefined prepends 'thorny level ' to the type
		 * @return object Containing code to parse this loaded level
		 */
		base.dataType = function (type, isCompletePath) {
			if (isCompletePath === true) {
				return $(type);
			}
			return $('thorny level ' + type);
		};
		
		/**
		 * Used to parse raw level data into something remotly usable.
		 * @param object data Containing the raw json loaded from disk
		 * @return object Containing a node-collection.
		 */
		base.parse = function (data, dataType) {
			// Build the level.
			var level = $('thorny level node-collection').factory(
				$('thorny level node').factory(
					$('thorny math vector2').factory(data.x, data.y),
					data.name
					)
				);
			
			// Set the loaded level type.
			level.loadedLevelType = data.type;
			
			// Set the xySearch
			level.xySearch = dataType.xySearch;
			
			// Apply the levels name to the level
			level.name = data.name;
			
			/**
			 * Used to find the width of the level.
			 * @param void
			 * @return int Containing the width of the level
			 */
			level.getWidth = function () {
				return data.width;
			};
			
			/**
			 * Used to find the height of the level.
			 * @param void
			 * @return int Containing the height of the level
			 */
			level.getHeight = function () {
				return data.height;
			};
			
			// Parse the level using the correct parser.
			return dataType
				.parse(
					data.name,
					level,
					data.data
					);
		};
		
		/**
		 * Used to network the node-collection.
		 * @param object level Contains a node-collection
		 * @param string type Contains the type of level we're networking
		 * @return node-collection.
		 */
		base.network = function (level, dataType) {
			// Parse the level using the correct parser.
			return dataType
				.network(
					level
					);
		};
		
		/**
		 * Used to see if a loaded level looks valid.
		 * @param object Containing a raw unparsed level
		 * @return void
		 * @throws 'Thorny.level: Attempted to load malformed level'
		 */
		base.validateNotMalformed = function (data) {
			// Makesure the data looks alright
			if (data.name === undefined ||
				data.type === undefined ||
				data.x === undefined ||
				data.y === undefined ||
				data.width === undefined ||
				data.height === undefined ||
				data.data === undefined ||
				data.network === undefined
			) {
				throw new Error(
					'Thorny.level: Attempted to load malformed level'
				);
			}
			return true;
		};
		
		return false;
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny/common/level/base')));
/******************************************************************************
 ** File: /thorny/level                                                      **
 ******************************************************************************/
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
/******************************************************************************
 ** File: /thorny/level/node-collection.js                                   **
 ******************************************************************************/
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
/******************************************************************************
 ** File: /thorny/level/2d/mesh.js                                           **
 ******************************************************************************/
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
/******************************************************************************
 ** File: /thorny/level/pathfinder/astar.js                                  **
 ******************************************************************************/
/*global window $ console*/
(function (module, undefined) {
	var
		/**
		 * Used to add a unique item to either the open or closed array
		 * @param array open Contains all list paths
		 * @param array item Contains a network node
		 * @return void
		 */
		addUniqueToList = function (list, item) {
			var
				i,	// Used for loop control
				ii;	// Used for loop delimiting
			
			for (i = 0, ii = list.length; i < ii; i += 1) {
				if (list[i] === item) {
					return false;
				}
			}
		
			list.push(item);
		
			return true;
		},
	
		/***
		 * Used to see if an item is within a collection.
		 * @param array list Contains the container for processed nodes
		 * @param object item Contains a network node
		 * @return boolean
		 */
		isUniqueInList = function (list, item) {
			var
				i,	// Used for loop control
				ii;	// Used for loop delimiting
		
			for (i = 0, ii = list.length; i < ii; i += 1) {
				if (list[i] === item) {
					return true;
				}
			}
		
			return false;
		},
	
		/**
		 * Used to remove a unique item from either the open or closed array
		 * @param array list Contains the container for processed nodes
		 * @param object item Contains a network node
		 * @reutrn double Contains the shortened array
		 */
		removeUniqueFromList = function (list, item) {
			var
				i,	// Used for loop control
				ii;	// Used for loop delimiting
			
			for (i = 0, ii = list.length; i < ii; i += 1) {
				if (list[i] === item) {
					return list.slice(0, i).concat(list.slice((i + 1), list.length));
				}
			}
		
			return false;
		},
		
		/**
		 * Used to find the manhattan distance between two points
		 * @param node from Contains the remote node
		 * @param node to Contains the remote node
		 * @return float Containing the manhattan distance between two points
		 */
		calculateHeuristic = function (from, to) {
			return Math.abs(from.getX() - to.getX()) + Math.abs(from.getY() - to.getY());
		},
	
		/**
		 * Used to add a new record to the costs array
		 * @param array open Contains all open nodes
		 * @param array costs Contains search data for this request
		 * @param object o Contains the new open position
		 * @param double heuristic Contains the distance between nodes
		 * @param object parent Contains o's parent
		 * @param double distanceToParent Contains the distance to the parent
		 * @return void
		 */
		addToSearch = function (open, costs, o, heuristic, parent, distanceToParent) {
			var
				toGoal,
				traveled = 0;
			
			// Prep our traveled variable
			if (parent !== false) {
				traveled = (costs[parent.getId()] !== undefined) ? costs[parent.getId()].traveled : 0;
				traveled += distanceToParent;
			}
			
			// Estimate how much further we have to move till we reach the goal.
			toGoal = traveled + heuristic;
			
			// If the new item is already in the open list, no point trying
			// to so anything.
			if (! addUniqueToList(open, o)) {
				if (costs[o.getId()] &&
					traveled < costs[o.getId()].traveled
				) {
					costs[o.getId()].parent = parent.getId();
					costs[o.getId()].heuristic = heuristic;
					costs[o.getId()].traveled = traveled;
					costs[o.getId()].toGoal = toGoal;
				}
				
				return false;
			}
			
			// If the item already has a costs worked out for it then skip onto 
			// the next item.
			if (costs[o.getId()] !== undefined) {
				return false;
			}
			
			costs[o.getId()] = {
				node: o,
				parent: (parent === false) ? false : parent.getId(),
				
				heuristic: heuristic,
				traveled: traveled,
				toGoal: toGoal
			};
		},
	
		/**
		 * Used to add all a nodes child elements to the open array.
		 * @param array network Contains all connections between nodes
		 * @param array open Contains all open nodes
		 * @param array costs Contains search data for this request
		 * @param object from Contains the current location
		 * @param object to   Contains the target location
		 * @param int diameter Contains the diameter of an entity moving
		 * @param function findHeuristic Contains the heuristic function to use.
		 * though the network.
		 * @return void
		 */
		addChildrenToOpen = function (open, costs, from, to, diameter, findHeuristic) {
			var
				neighbours = from.getNeightbours(),
				neighbour,// Contains a single node from the collection
				i,	// Used for loop control
				ii;	// Used for loop delimiting
			
			while ((neighbour = neighbours.step())) {
				// If the diameter is unset, or the diameter is larger than the
				// edge width skip this child.
				if (neighbour.details.edgeWidth !== undefined && 
					neighbour.details.edgeWidth !== false &&
					diameter !== undefined
				) {
					if (diameter > neighbour.details.edgeWidth) {
						continue;
					}
				}
				
				// Add the neighbouring node to the open list.
				addToSearch(
					open,
					costs,
					neighbour.node,
					findHeuristic(from, neighbour.node),
					from,
					neighbour.details.distanceTo
				);
			}
		},
	
		/**
		 * Used to pick the best open node from the 
		 * @param array open Contains
		 * @param array closed Contains
		 * @param object costs Contains
		 * @return object Containing the best location to start the next search.
		 */
		pickBestFromOpen = function (open, closed, costs) {
			var 
				bestO = false,
				bestToGoal = false,
				o,
				toGoal,
				i,	// Used for loop control
				ii;	// Used for loop delimiting
			
			for (i = 0, ii = open.length; i < ii; i += 1) {
				o = open[i];
			
				// Check to see if this node has already need closed.
				if (isUniqueInList(closed, o)) {
					continue;
				}
			
				toGoal = costs[o.getId()].toGoal;
				
				if (bestToGoal === false || bestToGoal >= toGoal) {
					bestO = o;
					bestToGoal = toGoal;
				}
			}
		
			return bestO;
		},
	
		/**
		 * Used to unpack the best path.
		 * @param object costs Contains the movement costs for this request
		 * @param object goal Contains the goal location
		 * @param array route Contains the current route
		 * @return array Containing the order you need to move around the nodelist
		 */
		minePath = function (costs, goal, route) {
			if (route === undefined) {
				route = [];
			}
			
			var next = costs[costs[goal.getId()].parent];
			
			if (next === undefined) {
				route.push(goal);
				return route.reverse();
			}
			
			route.push(goal);
			return minePath(costs, next.node, route);
		};
	
	module.exports = function ($) {
		return {
			/**
			 * Used to search a loaded and processed level collcetion.
			 * @param array from Contains the from node,
			 * @param array to Contains the to node.
			 * @param int diameter Contains the diameter of an entity moving
			 * though the network.
			 * @return array Containing a list of references to nodes.
			 * @throws "Thorny Astar: Invalid start or end."
			 * @throws "Thorny Astar: Cannot find viable path."
			 */
			search: function (from, to, diameter, heuristic) {
				var open = [],
					closed = [],
					costs = {},
					parent = false,
					path,
					fromId,
					toId,
					i,	// Used for loop control
					ii;	// Used for loop delimiting
					
				// If no heuristic function was parsed use the default one.
				if (heuristic === undefined) {
					heuristic = calculateHeuristic;
				}
				
				// Add the starting element to the costs and open array.
				addToSearch(open, costs, from, heuristic(from, to), false);
				
				path = [];
				while (true) {
					if (from === false) {
						throw new Error("Thorny Astar: Cannot find viable path.");
					}
					
					// Test to see if we're at the end of the path.
					if (open.length === 0 || (from === to)) {
						path = minePath(costs, to);
						break;
					}
					
					for (i = 0, ii = open.length; i < ii; i += 1) {
						if (isUniqueInList(closed, open[i])) {
							continue;
						}
						
						addChildrenToOpen(
							open, 
							costs, 
							from, 
							to, 
							diameter, 
							heuristic
							);
					}
					
					addUniqueToList(closed, from);
					open = removeUniqueFromList(open, from);
					
					from = pickBestFromOpen(open, closed, costs);
				}

				return path;
			},//search
			
			/**
			 * Returns all internal functions to make unittesting 
			 * possable.
			 * @param void
			 * @return object
			 */
			__specs: function () {
				return {
					addUniqueToList: addUniqueToList,
					isUniqueInList: isUniqueInList,
					removeUniqueFromList: removeUniqueFromList,
					calculateHeuristic: calculateHeuristic,
					addToSearch: addToSearch,
					addChildrenToOpen: addChildrenToOpen,
					pickBestFromOpen: pickBestFromOpen,
					minePath: minePath
				};
			}
		};
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny/common/level/pathfinder/astar')));
/******************************************************************************
 ** File: /thorny/level/pathfinder/funnel.js                                 **
 ******************************************************************************/
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
/******************************************************************************
 ** File: /thorny/base.js                                                    **
 ******************************************************************************/
/*global console window setInterval clearInterval _*/
/**
 * This is the base module which is the main access point for all interaction
 * with the thorny engine.
 *
 * @package thorny
 * @author Iain Carsberg <iain.carsberg.name>
 * @copyright Copyright (c) 2011, Iain Carsberg
 * @link http://dev.thornyengine.com/2011/05/24/state-of-te/
 */
(function (module) {
	require.paths.unshift(__dirname + '/../');
	
	var
		dirname = __dirname + '/../',
		
		/**
		 * Used to determine if we're dealing with a browser based enviroment 
		 * or a node.js enviroment.
		 * @var boolean
		 */
		isBrowser = (typeof window !== 'undefined') ? true : false,

		/**
		 * Contains a json parser
		 * @var object
		 */
		json = JSON || require('lib/json.js'),
		
		/**
		 * Used to see if a string should point to a file.
		 * @string string string Contains the string we're testing to see if 
		 * its a file or not.
		 * @return boolean
		 */
		isFile = function (string) {
			if (string.substr(0, 2) === './') {
				return true;
			}
			return false;
		},

		/**
		 * Used to open a specific file on disk, or via ajax if in browser mode.
		 * @param string path Contains the path to a file
		 * @param function callback Called once the file has been opened
		 * @return string Containing the contents of a file
		 * @throws "Thorny main.openFile encounted 'exception'"
		 * @throws node.js fs.readFile exception
		 */
		openFile = function (path, callback) {
			if (isBrowser) {
				window.jQuery.ajax({
					url: path.substr(1),
					success: callback,
					error: function (d, e) {
						throw new Error("Thorny main.openFile encounted '" + e + "'");
					},
					
					// We set the dataType to text encase the file is 
					// transmitted as a .json, which automatically gets
					// parsed into javascript. We don't want this to happen
					// because we want it act exactly the same as nodes
					// readFile from the fs module.
					dataType: 'text'						
				});
				
			} else {
				var fs = require('fs');
				
				fs.readFile(
					__dirname + '/../' + path, 
					function (err, data) {
						if (err) {
							throw new Error(err);
						}
						callback(data.toString());
					}
				);
			}
		},
		
		/**
		 * Used to load a module.
		 * @param string modules Contains the name of the module to load
		 * @return object Containing the module
		 * @throws Unknown module
		 */
		loadModule = function (module) {
			var 
				i,	// Used for loop control
				ii,	// Used for loop delimiting
				
				// Contains the root node in the modules path
				root = module.shift(),
				moduleLength = module.length,
				src,
				
				// Contains the path to the module we're trying to load.
				//   domain_path: is the browser/node.js path
				//   common_path: is the common path
				domain_path = root,
				common_path = root,
				
				/**
				 * Used to safly require modules.
				 * @param string path Containing a path to a possible module
				 * @reutrn object|false Containing the module if it exists, 
				  * otherwise false
				 */
				_require = function (path) {
					try {
						// If we're in node.js mode we need to do something a
						// bit more complex to see if a module exists or not.
						if (! isBrowser) {
							// The complex bit is to check to see if the source
							// file exists, on disk, if it does, require it, if
							// not return false.
							if (require('fs').statSync(path + '.js')) {
								return {
									path: path,
									func: require(path)
								};
								
							} else {
								return false;
							}
							
						// In browser land we just return the require function 
						// as it returns false if the module doesn't exist.
						} else {
							var func = require(path);
							if (func !== false) {
								return {
									path: path,
									func: func
								};
							}
							return false;
						}
						
					} catch (e) {
						return false;
					}
				};
			
			// Build the protential path to the protential domain or common 
			// implementation.
			if (moduleLength > 0) {
				domain_path += (isBrowser) ? '/browser' : '/node.js';
				common_path += '/common';
				
				for (i = 0, ii = moduleLength; i < ii; i += 1) {
					domain_path += '/' + module[i];
					common_path += '/' + module[i];
				}
			}
			
			// We want to return objects in order of importance, so domain,
			// common and error.
			return _require(domain_path) || 
			       _require(common_path) || 
			       (function () {
						throw new Error('Unknown module "' + root + ((module.length > 0) ? ' ' : '') + module.join(' ') + '", dont forget that a module must be in a common/browser/node.js subdirectory, ie thorny/common/math/vector2.js');
					}());
		},

		/**
		 * Used to add the modules to the namespace
		 * @param object file Contains a file object
		 * @param object namespace Contains everything currently loaded into 
		 * memory relating to the engine, and the game project.
		 * @return object Containing the modules
		 */
		addModuleToNamespace = function (file, namespace) {
			var
				i,	// Used for loop control
				ii,	// Used for loop delimiting
				modules,
				module,
				pointer,
				loaded,
				modulesLength;
			
			modules = file.path.split(' ');
			modulesLength = modules.length;
			
			pointer = namespace;
			for (i = 0, ii = modulesLength; i < ii; i += 1) {
				module = modules[i];
				if (pointer[module] === undefined) {
					if (i === (modulesLength - 1)) {
						loaded = loadModule(modules);
						pointer['* ' + module] = loaded.func;
						
						if (file.autoexec) {
							file.module = loaded.func;
						}
					} else {
						pointer[module] = {};
					}
				}
				
				pointer = pointer[module];
			}
		},
		
		/**
		 * Used to build an ordered list of modules that need loading into the
		 * game engine.
		 * @param array newItems Contains the source files.
		 * @param function callback Called once all of the class paths have been
		 * discovered and ordered.
		 * @return array Containing all files that need loading
		 */
		buildModuleList = function (newItems, callback) {
			var 
				i,	// Used for loop control
				ii,	// Used for loop delimiting
			
				// Will contain the final list
				list = [],
				
				// Will contain the open list, includes objects, and ./ files
				itemsArray = [],
				
				// Will contain the recursive function to iterate through the
				// itemsArray and populate the list.
				loop,
				
				// Used in the for in below.
				key;
			
			// Convert the newItems object into an array.
			for (i = 0, ii = newItems.length; i < ii; i += 1) {
				itemsArray.push(newItems[i]);
			}
			
			/**
			 * Used to loop over the itemsArray and populate the list array with
			 * modules in the order they need to be loaded.
			 * @param void
			 * @return void
			 */
			loop = function () {
				// If the itemsArray is empty execute the callback.
				if (itemsArray.length === 0) {
					if (typeof callback === 'function') {
						callback(list);
					}
					
					return false;
				}
				
				var 
					// Set file to be the 0th item from the itemsArray
					file = itemsArray.shift(),
					
					// Determine if a module should be automatically executed.
					doAutoexec = false,
					
					// Determine if a module is a component.
					isComponent = false;
				
				// Its possible to place objects in the config files to preform
				// specific actions, this block detects those features and sets
				// the internal state if required.
				if (typeof file === 'object') {
					// Autoexec will automatically execute a block of code on 
					// startup, this allows modules to setup the state for 
					// complex combination modules.
					// See 'common/entity-system/base' for an example.
					if (file.autoexec !== undefined && 
						file.autoexec === true
					) {
						doAutoexec = true;
					}
					
					// If the logic is within the ./module/browser/ directory
					// and you don't want it executing in side of node.js
					// based envrioments then use the omitIfNodejs flag.
					if (file.omitIfNodejs !== undefined &&
						file.omitIfNodejs === true &&
						! isBrowser
					) {
						return loop();
					}
					
					// Alternativly
					// If the logic is within the ./module/node.js/ directory
					// and you don't want it executing in browser based 
					// envrioments then use the omitIfBrowser flag.
					if (file.omitIfBrowser !== undefined &&
						file.omitIfBrowser === true &&
						isBrowser
					) {
						return loop();
					}
					
					// Expose the path to the rest of the loop
					file = file.path;
				}
				
				// If the module is a component then flag this module for
				// automatic execution.
				if (file.indexOf(' component ') > 0 &&
					file.indexOf(' component ') === file.indexOf(' ')
				) {
					isComponent = true;
				}
				
				// Detect if the file is a node path, ie './thorny/...'
				if (isFile(file)) {
					openFile(file, function (data) {
						// parse the data and prepend it onto the itemsArray
						itemsArray = json.parse(data).concat(itemsArray);
						
						// and recurse
						loop();
					});
				
				// Otherwise just push the item into the list, and recurse.
				} else {
					list.push({
						path: file,
						autoexec: (doAutoexec || isComponent),
						module: false
					});
					loop();
				}
			};
			
			// Start the recursive loop...
			loop();
		},
		
		/**
		 * Used to add load of the requested modules in to the engines namespace.
		 * @param array files Contains a list of all required modules.
		 * @param function callback Called once all modules have been loaded 
		 * into the namespace.
		 * @return void
		 */
		processModules = function (files, callback) {
			var
				namespace = {},
				i,	// Used for loop control
				ii;	// Used for loop delimiting
			for (i = 0, ii = files.length; i < ii; i += 1) {
				// Adds a module to the namespace
				addModuleToNamespace(
					files[i],
					namespace
				);
			}
			
			// Start the callback execution process.
			callback(namespace);
		};

	/**
	 * Used to export the base object
	 * @param void
	 * @reutrn void
	 * @throws "./thorny/base: Expects a callback function." which is 
	 * externally uncatachable as its an asyncronus exception.
	 */
	module.exports = function () {
		// Store the arguments temporarily so we can return a function to 
		// collect the callback from the app.js file.
		var varargs = arguments;
		
		// Return a function that accepts a callback to declutter this functions
		// param list, allowing us to process the arguments array in its 
		// unaltered state.
		return function (callback) {
			var
				// The load counter and interval are used to count the number of
				// loaded modules that are listed within the above varargs.
				// We need to declair them this far up because the 
				// processModules is outside of this instance scope, so its
				// possible for multiple interval loaders to trigger based on
				// a single loadCounter === 0 event.
				loadCounter = 0,
				interval = false,
				
				// Contains module instance data
				moduleInstanceData = {},
				
				// Contains a list of initiated modules
				initiatedModules = {};
			
			buildModuleList(varargs, function (list) {
				processModules(list, function (namespace) {
					// If the callback was specified, and its a function execute it.
					if (callback === undefined ||
						typeof callback !== 'function'
					) {
						throw new Error('./thorny/base: Expects a callback function.');
					}
					
					/**
					 * Used to find an item in a collection.
					 * @param string path Contains the item we're looking for
					 * @return object Containing either a required module or a
					 * handler which can be used to find the target.
					 */
					var handle = function (path) {
						// We return a self executing anon function so we can 
						// localise the namespace, which allows us to chain 
						// calls using .find()
						return (function (path) {
							var 
								nsHandle,
								nsFind,
								localNamespace = namespace;
							
							/**
							 * Used to find an item in a collection.
							 * @param string path Contains the item we're 
							 * looking for
							 * @return object Containing either a required 
							 * module or a handler which can be used to find
							 * the target.
							 */
							nsHandle = function (path) {
								if (path === undefined) {
									path = '';
								}
								
								var
									breadcrums = path.split(' '),
									leaf = localNamespace,
									i,	// Used for loop control
									ii;	// Used for loop delimiting
								
								// Loop over the paths breadcrums
								for (i = 0, ii = breadcrums.length; i < ii; i += 1) {
									// Check to see if the leaf exists, if it does 
									// then do nothing, if it doesn't then 
									// reutrn false.
									if (! (leaf = nsFind(breadcrums[i], (i === (ii - 1)) ? true : false))) {
										return false;
									}
								}
								
								return leaf;
							};
							
							/**
							 * Used to find an item in a collection.
							 * @param string item Contains the item we're 
							 * looking for
							 * @return object Containing either a required 
							 * module or a handler which can be used to find
							 * the target.
							 */
							nsHandle.find = nsFind = function (wrapper) {
								if (localNamespace[wrapper] === undefined) {
									if (localNamespace['* ' + wrapper] !== undefined) {
										// If we find a leaf node, we want to 
										// inject the handle into it, which
										// will allow other modules to access
										// loaded content.
										var leafnode = (localNamespace = localNamespace['* ' + wrapper]);
										return leafnode(handle, path);
									}
									
									return false;
								}
								
								localNamespace = localNamespace[wrapper];
								if (typeof localNamespace === 'object') {
									return {
										find: nsFind
									};
									
								} else {
									return localNamespace;
								}
							};
							
							return nsHandle(path);
						}(path || ''));
					};
					
					/**
					 * Used to find an item in a collection.
					 * @param string item Contains the item we're looking for
					 * @return object Containing either a required module or a
					 * handler which can be used to find the target.
					 */
					handle.find = function (item) {
						return handle(item);
					};
					
					/**
					 * Used to store instance data.
					 * @param string module Contains the module being accessed
					 * @param string key Contains the unique key within that
					 * module relating to a block of data.
					 * @reutrn object|false Object if its stored, otherwise false
					 */
					handle.data = function (module, key, value) {
						if (value === undefined) {
							value = false;
						}
						
						if (! moduleInstanceData[module]) {
							moduleInstanceData[module] = {};
						}
						
						if (! moduleInstanceData[module][key]) {
							moduleInstanceData[module][key] = value;
						}
						
						return moduleInstanceData[module][key];
					};
					
					/**
					 * Used to call a block of code only when the page is
					 * initiating for the first time.
					 * @param string module Contains the name of the module
					 * being initated
					 * @param function callback Contains the logic to execute 
					 * on page initiation.
					 * @return void
					 */
					handle.onInit = function (module, callback) {
						if (initiatedModules[module] === undefined) {
							initiatedModules[module] = true;
							callback();
						}
					};
					
					(function () {
						var 
							defines = {},
							count = 1;
						
						/**
						 * Used to access defined variables.
						 * @param string variable Contains the name of a defined 
						 * value that is being looked up.
						 * @return string Containing a defined value
						 */
						handle.defined = function (variable) {
							if (defines[variable] !== undefined) {
								return defines[variable];
							}
							defines[variable] = '0x' + count;
							count += 1;
							return defines[variable];
						};
						
						/**
						 * Used to get the name of the unique code.
						 * @param string variable Contains the unique code
						 * @return string Containing the variable name
						 */
						handle.getDefined = function (code) {
							var key;
							for (key in defines) {
								if (defines.hasOwnProperty(key) && defines[key] === code) {
									return key;
								}
							}
							return false;
						};
						
						/**
						 * Used to see if a value was defined within a list of
						 * arguments supplied.
						 * @param string variable Contains the target defined
						 * @param object items Contains a list of arguments
						 * @return boolean True if variable is in the arguments
						 */
						handle.hasDefined = function (variable, items) {
							var 
								i,	// Used for loop control
								ii,	// Used for loop delimiting
								key,
								vari = handle.defined(variable);
							
							for (i = 0, ii = items.length; i < ii; i += 1) {
								if (items[i] === vari) {
									return true;
								}
							}
							return false;
						};
					}());
					
					/**
					 * Used to register additional modules into the handle.
					 * @param string name Contains the name of the globally
					 * available module.
					 * @param string name Contains the name of the object
					 * @param object module Contains the module.
					 * @return void
					 */
					handle.registerGlobal = function (name, module) {
						if (handle[name] !== undefined) {
							throw new Error(
								'handle.registerGlobal(' + name + ', ' + 
								module + '); global already registered.'
								);
						}
						if (typeof(module) !== 'function') {
							throw new Error(
								'handle.registerGlobal(' + name + ', ' + 
								module + '); module can only be a function.'
								);
						}
						
						// Inject the new globally available shortcut.
						handle[name] = module;
					};
					
					// Add the openFile function to the handle object.
					handle.openFile = openFile;
					
					// Add the ability to parse json to the handle object.
					handle.json = json;
					
					/**
					 * Used to add underscore to thorny.
					 * @param void
					 * @return void
					 */
					if (isBrowser) {
						require('lib/underscore.js');
						handle._ = _;
						
					} else {
						handle._ = require('lib/underscore.js');
					}
					
					// Handle any automatically executing code.
					(function () {
						var 
							item,
							i,	// Used for loop control
							ii;	// Used for loop delimiting
						
						for (i = 0, ii = list.length; i < ii; i += 1) {
							item = list[i];
							
							if (item.autoexec) {
								item.module(handle, item.path);
							}
						}
					}());
					
					// Return the handle.
					callback(handle);
				});//processModules
			});
		};
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny/base')));
/******************************************************************************
 ** File: /thorny/renderer/processing.js                                     **
 ******************************************************************************/
/*global window Processing*/
(function (module) {
	/**
	 * Used to build the attach options.
	 * @param object $ Contains a reference to thorny
	 * @param object options Contains the attachment specific options
	 * @return object Containing the attached options
	 */
	var attachOptions = function ($, options) {
		if (typeof options !== 'object') {
			options = {};
		}
		return $._.extend((function () {
			return {
				element: false,
				width: 320,
				height: 240
			};
		}()), options);
	};
	
	module.exports = function ($) {
		return {
			attach: function (options) {
				options = attachOptions($, options);
				
				var 
					canvas = window.document.getElementById(options.element),
					pjs = new Processing(canvas);
					
				/**
				 * Setup Processing.js
				 * @param void
				 * @return void
				 */
				pjs.setup = function () {
					pjs.size(options.width, options.height);
					pjs.noLoop();
				};
				
				/**
				 * Setup the draw function for Processing.js
				 * @param void
				 * @return void
				 */
				pjs.draw = function () {
					// partially clear, by overlaying a semi-transparent rect  
					// with background color  
					pjs.noStroke();  
					pjs.fill(102, 51, 0);  
					pjs.rect(0, 0, options.width, options.height);  
					// draw the "sine wave" 
					pjs.stroke(51, 153, 0);
					pjs.fill(51, 153, 0);
					
					// Render the world
					$.getTag('world')
						.getComponent('load-level')
						.each(function (level) {
							var 
								polys = level.data.iterator(),
								poly,
								vectors;
							
							while ((poly = polys.step())) {
								vectors = poly.node.getVector2s();
								
								pjs.triangle(
									vectors[0].getX(), vectors[0].getY(),
									vectors[1].getX(), vectors[1].getY(),
									vectors[2].getX(), vectors[2].getY()
									);
							}
						});
					
					// Draw the drawable items to the screen
					$.es().searchByComponents('drawable', 'position')
						.each(function (drawable, position) {
							pjs.fill(98, 126, 100, 200);
							pjs.stroke(98, 126, 100);
							pjs.ellipse(
								position.data.expose(this).position.getX(), 
								position.data.expose(this).position.getY() + 8, 
								18,
								8
								);
							pjs.fill(197, 124, 201);
							pjs.stroke(153, 23, 116);
							pjs.ellipse(
								position.data.expose(this).position.getX(), 
								position.data.expose(this).position.getY(), 
								16,
								16
								);
						});
				};
				
				pjs.setup();
				
				return function () {
					pjs.redraw();
				};
			}
		};
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny/browser/renderer/processing')));