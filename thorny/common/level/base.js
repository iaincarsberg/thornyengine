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