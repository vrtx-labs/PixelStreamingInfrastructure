@echo off
:: Update your container registry name here
SET CONTINAER_REG="velux.jfrog.io/docker-dev/ccoe/vds"

:: Update your package name here
SET PACKAGE_NAME="signallingwebserver"

:: Update build version here
SET BUILD_VERSION=5.1.10

:: Build Unreal Engine App image . Copy the Dockerfile to the root of the Unreal Engine App
docker "build" "-t" "%PACKAGE_NAME%:%BUILD_VERSION%" "-f" "Dockerfile" .

:: Tag and push images to container registry
docker "tag" "%PACKAGE_NAME%:%BUILD_VERSION%" "%CONTINAER_REG%/%PACKAGE_NAME%:%BUILD_VERSION%"
docker "push" "%CONTINAER_REG%/%PACKAGE_NAME%:%BUILD_VERSION%"
