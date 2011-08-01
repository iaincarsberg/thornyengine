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