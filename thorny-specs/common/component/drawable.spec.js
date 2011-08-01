/*global console window describe xdescribe it expect runs waits*/
(function () {
	require.paths.unshift(__dirname + '/../../../');
	
	describe('the drawable component', function () {
		it('should have the following functions', function () {
			var ran = false;
				
			runs(function () {
				require('thorny/base')('./config/default.json')(function ($) {
					var entity = $.es().makeEntity()
						.addComponent('drawable');
					
					ran = true;
				});//instanceof thorny
			});
			waits(200);
			runs(function () {
				expect(ran).toBeTruthy();
			});
		});// it should have the following functions
		
		it('should mark entities as drawable', function () {
			var 
				ran = false,
				item = 0,
				items = [1, 3, 5];
				
			runs(function () {
				require('thorny/base')('./config/default.json')(function ($) {
					$.es().makeEntity().addComponent('drawable');
					$.es().makeEntity();
					$.es().makeEntity().addComponent('drawable');
					$.es().makeEntity();
					$.es().makeEntity().addComponent('drawable');
					$.es().makeEntity();
					
					
					$.es().searchByComponents('drawable')
						.each(function (drawable) {
							ran = true;
							
							expect(this.id).toEqual(items[item]);
							
							item += 1;
						});
				});//instanceof thorny
			});
			waits(200);
			runs(function () {
				expect(ran).toBeTruthy();
				expect(item).toEqual(3);
			});
		});// it should mark entities as drawable
	});// desc the drawable component
}());