# asystent-bibliografii - NIEOFICJALNY asystent zasobów SSL WUM

__*PRZECZYTAJ LICENCJĘ*__

Skrypt pozwala na używanie proxy SSL VPN WUM w celu korzystania z medycznych baz danych, do których dostęp zapewnia WUM. Wymaga zalogowania do portalu SSL WUM (rozszerzenie nie zapisuje danych logowania).

## Obsługiwane zasoby

Pełna lista zasobów widoczna jest przy tagach @match w [kodzie skryptu](https://github.com/wodac/asystent-bibliografii/blob/main/asystent.user.js).

- bmj.com
- cochranelibrary.com
- pubmed.ncbi.nlm.nih.gov
- nejm.org
- uptodate.com

## Funkcje

- Otwieranie artykułów dostępnych w wyżej wymienionych zasobach za pomocą proxy dostarczanego przez WUM **za jednym kliknięciem**
- **Automatyczne** otwieranie artykułów z użyciem proxy *(opcja w ustawieniach)*
- **Kopiowanie cytowań** z aktualnie przeglądanej, bądź ze wszystkich otwartych kart **w ustawionym przez użytkownika formacie**
- **Eksportowanie cytowania** do pliku CSV

## Instalacja

Wymaga korzystania z rozszerzenia **Tampermonkey** ([Chrome Web Store](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo), [Firefox Add-on](https://addons.mozilla.org/pl/firefox/addon/tampermonkey/)) bądź Greasemonkey.

[Kliknij tutaj](https://github.com/wodac/asystent-bibliografii/raw/main/asystent.user.js), aby zainstalować skrypt.

Testowano na Chrome 96 z Tampermonkey

## Wykorzystywane dane

Przechowywuje lokalnie preferencje użytkownika. Używa [CiteAs](https://citeas.org/) do tworzenia cytowań - wysyła adresy URL do API tego serwisu.
