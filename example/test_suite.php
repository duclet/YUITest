<?php
// You might want to set a session cookie here stating that we are testing
setcookie('js_unit_testing', 'true', 0, '/');
?>
<html>
	<head>
		<title>Test Suite</title>
		<script type="text/javascript" src="http://yui.yahooapis.com/3.2.0/build/yui/yui-min.js"></script>
		<script type="text/javascript" src="/js/yuitest.js"></script>
	</head>
	<body class="yui3-skin-sam">
		<div id="logger"></div>
		<script type="text/javascript">
		// Overwrite the default configurations
		YUITest.Configs.set({
			pages: ['/page1.php', '/page2.php', '/page3.php'],
			tester_type: 'iframe',
			tester_url_tpt: '{protocol}//{host}/example/tester.php'
		});

		YUITest.TestSuite.initialize();
		</script>
	</body>
</html>