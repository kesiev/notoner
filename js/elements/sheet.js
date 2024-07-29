let Sheet=function(settings) {

    const
        HEXAGON_ANGLE = Math.PI * 2 / 6,
        EVENT_PAINTED = { type:"painted" },
        SHADOW = 1,
        DEFAULT_MODEL_OPACITY = 0.6,
        DEFAULT_COLOR = { r:255, g:255, b:255, a:1 };

    let
        imageFile,
        canvas,
        context,
        canvasScale = Global.SCALE/settings.resolution,
        isWritable = !settings.isReadOnly && !settings.isDraggable,
        modelOpacity = settings.modelOpacity === undefined ? (settings.model && isWritable ? DEFAULT_MODEL_OPACITY : 1) : settings.modelOpacity,
        model = document.createElement("div"),
        frame,
        sheet = new Surface(
            "sheet",
            settings.tags,
            settings.x,
            settings.y,
            settings.width,
            settings.height
        );

    function svgLine(x1,y1,x2,y2,color) {
        return '<path style="fill:none;stroke:'+color+';stroke-width:0.15px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" d="M '+x1+' '+y1+' '+x2+' '+y2+'" />';
    }

    // --- Apply default
    
    if (settings.isDraggable === undefined)
        settings.isDraggable = false;
    if (settings.isVariableZIndex === undefined)
        settings.isVariableZIndex = false;
    if (settings.isDragTopSurfaces === undefined)
        settings.isDragTopSurfaces = true;
    if (settings.icon === undefined)
        settings.icon = false;

    // --- Element private functions

    function setTool(tool) {

        switch (tool.toolData.type) {
            case tool.CONST.TOOLTYPE_PEN:{
                context.globalCompositeOperation="source-over";
                context.strokeStyle = context.fillStyle = tool.optionData.hexColor;
                context.lineWidth = tool.optionData.size / canvasScale * Global.SCALE;
                break;
            }
            case tool.CONST.TOOLTYPE_ERASER:{
                context.globalCompositeOperation="destination-out";
                context.strokeStyle = context.fillStyle = "#000";
                context.lineWidth = tool.optionData.size / canvasScale * Global.SCALE;
                break;
            }
        }

        context.lineCap = "round";
        context.lineJoin = "round";
        
    }

    // --- Prepare element

    if (settings.frame) {
        frame = Stencil.newFrame(sheet.content,{
            x:0,
            y:0,
            width:settings.width,
            height:settings.height,
            backgroundColor:settings.backgroundColor || DEFAULT_COLOR,
            borderRadius: isWritable ? 0 : 2,
            boxShadow:[
                { x:0, y:0, size:SHADOW, color:{ r:51, g:51, b:51, a:1 }}
            ]
        },settings.frame,sheet);
        model.style.borderRadius = frame.style.borderRadius;
    }

    model.style.backgroundSize="100% 100%";
    model.style.backgroundRepeat="no-repeat";
    model.style.position="absolute";
    model.style.left = model.style.right = "0px";
    model.style.width = (settings.width * Global.SCALE)+"px";
    model.style.height = (settings.height * Global.SCALE)+"px";
    model.style.opacity = modelOpacity;
    sheet.content.appendChild(model);

    if (settings.pattern && settings.pattern.type) {
        
        let
            pattern = settings.pattern,
            patternTopMargin = pattern.topMargin || 0,
            patternBottomMargin = pattern.bottomMargin || 0,
            patternRightMargin = pattern.rightMargin || 0,
            patternLeftMargin = pattern.leftMargin || 0,
            patternAreaWidth = settings.width-patternLeftMargin-patternRightMargin,
            patternAreaHeight = settings.height-patternTopMargin-patternBottomMargin,
            patternAreaBottom = settings.height-patternBottomMargin,
            patternAreaRight = settings.width-patternRightMargin,
            patternWidth = pattern.width || pattern.height || 10,
            patternHeight = pattern.height || patternWidth || 10,
            patternColor = pattern.color ? Global.colorToHex(pattern.color,false) : "#000000",
            patternNode = document.createElement("div"),
            svg = "";
            
        svg += '<?xml version="1.0" encoding="UTF-8" standalone="no"?><svg width="'+settings.width*Global.SCALE+'mm" height="'+settings.height+'mm" viewBox="0 0 '+settings.width+' '+settings.height+'" version="1.1" id="svg5" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">';
        svg += '<g id="layer1">';
    
        switch (pattern.type) {
            case 1:{
                // Lines
                let
                    y=patternTopMargin+patternHeight;
                while (y<patternAreaBottom) {
                    svg +=svgLine(patternLeftMargin,y,patternLeftMargin+patternAreaWidth,y,patternColor);
                    y+=patternHeight;
                }
                break;
            }
            case 2:{
                // Squares
                let
                    x=patternLeftMargin+patternWidth,
                    y=patternTopMargin+patternHeight;
                while (y<patternAreaBottom) {
                    svg +=svgLine(patternLeftMargin,y,patternLeftMargin+patternAreaWidth,y,patternColor);
                    y+=patternHeight;
                }
                while (x<patternAreaRight) {
                    svg +=svgLine(x,patternTopMargin,x,patternTopMargin+patternAreaHeight,patternColor);
                    x+=patternWidth;
                } 
                break;
            }
            case 3:{
                // Vertical hexagons
                let
                    row = false,
                    hexDiagonalHeight = patternWidth * Math.cos(HEXAGON_ANGLE),
                    hexDiagonalWidth = patternWidth * Math.sin(HEXAGON_ANGLE),
                    x,
                    y=patternTopMargin;
                while (y<patternAreaBottom) {
                    x=patternLeftMargin-(row ? hexDiagonalWidth : 0);
                    while (x<patternAreaRight) {
                        svg+=svgLine(x,y+hexDiagonalHeight,x+hexDiagonalWidth,y,patternColor);
                        svg+=svgLine(x+hexDiagonalWidth,y,x+hexDiagonalWidth*2,y+hexDiagonalHeight,patternColor);
                        svg+=svgLine(x+hexDiagonalWidth*2,y+hexDiagonalHeight,x+hexDiagonalWidth*2,y+hexDiagonalHeight+patternWidth,patternColor);
                        x+=hexDiagonalWidth*2;
                    }
                    y+=patternHeight+hexDiagonalHeight;
                    row = !row;
                }
                break;
            }
            case 4:{
                // Horizontal hexagons
                let
                    row = false,
                    hexDiagonalHeight = patternWidth * Math.sin(HEXAGON_ANGLE),
                    hexDiagonalWidth = patternWidth * Math.cos(HEXAGON_ANGLE),
                    x,
                    y=patternTopMargin;
                while (y<patternAreaBottom) {
                    x=patternLeftMargin-(row ? patternWidth+hexDiagonalWidth : 0);
                    while (x<patternAreaRight) {
                        svg+=svgLine(x,y+hexDiagonalHeight,x+hexDiagonalWidth,y,patternColor);
                        svg+=svgLine(x+hexDiagonalWidth,y,x+hexDiagonalWidth+patternWidth,y,patternColor);
                        svg+=svgLine(x+hexDiagonalWidth+patternWidth,y,x+patternWidth+hexDiagonalWidth*2,y+hexDiagonalHeight,patternColor);
                        x+=(patternWidth+hexDiagonalWidth)*2;
                    }
                    y+=hexDiagonalHeight;
                    row = !row;
                }
                break;
            }
        }
        
        svg += '</g></svg>';

        patternNode.style.backgroundSize="contain";
        patternNode.style.backgroundPosition="center";
        patternNode.style.backgroundRepeat="no-repeat";
        patternNode.style.position="absolute";
        patternNode.style.left = model.style.right = "0px";
        patternNode.style.width = (settings.width*Global.SCALE)+"px";
        patternNode.style.height = (settings.height*Global.SCALE)+"px";
        patternNode.style.backgroundImage="url('"+Global.urlEncodeFile("image/svg+xml",svg)+"')";
        patternNode.style.backgroundSize="cover";
        patternNode.style.opacity = 0.3;
        sheet.content.appendChild(patternNode);
            
    }

    if (isWritable) {

        canvas = document.createElement("canvas");
        context = canvas.getContext("2d");

        canvas.width = settings.width * settings.resolution;
        canvas.height = settings.height  * settings.resolution;
        canvas.style.position="absolute";
        canvas.style.left = canvas.style.top = "0px";
        canvas.style.transformOrigin="0 0";
        canvas.style.transform="scale("+canvasScale+")";
        sheet.content.appendChild(canvas);

        if (settings.image) {
            imageFile = settings.image.file;
            context.drawImage(settings.image.canvas,0,0);
        }

        sheet.canvas = canvas;
        sheet.context = context;

    }
       
    // --- Element interfaces

    sheet.getImage=(cb)=>{
        if (isWritable)
            return {
                isResource:true,
                type:"canvas",
                file:imageFile,
                canvas:canvas
            };
    }

    sheet.setTool=(tool)=>{
        setTool(tool);
    }

    // --- Element macros

    sheet.reset=()=>{
        if (isWritable)
            context.clearRect(0, 0, canvas.width, canvas.height);
    }

    // --- Element properties (transfer)

    Stencil.transferGlobalProperties(settings,sheet);
    sheet.static = settings.static;
    sheet.backgroundColor = settings.backgroundColor;
    sheet.model = settings.model;
    sheet.isReadOnly = settings.isReadOnly;
    sheet.resolution = settings.resolution;
    sheet.pattern = settings.pattern;
    sheet.modelOpacity = settings.modelOpacity;
    sheet.frame = settings.frame;

    // --- Element properties (setters)

    if (settings.isDraggable) {
        sheet.setDraggable(true);
        sheet.setSimpleDrag(true);
    } else
        sheet.setDraggable(false);
    sheet.setVariableZIndex(!!settings.isVariableZIndex);
    sheet.setDragTopSurfaces(!!settings.isDragTopSurfaces);
    sheet.setZIndexGroup(settings.zIndexGroup);
    sheet.setFence(settings.fence);

    // --- Element menu

    if (!isWritable) {

        sheet.onClick=()=>{ Stencil.onClickDefault(sheet) }
        
        sheet.onContextMenu=(options)=>{
            Stencil.onContextMenuDefault(sheet,options);
        }

        sheet.onMenuOption=(option)=>{
            Stencil.onMenuOptionDefault(sheet,option);
            return true;
        }

        sheet.setContextMenu(true);
        
    }

    // --- Element special action

    // --- Element interactions

    sheet.onDrop=()=>{ Stencil.onDropDefault(sheet) }
    sheet.onShake=()=>{ Stencil.onShakeDefault(sheet) }

    if (isWritable) {

        sheet.onStartInteraction=(p1,tool)=>{
            // onSelect replacement
            if (!Stencil.onSelectDefault(sheet))
                setTool(tool);

            // Draw
            context.beginPath();
            context.moveTo(p1.x * settings.resolution, p1.y * settings.resolution);
            context.lineTo(p1.x * settings.resolution, p1.y * settings.resolution);
            context.stroke();
            context.closePath();
            prevpoint = p1;
        }

        sheet.onInteraction=(p1,tool)=>{
            context.beginPath();
            setTool(tool);
            context.moveTo(prevpoint.x * settings.resolution, prevpoint.y * settings.resolution);
            context.lineTo(p1.x * settings.resolution, p1.y * settings.resolution);
            context.stroke();
            context.closePath();
            prevpoint = p1;
        }

        sheet.onEndInteraction=()=>{
            sheet.broadcastEvent(EVENT_PAINTED);
        }

    } else
        sheet.onSelect=()=>{ Stencil.onSelectDefault(sheet) };

    // --- Element animations

    // --- Element lifecycle: update

    sheet.onUpdate=()=>{
        if (settings.model)
            Global.setResourceAsSprite(model,sheet.translator.translateObject(settings.model));
    }

    // --- Element lifecycle: events

    // --- Element lifecycle: removal

    // --- Element initialization

    return sheet;

}