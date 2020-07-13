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
  
  var sql =  "INSERT INTO pedido (nome, data, file_tflite, file_txt) VALUES ('Kyrios', NOW(), 'A', 'B')";
  mysqlConnection.query(sql, (err, result) => {
    if(err) throw err;
    console.log("Inserido na tabela 'pedido'");
    idPedido = JSON.stringify(result.insertId);
    var pathmodel = 'C:/Users/Pedro Mendes/Desktop/Projeto/back-end/src/files/model-ready/' + idPedido + '/converted_model.tflite';
    var pathlabel = 'C:/Users/Pedro Mendes/Desktop/Projeto/back-end/src/files/model-ready/' + idPedido + '/labels.txt';

    var sql = "UPDATE pedido SET file_tflite = '"+pathmodel+"', file_txt = '"+pathlabel+"' WHERE id_pedido = '"+idPedido+"' ";
    mysqlConnection.query(sql, (err, result) => {
      if (err) throw err;
    });
   
    var nObjetos = req.body.length;
  
    for (i = 0; i < nObjetos; i++){
      const index = i;
      var sql =  "INSERT INTO objeto (id_pedido, label, descricao) VALUES ("+ idPedido +", '"+req.body[index].label+"', '"+req.body[index].descricao+"')";
      mysqlConnection.query(sql, (err, result) => {
        if (err) {
          console.log("erro -> " + err);
        } 
        console.log("Inserido na tabela 'objeto'");
        idObjeto = JSON.stringify(result.insertId);

        
        var basedir = "C:/Users/Pedro Mendes/Desktop/Projeto/back-end/src/files/uploads/pedido " + idPedido + "/"; 
        //Verifica se não existe
        if (!fs.existsSync(basedir)){
          //Efetua a criação do diretório
          fs.mkdir(basedir, (err) => {if (err) throw err; });
        }
        var basedir2 = basedir + req.body[index] + "/";
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
          
          var sql2 = "INSERT INTO imagens (id_objeto, src) VALUES ('"+ idObjeto +"', '"+ basedir3 +"')";
          mysqlConnection.query(sql2, (err, result) => {
            if(err) throw err;
            console.log("Inserido na tabela 'Imagens'");
          });

        }

      });  
    }

  }); 

});

//  ----------------------------------------------------------------------------------------------------
//  ----------------------------------------------------------------------------------------------------
//  ----------------------------------------------------------------------------------------------------
//  Ver todos os pedidos
//  ----------------------------------------------------------------------------------------------------
//  ----------------------------------------------------------------------------------------------------
//  ----------------------------------------------------------------------------------------------------


router.get('/index/pedidos', (req, res) => {
  mysqlConnection.query("SELECT * FROM pedido", (err, rows, fields) => {
    if(!err){
      res.send(rows);
    } else {
      console.log(err);
    }
  })
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
      cb(null, "C:/Users/Pedro Mendes/Desktop/Projeto/back-end/src/files/modelo_tfjs"); 
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
    PythonShell.run('C:/Users/Pedro Mendes/Desktop/Projeto/back-end/src/routers/convert.py', null, function (err) {
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



//ficheiro txt
router.get('/labels', (req, res) => {
  var filePath = path.join(__dirname, '../files/model-ready/Pedido 1/labels.txt');
    
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

//ficheiro desc
router.get('/descricao', (req, res) => {
  var filePath = path.join(__dirname, '../files/model-ready/Pedido 1/descricao.txt');
    
  var file = fs.readFile(filePath, 'binary', (err, data) => {    
    if(err){
      return console.log(err);
    } else {
      res.setHeader('Content-Length', data.length);
      res.setHeader('Content-Type', 'file/txt');
      res.setHeader('Content-Disposition', 'attachment; filename="decricacao.txt"');
      res.write(data, 'binary');
      res.end();
    }
  });
})
  
//ficheiro tflite
router.get('/model', (req, res) => {
  var filePath = path.join(__dirname, '../files/model-ready/Pedido 1/converted_model.tflite');
    
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

//  ----------------------------------------------------------------------------------------------------
//  ----------------------------------------------------------------------------------------------------
//  ----------------------------------------------------------------------------------------------------

//ficheiro txt
router.get('/labels2', (req, res) => {
  var filePath = path.join(__dirname, '../files/model-ready/Pedido 2/labels.txt');
    
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

//ficheiro desc
router.get('/descricao2', (req, res) => {
  var filePath = path.join(__dirname, '../files/model-ready/Pedido 2/descricao.txt');
    
  var file = fs.readFile(filePath, 'binary', (err, data) => {    
    if(err){
      return console.log(err);
    } else {
      res.setHeader('Content-Length', data.length);
      res.setHeader('Content-Type', 'file/txt');
      res.setHeader('Content-Disposition', 'attachment; filename="decricacao.txt"');
      res.write(data, 'binary');
      res.end();
    }
  });
})
  
//ficheiro tflite
router.get('/model2', (req, res) => {
  var filePath = path.join(__dirname, '../files/model-ready/Pedido 2/converted_model.tflite');
    
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