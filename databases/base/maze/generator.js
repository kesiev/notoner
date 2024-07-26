GENERATOR=(function(){

    function generate(width,height) {

        let
            n=width*height-1,
            toVisit = [],
            vert = [],
            horz = [],
            here= { x:Math.floor(Math.random()*width), y:Math.floor(Math.random()*height) },
            path= [ here ],
            next,
            directions;
    
        for (let j= 0; j<=width; j++) {
            vert[j]= [];
            horz[j]= [];
            toVisit[j] = [];
            for (let k= 0; k<height; k++)
                toVisit[j].push(true);
        }

        toVisit[here.x][here.y]=false;

        while (n) {

            directions = [];

            [
                { x:here.x+1, y:here.y},
                { x:here.x-1, y:here.y},
                { x:here.x, y:here.y+1},
                { x:here.x, y:here.y-1}
            ].forEach(dest=>{
                if ((dest.x>=0) && (dest.y>=0) && (dest.x<width) && (dest.y<height) && (toVisit[dest.x][dest.y]))
                    directions.push(dest);
            });

            if (directions.length) {

                next = directions[Math.floor(Math.random()*directions.length)];
                n = n-1;
                toVisit[next.x][next.y]= false;
                if (next.x == here.x)
                    horz[next.x][(next.y+here.y-1)/2]= true;
                else
                    vert[(next.x+here.x-1)/2][next.y]= true;
                here = next;
                path.push(here);

            } else 
                here = path.pop();

        }

        return { width: width, height: height, horz: horz, vert: vert };

    }

    function drawLine(x1,y1,x2,y2,color,marker) {
        return '<path style="fill:none;stroke:'+color+';stroke-width:1px;stroke-linecap:round;stroke-linejoin:miter;stroke-opacity:1" d="M '+x1+' '+y1+' '+x2+' '+y2+'" '+(marker ? 'marker-end="url(#'+marker+')"' : "")+'/>';
    }

    function draw(maze,dx,dy,cellsize,color,width,height) {
        let
            svg = "",
            halfCell = cellsize/2;
      
        svg += '<?xml version="1.0" encoding="UTF-8" standalone="no"?><svg width="'+width+'mm" height="'+height+'mm" viewBox="0 0 '+width+' '+height+'" version="1.1" id="svg5" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">';
        svg += '<defs><marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" /></marker></defs>';
        svg += '<g id="layer1">';

        svg+=drawLine(dx+halfCell,dy,dx+halfCell,dy+cellsize,color,"arrow");
        svg+=drawLine(dx+cellsize*maze.width-halfCell,dy+cellsize*maze.height+halfCell,dx+cellsize*maze.width+cellsize-halfCell,dy+cellsize*maze.height+halfCell,color,"arrow");
        dy+=cellsize;
        svg+=drawLine(dx+cellsize,dy,dx+maze.width*cellsize,dy,color);
        svg+=drawLine(dx,dy,dx,dy+maze.height*cellsize,color);
        for (let x=0;x<maze.width; x++)
            for (let y=0;y<maze.height; y++) {
                if (!maze.vert[x][y] && ((y != maze.height-1) || (x != maze.width-1)))
                    svg+=drawLine(dx+(x+1)*cellsize,dy+y*cellsize,dx+(x+1)*cellsize,dy+(y+1)*cellsize,color);
                if (!maze.horz[x][y])
                    svg+=drawLine(dx+x*cellsize,dy+(y+1)*cellsize,dx+(x+1)*cellsize,dy+(y+1)*cellsize,color);
            }
        svg += '</g></svg>';
        
        return svg;
    }

    return {
        run:(self,json,sub,cb)=>{
            let
                settings = sub.settings,
                maze = generate(settings.mazeWidth,settings.mazeHeight),
                svg = draw(maze,settings.renderX,settings.renderY,settings.renderCellSize,"#000",420,297);

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
                            type:"svg",
                            svg:svg
                        }
                    }
                }
            });

            json.data.push({
                type:"timer-clock",
                data:{
                    x:settings.timerX,
                    y:settings.timerY,
                    backgroundColor:{ r:255, g:0, b:0, a:1 }
                }
            });

            cb(json);
           
        }
    }

})();