/*global console window describe xdescribe it expect runs waits*/
(function () {
	require.paths.unshift(__dirname + '/../../../');
	require('thorny/base')('./config/default.json')(function ($) {
		describe('observable', function () {
			it('should add the following functions', function () {
				var 
					item = {},
					processed = $('thorny core observable')(item);
				
				expect(item).toEqual(processed);
				expect(typeof item.addObserver).toEqual('function');
				expect(typeof item.notifyObservers).toEqual('function');
				
				describe('addObserver', function () {
					it('should add an observer to its internal collection', function () {
						var 
							hasRan = false,
							subject = {
								onRegister: function () {
									hasRan = true;
								},
								notify: function (eventName, observable) {
									if (typeof this[eventName] === 'function') {
										try {
											this[eventName](observable);
										} catch (e) {
											// Do nothing
										}
									}
								}
							},
							observable = $('thorny core observable')({});
						
						observable.addObserver(subject);
						expect(hasRan).toBeTruthy();	
					});//it
					
					it('shouldnt add an observer to its internal collection, because the subject has no notify function', function () {
						var 
							hasntRan = true,
							subject = {
								onRegister: function () {
									hasntRan = false;
								}
							},
							observable = $('thorny core observable')({});
						
						observable.addObserver(subject);
						expect(hasntRan).toBeTruthy();	
					});//it
					
					it('should surpress any errors', function () {
						var 
							subject = {
								onRegister: function () {
									throw new Error('Surpressed error!!!');
								},
								notify: function (eventName, observable) {
									if (typeof this[eventName] === 'function') {
										try {
											this[eventName](observable);
										} catch (e) {
											// Do nothing
										}
									}
								}
							},
							observable = $('thorny core observable')({});
						
						try {
							observable.addObserver(subject);
							expect(true).toBeTruthy();
							
						} catch (e) {
							expect(false).toBeTruthy();
						}
					});//it
				});//desc addObserver
				
				describe('notifyObservers', function () {
					it('should add an observer to its internal collection', function () {
						var 
							hasRan = false,
							subject = {
								dance: function () {
									hasRan = true;
								},
								notify: function (eventName, observable) {
									if (typeof this[eventName] === 'function') {
										try {
											this[eventName](observable);
										} catch (e) {
											// Do nothing
										}
									}
								}
							},
							observable = $('thorny core observable')({});

						observable.addObserver(subject);
						expect(hasRan).toBeFalsy();	
						observable.notifyObservers('dance');
						expect(hasRan).toBeTruthy();	
					});//it
				});//desc notifyObservers
			});//it
		});// desc observable
	});//instanceof thorny
}());