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