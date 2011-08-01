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