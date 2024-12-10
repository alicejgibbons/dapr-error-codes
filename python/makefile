# Variables
IMAGE_NAME := pythonapp
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
	python -m venv venv
	./venv/bin/pip install requests
	export DAPR_HTTP_PORT="3500"
	export DAPR_GRPC_PORT="3510"

	dapr run \
		--app-id pythonapp \
		--dapr-http-port 3500 \
		--dapr-grpc-port 3510 \
		--log-level debug \
		--config ../resources/config.yaml \
		--resources-path ../resources \
		-- ./venv/bin/python app.py

.PHONY: clean
clean:
	@echo "Cleaning build artifacts..."
	rm -rf __pycache__