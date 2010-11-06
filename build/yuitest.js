/*
---
name: Base

description: JavaScript testing with YUI 3 Test. Note that the most up to date version of this is
	available on github at: http://github.com/duclet/YUITest

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
	 * @var Object	All the test cases. Note that the value of each property should just be an
	 * 		object that will be passed to Y.Test.Case's constructor.
	 */
	TestCases: {},

	/**
	 * Load YUI. Note that this requires that YUI has already been loaded with the url:
	 * http://yui.yahooapis.com/3.2.0/build/yui/yui-min.js
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


/*
---
name: YUITest.Configs

description: Holds various configurations for the test. Note that when the script tries to load the
	configs, it will load the configs from the test suite if there are any, then the testee, and
	finally the tester.

authors: Duc Tri Le

requires: Base

provides: Configs
...
*/
YUITest.Configs = {
	/**
	 * @var String	The ID for the element on the test suite page that contains the final tally of
	 * 		all test results.
	 */
	final_tally: 'final_tally_result',

	/**
	 * @var String	CSS selector for the element on the test suite page that logs results from all
	 * 		test pages.
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
	 * @var Array	An array containing the relative path to the pages to test. The path should
	 * 		begin with a slash.
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
	 * @var String	The CSS selector for the element on the testee page whose innerHTML contains the
	 * 		name of test cases (separated by commas) to test.
	 */
	test_cases_selector: '#test_cases',

	/**
	 * @var String	Template for the ID of each testee information div on the test suite page.
	 */
	testee_id_tpt: 'testee_{counter}',

	/**
	 * @var String	The type for the testee. Possible values are:
	 * 		iframe: The testee will be loaded into an iframe on the test suite.
	 * 		window: The testee will be popped to its own window. Default.
	 */
	testee_type: 'window',

	/**
	 * @var String	The unique name for the testee window.
	 */
	testee_window_name: 'yuitest_testee',

	/**
	 * @var String	The CSS selector for the element on the tester page that will hold the logger.
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
	 * 		iframe: The tester will be load into an iframe on the testee.
	 * 		window: The tester will be popped to its own window. Default.
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
	 * Set the provided configs. Note that this function will overwrite any existing configurations.
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


/*
---
name: YUITest.TestSuite

description: The test suite allows for running multiple test pages at once. It will launch each test
	page and wait for the results of that test page before continuing onto the next test page. Refer
	to the test_suite.php file for what this test page should look like.

authors: Duc Tri Le

requires: [Base, Configs]

provides: TestSuite
...
*/
YUITest.TestSuite = {
	/**
	 * @var int		The counter for the next page to test.
	 */
	$counter: 0,

	/**
	 * @var Object	Contains the totals of all the test pages results.
	 */
	$tally: {
		duration: 0,
		ignored: 0,
		failed: 0,
		passed: 0,
		total: 0
	},

	/**
	 * @var Window	Reference to the testee window.
	 */
	$testee: null,

	// ---------------------------------------------------------------------- //

	/**
	 * Initialize the test suite. Note that once the initialization has been completed, the YUI
	 * instance will be set to the global variable $Y.
	 *
	 * @returns void
	 */
	initialize: function() {
		YUITest.loadYUI(function() {
			// Load any configurations
			var configs = YUITest.Configs.load();

			// Create the console that will log all results from all test pages
			new $Y.Console(configs.global_logger_config).render(configs.global_logger);

			// And now, begin testing
			YUITest.TestSuite.runNextTestPage();
		}, true);
	},

	/**
	 * Event handler for logging messages from the tester page to this test suite.
	 *
	 * @param Object	event	The event that was triggered.
	 * @returns void
	 */
	logEvent: function(event) {
		// No need to log the opening test suite text
		if(event.message.message.indexOf('Test suite') === 0) { return; }

		// And now log
		var last_test_page = YUITest.Configs.pages[YUITest.TestSuite.$counter - 1];
		$Y.log(event.message.message, event.message.category, last_test_page);
	},

	/**
	 * Record the results for the provided page.
	 *
	 * @param int		page		The counter for the page the results are for.
	 * @param Object	results		The results for the page.
	 * @returns YUITest.TestSuite
	 */
	recordResultsForPage: function(page, results) {
		var me = YUITest.TestSuite;
		var configs = YUITest.Configs;

		// Add the results to the container
		var container_id = $Y.Lang.sub(configs.testee_id_tpt, {counter: page});
		$Y.one('#' + container_id).append($Y.Lang.sub(
			'<strong> Done.</strong><br />' + configs.result_tpt, {
				id:			container_id + '_result',
				duration:	(results.duration / 1000).toFixed(2),
				ignored:	results.ignored,
				failed:		results.failed,
				passed:		results.passed,
				total:		results.total
			}
		));

		// Add the results information to our final tally
		me.$tally.duration += results.duration;
		me.$tally.ignored += results.ignored;
		me.$tally.failed += results.failed;
		me.$tally.passed += results.passed;
		me.$tally.total += results.total;

		$Y.log('Finished testing ' + configs.pages[page], 'warn');
		return me;
	},

	/**
	 * Record the results of the previous test page and start running the next test page.
	 *
	 * @param Object	results		The results of the previous test page. Optional for the first
	 * 		test page.
	 * @returns YUITest.TestSuite
	 */
	runNextTestPage: function(results) {
		var me = YUITest.TestSuite;
		var configs = YUITest.Configs;
		var body = $Y.one(document.body);

		// If results were provided, update the previous test information
		if(results) { me.recordResultsForPage(me.$counter - 1, results); }

		// See if there are any more test pages to test, if not, wrap things up
		if(me.$counter < configs.pages.length) {
			var test_page = configs.pages[me.$counter];

			// Update the test suite to let the user know we are running another test page
			$Y.log('Begin testing ' + test_page, 'warn');
			body.append($Y.Lang.sub(
				'<div id="' + configs.testee_id_tpt + '">' +
				'Running tests on {page}...</div>', {
					counter: me.$counter,
					page: test_page
				}
			));

			// And now, run the test
			me.updateTestee($Y.Lang.sub(
				'{protocol}//{host}{page}', {
					protocol: window.location.protocol,
					host: window.location.host,
					page: test_page
				}
			));

			++me.$counter;
		} else {
			// If we made it here, all tests were completed so wrap things up
			var final_message = me.$tally.failed ?
				'<h3 style="color: red;">Aww, {failed} tests failed.</h3>' :
				'<h3 style="color: green;">Congrats! No failed tests!</h3>';

			body.prepend($Y.Lang.sub(
				final_message + configs.result_tpt + '<hr />', {
					id:			configs.final_tally,
					duration:	(me.$tally.duration / 1000).toFixed(2),
					ignored:	me.$tally.ignored,
					failed:		me.$tally.failed,
					passed:		me.$tally.passed,
					total:		me.$tally.total
				}
			));

			// Close the tester window
			if(me.$testee && me.$testee.YUITest.Testee.$tester) {
				me.$testee.YUITest.Testee.$tester.close();
			}

			// Close the testee window
			if(me.$testee) { me.$testee.close(); }

			// Log to global loger that tests are complete
			$Y.log('All tests completed', 'warn');
		}

		return me;
	},

	/**
	 * Update the testee window/iframe using the provided url.
	 *
	 * @param String	url		The URL for the testee.
	 * @returns YUITest.TestSuite
	 */
	updateTestee: function(url) {
		var me = YUITest.TestSuite;
		var configs = YUITest.Configs;

		// Are we using an iframe or a popup window?
		if(configs.testee_type === 'iframe') {
			var iframe_id = '#' + configs.testee_window_name;
			var iframe = $Y.one(iframe_id);
			if(!iframe) {
				$Y.one(document.body).append($Y.Lang.sub(
					'<iframe id="{id}" name="{id}" frameborder="0"></iframe>', {
						id: configs.testee_window_name
					}
				));

				iframe = $Y.one(iframe_id).setStyles({
					width: '0',
					height: '0'
				});
			}

			iframe.set('src', url);
		} else {
			// The default is opening a popup window
			me.$testee = window.open(url, configs.testee_window_name);
		}

		return me;
	}
};


/*
---
name: YUITest.Testee

description: The testee is use on the page that will be tested against. Refer to the testee.php file
	for what this test page should look like.

authors: Duc Tri Le

requires: [Base, Configs]

provides: Testee
...
*/
YUITest.Testee = {
	/**
	 * @var Window	Reference to the tester window if the tester was opened via a window.
	 */
	$tester: null,

	// ---------------------------------------------------------------------- //

	/**
	 * Initilize the test page. Note that once the initialization has been completed, the YUI
	 * instance will be set to the global variable $Y. If this page was opened via another page and
	 * that page have a YUITest object, a reference to that page will be put into the global
	 * variable $C.
	 *
	 * @returns void
	 */
	initialize: function() {
		YUITest.loadYUI(function() {
			// See if this testee was loaded via an iframe or a popup window and if we have a test
			// suite or not
			var ts = window == window.parent ? window.opener : window.parent;
			if(ts && ts.YUITest) { window.$C = ts; }

			// Load any configurations
			YUITest.Configs.load();

			// And now start the tests
			YUITest.Testee.start();
		}, true);
	},

	/**
	 * Get the name of the test cases to test.
	 *
	 * @returns Array
	 */
	getTestCases: function() {
		var test_cases = $Y.one(YUITest.Configs.test_cases_selector);
		test_cases = test_cases ? test_cases.get('innerHTML').split(',') : [];
		$Y.Array.each(test_cases, function(item, key) {
			test_cases[key] = $Y.Lang.trim(item);
		});

		return test_cases;
	},

	/**
	 * Start the testing.
	 *
	 * @returns YUITest.Testee
	 */
	start: function() {
		var me = YUITest.Testee;
		var configs = YUITest.Configs;
		var tester_url = $Y.Lang.sub(configs.tester_url_tpt, {
				protocol: window.location.protocol,
				host: window.location.host
			}
		);

		// Are we using an iframe or a popup window?
		if(configs.tester_type === 'iframe') {
			var iframe_id = '#' + configs.tester_window_name;
			var iframe = $Y.one(iframe_id);
			if(!iframe) {
				$Y.one(document.body).append($Y.Lang.sub(
					'<iframe id="{id}" name="{id}"></iframe>', {
						id: configs.tester_window_name
					}
				));

				iframe = $Y.one(iframe_id).setStyles({
					height: '400px',
					width: '100%'
				});
			}

			iframe.set('src', tester_url);
		} else {
			// The default is opening a popup window
			me.$tester = window.open(tester_url, configs.tester_window_name);
		}

		return me;
	}
};


/*
---
name: YUITest.Tester

description: The tester is the page that will actually do the testing. Refer to the tester.php file
	for what this test page should look like.

authors: Duc Tri le

requires: [Base, Configs, TestSuite, Testee, TestCases]

provides: Tester
...
*/
YUITest.Tester = {
	/**
	 * Initialize and run the tests. Note that once the initialization has been completed, the YUI
	 * instance will be set to the global variable $Y. If this page was opened via another page and
	 * that page have a YUITest object, a reference to that page will be put into the global
	 * variable $C.
	 *
	 * @returns void
	 */
	initialize: function() {
		YUITest.loadYUI(function() {
			// If the parent window is the same as this window, then the testee had opened this
			// tester window using a popup, otherwise, it was an iframe
			window.$C = window == window.parent ? window.opener : window.parent;

			// Load any configurations
			YUITest.Configs.load();

			// And now start the tests
			YUITest.Tester.start();
		}, true);
	},

	/**
	 * Start running the tests.
	 *
	 * @returns YUITest.Tester
	 */
	start: function() {
		var me = YUITest.Tester;
		var configs = YUITest.Configs;
		var body = $Y.one(document.body);

		// Add the test cases to test
		var test_cases = $C.YUITest.Testee.getTestCases();
		$Y.Array.each(test_cases, function(test_case) {
			$Y.Test.Runner.add(new $Y.Test.Case(YUITest.TestCases[test_case]));
		});

		// Add in logging
		var console = new $Y.Console(configs.tester_logger_config);
		console.render(configs.tester_logger);

		// Add in an event handler to also log the result to the test suite
		console.on('entry', function(e) {
			// Log to the test suite if it exists
			if($C.$C && $C.$C.YUITest) { $C.$C.YUITest.TestSuite.logEvent(e); }
		});

		// Add in an event handler to let the test suite know when all the tests has been completed
		$Y.Test.Runner.subscribe($Y.Test.Runner.COMPLETE_EVENT, function() {
			// If the test suite exists, give to it the result so it can run the next page
			if($C.$C && $C.$C.YUITest) {
				$C.$C.YUITest.TestSuite.runNextTestPage($Y.Test.Runner.getResults());
			}
		});

		// Finally, run the tests
		$Y.Test.Runner.run();
		return me;
	}
};

