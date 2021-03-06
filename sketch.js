let SIZE = 15;
let W = 41;
let H = 21;

let DX = 156;
let DY = 80;

const BX = 100;
const BY = 70;

let flagImg
let input;
let newimg;


let P = [];

function preload() {
    flagImg = loadImage('TM4.png');

}

function randomColor() {
    return color(floor(random(256)), floor(random(256)), floor(random(256)));
    // k++;
    // return(color(k*255/861));
}

var rgbToHex = function (rgb) {
    var hex = Number(rgb).toString(16);
    if (hex.length < 2) {
        hex = "0" + hex;
    }
    return hex;
};


function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? color(parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16), 255) : null;
}



var fullColorHex = function (r, g, b) {
    var red = rgbToHex(r);
    var green = rgbToHex(g);
    var blue = rgbToHex(b);
    return red + green + blue;
};

function getXFromI(i) {
    return i * SIZE + xS;
}

function getYFromJ(j) {
    return j * SIZE + yS;
}


function getIFromX(x) {
    // console.log((x - min(xE, xS)));
    return floor((x - min(xE, xS)));
}

function getJFromY(y) {
    return floor((y - min(yE, yS)));
}

class Pixel {
    constructor(i, j, c) {
        this.i = i;
        this.j = j;
        this.x = parseInt(getXFromI(i), 10);
        this.y = parseInt(getYFromJ(j), 10);
        this.c = c;
        this.hex = fullColorHex(red(c), green(c), blue(c)).toUpperCase();
        this.correct = true;
        this.realC = c;
    }

    show() {
        rectMode(CORNER);
        if (this.correct)
            fill(this.c);
        else
            fill(this.realC);

        stroke(100);
        strokeWeight(1);
        rect(this.i * SIZE + BX, this.j * SIZE + BY, SIZE, SIZE);

        if (!this.correct) {
            fill(255, 0, 0);
            rect(this.i * SIZE + BX + SIZE / 4, this.j * SIZE + BY + SIZE / 4, SIZE / 2, SIZE / 2);
        }
    }

    isOnMouse() {
        return (
            mouseX - BX >= this.j * SIZE &&
            mouseX - BX <= this.i * SIZE + SIZE &&
            mouseY - BY >= this.y &&
            mouseY - BY <= this.y + SIZE
        );
    }

    showInfo() {
        textSize(20);
        let cWidth = textWidth(this.hex) + 10;

        stroke(120);
        strokeWeight(1);
        fill(255);
        rect(mouseX - 5, mouseY - 30, cWidth + 10, 30, 5);
        fill(0);

        noStroke();
        textAlign(LEFT, BASELINE);
        text("#" + this.hex, mouseX, mouseY - 7);
    }

    showBorders() {
        rectMode(CORNER);
        noFill();

        stroke(255);

        if (red(this.c) + green(this.c) + blue(this.c) > 500)
            stroke(0);

        if (!this.correct) {
            strokeWeight(2);
            rect(this.i * SIZE + BX, this.j * SIZE + BY, SIZE, SIZE);
        } else {
            strokeWeight(4);
            rect(this.i * SIZE + BX + 2, this.j * SIZE + BY + 2, SIZE - 4, SIZE - 4);
            strokeWeight(2);
            rect(this.i * SIZE + BX + 1, this.j * SIZE + BY + 1, SIZE - 2, SIZE - 2);
        }

    }
}

function drawCoordinates() {
    textSize(20);
    noStroke();
    fill(0);
    textAlign(CENTER);
    text(Math.trunc((mouseX - BX) / SIZE) + DX, Math.trunc(mouseX / SIZE) * SIZE + SIZE / 2, BY - 10);
    textAlign(RIGHT, BASELINE);
    text(Math.floor((mouseY - BY) / SIZE) + DY, BX - 10, Math.floor((mouseY) / SIZE) * SIZE + 10);

}


