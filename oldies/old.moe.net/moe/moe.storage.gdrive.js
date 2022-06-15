//*****************************************************************************
//*****************************************************************************
//
// Loading and storing files to google drive (sketching)
//
//*****************************************************************************
//*****************************************************************************

var CLIENT_ID = '898331037992.apps.googleusercontent.com';
var API_KEY = 'AIzaSyCGhZLgwJFVlMgp0aPGglKDRHbasrw_eNE';
var SCOPES = 'https://www.googleapis.com/auth/drive';

function handleClientLoad() {
    gapi.client.setApiKey(API_KEY);
    window.setTimeout(checkAuth,1);
}

function checkAuth() {
    var options = {
        client_id: CLIENT_ID,
        scope: SCOPES,
        immediate: true
    };
    gapi.auth.authorize(options, handleAuthResult);
}

function handleAuthResult(authResult) {
    var authorizeButton = document.getElementById('authorize-button');

    if (authResult && !authResult.error) {
        authorizeButton.style.visibility = 'hidden';
        makeApiCall();
    } else {
        authorizeButton.style.visibility = '';
        authorizeButton.onclick = handleAuthClick;
    }
}

function handleAuthClick(event) {
    var options = {
        client_id: CLIENT_ID,
        scope: SCOPES,
        immediate: false
    };
    gapi.auth.authorize(options, handleAuthResult);
    return false;
}

function makeApiCall() {  
    gapi.client.load('drive', 'v2', makeRequest);   
}

function makeRequest() {
    var request = gapi.client.drive.files.list({'maxResults': 5 });
    request.execute(function(resp) {          
        for (i=0; i<resp.items.length; i++) {
            var titulo = resp.items[i].title;
            var fechaUpd = resp.items[i].modifiedDate;
            var userUpd = resp.items[i].lastModifyingUserName;
            var userEmbed = resp.items[i].embedLink;
            var userAltLink = resp.items[i].alternateLink;

            var fileInfo = document.createElement('li');
            fileInfo.appendChild(document.createTextNode('TITLE: ' + titulo + ' - LAST MODIF: ' + fechaUpd + ' - BY: ' + userUpd ));                
            document.getElementById('content').appendChild(fileInfo);
        }
    });    
}

/*
$(document).ready(function() {
  $('#authorize-button').on('click', handleAuthClick);
  $.getScript('//apis.google.com/js/api.js', function() {
    gapi.load('auth:client', handleClientLoad);
  });
});
*/

