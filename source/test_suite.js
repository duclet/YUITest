/*
---
name: YUITest.TestSuite

description: The test suite allows for running multiple test pages at once. It
	will launch each test page and wait for the results of that test page before
	continuing onto the next test page. Refer to the test_suite.php file for
	what this test page should look like.

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
	 * Record the results for the provided page.
	 *
	 * @param int		page		The counter for the page the results are
	 * 		for.
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
	 * Record the results of the previous test page and start running the next
	 * test page.
	 *
	 * @param Object	results		The results of the previous test page.
	 * 		Optional for the first test page.
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

			// Update the test suite to let the user know we are running another
			// test page
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
			body.append($Y.Lang.sub(
				'<hr /><h3>All tests complete.</h3>' + configs.result_tpt, {
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
