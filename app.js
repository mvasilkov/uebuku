var app = require('app')
var BrowserWindow = require('browser-window')
var ipc = require('ipc')
var _util = require('util')

var backend = require('./app/backend.js')
var Loader = require('./app/loader.js')
var util = require('./app/util.js')

var win
var slave

function init() {
    if (win)
        return

    win = new BrowserWindow({width: 960, height: 540})

    win.loadUrl(_util.format('file://%s/ui/index.html', __dirname))
    win.openDevTools()

    win.on('closed', function () {
        win = null
    })

    slave = new Loader(app.getPath('home'), win.webContents)
}

app.on('ready', function () {
    backend.init(app.getPath('userData'), function (err) {
        if (err) {
            console.error(err)
            return void app.quit()
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
    util.sendState(event.sender)
    slave.work()
})

ipc.on('new-url', function (event, url, action) {
    backend.put({url: url, action: action}, function (err) {
        if (err) {
            console.error(err)
            return
        }

        util.sendState(event.sender)

        if (!slave.working) {
            slave.work()
        }
    })
})
