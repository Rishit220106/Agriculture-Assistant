# 🌿 Crop Disease Detection: An Evaluation-Focused CNN Pipeline

A lightweight convolutional neural network (CNN) that classifies crop leaf images into healthy and diseased categories, built to run on resource-limited devices such as farmers' smartphones. The project goes beyond a single accuracy number: it **diagnoses where and why the model fails** on a heavily class-imbalanced dataset, and tracks every experiment so results can be reproduced and audited.

This module is the disease-diagnosis component of a larger multimodal farming assistant described in:

> R. Dhagai, S. Singh, S. Upadhyay, N. Pulgam, N. Marathe. *A Machine Learning-Driven Smart Farming Assistant for Crop and Disease Advisory with Government Scheme Recommendations.* ICNDA 2026, Springer Proceedings (forthcoming).

---

## Highlights

- **84.36% overall test accuracy** on a multi-class leaf disease dataset (~18,600 images).
- **Honest evaluation:** macro precision 0.70, recall 0.63, F1 0.64, which show that minority classes are still hard even though overall accuracy looks strong.
- **Failure-mode analysis:** per-class error analysis instead of relying on one aggregate number.
- **Class-balanced vs. imbalanced training** compared side by side, with training curves for both.
- **Compact architecture** (3 conv blocks) designed for fast, on-device inference.
- **Reproducible:** fixed hyperparameters, documented splits, and tracked experiments.

---

## The problem

Crop diseases cause major losses for small and marginal farmers, who often lack access to specialist advice. Image-based diagnosis can help, but real leaf datasets are **severely imbalanced**: some diseases have far fewer samples than others. A model trained naively can report high accuracy while being unreliable on exactly the rare diseases that matter. This project studies that failure mode directly.

---

## Model

| Component | Details |
|---|---|
| Input | RGB leaf image resized to **224 × 224**, pixel values scaled to **[0, 1]** |
| Augmentation | Random rotation (±20°), horizontal flip, slight zoom in/out |
| Architecture | 3 × (Conv + ReLU + Pooling) with **32 → 64 → 128** filters, then 2 fully connected layers and a softmax output |
| Loss | Categorical cross-entropy |
| Optimizer | Adam, learning rate **0.001** |
| Training | **40 epochs**, batch size **32**, 80:20 train/test split |
| Output | Predicted disease class + confidence score |
| Framework | Python, TensorFlow/Keras |

---

## Results

### Overall performance (test set)

| Accuracy | Precision (macro) | Recall (macro) | F1-score (macro) |
|:---:|:---:|:---:|:---:|
| **84.36%** | 0.70 | 0.63 | 0.64 |

### What the numbers say

- Overall accuracy is high, but **macro recall (0.63) is noticeably lower**: some minority disease classes are still missed.
- The model is **strong on visually distinctive diseases** such as Common Rust, Tungro and Brownspot, whose lesion patterns are easy to tell apart.
- It **struggles on visually similar diseases** (for example Anthracnose and Wheat leaf blight), where symptoms overlap.
- Training **with class balancing** gave smoother, more stable convergence. Training **without** it produced larger swings in validation loss and weaker generalization, with bias toward majority classes.

### Comparison with other approaches (from the paper)

| Method | Type | Accuracy |
|---|---|---|
| SVM on hand-crafted features (Kaur et al.) | Classical ML | 89.0% |
| ResNet transfer learning | Pretrained deep model | 92.5% |
| **This project (custom CNN)** | Lightweight, learned features | **84.3%** |

The custom CNN is **not** the most accurate option. It trades some accuracy for a small footprint suited to mobile deployment. See *Limitations* below.

---

## Dataset

- A public plant-leaf image dataset of roughly **18,600 images** covering healthy and diseased leaves across multiple crops, captured under varying conditions (the paper cites PlantVillage as the dataset family).
- **Highly imbalanced** class distribution, which is the main challenge studied here.
- The dataset is **not included** in this repository. Download it from its original source and place it as described below.

