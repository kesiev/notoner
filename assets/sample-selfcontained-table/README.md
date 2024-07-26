# Self-contained table templates

## The Notoner save files

Notoner saved tables are **ZIP files** containing a `table.json` file that collects the table metadata and the game elements definitions, and some image files - usually the images of what the player scribbled on the sheets. But I've got _two secrets_ for you to share.

### Notoner self-contained table template

Notoner saved tables can also **refer to files inside the save file** to customize game elements such as dice and tokens. This way, a Notoner save file can also work as a _tiny, self-contained table template_ that can be shared without hosting it on a Notoner server. The only caveat is that you can't create a _JavaScript-generated table_ this way - and I guess you already know _why_. You can find an example [here](sample-selfcontained-table.zip.notoner). [This](content/table.json) is the `table.json` file packed inside the example ZIP file - you can learn how to reference files inside the save file from there.

### Notoner JSON save files

Notoner automatically detects and can load a **JSON version** of the save files. All files are stored in a `files` key: SVGs are saved as plain text and PNGs as Base64 text. Have a look at [this](sample-selfcontained-table.json.notoner).

## The `generate.js`

The `generate.js` script you can find [here](generate.js) creates the sample files mentioned here. It collects all the files referenced by the [content/table.json](content/table.json) file and packs both a `JSON` file and a `zip` file that can be loaded by Notoner. To run it, just go to its directory and launch it with `node generate.js`. If you plan to automate some kind of workflow, that script can be a good start.
