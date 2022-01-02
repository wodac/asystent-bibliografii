// ==UserScript==
// @ts-check
// @name         Asystent zasobów SSL WUM
// @description  Asystent zasobów SSL WUM
// @namespace    http://tampermonkey.net/
// @version      1.3.3-a
// @updateURL    https://github.com/wodac/asystent-bibliografii/raw/main/asystent.user.js
// @require      https://github.com/wodac/asystent-bibliografii/raw/main/utils.js
// @require      https://github.com/wodac/asystent-bibliografii/raw/main/citations.js
// @require      https://github.com/wodac/asystent-bibliografii/raw/main/settings.js
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
// @grant        GM_addValueChangeListener
// @run-at document-ready
// ==/UserScript==

(function() {
    'use strict';

    const LOGOUT_URL = "https://ssl.wum.edu.pl/dana-na/auth/logout.cgi"

    let autoloadProxy = GM_getValue("autoloadProxy")
    autoloadProxy = typeof autoloadProxy === "undefined" ? false : autoloadProxy
    GM_addValueChangeListener("autoloadProxy", (name, oldValue, newValue) => {
        console.log({ name, oldValue, newValue })
        autoloadProxy = newValue
    })

    const currentURL = unsafeWindow.location.href

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
                GM_registerMenuCommand("↩️ Wróć do oryginalnego adresu", () => {
                    GM_saveTab({
                        originalURL: null,
                        dontUseAutoProxy: true
                    })
                    unsafeWindow.location.href = originalURL
                }, 'o')
                addCitationOptions()
                GM_registerMenuCommand("📋 Kopiuj oryginalny adres", () => {
                    GM_setClipboard(originalURL, "text")
                }, 'a')
                GM_registerMenuCommand("🏃 Wyloguj z SSL WUM", () => {
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
                    "📖 Otwórz przez SSL WUM",
                    () => saveURLAndUseProxy(currentURL),
                    'w'
                )
                addCitationOptions()
                setupSettings()
            }
        })
    }
})();
