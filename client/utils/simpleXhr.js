function request (method, url, data, onLoad, onError) {
    var request = new XMLHttpRequest();
    var that = this
    request.onload = function () {
        onLoad.apply(that, [JSON.parse(request.responseText || '{}')]);
    };

    request.onerror =  function () {
    console.error("ERROR");
        onError.apply(that, []);
    };

    request.open(method, url, true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.setRequestHeader('Accept', 'application/json');
    request.send(JSON.stringify(data));
}
 
function requestHandleError (method, url, data, onLoad) {
    request(method, url, data, onLoad, function(method,url) {
        console.error(method, url);
    });
}
 
exports.get = function (url, onLoad) {
    requestHandleError('GET', url, null, onLoad);
}

exports.post = function (url, data, onLoad) {
    requestHandleError('POST', url, data, onLoad);
}

exports.put = function (url, data, onLoad) {
    requestHandleError('PUT', url, data, onLoad);
}