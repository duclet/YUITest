/**
 * Namespace for YUI Testing.
 *
 * @author Duc Tri Le
 * @version 0.1
 */
var YUITest = {
	/**
	 * Load YUI.
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

/**
 * Hold configurations for the test. Override this before running any tests.
 * Note that configurations will be read from a single place. Meaning if you set
 * the configurations on the TestSuite, the Testee and Tester will use the same
 * configurations.
 *
 * @author Duc Tri Le
 * @version 0.1
 */
YUITest.Configs = {
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
	tester_type: 'window'
};

/**
 * For use on the page that will run all the test pages.
 *
 * Once initialized, this will put the YUI instance into the global variable $Y.
 *
 * @author Duc Tri Le
 * @version 0.1
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
	 * Initialize the test suite.
	 *
	 * @returns void
	 */
	initialize: function() {
		YUITest.loadYUI(function() {
			new $Y.Console({
				height: '95%',
				newestOnTop: false,
				width: '500px'
			}).render('#logger');

			YUITest.TestSuite.runNextTestPage();
		}, true);
	},

	/**
	 * Log an event to the logger in the test suite if it exists.
	 *
	 * @param Object	event	The event that was triggered.
	 * @returns void
	 */
	logEvent: function(event) {
		// No need to log the opening test suite text
		if(event.message.message.indexOf('Test suite') === 0) { return; }

		var last_test_page = YUITest.Configs.pages[YUITest.TestSuite.$counter - 1];
		$Y.log(event.message.message, event.message.category, last_test_page);
	},

	/**
	 * Record the results of the previous test page and start running the next
	 * test page.
	 *
	 * @param Object	results		The results of the previous test page.
	 * 		Optional for the first test page.
	 * @returns void
	 */
	runNextTestPage: function(results) {
		var me = YUITest.TestSuite;
		var configs = YUITest.Configs;
		var body = $Y.one(document.body);

		// If we have results, record it
		if(results) {
			// Add the results to the page display
			body.one('#test_page_' + (me.$counter - 1)).append($Y.substitute(
				'<strong> Done.</strong><br />' + configs.result_tpt, {
					id: 'test_page_' + (me.$counter - 1) + '_result',
					duration: (results.duration / 1000).toFixed(2),
					ignored: results.ignored,
					failed: results.failed,
					passed: results.passed,
					total: results.total
				}
			));

			// Increment the results to the total tally
			me.$tally.duration += results.duration;
			me.$tally.ignored += results.ignored;
			me.$tally.failed += results.failed;
			me.$tally.passed += results.passed;
			me.$tally.total += results.total;
		}

		// Run the next test page if there are any, otherwise, wrap things up
		if(me.$counter < configs.pages.length) {
			var test_page = configs.pages[me.$counter];
			body.append($Y.substitute(
				'<div id="test_page_{counter}">Running tests on {page}...</div>',
				{counter: me.$counter, page: test_page}
			));

			me.$testee = window.open($Y.substitute(
				'{protocol}//{host}{page}', {
					protocol: window.location.protocol,
					host: window.location.host,
					page: test_page
				}
			), 'js_unit_testee');

			++me.$counter;
		} else {
			body.append($Y.substitute(
				'<hr /><h3>All tests complete.</h3>' + configs.result_tpt, {
					id: 'final_tally_result',
					duration: (me.$tally.duration / 1000).toFixed(2),
					ignored: me.$tally.ignored,
					failed: me.$tally.failed,
					passed: me.$tally.passed,
					total: me.$tally.total
				}
			));

			// Close the tester window if it exists
			if(me.$testee.YUITest.Testee.$tester) {
				me.$testee.YUITest.Testee.$tester.close();
			}

			// Close the testee window
			me.$testee.close();
		}
	}
};

/**
 * For use on the page that is being tested.
 *
 * Once initialized, this will put the YUI instance into the global variable $Y.
 *
 * Once initialized, this will create a reference to the test suite if it exists
 * in the global variable $C.
 *
 * @author Duc Tri Le
 * @version 0.1
 */
