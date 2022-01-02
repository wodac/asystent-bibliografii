//@ts-check

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
const CITEAS_ENDPOINT = "https://api.citeas.org/product/"
let citationFormatChosen = GM_getValue("citationFormat") || "apa"
GM_addValueChangeListener("citationFormat", (name, oldValue, newValue) => {
    console.log({ name, oldValue, newValue })
    citationFormatChosen = newValue
})

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
function getCiteAsMetadata(callback) {
    GM_getTab( tabObject => {
        getCiteAsMetadataFromTabAsync(tabObject).then(callback)
    })
}
function addCitationOptions() {
    function getProperCitation(citations) {
        return citations.find(citation => citation.style_shortname === citationFormatChosen).citation
    }
    GM_registerMenuCommand("📜 Kopiuj jako cytowanie", () => {
        getCiteAsMetadata( ({ citations }) => {
            let citation = getProperCitation(citations)
            GM_setClipboard(citation, "html")
            alert(`Skopiowano "${citation}"`)
        } )
    }, 'c')
    GM_registerMenuCommand("🗂️ Cytuj wszystkie otwarte karty", () => {
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
    GM_registerMenuCommand("📄 Eksportuj cytowanie jako CSV", () => {
        getCiteAsMetadata( ({ exports, name }) => {
            let csv = exports[0].export
            GM_download({
                name: name + '.csv', saveAs: true,
                url: "data:text/csv," + encodeURIComponent(csv)
            })
        } )
    }, 'e')
}