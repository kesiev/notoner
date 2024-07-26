const
    COLORS = {
        Reset: "\x1b[0m",
        Bright: "\x1b[1m",
        Dim: "\x1b[2m",
        Underscore: "\x1b[4m",
        Blink: "\x1b[5m",
        Reverse: "\x1b[7m",
        Hidden: "\x1b[8m",
        FgBlack: "\x1b[30m",
        FgRed: "\x1b[31m",
        FgGreen: "\x1b[32m",
        FgYellow: "\x1b[33m",
        FgBlue: "\x1b[34m",
        FgMagenta: "\x1b[35m",
        FgCyan: "\x1b[36m",
        FgWhite: "\x1b[37m",
        FgGray: "\x1b[90m",
        BgBlack: "\x1b[40m",
        BgRed: "\x1b[41m",
        BgGreen: "\x1b[42m",
        BgYellow: "\x1b[43m",
        BgBlue: "\x1b[44m",
        BgMagenta: "\x1b[45m",
        BgCyan: "\x1b[46m",
        BgWhite: "\x1b[47m",
        BgGray: "\x1b[100m"
    },
    SYMBOLS = [
        { from: "&egrave;", to: "è" },
        { from: "&ugrave;", to: "ù" },
        { from: "&ograve;", to: "ò" }
    ],
    path = require("path"),
    fs = require("fs"),
    sep = path.sep,
    config = JSON.parse(fs.readFileSync("config.json",{ encoding: "utf8", flag: "r" }));

let
    macroList = [],
    files = {},
    refs = {},
    defs = {},
    metas = [],
    errors = [];

// --- Load language file
require(["..","..","js","data","language.js"].join(sep));
for (let k in config.language)
    LANGUAGE[k] = config.language[k];

// --- Get elements macro list
let
    macroRoot = LANGUAGE;
config.elementMacroListAt.split(".").forEach(node=>{
    macroRoot = macroRoot[node];
});
macroRoot.forEach(node=>{
    macroList.push(node.name);
})

// --- Errors manager
function err() {
    let line = Array(...arguments).join(" ");
    console.log(COLORS.FgRed+"[!!!] "+line+COLORS.Reset);
    errors.push(line);
}

// --- Loader validator
function validateLoader(key,value,validators) {
    for (let i=0;i<validators.length;i++) {
        let
            ret = false;
            validator = validators[i],
            attribute = validator.attribute == "key" ? key : value;

        if (!ret && validator.startsWith && attribute.startsWith(validator.startsWith))
            ret = true;

        if (!ret && validator.exactValue && (attribute == validator.exactValue))
            ret = true;

        if (!ret && validator.isFloat && (String(parseFloat(attribute)) == value))
            ret = true;

        if (ret) {
            validator._used = true;
            return true;
        }

    }
    return false;
}

// --- Pre-load config files
[ ...config.elementFiles, config.resourcesFile, config.uiFile, config.stencilFile ].forEach(file=>{
    files[file.id] = fs.readFileSync(file.file,{ encoding: "utf8", flag: "r" }).split("\n").map(a=>a.trim()).filter(a=>a!="");
});

// --- Load metadata values
let
    metaLoader = 0;
files.ui.forEach(line=>{
    switch (metaLoader) {
        case 0:{
            if (line.startsWith("function tableFromPdf"))
                metaLoader = 1;
            break;
        }
        case 1:{
            if (line.startsWith("meta:{"))
                metaLoader = 2;
            break;
        }
        case 2:{
            if (line.startsWith("data:"))
                metaLoader = -1;
            else {
                let
                    match = /([^:]+):(.*)/.exec(line),
                    closing = match ? match[2].trim() : 0;
                if (match && ((closing == "") || (closing == "{"))) {
                    metas.push(match[1]);
                    metaLoader = 3;
                }
            }
            break;
        }
        case 3:{
            if (line.startsWith("}"))
                metaLoader = 2;
            break;
        }
    }
});


