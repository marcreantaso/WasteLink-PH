# WasteLink PH — AI Recyclable Classifier

## Model Architecture

- **Backbone**: MobileNetV2 (pretrained on ImageNet)
- **Input**: 224×224×3 RGB images
- **Output**: 6 classes (PET, HDPE, Metal, Paper, Organic, Other)
- **Size**: <5MB compressed (optimized for on-device inference)

## Training

### Datasets
1. [TrashNet](https://github.com/garythung/trashnet) — 2,527 labeled images
2. [Waste Classification (Kaggle)](https://www.kaggle.com/datasets/techsash/waste-classification-data) — 25,077 images
3. [TACO](http://tacodataset.org) — 1,500+ annotated images

### Training Script (Python)
```python
import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Sequential

# Build model
base = MobileNetV2(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
base.trainable = False  # Freeze backbone initially

model = Sequential([
    base,
    GlobalAveragePooling2D(),
    Dense(128, activation='relu'),
    Dropout(0.3),
    Dense(6, activation='softmax')
])

model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

# Train
model.fit(train_data, epochs=30, validation_data=val_data, batch_size=32)

# Fine-tune top layers
base.trainable = True
for layer in base.layers[:-20]:
    layer.trainable = False

model.compile(optimizer=tf.keras.optimizers.Adam(1e-5), loss='categorical_crossentropy', metrics=['accuracy'])
model.fit(train_data, epochs=10, validation_data=val_data, batch_size=32)

# Convert to TF.js
import tensorflowjs as tfjs
tfjs.converters.save_keras_model(model, 'tfjs_model/')
```

### Converting to TF.js
```bash
pip install tensorflowjs
tensorflowjs_converter --input_format=keras saved_model.h5 tfjs_model/
```

## On-Device Inference

The model runs entirely on the user's device via TensorFlow.js:
- No internet required for classification
- ~200ms inference time on mid-range Android
- Tflite integration available for even faster native inference

## Performance Targets
- **Accuracy**: ≥85% on validation set
- **Model size**: <5MB (quantized)
- **Inference time**: <500ms on 2GB RAM Android
