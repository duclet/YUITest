/*
---
name: YUITest.TestSuite

description: The test suite allows for running multiple test pages at once. It
	will launch each test page and wait for the results of that test page before
	continuing onto the next test page. Refer to the test_suite.php file for
	what this test page should look like.

authors: Duc Tri le

requires: [YUITest, YUITest.Configs]

provides: YUITest.TestSuite
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
	 * Initialize the test suite.
	 *
	 * @returns void
	 */
	initialize: function() {
		YUITest.loadYUI(function() {
			// Load any configurations
			YUITest.Configs.load();

			// Create the console that will log all results from all test pages
			new $Y.Console({
				height: '95%',
				newestOnTop: false,
				width: '500px'
			}).render(YUITest.Configs.global_logger);

			// And now, begin testing
			YUITest.TestSuite.runNextTestPage();
		}, true);
	},

	/**
	 * Log an event to the global logget.
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
