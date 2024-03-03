// ==UserScript==
// @name        SynLib
// @namespace   Violentmonkey Scripts
// @version     0.0.12
// @author      JaTar
// @description Teraz to wygląda! Poprawia wygląd Librusa.
//
// @require     https://github.com/Ja-Tar/SynLib/raw/main/Strona.js
//
// @updateURL   https://github.com/Ja-Tar/SynLib/raw/main/SynLib.user.js
//
// @match       https://portal.librus.pl/rodzina/synergia/loguj*
// @match       https://api.librus.pl/OAuth/Authorization*
// @match       https://synergia.librus.pl/uczen/index*
// @match       https://portal.librus.pl/rodzina
//
// @resource    login.html https://raw.githubusercontent.com/Ja-Tar/SynLib/main/login.html
// @resource    ribbon.html https://raw.githubusercontent.com/Ja-Tar/SynLib/main/ribbon.html
//
// @resource    SynLib_login.css https://raw.githubusercontent.com/Ja-Tar/SynLib/main/SynLib_login.css
// @resource    SynLib_main.css https://raw.githubusercontent.com/Ja-Tar/SynLib/main/SynLib_main.css
// @resource    Iconoir.css https://cdn.jsdelivr.net/gh/iconoir-icons/iconoir@main/css/iconoir.css
//
// @grant       GM.addStyle
// @grant       GM.getResourceText
// @grant       GM.xmlHttpRequest
// @grant       GM.setValue
// @grant       GM.getValue
//
// @run-at      document-end
// ==/UserScript==

// Skip home page
if (location.hostname === 'portal.librus.pl' && location.pathname != "/rodzina/synergia/loguj") {
    location.replace("/rodzina/synergia/loguj");
}

var GMLoadedLevel;
var TrybJanosc = false;
var Strona = window.Strona;

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
    // Strona logowania
    if (window.location.href === 'https://portal.librus.pl/rodzina/synergia/loguj') {
        Strona.Login();
    }
    // Strona główna
    if (window.location.href === 'https://synergia.librus.pl/uczen/index') {
        Strona.Index();
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

async function getDataFromLibrusAPI(endpoint) {
    const url = `https://synergia.librus.pl/gateway/api/2.0/${endpoint}`;
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Host': 'synergia.librus.pl',
            'Accept-Encoding': 'gzip, deflate, br',
            'Referer': document.referrer,
            'Sec-GPC': '1',
            'Connection': 'keep-alive',
            'Credentials': 'include',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'DNT': '1',
            'User-Agent': navigator.userAgent,
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'pl,en;q=0.5'
        }
    });
    const json = await response.json();
    return json;
}

async function saveAfterLoginData() {
    try {
        await getDataFromLibrusAPI('Me').then(data => {
            sessionStorage.setItem('Me', JSON.stringify(data['Me']['Account']));
        });
        await getDataFromLibrusAPI('UserProfile').then(data => {
            sessionStorage.setItem('UserProfile', JSON.stringify(data['UserProfile']));
        });
        await getDataFromLibrusAPI('Classes').then(data => {
            sessionStorage.setItem('Classes', JSON.stringify(data['Class']));
        });
        sessionStorage.setItem('SavedAfterLogin', true);
    } catch (error) {
        try {
            console.warn(error);
            await refreshToken();
            await saveAfterLoginData();
        } catch (error) {
            console.error(error);
        }
    }
}

async function refreshToken() {
    // https://synergia.librus.pl/refreshToken
    const url = 'https://synergia.librus.pl/refreshToken';
    await fetch(url, {
        method: 'GET',
        headers: {
            'Host': 'synergia.librus.pl',
            'Accept-Encoding': 'gzip, deflate, br',
            'Referer': document.referrer,
            'Sec-GPC': '1',
            'Connection': 'keep-alive',
            'Credentials': 'include',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'DNT': '1',
            'User-Agent': navigator.userAgent,
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'pl,en;q=0.5'
        }
    });
}

function connectRibbonButtons() {
    const currentPage = window.location.pathname

    const index = document.getElementById('index')
    const oceny = document.getElementById('oceny')
    const frekwencja = document.getElementById('frekwencja')
    const wiadomosci = document.getElementById('wiadomosci')
    const ogloszenia = document.getElementById('ogloszenia')
    const zadania = document.getElementById('zadania')

    index.addEventListener('click', function () {
        window.location.href = '/uczen/index';
    });
    oceny.addEventListener('click', function () {
        window.location.href = '/przegladaj_oceny/uczen';
    });
    frekwencja.addEventListener('click', function () {
        window.location.href = '/przegladaj_nb/uczen';
    });
    wiadomosci.addEventListener('click', function () {
        window.location.href = '/wiadomosci';
    });
    ogloszenia.addEventListener('click', function () {
        window.location.href = '/ogloszenia';
    });
    zadania.addEventListener('click', function () {
        window.location.href = '/moje_zadania';
    });

    switch (currentPage) {
        case '/uczen/index':
            index.disabled = true;
            break;
        case '/przegladaj_oceny/uczen':
            oceny.disabled = true;
            break;
        case '/przegladaj_nb/uczen':
            frekwencja.disabled = true;
            break;
        case '/wiadomosci':
            wiadomosci.disabled = true;
            break;
        case '/ogloszenia':
            ogloszenia.disabled = true;
            break;
        case '/moje_zadania':
            zadania.disabled = true;
            break;
        default:
            break;
    }

}