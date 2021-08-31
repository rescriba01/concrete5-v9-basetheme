<?php defined('C5_EXECUTE') or die(_("Access Denied.")) ?>

<div>
    <div><?php echo t('Field 1')?></div>
    <div><?php echo $field1 ?></div>
</div>

<div>
    <div><?php echo t('Field 2')?></div>
    <div><?php echo $field2 ?></div>
</div>

<div>
    <div><?php echo t('Boolean')?></div>
    <div>
    <?php if ($booleanfield) { ?>
        <?php echo t('Yes')?>
    <?php } else { ?>
        <?php echo t('No')?>
    <?php } ?>
    </div>
</div>
