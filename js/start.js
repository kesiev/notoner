let START=function() {

    let
        root = document.createElement("div"),
        ui = new UI(LANGUAGE),
        table = new Table(),
        toolbox = new Toolbox();

    root.className = "root";

    LANGUAGE.manuals.forEach(manual=>{
        toolbox.addManual(manual);
    });

    LANGUAGE.elementCategories.forEach(category=>{
        toolbox.addElementCategory(category);
    });

    LANGUAGE.tableCategories.forEach(category=>{
        toolbox.addTableCategory(category);
    })

    RESOURCES.load(LANGUAGE,toolbox);
    RESOURCES_DECKS.load(LANGUAGE,toolbox);
    TEMPLATES.load(LANGUAGE,toolbox);
    SETS.load(LANGUAGE,toolbox);

    Global.loadFonts(toolbox.getFonts(),()=>{
        toolbox.initialize(()=>{
            document.body.append(root);
            ui.setTable(table);
            ui.setToolbox(toolbox);
            ui.show(root);
        });
    });

}
