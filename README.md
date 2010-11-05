Introduction
============
This is simply a wrapper around the YUI 3 Test framework. It does what I think the removed
Y.Test.Manager does, letting you test multiple pages at once. Setup is relatively simple and should
probably not be too different than a normal test you would write. This also only uses YUI and core
JavaScript code so you can use it with any framework.

Setup
=====
Many of the setup configurations is fairly simply and you can always look at the example files for
what they generally look like. But basically, there are two main things you need to do: 1) Add a
tester page that will actually do the testing. 2) Add in some extra markup to the page that is being
tested so the tester knows what to test.

You can take a look at the tester.php file in the examples folder for more information. In most
cases, you won't need to change much anything for the tester page. Take a look at the testee.php
file for what needs to be added to the page you want to test. Basically, you'll need to add the
necessary JS code as well as initialize the testing.

Optionally, you can include a third page which is the test suite. The test suite allows you to run
multiple test pages one after another. Take a look at the test_suite.php file for an example.

Test Cases
==========
Notice on the tester page, you should be including all the possible test cases so the script can run
them. Creating a test case is as simple or as complex as it would be if you had created one before
with YUI 3. In YUI 3, when you create a test case, you generally do something along the lines:
	var TestCase = Y.Test.Case({
		name: 'Name of Test Case',
		testMethod: function() { ... },
		...
	});

To add a test case here, you would just do the following:
	YUITest.TestCases.TestCase = {
		name: 'Name of Test Case',
		testMethod: function() { ... },
		...
	};

Notice that the body is exactly the same since that will just be passed to the Y.Test.Case
constructor. However, since you'll need to declare the test cases before you have an instance of
YUI, this allows you to pre-declare them.

Note, if you want to access the actual page that is being tested, access it with the global variable
$C from your test case. It is simply a reference to the window object of the testee. More on this
below.

Global $Y & $C
==============
On all of the pages (test suite, testee, and tester), once the initialize for the respective pages
has been called and the test are starting, you'll have access to potentially two variables in the
global scope: $Y and $C.

$Y will always be there and it is the instance of YUI (with the modules node, console, and test
loaded). $C may or may not be there. On the test suite page, it should never be present since the
test suite page is already the top level page of all your tests. On the testee page, if it was
opened via the test suite page, then it will exists but if it was access directly, then it won't. On
the tester page, it will always be there. What it is, is simply a reference to the window object of
its container. So for the testee page, it is the test suite page. For the tester page, it is the
testee page.

Final Thoughts
==============
You'll notice that there is a source and build folder. The source folder contains basically that,
the source. It is split up into multiple files for better organization. The build folder should
contain two files, yuitest.js and yuitest.min.js. The former is simply the compliation of all the
source files in the correct order via the help of the packager script (it is a submodule of this
package and is pretty cool so check it out). The later is simply a compressed version of the former
using the Google Closure Compiler.

Feel free to contact me with questions or comments. If you found a bug or would like to request a
feature, make the request via GitHub. Also, if you like to help, create a fork of the project and
hack away.
