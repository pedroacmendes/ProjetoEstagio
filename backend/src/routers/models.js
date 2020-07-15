const bodyParser = require('body-parser');
const { Router, query } = require('express');
const router = Router();
const path = require("path");
const mysqlConnection = require('../database');
const { json } = require('body-parser');
const fs = require('fs');
const {PythonShell} =  require('python-shell');
var multer = require('multer');

router.use(bodyParser.json({limit: '50mb', extended: true}))
router.use(bodyParser.urlencoded({limit: '50mb', extended: true}))

router.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
}); 

//  ----------------------------------------------------------------------------------------------------
//  ----------------------------------------------------------------------------------------------------
//  ----------------------------------------------------------------------------------------------------
//  Guardar todas as informações de 1 pedido, objetos e imagens na base de dados
//  ----------------------------------------------------------------------------------------------------
//  ----------------------------------------------------------------------------------------------------
//  ----------------------------------------------------------------------------------------------------


router.post('/create', function (req, res) {

  console.log("----------------funciona----------------");

  var idPedido;
  
  var sql =  "INSERT INTO request (name, date, file_tflite, file_txt) VALUES ('Kyrios', NOW(), 'A', 'B')";
  mysqlConnection.query(sql, (err, result) => {
    if(err) throw err;
    console.log("Inserido na tabela 'request'");
    idPedido = JSON.stringify(result.insertId);
    var pathmodel = './backend/src/files/model-ready/' + idPedido + '/converted_model.tflite';
    var pathlabel = './backend/src/files/model-ready/' + idPedido + '/labels.txt';

    var sql = "UPDATE request SET file_tflite = '"+pathmodel+"', file_txt = '"+pathlabel+"' WHERE request_id = '"+idPedido+"' ";
    mysqlConnection.query(sql, (err, result) => {
      if (err) throw err;
    });
   
    var nObjetos = req.body.length;
  
    for (i = 0; i < nObjetos; i++){
      const index = i;
      var sql =  "INSERT INTO object (request_id, label, description) VALUES ("+ idPedido +", '"+req.body[index].label+"', '"+req.body[index].descricao+"')";
      mysqlConnection.query(sql, (err, result) => {
        if (err) {
          console.log("erro -> " + err);
        } 
        console.log("Inserido na tabela 'object'");
        idObjeto = JSON.stringify(result.insertId);

        
        var basedir = "./backend/src/files/uploads/" + idPedido + "/"; 
        //Verifica se não existe
        
        if (!fs.existsSync(basedir)){
          //Efetua a criação do diretório
          fs.mkdir(basedir, (err) => {if (err) throw err; });
        }
        var basedir2 = basedir + req.body[index].label + "/"; 
        if (!fs.existsSync(basedir2)){
          fs.mkdir(basedir2, (err) => {if (err) throw err; });
        }
        
        var tamanho = req.body[index].nome.length;
        
        for (i=0; i<tamanho;i++){
          var image = req.body[index].src[i];
          var data = image.replace(/^data:image\/\w+;base64,/, '');

          var basedir3 = basedir2 + req.body[index].nome[i];
          //escreve a imagem
          fs.writeFile(basedir3, data, {encoding: 'base64'}, function(err, data){
            if (err) {
              console.log('err', err);
            } 
          });   
          
          var sql2 = "INSERT INTO images (object_id, src) VALUES ('"+ idObjeto +"', '"+ basedir3 +"')";
          mysqlConnection.query(sql2, (err, result) => {
            if(err) throw err;
            console.log("Inserido na tabela 'images'");
          });

        }

      });  
    }

  }); 

});


//  ----------------------------------------------------------------------------------------------------
//  ----------------------------------------------------------------------------------------------------
//  ----------------------------------------------------------------------------------------------------
//  Para receber o modelo da pagina web e converter
//  ----------------------------------------------------------------------------------------------------
//  ----------------------------------------------------------------------------------------------------
//  ----------------------------------------------------------------------------------------------------


var storage = multer.diskStorage({ 
  destination: function (req, file, cb) { 
      cb(null, "./backend/src/files/modelo_tfjs"); 
  }, 
  filename: function (req, file, cb) { 
    cb(null, file.originalname); 
  } 
}) 

var upload = multer({ storage: storage }).array('myFiles', 2);

router.post('/upload', upload, (req, res, next) => {
  const files = req.files;
  if (!files) {
    const error = new Error('Please choose files');
    error.httpStatusCode = 400;
    return next(error);
  } else {
       
    console.log("A converter modelo...");  
    PythonShell.run('C:/Users/Pedro Mendes/Desktop/Projeto/backend/src/routers/convert.py', null, function (err) {
      if (err) throw err;
      console.log('Modelo convertido.');
    });  

  }
});  


//  ----------------------------------------------------------------------------------------------------
//  ----------------------------------------------------------------------------------------------------
//  ----------------------------------------------------------------------------------------------------
//  Para o modelo ja treinado e convertido
//  ----------------------------------------------------------------------------------------------------
//  ----------------------------------------------------------------------------------------------------
//  ----------------------------------------------------------------------------------------------------

router.get('/listOrders', (req, res) => {
  mysqlConnection.query("SELECT * FROM request", (err, rows, fields) => {
    if(!err){
      res.send(rows);
    } else {
      console.log(err);
    }
  })
});


//ficheiro txt
router.get('/labels/:id', (req, res) => {

  var id = req.params.id;

  var sql =  "SELECT file_txt FROM request WHERE request_id = '"+id+"';";
  mysqlConnection.query(sql, (err, result) => {
    if(err) throw err;
 
    var filepath = result[0]['file_txt'];
    console.log(filepath);
  
    var file = fs.readFile(filepath, 'binary', (err, data) => {    
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

  });

})

//ficheiro desc
router.get('/description/:id', (req, res) => {
  var id = req.params.id;
  
  var sql =  "SELECT description, label FROM object WHERE request_id = '"+id+"';";
  mysqlConnection.query(sql, (err, result) => {
    if(err) throw err;
    
    var json = JSON.stringify(result);
    console.log("objeto: " + json );
    res.end(json);
  });

})
  
//ficheiro tflite
router.get('/model/:id', (req, res) => {

  var id = req.params.id;

  var sql =  "SELECT file_tflite FROM request WHERE request_id = '"+id+"';";
  mysqlConnection.query(sql, (err, result) => {
    if(err) throw err;
 
    var filepath = result[0]['file_tflite'];
    console.log(filepath);

    var file = fs.readFile(filepath, 'binary', (err, data) => {  
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
});

module.exports = router;