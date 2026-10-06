# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container at /app
COPY backend/requirements.txt /app/

# Install any needed packages specified in requirements.txt
# Use --no-cache-dir to keep the image small
RUN pip install --no-cache-dir -r requirements.txt

# Copy the ml folder (needed for models and data)
COPY ml /app/ml

# Copy the backend code
COPY backend/api /app/api

# Expose the port Hugging Face Spaces expects (7860)
EXPOSE 7860

# Set the PYTHONPATH so the api module can be found
ENV PYTHONPATH=/app

# Command to run the FastAPI application on port 7860
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "7860"]
