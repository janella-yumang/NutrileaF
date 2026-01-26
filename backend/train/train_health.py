import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import GlobalAveragePooling2D, Dense
from tensorflow.keras.applications import MobileNetV2

# =========================
# Settings
# =========================
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 10

# =========================
# Data preparation
# =========================
datagen = ImageDataGenerator(
    rescale=1./255,
    validation_split=0.2,
    rotation_range=20,
    zoom_range=0.2,
    horizontal_flip=True
)

train_data = datagen.flow_from_directory(
    '../data/malunggay_health',
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='binary',
    subset='training'
)

val_data = datagen.flow_from_directory(
    '../data/malunggay_health',
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='binary',
    subset='validation'
)

# =========================
# Build model
# =========================
base_model = MobileNetV2(input_shape=(224,224,3), include_top=False, weights='imagenet')
base_model.trainable = False  # freeze pretrained layers

model = Sequential([
    base_model,
    GlobalAveragePooling2D(),
    Dense(128, activation='relu'),
    Dense(1, activation='sigmoid')  # Binary output: good/bad
])

model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

# =========================
# Train model
# =========================
model.fit(train_data, validation_data=val_data, epochs=EPOCHS)

# =========================
# Save model in TF 2.13-compatible format
# =========================
model.save('app/models/malunggay_health_model_tf2.13', save_format='tf')
print("SavedModel created successfully!")

# Optional: also save as H5 (legacy)
model.save('app/models/malunggay_health_model.h5')
print("H5 model saved (legacy)")
