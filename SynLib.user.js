// ==UserScript==
// @name        SynLib
// @namespace   Violentmonkey Scripts
// @match       https://portal.librus.pl/rodzina/synergia/loguj*
// @match       https://api.librus.pl/OAuth/Authorization*
// @resource    login.html https://raw.githubusercontent.com/Ja-Tar/SynLib/main/login.html
// @resource    SynLib_login.css https://raw.githubusercontent.com/Ja-Tar/SynLib/main/SynLib_login.css
// @grant       GM.addStyle
// @grant       GM.getResourceText
// @run-at      document-end
// @version     0.0.1
// @author      JaTar
// @description Teraz to wygląda! Poprawia wygląd Librusa.
// ==/UserScript==

if (window.top !== window.self) {
    GM.addStyle(GM.getResourceText('SynLib_login.css'));
}
else {
    // Nasłuchiwanie na załadowanie się elementu iframe
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
        document.body.innerHTML += scriptsToInject + importedBodyContent;
        document.getElementById('login').appendChild(preservedContent);

        // Pobranie elementu iframe
        var iframe = document.getElementById('caLoginIframe');

        addStyleToFrame('body { background: #222; }', iframe);
    });

    function addStyleToFrame(cssStr, frmNode) {
        var D = frmNode.contentDocument;
        var newNode = D.createElement('style');
        newNode.textContent = cssStr;

        var targ = D.getElementsByTagName('head')[0] || D.body || D.documentElement;
        targ.appendChild(newNode);
    }
}