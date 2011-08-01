<?php 

/**
* Used to convert the config files into paths
*/
class Config
{
	/**
	 * Used to find all files used in a project
	 * @param string $root Contains the root folder.
	 * @param string $config Contains a config file
	 * @param boolean $getSpecs Target the unit tests over the src files
	 * @return array Containing files
	 */
	public function factory($root, $config, $getSpecs = FALSE, $isRoot = TRUE)
	{
		$obj = new self($root, $config, $getSpecs, $isRoot);
		return $obj->toArray();
	}
	
	/**
	 * Contains a list of files
	 * @var array
	 **/
	protected $files = array();
	
	function __construct($root, $path, $getSpecs, $isRoot = FALSE)
	{
		$file = $root . DIRECTORY_SEPARATOR . $path;
		
		if (! file_exists($file)) {
			throw new Exception(sprintf("File doesn't exist '%s'", $path));
		}
		
		$files = json_decode(file_get_contents($file), TRUE);
		
		if ($isRoot) {
			array_unshift($files, 'thorny base');
		}
		
		foreach ($files as $selector) {
			if (is_array($selector)) {
				if (! array_key_exists('path', $selector)) {
					continue;
				}
				$selector = $selector['path'];
			}
			
			if (substr($selector, 0, 2) === './') {
				$this->files = array_merge(
					$this->files,
					Config::factory($root, substr($selector, 2), $getSpecs, FALSE)
					);
				
			} else {
				$path = $this->find_path($root, $selector, $getSpecs);
				if (strlen($path) > 0) {
					$this->files[] = $path;
				}
			}
		}
	}
	
	/**
	 * Used to build a list of files
	 * @param void
	 * @return array Containing an array of files
	 */
	public function toArray()
	{
		return $this->files;
	}
	
	/**
	 * Used to find the real path for a file
	 * @param string $root Contains the root folder.
	 * @param string $selector Contains a thorny file selector
	 * @param boolean $getSpecs Target the unit tests over the src files
	 * @return string Containing the files path
	 */
	public function find_path($root, $selector, $getSpecs)
	{
		$bits = explode(' ', $selector);
		$project = array_shift($bits);
		
		foreach (array('', 'common' . DIRECTORY_SEPARATOR, 'browser' . DIRECTORY_SEPARATOR, 'node.js' . DIRECTORY_SEPARATOR) as $env) {
			$path = $root . DIRECTORY_SEPARATOR . ($getSpecs ? $project . '-specs' : $project) . DIRECTORY_SEPARATOR . $env . implode($bits, DIRECTORY_SEPARATOR) . ($getSpecs ? '.spec.js' : '.js' );
			
			if (file_exists($path)) {
				return $path;
			}
		}
		if ($getSpecs) {
			if (strpos($selector, '-spec-demo') === FALSE) {
				throw new Exception(sprintf("Missing spec for selector '%s'", $selector));
			}
			
		} else {
			//throw new Exception(sprintf("Unknown selector '%s'", $selector));
		}
	}
}
