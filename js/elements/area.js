let Area=function(settings) {

    const
        OPACITY = 0.5,
        BORDER_SIZE = 1.3;

    let
        baseColor = settings.backgroundColor || { r:0, g:0, b:0, a:0.5 },
        label,
        area = new Surface(
            "area",
            settings.tags,
            settings.x,
            settings.y,
            settings.width,
            settings.height
        );

    // --- Apply default

    if (settings.isDraggable === undefined)
        settings.isDraggable = false;
    if (settings.isVariableZIndex === undefined)
        settings.isVariableZIndex = false;
    if (settings.isDragTopSurfaces === undefined)
        settings.isDragTopSurfaces = false;

    // --- Element private functions
    

    // --- Prepare element
    
    if (settings.frame)
        Stencil.newFrame(area.content,{
            x:0,
            y:0,
            width:settings.width,
            height:settings.height,
            backgroundColor:Global.colorWithAlpha(baseColor, OPACITY),
            borderSize:BORDER_SIZE,
            borderStyle:"solid",
            borderColor:{ r:0, g:0, b:0, a:1 },
            borderRadius:2,
            boxShadow:[
                { x:0, y:0, size:1, color:{ r:50, g:50, b:50, a:1 }}
            ]
        },settings.frame,area);
        
    if (settings.image)
        Stencil.newSprite(area.content,{
            x:0,
            y:0,
            width:settings.width,
            height:settings.height,
            baseColor:baseColor
        },settings.image);

    if (settings.label)
        label = Stencil.newLabel(area.content,{
            fontSize:10,
            fontWeight:"bold",
            textAlign:"center",
            lineHeight:"auto",
            textColor:{ r:255, g:255, b:255, a:1 },
            strokeWidth:0.5,
            strokeColor:{ r:0, g:0, b:0, a:1 }
        },settings.label);
   
    // --- Element interfaces

    // --- Element macros

    // --- Element properties (transfer)

    Stencil.transferGlobalProperties(settings,area);
    area.image = settings.image;
    area.backgroundColor = settings.backgroundColor;
    area.frame = settings.frame;
    area.label = settings.label;
    area.labelText = settings.labelText;
    
    // --- Element properties (setters)
    
    area.setDraggable(!!settings.isDraggable);
    area.setVariableZIndex(!!settings.isVariableZIndex);
    area.setDragTopSurfaces(!!settings.isDragTopSurfaces);
    area.setZIndexGroup(settings.zIndexGroup);
    area.setFence(settings.fence);
    area.setSimpleDrag(true);

    // --- Element menu

    area.onMenuOption=(option)=>{ return Stencil.onMenuOptionDefault(area,option); }

    if (Stencil.setContextMenuDefault(area)) {
        area.onContextMenu=(options)=>{
            return Stencil.onContextMenuDefault(area,options);
        }
        area.setContextMenu(true);
    }
    
    // --- Element special action

    // --- Element interactions

    area.onMoved=()=>{ Stencil.onMovedDefault(area) }
    area.onDrop=()=>{ Stencil.onDropDefault(area) }
    area.onSelect=()=>{ Stencil.onSelectDefault(area) }
    area.onClick=()=>{ Stencil.onClickDefault(area) }
    area.onShake=(fromtable)=>{ Stencil.onShakeDefault(area) }

    // --- Element animations

    // --- Element lifecycle: update
    
    area.onUpdate=()=>{

        if (settings.label)
            Stencil.setLabel(label,settings.labelText);
            
    }

    // --- Element lifecycle: events

    // --- Element lifecycle: removal

    // --- Element initialization

    return area;

}
