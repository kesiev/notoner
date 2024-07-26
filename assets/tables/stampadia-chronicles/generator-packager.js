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
	generator = generator.replace("\tcb(svg);\n","\tsvg._rooms=rooms;cb(svg);\n");

	// --- Inject the model SVG
	let
		svgModelData = fs.readFileSync(root + svgModel, { encoding: "utf8", flag: "r" });

	generator += "\nSVGTemplate.cache={'svg/model.svg':`"+svgModelData+"`};\n";

	// --- Add generator
	generator += `
		return {
			run:(self,json,sub,cb)=>{

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
				
                        Global.svgToCanvas(svgText,2525,1785,(canvas)=>{
                            
                            for (let k in json.meta.description)
                                json.meta.description[k] += note;
                            for (let k in json.meta.title)
                                json.meta.title[k] += title;

                            json.data.push({
                                type:"sheet",
                                data:{
                                    x:0,
                                    y:0,
                                    width:420,
                                    height:297,
                                    frame:true,
                                    model:{
                                        EN:{
                                            isResource:true,
                                            type:"canvas",
                                            canvas:canvas
                                        }
                                    }
                                }
                            },{
                                type:"calculator-portrait",
                                data:{
                                    x:430,
                                    y:0,
                                    isVariableZIndex:false,
                                    backgroundColor:{  r:120, g:120, b:120, a:1 }
                                }
                            });
            
                            // --- Place the hero token
                            svg._rooms.forEach((room,index)=>{
                                if (room.isStartingRoom) {
                                    json.data.push({
                                        type:"token-1",
                                        data:{
                                            x: 286,
                                            y: 4.1 + (index * 11.55),
                                            backgroundColor:{  r:42, g:255, b:42, a:1 },
                                            isTransparent: true,
                                            isVariableZIndex:false,
                                            mode: 1
                                        }
                                    });
                                    room.items.forEach(item=>{
                                        let
                                            x=item.x+room.x,
                                            y=item.y+room.y;
                                        
                                        item=item.item;
            
                                        if (!item.isHidden) {
                                            switch (item.id) {
                                                case "stairs":{
                                                    json.data.push({
                                                        type:"token-0",
                                                        data:{
                                                            x: 21+(x*12.15),
                                                            y: 44+(y*12.15),
                                                            backgroundColor:{  r:255, g:42, b:42, a:1 },
                                                            isTransparent: true,
                                                            isVariableZIndex:false,
                                                            mode: 2
                                                        }
                                                    });
                                                    break;
                                                }
                                            }
                                        }
                                    });
                                }
                            });

                            json.data.push({
                                "type": "tray",
                                "data": {
                                    "x": 430,
                                    "y": 247,
                                    "mode": 0,
                                    "backgroundColor": {
                                        "r": 20,
                                        "g": 20,
                                        "b": 20,
                                        "a": 1
                                    }
                                }
                            },{
                                type:"dice-d6",
                                data:{
                                    x:440,
                                    y:252,
                                    backgroundColor:{  r:42, g:255, b:42, a:1 }
                                }
                            },{
                                type:"dice-d6",
                                data:{
                                    x:440,
                                    y:276,
                                    backgroundColor:{  r:42, g:255, b:42, a:1 }
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