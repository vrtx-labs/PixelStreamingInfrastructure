# Metrics Server

import time
import redis
import math
import json
import logging
from kubernetes import client, config

# Create a logger object
logger = logging.getLogger(__name__)

# Set the logging level
logger.setLevel(logging.DEBUG)

# Create a file handler
handler = logging.FileHandler('/app/logs/scalemonitor.log')

# Set the logging format
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)

# Add the handler to the logger
logger.addHandler(handler)

# Use the logger to log messages
logger.debug('Debug message')
logger.info('Info message')
logger.warning('Warning message')
logger.error('Error message')
logger.critical('Critical message')

# Load configuration from a JSON file
def load_config(filename):
    with open(filename, 'r') as file:
        return json.load(file)

# Use the loaded configuration
config_file = load_config('config.json')
NAMESPACE = config_file["NAMESPACE"]
DEPLOYMENT_NAME = config_file["DEPLOYMENT_NAME"]
REDIS_HOST = config_file["REDIS_HOST"]
REDIS_PORT = config_file["REDIS_PORT"]
MAX_REPLICAS = config_file["MAX_REPLICAS"] # Maximum number of pods
SCALING_BUFFER = config_file["SCALING_BUFFER"]
SCALING_FACTOR = config_file["SCALING_FACTOR"]        

# Get the Kubernetes environment
config.load_incluster_config()


# Get total pods where label is app.kubernetes.io/component=signallingwebserver
def get_pod_count(label_selector):
    try:
        pods = client.CoreV1Api().list_namespaced_pod(NAMESPACE, label_selector=label_selector)
        return len(pods.items)
    except Exception as e:
        logging.critical(f"Error getting pods: {e}")
        return 0
     
def scale_deployment(name, namespace, replicas):
    try:
        body = client.V1Scale(spec=client.V1ScaleSpec(replicas=replicas))
        client.AppsV1Api().patch_namespaced_deployment_scale(name=name, namespace=namespace, body=body)
    except Exception as e:
        logging.critical(f"Error scaling deployment: {e}")

def calculate_desired_replicas(connections, buffer=SCALING_BUFFER, scale_factor=SCALING_FACTOR):
    desired = math.ceil(buffer + (connections * scale_factor))
    return min(desired, MAX_REPLICAS)  # Ensuring it doesn't exceed MAX_REPLICAS

def main():
    r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=0)
    r.set_response_callback('GET', int)

    while True:
        current_connections = r.get('CONNECTIONS')
        desired_replicas = calculate_desired_replicas(current_connections)
        current_pods = get_pod_count("app.kubernetes.io/component=signallingwebserver")

        if current_connections > 0:
            if current_pods < desired_replicas:
                scale_deployment(DEPLOYMENT_NAME, NAMESPACE, desired_replicas)
                logger.info(f"Scaling up to {desired_replicas} pods")
            else:
                logger.info("No need to scale up")
        else:
            logger.info("No need to scale up")

        if current_pods > desired_replicas and current_pods > 1:
            new_pod_count = current_pods - 1
            scale_deployment(DEPLOYMENT_NAME, NAMESPACE, new_pod_count)
            logger.info(f"Scaling down to {new_pod_count} pods")
        else:
            logger.info("No need to scale down")

        logger.info({"totalConnections": current_connections, "totalPods": current_pods})
        time.sleep(3)

if __name__ == "__main__":
    main()