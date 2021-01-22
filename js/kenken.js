var key = [];
var focus = [];
var seconds = 0;
var minutes = 0;
var hours = 0;
var pause = false;

function Start() {
    CreateInputs(4);
    key = Generate(4);
    StartTimer();
}

function CreateInputs(width) {
    table = document.getElementById("table");
    table.innerHTML = "";
    let inside = "";
    for(let i = 0; i < width; i++) {
        inside += "<tr>";
        for(let j = 0; j < width; j++) {
            inside += "<td><input type='text' maxlength='1' oninput='this.value=this.value.replace(/[^0-9]/g,'');' autocomplete='off' id=" + i + ',' + j + " class='cell' onfocus='UpdateFocus()' form='grid' /></td>";
        }
        inside += "</tr>";
    }
    table.innerHTML = inside;
}

function Generate(width) {
    return GenerateGrid(width);
}

function GenerateGrid(width) {
    var grid = [];
    for(let i = 0; i < width; i++) {
        grid[i] = [];
        for(let j = 0; j < width; j++) {
            grid[i][j] = (i + j) % width + 1;
        }
    }
    return RandomizeGrid(grid);
}

function RandomizeGrid(grid) {
    for (let i = 0; i < 1000000; i++) {
        let a = getRandomInt(grid.length);
        let b = getRandomInt(grid.length);
        let c = getRandomInt(grid.length);
        let d = getRandomInt(grid.length);
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

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function StartTimer() {
    setTimeout(time, 1000, 1);
}
const time = delay => {
    if (!pause) {
        if (seconds < 59) {
            document.getElementById("seconds").innerHTML = ("0" + (seconds + 1)).slice(-2);
            document.getElementById("minutes").innerHTML =("0" + (minutes)).slice(-2);
            document.getElementById("hours").innerHTML =("0" + (hours)).slice(-2);
            seconds++;
        }
        else {
            if (minutes < 59) {
                document.getElementById("seconds").innerHTML = ("0" + (0)).slice(-2);
                document.getElementById("minutes").innerHTML = ("0" + (minutes + 1)).slice(-2);
                document.getElementById("hours").innerHTML = ("0" + (hours)).slice(-2);
                seconds = 0;
                minutes++;
            }
            else {
                document.getElementById("seconds").innerHTML = ("0" + (0)).slice(-2);
                document.getElementById("minutes").innerHTML = ("0" + (0)).slice(-2);
                document.getElementById("hours").innerHTML = ("0" + (hours + 1)).slice(-2);
                seconds = 0;
                minutes = 0;
                hours++;
            }
        }
        StartTimer();
    }
};
function ResetTimer() {
    pause = true;
    seconds = 0;
    minutes = 0;
    hours = 0;
    document.getElementById("seconds").innerHTML = ("0" + (0)).slice(-2);
    document.getElementById("minutes").innerHTML = ("0" + (0)).slice(-2);
    document.getElementById("hours").innerHTML = ("0" + (0)).slice(-2);
    setTimeout(function() {
        pause = false;
        StartTimer();
    }, 1000);
}

function ChangeSize() {
    let select = document.getElementById("size");
    var width = select.options[select.selectedIndex].text;
    CreateInputs(width);
    key = Generate(width);
    ResetTimer();
}

function ResetPuzzle() {
    let select = document.getElementById("size");
    var width = select.options[select.selectedIndex].text;
    CreateInputs(width);
}

function NewPuzzle() {
    let select = document.getElementById("size");
    var width = select.options[select.selectedIndex].text;
    CreateInputs(width);
    key = Generate(width);
    ResetTimer();
}

function UpdateFocus() {
    let current = document.activeElement;
    let position = current.getAttribute("id");
    focus = [parseInt(position.charAt(0)), parseInt(position.charAt(2))];
}

function RevealSquare() {
    let cell = document.getElementById(focus[0] + "," + focus[1]);
    cell.value = key[focus[0]][focus[1]];
}

function ShowAnswer() {
    let cells = document.getElementsByClassName("cell");
    for (let i = 0; i < key.length; i++) {
        for (let j = 0; j < key.length; j++) {
            let cell = cells[j + i * key.length];
            cell.value = key[i][j];
        }
    }
}