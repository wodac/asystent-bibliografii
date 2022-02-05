// ==UserScript==
// @ts-check
// @name         Asystent zasobów SSL WUM
// @description  Pozwala na używanie proxy SSL VPN WUM w celu korzystania z medycznych baz danych, do których dostęp zapewnia WUM
// @namespace    http://tampermonkey.net/
// @version      1.6.4-a
// @updateURL    https://github.com/wodac/asystent-bibliografii/raw/main/asystent.user.js
// @require      https://github.com/wodac/asystent-bibliografii/raw/main/utils.js
// @require      https://github.com/wodac/asystent-bibliografii/raw/main/citations.js
// @require      https://github.com/wodac/asystent-bibliografii/raw/main/settings.js
// @author       Wojciech Odachowski
// @connect      api.citeas.org
// @match        http*://*.bmj.com/*
// @match        http*://*.wiley.com/*
// @match        http*://*.nature.com/*
// @match        http*://*.libra.ibuk.pl/*
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

(function () {
    'use strict';
    if (unsafeWindow.top != unsafeWindow.self) {
        console.log('in iframe...')
        return
    }

    const WUM_SSL_LOGOUT_URL = "https://ssl.wum.edu.pl/dana-na/auth/logout.cgi"
    const WUM_SSL_LOGGED_OUT_URL = "https://ssl.wum.edu.pl/dana-na/auth/url_default/welcome.cgi?p=logout"
    const WUM_SSL_TIMED_OUT_URL = "https://ssl.wum.edu.pl/dana-na/auth/url_default/welcome.cgi?p=timed-out"
    const WUM_SSL_INDEX_URL = "https://ssl.wum.edu.pl/dana/home/index.cgi"

    const currentURL = unsafeWindow.location.href

    if (currentURL.includes('wum.edu.pl')) sslOpened()
    else originalSiteOpened()

    function originalSiteOpened() {
        console.log('originalSiteOpened')
        GM_getTab(tabObject => {
            if (!tabObject) tabObject = {}
            tabObject.originalURL = currentURL
            tabObject.originalTitle = unsafeWindow.document.title
            GM_saveTab(tabObject)
            if (GM_getValue("autoloadProxy", false) && !tabObject.dontUseAutoProxy)
                saveURLAndUseProxy(currentURL)
            else {
                GM_registerMenuCommand(
                    "📖 Otwórz przez SSL WUM",
                    () => saveURLAndUseProxy(currentURL),
                    'w'
                );
                addCitationOptions();
                setupSettings();
            }
        });
    }

    function sslOpened() {
        console.log('sslOpened')
        unsafeWindow.document.addEventListener('readystatechange', console.log)
        GM_getTab(tabObject => {
            let hasOriginalTitle = false, originalURL = null, originalTitle = null
            if (tabObject) {
                console.log('tabObject present', {tabObject})                
                originalURL = tabObject.originalURL
                originalTitle = tabObject.originalTitle
                if (originalURL) {
                    console.log('originalURL present', {originalURL})    
                    if (currentURL.includes(WUM_SSL_INDEX_URL) || currentURL === WUM_SSL_TIMED_OUT_URL) {
                        console.log('proxy reload')
                        useProxy(originalURL)
                    } else if (currentURL.includes(WUM_SSL_LOGGED_OUT_URL)) {
                        console.log('user logged out')
                        GM_saveTab({
                            originalURL: null,
                            originalTitle: null
                        })
                        unsafeWindow.location.href = originalURL
                    } else {
                        const title = unsafeWindow.document.title;
                        hasOriginalTitle = originalTitle === title
                        console.log(`original title ("${title}"=="${originalTitle}")?:`, hasOriginalTitle)
                        if (!hasOriginalTitle) {
                            originalURL = null
                            originalTitle = null
                            GM_saveTab({ originalURL, originalTitle })
                        }
                    }
                }
            } 
            
            if (!hasOriginalTitle && GM_getValue("useURLFinder", true)) {
                console.log('trying to use url finder...')
                try {
                    originalURL = URLFinder()
                    console.log(`doi found!`, originalURL)
                    originalTitle = unsafeWindow.document.title
                    GM_saveTab({ originalTitle, originalURL })
                    hasOriginalTitle = true
                } catch (err) {
                    console.error(err)
                }
            }

            if (hasOriginalTitle) {
                addProxyOptions(originalURL)
            } else {
                console.error("Couldn't find article :(")
            }

            GM_registerMenuCommand("🏃 Wyloguj z SSL WUM", () => {
                unsafeWindow.location.href = WUM_SSL_LOGOUT_URL;
            }, 'l');
            setupSettings();
        });
    }

    function addProxyOptions(originalURL) {
        GM_registerMenuCommand("↩️ Wróć do oryginalnego adresu", () => {
            GM_saveTab({
                originalURL: null,
                dontUseAutoProxy: true
            });
            unsafeWindow.location.href = originalURL;
        }, 'o');
        addCitationOptions();
        GM_registerMenuCommand("📋 Kopiuj oryginalny adres", () => {
            GM_setClipboard(originalURL, "text");
        }, 'a');
    }
})();

