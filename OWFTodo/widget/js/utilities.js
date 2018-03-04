/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
// https://kangax.github.io/compat-table/es6/
// https://github.com/paulmillr/es6-shim/

// http://stackoverflow.com/questions/13859538/simplest-inline-method-to-left-pad-a-string
if (!String.prototype.lpad) {
    String.prototype.lpad = function (value, length) {
        var str = this;
        while (str.length < length)
            str = value + str;
        return str;
    };
}
// console.log("tst".lpad("-", 5));

// https://stackoverflow.com/questions/1144783/how-to-replace-all-occurrences-of-a-string-in-javascript
if (!String.prototype.replaceAll) {
    String.prototype.replaceAll = function (search, replacement) {
        var target = this;
        return target.replace(new RegExp(search, 'g'), replacement);
    };
}

// https://stackoverflow.com/questions/30867172/code-not-running-in-ie-11-works-fine-in-chrome
if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (searchString, position) {
        position = position || 0;
        return this.indexOf(searchString, position) === position;
    };
}
if (!String.prototype.endsWith) {
    String.prototype.endsWith = function (searchString) {
        return this.match(searchString + "$") === searchString;
    };
}

// https://stackoverflow.com/questions/24816/escaping-html-strings-with-jquery
var entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
};

function escapeHtml(str) {
    return String(str).replace(/[&<>"'`=\/]/g, function (s) {
        return entityMap[s];
    });
}

function htmlEncode(value) {
    return $('<div/>').text(value).html();
}

function htmlDecode(value) {
    return $('<div/>').html(value).text();
}

// https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url
// https://stackoverflow.com/questions/30970068/js-regex-url-validation
// updated to include A-Z for the extension  https://regex101.com/
function isValidURL(str) {
    if (!str.toLowerCase().startsWith("http") || (str.length === 0) || (str.length > 2048)) {
        return false;
    }

    var pattern = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-zA-Zz‌​]{2,6}\b([-a-zA-Z0-9‌​@:%_\+.~#?&=]*)/;

    return pattern.exec(str);
}

//
// https://lostechies.com/derickbailey/2012/02/09/asynchronously-load-html-templates-for-backbone-views/
// add to tomcat web.xml
//    <mime-mapping>
//        <extension>tmpl</extension>
//        <mime-type>text/plain</mime-type>
//    </mime-mapping>
TemplateManager = {
    templates: {},
    get: function (uri, templateName, callback) {
        var template = this.templates[templateName];
        if (template) {
            callback(template);
        } else {
            var self = this;

            // execute async requset for each template
            var req = $.ajax({
                url: uri + "/" + templateName + ".tmpl",
                cache: false,
                async: false
            }).done(function (data) {
                self.templates[templateName] = data;
                callback(data);

                //console.log("template loaded: " + templateName);
            }).fail(function (jqXHR, textStatus, errorThrown) {
                console.log("error, template: " + templateName + ", " + textStatus + ", " + errorThrown);
            });

            // wait for get to be done
            $.when(req).done();
        }

        return this;
    }
}

// http://stackoverflow.com/questions/3048724/time-delay-between-2-lines-of-code-in-javascript-not-settimeout
function delay(time) {
    var d1 = new Date();
    var d2 = new Date();
    while (d2.valueOf() < d1.valueOf() + time) {
        d2 = new Date();
    }
}

// http://stackoverflow.com/questions/8430336/get-keys-of-json-object-in-javascript
// get keys for json object
/*
 if (typeof Object.keys !== "function") {
 (function() {
 var hasOwn = Object.prototype.hasOwnProperty;
 Object.keys = Object_keys;
 function Object_keys(obj) {
 var keys = [], name;
 for (name in obj) {
 if (hasOwn.call(obj, name)) {
 keys.push(name);
 }
 }

 return keys;
 }
 })();
 }
 */

// http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript RFC4122
var previousGuid = [];

function guid() {
    var d = new Date().getUTCMilliseconds();

    if (window.performance && typeof window.performance.now === "function") {
        d += performance.now(); //use high-precision timer if available
    }

    var uuid = 'xxyxxyxx-yxxy-xxyx-xyxx-yxxyxxyxxyxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });

    if (previousGuid.indexOf(uuid) >= 0) {
        return guid();
    }

    previousGuid = _.union(previousGuid, [uuid]);
    return uuid;
}

//http://stackoverflow.com/questions/5539028/converting-seconds-into-hhmmss
function secondsToHMS(milliseconds) {
    //milliseconds = Number(milliseconds);

    var h = Math.floor(milliseconds / 3600);
    var m = Math.floor(milliseconds % 3600 / 60);
    var s = Math.floor(milliseconds % 3600 % 60);

    return (h > 0 ? h + "h " : "") + (m > 0 ? m + "m " : "") + s + "s";
}

function secondsToDHMS(milliseconds) {
    //milliseconds = Number(milliseconds);
    var timeDHMS = {};

    timeDHMS.Days = Math.floor(milliseconds / (60 * 60 * 1000 * 24) * 1);
    timeDHMS.Hours = Math.floor((milliseconds % (60 * 60 * 1000 * 24)) / (60 * 60 * 1000) * 1);
    timeDHMS.Mins = Math.floor(((milliseconds % (60 * 60 * 1000 * 24)) % (60 * 60 * 1000)) / (60 * 1000) * 1);
    timeDHMS.Secs = Math.floor((((milliseconds % (60 * 60 * 1000 * 24)) % (60 * 60 * 1000)) % (60 * 1000)) / 1000 * 1);

    return timeDHMS;
}

function secondsToDHMSStr(milliseconds) {
    //milliseconds = Number(milliseconds);
    var d = Math.floor(milliseconds / (60 * 60 * 1000 * 24) * 1);
    var h = Math.floor((milliseconds % (60 * 60 * 1000 * 24)) / (60 * 60 * 1000) * 1);
    var m = Math.floor(((milliseconds % (60 * 60 * 1000 * 24)) % (60 * 60 * 1000)) / (60 * 1000) * 1);
    var s = Math.floor((((milliseconds % (60 * 60 * 1000 * 24)) % (60 * 60 * 1000)) % (60 * 1000)) / 1000 * 1);

    return (d > 0 ? d + "d " : "") + (h > 0 ? h + "h " : "") + (m > 0 ? m + "m " : "") + s + "s";
}

//http://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
//var contentType = 'image/png';
//var b64Data = 'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';

//var blob = b64toBlob(b64Data, contentType);
//var blobUrl = URL.createObjectURL(blob);

//var img = document.createElement('img');
//img.src = blobUrl;
//document.body.appendChild(img);
function b64toBlob(b64Data, contentType, sliceSize) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;

    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        var slice = byteCharacters.slice(offset, offset + sliceSize);

        var byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        var byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, {
        type: contentType
    });
    return blob;
}

