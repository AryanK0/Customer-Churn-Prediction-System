import gradio as gr
from backend.api.main import app as fastapi_app
import uvicorn

def read_status():
    return "CCP FastAPI Backend is running!"

demo = gr.Interface(fn=read_status, inputs=None, outputs="text", title="CCP Status")

# Mount Gradio at the root so HF's Gradio SDK health checks pass
app = gr.mount_gradio_app(fastapi_app, demo, path="/")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=7860)
