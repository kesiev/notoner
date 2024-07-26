let Line=function(settings) {

    const
        PI = Math.PI,
        TAU = 2 * Math.PI,        
        RANDOM_MIN_DISTANCE = 5,
        RANDOM_MAX_DISTANCE = 250,
        PRECISION = 100,
        TRANSPARENT = 0.6,
        DASH_SIZE = 1,
        DOT_SIZE = 3,
        DOT_SIZE_HALF = DOT_SIZE/2,
        CANCEL_DISTANCE = 1,
        GUIDELABEL_ANGLE = Math.PI / 2

    let
        maxDistance = settings.distance ? settings.distance.max : 0,
        stepDistance = settings.distance ? settings.distance.step : 0,
        baseColor = settings.backgroundColor ? settings.backgroundColor : { r:255, g:0, b:0, a:1 },
        hexBaseColor = Global.colorToHex(baseColor,true),
        guideColor = baseColor,
        centerX = settings.center ? settings.center.x : (settings.width/2),
        centerY  = settings.center ? settings.center.y : (settings.height/2),
        dotCenterX =  centerX - (DOT_SIZE/2),
        dotCenterY =  centerY - (DOT_SIZE/2),
        drawOnTags =  settings.drawOnTags || [ "type:sheet" ],
        lineCenter = DASH_SIZE*Global.SCALE/4,
        lineCenterX = centerX*Global.SCALE,
        lineCenterY = centerY*Global.SCALE-lineCenter,
        dot,
        center,
        frame,
        firstPoint,
        guideLine,
        guideCircle,
        guideLabel,
        cancel,
        line = new Surface(
            "line",
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
    if (settings.lastStep === undefined)
        settings.lastStep = 1;
    if (settings.icon === undefined)
        settings.icon = true;

    // --- Element private functions

    
    function setGuideColor(transparency) {

        center.style.backgroundColor = Global.colorToRGBA(guideColor,transparency);
        dot.style.backgroundColor = Global.colorToRGBA(guideColor,transparency);
        
        if (guideLine)
            guideLine.style.borderColor = Global.colorToRGBA(guideColor,transparency);

        if (guideCircle)
            guideCircle.style.borderColor = Global.colorToRGBA(guideColor,transparency);

    }

    function resetDot() {
        delete line.lastVector;
        endDot();

        if (dot && dot.parentNode)
            line.content.removeChild(dot);

        if (guideLine && guideLine.parentNode)
            line.content.removeChild(guideLine);

        if (guideCircle && guideCircle.parentNode)
            line.content.removeChild(guideCircle);

        if (guideLabel && guideLabel.parentNode)
            line.content.removeChild(guideLabel);

        setGuideColor(true);

    }

    function startDot(c) {
        if (frame)
            frame.style.opacity = TRANSPARENT;

        moveDot(c);
        setGuideColor(true);
    }

    function endDot() {
        if (frame)
            frame.style.opacity = 1;

        setGuideColor(TRANSPARENT);
    }

    function updateDot() {
        cancel = false;
        if (line.lastVector && line.lastVector.length) {
            startDot();
            moveDot();
            endDot();
            updateGuideLabel();
        } else
            resetDot();
    }

    function updateGuideLabel() {

        if (guideLabel && !cancel) {

            let
                radius = line.lastVector.length * line.lastStep;

            if (radius) {

                if (!guideLabel.parentNode)
                    line.content.appendChild(guideLabel);
                
                guideLabel.innerHTML = line.formatMeasure(radius,PRECISION,true);
                
                if (radius < 50) {

                    let
                        ld = radius+5+guideLabel.clientWidth/4,
                        lx = Math.cos(line.lastVector.angle)*ld;
                        ly = Math.sin(line.lastVector.angle)*ld;

                    guideLabel.style.left = (((centerX+lx)*Global.SCALE)-(guideLabel.clientWidth/2))+"px";
                    guideLabel.style.top = (((centerY+ly)*Global.SCALE)-(guideLabel.clientHeight/2))+"px";

                } else {

                    let
                        lx = Math.cos(line.lastVector.angle)*radius;
                        ly = Math.sin(line.lastVector.angle)*radius;

                    guideLabel.style.left = (((centerX+lx/2)*Global.SCALE)-(guideLabel.clientWidth/2))+"px";
                    guideLabel.style.top = (((centerY+ly/2)*Global.SCALE)-(guideLabel.clientHeight/2))+"px";

                }

                if ((line.lastVector.angle > GUIDELABEL_ANGLE) || (line.lastVector.angle < -GUIDELABEL_ANGLE))
                    guideLabel.style.transform = "rotate("+(line.lastVector.angle-PI)+"rad)";
                else
                    guideLabel.style.transform = "rotate("+line.lastVector.angle+"rad)";

            } else
                if (guideLabel.parentNode)
                    line.content.removeChild(guideLabel);

        }

    }

    function moveDot(c) {

        let
            cx, cy,
            radius;

        if (c) {

            let
                dx = c.x-centerX,
                dy = c.y-centerY;

            line.lastVector.angle = Math.atan2(dy,dx),
            line.lastVector.length = Math.sqrt(dx*dx+dy*dy);

            if (!cancel) {
                    
                if (stepDistance)
                    line.lastVector.length = Math.floor(line.lastVector.length/stepDistance)*stepDistance;

                if (maxDistance)
                    line.lastVector.length = Math.min(maxDistance,line.lastVector.length);

            }
    
            if (!firstPoint)
                firstPoint = {x:c.x, y:c.y};
            else if (cancel) {
                let
                    cdx = c.x-firstPoint.x,
                    cdy = c.y-firstPoint.y,
                    cd = Math.sqrt(cdx*cdx+cdy*cdy);
                if (cd > CANCEL_DISTANCE)
                    cancel = false;
            }

        }

        radius = line.lastVector.length * line.lastStep;
        cx = Math.cos(line.lastVector.angle)*radius;
        cy = Math.sin(line.lastVector.angle)*radius;

        if (!dot.parentNode)
            line.content.appendChild(dot);

        dot.style.transform = "translate("+((centerX+cx-DOT_SIZE_HALF)*Global.SCALE)+"px,"+((centerY+cy-DOT_SIZE_HALF)*Global.SCALE)+"px)";

        if (!cancel) {

            if (guideLine) {

                if (!guideLine.parentNode)
                    line.content.appendChild(guideLine);

                guideLine.style.width = (radius*Global.SCALE)+"px";
                guideLine.style.transform = "translate("+lineCenterX+"px,"+lineCenterY+"px) rotate("+line.lastVector.angle+"rad)";
            }

            if (guideCircle) {
                let
                    delta = -(radius)*Global.SCALE;

                if (!guideCircle.parentNode)
                    line.content.appendChild(guideCircle);
        
                guideCircle.style.width = guideCircle.style.height = guideCircle.style.borderRadius = (radius*2*Global.SCALE)+"px";
                guideCircle.style.transform = "translate("+delta+"px,"+delta+"px)";
            }

            updateGuideLabel();

        }

    }

    function drawLine() {

        if (line.lastVector && line.lastStep) {

            if (settings.draw) {

                let
                    cx = line.x+centerX,
                    cy = line.y+centerY,    
                    radius = line.lastVector.length*line.lastStep,
                    surfaces = line.getSurfacesByTag(drawOnTags);

                surfaces.forEach(surface=>{

                    if (surface.canvas) {

                        surface.setTool(surface.getTool());

                        if (settings.draw.circle) {
                            surface.context.beginPath();
                            surface.context.arc((cx-surface.x)*surface.resolution, (cy-surface.y)*surface.resolution, radius*surface.resolution, 0, 2 * PI);
                            surface.context.stroke();
                            surface.context.closePath();
                        }

                        if (settings.draw.line) {
                            let
                                sx = cx-surface.x,
                                sy = cy-surface.y;
                            surface.context.beginPath();
                            surface.context.moveTo(sx*surface.resolution, sy*surface.resolution);
                            surface.context.lineTo((sx+(Math.cos(line.lastVector.angle)*radius))*surface.resolution, (sy+(Math.sin(line.lastVector.angle)*radius))*surface.resolution);
                            surface.context.stroke();
                            surface.context.closePath();
                        }
                    }

                });

            }

            if (settings.onDrawExpand) {
                line.lastStep++;
                moveDot();
            }

        }
    }

    function updateSelectedTool() {

        let tool = line.getTool();
        
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

        if (settings.previewTool.guides)
            guideColor = tool.optionData.displayColor || baseColor;

        setGuideColor(TRANSPARENT);

    }

    // --- Prepare element
    
    if (settings.frame)
        frame = Stencil.newFrame(line.content,{
            x:0,
            y:0,
            width:settings.width,
            height:settings.height,
            backgroundColor:{ r:0, g:0, b:0, a:0 },
            borderColor:baseColor,
            borderSize:3,
            borderStyle:"solid",
            borderRadius:Math.max(settings.width,settings.height),
            boxShadow:[
                { x:0, y:0, size:1, color:{ r:50, g:50, b:50, a:1 }}
            ]
        },settings.frame,line);

    if (settings.icon)
        Stencil.newSprite(line.content,{
            bottom:4,
            x:(settings.width/2)-2.5,
            width:5,
            height:5,
            baseColor:baseColor,
            image:settings.static.icon
        },settings.icon);

    if (settings.guideLine) {
        guideLine = Stencil.newFrame(0,{
            width:0,
            height:0,
            backgroundColor:{ r:0, g:0, b:0, a:0 },
            borderColor:guideColor,
            borderSize:DASH_SIZE/2,
            borderStyle:"dashed"
        },settings.guideLine);

        guideLine.style.transformOrigin="0px "+lineCenter+"px";
        guideLine.style.borderLeft = "none";
        guideLine.style.borderRight = "none";
        guideLine.style.borderBottom = "none";
    }

    if (settings.guideCircle)
        guideCircle = Stencil.newFrame(0,{
            x:centerX,
            y:centerY,
            width:0,
            height:0,
            backgroundColor:{ r:0, g:0, b:0, a:0 },
            borderColor:guideColor,
            borderSize:DASH_SIZE/2,
            borderStyle:"dashed"
        },settings.guideCircle);

    dot = Stencil.newFrame(0,{
        width:DOT_SIZE,
        height:DOT_SIZE,
        backgroundColor:guideColor,
        borderSize:0,
        borderRadius:DOT_SIZE
    },true);

    center = Stencil.newFrame(line.content,{
        x:dotCenterX,
        y:dotCenterY,
        width:DOT_SIZE,
        height:DOT_SIZE,
        backgroundColor:guideColor,
        borderSize:0,
        borderRadius:DOT_SIZE
    },true);

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

    line.shuffle=()=>{
        line.lastStep = 1;
        if (guideLine && line.lastVector)
            line.lastVector.angle = PI-Math.random()*TAU;
        else {
            let
                range = Math.max(RANDOM_MIN_DISTANCE, (maxDistance || RANDOM_MAX_DISTANCE) - RANDOM_MIN_DISTANCE);

            line.lastVector = {
                angle:PI-Math.random()*TAU,
                length: RANDOM_MIN_DISTANCE+(Math.random()*range)
            };
            if (stepDistance)
                line.lastVector.length = Math.floor(line.lastVector.length/stepDistance)*stepDistance;
        }
        updateDot();
        line.broadcastEndInteraction();
        line.startAnimation("shuffle");
    }

    line.setLastStep=(s)=>{
        line.lastStep = s || 1;
        updateDot();
    }

    line.setLastVector=(v)=>{
        if (v)
            line.lastVector = Global.clone(v);
        else
            delete line.lastVector;
        updateDot();
    }

    line.reset=()=>{
        resetDot();
    }

    line.paint=()=>{
        drawLine();
    }

    // --- Element properties (transfer)

    Stencil.transferGlobalProperties(settings,line);
    line.static = settings.static;
    line.backgroundColor = settings.backgroundColor;
    line.drawOnTags = settings.drawOnTags;
    line.distance = settings.distance;
    line.guideLine = settings.guideLine;
    line.guideCircle = settings.guideCircle;
    line.guideLabel = settings.guideLabel;
    line.draw = settings.draw;
    line.drawOnDrag = settings.drawOnDrag;
    line.drawOnClick = settings.drawOnClick;
    line.onDrawExpand = settings.onDrawExpand;
    line.frame = settings.frame;
    line.center = settings.center;
    line.lastVector = settings.lastVector;
    line.lastStep = settings.lastStep;
    line.isTargetLocked = settings.isTargetLocked;
    line.previewTool = settings.previewTool;
    line.onShakeShuffle = settings.onShakeShuffle;
    line.rotationAngle = settings.rotationAngle;

    // --- Element properties (setters)

    line.setVariableZIndex(!!settings.isVariableZIndex);
    line.setDragTopSurfaces(!!settings.isDragTopSurfaces);
    line.setZIndexGroup(settings.zIndexGroup);
    line.setFence(settings.fence);
    line.setDraggable(!!settings.isDraggable);
    line.setSimpleDrag(true);

    // --- Element menu

    // --- Element special action

    // --- Element interactions

    line.onDrop=()=>{ Stencil.onDropDefault(line) }
    line.onSelect=()=>{ Stencil.onSelectDefault(line) }
    line.onShake=()=>{ if (!Stencil.onShakeDefault(line)) line.shuffle(); }

    if (!line.isTargetLocked) {
            
        line.onCoordinatePickerStart=(e)=>{
            firstPoint = 0;
            cancel = true;
            line.lastStep = 1;
            line.lastVector = {
                angle:0,
                length:0
            };
            startDot(e);
        }

        line.onCoordinatePickerMove=(e)=>{
            moveDot(e);
        }

        line.onCoordinatePickerEnd=(e)=>{
            if (cancel || !line.lastVector || !line.lastVector.length)
                resetDot();
            else {
                if (settings.drawOnDrag)
                    drawLine();
                endDot();
            }
        }

        line.onContextMenu=(options)=>{
            line.pickCoordinate({
                touchDelta: true
            });
        }

        line.setContextMenu(true);

    }

    if (settings.previewTool) {

        line.onEvent=(from,e)=>{
            if ((from.type == "table") && (e.type == "toolChanged"))
                updateSelectedTool();
        }

        line.setOnEventTypes([ "table" ]);

    }

    line.onClick=(p,mod)=>{
        if (!Stencil.onClickDefault(line))
            if (mod.ctrl)
                resetDot();
            else if (line.lastVector && settings.drawOnClick)
                drawLine();
    }

    if (settings.rotationAngle)
        line.onRotate=(direction)=>{
            if (line.lastVector) {
                line.lastVector.angle+=settings.rotationAngle * direction;
                if (line.lastVector.angle > PI)
                    line.lastVector.angle = line.lastVector.angle - TAU;
                if (line.lastVector.angle < -PI)
                    line.lastVector.angle = TAU + line.lastVector.angle;
                updateDot();
                line.broadcastEndInteraction();
            }
        }

    // --- Element animations

    line.onAnimation=(id,time)=>{
        switch (id) {
            case "shuffle":{
                return Stencil.animate(Stencil.ANIMATION_PULSE,time,line);
            }
        }
    }
    
    // --- Element lifecycle: update

    line.onUpdate=()=>{
        if (settings.previewTool)
            updateSelectedTool();
        updateDot();
    }

    // --- Element lifecycle: events

    // --- Element lifecycle: removal

    // --- Element initialization

    return line;

}