function drawCoordinates(p) {

    if (p) {
        textSize(20);
        noStroke();
        fill(0);

        textAlign(CENTER);
        text("x : " + (p.i + xS), p.i * SIZE + BX + SIZE / 2, BY - 12);

        textAlign(RIGHT, BASELINE);
        text("y : " + (p.j + yS), BX - 10, p.j * SIZE + SIZE + BY - 2);
    }
}




function drawCoordinatesSelectedPixel() {

    if (selP) {
        textSize(20);

        let xCoord = textWidth("x : " + selP.x) + 20;
        let yCoord = textWidth("y : " + selP.y) + 20;

        noStroke();
        fill(0);
        rectMode(CENTER);
        rect(selP.i * SIZE + BX + SIZE / 2, height - 1.5 * BY + 25, xCoord, 30, 5);

        rect(width - BX + 10 + yCoord / 2, selP.j * SIZE + SIZE + BY - 7, yCoord, 30, 5);

        fill(255);
        textAlign(CENTER, BASELINE);
        text("x : " + (selP.i + xS), selP.i * SIZE + BX + SIZE / 2, height - 1.5 * BY + 32);

        textAlign(CENTER, BASELINE);
        text("y : " + (selP.j + yS), width - BX + 8 + yCoord / 2, selP.j * SIZE + SIZE + BY - 2);
    }
}


function drawRemainingChanges() {
    if (nChanges != null) {
        textSize(25);
        noStroke();
        fill(0);
        textAlign(CENTER);
        let textToShow = `Il reste ${nChanges} pixel` + (nChanges < 2 ? "" : "s") + ` ?? corriger (~${nChanges*2} min)`
        if (nChanges == 0) {
            textToShow = "F??licitations !!"
        }

        text(textToShow, width / 2, height - 0.5 * BY);
    }

}

function mouseOnFlag() {
    return (
        mouseX > BX &&
        mouseX < W * SIZE + BX &&
        mouseY > BY &&
        mouseY < H * SIZE + BY
    );
}

function generatePixels() {
    DX = min(xS, xE);
    DY = min(yS, yE);

    W = abs(xE - xS) + 1;
    H = abs(yE - yS) + 1;


    let scaleX = flagImg.width / W;
    let scaleY = flagImg.height / H;

    xSo = xS;
    ySo = yS;
    xEo = xE;
    yEo = yE;

    P = [];
    for (let i = 0; i < W; i++) {
        for (let j = 0; j < H; j++) {
            let c = flagImg.get(i * scaleX, j * scaleY);
            P.push(new Pixel(i, j, c));
        }
    }

    nChanges = null;

    resizeCanvas(2 * BX + SIZE * W, 2.5 * BY + SIZE * H);

}


let SIZEo;

let selP = null;

let nChanges = null;

function setup() {


    var viewportOffset = document.getElementsByTagName('canvas')[0].getBoundingClientRect();
    var top = viewportOffset.top;


    input = createFileInput(handleFile);
    input.parent("upload");



    xS = parseInt(document.getElementById('xS').value);
    yS = parseInt(document.getElementById('yS').value);
    xE = parseInt(document.getElementById('xE').value);
    yE = parseInt(document.getElementById('yE').value);

    generatePixels();

    var buttonGenerate = createButton("G??n??rer");
    buttonGenerate.mousePressed(generatePixels);
    buttonGenerate.id('generateButton');
    buttonGenerate.parent("buttons");
    buttonGenerate.id("generate");
    document.getElementById("generate").title = "G??n??rer l'image pixelis??e ?? partir du fichier";

    var buttonCompare = createButton("Comparer");
    buttonCompare.mousePressed(getDataFromURL);
    buttonCompare.id('compareButton');
    buttonCompare.parent("buttons");
    buttonCompare.id("compare");
    document.getElementById("compare").title = "Comparer avec le vrai drapeau";


    var buttonExport = createButton("Exporter");
    buttonExport.mousePressed(exportData);
    buttonExport.parent("buttons");
    buttonExport.id("export");
    document.getElementById("export").title = "Copier dans le presse-papier";

    let ratio = 0.5;
    if (window.innerWidth < 1000)
        ratio = 0.9;
    let defaultSize = min(20, max(2, ratio * ((window.innerWidth - 2 * BX) / W)));

    slider = createSlider(2, 20, defaultSize, 0.1);
    slider.parent('slider');
    slider.id('mySlider');

    SIZE = slider.value();
    SIZEo = SIZE;


    createCanvas(W * SIZE + 2 * BX, H * SIZE + 2.5 * BY);


}

