import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping
import json
import os

# Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TRAIN_DIR = os.path.join(BASE_DIR, '..', 'dataset', 'train')
VALID_DIR = os.path.join(BASE_DIR, '..', 'dataset', 'valid')
MODEL_SAVE_PATH = os.path.join(BASE_DIR, 'crop_disease_model.h5')
LABELS_SAVE_PATH = os.path.join(BASE_DIR, 'class_labels.json')
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 15

def train_model():
    # 1. Data Augmentation
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        horizontal_flip=True,
        fill_mode='nearest'
    )
    
    valid_datagen = ImageDataGenerator(rescale=1./255)
    
    train_generator = train_datagen.flow_from_directory(
        TRAIN_DIR,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical'
    )
    
    valid_generator = valid_datagen.flow_from_directory(
        VALID_DIR,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical'
    )
    
    # Save class labels
    class_labels = {v: k for k, v in train_generator.class_indices.items()}
    with open(LABELS_SAVE_PATH, 'w') as f:
        json.dump(class_labels, f)
    
    # 2. Build Model (Transfer Learning with MobileNetV2)
    base_model = MobileNetV2(weights='imagenet', include_top=False, input_shape=(*IMG_SIZE, 3))
    base_model.trainable = False # Freeze base layers
    
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(256, activation='relu')(x)
    x = Dropout(0.5)(x)
    predictions = Dense(len(class_labels), activation='softmax')(x)
    
    model = Model(inputs=base_model.input, outputs=predictions)
    
    # 3. Compile
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
    
    # 4. Callbacks
    checkpoint = ModelCheckpoint(MODEL_SAVE_PATH, monitor='val_accuracy', save_best_only=True, mode='max', verbose=1)
    early_stop = EarlyStopping(monitor='val_loss', patience=3, restore_best_weights=True)
    
    # 5. Train
    model.fit(
        train_generator,
        epochs=EPOCHS,
        validation_data=valid_generator,
        callbacks=[checkpoint, early_stop]
    )
    
    print(f"Model saved to {MODEL_SAVE_PATH}")
    print(f"Labels saved to {LABELS_SAVE_PATH}")

if __name__ == '__main__':
    # Ensure directories exist before running
    if os.path.exists(TRAIN_DIR) and os.path.exists(VALID_DIR):
        train_model()
    else:
        print(f"Error: Dataset directories not found at {TRAIN_DIR} or {VALID_DIR}")
        print("Please download the PlantVillage dataset and organize it accordingly.")
