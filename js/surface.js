let Surface=function(type,tags,x,y,width,height) {

    const
        MOVE_SPEED_THRESHOLD = 20*Global.SCALE,
        MOVE_SPEED_FAST = 100,
        MOVE_SPEED_SLOW = 250,
        DEBUG = false;

    let
        node = document.createElement("div"),
        content = document.createElement("div"),
        animation = document.createElement("div"),
        defaultTags = [ "type:"+type ],
        isMoving = false,
        isMovingSpeed = 0,
        startAt = 0,
        sx = 0,
        sy = 0,
        fx1, fy1, fx2, fy2;

    animation.style.position="absolute";

    function updateSurface() {
        if (surface.isDirty) {
            node.style.transform="translate("+FIXFLOAT(surface.x*Global.SCALE)+"px,"+FIXFLOAT(surface.y*Global.SCALE)+"px) rotate("+surface.angle+")";
            animation.style.width = content.style.width = node.style.width = (surface.width * Global.SCALE)+"px";
            animation.style.height = content.style.height = node.style.height = (surface.height * Global.SCALE) +"px";
            content.style.borderRadius = node.style.borderRadius=surface.borderRadius+"px";
            surface.parent.showSurfaceHighlight(surface,surface.isHighlighted);
            if (surface.isMoved) {
                surface.isMoved = false;
                if (surface.onMove) surface.onMove();
            }
            surface.isDirty=false;
            if (DEBUG)
                node.style.backgroundColor="#00f";
        }
    }

    function move(t) {

        if (isMoving) {

            if (startAt == -1)
                startAt = t;

            let
                percent = (t-startAt)/isMovingSpeed;

            if (percent >= 1) {
                isMoving = 0;
                animation.style.left = "0px";
                animation.style.top = "0px";
                return false;
            } else {
                let
                    pos = 1-Math.sin((percent)*Math.PI/2);
                animation.style.left = (((sx-surface.x)*pos)* Global.SCALE)+"px";
                animation.style.top = (((sy-surface.y)*pos)* Global.SCALE)+"px";
                return true;
            }

        } else
            return false;
    }

    function setDirty() {
        surface.isDirty = true;
        if (surface.parent)
            surface.parent.setDirty();
    }

    function updateRounded() {
        surface.isRounded = (surface.borderRadius >= surface.width/2) || (surface.borderRadius >= surface.height/2);
    }

    let surface={
        _animation:animation,
        _random:Math.random(),
        x:0,
        y:0,
        angle:0,
        defaultTags:defaultTags,
        tags:tags,
        type:type,
        stackId:0,
        node:node,
        content:content,
        borderRadius:0,
        isMoved:false,
        isDirty:true,
        isAnimated:false,
        isRounded:false,
        translator:TRANSLATOR,
        zIndexGroup:0,

        // --- Position

        setX:(x,byui,force)=>{
            if (force || (x != surface.x)) {
                if (!byui && (surface.hilightId !== undefined))
                    surface.parent.onDraggedMovedX(surface.hilightId,x-surface.x);
                surface.x=x;
                if (surface.fence)
                    if (surface.x < fx1) surface.x = fx1;
                    else if (surface.x+surface.width > fx2) surface.x = fx2-surface.width;
                surface.isMoved = true;
                setDirty();
            }
        },
        setY:(y,byui,force)=>{
            if (force || (y != surface.y)) {
                if (!byui && (surface.hilightId !== undefined))
                    surface.parent.onDraggedMovedY(surface.hilightId,y-surface.y);
                surface.y=y;
                if (surface.fence)
                    if (surface.y < fy1) surface.y = fy1;
                    else if (surface.y+surface.height > fy2) surface.y = fy2-surface.height;
                surface.isMoved = true;
                setDirty();
            }
        },
        setPosition:(x,y,byui,force)=>{
            surface.setX(x,byui,force);
            surface.setY(y,byui,force);
        },
        setFence:(f)=>{
            surface.fence = f;
            if (surface.fence) {
                fx1 = f.x;
                fy1 = f.y;
                fx2 = f.x+f.width;
                fy2 = f.y+f.height;
                surface.setPosition(surface.x,surface.y,false,true);
            }
        },
        animateToPosition:(x,y,fast)=>{
            if (!isMoving) {
                isMoving = true;
                isMovingSpeed =
                    (fast === undefined ? (Math.abs(x-surface.x) < MOVE_SPEED_THRESHOLD) && (Math.abs(y-surface.y) < MOVE_SPEED_THRESHOLD) : fast) ?
                    MOVE_SPEED_FAST : MOVE_SPEED_SLOW;
                startAt = -1;
                sx = surface.x;
                sy = surface.y;
            }
            surface.setPosition(x,y);
        },

        // --- Size

        setWidth:(w)=>{
            if (w != surface.width) {
                surface.width=w;
                updateRounded();
                setDirty();
            }
        },
        setHeight:(h)=>{
            if (h != surface.height) {
                surface.height=h;
                updateRounded();
                setDirty();
            }
        },
        setSize:(w,h)=>{
            surface.setWidth(w);
            surface.setHeight(h);
        },

        // --- Orientation

        setAngle:(a)=>{
            if (a != surface.angle) {
                surface.angle=a;
                setDirty();
            }
        },
        
        // --- Z-Index

        setZIndexGroup:(g)=>{
            surface.zIndexGroup = g || 0;
        },
        moveToTop:()=>{
            if (node.parentNode) {
                let
                    parent = node.parentNode,
                    before;
                parent.removeChild(node);

                for (let i=0;i<parent.childNodes.length;i++) {
                    let
                        node = parent.childNodes[i];

                    if (node && node._surface && (node._surface.zIndexGroup > surface.zIndexGroup)) {
                        before = node;
                        break;
                    }
                }

                if (before)
                    parent.insertBefore(node,before);
                else
                    parent.appendChild(node);
            }
        },
        isOverSurface:(surface)=>{
            if (node.parentNode) {
                let
                    parent = node.parentNode;

                for (let i=0;i<parent.childNodes.length;i++)
                    if (parent.childNodes[i] === surface.node)
                        return true;
                    else if (parent.childNodes[i] === node)
                        return false;

                return false;
            }
        },

        // --- Stack ID

        setStackId:(i)=>{
            surface.stackId = i;
        },

        // --- Style

        setBorderRadius:(r)=>{
            if (r != surface.borderRadius) {
                surface.borderRadius = r;
                updateRounded();
                setDirty();
            }
        },

        // --- Dragging

        setDraggable:(d)=>{
            surface.isDraggable = d;
        },
        setSimpleDrag:(d)=>{
            surface.isSimpleDrag = d;
        },

        // --- Elements interaction

        setDragTopSurfaces:(d)=>{
            surface.isDragTopSurfaces = d;
        },
        setVariableZIndex:(d)=>{
            surface.isVariableZIndex = d;
        },

        // --- Collisions

        isPointInside:(x,y,margin)=>{
            if (surface.isRounded) {
                let
                    r = surface.width/2,
                    dx = x-(surface.x+r),
                    dy = y-(surface.y+r),
                    d = Math.sqrt(dx*dx+dy*dy);

                return d<r+margin;
            } else 
                return !(
                    (x>(surface.x+surface.width+margin)) ||
                    (x<(surface.x-margin)) ||
                    (y>(surface.y+surface.height+margin)) ||
                    (y<(surface.y-margin))
                );
        },
        isCollidingWithSurface:(b)=>{
            if (
                surface.isRounded == b.isRounded
            ) {
                if (surface.isRounded) {

                    // Circle/Circle collision
                    let
                        r1 = surface.width/2,
                        x1 = surface.x+r1,
                        y1 = surface.y+r1,
                        r2 = b.width/2,
                        x2 = b.x+r2,
                        y2 = b.y+r2,
                        dx = x1-x2,
                        dy = y1-y2,
                        d = Math.sqrt(dx*dx+dy*dy);

                    return d<(r1+r2);

                } else {

                    // Rectancle/Rectancle collision
                    let
                        right1 = surface.x+surface.width,
                        bottom1 = surface.y+surface.height,
                        right2 = b.x+b.width,
                        bottom2 = b.y+b.height;
        
                    return !(
                        (b.x>right1) ||
                        (right2<surface.x) ||
                        (b.y>bottom1) ||
                        (bottom2<surface.y)
                    );

                }
            } else {

                let
                    dx,dy,
                    rect = surface.isRounded ? b : surface,
                    circle = surface.isRounded ? surface : b,
                    r = circle.width/2,
                    cx = circle.x+r,
                    cy = circle.y+r,
                    distX = Math.abs(cx - rect.x-rect.width/2),
                    distY = Math.abs(cy - rect.y-rect.height/2);

                if (
                    (distX > (rect.width/2 + r)) ||
                    (distY > (rect.height/2 + r))
                )
                    return false;

                if (
                    (distX <= (rect.width/2)) ||
                    (distY <= (rect.height/2))
                )
                    return true;

                dx=distX-rect.width/2;
                dy=distY-rect.height/2;
    
                return (dx*dx+dy*dy<=(r*r));

            }
        },
        getSurfacesIntersecting:()=>{
            return surface.parent.getSurfacesIntersecting(surface);
        },
        getSurfacesAt:(p)=>{
            return surface.parent.getSurfacesAt(p);
        },

        // --- Menu

        setContextMenu:(c)=>{
            surface.isContextMenu = c;
        },
        hasContextMenu:()=>{
            return surface.specialAction || surface.isContextMenu;
        },
        getContextMenu:(options)=>{
            if (surface.specialAction)
                options.push(surface.specialAction);
            if (surface.isContextMenu && surface.onContextMenu)
                surface.onContextMenu(options);
            return options;
        },

        // --- Special action

        setSpecialAction:(a)=>{
            surface.specialAction = a;
            if (a) a.isSpecial = true;
        },

        // --- Events

        setOnEventTypes:(e)=>{
            surface.onEventTypes = e;
        },

        // --- Selection

        select:()=>{
            return surface.parent.selectSurface(surface);
        },
        unselect:()=>{
            surface.parent.unselectSurface(surface);
        },
        
        // --- Tags
        
        hasTag:(list)=>{
            if (list)
                for (let i=0;i<list.length;i++)
                    if ((surface.tags && (surface.tags.indexOf(list[i]) != -1)) || (surface.defaultTags.indexOf(list[i]) != -1))
                        return true;
            return false;
        },
        getSurfacesByTag:(tag)=>{
            return surface.parent.getSurfacesByTag(tag);
        },
        
        // --- Animations
        
        startAnimation:(id)=>{
            delete surface.animationStart;
            surface.animationId = id;
            setDirty();
        },
        stopAnimation:()=>{
            if (surface.onStopAnimation)
                surface.onStopAnimation(surface.animationId);
            delete surface.animationId;
            delete surface.animationStart;
        },

        // --- Pickers

        pickCoordinate:(config)=>{
            return surface.parent.pickCoordinateFor(surface,config);
        },

        // --- Measures

        formatMeasure:(d,precision,addlabel)=>{
            return surface.parent.formatMeasure(d,precision,addlabel);
        },
        
        // --- Text messages

        hasMessage:(id)=>{
            return ((surface.messages === undefined) && surface.static && surface.static.messages[id]) || (surface.messages && (surface.messages[id] != 0));
        },
        getMessage:(id,key)=>{
            return surface.messages && surface.messages[id] && (surface.messages[id][key] !== undefined) ?  surface.messages[id][key] : surface.static ? surface.static.messages[id][key] : 0;
        },

        // --- Events

        broadcastEndInteraction:()=>{
            return surface.parent.broadcastEndInteraction(surface);
        },
        broadcastEvent:(event)=>{
            if (surface.parent)
                return surface.parent.broadcastEvent(surface,event);
        },

        // --- Table tools
        
        setToolById:(id)=>{
            return surface.parent.setToolById(id);
        },
        getTool:()=>{
            return surface.parent.getTool();
        },

        // --- Table viewport

        getViewport:()=>{
            return surface.parent.getViewport();
        },

        // --- Notifications

        addNotification:(color,text)=>{
            return surface.parent.addNotification(color,text);
        },

        // --- Adding/removing

        addElementToTable:(type,data,def,zindex)=>{
            return surface._toolbox.addElementToTable(type,data,def,zindex);
        },
        remove:()=>{
            if (surface.onRemove)
                surface.onRemove(surface.parent);
            if (node.parentNode)
                node.parentNode.removeChild(node);
        },

        // --- [INTERNAL] Table/Toolbox bindings

        _setHighlight:(h,id)=>{
            surface.hilightId = id;
            if (h != surface.isHighlighted) {
                surface.isHighlighted = h;
                setDirty();
            }
        },
        _addTo:(parent)=>{
            surface.parent = parent;
            parent.addSurface(surface);
            setDirty();
        },
        _updateSurface:(time)=>{
            let
                isAnimated = false;

            updateSurface();

            if (surface.animationId && surface.onAnimation) {
                if (surface.animationStart === undefined)
                    surface.animationStart = time;
                if (surface.onAnimation(surface.animationId, time - surface.animationStart))
                    isAnimated = true;
                else
                    surface.stopAnimation();
            }

            isAnimated |= move(time);

            return isAnimated;
        }

    }

    node._surface = surface;

    // --- Initialization

    animation.style.position = content.style.position = node.style.position="absolute";   
    animation.style.pointerEvents = content.style.pointerEvents = node.style.pointerEvents = "none";

    node.style.top = node.style.left = "0px";

    if (!DEBUG) {
        node.appendChild(animation);
        animation.appendChild(content);
    }

    surface.setPosition(x,y);
    surface.setSize(width,height);

    return surface;
}
