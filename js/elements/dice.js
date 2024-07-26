let Dice=function(settings) {

    const
        EVENT_DICEROLLED = { type:"diceRolled" },
        ACTION_FLIP = 1,
        ACTION_ROLL = 2,
        ACTION_SETFACE = 3;

    let
        tiltAngle = 0,
        facesImage,
        facesLabel,
        baseColor = settings.backgroundColor || { r:255, g:255, b:255, a:1 },
        dice = new Surface(
            "dice",
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

    function tilt() {
        tiltAngle = FIXFLOAT(-0.05+(Math.random()*0.1));
        dice.setAngle(tiltAngle+"rad");
    }

    function broadcastRolled() {
        dice.broadcastEvent(EVENT_DICEROLLED);
    }

    function setValue(v) {
        let
            face = dice.faces[v];

        dice.value = v;

        if (facesImage)
            if (face.frame === undefined)
                Stencil.hide(facesImage);
            else {
                Stencil.show(facesImage);
                Stencil.setFrame(facesImage,face.frame);
            }

        if (facesLabel)
            if (face.label === undefined)
                Stencil.hide(facesLabel);
            else {
                Stencil.show(facesLabel);
                Stencil.setLabel(facesLabel,face.label);
            }
    }

    function roll() {
        tilt();
        setValue(Math.floor(Math.random()*dice.faces.length));
        broadcastRolled();
    }

    function flip() {
        dice.stopAnimation();
        setValue(dice.faces.length-dice.value-1);
        broadcastRolled();
        dice.startAnimation("flip");
    }

    // --- Prepare element
    
    if (settings.frame)
        frame = Stencil.newFrame(dice.content,{
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
        },settings.frame,dice);

    if (settings.image) {
        image = Stencil.newSprite(dice.content,{
            x:0,
            y:0,
            width:settings.width,
            height:settings.height,
            baseColor:baseColor
        },settings.image);
        dice.setBorderRadius(Math.max(settings.width,settings.height) * Global.SCALE);
    }

    if (settings.facesImage)
        facesImage = Stencil.newSprite(dice.content,{
            x:0,
            y:0,
            width:settings.width,
            height:settings.height,
            baseColor:baseColor
        },settings.facesImage);

    if (settings.facesLabel)
        facesLabel = Stencil.newLabel(dice.content,{
            x:0,
            y:0,
            width:settings.width,
            height:settings.height,
            fontSize:10,
            fontWeight:"bold",
            textAlign:"center",
            whiteSpace:"nowrap",
            lineHeight:"auto",
            textColor:{ r:255, g:255, b:255, a:1 },
            strokeWidth:0.5,
            strokeColor:{ r:0, g:0, b:0, a:1 }
        },settings.facesLabel);

    // --- Element interfaces

    // --- Element macros

    dice.roll = ()=>{
        rollPhase = 0;
        delete dice.value;
        if (facesImage)
            Stencil.hide(facesImage);
        if (facesLabel)
            Stencil.hide(facesLabel);
        dice.startAnimation("roll");
    }

    dice.flip=()=>{
        flip();
    }

    dice.setSide=(v)=>{
        setValue(v);
    }

    // --- Element properties (transfer)

    Stencil.transferGlobalProperties(settings,dice);
    dice.static = settings.static;
    dice.value = settings.value;
    dice.faces = settings.faces;
    dice.backgroundColor = settings.backgroundColor;
    dice.frame = settings.frame;
    dice.image = settings.image;
    dice.facesImage = settings.facesImage;
    dice.facesLabel = settings.facesLabel;
    dice.messages = settings.messages;
    dice.isFlippable = settings.isFlippable;
    dice.isRotating = settings.isRotating;

    // --- Element properties (setters)

    dice.setDraggable(!!settings.isDraggable);
    dice.setVariableZIndex(!!settings.isVariableZIndex);
    dice.setDragTopSurfaces(!!settings.isDragTopSurfaces);
    dice.setZIndexGroup(settings.zIndexGroup);
    dice.setFence(settings.fence);
    dice.setSimpleDrag(true);

    // --- Element menu

    dice.onContextMenu=(options)=>{
        if (settings.isFlippable && dice.hasMessage("flip"))
            options.push({
                title:dice.getMessage("flip","title"),
                icon:dice.getMessage("flip","icon"),
                action:ACTION_FLIP
            });
        dice.faces.forEach((face,id)=>{
            let
                label = face.label;

            if (!label)
                label = { EN: face.value };

            options.push({
                title:label,
                icon:face.icon,
                action:ACTION_SETFACE,
                face:id
            })
        });
        Stencil.onContextMenuDefault(dice,options);
    }

    dice.onMenuOption=(option)=>{
        if (!Stencil.onMenuOptionDefault(dice,option))
            switch (option.action) {
                case ACTION_FLIP:{
                    flip();
                    break;
                }
                case ACTION_ROLL:{
                    dice.onShake();
                    break;
                }
                case ACTION_SETFACE:{
                    dice.stopAnimation();
                    setValue(option.face);
                    broadcastRolled();
                    break;
                }
            }
        return true;
    }

    dice.setContextMenu(true);

    // --- Element special action
    
    dice.setSpecialAction({
        title:dice.getMessage("roll","title"),
        icon:dice.getMessage("roll","icon"),
        action:ACTION_ROLL
    });
    
    // --- Element interactions

    dice.onDrop=()=>{ Stencil.onDropDefault(dice) }
    dice.onSelect=()=>{ Stencil.onSelectDefault(dice) }
    dice.onShake=()=>{ if (!Stencil.onShakeDefault(dice)) dice.roll(); }
    dice.onClick=()=>{ Stencil.onClickDefault(dice) }

    if (settings.isRotating)
        dice.onRotate=(side)=>{
            let
                value = dice.value+side;

            if (value < 0)
                value = dice.faces.length -1;

            if (value >= dice.faces.length)
                value = 0;

            setValue(value);
            broadcastRolled();
        }

    // --- Element animations

    dice.onAnimation=(id,time)=>{
        switch (id) {
            case "roll":{
                return Stencil.animate(Stencil.ANIMATION_ROLL,time,dice,roll);
            }
            case "flip":{
                return Stencil.animate(Stencil.ANIMATION_JUMP,time,dice);
            }
        }
    }

    dice.onStopAnimation=()=>{
        if (dice.value === undefined)
            roll();
        dice.setAngle(tiltAngle+"rad");
    }

    // --- Element lifecycle: update

    dice.onUpdate=()=>{
        if (dice.value === undefined)
            roll();
        else
            setValue(dice.value);
    }

    // --- Element lifecycle: events

    // --- Element lifecycle: removal

    // --- Element initialization

    tilt();

    return dice;

}
