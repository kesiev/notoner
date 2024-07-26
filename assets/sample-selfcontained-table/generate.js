
const
    { table } = require("console"),
    JSZip = require('../../js/libs/jszip/jszip.min.js'),
    path = require("path"),
    fs = require("fs"),
    sep = path.sep,
    contentPath = "content" + sep

let
    tableData,
    tableFile = contentPath + "table.json",
    tableText = fs.readFileSync(tableFile, { encoding: "utf8", flag: "r" });

try {
    tableData = JSON.parse(tableText);
    fs.writeFileSync(tableFile, JSON.stringify(tableData,null,"\t"));
} catch (e) {
    tableData = 0;
    console.warn("Can't parse file",tableFile);
}

// --- Prepare the JSON file

function collectFiles(tableData,files,zip) {
    if (typeof tableData == "object") {
        if (tableData.isResource && tableData.file && !files[tableData.file]) {
            console.log("Packing",tableData.file,"...");
            switch (tableData.type) {
                case "svg":{
                    let
                        data = fs.readFileSync(contentPath + tableData.file, { encoding: "utf8", flag: "r" });
                    zip.file(tableData.file,data);
                    files[tableData.file] = data;
                    break;
                }
                case "canvas":{
                    files[tableData.file] = "data:image/png;base64,"+fs.readFileSync(contentPath + tableData.file, { encoding: "base64", flag: "r" });
                    zip.file(tableData.file,fs.readFileSync(contentPath + tableData.file));
                    break;
                }
            }
        } else
            for (let k in tableData)
                collectFiles(tableData[k],files,zip);
    }
}

if (tableData) {

    let
        zip = new JSZip(),
        files = {};

    collectFiles(tableData,files,zip);
    tableData.files = files;

    fs.writeFileSync("sample-selfcontained-table.json.notoner", JSON.stringify(tableData,null,"\t"));

    zip
        .file("table.json", fs.readFileSync(tableFile))
        .generateNodeStream({type:'nodebuffer', compression: "DEFLATE", streamFiles:true})
        .pipe(fs.createWriteStream('sample-selfcontained-table.zip.notoner'))
        .on('finish', function () {
            console.log("Sample files updated.");
        });
    
}

