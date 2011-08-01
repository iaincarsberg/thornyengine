/*global console window describe xdescribe it expect runs waits*/
(function () {
	require.paths.unshift(__dirname + '/../../../');
	require('thorny/base')('./config/default.json')(function ($) {
		describe('observer and observerable interaction', function () {
			it('should allow an observable to execute code in an observer', function () {
				var
					hasRegistered = false,
					hasDanced = false,
					observer = $('thorny core observer')({
						onRegister: function () {
							hasRegistered = true;
						},
						dance: function () {
							hasDanced = true;
						}
					}),
					observable = $('thorny core observable')({
						
					});
				
				observable.addObserver(observer);
				observable.notifyObservers('dance');
				
				expect(hasRegistered).toBeTruthy();
				expect(hasDanced).toBeTruthy();
			});//it
			
			it('should call the observers notifyHandler if something goes wrong', function () {
				var
					hasErrored = false,
					observer = $('thorny core observer')({
						onRegister: function () {
							throw new Error('Managed error!!!');
						},
						notifyHandler: function (e) {
							hasErrored = true;
							expect(e.message).toEqual('Managed error!!!');
						}
					}),
					observable = $('thorny core observable')({
						
					});
				
				observable.addObserver(observer);
				observable.notifyObservers('dance');
				
				expect(hasErrored).toBeTruthy();
			});
			
			
			describe('notifyObservers', function () {
				it('should return the correct number of triggered observers', function () {
					var
						observable = $('thorny core observable')({}),
						observerA = $('thorny core observer')({
							a: function () {}
							}),
						observerB = $('thorny core observer')({
							a: function () {},
							b: function () {}
							}),
						observerC = $('thorny core observer')({
							a: function () {},
							b: function () {},
							c: function () {}
							});
						
					observable.addObserver(observerA);
					observable.addObserver(observerB);
					observable.addObserver(observerC);
					
					expect(observable.notifyObservers('a')).toEqual(3);
					expect(observable.notifyObservers('b')).toEqual(2);
					expect(observable.notifyObservers('c')).toEqual(1);
					
				});// it should return the correct number of triggered observers
			});// desc describe
		});//desc observer and observerable interaction
	});//instanceof thorny
}());