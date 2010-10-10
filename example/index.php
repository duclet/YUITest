<html>
	<head>
		<title>Test Suite</title>
		<script type="text/javascript" src="http://yui.yahooapis.com/3.2.0/build/yui/yui-min.js"></script>
		<script type="text/javascript" src="/yuitest/yuitest.js"></script>
	</head>
	<body class="yui3-skin-sam">
		<div id="logger"></div>
		<script type="text/javascript">
		YUITest.Configs.pages = ['/page1.php', '/page2.php', '/page3.php'];

		YUITest.TestSuite.initialize();
		</script>
	</body>
</html>