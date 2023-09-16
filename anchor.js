const vidDownloader = require('./vidDownloader.js');
const automationFunctions = require('./automationFunctions.js');
const puppeteer = require('puppeteer');
const autoFunctions = require('./automationFunctions.js');
require('dotenv').config();

class anchorSpotify {

    constructor(user, password, language, path, urls, tabs) {
        this.user = user;
        this.password = password;
        this.language = language;
        this.path = path;
        this.urls = urls;
        this.tabs = tabs;
    }

    async startBrowser() {
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        return {browser, page}
    }

    waitForTimeout(timeout) {
        return new Promise(resolve => setTimeout(resolve, timeout));
    }

    async selectSpecificButton(page, selector, buttonText) {
        await page.evaluate((selector, buttonText) => {
            const buttons = document.querySelectorAll(selector);
            if (buttons.length > 0) {
            buttons.forEach((button) => {
                if (button.innerText === buttonText) {button.click();}
            });
            }
        }, selector, buttonText);
    }

    async login(page) {
        page.setViewport({width: 850, height: 800});

        await page.goto('https://podcasters.spotify.com/pod/login');

        const emailLogin = await page.waitForXPath('//*[@id="app-content"]/div/div[3]/div/button[1]');
        await emailLogin.click();    

        const annoyingBanner = await page.waitForXPath('//*[@id="onetrust-close-btn-container"]/button');
        await annoyingBanner.click();

        await page.type('#email', this.user)
        await page.type('#password', this.password);
        await page.click('button[type="submit"]');

        await page.waitForNavigation();
    }

    async createNewTab(browser) {
        for (let count = 0; count < this.urls.length; count++) {
            tabs[count] = await browser.newPage();
            console.log('Created New Tab!');
            tabs[count].setViewport({width: 1300, height: 1300});
            tabs[count].goto('https://podcasters.spotify.com/pod/dashboard/episode/wizard');
        };
    }

    async uploadVideo(tabs, language, count) {
        try {
            await tabs[count].bringToFront();

            const selectFile = await tabs[count].waitForXPath('//*[@id="app-content"]/div/div/div/div/div/div/div[2]/div/div/button');
            await selectFile.click();
            console.log('Clicked: quickUpload');

            const vidFile = await tabs[count].$('input[type=file]');
            await vidFile.uploadFile(`C:/Users/User/OneDrive/Psych2go/${language}/Psych2go ${language} Video ${count+1}.mp4`);
            console.log('Uploaded: vidFile');
        } catch (error) {console.error('Error while pressing button: ', error);}
    }
    
    async uploadThumbnail(tabs, language, count) {
        try {
            await tabs[count].bringToFront();

            const additionalDetails = await tabs[count].waitForXPath('//*[@id="details-form"]/div[2]/div[1]/span/button');
            await additionalDetails.click();

            const thumbnailUpload = tabs[count].waitForXPath('//*[@id="details-form"]/div[2]/div[1]/div[4]/div[2]/div/button');
            if (thumbnailUpload.length > 0) {await thumbnailUpload[0].click();}
            console.log('Clicked: thumbnailUpload');

            const thumbnailFile = await tabs[count].$('input[type=file]');
            await thumbnailFile.uploadFile(`C:/Users/User/OneDrive/Psych2go/${language}/${language} Video Thumbnail ${count+1} Edited.jpg`);
            console.log('Uploaded: thumbnailFile');

            const confirmThumbnail = await tabs[count].$x('/html/body/reach-portal/div[2]/div/div/div/div[2]/div/div[2]/button[2]')
            if (confirmThumbnail.length > 0) {await confirmThumbnail[0].click();}
            console.log('Clicked: confirmThumbnail');

        } catch (error) {console.error('Error while pressing button: ', error);}
    }

    async enterVidInfo(tabs, episodeInfo, promo, count) {
        
        if (count == 0) {await tabs[count].waitForTimeout(7000);};

        await tabs[count].bringToFront();

        let title = episodeInfo[count][0];
        let description = episodeInfo[count][1];
        
        const titleButton = await tabs[count].$('#title-input');
        await titleButton.type(title);
        console.log('Uploaded: title');

        const descriptionButton = await tabs[count].$('[role="textbox"]');
        await descriptionButton.type(promo + description);
        console.log('Uploaded: description');

        const noExplicitContent = await tabs[count].$('label[for="no-explicit-content"]');
        await noExplicitContent.click();
        console.log('Clicked: noExplicitContent');

        await tabs[count].waitForTimeout(1000);
    }

