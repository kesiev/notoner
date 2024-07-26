let Toolbox = function() {

    const
        DEBUG = false,
        COMPRESSMODE_NONE = 0,
        COMPRESSMODE_JSONFILE = 1,
        COMPRESSMODE_ZIP = 2;

    let
        toolbox,
        saveCompressMode = COMPRESSMODE_ZIP,
        table,
        elements = [],
        elementsById = {},
        toolCategories = [],
        toolCategoriesById = {},
        tableCategories = [],
        tableCategoriesById = {},
        tablesById = {},
        toolTypes = {},
        tools = [],
        fonts = [],
        sets = [],
        manuals = [],
        manualsById = {},
        databases = [];

    // --- Table management

    function addElementToTable(type,data,def,zindex) {
        if (elementsById[type]) {
            let
                loaded = elementsById[type].onLoad(data);

            if (zindex === undefined)
                zIndex = table.node.childNodes.length;

            if (!def)
                def = loaded.default;

            loaded.default.zIndex = zindex;
            loaded.surface._defaultData = def;
            loaded.surface._elementType = type;
            loaded.surface._toolbox = toolbox;
            loaded.surface._addTo(table);
        }
    }

    function getTableData(meta) {
        let
            data = { meta:meta, data:[] },
            childNodes = table.node.childNodes;

        for (let i=0;i<childNodes.length;i++) {
            let
                surface = childNodes[i]._surface;
            if (surface && surface._elementType) {
                let
                    surfaceData = elementsById[surface._elementType].onSave(surface);
                data.data.push({ type:surface._elementType, data:surfaceData, default:surface._defaultData });
            }
        }

        return data;
    }

    function initializeTable() {
        let
            childNodes = table.node.childNodes;

        for (let i=0;i<childNodes.length;i++) {
            let
                surface = childNodes[i]._surface;
            if (surface && surface.onResetMacro)
                Macro.run(surface.onResetMacro,surface);
        }
    }

    function resetTable() {
        let
            childNodes = Array.from(table.node.childNodes),
            elements = [];

        childNodes.forEach(node=>{
            let
                surface = node._surface;
            if (surface) {
                if (surface._elementType && surface._defaultData)
                    elements.push({ zIndex:surface._defaultData.zIndex, surface:surface, node:node });
                table.node.removeChild(node);
            }
        });

        elements.sort((a,b)=>{
            if (a.zIndex > b.zIndex) return 1;
            else if (a.zIndex < b.zIndex) return -1;
            else return 0;
        });

        elements.forEach(element=>{
            table.node.appendChild(element.node);
        });

        elements.forEach(element=>{
            elementsById[element.surface._elementType].onReset(element.surface,element.surface._defaultData);
        });

        initializeTable();
        
    }
    
    // --- Data saving

    function packTableDataRecursiveWait(session) {
        session.pending++;
    }

    function packTableDataRecursiveDone(session) {
        session.done++;
        if (session.done == session.pending) {
            if (DEBUG) console.log("--- Pack done");
            session.cb(session.resources,session.data);
        }
    }

    function packTableDataRecursive(data,compressMode,session,parent,key) {
        if (!parent) {
            session.pending = 1;
            session.done = 0;
            parent = session.data;
        }
        if (typeof data == "object")
            if (data.isResource) {
                switch (data.type) {
                    case "canvas":{
                        let
                            file = data.file;
                        // Storing canvas...                            
                        if (!file)
                            file = "image-"+Global.generateUUID()+".png";
                        switch (compressMode) {
                            case COMPRESSMODE_NONE:
                            case COMPRESSMODE_JSONFILE:{
                                if (!session.data.files[file]) {
                                    if (DEBUG) console.log("Stored",file);
                                    session.data.files[file]=data.canvas.toDataURL("image/png");
                                }
                                parent[key] = { isResource:true, type:"canvas", file:file, meta:Global.clone(data.meta) };
                                break;
                            }
                            case COMPRESSMODE_ZIP:{
                                parent[key] = { isResource:true, type:"canvas", file:file, meta:Global.clone(data.meta) };
                                if (!session.cache[file]) {
                                    session.cache[file] = true;
                                    packTableDataRecursiveWait(session);
                                    data.canvas.toBlob((data)=>{
                                        if (DEBUG) console.log("Packed",file);
                                        session.resources.file(file,data);
                                        packTableDataRecursiveDone(session);
                                    })
                                }
                                break;
                            }
                        }
                        break;
                    }
                    case "svg":{
                        // Storing SVG...
                        let
                            file = data.file;
                        if (!file)
                            file = "svg-"+Global.generateUUID()+".svg";
                        switch (compressMode) {
                            case COMPRESSMODE_NONE:
                            case COMPRESSMODE_JSONFILE:{
                                if (!session.data.files[file]) {
                                    if (DEBUG) console.log("Stored",file);
                                    session.data.files[file]=data.svg;
                                }
                                parent[key] = { isResource:true, type:"svg", file:file, meta:Global.clone(data.meta) };
                                break;
                            }
                            case COMPRESSMODE_ZIP:{
                                parent[key] = { isResource:true, type:"svg", file:file, meta:Global.clone(data.meta) };
                                if (!session.cache[file]) {
                                    session.cache[file] = true;
                                    if (DEBUG) console.log("Packed",file);
                                    session.resources.file(file,data.svg);
                                }
                                break;
                            }
                        }
                        break;
                    }
                    default:{
                        parent[key] = data;
                    }
                }
            } else {
                if (key !== undefined) {
                    parent[key] = Array.isArray(data) ? [] : {};
                    parent = parent[key];
                }
                for (let k in data)
                    packTableDataRecursive(data[k],compressMode,session,parent,k);
            }
        else
            parent[key] = data;

    }

    function packTableData(data,model,resources,compressMode,cb) {
        let 
            session = {
                data:model,
                cb:cb,
                resources:resources,
                cache:{}
            };
        packTableDataRecursive(data,compressMode,session);
        packTableDataRecursiveDone(session);
    }
    
    function tableDataToString(data,compress,cb) {
        let
            mode = compress ? saveCompressMode : COMPRESSMODE_NONE;
        switch (mode) {
            case COMPRESSMODE_NONE:{
                packTableData(data,{ files:{} },0,mode,(resources,data)=>{
                    cb(JSON.stringify(data));
                });
                break;
            }
            case COMPRESSMODE_JSONFILE:{
                packTableData(data,{ files:{} },0,mode,(resources,data)=>{
                    cb(new Blob([JSON.stringify(data)], {type: "application/octet-stream"}));
                });
                break;
            }
            case COMPRESSMODE_ZIP:{
                let
                    zip = new JSZip();
                packTableData(data,{},zip,mode,(zip,data)=>{
                    zip.file("table.json", JSON.stringify(data));
                    zip.generateAsync({ type:"blob", compression: "DEFLATE", mimeType:"application/octet-stream" }).then(cb);
                });
                break;
            }
        }
    }
    
    // --- Data loading

    function unpackTableDataRecursiveWait(session) {
        session.pending++;
    }

    function unpackTableDataRecursiveDone(session) {
        session.done++;
        if (session.done == session.pending) {
            if (DEBUG) console.log("--- Unpack done");
            session.cb(session.data);
        }
    }

    function unpackTableDataRecursive(data,compressMode,session,parent,key) {
        if (!parent) {
            session.pending = 1;
            session.done = 0;
        }
        if (typeof data == "object")
            if (data.isResource) {
                let
                    meta = data.meta;
                switch (data.type) {
                    case "canvas":{
                        // Loading canvas...
                        switch (compressMode) {
                            case COMPRESSMODE_NONE:
                            case COMPRESSMODE_JSONFILE:{
                                let
                                    load = false;
                                parent[key] = { isResource:true, type:"canvas", file:data.file, canvas:0, meta:meta };
                                if (!session.cache[data.file]) {
                                    load = true;
                                    session.cache[data.file] = [];
                                }
                                session.cache[data.file].push(parent[key]);
                                if (load) {
                                    let
                                        canvas = document.createElement("canvas"),
                                        image = document.createElement("img"),
                                        context = canvas.getContext('2d');
                                    image.onload = ()=>{
                                        if (DEBUG) console.log("Loaded",data.file);
                                        canvas.width = image.width;
                                        canvas.height = image.height;
                                        context.drawImage(image,0,0);
                                        session.cache[data.file].forEach(entry=>{
                                            if (DEBUG) console.log("Assigned",data.file);
                                            entry.canvas = canvas;
                                        })
                                        unpackTableDataRecursiveDone(session);
                                    };
                                    image.src = session.resources[data.file];
                                    unpackTableDataRecursiveWait(session);
                                }
                                break;
                            }
                            case COMPRESSMODE_ZIP:{
                                let
                                    load = false;
                                parent[key] = { isResource:true, type:"canvas", file:data.file, canvas:0, meta:meta };
                                if (!session.cache[data.file]) {
                                    load = true;
                                    session.cache[data.file] = [];
                                }
                                session.cache[data.file].push(parent[key]);
                                if (load) {
                                    let
                                        file = session.resources.file(data.file);
                                    if (file) {
                                        file.async("base64").then((imagedata)=>{
                                            let
                                                canvas = document.createElement("canvas"),
                                                image = document.createElement("img"),
                                                context = canvas.getContext('2d');
                                            image.onload = ()=>{
                                                if (DEBUG) console.log("Unpacked",data.file);
                                                canvas.width = image.width;
                                                canvas.height = image.height;
                                                context.drawImage(image,0,0);
                                                session.cache[data.file].forEach(entry=>{
                                                    if (DEBUG) console.log("Assigned",data.file);
                                                    entry.canvas = canvas;
                                                })
                                                unpackTableDataRecursiveDone(session);
                                            };
                                            image.src = 'data:image/png;base64,' + imagedata;
                                        });
                                        unpackTableDataRecursiveWait(session);
                                    }
                                }
                                break;
                            }
                        }
                        break;
                    }
                    case "svg":{
                        // Loading svg...
                        switch (compressMode) {
                            case COMPRESSMODE_NONE:
                            case COMPRESSMODE_JSONFILE:{
                                parent[key] = { isResource:true, type:"svg", file:data.file, svg:session.resources[data.file], meta:meta };
                                if (DEBUG) console.log("Assigned",data.file);
                                break;
                            }
                            case COMPRESSMODE_ZIP:{
                                let
                                    load = false;
                                parent[key] = { isResource:true, type:"svg", file:data.file, svg:0, meta:meta };
                                if (!session.cache[data.file]) {
                                    load = true;
                                    session.cache[data.file] = [];
                                }
                                session.cache[data.file].push(parent[key]);
                                if (load) {
                                    let
                                        file = session.resources.file(data.file);
                                    if (file) {
                                        file.async("binarystring").then((imagedata)=>{
                                            if (DEBUG) console.log("Unpacked",data.file);
                                            session.cache[data.file].forEach(entry=>{
                                                if (DEBUG) console.log("Assigned",data.file);
                                                entry.svg = imagedata;
                                            })
                                            unpackTableDataRecursiveDone(session);
                                        });
                                        unpackTableDataRecursiveWait(session);
                                    }
                                }
                                break;
                            }
                        }
                        break;
                    }
                }
            } else
                for (let k in data)
                    unpackTableDataRecursive(data[k],compressMode,session,data,k);
    }

    function unpackTableData(data,resources,compressMode,cb) {
        let
            session = {
                data:data,
                cb:cb,
                resources:resources,
                cache:{}
            };
        unpackTableDataRecursive(data,compressMode,session);
        unpackTableDataRecursiveDone(session);
    }

    function unpackTable(data,cb) {
        
        if (data instanceof File) {
            let
                reader = new FileReader();
            reader.onloadend = (e)=>{
                let
                    head = new Int8Array(e.target.result.slice(0,2));

                if ((head[0] == 80) && (head[1] == 75)) {

                    // Zip file
                    let
                        zip = new JSZip();
                    try {
                        zip.loadAsync(e.target.result).then(function(zip) {
                            let
                                file = zip.file("table.json");
                            if (file)
                                file.async("string").then((content)=>{
                                    let
                                        jsonData;
                                    try {
                                        jsonData = JSON.parse(content);
                                    } catch (e) {
                                        console.warn(e);
                                        jsonData = false;
                                    }
                                    cb(jsonData,zip,COMPRESSMODE_ZIP);
                                },(e)=>{
                                    console.warn(e);
                                    cb(false);
                                })
                            else
                                cb(false);
                        },(e)=>{
                            console.warn(e);
                            cb(false);
                        });
                    } catch (e) {
                        console.warn(e);
                        cb(false);
                    }

                } else {

                    // JSON file
                    let
                        decoder = new TextDecoder(),
                        jsonStr = decoder.decode(e.target.result),
                        jsonData,
                        files;
                    try {
                        jsonData = JSON.parse(jsonStr);
                    } catch (e) {
                        console.warn(e);
                        jsonData = false;
                    }
                    files = jsonData.files;
                    delete jsonData.files;
                    cb(jsonData,files,COMPRESSMODE_JSONFILE);

                }
               
            }
            reader.readAsArrayBuffer(data);
        } else {

            // JSON string
            let
                jsonData;
            try {
                jsonData = JSON.parse(data);
            } catch (e) {
                console.warn(e);
                jsonData = false;
            }
            files = jsonData.files;
            delete jsonData.files;
            cb(jsonData,files,COMPRESSMODE_NONE);

        }

    }

    function stringToTableData(data,cb) {
        if (data) {

            unpackTable(data,(data,resources,compressMode)=>{
                if (data)
                    unpackTableData(data,resources,compressMode,cb);
                else
                    cb(false);
            });
            
        } else
            cb(false);
    }

    // --- Database loading

    function loadDatabases(cb) {
        if (databases.length) {
            let
                database = databases.shift();
            Global.getFile(database+"/index.json",(data)=>{
                try {
                    data = JSON.parse(data);
                    if (data.entries)
                        data.entries.forEach(entry=>{
                            let
                                added = false;
                            entry.path = database+"/"+entry.path;
                            if (entry.meta.categories)
                                entry.meta.categories.forEach(category=>{
                                    if (tableCategoriesById[category]) {
                                        tableCategoriesById[category].tables.push(entry);
                                        added = true;
                                    }
                                });
                            if (!entry.meta.id)
                                entry.meta.id = entry.path;
                            if (!added)
                                tableCategoriesById.none.tables.push(entry);
                            tablesById[entry.meta.id] = entry;
                        });
                } catch (e) {
                    console.warn(e);
                }
                loadDatabases(cb);
            })
        } else
            cb();
    }

    // --- Template loading
    
    function finalizeTemplate(template,data) {
        if (typeof data == "object")
            if (data.isResource) {
                if ((data.type == "url") && data.url && (!data.url.startsWith("/")) && (data.url.indexOf("://")==-1))
                    data.url = "/"+template.path+"/"+data.url;
            } else
                for (let k in data)
                    finalizeTemplate(template,data[k]);
    }

    function loadTemplate(template,sub,cb) {
        Global.getFile(template.path+"/table.json",(data)=>{
            let
                json;
            try {
                json = JSON.parse(data);
            } catch (e) {
                console.warn(e);
                json = 0;
            }
            if (json) {
                let
                    subtemplate = getSubTemplates(json,sub,true),
                    table = {
                        meta:mergeMeta(subtemplate.meta),
                        data:subtemplate.data
                    };

                if (json.generator) {
                    let
                        js = document.createElement("script");
                    js.setAttribute("src",template.path+"/"+json.generator);
                    js.onload=()=>{
                        setTimeout(()=>{
                            document.body.removeChild(js);
                            if (window.GENERATOR)
                                window.GENERATOR.run(window.GENERATOR,table,subtemplate,(table)=>{
                                    finalizeTemplate(template,table);
                                    cb(table);
                                });    
                        },100);
                    }
                    document.body.appendChild(js);
                } else {
                    finalizeTemplate(template,table);
                    cb(table);
                }
            }
        });
    }

    // --- Subtemplate loading

    function mergeLabel(node1,node2,prefix,suffix) {

        let
            out = {};

        for (let k in node1)
            out[k] = node1[k]+prefix+(node2[k] || node2.EN)+suffix;

        for (let k in node2)
            if (out[k] === undefined)
                out[k] = (node1[k] || node1.EN)+prefix+node2[k]+suffix;

        return out;
    };

    function mergeMeta(metas) {
        let
            merge;

        metas.forEach((meta,pos)=>{
            if (pos == 0) {
                merge = Global.clone(metas[0]);
                if (!merge.description) merge.description = {};
                delete merge.subtemplate;
            } else
                merge.description = mergeLabel(merge.description,meta.title,(pos == 1 ? " (" : ", "),(pos == metas.length-1 ? ")" : "" ));
        });

        return merge;
    }

    function mergeSubtemplateData(data,subdata) {

        if (subdata.settings)
            for (let k in subdata.settings)
                data.settings[k] = subdata.settings[k];

        if (subdata.data)
            subdata.data.forEach(element=>{
                data.data.push(element);
            });

    }

    function getSubTemplates(table,sub,final) {

        let
            query = Global.clone(sub),
            subtemplates = table.meta.subtemplates,
            subtemplatesData = table.subtemplates,
            out = {
                id:[],
                meta:[table.meta],
                data:[],
                settings:{}
            };

        if (final) {
            mergeSubtemplateData(out,table);
            if (subtemplates && !query[0])
                query[0] = 0;
        }

        for (let i=0;i<query.length;i++) {

            let
                id = query[i],
                foundId = false,
                foundValue = 0,
                foundSubData = 0,
                defaultId = 0,
                defaultValue = 0;

            subtemplates.forEach((sub,pos)=>{

                if (sub.isDefault || (pos == 0)) {
                    defaultId = sub.id;
                    defaultValue = sub;
                }

                if (sub.id == id) {
                    foundId = id;
                    foundValue = sub;
                }
                
            });

            if (!foundValue) {
                foundId = defaultId;
                foundValue = defaultValue;
            }

            out.id.push(foundId);
            subtemplates = foundValue.meta.subtemplates;
            out.meta.push(foundValue.meta);

            if (final) {
                subtemplatesData.forEach(data=>{
                    if (data.id == foundId)
                        foundSubData = data;
                });
                mergeSubtemplateData(out,foundSubData);
                subtemplatesData = foundSubData.subtemplates;
                if (subtemplates && (query[i+1] === undefined))
                    query[i+1] = 0;
            }

        }

        out.data.forEach(element=>{
            if (!element.zIndex) element.zIndex = 0;
        })

        out.data.sort((a,b)=>{
            if (a.zIndex > b.zIndex) return 1;
            else if (a.zIndex < b.zIndex) return -1;
            else return 0;
        });

        out.data.forEach(element=>{
            delete element.zIndex;
        });

        return out;

    }

    toolbox = {

        // --- Initialization: table

        setTable:(t)=>{
            table = t;
        },

        // --- Loader: manuals

        addManual:(m)=>{
            manuals.push(m);
            manualsById[m.id] = m;
        },
        getManuals:()=>{
            return manuals;
        },
        getManualsById:()=>{
            return manualsById;
        },

        // --- Loader: tools

        addToolType:(id,value)=>{
            toolTypes[id]=value;
        },
        getToolTypes:()=>{
            return toolTypes;
        },
        addTool:(tool)=>{
            tools.push(tool);
        },
        getTools:()=>{
            return tools;
        },
        
        // --- Loader: element categories

        addElementCategory:(data)=>{
            data.elements = [];
            toolCategories.push(data);
            toolCategoriesById[data.id] = data;
        },
        getElementCategories:()=>{
            return toolCategories;
        },
        getElementCategoriesById:()=>{
            return toolCategoriesById;
        },

        // --- Loader: elements

        addElement:(t)=>{
            elements.push(t);
            elementsById[t.id] = t;
            if (t.meta && t.meta.category)
                t.meta.category.forEach(c=>{
                    if (toolCategoriesById[c])
                        toolCategoriesById[c].elements.push(t);
                });
        },
        getElements:()=>{
            return elements;
        },
        getElementsById:()=>{
            return elementsById;
        },

        // --- Loader: element sets

        addElementsSet:(k)=>{
            sets.push(k)
        },
        getElementSets:()=>{
            return sets;
        },

        // --- Loader: fonts

        addFont:(f)=>{
            fonts.push(f);
        },
        getFonts:()=>{
            return fonts;
        },

        // --- Loader: table templates categories

        addTableCategory:(c)=>{
            c.tables = [];
            tableCategories.push(c);
            tableCategoriesById[c.id] = c;
        },
        getTableCategories:()=>{
            return tableCategories;
        },
        getTableCategoriesById:()=>{
            return tableCategoriesById;
        },

        // --- Loader: subtemplates

        getSubTemplates:(table,sub,final)=>{
            return getSubTemplates(table,sub,final);
        },

        // --- Loader: table databases
        
        addDatabase:(root)=>{
            databases.push(root);
        },
        getTemplate:(t,id,cb)=>{
            return loadTemplate(t,id,cb);
        },
        getTablesById:()=>{
            return tablesById;            
        },

        // --- Serialize/Deserialize/Reset table

        encodeTableData:(data,compress,cb)=>{
            return tableDataToString(data,compress,cb);
        },
        decodeTableData:(data,cb)=>{
            return stringToTableData(data,cb);
        },
        setTableData:(data,language,initialize)=>{
            let
                tableData = data.data;

            if (tableData.EN)
                tableData = tableData[language] || tableData.EN;

            table.empty();
            tableData.forEach((item,index)=>{
                addElementToTable(item.type,item.data,item.default,index);
            });
            table.updateSurfaces();
            table.centerTable();
            if (initialize)
                initializeTable();
        },
        getTableData:(meta)=>{
            return getTableData(meta);
        },
        resetTable:()=>{
            return resetTable();
        },

        // --- Create table elements

        addElementToTable:(type,data,def,zindex)=>{
            return addElementToTable(type,data,def,zindex);
        },

        // --- Initialization

        initialize:(cb)=>{
            loadDatabases(cb);
        }
    }

    return toolbox;
    
}
