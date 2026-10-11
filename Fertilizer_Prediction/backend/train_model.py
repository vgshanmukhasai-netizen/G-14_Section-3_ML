from model_service import train_and_save_models

if __name__ == "__main__":
    bundle = train_and_save_models()
    print("Training complete.")
    print(f"Selected model: {bundle['selected_model']}")
    print(f"L1 macro F1: {bundle['metrics']['l1']['f1_macro']}")
    print(f"L2 macro F1: {bundle['metrics']['l2']['f1_macro']}")
