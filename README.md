Introduction
============
This is simply a wrapper around the YUI 3 Test framework. It does what I think
the removed Y.Test.Manager does, letting you test multiple pages at once. Setup
is relatively simple and should probably not be too different than a normal test
you would write. This also only uses YUI and core JavaScript code so you can use
it with any framework.

Setup
=====
On the root directory of your site, make sure you have a folder called tests.
Within it should (but not required) be a file called index.php which will be the
test suite. Refer to the test_suite.php file in the example folder for what this
file should look like. In general, this file lists all the test pages you want
to test.

While the previous file is optional (since you can have as many test suites as
you want), the next file is required. Create a file named unit_test.php. This
file is the tester and will be the actual page that will do all the testing. In
most cases, you should be able to just simply copy and paste this file and leave
it as is from the example folder.

Lastly, on each of the page you want to test, include in the necessary code to
test it. Refer to the file testee.php in the example folder for more 
information.

Test Cases
==========
