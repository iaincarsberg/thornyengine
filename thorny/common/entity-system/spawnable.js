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