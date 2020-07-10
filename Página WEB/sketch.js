const promises = [];
let images = [];
let featureExtractor;
let classifier;
let nomeImage = "";
var classes = [0, 0];
let classID = classes.length;
let video;
let loss;
var classesT = [0, 0];

function setup() {
    noCanvas();
    featureExtractor = ml5.featureExtractor('MobileNet');
}

function addClass() {
    classes.push(0);
    console.log(classes);

    classID = classes.length;

    var div = document.createElement('div');
    var titulo = document.createElement("div");
    var hr = document.createElement("hr");
    var br = document.createElement("br");
    var span = document.createElement("span");
    var divDesc = document.createElement('div');
    var textareaDesc = document.createElement('textarea');
    var btnCamera = document.createElement("BUTTON");
    var iconeCame = document.createElement("i");
    var labelCame = document.createElement("label");
    var input = document.createElement("input");
    var dvScroll = document.createElement("div");
    var dvPreview = document.createElement("div");
    var divCamera = document.createElement("div");
    var btnAdd = document.createElement("BUTTON");
    var iconeAdd = document.createElement("i");
    var label = document.createElement("label");

    div.className = "camera";
    div.innerHTML = document.getElementById('getText').innerHTML;

    titulo.innerHTML = "Objeto " + classID;
    titulo.id = "titulo" + classID;
    titulo.className = "titulo";
    titulo.contentEditable = "true";

    span.innerHTML = "0 Imagens adicionadas";
    span.id = "amountOfClass" + classID;

    divDesc.className = "descricao";

    textareaDesc.innerHTML = "Descrição";
    textareaDesc.id = "descricao" + classID;
    textareaDesc.setAttribute("type", "text");
    textareaDesc.rows = "3";
    textareaDesc.cols = "40";

    divDesc.innerHTML += textareaDesc.outerHTML;

    btnCamera.id = classID;
    btnCamera.setAttribute("onclick", "camera1(" + classID + ")");
    iconeCame.className = "material-icons";
    iconeCame.innerHTML = "camera_alt";
    labelCame.innerHTML = " Câmara";
    btnCamera.innerHTML += iconeCame.outerHTML + labelCame.outerHTML;

    btnAdd.id = "buttonUpload";
    input.type = "file";
    input.id = "fileupload" + classID;
    input.setAttribute("onclick", "upload(" + classID + ")");
    input.style.display = "none";
    input.multiple = true;
    label.htmlFor = "fileupload" + classID;
    label.innerHTML = " Enviar Imagem";
    iconeAdd.className = "material-icons";
    iconeAdd.innerHTML = "backup";
    btnAdd.innerHTML += input.outerHTML + iconeAdd.outerHTML + label.outerHTML;

    dvScroll.className = "scrollmenu";
    dvPreview.id = "dvPreview" + classID;
    dvPreview.className = "mostraImage";
    dvScroll.innerHTML += dvPreview.outerHTML;

    divCamera.id = "videoContainer" + classID;

    div.innerHTML += titulo.outerHTML + hr.outerHTML + span.outerHTML + br.outerHTML + divDesc.outerHTML + btnCamera.outerHTML + btnAdd.outerHTML + dvScroll.outerHTML + divCamera.outerHTML/*  + btnAdd.outerHTML */;

    document.getElementById("section--input").appendChild(br);
    document.getElementById("section--input").appendChild(div);

}