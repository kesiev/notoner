let Scissors=function(settings) {

    const
        SHEET_DEFAULT_COLOR = { r:255, g:255, b:255, a:1 },
        PRECISION = 100,
        LABEL_GAP = 2,
        DEFAULT_CUTON_TAGS = [ "type:sheet" ],
        DEFAULT_CUT_TAGS = [ "cut" ],
        TRANSPARENT = 0.6,
        DASH_SIZE = 1,
        AREA_TOLLERANCE = 5,
        ACTION_SETAREA = 0,
        ACTION_CUT = 1,
        ACTION_REMOVESHEET = 2,
        ACTION_SETMODEL = 3;

    let
        baseColor = settings.backgroundColor ? settings.backgroundColor : { r:150, g:150, b:150, a:1 },
        cutOnTags = settings.cutOnTags || DEFAULT_CUTON_TAGS,
        cutTags = settings.cutTags || DEFAULT_CUT_TAGS,
        cutModels = settings.cutModels === undefined ? settings.static.cutModels : settings.cutModels,
        frame,
        guideArea,
        guideLabel,
        pickMode,
        x1, y1, x2, y2,
        scissors = new Surface(
            "scissors",
            settings.tags,
            settings.x,
            settings.y,
            settings.width,
            settings.height
        );

    // --- Apply default

    if (settings.isDraggable === undefined)
        settings.isDraggable = true;
    if (settings.isVariableZIndex === undefined)
        settings.isVariableZIndex = true;
    if (settings.isDragTopSurfaces === undefined)
        settings.isDragTopSurfaces = false;
    if (settings.icon === undefined)
        settings.icon = true;

    // --- Element private functions

    function resetArea() {
        delete scissors.lastArea;
        endArea();

        if (guideArea && guideArea.parentNode)
            scissors.content.removeChild(guideArea);

        if (guideLabel && guideLabel.parentNode)
            scissors.content.removeChild(guideLabel);

    }

    function startDot(c) {
        
        if (frame)
            frame.style.opacity = TRANSPARENT;

        moveArea(c);
    }

    function endArea() {

        if (frame)
            frame.style.opacity = 1;

        if (guideArea)
            guideArea.style.borderColor = Global.colorToRGBA(baseColor,TRANSPARENT);

    }

    function updateArea() {
        if (scissors.lastArea) {
            startDot();
            endArea();
            updateGuideLabel();
        } else
            resetArea();
    }

    function updateGuideLabel() {

        if (guideLabel) {

            if ((scissors.lastArea.width >= AREA_TOLLERANCE) && (scissors.lastArea.height >= AREA_TOLLERANCE)) {

                if (!guideLabel.parentNode)
                    scissors.content.appendChild(guideLabel);
                
                guideLabel.innerHTML = scissors.formatMeasure(scissors.lastArea.width,PRECISION,false)+" &times; "+scissors.formatMeasure(scissors.lastArea.height,PRECISION,true);
                guideLabel.style.width = (scissors.lastArea.width*Global.SCALE)+"px";
                guideLabel.style.top = ((scissors.lastArea.y+scissors.lastArea.height+LABEL_GAP)*Global.SCALE)+"px";
                guideLabel.style.left = (scissors.lastArea.x*Global.SCALE)+"px";

            } else
                if (guideLabel.parentNode)
                    scissors.content.removeChild(guideLabel);

        }

    }

    function moveArea(c) {

        if (c) {

            if (!scissors.lastArea) {
                scissors.lastArea = {};
                x1 = c.x;
                y1 = c.y;
            }

            x2 = c.x;
            y2 = c.y;

            scissors.lastArea.x = Math.min(x1,x2);
            scissors.lastArea.y = Math.min(y1,y2);
            scissors.lastArea.width = Math.abs(x1-x2);
            scissors.lastArea.height = Math.abs(y1-y2);

        }

        if (guideArea) {

            if (!guideArea.parentNode) {
                guideArea.style.borderColor = Global.colorToRGBA(baseColor,true);
                scissors.content.appendChild(guideArea);
            }

            guideArea.style.transform = "translate("+(scissors.lastArea.x*Global.SCALE)+"px,"+(scissors.lastArea.y*Global.SCALE)+"px)";
            guideArea.style.width = (scissors.lastArea.width*Global.SCALE)+"px";
            guideArea.style.height = (scissors.lastArea.height*Global.SCALE)+"px";

            updateGuideLabel();
        
        }

    }

    
    function doCut() {

        let
            done = false;

        if (scissors.lastArea) {
        
            let
                ax = scissors.lastArea.x + scissors.x,
                ay = scissors.lastArea.y + scissors.y,
                destinations = scissors.getSurfacesByTag(cutOnTags);

            destinations.forEach(surface=>{
                let
                    cx = ax-surface.x,
                    cy = ay-surface.y,
                    cw = scissors.lastArea.width,
                    ch = scissors.lastArea.height,
                    model = surface.model ? scissors.translator.translateObject(surface.model) : 0;

                if (cx<0) {
                    cw+=cx;
                    cx=0;
                }
                if (cy<0) {
                    ch+=cy;
                    cy=0;
                }
                if ((cw>0) && (ch>0)) {
                    cw = Math.min(cw,surface.width-cx);
                    ch = Math.min(ch,surface.height-cy);
                    if ((cw > AREA_TOLLERANCE) && (ch > AREA_TOLLERANCE)) {
                        let
                            token = {
                                tags:cutTags,
                                x:surface.x+cx,
                                y:surface.y+cy,
                                width:cw,
                                height:ch,
                                mode:0,
                                isCut:true,
                                frame:{
                                    borderSize:0.5,
                                    borderStyle:"dashed",
                                    borderColor:baseColor
                                },
                                backgroundColor: surface.backgroundColor || SHEET_DEFAULT_COLOR,
                                flipBackgroundColor:surface.backgroundColor || SHEET_DEFAULT_COLOR,
                                isFlippable:true,
                                isRotating:true,
                                isSpinnable:true,
                                onShakeMacro: false,
                                image:{
                                    x:0,
                                    y:0,
                                    width:cw,
                                    height:ch,
                                },
                                flipImage:{
                                    image:false
                                }
                            };

                        if (model) {
                            token.image.image={
                                isResource: model.isResource,
                                type: model.type,
                                url: model.url,
                                file: model.file,
                                canvas: model.canvas,
                                meta: {
                                    crop: {
                                        imageWidth:surface.width,
                                        imageHeight:surface.height,
                                        x:cx,
                                        y:cy,
                                        width: cw,
                                        height: ch
                                    }
                                }
                            };
                        }

                        scissors.addElementToTable("token-custom",token);
                        done = true;

                    }
                }
            });
        }

        scissors.startAnimation(done ? "cut" : "fail");

    }


    // --- Prepare element

    if (settings.frame)
        frame = Stencil.newFrame(scissors.content,{
            x:0,
            y:0,
            width:settings.width,
            height:settings.height,
            backgroundColor:baseColor,
            borderRadius:2,
            boxShadow:[
                { x:0, y:0, size:1, color:{ r:50, g:50, b:50, a:1 }}
            ]
        },settings.frame,scissors);

    if (settings.icon)
        Stencil.newSprite(scissors.content,{
            y:(settings.height-20)/2,
            x:(settings.width-20)/2,
            width:20,
            height:20,
            baseColor:{ r:0, g:0, b:0, a:1 },
            image:settings.static.icon
        },settings.icon);
        
    if (settings.guideArea)
        guideArea = Stencil.newFrame(0,{
            width:0,
            height:0,
            borderColor:baseColor,
            borderSize:DASH_SIZE/2,
            backgroundColor:Global.colorWithAlpha(baseColor, 0.3),
            borderStyle:"dashed"
        },settings.guideArea);

    if (settings.guideLabel)
        guideLabel = Stencil.newLabel(0,{
            fontSize:6,
            fontWeight:"bold",
            textAlign:"center",
            lineHeight:"auto",
            textColor:{ r:255, g:255, b:255, a:1 },
            strokeWidth:0.5,
            strokeColor:{ r:0, g:0, b:0, a:1 },
            whiteSpace:"nowrap"
        },settings.guideLabel);

    // --- Element interfaces

    // --- Element macros

    scissors.setLastArea=(p)=>{
        if (p)
            scissors.lastArea = Global.clone(p);
        else
            delete scissors.lastArea;
        updateArea();
    }

    // --- Element properties (transfer)

    Stencil.transferGlobalProperties(settings,scissors);
    scissors.static = settings.static;
    scissors.backgroundColor = settings.backgroundColor;
    scissors.guideArea = settings.guideArea;
    scissors.guideLabel = settings.guideLabel;
    scissors.frame = settings.frame;
    scissors.isAreaLocked = settings.isAreaLocked;
    scissors.lastArea = settings.lastArea;
    scissors.messages = settings.messages;
    scissors.cutOnTags = settings.cutOnTags;
    scissors.cutTags = settings.cutTags;
    scissors.cutModels = settings.cutModels;

    // --- Element properties (setters)

    scissors.setVariableZIndex(!!settings.isVariableZIndex);
    scissors.setDragTopSurfaces(!!settings.isDragTopSurfaces);
    scissors.setDraggable(!!settings.isDraggable);
    scissors.setZIndexGroup(settings.zIndexGroup);
    scissors.setFence(settings.fence);
    scissors.setSimpleDrag(true);
    scissors.setStackId(settings.stackId);

    // --- Element menu

    scissors.onMenuOption=(option)=>{
        if (!Stencil.onMenuOptionDefault(scissors,option))
            switch (option.action) {
                case ACTION_SETAREA:{
                    pickMode = ACTION_SETAREA;
                    scissors.pickCoordinate({
                        touchDelta: true
                    });
                    break;
                }
                case ACTION_CUT:{
                    doCut();
                    break;
                }
                case ACTION_REMOVESHEET:{
                    pickMode = ACTION_REMOVESHEET;
                    scissors.addNotification( Global.colorToRGBA(baseColor,true), scissors.getMessage("selectSheet","title"));
                    scissors.pickCoordinate({
                        touchDelta: true
                    });
                    break;
                }
                case ACTION_SETMODEL:{
                    scissors.lastArea={
                        x:option.model.x === undefined ? scissors.width+LABEL_GAP : option.model.x,
                        y:option.model.y === undefined ? 0 : option.model.y,
                        width:option.model.width,
                        height:option.model.height
                    };
                    updateArea();
                    break;
                }
            }
        return true;
    }

    // --- Element special action

    // --- Element interactions

    scissors.onMoved=()=>{ Stencil.onMovedDefault(scissors) }
    scissors.onDrop=()=>{ Stencil.onDropDefault(scissors) }
    scissors.onSelect=()=>{ Stencil.onSelectDefault(scissors) }
    scissors.onShake=()=>{ Stencil.onShakeDefault(scissors) }
    scissors.onClick=()=>{ if (!Stencil.onClickDefault(scissors)) doCut(); }

    scissors.onCoordinatePickerStart=(e)=>{
        switch (pickMode) {
            case ACTION_SETAREA:{
                delete scissors.lastArea;
                startDot(e);
                break;
            }
        }
    }

    scissors.onCoordinatePickerMove=(e)=>{
        switch (pickMode) {
            case ACTION_SETAREA:{
                moveArea(e);
                break;
            }
        }
    }

    scissors.onCoordinatePickerEnd=(e)=>{
        switch (pickMode) {
            case ACTION_SETAREA:{
                if (
                    !scissors.lastArea ||
                    (
                        (scissors.lastArea.width < AREA_TOLLERANCE) ||
                        (scissors.lastArea.height < AREA_TOLLERANCE)
                    )
                )
                    resetArea();
                else
                    endArea();
                break;
            }
            case ACTION_REMOVESHEET:{
                if (
                    (e.x<0) ||
                    (e.x>scissors.width) ||
                    (e.y<0) ||
                    (e.y>scissors.height)
                ) {

                    let
                        destination,
                        x = e.x + scissors.x,
                        y = e.y + scissors.y,
                        destinations = scissors.getSurfacesByTag(cutOnTags);

                    destinations.forEach(surface=>{
                        if (surface.isPointInside(x,y,0))
                            destination = surface;
                    });

                    if (destination) {
                        destination.remove();
                        scissors.startAnimation("cut");
                    } else
                        scissors.startAnimation("fail");
                    
                }
                break;
            }
        }
    }

    scissors.onContextMenu=(options)=>{

        if (!scissors.isAreaLocked && scissors.hasMessage("setArea"))
            options.push({
                title:scissors.getMessage("setArea","title"),
                icon:scissors.getMessage("setArea","icon"),
                action:ACTION_SETAREA
            });
        if (scissors.hasMessage("cut"))
            options.push({
                title:scissors.getMessage("cut","title"),
                icon:scissors.getMessage("cut","icon"),
                action:ACTION_CUT
            });
        if (scissors.hasMessage("removeSheet"))
            options.push({
                title:scissors.getMessage("removeSheet","title"),
                icon:scissors.getMessage("removeSheet","icon"),
                action:ACTION_REMOVESHEET
            });
        if (cutModels)
            cutModels.forEach(model=>{
                options.push({
                    title:model.title,
                    icon:model.icon === undefined ? settings.static.areaIcon : model.icon,
                    description:{
                        EN:scissors.formatMeasure(model.width,PRECISION,false)+" &times; "+scissors.formatMeasure(model.height,PRECISION,true)
                    },
                    action:ACTION_SETMODEL,
                    model:model
                });
            })
        Stencil.onContextMenuDefault(scissors,options);
    }

    scissors.setContextMenu(true);

    // --- Element animations

    scissors.onAnimation=(id,time)=>{
        switch (id) {
            case "cut":{
                return Stencil.animate(Stencil.ANIMATION_JUMP,time,scissors);
            }
            case "fail":{
                return Stencil.animate(Stencil.ANIMATION_PULSE,time,scissors);
            }
        }
    }

    // --- Element lifecycle: update

    scissors.onUpdate=()=>{
        updateArea();
    }

    // --- Element lifecycle: events
    
    scissors.onMove=()=>{
        if (scissors.lastArea)
            moveArea();
    }

    // --- Element lifecycle: removal

    // --- Element initialization
    
    return scissors;

}