// --- Load global properties
let
    globalProps=[],
    globalPropEntry,
    globalPropRegexp = /out\.([a-zA-Z]+).*=.*data.([a-zA-Z]+)/,
    loadGlobalProps = false;

files.stencil.forEach(line=>{
    if (line.startsWith("transferGlobalProperties")) {
        loadGlobalProps = true;
    } else if (loadGlobalProps && (globalPropEntry=globalPropRegexp.exec(line))) {
        if (globalPropEntry[1] == globalPropEntry[2])
            globalProps.push(globalPropEntry[1]);
        else
            err("Unmatching global propertyAssign",line);
    } else if (loadGlobalProps && line.startsWith("}"))
        loadGlobalProps = false;
});

// --- Load and validate resources files
let
    sections = { all:{}, file:{} },
    events = { all:[], file:{}},
    eventsMatch = new RegExp(config.elementEvents.regExp),
    startRegExp = new RegExp(config.elementDefaultValues.startRegExp),
    getRegExp = new RegExp(config.elementDefaultValues.getRegExp),
    elementTransferGlobalsRegExp = new RegExp(config.elementTransferGlobals.regExp);

config.elementFiles.forEach(ref=>{
    let
        loadEvents = false,
        globalLoaded = false,
        settingsStoreRegexp = new RegExp(ref.settingsStoreRegexp),
        refModel = ref.model || {};
    config.elementAutoStored.forEach(attribute=>{
        refModel[attribute] = true;
    });
    if (ref.elementAutoStored)
        ref.elementAutoStored.forEach(attribute=>{
            refModel[attribute]=true;
        })
    refs[ref.id] = refModel;
    defs[ref.id] = {};
    sections.file[ref.id] = [];
    events.file[ref.id] = [];
    files[ref.id].forEach((line,id)=>{

        // --- Check element default values
        let
            elementTransferGlobals = elementTransferGlobalsRegExp.exec(line),
            defaultMatches = startRegExp.exec(line),
            setMatches = settingsStoreRegexp.exec(line);
 
        if (line.startsWith("// --- ")) {
            if (sections.file[ref.id][line])
                err(ref.id,":","Duplicated section",line);
            else
                sections.file[ref.id][line] = true;
            sections.all[line] = true;

            if (line == "// --- Element macros")
                loadEvents = true;
            else
                loadEvents = false;
        }
        
        if (loadEvents) {
            let
                match = eventsMatch.exec(line);
            if (match) {
                events.file[ref.id].push(match[1]);
                if (events.all.indexOf(match[1]) == -1)
                    events.all.push(match[1]);
            }
        } else if (elementTransferGlobals) {
            if (elementTransferGlobals[1] == "settings") {
                globalProps.forEach(prop=>{
                    refs[ref.id][prop] = "(default)";
                });
                globalLoaded = true;
            }
        } else if (defaultMatches) {
            // --- Check element default values
            let
                line = files[ref.id][id+1],
                defaultValue = getRegExp.exec(line);
            console.log(defaultValue);
            if (defaultValue && (defaultValue[1] == defaultMatches[1])) {
                if (defs[ref.id][defaultValue[1]])
                    err(ref.id,":",defaultValue[1],"already transfered");
                else
                    defs[ref.id][defaultValue[1]] = JSON.stringify(eval(defaultValue[2]));
            } else
                err("Wrong default for",defaultMatches[0],"=",defaultMatches[1],"in",ref.id);
        } else if (setMatches) {
            // --- Check configuration-to-surface data transfers
            let
                from = setMatches[1],
                tox = setMatches[2];
            if (from != tox)
                err("Bad transfer",ref.id,from,tox);
            if (refs[ref.id][from])
                err(ref.id,":",from,"already transfeed as",refs[ref.id][from]);
            else
                refs[ref.id][from] = tox;
        }
    });

    if (!globalLoaded)
        err(ref.id,":","Global attributes not transfered");
});

