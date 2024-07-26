# Table template base set assets

Notoner templates support different layouts for each language: for example, the [Poker Dice template](../../databases/base/poker-dice/table.json) has a sheet element that uses a [different](../../databases/base/poker-dice/sheet-1-EN.svg) [SVG](../../databases/base/poker-dice/sheet-1-IT.svg) for each language.

To do that, I suggest working on [a master SVG file](poker-dice/sheet-1.svg) for all the languages with a layer for each of them (EN, IT, etc.). Then, when you're happy with the result:

 - Save a different copy of the SVG with the layers you need (i.e., [sheet-1-EN.svg](../../databases/base/poker-dice/sheet-1-EN.svg), [sheet-1-IT.svg](../../databases/base/poker-dice/sheet-1-IT.svg), etc.) in your template directory.
 - Before saving each copy, **make sure to convert all the text to paths** to make sure the text is rendered correctly anywhere. (On Inkscape: for each layer select all the objects, then select _Paths -> Object to Path_)

## Chronicles of Stampadia

As a more complex example of _JavaScript-generated tables_, Notoner includes the game [Chronicles of Stampadia](https://www.kesiev.com/stampadia/), a single-player print-and-play roguelike dungeon crawler I worked on in 2021. [This script](stampadia-chronicles/generator-packager.js) takes care of bundling code and assets, applying little patches, minifying everything, and saving it into its [template directory](../../databases/base/stampadia-chronicles/).

If you need to build or update the [Notoner CoS generator](../../databases/base/stampadia-chronicles/generator.js), download and unzip a snapshot of [CoS source code](https://github.com/kesiev/stampadia), go to the script directory, install the script dependencies with `npm install`, and then launch it with `node generate.js [path-to-stampadia-snapshot]`.

## 7 Dice Wonders

[This page](7-dice-wonders/index.html) loads the [original images](7-dice-wonders/original) downloaded from [BGG](https://boardgamegeek.com/boardgame/143085/7-dice-wonders), cuts them, prepares the table template assets and definition, and allows you to download all the pieces.

## Zombie in My Pocket

[This page](zombie-in-my-pocket/index.html) loads the [original images](zombie-in-my-pocket/original) downloaded from [BGG](https://boardgamegeek.com/filepage/32541/zombie-in-my-pocket-complete-game-package-revised), cuts them, prepares the table template assets and definition, and allows you to download all the pieces.

## Jigsaw

[This page](jigsaw/index.html) loads the [image in the database folder](../../databases/base/jigsaw/image.png) _(she is Mae, our naughty cat)_, cuts it, and prepares the table template definition for you to copy and paste. The pieces are created by clipping the original image, so no pieces image is needed.

## Klondike

[This page](klondike/index.html) builds all the game elements and their macros and prepares the table template definition for you to copy and paste.
