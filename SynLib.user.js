// ==UserScript==
// @name        SynLib
// @namespace   Violentmonkey Scripts
// @version     0.0.9
// @author      JaTar
// @description Teraz to wygląda! Poprawia wygląd Librusa.
//
// @updateURL   https://github.com/Ja-Tar/SynLib/raw/main/SynLib.user.js
//
// @match       https://portal.librus.pl/rodzina/synergia/loguj*
// @match       https://api.librus.pl/OAuth/Authorization*
// @match       https://synergia.librus.pl/uczen/index*
//
// @resource    login.html https://raw.githubusercontent.com/Ja-Tar/SynLib/main/login.html
// @resource    index.html https://raw.githubusercontent.com/Ja-Tar/SynLib/main/index.html
//
// @resource    SynLib_login.css https://raw.githubusercontent.com/Ja-Tar/SynLib/main/SynLib_login.css
// @resource    SynLib_main.css https://raw.githubusercontent.com/Ja-Tar/SynLib/main/SynLib_main.css
// @resource    Iconoir.css https://cdn.jsdelivr.net/gh/iconoir-icons/iconoir@main/css/iconoir.css
//
// @grant       GM.addStyle
// @grant       GM.getResourceText
// @grant       GM.xmlHttpRequest
//
// @run-at      document-end
// ==/UserScript==

// Skip home page
if (location.hostname === 'portal.librus.pl' && location.pathname != "/rodzina/synergia/loguj") {
    location.replace("/rodzina/synergia/loguj");
}

var GMLoadedLevel;
var TrybJanosc = false;

// Sprawdź czy wszystkie GM są dostępne
if (GM.getResourceText && GM.addStyle && GM.xmlHttpRequest) {
    console.log('Wszystkie GM. zostały załadowane');
    GMLoadedLevel = 2;
} else if (GM.addStyle && GM.xmlHttpRequest) {
    console.warn('Brak API -> GM.getResourceText');
    console.log('Zmiana na GM_xmlHttpRequest')
    GMLoadedLevel = 1;
} else if (GM.getResourceText || GM.addStyle) {
    throw new Error('Brak wymaganych API');
} else {
    throw new Error('Brak wymaganych API GM. -> Potrzebne są GM.addStyle i GM.getResourceText');
}

if (window.top !== window.self) {
    if (TrybJanosc !== true) {
        getFile('SynLib_login.css').then(stle => {
            GM.addStyle(stle);
        });
    }
}
else {
    if (window.location.href === 'https://portal.librus.pl/rodzina/synergia/loguj') {
        document.getElementById('caLoginIframe').addEventListener('load', function () {
            // Pobierz zawartość body z pobranego pliku HTML

            getFile('login.html').then(importedBodyContent => _changeBodyLogin(importedBodyContent));

            function _changeBodyLogin(importedBodyContent) {
                // Przeskanuj oryginalną zawartość strony i dodaj wszystkie skrypty na początek nowego body
                var originalScripts = document.querySelectorAll('script');
                var scriptsToInject = '';
                originalScripts.forEach(script => {
                    scriptsToInject += script.outerHTML;
                });

                // Skopiuj zawartość elementu do zachowania
                var elementDoZachowania = document.getElementById('caLoginIframe');
                var preservedContent = elementDoZachowania.cloneNode(true);

                // Wyczyść zawartość elementu body
                document.body.innerHTML = '';

                // Dodaj zachowane elementy oraz skrypty na początek nowego body
                document.body.innerHTML += scriptsToInject + importedBodyContent;
                if (TrybJanosc !== true) {
                    getFile('SynLib_main.css').then(
                        stle => GM.addStyle(stle)
                    );
                }
                document.getElementById('login').appendChild(preservedContent);
            }
        });
    }
    if (window.location.href === 'https://synergia.librus.pl/uczen/index') {

        if (TrybJanosc !== true) {
            getFile('SynLib_main.css').then(
                stle => GM.addStyle(stle)
            );
            getFile('Iconoir.css').then(
                stle => GM.addStyle(stle)
            );
        }

        document.getElementById('cookieBox').remove();
        document.getElementById('footer').remove();
        document.getElementById('body').innerHTML = '';
        getFile('ribbon.html').then(html => document.getElementById('top-banner-container').innerHTML = html);

        // dodać tutaj modyfikacje treści (usuwanie elementów, dodawanie elementów itp.)
    }
}

async function GetXMLHttpRequest(url) {
    return new Promise((resolve, reject) => {
        GM.xmlHttpRequest({
            method: "GET",
            url: url,
            onload: function (response) {
                resolve(response.responseText);
            },
            onerror: function (error) {
                reject(error);
            }
        });
    });
}

async function getFile(filename) {
    if (GMLoadedLevel === 1) {
        try {
            const responseData = await GetXMLHttpRequest("https://raw.githubusercontent.com/Ja-Tar/SynLib/main/" + filename);
            return responseData;
        } catch (error) {
            console.error(error);
            return null;
        }
    } else {
        return GM.getResourceText(filename);
    }
}

async function addTagStyle(gm_text) {
    try {
        const importedStyleContent = await getFile(gm_text, GMLoadedLevel);
        return "<style>" + importedStyleContent + "</style>";
    } catch (error) {
        console.error(error);
        return null;
    }
}