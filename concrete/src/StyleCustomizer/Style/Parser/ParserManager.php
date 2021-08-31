<?php

namespace Concrete\Core\StyleCustomizer\Style\Parser;

use Concrete\Core\Application\Application;
use Concrete\Core\Support\Manager;

class ParserManager extends Manager
{

    public function __construct(Application $app)
    {
        parent::__construct($app);
    }

    public function createColorDriver()
    {
        return new ColorParser();
    }

    public function createFontFamilyDriver()
    {
        return $this->app->make(FontFamilyParser::class);
    }

    public function createSizeDriver()
    {
        return new SizeParser();
    }

    public function createFontStyleDriver()
    {
        return new FontStyleParser();
    }

    public function createFontWeightDriver()
    {
        return new FontWeightParser();
    }

    public function createTextDecorationDriver()
    {
        return new TextDecorationParser();
    }

    public function createTextTransformDriver()
    {
        return new TextTransformParser();
    }

    public function createImageDriver()
    {
        return new ImageParser();
    }

    public function createTypeDriver()
    {
        return $this->app->make(TypeParser::class);
    }



}