    async uploadTime(tabs, time, date, count) {
        await tabs[count].bringToFront();

        const schedule = await tabs[count].$x('//*[@id="details-form"]/div[2]/div[1]/fieldset[1]/div[2]/label/span[1]');
        await schedule[0].click();
        console.log('Clicked: schedule');

        const dateButton = await tabs[count].$('#date');
        await dateButton.click();
        console.log('Clicked: dateButton');
        
        try {
            const changeDay = await tabs[count].waitForSelector(`td[aria-disabled="false"][aria-label="${date[0]}, ${date[2]} ${date[1]}, ${date[3]}"]`, {timeout: 2000});
            await changeDay.click();
            console.log('Clicked: changeDay');
        }
        catch {
            const changeDay = await tabs[count].waitForSelector(`td[aria-disabled="false"][aria-label="Selected. ${date[0]}, ${date[2]} ${date[1]}, ${date[3]}"]`, {timeout: 2000});
            await changeDay.click();
            console.log('Clicked: changeDay');
        }

        const hour = await tabs[count].$x('//*[@id="time"]/input[1]');
        await hour[0].type(time[0]);
        console.log('Uploaded: hour');

        const minute = await tabs[count].$x('//*[@id="time"]/input[2]');
        await minute[0].type(time[1]);
        console.log('Uploaded: minute');

        await tabs[count].select('select[data-testid="meridiem-picker"]', time[2]);
        console.log('Uploaded: meridian');

        await autoFunct.nextPage(tabs[count], 500);
    }

    async placeAdsOne(tabs, time, count) {
        await tabs[count].bringToFront();

        const goToAds = await tabs[count].waitForSelector('button[type="button"][data-encore-id="buttonSecondary"][class="Button-sc-y0gtbx-0 kCUxRI"]');
        await goToAds.click();
        console.log('Clicked: goToAds');

        const adTimestamp = await tabs[count].waitForXPath('//*[@id="cue-points-timestamp"]');
        await adTimestamp.focus();
        console.log('Clicked: adTimeStamp');

        for (let i = 0; i < 9; i++) {
            await tabs[count].keyboard.press('Backspace');
        }
        await adTimestamp.type(time);
        console.log('Uploaded: adTimeStamp');
    }

    async placeAdsTwo(tabs, count) {
        await tabs[count].bringToFront();
        await tabs[count].waitForTimeout(1500);

        await tabs[count].select('select[aria-describedby="cue-points-count-description"][id="cue-points-count"]', '1');
        console.log('Uploaded: adAmount');

        const insertAdBreak = await tabs[count].$x('//*[@id="monetize-form"]/div/div/div[3]/div/div[2]/div/div[2]/div[1]/div/div[1]/button');
        await insertAdBreak[0].click();

        // const editAd = await tabs[count].$x('//*[@id="monetize-form"]/div/div/div[3]/div/div[2]/div/div[2]/div[2]/div/div/table/tbody/tr/td[5]/span/button[1]');
        // await editAd.click();
        // console.log('Clicked: editAd');

        await autoFunct.selectButton(tabs[count], 'button[type="button"][data-encore-id="buttonPrimary"].Button-sc-qlcn5g-0.gTCbAu');
        console.log('Clicked: exitAds');

        const exitAds = await tabs[count].$x('//*[@id="monetize-form"]/div/div/div[3]/footer/button');
        await exitAds[0].click();

        await autoFunct.nextPage(tabs[count], 2000);
        await autoFunct.nextPage(tabs[count], 1000);
    }

    async confirmEpisode(tabs, count) {
        await tabs[count].bringToFront();

        const closePopUp = await tabs[count].waitForSelector('button[aria-label="Close modal"][data-encore-id="buttonTertiary"][class="Button-sc-1dqy6lx-0 dBvOtE"]');
        await closePopUp.click();
        console.log('Closed Pop-Up');
    }
}

const user = process.env.A_USER_SPAN;
const password = process.env.A_PASSWORD_SPAN;
const language = 'Spanish';
let path = `C:/Users/User/OneDrive/Psych2go/${language}/`;
const urls = [
    'https://www.youtube.com/watch?v=YUx22neznzw',
    'https://www.youtube.com/watch?v=H2ZleSURuRA',
    'https://www.youtube.com/watch?v=OJOqX7WUqEE'
];
let tabs = [];
let episodeInfo = [];

const vd = new vidDownloader(language, path, urls);
const autoFunct = new autoFunctions();
const anchor = new anchorSpotify(user, password, language, path, urls, tabs);

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

async function executeProgram() {
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
    const time = ['12', '00', 'PM'];
    const adTime = '000100000';
    let startDay = 1;
    const premiumPromo = 'Enjoying our content and want to support us directly? Join our premium subscription for access to our podcasts, bonus content, merch discounts and more! Visit: www.psych2go.supercast.com\n\n';

    await uploadEpisode(tabs, language, time, adTime, premiumPromo, startDay);
}

executeProgram();

module.exports = anchorSpotify;