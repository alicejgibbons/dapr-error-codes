# Variables
IMAGE_NAME := nodeapp
VERSION := 0.0.1
DOCKER_REGISTRY := alicejgibbons
FULL_IMAGE_NAME := $(DOCKER_REGISTRY)/$(IMAGE_NAME)

.PHONY: build-image
build-image:
	@echo "Building Docker image..."
	docker buildx build --no-cache --platform=linux/amd64,linux/arm64 -t ${DOCKER_REGISTRY}/${IMAGE_NAME}:${VERSION} --push .

.PHONY: run
run:
	@echo "Running service with Dapr..."
	npm install
	export DAPR_PROTOCOL=grpc
	export DAPR_HTTP_PORT="3600"
	export DAPR_GRPC_PORT="3610"

	dapr run \
		--app-id nodeapp \
		--app-port 3000 \
		--dapr-http-port 3600 \
		--dapr-grpc-port 3610 \
		--log-level debug \
		--app-protocol grpc \
		--config ../resources/config.yaml \
		--resources-path ../resources \
		-- node app.js

.PHONY: clean
clean:
	@echo "Cleaning build artifacts..."
	rm -rf node_modules