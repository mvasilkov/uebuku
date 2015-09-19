_start:
	./node_modules/.bin/electron .

node_modules: package.json
	npm install
	./node_modules/.bin/electron-rebuild
	touch node_modules
