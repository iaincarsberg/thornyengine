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