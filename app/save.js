var fs = require('fs')
var http = require('http')
var mime = require('mime-types')
var mkdirp = require('mkdirp')
var _path = require('path')

module.exports.handler = function (options, resolve, reject) {
    function path(res) {
        var name = options.doc._id
        var contentType
        var extension

        if (contentType = res.headers['content-type']) {
            if (extension = mime.extension(contentType)) {
                name += '.' + extension
            }
        }

        return _path.join(options.dir, name)
    }

    return function (err, res, buf) {
        if (err) {
            console.error(err)
            return void reject(err)
        }

        if (res.statusCode != 200) {
            err = res.statusCode + ' ' + http.STATUS_CODES['' + res.statusCode]
            console.error(err)
            return void reject(err)
        }

        mkdirp(options.dir, function (err) {
            if (err) {
                console.error(err)
                return void reject(err)
            }

            fs.writeFile(path(res), buf, function (err) {
                if (err) {
                    console.error(err)
                    return void reject(err)
                }

                resolve()
            })
        })
    }
}
