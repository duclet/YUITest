/*
---
name: YUITest.Tester

description: The tester is the page that will actually do the testing. Refer to
	the tester.php file for what this test page should look like.

authors: Duc Tri le

requires: [Base, Configs, TestSuite, Testee, TestCases]

provides: Tester
...
*/
YUITest.Tester = {
	/**
	 * Initialize and run the tests. Note that once the initialization has been
	 * completed, the YUI instance will be set to the global variable $Y. If
	 * this page was opened via another page and that page have a YUITest
	 * object, a reference to that page will be put into the global variable $C.
	 *
	 * @returns void
	 */
	initialize: function() {
		YUITest.loadYUI(function() {
			// If the parent window is the same as this window, then the testee
			// had opened this tester window using a popup, otherwise, it was
			// an iframe
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

		// Add in an event handler to let the test suite know when all the tests
		// has been completed
		$Y.Test.Runner.subscribe($Y.Test.Runner.COMPLETE_EVENT, function() {
			// If the test suite exists, give to it the result so it can run the
			// next page
			if($C.$C && $C.$C.YUITest) {
				$C.$C.YUITest.TestSuite.runNextTestPage(
					$Y.Test.Runner.getResults()
				);
			}
		});

		// Finally, run the tests
		$Y.Test.Runner.run();
		return me;
	}
};
