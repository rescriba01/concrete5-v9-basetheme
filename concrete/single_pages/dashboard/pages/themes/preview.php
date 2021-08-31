<?php

defined('C5_EXECUTE') or die("Access Denied.");

$ui = new \Concrete\Core\Application\Service\UserInterface();
$config = Core::make('config');
$show_titles = (bool) $config->get('concrete.accessibility.toolbar_titles');
$show_tooltips = (bool) $config->get('concrete.accessibility.toolbar_tooltips');
$large_font = (bool) $config->get('concrete.accessibility.toolbar_large_font');
$panelCustomizeTheme = URL::to('/ccm/system/panels/theme/customize', $customizeTheme->getThemeID(), $previewPage->getCollectionID());
?>

<?= View::element('icons') ?>
<div id="ccm-page-controls-wrapper" class="ccm-ui">
    <div id="ccm-toolbar">
        <ul>
            <li class="ccm-logo float-start"><span><?= $ui->getToolbarLogoSRC() ?></span></li>
            <li class="float-start">
                <a href="<?= URL::to('/dashboard/pages/themes', 'view') ?>">
                    <svg>
                        <use xlink:href="#icon-arrow-left"/>
                    </svg>
                </a>
            </li>
            <li class="float-start d-none d-md-block">
                <a href="#" <?php
                   if ($show_tooltips) { ?>class="launch-tooltip"<?php } ?>
                   data-toggle="tooltip"
                   data-placement="bottom"
                   data-delay='{ "show": 500, "hide": 0 }'
                   data-launch-panel="customize-theme"
                   title="<?= t('Skins and Customizer') ?>">
                    <svg>
                        <use xlink:href="#icon-pencil"/>
                    </svg>
                    <span class="ccm-toolbar-accessibility-title"><?= tc(
                            'toolbar',
                            'Preview &amp; Customize'
                        ) ?></span>
                </a>
            </li>

        </ul>
    </div>
</div>

<div data-vue="theme-customizer" class="h-100">

    <div class="ccm-page h-100">
    <iframe class="ccm-page-preview-frame" style="margin-top: 48px" class="w-100 h-100" style="border: 0"
            src="<?=URL::to('/ccm/system/panels/page/design/preview_contents')?>?cID=<?=$previewPage->getCollectionID()?>"></iframe>
    </div>

</div>
<script src="//ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js"></script>
<script type="text/javascript">

    $(function () {
        $('html').addClass('h-100 ccm-panel-ready')
        $('body, body > .ccm-ui').addClass('h-100');
        ConcretePanelManager.register({'identifier': 'customize-theme', 'position': 'left', url: '<?=$panelCustomizeTheme?>'});
        ConcreteToolbar.start();
    });

</script>