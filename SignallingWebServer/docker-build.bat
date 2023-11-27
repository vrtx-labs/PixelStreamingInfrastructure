@echo off
:: Update your container registry name here
SET CONTINAER_REG="velux.jfrog.io/docker-dev/ccoe/vds"
:: Build Signalling Server Image
docker "build" "-t" "signallingwebserver:5.1.1" "-f" "Dockerfile" .
:: Tag and push images to container registry
docker "tag" "signallingwebserver:5.1.1" "%CONTINAER_REG%/signallingwebserver:5.1.1"

docker "push" "%CONTINAER_REG%/signallingwebserver:5.1.1"
