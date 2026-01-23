import os
import json
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import classification_report, confusion_matrix


def save_class_names(class_names, filepath="models/class_names.json"):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, "w") as f:
        json.dump(class_names, f, indent=4)
    print(f"Class names saved to {filepath}")


def load_class_names(filepath="models/class_names.json"):
    with open(filepath, "r") as f:
        return json.load(f)


def plot_training_history(history, save_path="models/training_history.png"):
    plt.figure(figsize=(12, 5))

    # Accuracy
    plt.subplot(1, 2, 1)
    plt.plot(history.history["accuracy"])
    plt.plot(history.history["val_accuracy"])
    plt.title("Model Accuracy")
    plt.xlabel("Epoch")
    plt.ylabel("Accuracy")
    plt.legend(["Train", "Validation"])

    # Loss
    plt.subplot(1, 2, 2)
    plt.plot(history.history["loss"])
    plt.plot(history.history["val_loss"])
    plt.title("Model Loss")
    plt.xlabel("Epoch")
    plt.ylabel("Loss")
    plt.legend(["Train", "Validation"])

    plt.tight_layout()
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    plt.savefig(save_path)
    plt.show()

    print(f"Training history saved to {save_path}")


def evaluate_model(
    model,
    validation_generator,
    class_names,
    cm_path="models/confusion_matrix.png",
    report_txt_path="models/classification_report.txt",
    report_json_path="models/classification_report.json"
):
    validation_generator.reset()

    y_pred = model.predict(validation_generator)
    y_pred_classes = np.argmax(y_pred, axis=1)
    y_true = validation_generator.classes[:len(y_pred_classes)]

    # -------------------------------
    # Classification Report
    # -------------------------------
    report_dict = classification_report(
        y_true,
        y_pred_classes,
        target_names=class_names,
        output_dict=True
    )

    report_text = classification_report(
        y_true,
        y_pred_classes,
        target_names=class_names
    )

    print("\nClassification Report:\n")
    print(report_text)

    # Save report (TXT)
    with open(report_txt_path, "w") as f:
        f.write(report_text)

    # Save report (JSON)
    with open(report_json_path, "w") as f:
        json.dump(report_dict, f, indent=4)

    print(f"Classification report saved to {report_txt_path}")
    print(f"Classification report JSON saved to {report_json_path}")

    # -------------------------------
    # Confusion Matrix
    # -------------------------------
    cm = confusion_matrix(y_true, y_pred_classes)

    plt.figure(figsize=(14, 12))
    sns.heatmap(
        cm,
        annot=True,
        fmt="d",
        cmap="Blues",
        xticklabels=class_names,
        yticklabels=class_names
    )
    plt.title("Confusion Matrix")
    plt.xlabel("Predicted Label")
    plt.ylabel("True Label")
    plt.tight_layout()
    plt.savefig(cm_path)
    plt.show()

    print(f"Confusion matrix saved to {cm_path}")

    # -------------------------------
    # Overall Accuracy
    # -------------------------------
    accuracy = np.trace(cm) / np.sum(cm)
    print(f"Overall Accuracy: {accuracy * 100:.2f}%")

    return report_dict
