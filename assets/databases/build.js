const
    path = require("path"),
    fs = require("fs"),
    sep = path.sep,
    root = ["..", "..", "databases"].join(sep);
    index = {},
    out = { index:[] };

fs.readdirSync(root).forEach(file => {
    let
        fileStat = fs.statSync(root + sep + file);

    if (fileStat.isDirectory()) {
        const
            subpath = root + sep + file + sep,
            indexFile = subpath + "index.json",
            index = {
                entries:[]
            };

        fs.readdirSync(subpath).forEach(file => {
            let
                fileStat = fs.statSync(subpath + sep + file);

            if (fileStat.isDirectory()) {
                const
                    tableFile = subpath + sep + file + sep + "table.json";
                if (fs.existsSync(tableFile)) {
                    const
                        data = fs.readFileSync(tableFile, { encoding: "utf8", flag: "r" });

                    try {
                        let jsonData = JSON.parse(data);
                        fs.writeFileSync(tableFile, JSON.stringify(jsonData,null,"\t"));
                        index.entries.push({ path:file, meta:jsonData.meta });
                    } catch (e) {
                        console.warn("Can't parse file",tableFile);
                    }
                }
            }
        });
        fs.writeFileSync(indexFile, JSON.stringify(index,null,"\t"));
    }
});

console.log("Table JSON prettified and database indexes rebuilt.");