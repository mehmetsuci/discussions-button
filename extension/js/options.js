
init();

document.getElementById('save').addEventListener('click', function(){
    var options = {};
    var inputs = Array.prototype.slice.call(document.getElementsByTagName('input'));
    inputs.forEach(function(elm){
        options[elm.id] = elm.checked ? true : false;
    });
    chrome.storage.sync.set({'options': JSON.stringify(options)});
    document.getElementById('status').style.display = 'block';
}, true)

function init(){
    chrome.storage.sync.get('options', function(items){
        var options = items.options && JSON.parse(items.options) || {};
        var inputs = Array.prototype.slice.call(document.getElementsByTagName('input'));
        inputs.forEach(function(elm){
            if(elm.id in options){
                elm.checked = options[elm.id];
            }
            elm.onclick = function(){
                document.getElementById('status').style.display = 'none';
            };
        });
    });   
}