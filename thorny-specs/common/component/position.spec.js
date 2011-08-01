/*global console window describe xdescribe it expect runs waits*/
(function () {
	require.paths.unshift(__dirname + '/../../../');
	
	describe('the position component', function () {
		it('should have the following functions', function () {
			var ran = false;
			runs(function () {
				require('thorny/base')('./config/default.json')(function ($) {
					var 
						data = $.data(
						'thorny entity-system component',
						'registered-components'
						),
						position;
						
					expect(typeof data.position).toEqual('function');
					
					position = data.position();
					expect(typeof position.attach).toEqual('function');
					expect(typeof position.update).toEqual('function');
					expect(typeof position.execute).toEqual('function');
					expect(position.isUnique).toBeTruthy();
					expect(position.processAsCollection).toBeFalsy();
					
					ran = true;
				});//instanceof thorny
			});
			waits(200);
			runs(function () {
				expect(ran).toBeTruthy();
			});
		});// it should have the following functions
		
		describe('has an attach function', function () {
			it('should build the default positional attributes', function () {
				var ran = false;
				runs(function () {
					require('thorny/base')('./config/default.json')(function ($) {
						// Setup
						$.es().makeEntity()
							.addTag('@0-0 100-0')
							.addComponent('position', {
								facing: {x: 100, y: 0}
							});
						$.es().makeEntity()
							.addTag('@0-0 0-100')
							.addComponent('position', {
								facing: {x: 0, y: 100}
							});
						$.es().makeEntity()
							.addTag('@0-0 50-50')
							.addComponent('position', {
								facing: {x: 50, y: 50}
							});
						$.es().makeEntity()
							.addTag('@12-34 0-0')
							.addComponent('position', {
								position: {x: 12, y: 34}
							});
						$.es().makeEntity()
							.addTag('@-10-10 -50-50')
							.addComponent('position', {
								position: {x: -10, y: 10},
								facing: {x: -50, y: 50}
							});
						
						var 
							data = $.data(
							'thorny component position',
							'positions'
							);
						
						// Tests
						// @0-0 100-0
						expect(data[$.getTag('@0-0 100-0').id].position.getSimpleCoords())
							.toEqual([0, 0]);
						expect(data[$.getTag('@0-0 100-0').id].facing.getSimpleCoords())
							.toEqual([1, 0]);
							
						// @0-0 0-100
						expect(data[$.getTag('@0-0 0-100').id].position.getSimpleCoords())
							.toEqual([0, 0]);
						expect(data[$.getTag('@0-0 0-100').id].facing.getSimpleCoords())
							.toEqual([0, 1]);
						
						// @0-0 50-50
						expect(data[$.getTag('@0-0 50-50').id].position.getSimpleCoords())
							.toEqual([0, 0]);
						expect(data[$.getTag('@0-0 50-50').id].facing.getSimpleCoords())
							.toEqual([0.7071067811865476, 0.7071067811865476]);
						
						// @12-34 0-0
						expect(data[$.getTag('@12-34 0-0').id].position.getSimpleCoords())
							.toEqual([12, 34]);
						expect(data[$.getTag('@12-34 0-0').id].facing.getSimpleCoords())
							.toEqual([0, 0]);
						
						// @-10-10 -50-50
						expect(data[$.getTag('@-10-10 -50-50').id].position.getSimpleCoords())
							.toEqual([-10, 10]);
						expect(data[$.getTag('@-10-10 -50-50').id].facing.getSimpleCoords())
							.toEqual([-0.7071067811865476, 0.7071067811865476]);
						
						ran = true;
					});//instanceof thorny
				});
				waits(200);
				runs(function () {
					expect(ran).toBeTruthy();
				});
			});// it should build the default positional attributes
		});// desc has an attach function
		
		describe('has an execute function', function () {
			it('should expose the values allowing this position to be used', function () {
				var i = 0, ran = false;
				runs(function () {
					require('thorny/base')('./config/default.json')(function ($) {
						var 
							entities = [
								$.es().makeEntity().addComponent('position', {
									position: {x: 12, y: 34}
								}),
								$.es().makeEntity().addComponent('position', {
									position: {x: 56, y: 67}
								}),
								$.es().makeEntity().addComponent('position', {
									position: {x: 89, y: 1}
								})
							],
							expected = [
								{x: 12, y: 34},
								{x: 56, y: 67},
								{x: 89, y: 1}
							];
						
						
						// Draw the drawable items to the screen
						$.es().searchByComponents('position')
							.each(function (position) {
								expect(position.data.expose(this).position.getX())
									.toEqual(expected[i].x);
								expect(position.data.expose(this).position.getY())
									.toEqual(expected[i].y);
									
								i += 1;
								
								ran = true;
							});
					});//instanceof thorny
				});
				waits(200);
				runs(function () {
					expect(ran).toBeTruthy();
					expect(i).toEqual(3);
				});
			});// it should expose the values allowing this position to be used
		});// desc has an execute function
	});// desc the position component
}());