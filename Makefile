TESTS = $(shell find test -type f -name "*.test.js")
TEST_TIMEOUT = 5000
MOCHA_REPORTER = spec
# NPM_REGISTRY = "--registry=http://registry.npm.taobao.org"
NPM_REGISTRY = ""


all: test

install:
	@npm install $(NPM_REGISTRY)


test: install
	@NODE_ENV=test ./node_modules/mocha/bin/mocha \
		--reporter $(MOCHA_REPORTER) \
		-r should \
		--timeout $(TEST_TIMEOUT) \
		$(TESTS)

test-cov cov: install
	@NODE_ENV=test node \
		node_modules/.bin/istanbul cover --preserve-comments \
		./node_modules/.bin/_mocha \
		-r should \
		--report lcovonly -- -R spec && cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js && rm -rf ./coverage \
		$(TESTS)

test-coveralls: install
	@NODE_ENV=test ./node_modules/.bin/istanbul cover \
	./node_modules/mocha/bin/_mocha --report lcovonly -- -R spec && \
		cat ./coverage/lcov.info | ./node_modules/.bin/coveralls --verbose

.PHONY: test
