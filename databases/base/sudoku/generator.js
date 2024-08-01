GENERATOR=(function(){

    // Adapted from: https://www.emanueleferonato.com/2015/06/23/pure-javascript-sudoku-generatorsolver/

    // given a sudoku cell, returns the row
    function returnRow(cell) {
        return Math.floor(cell / 9);
    }

    // given a sudoku cell, returns the column
    function returnCol(cell) {
        return cell % 9;
    }

    // given a sudoku cell, returns the 3x3 block
    function returnBlock(cell) {
        return Math.floor(returnRow(cell) / 3) * 3 + Math.floor(returnCol(cell) / 3);
    }

    // given a number, a row and a sudoku, returns true if the number can be placed in the row
    function isPossibleRow(number,row,sudoku) {
        for (let i=0; i<=8; i++)
            if (sudoku[row*9+i] == number)
                return false;

        return true;
    }

    // given a number, a column and a sudoku, returns true if the number can be placed in the column
    function isPossibleCol(number,col,sudoku) {
        for (let i=0; i<=8; i++)
            if (sudoku[col+9*i] == number)
                return false;
        return true;
    }

    // given a number, a 3x3 block and a sudoku, returns true if the number can be placed in the block
    function isPossibleBlock(number,block,sudoku) {
        for (let i=0; i<=8; i++)
            if (sudoku[Math.floor(block/3)*27+i%3+9*Math.floor(i/3)+3*(block%3)] == number)
                return false;

        return true;
    }

    // given a cell, a number and a sudoku, returns true if the number can be placed in the cell
    function isPossibleNumber(cell,number,sudoku) {
        let
            row = returnRow(cell),
            col = returnCol(cell),
            block = returnBlock(cell);

        return isPossibleRow(number,row,sudoku) && isPossibleCol(number,col,sudoku) && isPossibleBlock(number,block,sudoku);
    }

    // given a row and a sudoku, returns true if it's a legal row
    function isCorrectRow(row,sudoku) {
        let
            rightSequence = new Array(1,2,3,4,5,6,7,8,9),
            rowTemp= new Array();

        for (let i=0; i<=8; i++)
            rowTemp[i] = sudoku[row*9+i];

        rowTemp.sort();
        return rowTemp.join() == rightSequence.join();
    }

    // given a column and a sudoku, returns true if it's a legal column
    function isCorrectCol(col,sudoku) {
        let
            rightSequence = new Array(1,2,3,4,5,6,7,8,9),
            colTemp= new Array();

        for (let i=0; i<=8; i++)
            colTemp[i] = sudoku[col+i*9];

        colTemp.sort();

        return colTemp.join() == rightSequence.join();
    }

    // given a 3x3 block and a sudoku, returns true if it's a legal block 
    function isCorrectBlock(block,sudoku) {
        let
            rightSequence = new Array(1,2,3,4,5,6,7,8,9),
            blockTemp= new Array();

        for (let i=0; i<=8; i++)
            blockTemp[i] = sudoku[Math.floor(block/3)*27+i%3+9*Math.floor(i/3)+3*(block%3)];

        blockTemp.sort();

        return blockTemp.join() == rightSequence.join();
    }

    // given a sudoku, returns true if the sudoku is solved
    function isSolvedSudoku(sudoku) {
        for (let i=0; i<=8; i++)
            if (!isCorrectBlock(i,sudoku) || !isCorrectRow(i,sudoku) || !isCorrectCol(i,sudoku))
                return false;

        return true;
    }

    // given a cell and a sudoku, returns an array with all possible values we can write in the cell
    function determinePossibleValues(cell,sudoku) {
        let
            possible = new Array();

        for (let i=1; i<=9; i++)
            if (isPossibleNumber(cell,i,sudoku))
                possible.unshift(i);

        return possible;
    }

    // given an array of possible values assignable to a cell, returns a random value picked from the array
    function determineRandomPossibleValue(possible,cell) {
        let
            randomPicked = Math.floor(Math.random() * possible[cell].length);

        return possible[cell][randomPicked];
    }

    // given a sudoku, returns a two dimension array with all possible values 
    function scanSudokuForUnique(sudoku) {
        let
            possible = new Array();

        for (let i=0; i<=80; i++)
            if (sudoku[i] == 0) {
                possible[i] = new Array();
                possible[i] = determinePossibleValues(i,sudoku);
                if (possible[i].length==0)
                    return false;
            }
        return possible;
    }

    // given an array and a number, removes the number from the array
    function removeAttempt(attemptArray,number) {
        let
            newArray = new Array();

        for (let i=0; i<attemptArray.length; i++)
            if (attemptArray[i] != number)
                newArray.unshift(attemptArray[i]);

        return newArray;
    }

    // given a two dimension array of possible values, returns the index of a cell where there are the less possible numbers to choose from
    function nextRandom(possible) {
        let
            max = 9,
            minChoices = 0;

        for (let i=0; i<=80; i++)
            if (possible[i]!=undefined)
                if ((possible[i].length<=max) && (possible[i].length>0)) {
                    max = possible[i].length;
                    minChoices = i;
                }

        return minChoices;
    }

    // given a sudoku, solves it
    function solve(sudoku) {
        let
            saved = new Array(),
            savedSudoku = new Array(),
            i=0,
            nextMove,
            whatToTry,
            attempt;

        while (!isSolvedSudoku(sudoku)) {
            i++;
            nextMove = scanSudokuForUnique(sudoku);
            if (nextMove == false) {
                nextMove = saved.pop();
                sudoku = savedSudoku.pop();
            }
            whatToTry = nextRandom(nextMove);
            attempt = determineRandomPossibleValue(nextMove,whatToTry);
            if (nextMove[whatToTry].length>1) {
                nextMove[whatToTry] = removeAttempt(nextMove[whatToTry],attempt);
                saved.push(nextMove.slice());
                savedSudoku.push(sudoku.slice());
            }
            sudoku[whatToTry] = attempt;
        }
    }

    // check if a sudoku is complete
    function isComplete(sudoku) {

        for (let i=0;i<81;i++)
            if (!sudoku[0])
                return false;

        return true;
    }

    // generate and render a Sudoku
    function printSudoku(context,fields,scale,ox,oy,blanks) {
        const
            CELLSIZE = 80;

        let
            valid = false,
            validSudoku = [];

        // --- Generate a valid sudoku

        do {
            
            for (let i=0;i<81;i++)
                validSudoku[i]=0;
    
            solve(validSudoku);
            valid = isComplete(validSudoku);
    
        } while (!valid);

        // --- Creates a solvable sudoku

        let
            blankPos,
            blanksLeft,
            sudoku,
            testSudoku;

        do {

            valid = false;
            blanksLeft = blanks;
            sudoku = validSudoku.slice();

            do {
                blankPos = Math.floor(Math.random()*81);
                if (sudoku[blankPos]) {
                    sudoku[blankPos] = 0;
                    blanksLeft--;
                }
            } while (blanksLeft);

            testSudoku = sudoku.slice();
            solve(testSudoku);
            valid = isComplete(testSudoku);
            
        } while (!valid);

        // --- Draw it

        context.lineWidth = 2;
        context.strokeStyle = "#000";
        context.textBaseline = "middle";
        context.textAlign = "center";
        context.font = "bold 48px Seshat";

        for (let y=0;y<9;y++)
            for (let x=0;x<9;x++) {
                let
                    px = ox+(x*CELLSIZE),
                    py = oy+(y*CELLSIZE),
                    pos = y*9+x;

                context.beginPath();
                context.rect(px, py, CELLSIZE, CELLSIZE);
                context.stroke();
                if (sudoku[pos])
                    context.fillText(sudoku[pos], px+(CELLSIZE/2), py+(CELLSIZE/2));
                else
                    fields.push({
                        type:"text",
                        x:px*scale,
                        y:py*scale,
                        width:CELLSIZE*scale,
                        height:CELLSIZE*scale,
                        multiline:false,
                        align:"center"
                    });
                
            }

        context.lineWidth = 6;

        for (let y=0;y<3;y++)
            for (let x=0;x<3;x++) {
                context.beginPath();
                context.rect(ox+(x*CELLSIZE*3), oy+(y*CELLSIZE*3), CELLSIZE*3, CELLSIZE*3);
                context.stroke();
            }

    }
    
    return {
        run:(self,json,sub,cb)=>{
                            
            let
                fields = [],
                sheetWidth = 420,
                sheetHeight = 297,
                canvasWidth = 2525,
                canvasHeight = 1785,
                canvas = document.createElement("canvas"),
                context = canvas.getContext("2d");

            canvas.width = canvasWidth;
            canvas.height = canvasHeight;

            for (let i=0;i<6;i++)
                printSudoku(context,fields,sheetWidth/canvasWidth,95+(800*(i%3)),110+(840*Math.floor(i/3)),20+((i*4)+(sub.settings.difficulty*8)));

            json.data.push({
                type:"sheet",
                data:{
                    x:0,
                    y:0,
                    width:sheetWidth,
                    height:sheetHeight,
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
            })
            cb(json);
           
        }
    }

})();