// --- Validate file sections and macros
for (let f in sections.file) {
    events.file[f].forEach(e=>{
        if (macroList.indexOf(e) == -1)
            err(f,":","Undocumented macro",e);
    });
    for (let k in sections.all)
        if (!sections.file[f][k])
            err(f,":","Missing section",k);
}

// --- Load and validate the resources file
let
    id,
    codeId,
    ref,
    startLoader,
    mode="Error",
    data = {},
    getNextId = false,
    wait = false,
    isCustom,
    isSemiCustom;

files.resources.forEach(line=>{
    if (startLoader) {
        if (wait) {
            if (line.startsWith("}")) wait=false;
        } else {
            if (line.startsWith("toolbox.addElement") || line.startsWith("// ---")) {
                id = "NONE";
                mode = "NONE";
                ref = "NONE";
                getNextId = true;
            } else if (getNextId && line.startsWith("id:")) {
                getNextId = false;
                codeId = line;
                id = codeId;
                ref = "NONE";
                isCustom = false;
                isSemiCustom = false;
                config.resourcesFileElements.forEach(element=>{
                    if (element.match == codeId) {
                        id = element.id;
                        ref = element.elementFile;
                        isCustom = element.isCustom;
                        isSemiCustom = element.isSemiCustom;
                    }
                });
                data[id] = { ref:ref, isCustom:isCustom, isSemiCustom:isSemiCustom };
            } else if (line.startsWith("onLoad")) {
                mode = "load";
            } else if (line.startsWith("meta:")) {
                mode = "meta";
                data[id][mode] = []; // Empty meta allowed
            } else if (line.startsWith("onSave")) {
                mode = "save";
            } else if (line.startsWith("onReset")) {
                mode = "reset";
            } else if ((mode == "load") && line.startsWith("default:")) {
                mode = "default";
            } else if (line.match(/^[a-zA-Z]*:/)) {

                let
                    parts = /^([a-zA-Z]*):(.*)/.exec(line),
                    key = parts[1].trim(),
                    value = parts[2].trim();

                if (
                    data[id] &&
                    key != "surface" &&
                    mode != "NONE"
                ) {

                    let
                        type = "fixed",
                        checkRepeat = true;

                    if (value.endsWith(",")) value=value.substr(0,value.length-1);
                    switch (mode) {
                        case "meta":{
                            if (parts[1] == "attribute") {
                                key = parts[2].trim().replace(/,$/,"").replace(/^"/,"").replace(/"$/,"").split(".")[0];
                                checkRepeat = false;
                            } else
                                key = 0;
                            break;
                        }
                        case "load":{
                            if (!validateLoader(key,value,config.elementAllowedLoaders))
                                err("Bad load",id,key,value);
                            if (value.startsWith("data."))
                                type = "loaded";
                            break;
                        }
                        case "save":{
                            if (!value.startsWith("surface."))
                                err("Bad save",id,key,value);
                            if (value.startsWith("surface."))
                                type = "loaded";
                            break;
                        }
                        case "reset":{
                            if (!value.startsWith("surface."))
                                err("Bad reset",id,key,value);
                            if (value.startsWith("surface."))
                                type = "loaded";
                            break;
                        }
                        case "default":{
                            if (!value.startsWith("data."))
                                err("Bad default",id,key,value);
                            if (value.startsWith("data."))
                                type = "loaded";
                            break;
                        }
                    }
                    
                    if (key) {
                        if (!data[id][mode]) data[id][mode] = { };
                        if (checkRepeat && data[id][mode][key])
                            err("Conflicting key",id,mode,key,"was",data[id][mode][key], "is",type);
                        else
                            data[id][mode][key]=type;
                    }

                    if (line.endsWith("{"))
                        wait=true;
                
                }

            }
        }
    } else if (line.endsWith("Elements"))
        startLoader = true;
});

