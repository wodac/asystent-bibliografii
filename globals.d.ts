
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

declare let unsafeWindow: Window
declare let GM_getValue: (name: string) => any
declare let GM_registerMenuCommand: (description: string, callback?: function, key?: string) => any
declare let GM_unregisterMenuCommand: (commandHandle: any) => any
declare let GM_saveTab: (tabObject: any) => any
declare let GM_getTab: ( callback: (tab: any) => any ) => any
declare let GM_getTabs: ( callback: (tabs: any[]) => any ) => any
declare let GM_setValue: (name: string, value: any) => any
declare let GM_setClipboard: (text: string, type: string) => any
declare let GM_xmlhttpRequest: (options: any) => any
declare let GM_addElement: (parent: HTMLElement, tag: string, attributes: object) => any
declare let GM_download: (options: { url: string, name: string, saveAs: boolean }) => any