//http://stackoverflow.com/questions/33914764/how-to-read-a-binary-file-with-filereader-in-order-to-hash-it-with-sha-256-in-cr/33918579#33918579
//var hash = CryptoJS.SHA256(arrayBufferToWordArray(arrayBuffer));
//var elem = document.getElementById("hashValue");
//elem.value = hash;
function arrayBufferToWordArray(ab) {
    var i8a = new Uint8Array(ab);
    var a = [];
    for (var i = 0; i < i8a.length; i += 4) {
        a.push(i8a[i] << 24 | i8a[i + 1] << 16 | i8a[i + 2] << 8 | i8a[i + 3]);
    }
    return CryptoJS.lib.WordArray.create(a, i8a.length);
}

//http://stackoverflow.com/questions/7146217/merge-2-arrays-of-objects
function mergeByProperty(arr1, arr2, prop) {
    _.each(arr2, function (arr2obj) {
        var arr1obj = _.find(arr1, function (arr1obj) {
            return arr1obj[prop] === arr2obj[prop];
        });

        arr1obj ? _.extend(arr1obj, arr2obj) : arr1.push(arr2obj);
    });
}

function array_remove(array, element) {
    var index = array.indexOf(element);

    if (index !== -1) {
        array.splice(index, 1);
    }
}

function htmlEncode(value) {
    return $('<div/>').text(value).html();
}

function htmlDecode(value) {
    return $('<div/>').html(value).text();
}

// https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url
// https://stackoverflow.com/questions/30970068/js-regex-url-validation
// updated to include A-Z for the extension  https://regex101.com/
function isValidURL(str) {
    if (!str.toLowerCase().startsWith("http") || (str.length === 0) || (str.length > 2048)) {
        return false;
    }

    var pattern = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-zA-Zz‌​]{2,6}\b([-a-zA-Z0-9‌​@:%_\+.~#?&=]*)/;

    return pattern.exec(str);
}

// check is group exists in user group array
function groupExists(csvStr, groups) {
    var csvArr = csvStr.toUpperCase().split(",");
    var result = _.intersection(csvArr, groups);

    return result;
}