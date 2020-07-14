import tensorflow as tf
from tensorflow.python.keras import backend as K
import tensorflow
from tensorflowjs.converters import keras_tfjs_loader
from tensorflow.python.keras.utils import CustomObjectScope
import json
import os
import mysql.connector

mydb = mysql.connector.connect(
  host="localhost",
  user="root",
  password="root",
  database="pedidos-modelo"
)

mycursor = mydb.cursor()
mycursor.execute("SELECT MAX(id_pedido) FROM pedido")
myresult = mycursor.fetchone()
print(myresult)
result = format(myresult[0]) 

directory = 'C:/Users/Pedro Mendes/Desktop/Projeto/back-end/src/files/modelo_tfjs/'
directory_final = 'C:/Users/Pedro Mendes/Desktop/Projeto/back-end/src/files/model-ready/' + result + '/'
os.mkdir(directory_final)

def relu6(x):
    return K.relu(x, max_value=6) 

with open(directory + 'model.json') as json_file:
    data = json.load(json_file)
    labelsI = data['ml5Specs']['mapStringToIndex']
    labelsF = []
    count = 0 
    for l in labelsI:
        name = '%s' % (l)
        labelsF.append(name)
        count = count + 1
    print(labelsF)
    with open (directory_final + 'labels.txt', 'w') as outfile:
        for line in labelsF:
            outfile.write("".join(line) + "\n")

mycursor2 = mydb.cursor()
mycursor2.execute("SELECT descricao FROM objeto WHERE id_pedido = '"+result+"';")
myresult2 = mycursor2.fetchall()
for x in myresult2:
    print(myresult2)
with open (directory_final + 'descricao.txt', 'w') as outfile:
        for line in myresult2:
            outfile.write("".join(line) + "\n")

with tensorflow.Graph().as_default(), tensorflow.Session(), CustomObjectScope({'relu6': relu6}):
    model = keras_tfjs_loader.load_keras_model(directory + 'model.json')
    model.save(directory + 'model.h5')

with CustomObjectScope({'relu6': relu6}):
    tflite_model = tf.lite.TFLiteConverter.from_keras_model_file(directory + 'model.h5').convert()
    with tf.io.gfile.GFile(directory_final + 'converted_model.tflite', 'wb') as f:
        f.write(tflite_model)