<?php

defined('C5_EXECUTE') or die(_("Access Denied."));

?>

<div class="form-group">
    <label class="control-label" for="field1"><?=t('Field 1')?></label>
    <input type="text" class="form-control" name="field1" value="<?php echo $field1?>">
</div>

<div class="form-group">
    <label class="control-label" for="field1"><?=t('Field 2')?></label>
    <input type="text" class="form-control" name="field2" value="<?php echo $field2?>">
</div>

<div class="form-group">
    <div class="checkbox">
        <label>
        <input type="checkbox" name="booleanfield" value="1" <?php if ($booleanfield) { ?>checked<?php } ?>>
        <?php echo t('Boolean Field')?>
        </label>
    </div>
</div>
