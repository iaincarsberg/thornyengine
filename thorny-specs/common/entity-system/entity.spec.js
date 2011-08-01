/*global console window describe xdescribe it expect runs waits*/
(function () {
	require.paths.unshift(__dirname + '/../../../');
	require('thorny/base')('./config/default.json')(function ($) {
		describe('entity-system/entity', function () {
			it('should have the following functions', function () {
				var entity = $('thorny entity-system entity')();
				
				expect(typeof entity.addObserver).toEqual('function');
				expect(typeof entity.notifyObservers).toEqual('function');
				expect(typeof entity.remove).toEqual('function');
			});//it
			
			it('should be an entity with a unique incromenting id', function () {
				expect($('thorny entity-system entity'))
					.toMatch({
						id: 1
					});
				expect($('thorny entity-system entity'))
					.toMatch({
						id: 2
					});
				expect($('thorny entity-system entity'))
					.toMatch({
						id: 3
					});
				expect($('thorny entity-system entity'))
					.toMatch({
						id: 4
					});
				expect($('thorny entity-system entity'))
					.toMatch({
						id: 5
					});
			});//it
		});//desc entity-system/entity
	});//instanceof thorny
}());