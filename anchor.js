const puppeteer = require('puppeteer');
const Utils = require('./utils.js');
require('dotenv').config();

const utils = new Utils();

class anchorSpotify {

    constructor(user, password, language, path, urls, tabs, episodeInfo) {
        this.user = user;
        this.password = password;
        this.language = language;
        this.path = path;
        this.urls = urls;
        this.tabs = tabs;
        this.episodeInfo = episodeInfo;
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
        page.setViewport({width: 1250, height: 1225});

        await page.goto('https://podcasters.spotify.com/pod/login');

        console.log("Executing Program...")

        // const annoyingBanner = await page.waitForXPath('//*[@id="onetrust-close-btn-container"]/button');
        const annoyingBanner = await page.waitForSelector('button[class="onetrust-close-btn-handler onetrust-close-btn-ui banner-close-button ot-close-icon"]');

        await annoyingBanner.evaluate(b => b.click());
        console.log("Closed Banner");

        const emailLogin = await page.waitForXPath('//*[@id="app-content"]/div/div[2]/div[2]/button');
        await page.waitForTimeout(1000);
        
        await emailLogin.evaluate(b => b.click());    //button[data-encore-id="buttonSecondary"][class="Button-sc-y0gtbx-0 kCUxRI"]
        console.log("Selected Email Login");

        const inputEmail = await page.waitForXPath('//*[@id="email"]');
        await inputEmail.type(this.user);
        console.log("Entered Email");

        await page.type('#password', this.password);
        await page.click('button[type="submit"]');
        console.log("Entered Password");

        await page.waitForNavigation();
    }

    async createNewTab(browser) {
        for (let count = 0; count < this.urls.length; count++) {
            this.tabs[count] = await browser.newPage();
            console.log('Created New Tab!');
            this.tabs[count].setViewport({width: 1300, height: 1250});
            this.tabs[count].goto('https://podcasters.spotify.com/pod/dashboard/episode/wizard');
        };
    }

    async uploadVideo(tabs, count) {
        try {
            await tabs[count].bringToFront();

            const selectFile = await tabs[count].waitForXPath('//*[@id="app-content"]/div/div/div/div/div/div/div/div[2]/div/div/button');
            await selectFile.evaluate(b => b.click());
            console.log('Clicked: quickUpload');

            const vidFile = await tabs[count].$('input[type=file]');
            await vidFile.uploadFile(this.path + `Psych2go ${this.language} Video ${count+1}.mp4`);
            console.log('Uploaded: vidFile');
        } catch (error) {console.error('Error while pressing button: ', error);}
    }
    
    async uploadThumbnail(tabs, count) {
        try {
            await tabs[count].bringToFront();

            const additionalDetails = await tabs[count].waitForXPath('//*[@id="details-form"]/div[2]/div[1]/span/button');
            await additionalDetails.evaluate(b => b.click());

            const thumbnailUpload = tabs[count].waitForXPath('//*[@id="details-form"]/div[2]/div[1]/div[4]/div[2]/div/button');
            if (thumbnailUpload.length > 0) {await thumbnailUpload[0].evaluate(b => b.click());}
            console.log('Clicked: thumbnailUpload');

            const thumbnailFile = await tabs[count].$('input[type=file]');
            await thumbnailFile.uploadFile(this.path + `${this.language} Video Thumbnail ${count+1} Edited.jpeg`);
            console.log('Uploaded: thumbnailFile');

            const confirmThumbnail = await tabs[count].$x('/html/body/reach-portal/div[2]/div/div/div/div[2]/div/div[2]/button[2]')
            if (confirmThumbnail.length > 0) {await confirmThumbnail[0].evaluate(b => b.click());}
            console.log('Clicked: confirmThumbnail');

        } catch (error) {console.error('Error while pressing button: ', error);}
    }

    async enterVidInfo(tabs, promo, count) {
        
        if (count == 0) {await tabs[count].waitForTimeout(7000);};

        await tabs[count].bringToFront();

        let title = this.episodeInfo[count].fulltitle;
        console.log(title);
        let description = this.episodeInfo[count].description.substring(0, 3999);
        
        const titleButton = await tabs[count].$('input[name="title"][id="title-input"]');
        await titleButton.type(title);
        console.log('Uploaded: title');

        const descriptionButton = await tabs[count].$('[role="textbox"]');
        await descriptionButton.type(promo + description);
        console.log('Uploaded: description');

        const noExplicitContent = await tabs[count].$('label[for="no-explicit-content"]');
        await noExplicitContent.evaluate(b => b.click());
        console.log('Clicked: noExplicitContent');

        await tabs[count].waitForTimeout(1000);
    }

