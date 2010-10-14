/*
---
name: YUITest.Configs

description: Holds various configurations for the test. Note that when the
	script tries to load the configs, it will load the configs from the test
	suite if there are any, then the testee, and finally the tester.

authors: Duc Tri Le

requires: Base

provides: Configs
...
*/
YUITest.Configs = {
	/**
	 * @var String	The ID for the element on the test suite page that contains
	 * 		the final tally of all test results.
	 */
	final_tally: 'final_tally_result',

	/**
	 * @var String	CSS selector for the element on the test suite page that
	 * 		logs results from all test pages.
	 */
	global_logger: '#logger',

	/**
	 * @var Object	Configurations for the global logger.
	 */
	global_logger_config: {
		height: '95%',
		newestOnTop: false,
		width: '500px'
	},

	/**
	 * @var Array	An array containing the relative path to the pages to test.
	 * 		The path should begin with a slash.
	 */
	pages: [],

	/**
	 * @var String	Template for the result HTML.
	 */
	result_tpt: '<ul id="{id}">' +
		'<li class="duration" data-value="{duration}">Duration: {duration} seconds</li>' +
		'<li class="ignored" data-value="{ignored}">Ignored Tests: {ignored}</li>' +
		'<li class="failed" data-value="{failed}">Failed Tests: {failed}</li>' +
		'<li class="passed" data-value="{passed}">Passed Tests: {passed}</li>' +
		'<li class="total" data-value="{total}">Total Tests: {total}</li>' +
	'</ul>',

	/**
	 * @var String	The CSS selector for the element on the testee page whose
	 * 		innerHTML contains the name of test cases (separated by commas) to
	 * 		test.
	 */
	test_cases_selector: '#test_cases',

	/**
	 * @var String	Template for the ID of each testee information div on the
	 * 		test suite page.
	 */
	testee_id_tpt: 'testee_{counter}',

	/**
	 * @var String	The type for the testee. Possible values are:
	 * 		- iframe: The testee will be loaded into an iframe on the test
	 * 			suite.
	 * 		- window: The testee will be popped to its own window. Default.
	 */
	testee_type: 'window',

	/**
	 * @var String	The unique name for the testee window.
	 */
	testee_window_name: 'yuitest_testee',

	/**
	 * @var String	The CSS selector for the element on the tester page that
	 * 		will hold the logger.
	 */
	tester_logger: '#logger',

	/**
	 * @var Object	Configurations for the logger on the tester page.
	 */
	tester_logger_config: {
		height: '500px',
		newestOnTop: false,
		width: '95%',
		style: 'inline'
	},

	/**
	 * @var String	The type for the tester. Possible values are:
	 * 		- iframe: The tester will be load into an iframe on the testee.
	 * 		- window: The tester will be popped to its own window. Default.
	 */
	tester_type: 'window',

	/**
	 * @var String	Template for generating the URL of the tester.
	 */
	tester_url_tpt: '{protocol}//{host}/tests/unit_test.php',

	/**
	 * @var String	The unique name for the tester window/iframe.
	 */
	tester_window_name: 'yuitest_tester',

	// ---------------------------------------------------------------------- //

	/**
	 * @var Object	The configurations provided by the user.
	 */
	$user_configs: null,

	// ---------------------------------------------------------------------- //

	/**
	 * Load the configurations.
	 *
	 * @returns YUITest.Configs
	 */
	load: function() {
		var me = YUITest.Configs;
		var set = function(configs) {
			$Y.Object.each(configs, function(value, key) { me[key] = value; });
		};
		var recursion = function(current) {
			// Load the container's configurations first
			if(current.$C && current.$C.YUITest) { recursion(current.$C); }

			// Now load the configurations if there are any
			if(current.YUITest && current.YUITest.Configs.$user_configs) {
				set(current.YUITest.Configs.$user_configs);
			}
		};

		// Recursively load the configurations so the children configurations
		// will overwrite the parent's configurations
		recursion(window);
		return me;
	},

	/**
	 * Set the provided configs. Note that this function will overwrite any
	 * existing configurations.
	 *
	 * @param Object	configs		The configurations to set.
	 * @returns YUITest.Configs
	 */
	set: function(configs) {
		var me = YUITest.Configs;
		me.$user_configs = configs;
		return me;
	}
};
