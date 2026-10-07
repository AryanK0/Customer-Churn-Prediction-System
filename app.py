import gradio as gr
from backend.api.main import app as fastapi_app
import uvicorn
import os
import sys

def read_status():
    return "CCP FastAPI Backend is running!"

demo = gr.Interface(fn=read_status, inputs=None, outputs="text", title="CCP Status")

app = gr.mount_gradio_app(fastapi_app, demo, path="/")

if __name__ == "__main__":
    print("=== ENVIRONMENT VARIABLES ===")
    for k, v in os.environ.items():
        print(f"{k}: {v}")
    print("=============================")
    sys.stdout.flush()
    
    # HF Spaces ZeroGPU proxy usually listens on 7860 and passes traffic.
    # What if we bind to a different port, e.g. 8080?
    uvicorn.run(app, host="0.0.0.0", port=8080)