---

## Getting started

> Update the file and folder names below to match your repository layout.

### 1. Clone and install

```bash
git clone https://github.com/Rishit220106/<repo-name>.git
cd <repo-name>
pip install -r requirements.txt
```

Core dependencies: `tensorflow`, `numpy`, `pandas`, `scikit-learn`, `matplotlib`, `seaborn`.

### 2. Prepare the data

```
data/
├── train/
│   ├── <class_1>/
│   ├── <class_2>/
│   └── ...
└── test/
    └── ...
```

### 3. Train

```bash
python train.py --epochs 40 --batch-size 32 --lr 0.001
```

### 4. Evaluate

```bash
python evaluate.py --weights <path-to-weights>
```

This reports overall metrics and a per-class breakdown (precision, recall, F1, confusion matrix).

### 5. Predict on a single image

```bash
python predict.py --image path/to/leaf.jpg
```

Outputs the predicted disease class and its confidence score.

---

## Project structure

```
.
├── data/                # dataset (not tracked)
├── notebooks/           # exploration and experiments
├── train.py             # model training
├── evaluate.py          # metrics and per-class error analysis
├── predict.py           # single-image inference
├── requirements.txt
└── README.md
```

---

## Reproducibility

Every experiment is tracked so that results can be reviewed independently rather than trusted on a headline number:

- Fixed hyperparameters (see the Model table) and an 80:20 split.
- Training and validation curves saved for both the balanced and imbalanced settings.
- Per-class metrics and error analysis recorded alongside overall accuracy.

For stricter determinism, set random seeds for Python, NumPy and TensorFlow at the start of training.

---

## Limitations

Being clear about the limits of this work:

- **Overall accuracy hides weaker minority-class performance.** Macro recall is 0.63.
- **Lower accuracy than heavier models.** A ResNet baseline reports 92.5%.
- **Low confidence on some real captures.** In a demo of the interface, an Apple Black Rot prediction came with a confidence of about 51.5%, so confidence calibration is worth improving.
- **Not validated in the field.** Results come from a public dataset, not from live farm conditions.
- Results come from a single 80:20 split. Cross-validated variance across seeds is a natural next step.

---

## Future work

- Use **focal loss** or other imbalance-aware objectives.
- Try **transfer learning** from pretrained backbones while keeping the model mobile-friendly.
- Collect or expand data for **rare disease classes**.
- Add **confidence calibration** and uncertainty estimates.
- Report **per-class results across multiple seeds** for stronger evidence.
- Connect predictions to **treatment and preventive-care advice** within the full advisory system.

---

## Part of a larger system

This module sits alongside two other components of the Smart Farming Assistant:

| Module | Method | Reported result |
|---|---|---|
| Crop disease detection (**this repo**) | Custom CNN | 84.36% accuracy |
| Crop recommendation | Random Forest + Nash equilibrium layer | 71% accuracy, +12.7% profit stability |
| Government scheme advisory | Random Forest | 91.8% accuracy |

---

## Citation

If you use this work, please cite:

```bibtex
@inproceedings{dhagai2026smartfarming,
  title     = {A Machine Learning-Driven Smart Farming Assistant for Crop and Disease Advisory with Government Scheme Recommendations},
  author    = {Dhagai, Rishit and Singh, Shivam and Upadhyay, Shaan and Pulgam, Namita and Marathe, Nilesh},
  booktitle = {Proceedings of ICNDA 2026},
  publisher = {Springer},
  year      = {2026},
  note      = {Forthcoming}
}
```

---

## Author

**Rishit Dhagai**, B.Tech in Computer Science & Data Science, D.J. Sanghvi College of Engineering, Mumbai
📧 rishitdhagai220106@gmail.com · [GitHub](https://github.com/Rishit220106) · [LinkedIn](https://linkedin.com/in/rishit-dhagai)

## License

Add a license of your choice (for example MIT) in a `LICENSE` file.
