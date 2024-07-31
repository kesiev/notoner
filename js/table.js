let Table=function() {

    const
        DEBUG = false,
        TAU = 2 * Math.PI,
        TOUCH_DELTA = -60,
        MENUBUTTON_WIDTH = 55,
        MENUBUTTON_HEIGHT = 55,
        MENUBUTTON_ICONSIZE = 40,
        MENUBUTTON_BULLETSIZE = 15,
        MENUBUTTON_BULLETBORDER = 4,
        SURFACE_SELECT_PADDING = 2,
        SURFACE_SELECT_SIZE = 3,
        SURFACE_SCALED_SELECT_SIZE = SURFACE_SELECT_SIZE * Global.SCALE,
        SURFACE_SCALED_SELECT_PADDING = SURFACE_SELECT_PADDING * Global.SCALE,
        KEYBOARD_INPUT_DATA = {
            align:"left",
            multiline:true,
            x:0,
            y:0,
            width:100,
            height:100,
            fontFamily:"Noto Sans Regular",
            fontSize:6,
            lineHeight:7,
            backgroundColor:"transparent"
        },
        KEYBOARD_INPUT_MIN_WIDTH = 2,
        KEYBOARD_INPUT_MIN_HEIGHT = 2,
        MOUSEBUTTON_LEFT = 0,
        MOUSEBUTTON_MIDDLE = 1,
        MOUSEBUTTON_RIGHT = 2,
        NOTIFICATION_TIME = 5000,
        NOTIFICATION_MARGIN = 10,
        NOTIFICATION_CLASSNAME = "notification",
        BACKGROUND_SCALE = 0.2,
        LIMIT_SCALE_HIGH = 8 / Global.SCALE,
        LIMIT_SCALE_LOW = 0.7 / Global.SCALE,
        LIMIT_X_HIGH = 3000,
        LIMIT_X_LOW = -3000,
        LIMIT_Y_HIGH = 3000,
        LIMIT_Y_LOW = -3000,
        SCALED_LIMIT_X_HIGH = 3000*Global.SCALE,
        SCALED_LIMIT_X_LOW = -3000*Global.SCALE,
        SCALED_LIMIT_Y_HIGH = 3000*Global.SCALE,
        SCALED_LIMIT_Y_LOW = -3000*Global.SCALE,
        TOOLBOX_WIDTH = 60,
        TOOLBOX_HEIGHT = 120,
        TOOLBOX_PADDING = 5,
        TOOLBOX_PENPREVIEW_BORDER = 4,
        TOOLBOX_PENPREVIEW_MAXSIZE = TOOLBOX_WIDTH-(TOOLBOX_PENPREVIEW_BORDER*2),
        TOOLBOX_OPTIONHEIGHT_MAXSIZE = TOOLBOX_WIDTH,
        MOUSE_WHEELDELTA = 0.25,
        EVENT_ENDINTERACTION={ type:"endInteraction" },
        EVENT_TOOLCHANGED={ type:"toolChanged" },
        SIMPLEDRAG_MARGIN_SMALL = 0.5,
        SIMPLEDRAG_MARGIN_LARGE = 10,
        FRAME_MARGIN = 40,
        CLICKTIMER_TIME = 250,
        HOLDTIMER_TIME = CLICKTIMER_TIME+50,
        HOLDTIMER_DISTANCE = 5,
        HOLDTIMER_DISTANCE_PALMTRICK = 50,
        HOLDTIMER_DISTANCE_ANGLE = 0.8,
        INTERACTIONCACHE_SIZE=5,
        ROTATION_ANGLE = 0.4,
        SHAKE_AREARATIO = 3.5,
        SHAKE_TIME = 750,
        SHAKE_DURATION = 500,
        TARGET_VIEWPORT = 0,
        TARGET_TOOLBOX = 1,
        TARGET_MENUBUTTON = 2,
        CONTEXTMENU_SPACING = 20,
        CONTEXTMENU_BORDER = 10,
        TOOL_SHIFTED = 1,
        POINTERMODE_FINGER = 1,
        POINTERMODE_PEN = 2,
        POINTERMODE_DIGITALPEN = 3,
        POINTERMODE_TOUCHDIGITALPEN = 4,
        MODE_NONE = 0,
        MODE_DRAG = 1,
        MODE_DRAG_VIEWPORT = 2,
        MODE_DRAG_SURFACE = 3,
        MODE_DRAG_PREPAREINTERACT = 4,
        MODE_DRAG_INTERACT = 5,
        MODE_DRAG_TOOLBOX = 6,
        MODE_DRAG_TOOLBOX_OPTION = 7,
        MODE_DRAG_TOOLBOX_MENU = 8,
        MODE_DRAG_SIMPLE = 9,
        MODE_PINCH = 20,
        MODE_PINCH_VIEWPORT = 21,
        MODE_PINCH_SURFACE = 22,
        MODE_PINCH_WAITNEXTPINCH = 30,
        MODE_WAIT_NOTOUCH = 31,
        MODE_PICKER = 40,
        MODE_KEYBOARD_INPUT = 50;

    let
        table,
        holdTimer,
        eventListener,
        measureUnit = { ratio:1, label:"mm" },
        pointerMode = POINTERMODE_FINGER,
        interaction = { mode:MODE_NONE },
        viewport = { x:0, y:0, scale:3, angle:0 },
        shakeDetector = { timeStamp:0, ready:true },
        hovering,
        tools,
        touches = [],
        touchesById = {},
        keyboard = [],
        modifiers = { shift:false, ctrl:false },
        dirty = { is:false, animations:false },
        toolsById = {},
        forceRedraw,
        isRotationEnabled = true,
        isShakePreview = false,
        isForceRedraw = false,
        isUnlocked = true,
        isContextMenuClosed = true,
        isPalmTricks = false,
        isKeyboardWriting = false,
        isKeyboardWritingClosed = true,
        keyboardWidget,
        keyboardTextArea,
        keyboardInput,
        keyboardAreaData,
        contextMenuNode = 0,
        menuAction = 0,
        holdtimerDistance = HOLDTIMER_DISTANCE,
        holdtimerDistancePinch = HOLDTIMER_DISTANCE,
        holdtimerDistanceAngle = HOLDTIMER_DISTANCE_ANGLE,
        tableBackgroundClassName,
        tool = {
            CONST:0,
            id:0, defaultOptions: [ ]
        },
        toolboxOptionHeight,
        onEventTypesIndex = {},
        node = document.createElement("div"),
        notificationsNode = document.createElement("div"),
        viewportNode = document.createElement("div"),
        root,
        debugNode,
        toolBox = document.createElement("div"),
        penPreview = document.createElement("div"),
        toolPalette = document.createElement("div"),
        toolPaletteIcon = document.createElement("div"),
        menuButton = document.createElement("div"),
        menuButtonIcon = document.createElement("div"),
        menuButtonBullet = document.createElement("div"),
        menuShade = document.createElement("div"),
        tableBackground = document.createElement("div");

    // --- Initialize UI

    notificationsNode.style.position = tableBackground.style.position = menuShade.style.position = menuButtonBullet.style.position = toolBox.style.position = menuButtonIcon.style.position = menuButton.style.position = toolPaletteIcon.style.position = toolPalette.style.position = penPreview.style.position = viewportNode.style.position = node.style.position="absolute";

    notificationsNode.style.right = NOTIFICATION_MARGIN+"px";
    notificationsNode.style.bottom = NOTIFICATION_MARGIN+"px";
    
    menuShade.style.left = menuButton.style.left = toolPaletteIcon.style.left = toolPalette.style.left = viewportNode.style.left = node.style.left="0px";
    menuButton.style.top = menuShade.style.top = toolBox.style.top = toolPaletteIcon.style.top = viewportNode.style.top = node.style.top="0px";
    menuButtonBullet.style.right = menuShade.style.right = menuButtonIcon.style.right = toolBox.style.right = viewportNode.style.right = node.style.right="0px";
    menuButtonBullet.style.bottom = menuButtonIcon.style.bottom = toolPaletteIcon.style.bottom = viewportNode.style.bottom = node.style.bottom = "0px";
    
    viewportNode.style.transformOrigin="0 0";

    toolBox.style.width = (TOOLBOX_WIDTH+TOOLBOX_PADDING)+"px";
    toolPalette.style.top = toolBox.style.height = TOOLBOX_HEIGHT+"px";

    penPreview.style.top = (TOOLBOX_HEIGHT-TOOLBOX_WIDTH)+"px";
    penPreview.style.zIndex = 50;

    menuButton.style.width = MENUBUTTON_WIDTH+"px";
    menuButton.style.height = MENUBUTTON_HEIGHT+"px";

    menuButtonIcon.style.width = menuButtonIcon.style.height = menuButtonIcon.style.borderRadius = MENUBUTTON_ICONSIZE+"px";
    menuButtonIcon.style.backgroundColor = "#fff";
    menuButtonIcon.style.border = MENUBUTTON_BULLETBORDER+"px solid #000";
    menuButtonIcon.style.backgroundRepeat = "no-repeat";
    menuButtonIcon.style.backgroundSize = "contain";
    menuButtonIcon.style.backgroundPosition = "center";
    menuButtonIcon.style.backgroundImage = "url('images/menu.svg')";

    menuButtonBullet.style.borderRadius = menuButtonBullet.style.width = menuButtonBullet.style.height = MENUBUTTON_BULLETSIZE+"px";
    menuButtonBullet.style.backgroundColor = "#f00";
    menuButtonBullet.style.border = MENUBUTTON_BULLETBORDER+"px solid #000";
    menuButtonBullet.style.zIndex = 100;
    menuButtonBullet.style.display = "none";

    toolPaletteIcon.style.backgroundRepeat = "no-repeat";
    toolPaletteIcon.style.backgroundSize = "cover";
    toolPaletteIcon.style.width = TOOLBOX_WIDTH+"px";
    toolPaletteIcon.style.zIndex = 100;
    notificationsNode.style.pointerEvents = menuButtonBullet.style.pointerEvents = menuShade.style.pointerEvents = menuButtonIcon.style.pointerEvents = toolPaletteIcon.style.pointerEvents = toolPalette.style.pointerEvents = penPreview.style.pointerEvents = "none";
    if (Global.IS_SAFARIMOBILE)
        menuShade.style.position = notificationsNode.style.position = toolBox.style.position = menuButton.style.position = "fixed";
    menuShade.style.height = "80px";
    menuShade.style.backgroundImage = "linear-gradient(180deg, rgba(100,100,100,0.5), rgba(100,100,100,0))";

    keyboardTextArea = document.createElement("textarea");
    keyboardInput = document.createElement("input");
    keyboardTextArea.style.resize = "none";
    keyboardInput.style.position = keyboardTextArea.style.position = "absolute";
    keyboardInput.style.padding = keyboardInput.style.margin = keyboardInput.style.border = keyboardTextArea.style.padding = keyboardTextArea.style.margin = keyboardTextArea.style.border = 0;
    keyboardInput.style.outline = keyboardTextArea.style.outline = "none";
    keyboardInput.style.overflow = keyboardTextArea.style.overflow = "hidden";
    keyboardTextArea.setAttribute("spellcheck",false);
    keyboardInput.setAttribute("spellcheck",false);
    keyboardInput.oncontextmenu=(e)=>{
        e.preventDefault();
        e.stopPropagation();
        return false;
    }

    toolBox.appendChild(toolPaletteIcon);
    toolBox.appendChild(penPreview);

    menuButton.appendChild(menuButtonIcon);
    menuButton.append(menuButtonBullet);

    tableBackground.style.transformOrigin="0 0";
    tableBackground.style.transform="scale("+(BACKGROUND_SCALE*Global.SCALE)+")";
    tableBackground.style.left = (LIMIT_X_LOW*Global.SCALE)+"px";
    tableBackground.style.width = ((LIMIT_X_HIGH-LIMIT_X_LOW)/BACKGROUND_SCALE)+"px";
    tableBackground.style.top = (LIMIT_Y_LOW*Global.SCALE)+"px";
    tableBackground.style.height = ((LIMIT_Y_HIGH-LIMIT_Y_LOW)/BACKGROUND_SCALE)+"px";

    if (DEBUG) {
        debugNode = document.createElement("div");
        debugNode.style.position = "absolute";
        debugNode.style.left = debugNode.style.bottom = "0px";
        debugNode.style.zIndex = 50;
        node.appendChild(debugNode);
    }

    node.appendChild(viewportNode);
    node.appendChild(menuShade);
    node.appendChild(notificationsNode);
    node.appendChild(toolBox);
    node.appendChild(menuButton);

    // --- Data structures

    function copyPoint(point) {
        return {
            x:point.x,
            y:point.y,
            pointerId:point.pointerId,
            button:point.button,
            target:point.target,
            isPen:point.isPen,
            isTouch:point.isTouch,
            isMouse:point.isMouse
        };
    }

    // --- Measures

    function formatMeasure(d,precision,addlabel) {
        d = measureUnit.ratio*d;
        if (precision)
            d = Math.floor(d*precision)/precision;
        if (addlabel)
            d+=measureUnit.label;
        return d;
    }

    // --- Colors

    function setTableColor(c) {
        node.style.backgroundColor = viewportNode.style.backgroundColor = c;
    }

    function setTableBackgroundClassName(c) {
        tableBackgroundClassName = c;
        if (c) {
            if (!tableBackground.parentNode)
                if (viewportNode.firstChild)
                    viewportNode.insertBefore(tableBackground,viewportNode.firstChild);
                else
                    viewportNode.appendChild(tableBackground);
            tableBackground.className = c;
        } else
            if (tableBackground.parentNode)
                tableBackground.parentNode.removeChild(tableBackground);
    }

    // --- Notifications

    function addNotification(color,text) {
        let
            notification = document.createElement("div");
        
        notification.className = NOTIFICATION_CLASSNAME;
        notification.style.borderLeftColor = color;
        notification.innerHTML = TRANSLATOR.translate(text);

        notification._timeout = setTimeout(()=>{
            if (notification.parentNode)
                notification.parentNode.removeChild(notification);
        },NOTIFICATION_TIME);
        
        notificationsNode.appendChild(notification);
    }

    // --- Rendering
    
    function updateViewport(time) {
        let
            nodes = viewportNode.childNodes,
            surface,
            animation = false;
        forceRedraw=!forceRedraw;
        dirty.is = false;
        for (let i=0;i<nodes.length;i++) {
            surface = nodes[i]._surface;
            if (surface)
                animation |= surface._updateSurface(time);
        }
        viewportNode.style.transform="translate("+FIXFLOAT(viewport.x)+"px,"+FIXFLOAT(viewport.y)+"px) scale("+FIXFLOAT(viewport.scale)+") rotate("+FIXFLOAT(viewport.angle)+"rad)";
        if (isForceRedraw && forceRedraw)
            node.style.transform = "rotate(0.0001rad)";
        else
            node.style.transform = "";
        if (animation || (isForceRedraw && forceRedraw)) setDirty();
    }

    function setDirty() {
        if (!dirty.is) {
            dirty.is = true;
            window.requestAnimationFrame(updateViewport);
        }
    }

    // --- Debug

    function showDebug(text) {
        if (DEBUG)
            debugNode.innerHTML=text+"<br>"+Math.random();
    }

    // --- Math

    function viewportSurfacePoint(p1,surface,dx,dy) {
        let
            point = viewportVector(
                (p1.x - viewport.x + dx)/Global.SCALE,
                (p1.y - viewport.y + dy)/Global.SCALE,
                surface.x, surface.y
            );

        point.isMouse = p1.isMouse;
        point.isPen = p1.isPen;
        point.isTouch = p1.isTouch;
        point.button = p1.button;
        point.pointerId = p1.pointerId;
        return point;
    }
    
    function viewportPoint(p1) {
        return viewportVector(
            p1.x - viewport.x,
            p1.y - viewport.y,
            0,0
        );
    }

    function viewportVector(dx,dy,rdx,rdy) {
        let
            angle = viewport.angle,
            x = dx / viewport.scale,
            y = dy / viewport.scale,
            cos = Math.cos(angle),
            sin = Math.sin(angle);

        return {
            x:(cos * x) + (sin * y) - rdx,
            y:(cos * y) - (sin * x) - rdy
        };
    }

    function viewportApplyXYLimits() {
        let
            tableX = viewport.x/viewport.scale,
            tableY = viewport.y/viewport.scale;

        if (tableX < SCALED_LIMIT_X_LOW) viewport.x = SCALED_LIMIT_X_LOW*viewport.scale;
        if (tableX > SCALED_LIMIT_X_HIGH) viewport.x = SCALED_LIMIT_X_HIGH*viewport.scale;
        if (tableY < SCALED_LIMIT_Y_LOW) viewport.y = SCALED_LIMIT_Y_LOW*viewport.scale;
        if (tableY > SCALED_LIMIT_Y_HIGH) viewport.y = SCALED_LIMIT_Y_HIGH*viewport.scale;
    }

    function viewportPan(fromViewport,dx,dy) {
        viewport.x=fromViewport.x+dx;
        viewport.y=fromViewport.y+dy;

        viewportApplyXYLimits();
    }

    function viewportTransform(fromViewport,center,angle,scale,dx,dy) {

        let
            originDistance = getDistance(fromViewport,center),
            originAngle = getAngle(fromViewport,center),
            newScale = fromViewport.scale*scale;

        if (newScale > LIMIT_SCALE_HIGH) newScale = LIMIT_SCALE_HIGH;
        if (newScale < LIMIT_SCALE_LOW) newScale = LIMIT_SCALE_LOW;
        scale = newScale/fromViewport.scale;

        viewport.scale= newScale;
        viewport.angle=fromViewport.angle+angle;
        viewport.x=center.x+dx-Math.cos(originAngle+angle)*originDistance*scale;
        viewport.y=center.y+dy-Math.sin(originAngle+angle)*originDistance*scale;

        viewportApplyXYLimits();

    }

    function getSurfacesByTag(tags) {

        let
            childNodes = viewportNode.childNodes,
            out = [];

        for (let i=0;i<childNodes.length;i++) {

            let
                surface = childNodes[i]._surface;

            if (surface && surface.hasTag(tags))
                out.push(surface);

        }

        return out;
        
    }

    function getSurfaceAtPoint(list,p1,draggableOnly,simpleDragOnly,all,scale,margin) {

        let
            x = p1.x / scale,
            y = p1.y / scale,
            childNodes = viewportNode.childNodes,
            foundSurface = 0,
            scaledMargin = margin / viewport.scale / scale;

        for (let i=0;i<childNodes.length;i++) {

            let
                surface = childNodes[i]._surface;

            if (surface) {

                if ((!draggableOnly || surface.isDraggable) && (!simpleDragOnly || surface.isSimpleDrag) && surface.isPointInside(x,y,scaledMargin))
                    if (all)
                        list.push(surface);
                    else
                        foundSurface = surface;

            }

        }

        if (foundSurface)
            list.push(foundSurface);

        return list;
        
    }

    function addIntersectingSurfaces(to,surface) {

        let
            node = surface.node;

        while (node = node.nextSibling) {

            let
                toSurface = node._surface;

            if (toSurface && (to.indexOf(toSurface) == -1) && surface.isCollidingWithSurface(toSurface))
                to.push(toSurface);

        }

        return to;
        
    }

    function getCenter(p1,p2) {
        return {
            x:(p2.x+p1.x)/2,
            y:(p2.y+p1.y)/2,
            timeStamp:Math.max(p1.timeStamp,p2.timeStamp)
        }
    }

    function getDistance(p1,p2) {
        let
            dx = p2.x-p1.x,
            dy = p2.y-p1.y;
        return Math.sqrt(dx*dx+dy*dy);
    }

    function getAngle(p1,p2) {
        return Math.atan2(p2.y-p1.y,p2.x-p1.x);
    }

    function modulo(a,n) {
        return ( a % n + n ) % n;
    }

    function getDeltaAngle(a1,a2) {
        return modulo((a2 - a1) + Math.PI, TAU) - Math.PI;
    }

    // --- Coordinate picker

    function onCoordinatePicker(c) {
        interaction.pickerPoint = viewportSurfacePoint(c, interaction.forSurface, 0, c.isTouch ? interaction.pickerDy : 0);
        if (interaction.pickerStarted) {
            if (interaction.forSurface.onCoordinatePickerMove)
                interaction.forSurface.onCoordinatePickerMove(interaction.pickerPoint);
        } else {
            interaction.pickerStarted = true;
            if (interaction.forSurface.onCoordinatePickerStart)
                interaction.forSurface.onCoordinatePickerStart(interaction.pickerPoint);
        }
    }

    function onCoordinatePickerEnd(c) {
        if (c)
            interaction.pickerPoint = viewportSurfacePoint(c, interaction.forSurface, 0, c.isTouch ? interaction.pickerDy : 0);
        if (interaction.forSurface.onCoordinatePickerEnd)
            interaction.forSurface.onCoordinatePickerEnd(interaction.pickerPoint);
        interaction.pickerStarted = false;
        interaction.forSurface = 0;
    }

    function startCoordinatePicker(surface,config) {
        let
            prevMode = interaction.mode;
        interaction.mode = MODE_PICKER;
        interaction.forSurface = surface;
        interaction.pickerDy = config && config.touchDelta ? TOUCH_DELTA : 0;
        if (prevMode && interaction.from[0])
            onCoordinatePicker(interaction.from[0]);
    }

    // --- Tools

    function applyToolOptionStyle(node,optionData) {

        if (optionData.image)
            node.style.backgroundImage = "url('"+optionData.image+"')";
        else
            node.style.backgroundImage = "";

        if (optionData.hexDisplayColor)
            node.style.backgroundColor = optionData.hexDisplayColor;
        else
            node.style.backgroundColor = "transparent";

        node.style.borderRadius = node.style.height = node.style.width = optionData.displaySize+"px";
        node.style.left = node.style.marginTop = ((TOOLBOX_WIDTH-optionData.displaySize-TOOLBOX_PENPREVIEW_BORDER*2)/2)+"px";
        node.style.border = TOOLBOX_PENPREVIEW_BORDER+"px solid #000";

    }

    function showToolboxOptions() {
        toolPalette.innerHTML="";
        toolboxOptionHeight = Math.min((node.clientHeight-TOOLBOX_HEIGHT-TOOLBOX_PENPREVIEW_MAXSIZE)/tool.toolData.options.length,TOOLBOX_OPTIONHEIGHT_MAXSIZE);

        tool.toolData.options.forEach((option,id)=>{
            let
                node = document.createElement("div"),
                preview = document.createElement("div");

            preview.style.position = node.style.position = "absolute";
            node.style.left = "0px";
            node.style.top = (id*toolboxOptionHeight)+"px";
            node.style.width = TOOLBOX_WIDTH+"px";
            node.style.height = toolboxOptionHeight+"px";
            preview.style.top = "0px";

            applyToolOptionStyle(preview,option);

            node.appendChild(preview);
            toolPalette.appendChild(node);

        });

        toolBox.appendChild(toolPalette);

    }

    function hideToolboxOptions() {
        toolPalette.innerHTML="";
        if (toolPalette.parentNode)
            toolPalette.parentNode.removeChild(toolPalette);
    }

    function toolboxChanged(initialize) {
        toolPaletteIcon.style.backgroundImage="url("+tool.toolData.icon+")";
        toolPaletteIcon.style.zIndex=tool.toolData.iconZindex;
        applyToolOptionStyle(penPreview,tool.optionData);
        if (!initialize)
            broadcastEvent(table,EVENT_TOOLCHANGED);
    }

    function setTool(id, initialize) {

        let
            doBroadcast = id != tool.id,
            toolData = tools[id],
            option = tool.defaultOptions[id] || 0,
            optionData = toolData.options[option];
            
        tool.id = id;
        tool.toolData = toolData;
        tool.option = option;
        tool.optionData = optionData;

        if (doBroadcast || initialize)
            toolboxChanged(initialize);

    }

    function setToolOption(id) {

        let
            doBroadcast = tool.option != id;

        tool.option = id;
        tool.optionData =  tool.toolData.options[id];
        tool.defaultOptions[tool.id] = id;

        if (doBroadcast)
            toolboxChanged();

    }

    function setNextTool() {
        setTool((tool.id + 1) % tools.length);
    }

    function setNextToolOption() {
        setToolOption((tool.option+1)%tools[tool.id].options.length);
    }

    // --- Bullet

    function setMenuBullet(b) {
        menuButtonBullet.style.display = b ? "block" : "none";
    }

    // --- Locking

    function resetInput(soft) {
        keyboard.length = 0;
        touches.length = 0;
        touchesById = {};
        modifiers.shift = false;
        modifiers.ctrl = false;
        if (soft)
            interaction.mode = MODE_NONE;
        else
            interaction = { mode:MODE_NONE };
    }

    function setLock(l) {
        if (l) {
            isUnlocked = false;
            stopHoldTimer();
            interaction.mode = MODE_NONE;
        } else {
            isUnlocked = true;
        }
    }

    function closeMenu() {
        resetInput();
        setLock(false);
    }

    function openMenu(arg) {
        resetInput();
        if (menuAction(node,closeMenu,arg))
            setLock(true);
        else
            setLock(false);
    }

    // --- Hold timer

    function stopHoldTimer() {
        if (holdTimer)
            clearTimeout(holdTimer);
        holdTimer = 0;
    }

    function startHoldTimer() {
        stopHoldTimer();
        holdTimer = setTimeout(()=>{
            pointerHolding();
            stopHoldTimer();
        },HOLDTIMER_TIME)
    }

    // --- Shake detector

    function resetGestureDetector(point) {
        shakeDetector.distanceThreshold = Math.min(node.clientWidth,node.clientHeight)/SHAKE_AREARATIO;
        shakeDetector.speedThreshold = shakeDetector.distanceThreshold / 300;
        shakeDetector.timeStamp = 0;
        shakeDetector.ready = true;
        shakeDetector.timeFast = 0;
    }

    function detectGesture(point,surfaces) {      
        
        if (shakeDetector.ready) {

            let
                timegap = point.timeStamp - shakeDetector.timeStamp;

            if (shakeDetector.timeStamp) {

                shakeDetector.timeStamp = point.timeStamp;

                shakeDetector.x1 = Math.min(point.x,shakeDetector.x1);
                shakeDetector.y1 = Math.min(point.y,shakeDetector.y1);
                shakeDetector.x2 = Math.max(point.x,shakeDetector.x2);
                shakeDetector.y2 = Math.max(point.y,shakeDetector.y2);

                // On moving too far...
                if (
                    ((shakeDetector.x2 - shakeDetector.x1) > shakeDetector.distanceThreshold) ||
                    ((shakeDetector.y2 - shakeDetector.y1) > shakeDetector.distanceThreshold)
                )
                    resetGestureDetector();
                else {

                    shakeDetector.time += timegap;

                    // Or taking too long...
                    if (shakeDetector.time > SHAKE_TIME)
                        resetGestureDetector();
                    else {

                        shakeDetector.distance += getDistance(point,shakeDetector.lastPoint);
                        shakeDetector.lastPoint = copyPoint(point);

                        let
                            speed = shakeDetector.distance/shakeDetector.time;

                        // On moving too slow...
                        if (speed > shakeDetector.speedThreshold ) {
                            shakeDetector.timeFast += timegap;
                            if (shakeDetector.timeFast > SHAKE_DURATION) {
                                surfaces.forEach(surface=>{
                                    if (surface && surface.onShake)
                                        surface.onShake(true);
                                })
                                shakeDetector.ready = false;
                            }
                        }

                    }
                
                }
            
            } else {

                shakeDetector.timeStamp = point.timeStamp;
                shakeDetector.lastPoint = copyPoint(point);
                shakeDetector.x1 = shakeDetector.x2 = point.x;
                shakeDetector.y1 = shakeDetector.y2 = point.y;
                shakeDetector.timeFast = 0;
                shakeDetector.time = 0;
                shakeDetector.distance = 0;

            }

        }

    }

    // --- Surface selection

    function selectInteractionSurface(surfaces,c,movetotop) {
        for (let i=0;i<surfaces.length;i++) {
            let
                surface = surfaces[i];
            if (surface.isDragTopSurfaces)
                addIntersectingSurfaces(surfaces,surface);
        }
        
        interaction.surfaces = surfaces;
        interaction.surfacesPosition=surfaces.map((surface,id)=>{
            surface._setHighlight(true,id);
            if (movetotop && surface.isVariableZIndex)
                surface.moveToTop();
            return { x:surface.x, y:surface.y };
        });

        if (c && surfaces[0] && surfaces[0].onSelect)
            surfaces[0].onSelect(viewportSurfacePoint(c, surfaces[0], 0, 0),modifiers);

        resetGestureDetector();
    }

    function addSelectInteractionSurface(surface) {
        if (interaction.surfaces && (interaction.surfaces.indexOf(surface) == -1)) {
            let
                dx = 0,
                dy = 0;
            if (interaction.lastVector) {
                dx = interaction.lastVector.x/Global.SCALE;
                dy = interaction.lastVector.y/Global.SCALE;
            }
            interaction.surfaces.push(surface);
            surface._setHighlight(true,interaction.surfaces.length-1);
            if (surface.isVariableZIndex)
                surface.moveToTop();
            interaction.surfacesPosition.push({ x:surface.x-dx, y:surface.y-dy });
        }
    }

    function unselectSurface(surface) {
        let
            index = interaction.surfaces ? interaction.surfaces.indexOf(surface) : -1,
            draggableIndex = interaction.draggableSurfaces ? interaction.draggableSurfaces.indexOf(surface) : -1;
        surface._setHighlight(false);
        if (surface.onDrop)
            surface.onDrop(table);
        broadcastEvent(surface,EVENT_ENDINTERACTION);
        if (index != -1)
            interaction.surfaces.splice(index,1);
        if (draggableIndex != -1)
            interaction.draggableSurfaces.splice(draggableIndex,1);
    }

    function unselectInteractionSurface(drop) {
        let
            tiltX = 0,
            tiltY = 0;

        if (drop) {
            if (interaction.surfaces[0].onDrop) {
                let
                    surface = interaction.surfaces[0],
                    ox = surface.x,
                    oy = surface.y;
                    
                surface.onDrop(table);
                
                tiltX = surface.x - ox;
                tiltY = surface.y - oy;

                if (!tiltX && !tiltY) drop = false;
            } else
                drop = false;
        }
        interaction.surfaces.forEach((surface,id)=>{
            surface._setHighlight(false);
            if (drop && id)
                surface.setPosition(surface.x+tiltX,surface.y+tiltY);
            broadcastEvent(surface,EVENT_ENDINTERACTION);
        });
    }

    function moveInteractionSurface(vector) {
        interaction.surfaces.forEach((surface,id)=>{
            surface.setPosition(
                Math.min(Math.max(interaction.surfacesPosition[id].x+(vector.x/Global.SCALE),LIMIT_X_LOW),LIMIT_X_HIGH),
                Math.min(Math.max(interaction.surfacesPosition[id].y+(vector.y/Global.SCALE),LIMIT_Y_LOW),LIMIT_Y_HIGH),
                true
            );
        });
    }

    // --- Surface events

    function broadcastEvent(from,e) {

        if (from.type && onEventTypesIndex[from.type])
            onEventTypesIndex[from.type].forEach(surface=>{
                surface.onEvent(from,e,table);
            });

        if (eventListener)
            eventListener(from,e,table);
    }

    function broadcastUpdate() {
        let
            childNodes = viewportNode.childNodes;

        for (let i=0;i<childNodes.length;i++) {

            let node = childNodes[i];
            if (node._surface && node._surface.onUpdate)
                node._surface.onUpdate(table);

        }

        setDirty();

    }

    // --- Viewport tools

    function resetAngle() {
        let
            clientWidth = node.clientWidth,
            clientHeight = node.clientHeight;
        viewportTransform(
            viewport,
            {
                x:clientWidth/2,
                y:clientHeight/2
            },
            -viewport.angle,
            1,0,0
        );
        setDirty();
    }

    function frameTable() {
        let
            surface,
            area = { x1:0, y1:0, x2:0, y2:0 },
            areaWidth,
            areaHeight,
            topBorder,
            leftBorder,
            scale,
            clientWidth = node.clientWidth,
            clientHeight = node.clientHeight,
            frameWidth = clientWidth - FRAME_MARGIN,
            frameHeight = clientHeight - FRAME_MARGIN,
            nodes = viewportNode.childNodes;

        for (let i=0;i<nodes.length;i++) {
            surface = nodes[i]._surface;
            if (surface && !surface.doNotFrame) {
                area.x1 = Math.min(area.x1, surface.x*Global.SCALE);
                area.y1 = Math.min(area.y1, surface.y*Global.SCALE);
                area.x2 = Math.max(area.x2, (surface.x+surface.width)*Global.SCALE);
                area.y2 = Math.max(area.y2, (surface.y+surface.height)*Global.SCALE);
            }
        }
        
        areaWidth = area.x2-area.x1;
        areaHeight = area.y2-area.y1;
        scale = Math.max(Math.min(frameWidth/areaWidth,frameHeight/areaHeight,LIMIT_SCALE_HIGH),LIMIT_SCALE_LOW);
        topBorder = (clientHeight-(areaHeight*scale))/2;
        leftBorder = (clientWidth-(areaWidth*scale))/2;
        viewport.scale = scale;
        viewport.x = area.x1*-scale+leftBorder;
        viewport.y = area.y1*-scale+topBorder;
        viewport.angle = 0;
        viewportApplyXYLimits();
        setDirty();
    }

    // --- Keyboard input

    function startKeyboardInput(point) {
        let
            surfaces = getSurfaceAtPoint([],viewportPoint(point),false,false,true,Global.SCALE,0);

        for (let i=0;i<surfaces.length;i++) {
            if (surfaces[i].onTextInputRequest) {
                let
                    surface = surfaces[i],
                    data = Global.clone(KEYBOARD_INPUT_DATA),
                    surfacePoint = viewportSurfacePoint(point, surfaces[i], 0, 0);
                data.surface = surface;
                data.x = surfacePoint.x;
                data.y = surfacePoint.y;
                data.width = surface.width-surfacePoint.x;
                data.height = surface.height-surfacePoint.y;
                data.color = tool.optionData.hexColor || "#000";
                data = surface.onTextInputRequest(data,tool,surfacePoint,modifiers);
                if (data && (data.width > KEYBOARD_INPUT_MIN_WIDTH) && (data.height > KEYBOARD_INPUT_MIN_HEIGHT)) {
                    if (!isKeyboardWritingClosed) endKeyboardInput();
                    keyboardWidget = data.multiline ? keyboardTextArea : keyboardInput;
                    isKeyboardWritingClosed = false;
                    keyboardWidget.value = "";
                    keyboardWidget.style.left = ((surface.x + data.x)*Global.SCALE)+"px";
                    keyboardWidget.style.top = ((surface.y + data.y)*Global.SCALE)+"px";
                    keyboardWidget.style.width = (data.width*Global.SCALE)+"px";
                    keyboardWidget.style.height = (data.height*Global.SCALE)+"px";
                    keyboardWidget.style.fontFamily = data.fontFamily;
                    keyboardWidget.style.fontSize = (data.fontSize*Global.SCALE)+"px";
                    keyboardWidget.style.lineHeight = (data.lineHeight*Global.SCALE)+"px";
                    keyboardWidget.style.textAlign = data.align;
                    keyboardWidget.style.color = data.color;
                    keyboardWidget.style.backgroundColor = data.backgroundColor;
                    viewportNode.appendChild(keyboardWidget);
                    keyboardWidget.focus();
                    keyboardAreaData = data;
                    return true;
                }
                break;
            }
        }

    }

    function endKeyboardInput() {
        if (keyboardAreaData.surface && keyboardAreaData.surface.onTextInput) {
            keyboardAreaData.text = keyboardWidget.value;
            keyboardAreaData.surface.onTextInput(keyboardAreaData,tool);
        }
        if (keyboardWidget.parentNode)
            keyboardWidget.parentNode.removeChild(keyboardWidget);
        isKeyboardWritingClosed = true;
        keyboardAreaData = false;
        root.removeChild(node);
        root.clientWidth; // Force view measure
        root.appendChild(node);
        setInteractionMode(MODE_NONE);
    }

    // --- Virtual events
    
    function startSurfaceInteraction(p1) {
        interaction.surfaces.forEach(surface=>{
            if (surface.onStartInteraction)
                surface.onStartInteraction(viewportSurfacePoint(p1, surface, 0, 0),tool,modifiers);
        });
    }

    function doSurfaceInteraction(p1) {
        interaction.surfaces.forEach(surface=>{
            if (surface.onInteraction)
                surface.onInteraction(viewportSurfacePoint(p1, surface, 0, 0),tool,modifiers);
        });
    }

    function endSurfaceInteraction() {
        interaction.surfaces.forEach(surface=>{
            if (surface.onEndInteraction)
                surface.onEndInteraction(tool,modifiers);
        });
    }

    function doFlushInteractionCache() {
        if (interaction.data && interaction.data.cache) {
            interaction.data.cache.forEach((p1,id)=>{
                if (id)
                    doSurfaceInteraction(p1);
                else
                    startSurfaceInteraction(p1);
            });
            interaction.data.cache.length = 0;
        }
    }

    function startDragSurfaces(mode,c) {
        if (interaction.draggableSurfaces[0]) {
            interaction.mode=mode;
            selectInteractionSurface(interaction.draggableSurfaces,c,true);
            return true;
        } else
            return false;
    }

    function setInteractionMode(mode) {
        endInteractionMode(mode);
        delete interaction.data;
        delete interaction.isLastInteraction;
        delete interaction.lastVector;
        interaction.startViewport = Global.clone(viewport);
        switch (interaction.mode) {
            case MODE_DRAG:{
                interaction.margin = touchesById[touches[0]].isTouch ? SIMPLEDRAG_MARGIN_LARGE : SIMPLEDRAG_MARGIN_SMALL;
                interaction.from = [copyPoint(touchesById[touches[0]])];
                interaction.surfaces = getSurfaceAtPoint([],viewportPoint(interaction.from[0]),false,false,false,Global.SCALE,interaction.margin);
                interaction.draggableSurfaces = getSurfaceAtPoint([],viewportPoint(interaction.from[0]),true,true,modifiers.shift,Global.SCALE,interaction.margin);
                interaction.startTimestamp = Date.now();
                interaction.cancelClick = false;
                switch (interaction.from[0].target) {
                    case TARGET_VIEWPORT:{
                        switch (pointerMode) {
                            case POINTERMODE_FINGER:{
                                if (interaction.surfaces[0])
                                    startHoldTimer();
                                else
                                    interaction.mode = MODE_DRAG_VIEWPORT;
                                break;
                            }
                            case POINTERMODE_TOUCHDIGITALPEN:
                            case POINTERMODE_DIGITALPEN:
                            case POINTERMODE_PEN:{
                                if (
                                    (pointerMode == POINTERMODE_PEN) || 
                                    ((pointerMode == POINTERMODE_TOUCHDIGITALPEN) || interaction.from[0].isPen)
                                    || (interaction.from[0].button == MOUSEBUTTON_RIGHT)
                                )
                                    if (interaction.surfaces[0] && (interaction.from[0].button === MOUSEBUTTON_LEFT)) {
                                        if (interaction.surfaces[0].isSimpleDrag) {
                                            if (interaction.surfaces[0].hasContextMenu()) {
                                                interaction.mode = MODE_DRAG_SIMPLE;
                                                startHoldTimer();
                                                selectInteractionSurface(interaction.surfaces,interaction.from[0]);
                                            } else if (!startDragSurfaces(MODE_DRAG_SURFACE,interaction.from[0]))
                                                interaction.mode = MODE_DRAG_VIEWPORT;
                                        } else if ((pointerMode == POINTERMODE_PEN) || interaction.from[0].isPen) {
                                            interaction.mode = MODE_DRAG_PREPAREINTERACT;
                                            interaction.data = { cache: [ interaction.from[0] ] };
                                        } else
                                            interaction.mode = MODE_NONE;
                                    } else if ((pointerMode == POINTERMODE_TOUCHDIGITALPEN) || (pointerMode == POINTERMODE_DIGITALPEN))
                                        interaction.mode = MODE_NONE;
                                    else
                                        interaction.mode = MODE_DRAG_VIEWPORT;
                                else
                                    interaction.mode = MODE_NONE;
                                break;
                            }
                        }
                        break;
                    }
                    case TARGET_TOOLBOX:{
                        if ((interaction.from[0].button === MOUSEBUTTON_RIGHT))
                            interaction.mode = MODE_DRAG_TOOLBOX_OPTION;
                        else {
                            startHoldTimer();
                            interaction.mode = MODE_DRAG_TOOLBOX;
                        }
                        break;
                    }
                    case TARGET_MENUBUTTON:{
                        if (menuAction)
                            openMenu();
                        break;
                    }
                }
                break;
            }
            case MODE_PINCH:{
                interaction.from = [copyPoint(touchesById[touches[0]]),copyPoint(touchesById[touches[1]])];
                interaction.margin = SIMPLEDRAG_MARGIN_SMALL;
                interaction.data={
                    fromCenter:getCenter(interaction.from[0],interaction.from[1]),
                    fromAngle:getAngle(interaction.from[0],interaction.from[1]),
                    fromDistance:getDistance(interaction.from[0],interaction.from[1])
                }
                interaction.data.rotateAngle = interaction.data.fromAngle;
                switch (pointerMode) {
                    case POINTERMODE_FINGER:{
                        interaction.mode = MODE_PINCH_VIEWPORT;
                        break;
                    }
                    case POINTERMODE_TOUCHDIGITALPEN:
                    case POINTERMODE_DIGITALPEN:
                    case POINTERMODE_PEN:{
                        if ((pointerMode == POINTERMODE_PEN) || !interaction.from[0].isPen) {
                            interaction.draggableSurfaces = getSurfaceAtPoint([],viewportPoint(interaction.data.fromCenter),true,true,true,Global.SCALE,interaction.margin);
                            if (interaction.draggableSurfaces[0])
                                startHoldTimer();
                            else
                                interaction.mode = isPalmTricks ? MODE_PINCH : MODE_PINCH_VIEWPORT;
                        } else
                            interaction.mode = MODE_NONE;
                        break;
                    }
                }
                
                break;
            }
            case MODE_PICKER:{
                interaction.from = [copyPoint(touchesById[touches[0]])];
                onCoordinatePicker(interaction.from[0]);
                break;
            }
        }
    }

    function isInteractionClick() {
        return !interaction.cancelClick && (Date.now() - interaction.startTimestamp < CLICKTIMER_TIME);
    }

    function checkClick(c) {
        if (isInteractionClick()) {
            let
                surface = interaction.surfaces[0];
            if (modifiers.ctrl && surface.specialAction)
                surface.onMenuOption(surface.specialAction,modifiers);
            else if (surface.onClick)
                surface.onClick(viewportSurfacePoint(c, surface, 0, 0),modifiers);
        }

    }

    function endInteractionMode(newmode) {
        switch (interaction.mode) {
            case MODE_DRAG_SURFACE:{
                checkClick(interaction.from[0]);
                unselectInteractionSurface(true);
                if (interaction.isLastInteraction)
                    newmode = MODE_PINCH_WAITNEXTPINCH;
                break;
            }
            case MODE_DRAG_TOOLBOX:{
                if (!modifiers.shift)
                    setNextTool();
                break;
            }
            case MODE_DRAG_TOOLBOX_OPTION:{
                if (!modifiers.shift)
                    setNextToolOption();
                break;
            }
            case MODE_DRAG_TOOLBOX_MENU:{
                hideToolboxOptions();
                break;
            }
            case MODE_DRAG_SIMPLE:{
                checkClick(interaction.from[0]);
                unselectInteractionSurface();
                break;
            }
            case MODE_PINCH_SURFACE:{
                unselectInteractionSurface(true);
                newmode = MODE_PINCH_WAITNEXTPINCH;
                break;
            }
            case MODE_PINCH:
            case MODE_PINCH_VIEWPORT:{
                newmode = MODE_PINCH_WAITNEXTPINCH;
                break;
            }
            case MODE_DRAG_INTERACT:{
                endSurfaceInteraction();
                break;
            }
            case MODE_DRAG_PREPAREINTERACT:{
                checkClick(interaction.from[0]);
                if ((newmode != MODE_PINCH) && (newmode != MODE_PINCH_SURFACE)) {
                    doFlushInteractionCache();
                    endSurfaceInteraction();
                }
                break;
            }
            case MODE_PINCH_WAITNEXTPINCH:{
                if ((newmode != MODE_PINCH) && (touches.length != 0))
                    newmode = MODE_PINCH_WAITNEXTPINCH;
                break;
            }
            case MODE_WAIT_NOTOUCH:{
                newmode = MODE_WAIT_NOTOUCH;
                if (touches.length == 0)
                    setTimeout(()=>{
                        resetInput(true);
                    },1)
                break;
            }
            case MODE_DRAG_VIEWPORT:{
                if (isKeyboardWriting && (interaction.from[0].button == MOUSEBUTTON_RIGHT) && isInteractionClick() && startKeyboardInput(interaction.from[0])) {
                    resetInput();
                    newmode = MODE_KEYBOARD_INPUT;
                }
                break;
            }
            case MODE_PICKER:{
                if (interaction.pickerStarted) {
                    onCoordinatePickerEnd();
                    unselectInteractionSurface();
                    if (touches.length == 0)
                        newmode = MODE_NONE;
                    else
                        newmode = MODE_WAIT_NOTOUCH;
                } else
                    newmode = MODE_PICKER;
                break;
            }
        }

        interaction.mode = newmode;
    }

    function interactionChange() {
        switch (touches.length) {
            case 1:{
                if (touchesById[touches[touches.length-1]].button === MOUSEBUTTON_MIDDLE) {
                    frameTable();
                    setInteractionMode(MODE_NONE);
                } else
                    setInteractionMode(MODE_DRAG);
                break;
            }
            case 2:{
                setInteractionMode(MODE_PINCH);
                break;
            }
            case 3:{
                frameTable();
                setInteractionMode(MODE_NONE);
            }
            default:{
                setInteractionMode(MODE_NONE);
            }
        }

    }


    function pointerDown(e,pointerId) {
        if (!touchesById[pointerId]) {
            touchesById[pointerId] = {
                x: e.clientX, y:e.clientY, timeStamp:e.timeStamp, pointerId:pointerId, button:e.button,
                target: e.target == toolBox ? TARGET_TOOLBOX : e.target == menuButton ? TARGET_MENUBUTTON : TARGET_VIEWPORT,
                isPen : Global.isPenEvent(e),
                isMouse : e.pointerType == "mouse",
                isTouch : e.pointerType == "touch"
            };
            touches.push(pointerId);
            interactionChange();
        }
    }

    function pointerHolding() {
        switch (interaction.mode) {
            case MODE_DRAG:{
                switch (pointerMode) {
                    case POINTERMODE_FINGER:{
                        startDragSurfaces(MODE_DRAG_SURFACE);
                        break;
                    }
                }
                break;
            }
            case MODE_DRAG_SIMPLE:{
                if (interaction.surfaces[0].hasContextMenu() && !openContextMenu(interaction.surfaces[0],interaction.from[0]))
                    if (interaction.mode == MODE_DRAG_SIMPLE)
                        startDragSurfaces(MODE_DRAG_SURFACE);
                break;
            }
            case MODE_DRAG_TOOLBOX:{
                interaction.mode=MODE_DRAG_TOOLBOX_MENU;
                showToolboxOptions();
                break;
            }
            case MODE_PINCH:{
                switch (pointerMode) {
                    case POINTERMODE_TOUCHDIGITALPEN:
                    case POINTERMODE_DIGITALPEN:
                    case POINTERMODE_PEN:{
                        startDragSurfaces(MODE_PINCH_SURFACE);
                        interaction.isLastInteraction = true;
                        break;
                    }
                }
                break;
            }
        }
    }

    function pointerUp(e,pointerId) {
        if (touchesById[pointerId]) {
            touches.splice(touches.indexOf(pointerId),1);
            delete touchesById[pointerId];
            interactionChange();
        }
    }

    function pointerHover(e) {
        if (!hovering) hovering = {};
        hovering.x = e.clientX;
        hovering.y = e.clientY;
        hovering.isMouse = e.pointerType == "mouse";
        hovering.timeStamp = e.timeStamp;
    }

    function pointerWheel(e) {

        switch (interaction.mode) {
            case MODE_NONE:{
                if (!hovering)
                    pointerHover(e);

                viewportTransform(
                    viewport,
                    hovering,
                    0,
                    1 - (MOUSE_WHEELDELTA*e.deltaY/100),
                    0,0
                );

                setDirty();
                break;
            }
        }
        
    }

    function pointerMove(e,pointerId) {
        
        let
            to = [];

        touchesById[pointerId].x = e.clientX;
        touchesById[pointerId].y = e.clientY;
        touchesById[pointerId].timeStamp = e.timeStamp;

        interaction.from.forEach(fromPointer=>{
            to.push(touchesById[fromPointer.pointerId]);
        });

        switch (interaction.mode) {
            case MODE_DRAG_VIEWPORT:
            case MODE_DRAG:{

                if (interaction.mode == MODE_DRAG) {

                    let
                        dist = getDistance(interaction.from[0],to[0]);

                    if (dist > holdtimerDistance) {
                        stopHoldTimer();
                        interaction.mode = MODE_DRAG_VIEWPORT;
                    }

                }

                if (interaction.mode == MODE_DRAG_VIEWPORT) {

                    let
                        dx = to[0].x-interaction.from[0].x,
                        dy = to[0].y-interaction.from[0].y;


                    viewportPan(interaction.startViewport,dx,dy);

                    setDirty();

                }

                break;
            }
            case MODE_DRAG_SURFACE:{

                let
                    dist = getDistance(interaction.from[0],to[0]);

                if (dist > holdtimerDistance)
                    interaction.cancelClick = true;

                interaction.lastVector = viewportVector(
                    to[0].x-interaction.from[0].x,
                    to[0].y-interaction.from[0].y,
                    0,0
                );

                moveInteractionSurface(interaction.lastVector);
                detectGesture(to[0],interaction.surfaces);
                
                break;
            }
            case MODE_DRAG_PREPAREINTERACT:{

                let
                    endCache;

                interaction.data.cache.push(copyPoint(to[0]));

                if (interaction.data.cache.length>=INTERACTIONCACHE_SIZE) {
                    interaction.cancelClick = true;
                    endCache = true;
                } else {

                    let
                        dist = getDistance(interaction.from[0],to[0]);

                    if (dist > holdtimerDistance) {
                        endCache = true;
                        interaction.cancelClick = true;
                    }

                }

                if (endCache) {
                    doFlushInteractionCache();
                    interaction.mode = MODE_DRAG_INTERACT;
                }                
                break;
            }
            case MODE_DRAG_INTERACT:{
                doSurfaceInteraction(to[0]);
                break;
            }
            case MODE_DRAG_TOOLBOX_MENU:{
                let
                    option = Math.floor((to[0].y-TOOLBOX_HEIGHT)/toolboxOptionHeight);
                if (tool.toolData.options[option])
                    setToolOption(option);
                break;
            }
            case MODE_DRAG_SIMPLE:{
                let
                    dist = getDistance(interaction.from[0],to[0]);

                if (dist > holdtimerDistance) {
                    stopHoldTimer();
                    startDragSurfaces(MODE_DRAG_SURFACE);
                }
                break;
            }
            case MODE_PINCH_VIEWPORT:
            case MODE_PINCH:{
                let
                    toAngle = getAngle(to[0],to[1]),
                    toDistance = getDistance(to[0],to[1]),
                    toCenter = getCenter(to[0],to[1]);

                if (interaction.mode == MODE_PINCH) {

                    let
                        distAngle = Math.abs(toAngle-interaction.data.fromAngle),
                        dist = Math.max(
                            getDistance(interaction.data.fromCenter,toCenter),
                            Math.abs(interaction.data.fromDistance - toDistance)
                        );

                    if ((dist > holdtimerDistancePinch) || (distAngle > holdtimerDistanceAngle)) {
                        stopHoldTimer();
                        interaction.mode = MODE_PINCH_VIEWPORT;
                    }

                }

                if (interaction.mode == MODE_PINCH_VIEWPORT) {

                    viewportTransform(
                        interaction.startViewport,
                        interaction.data.fromCenter,
                        isRotationEnabled ? toAngle-interaction.data.fromAngle : 0,
                        interaction.data.fromDistance ? toDistance/interaction.data.fromDistance : 1,
                        toCenter.x-interaction.data.fromCenter.x,
                        toCenter.y-interaction.data.fromCenter.y
                    );

                    setDirty();

                }

                break;
            }
            case MODE_PINCH_SURFACE:{

                let
                    toCenter = getCenter(to[0],to[1]),
                    toAngle = getAngle(to[0],to[1]),
                    angleDelta = getDeltaAngle(interaction.data.rotateAngle,toAngle);

                interaction.lastVector = viewportVector(
                    toCenter.x-interaction.data.fromCenter.x,
                    toCenter.y-interaction.data.fromCenter.y,
                    0,0
                );

                moveInteractionSurface(interaction.lastVector);
                detectGesture(toCenter,interaction.surfaces);

                if (Math.abs(angleDelta) > ROTATION_ANGLE) {
                    rotateSelection(angleDelta > 0 ? 1 : -1);
                    interaction.data.rotateAngle = toAngle;
                }

                break;
            }
            case MODE_PICKER:{
                onCoordinatePicker(to[0]);
                break;
            }
        }

    }

    // --- Context menu

    function openContextMenu(surface,position) {
        let
            addEllipsis = false,
            labelNodes = [],
            clientWidth = node.clientWidth,
            clientHeight = node.clientHeight,
            areaWidth = clientWidth-(CONTEXTMENU_BORDER*2),
            areaRight = clientWidth-CONTEXTMENU_BORDER,
            areaHeight = clientHeight-(CONTEXTMENU_BORDER*2)-CONTEXTMENU_SPACING,
            areaBottom = clientHeight-CONTEXTMENU_BORDER-CONTEXTMENU_SPACING,
            menuWidth,
            menuHeight,
            menuX = position.x,
            menuY = position.y,
            options = [];


        surface.getContextMenu(options,modifiers);

        if (options.length) {
            stopHoldTimer();
            isContextMenuClosed = false;
            interaction.mode = MODE_WAIT_NOTOUCH;

            contextMenuNode = document.createElement("div");
            contextMenuNode.className = "contextMenu";
            contextMenuNode.style.zIndex = 200;
            options.forEach(option=>{
                let
                    className = "row",
                    optionNode = document.createElement("div"),
                    labelNode = document.createElement("div");
                labelNode.className = "title";
                labelNode.style.pointerEvents = "none";        
                labelNode.innerHTML = TRANSLATOR.translate(option.title);
                optionNode.onclick = ()=>{
                    if ((interaction.mode == MODE_NONE) && surface.onMenuOption(option,modifiers))
                        closeContextMenu();
                }
                if (option.icon) {
                    let
                        iconNode = document.createElement("div");
                    iconNode.className = "icon";
                    Global.setResourceAsSprite(iconNode,option.icon);
                    iconNode.style.pointerEvents = "none";
                    optionNode.appendChild(iconNode);
                    className+=" icon";
                }
                if (option.isSpecial)
                    className+=" special";
                if (option.isCustom)
                    className+=" macro";
                optionNode.className = className;
                optionNode.appendChild(labelNode);
                contextMenuNode.appendChild(optionNode);
                labelNodes.push(labelNode);

                if (option.description) {
                    let
                        descriptionNode = document.createElement("div");
                    descriptionNode.className = "description";
                    descriptionNode.style.pointerEvents = "none";
                    descriptionNode.innerHTML = TRANSLATOR.translate(option.description);  
                    optionNode.appendChild(descriptionNode);
                    labelNodes.push(descriptionNode);
                }
            });

            node.appendChild(contextMenuNode);

            // Resize and place menu

            menuWidth = contextMenuNode.clientWidth;
            menuHeight = contextMenuNode.clientHeight;

            if (menuWidth > areaWidth) {
                addEllipsis = true;
                menuWidth = areaWidth;
            }
            if (menuHeight > areaHeight) {
                addEllipsis = true;
                menuHeight = areaHeight;
            }

            if (menuX+menuWidth > areaRight)
                menuX = menuX-menuWidth;
            if (menuX<CONTEXTMENU_BORDER)
                menuX = CONTEXTMENU_BORDER;
            if (menuY+menuHeight > areaBottom)
                menuY = areaBottom-menuHeight;

            contextMenuNode.style.left = menuX+"px";
            contextMenuNode.style.top = menuY+"px";
            contextMenuNode.style.minWidth = contextMenuNode.style.width = menuWidth+"px";
            contextMenuNode.style.minHeight = contextMenuNode.style.height = menuHeight+"px";

            if (addEllipsis)
                labelNodes.forEach(labelNode=>{
                    labelNode.style.overflow = "hidden";
                    labelNode.style.textOverflow = "ellipsis";
                });

            if (Global.IS_SAFARIMOBILE) {
                node.scrollTop = 1;
                node.scrollTop = 0;
            }

            return true;
        } else
            return false;
    }

    function closeContextMenu() {
        stopHoldTimer();
        isContextMenuClosed = true;
        if (contextMenuNode) {
            contextMenuNode.parentNode.removeChild(contextMenuNode);
            contextMenuNode = 0;
        }

        if (!interaction.mode) {
            unselectInteractionSurface();
            resetInput();
        }
    }

    function rotateSelection(direction) {
        if ((interaction.mode !== MODE_NONE) && interaction.from[0] && interaction.surfaces && interaction.surfaces.length) {
            interaction.surfaces.forEach(surface=>{
                if (surface.onRotate)
                    surface.onRotate(direction,modifiers);
            });
        } else if (hovering && hovering.isMouse) {
            let
                surface = getSurfaceAtPoint([],viewportPoint(hovering),false,false,false,Global.SCALE,0)[0];
            if (surface && surface.onRotate)
                surface.onRotate(direction,modifiers);
        }
    }

    // --- DOM Events

    function onWheel(e) {
        if (isUnlocked && isContextMenuClosed) {
            if (!isKeyboardWritingClosed)
                endKeyboardInput();
            pointerWheel(e);
            if (!Global.IS_FIREFOX) e.preventDefault();
        }
    }

    function onPointerDown(e) {
        if (isUnlocked) {
            let
                run = true;

            if (!isKeyboardWritingClosed) {
                endKeyboardInput();
                if (e.button != MOUSEBUTTON_RIGHT)
                    run = false;
            }

            if (run)
                if (isContextMenuClosed)
                    pointerDown(e,e.pointerId);
                else
                    if ((interaction.mode == MODE_NONE) && (e.target !== contextMenuNode) && (e.target.parentNode !== contextMenuNode))
                        closeContextMenu();

            if (!Global.IS_FIREFOX) e.preventDefault();
        }
    }

    function onPointerUp(e) {
        if (isUnlocked && isKeyboardWritingClosed) {
            pointerUp(e,e.pointerId);
            if (!Global.IS_FIREFOX) e.preventDefault();
        }
    }

    function onPointerMove(e) {
        if (isUnlocked && isKeyboardWritingClosed) {
            if (touches.length < 2)
                pointerHover(e);
            else
                hovering = 0;
            if (interaction.mode && touchesById[e.pointerId])
                pointerMove(e,e.pointerId);
            if (!Global.IS_FIREFOX) e.preventDefault();
        }
    }

    function onKeyDown(e) {
        if (isUnlocked) {
            if (isKeyboardWritingClosed) {
                let
                    key = e.keyCode;

                if (!keyboard[key]) {

                    keyboard[key] = 1;

                    switch (key) {
                        // +
                        case 187:
                        case 107:{
                            if ((interaction.mode == MODE_NONE) && hovering) {
                                viewportTransform(
                                    viewport,
                                    hovering,
                                    0,
                                    1 + MOUSE_WHEELDELTA,
                                    0,0
                                );
                                setDirty();
                            }
                            break;
                        }
                        // -
                        case 189:
                        case 109:{
                            if ((interaction.mode == MODE_NONE) && hovering) {
                                viewportTransform(
                                    viewport,
                                    hovering,
                                    0,
                                    1 - MOUSE_WHEELDELTA,
                                    0,0
                                );
                                setDirty();
                            }
                            break;
                        }
                        // Left
                        case 37:{
                            rotateSelection(-1);
                            break;
                        }
                        // Right
                        case 39:{
                            rotateSelection(1);
                            break;
                        }
                        // C
                        case 67:{
                            if (interaction.mode == MODE_NONE)
                                frameTable();
                            break;
                        }
                        // Spacebar
                        case 32:{
                            switch (interaction.mode) {
                                case MODE_NONE:{
                                    if (!modifiers.shift)
                                        setNextTool();
                                    break;
                                }
                            }
                            break;
                        }
                        // Shift
                        case 16:{
                            modifiers.shift = true;
                            modifiers.shiftOriginalToolId = tool.id;
                            setTool(TOOL_SHIFTED);
                            break;
                        }
                        // Ctrl
                        case 17:{
                            modifiers.ctrl = true;
                            break;
                        }
                        // Esc
                        case 27:{
                            if (!isContextMenuClosed)
                                closeContextMenu();
                            break;
                        }
                    }
                }
            } else {
                switch(e.keyCode) {
                    // ESC
                    case 27:{
                        endKeyboardInput();
                        break;
                    }
                }
            }
        }
    }

    function onKeyUp(e) {
        if (isUnlocked && isKeyboardWritingClosed) {
                
            let
                key = e.keyCode;

            keyboard[e.keyCode] = 0;

            switch (key) {
                // Shift
                case 16:{
                    modifiers.shift = false;
                    if (modifiers.shiftOriginalToolId !== undefined)
                        setTool(modifiers.shiftOriginalToolId);
                    break;
                }
                // Ctrl
                case 17:{
                    modifiers.ctrl = false;
                    break;
                }
            }
        }

    }

    function addEvents() {
        document.body.addEventListener("pointerdown",onPointerDown);
        document.body.addEventListener("pointermove",onPointerMove);
        document.body.addEventListener("pointerup",onPointerUp);
        document.body.addEventListener("pointercancel",onPointerUp);
        document.body.addEventListener("pointerleave",onPointerUp);
        document.body.addEventListener("wheel",onWheel);

        document.body.addEventListener("keydown",onKeyDown);
        document.body.addEventListener("keyup",onKeyUp);
    }

    // --- Initialize

    table={
        POINTERMODE_FINGER:POINTERMODE_FINGER,
        POINTERMODE_PEN:POINTERMODE_PEN,
        POINTERMODE_DIGITALPEN:POINTERMODE_DIGITALPEN,
        POINTERMODE_TOUCHDIGITALPEN:POINTERMODE_TOUCHDIGITALPEN,
        node:viewportNode,
        type:"table",

        // --- Loader: tools

        setToolTypes:(t)=>{
            tool.CONST = t;
        },
        setTools:(t)=>{

            tools = t;
            
            // Apply defaults
            
            tools.forEach((tool,tid)=>{
                toolsById[tool.id] = tid;
                tool.optionsById = {};
                tool.options.forEach((option,oid)=>{
                    if (option.id)
                        tool.optionsById[option.id] = oid;
                    if (option.color)
                        option.hexColor = Global.colorToHex(option.color,true);
                    if (option.displayColor)
                        option.hexDisplayColor = Global.colorToHex(option.displayColor,true);
                    option.displaySize *= TOOLBOX_PENPREVIEW_MAXSIZE;
                })
            });

        },

        // --- Interface: application menu

        setMenuAction:(m)=>{
            menuAction = m;
        },
        setMenuBullet:(b)=>{
            return setMenuBullet(b);
        },
        setMenuButtonHeight:(h)=>{
            menuButton.style.height = h+"px";
        },
        resetMenuButtonHeight:()=>{
            menuButton.style.height = MENUBUTTON_HEIGHT+"px";
        },
        openMenu:(arg)=>{
            openMenu(arg)
        },

        // --- Interface: notification

        addNotification:(color,text)=>{
            addNotification(color,text);
        },

        // --- Interface: table behavior

        setForceRedraw:(f)=>{
            isForceRedraw = f;
        },
        setPointerMode:(m)=>{
            pointerMode = m;
        },
        setPalmTricks:(p)=>{
            isPalmTricks = p;
            holdtimerDistancePinch = p ? HOLDTIMER_DISTANCE_PALMTRICK : HOLDTIMER_DISTANCE;
        },
        setRotationEnabled:(r)=>{
            isRotationEnabled = r;
        },
        setShakePreview:(p)=>{
            isShakePreview = p;
        },

        // --- Interface: appearance

        setColor:(c)=>{
            setTableColor(c);
        },
        setBackgroundClassName:(c)=>{
            setTableBackgroundClassName(c);
        },

        // --- Interface: selected tool
        
        setTool:(t)=>{
            tool.defaultOptions = t.defaultOptions;
            tool.id = t.id;
            tool.toolData = tools[tool.id];
            tool.option = t.option;
            tool.optionData = tool.toolData.options[tool.option];
            toolboxChanged();
        },
        setToolById:(t)=>{
            let
                ok = true;

            if (t.id !== undefined) {
                if (toolsById[t.id] !== undefined) 
                    setTool(toolsById[t.id]);
                else
                    ok = false;
            }
                
            if (ok && (t.option !== undefined) && (tool.toolData.optionsById[t.option]!==undefined))
                setToolOption(tool.toolData.optionsById[t.option]);

        },
        getTool:()=>{
            return tool;
        },
        getToolData:()=>{
            return {
                id:tool.id,
                option:tool.option,
                defaultOptions:tool.defaultOptions
            }
        },

        // --- Interface: refresh

        setDirty:()=>{
            setDirty()
        },
        updateSurfaces:()=>{
            broadcastUpdate();
        },
        
        // --- Interface: events

        setEventListener:(e)=>{
            eventListener = e;
        },
        broadcastEndInteraction:(by)=>{
            broadcastEvent(by,EVENT_ENDINTERACTION);
        },
        broadcastEvent:(from,e)=>{
            return broadcastEvent(from,e);
        },

        // --- Interface: keyboard

        setKeyboardWriting:(k)=>{
            isKeyboardWriting = k;
        },
        
        // --- Interface: locking
        
        setLock:(l)=>{
            return setLock(l);
        },
        
        // --- Interface: viewport
        
        getViewport:()=>{
            return viewport;
        },
        resetAngle:()=>{
            resetAngle();
        },
        centerTable:()=>{
            frameTable();
        },
        
        // --- Interface: measure
        
        setMeasure:(m)=>{
            measureUnit = m;
        },
        formatMeasure:(d,precision,addlabel)=>{
            return formatMeasure(d,precision,addlabel);
        },

        // --- Interface: input
       
        resetInput:()=>{
            resetInput();
        },

        // --- Interface: pickers

        pickCoordinateFor:(surface,config)=>{
            startCoordinatePicker(surface,config);
        },

        // --- Interface: surface appearance

        showSurfaceHighlight:(surface,select)=>{
            if (select) {
                if (isShakePreview) {
                    let
                        shake = shakeDetector.timeFast / SHAKE_DURATION,
                        shakeDone = shake >= 1,
                        trimShake = shakeDone ? 0 : shake,
                        shakeByte = shakeDone ? 255 : 255*trimShake,
                        shakeSize = SURFACE_SCALED_SELECT_SIZE*3*trimShake;
                    surface.node.style.outlineOffset = ((SURFACE_SCALED_SELECT_PADDING+shakeSize)/viewport.scale)+"px";
                    surface.node.style.outline=((shakeSize+SURFACE_SCALED_SELECT_SIZE)/viewport.scale)+"px "+(shakeDone ? "dashed" : "solid")+" rgba("+(255-shakeByte)+",0,"+shakeByte+",0.5)";
                } else {
                    surface.node.style.outlineOffset = (SURFACE_SCALED_SELECT_PADDING/viewport.scale)+"px";
                    surface.node.style.outline=(SURFACE_SCALED_SELECT_SIZE/viewport.scale)+"px solid rgba(255,0,0,0.5)";
                }
            } else {
                surface.node.style.outlineOffset = 0;
                surface.node.style.outline="";
            }
        },

        // --- Interface: surface add/remove

        empty:()=>{
            let
                notificationsNodes = notificationsNode.childNodes,
                childNodes = viewportNode.childNodes;

            for (let i=0;i<childNodes.length;i++) {
                let node = childNodes[i];
                if (node._surface && node._surface.onRemove)
                    node._surface.onRemove(table);
            }

            for (let i=0;i<notificationsNodes.length;i++)
                if (notificationsNodes[i]._timeout)
                    clearTimeout(notificationsNodes[i]._timeout);

            notificationsNode.innerHTML = "";
            viewportNode.innerHTML="";
            onEventTypesIndex = {};
            setTableBackgroundClassName(tableBackgroundClassName);
        },
        addSurface:(surface)=>{
            viewportNode.appendChild(surface.node);
            if (surface.onUpdate)
                surface.onUpdate(parent);
            if (surface.onEventTypes && surface.onEvent)
                surface.onEventTypes.forEach(type=>{
                    if (!onEventTypesIndex[type]) onEventTypesIndex[type]=[];
                    if (onEventTypesIndex[type].indexOf(surface) == -1)
                        onEventTypesIndex[type].push(surface);
                })
        },

        // --- Interface: surface getters

        getSurfacesIntersecting:(surface)=>{
            return addIntersectingSurfaces([],surface);
        },
        getSurfacesAt:(p)=>{
            return getSurfaceAtPoint([],p,false,false,true,1,0);
        },
        getSurfacesByTag:(tags)=>{
            return getSurfacesByTag(tags);
        },
       
        // --- Interface: surface selection
        
        unselectSurface:(s)=>{
            return unselectSurface(s);
        },
        selectSurface:(surface)=>{
            addSelectInteractionSurface(surface);
        },

        // --- Interface: surface movement
        
        onDraggedMovedX:(id,by)=>{
            interaction.surfacesPosition[id].x+=by;
        },
        onDraggedMovedY:(id,by)=>{
            interaction.surfacesPosition[id].y+=by;
        },

        // --- Interface: initialization
        
        addTo:(parent)=>{
            if (parent.node) parent=parent.node;
            root = parent;
            parent.appendChild(node);
            addEvents();
            setDirty();
            setTool(0, true);
        }

    }

    return table;
}
