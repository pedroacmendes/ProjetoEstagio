function useFeatures() {

  classifier = featureExtractor.classification();
  console.log(classifier.config);

  //opçoes do treino
  classifier.config.numLabels = classID;
  classifier.config.epochs = 50;
  classifier.config.batchSize = 16;
  classifier.config.learningRate = 0.001;

  console.log(classifier.config);

  for (var i = 0; i < images.length; i++) {

    promises[i] = new Promise(resolve => {
      var img = new Image();

      img.src = images[i].src;

      img.setAttribute.width = this.width;
      img.setAttribute.height = this.height;

      let label = images[i].label;

      classifier.addImage(img, label, () => {
        resolve();
        img = null;
        console.log(i, " - ", label);
      });

    });
  }

  if( JSON.stringify(classes)==JSON.stringify(classesT) ){
    alert("Não pode enviar o  o sem adicionar as imagens previamente.");
  } else { 
    alert ("Aguarde, estamos a processar a informação.");
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
          }
        });
      });
  }
}

function sendModel() {
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

    var aaa = document.getElementById("titulo" + id).firstChild;
    aaa = aaa.nodeValue;
    console.log(aaa);

    var descr = document.getElementById("descricao" + id).value;
    console.log(descr);

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
              
              let nome = file.name;

              images.push({
                id: id,
                label: aaa,
                descricao: descr,
                name: nome, 
                src: e.target.result,
              });
              
              nome = "";
              console.log(images);
            }
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
  }
}