let Token=function(settings) {

    const
        EVENT_TOKENTOSSED = { type:"tokenTossed" },
        EVENT_TOKENFLIPPED = { type:"tokenFlipped" };
        ACTION_FLIP = 1,
        ACTION_TOSS = 2,
        ACTION_SETROTATION = 3,
        ACTION_SPIN = 4,
        ACTION_CUTPASTEFACE = 5,
        ACTION_CUTREMOVEFACE = 6,
        ACTION_CUTREMOVE = 7;

    let
        image,
        label,
        frame,
        radius = 0,
        width,
        height,
        rotation = settings.rotation || 0,
        baseColor = settings.backgroundColor || { r:255, g:255, b:255, a:1 },
        isContentRotation = !!settings.contentRotations,
        sidesCount = isContentRotation ? settings.contentRotations.length : 4,
        token = new Surface(
            "token",
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
        settings.icon = false;

    // --- Element private functions

    function broadcastFlipped() {
        token.broadcastEvent(EVENT_TOKENFLIPPED);
    }
    
    function isTossable() {
        return settings.isFlippable && (settings.onShakeMacro === undefined);
    }

    function setSide(side) {

        if (settings.isFlippable && token.hasMessage("flip")) {
            token.side = side;

            let
                color = token.isTransparent ? Global.colorWithAlpha(token.backgroundColor, 0.7) : token.backgroundColor,
                flipColor = (token.isTransparent ? Global.colorWithAlpha(token.flipBackgroundColor || token.backgroundColor, 0.7) : token.flipBackgroundColor) || color;
        
            if (token.label)
                if (token.side)
                    Stencil.setLabel(label, token.flipLabelText);
                else if (token.labelText)
                    Stencil.setLabel(label, token.labelText);
            
            if (token.frame)
                if (token.side && token.flipBackgroundColor)
                    Stencil.setBackgroundColor(frame, flipColor);
                else if (token.backgroundColor)
                    Stencil.setBackgroundColor(frame,color);

            if (token.image)
                if (token.side)
                    Stencil.setImage(image, token.flipImage ? token.flipImage.image : false, flipColor);
                else if (token.image)
                    Stencil.setImage(image, token.image ? token.image.image : false, color);

        }
    }

    function toss() {
        setSide(Math.random()>0.5);
        token.broadcastEvent(EVENT_TOKENTOSSED);
    }

    function spin() {
        setRotation(Math.floor(Math.random()*sidesCount));
        token.broadcastEvent(EVENT_TOKENTOSSED);
    }
 
    function setRotation(torotation,reset) {

        let
            currentRotation = token.rotation || 0;

        if (!torotation) torotation = 0;

        if (reset || (torotation != currentRotation)) {

            if (isContentRotation) {

                token.content.style.transform="rotate("+settings.contentRotations[torotation].angle+"rad)";

            } else {

                let
                    cx = token.x+(token.width/2),
                    cy = token.y+(token.height/2),
                    cw,ch;

                if (currentRotation % 2) {
                    cw = token.height;
                    ch = token.width;
                } else {
                    cw = token.width;
                    ch = token.height;
                }

                token.content.style.transformOrigin=(cw*Global.SCALE/2)+"px "+(ch*Global.SCALE/2)+"px";

                if (torotation % 2) {
                    let
                        tilt = (cw-ch)/2*Global.SCALE;
                    if (!reset) {
                        token.setPosition(cx-(ch/2),cy-(cw/2));
                        token.setWidth(ch);
                        token.setHeight(cw);
                    }
                    if (torotation == 1)
                        token.content.style.transform="rotate(90deg) translate("+tilt+"px,"+tilt+"px)";
                    else
                        token.content.style.transform="rotate(270deg) translate("+(-tilt)+"px,"+(-tilt)+"px)";
                } else {
                    if (!reset) {
                        token.setPosition(cx-(cw/2),cy-(ch/2));
                        token.setWidth(cw);
                        token.setHeight(ch);
                    }
                    if (torotation == 0)
                        token.content.style.transform="";
                    else
                        token.content.style.transform="rotate(180deg)";
                }

            }

            token.rotation = torotation;

        }
    }

    // --- Prepare element

    if (rotation % 2) {
        width = settings.height;
        height = settings.width;
    } else {
        width = settings.width;
        height = settings.height;
    }

    switch (settings.mode) {
        case 0:{
            // Squared
            break;
        }
        case 1:{
            // Rounded
            radius = 2;
            break;
        }
        case 2:{
            // Circle
            radius = Math.max(width,height);
            break;
        }
    }

    if (settings.frame)
        frame = Stencil.newFrame(token.content,{
            x:0,
            y:0,
            width:width,
            height:height,
            backgroundColor:settings.isTransparent ? Global.colorWithAlpha(baseColor, 0.7) : baseColor,
            borderSize:1.3,
            borderStyle:"solid",
            borderColor:{ r:0, g:0, b:0, a:1 },
            borderRadius:radius,
            boxShadow:[
                { x:0, y:0, size:1, color:{ r:50, g:50, b:50, a:1 }}
            ]
        },settings.frame,token);
    else
        token.setBorderRadius(radius * Global.SCALE);

    if (settings.image)
        image = Stencil.newSprite(token.content,{
            x:(settings.image.x === undefined) && (settings.image.width !== undefined) ? (width - settings.image.width)/2 : 0,
            y:(settings.image.y === undefined) && (settings.image.height !== undefined) ? (height - settings.image.height)/2 : 0,
            width:width,
            height:height,
            baseColor:baseColor
        },settings.image);

    if (settings.label) {
        label = Stencil.newLabel(token.content,{
            x:0,
            y:0,
            width:width,
            height:height,
            fontSize:width-5,
            fontWeight:"bold",
            textAlign:"center",
            whiteSpace:"nowrap",
            lineHeight:"auto",
            textColor:{ r:255, g:255, b:255, a:1 },
            strokeWidth:0.5,
            strokeColor:{ r:0, g:0, b:0, a:1 }
        },settings.label);
        Stencil.setLabel(label,settings.labelText);
    }

    // --- Element interfaces

    // --- Element macros
    
    token.setSide=(side)=>{
        setSide(side);
    }

    token.spin=()=>{
        token.startAnimation("spin");
    }

    token.setRotation=(rotation)=>{
        setRotation(rotation);
        broadcastFlipped();
    }

    token.flip=()=>{
        setSide(!token.side);
        broadcastFlipped();
        token.startAnimation("flip");
    }

    token.shuffle=()=>{
        token.startAnimation("shuffle");
    }
    
    token.toss=function() {
        if (settings.isFlippable)
            token.startAnimation("toss");
    }

    // --- Element properties (transfer)

    Stencil.transferGlobalProperties(settings,token);
    token.static = settings.static;
    token.mode = settings.mode;
    token.image = settings.image;
    token.frame = settings.frame;
    token.label = settings.label;
    token.labelText = settings.labelText;
    token.side = settings.side;
    token.backgroundColor = settings.backgroundColor;
    token.isTransparent = settings.isTransparent;
    token.value = settings.value;
    token.flipValue = settings.flipValue;
    token.flipImage = settings.flipImage;
    token.flipBackgroundColor = settings.flipBackgroundColor;
    token.flipLabelText = settings.flipLabelText;
    token.isRotating = settings.isRotating;
    token.isSpinnable = settings.isSpinnable;
    token.rotation = settings.rotation;
    token.messages = settings.messages;
    token.isFlippable = settings.isFlippable;
    token.isCut = settings.isCut;
    token.contentRotations = settings.contentRotations;

    // --- Element properties (setters)
 
    token.setVariableZIndex(!!settings.isVariableZIndex);
    token.setDragTopSurfaces(!!settings.isDragTopSurfaces);
    token.setDraggable(!!settings.isDraggable);
    token.setZIndexGroup(settings.zIndexGroup);
    token.setFence(settings.fence);
    token.setSimpleDrag(true);
    token.setStackId(settings.stackId);
    token.setSide(settings.side);

    // --- Element menu

    if (isTossable() || settings.isRotating || Stencil.setContextMenuDefault(token)) {

        token.onContextMenu=(options)=>{
            if (isTossable() && token.hasMessage("toss"))
                options.push({
                    title:token.getMessage("toss","title"),
                    icon:token.getMessage("toss","icon"),
                    action:ACTION_TOSS
                });
            if (settings.isSpinnable && token.hasMessage("spin"))
                options.push({
                    title:token.getMessage("spin","title"),
                    icon:token.getMessage("spin","icon"),
                    action:ACTION_SPIN
                });
            if (settings.isRotating) {
                if (isContentRotation) {
                    settings.contentRotations.forEach((rotation,id)=>{
                        options.push({
                            title:rotation.label,
                            icon:rotation.icon,
                            action:ACTION_SETROTATION,
                            rotation:id
                        });
                    })
                } else {
                    if (token.hasMessage("rotateStraight"))
                        options.push({
                            title:token.getMessage("rotateStraight","title"),
                            icon:token.getMessage("rotateStraight","icon"),
                            action:ACTION_SETROTATION,
                            rotation:0
                        });
                    if (token.hasMessage("rotateUpsideDown"))
                        options.push({
                            title:token.getMessage("rotateUpsideDown","title"),
                            icon:token.getMessage("rotateUpsideDown","icon"),
                            action:ACTION_SETROTATION,
                            rotation:2
                        });
                    if (token.hasMessage("rotateRight"))
                        options.push({
                            title:token.getMessage("rotateRight","title"),
                            icon:token.getMessage("rotateRight","icon"),
                            action:ACTION_SETROTATION,
                            rotation:1
                        });
                    if (token.hasMessage("rotateLeft"))
                        options.push({
                            title:token.getMessage("rotateLeft","title"),
                            icon:token.getMessage("rotateLeft","icon"),
                            action:ACTION_SETROTATION,
                            rotation:3
                        });
                }
                if (token.isCut) {
                    if ((token.image.image !== false) && (token.flipImage.image !== false))
                        options.push({
                            title:token.getMessage("cutRemoveFace","title"),
                            icon:token.getMessage("cutRemoveFace","icon"),
                            action:ACTION_CUTREMOVEFACE
                        });
                    if (
                        (!token.side && (token.image.image === false)) ||
                        (token.side && (token.flipImage.image === false))
                    )
                        options.push({
                            title:token.getMessage("cutPasteFace","title"),
                            icon:token.getMessage("cutPasteFace","icon"),
                            action:ACTION_CUTPASTEFACE
                        });
                    options.push({
                        title:token.getMessage("cutRemove","title"),
                        icon:token.getMessage("cutRemove","icon"),
                        action:ACTION_CUTREMOVE
                    });
                }
            }
            Stencil.onContextMenuDefault(token,options);
        }
        
        token.setContextMenu(true);

    }

    token.onMenuOption=(option)=>{
        if (!Stencil.onMenuOptionDefault(token,option))
            switch (option.action) {
                case ACTION_FLIP:{
                    token.flip();
                    break;
                }
                case ACTION_TOSS:{
                    token.toss();
                    break;
                }
                case ACTION_SETROTATION:{
                    token.setRotation(option.rotation);
                    token.startAnimation("rotate");
                    break;
                }
                case ACTION_SPIN:{
                    token.spin();
                    break;
                }
                case ACTION_CUTPASTEFACE:{
                    token.pickCoordinate({
                        touchDelta: true
                    });
                    token.addNotification( Global.colorToRGBA(baseColor,true), token.getMessage("cutSelectBack","title"));
                    break;
                }
                case ACTION_CUTREMOVEFACE:{
                    
                    if (token.side) {
                        token.flipImage.image = false;
                        token.flipBackgroundColor = token.backgroundColor;
                    } else {
                        token.image.image = false;
                        token.backgroundColor = token.flipBackgroundColor;
                    }
                    
                    token.setSide(token.side);
                    break;
                }
                case ACTION_CUTREMOVE:{
                    token.remove();
                    break;
                }
            }
        return true;
    }

    // --- Element special action

    if (settings.isFlippable && token.hasMessage("flip"))
        token.setSpecialAction({
            title:token.getMessage("flip","title"),
            icon:token.getMessage("flip","icon"),
            action:ACTION_FLIP
        });

    // --- Element interactions

    token.onMoved=()=>{ Stencil.onMovedDefault(token) }
    token.onDrop=()=>{ Stencil.onDropDefault(token) }
    token.onSelect=()=>{ Stencil.onSelectDefault(token) } 
    token.onShake=()=>{ if (!Stencil.onShakeDefault(token) && isTossable() && token.toss) token.toss() }
    token.onClick=()=>{ if (!Stencil.onClickDefault(token) && token.isCut) token.flip(); }

    if (settings.isRotating) {

        token.onRotate=(direction)=>{
            let
                rotation = token.rotation+direction;

            if (rotation >= sidesCount)
                rotation = 0;

            if (rotation < 0)
                rotation = sidesCount-1;

            setRotation(rotation);
            token.startAnimation("rotate");
            token.broadcastEndInteraction();
        }
    }

    if (token.isCut) {
            
        token.onCoordinatePickerEnd=(e)=>{
            let
                found,
                elements;

            e.x += token.x;
            e.y += token.y;
            elements = token.getSurfacesAt(e);

            elements.forEach(element=>{
                if (element.isCut && (element !== token))
                    found = element;
            });

            if (found) {
                let
                    image,
                    color;

                if (found.side) {
                    image = found.flipImage;
                    color = found.flipBackgroundColor;
                } else {
                    image = found.image;
                    color = found.backgroundColor;
                }

                found.remove();

                if (token.side) {
                    token.flipImage = image;
                    token.flipBackgroundColor = color;
                } else {
                    token.image = image;
                    token.backgroundColor = color;
                }

                token.setSide(token.side);
            } else
                token.addNotification( Global.colorToRGBA(baseColor,true), token.getMessage("cutSelectBackNotFound","title"));

        }

    }

    // --- Element animations

    token.onAnimation=(id,time)=>{
        switch (id) {
            case "toss":{
                return Stencil.animate(Stencil.ANIMATION_TOSS,time,token,toss);
            }
            case "shuffle":{
                return Stencil.animate(Stencil.ANIMATION_SHUFFLE,time,token);
            }
            case "spin":{
                return Stencil.animate(Stencil.ANIMATION_ROLL,time,token,spin);
            }
            case "flip":
            case "rotate":{
                return Stencil.animate(Stencil.ANIMATION_JUMP,time,token);
            }
        }
    }

    // --- Element lifecycle: update

    // --- Element lifecycle: events

    // --- Element lifecycle: removal

    // --- Element initialization

    setRotation(settings.rotation,true);

    return token;

}
