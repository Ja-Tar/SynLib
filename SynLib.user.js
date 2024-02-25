// ==UserScript==
// @name        SynLib
// @namespace   Violentmonkey Scripts
// @match       https://portal.librus.pl/rodzina/synergia/loguj*
// @grant       none
// @run-at      document-idle
// @version     0.0.1
// @author      JaTar
// @description Teraz to wygląda! Poprawia wygląd Librusa.
// ==/UserScript==

// Funkcja do pobierania zawartości strony i przetwarzania jej
fetch('https://raw.githubusercontent.com/Ja-Tar/SynLib/main/login.html')
    .then(response => response.text())
    .then(html => {
        // Pobierz zawartość body z pobranego pliku HTML
        var importedBodyContent = html;

        // Przeskanuj oryginalną zawartość strony i dodaj wszystkie skrypty na początek nowego body
        var originalScripts = document.querySelectorAll('script');
        var scriptsToInject = '';
        originalScripts.forEach(script => {
            scriptsToInject += script.outerHTML;
        });

        // Skopiuj zawartość elementu do zachowania
        var elementDoZachowania = document.getElementById('synergiaLogin');
        var preservedContent = elementDoZachowania.cloneNode(true);

        // Wyczyść zawartość elementu body
        document.body.innerHTML = '';

        // Dodaj zachowane elementy oraz skrypty na początek nowego body
        document.body.appendChild(preservedContent);
        document.body.innerHTML += scriptsToInject + importedBodyContent;
    });

