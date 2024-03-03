// ==UserScript==
// @name        SynLib
// @namespace   Violentmonkey Scripts
// @version     0.0.14
// @author      JaTar
// @description Teraz to wygląda! Poprawia wygląd Librusa.
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

// ==========
// Obiekt Strona (zawiera wszystkie funkcje które są wywoływane na danej stronie)
// ==========

const Strona = {
    Login() {
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
    },
    Index() {
        // Usuń wszystkie elementy <style>
        document.querySelectorAll('style').forEach(style => style.remove());

        // Usuń wszystkie linki do arkuszy stylów
        document.querySelectorAll('link[rel="stylesheet"]').forEach(link => link.remove());

        getFile('SynLib_main.css').then(
            stle => GM.addStyle(stle)
        );
        getFile('Iconoir.css').then(
            stle => GM.addStyle(stle)
        );

        document.getElementById('cookieBox').remove();
        document.getElementById('footer').remove();
        document.getElementById('body').innerHTML = '';
        document.getElementById('main-navigation-container').remove();
        document.getElementById('user-section').remove();
        getFile('ribbon.html').then(html => {
            document.getElementById('top-banner-container').innerHTML = html;
            connectRibbonButtons();
        });

        
        saveAfterLoginData().then(() => {
                sessionStorage.setItem('SavedLoginData', true);

                // Div z zawartością strony wycentrowany
                var centre = document.createElement('div');
                centre.className = 'centre';

                // div z przywitaniem
                var headline = document.createElement('div');
                headline.className = 'headline';
                headline.innerHTML = `Witaj ${JSON.parse(sessionStorage.getItem('Me')).FirstName}!`;

                // Licznik dni do końca roku szkolnego i roku kalendarzowego
                let now = new Date();
                let scholstarts = new Date(JSON.parse(sessionStorage.getItem('Classes')).BeginSchoolYear);
                let scholends = new Date(JSON.parse(sessionStorage.getItem('Classes')).EndSchoolYear);
                let dayspassed = Math.floor((now - scholstarts) / (1000 * 60 * 60 * 24));
                let daysleft = Math.floor((scholends - now) / (1000 * 60 * 60 * 24));
                let daystotal = daysleft + dayspassed;
                let percent = dayspassed * 100 / daystotal;
                let progbar = 220 - 2.2 * percent;
                if (progbar > 220) {
                    progbar = 220;
                }
                let addon = "ni";
                if (daysleft === 1) {
                    addon = "zień";
                }
                if (daysleft <= 0) {
                    daysleft = "--";
                }
                let a = new Date(new Date().getFullYear(), 0, 1);
                let b = new Date(new Date().getFullYear(), 11, 31);
                let day_of_year = Math.floor((now - a) / (1000 * 60 * 60 * 24));
                let ddaysleft = Math.floor((b - a) / (1000 * 60 * 60 * 24)) - day_of_year;
                let dpercent = day_of_year * 100 / Math.floor((b - a) / (1000 * 60 * 60 * 24));
                let dprogbar = 220 - 2.2 * dpercent;
                if (dprogbar > 220) {
                    dprogbar = 220;
                }
                let daddon = "ni";
                if (ddaysleft === 1) {
                    daddon = "zień";
                }

                // Licznik dni do końca roku szkolnego
                var koniecRokSzkolny = document.createElement('div');
                koniecRokSzkolny.className = 'circ';
                koniecRokSzkolny.style.color = '#F46'
                koniecRokSzkolny.innerHTML = `
                <svg class="cprog" viewBox="0 0 110 110">
                    <defs>
                        <path id="thePath" d="M40,90 A40,40 0 1,1 70,90" style="fill:none;"></path>
                    </defs>
                    <use xlink:href="#thePath" style="stroke: #333;"></use>
                    <use xlink:href="#thePath"
                        style="stroke: #F46;stroke-dasharray: 220.6;stroke-dashoffset: ${progbar};animation: school 2s;"></use>
                    <!-- Change stroke-dashoffset -->
                </svg>
                <div class="value">${percent.toFixed(0)}<b>%</b></div>
                <div class="tooltip">Pozostało ${daysleft} d${addon}</div>
                <div class="icon iconoir-bookmark-book" style="font-size: x-large;"></div>
                `;

                // Licznik dni do końca roku kalendarzowego
                var koniecRokuKal = document.createElement('div');
                koniecRokuKal.className = 'circ';
                koniecRokuKal.style.color = '#48F'
                koniecRokuKal.innerHTML = `
                <svg class="cprog" viewBox="0 0 110 110">
                    <defs>
                        <path id="thePath2" d="M40,90 A40,40 0 1,1 70,90" style="fill:none;"></path>
                    </defs>
                    <use xlink:href="#thePath2" style="stroke: #333;"></use>
                    <use xlink:href="#thePath2"
                        style="stroke: #48F;stroke-dasharray: 220.6;stroke-dashoffset: ${dprogbar};animation: year 2s;"></use>
                    <!-- Change stroke-dashoffset -->
                </svg>
                <div class="value">${dpercent.toFixed(0)}<b>%</b></div>
                <div class="tooltip">Pozostało ${ddaysleft} d${daddon}</div>
                <div class="icon iconoir-calendar" style="font-size: x-large;"></div>
                `;

                // Dodaj animację do strony
                var style = document.createElement('style');
                style.setAttribute('type', 'text/css');
                style.innerHTML = `
                @keyframes school {
                    from {stroke-dashoffset: 220;}
                    to {stroke-dashoffset: ${progbar};} 
                }
                @keyframes year {
                    from {stroke-dashoffset: 220;}
                    to {stroke-dashoffset: ${dprogbar};}
                }
                `;

                // Szczęśliwy numerek
                var luckyNumber = document.createElement('div');
                const luckyNumberValue = JSON.parse(sessionStorage.getItem('LuckyNumber')).LuckyNumber;
                const userNumber = JSON.parse(sessionStorage.getItem('User')).ClassRegisterNumber;
                const luckyNumberDate = JSON.parse(sessionStorage.getItem('LuckyNumber')).LuckyNumberDay;
                if (luckyNumberValue === userNumber) {
                    luckyNumber.innerHTML = `<div class="icon iconoir-emoji" style="font-size: x-large;"></div><div>Masz dzisiaj szczęśliwy numerek! (${luckyNumberValue}, ${luckyNumberDate})</div>`;
                    luckyNumber.className = 'lucky yes';
                } else {
                    luckyNumber.innerHTML = `<div class="icon iconoir-emoji-really" style="font-size: x-large;"></div><div><b>${luckyNumberValue}</b> to szczęśliwy numerek na dzień ${luckyNumberDate}</div>`;
                    luckyNumber.className = 'lucky';
                };

                // Dodaj zawartość do diva
                centre.appendChild(headline);
                centre.appendChild(style);
                centre.appendChild(koniecRokSzkolny);
                centre.appendChild(koniecRokuKal);
                centre.appendChild(luckyNumber);

                document.body.appendChild(centre);
            });
    }
}

