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
