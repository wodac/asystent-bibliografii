
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

interface TabObject { 
    originalURL?: string, 
    originalTitle?: string, 
    dontUseAutoProxy?: boolean,
    [key: string]: any
}
type ValueName = 'useURLFinder' | 'citationFormat' | 'autoloadProxy' 
type ValueChangedListener = (name: string, old_value: any, new_value: any, remote: boolean) => any
declare let unsafeWindow: Window
declare let GM_getValue: (name: ValueName, defaultValue?: any) => any
declare let GM_registerMenuCommand: (description: string, callback?: function, key?: string) => any
declare let GM_unregisterMenuCommand: (commandHandle: any) => any
declare let GM_saveTab: (tabObject: TabObject) => any
declare let GM_getTab: ( callback: (tab: TabObject) => any ) => any
declare let GM_getTabs: ( callback: (tabs: TabObject[]) => any ) => any
declare let GM_setValue: (name: ValueName, value: any) => any
declare let GM_setClipboard: (text: string, type: string) => any
declare let GM_xmlhttpRequest: (options: any) => any
declare let GM_addElement: (parent: HTMLElement, tag: string, attributes: object) => any
declare let GM_download: (options: { url: string, name: string, saveAs: boolean }) => any
declare let GM_addValueChangeListener: (name: string, listener: ValueChangedListener) => any