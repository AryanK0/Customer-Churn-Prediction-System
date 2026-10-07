import gradio as gr
import json
import base64
import pandas as pd
import spaces
from backend.api.model_loader import load_all_models, predict_churn_prob, create_shap_waterfall

# Load models on startup
load_all_models()

@spaces.GPU(duration=10)
def handle_predict(json_data_str: str):
    try:
        data = json.loads(json_data_str)
        df = pd.DataFrame([data])
        # Add logic to handle 'model' parameter if needed, right now we just use the loaded CatBoost
        prediction_result = predict_churn_prob(df)
        shap_plot_buf = create_shap_waterfall(df)
        shap_base64 = ""
        if shap_plot_buf:
            shap_base64 = base64.b64encode(shap_plot_buf.getvalue()).decode("utf-8")
        return json.dumps({
            "status": "success",
            "churn_probability": float(prediction_result['churn_probability']),
            "is_churn": bool(prediction_result['is_churn']),
            "shap_plot_base64": shap_base64
        })
    except Exception as e:
        return json.dumps({"status": "error", "message": str(e)})

@spaces.GPU(duration=10)
def handle_upload(file_path):
    try:
        # In Gradio, file inputs give a temp filepath
        df = pd.read_csv(file_path)
        # Mocking bulk predict since it's just an example
        df['Churn_Probability'] = 0.5
        df['Is_Churn'] = False
        return df.to_csv(index=False)
    except Exception as e:
        return str(e)

# We use gr.Blocks to define multiple API endpoints cleanly
with gr.Blocks(title="CCP Backend APIs") as demo:
    gr.Markdown("# Customer Churn Prediction - Internal APIs")
    
    # Endpoint 1: /api/predict
    with gr.Tab("Predict"):
        predict_in = gr.Textbox(label="JSON Input")
        predict_out = gr.Textbox(label="JSON Output")
        btn1 = gr.Button("Predict")
        btn1.click(handle_predict, inputs=predict_in, outputs=predict_out, api_name="predict")
        
    # Endpoint 2: /api/final (Mocked to point to predict for now)
    with gr.Tab("Final"):
        final_in = gr.Textbox(label="JSON Input")
        final_out = gr.Textbox(label="JSON Output")
        btn2 = gr.Button("Predict Final")
        btn2.click(handle_predict, inputs=final_in, outputs=final_out, api_name="final")
        
    # Endpoint 3: /api/benchmark
    with gr.Tab("Benchmark"):
        bench_in = gr.Textbox(label="JSON Input")
        bench_out = gr.Textbox(label="JSON Output")
        btn3 = gr.Button("Predict Benchmark")
        btn3.click(handle_predict, inputs=bench_in, outputs=bench_out, api_name="benchmark")
        
    # Endpoint 4: /api/test
    with gr.Tab("Test"):
        test_in = gr.Textbox(label="JSON Input")
        test_out = gr.Textbox(label="JSON Output")
        btn4 = gr.Button("Predict Test")
        btn4.click(handle_predict, inputs=test_in, outputs=test_out, api_name="test")
        
    # Endpoint 5: /api/upload
    with gr.Tab("Upload"):
        upload_in = gr.File(label="CSV Upload")
        upload_out = gr.Textbox(label="CSV Result")
        btn5 = gr.Button("Process Upload")
        btn5.click(handle_upload, inputs=upload_in, outputs=upload_out, api_name="upload")

if __name__ == "__main__":
    demo.launch()
