import tensorflow as tf
from tensorflow.keras.models import Sequential, Model
from tensorflow.keras.layers import GlobalAveragePooling2D, Dense, Dropout, BatchNormalization, Input
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import os
import numpy as np
from tensorflow.keras.preprocessing import image

# =========================
# Paths and parameters
# =========================
DATA_DIR = "data/disease"  # Disease images ONLY (exclude healthy)
MODEL_SAVE_PATH = "app/models/malunggay_disease_model"
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 15
LEARNING_RATE = 1e-4

# =========================
# Data Generators for Disease
# =========================
datagen = ImageDataGenerator(
    rescale=1./255,
    validation_split=0.2,
    rotation_range=20,
    zoom_range=0.2,
    horizontal_flip=True
)

train_data = datagen.flow_from_directory(
    DATA_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='training'
)

val_data = datagen.flow_from_directory(
    DATA_DIR,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='validation'
)

disease_classes = list(train_data.class_indices.keys())
num_disease_classes = len(disease_classes)
print(f"Disease classes: {train_data.class_indices}")

# =========================
# Build Disease Model
# =========================
base_model = MobileNetV2(input_shape=(224,224,3), include_top=False, weights='imagenet')
base_model.trainable = False

x = base_model.output
x = GlobalAveragePooling2D()(x)
x = BatchNormalization()(x)
x = Dense(128, activation='relu')(x)
x = Dropout(0.5)(x)
disease_output = Dense(num_disease_classes, activation='softmax', name='disease')(x)

model = Model(inputs=base_model.input, outputs=disease_output)

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=LEARNING_RATE),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

model.summary()

# =========================
# Train Disease Model
# =========================
history = model.fit(
    train_data,
    validation_data=val_data,
    epochs=EPOCHS
)

# =========================
# Save Disease Model
# =========================
os.makedirs(MODEL_SAVE_PATH, exist_ok=True)
model.save(MODEL_SAVE_PATH)
print(f"Disease model saved to {MODEL_SAVE_PATH}")

# =========================
# Prediction Function (multi-step)
# =========================
def predict_leaf_health_and_disease(img_path, health_model, disease_model, disease_classes):
    """
    Predict health first. Only predict disease if unhealthy.
    """
    # Load and preprocess image
    img = image.load_img(img_path, target_size=IMG_SIZE)
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array /= 255.0

    # Predict health
    health_pred = health_model.predict(img_array)[0][0]  # Binary
    if health_pred >= 0.5:
        print("🌿 Leaf is healthy. No disease detected.")
        return "healthy", None
    else:
        print("🌿 Leaf is unhealthy. Checking for disease...")
        disease_pred = disease_model.predict(img_array)[0]
        top_idx = np.argmax(disease_pred)
        top_disease = disease_classes[top_idx]
        confidence = disease_pred[top_idx] * 100
        print(f"🦠 Disease detected: {top_disease} ({confidence:.1f}%)")
        return "unhealthy", (top_disease, confidence)

# =========================
# Example usage
# =========================
# Load your saved health model
health_model = tf.keras.models.load_model('app/models/malunggay_health_model_tf2.13')

# Predict leaf
# predict_leaf_health_and_disease("data/test_leaf.jpg", health_model, model, disease_classes)
