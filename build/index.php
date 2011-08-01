<?php

include_once dirname(__FILE__).'/config.php';

$root = realpath(dirname(__FILE__) . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR);
$files = array_merge(
	Config::factory(
		$root,
		'demos/config.processing.json',
		FALSE
		),
	Config::factory(
		$root,
		'config/thorny-spec-demo.json',
		FALSE
		)
);
	
header('Content-Type: text/javascript');
foreach ($files as $file) {
	$title = str_replace(array($root, '/common', '/browser', '/node.js'), '', $file);
	echo "/******************************************************************************\n";
	echo sprintf(" ** File: %-66s **\n", $title);
	echo " ******************************************************************************/\n";
	echo file_get_contents($file) . "\n";
}