const bodyParser = require('body-parser');
const { Router } = require('express');
const router = Router();
const path = require("path");
const mysqlConnection = require('../database');
const { json } = require('body-parser');

router.use(bodyParser.json({limit: '10mb', extended: true}))
router.use(bodyParser.urlencoded({limit: '10mb', extended: true}))

router.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
}); 

//Página WEB
/* router.get("/index", (req, res) => {
  fs = require('fs');
  fs.readFile('./src/public/index.html', function (err, html) {
    if (err) {
      throw err; 
    }
  res.writeHeader(200, {"Content-Type": "text/html"});  
  res.write(html);  
  res.end(); 
  });
}) */

//Enviar pedido
router.post('/create', function (req, res) {

  console.log("--------------funciona-----------------------");
  console.log("ID: " + req.body[3].id);
  console.log("LABELS: " + req.body[3].label);
  //console.log("SRC: " + req.body[0].src);

  /* console.log("Label do objeto: " + images[0].label);
  console.log("ID da imagem: " + images[0].id);
  console.log("Localização da imagem: " + images[0].src);  */

/*   var sql =  "INSERT INTO pedido (nome, data) VALUES ('"+vari+"', NOW())";
  mysqlConnection.query(sql, (err, result) => {
    if(err) throw err;
    console.log("Inserido na tabela 'pedido'");
  })
  
  //depois é para repetir enquanto houverem objetos
  var sql =  "INSERT INTO objeto (label) VALUES ('a')";
  mysqlConnection.query(sql, (err, result) => {
    if(err) throw err;
    console.log("Inserido na tabela 'objeto'");
  })  */
        
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

//
//
//
// Para o modelo ja treinado e convertido
//
//
//


//ficheiro txt
router.get('/labels', (req, res) => {
  fs = require('fs');
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
  fs = require('fs');
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
})

module.exports = router;