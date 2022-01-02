//@ts-check
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
            <input type="checkbox" id="custom-script-autoload-proxy">
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

    /**
     * @type {HTMLInputElement}
     */
    let autoloadProxyCheckbox = settingsContainer.querySelector('#custom-script-autoload-proxy')
    autoloadProxyCheckbox.checked = GM_getValue('autoloadProxy')
    autoloadProxyCheckbox.addEventListener('change', () => {
        let autoloadProxy = autoloadProxyCheckbox.checked
        GM_setValue('autoloadProxy', autoloadProxy)
    })
    GM_registerMenuCommand(
        "⚙️ Ustawienia",
        () => openSettings(settingsContainer),
        's'
    )
}