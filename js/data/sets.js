SETS={
    load:(LANGUAGE,toolbox)=>{
        
        function createColorSet(item) {
            let
                out = [];
            for (let i=0;i<8;i++) {
                let
                    newItem = Global.clone(item);
                newItem.options.backgroundColor = i;
                out.push(newItem);
            }

            return out;

        }

        toolbox.addElementsSet({
            id:"kit-dice-rpg",
            meta:{
                title:LANGUAGE.kits.diceRpg.title,
                description:LANGUAGE.kits.diceRpg.description,
                icon: "/images/elements/dice-d20.svg"
            },
            data:[
                {
                    id:"dice-d4",
                    options:{
                        backgroundColor:0
                    }
                },
                {
                    id:"dice-d6",
                    options:{
                        backgroundColor:2
                    }
                },
                {
                    id:"dice-d8",
                    options:{
                        backgroundColor:3
                    }
                },
                {
                    id:"dice-d10",
                    options:{
                        backgroundColor:1
                    }
                },
                {
                    id:"dice-d10-ten",
                    options:{
                        backgroundColor:1
                    }
                },
                {
                    id:"dice-d12",
                    options:{
                        backgroundColor:4
                    }
                },
                {
                    id:"dice-d20",
                    options:{
                        backgroundColor:5
                    }
                },
                {
                    id:"dice-d100",
                    options:{
                        backgroundColor:6
                    }
                },
                {
                    id:"tray",
                    options:{
                        backgroundColor:7,
                        mode:0
                    }
                }
            ]
        });

        toolbox.addElementsSet({
            id:"kit-dice-d6",
            meta:{
                title:LANGUAGE.kits.d6set.title,
                description:LANGUAGE.kits.d6set.description,
                icon: "/images/elements/dice-d6-pips-icon.svg"
            },
            data:createColorSet({
                id:"dice-d6-pips",
                options:{
                    backgroundColor:0
                }
            })
        });

        toolbox.addElementsSet({
            id:"kit-tokens-disks",
            meta:{
                title:LANGUAGE.kits.disks.title,
                description:LANGUAGE.kits.disks.description,
                icon: "/images/elements/token.svg"
            },
            data:createColorSet({
                id:"token-1",
                options:{
                    "labelText.EN":"",
                    backgroundColor:0,
                    mode:2
                }
            })
        });

        toolbox.addElementsSet({
            id:"kit-tokens-cubes",
            meta:{
                title:LANGUAGE.kits.cubes.title,
                description:LANGUAGE.kits.cubes.description,
                icon: "/images/elements/token.svg"
            },
            data:createColorSet({
                id:"token-0",
                options:{
                    "labelText.EN":"",
                    backgroundColor:0,
                    mode:0
                }
            })
        });

        toolbox.addElementsSet({
            id:"kit-tokens-peeple",
            meta:{
                title:LANGUAGE.kits.peeple.title,
                description:LANGUAGE.kits.peeple.description,
                icon: "/images/elements/peeple-up.svg"
            },
            data:createColorSet({
                id:"token-1-peeple",
                options:{
                    backgroundColor:0
                }
            })
        });

        toolbox.addElementsSet({
            id:"kit-drawing-set",
            meta:{
                title:LANGUAGE.kits.drawing.title,
                description:LANGUAGE.kits.drawing.description,
                icon: "/images/elements/ruler.svg"
            },
            data:[
                {
                    id:"line-compass",
                    options:{
                        backgroundColor:7,
                        "previewTool.border":1
                    }
                },{
                    id:"line-ruler",
                    options:{
                        backgroundColor:7,
                        "previewTool.border":1
                    }
                },{
                    id:"stamp-small",
                    options:{
                        backgroundColor:7,
                        "previewTool.border":1,
                        colorize:true
                    }
                },{
                    id:"stamp-normal",
                    options:{
                        backgroundColor:7,
                        "previewTool.border":1,
                        colorize:true
                    }
                }
            ]
        });

        [
            { id:"kit-counters-verysmall", elementId:"counter-verysmall", labelId:"verySmallCounters" },
            { id:"kit-counters-small", elementId:"counter-small", labelId:"smallCounters" },
            { id:"kit-counters-normal", elementId:"counter-normal", labelId:"normalCounters" }
        ].forEach(set=>{
            
            toolbox.addElementsSet({
                id:set.id,
                meta:{
                    title:LANGUAGE.kits[set.labelId].title,
                    description:LANGUAGE.kits[set.labelId].description,
                    icon: "/images/elements/counter.svg"
                },
                data:createColorSet({
                    id:set.elementId,
                    options:{
                        "descriptionText.EN":"",
                        backgroundColor:0,
                        mode:0,
                        isTransparent:false,
                        value:0,
                        minValue:-100,
                        maxValue:100,
                        gauge:false
                    }
                })
            });

        })
       

    }
}