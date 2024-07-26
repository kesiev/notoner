let Stamp=function(settings) {

    const
        ACTION_SETSTAMP = 1,
        ANGLE_UNIT = Math.PI/180*90;
        MARGIN = 2,
        TRANSPARENT = 0.4;

    let
        baseColor = settings.backgroundColor || { r:255, g:0, b:255, a:1 },
        hexBaseColor = Global.colorToHex(baseColor,true),
        frame,
        stampsImageContainer,
        stampsImage,
        stampsCanvas,
        drawOnTags =  settings.drawOnTags || [ "type:sheet" ],
        tempStamp,
        tempStampCtx,
        tempStampSignature,
        stamp = new Surface(
            "stamp",
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

    function setStamp() {
        Stencil.setFrame(stampsImage,stamp.stamps[stamp.selectedStamp].frame);
    }

    function applyStamp() {

        if (stampsCanvas) {


            let
                selectedStamp = stamp.stamps[stamp.selectedStamp],
                frameX = (selectedStamp.frame || 0) * (stampsCanvas.sprite.width+stampsCanvas.sprite.gapX),
                frameY = 0,
                frameWidth = stampsCanvas.sprite.width,
                frameHeight = stampsCanvas.sprite.height,
                cx = stamp.x+stampsImage._x,
                cy = stamp.y+stampsImage._y,
                cWidth = stampsImage._width,
                cHeight = stampsImage._height,
                surfaces = stamp.getSurfacesByTag(drawOnTags),
                stampMode = 0,
                stampColor;

            if (stamp.colorize) {

                let
                    tool = stamp.getTool();

                switch (tool.toolData.type) {
                    case tool.CONST.TOOLTYPE_PEN:{
                        stampMode = 2;
                        stampColor = tool.optionData.color;
                        break;
                    }
                    case tool.CONST.TOOLTYPE_ERASER:{
                        stampMode = 1;
                        break;
                    }
                }

            }

            surfaces.forEach(surface=>{

                if (surface.canvas) {
                    let
                        sheetX = (cx-surface.x)*surface.resolution,
                        sheetY = (cy-surface.y)*surface.resolution,
                        sheetWidth = cWidth*surface.resolution,
                        sheetHeight = cHeight*surface.resolution;

                    if (stamp.rotation) {
                        let
                            cx = sheetX+sheetWidth/2,
                            cy = sheetY+sheetHeight/2;
                        surface.context.save();
                        surface.context.translate(cx,cy);
                        surface.context.rotate(stamp.rotation*ANGLE_UNIT);
                        surface.context.translate(-cx,-cy);
                    }
                    
                    switch (stampMode) {
                        case 0:{
                            // Paste

                            surface.context.globalCompositeOperation = "source-over";
                            surface.context.drawImage(
                                stampsCanvas.canvas,frameX,frameY,frameWidth,frameHeight,
                                sheetX,sheetY,sheetWidth,sheetHeight
                            );
                            break;
                        }
                        case 1:{
                            // Erase

                            let
                                composition = surface.context.globalCompositeOperation;

                            surface.context.globalCompositeOperation = "destination-out";
                            surface.context.drawImage(
                                stampsCanvas.canvas,frameX,frameY,frameWidth,frameHeight,
                                sheetX,sheetY,sheetWidth,sheetHeight
                            );
                            surface.context.globalCompositeOperation = composition;
                            break;
                        }
                        case 2:{
                            // Colorize

                            let
                                stampSignature = frameX+"-"+frameY+"-"+frameWidth+"-"+frameHeight+"-"+stampColor.r+"-"+stampColor.g+"-"+stampColor.b;

                            if (stampSignature != tempStampSignature) {

                                let
                                    imageData,
                                    data,
                                    colorDelta;

                                tempStampSignature = stampSignature;
                                tempStamp.width = frameWidth;
                                tempStamp.height = frameHeight;
                                tempStampCtx.drawImage(
                                    stampsCanvas.canvas,frameX,frameY,frameWidth,frameHeight,
                                    0,0,frameWidth,frameHeight
                                );
                                imageData = tempStampCtx.getImageData(0,0,frameWidth,frameWidth);
                                data = imageData.data;

                                for (let i = 0; i < data.length; i += 4) {
                                    colorDelta = Math.floor(Math.max(data[i],data[i+1],data[i+2])/2);
                                    data[i] = Math.min(stampColor.r+colorDelta,255);
                                    data[i + 1] = Math.min(stampColor.g+colorDelta,255);
                                    data[i + 2] = Math.min(stampColor.b+colorDelta,255);
                                }

                                tempStampCtx.putImageData(imageData, 0, 0);

                            }

                            surface.context.globalCompositeOperation = "source-over";
                            surface.context.drawImage(
                                tempStamp,0,0,frameWidth,frameHeight,
                                sheetX,sheetY,sheetWidth,sheetHeight
                            );
                            break;
                        }
                    }

                    if (stamp.rotation)
                        surface.context.restore();

                }
            
            });

        }
    }

    function updateSelectedTool() {

        if (frame) {

            let tool = stamp.getTool();
            
            let
                color = tool.optionData.hexDisplayColor || hexBaseColor,
                image = tool.optionData.image ? "url('"+tool.optionData.image+"')" : "";

            if (settings.previewTool.border) {

                frame.style.borderColor = color;

                if (image)
                    frame.style.borderStyle = "dashed";
                else
                    frame.style.borderStyle = "solid";

            }

            if (settings.previewTool.background) {

                frame.style.backgroundColor = color;
                frame.style.backgroundImage = image;

            }

        }

    }

    function roll() {
        stamp.selectedStamp = Math.floor(Math.random()*stamp.stamps.length);
        setStamp();
        stamp.broadcastEndInteraction();
    }

    function setRotation(rotation) {
        if (rotation) {
            stamp.rotation = rotation;
            stampsImageContainer.style.transform="rotate("+(ANGLE_UNIT*rotation)+"rad)";
        } else {
            delete stamp.rotation;
            stampsImageContainer.style.transform="";
        }
    }

    // --- Prepare element
    
    if (settings.frame)
        frame = Stencil.newFrame(stamp.content,{
            x:0,
            y:0,
            width:settings.width,
            height:settings.height,
            backgroundColor:{ r:0, g:0, b:0, a:0 },
            borderColor:baseColor,
            borderSize:1,
            borderStyle:"solid",
            borderRadius:2,
            boxShadow:[
                { x:0, y:0, size:1, color:{ r:50, g:50, b:50, a:1 }}
            ]
        },settings.frame,stamp);

    if (settings.image)
        Stencil.newSprite(stamp.content,{
            x:0,
            y:0,
            width:settings.width,
            height:settings.height,
            baseColor:baseColor
        },settings.image);     
            
    if (settings.icon)
        Stencil.newSprite(stamp.content,{
            bottom:2,
            x:2,
            width:5,
            height:5,
            baseColor:baseColor,
            image:settings.static.icon
        },settings.icon);
        
    if (settings.stampsImage) {

        stampsImageContainer = document.createElement("div");
        stamp.content.appendChild(stampsImageContainer);
        stampsImage = Stencil.newSprite(stampsImageContainer,{
            x:MARGIN,
            y:MARGIN,
            width:settings.width-(MARGIN*2),
            height:settings.height-(MARGIN*2),
            baseColor:baseColor,
            opacity:TRANSPARENT
        },settings.stampsImage);
        stampsImageContainer.style.transformOrigin=((stampsImage._x+(stampsImage._width/2))*Global.SCALE)+"px "+((stampsImage._y+(stampsImage._height/2))*Global.SCALE)+"px";

        if (settings.stampsImage.image)
            Global.resourceToCanvas(settings.stampsImage.image,baseColor,stampsImage._height*Global.SCALE*2,(canvas)=>{
                stampsCanvas = canvas;
            });
    }

    if (settings.colorize) {
         tempStamp = document.createElement("canvas");
         tempStampCtx = tempStamp.getContext("2d");
    }

    // --- Element interfaces

    // --- Element macros
    
    stamp.setSide=(s)=>{
        stamp.selectedStamp = stamp.stamps && stamp.stamps[s] ? s : 0;
        setStamp();
    }
    stamp.shuffle = ()=>{
        stamp.startAnimation("roll");
    }

    stamp.setRotation=(rotation)=>{
        setRotation(rotation);
        stamp.broadcastEndInteraction();
    }

    stamp.paint=()=>{
        applyStamp();
    }

    // --- Element properties (transfer)

    Stencil.transferGlobalProperties(settings,stamp);
    stamp.static = settings.static;
    stamp.backgroundColor = settings.backgroundColor;
    stamp.drawOnTags = settings.drawOnTags;
    stamp.frame = settings.frame;
    stamp.image = settings.image; 
    stamp.stamps = settings.stamps;
    stamp.previewTool = settings.previewTool;
    stamp.stampsImage = settings.stampsImage;
    stamp.colorize = settings.colorize;
    stamp.onShakeShuffle = settings.onShakeShuffle;
    stamp.isRotating = settings.isRotating;
    stamp.rotation = settings.rotation;

    // --- Element properties (setters)

    stamp.setVariableZIndex(!!settings.isVariableZIndex);
    stamp.setDragTopSurfaces(!!settings.isDragTopSurfaces);
    stamp.setZIndexGroup(settings.zIndexGroup);
    stamp.setDraggable(!!settings.isDraggable);
    stamp.setFence(settings.fence);
    stamp.setSimpleDrag(true);

    // --- Element menu
    
    stamp.onContextMenu=(options)=>{
        stamp.stamps.forEach((entry,id)=>{
            options.push({
                title:entry.title,
                icon:entry.icon === undefined ? stamp.static.icon : entry.icon,
                action:ACTION_SETSTAMP,
                stamp:id
            })
        });
        Stencil.onContextMenuDefault(stamp,options);
    }

    stamp.onMenuOption=(option)=>{
        if (!Stencil.onMenuOptionDefault(stamp,option))
            switch (option.action) {
                case ACTION_SETSTAMP:{
                    stamp.setSide(option.stamp);
                    break;
                }
            }
            if (option.stamp !== undefined) {
                stamp.selectedStamp = option.stamp;
                setStamp();
            }
        return true;
    }

    stamp.setContextMenu(true);

    // --- Element special action

    // --- Element interactions

    stamp.onDrop=()=>{ Stencil.onDropDefault(stamp) }
    stamp.onSelect=()=>{ Stencil.onSelectDefault(stamp) }
    stamp.onShake=()=>{ if (!Stencil.onShakeDefault(stamp) && stamp.onShakeShuffle) stamp.shuffle(); }
    stamp.onClick=()=>{ if (!Stencil.onClickDefault(stamp)) applyStamp(); }

    if (settings.isRotating)
        stamp.onRotate=(side)=>{
            let
                rotation = (stamp.rotation || 0)+side;

            if (rotation < 0)
                rotation = 3;
            if (rotation > 3)
                rotation = 0;

            setRotation(rotation);
            stamp.broadcastEndInteraction();
        }

    // --- Element animations

    stamp.onAnimation=(id,time)=>{
        switch (id) {
            case "roll":{
                return Stencil.animate(Stencil.ANIMATION_ROLL,time,stamp,roll);
            }
        }
    }

    // --- Element lifecycle: update

    if (settings.previewTool) {

        stamp.onUpdate=()=>{
            updateSelectedTool();
        }

    }

    // --- Element lifecycle: events

    if (settings.previewTool) {

        stamp.onEvent=(from,e)=>{
            if ((from.type == "table") && (e.type == "toolChanged"))
                updateSelectedTool();
        }

        stamp.setOnEventTypes([ "table" ]);

    }

    // --- Element lifecycle: removal

    // --- Element initialization

    stamp.setSide(settings.selectedStamp);
    setRotation(settings.rotation);

    return stamp;

}
