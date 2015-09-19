var backend = require('./backend.js')

module.exports.sendState = function (webContents) {
    backend.allDocs({include_docs: true})
    .then(function (res) {
        webContents.send('backend-state', res)
    })
    .catch(function (err) {
        console.error(err)
    })
}
