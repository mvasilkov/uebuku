var mkdirp = require('mkdirp')
var _path = require('path')
var _util = require('util')
var PouchDB = require('pouchdb')
var ObjectId = require('objectid-js')

var pouch

module.exports.init = function (path, next) {
    path = _path.join(path, 'pouchdb')
    mkdirp(path, function (err) {
        if (err) {
            return void next(err)
        }

        pouch = new PouchDB(path, {adapter: 'leveldb'})

        module.exports.allDocs = pouch.allDocs.bind(pouch)
        module.exports.remove = pouch.remove.bind(pouch)

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
    pouch.allDocs(function (err, res) {
        if (err) {
            return void next(err)
        }

        if (res && res.total_rows != 0) {
            pouch.get(res.rows[0].id, next)
        }
        else {
            next(null, null)
        }
    })
}