function draw() {
    background(255);

    xS = parseInt(document.getElementById('xS').value);
    yS = parseInt(document.getElementById('yS').value);
    xE = parseInt(document.getElementById('xE').value);
    yE = parseInt(document.getElementById('yE').value);

    SIZE = slider.value();

    if (SIZEo != SIZE) {
        resizeCanvas(2 * BX + SIZE * W, 2.5 * BY + SIZE * H);
        SIZEo = SIZE;
    }



    for (let p of P) {
        p.show();


    }

    if (selP != null) {

        selP.showBorders();
    }


    drawCoordinatesSelectedPixel();

    if (mouseOnFlag()) {
        let p = getPixelFromMouse();
        p.showBorders();
        drawCoordinates();
        p.showInfo();

        drawCoordinates(p);

    }

    drawRemainingChanges();
}

function getPixelFromMouse() {
    let i = floor((mouseX - BX) / SIZE);
    let j = floor((mouseY - BY) / SIZE);

    return P[i * H + j];
}

function handleFile(file) {
    if (file.type === 'image') {
        flagImg = loadImage(file.data);
        console.log(document.getElementById('mySlider').value)


        xS = parseInt(document.getElementById('xS').value);
        xE = parseInt(document.getElementById('xE').value);
        W = abs(xE - xS) + 1;
        let ratio = 0.5;
        if (window.innerWidth < 1000)
            ratio = 0.9;
        let defaultSize = min(20, max(2, ratio * ((window.innerWidth - 2 * BX) / W)));
        document.getElementById('mySlider').value = defaultSize;

        console.log(document.getElementById('mySlider').value)
        generatePixels();
        update = true;
    }
}




function getDataFromURL() {
    // console.log(`https://api.codati.ovh/pixels/zone/?minx=${xS}&miny=${yS}&maxx=${xE}&maxy=${yE}`);
    $.getJSON(`https://api.codati.ovh/pixels/zone/?minx=${xS}&miny=${yS}&maxx=${xE}&maxy=${yE}`,
        function (data) {
            let n = 0;
            // let False = [];

            for (const pR of data) {

                let iR = getIFromX(parseInt(pR['x']));
                let jR = getJFromY(parseInt(pR['y']));
                let colR = pR['hexColor'].substr(1);
                let p = P[iR * H + jR];

                if (p.hex.toUpperCase() != colR.toUpperCase()) {

                    // False.push({
                    //   c: p,
                    //   r: pR
                    // });
                    p.correct = false;
                    p.realC = hexToRgb(colR);
                    n++;

                } else {
                    p.correct = true;
                }
            }
            nChanges = n;

        });
}



function mouseClicked() {
    if (mouseOnFlag()) {
        let p = getPixelFromMouse();

        if (p === selP) {
            selP = null;
        } else {
            selP = p;
        }

        var dummy = document.createElement("textarea");
        document.body.appendChild(dummy);
        dummy.value = p.hex;
        dummy.select();
        document.execCommand("copy");
        document.body.removeChild(dummy);
    }
}



function exportData() {
    s = "";
    if (flagImg) {

        let scaleX = flagImg.width / W;
        let scaleY = flagImg.height / H;
        for (let j = 0; j < H; j++) {
            for (let i = 0; i < W; i++) {
                let c = flagImg.get(i * scaleX, j * scaleY);
                let hex = fullColorHex(red(c), green(c), blue(c));
                s = `${s}${hex.toUpperCase()} `;
            }
            s = s.slice(0, -1) + '\n';
        }
    }

    var dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.value = s;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
}