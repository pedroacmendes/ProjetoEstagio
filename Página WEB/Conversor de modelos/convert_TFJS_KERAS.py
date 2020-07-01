""" tensorflowjs_converter \
    --input_format tfjs_layers_model \
    --output_format keras_saved_model \
    modelo/model.json \
    new_model/
 """

import tensorflow as tf
import tensorflowjs as tfjs

modelo_tfjs = 'C:\\Users\\Pedro Mendes\\Desktop\\21'
saved_dir = 'C:\\Users\\Pedro Mendes\\Desktop\\modeloteste'

keras = tfjs.converters.save_keras_model(modelo_tfjs, saved_dir)

#keras_model = keras.convert()
#open("converted_model.h5", "wb").write(keras_model)

#converter = tf.lite.TFLiteConverter.from_keras_model(keras)
#model = keras.models.Sequential()
#tfjs.converters.save_keras_model(model, modelo_keras)
#open("converted_model.pb", "wb").write(tflite_model)
