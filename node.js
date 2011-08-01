/*global window*/
(function (window, undefined) {
	// Contains all files that are loaded into the dom.
	var domain = {};
	
	
	window.__dirname = '';
	
	/**
	 * Used to gain access to modules that have been exported to the
	 * browser.
	 * @param string filename Containing the required module.
	 * @return object
	 */
	window.require = function (filename) {
		var domainify = function (filename) {
			if (filename.substring(0, 2) !== './') {
				return './' + filename;
			}
			return filename;
		};

		filename = domainify(filename);
		
		if (domain[filename] === undefined) {
			return false;
		}
		
		return domain[filename].exports;
	};
	
	window.require.paths = {
		unshift: function () {}
	};
	
	/**
	 * Used to provide a handle
	 * @param string filename Contains the filename of the module
	 * being loaded.
	 * @return object
	 */
	window.thorny_path = function (filename) {
		if (domain[filename] === undefined) {
			domain[filename] = {
				exports: {}
			};
		}
		
		// And wrap it up ready to ship off into nodejs compatability land.
		return domain[filename];
	};
}(window));