let Calculator=function(settings) {

    const
        ACTION_SETOPERATOR = 1,
        ACTION_INPUTDIGIT = 2,
        ACTION_INPUTDECIMAL = 3,
        ACTION_EQUAL = 4,
        ACTION_CLEAR = 5,
        ACTION_CLEARENTRY = 6,
        ACTION_PERCENT = 7,
        ACTION_SQRT = 8,
        ACTION_NEGATE = 9,
        ACTION_MEMORYADD = 10,
        ACTION_MEMORYSUBTRACT = 11,
        ACTION_MEMORYRECALL = 12,
        ACTION_MEMORYCLEAR = 13,
        OPERATOR_NONE = 0,
        OPERATOR_ADD = 1,
        OPERATOR_SUBTRACT = 2,
        OPERATOR_DIVIDE = 3,
        OPERATOR_MULTIPLY = 4,
        KEYS = [
            [ 
                { label:"MRC", fontSize:4, action:ACTION_MEMORYRECALL, backgroundColor:{ r:75, g:75, b:75, a:1 } },
                { label:"M-" , fontSize:4, action:ACTION_MEMORYSUBTRACT, backgroundColor:{ r:75, g:75, b:75, a:1 } },
                { label:"M+", fontSize:4, action:ACTION_MEMORYADD, backgroundColor:{ r:75, g:75, b:75, a:1 } },
                { label: "C", fontSize:8, action:ACTION_CLEAR, backgroundColor:{ r:255, g:42, b:42, a:1 } }
            ],
            [ 
                { label:"&#8730;", fontSize:8, action:ACTION_SQRT, backgroundColor:{ r:75, g:75, b:75, a:1 } },
                { label:"%", fontSize:8, action:ACTION_PERCENT, backgroundColor:{ r:75, g:75, b:75, a:1 } },
                { label:"+/-", fontSize:6, action:ACTION_NEGATE, backgroundColor:{ r:75, g:75, b:75, a:1 } },
                { label: "CE", fontSize:6, action:ACTION_CLEARENTRY, backgroundColor:{ r:255, g:42, b:42, a:1 } }
            ],
            [ 
                { label:"7", fontSize:8, action:ACTION_INPUTDIGIT, digit:"7", backgroundColor:{ r:225, g:225, b:225, a:1 } },
                { label:"8", fontSize:8, action:ACTION_INPUTDIGIT, digit:"8", backgroundColor:{ r:225, g:225, b:225, a:1 } },
                { label:"9", fontSize:8, action:ACTION_INPUTDIGIT, digit:"9", backgroundColor:{ r:225, g:225, b:225, a:1 } },
                { label: "&#247;", fontSize:8, action:ACTION_SETOPERATOR, operator:OPERATOR_DIVIDE, backgroundColor:{ r:75, g:75, b:75, a:1 } }
            ],
            [ 
                { label:"4", fontSize:8, action:ACTION_INPUTDIGIT, digit:"4", backgroundColor:{ r:225, g:225, b:225, a:1 } },
                { label:"5", fontSize:8, action:ACTION_INPUTDIGIT, digit:"5", backgroundColor:{ r:225, g:225, b:225, a:1 } },
                { label:"6", fontSize:8, action:ACTION_INPUTDIGIT, digit:"6", backgroundColor:{ r:225, g:225, b:225, a:1 } },
                { label: "&times;", fontSize:8, action:ACTION_SETOPERATOR, operator:OPERATOR_MULTIPLY, backgroundColor:{ r:75, g:75, b:75, a:1 } }
            ],
            [ 
                { label:"1", fontSize:8, action:ACTION_INPUTDIGIT, digit:"1", backgroundColor:{ r:225, g:225, b:225, a:1 } },
                { label:"2", fontSize:8, action:ACTION_INPUTDIGIT, digit:"2", backgroundColor:{ r:225, g:225, b:225, a:1 } },
                { label:"3", fontSize:8, action:ACTION_INPUTDIGIT, digit:"3", backgroundColor:{ r:225, g:225, b:225, a:1 } },
                { label: "-", fontSize:8, action:ACTION_SETOPERATOR, operator:OPERATOR_SUBTRACT, backgroundColor:{ r:75, g:75, b:75, a:1 } }
            ],
            [ 
                { label:"0", fontSize:8, action:ACTION_INPUTDIGIT, digit:"0", backgroundColor:{ r:225, g:225, b:225, a:1 } },
                { label:"&#183;", fontSize:8, action:ACTION_INPUTDECIMAL, backgroundColor:{ r:225, g:225, b:225, a:1 } },
                { label:"=", fontSize:8, action:ACTION_EQUAL, backgroundColor:{ r:225, g:225, b:225, a:1 }},
                { label: "+", fontSize:8, action:ACTION_SETOPERATOR, operator:OPERATOR_ADD, backgroundColor:{ r:75, g:75, b:75, a:1 } }
            ]
        ],
        ROWS = KEYS.length,
        COLUMNS = KEYS[0].length,
        BORDER = 2,
        BORDER2 = BORDER * 2,
        DISPLAY_RATIO = 0.25;

    let
        display,
        displayHeight = settings.height*DISPLAY_RATIO,
        keyWidth = (settings.width-COLUMNS*BORDER-BORDER)/COLUMNS,
        keyHeight = (settings.height-displayHeight-ROWS*BORDER)/ROWS,
        baseColor = settings.backgroundColor || { r:100, g:100, b:100, a:1 },
        keyboard = [],
        calculator = new Surface(
            "calculator",
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

    function setState(state) {
        calculator.state = {
            value: (state ? state.value : 0) || "0",
            memory: (state ? state.memory : 0) || "0",
            total: (state ? state.total : 0),
            operator: (state ? state.operator : 0) || OPERATOR_NONE,
            mode: (state ? state.mode : 0) || 0
        };
    }
    
    function updateDisplay() {

        if (display)
            if (calculator.state.mode) {

                let
                    operator = "?";

                switch (calculator.state.operator) {
                    case OPERATOR_NONE:{
                        operator = "";
                        break;
                    }
                    case OPERATOR_ADD:{
                        operator = "+";
                        break;
                    }
                    case OPERATOR_SUBTRACT:{
                        operator = "-";
                        break;
                    }
                    case OPERATOR_DIVIDE:{
                        operator = "&#247;";
                        break;
                    }
                    case OPERATOR_MULTIPLY:{
                        operator = "&times;";
                        break;
                    }
                }
                display.innerHTML = calculator.state.total + (calculator.state.mode == 1 ? " " + operator : "");

            } else
                display.innerHTML = calculator.state.value;

    }

    function calculate() {

        if (calculator.state.total) {
                
            let
                totalValue = parseFloat(calculator.state.total),
                currentValue = parseFloat(calculator.state.value);
            switch (calculator.state.operator) {
                case OPERATOR_ADD:{
                    totalValue = totalValue + currentValue;
                    break;
                }
                case OPERATOR_SUBTRACT:{
                    totalValue = totalValue - currentValue;
                    break;
                }
                case OPERATOR_MULTIPLY:{
                    totalValue = totalValue * currentValue;
                    break;
                }
                case OPERATOR_DIVIDE:{
                    totalValue = totalValue / currentValue;
                    break;
                }
            }
            calculator.state.total = String(totalValue);

        } else
            calculator.state.total = calculator.state.value;
        
        calculator.state.mode = 1;
        
    }

    function clearMemory() {
        calculator.state.memory = "0";
        if (calculator.hasMessage("memoryCleared"))
            calculator.addNotification( Global.colorToRGBA(settings.backgroundColor,true), calculator.getMessage("memoryCleared","title"));
        calculator.startAnimation("reset");
    }

    function reset() {
        calculator.state.mode = 0;
        calculator.state.value = "0";
        delete calculator.state.total;
        updateDisplay();
        if (calculator.hasMessage("resetDone"))
            calculator.addNotification( Global.colorToRGBA(settings.backgroundColor,true), calculator.getMessage("resetDone","title"));
        calculator.startAnimation("reset");
    }

    // --- Prepare element

    if (settings.frame)
        frame = Stencil.newFrame(calculator.content,{
            x:0,
            y:0,
            width:settings.width,
            height:settings.height,
            backgroundColor:baseColor,
            borderSize:1.3,
            borderStyle:"solid",
            borderColor:{ r:0, g:0, b:0, a:1 },
            borderRadius:2,
            boxShadow:[
                { x:0, y:0, size:1, color:{ r:50, g:50, b:50, a:1 }}
            ]
        },settings.frame,calculator);

    if (settings.image)
        Stencil.newSprite(calculator.content,{
            x:0,
            y:0,
            width:settings.width,
            height:settings.height,
            baseColor:baseColor
        },settings.image);
    
    if (settings.display) {

        display = Stencil.newFrame(calculator.content,{
            x:BORDER,
            y:BORDER,
            width:settings.width-BORDER2,
            height:displayHeight-BORDER2,
            backgroundColor:{ r:0, g:0, b:0, a:0.5 },
            borderRadius:2,
            padding:1
        },settings.display);

        Stencil.asLabel(display,{
            fontSize:10,
            fontWeight:"bold",
            textAlign:"right",
            whiteSpace:"nowrap",
            lineHeight:"auto",
            textColor:{ r:255, g:255, b:255, a:1 },
            strokeWidth:0.5,
            strokeColor:{ r:0, g:0, b:0, a:1 },
            overflow:"hidden",
            whiteSpace:"nowrap"
        },settings.display);

    }

    KEYS.forEach((row,rowId)=>{
        keyboard[rowId]=[];
        row.forEach((key,colId)=>{
            let
                keyData = (settings.keys && settings.keys[rowId] ? settings.keys[rowId][colId] : 0) || true,
                cell = Stencil.newFrame(calculator.content,{
                    x:BORDER+colId*(keyWidth+BORDER),
                    y:displayHeight+rowId*(keyHeight+BORDER),
                    width:keyWidth,
                    height:keyHeight,
                    backgroundColor:key.backgroundColor || { r:255, g:255, b:255, a:1 },
                    borderStyle:"solid",
                    borderRadius:2,
                    borderSize:0.5,
                    borderColor:{ r:0, g:0, b:0, a:1 },
                    boxShadow:[
                        { x:0, y:0.5, size:0.25, color:{ r:50, g:50, b:50, a:1 }}
                    ]
                },keyData);

            Stencil.asLabel(cell,{
                fontSize:key.fontSize,
                fontWeight:"bold",
                textAlign:"center",
                whiteSpace:"nowrap",
                lineHeight:"auto",
                textColor:{ r:255, g:255, b:255, a:1 },
                strokeWidth:0.5,
                strokeColor:{ r:0, g:0, b:0, a:1 }
            },keyData);

            cell._key = key;
            cell.innerHTML = key.label;
            keyboard[rowId][colId]=cell;
        });
    });

    // --- Element interfaces

    calculator.setState=(state)=>{
        setState(state);
        updateDisplay();
    }

    // --- Element macros

    calculator.reset=()=>{
        reset();
    }

    // --- Element properties (transfer)

    Stencil.transferGlobalProperties(settings,calculator);
    calculator.static = settings.static;
    calculator.backgroundColor = settings.backgroundColor;
    calculator.display = settings.display;
    calculator.frame = settings.frame;
    calculator.keys = settings.keys;
    calculator.messages = settings.messages;

    // --- Element properties (setters)

    calculator.setVariableZIndex(!!settings.isVariableZIndex);
    calculator.setDragTopSurfaces(!!settings.isDragTopSurfaces);
    calculator.setDraggable(!!settings.isDraggable);
    calculator.setZIndexGroup(settings.zIndexGroup);
    calculator.setFence(settings.fence);
    calculator.setSimpleDrag(true);
    calculator.setStackId(settings.stackId);

    // --- Element menu

    calculator.onContextMenu=(options)=>{
        if (calculator.hasMessage("clearMemory"))
            options.push({
                title:calculator.getMessage("clearMemory","title"),
                icon:calculator.getMessage("clearMemory","icon"),
                action:ACTION_MEMORYCLEAR
            });
        if (calculator.hasMessage("reset"))
            options.push({
                title:calculator.getMessage("reset","title"),
                icon:calculator.getMessage("reset","icon"),
                action:ACTION_CLEAR
            });
        Stencil.onContextMenuDefault(calculator,options);
    }

    calculator.onMenuOption=(option)=>{
        if (!Stencil.onMenuOptionDefault(calculator,option))
            switch (option.action) {
                case ACTION_MEMORYCLEAR:{
                    clearMemory();
                    break;
                }
                case ACTION_CLEAR:{
                    reset();
                    break;
                }
            }
        return true;
    }

    calculator.setContextMenu(true);

    // --- Element special action

    // --- Element interactions

    calculator.onMoved=()=>{ Stencil.onMovedDefault(calculator) }
    calculator.onDrop=()=>{ Stencil.onDropDefault(calculator) }
    calculator.onSelect=()=>{ Stencil.onSelectDefault(calculator) }
    calculator.onShake=()=>{ if (!Stencil.onShakeDefault(calculator)) calculator.reset(); }

    calculator.onClick=(e)=>{
        let
            hit,
            px = e.x,
            py = e.y;

        keyboard.forEach(row=>{
            row.forEach(key=>{
                let
                    x = key._x,
                    y = key._y;

                if (!(
                    (px > x+key._width) ||
                    (px < x) ||
                    (py > y+key._height) ||
                    (py < y)
                ))
                    hit = key._key;
            })
        });

        if (hit) {
            if (calculator.state.mode && ((hit.action == ACTION_INPUTDIGIT) || (hit.action == ACTION_INPUTDECIMAL))) {
                if (calculator.state.mode == 2) {
                    delete calculator.state.total;
                    calculator.state.operator = OPERATOR_NONE;
                }
                calculator.state.mode = 0;
                calculator.state.value = "0";
            }
            switch (hit.action) {
                case ACTION_INPUTDIGIT:{
                    if (calculator.state.value == "0")
                        calculator.state.value = "";
                    calculator.state.value+=hit.digit;
                    break;
                }
                case ACTION_INPUTDECIMAL:{
                    if (calculator.state.value.indexOf(".") == -1)
                        calculator.state.value+=".";
                    break;
                }
                case ACTION_EQUAL:{
                    calculate();
                    calculator.state.mode = 2;
                    break;
                }
                case ACTION_CLEARENTRY:{
                    calculator.state.mode = 0;
                    calculator.state.value = "0";
                    break;
                }
                case ACTION_CLEAR:{
                    calculator.state.mode = 0;
                    calculator.state.value = "0";
                    delete calculator.state.total;
                    break;
                }
                case ACTION_SQRT:{
                    if (calculator.state.mode)
                        calculator.state.total = String(Math.sqrt(parseFloat(calculator.state.total)));
                    else
                        calculator.state.value = String(Math.sqrt(parseFloat(calculator.state.value)));
                    break;
                }
                case ACTION_NEGATE:{
                    if (calculator.state.mode)
                        calculator.state.total = String(parseFloat(calculator.state.total*-1));
                    else
                        calculator.state.value = String(parseFloat(calculator.state.value*-1));
                    break;
                }
                case ACTION_MEMORYSUBTRACT:
                case ACTION_MEMORYADD:{
                    let
                        memory = parseFloat(calculator.state.memory),
                        value = parseFloat(calculator.state.mode ? calculator.state.total : calculator.state.value);

                    if (hit.action == ACTION_MEMORYADD)
                        memory += value;
                    else
                        memory -= value;

                    calculator.state.memory = String(memory);
                    break;
                }
                case ACTION_MEMORYRECALL:{
                    if (calculator.state.mode)
                        calculator.state.total = calculator.state.memory;
                    else
                        calculator.state.value = calculator.state.memory;
                    break;
                }
                case ACTION_NEGATE:{
                    if (calculator.state.mode)
                        calculator.state.total = String(parseFloat(calculator.state.total*-1));
                    else
                        calculator.state.value = String(parseFloat(calculator.state.value*-1));
                    break;
                }
                case ACTION_PERCENT:{
                    if (!calculator.state.mode)
                        if (calculator.state.total) {
                            let
                                totalValue = parseFloat(calculator.state.total),
                                currentValue = parseFloat(calculator.state.value);

                            switch (calculator.state.operator) {
                                case OPERATOR_ADD:
                                case OPERATOR_SUBTRACT:{
                                    calculator.state.value = totalValue/100*currentValue;
                                    break;
                                }
                                case OPERATOR_MULTIPLY:
                                case OPERATOR_DIVIDE:{
                                    calculator.state.value = currentValue/100;
                                    break;
                                }
                            } 
                        } else calculator.state.value = 0;
                    break;
                }
                case ACTION_SETOPERATOR:{
                    if (!calculator.state.mode)
                        calculate();
                    calculator.state.mode = 1;
                    calculator.state.operator = hit.operator;
                    calculator.state.value = calculator.state.total;
                    break;
                }
            }
            updateDisplay();
        } else
            Stencil.onClickDefault(calculator);

    }

    // --- Element animations

    calculator.onAnimation=(id,time)=>{
        switch (id) {
            case "reset":{
                return Stencil.animate(Stencil.ANIMATION_PULSE,time,calculator);
            }
        }
    }
    
    // --- Element lifecycle: update

    calculator.onUpdate=()=>{
        updateDisplay();
    }

    // --- Element lifecycle: events

    // --- Element lifecycle: removal

    // --- Element initialization

    setState(settings.state);

    return calculator;

}
