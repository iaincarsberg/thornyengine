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