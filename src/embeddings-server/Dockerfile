FROM python:3.12-slim

# Copy backend files
COPY ./requirements.txt .

# Install backend dependencies
RUN pip install  --no-cache-dir --upgrade -r requirements.txt

# Copy python code 
COPY . .

# start the uvicorn server
# remove --reload in produciton
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8002", "--reload"] 