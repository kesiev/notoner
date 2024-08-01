let UI = function(LANGUAGE) {

    const
        DEBUG = false,
        APP_NAME = "Notoner",
        APP_VERSION = "0.1b",
        APP_VERSION_FULL = "v"+APP_VERSION,
        APP_ID = "NOTONER",
        APP_SOURCES = "https://github.com/kesiev/notoner",
        APP_URL = "https://www.kesiev.com/notoner/",
        SAVE_AUTOSAVETIME = 1000,
        SAVE_COMPRESS = true,
        SAVE_LOCALID = APP_ID + "_local",
        TABLEFILE_EXTENSION = "notoner",
        LANGUAGE_LIST = LANGUAGE.languages,
        LANGUAGE_DEFAULT  ="EN",
        SAVEMODE_COMPATIBLE = 0,
        SAVEMODE_DIRECT = 1,
        PDF_SPACING = 10,
        PDF_SIZE = 0.3531,
        PDF_RESOLUTION = 3,
        PDF_PAGERATIO = PDF_SIZE / PDF_RESOLUTION,
        PDF_PAGES = 4,
        PDF_TEXTALIGNMENTS = [ "left", "center", "right" ],
        PDF_FONTMAP = {
            Times: { fontFamily:"Serif" },
            TimesB: { fontFamily:"Serif", fontWeight:"bold" },
            TimesI: { fontFamily:"Serif", fontStyle:"italic" },
            TimesBI: { fontFamily:"Serif", fontStyle:"italic", fontWeight:"bold" },
            Helv: { },
            HelvB: { fontWeight:"bold" },
            HelvI: { fontStyle:"italic" },
            HelvBI: { fontStyle:"italic", fontWeight:"bold" },
            Cour: { fontFamily: "monospace" },
            CourB: { fontFamily: "monospace", fontWeight:"bold" },
            CourI: { fontFamily: "monospace", fontStyle:"italic" },
            CourBI: { fontFamily: "monospace", fontStyle:"italic", fontWeight:"bold" }
        },
        SEPARATOR_DOT = " &#x2022; ",
        COLORS_PALETTE = [
            { r:95, g:211, b:95, a:1 },
            { r:0, g:255, b:255, a:1 },
            { r:170, g:135, b:222, a:1 },
            { r:255, g:42, b:212, a:1 },
            { r:255, g:42, b:42, a:1 },
            { r:255, g:127, b:42, a:1 },
            { r:255, g:255, b:255, a:1 },
            { r:40, g:40, b:40, a:1 },
        ],
        TABLE_THEMES = [
            { className:"theme kitchen" },
            { className:"theme wood" },
            { className:"theme cloth" },
            { color: { r:204, g:204, b:204, a:1} },
            { color: { r:204, g:204, b:255, a:1} },
            { color: { r:204, g:255, b:204, a:1} },
            { color: { r:204, g:255, b:255, a:1} },
            { color: { r:255, g:204, b:204, a:1} },
            { color: { r:255, g:204, b:255, a:1} },
            { color: { r:255, g:255, b:204, a:1} }
        ],
        MEASURE_STANDARDS = [
            { title:LANGUAGE.measureStandard.mm, data:{ ratio:1, label:"mm"} },
            { title:LANGUAGE.measureStandard.in, data:{ ratio:0.0393701, label:"in"} },
        ],
        TUTORIAL = [
            {
                boxClassName:"bottom",
                title:LANGUAGE.tutorial.intro.title,
                description:LANGUAGE.tutorial.intro.description,
                next:LANGUAGE.tutorial.goOn
            },{
                boxClassName:"center",
                title:LANGUAGE.tutorial.table.title,
                description:LANGUAGE.tutorial.table.description,
                next:LANGUAGE.tutorial.goOn
            },{
                boxClassName:"topLeft",
                title:LANGUAGE.tutorial.menu.title,
                description:LANGUAGE.tutorial.menu.description,
                next:LANGUAGE.tutorial.goOn
            },{
                boxClassName:"topRight",
                title:LANGUAGE.tutorial.tool.title,
                description:LANGUAGE.tutorial.tool.description,
                next:LANGUAGE.tutorial.goOn
            },{
                boxClassName:"center",
                title:LANGUAGE.tutorial.end.title,
                description:LANGUAGE.tutorial.end.description,
                next:LANGUAGE.tutorial.goOn
            }
        ],
        MENU_ABOUTTABLE={
            callback:()=>{
                let
                    out = [],
                    title = TRANSLATOR.translate(currentFile.meta.title),
                    description = currentFile.meta.description ? TRANSLATOR.translate(currentFile.meta.description) : 0,
                    url = currentFile.meta.url ? TRANSLATOR.translateObject(currentFile.meta.url) : 0,
                    manualUrl = currentFile.meta.manualUrl ? TRANSLATOR.translateObject(currentFile.meta.manualUrl) : 0,
                    license = currentFile.meta.license ? TRANSLATOR.translate(currentFile.meta.license) : 0,
                    licenseUrl = currentFile.meta.licenseUrl ? TRANSLATOR.translateObject(currentFile.meta.licenseUrl) : 0,
                    summary = getTableMetadataSummary(currentFile.meta);

                if (license) {
                    let
                        licenseLine = TRANSLATOR.translate(LANGUAGE.options.aboutTable.license) + " " + license;
                    if (summary)
                        summary.EN += SEPARATOR_DOT + licenseLine;
                    else
                        summary = { EN: licenseLine };
                }
                                    
                out.push({
                    title: title ? { EN:title } : LANGUAGE.options.aboutTable.noTitle,
                    description:summary
                });

                if (description)
                    out.push({
                        name:{
                            EN:description
                        }
                    });

                if (manualUrl)
                    out.push({
                        title:LANGUAGE.options.aboutTable.manualUrl,
                        action:{
                            type:"openUrl",
                            url:Global.getAbsoluteUrl(manualUrl.url)
                        }
                    });

                if (url)
                    out.push({
                        title:LANGUAGE.options.aboutTable.url,
                        action:{
                            type:"openUrl",
                            url:Global.getAbsoluteUrl(url.url)
                        }
                    });

                if (licenseUrl)
                    out.push({
                        title:LANGUAGE.options.aboutTable.licenseUrl,
                        action:{
                            type:"openUrl",
                            url:Global.getAbsoluteUrl(licenseUrl.url)
                        }
                    });

                if (currentFile.id) {

                    let
                        url = window.location.href;
                        
                    url = url.replace(/#.*/,"")+"#"+currentFile.id+(currentFile.subtemplate && currentFile.subtemplate.length ? ":"+currentFile.subtemplate.join(":") : "");

                    out.push({
                        title:LANGUAGE.options.aboutTable.open,
                        action:{
                            type:"openUrl",
                            url:url
                        }
                    });
                }

                return out;
            }
        },
        OPTIONS = {
            messageUnsaved:LANGUAGE.options.messageUnsaved,
            main:{
                title:{
                    EN:APP_NAME
                },
                options:[
                    {
                        title:LANGUAGE.options.options.newTable.title,
                        description:LANGUAGE.options.options.newTable.description,
                        arrow:true,
                        action:{
                            checkDiscard:true,
                            type:"gotoMenu",
                            menu:"newTable"
                        }
                    },{
                        title:LANGUAGE.options.options.loadTable.title,
                        description:LANGUAGE.options.options.loadTable.description,
                        action:{
                            checkDiscard:true,
                            type:"loadTable"
                        }
                    },{
                        if:"saveDirectHandlerAvailable",
                        title:LANGUAGE.options.options.saveTable.title,
                        description:LANGUAGE.options.options.saveTable.description,
                        action:{
                            type:"saveTable"
                        }
                    },{
                        if:"saveDirectNameAvailable",
                        title:LANGUAGE.options.options.saveAsTable.title,
                        description:LANGUAGE.options.options.saveAsTable.description,
                        action:{
                            type:"saveAsTable"
                        }
                    },{
                        if:"saveCompatibleNameAvailable",
                        title:LANGUAGE.options.options.saveTableCompatible.title,
                        description:LANGUAGE.options.options.saveTableCompatible.description,
                        action:{
                            type:"saveTableCompatible"
                        }
                    },{
                        if:"saveCompatibleTableAvailable",
                        title:LANGUAGE.options.options.saveAsTableCompatible.title,
                        description:LANGUAGE.options.options.saveAsTableCompatible.description,
                        arrow:true,
                        action:{
                            type:"saveAsTableCompatible"
                        }
                    },{
                        if:"tableAvailable",
                        title:LANGUAGE.options.options.gotoTableMenu.title,
                        arrow:true,
                        action:{
                            type:"gotoMenu",
                            menu:"table"
                        }
                    },{
                        title:LANGUAGE.options.options.gotoSettingsMenu.title,
                        arrow:true,
                        action:{
                            type:"gotoMenu",
                            menu:"settings"
                        }
                    },{
                        title:LANGUAGE.options.options.gotoGuideMenu.title,
                        arrow:true,
                        action:{
                            type:"gotoMenu",
                            menu:"guide"
                        }
                    },{
                        title:LANGUAGE.options.options.credits.title,
                        arrow:true,
                        action:{
                            type:"gotoMenu",
                            menu:"credits"
                        }
                    }
                ]
            },
            credits:{
                title:LANGUAGE.options.options.credits.title,
                options:[
                    {
                        icon:LANGUAGE.credits.icon,
                        title:{ EN:APP_NAME },
                        description:{ EN:APP_VERSION_FULL },
                        name:LANGUAGE.descriptions.shortDescription
                    },{
                        title:LANGUAGE.credits.projectPage,
                        description:{ EN:APP_URL },
                        action:{
                            type:"openUrl",
                            url:APP_URL
                        } 
                    },{
                        title:LANGUAGE.credits.sourcesPage,
                        description:{ EN:APP_SOURCES },
                        action:{
                            type:"openUrl",
                            url:APP_SOURCES
                        } 
                    },{
                        callback:()=>{
                            return unrollCredits(LANGUAGE.credits.by);
                        }
                    },{
                        callback:()=>{
                            return unrollCredits(LANGUAGE.credits.code);
                        }
                    },{
                        separator:LANGUAGE.credits.translators.title
                    },{
                        callback:()=>{
                            let
                                out = [];

                            LANGUAGE_LIST.forEach(language=>{
                                LANGUAGE.credits.translators.entries[language.id].forEach(entry=>{
                                    out.push({
                                        title:{ EN:entry.name },
                                        description:{ EN:language.name+( entry.url ? SEPARATOR_DOT+entry.url : "") },
                                        action:entry.url ? {
                                            type:"openUrl",
                                            url:entry.url
                                        } : 0
                                    })
                                })
                            });

                            return out;
                        }
                    },{
                        callback:()=>{
                            return unrollCredits(LANGUAGE.credits.thanks);
                        }
                    }
                ]
            },
            guide:{
                title:LANGUAGE.options.guide.title,
                options:[
                    LANGUAGE.options.guide.welcome,
                    {
                        callback:()=>{
                            let
                                out = [];

                            manuals.forEach(manual=>{
                                out.push({
                                    title:manual.title,
                                    arrow:true,
                                    icon:manual.icon,
                                    action:{
                                        type:"showGuide",
                                        guide:manual.id
                                    }
                                })
                            })

                            return out;
                        }
                    },{
                        separator:LANGUAGE.options.guide.tutorial
                    },{
                        title:LANGUAGE.options.guide.showTutorial.title,
                        description:LANGUAGE.options.guide.showTutorial.description,
                        action:{
                            type:"showTutorial"
                        }
                    },{
                        title:LANGUAGE.options.guide.showTutorialAtStart.title,
                        description:LANGUAGE.options.guide.showTutorialAtStart.description,
                        inputType:"checkbox",
                        inputId:"showTutorialAtStart",
                        onSelect:(value)=>{
                            settings.showTutorialAtStart = !settings.showTutorialAtStart;
                            saveSettings();
                            return true;
                        },
                        getValue:()=>{
                            return settings.showTutorialAtStart;
                        }
                    }
                ]
            },
            showGuide:{
                title:LANGUAGE.options.guide.title,
                options:[
                    {
                        callback:()=>{
                            let
                                item = manualsById[currentForm.values.guide],
                                out = [
                                    {
                                        title:item.title,
                                        icon:item.icon,
                                        name:item.description
                                    }
                                ];

                            if (item.instructions)
                                item.instructions.forEach(instruction=>{
                                    out.push({
                                        name:instruction
                                    })
                                })
                            return out;
                        }
                    }
                ]
            },
            settings:{
                title:LANGUAGE.options.settings.title,
                options:[
                    {
                        title:LANGUAGE.options.settings.language.title,
                        arrow:true,
                        action:{
                            type:"gotoMenu",
                            menu:"languageSelector"
                        }
                    },{
                        title:LANGUAGE.options.settings.measures.title,
                        arrow:true,
                        action:{
                            type:"gotoMenu",
                            menu:"measuresSelector"
                        }
                    },{
                        title:LANGUAGE.options.settings.screen.title,
                        arrow:true,
                        action:{
                            type:"gotoMenu",
                            menu:"screenSelector"
                        }
                    },{
                        title:LANGUAGE.options.settings.pen.title,
                        arrow:true,
                        action:{
                            type:"gotoMenu",
                            menu:"penSelector"
                        }
                    },{
                        title:LANGUAGE.options.settings.touch.title,
                        arrow:true,
                        action:{
                            type:"gotoMenu",
                            menu:"touchSelector"
                        }
                    },{
                        title:LANGUAGE.options.settings.shake.title,
                        arrow:true,
                        action:{
                            type:"gotoMenu",
                            menu:"shakeSelector"
                        }
                    },{
                        title:LANGUAGE.options.settings.theme.title,
                        arrow:true,
                        action:{
                            type:"gotoMenu",
                            menu:"themeSelector"
                        }
                    },{
                        title:LANGUAGE.options.settings.experimental.title,
                        arrow:true,
                        action:{
                            type:"gotoMenu",
                            menu:"experimentalSelector"
                        }
                    }
                ]
            },
            themeSelector:{
                title:LANGUAGE.options.settings.theme.title,
                options:[
                    {
                        callback:()=>{
                            let
                                out = [];

                            TABLE_THEMES.forEach((theme,id)=>{
                                out.push({
                                    title:theme.title,
                                    inputType:"radio",
                                    inputId:"theme",
                                    inputValue:id,
                                    color:theme.color ? Global.colorToHex(theme.color,false) : 0,
                                    className:theme.className,
                                    getValue:(value)=>{
                                        return value.inputValue == settings.tableTheme
                                    },
                                    onSelect:(value)=>{
                                        settings.tableTheme = value.inputValue;
                                        setTableSettings();
                                        saveSettings();
                                        return true;
                                    }
                                })
                            });

                            return out;
                        }
                    }
                ]
            },
            measuresSelector:{
                title:LANGUAGE.options.measures.title,
                options:[
                    {
                        callback:()=>{
                            let
                                out = [];

                            MEASURE_STANDARDS.forEach((measure,id)=>{
                                out.push({
                                    title:measure.title,
                                    inputType:"radio",
                                    inputId:"measure",
                                    inputValue:id,
                                    inputSelected:id == settings.measure,
                                    getValue:(value)=>{
                                        return value.inputValue == settings.measure;
                                    },
                                    onSelect:(value)=>{
                                        settings.measure = value.inputValue;
                                        setTableSettings();
                                        saveSettings();
                                        return true;
                                    }
                                })
                            })

                            return out;
                        }
                    }
                ]
            },
            languageSelector:{
                title:LANGUAGE.options.language.title,
                options:[
                    {
                        callback:()=>{
                            let
                                out = [];

                            LANGUAGE_LIST.forEach(language=>{
                                out.push({
                                    title:{ EN: language.name },
                                    inputType:"radio",
                                    inputId:"language",
                                    inputValue:language.id,
                                    inputSelected:language.id == settings.language,
                                    onSelect:(value)=>{
                                        setLanguage(value.inputValue);
                                        showCurrentMenu();
                                        saveSettings();
                                        return false;
                                    }
                                })
                            })

                            return out;
                        }
                    }
                ]
            },
            screenSelector:{
                title:LANGUAGE.options.screen.title,
                options:[
                    {
                        title:LANGUAGE.options.screen.fullScreen.title,
                        action:{
                            type:"setFullscreen"
                        }
                    },{
                        callback:()=>{
                            let
                                out = [
                                    {
                                        title:LANGUAGE.options.screen.autoFullScreen.title,
                                        description:LANGUAGE.options.screen.autoFullScreen.description,
                                        inputType:"checkbox",
                                        inputId:"autoFullscreen",
                                        inputSelected:settings.autoFullScreen,
                                        onSelect:(value)=>{
                                            settings.autoFullScreen = !settings.autoFullScreen;
                                            isAutoFullScreen = true;
                                            saveSettings();
                                            return true;
                                        },
                                        getValue:()=>{
                                            return settings.autoFullScreen;
                                        }
                                    },{
                                        title:LANGUAGE.options.screen.forceRedraw.title,
                                        description:LANGUAGE.options.screen.forceRedraw.description,
                                        inputType:"checkbox",
                                        inputId:"forceRedraw",
                                        inputSelected:settings.forceRedraw,
                                        onSelect:(value)=>{
                                            settings.forceRedraw = !settings.forceRedraw;
                                            setTableSettings();
                                            saveSettings();
                                            return true;
                                        },
                                        getValue:()=>{
                                            return settings.forceRedraw;
                                        }
                                    }
                                ];

                            if (Global.IS_WAKELOCK)
                                out.push({
                                    title:LANGUAGE.options.screen.wakeLock.title,
                                    description:LANGUAGE.options.screen.wakeLock.description,
                                    inputType:"checkbox",
                                    inputId:"wakeLock",
                                    inputSelected:settings.wakeLock,
                                    onSelect:(value)=>{
                                        settings.wakeLock = !settings.wakeLock;
                                        setTableSettings();
                                        saveSettings();
                                        return true;
                                    },
                                    getValue:()=>{
                                        return settings.wakeLock;
                                    }
                                });

                            return out;
                        }
                    }
                ]
            },
            penSelector:{
                title:LANGUAGE.options.pen.title,
                options:[
                    {
                        callback:()=>{
                            let
                                out = [];

                            out.push({
                                title:LANGUAGE.options.pen.test.title,
                                description:LANGUAGE.options.pen.test.description,
                                arrow:true,
                                action:{
                                    type:"gotoMenu",
                                    menu:"penTest"
                                }
                            },{
                                title:LANGUAGE.options.pen.digitalPen.title,
                                description:LANGUAGE.options.pen.digitalPen.description,
                                inputType:"checkbox",
                                inputId:"digitalPen",
                                onSelect:(value)=>{
                                    settings.digitalPen = !settings.digitalPen;
                                    setTableSettings();
                                    saveSettings();
                                    showCurrentMenu();
                                    return true;
                                },
                                getValue:()=>{
                                    return settings.digitalPen;
                                }
                            });

                            if (settings.digitalPen) {
                                out.push({
                                    title:LANGUAGE.options.pen.touchDrag.title,
                                    description:LANGUAGE.options.pen.touchDrag.description,
                                    inputType:"checkbox",
                                    inputId:"touchDrag",
                                    onSelect:(value)=>{
                                        settings.touchDrag = !settings.touchDrag;
                                        setTableSettings();
                                        saveSettings();
                                        return true;
                                    },
                                    getValue:()=>{
                                        return settings.touchDrag;
                                    }
                                });
                                out.push({
                                    title:LANGUAGE.options.pen.palmTricks.title,
                                    description:LANGUAGE.options.pen.palmTricks.description,
                                    inputType:"checkbox",
                                    inputId:"palmTricks",
                                    onSelect:(value)=>{
                                        settings.palmTricks = !settings.palmTricks;
                                        setTableSettings();
                                        saveSettings();
                                        return true;
                                    },
                                    getValue:()=>{
                                        return settings.palmTricks;
                                    }
                                });
                            }

                            return out;

                        }    
                    }
                ]
            },
            touchSelector:{
                title:LANGUAGE.options.touch.title,
                options:[
                    {
                        title:LANGUAGE.options.touch.disableRotation.title,
                        description:LANGUAGE.options.touch.disableRotation.description,
                        inputType:"checkbox",
                        inputId:"disableRotation",
                        onSelect:(value)=>{
                            settings.disableRotation = !settings.disableRotation;
                            setTableSettings();
                            saveSettings();
                            return true;
                        },
                        getValue:()=>{
                            return settings.disableRotation;
                        }
                    }
                ]
            },
            experimentalSelector:{
                title:LANGUAGE.options.experimental.title,
                options:[
                    {
                        title:LANGUAGE.options.experimental.keyboardWriting.title,
                        description:LANGUAGE.options.experimental.keyboardWriting.description,
                        inputType:"checkbox",
                        inputId:"isKeyboardWriting",
                        onSelect:(value)=>{
                            settings.isKeyboardWriting = !settings.isKeyboardWriting;
                            setTableSettings();
                            saveSettings();
                            return true;
                        },
                        getValue:()=>{
                            return settings.isKeyboardWriting;
                        }
                    }
                ]
            },
            shakeSelector:{
                title:LANGUAGE.options.shake.title,
                options:[
                    {
                        title:LANGUAGE.options.shake.disableRotation.title,
                        description:LANGUAGE.options.shake.disableRotation.description,
                        inputType:"checkbox",
                        inputId:"isShakePreview",
                        onSelect:(value)=>{
                            settings.isShakePreview = !settings.isShakePreview;
                            setTableSettings();
                            saveSettings();
                            return true;
                        },
                        getValue:()=>{
                            return settings.isShakePreview;
                        }
                    }
                ]
            },
            penTest:{
                title:LANGUAGE.options.penTest.title,
                options:[
                    {
                        title:LANGUAGE.options.penTest.instructions,
                        name:LANGUAGE.options.penTest.ready,
                        onCreate:(row,title,name)=>{
                            let
                                className = row.className;
                            row.onpointerdown = (e)=>{
                                if (Global.isPenEvent(e)) {
                                    row.className = className +  " test ok";
                                    name.innerHTML = TRANSLATOR.translate(LANGUAGE.options.penTest.ok);
                                } else {
                                    row.className = className +  " test ko";
                                    name.innerHTML = TRANSLATOR.translate(LANGUAGE.options.penTest.ko);
                                }
                            }
                        }
                    }
                ]
            },
            table:{
                title:LANGUAGE.options.table.title,
                options:[
                    {
                        title:LANGUAGE.options.table.about.title,
                        description:LANGUAGE.options.table.about.description,
                        arrow:true,
                        action:{
                            type:"gotoMenu",
                            menu:"aboutTable"
                        }
                    },
                    {
                        title:LANGUAGE.options.table.center.title,
                        description:LANGUAGE.options.table.center.description,
                        action:{
                            type:"centerTable"
                        }
                    },
                    {
                        title:LANGUAGE.options.table.reset.title,
                        description:LANGUAGE.options.table.reset.description,
                        arrow:true,
                        action:{
                            type:"gotoMenu",
                            menu:"confirmReset"
                        }
                    }
                ]
            },
            aboutTable:{
                title:LANGUAGE.options.aboutTable.title,
                options:[
                    MENU_ABOUTTABLE
                ]
            },
            openTemplate:{
                title:LANGUAGE.options.aboutTable.title,
                options:[
                    MENU_ABOUTTABLE,
                    {
                        title:LANGUAGE.options.aboutTable.start,
                        action:{
                            type:"closeMenu"
                        }
                    }
                ]
            },
            confirmReset:{
                title:LANGUAGE.options.confirmReset.title,
                options:[
                    {
                        name:LANGUAGE.options.confirmReset.name,
                    },{
                        title:LANGUAGE.options.confirmReset.yes,
                        action:{
                            type:"resetTable"
                        }
                    },{
                        title:LANGUAGE.options.confirmReset.no,
                        action:{
                            type:"goBack"
                        }
                    }
                ]
            },
            newTable:{
                title:LANGUAGE.options.newTable.title,
                options:[
                    {
                        title:LANGUAGE.options.newTable.fromPdf.title,
                        description:LANGUAGE.options.newTable.fromPdf.description,
                        arrow:true,
                        action:{
                            type:"tableFromPdf"
                        }
                    },{
                        separator:LANGUAGE.options.newTable.models
                    },{
                        callback:()=>{
                            let
                                out = addTableCategory(tableCategoriesById.none);

                            tableCategories.forEach(category=>{
                                if ((category.id != "none") && (category.id != "system") && category.tables.length)
                                    out.push({
                                        title:category.title,
                                        description:category.description,
                                        icon:"images/icon-folder.svg",
                                        arrow:true,
                                        action:{
                                            type:"openCategory",
                                            category:category.id
                                        }
                                    })
                            });

                            return out;
                        }
                    }
                ]
            },
            loadError:{
                title:LANGUAGE.options.loadError.title,
                options:[
                    {
                        name:LANGUAGE.options.loadError.name
                    },{
                        title:LANGUAGE.options.loadError.ok,
                        action:{
                            type:"goBack"
                        }
                    }
                ]
            },
            // --- Special
            saveAsTableCompatible:{
                title:LANGUAGE.options.saveAsTableCompatible.title,
                options:[
                    {
                        title:LANGUAGE.options.saveAsTableCompatible.filename,
                        inputId:"filename"
                    },{
                        title:LANGUAGE.options.saveAsTableCompatible.download,
                        action:{
                            type:"saveTableCompatibleDo"
                        }
                    }
                ]
            },
            tableFromPdf:{
                title:LANGUAGE.options.tableFromPdf.title,
                options:[
                    {
                        callback:()=>{
                            return [{
                                title:LANGUAGE.options.tableFromPdf.pdfFile,
                                description: {
                                    EN:TRANSLATOR.translate(
                                        currentForm.values.tablePdfPages == 1 ? LANGUAGE.options.tableFromPdf.pdfFileDescriptionSingular : LANGUAGE.options.tableFromPdf.pdfFileDescriptionPlural,
                                        currentForm.values
                                    )
                                },
                                inputType:"file",
                                inputId:"filename",
                                inputFileType:".pdf"
                            }];
                        }
                    },{
                        separator:LANGUAGE.options.tableFromPdf.addElements
                    },{
                        callback:()=>{
                            let
                                out = [];

                            elementCategories.forEach(category=>{
                                if (category.elements.length && (!category.isSheets || (currentForm.values.tablePdfPages > 1)) )
                                    out.push({
                                        title:category.title,
                                        icon:category.icon,
                                        arrow:true,
                                        action:{
                                            type:"tableFromPdfAddElement",
                                            categoryId:category.id
                                        }
                                    })
                            });
                            
                            out.push({
                                title:LANGUAGE.options.tableFromPdf.sets,
                                icon:"images/icon-box.svg",
                                arrow:true,
                                action:{
                                    type:"tableSetsSelector"
                                }
                            })

                            if (DEBUG)
                                out.push({
                                    title:{ EN: "DEBUG: Add everything" },
                                    action:{
                                        type:"debugAddEverything"
                                    }
                                })

                            if (currentForm.values.elements && currentForm.values.elements.length) {
                                out.push({
                                    separator:LANGUAGE.options.tableFromPdf.removeElements
                                });
                                currentForm.values.elements.forEach((element,id)=>{
                                    let
                                        description = "",
                                        descriptionNode = 0;
                                    if (element.element.meta.options) {
                                        description+="<ul>";
                                        element.element.meta.options.forEach(option=>{
                                            let
                                                value = element.options[option.attribute];
                                            description+="<li>"+TRANSLATOR.translate(option.title)+": ";
                                            switch (option.setting.type) {
                                                case "color":{
                                                    description+="<span class='colorsample' style='background-color:"+Global.colorToHex(COLORS_PALETTE[value],false)+"'></span>";
                                                    break;
                                                }
                                                case "radio":{
                                                    if (option.setting.options[value].color)
                                                        description+="<span class='colorsample' style='background-color:"+Global.colorToHex(option.setting.options[value].color,false)+"'></span>";
                                                    else
                                                        description+=TRANSLATOR.translate(option.setting.options[value].title);
                                                    break;
                                                }
                                                case "checkbox":{
                                                    description+=value ? "&check;" : "&times;";
                                                    break;
                                                }
                                                case "number":{
                                                    description+=Global.cleanHTML(value)+( option.setting.unit ? " "+TRANSLATOR.translate(option.setting.unit) : "" );
                                                    break;
                                                }
                                                case "input":{
                                                    description+=Global.cleanHTML(value);
                                                    break;
                                                }
                                            }
                                            description+="</li>";
                                        })
                                        description+="</ul>";
                                        descriptionNode={
                                            EN:description
                                        };
                                    }
                                    out.push({
                                        placeholders:element.element.meta.placeholders,
                                        title:element.element.meta.title,
                                        description:descriptionNode,
                                        icon:element.element.meta.icon,
                                        action:{
                                            type:"tableFromPdfRemoveElement",
                                            elementPosition:id
                                        }
                                    });
                                })
                            }

                            return out;
                        }  
                    },{
                        separator:LANGUAGE.options.tableFromPdf.about
                    },{
                        title:LANGUAGE.options.tableFromPdf.tableTitle,
                        inputId:"tableTitle"
                    },{
                        title:LANGUAGE.options.tableFromPdf.extra,
                        arrow:true,
                        action:{
                            type:"tableFromPdfExtra"
                        }
                    },{
                        separator:LANGUAGE.options.tableFromPdf.confirm
                    },{
                        title:LANGUAGE.options.tableFromPdf.createTable,
                        action:{
                            type:"tableFromPdfDo"
                        }
                    }
                ]
            },
            tableSetsSelector:{
                title:LANGUAGE.options.tableSetsSelector.title,
                options:[
                    {
                        callback:()=>{
                            let
                                out = [];

                            sets.forEach(set=>{
                                out.push({
                                    title:set.meta.title,
                                    icon:set.meta.icon,
                                    description:set.meta.description,
                                    action:{
                                        type:"tableAddSet",
                                        set:set
                                    }
                                })
                            });

                            return out;
                        }
                    }
                ]
            },
            tableFromPdfValidation:{
                title:LANGUAGE.options.tableFromPdfValidation.title,
                options:[
                    {
                        name:LANGUAGE.options.tableFromPdfValidation.name
                    },{
                        title:LANGUAGE.options.tableFromPdfValidation.ok,
                        action:{
                            type:"goBack"
                        }
                    }
                ]
            },
            tableFromPdfExtra:{
                title:LANGUAGE.options.tableFromPdf.extra,
                onBack:()=>{
                    loadForm()
                },
                options:[
                    {
                        title:LANGUAGE.options.tableFromPdf.tableAuthor.title,
                        description:LANGUAGE.options.tableFromPdf.tableAuthor.description,
                        inputId:"tableAuthor"
                    },{
                        title:LANGUAGE.options.tableFromPdf.tableLicense.title,
                        description:LANGUAGE.options.tableFromPdf.tableLicense.description,
                        inputId:"tableLicense"
                    },{
                        title:LANGUAGE.options.tableFromPdf.tableLicenseUrl.title,
                        description:LANGUAGE.options.tableFromPdf.tableLicenseUrl.description,
                        inputId:"tableLicenseUrl"
                    },{
                        title:LANGUAGE.options.tableFromPdf.tableDescription,
                        inputId:"tableDescription"
                    },{
                        title:LANGUAGE.options.tableFromPdf.tablePlayers.title,
                        description:LANGUAGE.options.tableFromPdf.tablePlayers.description,
                        inputId:"tablePlayers"
                    },{
                        title:LANGUAGE.options.tableFromPdf.tableUrl.title,
                        description:LANGUAGE.options.tableFromPdf.tableUrl.description,
                        inputId:"tableUrl"
                    },{
                        title:LANGUAGE.options.tableFromPdf.tableManualUrl.title,
                        description:LANGUAGE.options.tableFromPdf.tableManualUrl.description,
                        inputId:"tableManualUrl"
                    }
                ]
            },
            tableFromPdfAddElementSelector:{
                title:LANGUAGE.options.tableFromPdfAddElementSelector.title,
                options:[
                    {
                        callback:()=>{

                            let
                                out = [];

                            elementCategoriesById[currentForm.values.categoryId].elements.forEach(element=>{
                                if (element.meta) {
                                    let
                                        action,
                                        arrow;
                                    if (element.meta.options) {
                                        action = {
                                            type:"tableFromPdfAddElementSettings",
                                            element:element
                                        };
                                        arrow = true;
                                    } else
                                        action = {
                                            type:"tableFromPdfAddElementDone",
                                            element:element
                                        };
                                    out.push({
                                        placeholders:element.meta.placeholders,
                                        title:element.meta.title,
                                        arrow:arrow,
                                        icon:element.meta.icon,
                                        description:element.meta.description,
                                        action:action
                                    });
                                }
                            });
                            return out;
                        }  
                    }
                ]
            },
            tableFromPdfAddElementSettings:{
                title:LANGUAGE.options.tableFromPdfAddElementSettings.title,
                options:[
                    {
                        callback:()=>{

                            let
                                out = [];

                            if (currentForm.values.element.meta && currentForm.values.element.meta.options) {
                                currentForm.values.element.meta.options.forEach(option=>{
                                    delete currentForm.values[option.attribute];
                                    switch (option.setting.type) {
                                        case "color":{
                                            out.push({
                                                separator:option.title
                                            });
                                            COLORS_PALETTE.forEach((color,id)=>{
                                                out.push({
                                                    inputType:"radio",
                                                    inputId:option.attribute,
                                                    inputValue:id,
                                                    inputSelected:option.setting.default === undefined ? id==0 : id == option.setting.default,
                                                    color:Global.colorToHex(color,false)
                                                });
                                            })
                                            break;
                                        }
                                        case "radio":{
                                            out.push({
                                                separator:option.title
                                            });
                                            option.setting.options.forEach((suboption,id)=>{
                                                out.push({
                                                    title:suboption.title,
                                                    description:suboption.description,
                                                    inputType:"radio",
                                                    inputId:option.attribute,
                                                    inputValue:id,
                                                    inputSelected:option.setting.default === undefined ? id==0 : suboption.value == option.setting.default,
                                                    color:suboption.color ? Global.colorToHex(suboption.color,false) : 0
                                                });
                                            })
                                            break;
                                        }
                                        case "checkbox":{
                                            out.push({
                                                title:option.title,
                                                description:option.description,
                                                inputType:"checkbox",
                                                inputId:option.attribute,
                                                inputSelected:option.setting.default
                                            });
                                            break;
                                        }
                                        case "input":{
                                            out.push({
                                                title:option.title,
                                                description:option.description,
                                                inputType:"input",
                                                inputId:option.attribute,
                                                inputValue:option.setting.default
                                            });
                                            break;
                                        }
                                        case "number":{
                                            out.push({
                                                title:option.title,
                                                description:option.description,
                                                inputType:"number",
                                                inputId:option.attribute,
                                                inputValue:option.setting.default,
                                                inputMin:option.setting.min,
                                                inputMax:option.setting.max,
                                                inputStep:option.setting.step
                                            });
                                            break;
                                        }
                                    }
                                })

                            }

                            return out;
                        }  
                    },{
                        title:LANGUAGE.options.tableFromPdfAddElementSettings.addElement,
                        action:{
                            type:"tableFromPdfAddElementDone"
                        }
                    }
                ]
            },
            tableFromPdfDo:{
                title:LANGUAGE.options.tableFromPdfDo.title,
                options:[
                    {
                        name:LANGUAGE.options.tableFromPdfDo.name
                    }
                ]
            },
            discard:{
                title:LANGUAGE.options.discard.title,
                options:[
                    {
                        name:LANGUAGE.options.discard.name
                    },{
                        title:LANGUAGE.options.discard.yes,
                        action:{
                            type:"confirmDiscard"
                        }
                    },{
                        title:LANGUAGE.options.discard.no,
                        action:{
                            type:"goBack"
                        }
                    }
                ]
            },
            loading:{
                title:LANGUAGE.options.loading.title,
                options:[
                    {
                        name:LANGUAGE.options.loading.name
                    }
                ]
            },
            saving:{
                title:LANGUAGE.options.saving.title,
                options:[
                    {
                        name:LANGUAGE.options.saving.name
                    }
                ]
            },
            downloading:{
                title:LANGUAGE.options.downloading.title,
                options:[
                    {
                        name:LANGUAGE.options.downloading.name
                    }
                ]
            }
        }

    let
        settings={
            forceRedraw:0,
            language:0,
            tool:0,
            wakeLock:false,
            showTutorialAtStart:true,
            disableRotation:false,
            autoFullScreen:false,
            digitalPen:false,
            touchDrag:false,
            palmTricks:false,
            isShakePreview:true,
            isKeyboardWriting:false,
            measure:0,
            tableTheme:0
        },
        systemSettings={
            saveLocal: false, // Note: local file may be too large for localStorage, disabling.
            saveAuto: false, // Note: file access is too slow and makes the UI laggy, disabling.
            saveMode: window.showSaveFilePicker ? SAVEMODE_DIRECT : SAVEMODE_COMPATIBLE
        },
        currentFile={
            isChanged:false,
            id:0,
            subtemplate:0,
            meta:0,
            name:0,
            handler:0
        },
        isInitialized = false,
        isSaving = false,
        isTableAvailable = false,
        isAppMode = false,
        isBusy = false,
        wakeLock = false,
        menuStack = [],
        currentForm = {},
        autosaveTimer,
        fullScreenTimer,
        previousAction,
        root,
        table,
        toolbox,
        closeAction,
        elementsById,
        elementCategories,
        elementCategoriesById,
        tablesById,
        manuals,
        manualsById,
        tableCategories,
        tableCategoriesById,
        sets,
        tutorialNode = document.createElement("div"),
        tutorialBoxNode = document.createElement("div"),
        tutorialTitleNode = document.createElement("div"),
        tutorialDescriptionNode = document.createElement("div"),
        tutorialNextNode = document.createElement("div"),
        dimmerNode = document.createElement("div"),
        menuNode = document.createElement("div"),
        menuHeaderNode = document.createElement("div"),
        menuBodyNode = document.createElement("div"),
        menuHeaderTitleNode = document.createElement("div"),
        menuHeaderLeftButton = document.createElement("div"),
        menuHeaderRightButton = document.createElement("div");

    dimmerNode.className = "dimmer";
    menuNode.className = "menu";
    menuHeaderNode.className = "menuHeader";
    menuHeaderTitleNode.className = "title";
    menuHeaderLeftButton.className = "button left";
    menuHeaderRightButton.className = "button right";
    menuBodyNode.className = "menuBody";
    tutorialBoxNode.className = "box";
    tutorialDescriptionNode.className = "description";
    tutorialTitleNode.className = "title";
    tutorialNextNode.className = "next";

    tutorialNode.append(tutorialBoxNode);
    tutorialBoxNode.appendChild(tutorialTitleNode);
    tutorialBoxNode.appendChild(tutorialDescriptionNode);
    tutorialBoxNode.appendChild(tutorialNextNode);

    dimmerNode.appendChild(menuNode);
    menuNode.appendChild(menuHeaderNode);
    menuNode.appendChild(menuBodyNode);
    menuHeaderNode.appendChild(menuHeaderTitleNode);
    menuHeaderNode.appendChild(menuHeaderLeftButton);
    menuHeaderNode.appendChild(menuHeaderRightButton);

    TRANSLATOR.addGlobalPlaceholder("APP_ID",APP_ID);
    TRANSLATOR.addGlobalPlaceholder("APP_NAME",APP_NAME);
    TRANSLATOR.addGlobalPlaceholder("APP_VERSION",APP_VERSION);
    TRANSLATOR.addGlobalPlaceholder("APP_URL",APP_URL);
    TRANSLATOR.addGlobalPlaceholder("APP_SOURCES",APP_SOURCES);
    TRANSLATOR.addGlobalPlaceholder("APP_SHORTDESCRIPTION",LANGUAGE.descriptions.shortDescription);
    TRANSLATOR.addGlobalPlaceholder("APP_SUMMARY",LANGUAGE.descriptions.summary);
    TRANSLATOR.addGlobalPlaceholder("APP_DESCRIPTION",LANGUAGE.descriptions.description);
    TRANSLATOR.addGlobalPlaceholder("PDF_PAGES",PDF_PAGES);

    dimmerNode.onclick=(e)=>{
        if ((e.target === dimmerNode) && !isBusy)
            closeMenu();
    }

    menuHeaderRightButton.onclick=()=>{
        if (!isBusy)
            closeMenu();
    }

    menuHeaderLeftButton.onclick=()=>{
        if (!isBusy)
            goBackMenu();
    }

    // --- Force redraw

    function isForceRedrawSuggested() {        
        // TODO It was needed on some Android/Chrome devices but the issue disappeared after some optimizations.
        // Keeping it for safety.
        return false;
    };

    // --- Table save

    function downloadTable(data,cb) {
        currentFile.meta.application = {
            name:APP_NAME,
            version:APP_VERSION,
            host:window.location.host
        };
        toolbox.encodeTableData(
            data ? data : toolbox.getTableData(currentFile.meta),
            SAVE_COMPRESS,
            (tableData)=>{
                let
                    a = document.createElement("a"),
                    url = window.URL.createObjectURL(tableData);
        
                document.body.appendChild(a);
                a.style.display = "none";
                a.href = url;
                a.download = currentFile.name;
                a.click();
                document.body.removeChild(a);
                setChanged(false);
                cb();
            }
        );   
    }

    function saveTable(data,cb) {
        if (currentFile.handler && !isSaving) {
            isSaving = true;
            currentFile.meta.version = APP_VERSION;
            toolbox.encodeTableData(
                data ? data : toolbox.getTableData(currentFile.meta),
                SAVE_COMPRESS,
                async (tableData)=>{
                    let
                        writable = await currentFile.handler.createWritable();
                    await writable.write(tableData);
                    await writable.close();
                    isSaving = false;
                    setChanged(false);
                    if (cb) cb(true);
                }
            );
        }
    }

    function loadTable(file,cb) {
        toolbox.decodeTableData(file,cb);
    }

    // --- Save: local

    function saveLocal() {
        if (currentFile.id)
            localStorage[SAVE_LOCALID+"_id"]=currentFile.id;
        else
            delete localStorage[SAVE_LOCALID+"_id"];
        if (currentFile.subtemplate)
            localStorage[SAVE_LOCALID+"_subtemplate"]=currentFile.subtemplate;
        else
            delete localStorage[SAVE_LOCALID+"_subtemplate"];
        if (currentFile.name)
            localStorage[SAVE_LOCALID+"_name"]=currentFile.name;
        else
            delete localStorage[SAVE_LOCALID+"_name"];
        if (currentFile.meta)
            localStorage[SAVE_LOCALID+"_meta"]=JSON.stringify(currentFile.meta);
        else
            delete localStorage[SAVE_LOCALID+"_meta"];
        if (currentFile.isChanged)
            localStorage[SAVE_LOCALID+"_changed"]=1;
        else
            delete localStorage[SAVE_LOCALID+"_changed"];

        if (isTableAvailable)
            toolbox.encodeTableData(toolbox.getTableData(currentFile.meta),false,(data)=>{
                try {
                    localStorage[SAVE_LOCALID+"_data"]=data;
                } catch (e) {
                    console.warn(e);
                    delete localStorage[SAVE_LOCALID+"_data"];
                }
            })
        else
            delete localStorage[SAVE_LOCALID+"_data"];
    }

    function loadLocal(cb) {
        let
            meta = localStorage[SAVE_LOCALID+"_meta"],
            data = localStorage[SAVE_LOCALID+"_data"];

        if (localStorage[SAVE_LOCALID+"_id"] !== undefined)
            currentFile.id = localStorage[SAVE_LOCALID+"_id"];
        else
            delete currentFile.id;

        if (localStorage[SAVE_LOCALID+"_subtemplate"] !== undefined)
            currentFile.subtemplate = localStorage[SAVE_LOCALID+"_subtemplate"];
        else
            delete currentFile.subtemplate;

        if (localStorage[SAVE_LOCALID+"_name"] !== undefined)
            currentFile.name = localStorage[SAVE_LOCALID+"_name"];
        else
            currentFile.name = 0;

        if (meta !== undefined) {
            try {
                currentFile.meta = JSON.parse(meta);
            } catch (e) {
                console.warn(e);
                currentFile.meta = 0;
            }
        } else
            currentFile.meta = 0;
        
        setChanged(!!localStorage[SAVE_LOCALID+"_changed"]);

        if (data === undefined)
            cb();
        else
            toolbox.decodeTableData(data,(data)=>{
                if (data) {
                    toolbox.setTableData(data,settings.language);
                    isTableAvailable = true;
                } else {
                    table.empty();
                    isTableAvailable = false;
                }
                cb();
            });
    }

    // --- Settings

    function detectLanguage() {
        let
            language=settings.language,
            languagesAvailable = {},
            userLang = navigator.language || navigator.userLanguage;
        
        LANGUAGE_LIST.forEach(language=>{
            languagesAvailable[language.id] = true;
        })
        
        if (!languagesAvailable[language]) {
            language=userLang.split("-")[0].toUpperCase();
            if (!languagesAvailable[language]) language=LANGUAGE_DEFAULT;
        }

        settings.language = language;

    }

    function saveSettings() {
        localStorage[SAVE_LOCALID+"_settings"] = JSON.stringify(settings);
    }

    function loadSettings() {
        let
            loadedSettings,
            data = localStorage[SAVE_LOCALID+"_settings"];
        if (data)
            try {
                loadedSettings = JSON.parse(data);
            } catch(e) {
                console.warn(e);
            }
        for (let k in settings)
            if (loadedSettings && (loadedSettings[k] !== undefined))
                settings[k] = loadedSettings[k];
    }

    // --- Save: Change tracker

    function setChanged(c) {
        currentFile.isChanged = c;
        table.setMenuBullet(c);
    }

    // --- Save: Autosave

    function autoSave() {
        if (autosaveTimer) clearTimeout(autosaveTimer);
        saveTable();
    }

    function scheduleSave() {
        if (autosaveTimer) clearTimeout(autosaveTimer);
        autosaveTimer=setTimeout(autoSave,SAVE_AUTOSAVETIME);
    }

    function onEvent(from,e) {
        switch (e.type) {
            case "toolChanged":{
                settings.tool = table.getToolData();
                saveSettings();
                break;
            }
            case "update":{
                // View refresh event are ignored.
                break;
            }
            default:{
                switch (systemSettings.saveMode) {
                    case SAVEMODE_COMPATIBLE:{
                        setChanged(true);
                        break;
                    }
                    case SAVEMODE_DIRECT:{
                        setChanged(true);
                        if (systemSettings.saveAuto)
                            scheduleSave();
                        break;
                    }
                }
                break;
            }
        }
    }

    // --- Save: page quit

    window.onbeforeunload = function(){
        if (systemSettings.saveLocal)
            saveLocal();
        else if (currentFile.isChanged)
            return TRANSLATOR.translate(OPTIONS.messageUnsaved);
    };

    // --- Table from PDF

    function updateAvailablePages() {
        let
            pages = PDF_PAGES;

        currentForm.values.elements.forEach(element=>{
            if (element && element.element && element.element.meta && element.element.meta.isSheet)
                pages--;
        })

        currentForm.values.tablePdfPages = pages;
    }

    function addSheet(pdf,pageNumber,cursor,data,cb) {
        if ((pageNumber > pdf.numPages) || (pageNumber > currentForm.values.tablePdfPages))
            cb(data,cursor);
        else {
            pdf.getPage(pageNumber).then((page)=>{
                page.getAnnotations().then(annotations=>{
                    let
                        viewport = page.getViewport({scale:PDF_RESOLUTION}),
                        canvas = document.createElement("canvas"),
                        context = canvas.getContext("2d");
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    page.render({canvasContext: context, viewport: viewport}).promise.then(()=>{
                        let
                            pageHeight = Math.floor(canvas.height * PDF_PAGERATIO),
                            pageWidth = Math.floor(canvas.width * PDF_PAGERATIO),
                            pageData = {
                                type:"sheet",
                                data:{
                                    x:cursor.x,
                                    y:cursor.y,
                                    width:pageWidth,
                                    height:pageHeight,
                                    frame:true,
                                    model:{
                                        EN:{
                                            isResource:true,
                                            type:"canvas",
                                            file:"page-"+pageNumber+".png",
                                            canvas:canvas
                                        }
                                    }
                                }
                            };
                        if (annotations) {
                            let
                                pageFields = [];
                            annotations.forEach(annotation=>{
                                if (!annotation.readOnly && !annotation.hidden) {
                                    let
                                        p1 = viewport.convertToViewportPoint(annotation.rect[0], annotation.rect[1]),
                                        p2 = viewport.convertToViewportPoint(annotation.rect[2], annotation.rect[3]),
                                        aheight = (p1[1]-p2[1]) * PDF_PAGERATIO,
                                        awidth = (p2[0]-p1[0]) * PDF_PAGERATIO,
                                        ax = p1[0] * PDF_PAGERATIO,
                                        ay = (p1[1] * PDF_PAGERATIO) - aheight;

                                    if (annotation.fieldType == "Tx") {
                                        let
                                            field = {
                                                type:"text",
                                                x:ax,
                                                y:ay,
                                                width:awidth,
                                                height:aheight,
                                                multiline:annotation.multiLine,
                                                align:PDF_TEXTALIGNMENTS[annotation.textAlignment]
                                            };

                                        if (annotation.defaultAppearanceData) {
                                            if (annotation.defaultAppearanceData.fontSize)
                                                field.fontSize = annotation.defaultAppearanceData.fontSize * 0.4;
                                            if (annotation.defaultAppearanceData.fontName) {
                                                let
                                                    font = PDF_FONTMAP[annotation.defaultAppearanceData.fontName];
                                                if (font)
                                                    for (let k in font)
                                                        field[k] = font[k];
                                                else if (DEBUG)
                                                    console.log("Unmapped font",annotation.defaultAppearanceData.fontName)
                                            }
                                        }

                                        pageFields.push(field);
                                    } else if ((annotation.fieldType == "Ch") || annotation.checkBox)
                                        pageFields.push({
                                            type:"checkbox",
                                            x:ax,
                                            y:ay,
                                            width:awidth,
                                            height:aheight
                                        });
                                    else if (DEBUG)
                                        console.log("Unsupported",annotation.fieldType,annotation);
                                }
                            });
                            if (pageFields.length)
                                pageData.data.fields= { EN: pageFields };
                        }
                        data.data.push(pageData);
                        if (pageNumber%2) {
                            cursor.x += pageWidth+PDF_SPACING;
                            cursor.colHeight = pageHeight;
                        } else {
                            cursor.x = 0;
                            cursor.y += Math.max(pageHeight,cursor.colHeight)+PDF_SPACING;
                            cursor.colHeight = 0;
                        }
                        addSheet(pdf,pageNumber+1,cursor,data,cb);
                    });
                });
            });
        }
    }

    function tableFromPdf(meta,cb) {
        let
            data = {
                meta:{
                    title:{
                        EN:currentForm.values.tableTitle || ""
                    },
                    author:{
                        EN:currentForm.values.tableAuthor || ""
                    },
                    license:{
                        EN:currentForm.values.tableLicense || ""
                    },
                    licenseUrl:
                        currentForm.values.tableLicenseUrl ? {
                            EN:{
                                isResource:true,
                                type:"url",
                                url:currentForm.values.tableLicenseUrl
                            }
                        } : undefined,
                    description:{
                        EN:currentForm.values.tableDescription || ""
                    },
                    players:{
                        EN:currentForm.values.tablePlayers || ""
                    },
                    url:
                        currentForm.values.tableUrl ? {
                            EN:{
                                isResource:true,
                                type:"url",
                                url:currentForm.values.tableUrl
                            }
                        } : undefined,
                    manualUrl:
                        currentForm.values.tableManualUrl ? {
                            EN:{
                                isResource:true,
                                type:"url",
                                url:currentForm.values.tableManualUrl
                            }
                        } : undefined,
                },
                data:[]
            },
            fileReader = new FileReader();  

        fileReader.onload = function() {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'js/libs/pdfjs/pdf.worker.min.js';
            let
                uuid = 0,
                typedarray = new Uint8Array(this.result),
                loadingTask = pdfjsLib.getDocument(typedarray);
            loadingTask.promise.then(pdf => {
                addSheet(pdf,1,{ x:0, y:0, colHeight:0 },data,(data,cursor)=>{
                    if (currentForm.values.elements) {
                        let
                            prevType,
                            ox = cursor.x,
                            rowHeight;
                        currentForm.values.elements.sort((a,b)=>{
                            if (a.element.meta.zIndex < b.element.meta.zIndex) return -1;
                            else if (a.element.meta.zIndex > b.element.meta.zIndex) return 1;
                            else if (a.element.meta.category[0] < b.element.meta.category[0]) return -1;
                            else if (a.element.meta.category[0] > b.element.meta.category[0]) return 1;
                            else if (a.element.id < b.element.id) return -1;
                            else if (a.element.id > b.element.id) return 1;
                            else return 0;
                        });
                        currentForm.values.elements.forEach(element=>{
                            if (!prevType) {
                                prevType = element.element.meta.category[0];
                                rowHeight = 0;
                            } else if (element.element.meta.category[0] != prevType) {
                                cursor.x = ox;
                                cursor.y += rowHeight+PDF_SPACING;
                                prevType = element.element.meta.category[0];
                                rowHeight = 0;
                            }
                            let
                                elementData = {
                                    x:cursor.x,
                                    y:cursor.y,
                                    width:element.element.meta.size ? element.element.meta.size.width : 0,
                                    height:element.element.meta.size ? element.element.meta.size.height : 0
                                };
                            if (element.element.meta.options)
                                element.element.meta.options.forEach(option=>{
                                    let
                                        root = elementData,
                                        path = option.attribute.split("."),
                                        value = element.options[option.attribute];
                                    switch (option.setting.type) {
                                        case "radio":{
                                            value = option.setting.options[value].value;
                                            break;
                                        }
                                        case "color":{
                                            value = COLORS_PALETTE[value];
                                            break;
                                        }
                                    }
                                    path.forEach((element,id)=>{
                                        if (id == path.length-1)
                                            root[element] = value;
                                        else {
                                            if (!root[element]) root[element] = {};
                                            root = root[element];
                                        }
                                    })
                                })

                            if (element.element.onAdd) {
                                uuid++;
                                element.element.onAdd(elementData,data,uuid);
                            } else
                                data.data.push({
                                    type:element.element.id,
                                    data:elementData
                                });
                            cursor.x += elementData.width + PDF_SPACING;
                            rowHeight = Math.max(rowHeight,elementData.height);
                        })
                    }
                    cb(data);
                });
            });
        };
        fileReader.readAsArrayBuffer(meta.file);
    }

    // --- Settings

    function setLanguage(l) {
        settings.language = l;
        TRANSLATOR.setLanguage(settings.language);
        sortTableCategories();
        table.updateSurfaces();
    }

    function setTableSettings() {
        let
            theme = TABLE_THEMES[settings.tableTheme];

        if (settings.digitalPen) {
            table.setPointerMode(settings.touchDrag ? table.POINTERMODE_TOUCHDIGITALPEN : table.POINTERMODE_DIGITALPEN);
            table.setPalmTricks(settings.palmTricks);
        } else {
            table.setPointerMode(table.POINTERMODE_PEN);
            table.setPalmTricks(false);
        }

        table.setColor(theme.color ? Global.colorToHex(theme.color,false) : "#fff");
        table.setRotationEnabled(!settings.disableRotation);
        if (settings.disableRotation)
            table.resetAngle();
        table.setBackgroundClassName(theme.className);
        table.setMeasure(MEASURE_STANDARDS[settings.measure].data);
        table.setForceRedraw(settings.forceRedraw);
        table.setShakePreview(settings.isShakePreview);
        table.setKeyboardWriting(settings.isKeyboardWriting);
        table.updateSurfaces();
        setWakelock(settings.wakeLock);
    }
    
    // --- Fullscreen

    function setFullscreen() {
        if (table)
            table.resetInput();
        if (!document.fullscreenElement)
            if (root.requestFullscreen)
                root.requestFullscreen();
            else if (root.webkitRequestFullscreen)
                root.webkitRequestFullscreen();
            else if (root.msRequestFullscreen)
                root.msRequestFullscreen();
    }

    function scheduleFullscreen() {
        if (fullScreenTimer)
            clearTimeout(fullScreenTimer);
        fullScreenTimer = setTimeout(setFullscreen,100);
    }

    // --- Wakelock

    function wakeLockVisibilityChange() {
        setWakelock(true,true);
    }

    async function setWakelock(flag,refresh) {
        if (Global.IS_WAKELOCK) {
            if (flag) {
                if (refresh || !wakeLock) {
                    if (DEBUG)
                        console.log("Wakelock requested",refresh);
                    try {
                        wakeLock = await navigator.wakeLock.request('screen');
                        if (DEBUG)
                            console.log("Wakelock request OK",wakeLock);
                        wakeLock.addEventListener('release', () => {
                            wakeLock = false;
                            if (DEBUG)
                                console.log("Wakelock released");
                        });
                        if (!refresh) {
                            if (DEBUG)
                                console.log("Event registered");
                            document.addEventListener('visibilitychange', wakeLockVisibilityChange);
                        }
                    } catch (e) {
                    }
                }
            } else if (wakeLock) {
                if (DEBUG)
                    console.log("Event unregistered");
                await wakeLock.release();
                document.removeEventListener('visibilitychange', wakeLockVisibilityChange);
                wakeLock = false;                
            }
        }
    }
    
    // --- Form management

    function loadForm() {
        for (let k in currentForm.elements) {
            let
                element = currentForm.elements[k];
            switch (element.getAttribute("type")) {
                case "file":{
                    currentForm.values[k]=element.files[0];
                    break;
                }
                default:{
                    currentForm.values[k]=element.value;
                }
            }
        }
    }

    // --- Table metadata

    function getTableMetadataSummary(meta) {
        let
            by = meta.author ? TRANSLATOR.translate(meta.author) : 0,
            players =  meta.players ? TRANSLATOR.translate(meta.players) : 0,
            comment = [];

        if (players)
            comment.push(TRANSLATOR.translate(LANGUAGE.options.aboutTable.players)+" "+players);
    
        if (by)
            comment.push(TRANSLATOR.translate(LANGUAGE.options.aboutTable.by)+" "+by);

        return comment.length ? { EN:comment.join(SEPARATOR_DOT) } : 0;

    }

    // --- Credits

    function unrollCredits(list) {
        let
            out = [{
                separator:list.title
            }];
        list.entries.forEach(entry=>{
            out.push({
                title:{ EN:entry.name },
                description:entry.url ? { EN: entry.url } : 0,
                action:entry.url ? {
                    type:"openUrl",
                    url:entry.url
                } : 0
            })
        });
        return out;
    }

    // --- Templates

    function sortById(list) {
        list.sort((a,b)=>{
            if (a._id < b._id) return -1;
            else if (a._id > b._id) return 1;
            else return 0;
        });
    }

    function sortTableCategories() {
        tableCategories.forEach(category=>{
            category._id = TRANSLATOR.translate(category.title);
            category.tables.forEach(table=>{
                table._id = TRANSLATOR.translate(table.meta.title);
            });
            sortById(category.tables);
        })
        tableCategories.sort((a,b)=>{
            if (a._id < b._id) return -1;
            else if (a._id > b._id) return 1;
            else return 0;
        });
        sortById(tableCategories);
    }

    function addTableCategory(category) {
        let
            out = [];

        category.tables.forEach(table=>{
            let
                description = getTableMetadataSummary(table.meta);
            
            if (description)
                description.EN+="<br><div class='subdescription'>"+TRANSLATOR.translate(table.meta.description)+"</div>";
            else
                description = table.meta.description;
            out.push({
                title:table.meta.title,
                description:description,
                icon:"images/icon-table.svg",
                arrow:table.meta.subtemplates,
                action:{
                    type:table.meta.subtemplates ? "openSubTemplates": "openTemplate",
                    template:table,
                    subtemplate:[]
                }
            });
        });

        return out;
    }

    function addSubTemplates(table,sub) {
       
        let
            out = [],
            subtemplates = toolbox.getSubTemplates(table,sub);

        subtemplates.meta[subtemplates.meta.length-1].subtemplates.forEach(subtemplate=>{
            if (subtemplate.id) {
                let
                    subid = Global.clone(subtemplates.id);
                subid.push(subtemplate.id);

                out.push({
                    title:subtemplate.meta.title,
                    description:subtemplate.meta.description,
                    icon:"images/icon-table.svg",
                    arrow:subtemplate.meta.subtemplates,
                    action:{
                        type:subtemplate.meta.subtemplates ? "openSubTemplates" : "openTemplate",
                        template:table,
                        subtemplate:subid
                    }
                });
            }
        })

        return out;
    }

    // --- Menu rendering

    function renderMenu(menu) {
        let
            node,
            options = [];

        menuHeaderTitleNode.innerHTML = TRANSLATOR.translate(menu.title);
        menuBodyNode.innerHTML = "";
        
        menu.options.forEach(option=>{
            if (option.callback)
                options = options.concat(option.callback());
            else
                options.push(option);
        })

        options.forEach(option=>{

            let
                rowClassName = "row",
                addIt;

            switch (option.if) {
                case "tableAvailable":{
                    addIt = isTableAvailable;
                    break;
                }
                case "saveAuto":{
                    addIt = systemSettings.saveAuto;
                    break;
                }
                case "saveDirect":{
                    addIt = systemSettings.saveMode == SAVEMODE_DIRECT;
                    break;
                }
                case "saveDirectHandlerAvailable":{
                    addIt = (systemSettings.saveMode == SAVEMODE_DIRECT) && currentFile.handler;
                    break;
                }
                case "saveDirectNameAvailable":{
                    addIt = (systemSettings.saveMode == SAVEMODE_DIRECT) && currentFile.name;
                    break;
                }
                case "saveCompatible":{
                    addIt = systemSettings.saveMode == SAVEMODE_COMPATIBLE;
                    break;
                }
                case "saveCompatibleNameAvailable":{
                    addIt = (systemSettings.saveMode == SAVEMODE_COMPATIBLE) && currentFile.name;
                    break;
                }
                case "saveCompatibleTableAvailable":{
                    addIt = (systemSettings.saveMode == SAVEMODE_COMPATIBLE) && isTableAvailable;
                    break;
                }
                default:{
                    addIt = true;
                }
            }

            if (addIt) {
                
                if (option.separator) {
                    
                    let
                        row = document.createElement("div");

                    row.className = "separator";
                    row.innerHTML = TRANSLATOR.translate(option.separator,option.placeholders);
                    menuBodyNode.appendChild(row);

                } else {

                    let
                        row = document.createElement("div"),
                        titleRow = 0,
                        nameRow = 0;

                    if (option.title) {
                        titleRow = document.createElement("div");
                        titleRow.className = "title";
                        titleRow.innerHTML = TRANSLATOR.translate(option.title,option.placeholders);
                        row.appendChild(titleRow);
                    }

                    if (option.name) {
                        nameRow = document.createElement("div");
                        nameRow.className = "name";
                        nameRow.innerHTML = TRANSLATOR.translate(option.name,option.placeholders);
                        row.appendChild(nameRow);
                    }

                    if (option.color)
                        row.style.backgroundColor = option.color;

                    if (option.className)
                        rowClassName += " "+option.className;

                    if (option.inputId)
                        switch (option.inputType) {
                            case "checkbox":
                            case "radio":{
                                let
                                    radioSelector = input = document.createElement("div"),
                                    radioSelectorTick = document.createElement("div");
                                radioSelector.className = option.inputType+"Selector";
                                radioSelectorTick.className = "tick";
                                rowClassName+= " interactive "+option.inputType+" "+option.inputType+"-"+option.inputId;
                                row._option = option;
                                if (option.inputSelected) {
                                    if (!option.onSelect)
                                        currentForm.values[option.inputId] = option.inputValue;
                                    rowClassName+= " selected";
                                } else if (option.getValue) {
                                    let
                                        value = option.getValue(option);
                                    if (!option.onSelect)
                                        currentForm.values[option.inputId] = value;
                                    if (value)
                                        rowClassName+= " selected";
                                }
                                row.onclick=()=>{
                                    let
                                        option = row._option,
                                        update = true;

                                    if (option.onSelect)
                                        update = option.onSelect(option);

                                    if (update)
                                        switch (option.inputType) {
                                            case "radio":{
                                                let
                                                    nodes = document.getElementsByClassName("radio-"+option.inputId);
                                                for (i=0;i<nodes.length;i++) {
                                                    nodes[i].className = nodes[i].className.replace(" selected", "");
                                                    if (nodes[i]._option.inputValue === option.inputValue) {
                                                        nodes[i].className+= " selected";
                                                        if (!option.getValue)
                                                            currentForm.values[option.inputId] = option.inputValue;
                                                    }
                                                }
                                                break;
                                            }
                                            case "checkbox":{
                                                let
                                                    value;
                                                row.className = row.className.replace(" selected", "");
                                                if (option.getValue)
                                                    value = option.getValue();
                                                else
                                                    value = currentForm.values[option.inputId] = !currentForm.values[option.inputId];
                                                if (value)
                                                    row.className += " selected";
                                                break;
                                            }
                                        }
                                }
                                radioSelector.appendChild(radioSelectorTick);
                                if (titleRow)
                                    titleRow.insertBefore(radioSelector,titleRow.firstChild);
                                else
                                    row.appendChild(radioSelector);
                                break;
                            }
                            case "file":{
                                let
                                    input;
                                    
                                if (!currentForm.elements[option.inputId]) {
                                    input = document.createElement("input");
                                    input.setAttribute("type","file");
                                    if (option.inputFileType)
                                        input.setAttribute("accept",option.inputFileType);
                                } else
                                    input = currentForm.elements[option.inputId];
                                node = document.createElement("div");
                                node.className = "input";
                                currentForm.elements[option.inputId] = input;
                                row.appendChild(node);
                                node.appendChild(input);
                                break;
                            }
                            case "number":{
                                let
                                    input = document.createElement("input");
                                node = document.createElement("div");
                                node.className = "input";
                                input.type = "number";
                                input.min = option.inputMin;
                                input.max = option.inputMax;
                                input.step = option.inputStep;
                                currentForm.elements[option.inputId] = input;
                                if (option.inputValue !== undefined)
                                    currentForm.values[option.inputId] = option.inputValue;
                                input.value = currentForm.values[option.inputId] === undefined ? "" : currentForm.values[option.inputId];
                                row.appendChild(node);
                                node.appendChild(input);
                                break;
                            }
                            default:{
                                let
                                    input = document.createElement("input");
                                node = document.createElement("div");
                                node.className = "input";
                                currentForm.elements[option.inputId] = input;
                                if (option.inputValue)
                                    currentForm.values[option.inputId] = option.inputValue;
                                input.value = currentForm.values[option.inputId] || "";
                                row.appendChild(node);
                                node.appendChild(input);
                                break;
                            }
                        }

                    if (option.description) {
                        node = document.createElement("div");
                        node.className = "description";
                        node.innerHTML = TRANSLATOR.translate(option.description,option.placeholders);
                        row.appendChild(node);
                    }

                    if (option.action) {
                        row.onclick = ()=>{
                            performAction(option.action);
                        }
                        rowClassName+= " interactive";
                    }

                    if (option.icon) {
                        let
                            icon = document.createElement("icon");
                        icon.className = "icon";
                        icon.style.backgroundImage = "url('"+Global.getAbsoluteUrl(option.icon)+"')";
                        row.appendChild(icon);
                        rowClassName += " icon";
                    }

                    if (option.arrow) {
                        let
                            arrow = document.createElement("icon");
                        arrow.className = "arrow";
                        row.appendChild(arrow);
                        rowClassName += " arrow";
                    }

                    row.className = rowClassName;

                    menuBodyNode.appendChild(row);

                    if (option.onCreate)
                        option.onCreate(row,titleRow,nameRow);

                }
            }

        });

    }

    // --- Template loader

    function loadTemplate(model,subtemplate,cb) {
        setBusy(true);
        toolbox.getTemplate(model,subtemplate,(template)=>{
            setBusy(false);
            if (template) {
                currentFile.id = model.meta.id;
                currentFile.subtemplate = subtemplate;
                currentFile.name = TRANSLATOR.translate(template.meta.title)+"."+TABLEFILE_EXTENSION,
                currentFile.meta = template.meta;
                currentFile.handler = 0;
                toolbox.setTableData(template,settings.language,true);
                isTableAvailable = true;
                setChanged(false);
                cb(true);
            } else
                cb(false);
        })
    }

    // --- Option management

    function performAction(action,skipDiscard) {
        if (!isBusy) {
            if (action.checkDiscard && !skipDiscard && currentFile.isChanged) {
                previousAction = action;
                enterMenu(OPTIONS.discard);
            } else
                switch (action.type) {
                    case "gotoMenu":{
                        enterMenu(OPTIONS[action.menu]);
                        break;
                    }
                    case "openTemplate":{
                        enterMenu(OPTIONS.loading);
                        loadTemplate(action.template,action.subtemplate,(done)=>{
                            if (done)
                                enterMenu(OPTIONS.openTemplate,true);
                            else
                                goBackMenu();
                        });
                        break;
                    }
                    case "loadTable":{
                        switch (systemSettings.saveMode) {
                            case SAVEMODE_COMPATIBLE:{
                                let
                                    input = document.createElement("input");
                                input.setAttribute("type","file");                                
                                input.setAttribute("accept","."+TABLEFILE_EXTENSION);
                                input.onchange=(e)=>{
                                    let
                                        file = input.files[0];
                                    setBusy(true);
                                    enterMenu(OPTIONS.loading);
                                    loadTable(file,(tableData)=>{
                                        setBusy(false);
                                        if (tableData) {
                                            delete currentFile.id;
                                            delete currentFile.subtemplate;
                                            currentFile.meta = tableData.meta;
                                            // Strips progressive file number due to multiple downloads
                                            currentFile.name = file.name.replace(/ \([0-9]+\)\./,".");
                                            currentFile.handler = 0;
                                            isTableAvailable = true;
                                            toolbox.setTableData(tableData,settings.language);
                                            closeMenu();
                                        } else
                                            enterMenu(OPTIONS.loadError,true);
                                        document.body.removeChild(input);
                                    });
                                }
                                input.oncancel=()=>{
                                    document.body.removeChild(input);
                                }
                                document.body.appendChild(input);
                                input.click();
                                break;
                            }
                            case SAVEMODE_DIRECT:{
                                window.showOpenFilePicker({
                                    types: [{
                                        description: APP_NAME,
                                        accept: {
                                            'plain/text': [ "."+TABLEFILE_EXTENSION ]
                                        }
                                    }]
                                }).then((handler)=>{
                                    if (handler && handler[0]) {
                                        setBusy(true);
                                        enterMenu(OPTIONS.loading);
                                        handler[0].getFile().then((file)=>{
                                            loadTable(file,(tableData)=>{
                                                setBusy(false);
                                                if (tableData) {
                                                    delete currentFile.id;
                                                    delete currentFile.subtemplate;
                                                    currentFile.meta = tableData.meta;
                                                    currentFile.name = file.name;
                                                    currentFile.handler = handler[0];
                                                    isTableAvailable = true;
                                                    toolbox.setTableData(tableData,settings.language);
                                                    if (systemSettings.saveAuto)
                                                        saveTable(tableData);
                                                    closeMenu();
                                                } else
                                                    enterMenu(OPTIONS.loadError,true);                            
                                            });
                                        },(e)=>{
                                            enterMenu(OPTIONS.loadError,true);
                                        })
                                    }
                                },e=>{})
                                break;
                            }
                        }
                        break;
                    }
                    case "saveTable":{
                        setBusy(true);
                        enterMenu(OPTIONS.saving);
                        saveTable(0,()=>{
                            setBusy(false);
                            closeMenu();
                        });
                        break;
                    }
                    case "saveAsTable":{
                        window.showSaveFilePicker({
                            suggestedName: currentFile.name,
                            types: [{
                                description: APP_NAME,
                                accept: {
                                    'plain/text': [ "."+TABLEFILE_EXTENSION ]
                                }
                            }]
                        }).then(handler=>{
                            if (handler) {
                                setBusy(true);
                                enterMenu(OPTIONS.saving);
                                currentFile.name = handler.name;
                                currentFile.handler = handler;
                                saveTable(0,()=>{
                                    setBusy(false);
                                    closeMenu();
                                });
                            }
                        },e=>{});
                        break;
                    }
                    case "saveTableCompatible":{
                        setBusy(true);
                        enterMenu(OPTIONS.downloading);
                        downloadTable(0,()=>{
                            setBusy(false);
                            closeMenu();
                        });
                        break;
                    }
                    case "saveAsTableCompatible":{
                        currentForm={
                            values:{
                                filename:currentFile.name || TRANSLATOR.translate(currentFile.meta.title)
                            },
                            elements:{}
                        };
                        enterMenu(OPTIONS.saveAsTableCompatible);
                        break;
                    }
                    case "saveTableCompatibleDo":{
                        loadForm();
                        if (currentForm.values.filename) {
                            currentFile.name = currentForm.values.filename;
                            enterMenu(OPTIONS.downloading);
                            downloadTable(0,()=>{
                                closeMenu();
                            });
                        }
                        break;
                    }
                    case "tableFromPdf":{
                        currentForm={
                            values:{
                                elements:[]
                            },
                            elements:{}
                        };
                        updateAvailablePages();
                        enterMenu(OPTIONS.tableFromPdf);
                        break;
                    }
                    case "tableFromPdfDo":{
                        loadForm();
                        if (currentForm.values.filename && currentForm.values.tableTitle) {
                            setBusy(true);
                            enterMenu(OPTIONS.tableFromPdfDo);
                            tableFromPdf({
                                file:currentForm.values.filename
                            },(result)=>{
                                delete currentFile.id;
                                delete currentFile.subtemplate;
                                currentFile.name = TRANSLATOR.translate(result.meta.title)+"."+TABLEFILE_EXTENSION;
                                currentFile.meta = result.meta;
                                currentFile.handler = 0;
                                toolbox.setTableData(result,settings.language,true);
                                setChanged(true);
                                isTableAvailable = true;
                                setBusy(false);
                                closeMenu();
                            })
                        } else
                            enterMenu(OPTIONS.tableFromPdfValidation);
                        break;
                    }
                    case "tableSetsSelector":{
                        loadForm();
                        enterMenu(OPTIONS.tableSetsSelector);
                        break;
                    }
                    case "tableFromPdfAddElement":{
                        loadForm();
                        currentForm.values.categoryId = action.categoryId;
                        enterMenu(OPTIONS.tableFromPdfAddElementSelector);
                        break;
                    }
                    case "tableFromPdfAddElementSettings":{
                        currentForm.values.element = action.element;
                        enterMenu(OPTIONS.tableFromPdfAddElementSettings);
                        break;
                    }
                    case "tableFromPdfAddElementDone":{
                        if (action.element) {
                            currentForm.values.elements.push({
                                element:action.element,
                                options:{}
                            });
                            updateAvailablePages();
                            goBackMenu();
                        } else {
                            loadForm();
                            let
                                element = {
                                    element:currentForm.values.element,
                                    options:{}
                                };
                            if (currentForm.values.element.meta && currentForm.values.element.meta.options)
                                currentForm.values.element.meta.options.forEach(option=>{
                                    let
                                        setting = option.setting,
                                        value = currentForm.values[option.attribute];
                                    if (setting)
                                        switch (setting.type) {
                                            case "number":{
                                                if (setting.isInteger) value = parseInt(value);
                                                else value = parseFloat(value);
                                                if (isNaN(value)) value = setting.default;
                                                if (setting.step !== undefined) value = (Math.floor(value / setting.step)) * setting.step;
                                                if ((setting.min !== undefined) && (value < setting.min)) value = setting.min;
                                                if ((setting.max !== undefined) && (value > setting.max)) value = setting.max;
                                                break;
                                            }
                                        }
                                    element.options[option.attribute] = value;
                                });

                            currentForm.values.elements.push(element);
                            updateAvailablePages();
                            goBackMenu(2);
                        }
                        break;
                    }
                    case "tableAddSet":{
                        action.set.data.forEach(element=>{
                            if (!elementsById[element.id])
                                console.warn("Can't find element",element.id);
                            else
                                currentForm.values.elements.push({
                                    element:elementsById[element.id],
                                    options:Global.clone(element.options)
                                });
                        });
                        goBackMenu();
                        break;
                    }
                    case "tableFromPdfExtra":{
                        loadForm();
                        enterMenu(OPTIONS.tableFromPdfExtra);
                        break;
                    }
                    case "tableFromPdfRemoveElement":{
                        loadForm();
                        currentForm.values.elements.splice(action.elementPosition,1);
                        updateAvailablePages();
                        showCurrentMenu();
                        break;
                    }
                    case "openCategory":{
                        let
                            category = tableCategoriesById[action.category];

                        enterMenu({
                            title:category.title,
                            options:addTableCategory(category)
                        });
                        break;
                    }
                    case "openSubTemplates":{
                        enterMenu({
                            title:action.template.meta.title,
                            options:addSubTemplates(action.template,action.subtemplate)
                        });
                        break;
                    }
                    case "resetTable":{
                        toolbox.resetTable();
                        table.centerTable();
                        closeMenu();
                        break;
                    }
                    case "centerTable":{
                        table.centerTable();
                        closeMenu();
                        break;
                    }
                    case "setFullscreen":{
                        scheduleFullscreen();
                        break;
                    }
                    case "showGuide":{
                        currentForm={
                            values:{
                                guide:action.guide
                            },
                            elements:{}
                        };
                        enterMenu(OPTIONS.showGuide);
                        break;
                    }
                    case "openUrl":{
                        window.open(action.url,"_blank");
                        break;
                    }
                    case "showTutorial":{
                        showTutorial();
                        break;
                    }
                    case "confirmDiscard":{
                        goBackMenu();
                        performAction(previousAction,true);
                        break;
                    }
                    case "closeMenu":{
                        closeMenu();
                        break;
                    }
                    case "goBack":{
                        goBackMenu();
                        break;
                    }
                    case "debugAddEverything":{
                        let
                            currentString = 0,
                            strings = [ "A", "B", "C", "D"];
                        loadForm();
                        currentForm.values.elements = [];
                        elementCategories.forEach(category=>{
                            category.elements.forEach(element=>{
                                let
                                    entry ={
                                        element:element,
                                        options:{}
                                    };
                                if (element.meta && element.meta.options)
                                    element.meta.options.forEach(option=>{
                                        let
                                            value;
                                        switch (option.setting.type) {
                                            case "radio":{
                                                value = Math.floor(Math.random()*option.setting.options.length);
                                                break;
                                            }
                                            case "color":{
                                                value = Math.floor(Math.random()*COLORS_PALETTE.length);
                                                break;
                                            }
                                            case "input":{
                                                value = strings[currentString];
                                                currentString = (currentString+1)%strings.length;
                                                break;
                                            }
                                            case "checkbox":{
                                                value = Math.random()>0.5;
                                                break;
                                            }
                                            case "number":{
                                                value = option.setting.min+(Math.random()*(option.setting.max-option.setting.min));
                                                value = Math.floor(value/option.setting.step)*option.setting.step;
                                                break;
                                            }
                                            default:{
                                                console.warn("Unsupported random value for",element,option.setting.type);
                                                break;
                                            }
                                        }
                                        entry.options[option.attribute] = value;
                                    })
                                currentForm.values.elements.push(entry);
                            })
                        })
                        updateAvailablePages();
                        showCurrentMenu();
                        break;
                    }
                }
        }
    }

    // --- Menu management

    function updateBackButton() {
        menuHeaderLeftButton.style.display = !isBusy && (menuStack.length > 1) ? "block" : "none";
    };

    function closeMenu() {
        if (!isBusy) {
            document.body.removeEventListener("keydown",onKeyDown);
            if (dimmerNode.parentNode)
                dimmerNode.parentNode.removeChild(dimmerNode);
            if (closeAction)
                closeAction();
        }
    }

    function showCurrentMenu() {
        let
            menu = menuStack[menuStack.length-1];

        renderMenu(menu);
        updateBackButton();
    }

    function goBackMenu(times) {
        let
            menu;

        if (!times) times = 1;
        for (let i=0;i<times;i++) {
            menu = menuStack.pop();
            if (menu.onBack)
                menu.onBack();
        }
        showCurrentMenu();
    }

    function enterMenu(menu,replace) {
        if (replace)
            menuStack[menuStack.length-1] = menu;
        else
            menuStack.push(menu);
        showCurrentMenu();
    }

    function showMenu(node,close,page) {
        if (!isBusy) {
            if (isInitialized) {
                if (systemSettings.saveAuto)
                    autoSave();
                else if (systemSettings.saveLocal)
                    saveLocal();
                if (settings.autoFullScreen)
                    scheduleFullscreen();
            }
            isBusy = false;
            closeAction = close;
            root.appendChild(dimmerNode);
            menuStack.length = 0;
            enterMenu(page || OPTIONS.main);
            document.body.addEventListener("keydown",onKeyDown);
            return true;
        } else
            return false;
    }

    // --- Keyboard

    function onKeyDown(e) {
        if (!isBusy) {

            let
                key = e.keyCode;

            switch (key) {
                // Esc
                case 27:{
                    closeMenu();
                    break;
                }
            }
        }
    }

    // --- Tutorial

    function showTutorialStep(id) {
        let
            step = TUTORIAL[id];
        
        if (tutorialNode.parentNode)
            tutorialNode.parentNode.removeChild(tutorialNode);

        if (step) {

            tutorialNode.className="tutorial "+step.boxClassName;
            tutorialTitleNode.innerHTML = TRANSLATOR.translate(step.title);
            tutorialDescriptionNode.innerHTML = TRANSLATOR.translate(step.description);
            tutorialNextNode.innerHTML = TRANSLATOR.translate(step.next);
            root.appendChild(tutorialNode);

            tutorialBoxNode.onclick=()=>{
                showTutorialStep(id+1);
            }

        } else {
            settings.showTutorialAtStart = false;
            isBusy = false;
            table.setLock(false);
            saveSettings();
        }

    }

    function showTutorial() {
        closeMenu();
        tutorialStep = 0;
        isBusy = true;
        table.setLock(true);
        showTutorialStep(0);
    }

    // --- Busy management

    function setBusy(b) {
        isBusy = b;
        menuHeaderRightButton.style.display = isBusy ? "none" : "block";
        updateBackButton();
    }

    // --- Per-device hacks

    function setupDevice() {

        // Disable context menu
        document.addEventListener("contextmenu", (e)=>{
            let
                event = e || window.event,
                target = event.target || event.srcElement;

            if (target.tagName.toUpperCase() != 'INPUT') {
                e.preventDefault();
                return false;
            }

        });

        // On Safari Mobile...
        if (Global.IS_SAFARIMOBILE) {

            // ...Disable scaling
            document.addEventListener('touchmove', event => event.scale !== 1 && event.preventDefault(), { passive: false });

            // ...move the menu button to avoid the close button
            document.addEventListener("fullscreenchange", (e)=>{
                if (document.fullscreenElement) {
                    menuNode.style.top = "60px";
                    table.setMenuButtonHeight(120);
                } else {
                    menuNode.style.top = "";
                    table.resetMenuButtonHeight();
                }
            });

            // ...disable double-tap magnifier
            let
                doubleTouchStartTimestamp = 0;
            document.addEventListener("touchstart", (e)=>{
                
                let
                    now = +(new Date());

                if (doubleTouchStartTimestamp + 500 > now)
                    e.preventDefault();
                doubleTouchStartTimestamp = now;

            }, { passive:false });

        }
            
    }

    // --- Initialization

    function endInitialization() {
        isInitialized = true;
        table.setLock(false);
        if (settings.showTutorialAtStart) {
            showTutorial();
            return false;
        } else {
            setBusy(false);
            return true;
        }
    }

    // --- Interface

    return {
        setTable:(t)=>{
            table = t;
        },
        setToolbox:(t)=>{
            toolbox = t;
        },
        show:(r)=>{
            let
                loaded = false;

            root = r;
            settings.forceRedraw = isForceRedrawSuggested();
            loadSettings();
            detectLanguage();
            setBusy(true);
            toolbox.setTable(table);
            elementsById = toolbox.getElementsById();
            elementCategories = toolbox.getElementCategories();
            elementCategoriesById = toolbox.getElementCategoriesById();
            manuals = toolbox.getManuals();
            manualsById = toolbox.getManualsById();
            tableCategories = toolbox.getTableCategories();
            tableCategoriesById = toolbox.getTableCategoriesById();
            tablesById = toolbox.getTablesById();
            sets = toolbox.getElementSets();
            
            setLanguage(settings.language);
            table.setToolTypes(toolbox.getToolTypes());
            table.setTools(toolbox.getTools());
            table.setEventListener(onEvent);
            table.setMenuAction(showMenu);
            table.addTo(root);
            table.setLock(true);
            setupDevice();

            if (settings.tool)
                table.setTool(settings.tool);

            setTimeout(() => {

                setTableSettings();
                    
                // --- Load locally stored table
                if (!loaded && systemSettings.saveLocal) {
                    loaded = true;
                    setBusy(true);
                    loadLocal(()=>{
                        setBusy(false);
                        endInitialization();
                    });
                }

                // --- Load hastag table
                if (!loaded && document.location.hash)

                    if (document.location.hash == "#user_mode=app") {

                        isAppMode = true;

                    } else {
                            
                        let
                            fullStart = true;
                            tableHash = document.location.hash.substr(1,document.location.hash.length).split(":"),
                            tableId = tableHash[0] || "",
                            tableSubTemplate = tableHash[1] ? tableHash[1].split(":") : [];
                        
                        if (tableId[0] == "!") {
                            fullStart = false;
                            tableId = tableId.substr(1,tableId.length);
                        }

                        if (tablesById[tableId]) {

                            loaded=true;
                            setBusy(false);
                            table.openMenu(OPTIONS.loading);
                            loadTemplate(tablesById[tableId],tableSubTemplate,(done)=>{
                                if (endInitialization())
                                    if (done) {
                                        if (fullStart)
                                            enterMenu(OPTIONS.openTemplate,true);
                                        else
                                            closeMenu();
                                    } else
                                        closeMenu();
                            });

                        }

                    }

                // --- Load splash screen table
                if (!loaded) {
                    let
                        splashTable = tablesById["system-splash"];

                    loaded = true;
                    if (splashTable)
                        loadTemplate(splashTable,[],(done)=>{
                            endInitialization();
                        });
                    else
                        endInitialization();
                }

                
            }, 100);

        }
    }

}
