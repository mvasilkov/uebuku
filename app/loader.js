var assert = require('assert')
var _path = require('path')
var _request = require('request')

var backend = require('./backend.js')
var save = require('./save.js')
var scan = require('./scan.js')
var util = require('./util.js')

var headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) ' +
    'AppleWebKit/600.7.12 (KHTML, like Gecko) Version/7.1.7 Safari/537.85.16'}
var pause = 250

var request = _request.defaults({
    encoding: null,
    headers: headers,
})

var handlers = {
    save: save,
    scan: scan,
}

var Loader = module.exports = function (dir, webContents) {
    this.dir = _path.join(dir, 'Uebuku')
    this.doc = null
    this.webContents = webContents
    this.working = false

    this.resolve = resolve.bind(this)
    this.reject = reject.bind(this)
}

Loader.prototype.work = function () {
    if (this.working) {
        return
    }
    this.working = true

    backend.getOne(function (err, doc) {
        this.working = false

        if (err) {
            console.error(err)
            return
        }

        if (!doc) {
            return
        }

        assert.strictEqual(this.doc, null)

        this.doc = doc
        this.working = true
        this.webContents.send('begin-work', doc._id)

        assert(doc.action in handlers)

        var handler = handlers[doc.action]
        .handler({dir: this.dir, doc: doc}, this.resolve, this.reject)

        request(doc.url, handler)
    }.bind(this))
}

function resolve() {
    backend.remove(this.doc, function (err) {
        if (err) {
            console.error(err)
        }

        this.doc = null
        this.working = false
        this.webContents.send('begin-sleep')

        setTimeout(function () {
            if (!this.working) {
                this.work()
            }
        }.bind(this), pause)

        util.sendState(this.webContents)
    }.bind(this))
}

/* TODO */
var reject = resolve
