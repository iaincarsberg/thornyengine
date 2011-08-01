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