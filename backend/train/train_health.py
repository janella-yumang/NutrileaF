# =========================
# Install Roboflow (only in Jupyter / Colab)
# =========================
# !pip install roboflow   # Uncomment if running in notebook

# =========================
# Import libraries
# =========================
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import GlobalAveragePooling2D, Dense
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from roboflow import Roboflow

# =========================
# Settings
# =========================
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 10

# =========================
# Download dataset from Roboflow
# =========================
rf = Roboflow(api_key="eZ1dXJ0mIpLP04RBTIo1")
project = rf.workspace("juliane-jhdgh").project("nutrileaf")
version = project.version(2)
dataset = version.download("tensorflow")  # Downloads as train/valid folders

# =========================
# Data preparation using ImageDataGenerator
# =========================
datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=20,
    zoom_range=0.2,
    horizontal_flip=True
)

train_data = datagen.flow_from_directory(
    dataset.location + "/train",   # Roboflow train folder
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='binary'
)

val_data = datagen.flow_from_directory(
    dataset.location + "/valid",   # Roboflow validation folder
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='binary'
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
# Save model
# =========================
model.save('app/models/malunggay_health_model_tf2.13', save_format='tf')
print("SavedModel created successfully!")

model.save('app/models/malunggay_health_model.h5')
print("H5 model saved (legacy)")
