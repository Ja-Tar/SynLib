const allpages = {
    "index":"/uczen/index",
    "oceny":"/przegladaj_oceny/uczen",
    "nieobecnosci":"/przegladaj_nb/uczen",
    "wiadomosci":"/wiadomosci",
    "ogloszenia":"/ogloszenia",
    "plan_lekcji":"/przegladaj_plan_lekcji",
    "moje_zadania":"/moje_zadania"
};

function przejdzdo(nazwa) {
    window.location.href = allpages[nazwa];
}