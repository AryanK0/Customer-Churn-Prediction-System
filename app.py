import gradio as gr
import json
import pandas as pd
import spaces
from backend.api.models import run_prediction

@spaces.GPU(duration=10)
def handle_predict(json_data_str: str, model_type: str = "final"):
    try:
        data = json.loads(json_data_str)
        # Use the original mock logic for now to ensure frontend compatibility
        result = run_prediction(data, model=model_type)
        return json.dumps(result)
    except Exception as e:
        return json.dumps({"status": "error", "message": str(e)})

@spaces.GPU(duration=10)
def handle_final(json_data_str: str):
    return handle_predict(json_data_str, "final")

@spaces.GPU(duration=10)
def handle_benchmark(json_data_str: str):
    return handle_predict(json_data_str, "benchmark")

@spaces.GPU(duration=10)
def handle_test(json_data_str: str):
    return handle_predict(json_data_str, "test")

@spaces.GPU(duration=10)
def handle_upload(file_path):
    try:
        if file_path is None:
            return "No file uploaded."
        df = pd.read_csv(file_path)
        # Mocking bulk predict
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
        
    # Endpoint 2: /api/final
    with gr.Tab("Final"):
        final_in = gr.Textbox(label="JSON Input")
        final_out = gr.Textbox(label="JSON Output")
        btn2 = gr.Button("Predict Final")
        btn2.click(handle_final, inputs=final_in, outputs=final_out, api_name="final")
        
    # Endpoint 3: /api/benchmark
    with gr.Tab("Benchmark"):
        bench_in = gr.Textbox(label="JSON Input")
        bench_out = gr.Textbox(label="JSON Output")
        btn3 = gr.Button("Predict Benchmark")
        btn3.click(handle_benchmark, inputs=bench_in, outputs=bench_out, api_name="benchmark")
        
    # Endpoint 4: /api/test
    with gr.Tab("Test"):
        test_in = gr.Textbox(label="JSON Input")
        test_out = gr.Textbox(label="JSON Output")
        btn4 = gr.Button("Predict Test")
        btn4.click(handle_test, inputs=test_in, outputs=test_out, api_name="test")
        
    # Endpoint 5: /api/upload
    with gr.Tab("Upload"):
        upload_in = gr.File(label="CSV Upload")
        upload_out = gr.Textbox(label="CSV Result")
        btn5 = gr.Button("Process Upload")
        btn5.click(handle_upload, inputs=upload_in, outputs=upload_out, api_name="upload")

if __name__ == "__main__":
    demo.launch()
