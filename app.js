var app = require('app')
var BrowserWindow = require('browser-window')
var ipc = require('ipc')
var util = require('util')

var backend = require('./backend.js')

var win

function init() {
    if (win)
        return

    win = new BrowserWindow({width: 960, height: 540})

    win.loadUrl(util.format('file://%s/ui/index.html', __dirname))
    win.openDevTools()

    win.on('closed', function () {
        win = null
    })
}

app.on('ready', function () {
    backend.init(app.getPath('userData'), function (err) {
        if (err) {
            console.error(err)
            app.quit()
            return
        }

        init()
    })
})

app.on('activate', function () {
    init()
})

app.on('window-all-closed', function () {
    if (process.platform != 'darwin') {
        app.quit()
    }
})

ipc.on('want-backend-state', function (event) {
    loadAll(event)
})

ipc.on('new-url', function (event, url, action) {
    backend.save(url, action, function (err) {
        if (err) {
            console.error(err)
            return
        }

        loadAll(event)
    })
})

function loadAll(event) {
    backend.loadAll(function (err, res) {
        if (err) {
            console.error(err)
            return
        }

        event.sender.send('backend-state', res)
    })
}
