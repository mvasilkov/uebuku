var mkdirp = require('mkdirp')
var _path = require('path')
var PouchDB = require('pouchdb')
var ObjectId = require('objectid-js')

var pouch

module.exports.init = function (path, done) {
    path = _path.join(path, 'pouchdb')
    mkdirp(path, function (err) {
        if (err) {
            return void done(err)
        }

        pouch = new PouchDB(path, {adapter: 'leveldb'})
        done(null)
    })
}

module.exports.loadAll = function (done) {
    pouch.allDocs({include_docs: true}, done)
}

module.exports.save = function (url, action, done) {
    var _id = (new ObjectId).toString()
    pouch.put({_id: _id, url: url, action: action}, done)
}
