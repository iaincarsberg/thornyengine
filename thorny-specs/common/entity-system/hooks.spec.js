/*global console window describe xdescribe it expect runs waits*/
(function () {
	require.paths.unshift(__dirname + '/../../../');
	
	describe('the hooked in components', function () {
		it('should have the following functions', function () {
			var ran = false;
			runs(function () {
				require('thorny/base')('./config/default.json')(function ($) {
					var entity = $('thorny entity-system base').makeEntity();
						
					expect(typeof entity.openFile).toEqual('function');
					expect(typeof entity.triggers).toEqual('function');
					
					ran = true;
				});//instanceof thorny
			});
			waits(200);
			runs(function () {
				expect(ran).toBeTruthy();
			});
		});//it should have the following functions
		
		describe('the openFile function', function () {
			it('should open a specific file', function () {
				var 
					ran = false,
					hello = false,
					lorem = false;
				runs(function () {
					require('thorny/base')('./config/default.json')(function ($) {
						$.es().makeEntity()
							.openFile('./thorny-spec-demo/files/hello.txt', function (contents) {
								expect(contents).toEqual('world');
								hello = true;
							});
							
						$.es().makeEntity()
							.openFile('./thorny-spec-demo/files/lorem.txt', function (contents) {
								expect(contents).toEqual('Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.');
								lorem = true;
							});
						ran = true;
					});//instanceof thorny
				});
				waits(200);
				runs(function () {
					expect(ran).toBeTruthy();
					expect(hello).toBeTruthy();
					expect(lorem).toBeTruthy();
				});
			});//it should open a specific file
		});// desc the openFile function
		
		describe('the triggers function', function () {
			it('should trigger event', function () {
				var 
					ran = false,
					defined = false,
					belated = false;
				runs(function () {
					require('thorny/base')('./config/default.json')(function ($) {
						// Bind the defined event
						$.event().bind('defined', function () {
							defined = true;
						});
						
						// Triggers both the defined and belated events
						$.es().makeEntity()
							.triggers('defined', 'belated');
						
						// Bind the belated event
						$.event().bind('belated', function () {
							belated = true;
						});
						
						ran = true;
					});//instanceof thorny
				});
				waits(200);
				runs(function () {
					expect(ran).toBeTruthy();
					expect(defined).toBeTruthy();
					expect(belated).toBeTruthy();
				});
			});//it should trigger event
		});// desc the triggers function
	});//the hooked in components
}());