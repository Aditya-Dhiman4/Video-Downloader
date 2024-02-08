const VideoDownloader = require('./videodownloader.js');
const Utils = require("./utils.js");

const language = 'English';
let path = `C:/Users/User/OneDrive/Psych2go/${language}/`;

const vd = new VideoDownloader(language, path);
const utils = new Utils();

const url = 'https://www.youtube.com/watch?v=l1e25pfoxJY';
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function foo() { 
    await vd.downloadVideo(url, 1);
    await vd.downloadThumbnail(url, 1);
    await vd.editThumbnail(1);
}

async function bar1() {
    await vd.deleteVideo(1);
    await vd.deleteThumbnail(1);
    await vd.deleteEditedThumbnail(1);
}

async function bar1() {
    await vd.deleteVideo(1);
    await delay(5000);
    await vd.deleteThumbnail(1);
    await delay(5000);
    await vd.deleteEditedThumbnail(1);
}

async function baz() {
    const info = await vd.getVidInfo(url);
    console.log(info.duration);
}

async function start() {
    // await foo();
    // await bar1();
    baz();
}

start();

// console.log(utils.secondsToTime(224 * 0.80));