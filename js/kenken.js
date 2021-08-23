let _key = [];
let _focus = [];
let _seconds = 0;
let _minutes = 0;
let _hours = 0;
let _pause = false;
let _cells = [];
let _numberOfCellGroups = 0;
let _operators = [];

function Start() {
    _started = true;
    CreateInputs(4);
    _key = Generate(4);
    GenerateCells(4);
    RenderCells(4);
    StartTimer();
}

function CreateInputs(width) {
    table = document.getElementById("table");
    table.innerHTML = "";
    let inside = "";
    for(let i = 0; i < width; i++) {
        inside += "<tr>";
        for(let j = 0; j < width; j++) {
            inside += "<td><div class='label' id='label" + i + ',' + j + "'></div><input type='text' maxlength='1' autocomplete='off' id=" + i + ',' + j + " class='cell' onfocus='UpdateFocus()' form='grid' /></td>";
        }
        inside += "</tr>";
    }
    table.innerHTML = inside;
}

function Generate(width) {
    let grid = [];
    for(let i = 0; i < width; i++) {
        grid[i] = [];
        for(let j = 0; j < width; j++) {
            grid[i][j] = (i + j) % width + 1;
        }
    }
    return RandomizeGrid(grid);
}

function RandomizeGrid(grid) {
    for (let i = 0; i < 100000; i++) {
        let a = GetRandomInt(grid.length);
        let b = GetRandomInt(grid.length);
        let c = GetRandomInt(grid.length);
        let d = GetRandomInt(grid.length);
        let temp = grid[a];
        grid[a] = grid[b];
        grid[b] = temp;
        for (let j = 0; j < grid.length; j++) {
            let t = grid[j][c];
            grid[j][c] = grid[j][d];
            grid[j][d] = t;
        }
    }
    return grid;
}

function GetRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function GenerateCells(width) {
    _cells = [];
    _operators = [];
    _numberOfCellGroups = 0;
    let index = 0;
    let filled = false;
    for(let i = 0; i < width; i++) {
        _cells[i] = [];
        for(let j = 0; j < width; j++) {
            _cells[i][j] = -1;
        }
    }
    while (!filled) {
        let startCell = GetFirstEmptyCell(width);
        if (startCell[0] != -1) {
            let numberOfCells = GetRandomInt(3) + 2;
            _cells[startCell[0]][startCell[1]] = index;
            for (let i = 0; i < numberOfCells; i++) {
                let firstEmpty = GetFirstEmptyCell(width);
                if (firstEmpty[0] != -1) {
                    let direction = GetRandomInt(3);
                    let x = 0;
                    let y = 0;
                    if (direction == 0) {
                        x = startCell[0];
                        y = startCell[1] + 1;
                    } else if (direction == 1) {
                        x = startCell[0] + 1;
                        y = startCell[1];
                    } else if (direction == 2) {
                        x = startCell[0];
                        y = startCell[1] - 1;
                    } else {
                        x = startCell[0] - 1;
                        y = startCell[1];
                    }
                    if (x >= 0 && x < width && y >= 0 && y < width) {
                        if (_cells[x][y] == -1) {
                            _cells[x][y] = index;
                        }
                    } else {
                        i--;
                    }
                }
            }
            index++;
            _numberOfCellGroups++;
        } else {
            filled = true;
        }
    }
    for (let i = 0; i < _numberOfCellGroups; i++) {
        numberOfCells = 0;
        startCell = [-1,-1];
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < width; y++) {
                if (_cells[x][y] == i) {
                    numberOfCells++;
                    if (startCell[0] == -1)
                        startCell = [x,y];
                }
            }
        }
        if (numberOfCells > 1) {
            operator = GetRandomInt(4);
            if (operator == 0) {
                sum = 0;
                for (let x = 0; x < width; x++) {
                    for (let y = 0; y < width; y++) {
                        if (_cells[x][y] == i) {
                            sum += _key[x][y];
                        }
                    }
                }
                _operators[i] = sum + "+";
            } else if (operator == 1) {
                difference = -10;
                for (let x = 0; x < width; x++) {
                    for (let y = 0; y < width; y++) {
                        if (_cells[x][y] == i) {
                            if (difference == -10)
                                difference = _key[x][y];
                            else
                                difference -= _key[x][y];
                        }
                    }
                }
                if (difference < 0) {
                    i--;
                } else
                    _operators[i] = difference + "-";
            } else if (operator == 2) {
                product = 1;
                for (let x = 0; x < width; x++) {
                    for (let y = 0; y < width; y++) {
                        if (_cells[x][y] == i) {
                            product *= _key[x][y];
                        }
                    }
                }
                _operators[i] = product + "x";
            } else {
                quotient = -10;
                for (let x = 0; x < width; x++) {
                    for (let y = 0; y < width; y++) {
                        if (_cells[x][y] == i) {
                            if (quotient == -10)
                                quotient = _key[x][y];
                            else
                                quotient /= _key[x][y];
                        }
                    }
                }
                if (quotient < 0 || quotient % 1 != 0) {
                    i--;
                } else
                    _operators[i] = quotient + "÷";
            }
        } else {
            _operators[i] = _key[startCell[0]][startCell[1]];
        }
        document.getElementById("label" + startCell[0] + "," + startCell[1]).innerHTML = _operators[i];
    }
}

