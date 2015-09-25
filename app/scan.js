var cheerio = require('cheerio')
var http = require('http')
var _path = require('path')
var _url = require('url')

var backend = require('./backend.js')
var util = require('./util.js')

function isSameServer(a, b) {
    return _url.parse(a).hostname == _url.parse(b).hostname
}

module.exports.handler = function (options, resolve, reject) {
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

        buf = buf.toString('utf8')

        var $ = cheerio.load(buf)
        var urls = $('a[href]').map(function () {
            var res = $(this).attr('href')
            res = _url.resolve(options.doc.url, res)
            return isSameServer(options.doc.url, res)? res: null
        }).get()

        urls = urls.filter(function (url) {
            var path = _url.parse(url).pathname
            var ext = _path.extname(path).replace('.', '')
            return ext in {
                jpg: 1,
                png: 1,
            }
        })

        var unique = Object.create(null)
        urls = urls.filter(function (url) {
            return unique[url]? 0: (unique[url] = 1)
        })

        urls.forEach(function (url) {
            backend.put({url: url, action: 'save'}, function (err) {
                if (err) {
                    console.error(err)
                }
            })
        })

        if (options.loader) {
            util.sendState(options.loader.webContents)
        }

        resolve()
    }
}
