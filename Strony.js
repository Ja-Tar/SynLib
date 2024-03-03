export class Strona {
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
    }
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

        if (sessionStorage.getItem('SavedAfterLogin') !== true) {
            saveAfterLoginData();
        }
        
        // Stwórz nowy element <div>
        var centre = document.createElement('div');
    }
}