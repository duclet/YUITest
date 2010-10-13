/*
---
name: YUITest.TestSuite

description: The test suite allows for running multiple test pages at once. It
	will launch each test page and wait for the results of that test page before
	continuing onto the next test page. Refer to the test_suite.php file for
	what this test page should look like.

authors: Duc Tri Le

requires: [Core, Configs]

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
	 * Initialize the test suite. Note that once the initialization has been 
	 * completed, the YUI instance will be set to the global variable $Y.
	 *
	 * @returns void
	 */
	initialize: function() {
		YUITest.loadYUI(function() {
			var configs = YUITest.Configs;

			// Load any configurations
			configs.load();

			// Create the console that will log all results from all test pages
			new $Y.Console(configs.global_logger_config)
				.render(configs.global_logger);

			// And now, begin testing
			YUITest.TestSuite.runNextTestPage();
		}, true);
	},

	/**
	 * Event handler for logging messages from the tester page to this test
	 * suite.
	 *
	 * @param Object	event	The event that was triggered.
	 * @returns void
	 */
	logEvent: function(event) {
		// No need to log the opening test suite text
		if(event.message.message.indexOf('Test suite') === 0) { return; }

		// And now log
		var last_test_page = YUITest.Configs.pages[
			YUITest.TestSuite.$counter - 1
		];

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

		// If results were provided, update the previous test information
		if(results) {
			var testee_id = $Y.Lang.sub(configs.testee_id_tpt, {
				counter: me.$counter - 1
			});

			// Update the HTML
			body.one(testee_id).append($Y.Lang.sub(
				'<strong> Done.</strong><br />' + configs.result_tpt, {
					id: testee_id + '_result',
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

		if(me.$counter < configs.pages.length) {
			var test_page = configs.pages[me.$counter];

			// Update the test suite to let the user know we are running another
			// test page
			body.append($Y.Lang.sub(
				'<div id="' + configs.testee_id_tpt + '">' +
				'Running tests on {page}...</div>', {
					counter: me.$counter,
					page: test_page
				}
			));

			// And now, run the test
			me.$testee = window.open($Y.Lang.sub(
				'{protocol}//{host}{page}', {
					protocol: window.location.protocol,
					host: window.location.host,
					page: test_page
				}
			), configs.testee_window_name);

			++me.$counter;
		} else {
			// If we made it here, all tests were completed so wrap things up
			body.append($Y.Lang.sub(
				'<hr /><h3>All tests complete.</h3>' + configs.result_tpt, {
					id: configs.final_tally,
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