    async uploadTime(tabs, time, date, count) {
        await tabs[count].bringToFront();

        const schedule = await tabs[count].$x('//*[@id="details-form"]/div[2]/div[1]/fieldset[1]/div[2]/label');
        await schedule[0].evaluate(b => b.click());
        console.log('Clicked: schedule');

        const dateButton = await tabs[count].$('#date');
        await dateButton.evaluate(b => b.click());
        console.log('Clicked: dateButton');
        
        try {
            const changeDay = await tabs[count].waitForSelector(`td[aria-disabled="false"][aria-label="${date[0]}, ${date[2]} ${date[1]}, ${date[3]}"]`, {timeout: 2000});
            await changeDay.evaluate(b => b.click());
            console.log('Clicked: changeDay');
        }
        catch {
            const changeDay = await tabs[count].waitForSelector(`td[aria-disabled="false"][aria-label="Selected. ${date[0]}, ${date[2]} ${date[1]}, ${date[3]}"]`, {timeout: 2000});
            await changeDay.evaluate(b => b.click());
            console.log('Clicked: changeDay');
        }

        await tabs[count].type('input[class="sc-dGCmGc iVqeMt"]', time[0]);
        console.log('Uploaded: hour');

        await tabs[count].type('input[class="sc-fAGzit cgdwkX"]', time[1]);
        console.log('Uploaded: minute');

        await tabs[count].select('select[data-testid="meridiem-picker"]', time[2]);
        console.log('Uploaded: meridian');

        await utils.nextPage(tabs[count], 500);
    }

    async placeAds(tabs, time, count) {
        await tabs[count].bringToFront();
        const duration = this.episodeInfo[count].duration;
        let amount = duration >= 390 ? 2 : 1;

        for (let i = 0; i < amount; i++) {
            await tabs[count].waitForTimeout(1000);

            if (i > 0) {
                const goToAds = await tabs[count].waitForXPath('//*[@id="monetize-form"]/div/div/div[3]/div/div[2]/button[2]');
                await goToAds.evaluate(b => b.click()); 
                console.log('Clicked: goToAds');
            } else {
                const goToAds = await tabs[count].waitForXPath('//*[@id="monetize-form"]/div/div/div[3]/div/div[2]/button[1]');
                await goToAds.evaluate(b => b.click());
                console.log('Clicked: goToAds');
            }

            const adTimestamp = await tabs[count].waitForXPath('//*[@id="cue-points-timestamp"]');
            await adTimestamp.focus();
            console.log('Clicked: adTimeStamp');

            for (let i = 0; i < 9; i++) {
                await tabs[count].keyboard.press('Backspace');
            }

            tabs[count].waitForTimeout(10000);
            await adTimestamp.type(time[i]);
            console.log('Uploaded: adTimeStamp');

            // await tabs[count].bringToFront();
            // await tabs[count].waitForTimeout(1500);

            await tabs[count].select('select[aria-describedby="cue-points-count-description"][id="cue-points-count"]', '1');
            console.log('Uploaded: adAmount');

            const insertAdBreak = await tabs[count].$x('//*[@id="monetize-form"]/div/div/div[4]/div/div[2]/div/div[2]/div[1]/div/div[1]/button');
            await insertAdBreak[0].evaluate(b => b.click());

            const exitAds = await tabs[count].waitForSelector('button[type="button"][data-encore-id="buttonPrimary"][class="Button-sc-qlcn5g-0 dRlmYr"');

            await exitAds.evaluate(b => b.click());
            // await utils.selectButton(tabs[count], 'button[type="button"][data-encore-id="buttonPrimary"].Button-sc-qlcn5g-0.gTCbAu');
            console.log('Clicked: exitAds');
        }
    }

    // async placeAdsTwo(tabs, count) {
        // await tabs[count].bringToFront();
        // await tabs[count].waitForTimeout(1500);

        // await tabs[count].select('select[aria-describedby="cue-points-count-description"][id="cue-points-count"]', '1');
        // console.log('Uploaded: adAmount');

        // const insertAdBreak = await tabs[count].$x('//*[@id="monetize-form"]/div/div/div[4]/div/div[2]/div/div[2]/div[1]/div/div[1]/button');
        // await insertAdBreak[0].evaluate(b => b.click());

        // const exitAds = await tabs[count].waitForSelector('button[type="button"][data-encore-id="buttonPrimary"][class="Button-sc-qlcn5g-0 dRlmYr"');

        // await exitAds.evaluate(b => b.click());
        // // await utils.selectButton(tabs[count], 'button[type="button"][data-encore-id="buttonPrimary"].Button-sc-qlcn5g-0.gTCbAu');
        // console.log('Clicked: exitAds');

        // await utils.nextPage(tabs[count], 1000);

        // await utils.nextPage(tabs[count], 2000);
        // await utils.nextPage(tabs[count], 1000);
    // }

    async confirmEpisode(tabs, count) {
        await tabs[count].bringToFront();

        // const closePopUp = await tabs[count].waitForSelector('button[aria-label="Close modal"][data-encore-id="buttonTertiary"][class="Button-sc-1dqy6lx-0 eDodKk"]');
        const closePopUp = await tabs[count].waitForXPath('/html/body/reach-portal/div[2]/div/div/div/div[1]/button');
        await closePopUp.evaluate(b => b.click());
        console.log('Closed Pop-Up');
    }
}

module.exports = anchorSpotify;