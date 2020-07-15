function useFeatures() {
  
  classifier = featureExtractor.classification();
  console.log(classifier.config);

  //opçoes do treino
  classifier.config.numLabels = classID;
  classifier.config.epochs = 50;
  classifier.config.batchSize = 16;
  classifier.config.learningRate = 0.001;

  console.log(classifier.config);
  console.log("tamanho: " + images.length);

  addImages();

  if( JSON.stringify(classes)==JSON.stringify(classesT) ){
    alert("Não pode enviar o modelo sem adicionar as imagens previamente.");
  } else { 
    Promise.all(promises)
      .then(() => {
        console.log('Training.');
        classifier.train(lossValue => {
          if (lossValue) {
            //training
            console.log("perda: " + lossValue);
          } else {
            console.log("TREINO REALIZADO!");
            //exportar
            console.log(classifier);
            classifier.save();
            paraGif();
          }
        });
      });
  } 

}

function addImages(){
  //este ciclo percorre os objetos
  for (let i = 0; i < images.length; i++) {

    let label = images[i].label;
    
    //este ciclo percorre as imagens
    for (let j = 0; j < images[i].src.length; j++){
      promises[i] = new Promise(resolve => {
        
        var img = new Image(this.width, this.height);     
     
        img.src = images[i].src[j];
        
        classifier.addImage(img, label, () => {
          resolve();
          img = null;
        });

      });
    }  
  } 
}

function comecaGif() {
  var img = document.getElementById('img');
  img.style.display = "inline";
  img.src = 'loading.gif';
  var body = document.getElementById('body');
  body.style.opacity = "0.4";
}

function paraGif() {
  var img = document.getElementById('img');
  img.style.display = "none";
  var body = document.getElementById('body');
  body.style.opacity = "1";
}

function sendModel() {
  comecaGif();
  useFeatures();
  var url = "http://localhost:4000/create";
  const data = images;  

  var xhr = new XMLHttpRequest();
  xhr.open("POST", url);
  xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
  xhr.send(JSON.stringify(data));   
}

function upload(id) {

  if (id == 0) {

    var inputSaida = document.getElementById('inputSaida');
    inputSaida.onchange = function () {
      if (typeof (FileReader) != "undefined") {
        var output = document.getElementById('output');
        var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.jpg|.jpeg|.gif|.png|.bmp)$/;
        for (var i = 0; i < inputSaida.files.length; i++) {
          var file = inputSaida.files[i];
          if (regex.test(file.name.toLowerCase())) {
            var reader = new FileReader();
            reader.onload = function (e) {
              img = document.createElement("IMG");
              img.id = "imagem";
              img.width = 100;
              img.height = 100;
              img.src = e.target.result;
              nomeImage = e.target.result;
              output.appendChild(img);

              gotResultUpload(nomeImage);
            }
            reader.readAsDataURL(file);
          } else {
            alert(file.name + " is not a valid image file.");
            output.innerHTML = "";
            return false;
          }
        }
      } else {
        alert("This browser does not support HTML5 FileReader.");
      }

    }
  } else {

    var tituloId = document.getElementById("titulo" + id).firstChild;
    tituloId = tituloId.nodeValue;
    console.log(tituloId);

    var descr = document.getElementById("descricao" + id).value;
    console.log(descr);

    images2 = [];
    images3 = [];

    var fileUpload = document.getElementById('fileupload' + id);
    fileUpload.onchange = function () {
      if (typeof (FileReader) != "undefined") {
        var dvPreview = document.getElementById('dvPreview' + id);
        dvPreview.innerHTML = "";
        dvPreview.maxHeight = "100";
        var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.jpg|.jpeg|.gif|.png|.bmp)$/;
        for (var i = 0; i < fileUpload.files.length; i++) {
          var file = fileUpload.files[i];
          if (regex.test(file.name.toLowerCase())) {
            var reader = new FileReader();
            reader.onload = function (e) {
              img = document.createElement("IMG");
              img.id = "imagem" + i;
              img.height = "100";
              img.src = e.target.result;
              dvPreview.appendChild(img);

              var id2 = id - 1;
              select('#amountOfClass' + id).html(classes[id2]++);
              
              const x = e.target.result;
              images2.push(x);

            }
            var nome = file.name;
            images3.push(nome);
            reader.readAsDataURL(file);
          } else {
            alert(file.name + " is not a valid image file.");
            dvPreview.innerHTML = "";
            return false;
          }
        }
      } else {
        alert("This browser does not support HTML5 FileReader.");
      }
    }

    images.push({
      id: id,
      label: tituloId,
      descricao: descr,
      nome: images3,
      src: images2,
    });
    console.log(images);

  }
}