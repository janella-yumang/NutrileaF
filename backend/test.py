import tensorflow as tf

# Try loading without compiling
model = tf.keras.models.load_model('app/models/malunggay_health_model.h5', compile=False)

# Save in the new TF SavedModel format
model.save('app/models/malunggay_health_model_tf2.13', save_format='tf')
print("SavedModel created successfully")
