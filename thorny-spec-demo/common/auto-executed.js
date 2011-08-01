/*global window*/
(function (module) {
	module.exports = function ($, module) {
		var base = {};
		$.onInit(module, function () {
			$.registerGlobal('catch_phrases', function () {
				return base;
			});
		});
		
		// Add arnie's catch-phrase to the base object
		base.arnie = [
			"I'll",
			'be',
			'back'
		];
		
		// Add GLaDOS's catch-phrase to the base object
		base.glados = [
			'the',
			'cake',
			'is',
			'a',
			'lie'
		];
	};
}((typeof window === 'undefined') ? module : window.thorny_path('./thorny-spec-demo/common/auto-executed')));