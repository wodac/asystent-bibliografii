//@ts-check
const URL_PREFIX = "https://ssl.wum.edu.pl/dana/home/launch.cgi?url="
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
function useProxy(url) {
    let newURL = URL_PREFIX + encodeURIComponent(url)
    unsafeWindow.location.href = newURL
}
function saveURLAndUseProxy(url) {
    GM_saveTab({
        originalURL: url,
        originalTitle: unsafeWindow.document.title
    })
    useProxy(url)
}