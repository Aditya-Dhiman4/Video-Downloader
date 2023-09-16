const puppeteer = require('puppeteer');
const vidDownloader = require('./vidDownloader.js');
const autoFunctions = require('./automationFunctions.js');
const { type } = require('os');
require('dotenv').config();

const language = 'Premium';
let episodeInfo = [];
const playlistName = 'Exploring Mental Health Struggles: ';

const urls = [
    'https://www.youtube.com/watch?v=YJJo7tp-FyQ&list=PLD4cyJhQaFwUp6ZMgiyP2zvIGS24WmdMv&index=10&pp=iAQB',
    'https://www.youtube.com/watch?v=nG1VpuLFAjA&list=PLD4cyJhQaFwUp6ZMgiyP2zvIGS24WmdMv&index=11&pp=iAQB',
    'https://www.youtube.com/watch?v=Z69pA6x2gQQ&list=PLD4cyJhQaFwUp6ZMgiyP2zvIGS24WmdMv&index=29&pp=iAQB',
    'https://www.youtube.com/watch?v=9B-wTp2PZH8&list=PLD4cyJhQaFwUp6ZMgiyP2zvIGS24WmdMv&index=45&pp=iAQB',
    'https://www.youtube.com/watch?v=u6_cqxAYp1M&list=PLD4cyJhQaFwUp6ZMgiyP2zvIGS24WmdMv&index=50&pp=iAQB',
    'https://www.youtube.com/watch?v=GikjZQmeTFY&list=PLD4cyJhQaFwUp6ZMgiyP2zvIGS24WmdMv&index=62&pp=iAQB',
    'https://www.youtube.com/watch?v=Cu6kt3Yjii8&list=PLD4cyJhQaFwUp6ZMgiyP2zvIGS24WmdMv&index=91&pp=iAQB'
];

const vd = new vidDownloader(language, `C:/Users/User/OneDrive/Psych2go/Premium/`, urls);
// const autoFunctions = new autoFunctions();

async function executeProgram() {
    for (let count = 1; count <= urls.length; count++) {
        let url = urls[count-1];
        url = url.substring(0, 43)
        const vidInfo = await vd.getVidInfo(url);
    
        episodeInfo[count-1] = vidInfo;
        episodeInfo[count-1][1] = episodeInfo[count-1][1].replace(/\s+/g, ' ').trim();
        const thumbnailUrl = vidInfo[2];
        // const date = obtainDate(count, startDay);
    
        await vd.downloadVideo(url, count);
        await vd.downloadAudio(url, count);
        await vd.downloadThumbnail(thumbnailUrl, count);
        await vd.editThumbnail(count);
        console.log(`Downloaded: Video ${count}`);
    }
    const {browser, page} = await startBrowser();
    await login(browser, page, user, password);
    await uploadVideoAndThumbnail(browser, page, episodeInfo, playlistName);
}

executeProgram();

const user = process.env.SS_USER_PREM;
const password = process.env.SS_PASSWORD_PREM;
const count = 1;

async function startBrowser() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    return {browser, page}
}

function waitForTimeout(timeout) {
    return new Promise(resolve => setTimeout(resolve, timeout));
}

async function login(browser, page, email, password) {
    page.setViewport({width: 1300, height: 1300});

    await page.goto('https://app.supercast.com/session/new');

    const enterEmail = await page.waitForXPath('//*[@id="user_email"]');
    await enterEmail.type(email);

    const logInWithPassword = await page.$x('//*[@id="container"]/main/div/form/div[3]/input');
    await logInWithPassword[0].click();

    const enterPassword = await page.waitForXPath('//*[@id="user_password"]');
    await enterPassword.type(password);

    const confirmLogin = await page.$x('//*[@id="container"]/main/div/form/div[3]/input');
    await confirmLogin[0].click();
}

async function fileUploader(page, fileButtonSelector, fileInputSelector, filePath) {
    
    await page.bringToFront();

    const fileButton = await page.waitForSelector(fileButtonSelector);
    await fileButton.click();
    
    const file = await page.$(fileInputSelector);
    console.log('Attempting to upload file');

    await file.uploadFile(filePath); // uploading audio
    console.log('Done');
}