function GetFirstEmptyCell(width) {
    for (let i = 0; i < width; i++) {
        for (let j = 0; j < width; j++) {
            if (_cells[i][j] == -1) {
                return [i, j];
            }
        }
    }
    return [-1, -1];
}

function NumberOfEmptyCells(width) {
    let count = 0;
    for (let i = 0; i < width; i++) {
        for (let j = 0; j < width; j++) {
            if (_cells[i][j] == -1) {
                count++;
            }
        }
    }
    return count;
}

function RenderCells(width) {
    let wide = "4px solid #699A9E";
    let thin = "2px solid #699A9E";
    for (let i = 0; i < width; i++) {
        for (let j = 0; j < width; j++) {
            let cell = document.getElementById(i + "," + j);
            if (i == 0) {
                cell.style.borderTop = wide;
            } else {
                if (_cells[i - 1][j] != _cells[i][j]) {
                    cell.style.borderTop = thin;
                }
            }
            if (i == width - 1) {
                cell.style.borderBottom = wide;
            } else {
                if (_cells[i + 1][j] != _cells[i][j]) {
                    cell.style.borderBottom = thin;
                }
            }
            if (j == 0) {
                cell.style.borderLeft = wide;
            } else {
                if (_cells[i][j - 1] != _cells[i][j]) {
                    cell.style.borderLeft = thin;
                }
            }
            if (j == width - 1) {
                cell.style.borderRight = wide;
            } else {
                if (_cells[i][j + 1] != _cells[i][j]) {
                    cell.style.borderRight = thin;
                }
            }
        }
    }
}

function StartTimer() {
    setTimeout(time, 1000, 1);
}

const time = delay => {
    if (!_pause) {
        if (_seconds < 59) {
            document.getElementById("seconds").innerHTML = ("0" + (_seconds + 1)).slice(-2);
            document.getElementById("minutes").innerHTML =("0" + (_minutes)).slice(-2);
            document.getElementById("hours").innerHTML =("0" + (_hours)).slice(-2);
            _seconds++;
        }
        else {
            if (_minutes < 59) {
                document.getElementById("seconds").innerHTML = ("0" + (0)).slice(-2);
                document.getElementById("minutes").innerHTML = ("0" + (_minutes + 1)).slice(-2);
                document.getElementById("hours").innerHTML = ("0" + (_hours)).slice(-2);
                _seconds = 0;
                _minutes++;
            }
            else {
                document.getElementById("seconds").innerHTML = ("0" + (0)).slice(-2);
                document.getElementById("minutes").innerHTML = ("0" + (0)).slice(-2);
                document.getElementById("hours").innerHTML = ("0" + (_hours + 1)).slice(-2);
                _seconds = 0;
                _minutes = 0;
                _hours++;
            }
        }
        StartTimer();
    }
};

function ResetTimer() {
    _pause = true;
    _seconds = 0;
    _minutes = 0;
    _hours = 0;
    document.getElementById("seconds").innerHTML = ("0" + (0)).slice(-2);
    document.getElementById("minutes").innerHTML = ("0" + (0)).slice(-2);
    document.getElementById("hours").innerHTML = ("0" + (0)).slice(-2);
    setTimeout(function() {
        _pause = false;
        StartTimer();
    }, 1000);
}

function ChangeSize() {
    NewPuzzle();
}

function NewPuzzle() {
    let select = document.getElementById("size");
    let width = select.options[select.selectedIndex].text;
    CreateInputs(width);
    _key = Generate(width);
    GenerateCells(width);
    RenderCells(width);
    ResetTimer();
}

function ResetPuzzle() {
    let select = document.getElementById("size");
    let width = select.options[select.selectedIndex].text;
    CreateInputs(width);
}

function RevealSquare() {
    let cell = document.getElementById(_focus[0] + "," + _focus[1]);
    cell.value = _key[_focus[0]][_focus[1]];
}

function ShowSolution() {
    let cells = document.getElementsByClassName("cell");
    for (let i = 0; i < _key.length; i++) {
        for (let j = 0; j < _key.length; j++) {
            let cell = cells[j + i * _key.length];
            cell.value = _key[i][j];
        }
    }
}

function UpdateFocus() {
    let current = document.activeElement;
    let position = current.getAttribute("id");
    _focus = [parseInt(position.charAt(0)), parseInt(position.charAt(2))];
}