import os
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping
from sklearn.utils.class_weight import compute_class_weight
import argparse

from model_architecture import create_model
from utils import save_class_names, plot_training_history, evaluate_model

# tf.config.run_functions_eagerly(True)

np.random.seed(42)
tf.random.set_seed(42)


def parse_args():
    parser = argparse.ArgumentParser(description="Train plant disease detection CNN")
    parser.add_argument("--data_dir", type=str, required=True)
    parser.add_argument("--img_height", type=int, default=224)
    parser.add_argument("--img_width", type=int, default=224)
    parser.add_argument("--batch_size", type=int, default=16)  # reduced for memory safety
    parser.add_argument("--epochs", type=int, default=25)
    parser.add_argument("--validation_split", type=float, default=0.2)
    parser.add_argument("--model_dir", type=str, default="models")
    return parser.parse_args()


def main():
    args = parse_args()
    os.makedirs(args.model_dir, exist_ok=True)

    # ---------------- Data Generators ----------------
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        validation_split=args.validation_split,
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        fill_mode="nearest"
    )

    val_datagen = ImageDataGenerator(
        rescale=1./255,
        validation_split=args.validation_split
    )

    train_generator = train_datagen.flow_from_directory(
        args.data_dir,
        target_size=(args.img_height, args.img_width),
        batch_size=args.batch_size,
        class_mode="categorical",
        subset="training",
        shuffle=True
    )

    val_generator = val_datagen.flow_from_directory(
        args.data_dir,
        target_size=(args.img_height, args.img_width),
        batch_size=args.batch_size,
        class_mode="categorical",
        subset="validation",
        shuffle=False
    )

    class_names = list(train_generator.class_indices.keys())
    num_classes = len(class_names)
    save_class_names(class_names)

    # ---------------- Class Weights ----------------
    class_weights = compute_class_weight(
        class_weight="balanced",
        classes=np.unique(train_generator.classes),
        y=train_generator.classes
    )
    class_weights = dict(enumerate(class_weights))

    # ---------------- RESUME LOGIC ----------------
    checkpoint_path = f"{args.model_dir}/best_model.h5"

    if os.path.exists(checkpoint_path):
        print("Resuming training from best_model.h5")
        model = tf.keras.models.load_model(checkpoint_path)
        model.compile(
            optimizer=tf.keras.optimizers.Adam(learning_rate=0.0001),
            loss="categorical_crossentropy",
            metrics=["accuracy"]
        )
        initial_epoch = 7

    else:
        print("No checkpoint found. Training from scratch.")
        model = create_model(args.img_height, args.img_width, num_classes)
        initial_epoch = 0
        # ---------------- Callbacks ----------------
    checkpoint = ModelCheckpoint(
        checkpoint_path,
        monitor="val_accuracy",
        save_best_only=True,
        mode="max",
        verbose=1
    )

    early_stopping = EarlyStopping(
        monitor="val_loss",
        patience=10,
        restore_best_weights=True,
        verbose=1
    )

    callbacks = [checkpoint, early_stopping]

    # ---------------- Training ----------------
    # ---------------- Training ----------------
    history = model.fit(
        train_generator,
        validation_data=val_generator,
        epochs=args.epochs,
        initial_epoch=initial_epoch,
        callbacks=callbacks,
        class_weight=class_weights  # This handles imbalance!
    )

    # ---------------- Results ----------------
    plot_training_history(history)
    evaluate_model(model, val_generator, class_names)

    model.save(f"{args.model_dir}/final_model.h5")
    print("Final model saved.")


if __name__ == "__main__":
    main()