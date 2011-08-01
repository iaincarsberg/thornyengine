<?php

include_once dirname(__FILE__).'/config.php';

$root = realpath(dirname(__FILE__) . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR);
$files = array_merge(
	Config::factory(
		$root,
		'config/default.json'
		),
	Config::factory(
		$root,
		'config/default.json',
		TRUE
		)
	);

$todos = array();
foreach ($files as $file) {
	$title = str_replace(array($root, '/common', '/browser', '/node.js'), '', $file);
	$lines = explode(PHP_EOL, file_get_contents($file));

	foreach ($lines as $row=> $line) {
		if (strpos(strtolower($line), 'todo') !== FALSE) {
			$todos[] = array(
				'title'=> $title,
				'row_id'=> ($row + 1),
				'row-1'=> (array_key_exists(($row - 1), $lines) ? $lines[$row - 1] : ''),
				'row'=> $line,
				'row+1'=> (array_key_exists(($row + 1), $lines) ? $lines[$row + 1] : '')
			);
		}
	}
}

?>
<html>
<head>
	<title>Thorny Engine: TODO List</title>
	<style type="text/css" media="screen">
	body{background: #444;margin: 0;padding: 0;}
	div#content{width: 500px;margin: 0 auto; background: #FFF;border-color: #000;border-style: solid; border-width: 0;border-right-width: 3px; border-left-width: 3px;padding: 10px;}
	h2{margin: 0;}
	p{color: #777;font-style: italic;}
	p.current{color: #444;}
	ul,li{list-style: none;margin: 0;padding:0;}
	li.spec{background: #DDD;}
	</style>
</head>
<body>
	<div id="content">
		<h2>Thorny Engine: TODO List</h2>
		<h3>
			You have <?php echo count($todos); ?> items on your todo list.
		</h3>
		<ul>
<?php foreach (explode(PHP_EOL, file_get_contents($root.'/TODO')) as $row=> $todo): ?>
			<li>
				<h3>/TODO - <?php echo ($row + 1); ?></h3>
				<p><?php echo htmlentities($todo); ?></p>
			</li>
<?php endforeach; ?>	
<?php foreach ($todos as $todo): ?>
			<li<?php echo (strpos($todo['title'], '.spec.js')) ? ' class="spec"' : '' ;?>>
				<h3><?php echo $todo['title'] ?> - <?php echo $todo['row_id']; ?></h3>
				<p><?php echo trim(htmlentities($todo['row-1'])); ?></p>
				<p class="current"><?php echo trim(htmlentities($todo['row'])); ?></p>
				<p><?php echo trim(htmlentities($todo['row+1'])); ?></p>
			</li>
<?php endforeach; ?>
		</ul>
	</div>
</body>
</html>