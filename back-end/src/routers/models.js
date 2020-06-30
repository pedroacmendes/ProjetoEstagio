const bodyParser = require('body-parser');
const { Router, query } = require('express');
const router = Router();
const path = require("path");
const mysqlConnection = require('../database');
const { json } = require('body-parser');
const fs = require('fs');

router.use(bodyParser.json({limit: '10mb', extended: true}))
router.use(bodyParser.urlencoded({limit: '10mb', extended: true}))

router.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
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
      console.log("I" + i);
      var sql =  "INSERT INTO objeto (id_pedido, label) VALUES ("+ idPedido +", '"+req.body[i].label+"')";
      mysqlConnection.query(sql, (err, result) => {
        if (err) {
          console.log("erro -> " + err);
        } 
        console.log("Inserido na tabela 'objeto'");
      });  

      var image = req.body[i].src;
      var data = image.replace(/^data:image\/\w+;base64,/, '');
     
      var basedir = "C:/Users/Pedro Mendes/Desktop/Projeto/back-end/src/files/uploads/pedido " + idPedido + "/"; 
      //Verifica se não existe
      if (!fs.existsSync(basedir)){
        //Efetua a criação do diretório
        fs.mkdir(basedir, (err) => {
          if (err) {
            console.log("Deu erro -> " + err);
          } else {
            console.log("Diretório criado!")
          }
        });
      }
      
      var basedir2 = basedir + "objeto " + i + "/";
      if (!fs.existsSync(basedir2)){
        fs.mkdir(basedir2, (err) => {
            if (err) {
                console.log("Deu erro -> " + err);
            } else {
              console.log("Diretório criado!")
            }
        });
      }
      
      var basedir3 = basedir2 + req.body[i].name;
      fs.writeFile(basedir3, data, {encoding: 'base64'}, function(err, data){
        if (err) {
          console.log('err', err);
        } 
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