RESOURCES={
    load:(LANGUAGE,toolbox)=>{
            
        // --- Fonts

        toolbox.addFont("Seshat");
        toolbox.addFont("Notoner");

        // --- Tools
        
        const
            TOOLTYPE_PEN = 0,
            TOOLTYPE_ERASER = 1;

        toolbox.addToolType("TOOLTYPE_PEN",TOOLTYPE_PEN);
        toolbox.addToolType("TOOLTYPE_ERASER",TOOLTYPE_ERASER);

        toolbox.addTool({
            id:"pencil",
            type:TOOLTYPE_PEN,
            icon:"images/pencil.svg",
            iconZindex:100,
            options:[
                { id:"blue", color: { r:0, g:0, b:255, a:1 }, size:0.5, displayColor:{ r:153, g:153, b:255, a:1 }, displaySize:1 },
                { id:"green", color: { r:0, g:255, b:0, a:1 }, size:0.5, displayColor:{ r:153, g:255, b:153, a:1 }, displaySize:1 },
                { id:"red", color: { r:255, g:0, b:0, a:1 },  size:0.5, displayColor:{ r:255, g:153, b:153, a:1 }, displaySize:1 },
                { id:"yellow", color: { r:229, g:229, b:0, a:1 }, size:0.5, displayColor:{ r:255, g:255, b:153, a:1 }, displaySize:1 },
                { id:"cyan", color: { r:4, g:229, b:229, a:1 }, size:0.5, displayColor:{ r:153, g:255, b:255, a:1 }, displaySize:1 },
                { id:"purple", color: { r:255, g:0, b:255, a:1 }, size:0.5, displayColor:{ r:255, g:153, b:255, a:1 }, displaySize:1 },
                { id:"black", color: { r:0, g:0, b:0, a:1 }, size:0.5, displayColor:{ r:153, g:153, b:153, a:1 }, displaySize:1 }
            ]
        });

        toolbox.addTool({
            id:"eraser",
            type:TOOLTYPE_ERASER,
            icon:"images/eraser.svg",
            iconZindex:10,
            options:[
                { id:"large", image:'images/transparent.png', size:5, displaySize:0.75 },
                { id:"medium", image:'images/transparent.png', size:2.5, displaySize:0.4 },
                { id:"small", image:'images/transparent.png', size:1, displaySize:0.16 },
            ]
        });

        // --- Elements

        // --- Dice

        let
            diceStatic = {
                messages:{
                    flip:{ title:LANGUAGE.elements.dice.messages.flip, icon:{ isResource:true, type:"url", url:"/images/icon-flip.svg" } },
                    roll:{ title:LANGUAGE.elements.dice.messages.roll, icon:{ isResource:true, type:"url", url:"/images/icon-shake.svg" } },
                }
            };
            
        [
            { sides: 2, start:1 },
            { sides: 3, start:1 },
            { sides: 4, start:1, image:"/images/elements/dice-d4.svg", lineHeight:25 },
            { sides: 5, start:1, image:"/images/elements/dice-d10.svg" },
            { sides: 6, start:1, flip:true },
            { sides: 6, subId:"pips", start:1, flip:true, icon:"/images/elements/dice-d6-pips-icon.svg", sprites:"/images/elements/dice-d6-pips.svg", title:"titlePips" },
            { sides: 8, start:1, image:"/images/elements/dice-d8.svg" },
            { sides: 10, start:0, image:"/images/elements/dice-d10.svg" },
            { sides: 10, subId:"ten", start:0, multiplier:10, pad:2, image:"/images/elements/dice-d10.svg", title:"titleTens" },
            { sides: 12, start:1, image:"/images/elements/dice-d12.svg" },
            { sides: 20, start:1, image:"/images/elements/dice-d20.svg" },
            { sides: 100, start:1, fontSize:6.5, size:20 },
        ].forEach(dice=>{

            let
                multiplier = dice.multiplier || 1,
                icon = dice.icon || dice.image  || "/images/elements/dice-default.svg",
                size = dice.size || (dice.image ? 20 : 16 ),
                faces = [];

            for (let i=0;i<dice.sides;i++) {
                
                let
                    value = dice.start + i*multiplier,
                    label = value,
                    face;
                
                if (dice.pad)
                    label = Global.padNumber(label,dice.pad,"0");

                if (dice.labels && dice.labels[label])
                    label = dice.labels[label];

                face = { value: value, label:{ EN:label }, icon:{ isResource:true, type:"url", url:icon } };

                if (dice.sprites)
                    face.frame = i;

                faces.push(face);

            }

            toolbox.addElement({
                id:"dice-d"+dice.sides+(dice.subId ? "-"+dice.subId:""),
                meta:{
                    category:[ "dice" ],
                    zIndex:10,
                    placeholders:{
                        sides:dice.sides,
                        valueFirst:dice.start,
                        valueLast:dice.start+(dice.sides-1)*multiplier,
                    },
                    title:LANGUAGE.elements.dice[ dice.title || "title" ],
                    icon: icon,
                    description:LANGUAGE.elements.dice.description,
                    size:{
                        width:size,
                        height:size
                    },
                    options:[
                        {
                            title:LANGUAGE.elements.dice.options.color.title,
                            attribute:"backgroundColor",
                            setting:{
                                type:"color"
                            }
                        }
                    ]
                },
                onLoad:(data)=>{
                    return {
                        surface:new Dice(Stencil.transferGlobalProperties(data,{
                            static:diceStatic,
                            width:size,
                            height:size,
                            faces:faces,
                            frame: !dice.image,
                            image: dice.image ? { image:{ isResource:true, type:"url", url:dice.image, meta: { svg:{ baseColor:"#ffffff" }} } } : 0,
                            facesImage:dice.sprites ? {
                                image:{
                                    isResource:true,
                                    type:"url",
                                    url:dice.sprites,
                                    meta:{ sprite: { width:20, height:20, gapX:2 } }
                                }
                            } : 0,
                            facesLabel:dice.sprites ? 0 : {
                                fontSize:dice.fontSize,
                                lineHeight:dice.lineHeight || "auto"
                            },
                            isFlippable:dice.flip,
                            isRotating:true,
                            value:data.value,
                            backgroundColor:data.backgroundColor,
                            messages:data.messages
                        })),
                        default:{
                            x:data.x,
                            y:data.y,
                        }
                    }
                },
                onSave:(surface)=>{
                    return Stencil.transferGlobalProperties(surface,{
                        backgroundColor:surface.backgroundColor,
                        value:surface.value,
                        messages:surface.messages
                    });
                },
                onReset:(surface,data)=>{
                    surface.setPosition(data.x,data.y,true);
                }
            });

        });

        toolbox.addElement({
            id:"dice-custom",
            onLoad:(data)=>{
                return {
                    surface:new Dice(Stencil.transferGlobalProperties(data,{
                        static:diceStatic,
                        width:data.width,
                        height:data.height,
                        value:data.value,
                        faces:data.faces,
                        isFlippable:data.isFlippable,
                        backgroundColor:data.backgroundColor,
                        frame:data.frame,
                        image:data.image,
                        isRotating:data.isRotating,
                        facesImage:data.facesImage,
                        facesLabel:data.facesLabel,
                        messages:data.messages
                    })),
                    default:{
                        x:data.x,
                        y:data.y,
                    }
                }
            },
            onSave:(surface)=>{
                return Stencil.transferGlobalProperties(surface,{
                    width:surface.width,
                    height:surface.height,
                    value:surface.value,
                    faces:surface.faces,
                    backgroundColor:surface.backgroundColor,
                    isRotating:surface.isRotating,
                    frame:surface.frame,
                    image:surface.image,
                    facesImage:surface.facesImage,
                    facesLabel:surface.facesLabel,
                    messages:surface.messages,
                    isFlippable:surface.isFlippable
                })
            },
            onReset:(surface,data)=>{
                surface.setPosition(data.x,data.y,true);
            }
        });

        // --- Tokens

        let
            tokenStatic = {
                messages:{
                    flip:{ title:LANGUAGE.elements.tokens.messages.flip, icon:{ isResource:true, type:"url", url:"/images/icon-flip.svg" } },
                    toss:{ title:LANGUAGE.elements.tokens.messages.toss, icon:{ isResource:true, type:"url", url:"/images/icon-toss.svg" } },
                    spin:{ title:LANGUAGE.elements.tokens.messages.spin, icon:{ isResource:true, type:"url", url:"/images/icon-spin.svg" } },
                    rotateStraight:{ title:LANGUAGE.elements.tokens.messages.straight, icon:{ isResource:true, type:"url", url:"/images/icon-rotate-straight.svg" } },
                    rotateUpsideDown:{ title:LANGUAGE.elements.tokens.messages.upsideDown, icon:{ isResource:true, type:"url", url:"/images/icon-rotate-upsidedown.svg" } },
                    rotateRight:{ title:LANGUAGE.elements.tokens.messages.right, icon:{ isResource:true, type:"url", url:"/images/icon-rotate-right.svg" } },
                    rotateLeft:{ title:LANGUAGE.elements.tokens.messages.left, icon:{ isResource:true, type:"url", url:"/images/icon-rotate-left.svg" } },
                    cutPasteFace:{ title:LANGUAGE.elements.tokens.messages.cutPasteFace, icon:{ isResource:true, type:"url", url:"/images/icon-glue.svg" } },
                    cutSelectBack:{ title:LANGUAGE.elements.tokens.messages.cutSelectBack },
                    cutSelectBackNotFound:{ title:LANGUAGE.elements.tokens.messages.cutSelectBackNotFound },
                    cutRemoveFace:{ title:LANGUAGE.elements.tokens.messages.cutRemoveFace, icon:{ isResource:true, type:"url", url:"/images/icon-trash.svg" } },
                    cutRemove:{ title:LANGUAGE.elements.tokens.messages.cutRemove, icon:{ isResource:true, type:"url", url:"/images/icon-trash.svg" } }
                }
            },
            tokenPeepleUpImage = { image:{ isResource:true, type:"url", url:"/images/elements/peeple-up.svg", meta: { svg:{ baseColor:"#ffffff" }} } },
            tokenPeepleDownImage = { image:{ isResource:true, type:"url", url:"/images/elements/peeple-down.svg", meta: { svg:{ baseColor:"#ffffff" }} } };

        [
            8,12,16,20
        ].forEach((size,id)=>{

            toolbox.addElement({
                id:"token-"+id,
                meta:{
                    category:[ "tokens" ],
                    zIndex:10,
                    title:LANGUAGE.elements.tokens.title[id],
                    icon:"/images/elements/token.svg",
                    description:LANGUAGE.elements.tokens.description,
                    size:{
                        width:size,
                        height:size
                    },
                    options:[
                        {
                            title:LANGUAGE.elements.tokens.options.color.title,
                            attribute:"backgroundColor",
                            setting:{
                                type:"color"
                            }
                        },{
                            title:LANGUAGE.elements.tokens.options.label.title,
                            description:LANGUAGE.elements.tokens.options.label.description,
                            attribute:"labelText.EN",
                            setting:{
                                type:"input",
                                default:""
                            }
                        },{
                            title:LANGUAGE.elements.tokens.options.isTransparent.title,
                            description:LANGUAGE.elements.tokens.options.isTransparent.description,
                            attribute:"isTransparent",
                            setting:{
                                type:"checkbox",
                                default:false
                            }
                        },{
                            title:LANGUAGE.elements.tokens.options.mode.title,
                            attribute:"mode",
                            setting:{
                                type:"radio",
                                options:[
                                    {
                                        title:LANGUAGE.elements.tokens.options.mode.squared,
                                        value:0
                                    },{
                                        title:LANGUAGE.elements.tokens.options.mode.rounded,
                                        value:1
                                    },{
                                        title:LANGUAGE.elements.tokens.options.mode.circle,
                                        value:2
                                    }
                                ]
                            }
                        }
                    ]
                },
                onLoad:(data)=>{
                    let
                        isRotating = !!(data.labelText && data.labelText.EN);
                    return {
                        surface:new Token(Stencil.transferGlobalProperties(data,{
                            static:tokenStatic,
                            width:size,
                            height:size,
                            frame:true,
                            label:true,
                            mode:data.mode,
                            isRotating:isRotating,
                            isSpinnable:isRotating,
                            rotation:data.rotation,
                            labelText:data.labelText,
                            backgroundColor: data.backgroundColor,
                            isTransparent: data.isTransparent
                        })),
                        default:{
                            x:data.x,
                            y:data.y,
                            rotation:data.rotation
                        }
                    }
                },
                onSave:(surface)=>{
                    return Stencil.transferGlobalProperties(surface,{
                        mode:surface.mode,
                        labelText:surface.labelText,
                        backgroundColor:surface.backgroundColor,
                        isTransparent:surface.isTransparent,
                        rotation:surface.rotation
                    })
                },
                onReset:(surface,data)=>{
                    surface.setRotation(data.rotation);
                    surface.setPosition(data.x,data.y,true);
                }
            });

            toolbox.addElement({
                id:"token-"+id+"-flip",
                meta:{
                    category:[ "tokens" ],
                    zIndex:10,
                    title:LANGUAGE.elements.tokens.flipTitle[id],
                    icon:"/images/elements/token.svg",
                    description:LANGUAGE.elements.tokens.flipDescription,
                    size:{
                        width:size,
                        height:size
                    },
                    options:[
                        {
                            title:LANGUAGE.elements.tokens.options.frontColor.title,
                            attribute:"backgroundColor",
                            setting:{
                                type:"color"
                            }
                        },{
                            title:LANGUAGE.elements.tokens.options.frontLabel,
                            description:LANGUAGE.elements.tokens.options.label.description,
                            attribute:"labelText.EN",
                            setting:{
                                type:"input",
                                default:""
                            }
                        },{
                            title:LANGUAGE.elements.tokens.options.flipColor.title,
                            attribute:"flipBackgroundColor",
                            setting:{
                                type:"color"
                            }
                        },{
                            title:LANGUAGE.elements.tokens.options.flipLabel,
                            description:LANGUAGE.elements.tokens.options.label.description,
                            attribute:"flipLabelText.EN",
                            setting:{
                                type:"input",
                                default:""
                            }
                        },{
                            title:LANGUAGE.elements.tokens.options.isTransparent.title,
                            description:LANGUAGE.elements.tokens.options.isTransparent.description,
                            attribute:"isTransparent",
                            setting:{
                                type:"checkbox",
                                default:false
                            }
                        },{
                            title:LANGUAGE.elements.tokens.options.mode.title,
                            attribute:"mode",
                            setting:{
                                type:"radio",
                                options:[
                                    {
                                        title:LANGUAGE.elements.tokens.options.mode.squared,
                                        value:0
                                    },{
                                        title:LANGUAGE.elements.tokens.options.mode.rounded,
                                        value:1
                                    },{
                                        title:LANGUAGE.elements.tokens.options.mode.circle,
                                        value:2
                                    }
                                ]
                            }
                        }
                    ]
                },
                onLoad:(data)=>{
                    let
                        isRotating = !!((data.labelText && data.labelText.EN) || (data.flipLabelText && data.flipLabelText.EN));
                    return {
                        surface:new Token(Stencil.transferGlobalProperties(data,{
                            static:tokenStatic,
                            width:size,
                            height:size,
                            frame:true,
                            label:true,
                            mode:data.mode,
                            side:data.side,
                            isFlippable:true,
                            isCut:false,
                            isSpinnable:isRotating,
                            isRotating:isRotating,
                            rotation:data.rotation,
                            backgroundColor: data.backgroundColor,
                            labelText:data.labelText,
                            flipLabelText: data.flipLabelText,
                            flipBackgroundColor: data.flipBackgroundColor,
                            isTransparent: data.isTransparent,
                            messages:data.messages
                        })),
                        default:{
                            x:data.x,
                            y:data.y,
                            side:data.side,
                            rotation:data.rotation
                        }
                    }
                },
                onSave:(surface)=>{
                    return Stencil.transferGlobalProperties(surface,{
                        mode:surface.mode,
                        side:surface.side,
                        backgroundColor:surface.backgroundColor,
                        labelText:surface.labelText,
                        flipLabelText:surface.flipLabelText,
                        flipBackgroundColor:surface.flipBackgroundColor,
                        isTransparent:surface.isTransparent,
                        rotation:surface.rotation,
                        messages:surface.messages
                    })
                },
                onReset:(surface,data)=>{
                    surface.setRotation(data.rotation);
                    surface.setPosition(data.x,data.y,true);
                    surface.setSide(data.side);
                }
            });

            toolbox.addElement({
                id:"token-"+id+"-peeple",
                meta:{
                    category:[ "tokens" ],
                    zIndex:10,
                    title:LANGUAGE.elements.tokens.peepleTitle[id],
                    icon:"/images/elements/peeple-up.svg",
                    description:LANGUAGE.elements.tokens.peepleDescription,
                    size:{
                        width:size,
                        height:size
                    },
                    options:[
                        {
                            title:LANGUAGE.elements.tokens.options.frontColor.title,
                            attribute:"backgroundColor",
                            setting:{
                                type:"color"
                            }
                        },{
                            title:LANGUAGE.elements.tokens.options.isTransparent.title,
                            description:LANGUAGE.elements.tokens.options.isTransparent.description,
                            attribute:"isTransparent",
                            setting:{
                                type:"checkbox",
                                default:false
                            }
                        }
                    ]
                },
                onLoad:(data)=>{
                    return {
                        surface:new Token(Stencil.transferGlobalProperties(data,{
                            static:tokenStatic,
                            width:size,
                            height:size,
                            mode:-1,
                            isRotating:true,
                            isFlippable:true,
                            isSpinnable:true,
                            isCut:false,
                            image:tokenPeepleUpImage,
                            flipImage:tokenPeepleDownImage,
                            side:data.side,
                            rotation:data.rotation,
                            backgroundColor: data.backgroundColor,
                            isTransparent: data.isTransparent,
                            messages:data.messages
                        })),
                        default:{
                            x:data.x,
                            y:data.y,
                            side:data.side,
                            rotation:data.rotation
                        }
                    }
                },
                onSave:(surface)=>{
                    return Stencil.transferGlobalProperties(surface,{
                        backgroundColor: surface.backgroundColor,
                        isTransparent: surface.isTransparent,
                        side: surface.side,
                        rotation:surface.rotation,
                        messages:surface.messages
                    })
                },
                onReset:(surface,data)=>{
                    surface.setRotation(data.rotation);
                    surface.setPosition(data.x,data.y,true);
                    surface.setSide(data.side);
                }
            });

        });

        toolbox.addElement({
            id:"token-custom",
            onLoad:(data)=>{
                return {
                    surface:new Token(Stencil.transferGlobalProperties(data,{
                        static:tokenStatic,
                        messages:data.messages,
                        width:data.width,
                        height:data.height,
                        value:data.value,
                        mode:data.mode,
                        frame:data.frame,
                        image:data.image,
                        label:data.label,
                        labelText:data.labelText,
                        side:data.side,
                        backgroundColor: data.backgroundColor,
                        isTransparent: data.isTransparent,
                        flipImage:data.flipImage,
                        flipBackgroundColor:data.flipBackgroundColor,
                        flipLabelText:data.flipLabelText,
                        flipValue:data.flipValue,
                        isRotating:data.isRotating,
                        rotation:data.rotation,
                        isFlippable:data.isFlippable,
                        isSpinnable:data.isSpinnable,
                        isCut:data.isCut,
                        contentRotations:data.contentRotations
                    })),
                    default:{
                        x:data.x,
                        y:data.y,
                        side:data.side,
                        rotation:data.rotation
                    }
                }
            },
            onSave:(surface)=>{
                return Stencil.transferGlobalProperties(surface,{
                    messages:surface.messages,
                    width:surface.width,
                    height:surface.height,
                    value:surface.value,
                    mode:surface.mode,
                    frame:surface.frame,
                    image:surface.image,
                    label:surface.label,
                    labelText:surface.labelText,
                    side:surface.side,
                    backgroundColor: surface.backgroundColor,
                    isTransparent: surface.isTransparent,
                    flipImage:surface.flipImage,
                    flipBackgroundColor:surface.flipBackgroundColor,
                    flipLabelText:surface.flipLabelText,
                    flipValue:surface.flipValue,
                    isRotating:surface.isRotating,
                    rotation:surface.rotation,
                    isFlippable:surface.isFlippable,
                    isSpinnable:surface.isSpinnable,
                    isCut:surface.isCut,
                    contentRotations:surface.contentRotations
                })
            },
            onReset:(surface,data)=>{
                surface.setRotation(data.rotation);
                surface.setPosition(data.x,data.y,true);
                surface.setSide(data.side);
            }
        });

        // --- Sheet

        toolbox.addElement({
            id:"sheet",
            onLoad:(data)=>{
                return {
                    surface:new Sheet(Stencil.transferGlobalProperties(data,{
                        static:false,
                        resolution:3,
                        backgroundColor:data.backgroundColor,
                        width:data.width,
                        height:data.height,
                        model:data.model,
                        modelOpacity:data.modelOpacity,
                        image:data.image,
                        isReadOnly:data.isReadOnly,
                        pattern:data.pattern,
                        frame:data.frame,
                        fields:data.fields
                    })),
                    default:{
                        x:data.x,
                        y:data.y,
                    }
                }
            },
            onSave:(surface)=>{
                return Stencil.transferGlobalProperties(surface,{
                    backgroundColor:surface.backgroundColor,
                    width:surface.width,
                    height:surface.height,
                    model:surface.model,
                    modelOpacity:surface.modelOpacity,
                    image:surface.getImage(),
                    isReadOnly:surface.isReadOnly,
                    pattern:surface.pattern,
                    frame:surface.frame,
                    fields:surface.fields
                })
            },
            onReset:(surface,data)=>{
                surface.setPosition(data.x,data.y,true);
                surface.reset();
            }
        });

        [
            { id:"landscape", width:297, height:210 },
            { id:"portrait", width:210, height:297 }
        ].forEach(size=>{

            toolbox.addElement({
                id:"sheet-blank-"+size.id,
                meta:{
                    isSheet:true,
                    category:[ "sheets" ],
                    zIndex:0,
                    title:LANGUAGE.elements.blankSheet[size.id],
                    icon:"/images/elements/sheet.svg",
                    description:LANGUAGE.elements.blankSheet.description,
                    size:{
                        width:size.width,
                        height:size.height
                    },
                    options:[
                        {
                            title:LANGUAGE.elements.blankSheet.options.patternMode,
                            attribute:"pattern.type",
                            setting:{
                                type:"radio",
                                options:[
                                    {
                                        title:LANGUAGE.elements.blankSheet.options.patternModes[0],
                                        value:0
                                    },{
                                        title:LANGUAGE.elements.blankSheet.options.patternModes[1],
                                        value:1
                                    },{
                                        title:LANGUAGE.elements.blankSheet.options.patternModes[2],
                                        value:2
                                    },{
                                        title:LANGUAGE.elements.blankSheet.options.patternModes[3],
                                        value:3
                                    },{
                                        title:LANGUAGE.elements.blankSheet.options.patternModes[4],
                                        value:4
                                    }
                                ]
                            }
                        },
                        {
                            title:LANGUAGE.elements.blankSheet.options.patternColor,
                            attribute:"pattern.color",
                            setting:{
                                type:"color",
                                default:7
                            }
                        },{
                            title:LANGUAGE.elements.blankSheet.options.patternSize,
                            attribute:"pattern.width",
                            setting:{
                                type:"radio",
                                default:10,
                                options:[
                                    {
                                        title:LANGUAGE.elements.blankSheet.options.patternSizes[0],
                                        value:5
                                    },{
                                        title:LANGUAGE.elements.blankSheet.options.patternSizes[1],
                                        value:10
                                    },{
                                        title:LANGUAGE.elements.blankSheet.options.patternSizes[2],
                                        value:15
                                    }
                                ]
                            }
                        }
                    ]
                },
                onLoad:(data)=>{
                    return {
                        surface:new Sheet(Stencil.transferGlobalProperties(data,{
                            static:false,
                            width:size.width,
                            height:size.height,
                            resolution:3,
                            frame:true,
                            image:data.image,
                            pattern:data.pattern
                        })),
                        default:{
                            x:data.x,
                            y:data.y,
                        }
                    }
                },
                onSave:(surface)=>{
                    return Stencil.transferGlobalProperties(surface,{
                        image:surface.getImage(),
                        pattern:surface.pattern
                    })
                },
                onReset:(surface,data)=>{
                    surface.setPosition(data.x,data.y,true);
                    surface.reset();
                }
            });    
        });

        // --- Timer

        let
            timerStatic = {
                icon:{ isResource:true, type:"url", url:"/images/elements/clock.svg", meta: { svg:{ baseColor:"#000000" } } },
                messages:{
                    start:{ title:LANGUAGE.elements.timer.messages.start, icon:{ isResource:true, type:"url", url:"/images/elements/clock.svg" } },
                    stop:{ title:LANGUAGE.elements.timer.messages.stop, icon:{ isResource:true, type:"url", url:"/images/elements/clock.svg" } },
                    startStop:{ title:LANGUAGE.elements.timer.messages.startStop, icon:{ isResource:true, type:"url", url:"/images/elements/clock.svg" } },
                    reset:{ title:LANGUAGE.elements.timer.messages.reset, icon:{ isResource:true, type:"url", url:"/images/elements/clock.svg" } },
                    restart:{ title:LANGUAGE.elements.timer.messages.restart, icon:{ isResource:true, type:"url", url:"/images/elements/clock.svg" } },
                    timeUp:{ title:LANGUAGE.elements.timer.messages.timeUp, icon:{ isResource:true, type:"url", url:"/images/elements/clock.svg"  } }
                }
            };

        toolbox.addElement({
            id:"timer-clock",
            meta:{
                category:[ "timers" ],
                zIndex:10,
                title:LANGUAGE.elements.timer.clock.title,
                icon: "/images/elements/clock.svg",
                description:LANGUAGE.elements.timer.clock.description,
                size:{
                    width:30,
                    height:30
                },
                options:[
                    {
                        title:LANGUAGE.elements.timer.options.color.title,
                        attribute:"backgroundColor",
                        setting:{
                            type:"color"
                        }
                    }
                ]
            },
            onLoad:(data)=>{
                return {
                    surface:new Timer(Stencil.transferGlobalProperties(data,{
                        static:timerStatic,
                        width:30,
                        height:30,
                        frame:true,
                        count:data.count,
                        backgroundColor:data.backgroundColor,
                        messages:data.messages
                    })),
                    default:{
                        x:data.x,
                        y:data.y,
                    }
                }
            },
            onSave:(surface)=>{
                return Stencil.transferGlobalProperties(surface,{
                    count:surface.count,
                    backgroundColor:surface.backgroundColor,
                    messages:surface.messages
                })
            },
            onReset:(surface,data)=>{
                surface.setPosition(data.x,data.y,true);
                surface.reset();
            }
        });

        toolbox.addElement({
            id:"timer-countdown",
            meta:{
                category:[ "timers" ],
                zIndex:10,
                title:LANGUAGE.elements.timer.countdown.title,
                icon: "/images/elements/clock.svg",
                description:LANGUAGE.elements.timer.countdown.description,
                size:{
                    width:30,
                    height:30
                },
                options:[
                    {
                        title:LANGUAGE.elements.timer.options.color.title,
                        attribute:"backgroundColor",
                        setting:{
                            type:"color"
                        }
                    },{
                        title:LANGUAGE.elements.timer.options.timeLeft.title,
                        description:LANGUAGE.elements.timer.options.timeLeft.description,
                        attribute:"timeLeft",
                        setting:{
                            type:"number",
                            isInteger:true,
                            default:60,
                            min:1,
                            max:3600,
                            step:1,
                            unit:LANGUAGE.elements.timer.options.timeLeft.unit
                        }
                    }
                ]
            },
            onLoad:(data)=>{
                return {
                    surface:new Timer(Stencil.transferGlobalProperties(data,{
                        static:timerStatic,
                        width:30,
                        height:30,
                        frame:true,
                        count:data.count,
                        timeLeft:data.timeLeft,
                        backgroundColor:data.backgroundColor,
                        messages:data.messages
                    })),
                    default:{
                        x:data.x,
                        y:data.y
                    }
                }
            },
            onSave:(surface)=>{
                return Stencil.transferGlobalProperties(surface,{
                    count:surface.count,
                    timeLeft:surface.timeLeft,
                    backgroundColor:surface.backgroundColor,
                    messages:surface.messages
                })
            },
            onReset:(surface,data)=>{
                surface.setPosition(data.x,data.y,true);
                surface.reset();
            }
        });

        toolbox.addElement({
            id:"timer-custom",
            onLoad:(data)=>{
                return {
                    surface:new Timer(Stencil.transferGlobalProperties(data,{
                        static:timerStatic,
                        width:data.width,
                        height:data.height,
                        frame:data.frame,
                        backgroundColor:data.backgroundColor,
                        label:data.label,
                        count:data.count,
                        timeLeft:data.timeLeft,
                        messages:data.messages
                    })),
                    default:{
                        x:data.x,
                        y:data.y
                    }
                }
            },
            onSave:(surface)=>{
                return Stencil.transferGlobalProperties(surface,{
                    width:surface.width,
                    height:surface.height,
                    frame:surface.frame,
                    backgroundColor:surface.backgroundColor,
                    label:surface.label,
                    count:surface.count,
                    timeLeft:surface.timeLeft,
                    messages:surface.messages
                })
            },
            onReset:(surface,data)=>{
                surface.setPosition(data.x,data.y,true);
                surface.reset();
            }
        });

        // --- Tray

        let
            CARDSHUFFLER_TRAY_MARGIN = 10,
            CARDSHUFFLER_CARD_GAPY=0.25,
            CARDSHUFFLER_CARDWIDTH = 63.5,
            CARDSHUFFLER_CARDHEIGHT = 88,
            CARDSHUFFLER_DECKSIZE = 50,
            trayStatic={
                messages:{
                    shake:{ title:LANGUAGE.elements.tray.messages.shake, icon:{ isResource:true, type:"url", url:"/images/icon-shake.svg" } }
                },
                icon:{ isResource:true, type:"url", url:"/images/elements/tray.svg", meta: { svg:{ baseColor:"#000000" } } }
            },
            trayShufflerStatic = {
                onShakeMacro:{
                    getElementsByTag:[ "card", "cut" ],
                    onElements:{ if:{ isSelected:true} },
                    forEach:{
                        setSide:true,
                        shuffleZIndex:true,
                        shuffle:true,
                        setRotation:0,
                        moveTo:{
                            x:CARDSHUFFLER_TRAY_MARGIN,
                            y:CARDSHUFFLER_TRAY_MARGIN,
                            gapX:0,
                            gapY:CARDSHUFFLER_CARD_GAPY
                        }
                    }
                },
                onMenuMacros:[
                    {
                        title:LANGUAGE.elements.cardShuffler.flip,
                        icon: {
                            isResource: true,
                            type: "url",
                            url: "/images/icon-flip.svg"
                        },
                        macro:{
                            getElementsByTag:[ "card", "cut" ],
                            onElements:{ if:{ isSelected:true} },
                            forEach:{
                                flip:true,
                                invertZIndex:true,
                                setRotation:0,
                                moveTo:{
                                    x:CARDSHUFFLER_TRAY_MARGIN,
                                    y:CARDSHUFFLER_TRAY_MARGIN,
                                    gapY:CARDSHUFFLER_CARD_GAPY
                                }                    
                            }
                        }
                    }
                ],
                icon:{ isResource:true, type:"url", url:"/images/elements/tray.svg", meta: { svg:{ baseColor:"#000000" } } },
                messages:{
                    shake:{
                        title:LANGUAGE.elements.cardShuffler.shuffle,
                        icon: {
                            isResource: true,
                            type: "url",
                            url: "/images/icon-cards.svg"
                        }
                    }
                }
            };

        toolbox.addElement({
            id:"tray",
            meta:{
                category:[ "accessories" ],
                zIndex:5,
                title:LANGUAGE.elements.tray.title,
                icon:"/images/elements/tray.svg",
                size:{
                    width:75,
                    height:50
                },
                description:LANGUAGE.elements.tray.description,
                options:[
                    {
                        title:LANGUAGE.elements.tray.options.color.title,
                        attribute:"backgroundColor",
                        setting:{
                            type:"color"
                        }
                    },{
                        title:LANGUAGE.elements.tray.options.mode.title,
                        attribute:"mode",
                        setting:{
                            type:"radio",
                            options:[
                                {
                                    title:LANGUAGE.elements.tray.options.mode.modeSum.title,
                                    description:LANGUAGE.elements.tray.options.mode.modeSum.description,
                                    value:0
                                },{
                                    title:LANGUAGE.elements.tray.options.mode.modeSubtract.title,
                                    description:LANGUAGE.elements.tray.options.mode.modeSubtract.description,
                                    value:1
                                }
                            ]
                        }
                    }
                ]
            },
            onLoad:(data)=>{
                return {
                    surface:new Tray(Stencil.transferGlobalProperties(data,{
                        static:trayStatic,
                        width:75,
                        height:50,
                        frame:true,
                        splitPosition:0.7,
                        mode:data.mode,
                        backgroundColor:data.backgroundColor,
                        messages:data.messages
                    })),
                    default:{
                        x:data.x,
                        y:data.y
                    }
                };
            },
            onSave:(surface)=>{
                return Stencil.transferGlobalProperties(surface,{
                    mode:surface.mode,
                    backgroundColor:surface.backgroundColor,
                    messages:surface.messages
                })
            },
            onReset:(surface,data)=>{
                surface.setPosition(data.x,data.y,true);
            }
        });

        toolbox.addElement({
            id:"tray-cardshuffler",
            meta:{
                category:[ "cards" ],
                zIndex:5,
                title:LANGUAGE.elements.cardShuffler.title,
                icon:"/images/elements/tray.svg",
                size:{
                    width:CARDSHUFFLER_CARDWIDTH*2+CARDSHUFFLER_TRAY_MARGIN*3,
                    height:CARDSHUFFLER_CARDHEIGHT+(CARDSHUFFLER_DECKSIZE*CARDSHUFFLER_CARD_GAPY)+CARDSHUFFLER_TRAY_MARGIN*2
                },
                description:LANGUAGE.elements.cardShuffler.description,
                options:[
                    {
                        title:LANGUAGE.elements.cardShuffler.color.title,
                        attribute:"backgroundColor",
                        setting:{
                            type:"color"
                        }
                    }
                ]
            },
            onLoad:(data)=>{
                return {
                    surface:new Tray(Stencil.transferGlobalProperties(data,{
                        static:trayShufflerStatic,
                        frame:true,
                        backgroundColor:data.backgroundColor,
                        mode: -1,
                        width:data.width,
                        height:data.height,
                        messages:data.messages,
                        label:data.label,
                        labelText:data.labelText,
                        image:data.image
                    })),
                    default:{
                        x:data.x,
                        y:data.y
                    }
                };
            },
            onSave:(surface)=>{
                return Stencil.transferGlobalProperties(surface,{
                    width:surface.width,
                    height:surface.height,
                    backgroundColor:surface.backgroundColor,
                    messages:surface.messages,
                    label:surface.label,
                    labelText:surface.labelText,
                    image:surface.image
                })
            },
            onReset:(surface,data)=>{
                surface.setPosition(data.x,data.y,true);
            }
        });

        toolbox.addElement({
            id:"tray-custom",
            onLoad:(data)=>{
                return {
                    surface:new Tray(Stencil.transferGlobalProperties(data,{
                        static:trayStatic,
                        width:data.width,
                        height:data.height,
                        label:data.label,
                        labelText:data.labelText,
                        frame:data.frame,
                        mode:data.mode,
                        backgroundColor:data.backgroundColor,
                        splitPosition:data.splitPosition,
                        countValues:data.countValues,
                        sumLabel:data.sumLabel,
                        leftLabel:data.leftLabel,
                        rightLabel:data.rightLabel,
                        bottomLabel:data.bottomLabel,
                        messages:data.messages,
                        image:data.image
                    })),
                    default:{
                        x:data.x,
                        y:data.y
                    }
                };
            },
            onSave:(surface)=>{
                return Stencil.transferGlobalProperties(surface,{
                    width:surface.width,
                    height:surface.height,
                    label:surface.label,
                    labelText:surface.labelText,
                    frame:surface.frame,
                    mode:surface.mode,
                    backgroundColor:surface.backgroundColor,
                    splitPosition:surface.splitPosition,
                    countValues:surface.countValues,
                    sumLabel:surface.sumLabel,
                    leftLabel:surface.leftLabel,
                    rightLabel:surface.rightLabel,
                    bottomLabel:surface.bottomLabel,
                    messages:surface.messages,
                    image:surface.image
                })
            },
            onReset:(surface,data)=>{
                surface.setPosition(data.x,data.y,true);
            }
        });

        // --- Line

        let
            lineStatic = {
                icon:{ isResource:true, type:"url", url:"/images/elements/ruler.svg", meta: { svg:{ baseColor:"#000000" } } }
            };

        [
            { id:"compass", icon:"/images/elements/compass.svg", draw:{ circle:true }, frame:true, guideLine:true, guideCircle:true, guideLabel:true },
            { id:"ruler", icon:"/images/elements/ruler.svg", draw:{ line:true }, frame:{ borderRadius:0 }, guideLine:true, guideLabel:true }
        ].forEach(element=>{
            let
                lineElementStatic = {
                    icon:{ isResource:true, type:"url", url:element.icon, meta: { svg:{ baseColor:"#000000" } } }
                };
            toolbox.addElement({
                id:"line-"+element.id,
                meta:{
                    category:[ "accessories" ],
                    zIndex:10,
                    title:LANGUAGE.elements[element.id].title,
                    icon:element.icon,
                    size:{
                        width:30,
                        height:30
                    },
                    description:LANGUAGE.elements[element.id].description,
                    options:[
                        {
                            title:LANGUAGE.elements.lineTool.options.color.title,
                            attribute:"backgroundColor",
                            setting:{
                                type:"color"
                            }
                        },{
                            title:LANGUAGE.elements.lineTool.options.preview.title,
                            description:LANGUAGE.elements.lineTool.options.preview.description,
                            attribute:"previewTool.border",
                            setting:{
                                type:"checkbox",
                                default:false
                            }
                        }
                    ]
                },
                onLoad:(data)=>{
                    return {
                        surface:new Line(Stencil.transferGlobalProperties(data,{
                            static:lineElementStatic,
                            width:30,
                            height:30,
                            guideLabel:element.guideLabel,
                            guideLine:element.guideLine,
                            guideCircle:element.guideCircle,
                            draw:element.draw,
                            frame:element.frame,
                            drawOnClick:true,
                            onShakeShuffle:true,
                            rotationAngle:Math.PI/4,
                            drawOnTags:data.drawOnTags,
                            previewTool:data.previewTool,
                            backgroundColor:data.backgroundColor,
                            lastVector:data.lastVector,
                            lastStep:data.lastStep
                        })),
                        default:{
                            x:data.x,
                            y:data.y,
                            lastVector:data.lastVector,
                            lastStep:data.lastStep
                        }
                    };
                },
                onSave:(surface)=>{
                    return Stencil.transferGlobalProperties(surface,{
                        drawOnTags:surface.drawOnTags,
                        previewTool:surface.previewTool,
                        backgroundColor:surface.backgroundColor,
                        lastVector:surface.lastVector,
                        lastStep:surface.lastStep
                    })
                },
                onReset:(surface,data)=>{
                    surface.setPosition(data.x,data.y,true);
                    surface.setLastVector(data.lastVector);
                    surface.setLastStep(data.lastStep);
                }
            });
        })

        toolbox.addElement({
            id:"line-custom",
            onLoad:(data)=>{
                return {
                    surface:new Line(Stencil.transferGlobalProperties(data,{
                        static:lineStatic,
                        width:data.width,
                        height:data.height,
                        guideLabel:data.guideLabel,
                        guideCircle:data.guideCircle,
                        guideLine:data.guideLine,
                        draw:data.draw,
                        frame:data.frame,
                        center:data.center,
                        onShakeShuffle:data.onShakeShuffle,
                        rotationAngle:data.rotationAngle,
                        drawOnTags:data.drawOnTags,
                        distance:data.distance,
                        previewTool:data.previewTool,
                        drawOnDrag:data.drawOnDrag,
                        drawOnClick:data.drawOnClick,
                        onDrawExpand:data.onDrawExpand,
                        backgroundColor:data.backgroundColor,
                        isTargetLocked:data.isTargetLocked,
                        lastVector:data.lastVector,
                        lastStep:data.lastStep
                    })),
                    default:{
                        x:data.x,
                        y:data.y,
                        lastVector:data.lastVector,
                        lastStep:data.lastStep
                    }
                };
            },
            onSave:(surface)=>{
                return Stencil.transferGlobalProperties(surface,{
                    width:surface.width,
                    height:surface.height,
                    guideLabel:surface.guideLabel,
                    guideCircle:surface.guideCircle,
                    guideLine:surface.guideLine,
                    draw:surface.draw,
                    frame:surface.frame,
                    center:surface.center,
                    onShakeShuffle:surface.onShakeShuffle,
                    rotationAngle:surface.rotationAngle,
                    previewTool:surface.previewTool,
                    drawOnTags:surface.drawOnTags,
                    distance:surface.distance,
                    drawOnDrag:surface.drawOnDrag,
                    drawOnClick:surface.drawOnClick,
                    onDrawExpand:surface.onDrawExpand,
                    backgroundColor:surface.backgroundColor,
                    isTargetLocked:surface.isTargetLocked,
                    lastVector:surface.lastVector,
                    lastStep:surface.lastStep
                })
            },
            onReset:(surface,data)=>{
                surface.setPosition(data.x,data.y,true);
                surface.setLastVector(data.lastVector);
                surface.setLastStep(data.lastStep);
            }
        });

        // --- Catapult

        let
            catapultStatic = {
                icon:{ isResource:true, type:"url", url:"/images/elements/catapult.svg", meta: { svg:{ baseColor:"#000000" } } },
                messages:{
                    setTarget:{ title:LANGUAGE.elements.catapult.messages.setTarget, icon:{ isResource:true, type:"url", url:"/images/icon-target.svg" } },
                    launch:{ title:LANGUAGE.elements.catapult.messages.launch, icon:{ isResource:true, type:"url", url:"/images/elements/catapult.svg" } },
                }
            };

        toolbox.addElement({
            id:"catapult",
            meta:{
                category:[ "accessories" ],
                zIndex:10,
                title:LANGUAGE.elements.catapult.title,
                icon:"/images/elements/catapult.svg",
                size:{
                    width:50,
                    height:75
                },
                description:LANGUAGE.elements.catapult.description,
                options:[
                    {
                        title:LANGUAGE.elements.catapult.options.color.title,
                        attribute:"backgroundColor",
                        setting:{
                            type:"color"
                        }
                    }
                ]
            },
            onLoad:(data)=>{
                return {
                    surface:new Catapult(Stencil.transferGlobalProperties(data,{
                        static:catapultStatic,
                        width:50,
                        height:75,
                        guideLine:true,
                        frame:true,
                        onShakeLaunch:true,
                        onLaunchShake:true,
                        launchTags:data.launchTags,
                        launchOnTags:data.launchOnTags,
                        lastPoint:data.lastPoint,
                        backgroundColor:data.backgroundColor,
                        messages:data.messages
                    })),
                    default:{
                        x:data.x,
                        y:data.y,
                        lastPoint:data.lastPoint
                    }
                };
            },
            onSave:(surface)=>{
                return Stencil.transferGlobalProperties(surface,{
                    launchTags:surface.launchTags,
                    launchOnTags:surface.launchOnTags,
                    backgroundColor:surface.backgroundColor,
                    lastPoint:surface.lastPoint,
                    messages:surface.messages
                })
            },
            onReset:(surface,data)=>{
                surface.setPosition(data.x,data.y,true);
                surface.setLastPoint(data.lastPoint);
            }
        });
        
        toolbox.addElement({
            id:"catapult-custom",
            onLoad:(data)=>{
                return {
                    surface:new Catapult(Stencil.transferGlobalProperties(data,{
                        static:catapultStatic,
                        width:data.width,
                        height:data.height,
                        guideLine:data.guideLine,
                        frame:data.frame,
                        center:data.center,
                        launchTags:data.launchTags,
                        launchOnTags:data.launchOnTags,
                        backgroundColor:data.backgroundColor,
                        isTargetLocked:data.isTargetLocked,
                        lastPoint:data.lastPoint,
                        onShakeLaunch:data.onShakeLaunch,
                        onLaunchShake:data.onLaunchShake,
                        messages:data.messages
                    })),
                    default:{
                        x:data.x,
                        y:data.y,
                        lastPoint:data.lastPoint
                    }
                };
            },
            onSave:(surface)=>{
                return Stencil.transferGlobalProperties(surface,{
                    width:surface.width,
                    height:surface.height,
                    guideLine:surface.guideLine,
                    frame:surface.frame,
                    center:surface.center,
                    launchTags:surface.launchTags,
                    launchOnTags:surface.launchOnTags,
                    backgroundColor:surface.backgroundColor,
                    isTargetLocked:surface.isTargetLocked,
                    lastPoint:surface.lastPoint,
                    onShakeLaunch:surface.onShakeLaunch,
                    onLaunchShake:surface.onLaunchShake,
                    messages:surface.messages
                })
            },
            onReset:(surface,data)=>{
                surface.setPosition(data.x,data.y,true);
                surface.setLastPoint(data.lastPoint);
            }
        });

        // --- Calculator

        let
            calculatorStatic={
                messages:{
                    clearMemory:{ title:LANGUAGE.elements.calculator.messages.clearMemory, icon:{ isResource:true, type:"url", url:"/images/elements/calculator.svg" } },
                    reset:{ title:LANGUAGE.elements.calculator.messages.reset, icon:{ isResource:true, type:"url", url:"/images/elements/calculator.svg" } },
                    resetDone:{ title:LANGUAGE.elements.calculator.messages.resetDone },
                    memoryCleared:{ title:LANGUAGE.elements.calculator.messages.memoryCleared }
                }
            };

        [
            { id:"portrait", width:70, height:110 },
            { id:"landscape", width:120, height:95  }
        ].forEach(element=>{

            toolbox.addElement({
                id:"calculator-"+element.id,
                meta:{
                    category:[ "accessories" ],
                    zIndex:10,
                    title:LANGUAGE.elements.calculator[element.id],
                    icon:"/images/elements/calculator.svg",
                    size:{
                        width:element.width,
                        height:element.height
                    },
                    description:LANGUAGE.elements.calculator.description,
                    options:[
                        {
                            title:LANGUAGE.elements.calculator.options.color.title,
                            attribute:"backgroundColor",
                            setting:{
                                type:"color"
                            }
                        }
                    ]
                },
                onLoad:(data)=>{
                    return {
                        surface:new Calculator(Stencil.transferGlobalProperties(data,{
                            static:calculatorStatic,
                            width:element.width,
                            height:element.height,
                            frame:true,
                            display:true,
                            backgroundColor:data.backgroundColor,
                            state:data.state,
                            messages:data.messages
                        })),
                        default:{
                            x:data.x,
                            y:data.y,
                            state:data.state
                        }
                    };
                },
                onSave:(surface)=>{
                    return Stencil.transferGlobalProperties(surface,{
                        backgroundColor:surface.backgroundColor,
                        state:surface.state,
                        messages:surface.messages
                    })
                },
                onReset:(surface,data)=>{
                    surface.setPosition(data.x,data.y,true);
                    surface.setState(data.state);
                }
            });

        });

        toolbox.addElement({
            id:"calculator-custom",
            onLoad:(data)=>{
                return {
                    surface:new Calculator(Stencil.transferGlobalProperties(data,{
                        static:calculatorStatic,
                        width:data.width,
                        height:data.height,
                        frame:data.frame,
                        display:data.display,
                        backgroundColor:data.backgroundColor,
                        state:data.state,
                        keys:data.keys,
                        messages:data.messages
                    })),
                    default:{
                        x:data.x,
                        y:data.y,
                        state:data.state
                    }
                };
            },
            onSave:(surface)=>{
                return Stencil.transferGlobalProperties(surface,{
                    width:surface.width,
                    height:surface.height,
                    frame:surface.frame,
                    display:surface.display,
                    backgroundColor:surface.backgroundColor,
                    keys:surface.keys,
                    state:surface.state,
                    messages:surface.messages
                })
            },
            onReset:(surface,data)=>{
                surface.setPosition(data.x,data.y,true);
                surface.setState(data.state);
            }
        });

        // --- Stamp

        let
            stampStatic = {
                icon:{ isResource:true, type:"url", url:"/images/elements/stamp.svg", meta: { svg:{ baseColor:"#000000" } } }
            };

        [
            { id:"normal", size:30  },
            { id:"small", size:15 }
        ].forEach(element=>{

            toolbox.addElement({
                id:"stamp-"+element.id,
                meta:{
                    category:[ "accessories" ],
                    zIndex:10,
                    title:LANGUAGE.elements.stamp[element.id],
                    icon:"/images/elements/stamp.svg",
                    size:{
                        width:element.size,
                        height:element.size
                    },
                    description:LANGUAGE.elements.stamp.description,
                    options:[
                        {
                            title:LANGUAGE.elements.calculator.options.color.title,
                            attribute:"backgroundColor",
                            setting:{
                                type:"color"
                            }
                        },{
                            title:LANGUAGE.elements.stamp.options.useTool.title,
                            description:LANGUAGE.elements.stamp.options.useTool.description,
                            attribute:"colorize",
                            setting:{
                                type:"checkbox",
                                default:false
                            }
                        },{
                            title:LANGUAGE.elements.stamp.options.preview.title,
                            description:LANGUAGE.elements.stamp.options.preview.description,
                            attribute:"previewTool.border",
                            setting:{
                                type:"checkbox",
                                default:false
                            }
                        }
                    ]
                },
                onLoad:(data)=>{
                    return {
                        surface:new Stamp(Stencil.transferGlobalProperties(data,{
                            static:stampStatic,
                            width:element.size,
                            height:element.size,
                            frame:true,
                            stamps:LANGUAGE.elements.stamp.stamps,
                            onShakeShuffle:true,
                            isRotating:true,
                            stampsImage:{
                                image:{
                                    isResource:true,
                                    type:"url",
                                    url:"/images/elements/stamp-default.svg",
                                    meta:{
                                        sprite:{
                                            width:20,
                                            height:20,
                                            gapX:2
                                        }
                                    }
                                }
                            },
                            previewTool:data.previewTool,
                            backgroundColor:data.backgroundColor,
                            selectedStamp:data.selectedStamp,
                            drawOnTags:data.drawOnTags,
                            colorize:data.colorize,
                            rotation:data.rotation
                        })),
                        default:{
                            x:data.x,
                            y:data.y,
                            selectedStamp:data.selectedStamp,
                            rotation:data.rotation
                        }
                    };
                },
                onSave:(surface)=>{
                    return Stencil.transferGlobalProperties(surface,{
                        previewTool:surface.previewTool,
                        backgroundColor:surface.backgroundColor,
                        selectedStamp:surface.selectedStamp,
                        drawOnTags:surface.drawOnTags,
                        colorize:surface.colorize,
                        rotation:surface.rotation
                    })
                },
                onReset:(surface,data)=>{
                    surface.setRotation(data.rotation);
                    surface.setPosition(data.x,data.y,true);
                    surface.setSide(data.selectedStamp);
                }
            });

        });
        
        toolbox.addElement({
            id:"stamp-custom",
            onLoad:(data)=>{
                return {
                    surface:new Stamp(Stencil.transferGlobalProperties(data,{
                        static:stampStatic,
                        width:data.width,
                        height:data.height,
                        frame:data.frame,
                        image:data.image,
                        backgroundColor:data.backgroundColor,
                        onShakeShuffle:data.onShakeShuffle,
                        isRotating:data.isRotating,
                        rotation:data.rotation,
                        stamps:data.stamps,
                        stampsImage:data.stampsImage,
                        previewTool:data.previewTool,
                        selectedStamp:data.selectedStamp,
                        drawOnTags:data.drawOnTags,
                        colorize:data.colorize
                    })),
                    default:{
                        x:data.x,
                        y:data.y,
                        selectedStamp:data.selectedStamp,
                        rotation:data.rotation
                    }
                };
            },
            onSave:(surface)=>{
                return Stencil.transferGlobalProperties(surface,{
                    width:surface.width,
                    height:surface.height,
                    frame:surface.frame,
                    image:surface.image,
                    backgroundColor:surface.backgroundColor,
                    stamps:surface.stamps,
                    onShakeShuffle:surface.onShakeShuffle,
                    stampsImage:surface.stampsImage,
                    isRotating:surface.isRotating,
                    previewTool:surface.previewTool,
                    selectedStamp:surface.selectedStamp,
                    drawOnTags:surface.drawOnTags,
                    colorize:surface.colorize,
                    rotation:surface.rotation
                })
            },
            onReset:(surface,data)=>{
                surface.setRotation(data.rotation);
                surface.setPosition(data.x,data.y,true);
                surface.setSide(data.selectedStamp);
            }
        });

        // --- Scissors

        let
            scissorsStatic = {
                icon:{ isResource:true, type:"url", url:"/images/elements/scissors.svg", meta: { svg:{ baseColor:"#000000" } } },
                areaIcon:{ isResource:true, type:"url", url:"/images/icon-area.svg", meta: { svg:{ baseColor:"#000000" } } },
                messages:{
                    setArea:{ title:LANGUAGE.elements.scissors.messages.setArea, icon:{ isResource:true, type:"url", url:"/images/icon-area.svg" } },
                    cut:{ title:LANGUAGE.elements.scissors.messages.cut, icon:{ isResource:true, type:"url", url:"/images/elements/scissors.svg" } },
                    removeSheet:{ title:LANGUAGE.elements.scissors.messages.removeSheet, icon:{ isResource:true, type:"url", url:"/images/icon-trash.svg" } },
                    selectSheet:{ title:LANGUAGE.elements.scissors.messages.selectSheet },
                },
                cutModels:LANGUAGE.elements.scissors.cutModels
            };

        toolbox.addElement({
            id:"scissors",
            meta:{
                category:[ "accessories" ],
                zIndex:5,
                title:LANGUAGE.elements.scissors.title,
                icon:"/images/elements/scissors.svg",
                size:{
                    width:30,
                    height:30
                },
                description:LANGUAGE.elements.scissors.description
            },
            onLoad:(data)=>{
                return {
                    surface:new Scissors(Stencil.transferGlobalProperties(data,{
                        static:scissorsStatic,
                        frame:true,
                        width: 30,
                        height: 30,
                        guideArea:true,
                        guideLabel:true,
                        backgroundColor:data.backgroundColor,
                        isAreaLocked:data.isAreaLocked,
                        lastArea:data.lastArea,
                        messages:data.messages,
                        cutOnTags:data.cutOnTags,
                        cutTags:data.cutTags,
                        cutModels:data.cutModels
                    })),
                    default:{
                        x:data.x,
                        y:data.y,
                        lastArea:data.lastArea
                    }
                };
            },
            onSave:(surface)=>{
                return Stencil.transferGlobalProperties(surface,{
                    backgroundColor:surface.backgroundColor,
                    isAreaLocked:surface.isAreaLocked,
                    lastArea:surface.lastArea,
                    messages:surface.messages,
                    cutOnTags:surface.cutOnTags,
                    cutTags:surface.cutTags,
                    cutModels:surface.cutModels
                })
            },
            onReset:(surface,data)=>{
                surface.setPosition(data.x,data.y,true);
                surface.setLastArea(data.lastArea);
            }
        });

        toolbox.addElement({
            id:"scissors-custom",
            onLoad:(data)=>{
                return {
                    surface:new Scissors(Stencil.transferGlobalProperties(data,{
                        static:scissorsStatic,
                        frame:data.frame,
                        width:data.width,
                        height:data.height,
                        guideArea:data.guideArea,
                        guideLabel:data.guideLabel,
                        backgroundColor:data.backgroundColor,
                        isAreaLocked:data.isAreaLocked,
                        lastArea:data.lastArea,
                        messages:data.messages,
                        cutOnTags:data.cutOnTags,
                        cutTags:data.cutTags,
                        cutModels:data.cutModels
                    })),
                    default:{
                        x:data.x,
                        y:data.y,
                        lastArea:data.lastArea
                    }
                };
            },
            onSave:(surface)=>{
                return Stencil.transferGlobalProperties(surface,{
                    frame:surface.frame,
                    width:surface.width,
                    height:surface.height,
                    guideArea:surface.guideArea,
                    guideLabel:surface.guideLabel,
                    backgroundColor:surface.backgroundColor,
                    isAreaLocked:surface.isAreaLocked,
                    lastArea:surface.lastArea,
                    messages:surface.messages,
                    cutOnTags:surface.cutOnTags,
                    cutTags:surface.cutTags,
                    cutModels:surface.cutModels
                })
            },
            onReset:(surface,data)=>{
                surface.setPosition(data.x,data.y,true);
                surface.setLastArea(data.lastArea);
            }
        });

        // --- Counter

        let
            counterStatic = {
                messages:{
                    reset:{ title:LANGUAGE.elements.counter.messages.reset, icon:{ isResource:true, type:"url", url:"/images/elements/counter.svg" } },
                },
                leftButtons:[
                    {
                        frameText:{ "EN":"-10" },
                        onSelect:{
                            subtractValue:10
                        }
                    },{
                        frameText:{ EN:"-" },
                        onSelect:{
                            subtractValue:1
                        }
                    }
                ],
                rightButtons: [
                    {
                        frameText:{ EN:"+" },
                        onSelect:{
                            sumValue:1
                        }
                    },{
                        frameText:{ EN:"+10" },
                        onSelect:{
                            sumValue:10
                        }
                    }
                ],
                menuButtons:[
                    {
                        title: {
                            EN: "+100"
                        },
                        icon: {
                            isResource: true,
                            type: "url",
                            url: "/images/elements/counter.svg"
                        },
                        onSelect:{
                            sumValue:100
                        }
                    },{
                        title: {
                            EN: "-100"
                        },
                        icon: {
                            isResource: true,
                            type: "url",
                            url: "/images/elements/counter.svg"
                        },
                        onSelect:{
                            subtractValue:100
                        }
                    }
                ]
            },
            smallCounterStatic = {
                messages:{
                    reset:{ title:LANGUAGE.elements.counter.messages.reset, icon:{ isResource:true, type:"url", url:"/images/elements/counter.svg" } },
                },
                leftButtons:[
                    {
                        frameText:{ EN:"-" },
                        onSelect:{
                            subtractValue:1
                        }
                    }
                ],
                rightButtons: [
                    {
                        frameText:{ EN:"+" },
                        onSelect:{
                            sumValue:1
                        }
                    }
                ],
                menuButtons:[
                    {
                        title: {
                            EN: "+10"
                        },
                        icon: {
                            isResource: true,
                            type: "url",
                            url: "/images/elements/counter.svg"
                        },
                        onSelect:{
                            sumValue:10
                        }
                    },{
                        title: {
                            EN: "-10"
                        },
                        icon: {
                            isResource: true,
                            type: "url",
                            url: "/images/elements/counter.svg"
                        },
                        onSelect:{
                            subtractValue:10
                        }
                    },{
                        title: {
                            EN: "+100"
                        },
                        icon: {
                            isResource: true,
                            type: "url",
                            url: "/images/elements/counter.svg"
                        },
                        onSelect:{
                            sumValue:100
                        }
                    },{
                        title: {
                            EN: "-100"
                        },
                        icon: {
                            isResource: true,
                            type: "url",
                            url: "/images/elements/counter.svg"
                        },
                        onSelect:{
                            subtractValue:100
                        }
                    }
                ]
            };

        [
            { id:"normal", width:150, height:30, static:counterStatic  },
            { id:"small", width:100, height:20, static:counterStatic },
            { id:"verysmall", width:60, height:10, static:smallCounterStatic },
        ].forEach(element=>{

            toolbox.addElement({
                id:"counter-"+element.id,
                meta:{
                    category:[ "counters" ],
                    zIndex:10,
                    title:LANGUAGE.elements.counter[element.id],
                    icon:"/images/elements/counter.svg",
                    size:{
                        width:element.width,
                        height:element.height
                    },
                    description:LANGUAGE.elements.counter.description,
                    options:[
                        {
                            title:LANGUAGE.elements.counter.options.color.title,
                            attribute:"backgroundColor",
                            setting:{
                                type:"color"
                            }
                        },{
                            title:LANGUAGE.elements.counter.options.isTransparent.title,
                            description:LANGUAGE.elements.counter.options.isTransparent.description,
                            attribute:"isTransparent",
                            setting:{
                                type:"checkbox",
                                default:false
                            }
                        },{
                            title:LANGUAGE.elements.counter.options.description.title,
                            description:LANGUAGE.elements.counter.options.description.description,
                            attribute:"descriptionText.EN",
                            setting:{
                                type:"input",
                                default:""
                            }
                        },{
                            title:LANGUAGE.elements.counter.options.startValue.title,
                            attribute:"value",
                            setting:{
                                type:"number",
                                isInteger:true,
                                default:0,
                                min:-999,
                                max:999,
                                step:1
                            }
                        },{
                            title:LANGUAGE.elements.counter.options.minValue.title,
                            attribute:"minValue",
                            setting:{
                                type:"number",
                                isInteger:true,
                                default:0,
                                min:-999,
                                max:999,
                                step:1
                            }
                        },{
                            title:LANGUAGE.elements.counter.options.maxValue.title,
                            attribute:"maxValue",
                            setting:{
                                type:"number",
                                isInteger:true,
                                default:100,
                                min:-999,
                                max:999,
                                step:1
                            }
                        },{
                            title:LANGUAGE.elements.counter.options.gauge.title,
                            description:LANGUAGE.elements.counter.options.gauge.description,
                            attribute:"gauge",
                            setting:{
                                type:"checkbox",
                                default:false
                            }
                        }
                    ]
                },
                onLoad:(data)=>{
                    let
                        hasDescription = !!(data.descriptionText && data.descriptionText.EN),
                        gaugeMinValue = data.minValue,
                        gaugeMaxValue = data.maxValue,
                        isGaugeMaxValueVisible = data.gauge;

                    return {
                        surface:new Counter(Stencil.transferGlobalProperties(data,{
                            static:element.static,
                            width:element.width,
                            height:element.height,
                            frame:true,
                            label:true,
                            description:hasDescription,
                            leftButtons:true,
                            rightButtons:true,
                            menuButtons:true,
                            isRotating:true,
                            gaugeMinValue:gaugeMinValue,
                            gaugeMaxValue:gaugeMaxValue,
                            isGaugeMaxValueVisible:isGaugeMaxValueVisible,
                            value:data.value,
                            resetValue:data.resetValue,
                            backgroundColor:data.backgroundColor,
                            descriptionText:data.descriptionText,
                            maxValue:data.maxValue,
                            minValue:data.minValue,
                            isTransparent:data.isTransparent,
                            gauge:data.gauge
                        })),
                        default:{
                            x:data.x,
                            y:data.y
                        }
                    };
                },
                onSave:(surface)=>{
                    return Stencil.transferGlobalProperties(surface,{
                        value:surface.value,
                        resetValue:surface.resetValue,
                        backgroundColor:surface.backgroundColor,
                        descriptionText:surface.descriptionText,
                        maxValue:surface.maxValue,
                        minValue:surface.minValue,
                        isTransparent:surface.isTransparent,
                        gauge:surface.gauge
                    })
                },
                onReset:(surface,data)=>{
                    surface.setPosition(data.x,data.y,true);
                    surface.reset();
                }
            });

        });

        toolbox.addElement({
            id:"counter-custom",
            onLoad:(data)=>{
                return {
                    surface:new Counter(Stencil.transferGlobalProperties(data,{
                        width:data.width,
                        height:data.height,
                        static:counterStatic,
                        value:data.value,
                        resetValue:data.resetValue,
                        frame:data.frame,
                        label:data.label,
                        leftButtons:data.leftButtons,
                        rightButtons:data.rightButtons,
                        menuButtons:data.menuButtons,
                        backgroundColor:data.backgroundColor,
                        description:data.description,
                        descriptionText:data.descriptionText,
                        maxValue:data.maxValue,
                        minValue:data.minValue,
                        isTransparent:data.isTransparent,
                        isRotating:data.isRotating,
                        gauge:data.gauge,
                        gaugeMaxValue:data.gaugeMaxValue,
                        gaugeMinValue:data.gaugeMinValue,
                        isGaugeMaxValueVisible:data.isGaugeMaxValueVisible,
                        image:data.image
                    })),
                    default:{
                        x:data.x,
                        y:data.y
                    }
                };
            },
            onSave:(surface)=>{
                return Stencil.transferGlobalProperties(surface,{
                    width:surface.width,
                    height:surface.height,
                    value:surface.value,
                    resetValue:surface.resetValue,
                    frame:surface.frame,
                    label:surface.label,
                    leftButtons:surface.leftButtons,
                    rightButtons:surface.rightButtons,
                    menuButtons:surface.menuButtons,
                    backgroundColor:surface.backgroundColor,
                    description:surface.description,
                    descriptionText:surface.descriptionText,
                    maxValue:surface.maxValue,
                    minValue:surface.minValue,
                    isTransparent:surface.isTransparent,
                    isRotating:surface.isRotating,
                    gauge:surface.gauge,
                    gaugeMaxValue:surface.gaugeMaxValue,
                    gaugeMinValue:surface.gaugeMinValue,
                    isGaugeMaxValueVisible:surface.isGaugeMaxValueVisible,
                    image:surface.image
                })
            },
            onReset:(surface,data)=>{
                surface.setPosition(data.x,data.y,true);
                surface.reset();
            }
        });

        // --- Area

        toolbox.addElement({
            id:"area",
            onLoad:(data)=>{
                return {
                    surface:new Area(Stencil.transferGlobalProperties(data,{
                        width:data.width,
                        height:data.height,
                        label:data.label,
                        labelText:data.labelText,
                        frame:data.frame,
                        backgroundColor:data.backgroundColor,
                        image:data.image
                    })),
                    default:{
                        x:data.x,
                        y:data.y
                    }
                };
            },
            onSave:(surface)=>{
                return Stencil.transferGlobalProperties(surface,{
                    width:surface.width,
                    height:surface.height,
                    label:surface.label,
                    labelText:surface.labelText,
                    frame:surface.frame,
                    backgroundColor:surface.backgroundColor,
                    image:surface.image
                })
            },
            onReset:(surface,data)=>{
                surface.setPosition(data.x,data.y,true);
            }
        });

    }
}