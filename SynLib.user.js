// ==UserScript==
// @name        SynLib
// @namespace   Violentmonkey Scripts
// @updateURL   https://github.com/Ja-Tar/SynLib/raw/main/SynLib.user.js
// @downloadURL https://github.com/Ja-Tar/SynLib/raw/main/SynLib.user.js
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
// @resource    index.js https://raw.githubusercontent.com/Ja-Tar/SynLib/main/index.js
//
// @grant       GM.addStyle
// @grant       GM.getResourceText
// @run-at      document-end
// @version     0.0.4
// @author      JaTar
// @description Teraz to wygląda! Poprawia wygląd Librusa.
// ==/UserScript==

if (window.top !== window.self) {
    GM.addStyle(GM.getResourceText('SynLib_login.css'));
}
else {
    if (window.location.href === 'https://portal.librus.pl/rodzina/synergia/loguj') {
        document.getElementById('caLoginIframe').addEventListener('load', function () {
            // Pobierz zawartość body z pobranego pliku HTML
            var importedBodyContent = GM.getResourceText('login.html');

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
            document.body.innerHTML += scriptsToInject + importedBodyContent + "<style>" + GM.getResourceText('SynLib_main.css') + "</style>";
            document.getElementById('login').appendChild(preservedContent);

            // Pobranie elementu iframe
            var iframe = document.getElementById('caLoginIframe');

            addStyleToFrame('body { background: #222; }', iframe);
        });
    }
    if (window.location.href === 'https://synergia.librus.pl/uczen/index') {
        document.querySelectorAll('style, link[rel="stylesheet"]').forEach(function (element) {
            element.remove();
        });

        // Pobierz zawartość body z pobranego pliku HTML
        var importedBodyContent = GM.getResourceText('index.html');

        // Przeskanuj oryginalną zawartość strony i dodaj wszystkie skrypty na początek nowego body
        var originalScripts = document.querySelectorAll('script');
        var scriptsToInject = '';
        originalScripts.forEach(script => {
            scriptsToInject += script.outerHTML;
        });

        // Przenieś wartości ze strony
        var luckynumber = document.getElementsByClassName('luckyNumber')[0];

        // Wyczyść zawartość elementu body
        document.body.innerHTML = '';

        // Dodaj zachowane elementy oraz skrypty na początek nowego body
        document.body.innerHTML += 
            scriptsToInject +
            importedBodyContent +
            addTagStyle('SynLib_main.css') +
            addTagStyle('Iconoir.css');

        // Przenoszenie wartości
        document.getElementById("luckynumint").innerHTML = luckynumber.innerHTML;

        // Link buttons
        document.getElementById('index').addEventListener('click', function () {
            window.location.href = '/uczen/index';
        });
        document.getElementById('oceny').addEventListener('click', function () {
            window.location.href = '/przegladaj_oceny/uczen';
        });
        document.getElementById('nb').addEventListener('click', function () {
            window.location.href = '/przegladaj_nb/uczen';
        });
        document.getElementById('wiadomosci').addEventListener('click', function () {
            window.location.href = '/wiadomosci';
        });
        document.getElementById('ogloszenia').addEventListener('click', function () {
            window.location.href = '/ogloszenia';
        });
        document.getElementById('zadania').addEventListener('click', function () {
            window.location.href = '/moje_zadania';
        });
    }

    function addStyleToFrame(cssStr, frmNode) {
        var D = frmNode.contentDocument;
        var newNode = D.createElement('style');
        newNode.textContent = cssStr;

        var targ = D.getElementsByTagName('head')[0] || D.body || D.documentElement;
        targ.appendChild(newNode);
    }

    function addTagStyle(gm_text) {
        return "<style>" + GM.getResourceText(gm_text) + "</style>";
    }
}