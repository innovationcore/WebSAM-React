# Use an official Python runtime as a base image
FROM python:3.11

# Set the working directory in the container
WORKDIR /app

COPY . .
RUN pip install click uvicorn fastapi pillow typing-extensions python-multipart numpy requests SimpleITK
# CMD ["bash", "-c", "python3 image_server.py & tail -f /dev/null"]
CMD ["bash", "-c", "python3 image_server.py"]
EXPOSE 8090
