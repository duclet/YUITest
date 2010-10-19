/*
---
name: Base

description: JavaScript testing with YUI 3 Test. Note that the most up to date
	version of this is available on github at: http://github.com/duclet/YUITest

authors: Duc Tri Le

provides: [Base, TestCases]
...
*/
var YUITest = {
	/**
	 * @var String	The current version number.
	 */
	version: 0.2,

	/**
	 * @var Object	All the test cases. Note that the value of each property
	 * 		should just be an object that will be passed to Y.Test.Case's
	 * 		constructor.
	 */
	TestCases: {},

	/**
	 * Load YUI. Note that this requires that YUI has already been loaded with
	 * the url: http://yui.yahooapis.com/3.2.0/build/yui/yui-min.js
	 *
	 * @param Function	funct		The function to run after YUI has been
	 * 		loaded.
	 * @param Boolean	set_global	Whether or not to set the Y object to the
	 *		global variable $Y. Optional and defaults to false.
	 * @returns void
	 */
	loadYUI: function(funct, set_global) {
		// Wrapper the provided function if set_global is true
		if(set_global) {
			var old_funct = funct;
			funct = function(Y) {
				window.$Y = Y;
				old_funct.apply(this);
			};
		}

		YUI().use('node', 'console', 'test', funct);
	}
};
