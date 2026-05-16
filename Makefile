USER = $$(id -u)
VERSION ?= $$(git rev-parse --verify HEAD)
ARGS = $(filter-out $@,$(MAKECMDGOALS))
DOCKER_RUN = docker run --init -it --rm -u ${USER} -v "$$(pwd):/app" -w /app

# https://marmelab.com/blog/2016/02/29/auto-documented-makefile.html
.PHONY: help
.DEFAULT_GOAL := help

help: ## Display this help screen
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

node:
	docker build \
		--target vitepress \
		--build-arg USER=$(USER) \
		--build-arg WORKDIR=/app \
		-t app .docker/node
	- $(DOCKER_RUN) \
		-v "$$(pwd)/node_modules:/app/node_modules" \
		-p "8080:8080" \
		app sh
	docker image rm -f app

## AI
-include .claude/Makefile

# Спец-правило, чтобы Makefile не ругался на неизвестные команды (аргументы)
%:
	@:
