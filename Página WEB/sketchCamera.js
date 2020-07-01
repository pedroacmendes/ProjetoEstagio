function camera1(id) {
    if(id>1){
        closeCameras(id);
    }
    //video.hide(id);
    video = createCapture(VIDEO);
    video.parent('videoContainer' + id);
    video.size(230, 230);
    //teste
    var btnAdd = document.createElement("button");
    btnAdd.id = id;
    btnAdd.innerHTML = "Tirar fotografia";
    btnAdd.setAttribute("onclick", "javascript: addSample(id);");

    document.getElementById("videoContainer" + id).appendChild(btnAdd);

    const options = { numLabels: classes.length };
    classifier = featureExtractor.classification(video, options);
}

function closeCameras(id) {
      video.hide(id);  
}

function addSample(id) {
    var ex = document.getElementById('titulo' + id).firstChild;
    ex = ex.nodeValue;
    console.log(ex);
    classifier.addImage(ex);
    console.log(classes);
    var id2 = id - 1;
    select('#amountOfClass' + id).html(classes[id2]++);
}
