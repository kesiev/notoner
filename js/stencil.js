let Stencil=(function() {

    const
        DEBUG = false,
        SVG_SPRITE_RATIO = Global.IS_FIREFOX ? 0.994 : 1,
        ANIMATION_ROLL = 1,
        ANIMATION_RING = 2,
        ANIMATION_TOSS = 3,
        ANIMATION_SHUFFLE = 4,
        ANIMATION_PULSE = 5,
        ANIMATION_JUMP = 6;

    // --- Sprites management

    function setSvgAsBackground(node,data,isurl,meta,color) {
        if (meta && meta.svg && meta.svg.baseColor && color) {
            let
                hexColor = Global.colorToHex(color,true);
            if (isurl) {
                Global.getFile(Global.getAbsoluteUrl(data),(svg)=>{
                    node.style.backgroundImage="url('"+Global.urlEncodeFile(
                        "image/svg+xml",
                        svg.replaceAll(meta.svg.baseColor,hexColor)
                    )+"')";
                });
            } else
                node.style.backgroundImage="url('"+Global.urlEncodeFile(
                    "image/svg+xml",
                    data.replaceAll(meta.svg.baseColor,hexColor)
                )+"')";
        } else
            if (isurl)
                node.style.backgroundImage="url('"+data+"')";
            else
                node.style.backgroundImage="url('"+Global.urlEncodeFile("image/svg+xml",data)+"')";
    }

    function setResourceImage(node,resource,color) {
        if (!resource)
            node.style.backgroundImage="none";
        else
            switch (resource.type) {
                case "canvas":{
                    node._spriteRatio = 1;
                    node.style.backgroundImage="url('"+resource.canvas.toDataURL("image/png")+"')";
                    break;
                }
                case "svg":{
                    node._spriteRatio = SVG_SPRITE_RATIO;
                    setSvgAsBackground(node,resource.svg,false,resource.meta,color);
                    break;
                }
                case "url":{
                    if (resource.url.toLowerCase().endsWith(".svg")) {
                        node._spriteRatio = SVG_SPRITE_RATIO;
                        setSvgAsBackground(node,Global.getAbsoluteUrl(resource.url),true,resource.meta,color);
                    } else {
                        node._spriteRatio = 1;
                        node.style.backgroundImage="url('"+Global.getAbsoluteUrl(resource.url)+"')";    
                    }
                    break;
                }
                default:{
                    if (DEBUG) console.warn("Wrong icon",resource);
                    node.style.backgroundImage="url('"+Global.getAbsoluteUrl(resource)+"')";
                }
            }
    }

    function setFrame(node,frame) {
        node.style.backgroundPosition=(node._frameWidth*-frame)+"px 0px";
    }

    function setImage(node,resource,color) {

        node._resource = resource;

        if (typeof resource == "string") {

            node.style.backgroundSize = "contain";
            node.style.backgroundImage = "url('"+resource+"')";
            node.style.backgroundRepeat="no-repeat";

        } else if (resource && resource.meta && resource.meta.sprite) {

            let
                scaleX = node._width/resource.meta.sprite.width*Global.SCALE,
                scaleY = node._height/resource.meta.sprite.height*Global.SCALE;

            setResourceImage(node,resource,color);
            node._sprite = resource.meta.sprite;
            node._frameWidth = node._spriteRatio*(resource.meta.sprite.gapX+resource.meta.sprite.width);
            node.style.width = resource.meta.sprite.width+"px";
            node.style.height = resource.meta.sprite.height+"px";
            node.style.backgroundSize="auto 100%";
            node.style.backgroundRepeat="no-repeat";
            setFrame(node,resource.meta.sprite.frame || 0);
            node.style.transformOrigin = "0 0";
            node.style.transform = "scale("+scaleX+","+scaleY+")";
            if (node._borderRadius)
                node.style.borderRadius = (node._borderRadius/scaleX*Global.SCALE)+"px";

        } else if (resource && resource.meta && resource.meta.crop) {

            let
                scaleX = node._width/resource.meta.crop.width*Global.SCALE,
                scaleY = node._height/resource.meta.crop.height*Global.SCALE;

            setResourceImage(node,resource,color);
            node._crop = resource.meta.crop;
            node.style.backgroundRepeat="no-repeat";
            node.style.width = resource.meta.crop.width+"px";
            node.style.height = resource.meta.crop.height+"px";
            if (resource.meta.crop.imageWidth !== undefined)
                node.style.backgroundSize=resource.meta.crop.imageWidth+"px "+resource.meta.crop.imageHeight+"px";
            node.style.backgroundPosition=(-resource.meta.crop.x)+"px "+(-resource.meta.crop.y)+"px";
            node.style.transformOrigin = "0 0";
            node.style.transform = "scale("+scaleX+","+scaleY+")";

        } else if (resource) {

            setResourceImage(node,resource,color);
            node.style.backgroundSize = "contain";
            node.style.backgroundRepeat="no-repeat";

        } else {

            setResourceImage(node,false);
            
        }

    }

    // --- Node constructors

    function newDiv(def,resource,surface) {
        let
            x = getValue(def,resource,"x"),
            y = getValue(def,resource,"y"),
            width = getValue(def,resource,"width"),
            height = getValue(def,resource,"height"),
            right = getValue(def,resource,"right"),
            bottom = getValue(def,resource,"bottom"),
            opacity = getValue(def,resource,"opacity"),
            node = document.createElement("div"),
            padding = getValue(def,resource,"padding"),
            borderRadius = getValue(def,resource,"borderRadius") || 0;

        node._width = width;
        node._height = height;
        node._x = x;
        node._y = y;
        node._borderRadius = borderRadius;
        node.style.userSelect = "none";

        node.style.position = "absolute";

        if (x !== undefined)
            node.style.left = (x * Global.SCALE)+"px";

        if (right !== undefined)
            node.style.right = (right * Global.SCALE)+"px";

        if (y !== undefined)
            node.style.top = (y * Global.SCALE)+"px";

        if (bottom !== undefined)
            node.style.bottom = (bottom * Global.SCALE)+"px";

        if (width !== undefined)
            node.style.width = (width * Global.SCALE)+"px";

        if (height !== undefined)
            node.style.height = (height * Global.SCALE)+"px";

        if (padding !== undefined)
            node.style.padding = (padding * Global.SCALE)+"px";

        if (opacity !== undefined)
            node.style.opacity = opacity;

        node.style.borderRadius = (borderRadius*Global.SCALE)+"px";

        if (surface)
            surface.setBorderRadius(borderRadius * Global.SCALE);

        return node;
    }

    function asLabel(node,def,resource) {
        let
            lineHeight = getValue(def,resource,"lineHeight"),
            strokeWidth = getValue(def,resource,"strokeWidth") * Global.SCALE,
            strokeColor = strokeWidth ? Global.colorToRGBA(getValue(def,resource,"strokeColor"),true) : 0,
            borderSize = node._borderSize ? ( node._borderSize * 2 ) : 0,
            fontSize = getValue(def,resource,"fontSize")*Global.SCALE,
            textColor = Global.colorToRGBA(getValue(def,resource,"textColor"),true),
            fontFamily = getValue(def,resource,"fontFamily");

        node.style.position = "absolute";
        node._textColor = textColor;
        node._strokeWidth = strokeWidth;
        node._strokeColor = strokeColor;
        node._fontSize = fontSize;

        node.style.fontSize = fontSize+"px";
        node.style.fontWeight = getValue(def,resource,"fontWeight");
        node.style.textAlign = getValue(def,resource,"textAlign");
        node.style.whiteSpace = getValue(def,resource,"whiteSpace");
        node.style.overflow = getValue(def,resource,"overflow");

        if (fontFamily)
            node.style.fontFamily = fontFamily;

        if (lineHeight == "auto")
            node.style.lineHeight = ((node._height - borderSize) * Global.SCALE)+"px";
        else
            node.style.lineHeight = ((lineHeight - borderSize) * Global.SCALE)+"px";

        if (strokeWidth)
            Global.setNodeTextStroke(node,strokeWidth,strokeColor,textColor);
        else
            node.style.color = textColor;

    }

    // --- Default/custom values getter

    function getValue(def,set,value) {
        if ((set === true) || (set[value] === undefined))
            if (def && (def[value] === undefined))
                return undefined;
            else
            return def[value];
        else
            return set[value];
    }

    // --- Macro menus

    function addMacroMenuOptions(macrooptions,options,iscustom) {
        macrooptions.forEach(option=>{
            if ((option.if === undefined) || (Macro.if(option.if,surface)))
                options.push({
                    title:option.title,
                    icon:option.icon,
                    isCustom:iscustom,
                    isMacro:true,
                    macro:option.macro
                });
        });
        return options;
    }

    let stencil = {

        ANIMATION_ROLL:ANIMATION_ROLL,
        ANIMATION_RING:ANIMATION_RING,
        ANIMATION_TOSS:ANIMATION_TOSS,
        ANIMATION_SHUFFLE:ANIMATION_SHUFFLE,
        ANIMATION_PULSE:ANIMATION_PULSE,
        ANIMATION_JUMP:ANIMATION_JUMP,
        
        // --- Basic nodes for elements

        newSprite:(parent,def,resource)=>{
            let
                node = newDiv(def,resource),
                image = getValue(def,resource,"image");

            if (image)
                setImage(node,image,getValue(def,resource,"baseColor"));

            if (parent)
                parent.appendChild(node);

            return node;

        },
        newFrame:(parent,def,resource,surface)=>{
            let
                node = newDiv(def,resource,surface),
                borderSize = getValue(def,resource,"borderSize") || 0,
                boxShadow = getValue(def,resource,"boxShadow");

            node._borderSize = borderSize; 

            node.style.boxSizing = "border-box";
            node.style.backgroundColor = Global.colorToRGBA(getValue(def,resource,"backgroundColor"),true);

            if (borderSize)
                node.style.border = (borderSize*Global.SCALE)+"px "+getValue(def,resource,"borderStyle")+" "+Global.colorToRGBA(getValue(def,resource,"borderColor"),true);

            if (boxShadow)
                node.style.boxShadow=boxShadow.map(shadow=>(shadow.x*Global.SCALE)+"px "+(shadow.y*Global.SCALE)+"px "+(shadow.size*Global.SCALE)+"px "+Global.colorToRGBA(shadow.color,true)+(shadow.type ? " "+shadow.type : "")).join(", ");

            if (parent)
                parent.appendChild(node);

            return node;

        },
        newLabel:(parent,def,resource)=>{
            let
                node = newDiv(def,resource);

            asLabel(node,def,resource);

            if (parent)
                parent.appendChild(node);

            return node;

        },
        asLabel:(node,def,resource)=>{
            asLabel(node,def,resource);
        },

        // --- Node visibility

        hide:(node)=>{
            node.style.display = "none";
        },
        show:(node)=>{
            node.style.display = node.style._display || "block";
        },

        // --- Node content

        setLabel:(node,label)=>{
            node.innerHTML = label ? TRANSLATOR.translate(label) : "";
        },
        setHtml:(node,html)=>{
            node.innerHTML = html;
        },

        // --- Node colors

        setBackgroundColor:(node,color)=>{
            node.style.backgroundColor = Global.colorToRGBA(color,true);
        },
        setTextColor:(node,color,strokeColor)=>{
            if (node._strokeWidth)
                Global.setNodeTextStroke(node,node._strokeWidth,strokeColor ? Global.colorToRGBA(strokeColor,true) : node._strokeColor,Global.colorToRGBA(color,true));
            else
                node.style.color = color;
        },
        invertTextColor:(node)=>{
            if (node._strokeWidth)
                Global.setNodeTextStroke(node,node._strokeWidth,node._textColor,node._strokeColor);
        },
        resetTextColor:(node)=>{
            if (node._strokeWidth)
                Global.setNodeTextStroke(node,node._strokeWidth,node._strokeColor,node._textColor);
            else
                node.style.color = node._textColor;
        },

        // --- Node images and sprites

        setImage:(node,image,color)=>{
            return setImage(node,image,color);
        },
        setFrame:(node,frame)=>{
            if (node._sprite)
                setFrame(node,frame);
        },

        // --- Surface common functions: default animations

        animate:(id,time,surface,ontrigger)=>{
            let
                frame = time / 16;

            if (!time)
                surface._animationTrigger = !!ontrigger;

            switch (id) {
                case ANIMATION_ROLL:{
                    if (frame < 50) {
                        surface._animation.style.transform="scale(3.5) rotate("+FIXFLOAT(frame/4)+"rad)";
                        return true;
                    } else if (frame < 60) {
                        if (surface._animationTrigger) {
                            delete surface._animationTrigger;
                            ontrigger();
                        }
                        surface._animation.style.transform="scale("+(1+(0.25*(60-frame)))+")";
                        return true;
                    } else {
                        surface._animation.style.transform="";
                        return false;
                    }
                }
                case ANIMATION_TOSS:{
                    if (frame < 50) {
                        surface._animation.style.transform="scale("+(3.5*Math.sin(frame/4))+",3.5)";
                        return true;
                    } else if (frame < 60) {
                        if (surface._animationTrigger) {
                            delete surface._animationTrigger;
                            ontrigger();
                        }
                        surface._animation.style.transform="scale("+(1+(0.25*(60-frame)))+")";
                        return true;
                    } else {
                        surface._animation.style.transform="";
                        return false;
                    }
                }
                case ANIMATION_RING:{
                    if (frame<240) {
                        let
                            spin = Math.sin(frame/5)*(240-frame)/500;
                        surface._animation.style.transform="scale("+(1+spin)+") rotate("+spin+"rad)";
                        return true;
                    } else {
                        if (surface._animationTrigger) {
                            delete surface._animationTrigger;
                            ontrigger();
                        }
                        surface._animation.style.transform="";
                        return false;
                    }    
                }
                case ANIMATION_SHUFFLE:{
                    if (frame<60) {
                        let
                            scale = 1-(frame/60),
                            angle = 6*scale+surface._random*2,
                            rotate = Math.sin((12+(surface._random-0.5)*6)*scale)/4,
                            radius = 10*scale;
                        surface._animation.style.transform="translate("+(Math.sin(angle)*radius)+"px,"+(Math.cos(angle)*radius)+"px) rotate("+rotate+"rad)";
                        return true;
                    } else {
                        if (surface._animationTrigger) {
                            delete surface._animationTrigger;
                            ontrigger();
                        }
                        surface._animation.style.transform="";
                        return false;
                    }
                }
                case ANIMATION_PULSE:{
                    if (frame<16) {
                        surface._animation.style.transform="scale("+(1-Math.sin(frame/8*Math.PI)/10)+")";
                        return true;
                    } else {
                        if (surface._animationTrigger) {
                            delete surface._animationTrigger;
                            ontrigger();
                        }
                        surface._animation.style.transform="";
                        return false;
                    }
                }
                case ANIMATION_JUMP:{
                    if (frame<8) {
                        surface._animation.style.transform="translate(0px,"+(-Global.SCALE*Math.sin(frame/8*Math.PI)*2)+"px)";
                        return true;
                    } else {
                        if (surface._animationTrigger) {
                            delete surface._animationTrigger;
                            ontrigger();
                        }
                        surface._animation.style.transform="";
                        return false;
                    }
                }
            }
        },

        // --- Surface common functions: default properties management

        transferGlobalProperties:(data,out)=>{
            
            // Surface constructor
            out.x = data.x;
            out.y = data.y;
            out.tags = data.tags;

            // Surface setters
            out.isVariableZIndex = data.isVariableZIndex;
            out.isDragTopSurfaces = data.isDragTopSurfaces;
            out.isDraggable = data.isDraggable;
            out.zIndexGroup = data.zIndexGroup;
            out.fence = data.fence;

            // Global component attributes
            out.snapTo = data.snapTo;
            out.icon = data.icon;
            out.doNotFrame = data.doNotFrame;
            out.onResetMacro = data.onResetMacro;
            out.onDropMacro = data.onDropMacro;
            out.onSelectMacro = data.onSelectMacro;
            out.onShakeMacro = data.onShakeMacro;
            out.onClickMacro = data.onClickMacro;
            out.onMenuMacros = data.onMenuMacros;
            
            return out;
        },

        // --- Surface common functions: default events

        onDropDefault:(surface)=>{
            let
                onDropMacro = surface.onDropMacro || (surface.static ? surface.static.onDropMacro : 0);

            if (surface.snapTo) {

                let
                    fdestx, fdesty, mindist;

                surface.snapTo.forEach(rule=>{

                    let
                        col, row,
                        dx, dy, dist,
                        originx, originy, destx, desty;

                    if (rule.tags) {
                        let
                            target,
                            destinations = surface.getSurfacesByTag(rule.tags);
                        destinations.forEach(destination=>{
                            if (destination.isCollidingWithSurface(surface))
                                target = destination;
                        });
                        if (target) {
                            destx = target.x + (target.width - surface.width)/2;
                            desty = target.y + (target.height - surface.height)/2;
                            originx = target.x;
                            originy = target.y;
                        }
                    }

                    if (rule.grid) {
                        if (originx === undefined) originx = 0;
                        if (originy === undefined) originy = 0;
                        originx += rule.grid.x;
                        originy += rule.grid.y;
                        col = Math.round((surface.x-originx)/rule.grid.width);
                        row = Math.round((surface.y-originy)/rule.grid.height);
                        if (rule.grid.tiltColumns) {
                            let
                                gap = rule.grid.tiltColumns[Math.abs(row%rule.grid.tiltColumns.length)];
                            col = Math.round((surface.x-originx-gap)/rule.grid.width);
                            originx += gap;
                        }
                        if (rule.grid.tiltRows) {
                            let
                                gap = rule.grid.tiltRows[Math.abs(col%rule.grid.tiltRows.length)];
                            row = Math.round((surface.y-originy-gap)/rule.grid.height);
                            originy += gap;
                        }
                        destx = originx+col*rule.grid.width;
                        desty = originy+row*rule.grid.height;
                    }

                    dx = destx - surface.x;
                    dy = desty - surface.y;
                    dist = Math.sqrt(dx*dx+dy*dy);
                    if ((mindist === undefined) || (dist < mindist)) {
                        mindist = dist;
                        fdestx = destx;
                        fdesty = desty;
                    }

                });

                if (mindist)
                    surface.animateToPosition(fdestx,fdesty);

            }
            if (onDropMacro) {
                Macro.run(onDropMacro,surface);
                return true;
            }   
        },
        onSelectDefault:(surface)=>{
            let
                onSelectMacro = surface.onSelectMacro || (surface.static ? surface.static.onSelectMacro : 0);
            if (onSelectMacro) {
                Macro.run(onSelectMacro,surface);
                return true;
            }   
        },
        onShakeDefault:(surface)=>{
            let
                onShakeMacro = surface.onShakeMacro || (surface.static ? surface.static.onShakeMacro : 0);
            if (onShakeMacro) {
                Macro.run(onShakeMacro,surface);
                return true;
            }   
        },
        onClickDefault:(surface)=>{
            let
                onClickMacro = surface.onClickMacro || (surface.static ? surface.static.onClickMacro : 0);
            if (onClickMacro) {
                Macro.run(onClickMacro,surface);
                return true;
            }   
        },
        setContextMenuDefault:(surface)=>{
            return surface.onMenuMacros || (surface.static && surface.static.onMenuMacros) ? true : false;
        },
        onContextMenuDefault:(surface,options)=>{
            if (surface.static && surface.static.onMenuMacros)
                addMacroMenuOptions(surface.static.onMenuMacros,options,false);

            if (surface.onMenuMacros)
                addMacroMenuOptions(surface.onMenuMacros,options,true);
        },
        onMenuOptionDefault:(surface,option)=>{
            if (option && option.isMacro) {
                if (option.macro !== undefined)
                    Macro.run(option.macro,surface);
                return true;
            } else
                return false;
        }
    }

    return stencil;
})();
