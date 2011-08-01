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
						
						// Update the loop
						$.time().tick();
						
						dewittersGameLoop(
							$.time().now(),
							function (loop) {
								// Makesure the gameloop is still enabled, if it isn't
								// then exit out.
								if (! gameLoopEnabled) {
									return;
								}
								
								requestAnimFrame(function () {
									$.time().tick();
									loop($.time().now());
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