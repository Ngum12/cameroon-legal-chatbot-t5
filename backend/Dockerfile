FROM python:3.10

WORKDIR /code

# Copy requirements first for better caching
COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Copy everything else including the model
COPY . /code

# Hugging Face Spaces uses port 7860
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]