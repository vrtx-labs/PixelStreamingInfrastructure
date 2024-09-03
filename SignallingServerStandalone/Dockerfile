# ----------------------------------------------------------------------
# Copyright (c) 2021, 2022 Oracle and/or its affiliates. All rights reserved.
# The Universal Permissive License (UPL), Version 1.0
# ----------------------------------------------------------------------

###############################
#    Build stage (node/npm)   #
###############################
FROM --platform=${BUILDPLATFORM:-linux/amd64} node:22-alpine3.20 as builder

# Set npm configuration
RUN npm config set loglevel warn \
  && npm set progress=false

# Set work directory
WORKDIR /src

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy the rest of the source code
COPY . .

############################
# Runtime container (node) #
############################
FROM --platform=${TARGETPLATFORM:-linux/amd64} node:22-alpine3.20

# Set work directory
WORKDIR /app

# Copy built application from builder
COPY --from=builder /src /app

# Use the 'node' user provided by the Node.js official image
USER node

# Entrypoint
ENTRYPOINT [ "node", "wrapper.js" ]
