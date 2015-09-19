var assert = require('assert')
var mkdirp = require('mkdirp')
var _path = require('path')
var _util = require('util')
var PouchDB = require('pouchdb')
var ObjectId = require('objectid-js')

var scanPause = 1200000 // 20 min

var pouch

module.exports.init = function (path, next) {
    path = _path.join(path, 'pouchdb')
    mkdirp(path, function (err) {
        if (err) {
            return void next(err)
        }

        pouch = new PouchDB(path, {adapter: 'leveldb'})

        module.exports.allDocs = pouch.allDocs.bind(pouch)
        module.exports._remove = pouch.remove.bind(pouch)

        next(null)
    })
}

module.exports.put = function (doc, next) {
    if (!_util.isString(doc._id)) {
        doc._id = '' + (new ObjectId)
    }
    return pouch.put(doc, next)
}

module.exports.getOne = function (next) {
    pouch.allDocs({include_docs: true}, function (err, res) {
        if (err) {
            return void next(err)
        }

        if (res && res.total_rows != 0) {
            var now = Date.now()
            var i, doc

            for (i = 0; i < res.total_rows; ++i) {
                doc = res.rows[i].doc
                if ('awaken' in doc && doc.awaken > now) {
                    continue
                }
                return void next(null, doc)
            }
        }

        next(null, null)
    })
}

module.exports.remove = function (doc, next) {
    assert(doc.action in {scan: 1, save: 1})

    if (doc.action == 'save') {
        return pouch.remove(doc, next)
    }

    if (doc.action == 'scan') {
        var now = Date.now()
        doc.awaken = now + scanPause
        return pouch.put(doc, next)
    }
}