// --- Check unused validators

config.elementAllowedLoaders.forEach(validator=>{
    if (!validator._used)
        err("Validator",validator.attribute,validator.startsWith || validator.exactValue || (validator.isFloat? "isFloat": "???"),"not used. Remove.")
})

// --- Add global transfer attributes

globalProps.forEach(prop=>{
    for (let k in data) {
        if (data[k].load[prop])
            err(k,":","Manually loads the global attribute",prop);
        else
            data[k].load[prop] = 'loaded';
        if (data[k].save[prop])
            err(k,":","Manually saves the global attribute",prop);
        else
            data[k].save[prop] = 'loaded';
    }
});

// --- Cross-validate element files
let
    reports = [];

for (let k in data) {
    console.log();
    console.log("---",k);
    let
        complexity = 0,
        element = data[k],
        ref = refs[element.ref],
        defaults = defs[element.ref],
        list = [];

    // Prepare report
    for (let a in element.load) {
        let
            priority = 0,
            def=false,
            sym="[??]",
            onempty=defaults[a],
            userinput=element.meta ? element.meta[a] : 0;

        // Cross and validate data
        if (!ref || !ref[a])
            err(k,":","Value",a,"not transfered");
        if (element.default[a]) 
            def = true;
        if (element.load[a]=="loaded") {
            if (!element.save || (element.save[a]!=element.load[a])) {
                err(k,":","Data",a,"loaded but not saved");
            } else if (userinput) {
                sym = "[->]";
            } else {
                complexity++;
                sym = "[<>]";
            }
        } else {
            sym = "[__]";
            if (element.save[a])
                err(k,":","data",a,"not loaded but saved");
        }

        // Define entry priority
        if (def || onempty || (globalProps.indexOf(a)!= -1))
            priority = -2;
        else if ((sym ==  "[__]") && !element.isCustom && (config.mandatoryNotCustomFixedAttributes.indexOf(a)!=-1))
            priority = -2;
        else if ((sym ==  "[__]") && element.isCustom)
            priority = 2;
        else if ((sym == "[<>]"))
            priority = 1;
        else if ((sym == "[->]"))
            priority = -1;

        list.push({ priority:priority, sym:sym, def:def, label:a, onempty:onempty, userinput:userinput});

    }

    // Print report
    list.sort((a,b)=>{
        if (a.priority < b.priority) return -1;
        else if (a.priority > b.priority) return 1;
        else if (a.sym < b.sym) return -1;
        else if (a.sym > b.sym) return 1;
        else if (a.def && !b.def) return -1;
        else if (!a.def && b.def) return 1;
        else if (a.onempty === undefined && b.onempty !== undefined) return -1;
        else if (a.onempty !== undefined && b.onempty === undefined) return 1;
        else return 0;
    })
    list.forEach(line=>{
        let
            text = line.sym+" "+(line.def?"*":" ")+" "+line.label;
        if (line.onempty)
            text+=" ("+line.onempty+")";
        switch (line.priority) {
            case -2:{
                text = COLORS.FgGray+text+COLORS.Reset;
                break;
            }
            case -1:{
                text = COLORS.FgGray+COLORS.Underscore+text+COLORS.Reset;
                break;
            }
            case 1:{
                text = COLORS.FgGreen+text+COLORS.Reset;
                break;
            }
            case 2:{
                text = COLORS.FgBlue+text+COLORS.Reset;
                break;
            }
        }
       
        console.log(text);
    })

    // Check load/save matching
    for (let a in element.save)
        if (!element.load || (element.save[a] != element.load[a])) {
            err(k,":",a,"is saved but not loaded");
        }

    // Match with resources files
    if (ref) {
        // Dumps ignored fields
        for (let a in ref)
            if (!element.load || !element.load[a]) {
                if (element.isCustom) {
                    console.log(COLORS.FgRed+"[ignored] "+a+COLORS.Reset);
                    err(k,":",a,"is not customizable on a custom element");
                } else
                    console.log(COLORS.FgYellow+"[ignored] "+a+COLORS.Reset);
            }
    } else
        err(k,":","Matching object not defined");

    // Check if fixed attributes on user-customized fileds are not loaded or saved
    if (!element.isCustom)
        config.mandatoryNotCustomFixedAttributes.forEach(attr=>{
            if (!element.isSemiCustom || ((attr!="width") && (attr!="height"))) {
                if (element.load[attr]!="fixed")
                    err(k,":","Fixed value",attr,"on user customized element loaded. Not needed.");
                if (element.save[attr])
                    err(k,":","Fixed value",attr,"on user customized element saved. Not needed.");
            }
        })

    // Check if user-customized fileds are correctly loaded/saved
    if (element.meta)
        for (let k in element.meta) {
            if (!element.load[k])
                err(k,":","is user customized by user but is not loaded");
            if (!element.save[k])
                err(k,":","is user customized by user but is not saved");
        }

    // Check if custom elements have no user-defined attributes and vice versa
    if (element.isCustom && element.meta)
        err(k,":","it is custom but has UI");
    else if (!element.isCustom && !element.meta)
        err(k,":","it is user created but has no UI");

    // Store report for documentation
    let
        foundElement;

    config.resourcesFileElements.forEach(t=>{
        if (t.id == k)
            foundElement = t;
    });
    reports.push({
        id:k,
        element:foundElement,
        complexity:complexity,
        attributes:list
    });

}

