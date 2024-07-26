let Tray=function(settings) {

    const
        ACTION_SHAKE = 1,
        OPACITY = 0.5,
        BORDER_SIZE = 1.3,
        SPACING_SIZE = 0.5,
        BOTTOMSIDE_SIZE = 10;

    let
        isDynamic = settings.mode >= 0,
        background = document.createElement("div"),
        baseColor = settings.backgroundColor,
        leftSide,
        rightSide,
        bottomSide,
        label,
        trayWidth = settings.width,
        leftSideWidth = Math.floor(trayWidth * settings.splitPosition),
        rightSideWidth = trayWidth - leftSideWidth,
        tray = new Surface(
            "tray",
            settings.tags,
            settings.x,
            settings.y,
            trayWidth,
            settings.height
        );

    // --- Apply default

    if (settings.isDraggable === undefined)
        settings.isDraggable = true;
    if (settings.isVariableZIndex === undefined)
        settings.isVariableZIndex = false;
    if (settings.isDragTopSurfaces === undefined)
        settings.isDragTopSurfaces = true;
    if (settings.icon === undefined)
        settings.icon = true;

    // --- Element private functions
    
    function autoShake() {
        let
            surfaces = tray.getSurfacesIntersecting();
        surfaces.forEach(surface=>{
            if (surface.onShake)
                surface.onShake();
        })
        tray.onShake(true);
    }

    // --- Prepare element
    
    if (settings.frame)
        background = Stencil.newFrame(tray.content,{
            x:0,
            y:0,
            width:settings.width,
            height:settings.height,
            backgroundColor:Global.colorWithAlpha(baseColor, OPACITY),
            borderSize:BORDER_SIZE,
            borderStyle:"solid",
            borderColor:{ r:0, g:0, b:0, a:1 },
            borderRadius:2,
            boxShadow:[
                { x:0, y:0, size:1, color:{ r:50, g:50, b:50, a:1 }}
            ]
        },settings.frame,tray);
        
    if (settings.image)
        Stencil.newSprite(tray.content,{
            x:0,
            y:0,
            width:settings.width,
            height:settings.height,
            baseColor:baseColor
        },settings.image);

    if (settings.icon)
        Stencil.newSprite(tray.content,{
            bottom:2,
            x:2,
            width:5,
            height:5,
            baseColor:baseColor,
            image:settings.static.icon
        },settings.icon);

    if (settings.label)
        label = Stencil.newLabel(tray.content,{
            fontSize:10,
            fontWeight:"bold",
            textAlign:"center",
            lineHeight:"auto",
            textColor:{ r:255, g:255, b:255, a:1 },
            strokeWidth:0.5,
            strokeColor:{ r:0, g:0, b:0, a:1 }
        },settings.label);
   
    switch (settings.mode) {
        case 0:{
            // Sum only
            Stencil.asLabel(background,{
                fontSize:19,
                fontWeight:"bold",
                textAlign:"center",
                whiteSpace:"nowrap",
                lineHeight:"auto",
                textColor:{ r:255, g:255, b:255, a:1 },
                strokeWidth:0.5,
                strokeColor:{ r:0, g:0, b:0, a:1 }
            },settings.sumLabel || true);
            break;
        }
        case 1:{
            // Sum/subtract only
            leftSide = Stencil.newLabel(tray.content,{
                x:0,
                y:0,
                width:leftSideWidth,
                height:settings.height,
                fontSize:19 * settings.splitPosition,
                fontWeight:"bold",
                textAlign:"center",
                whiteSpace:"nowrap",
                lineHeight:"auto",
                textColor:{ r:255, g:255, b:255, a:1 },
                strokeWidth:0.5,
                strokeColor:{ r:0, g:0, b:0, a:1 }
            },settings.leftLabel || true);
            rightSide = Stencil.newFrame(tray.content,{
                x:leftSideWidth,
                y:SPACING_SIZE+BORDER_SIZE,
                width:rightSideWidth-SPACING_SIZE-BORDER_SIZE,
                height:settings.height-(SPACING_SIZE+BORDER_SIZE)*2,
                backgroundColor:Global.colorWithAlpha(settings.backgroundColor, 0.7),
                borderRadius:2
            },settings.rightLabel || true);
            Stencil.asLabel(rightSide,{
                fontSize:19 * (1-settings.splitPosition),
                fontWeight:"bold",
                textAlign:"center",
                whiteSpace:"nowrap",
                lineHeight:"auto",
                textColor:{ r:255, g:255, b:255, a:1 },
                strokeWidth:0.5,
                strokeColor:{ r:0, g:0, b:0, a:1 }
            },settings.rightLabel || true);
            bottomSide = Stencil.newLabel(tray.content,{
                x:SPACING_SIZE+BORDER_SIZE,
                y:settings.height-BOTTOMSIDE_SIZE,
                width:settings.width-(SPACING_SIZE+BORDER_SIZE)*2,
                height:BOTTOMSIDE_SIZE,
                fontSize:7,
                fontWeight:"bold",
                textAlign:"right",
                whiteSpace:"nowrap",
                lineHeight:"auto",
                textColor:{ r:255, g:255, b:255, a:1 },
                strokeWidth:0.5,
                strokeColor:{ r:0, g:0, b:0, a:1 }
            },settings.bottomLabel || true);
            break;
        }
    }

    // --- Element interfaces

    // --- Element macros

    tray.shuffle = ()=>{
        autoShake();
    }

    // --- Element properties (transfer)

    Stencil.transferGlobalProperties(settings,tray);
    tray.static = settings.static;
    tray.image = settings.image;
    tray.backgroundColor = settings.backgroundColor;
    tray.frame = settings.frame;
    tray.label = settings.label;
    tray.labelText = settings.labelText;
    tray.mode = settings.mode;
    tray.splitPosition = settings.splitPosition;
    tray.countValues = settings.countValues;
    tray.sumLabel = settings.sumLabel;
    tray.leftLabel = settings.leftLabel;
    tray.rightLabel = settings.rightLabel;
    tray.bottomLabel = settings.bottomLabel;
    tray.messages = settings.messages;

    // --- Element properties (setters)
    
    tray.setDraggable(!!settings.isDraggable);
    tray.setVariableZIndex(!!settings.isVariableZIndex);
    tray.setDragTopSurfaces(!!settings.isDragTopSurfaces);
    tray.setZIndexGroup(settings.zIndexGroup);
    tray.setFence(settings.fence);
    tray.setSimpleDrag(true);

    // --- Element menu

    tray.onMenuOption=(option)=>{
        if (!Stencil.onMenuOptionDefault(tray,option))
            switch (option.action) {
                case ACTION_SHAKE:{
                    tray.shuffle();
                    break;
                }
            }
        return true;
    }

    if (Stencil.setContextMenuDefault(tray)) {
        tray.onContextMenu=(options)=>{
            Stencil.onContextMenuDefault(tray,options);
        }
        tray.setContextMenu(true);
    }
    
    // --- Element special action

    if (tray.hasMessage("shake"))
        tray.setSpecialAction({
            title:tray.getMessage("shake","title"),
            icon:tray.getMessage("shake","icon"),
            action:ACTION_SHAKE
        });

    // --- Element interactions

    tray.onDrop=()=>{ Stencil.onDropDefault(tray) }
    tray.onSelect=()=>{ Stencil.onSelectDefault(tray) }
    tray.onClick=()=>{ Stencil.onClickDefault(tray) }

    tray.onShake=(fromtable)=>{
        if (!Stencil.onShakeDefault(tray))
            if (fromtable)
                tray.startAnimation("shake");
            else
                autoShake();
    }

    // --- Element animations

    tray.onAnimation=(id,time)=>{
        switch (id) {
            case "shake":{
                return Stencil.animate(Stencil.ANIMATION_PULSE,time,tray);
                break;
            }
        }
    }

    // --- Element lifecycle: update
    
    tray.onUpdate=()=>{

        if (isDynamic) {
                
            let
                value = 0,
                plusValue = 0,
                minusValue = 0;
        
            if (tray.parent) {
                let
                    halfX = tray.x+leftSideWidth,
                    surfaces = tray.parent.getSurfacesIntersecting(tray);
                surfaces.forEach(surface=>{
                    let
                        surfaceValue;
                    switch (surface.type) {
                        case "token":{
                            surfaceValue = surface.side ? surface.flipValue : surface.value;
                            break;
                        }
                        case "dice":{
                            let
                                face = surface.faces[surface.value];
                            if (face && face.value)
                                surfaceValue = face.value;
                            break;
                        }
                        case "counter":{
                            surfaceValue = surface.value;
                            break;
                        }
                    }

                    if (settings.countValues !== undefined)
                        surfaceValue = settings.countValues == surfaceValue ? 1 : 0;

                    if (surfaceValue) {
                        surfaceValue = parseFloat(surfaceValue);
                        switch (settings.mode) {
                            case 0:{
                                // Sum only
                                value+=surfaceValue;     
                                break;
                            }
                            case 1:{
                                // Sub/subtract
                                if ((surface.x+(surface.width/2))>halfX) {
                                    value -= surfaceValue;
                                    minusValue+= surfaceValue;
                                } else {
                                    value += surfaceValue;
                                    plusValue+= surfaceValue;
                                }
                                break;
                            }
                        }
                    }
                });

            }

            switch (settings.mode) {
                case 0:{
                    // Sum only
                    Stencil.setHtml(background,value);
                    break;
                }
                case 1:{
                    Stencil.setHtml(leftSide,plusValue);
                    Stencil.setHtml(rightSide,minusValue ? -minusValue : "0");
                    Stencil.setHtml(bottomSide,"= "+value);
                    break;
                }
            }

        }

        if (settings.label)
            Stencil.setLabel(label,settings.labelText);
            
        
    }

    // --- Element lifecycle: events

    tray.onEvent=()=>{
        tray.onUpdate();
    }

    if (isDynamic)
        tray.setOnEventTypes([ "table", "tray", "dice", "counter", "token" ]);

    // --- Element lifecycle: removal

    // --- Element initialization

    return tray;

}
