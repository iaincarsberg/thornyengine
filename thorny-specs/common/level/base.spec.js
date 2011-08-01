/*global console window describe it expect runs waits*/
(function () {
	require.paths.unshift(__dirname + '/../');
	
	describe('the level base system', function () {
		it('should have the following functions', function () {
			var ran = false;
			runs(function () {
				require('thorny/base')('./config/default.json')(function ($) {
					var level = $.level();
					
					expect(typeof level.dataType).toEqual('function');
					expect(typeof level.parse).toEqual('function');
					expect(typeof level.network).toEqual('function');
					expect(typeof level.validateNotMalformed).toEqual('function');
					
					ran = true;
				});//instanceof thorny
			});
			waits(200);
			runs(function () {
				expect(ran).toBeTruthy();
			});
		});//it should have the following functions
		
		describe('the dataType function', function () {
			it('should test the ability to correctly load the parser', function () {
				var ran = false;
				runs(function () {
					require('thorny/base')('./config/thorny-spec-demo.json')(function ($) {
						var
							level = $.level(),						
							mesh2d = level.dataType('2d mesh'),
							fakeShape = level.dataType('thorny-spec-demo level fake shape', true),
							unknownOne = level.dataType('2d qwertyuiop'),
							unknownTwo = level.dataType('thorny-spec-demo level fake qwertyuiop', true);
						
						// Check the 2d mesh
						expect(typeof mesh2d).toEqual('object');
						expect(typeof mesh2d.parse).toEqual('function');
						expect(typeof mesh2d.network).toEqual('function');
						
						// Check the fake shape
						expect(typeof fakeShape).toEqual('object');
						expect(typeof fakeShape.parse).toEqual('function');
						expect(typeof fakeShape.network).toEqual('function');
						
						// Check for the unknown
						expect(unknownOne).toBeFalsy();
						expect(unknownTwo).toBeFalsy();
						
						ran = true;
					});//instanceof thorny
				});
				waits(200);
				runs(function () {
					expect(ran).toBeTruthy();
				});
			});//it should test the ability to correctly load the parser
		});// desc the dataType function
		
		describe('the parse function', function () {
			it('should return the result from the fake processer', function () {
				var ran = false;
				runs(function () {
					require('thorny/base')('./config/thorny-spec-demo.json')(function ($) {
						var 
							level = $.level(),
							fakeShape = level.dataType('thorny-spec-demo level fake shape', true),
							returned = level.parse({
								name: 'fake level',
								type: 'fake shape',
								x: 0,
								y: 0,
								width: 10,
								height: 10,
								data: [],
								network: []
							}, fakeShape);
						
						// Makesure the parsed value is reutned from the fake 
						// shape data type.
						expect(returned).toEqual('parsed');

						ran = true;
					});//instanceof thorny
				});
				waits(200);
				runs(function () {
					expect(ran).toBeTruthy();
				});
			});//it should return the result from the fake processer
		});// desc the parse function
		
		describe('the network function', function () {
			it('should return the result from the fake processer', function () {
				var ran = false;
				runs(function () {
					require('thorny/base')('./config/thorny-spec-demo.json')(function ($) {
						var 
							level = $.level(),
							fakeShape = level.dataType('thorny-spec-demo level fake shape', true),
							returned = level.network({}, fakeShape);
						
						// Makesure the parsed value is reutned from the fake 
						// shape data type.
						expect(returned).toEqual('networked');

						ran = true;
					});//instanceof thorny
				});
				waits(200);
				runs(function () {
					expect(ran).toBeTruthy();
				});
			});//it should return the result from the fake processer
		});// desc the network function
		
		describe('the validateNotMalformed function', function () {
			it('should throw exceptions on invalid data', function () {
				var ran = false;
				runs(function () {
					require('thorny/base')('./config/thorny-spec-demo.json')(function ($) {
						var level = $.level();
						
						// Try one valid request.
						expect(level.validateNotMalformed({
							name: 'fake level',
							type: 'fake shape',
							x: 0,
							y: 0,
							width: 10,
							height: 10,
							data: [],
							network: []
						})).toBeTruthy();
						
						// Then a bunch of fake ones
						try {
							level.validateNotMalformed({});
							expect(false).toBeTruthy();
						} catch (e) {
							expect(true).toBeTruthy();
						}
						
						try {
							level.validateNotMalformed({
									type: 'fake shape',
									x: 0,
									y: 0,
									width: 10,
									height: 10,
									data: [],
									network: []
							});
							expect(false).toBeTruthy();
						} catch (e) {
							expect(true).toBeTruthy();
						}
						
						try {
							level.validateNotMalformed({
									name: 'fake level',
									x: 0,
									y: 0,
									width: 10,
									height: 10,
									data: [],
									network: []
							});
							expect(false).toBeTruthy();
						} catch (e) {
							expect(true).toBeTruthy();
						}
						
						try {
							level.validateNotMalformed({
									name: 'fake level',
									type: 'fake shape',
									y: 0,
									width: 10,
									height: 10,
									data: [],
									network: []
							});
							expect(false).toBeTruthy();
						} catch (e) {
							expect(true).toBeTruthy();
						}
						
						try {
							level.validateNotMalformed({
									name: 'fake level',
									type: 'fake shape',
									x: 0,
									width: 10,
									height: 10,
									data: [],
									network: []
							});
							expect(false).toBeTruthy();
						} catch (e) {
							expect(true).toBeTruthy();
						}
						
						try {
							level.validateNotMalformed({
									name: 'fake level',
									type: 'fake shape',
									x: 0,
									y: 0,
									height: 10,
									data: [],
									network: []
							});
							expect(false).toBeTruthy();
						} catch (e) {
							expect(true).toBeTruthy();
						}
						
						try {
							level.validateNotMalformed({
									name: 'fake level',
									type: 'fake shape',
									x: 0,
									y: 0,
									width: 10,
									data: [],
									network: []
							});
							expect(false).toBeTruthy();
						} catch (e) {
							expect(true).toBeTruthy();
						}
						
						try {
							level.validateNotMalformed({
									name: 'fake level',
									type: 'fake shape',
									x: 0,
									y: 0,
									width: 10,
									height: 10,
									network: []
							});
							expect(false).toBeTruthy();
						} catch (e) {
							expect(true).toBeTruthy();
						}
						
						try {
							level.validateNotMalformed({
									name: 'fake level',
									type: 'fake shape',
									x: 0,
									y: 0,
									width: 10,
									height: 10,
									data: []
							});
							expect(false).toBeTruthy();
						} catch (e) {
							expect(true).toBeTruthy();
						}

						ran = true;
					});//instanceof thorny
				});
				waits(200);
				runs(function () {
					expect(ran).toBeTruthy();
				});
			});//it should return the result from the fake processer
		});// desc the validateNotMalformed function
	});// desc the level base system
}());