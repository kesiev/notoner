let Counter=function(settings) {

    const
        EVENT_COUNTERCHANGED = { type:"counterChanged" },
        BUTTON_WIDTH = 12,
        BORDER_SIZE = 0.5,
        DESCRIPTION_RATIO = 0.3,
        LABEL_MARGIN = 0.5,
        MAX_FONT_SIZE = 10,
        MAX_VALUE = 999,
        MIN_VALUE = -999,
        ACTION_MENUBUTTON = 1,
        ACTION_RESET = 2;

    let
        front,
        baseColor = settings.backgroundColor ? settings.backgroundColor : { r:0, g:150, b:150, a:1 },
        defaultValue = settings.value === undefined ? settings.resetValue === undefined ? 0 : settings.resetValue : settings.value,
        maxValue = settings.maxValue === undefined ? MAX_VALUE : settings.maxValue,
        minValue = settings.minValue === undefined ? MIN_VALUE : settings.minValue,
        leftButtons = settings.leftButtons === true ? settings.static.leftButtons : settings.leftButtons,
        rightButtons = settings.rightButtons === true ? settings.static.rightButtons : settings.rightButtons,
        menuButtons = settings.menuButtons === true ? settings.static.menuButtons : settings.menuButtons,
        buttons = [],
        buttonX = 0,
        centerWidth = 0,
        gaugeRange = 0,
        gaugeMaxWidth = 0,
        smallFontSize = 0,
        gauge,
        description,
        labelHeight,
        descriptionHeight,
        descriptionFontSize,
        counter = new Surface(
            "counter",
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
    if (settings.value === undefined)
        settings.value = defaultValue;
    if (settings.resetValue === undefined)
        settings.resetValue = defaultValue;

    // --- Element private functions

    function broadcastChanged() {
        counter.broadcastEvent(EVENT_COUNTERCHANGED);
    }
    
    function update() {
        Stencil.setHtml(front,counter.value + (settings.isGaugeMaxValueVisible ? "<span style='font-size:"+smallFontSize+"px'>/"+counter.gaugeMaxValue+"</span>" : ""));
        if (description)
            Stencil.setLabel(description,settings.descriptionText);
        if (gauge)
            gauge.style.width = (Math.min(1,Math.max(0,(counter.value-counter.gaugeMinValue)/gaugeRange))*gaugeMaxWidth*Global.SCALE)+"px";
    }

    function setValue(v) {
        v = parseFloat(v) || 0;
        if (counter.value != v) {
            counter.value = v;
            if (counter.value < minValue)
                counter.value = minValue;
            if (counter.value > maxValue)
                counter.value = maxValue;
            update();
            broadcastChanged();
        }
    }

    function resetValue(animate) {
        setValue(counter.resetValue);
        if (animate)
            counter.startAnimation("reset");
    }

    function getWidthLeft() {
        let
            width = settings.width;
        if (leftButtons)
            leftButtons.forEach(button=>{
                if (button)
                    width-=button.width === undefined ? BUTTON_WIDTH : button.width;
                else
                    width -= BUTTON_WIDTH;
            });
        if (rightButtons)
            rightButtons.forEach(button=>{
                if (button)
                    width-=button.width === undefined ? BUTTON_WIDTH : button.width;
                else
                    width -= BUTTON_WIDTH;
            });
        return width < 0 ? 0 : width;
    }

    function addButtons(set) {
        if (set) {
            set.forEach(button=>{
                let
                    buttonNode = Stencil.newFrame(counter.content,{
                        x:buttonX,
                        y:0,
                        width:BUTTON_WIDTH,
                        height:settings.height,
                        backgroundColor:{ r:0, g:0, b:0, a:0 },
                        borderSize:BORDER_SIZE,
                        borderStyle:"solid",
                        borderColor:{ r:0, g:0, b:0, a:1 },
                    },button.frame || true);
                Stencil.asLabel(buttonNode,{
                    fontSize:5,
                    fontWeight:"bold",
                    textAlign:"center",
                    whiteSpace:"nowrap",
                    lineHeight:"auto",
                    textColor:{ r:255, g:255, b:255, a:1 },
                    strokeWidth:0.5,
                    strokeColor:{ r:0, g:0, b:0, a:1 }
                },button.frame || true);
                Stencil.setLabel(buttonNode,button.frameText);
                buttonNode._onSelect = button.onSelect;
                buttons.push(buttonNode);
                buttonX += buttonNode._width;
            });
        }
    }

    function runButton(hit) {
        if (hit.sumValue !== undefined)
            setValue(counter.value+hit.sumValue);
        if (hit.subtractValue !== undefined)
            setValue(counter.value-hit.subtractValue);
        if (hit.setValue !== undefined)
            setValue(hit.setValue);
        if (hit.macro)
            Macro.run(hit.macro,counter);
    }

    // --- Prepare element
    
    if (settings.frame)
        Stencil.newFrame(counter.content,{
            x:0,
            y:0,
            width:settings.width,
            height:settings.height,
            backgroundColor:settings.isTransparent ? Global.colorWithAlpha(baseColor, 0.7) : baseColor,
            borderSize:BORDER_SIZE,
            borderStyle:"solid",
            borderColor:{ r:0, g:0, b:0, a:1 },
            boxShadow:[
                { x:0, y:0, size:1, color:{ r:50, g:50, b:50, a:1 }}
            ]
        },true,counter);

    if (settings.image)
        Stencil.newSprite(counter.content,{
            x:0,
            y:0,
            width:settings.width,
            height:settings.height,
            baseColor:baseColor
        },settings.image);

    centerWidth = getWidthLeft();

    addButtons(leftButtons);

    if (settings.description) {
        labelHeight = settings.height-LABEL_MARGIN*3;
        descriptionHeight = labelHeight * DESCRIPTION_RATIO;
        labelHeight -= descriptionHeight;
    } else {
        labelHeight = settings.height-LABEL_MARGIN*2;
        descriptionHeight = 0;
    }

    descriptionFontSize = Math.max(1,Math.floor(descriptionHeight-1));    

    front = Stencil.newFrame(counter.content,{
        x:buttonX,
        y:descriptionHeight ? descriptionHeight+LABEL_MARGIN*2 : LABEL_MARGIN,
        width:centerWidth,
        height:labelHeight,
        backgroundColor:{ r:0, g:0, b:0, a:0 }
    },settings.label || true);

    Stencil.asLabel(front,{
        fontSize:Math.min(MAX_FONT_SIZE,Math.floor(labelHeight)),
        fontWeight:"bold",
        textAlign:"center",
        whiteSpace:"nowrap",
        lineHeight:"auto",
        textColor:{ r:255, g:255, b:255, a:1 },
        strokeWidth:0.5,
        strokeColor:{ r:0, g:0, b:0, a:1 }
    },settings.label || true);

    front.style.zIndex = 10;
    smallFontSize = Math.max(front._fontSize/2,6);

    if (settings.description) {
        description = Stencil.newFrame(counter.content,{
            x:front._x,
            y:LABEL_MARGIN,
            width:front._width,
            height:descriptionHeight,
            backgroundColor:{ r:0, g:0, b:0, a:0 }
        },settings.description || true);
    
        Stencil.asLabel(description,{
            fontSize:descriptionFontSize,
            fontWeight:"bold",
            textAlign:"center",
            whiteSpace:"nowrap",
            lineHeight:"auto",
            textColor:{ r:255, g:255, b:255, a:1 },
            strokeWidth:descriptionFontSize < 4 ? 0 : 0.5,
            strokeColor:{ r:0, g:0, b:0, a:1 }
        },settings.description || true);
        description.style.zIndex = 10;
    }
    
    buttonX += front._width;

    addButtons(rightButtons);

    if (settings.gauge) {
        gauge = Stencil.newFrame(counter.content,{
            x:front._x,
            bottom:BORDER_SIZE,
            width:front._width,
            height:settings.height-BORDER_SIZE*2,
            backgroundColor:{ r:255, g:255, b:255, a:0.5 }
        },settings.gauge);
        gaugeMaxWidth = gauge._width;
        gaugeRange = settings.gaugeMaxValue - settings.gaugeMinValue;
    }

    // --- Element interfaces

    // --- Element macros

    counter.setValue = (v)=>{
        setValue(v);
    }

    counter.sumValue = (v)=>{
        setValue(counter.value + v);
    }

    counter.subtractValue = (v)=>{
        setValue(counter.value - v);
    }

    counter.reset = ()=>{
        resetValue();
    }

    // --- Element properties (transfer)

    Stencil.transferGlobalProperties(settings,counter);
    counter.static = settings.static;
    counter.value = settings.value;
    counter.resetValue = settings.resetValue;
    counter.frame = settings.frame;
    counter.label = settings.label;
    counter.leftButtons = settings.leftButtons;
    counter.rightButtons = settings.rightButtons;
    counter.menuButtons = settings.menuButtons;
    counter.backgroundColor = settings.backgroundColor;
    counter.description = settings.description;
    counter.descriptionText = settings.descriptionText;
    counter.maxValue = settings.maxValue;
    counter.minValue = settings.minValue;
    counter.isTransparent = settings.isTransparent;
    counter.isRotating = settings.isRotating;
    counter.gaugeMinValue = settings.gaugeMinValue;
    counter.gaugeMaxValue = settings.gaugeMaxValue;
    counter.gauge = settings.gauge;
    counter.isGaugeMaxValueVisible = settings.isGaugeMaxValueVisible;
    counter.image = settings.image;

    // --- Element properties (setters)

    counter.setDraggable(!!settings.isDraggable);
    counter.setVariableZIndex(!!settings.isVariableZIndex);
    counter.setDragTopSurfaces(!!settings.isDragTopSurfaces);
    counter.setZIndexGroup(settings.zIndexGroup);
    counter.setFence(settings.fence);
    counter.setSimpleDrag(true);

    // --- Element menu

    counter.onMenuOption=(option)=>{
        if (!Stencil.onMenuOptionDefault(counter,option))
            switch (option.action) {
                case ACTION_MENUBUTTON:{
                    runButton(option.onSelect);
                    break;
                }
                case ACTION_RESET:{
                    resetValue(true);
                    break;
                }
            }
        return true;
    }

    // --- Element special action

    // --- Element interactions

    counter.onDrop=()=>{ Stencil.onDropDefault(counter) }
    counter.onSelect=()=>{ Stencil.onSelectDefault(counter) }
    counter.onShake=()=>{ if (!Stencil.onShakeDefault(counter)) resetValue(true); }

    counter.onClick=(e)=>{
        let
            hit,
            px = e.x,
            py = e.y;

        buttons.forEach(button=>{
            let
                x = button._x,
                y = button._y;

            if (!(
                (px > x+button._width) ||
                (px < x) ||
                (py > y+button._height) ||
                (py < y)
            ))
                hit = button._onSelect;
        });

        if (hit)
            runButton(hit);
        else
            Stencil.onClickDefault(counter);

    }

    if (settings.isRotating)
        counter.onRotate=(side)=>{
            setValue(counter.value+side);
        }

    counter.onContextMenu=(options)=>{

        if (counter.hasMessage("reset"))
            options.push({
                title:counter.getMessage("reset","title"),
                icon:counter.getMessage("reset","icon"),
                action:ACTION_RESET
            });
        if (menuButtons)
            menuButtons.forEach(button=>{
                options.push({
                    title:button.title,
                    icon:button.icon,
                    action:ACTION_MENUBUTTON,
                    onSelect:button.onSelect
                });
            });
        Stencil.onContextMenuDefault(counter,options);
    }

    counter.setContextMenu(true);
    
    // --- Element animations

    counter.onAnimation=(id,time)=>{
        switch (id) {
            case "reset":{
                return Stencil.animate(Stencil.ANIMATION_PULSE,time,counter);
                break;
            }
        }
    }

    // --- Element lifecycle: update

    counter.onUpdate=()=>{
        update();
    }

    // --- Element lifecycle: events

    // --- Element lifecycle: removal
    
    // --- Element initialization

    update();

    return counter;

}
