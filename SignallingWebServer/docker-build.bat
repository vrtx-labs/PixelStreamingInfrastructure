@echo off
:: Update your container registry name here
SET CONTINAER_REG="velux.jfrog.io/docker-dev/ccoe/vds"
:: Update build version here
SET BUILD_VERSION=5.1.4

:: Build Signalling Server Image
docker "build" "-t" "signallingwebserver:%BUILD_VERSION%" "-f" "Dockerfile" .
:: Tag and push images to container registry
docker "tag" "signallingwebserver:%BUILD_VERSION%" "%CONTINAER_REG%/signallingwebserver:%BUILD_VERSION%"

docker "push" "%CONTINAER_REG%/signallingwebserver:%BUILD_VERSION%"
