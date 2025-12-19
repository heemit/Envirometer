from flask import Flask, request, jsonify
from catboost import CatBoostRegressor
import pandas as pd
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load models
main_model = CatBoostRegressor()
main_model.load_model("carbon_catboost_model.cbm")

low_model = CatBoostRegressor()
low_model.load_model("carbon_model_low.cbm")
high_model = CatBoostRegressor()
high_model.load_model("carbon_model_high.cbm")

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        df_new = pd.DataFrame([data])

        # Fill missing categorical with "Unknown"
        for col in df_new.select_dtypes(include=['object']).columns:
            df_new[col] = df_new[col].fillna("Unknown").astype(str)

        # Fill missing numeric with median
        for col in df_new.select_dtypes(exclude=['object']).columns:
            df_new[col] = df_new[col].fillna(df_new[col].median())

        # Prediction
        pred_mean = float(main_model.predict(df_new)[0])
        pred_low = float(low_model.predict(df_new)[0])
        pred_high = float(high_model.predict(df_new)[0])

        result = {
            "predicted_carbon_emission": round(pred_mean, 3),
            "confidence_interval": [round(pred_low, 3), round(pred_high, 3)],
            "uncertainty_range": round(pred_high - pred_low, 3)
        }

        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
