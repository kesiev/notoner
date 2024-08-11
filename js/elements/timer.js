let Timer=function(settings) {

    const
        EVENT_TIMERCHANGED = { type:"timerChanged" },
        ACTION_STARTSTOP = 0,
        ACTION_START = 1,
        ACTION_STOP = 2,
        ACTION_RESET = 3,
        ACTION_RESTART = 4,
        OUTLINE = 2,
        TIMER_LIMIT = (60*100);

    let
        front,
        radius = Math.max(settings.width,settings.height) || 2,
        isCountDown = !!settings.timeLeft,
        isRunning = false,
        baseColor = settings.backgroundColor,
        interval,
        timer = new Surface(
            "timer",
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

    function broadcastChanged() {
        timer.broadcastEvent(EVENT_TIMERCHANGED);
    }
    
    function update() {
        if (isCountDown) {
            if (timer.count < 61)
                Stencil.setHtml(front,timer.count+"s");
            else
                Stencil.setHtml(front,"-"+Global.padNumber(Math.floor(timer.count/60),2,"0")+":"+Global.padNumber(timer.count%60,2,"0"));
        } else
            Stencil.setHtml(front,Global.padNumber(Math.floor(timer.count/60),2,"0")+":"+Global.padNumber(timer.count%60,2,"0"));
    }

    function stop() {
        isRunning = false;
        clearTimeout(interval);
        interval = 0;
        Stencil.resetTextColor(front);
    }

    function setCount(c) {
        if ((c != timer.count) && (c < TIMER_LIMIT) && (c>=0)) {
            timer.count = c;
            update();
            broadcastChanged();
        }
    }

    function start() {
        stop();
        Stencil.invertTextColor(front);
        isRunning = true;
        interval = setInterval(()=>{
            if (isCountDown)
                if (timer.count)
                    setCount(timer.count-1);
                else {
                    timer.startAnimation("ring");
                    if (timer.hasMessage("timeUp"))
                        timer.addNotification( Global.colorToRGBA(settings.backgroundColor,true), timer.getMessage("timeUp","title"));
                    stop();
                }
            else
                setCount(timer.count+1);
        },1000);
    }

    function startStop() {
        if (isRunning)
            stop();
        else {
            if (isCountDown && !timer.count) reset();
            start();
        }
        timer.startAnimation("toggle");
    }

    function reset() {
        stop();
        setCount(isCountDown ? settings.timeLeft : 0);
        update();
    }

    // --- Prepare element
    
    if (settings.frame)
        Stencil.newFrame(timer.content,{
            x:0,
            y:0,
            width:settings.width,
            height:settings.height,
            backgroundColor:baseColor,
            borderSize:1.5,
            borderStyle:"solid",
            borderColor:{ r:0, g:0, b:0, a:1 },
            borderRadius:radius,
            boxShadow:[
                { x:0, y:0, size:1, color:{ r:50, g:50, b:50, a:1 } },
                { type:"inset", x:0, y:0.5, size:0.5, color:{ r:255, g:255, b:255, a:1 } }
            ]
        },true,timer);

    front = Stencil.newFrame(timer.content,{
        x:OUTLINE,
        y:OUTLINE,
        width:settings.width-OUTLINE*2,
        height:settings.height-OUTLINE*2,
        backgroundColor:{ r:255, g:255, b:255, a:0.7 },
        borderSize:1.5,
        borderStyle:"solid",
        borderColor:{ r:0, g:0, b:0, a:1 },
        borderRadius:radius,
        boxShadow:[
            { type:"inset", x:0, y:0, size:1, color:{ r:50, g:50, b:50, a:1 } }
        ]
    },settings.label || true);

    if (settings.icon)
        Stencil.newSprite(timer.content,{
            bottom:4,
            x:(settings.width/2)-2.5,
            width:5,
            height:5,
            baseColor:baseColor,
            image:settings.static.icon
        },settings.icon);

    Stencil.asLabel(front,{
        fontSize:8,
        fontWeight:"bold",
        textAlign:"center",
        whiteSpace:"nowrap",
        lineHeight:"auto",
        textColor:{ r:255, g:255, b:255, a:1 },
        strokeWidth:0.5,
        strokeColor:{ r:0, g:0, b:0, a:1 }
    },settings.label || true);
    
    // --- Element interfaces

    // --- Element macros

    timer.reset=()=>{
        reset();
    }

    timer.start=()=>{
        start();
    }

    timer.stop=()=>{
        stop();
    }

    timer.toggle=()=>{
        startStop();
    }

    timer.shuffle=()=>{
        reset();
        timer.startAnimation("roll");
    }

    // --- Element properties (transfer)

    Stencil.transferGlobalProperties(settings,timer);
    timer.static = settings.static;
    timer.count = settings.count;
    timer.frame = settings.frame;    
    timer.label = settings.label;
    timer.backgroundColor = settings.backgroundColor;
    timer.timeLeft = settings.timeLeft;
    timer.messages = settings.messages;

    // --- Element properties (setters)

    timer.setDraggable(!!settings.isDraggable);
    timer.setVariableZIndex(!!settings.isVariableZIndex);
    timer.setDragTopSurfaces(!!settings.isDragTopSurfaces);
    timer.setZIndexGroup(settings.zIndexGroup);
    timer.setFence(settings.fence);
    timer.setSimpleDrag(true);
    timer.setStackId(settings.stackId);

    // --- Element menu

    timer.onContextMenu=(options)=>{
        if (timer.hasMessage("startStop"))
            options.push({
                title:timer.getMessage("startStop","title"),
            icon:timer.getMessage("startStop","icon"),
            action:ACTION_STARTSTOP
            });
        if (timer.hasMessage("start"))
            options.push({
                title:timer.getMessage("start","title"),
                icon:timer.getMessage("start","icon"),
                action:ACTION_START
            });
        if (timer.hasMessage("stop"))
            options.push({
                title:timer.getMessage("stop","title"),
                icon:timer.getMessage("stop","icon"),
                action:ACTION_STOP
            });
        if (timer.hasMessage("reset"))
            options.push({
                title:timer.getMessage("reset","title"),
                icon:timer.getMessage("reset","icon"),
                action:ACTION_RESET
            });
        if (timer.hasMessage("restart"))
            options.push({
                title:timer.getMessage("restart","title"),
                icon:timer.getMessage("restart","icon"),
                action:ACTION_RESTART
            });
        Stencil.onContextMenuDefault(timer,options);
    }

    timer.onMenuOption=(option)=>{
        if (!Stencil.onMenuOptionDefault(timer,option)) {
            timer.stopAnimation();
            switch (option.action) {
                case ACTION_STARTSTOP:{
                    timer.toggle();
                    break;
                }
                case ACTION_START:{
                    timer.start();
                    break;
                }
                case ACTION_STOP:{
                    timer.stop();
                    break;
                }
                case ACTION_RESET:{
                    timer.reset();
                    break;
                }
                case ACTION_RESTART:{
                    timer.reset();
                    timer.start();
                    break;
                }
            }
        }
        return true;
    }
    
    timer.setContextMenu(true);

    // --- Element special action

    // --- Element interactions

    timer.onMoved=()=>{ Stencil.onMovedDefault(timer) }
    timer.onDrop=()=>{ Stencil.onDropDefault(timer) }
    timer.onSelect=()=>{ Stencil.onSelectDefault(timer) }
    timer.onShake=()=>{ if (!Stencil.onShakeDefault(timer)) timer.shuffle(); }
    timer.onClick=()=>{ if (!Stencil.onClickDefault(timer)) startStop(); }
    
    // --- Element animations

    timer.onAnimation=(id,time)=>{
        switch (id) {
            case "roll":{
                return Stencil.animate(Stencil.ANIMATION_ROLL,time,timer,start);
            }
            case "ring":{
                return Stencil.animate(Stencil.ANIMATION_RING,time,timer);
            }
            case "toggle":{
                return Stencil.animate(Stencil.ANIMATION_PULSE,time,timer);
            }
        }
    }

    // --- Element lifecycle: update

    // --- Element lifecycle: events

    // --- Element lifecycle: removal

    timer.onRemove=()=>{
        stop();
    }
    
    // --- Element initialization

    if (timer.count === undefined)
        reset();
    else {
        update();
        stop();
    }

    return timer;

}
