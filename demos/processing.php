<?php

include_once dirname(__FILE__).'/../build/config.php';
$root = dirname(__FILE__) . '/..';
$raw_files = array_merge(
	Config::factory(
		$root,
		'config/thorny-spec-demo.json',
		FALSE
		),
	Config::factory(
		$root,
		'demos/config.processing.json',
		FALSE
		)
);
$files = array();
foreach ($raw_files as $file) {
	$files[] = str_replace($root, '', $file);
}

?>
<html>
<head>
	<title>Thorny Engine: Processing.js</title>
	<style type="text/css" media="screen">
body{background: #ABC;}
header, footer, div#main{width:640px;margin: 0 auto;}
canvas{float: left;}
	</style>
</head>
<body>
	<header>
		<h2>Thorny Engine: Processing.js</h2>
	</header>
	<div id="main">
		<canvas id="processing-canvas-1" width="640", height="480"></canvas>
<!--
		<canvas id="processing-canvas-2" width="320", height="240"></canvas>
		<canvas id="processing-canvas-3" width="100", height="480"></canvas>
-->
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
	<script src="/lib/Stats.js"></script>
<?php foreach ($files as $file): ?>
	<script src="<?php echo $file; ?>"></script>
<?php endforeach; ?>
	<script>
// Make console not crash IE
if (typeof console === 'undefined') {
	console = {
		log: function() {}
	};
}
<?php echo file_get_contents('app.processing.js'); ?>
	</script>
</body>
</html>