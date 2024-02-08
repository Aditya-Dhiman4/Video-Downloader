const VideoDownloader = require('./videodownloader.js');
const Utils = require('./utils.js');
const puppeteer = require('puppeteer');
const anchorSpotify = require('./anchor.js');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
require('dotenv').config();

let user = process.env.USER;
let password = process.env.PASSWORD;
const language = process.env.LANGUAGE;
let path = process.env.FILE_PATH + `${language}/`;

// Input YouTube URLS Here: 
const urls = [
    'https://www.youtube.com/watch?v=XVyc4qBn5mQ',
    'https://www.youtube.com/watch?v=UQCzR17HE0w',
    'https://www.youtube.com/watch?v=ujI-ihgEZVU',
    'https://www.youtube.com/watch?v=E35O0nxOUy4'
]

let tabs = [];
let episodeInfo = [];
let promises = [];

const vd = new VideoDownloader(language, path);
const utils = new Utils();
const anchor = new anchorSpotify(user, password, language, path, urls, tabs, episodeInfo);

async function uploadEpisode(tabs, time, adTime, promo, startDay) {
    for (let count = 0; count < urls.length; count++) { 
        await anchor.uploadVideo(tabs, count);
    };
    for (let count = 0; count < urls.length; count++) {
        await anchor.uploadThumbnail(tabs, count) ; 
    };
    for (let count = 0; count < urls.length; count++) {
        await anchor.enterVidInfo(tabs, promo, count);  
    };
    for (let count = 0; count < urls.length; count++) {
        const date = utils.obtainDate(parseInt(process.env.FREQUENCY, 10)*(count), startDay);
        await anchor.uploadTime(tabs, time, date, count);
    };
    for (let count = 0; count < urls.length; count++) {
        await tabs[count].bringToFront();
        await utils.nextPage(tabs[count], 1000);
    };
    for (let count = 0; count < urls.length; count++) {
        await tabs[count].bringToFront();
        await anchor.placeAds(tabs, adTime, count);

        await utils.nextPage(tabs[count], 1000);
        await utils.nextPage(tabs[count], 2000);
        
        console.log("Placed Ad");
    };
    // for (let count = 0; count < urls.length; count++) {
    //     await anchor.placeAdsTwo(tabs, count);
    // };
    // for (let count = 0; count < urls.length; count++) {
    //     await anchor.confirmEpisode(tabs, count);  
    // };
    for (let count = 1; count <= urls.length; count++) {
        await vd.deleteVideo(count);
        await vd.deleteThumbnail(count);
        await vd.deleteEditedThumbnail(count);
    }
}

async function start() {
    const {browser, page} = await utils.startBrowser();
    
    await anchor.login(page);
    await anchor.createNewTab(browser);

    for (let count = 1; count <= urls.length; count++) {
        const url = urls[count-1];
        const vidInfo = await vd.getVidInfo(url);

        episodeInfo[count-1] = vidInfo;
        
        await vd.downloadVideo(url, count);
        await vd.downloadThumbnail(url, count);
        await vd.editThumbnail(count);
        console.log(`Downloaded: Video ${count}`);
    }
    const time = ['12', '00', 'PM'];
    const adTime = ['000011000', '000600000'];
    let startDay = parseInt(process.env.START_DAY, 10);
    // const premiumPromo = 'Enjoying our content and want to support us directly? Join our premium subscription for access to our podcasts, bonus content, merch discounts and more! Visit: www.psych2go.supercast.com\n\n';
    const premiumPromo = ``;

    await uploadEpisode(tabs, language, time, adTime, premiumPromo, startDay);
}

start();