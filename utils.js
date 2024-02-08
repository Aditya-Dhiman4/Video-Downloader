const puppeteer = require('puppeteer');

class Utils {
    
    obtainDate(count, startDay) {
        let date = new Date();
    
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + count + startDay);
        let fullDate = String(nextDay);
    
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
    
        if (day[0] == '0') {day = day[1];}
    
        return [weekDay, day, month, year];
    }

    secondsToTime(seconds) {
        let remainingSeconds = seconds % 60;
        let minute = "0" + (seconds - remainingSeconds) / 60;

        return "00" + minute.substring(0, 2) + String(remainingSeconds * 1000000).substring(0, 5);
    }

    // async selectButton(page, selector) {
    //     await page.evaluate((selector) => {
    //         const button = document.querySelector(selector);
    //         if (button) {
    //           button.click();
    //         }
    //     }, selector);
    // }

    async selectButton(page, selector) {
        await page.waitForSelector(selector);
        const element = await page.$(selector);
        await page.evaluate((element) => element.click(), element)
    }
    
    async obtainElementText(page, selector) {
        await page.evaluate((element) => {
            const text = element.textContent;
            return text;  
        }, selector);
    }
    
    async obtainElementTextXPath(page, xpath) {
        const text = await page.evaluate((xpath) => {
            const element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            return element.textContent;
        }, xpath);
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
    
    async nextPage(page, timeout) {
        const next = await page.waitForSelector('button[data-encore-id="buttonPrimary"][class="Button-sc-qlcn5g-0 dRlmYr"]');
        await next.click();
        console.log('Clicked: nextPage');
        await page.waitForTimeout(timeout);
    }

    async fileUploader(page, fileButtonSelector, fileInputSelector, filePath) {
    
        await page.bringToFront();
    
        const fileButton = await page.waitForSelector(fileButtonSelector);
        await fileButton.click();
        
        const file = await page.$(fileInputSelector);
        console.log('Attempting to upload file');
    
        await file.uploadFile(filePath); // uploading audio
        console.log('Done');
    }


};

module.exports = Utils;