<html>
	<head>
		<title>Testee</title>
		<!-- Your normal head content here -->
		
		<?php
			// You'll probably want to only include the testing code if you are
			// testing, otherwise, best to leave it out
			$is_testing_javascript = (array_key_exists($_GET, 'js_unit_testing') && ($_GET['js_unit_testing'] === 'true')) ||
									 (array_key_exists($_COOKIE, 'js_unit_testing') && ($_COOKIE['js_unit_testing'] === 'true'));
			if($is_testing_javascript) {
		?>
			<script type="text/javascript" src="http://yui.yahooapis.com/3.2.0/build/yui/yui-min.js"></script>
			<script type="text/javascript" src="/js/yuitest.js"></script>
		<?php } ?>
	</head>
	<body class="yui3-skin-sam">
		<!-- THe normal page content here -->
		
		<?php if($is_testing_javascript) { ?>
			<div id="logger"></div>
			<script type="text/javascript">
			// Overwrite the default and the test suite configurations
			YUITest.Configs.set({ tester_type: 'window' });

			YUITest.TestSuite.initialize();
			</script>
		<?php } ?>
	</body>
</html>