reports.sort((a,b)=>{
    if (a.element.elementFile < b.element.elementFile) return -1;
    else if (a.element.elementFile > b.element.elementFile) return 1;
    else if (a.complexity < b.complexity) return -1;
    else if (a.complexity > b.complexity) return 1;
    else return 0;
})

console.log();

// --- Check template files

function testTableFile(tableFile) {
    if (fs.existsSync(tableFile)) {
        const
            text = fs.readFileSync(tableFile, { encoding: "utf8", flag: "r" });

        let
            ids = {},
            jsonData;

        try {
            jsonData = JSON.parse(text);
        } catch (e) {
            err(tableFile,":","Can't parse file",tableFile);
        }

        LANGUAGE.languages.forEach(language=>{
            if (!jsonData.meta.title)
                err(tableFile,":","Missing game title");
            else if (!jsonData.meta.title[language.id])
                err(tableFile,":","Game title must be in all languages");
            if (!jsonData.meta.description)
                err(tableFile,":","Missing game description");
            else if (!jsonData.meta.description[language.id])
                err(tableFile,":","Game description must be in all languages");
        })
        if (jsonData.data)
            jsonData.data.forEach(element=>{
                let
                    id  ="NONE";

                config.resourcesFileElements.forEach(searchElement=>{
                    if (searchElement.elementModels && (searchElement.elementModels.indexOf(element.type) != -1))
                        id = searchElement.id;
                });
                
                if (data.id)
                    if (ids[data.id])
                        err(tableFile,":","Duplicated id",data.id);
                    else
                        ids[data.id]=true;

                if (!data[id])
                    err(tableFile,":","Type",element.type,"(",id,")","not valid");
                else {
                    for (let k in element.data)
                        if (!data[id].load[k])
                            err(tableFile,":","Field",k,"for",id,"is not valid");
                        else if (data[id].load[k] != "loaded")
                            err(tableFile,":","Field",k,"for",id,"not loaded");

                    let
                        def = defs[data[id].ref];

                    if (def)
                        for (let k in def)
                            if (def[k] == JSON.stringify(element.data[k]))
                                err(tableFile,":","Field",k,"on",id,"set the same value as default",def[k],"Remove it.");

                    /*
                    for (let k in data[id].load)
                        if ((data[id].load[k] == "loaded") && (element.data[k] === undefined))
                            err("Field",k,"for",id,"not defined");
                    */
                }

        })
    
    }
}