// ==========
// Skrypt
// ==========

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
    // Strona logowania
    if (window.location.href === 'https://portal.librus.pl/rodzina/synergia/loguj') {
        Strona.Login();
    }
    // Strona główna
    if (window.location.href === 'https://synergia.librus.pl/uczen/index') {
        Strona.Index();
    }
}

// ==========
// Funkcje
// ==========

// Pobierz zawartość url za pomocą GM.xmlHttpRequest
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

// Pobierz zawartość pliku za pomocą GM.getResourceText lub GM.xmlHttpRequest
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

// Pobieranie zawartości CSS i dodanie tagu <style>
async function addTagStyle(gm_text) {
    try {
        const importedStyleContent = await getFile(gm_text, GMLoadedLevel);
        return "<style>" + importedStyleContent + "</style>";
    } catch (error) {
        console.error(error);
        return null;
    }
}

// Komunikacja z native API Librusa
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

// Zapisz dane z API Librusa do sessionStorage
async function saveAfterLoginData() {
    if (sessionStorage.getItem('SavedLoginData') !== true) {
        return;
    }
    try {
        await getDataFromLibrusAPI('Me').then(data => {
            sessionStorage.setItem('Me', JSON.stringify(data['Me']['Account']));
        });
    } catch (error) {
        try {
            console.warn(error);
            await refreshToken();
            await getDataFromLibrusAPI('Me').then(data => {
                sessionStorage.setItem('Me', JSON.stringify(data['Me']['Account']));
            });
        } catch (error) {
            console.error(error);
            return;
        }
    }
    await getDataFromLibrusAPI('UserProfile').then(data => {
        sessionStorage.setItem('UserProfile', JSON.stringify(data['UserProfile']));
    });
    await getDataFromLibrusAPI('Classes').then(data => {
        sessionStorage.setItem('Classes', JSON.stringify(data['Class']));
    });
    await getDataFromLibrusAPI(`Users/${JSON.parse(sessionStorage.getItem('Me')).UserId}`).then(data => {
        sessionStorage.setItem('User', JSON.stringify(data['User']));
    });
    await getDataFromLibrusAPI('LuckyNumbers').then(data => {
        sessionStorage.setItem('LuckyNumber', JSON.stringify(data['LuckyNumber']));
    });
    console.log('Dane zapisane w sessionStorage');
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