/*
---
name: YUITest.Configs

description: Holds various configurations for the test. Note that when the
	script tries to load the configs, it will load the configs from the test
	suite if there are any, then the testee, and finally the tester.

authors: Duc Tri le

requires: YUITest

provides: YUITest.Configs
...
*/
YUITest.Configs = {
	/**
	 * @var String	CSS selector for the element on the test suite page that
	 * 		logs results from all test pages.
	 */
	global_logger: '#logger',

	/**
	 * @var Array	An array containing the relative path to the pages to test.
	 * 		The path should begin with a slash.
	 */
	pages: [],

	/**
	 * @var String	Template for the result HTML.
	 */
	result_tpt: '<ul id="{id}">' +
		'<li>Duration: {duration} seconds</li>' +
		'<li>Ignored Tests: {ignored}</li>' +
		'<li>Failed Tests: {failed}</li>' +
		'<li>Passed Tests: {passed}</li>' +
		'<li>Total Tests: {total}</li>' +
	'</ul>',

	/**
	 * @var String	The CSS selector for the element on the Testee page whose
	 * 		innerHTML contains the name of test cases (separated by commas) to
	 * 		test.
	 */
	test_cases_selector: '#test_cases',

	/**
	 * @var String	The type for the tester. Possible values are:
	 * 		- iframe: The tester will be load into an iframe on the testee.
	 * 		- window: The tester will be popped to its own window. Default.
	 */
	tester_type: 'window',

	// ---------------------------------------------------------------------- //

	/**
	 * @var Object	The configurations provided by the user.
	 */
	$user_configs: null,

	// ---------------------------------------------------------------------- //

	/**
	 * Load the configurations.
	 *
	 * @returns void
	 */
	load: function() {
		var me = YUITest.Configs;

		// If there is a global $C variable, load the container's configs first
		if($C && $C.YUITest) {
			// If there is a global $C.$C, then we are on the tester page in
			// which case there maybe even another container
			if($C.$C && $C.$C.YUITest && $C.$C.YUITest.Configs.$user_configs) {
				me._load($C.$C.YUITest.Configs.$user_configs);
			}

			if($C.YUITest.Configs.$user_configs) {
				me._load($C.YUITest.Configs.$user_configs);
			}
		}

		// Lastly, load this page's configs
		if(me.$user_configs) { me._load(me.$user_configs); }
	},
	_load: function(configs) {
		$Y.Object.each(YUITest.Configs, function(value, key) {
			YUITest.Configs[key] = value;
		});
	},

	/**
	 * Set the provided configs. Note that this function will overwrite any
	 * existing configurations.
	 *
	 * @param Object	configs		The configurations to set.
	 * @returns void
	 */
	set: function(configs) {
		YUITest.Configs.$user_configs = configs;
	}
};