function obtainDate(count, startDay) {
    let date = new Date();

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + count + startDay);
    fullDate = String(nextDay);

    let weekDay = fullDate.slice(0,3);
    let day = fullDate.slice(8,10);
    let month = fullDate.slice(4,7);
    let year = fullDate.slice(11,15);

    for (let i = 0; i < monthNames.length; i++) {
            let monthName = monthNames[i].slice(0,3);
            if (month == monthName) {month = monthNames[i];}
    }

    for (let i = 0; i < dayNames.length; i++) {
            let dayName = dayNames[i].slice(0,3);
            if (weekDay == dayName) {weekDay = dayNames[i];}
    }
    return [weekDay, day, month, year];
}

async function uploadVideoAndThumbnail(browser, page, episodeInfo, playlistName) {
    const goToPodcast = await page.waitForSelector('.link');
    await goToPodcast.click();
    const episodes = await page.waitForXPath('//*[@id="sb-nav-items"]/ul/ul/li[4]/a');

    let tabs = [];
    for (let i = 0; i < urls.length; i++) {
        tabs[i] = await browser.newPage();
        tabs[i].setViewport({width: 1300, height: 1300});
    };

    for (let i = 0; i < tabs.length; i++) {
        tabs[i].goto("https://psych2go.supercast.com/dashboard/channels/episodes/new");
    };

    for (let i = 0; i < tabs.length; i++) {
        await fileUploader(
            tabs[i],
            'button.uppy-u-reset.uppy-c-btn.uppy-DashboardTab-btn',  
            'input[type="file"][accept="audio/aac,audio/flac,audio/m4a,audio/mp3,audio/mp4,audio/mpeg,audio/ogg,audio/x-m4a,audio/x-ms-wma"]', 
            `C:/Users/User/OneDrive/Psych2go/Premium/Psych2go Premium Audio ${i+1}.mp3`
        );
    };

    for (let i = 0; i < tabs.length; i++) {
        await fileUploader(
            tabs[i],
            'button.uppy-u-reset.uppy-c-btn.uppy-DashboardTab-btn',  
            'input[type="file"][class="uppy-Dashboard-input"]', 
            `C:/Users/User/OneDrive/Psych2go/Premium/Psych2go Premium Video ${i+1}.mp4`
        );
    };

    for (let i = 0; i < tabs.length; i++) {
        console.log('Thumbnail')
        
        await tabs[i].bringToFront();
        const uploadThumbnail = await tabs[i].waitForXPath('//*[@id="new_episode"]/div[2]/div[1]/div[1]/label');
        await uploadThumbnail.click();
        
        const thumbnailFile = await tabs[i].$('input[type="file"][name="episode[image]"]');
        console.log('Attempting to upload file');

        await thumbnailFile.uploadFile(`C:/Users/User/OneDrive/Psych2go/Premium/Premium Video Thumbnail ${i+1} Edited.jpg`); // uploading audio
        console.log('Done');
    };

    for (let i = 0; i < tabs.length; i++) {
        await tabs[i].bringToFront();
        await tabs[i].type('#episode_title', playlistName+episodeInfo[i][0]);
        await tabs[i].type('#episode_description', episodeInfo[i][1]);
    };
    
    for (let i = 0; i < tabs.length; i++) {
        await waitForTimeout(3000);
        await tabs[i].bringToFront();

        console.log('Publishing');
        const publishEpisode = await tabs[i].waitForXPath('//*[@id="episode_submit"]');
        await publishEpisode.click();
        console.log('Publishing Episode');
    };

    for (let i = 0; i < tabs.length; i++) {
        await tabs[i].bringToFront();

        const scheduleEpisode = await tabs[i].waitForSelector('input[id="specific_date"]');
        await scheduleEpisode.click();

        let date = obtainDate(i, 0);

        await tabs[i].type('input[class="string optional sc-input datetime"]', `${date[3]}-${date[2]}-${date[1]} 12:00:00`);

        const emailSubs = await tabs[i].$('#episode_should_be_emailed');
        await emailSubs.click();

        const announceDiscord = await tabs[i].$('#episode_announce_on_discord');
        await announceDiscord.click();

        const publish = await tabs[i].$('input[name="commit"][value="Publish Episode"]');
        await publish.click();
    };
}