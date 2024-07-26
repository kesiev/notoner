let Catapult=function(settings) {

    const
        TRANSPARENT = 0.6,
        DASH_SIZE = 1,
        DOT_SIZE = 3,
        DOT_SIZE_HALF = DOT_SIZE/2,
        ACTION_SETTARGET = 0,
        ACTION_LAUNCH = 1;

    let
        baseColor = settings.backgroundColor ? settings.backgroundColor : { r:0, g:255, b:0, a:1 },
        centerX = settings.center ? settings.center.x : (settings.width/2),
        centerY  = settings.center ? settings.center.y : (settings.height/2),
        dotCenterX =  centerX - (DOT_SIZE/2),
        dotCenterY =  centerY - (DOT_SIZE/2),
        lineCenter = DASH_SIZE*Global.SCALE/4,
        lineCenterX = centerX*Global.SCALE,
        lineCenterY = centerY*Global.SCALE-lineCenter,
        dot,
        frame,
        guideLine,
        catapult = new Surface(
            "catapult",
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
        settings.isVariableZIndex = false;
    if (settings.isDragTopSurfaces === undefined)
        settings.isDragTopSurfaces = true;
    if (settings.icon === undefined)
        settings.icon = true;

    // --- Element private functions

    function resetDot() {
        delete catapult.lastPoint;
        endDot();

        if (dot && dot.parentNode)
            catapult.content.removeChild(dot);

        if (guideLine && guideLine.parentNode)
            catapult.content.removeChild(guideLine);

    }

    function startDot(c) {
        
        if (frame)
            frame.style.opacity = TRANSPARENT;

        dot.style.backgroundColor = Global.colorToRGBA(baseColor,true);

        moveDot(c);
    }

    function endDot() {

        if (frame)
            frame.style.opacity = 1;

        dot.style.backgroundColor = Global.colorToRGBA(baseColor,TRANSPARENT);

        if (guideLine)
            guideLine.style.borderColor = Global.colorToRGBA(baseColor,TRANSPARENT);

    }

    function updateDot() {
        if (catapult.lastPoint) {
            startDot();
            endDot();
        } else
            resetDot();
    }

    function moveDot(c) {

        let
            dx, dy, cx, cy,
            angle,
            radius;

        if (c) {

            if (!catapult.lastPoint) catapult.lastPoint = {};
            catapult.lastPoint.x = c.x + catapult.x;
            catapult.lastPoint.y = c.y + catapult.y;

        }
        
        dx = catapult.lastPoint.x - catapult.x - centerX;
        dy = catapult.lastPoint.y - catapult.y - centerY;
        angle = Math.atan2(dy,dx),
        radius = Math.sqrt(dx*dx+dy*dy);
        cx = Math.cos(angle)*radius;
        cy = Math.sin(angle)*radius;

        if (!dot.parentNode)
            catapult.content.appendChild(dot);

        dot.style.transform = "translate("+((centerX+cx-DOT_SIZE_HALF)*Global.SCALE)+"px,"+((centerY+cy-DOT_SIZE_HALF)*Global.SCALE)+"px)";

        if (guideLine) {

            if (!guideLine.parentNode) {
                guideLine.style.borderColor = Global.colorToRGBA(baseColor,true);
                catapult.content.appendChild(guideLine);
            }

            guideLine.style.width = (radius*Global.SCALE)+"px";
            guideLine.style.transform = "translate("+lineCenterX+"px,"+lineCenterY+"px) rotate("+angle+"rad)";
        }

    }

    function doLaunch() {

        if (catapult.lastPoint) {
        
            let
                intersecting = catapult.getSurfacesIntersecting(),
                destinations = catapult.getSurfacesAt(catapult.lastPoint),
                destination,found;

            for (let i=0;i<destinations.length;i++) {
                destination = destinations[i];
                if (!settings.launchOnTags || destination.hasTag(settings.launchOnTags))
                    found = destination;
            }

            if (found)
                intersecting.forEach(surface=>{
                    if (!settings.launchTags || surface.hasTag(settings.launchTags)) {
                        surface.animateToPosition(
                            found.x-(surface.width/2)+(Math.random()*found.width),
                            found.y-(surface.height/2)+(Math.random()*found.height),
                        );
                        if (settings.onLaunchShake && surface.onShake)
                            surface.onShake();
                        surface.unselect();
                    }
                });

            catapult.startAnimation("throw");
        } else
            catapult.startAnimation("fail");

    }

    // --- Prepare element
    
    if (settings.frame)
        frame = Stencil.newFrame(catapult.content,{
            x:0,
            y:0,
            width:settings.width,
            height:settings.height,
            backgroundColor:Global.colorWithAlpha(baseColor, 0.3),
            borderColor:baseColor,
            borderSize:3,
            borderStyle:"solid",
            borderRadius:2,
            boxShadow:[
                { x:0, y:0, size:1, color:{ r:50, g:50, b:50, a:1 }}
            ]
        },settings.frame,catapult);

    if (settings.icon)
        Stencil.newSprite(catapult.content,{
            bottom:4,
            x:4,
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
            borderColor:baseColor,
            borderSize:DASH_SIZE/2,
            borderStyle:"dashed"
        },settings.guideLine);

        guideLine.style.transformOrigin="0px "+lineCenter+"px";
        guideLine.style.borderLeft = "none";
        guideLine.style.borderRight = "none";
        guideLine.style.borderBottom = "none";
    }

    dot = Stencil.newFrame(catapult.content,{
        width:DOT_SIZE,
        height:DOT_SIZE,
        backgroundColor:baseColor,
        borderSize:0,
        borderRadius:DOT_SIZE
    },true);

    center = Stencil.newFrame(catapult.content,{
        x:dotCenterX,
        y:dotCenterY,
        width:DOT_SIZE,
        height:DOT_SIZE,
        backgroundColor:baseColor,
        borderSize:0,
        borderRadius:DOT_SIZE
    },true);

    // --- Element interfaces

    // --- Element macros

    catapult.setLastPoint=(p)=>{
        if (p)
            catapult.lastPoint = Global.clone(p);
        else
            delete catapult.lastPoint;
        updateDot();
    }

    catapult.launch=()=>{
        doLaunch();
    }

    // --- Element properties (transfer)

    Stencil.transferGlobalProperties(settings,catapult);
    catapult.static = settings.static;
    catapult.backgroundColor = settings.backgroundColor;
    catapult.launchTags = settings.launchTags;
    catapult.launchOnTags = settings.launchOnTags;
    catapult.guideLine = settings.guideLine;
    catapult.frame = settings.frame;
    catapult.center = settings.center;
    catapult.isTargetLocked = settings.isTargetLocked;
    catapult.lastPoint = settings.lastPoint;
    catapult.messages = settings.messages;
    catapult.onLaunchShake = settings.onLaunchShake;
    catapult.onShakeLaunch = settings.onShakeLaunch;

    // --- Element properties (setters)

    catapult.setVariableZIndex(!!settings.isVariableZIndex);
    catapult.setDragTopSurfaces(!!settings.isDragTopSurfaces);
    catapult.setDraggable(!!settings.isDraggable);
    catapult.setZIndexGroup(settings.zIndexGroup);
    catapult.setFence(settings.fence);
    catapult.setSimpleDrag(true);

    // --- Element menu

    catapult.onMenuOption=(option)=>{
        if (!Stencil.onMenuOptionDefault(catapult,option))
            switch (option.action) {
                case ACTION_SETTARGET:{
                    catapult.pickCoordinate({
                        touchDelta: true
                    });
                    break;
                }
                case ACTION_LAUNCH:{
                    doLaunch();
                    break;
                }
            }
        return true;
    }

    // --- Element special action

    if (catapult.hasMessage("launch"))
        catapult.setSpecialAction({
            title:catapult.getMessage("launch","title"),
            icon:catapult.getMessage("launch","icon"),
            action:ACTION_LAUNCH
        });

    // --- Element interactions

    catapult.onDrop=()=>{ Stencil.onDropDefault(catapult) }
    catapult.onSelect=()=>{ Stencil.onSelectDefault(catapult) }
    catapult.onShake=()=>{ if (!Stencil.onShakeDefault(catapult) && settings.onShakeLaunch) catapult.launch(); }
    catapult.onClick=()=>{ Stencil.onClickDefault(catapult) }

    catapult.onCoordinatePickerStart=(e)=>{
        delete catapult.lastPoint;
        startDot(e);
    }

    catapult.onCoordinatePickerMove=(e)=>{
        moveDot(e);
    }

    catapult.onCoordinatePickerEnd=(e)=>{
        if (
            !catapult.lastPoint ||
            !(
                (catapult.lastPoint.x<catapult.x) ||
                (catapult.lastPoint.x>catapult.x+catapult.width) ||
                (catapult.lastPoint.y<catapult.y) ||
                (catapult.lastPoint.y>catapult.y+catapult.height)
            )
        )
            resetDot();
        else
            endDot();
    }

    if ((!catapult.isTargetLocked && catapult.hasMessage("setTarget")) || Stencil.setContextMenuDefault(catapult)) {

        catapult.onContextMenu=(options)=>{
            if (!catapult.isTargetLocked)
                options.push({
                    title:catapult.getMessage("setTarget","title"),
                    icon:catapult.getMessage("setTarget","icon"),
                    action:ACTION_SETTARGET
                });
            Stencil.onContextMenuDefault(catapult,options);
        }

        catapult.setContextMenu(true);

    }
    
    // --- Element animations

    catapult.onAnimation=(id,time)=>{
        switch (id) {
            case "throw":{
                return Stencil.animate(Stencil.ANIMATION_PULSE,time,catapult);
            }
            case "fail":{
                return Stencil.animate(Stencil.ANIMATION_JUMP,time,catapult);
            }
        }
    }

    // --- Element lifecycle: update

    catapult.onUpdate=()=>{
        updateDot();
    }

    // --- Element lifecycle: events
    
    catapult.onMove=()=>{
        if (catapult.lastPoint)
            moveDot();
    }

    // --- Element lifecycle: removal

    // --- Element initialization
    
    return catapult;

}
