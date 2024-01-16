# This builds the container for the ScaleMonitor in the Pixel Streaming Infrastructure
FROM --platform=${BUILDPLATFORM:-linux/amd64} python:alpine3.18

#Upgrade pip
RUN pip install --upgrade pip

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file and install Python dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy the application files
COPY app.py config.json /app/

# Create a new user and group 'pythonuser' with ID 1000, and set file permissions
RUN addgroup -S pythonuser -g 1000 && adduser -S pythonuser -u 1000 -G pythonuser \
    && chown -R pythonuser:pythonuser /app \
    && chmod +x app.py

# Switch to the non-root user 'pythonuser'
USER pythonuser

# Define the entry point for the container
ENTRYPOINT ["python", "app.py"]
