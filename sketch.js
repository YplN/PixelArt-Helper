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

var rgbToHex = function(rgb) {
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



var fullColorHex = function(r, g, b) {
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
    text(floor((mouseX - BX) / SIZE) + DX, round(mouseX / SIZE) * SIZE, BY - 10);
    textAlign(RIGHT, BASELINE);
    text(
        floor((mouseY - BY) / SIZE) + DY,
        BX - 10,
        round(mouseY / SIZE) * SIZE + 10
    );
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

    resizeCanvas(2 * BX + SIZE * W, 2 * BY + SIZE * H);

}


// let xS, yS, xE, yE;
// let xSo, ySo, xEo, yEo;
// let update = false;

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

    var buttonGenerate = createButton("Générer");
    buttonGenerate.mousePressed(generatePixels);
    buttonGenerate.id('generateButton');
    // buttonGenerate.position(250, top + 20);
    buttonGenerate.parent("buttons");

    var buttonCompare = createButton("Comparer");
    buttonCompare.mousePressed(getDataFromURL);
    buttonCompare.id('compareButton');
    // buttonGenerate.position(350, top + 20);
    buttonCompare.parent("buttons");


    var buttonExport = createButton("Exporter");
    buttonExport.mousePressed(exportData);
    buttonExport.parent("buttons");


    let defaultSize = min(20, max(2, 0.75 * ((window.innerWidth - 2 * BX) / W)));

    slider = createSlider(2, 20, defaultSize, 0.1);
    slider.parent('slider');
    slider.id('mySlider');

    SIZE = slider.value();
    SIZEo = SIZE;


    createCanvas(W * SIZE + 2 * BX, H * SIZE + 2 * BY);


}

function draw() {
    background(255);

    xS = parseInt(document.getElementById('xS').value);
    yS = parseInt(document.getElementById('yS').value);
    xE = parseInt(document.getElementById('xE').value);
    yE = parseInt(document.getElementById('yE').value);

    SIZE = slider.value();

    if (SIZEo != SIZE) {
        resizeCanvas(2 * BX + SIZE * W, 2 * BY + SIZE * H);
        SIZEo = SIZE;
    }


    // if (xS != xSo || yS != ySo || xE != xEo || yE != yEo || update) {
    //   generatePixels();
    // }

    // if(urlN != null)
    //   {
    //     newImg=loadImage(urlN);
    //     url = urlN;
    //   }
    // if(newImg && urlN != url){
    //   image(newImg, 0, 0);
    // }

    for (let p of P) {
        p.show();
        if (!p.correct) {
            p.showBorders();
        }

    }

    if (selP != null) {

        selP.showBorders();
    }

    if (mouseOnFlag()) {
        let p = getPixelFromMouse();
        p.showBorders();
        drawCoordinates();
        p.showInfo();


    }

    if (nChanges != null) {
        textSize(25);
        noStroke();
        fill(0);
        textAlign(CENTER);
        let textToShow = `Il reste ${nChanges} pixel` + (nChanges < 2 ? "" : "s") + ` à corriger (~${nChanges*2} min)`
        if (nChanges == 0) {
            textToShow = "Félicitations !!"
        }

        text(textToShow, width / 2, height - (BY / 2));
    }


    // image(flagImg, 0, 0);
}

function getPixelFromMouse() {
    let i = floor((mouseX - BX) / SIZE);
    let j = floor((mouseY - BY) / SIZE);
    // console.log("i", i,"(", i+DX,')', "j", j,"(", j+DY,')', i*H+j, P.length)
    return P[i * H + j];
}

function handleFile(file) {
    if (file.type === 'image') {
        flagImg = loadImage(file.data);
        console.log(document.getElementById('mySlider').value)


        xS = parseInt(document.getElementById('xS').value);
        xE = parseInt(document.getElementById('xE').value);
        W = abs(xE - xS) + 1;

        let defaultSize = min(20, max(2, 0.75 * (window.innerWidth / W)));
        document.getElementById('mySlider').value = defaultSize;

        console.log(document.getElementById('mySlider').value)
        generatePixels();
        update = true;
    }
}




function getDataFromURL() {
    // console.log(`https://api.codati.ovh/pixels/zone/?minx=${xS}&miny=${yS}&maxx=${xE}&maxy=${yE}`);
    $.getJSON(`https://api.codati.ovh/pixels/zone/?minx=${xS}&miny=${yS}&maxx=${xE}&maxy=${yE}`,
        function(data) {
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
        // console.log(p.hex, p.j, p.i);

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