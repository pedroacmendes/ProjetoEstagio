const bodyParser = require('body-parser');
const { Router, query } = require('express');
const router = Router();
const path = require("path");
const mysqlConnection = require('../database');
const { json } = require('body-parser');
const fs = require('fs');

var multer = require('multer');

router.use(bodyParser.json({limit: '10mb', extended: true}))
router.use(bodyParser.urlencoded({limit: '10mb', extended: true}))

router.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
}); 

router.post('/recebeModel', function (req, res) {

  console.log("this works");
  //res.send(req.body);
  console.log(req.body);
  var blob = JSON.stringify(req.body);
  console.log(blob)

  fs.writeFile("model.json", blob, function(err) {
    if (err) throw err;
  });

});

//Enviar pedido
router.post('/create', function (req, res) {

  console.log("----------------funciona----------------");

  var idPedido;
  
  var sql =  "INSERT INTO pedido (nome, data) VALUES ('Kyrios', NOW())";
  mysqlConnection.query(sql, (err, result) => {
    if(err) throw err;
    console.log("Inserido na tabela 'pedido'");
    idPedido = JSON.stringify(result.insertId);
   
    var nObjetos = req.body.length;
  
    for (i = 0; i < nObjetos; i++){
      //console.log("I" + i);
      const index = i;
      var sql =  "INSERT INTO objeto (id_pedido, label) VALUES ("+ idPedido +", '"+req.body[index].label+"')";
      mysqlConnection.query(sql, (err, result) => {
        if (err) {
          console.log("erro -> " + err);
        } 
        console.log("Inserido na tabela 'objeto'");
        idObjeto = JSON.stringify(result.insertId);
        console.log(index);
        var image = req.body[index].src;
        var data = image.replace(/^data:image\/\w+;base64,/, '');
       
        var basedir = "C:/Users/Pedro Mendes/Desktop/Projeto/back-end/src/files/uploads/pedido " + idPedido + "/"; 
        //Verifica se não existe
        if (!fs.existsSync(basedir)){
          //Efetua a criação do diretório
          fs.mkdir(basedir, (err) => {if (err) throw err; });
        }
        var basedir2 = basedir + "objeto " + idObjeto + "/";
        if (!fs.existsSync(basedir2)){
          fs.mkdir(basedir2, (err) => {if (err) throw err; });
        }
       
        var basedir3 = basedir2 + req.body[index].name;
        //escreve a imagem
        fs.writeFile(basedir3, data, {encoding: 'base64'}, function(err, data){
          if (err) {
            console.log('err', err);
          } 
        });  
  
        var sql2 = "INSERT INTO imagens (id_objeto, src) VALUES ('"+ idObjeto +"', '"+ basedir3 +"')";
        mysqlConnection.query(sql2, (err, result) => {
          if(err) throw err;
          console.log("Inserido na tabela 'Imagens'");
        }); 

      });  
    }

  }); 

});

//ver todos os pedidos
router.get('/index/pedidos', (req, res) => {
  mysqlConnection.query("SELECT * FROM pedido", (err, rows, fields) => {
    if(!err){
      res.send(rows);
    } else {
      console.log(err);
    }
  })
});

router.get('/index/objeto', (req, res) => {
  mysqlConnection.query("SELECT * FROM objeto", (err, rows, fields) => {
    if(!err){
      res.send(rows);
    } else {
      console.log(err);
    }
  })
});

//
//
//
// Para receber o modelo da pagina web
//
//
//

var storage = multer.diskStorage({ 
  destination: function (req, file, cb) { 
      cb(null, "C:/Users/Pedro Mendes/Desktop/Projeto/back-end/src/files/modelo_pag-web") 
  }, 
  filename: function (req, file, cb) { 
    cb(null, file.originalname) 
  } 
}) 

var upload = multer({ storage: storage })

router.post('/upload', upload.array('myFiles', 12), (req, res, next) => {
  const files = req.files
  if (!files) {
    const error = new Error('Please choose files')
    error.httpStatusCode = 400
    return next(error)
  }
    res.send(files)
    res.redirect("C:/Users/Pedro Mendes/Desktop/Projeto/Página WEB/index.html")
})


//
//
//
// Para o modelo ja treinado e convertido
//
//
//


//ficheiro txt
router.get('/labels', (req, res) => {
  var filePath = path.join(__dirname, '../files/labels.txt');
    
  var file = fs.readFile(filePath, 'binary', (err, data) => {    
    if(err){
      return console.log(err);
    } else {
      res.setHeader('Content-Length', data.length);
      res.setHeader('Content-Type', 'file/txt');
      res.setHeader('Content-Disposition', 'attachment; filename="labels.txt"');
      res.write(data, 'binary');
      res.end();
    }
  });
})
  
//ficheiro tflite
router.get('/model', (req, res) => {
  var filePath = path.join(__dirname, '../files/converted_model.tflite');
    
  var file = fs.readFile(filePath, 'binary', (err, data) => {  
    if(err){
      return console.log(err);
    } else {  
      res.setHeader('Content-Length', data.length);
      res.setHeader('Content-Type', 'file/tflite');
      res.setHeader('Content-Disposition', 'attachment; filename="converted_model.tflite"');
      res.write(data, 'binary');
      res.end();
    }
  });     
});

module.exports = router;