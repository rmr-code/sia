# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements.txt first for better caching
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

# Command to run the application with the specified number of workers
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port 8080 --workers ${API_NO_WORKERS:-1}"]
