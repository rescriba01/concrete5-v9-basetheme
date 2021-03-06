<?php
namespace Application\Block\CardBlock;
use Concrete\Core\Block\BlockController;
use Concrete\Core;

defined('C5 EXECUTE') or die(_("Access Denied."));

class Controller extends BlockController
{
	public $helpers = array('form');

	protected $btTable = "btCardBlock";
	protected $btInterfaceWidth = 450;
	protected $btCacheBlockOutput = true;
	protected $btCacheBlockOutputOnPost = true;
	protected $btCacheBlockOutputForRegisteredUsers = true;
	protected $btInterfaceHeight = 560;
	protected $btExportFileColumns = array('fID');
	protected $btDefaultSet = "multimedia";

	public function getBlockTypeName() {
		return t("CTA Card");
	}

	public function getBlockTypeDescription() {
		return t("Displays an image, text content, and a call to action.");
	}

	public function getSearchableContent()
	{
		return $this->heading . "\n" . $this->blurb . "\n" . $this->link;
	}

	public function view()
	{
		$image = false;
		if ($this->fID) {
			$f = \File::getByID($this->fID);
			if (is_object($f)) {
				$image = Core::make('html/image', array('f' => $f))->getTag();
				$image->alt($this->name);
				$this->set('image', $image);
			}
		}
		$this->set('linkURL',$this->getLinkURL());
	}

	protected function getInternalLinkCID() {return $this->internalLinkCID;}
	protected function  getLinkURL() {
		$linkToC = \Page::getByID($this->getInternalLinkCID);
	}


	public function save($args)
	{
		$args['fID'] = $args['fID'] != '' ? $args['fID'] : 0;
		$args['awardImageID'] = $args['awardImageID'] != '' ? $args['awardImageID'] : 0;
		parent::save($args); // TODO: Change the autogenerated stub
	}

}
