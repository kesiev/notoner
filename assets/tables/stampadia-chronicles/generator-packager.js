const
    MINIFY = true,
    path = require("path"),
    fs = require("fs"),
	terser = require("terser");

if (process.argv[2]) {

	const
		sep = path.sep,
		root = process.argv[2] + sep,
		svgModel = "svg"+sep+"model.svg",
		seshatFont = "style"+sep+"Seshat"+sep+"seshat-webfont.woff",
		bundle = [
			"js"+sep+"svg.js",
			"js"+sep+"generator.js",
			"js"+sep+"core.js",
			"database"+sep+"enemymodels.js",
			"database"+sep+"equipment.js",
			"database"+sep+"flavortexts.js",
			"database"+sep+"heromodels.js",
			"database"+sep+"keywords.js",
			"database"+sep+"modifiers.js",
			"database"+sep+"placeholders.js",
			"database"+sep+"quests-bonusmalus.js",
			"database"+sep+"quests-fillers.js",
			"database"+sep+"quests-helpers.js",
			"database"+sep+"quests-main.js",
			"database"+sep+"quests-story.js",
			"database"+sep+"quests-sub.js",
			"database"+sep+"randomizers.js",
			"database"+sep+"truthMap.js"
		];

	let
		generator = "GENERATOR=(function(){";

	bundle.forEach(file=>{
		let data = fs.readFileSync(root + file, { encoding: "utf8", flag: "r" });
		generator+="\n"+data+"\n";
	})

	// --- Skip database loading
	generator = generator.replace(/DATABASES=\[[^\]]*\]/,"DATABASES=[]");

	// --- Publish the map layout on SVG to add tokens
	generator = generator.replace("\tcb(svg);\n","\tsvg._rooms=rooms;svg._noise=noise;svg._hero=hero;cb(svg);\n");

	// --- Inject the model SVG
	let
		svgModelData = fs.readFileSync(root + svgModel, { encoding: "utf8", flag: "r" });

	generator += "\nSVGTemplate.cache={'svg/model.svg':`"+svgModelData+"`};\n";

	// --- Add generator
	generator += `
        return {
            run:(self,json,sub,cb)=>{

                const
                    GRID_X = 13.438,
                    GRID_Y = 29.894,
                    CELL_SIZE = 8.578,
                    TABLE_X = 191.165,
                    TABLE_Y = 3.193,
                    TABLE_WIDTH = 102.655,
                    TABLE_ROWHEIGHT = 8.145,
                    EYE_SIZE = 2.369,
                    ITEMS_X = 118.277,
                    ITEMS_Y = 4.879,
                    ITEMS_SPACING = 3.45,
                    CHECKBOX_SIZE = 2.369,
                    CHECKBOX_HSIZE = CHECKBOX_SIZE/2,
                    GOLD_X = 37.981,
                    GOLD_Y = 16.255,
                    GOLD_SPACING = 2.928,
                    GOLD_SIZE = 2.619,
                    GOLD_COUNT = 50,
                    SKILL_GAP = 10.717,
                    SKILL_X = 196.667+(SKILL_GAP/2),
                    SKILL_Y_HP = 172.1355,
                    SKILL_Y_XP = 203.55;

                function addCheckbox(fields,x,y,size,times,spacing) {
                    if (times === undefined) times = 1;
                    if (spacing === undefined) spacing = size;
                    for (let i=0;i<times;i++)
                        fields.push({ type:"checkbox", x:x+(spacing*i), y:y, width:size, height:size });
                }

                function processItems(fields,ox,oy,list) {
                    list.forEach(item=>{
                        let
                            x=item.x+ox,
                            y=item.y+oy,
                            cx = GRID_X+(x*CELL_SIZE),
                            cy = GRID_Y+(y*CELL_SIZE);
                        
                        if (item.item)
                            item=item.item;

                        if (!item.isHidden) {
                            switch (item.id) {
                                case "stairs":{
                                    json.data.push({
                                        type:"token-0",
                                        data:{
                                            x:cx+0.3,
                                            y:cy+0.3,
                                            backgroundColor:{  r:255, g:42, b:42, a:1 },
                                            isTransparent: true,
                                            isVariableZIndex:false,
                                            mode: 2,
                                            snapTo: [
                                                {
                                                    grid: {
                                                        x: GRID_X+0.3,
                                                        y: GRID_Y+0.3,
                                                        width:CELL_SIZE,
                                                        height: CELL_SIZE
                                                    }
                                                }
                                            ]
                                        }
                                    });
                                    break;
                                }
                                case "fakeEnemy":
                                case "enemy":{
                                    
                                    switch (item.level) {
                                        case 1:{
                                            addCheckbox(fields,cx+3.1045,cy+3.1045,EYE_SIZE);
                                            break;
                                        }
                                        case 2:{
                                            addCheckbox(fields,cx+1.919,cy+3.1045,EYE_SIZE);
                                            addCheckbox(fields,cx+4.289,cy+3.1045,EYE_SIZE);
                                            break;
                                        }
                                        case 3:{
                                            addCheckbox(fields,cx+1.919,cy+1.919,EYE_SIZE);
                                            addCheckbox(fields,cx+4.289,cy+1.919,EYE_SIZE);
                                            addCheckbox(fields,cx+3.1045,cy+4.289,EYE_SIZE);
                                            break;
                                        }
                                        case 4:{
                                            addCheckbox(fields,cx+1.919,cy+1.919,EYE_SIZE);
                                            addCheckbox(fields,cx+4.289,cy+1.919,EYE_SIZE);
                                            addCheckbox(fields,cx+1.919,cy+4.289,EYE_SIZE);
                                            addCheckbox(fields,cx+4.289,cy+4.289,EYE_SIZE);
                                            break;
                                        }
                                    }
                                    addCheckbox(fields,cx,cy,CELL_SIZE);
                                    break;
                                }
                                case "fakeGenericItem":
                                case "genericItem":{
                                    addCheckbox(fields,cx,cy,CELL_SIZE);
                                    break;
                                }
                            }
                        }
                    });
                }

                function addCheckboxSet(fields,x,y,number) {

                    switch (number) {
                        case 0:{
                            break;
                        }
                        case 1:{
                            addCheckbox(fields,x-CHECKBOX_HSIZE,y-CHECKBOX_HSIZE,CHECKBOX_SIZE);
                            break;
                        }
                        case 2:{
                            addCheckbox(fields,x-CHECKBOX_SIZE,y-CHECKBOX_HSIZE,CHECKBOX_SIZE,2);
                            break;
                        }
                        case 3:{
                            addCheckbox(fields,x-CHECKBOX_SIZE,y-CHECKBOX_SIZE,CHECKBOX_SIZE,2);
                            addCheckbox(fields,x-CHECKBOX_HSIZE,y,CHECKBOX_SIZE);
                            break;
                        }
                        case 4:{
                            addCheckbox(fields,x-CHECKBOX_SIZE,y-CHECKBOX_SIZE,CHECKBOX_SIZE,2);
                            addCheckbox(fields,x-CHECKBOX_SIZE,y,CHECKBOX_SIZE,2);
                            break;
                        }
                        case 5:{
                            addCheckbox(fields,x-CHECKBOX_HSIZE*3,y-CHECKBOX_SIZE,CHECKBOX_SIZE,3);
                            addCheckbox(fields,x-CHECKBOX_SIZE,y,CHECKBOX_SIZE,2);
                            break;
                        }
                        case 6:{
                            addCheckbox(fields,x-CHECKBOX_HSIZE*3,y-CHECKBOX_SIZE,CHECKBOX_SIZE,3);
                            addCheckbox(fields,x-CHECKBOX_HSIZE*3,y,CHECKBOX_SIZE,3);
                            break;
                        }
                        case 7:{
                            addCheckbox(fields,x-CHECKBOX_HSIZE*3,y-CHECKBOX_HSIZE*3,CHECKBOX_SIZE,3);
                            addCheckbox(fields,x-CHECKBOX_HSIZE*3,y-CHECKBOX_HSIZE,CHECKBOX_SIZE,3);
                            addCheckbox(fields,x-CHECKBOX_HSIZE,y+CHECKBOX_HSIZE,CHECKBOX_SIZE);
                            break;
                        }
                        case 8:{
                            addCheckbox(fields,x-CHECKBOX_HSIZE*3,y-CHECKBOX_HSIZE*3,CHECKBOX_SIZE,3);
                            addCheckbox(fields,x-CHECKBOX_HSIZE*3,y-CHECKBOX_HSIZE,CHECKBOX_SIZE,3);
                            addCheckbox(fields,x-CHECKBOX_SIZE,y+CHECKBOX_HSIZE,CHECKBOX_SIZE,2);
                            break;
                        }
                        case 9:{
                            addCheckbox(fields,x-CHECKBOX_HSIZE*3,y-CHECKBOX_HSIZE*3,CHECKBOX_SIZE,3);
                            addCheckbox(fields,x-CHECKBOX_HSIZE*3,y-CHECKBOX_HSIZE,CHECKBOX_SIZE,3);
                            addCheckbox(fields,x-CHECKBOX_HSIZE*3,y+CHECKBOX_HSIZE,CHECKBOX_SIZE,3);
                            break;
                        }
                        case 10:{
                            addCheckbox(fields,x-CHECKBOX_SIZE*2,y-CHECKBOX_HSIZE*3,CHECKBOX_SIZE,4);
                            addCheckbox(fields,x-CHECKBOX_HSIZE*3,y-CHECKBOX_HSIZE,CHECKBOX_SIZE,3);
                            addCheckbox(fields,x-CHECKBOX_HSIZE*3,y+CHECKBOX_HSIZE,CHECKBOX_SIZE,3);
                            break;
                        }
                        case 11:{
                            addCheckbox(fields,x-CHECKBOX_SIZE*2,y-CHECKBOX_HSIZE*3,CHECKBOX_SIZE,4);
                            addCheckbox(fields,x-CHECKBOX_SIZE*2,y-CHECKBOX_HSIZE,CHECKBOX_SIZE,4);
                            addCheckbox(fields,x-CHECKBOX_HSIZE*3,y+CHECKBOX_HSIZE,CHECKBOX_SIZE,3);
                            break;
                        }
                        default:{
                            addCheckbox(fields,x-CHECKBOX_SIZE*2,y-CHECKBOX_HSIZE*3,CHECKBOX_SIZE,4);
                            addCheckbox(fields,x-CHECKBOX_SIZE*2,y-CHECKBOX_HSIZE,CHECKBOX_SIZE,4);
                            addCheckbox(fields,x-CHECKBOX_SIZE*2,y+CHECKBOX_HSIZE,CHECKBOX_SIZE,4);
                            break;
                        }
                    }
                }

                if (Global.USE_CANVG) {
                    let
                        template = SVGTemplate.cache['svg/model.svg'];
                    template = template.replace(/x="-157.8889"/g,"x=\\"-145.5\\"");
                    template = template.replace(/x="20.291265"/g,"x=\\"24.9\\"");
                    template = template.replace(/x="252.62047"/g,"x=\\"249\\"");
                    SVGTemplate.cache['svg/model.svg'] = template;
                }

                var core=new Core();
        
                core.initialize(()=>{
        
                    var dungen=core.generateAdventureDaily();
                    dungen.prepare();
                    dungen.createSVG((svg)=>{
        
                        let
                            note = " (#"+dungen.metadata.seed+" - "+dungen.metadata.title+")",
                            title = " (#"+dungen.metadata.seed+")",
                            svgText = svg.getSVG();

                        svgText = svgText.replaceAll(String.fromCharCode(187),"&#187;");
                
                        Global.svgToCanvas(svgText,1782,1260,(canvas)=>{
                            
                            let
                                fields = [];

                            for (let k in json.meta.description)
                                json.meta.description[k] += note;
                            for (let k in json.meta.title)
                                json.meta.title[k] += title;

                            // --- Place the hero token
                            svg._rooms.forEach((room,index)=>{

                                addCheckbox(fields,TABLE_X+1.2,TABLE_Y+(index*TABLE_ROWHEIGHT)+2.9,CHECKBOX_SIZE);

                                if (room.isStartingRoom)
                                    json.data.push({
                                        type:"token-0",
                                        data:{
                                            x: TABLE_X + 10.5,
                                            y: TABLE_Y + (index * TABLE_ROWHEIGHT),
                                            backgroundColor:{  r:42, g:255, b:42, a:1 },
                                            isTransparent: true,
                                            isVariableZIndex:false,
                                            mode: 1,
                                            snapTo: [
                                                {
                                                    grid: {
                                                        y: TABLE_Y,
                                                        height: TABLE_ROWHEIGHT
                                                    }
                                                }
                                            ]
                                        }
                                    });
                                processItems(fields,room.x,room.y,room.items);
                            });

                            processItems(fields,0,0,svg._noise);

                            fields.push({
                                type:"text",
                                x:8.465,
                                y:0.1,
                                width:60,
                                height:6.029,
                                fontSize:5,
                                fontFamily:"Seshat",
                                multiline:false
                            });

                            for (let i=0;i<3;i++)
                                addCheckbox(fields,ITEMS_X,ITEMS_Y+(i*ITEMS_SPACING),CHECKBOX_SIZE);

                            addCheckbox(fields,GOLD_X,GOLD_Y,GOLD_SIZE,GOLD_COUNT,GOLD_SPACING);

                            svg._hero.skills.forEach((skill,id)=>{
                                addCheckboxSet(fields,SKILL_X+(id*SKILL_GAP),SKILL_Y_HP,skill.hp);
                                addCheckboxSet(fields,SKILL_X+(id*SKILL_GAP),SKILL_Y_XP,skill.xp);
                            });

                            json.data.push({
                                type:"calculator-portrait",
                                data:{
                                    x:307,
                                    y:0,
                                    isVariableZIndex:false,
                                    backgroundColor:{  r:120, g:120, b:120, a:1 }
                                }
                            },{
                                type: "tray",
                                data: {
                                    x: 307,
                                    y: 159.5,
                                    mode: 0,
                                    backgroundColor: {
                                        r: 20,
                                        g: 20,
                                        b: 20,
                                        a: 1
                                    }
                                }
                            },{
                                type:"dice-d6",
                                data:{
                                    x:317,
                                    y:174.5,
                                    backgroundColor:{  r:42, g:255, b:42, a:1 }
                                }
                            },{
                                type:"dice-d6",
                                data:{
                                    x:357,
                                    y:174.5,
                                    backgroundColor:{  r:42, g:255, b:42, a:1 }
                                }
                            });

                            // --- Add sheet
                            json.data.unshift({
                                type:"sheet",
                                data:{
                                    x:0,
                                    y:0,
                                    width:297,
                                    height:210,
                                    frame:true,
                                    model:{
                                        EN:{
                                            isResource:true,
                                            type:"canvas",
                                            canvas:canvas
                                        }
                                    },
                                    fields:{
                                        EN:fields
                                    }
                                }
                            });

                            cb(json);
                        });
                });
            })
        }
    }
}());
`;


    if (MINIFY) {
        terser.minify(generator).then(minified=>{
            fs.writeFileSync(["..","..","..","databases","base","stampadia-chronicles","generator.js"].join(sep), minified.code);
            console.log("Stampadia generator.js updated.");	
        })
    } else {
        fs.writeFileSync(["..","..","..","databases","base","stampadia-chronicles","generator.js"].join(sep), generator);
        console.log("Stampadia generator.js updated. (NOT MINIFIED)");	
    } 
	

} else {
	console.log("This script generates a generator.js file for Chronicles of Stampadia from");
	console.log("a project snapshot from GitHub (https://github.com/kesiev/stampadia).");
	console.log();
	console.log("USAGE: generator-packager.js [path-to-stampadia-snapshot]");
}