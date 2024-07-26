let Global = (function(){
    const
        DEBUG = false,
        SCALE = 2,
        TEXTSTROKE_MODE = 1,
        IS_FIREFOX = !!navigator.userAgent.match(/Firefox/i),
        IS_APPLE = navigator.platform === 'MacIntel',
        IS_IPAD = (IS_APPLE && navigator.maxTouchPoints > 0) || navigator.platform === 'iPad',
        IS_IPHONE = (IS_APPLE && navigator.maxTouchPoints > 0) || navigator.platform === 'iPhone',
        IS_WEBKIT = !!navigator.userAgent.match(/WebKit/i),
        IS_SAFARIMOBILE = (IS_IPAD || IS_IPHONE) && IS_WEBKIT,
        IS_WAKELOCK = 'wakeLock' in navigator,
        SVG_SPRITE_RATIO = IS_FIREFOX ? 0.9941 : 0.9948,
        USE_CANVG = true;

    let
        ROOT_URL = document.location.href.replace(/\?.*/,"").replace(/#.*/,"");

    if (ROOT_URL.endsWith(".html"))
        ROOT_URL = ROOT_URL.replace(/\/[^\/]+\.html/,"");
    if (ROOT_URL.endsWith("/"))
        ROOT_URL = ROOT_URL.substr(0,ROOT_URL.length-1);

    function decToHex(dec,digits) {
        if (DEBUG && (dec>255)) debugger;
        let
            hex = dec.toString(16);
        while (hex.length<digits)
            hex="0"+hex;
        return hex;          
    };

    function getAbsoluteUrl(url) {
        if (url)
            if (url[0]=="/")
                return ROOT_URL+url;
        return url;
    }

    function urlEncodeFile(mimetype,data) {
        return "data:"+mimetype+";base64," + btoa(data);
    }

    function setSpriteFrame(node,resource,frame) {
        if (resource.meta && resource.meta.sprite) {
            if (frame === undefined) frame = resource.meta.sprite.frame || 0;

            let
                spriteHeight = parseFloat(node.style.height),
                spriteRatio = spriteHeight/resource.meta.sprite.height,
                frameGap = (resource.meta.sprite.width+resource.meta.sprite.gapX)*frame*spriteRatio;
            node.style.backgroundSize="auto "+spriteHeight+"px";
            node.style.backgroundRepeat="no-repeat";
            node.style.backgroundPosition=(-frameGap)+"px 0px";
        }
    }

    function generateUUID() {
        let
            d = new Date().getTime();
            d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;
        
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c)=>{
            let
                r = Math.random() * 16;
            if(d > 0){
                r = (d + r)%16 | 0;
                d = Math.floor(d/16);
            } else {
                r = (d2 + r)%16 | 0;
                d2 = Math.floor(d2/16);
            }
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }

    function loadFonts(list,cb) {
        let
            loadedFonts = 0;

        for(let i = 0, l = list.length; i < l; ++i) {
            (function(font) {

                let
                    interval,
                    width,
                    node = document.createElement('div');
                    
                node.innerHTML = 'giItT1WQy@!-/#';
                node.style.position = 'absolute';
                node.style.left = '-10000px';
                node.style.top = '-10000px';
                node.style.fontSize = '300px';
                node.style.fontFamily = 'sans-serif';
                node.style.fontVariant = 'normal';
                node.style.fontStyle = 'normal';
                node.style.fontWeight = 'normal';
                node.style.letterSpacing = '0';
                document.body.appendChild(node);

                width = node.offsetWidth;

                node.style.fontFamily = font;
    
                function checkFont() {
                    if (node && node.offsetWidth != width) {
                        loadedFonts++;
                        node.parentNode.removeChild(node);
                        node = null;
                        if (interval)
                            clearInterval(interval);
                        if (loadedFonts == list.length) {
                            if (loadedFonts == list.length) {
                                cb();
                                return true;
                            }
                        }
                    }
                };
    
                if(!checkFont())
                    interval = setInterval(checkFont, 50);

            })(list[i]);
        }

    }

    function svgToCanvas(svg,width,height,cb) {
        let
            canvas = document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;

        if (USE_CANVG) {

            canvgv2(canvas,svg,{
                ignoreDimensions: true,
                scaleWidth:width,
                scaleHeight:height,
                log: false,
                ignoreMouse: true
            });
            cb(canvas);

        } else {
            
            let
                img = document.createElement("img"),
                ctx = canvas.getContext("2d");

            img.onload=()=>{
                ctx.drawImage(img,0,0,width,height);
                cb(canvas);
            }
            img.src = urlEncodeFile("image/svg+xml",svg);

        }
    }

    function getFile(file,cb) {
        let
            xmlhttp = new XMLHttpRequest();
        if (cb)
            xmlhttp.onreadystatechange = function() {
                if (xmlhttp.readyState == 4)
                    if ((xmlhttp.status == 200)||(xmlhttp.status==0)) cb(xmlhttp.responseText);
                    else cb(xmlhttp.responseText);
            };
        xmlhttp.open("GET", file, true);
        xmlhttp.send();
    }

    return {

        // --- System helpers

        SCALE:SCALE,
        IS_APPLE:IS_APPLE,
        IS_FIREFOX:IS_FIREFOX,
        IS_IPAD:IS_IPAD,
        IS_IPHONE:IS_IPHONE,
        IS_WEBKIT:IS_WEBKIT,
        IS_SAFARIMOBILE:IS_SAFARIMOBILE,
        IS_WAKELOCK:IS_WAKELOCK,
        USE_CANVG:USE_CANVG,
        
        fixFloat:(a)=>{
            return Math.floor(a*1000)/1000;
        },
        generateUUID:()=>{
            return generateUUID();
        },

        // --- Object helpers

        clone:(o)=>{
            return o === undefined ? o : JSON.parse(JSON.stringify(o));
        },
        shuffle:(list)=>{
            for (let i=0;i<list.length;i++) {
                let
                    swapWith=Math.floor(Math.random()*list.length),
                    tmp=list[i];
                list[i]=list[swapWith];
                list[swapWith]=tmp;
            }
            return list;
        },
        pickRandom:(list)=>{
            if (list.length)
                return list.splice(Math.floor(Math.random()*list.length),1)[0];
        },

        // --- String helpers

        padNumber:(number,len,padding)=>{
            let
                ret = number ? number.toString() : "0";
            while (ret.length<len)
                ret = padding+ret;
            return ret;
        },
        cleanHTML:(text)=>{
            return String(text)
                .replaceAll("<","&lt;")
                .replaceAll(">","&gt;");
        },

        // --- Sprites helpers

        setResourceAsSprite:(node,resource,frame)=>{
            switch (resource.type) {
                case "canvas":{
                    node.style.backgroundImage="url('"+resource.canvas.toDataURL("image/png")+"')";
                    break;
                }
                case "svg":{
                    node.style.backgroundImage="url('"+urlEncodeFile("image/svg+xml",resource.svg)+"')";
                    break;
                }
                case "url":{
                    node.style.backgroundImage="url('"+getAbsoluteUrl(resource.url)+"')";
                    break;
                }
                default:{
                    if (DEBUG) console.warn("Wrong icon",resource);
                    node.style.backgroundImage="url('"+getAbsoluteUrl(resource)+"')";
                }
            }
            setSpriteFrame(node,resource,frame);
        },
        setSpriteFrame:(node,resource,frame)=>{
            return setSpriteFrame(node,resource,frame);
        },

        // --- File helpers
        getFile:(file,cb)=>{
            return getFile(file,cb);
        },

        // --- URL helpers

        getAbsoluteUrl:(url)=>{
            return getAbsoluteUrl(url);
        },
        urlEncodeFile:(mimetype,data)=>{
            return urlEncodeFile(mimetype,data)
        },

        // --- Color helpers

        colorWithAlpha:(color,alpha)=>{
            return { r:color.r, g:color.g, b:color.b, a:alpha };
        },
        colorToRGBA:(color,transparent)=>{
            let
                rgba = "rgba("+color.r+","+color.g+","+color.b;
            if (transparent === true)
                rgba += ","+color.a;
            else if (transparent !== false)
                rgba += ","+transparent;
            else
                rgba += ",1";
            rgba += ")";
            return rgba;
        },
        colorToHex:(color,transparent)=>{
            let
                hex = "#"+decToHex(color.r,2)+decToHex(color.g,2)+decToHex(color.b,2);
            if (transparent === true)
                hex += decToHex(Math.floor(255*color.a),2);
            else if (transparent !== false)
                hex += decToHex(Math.floor(255*transparent),2);
            return hex;
        },

        // --- Fonts loader

        loadFonts:(list,cb)=>{
            return loadFonts(list,cb);
        },

        // --- SVG rasterizer

        svgToCanvas:(svg,width,height,cb)=>{
            return svgToCanvas(svg,width,height,cb);
        },

        // --- Resource to Canvas

        resourceToCanvas:(resource,color,height,cb)=>{

            let
                svgBaseColor = resource.meta && resource.meta.svg && resource.meta.svg.baseColor && color ? resource.meta.svg.baseColor : 0,
                hexColor = svgBaseColor ? Global.colorToHex(color,true) : 0;

            switch (resource.type) {
                case "canvas":{
                    cb({
                        canvas:resource.canvas,
                        sprite:resource.meta && resource.meta.sprite ? resource.meta.sprite : 0
                    });
                    break;
                }
                case "svg":{
                    
                    let
                        svg = resource.svg,
                        image = document.createElement("img");

                    image.onload=()=>{
                        let
                            ratio = height/image.height,
                            spriteRatio = resource.meta && resource.meta.sprite ? height/resource.meta.sprite.height : ratio,
                            canvas = document.createElement("canvas"),
                            context = canvas.getContext("2d");

                        canvas.width = image.width*ratio;
                        canvas.height = height;
                        context.drawImage(image,0,0,canvas.width,canvas.height);
                        cb({
                            canvas:canvas,
                            sprite:resource.meta && resource.meta.sprite ? {
                                width:spriteRatio*resource.meta.sprite.width*SVG_SPRITE_RATIO,
                                height:height,
                                gapX:spriteRatio*resource.meta.sprite.gapX*SVG_SPRITE_RATIO
                            } : 0
                        });
                    }

                    if (svgBaseColor)
                        svg = svg.replaceAll(svgBaseColor,hexColor);

                    image.src = urlEncodeFile("image/svg+xml",svg);
                    break;
                }
                case "url":{

                    if (resource.url.endsWith("svg")) {

                        Global.getFile(Global.getAbsoluteUrl(resource.url),(svg)=>{

                            let
                                image = document.createElement("img");

                            image.onload=()=>{
                                
                                let
                                    ratio = height/image.height,
                                    spriteRatio = resource.meta && resource.meta.sprite ? height/resource.meta.sprite.height : ratio,
                                    canvas = document.createElement("canvas"),
                                    context = canvas.getContext("2d");
        
                                canvas.width = image.width*ratio;
                                canvas.height = height;
                                context.drawImage(image,0,0,canvas.width,canvas.height);
                                cb({
                                    canvas:canvas,
                                    sprite:resource.meta && resource.meta.sprite ? {
                                        width:spriteRatio*resource.meta.sprite.width*SVG_SPRITE_RATIO,
                                        height:height,
                                        gapX:spriteRatio*resource.meta.sprite.gapX*SVG_SPRITE_RATIO
                                    } : 0
                                });
                            }

                            if (svgBaseColor)
                                svg = svg.replaceAll(svgBaseColor,hexColor);

                            image.src = Global.urlEncodeFile("image/svg+xml",svg);

                        });

                    } else {

                        let
                            image = document.createElement("img");

                        image.onload=()=>{
                            let
                                canvas = document.createElement("canvas"),
                                context = canvas.getContext("2d");

                            canvas.width = image.width;
                            canvas.height = image.height;
                            context.drawImage(image,0,0);
                            cb({
                                canvas:canvas,
                                sprite:resource.meta && resource.meta.sprite ? resource.meta.sprite : 0
                            });
                        }
                        image.src = getAbsoluteUrl(resource.url);
                    }
                    break;
                }
                default:{
                    if (DEBUG) console.warn("Wrong resource",resource);
                    cb(false);
                }
            }
        },

        // --- Pen

        isPenEvent:(e)=>{
            return (e.pointerType == "pen") || (IS_FIREFOX && (e.pointerType == "touch") && !e.width && !e.height && (e.pressure<1));
        },
        
        // --- Hacks

        setNodeTextStroke:(node,size,borderColor,foreColor)=>{
            switch (TEXTSTROKE_MODE) {
                case 0:{
                    node.style.webkitTextStroke = node.style.textStroke = size+"px "+borderColor;
                    node.style.webkitTextFillColor = node.style.textFillColor = foreColor;
                    break;
                } case 1:{
                    node.style.textShadow =
                        size+"px "+size+"px "+borderColor+","+
                        "0px "+size+"px "+borderColor+","+
                        "-"+size+"px "+size+"px "+borderColor+","+
                        "0px "+size+"px "+borderColor+","+
                        "0px -"+size+"px "+borderColor+","+
                        size+"px -"+size+"px "+borderColor+","+
                        "0px -"+size+"px "+borderColor+","+
                        "-"+size+"px -"+size+"px "+borderColor;
                    node.style.color = foreColor;
                    break;
                }
            }
        }        
    }
})();

FIXFLOAT = Global.fixFloat;