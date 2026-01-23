import os
import numpy as np
import tensorflow as tf
import matplotlib.pyplot as plt
import argparse

# Import from local files
from utils import load_class_names


def parse_args():
    parser = argparse.ArgumentParser(description='Predict plant disease from leaf image')
    parser.add_argument('--image_path', type=str, required=True, help='Path to the leaf image')
    parser.add_argument('--model_path', type=str, default='models/best_model.h5', help='Path to the trained model')
    parser.add_argument('--class_names_path', type=str, default='models/class_names.json',
                        help='Path to class names JSON file')
    return parser.parse_args()


def predict_disease(image_path, model, class_names):
    """
    Function to predict plant disease from a leaf image

    Args:
        image_path (str): Path to the leaf image
        model: Trained Keras model
        class_names (list): List of class names

    Returns:
        dict: Prediction results
    """
    # Get image dimensions from model's input shape
    img_height = model.input_shape[1]
    img_width = model.input_shape[2]

    # Load and preprocess the image
    img = tf.keras.preprocessing.image.load_img(
        image_path,
        target_size=(img_height, img_width)
    )
    img_array = tf.keras.preprocessing.image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0) / 255.0

    # Make prediction
    prediction = model.predict(img_array)
    predicted_class = np.argmax(prediction, axis=1)[0]
    confidence = np.max(prediction) * 100

    # Display results
    plt.figure(figsize=(8, 8))
    plt.imshow(img)
    plt.title(f"Predicted Disease: {class_names[predicted_class]}\nConfidence: {confidence:.2f}%")
    plt.axis('off')
    plt.show()

    # Print top 3 predictions (or less if fewer classes)
    top_count = min(3, len(class_names))
    print(f"\nPredicted disease: {class_names[predicted_class]}")
    print(f"Confidence: {confidence:.2f}%")
    print(f"\nTop {top_count} predictions:")

    # Get top predictions
    top_indices = prediction[0].argsort()[-top_count:][::-1]
    for i in top_indices:
        print(f"  {class_names[i]}: {prediction[0][i] * 100:.2f}%")

    # Create results dictionary
    return {
        'disease': class_names[predicted_class],
        'confidence': confidence,
        'all_probabilities': dict(zip(class_names, prediction[0] * 100)),
        'image_path': image_path
    }


def main():
    # Parse arguments
    args = parse_args()

    # Check if image exists
    if not os.path.exists(args.image_path):
        print(f"Error: Image not found at {args.image_path}")
        return

    # Check if model exists
    if not os.path.exists(args.model_path):
        print(f"Error: Model not found at {args.model_path}")
        return

    # Check if class names file exists
    if not os.path.exists(args.class_names_path):
        print(f"Error: Class names file not found at {args.class_names_path}")
        return

    # Load model
    print(f"Loading model from {args.model_path}...")
    model = tf.keras.models.load_model(args.model_path)

    # Load class names
    class_names = load_class_names(args.class_names_path)

    # Make prediction
    print(f"Analyzing image {args.image_path}...")
    predict_disease(args.image_path, model, class_names)


if __name__ == "__main__":
    main()