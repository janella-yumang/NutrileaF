import tensorflow as tf

disease_model = tf.keras.models.load_model("backend/app/models/malunggay_disease_model")
health_model = tf.keras.models.load_model("backend/app/models/malunggay_health_model_tf2.13")
