/*
---
name: YUITest.Testee

description: The testee is use on the page that will be tested against. Refer to
	the testee.php file for what this test page should look like.

authors: Duc Tri le

requires: [Core, Configs]

provides: Testee
...
*/
YUITest.Testee = {
	/**
	 * @var Window	Reference to the tester window if the tester was opened via
	 * 		a window.
	 */
	$tester: null,

	// ---------------------------------------------------------------------- //

	/**
	 * Initilize the test page. Note that once the initialization has been
	 * completed, the YUI instance will be set to the global variable $Y. If
	 * this page was opened via another page and that page have a YUITest
	 * object, a reference to that page will be put into the global variable $C.
	 *
	 * @returns void
	 */
	initialize: function() {
		YUITest.loadYUI(function() {
			// See if we have a test suite
			if(window.opener && window.opener.YUITest) {
				window.$C = window.opener;
			}

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
		var configs = YUITest.Configs;
		var tester_url = $Y.Lang.sub(configs.tester_url_tpt, {
				protocol: window.location.protocol,
				host: window.location.host
			}
		);

		// Should we create an iframe or a popup window
		if(configs.tester_type === 'iframe') {
			var body = $Y.one(document.body);
			var id = '#' + configs.tester_window_name;
			var iframe = body.one(id);
			if(!iframe) {
				body.append($Y.Lang.sub(
					'<iframe id="{id}"></iframe>', { id: id }
				);

				iframe = body.one(id);
			}

			iframe.set('src', tester_url);
		} else {
			YUITest.Testee.$tester = window.open(
				tester_url, configs.tester_window_name
			);
		}
	}
};
