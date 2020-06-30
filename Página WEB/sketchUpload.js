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
    msgErroTreino();
  } else { 

    Promise.all(promises)
      .then(() => {
        console.log('Training.');
        classifier.train(lossValue => {
          if (lossValue) {
            // training
            select('#loss').html('Perda: ' + lossValue);
          } else {
            select('#loss').html('Treino realizado!');

            //add input de saida
            var output = document.getElementById('output');
            let inputSaida = document.createElement("input");
            inputSaida.type = "file";
            inputSaida.id = "inputSaida";
            inputSaida.setAttribute("onclick", "upload(0)");
            output.appendChild(inputSaida);

          }
        });
      });
  }
}

function abc() {

  var url = "http://localhost:4000/create";
  const data = images;

  var xhr = new XMLHttpRequest();
  xhr.open("POST", url);
  xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
  xhr.send(JSON.stringify(data)); 
}

function gotResultUpload(nomeImage) {
  console.log(nomeImage);
  var imgUp = new Image();
  imgUp.src = nomeImage;

  classifier.classify(imgUp, (err, result) => {
    console.log(result);
    if (err) {
      console.error(err);
    }
    console.log('rating: ' + result);

    Object.keys(result).forEach((key) => {
      console.log(key + ' -> ' + result[key]);

      let label2 = document.createElement("label");
      label2.innerHTML = result[key].label + " - " + result[key].confidence.toFixed(2) * 100 + '%' + "<br>";
      document.getElementById("result").appendChild(label2);
    })

  });

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

    var titulo = document.getElementById("titulo" + id).firstChild;
    titulo = titulo.nodeValue;
    console.log(titulo);

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

              images.push({
                id: id,
                label: titulo,
                name: file.name,
                src: e.target.result,
              });

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