let root=["..","..","databases"].join(sep);
fs.readdirSync(root).forEach(file => {
    let
        fileStat = fs.statSync(root + sep + file);

    if (fileStat.isDirectory()) {
        const
            subpath = root + sep + file + sep;

        fs.readdirSync(subpath).forEach(file => {
            let
                fileStat = fs.statSync(subpath + sep + file);

            if (fileStat.isDirectory()) {
                console.log();
                console.log("---",file);
                testTableFile(subpath + sep + file + sep + "table.json");
            }
        });
    }
});

console.log();
console.log("--- (Self-contained table sample)");
testTableFile(["..","assets","sample-selfcontained-table","content","table.json"].join(sep));

// --- Generate JSON references

if (!errors.length) {

    let
        pending;

    function translate(lc,sections,sectionsIndex,e) {
        if (e) {
            let label = e[lc] || e.EN;
            if (typeof label == "string") {
                label = label.replace(/\{\{([^}]+)\}\}/g,(m,m1)=>{
                    let
                        split = m1.split(".");
                    switch (split[0]) {
                        case "APP_NAME":{
                            return "Notoner";
                            break;
                        }
                        case "language":{
                            let
                                root = LANGUAGE,
                                out;
                            for (let i=1;i<split.length;i++)
                                if (root[split[i]] === undefined) {
                                    err("Key not found",m1);
                                    root = 0;
                                    break;
                                } else
                                    root = root[split[i]];
                            if (root) {
                                out = translate(lc,sections,sectionsIndex,root);
                                SYMBOLS.forEach(symbol=>{
                                    out = out.replace(new RegExp(symbol.from, 'g'),symbol.to);
                                });
                                if (out.indexOf("&") != -1)
                                    err("Unallowed symbol:",out);
                                return out;
                            } else
                                return "???";
                            break;
                        }
                        case "attributeType":{
                            let
                                type = LANGUAGE.attributeTypes[split[1]];
                            
                            if (type === undefined)
                                err("Missing attribute type reference",m1);
                            else if (type.section) {
                                let
                                    sectionTitle = getId(translate(lc,sections,sectionsIndex,type.section.title));
                                if (!sectionsIndex[type.section.id]) {
                                    sectionsIndex[type.section.id] = true;
                                    sections.push(type.section);
                                }
                                return "["+translate(lc,sections,sectionsIndex,type.section.shortTitle)+"](#"+sectionTitle+")";
                            } else
                                return translate(lc,sections,sectionsIndex,type.title);
                            break;
                        }
                        default:{
                            err("Invalid placeholder",m1)
                        }
                    }

                });
            }
            return label;
        } else {
            err("Untranslatable text");
            return "???";
        }
    }

    function getAttribute(root,key) {
        if (LANGUAGE.attributes[root] && LANGUAGE.attributes[root][key])
            return LANGUAGE.attributes[root][key];
        else if (LANGUAGE.attributes.default[key])
            return LANGUAGE.attributes.default[key];
        else {
            err(root,":","Missing attribute",key);
            return 0;
        }
    }

    function getAttributeType(attribute) {
        if (LANGUAGE.attributeTypes[attribute.type])
            return LANGUAGE.attributeTypes[attribute.type];
        else if (attribute.type)
            return attribute.type;
        else
            return 0;
    }

    function getId(id) {
        return id.toLowerCase().replace(/ /g,"-");
    }

    function renderRow(attribute,type,description) {
        if (!description.match(/\.$/) && !description.match(/\. \(/))
            err("Manual",":","Description is missing trailing full stop:",description);
        return attribute+" | "+type+" | "+description+" |\n";
    }

    function renderSubSection(lc,sections,sectionsIndex,section,parent,depth) {
        let
            file = "",
            pad = "",
            post = "";
        
        if (!depth) depth = 0;

        for (let i=0;i<depth;i++)
            pad+="&nbsp;&nbsp;&nbsp;";

        if (section) {

            if (section.isArray)
                post+="[]";

            section.attributes.forEach(attribute=>{

                let
                    attributeName = attribute.name;
                
                if ((attribute.type === undefined) && !attribute.section)
                    attribute = getAttribute(0,attribute.name);

                let
                    type = getAttributeType(attribute),
                    typeLabel;
                if (!type && attribute.section) {
                    typeLabel = "";
                } else if (type.section) {
                    let
                        sectionTitle = getId(translate(lc,sections,sectionsIndex,type.section.title));
                    if (!sectionsIndex[type.section.id]) {
                        sectionsIndex[type.section.id] = true;
                        sections.push(type.section);
                        pending = true;
                    }
                    typeLabel = "["+translate(lc,sections,sectionsIndex,type.section.shortTitle)+"](#"+sectionTitle+")";
                } else if (type.title)
                    typeLabel =  translate(lc,sections,sectionsIndex,type.title);
                file+=renderRow(section.isValuesList ? "&nbsp;" : pad+(parent ? parent+post+"." : "")+attributeName,typeLabel,translate(lc,sections,sectionsIndex,attribute.title));
                file+=renderSubSection(lc,sections,sectionsIndex,attribute.section,(parent ? parent+post+"." : "")+attributeName,depth+1);
            })
        }

        return file;
    }


    console.log("Creating guides...");

    // Validate metadata documentation
    let
        metasDoc = LANGUAGE.metadata.section.attributes.map(attr=>attr.name);
    metas.forEach(meta=>{
        if (metasDoc.indexOf(meta) == -1)
            err("Undocumented meta",meta);
    })
    metasDoc.forEach(meta=>{
        if (metas.indexOf(meta) == -1)
            err("Meta",meta,"documented but not valid");
    });

    LANGUAGE.languages.forEach(language=>{
        let
            lc = language.id,
            file = "",
            sections = [],
            sectionsIndex = {},
            columns = translate(lc,sections,sectionsIndex,LANGUAGE.attributeColumns),
            tableHeader;

        tableHeader=columns.join(" | ")+" |\n";
        columns.forEach(item=>{
            tableHeader+="--- | ";
        });
        tableHeader+="\n";

        file+="# "+translate(lc,sections,sectionsIndex,LANGUAGE.documentationLabels.title)+"\n\n";
        file+=translate(lc,sections,sectionsIndex,LANGUAGE.documentationLabels.description)+"\n\n";

        file+="## "+translate(lc,sections,sectionsIndex,LANGUAGE.metadata.title)+"\n\n";
        file+=translate(lc,sections,sectionsIndex,LANGUAGE.metadata.description)+"\n\n";
        file+=tableHeader;
        file+=renderSubSection(lc,sections,sectionsIndex,LANGUAGE.metadata.section);
        file+="\n";

        file+="### "+translate(lc,sections,sectionsIndex,LANGUAGE.generators.title)+"\n\n";
        file+=translate(lc,sections,sectionsIndex,LANGUAGE.generators.description)+"\n\n";
        file+="\n";

        file+="### "+translate(lc,sections,sectionsIndex,LANGUAGE.subtemplates.title)+"\n\n";
        file+=translate(lc,sections,sectionsIndex,LANGUAGE.subtemplates.description)+"\n\n";
        file+=tableHeader;
        file+=renderSubSection(lc,sections,sectionsIndex,LANGUAGE.subtemplates.section);
        file+="\n";

        file+="## "+translate(lc,sections,sectionsIndex,LANGUAGE.documentationLabels.elements)+"\n\n";
        file+=translate(lc,sections,sectionsIndex,LANGUAGE.documentationLabels.elementsSample)+"\n\n";

        reports.forEach(report=>{
            file+="### "+translate(lc,sections,sectionsIndex,report.element.title)+"\n\n";

            if (report.element.description)
                file+=translate(lc,sections,sectionsIndex,report.element.description)+"\n\n";
            else
                err("Missing description for element",report.element.id);

            if (report.element.elementModels) {
                file+="#### "+translate(lc,sections,sectionsIndex,LANGUAGE.documentationLabels.elementId)+"\n\n";
                report.element.elementModels.sort();
                report.element.elementModels.forEach(model=>{
                    file += " * `\""+model+"\"`\n";
                });
                file+="\n";
            } else
                err("Element",report.element.id,"have no models");

            if (report.element.defaultTags) {
                file+="#### "+translate(lc,sections,sectionsIndex,LANGUAGE.documentationLabels.elementTags)+"\n\n";
                report.element.defaultTags.sort();
                report.element.defaultTags.forEach(tag=>{
                    file += " * `\""+tag+"\"`\n";
                });
                file+="\n";
            } else
                err("Element",report.element.id,"have no default tags");

            if (events.file[report.element.elementFile]) {
                file+="#### "+translate(lc,sections,sectionsIndex,LANGUAGE.documentationLabels.elementMacroEvents)+"\n\n";
                events.file[report.element.elementFile].sort();
                events.file[report.element.elementFile].forEach(tag=>{
                    file += " * `"+tag+"`\n";
                });
                file+="\n";
            } else
                err("Element",report.element.id,"have no macro events");
                
            file+="#### "+translate(lc,sections,sectionsIndex,LANGUAGE.documentationLabels.elementAttributes)+"\n\n";
            file+=tableHeader;
            report.attributes.forEach(line=>{
                if (line.sym != "[__]") {
                    let
                        attribute = getAttribute(report.element.elementFile,line.label),
                        type = getAttributeType(attribute),
                        typeLabel;

                    if (!type && attribute.section) {
                        typeLabel = "";
                    }  else if (type.section) {
                        let
                            sectionTitle = getId(translate(lc,sections,sectionsIndex,type.section.title));
                        if (!sectionsIndex[type.section.id]) {
                            sectionsIndex[type.section.id] = true;
                            sections.push(type.section);
                        }
                        typeLabel = "["+translate(lc,sections,sectionsIndex,type.section.shortTitle)+"](#"+sectionTitle+")";
                    } else
                        typeLabel = translate(lc,sections,sectionsIndex,type.title);
                    file+=renderRow(line.label,typeLabel,translate(lc,sections,sectionsIndex,attribute.title));
                    file+=renderSubSection(lc,sections,sectionsIndex,attribute.section,line.label,1);
                }
            })
            file+="\n";
        });

        file+="## "+translate(lc,sections,sectionsIndex,LANGUAGE.documentationLabels.structures)+"\n\n";
        file+=translate(lc,sections,sectionsIndex,LANGUAGE.documentationLabels.structureSample)+"\n\n";

        pending = true;
        do {
            pending = false;
            sections.forEach(section=>{
                if (!section.done) {
                    file+="### "+translate(lc,sections,sectionsIndex,section.title)+"\n\n";

                    if (section.description)
                        file+= translate(lc,sections,sectionsIndex,section.description)+"\n\n";

                    file+="#### "+translate(lc,sections,sectionsIndex,LANGUAGE.documentationLabels.structureAttributes)+"\n\n";
                    file+=tableHeader;
                    file+=renderSubSection(lc,sections,sectionsIndex,section);
                    file+="\n";
                    section.done = true;
                }
            });
        } while (pending);

        sections.forEach(section=>{
            delete section.done;
        })

        fs.writeFileSync(["..","reference","reference-"+lc+".md"].join(sep), file);
        
    })
}

// --- Finalize
console.log();
console.log("---");
console.log("Errors:",errors.length);
errors.forEach(line=>{
    console.log(COLORS.FgRed+"[!!!] "+line+COLORS.Reset);
});
