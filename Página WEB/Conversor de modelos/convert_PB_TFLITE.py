import tensorflow as tf

modelo_pb = 'C:\\Users\\Pedro Mendes\\Downloads\\keras'

converter = tf.lite.TFLiteConverter.from_saved_model(modelo_pb, signature_keys=None, tags=None)

tflite_model = converter.convert()
open("converted_model.tflite", "wb").write(tflite_model)
