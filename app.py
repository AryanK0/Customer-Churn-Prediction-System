import uvicorn
import gradio as gr
from backend.api.main import app

# Create a dummy Gradio interface just to satisfy Hugging Face Spaces
def dummy_interface():
    return "CCP FastAPI Backend is running!"

demo = gr.Interface(
    fn=dummy_interface, 
    inputs=None, 
    outputs="text",
    title="CCP Backend Status"
)

# Mount the dummy Gradio app on a subpath, leaving the root and /api for FastAPI
app = gr.mount_gradio_app(app, demo, path="/status")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)
