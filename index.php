<?php

include_once dirname(__FILE__).'/build/config.php';
$root = dirname(__FILE__);
$raw_files = array_merge(
	Config::factory(
		$root,
		'config/thorny-spec-demo.json',
		FALSE
		),
	Config::factory(
		$root,
		'config/thorny-spec-demo.json',
		TRUE
		)
);
$files = array();
foreach ($raw_files as $file) {
	$files[] = str_replace($root, '', $file);
}

?>
<html>
<head>
	<title>Thorny Engine: Test Suite</title>
	<link rel="stylesheet" href="/lib/jasmine/jasmine.css" type="text/css" media="screen" title="no title" charset="utf-8">
</head>
<body>
	<header>
		<h2>Thorny Engine: Test Suite</h2>
	</header>
	<div id="main">
		<p>
			Due to the asynchronous nature of this implementation it is 
			possible that multiple test may fail as a result of my not leaving
			enough time for the async op to resolve. If you encounter a failed
			test its worth rerunning the test suite.
		</p>
	</div>
	<footer>
		<p>&copy; Iain Carsberg</p>
	</footer>
	<script src="/node.js"></script>
	<script src="/lib/json.js"></script>
	<script src="/lib/jquery-1.6.1.min.js"></script>
	<script src="/lib/underscore.js"></script>
	<script src="/lib/underscore-min.js"></script>
	<script src="/lib/processing-1.2.1.min.js"></script>
	<script src="/lib/jasmine/jasmine-1.0.1.js"></script>
	<script src="/lib/jasmine/jasmine-html.js"></script>
<?php foreach ($files as $file): ?>
	<script src="<?php echo $file; ?>"></script>
<?php endforeach; ?>
	<script>
jasmine.getEnv().addReporter(new jasmine.TrivialReporter());
jasmine.getEnv().execute();
// Make console not crash IE
if (typeof console === 'undefined') {
	console = {
		log: function() {}
	};
}
	</script>
</body>
</html>