YUITest.Testee = {
	/**
	 * @var Window	Reference to the tester window if the tester was opened via
	 * 		a window.
	 */
	$tester: null,

	// ---------------------------------------------------------------------- //

	/**
	 * Initilize the test page.
	 *
	 * @returns void
	 */
	initialize: function() {
		// See if we have a Test Suite
		if(window.opener) {
			window.$C = window.opener;
			YUITest.Configs = $C.YUITest.Configs;
		}

		YUITest.loadYUI(function() { YUITest.Testee.start(); }, true);
	},

	/**
	 * Get the name of the test cases to test.
	 *
	 * @returns Array
	 */
	getTestCases: function() {
		var body = $Y.one(document.body);
		var test_cases = body.one(YUITest.Configs.test_cases_selector);

		return test_cases ? test_cases.get('innerHTML').split(',') : [];
	},

	/**
	 * Start the testing.
	 *
	 * @returns void
	 */
	start: function() {
		var tester_url = $Y.substitute(
			'{protocol}//{host}/tests/unit_test.php', {
				protocol: window.location.protocol,
				host: window.location.host
			}
		);

		// Should we create an iframe or a popup window
		if(YUITest.Configs.tester_type === 'iframe') {
			var body = $Y.one(document.body);
			var iframe = body.one('#js_unit_tester');
			if(!iframe) {
				body.append('<iframe id="js_unit_tester"></iframe>');
				iframe = body.one('#js_unit_tester');
			}

			iframe.set('src', tester_url);
		} else {
			YUITest.Testee.$tester = window.open(tester_url, 'js_unit_tester');
		}
	}
};

/**
 * For use on the page that will do the testing.
 *
 * Once initialized, this will put the YUI instance into the global variable $Y.
 *
 * Once initialized, this will create a reference to the testee window in the
 * global variable $C.
 *
 * @author Duc Tri Le
 * @version 0.1
 */
YUITest.Tester = {
	/**
	 * Initialize and run the tests.
	 *
	 * @returns void
	 */
	initialize: function() {
		// See if this was opened as a popup window or an iframe
		window.$C = window == window.parent ? window.opener : window.parent;
		YUITest.Configs = $C.YUITest.Configs;

		YUITest.loadYUI(function() { YUITest.Tester.start(); }, true);
	},

	/**
	 * Event handler for when a test page has finished testing.
	 *
	 * @returns void
	 */
	onComplete: function() {
		// Give the results to the Test Suite if it exists
		if($C.$C) {
			$C.$C.YUITest.TestSuite.runNextTestPage($Y.Test.Runner.getResults());
		}
	},

	/**
	 * Start running the tests.
	 *
	 * @returns void
	 */
	start: function() {
		var body = $Y.one(document.body);

		// Add the test cases to test
		var suite = new $Y.Test.Suite();
		var test_cases = $C.YUITest.Testee.getTestCases();
		$Y.Array.each(test_cases, function(test_case) {
			suite.add(new $Y.Test.Case(YUITest.TestCases[test_case]));
		});

		$Y.Test.Runner.add(suite);

		// Add in logging
		var console = new $Y.Console({
			height: '500px',
			newestOnTop: false,
			width: '95%',
			style: 'inline'
		});

		console.render('#logger');
		console.on('entry', function(e) {
			// Log to the Test Suite if it exists
			if($C.$C) { $C.$C.YUITest.TestSuite.logEvent(e); }
		});

		$Y.Test.Runner.subscribe($Y.Test.Runner.COMPLETE_EVENT, function() {
			// Give the results to the Test Suite if it exists
			if($C.$C) {
				$C.$C.YUITest.TestSuite.runNextTestPage($Y.Test.Runner.getResults());
			}
		});

		// Finally, run the tests
		$Y.Test.Runner.run();
	}
};

/**
 * All test cases should be declared as an object under this.
 *
 * @author Duc Tri Le
 * @version 0.1
 */
YUITest.TestCases = {};
