const anchorSpotify = require('./anchor.js');
const vidDownloader = require('./vidDownloader.js');
const autoFunctions = require('./automationFunctions.js');
require('dotenv').config();

async function uploadEpisode(tabs, language, time, adTime, promo, startDay) {
    // await page.waitForTimeout(2000);
    for (let count = 0; count < urls.length; count++) {
        await anchor.uploadVideo(tabs, language, count);
    };
    for (let count = 0; count < urls.length; count++) {
        await anchor.uploadThumbnail(tabs, language, count) ; 
    };
    for (let count = 0; count < urls.length; count++) {
        await anchor.enterVidInfo(tabs, episodeInfo, promo, count);  
    };
    for (let count = 0; count < urls.length; count++) {
        const date = autoFunct.obtainDate((count-1), startDay);
        await anchor.uploadTime(tabs, time, date, count);
    };
    for (let count = 0; count < urls.length; count++) {
        await tabs[count].bringToFront();
        await autoFunct.nextPage(tabs[count], 1000);
    };
    for (let count = 0; count < urls.length; count++) {
        await anchor.placeAdsOne(tabs, adTime, count);
    };
    for (let count = 0; count < urls.length; count++) {
        await anchor.placeAdsTwo(tabs, count);
    };
    for (let count = 0; count < urls.length; count++) {
        await anchor.confirmEpisode(tabs, count);  
    };
}

// async function executeProgram() {
//     const {browser, page} = await autoFunct.startBrowser();
    
//     await anchor.login(page, user, password);
//     await anchor.createNewTab(browser);

//     for (let count = 1; count <= urls.length; count++) {
//         const url = urls[count-1];
//         const vidInfo = await vd.getVidInfo(url);

//         episodeInfo[count-1] = vidInfo;
    
//         const thumbnailUrl = vidInfo[2];
    
//         await vd.downloadVideo(url, count);
//         await vd.downloadThumbnail(thumbnailUrl, count);
//         await vd.editThumbnail(count);
//         console.log(`Downloaded: Video ${count}`);
//     }
//     const time = ['12', '00', 'PM'];
//     const adTime = '000100000';
//     let startDay = 2;
//     const premiumPromo = 'Enjoying our content and want to support us directly? Join our premium subscription for access to our podcasts, bonus content, merch discounts and more! Visit: www.psych2go.supercast.com\n';

//     await uploadEpisode(tabs, language, time, adTime, premiumPromo, startDay);
// }

// executeProgram();

const language = 'English';
const urls = [
    'https://www.youtube.com/watch?v=QdQZe_0Dn2o',
    'https://www.youtube.com/watch?v=pLKVdpwPXn0',
    'https://www.youtube.com/watch?v=8pT6LQ-mZ3k',
    'https://www.youtube.com/watch?v=u4EAAmMF59U',
    'https://www.youtube.com/watch?v=FWkk2BkLQdk',
    'https://www.youtube.com/watch?v=9HiaVFKiHNA'
];

async function executeProgram() {
    const language = 'Spanish';
    const urls = [
        'https://www.youtube.com/watch?v=sooinfUfKmI',
        'https://www.youtube.com/watch?v=sfr-3PUVMZM'
    ];
    let tabs = [];
    let episodeInfo = [];
    let filePath = process.env.FILE_PATH;
    const autoFunct = new autoFunctions();

    if (language == 'English') {
        const user = process.env.A_USER_ENG;
        const password = process.env.A_PASSWORD_ENG;
        let path = `${filePath}${language}/`;
        const anchor = new anchorSpotify(user, password, language, path, urls, tabs);
        await downloadAndUploadtoSpotify(anchor, user, password);
    }

    else if (language == 'Spanish') {
        let tabs = [];
        const user = process.env.A_USER_SPAN;
        const password = process.env.A_PASSWORD_SPAN;
        let path = `${filePath}${language}/`;
        const anchor = new anchorSpotify(user, password, language, path, urls, tabs);
        await downloadAndUploadtoSpotify(anchor, autoFunct, user, password);
    }
}

async function downloadAndUploadtoSpotify(anchor, autoFunct, user, password) {
    const {browser, page} = await autoFunct.startBrowser();

    await anchor.login(page, user, password);
    await anchor.createNewTab(browser);

    for (let count = 1; count <= urls.length; count++) {
        const url = urls[count-1];
        const vidInfo = await vd.getVidInfo(url);

        episodeInfo[count-1] = vidInfo;
    
        const thumbnailUrl = vidInfo[2];
    
        await vd.downloadVideo(url, count);
        await vd.downloadThumbnail(thumbnailUrl, count);
        await vd.editThumbnail(count);
        console.log(`Downloaded: Video ${count}`);
    }
}

executeProgram();