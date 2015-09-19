var $ = require('jquery')
var handlebars = require('handlebars')
var ipc = require('ipc')

var template = handlebars.compile($('#backend-state-template').html())

function paint(res) {
    console.log(res)
    $('#backend-state').html(template({res: res}))
}

function addUrl(event) {
    event.preventDefault()

    var $newUrl = $('#new-url')
    var url = $newUrl.val()
    $newUrl.val('')

    if (validateUrl(url)) {
        console.error('Bad URL:', url)
        return
    }

    ipc.send('new-url', url, 'save')
}

/**
 * @return true on bad URL
 */
function validateUrl(u) {
    if (!u || !u.match(/^https?:/))
        return true

    return false
}

function init() {
    $('#add-url-form').submit(addUrl)

    ipc.on('backend-state', paint)
    ipc.send('want-backend-state')
}

init()