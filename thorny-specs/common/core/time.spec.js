/*global console window describe xdescribe it expect runs waits*/
(function () {
	require.paths.unshift(__dirname + '/../../../');
	
	describe('the core time system', function () {
		it('should have the following functions', function () {
			var ran = false;
				
			runs(function () {
				require('thorny/base')('./config/default.json')(function ($) {
					expect(typeof $.time().time).toEqual('number');
					expect(typeof $.time().now).toEqual('function');
					expect(typeof $.time().tick).toEqual('function');
					
					ran = true;
				});//instanceof thorny
			});
			waits(200);
			runs(function () {
				expect(ran).toBeTruthy();
			});
		});// it should have the following functions
		
		describe('has a now function', function () {
			it('should return a fixed internal time', function () {
				var ran = false;
				runs(function () {
					require('thorny/base')('./config/default.json')(function ($) {
						var old;
						runs(function () {
							old = $.time().now();
						});
						waits(250);
						runs(function () {
							expect($.time().now()).toEqual(old);
							ran = true;
						});
					});//instanceof thorny
				});
				waits(300);
				runs(function () {
					expect(ran).toBeTruthy();
				});
			});// it should return a fixed internal time
		});// desc has a now function
		
		describe('has a tick function', function () {
			it('should return an internal time 50ms later', function () {
				var ran = false;
				runs(function () {
					require('thorny/base')('./config/default.json')(function ($) {
						var old;
						runs(function () {
							$.time().tick();
							old = $.time().now();
						});
						waits(50);
						runs(function () {
							$.time().tick();
							expect($.time().now() - old).toBeGreaterThan(40);
							expect($.time().now() - old).toBeLessThan(60);
							
							ran = true;
						});
					});//instanceof thorny
				});
				waits(300);
				runs(function () {
					expect(ran).toBeTruthy();
				});
			});// it should return an internal time 50ms later
			
			it('should return an internal time 250ms later', function () {
				var ran = false;
				runs(function () {
					require('thorny/base')('./config/default.json')(function ($) {
						var old;
						runs(function () {
							$.time().tick();
							old = $.time().now();
						});
						waits(250);
						runs(function () {
							$.time().tick();
							expect($.time().now() - old).toBeGreaterThan(240);
							expect($.time().now() - old).toBeLessThan(260);
							
							ran = true;
						});
					});//instanceof thorny
				});
				waits(300);
				runs(function () {
					expect(ran).toBeTruthy();
				});
			});// it should return an internal time 250ms later
			
			it('should return an internal time 500ms later', function () {
				var ran = false;
				runs(function () {
					require('thorny/base')('./config/default.json')(function ($) {
						var old;
						runs(function () {
							$.time().tick();
							old = $.time().now();
						});
						waits(500);
						runs(function () {
							$.time().tick();
							expect($.time().now() - old).toBeGreaterThan(490);
							expect($.time().now() - old).toBeLessThan(510);
							
							ran = true;
						});
					});//instanceof thorny
				});
				waits(600);
				runs(function () {
					expect(ran).toBeTruthy();
				});
			});// it should return an internal time 250ms later
		});// desc has a tick function
	});// desc the core time system
}());