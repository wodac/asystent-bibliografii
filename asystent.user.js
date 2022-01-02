// ==UserScript==
// @name         Asystent zasobów SSL WUM
// @description  Asystent zasobów SSL WUM
// @namespace    http://tampermonkey.net/
// @version      1.3.1
// @updateURL    https://github.com/wodac/asystent-bibliografii/raw/main/asystent.user.js
// @author       Wojciech Odachowski
// @match        https://doi.org/*
// @match        http*://*.bmj.com/*
// @match        http*://*.cochranelibrary.com/*
// @match        http*://pubmed.ncbi.nlm.nih.gov/*
// @match        http*://*.nejm.org/*
// @match        http*://*.uptodate.com/*
// @match        https://ssl.wum.edu.pl/*
// @icon         https://www.google.com/s2/favicons?domain=wum.edu.pl
// @grant        unsafeWindow
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_saveTab
// @grant        GM_getTab
// @grant        GM_getTabs
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_setClipboard
// @grant        GM_xmlhttpRequest
// @grant        GM_addElement
// @grant        GM_download
// @run-at document-ready
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    const URL_PREFIX = "https://ssl.wum.edu.pl/dana/home/launch.cgi?url="
    const LOGOUT_URL = "https://ssl.wum.edu.pl/dana-na/auth/logout.cgi"
    const CITEAS_ENDPOINT = "https://api.citeas.org/product/"
    const CITEAS_FORMATS = [
        {
            "short": "apa",
            "full": "American Psychological Association 6th edition",
            "example": "Forouhi, N. G., & Wareham, N. J. (2019, January). Epidemiology of diabetes. <i>Medicine</i>. Elsevier BV. http://doi.org/10.1016/j.mpmed.2018.10.004"
        },
        {
            "short": "harvard1",
            "full": "Harvard Reference format 1 (author-date)",
            "example": "Forouhi, N.G. & Wareham, N.J., 2019. Epidemiology of diabetes. <i>Medicine</i>, 47(1), pp.22–27. Available at: https://doi.org/10.1016/j.mpmed.2018.10.004."
        },
        {
            "short": "nature",
            "full": "Nature",
            "example": "1.Forouhi, N. G. & Wareham, N. J.. Epidemiology of diabetes. <i>Medicine</i> <b>47,</b> 22–27 (2019)."
        },
        {
            "short": "modern-language-association-with-url",
            "full": "Modern Language Association 7th edition (with URL)",
            "example": "Forouhi, Nita Gandhi, and Nicholas J. Wareham. “Epidemiology of Diabetes”. <i>Medicine</i> Jan. 2019: 22–27. <i>Crossref</i>. Web. <https://doi.org/10.1016/j.mpmed.2018.10.004>..."
        },
        {
            "short": "chicago-author-date",
            "full": "Chicago Manual of Style 16th edition (author-date)",
            "example": "Forouhi, Nita Gandhi, and Nicholas J. Wareham. 2019. “Epidemiology of Diabetes”. <i>Medicine</i>. Elsevier BV. doi:10.1016/j.mpmed.2018.10.004."
        },
        {
            "short": "vancouver",
            "full": "Vancouver",
            "example": "1. Forouhi NG, Wareham NJ. Epidemiology of diabetes [Internet]. Vol. 47, Medicine. Elsevier BV; 2019. p. 22–7. Available from: https://doi.org/10.1016/j.mpmed.2018.10.004"
        }
    ]
    let citationFormatChosen = GM_getValue("citationFormat") || "apa"
    let autoloadProxy = GM_getValue("autoloadProxy")
    autoloadProxy = typeof autoloadProxy === "undefined" ? false : autoloadProxy

    let formatOptions = CITEAS_FORMATS.map(format => {
        return `<option value="${format.short}">${format.full}</option>`
    }).join('')
    let formatExamples = CITEAS_FORMATS.map(format => {
        return `
            <div class="custom-script-citation-format-example" data-citation-format="${format.short}">
                ${format.example}
            </div>
        `
    }).join('')
    const settingsForm = `
        <h1>Ustawienia asystenta zasobów SSL WUM</h1>
        <h6>©️ Wojciech Odachowski</h6>
        <form>
            <div class="custom-script-setting">
                <input type="checkbox" id="custom-script-autoload-proxy" ${autoloadProxy ? 'checked' : ''}>
                <label class="custom-script-autoload-proxy" for="custom-script-autoload-proxy">Automatycznie używaj proxy</label>
            </div>
            <div class="custom-script-setting">
                <label class="custom-script-citation-format" for="custom-script-citation-format">Format cytowania: </label>
                <select id="custom-script-citation-format">
                    ${formatOptions}
                </select>
            </div>
            <div class="custom-script-citation-format-examples-label">
                <em>Przykład:</em>
            </div>
            <div class="custom-script-citation-format-examples">
                ${formatExamples}
            </div>
        <div>
        <em class="custom-script-citeas-reference">Cytowania na podstawie URL za pomocą serwisu <a href="https://citeas.org/" target="_blank">CiteAs</a></em>
        </div>
        </form>
    `
    const modalStyle = `
    .custom-script-modal-settings-container {position: fixed;top: 0;left: 0;width: 100vw;height: 100vh;background: #33333399; z-index: 1000}
    .custom-script-modal-settings {font-family: sans-serif;font-size: 16px;margin: auto;width: 80%;
    height: 75%;background: #fff;margin-top: 8%;border-radius: 10px;padding: 15px}
    .custom-script-modal-settings h1 {font-family: inherit} .custom-script-setting {margin-top: 1em}
    .custom-script-citeas-reference {float: right;font-size: 0.8em}
    .custom-script-hidden {display: none}  .custom-script-x {float: right}
    .custom-script-citation-format-examples {overflow: hidden;margin-bottom: 0.5em}
    #custom-script-citation-format {margin-bottom: 0.5em;width: 100%}
    label.custom-script-citation-format {margin-bottom: 0.2em}
    `
    const modalContainer = `
        <style>${modalStyle}</style>
        <div class="custom-script-modal-settings-container custom-script-hidden">
            <div class="custom-script-modal-settings">
                <a href="#" class="custom-script-x" onclick="this.parentElement.parentElement.classList.add('custom-script-hidden');return false">❌</a>
                ${settingsForm}
            </div>
        </div>
        `

    const currentURL = unsafeWindow.location.href

    function useProxy(url) {
        let newURL = URL_PREFIX + encodeURIComponent(url)
        unsafeWindow.location.href = newURL
    }
    function saveURLAndUseProxy(url) {
        GM_saveTab({
            originalURL: url
        })
        useProxy(url)
    }
    function getCiteAsMetadata(callback) {
        GM_getTab( tabObject => {
            getCiteAsMetadataFromTabAsync(tabObject).then(callback)
        })
    }
    function request(options) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                ...options,
                onload: ({ response }) => resolve(response),
                onerror: reject
            })
        })
    }
    function onlyUnique(value, index, self) {
      return self.indexOf(value) === index;
    }
    async function getCiteAsMetadataFromTabAsync(tabObject) {
        if (!tabObject) return
        let { originalURL } = tabObject
        let encodedURL = btoa(originalURL)
        if (tabObject[encodedURL]) return (tabObject[encodedURL].citeAsData)
        let response = await request({
            method: 'GET',
            url: CITEAS_ENDPOINT + encodeURIComponent(originalURL),
            responseType: "json"
        })
        tabObject[encodedURL] = { citeAsData: response }
        GM_saveTab(tabObject)
        console.log({ originalURL, response })
        return response
    }
    function addCitationOptions() {
        function getProperCitation(citations) {
            return citations.find(citation => citation.style_shortname === citationFormatChosen).citation
        }
        GM_registerMenuCommand("Kopiuj jako cytowanie", () => {
            getCiteAsMetadata( ({ citations }) => {
                let citation = getProperCitation(citations)
                GM_setClipboard(citation, "html")
                alert(`Skopiowano "${citation}"`)
            } )
        }, 'c')
        GM_registerMenuCommand("Cytuj wszystkie otwarte karty", () => {
            GM_getTabs( tabsObject => {
                let tabs = Object.values(tabsObject)
                console.log(tabs)
                let promises = tabs.map(getCiteAsMetadataFromTabAsync)
                Promise.all(promises).then(tabCitations => {
                    console.log({tabCitations})
                    let citations = tabCitations.map(cit => `<li>${getProperCitation(cit.citations)}</li>`)
                    let citationsHTML = `<ol>${citations.join('')}</ol>`
                    GM_setClipboard(citationsHTML, "html")
                    alert(`Skopiowano "${citationsHTML.replace(/(<([^>]+)>)/gi, "")}"`)
                })
            })

        })
        GM_registerMenuCommand("Eksportuj cytowanie jako CSV", () => {
            getCiteAsMetadata( ({ exports, name }) => {
                let csv = exports[0].export
                GM_download({
                    name: name + '.csv', saveAs: true,
                    url: "data:text/csv," + encodeURIComponent(csv)
                })
            } )
        }, 'e')
    }
    function openSettings(settingsContainer) {
        settingsContainer.querySelector('.custom-script-modal-settings-container')
            .classList.remove('custom-script-hidden')
    }
    function setupSettings() {
        let settingsContainer = GM_addElement(unsafeWindow.document.body, 'div', {
          textContent:  ''
        })
        settingsContainer.innerHTML = modalContainer
        unsafeWindow.document.body.append(settingsContainer)
        let citationFormatChooser = settingsContainer.querySelector('#custom-script-citation-format')
        let citationFormatExamples = settingsContainer.querySelectorAll('.custom-script-citation-format-example')
        citationFormatChooser.value = citationFormatChosen
        function showProperCitationExample() {
            citationFormatChosen = citationFormatChooser.value
            console.log({ citationFormatChosen })
            GM_setValue("citationFormat", citationFormatChosen)
            citationFormatExamples.forEach(example => {
                if (example.dataset.citationFormat === citationFormatChosen) example.classList.remove('custom-script-hidden')
                else example.classList.add('custom-script-hidden')
            })
        }
        citationFormatChooser.addEventListener('change', showProperCitationExample)
        showProperCitationExample()

        let autoloadProxyCheckbox = settingsContainer.querySelector('#custom-script-autoload-proxy')
        autoloadProxyCheckbox.addEventListener('change', () => {
            autoloadProxy = autoloadProxyCheckbox.checked
            GM_setValue('autoloadProxy', autoloadProxy)
        })
        GM_registerMenuCommand(
            "Ustawienia",
            () => openSettings(settingsContainer),
            's'
        )
    }

    if (currentURL.includes('https://doi.org/')) {
        if (unsafeWindow.confirm("Otworzyć używając SSL WUM?")) saveURLAndUseProxy(currentURL)
    } else if (currentURL.includes('wum.edu.pl')) {
        GM_getTab( tabObject => {
            if (!tabObject) return
            let { originalURL } = tabObject
            if (!originalURL) return
            if (currentURL === "https://ssl.wum.edu.pl/dana/home/index.cgi") useProxy(originalURL)
            else if (currentURL.includes("https://ssl.wum.edu.pl/dana-na/auth/url_default/welcome.cgi?p=logout")) {
                GM_saveTab({
                    originalURL: null
                })
                unsafeWindow.location.href = originalURL
            } else {
                GM_registerMenuCommand("Wróć do oryginalnego adresu", () => {
                    GM_saveTab({
                        originalURL: null,
                        dontUseAutoProxy: true
                    })
                    unsafeWindow.location.href = originalURL
                }, 'o')
                addCitationOptions()
                GM_registerMenuCommand("Kopiuj oryginalny adres", () => {
                    GM_setClipboard(originalURL, "text")
                }, 'a')
                GM_registerMenuCommand("Wyloguj z SSL WUM", () => {
                    unsafeWindow.location.href = LOGOUT_URL
                }, 'l')
                setupSettings()
            }
        } )
    } else {
        GM_getTab( tabObject => {
            if (!tabObject) tabObject = {}
            tabObject.originalURL = currentURL
            GM_saveTab(tabObject)
            if (autoloadProxy && !tabObject.dontUseAutoProxy) saveURLAndUseProxy(currentURL)
            else {
                GM_registerMenuCommand(
                    "Otwórz przez SSL WUM",
                    () => saveURLAndUseProxy(currentURL),
                    'w'
                )
                addCitationOptions()
                setupSettings()
            }
        })
    }
})();
