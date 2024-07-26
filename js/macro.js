let Macro=(function(){

    // --- List generators

    function getTagsList(value,list,rest,surface,env) {
        let
            tags = getValue(value,list,rest,surface,env);
        if (typeof tags === 'string')
            return [ tags ];
        else
            return tags;
    }
    
    function getElementsList(set,list,rest,surface,env) {
        let
            elements = getValue(set,list,rest,surface,env);

        if (elements.length === undefined)
            return [ elements ];
        else
            return elements;
    }

    // --- Getter

    function getValue(value,list,rest,surface,env) {

        if (value)
            
            if (value.get) {

                let
                    key = value.get;

                for (let i=0;i<key.length;i++) {

                    switch (key[i]) {
                        case "elementsByTag":{                           
                            value = surface.getSurfacesByTag(getTagsList(key[i+1],list,rest,surface,env));
                            i++;
                            break;
                        }
                        case "elementByTag":{
                            value = surface.getSurfacesByTag(getTagsList(key[i+1],list,rest,surface,env))[0];
                            i++;
                            break;
                        }
                        case "variable":{
                            value = env.variables[getValue(key[i+1],list,rest,surface,env)];
                            i++;
                            break;
                        }
                        case "rest":{
                            value = rest;
                            break;
                        }
                        case "elements":{
                            value = list;
                            break;
                        }
                        case "element":{
                            value = surface;
                            break;
                        }
                        case "count":{
                            value = (list ? list.length : 0) || 0;
                            break;
                        }
                        case "first":{
                            value = (value ? value[0] : 0) || 0;
                            break;
                        }
                        case "last":{
                            value = (value && (value.length !== undefined) ? value[value.length-1] : 0) || 0;
                            break;
                        }
                        default:{
                            if (value)
                                value = value[key[i]];
                            else
                                value = 0;
                            break;
                        }
                    }

                }

            } else if (value.variable) {
                value = env.variables[getValue(value.variable,list,rest,surface,env)];
            } else if (value.self) {
                value = env.variables.self;
            } else if (value.random) {

                if (value.random.value && value.random.value.length)
                    value = getValue(value.random.value[Math.floor(Math.random()*value.random.value.length)],list,rest,surface,env);
                else if (value.random.number) {
                    let
                        from = value.random.number.from === undefined ? 0 : getValue(value.random.number.from,list,rest,surface,env),
                        to = value.random.number.to === undefined ? 0 : getValue(value.random.number.to,list,rest,surface,env),
                        step = value.random.number.step === undefined ? 1 : getValue(value.random.number.step,list,rest,surface,env),
                        range = Math.floor((to-from)/step);
                    value = from+Math.floor(Math.random()*range)*step;
                }
            } else if (value.sum) {
                let
                    result = 0;
                value.sum.forEach(element=>{
                    result+=getValue(element,list,rest,surface,env);
                });
                value = result;
            } else if (value.subtract) {
                let
                    result;
                value.subtract.forEach(element=>{
                    let
                        value = getValue(element,list,rest,surface,env);
                    if (result === undefined)
                        result = value;
                    else
                        result -= value;
                });
                value = result;
            } else if (value.multiply) {
                let
                    result;
                value.multiply.forEach(element=>{
                    let
                        value = getValue(element,list,rest,surface,env);
                    if (result === undefined)
                        result = value;
                    else
                        result *= value;
                });
                value = result;
            } else if (value.divide) {
                let
                    result;
                value.divide.forEach(element=>{
                    let
                        value = getValue(element,list,rest,surface,env);
                    if (result === undefined)
                        result = value;
                    else
                        result /= value;
                });
                value = result;
            }
                

        return value;
        
    }

    // --- Conditions

    function checkCollision(value,withSurface,set,list,rest,surface,env) {
        let
            fallback = !value,
            elements = getElementsList(set,list,rest,surface,env);

        for (let i=0;i<elements.length;i++)
            if ((elements[i] === withSurface))
                fallback = false;
            else if (withSurface.isCollidingWithSurface(elements[i]))
                return value;

        return fallback;
    }

    function checkOver(value,withSurface,set,list,rest,surface,env) {
        let
            fallback = !value,
            elements = getElementsList(set,list,rest,surface,env);

        for (let i=0;i<elements.length;i++)
            if ((elements[i] === withSurface))
                fallback = false;
            else if (withSurface.isOverSurface(elements[i]))
                return value;

        return fallback;
    }

    function checkCovering(value,withSurface,set,list,rest,surface,env) {
        let
            fallback = !value,
            elements = getElementsList(set,list,rest,surface,env);

        for (let i=0;i<elements.length;i++)
            if ((elements[i] === withSurface))
                fallback = false;
            else if (withSurface.isCollidingWithSurface(elements[i]) && withSurface.isOverSurface(elements[i]))
                return value;

        return fallback;
    }

    function checkCovered(value,withSurface,set,list,rest,surface,env) {
        let
            elements = getElementsList(set,list,rest,surface,env);

        for (let i=0;i<elements.length;i++)
            if ((elements[i] !== withSurface) && withSurface.isCollidingWithSurface(elements[i]) && !withSurface.isOverSurface(elements[i]))
                return value;

        return !value;
    }

    function checkCondition(condition,list,rest,surface,env) {
    
        if (condition.length !== undefined) {

            for (let i=0;i<condition.length;i++)
                if (!checkCondition(condition[i],list,rest,surface,env))
                    return false;

            return true;

        } else {

            let
                value = condition.value === undefined ? surface : getValue(condition.value,list,rest,surface,env),
                result = true;

            if (result && getValue(condition.isValued,list,rest,surface,env))
                result &= !!value;    

            if (result && getValue(condition.isNotValued,list,rest,surface,env))
                result &= !value;    

            if (result && (condition.isEqualTo !== undefined))
                result &= value == getValue(condition.isEqualTo,list,rest,surface,env);

            if (result && (condition.isNotEqualTo !== undefined))
                result &= value != getValue(condition.isNotEqualTo,list,rest,surface,env);

            if (result && (condition.isSameTo !== undefined))
                result &= value === getValue(condition.isSameTo,list,rest,surface,env);

            if (result && (condition.isNotSameTo !== undefined))
                result &= value !== getValue(condition.isNotSameTo,list,rest,surface,env);

            if (result && (condition.isGreaterThan !== undefined))
                result &= value > getValue(condition.isGreaterThan,list,rest,surface,env);

            if (result && (condition.isGreaterEqualThan !== undefined))
                result &= value >= getValue(condition.isGreaterEqualThan,list,rest,surface,env);

            if (result && (condition.isLessThan !== undefined))
                result &= value < getValue(condition.isLessThan,list,rest,surface,env);

            if (result && (condition.isLessEqualThan !== undefined))
                result &= value <= getValue(condition.isLessEqualThan,list,rest,surface,env);

            if (result && (condition.isCollidingWith !== undefined) && value.isCollidingWithSurface)
                result &= checkCollision(true,value,condition.isCollidingWith,list,rest,surface,env);

            if (result && (condition.isNotCollidingWith !== undefined) && value.isCollidingWithSurface)
                result &= checkCollision(false,value,condition.isNotCollidingWith,list,rest,surface,env);

            if (result && (condition.isOver !== undefined) && value.isOverSurface)
                result &= checkOver(true,value,condition.isOver,list,rest,surface,env);

            if (result && (condition.isNotOver !== undefined) && value.isOverSurface)
                result &= checkOver(false,value,condition.isNotOver,list,rest,surface,env);
            
            if (result && (condition.isCovering !== undefined) && value.isOverSurface && value.isCollidingWithSurface)
                result &= checkCovering(true,value,condition.isCovering,list,rest,surface,env);

            if (result && (condition.isNotCovering !== undefined) && value.isOverSurface && value.isCollidingWithSurface)
                result &= checkCovering(false,value,condition.isNotCovering,list,rest,surface,env);

            if (result && (condition.isCoveredBy !== undefined) && value.isOverSurface && value.isCollidingWithSurface)
                result &= checkCovered(true,value,condition.isCoveredBy,list,rest,surface,env);

            if (result && (condition.isNotCoveredBy !== undefined) && value.isOverSurface && value.isCollidingWithSurface)
                result &= checkCovered(false,value,condition.isNotCoveredBy,list,rest,surface,env);

            if (result && (condition.hasTag !== undefined) && value.hasTag)
                result &= value.hasTag(getValue(condition.hasTag,list,rest,surface,env));

            if (result && (condition.hasNotTag !== undefined) && value.hasTag)
                result &= !value.hasTag(getValue(condition.hasNotTag,list,rest,surface,env));

            if (result && getValue(condition.isSelected,list,rest,surface,env))
                result &= !!value.isHighlighted;

            if (result && getValue(condition.isNotSelected,list,rest,surface,env))
                result &= !value.isHighlighted;

            if (getValue(condition.not,list,rest,surface,env))
                result = !result;

            return result;

        }

    }

    // --- Elements filtering

    function filterList(filter,list,rest,surface,env) {

        let
            out = [],
            sublist = [];

        if (getValue(filter.self,list,rest,surface,env))
            if (list.indexOf(surface) == -1)
                sublist.push(surface);

        list.forEach(element=>{

            let
                ok = filter.if === undefined ? true : checkCondition(filter.if,list,rest,element,env);

            out.push(element);

            if (ok)
                sublist.push(element);

        });

        if (filter.pickRandom !== undefined) {
            let
                amount = getValue(filter.pickRandom,list,rest,surface,env),
                subset = [];

            for (let i=0;i<amount;i++)
                if (sublist.length)
                    subset.push(Global.pickRandom(sublist));

            sublist = subset;
        }

        return sublist;

    }

    // --- Elements manipulation

    function applyAction(tosurface,action,id,list,rest,surface,env) {

        // Selection

        if (action.select)
            tosurface.select();

        // Element events

        if (action.toss && tosurface.toss)
            tosurface.toss();
        if (action.launch && tosurface.launch)
            tosurface.launch();
        if (action.roll && tosurface.roll)
            tosurface.roll();
        if (action.shuffle && tosurface.shuffle)
            tosurface.shuffle();
        if (action.spin && tosurface.spin)
            tosurface.spin();
        if (action.shake && tosurface.onShake)
            tosurface.onShake();

        // Element changes

        if ((action.setFlippable !== undefined) && tosurface.setFlippable)
            tosurface.setFlippable(getValue(action.setFlippable,list,rest,surface,env));
        if ((action.setSide !== undefined) && tosurface.setSide)
            tosurface.setSide(getValue(action.setSide,list,rest,surface,env));
        if ((action.setLastVector !== undefined) && tosurface.setLastVector)
            tosurface.setLastVector(getValue(action.setLastVector,list,rest,surface,env));
        if ((action.setLastPoint !== undefined) && tosurface.setLastPoint)
            tosurface.setLastPoint(getValue(action.setLastPoint,list,rest,surface,env));
        if ((action.setLastStep !== undefined) && tosurface.setLastStep)
            tosurface.setLastStep(getValue(action.setLastStep,list,rest,surface,env));
        if ((action.setLastArea !== undefined) && tosurface.setLastArea)
            tosurface.setLastArea(getValue(action.setLastArea,list,rest,surface,env));
        if (action.flip && getValue(action.flip,list,rest,surface,env))
            tosurface.flip();
        if ((action.setRotation !== undefined) && tosurface.setRotation)
            tosurface.setRotation(getValue(action.setRotation,list,rest,surface,env));
        if ((action.setValue !== undefined) && tosurface.setValue)
            tosurface.setValue(getValue(action.setValue,list,rest,surface,env));
        if ((action.sumValue !== undefined) && tosurface.sumValue)
            tosurface.sumValue(getValue(action.sumValue,list,rest,surface,env));
        if ((action.subtractValue !== undefined) && tosurface.subtractValue)
            tosurface.subtractValue(getValue(action.subtractValue,list,rest,surface,env));

        // State events

        if (action.reset && getValue(tosurface.reset,list,rest,surface,env))
            tosurface.reset();
        if (action.toggle && getValue(tosurface.toggle,list,rest,surface,env))
            tosurface.toggle();
        if (action.stop && getValue(tosurface.stop,list,rest,surface,env))
            tosurface.stop();
        if (action.start && getValue(tosurface.start,list,rest,surface,env))
            tosurface.start();
        
        // Animations

        if (action.stopAnimation && getValue(tosurface.stopAnimation,list,rest,surface,env))
            tosurface.stopAnimation();

        // Element position

        if (action.moveToTop && getValue(tosurface.moveToTop,list,rest,surface,env))
            tosurface.moveToTop();
        if (action.moveToTable) {
            let
                gapX = getValue(action.moveToTable.gapX,list,rest,surface,env),
                gapY = getValue(action.moveToTable.gapY,list,rest,surface,env),
                x = action.moveToTable.x === undefined ? tosurface.x : getValue(action.moveToTable.x,list,rest,surface,env)+(gapX && id ? id*gapX : 0),
                y = action.moveToTable.y === undefined ? tosurface.y : getValue(action.moveToTable.y,list,rest,surface,env)+(gapY && id ? id*gapY : 0);

            tosurface.animateToPosition(x,y,true);
        }
        if (action.moveIntoTable) {
            let
                x = action.moveIntoTable.x === undefined ? tosurface.x : getValue(action.moveIntoTable.x,list,rest,surface,env)+(Math.random()*(getValue(action.moveIntoTable.width,list,rest,surface,env)-tosurface.width)),
                y = action.moveIntoTable.y === undefined ? tosurface.y : getValue(action.moveIntoTable.y,list,rest,surface,env)+(Math.random()*(getValue(action.moveIntoTable.height,list,rest,surface,env)-tosurface.height));

            tosurface.animateToPosition(x,y,true);
        }
        if (action.moveTo) {
            let
                gapX = getValue(action.moveTo.gapX,list,rest,surface,env),
                gapY = getValue(action.moveTo.gapY,list,rest,surface,env),
                x = action.moveTo.x === undefined ? tosurface.x : surface.x+getValue(action.moveTo.x,list,rest,surface,env)+(gapX && id ? id*gapX : 0),
                y = action.moveTo.y === undefined ? tosurface.y : surface.y+getValue(action.moveTo.y,list,rest,surface,env)+(gapY && id ? id*gapY : 0);

            tosurface.animateToPosition(x,y,true);
        }
        if (action.moveInto) {
            let
                x = action.moveInto.x === undefined ? tosurface.x : surface.x+getValue(action.moveInto.x,list,rest,surface,env)+(Math.random()*(getValue(action.moveInto.width,list,rest,surface,env)-tosurface.width)),
                y = action.moveInto.y === undefined ? tosurface.y : surface.y+getValue(action.moveInto.y,list,rest,surface,env)+(Math.random()*(getValue(action.moveInto.height,list,rest,surface,env)-tosurface.height));

            tosurface.animateToPosition(x,y,true);
        }
        if (action.moveBy) {
            let
                x = action.moveBy.x === undefined ? tosurface.x : surface.x+getValue(action.moveBy.x,list,rest,surface,env),
                y = action.moveBy.y === undefined ? tosurface.y : surface.y+getValue(action.moveBy.y,list,rest,surface,env);
            
            tosurface.animateToPosition(x,y,true);
        }
        
        // Paint actions

        if (action.paint && getValue(tosurface.paint,list,rest,surface,env))
            tosurface.paint();

        // Run submacro

        if (action.do)
            runMacro(action.do,tosurface,false,0,env);
    }

    // --- Table manipulation

    function execute(action,list,rest,surface,env) {

        if (action.setTool!== undefined)
            surface.setToolById(getValue(action.setTool,list,rest,surface,env));

    }

    // --- Variables

    function newEnvironment(s) {
        return { variables:{ self:s } };
    }

    // --- Macro runner

    function runMacro(macro,surface,list,id,env) {

        let
            rest,
            running = true;

        if (!macro) return;
        if (macro.length === undefined) macro = [ macro ];
        if (!env) env = newEnvironment(surface);

        if (!list)
            list = [ surface ];

        rest = list;

        macro.forEach(line=>{

            if (running) {

                let
                    times = line.times || 1,
                    lineId = id,
                    lineList = list,
                    run = true;

                if (line.debugger)
                    debugger;

                if (line.getElementsByTag)
                    lineList = surface.getSurfacesByTag(line.getElementsByTag);

                if (line.getRest) {
                    list = rest;
                    lineList = rest;
                }

                if (line.onElements)
                    lineList = filterList(line.onElements,lineList,rest,surface,env);

                if (line.if)
                    run = checkCondition(line.if,lineList,rest,surface,env);

                if (run) {
                    for (let i=0;i<times;i++) {

                        if (line.set)
                            for (let k in line.set)
                                env.variables[k] = getValue(line.set[k],lineList,rest,surface,env);

                        if (line.execute)
                            execute(line.execute,lineList,rest,surface,env);

                        if (line.forEach) {

                            if (line.forEach.shuffleZIndex && getValue(line.forEach.shuffleZIndex,lineList,rest,surface,env)) {
                                Global.shuffle(lineList);
                                lineList.forEach(element=>{
                                    element.moveToTop();
                                });
                            }

                            if (line.forEach.invertZIndex && getValue(line.forEach.invertZIndex,lineList,rest,surface,env)) {
                                lineList.reverse().forEach(element=>{
                                    element.moveToTop();
                                });
                            }

                            if (line.forEach.shufflePosition && getValue(line.forEach.shufflePosition,lineList,rest,surface,env)) {
                                let
                                    spots = [];
                                spots = lineList.map(surface=>{
                                    return {x:surface.x+(surface.width/2), y:surface.y+(surface.height/2) }
                                });
                                Global.shuffle(spots);
                                spots.forEach((spot,id)=>{
                                    let
                                        object = lineList[id];
                                    object.animateToPosition(spot.x-(object.width/2), spot.y-(object.height/2),true);
                                });
                            }

                            lineList.forEach(element=>{
                                applyAction(element,line.forEach,lineId,lineList,rest,surface,env);
                                lineId++;
                            });

                        }

                        if (line.do)
                            runMacro(line.do,surface,lineList,lineId,env);

                        // Get rest

                        rest = list.filter(element=>lineList.indexOf(element) == -1);

                        if (line.onRestDo)
                            runMacro(line.onRestDo,surface,rest,id,env);

                    }

                    if ((line.break !== undefined) && getValue(line.break,lineList,rest,surface,env))
                        running = false;
                }
                else if (line.else)
                    runMacro(line.else,surface,lineList,lineId,env);

            }

        })
    }

    return {
        if:(condition,surface)=>{
            return checkCondition(condition,[],[],surface,newEnvironment(surface));
        },
        run:(macro,surface)=>{
            runMacro(macro,surface,false,0,0);
        }
    }

}());