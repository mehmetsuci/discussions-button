'use strict';

// "more" drop-down menu
var MORE_MENU_ID = 'hdtb-more-mn';

// discussions filter string
var DISC_FILTER = ' inurl:forum|viewthread|showthread|viewtopic|showtopic|"index.php?topic" | ' + 
	'intext:"reading this topic"|"next thread"|"next topic"|"send private message"'; 

// initalize the extension
init();

var observer = new MutationObserver(function(mutations) {
	mutations.forEach(function(mutation) {
		if(mutation.addedNodes.length){
			var nodeArray = Array.prototype.slice.call(mutation.addedNodes);
			nodeArray.forEach(function(node){
				if(node.id === 'extabar') {
					getMoreMenu().then(addMenuItems);
				}
			});
		}
	});
});

function init() {
	getMoreMenu().then(function(menu) {
		addMenuItems(menu);
		observer.observe(document.body, { subtree: true, childList: true, characterData: true });
	});
}

function getMoreMenu() {
	return new Promise(function(res, rej) {
		var interval = setInterval(function() {
			var elm = document.getElementById(MORE_MENU_ID);
			if(elm && elm.children.length > 0){
				clearInterval(interval);
				res(elm);
			}
		}, 10);
	});
}

function addMenuItem(menu, name, url){
	if(document.location.href.lastIndexOf(url) === 
			(document.location.href.length - url.length)){
		return; // filter is already active
	} else if(url == "tbm=dsc" && discussionActive()){
		enableWebSearch();
		return;
	}
	name = upCase(name);
	var menuItem = createElm('div', 'hdtb_mitem')
	var link = createElm('a', 'q qs');
	var goTo = function(e){
		e.preventDefault();
		var href;
		if(url == "tbm=dsc") { // discussions filter is no longer supported by Google
			href = document.location.origin + '/search?q=' + getQuery() + DISC_FILTER;
		} else {
			href = document.location.href.replace(/&tbm=.{3}/g, '') + '&' + url;
		}
		document.location.href = href; 
		return false;
	};
	
	menuItem.addEventListener('click', goTo, true);
	link.addEventListener('click', goTo, true);
	link.href = '#';
	link.innerHTML = name;
	menuItem.appendChild(link); 
	if(menu && !menuItemExist(menu, name)){
		menu.appendChild(menuItem);
	}
}

function addMenuItems(menu){
	var links = {
		discussions: "tbm=dsc",
		blogs: "tbm=blg",
		recipes: "tbm=rcp",
		patents: "tbm=pts"
	};
	chrome.storage.sync.get('options', function(items){
		var options = items.options && JSON.parse(items.options) || links;
		for(var opt in options){
			if(options[opt]){
				addMenuItem(menu, opt, links[opt]);
			}
		}
	});
}

function createElm(type, className){
	var elm = document.createElement(type);
	elm.className = className;
	return elm;
}

function menuItemExist(parent, content){
	var items = Array.prototype.slice.call(parent.getElementsByClassName('qs'));
	items.forEach(function(item){
		if(item.innerHTML.toLowerCase().indexOf(content.toLowerCase()) > -1){
			return true;
		}
	});
	return false;
}

function upCase(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Detect if disucssions filter is currently active.
 */
function discussionActive() {
	var href = decodeURI(document.location.href);
	var filter = DISC_FILTER.match(/\S+?\|/)[0]; // first filter is enough, othewise have to deal with various encodings
	if(href.indexOf(filter) > -1 && href.indexOf('#q=') == -1) {
		return true;
	} else if(href.indexOf('#q=') > -1 && href.lastIndexOf(filter) > href.lastIndexOf('#q=')) {
		return true;
	}
	return false;
}

/**
 * Link "web" button to escape from filtered search.
 */
function enableWebSearch(){
	try {
		var button = document.querySelector('#hdtb-msb .hdtb-mitem');
		var filter = DISC_FILTER.match(/\S+?\|/)[0];
		var query = decodeURI(getQuery()).replace(new RegExp( '[ +]?' + filter.replace('|', '\\|') + '.+' ), '');
		button.innerHTML = button.innerHTML.indexOf('<a') == -1 ? ('<a href="javascript:;">' + button.innerHTML + '</a>') : button.innerHTML;
		button.classList.remove('hdtb-msel');
		button.addEventListener('click', function() {
			document.location.href = document.location.origin + '/search?q=' + query;
			return false;
		}, true); 
	} catch(e) {}
}

/**
 * Get current search query.
 */
function getQuery(){
	var regex = /(?:[&?#])q=([^&#]+)/g,
		url = document.location.href,
		match, 
		query;
	while((match = regex.exec(url))) {
		query = match;
	}
	return query && query[1];
}