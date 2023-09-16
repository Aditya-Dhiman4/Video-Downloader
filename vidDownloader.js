const ytdl = require('youtube-dl-exec');
const axios = require('axios');
const fs = require('fs');
const sharp = require('sharp');
const { resolve } = require('path');

class vidDownloader {
    
    constructor(language, path, url) {
        this.language = language;
        this.path = path;
        this.url = url;
    }

    async getVidInfo(url) {
        try {
            const options = {
                dumpSingleJson: true,
                skipDownload: true
            };

            console.log("Obtaining Video Info...");

            const vidInfo = await ytdl(url, options);

            const title = vidInfo.title;
            const description = vidInfo.description;
            const thumbnailUrl = vidInfo.thumbnail;

            console.log("Sucessfully Obtained Video Info!");

            return [title, description, thumbnailUrl];
        } catch (error) {console.error('Error while obtaining video information: ', error);};
    }

    async downloadVideo(url, count) {
        const options = {
            format: 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
            output: this.path + `Psych2go ${this.language} Video ${count}.mp4`
        };

        try {
            console.log("Downloading Video...");
            await ytdl(url, options);
            console.log("Video Downloaded!");
        } catch (error) {console.error("Error while downloading Video: ", error);}
    }

    async downloadAudio(url, count) {
        const options = {
            format: 'bestaudio[ext=mp3]/bestaudio/best',
            output: this.path + `Psych2go ${this.language} Audio ${count}.mp3`
        };

        try {
            console.log("Downloading Audio...");
            await ytdl(url, options);
            console.log("Audio Downloaded!");
        } catch (error) {console.error("Error while downloading Audio: ", error);}
    }

    async downloadThumbnail(url, count) {
        try {
            const imagePath = this.path + `${this.language} Video Thumbnail ${count}.jpg`;

            console.log('Downloading Thumbnail...');

            const response = await axios({method: 'GET', url: url, responseType: 'stream'});

            response.data.pipe(fs.createWriteStream(imagePath));

            return new Promise((resolve, reject) => {
                response.data.on('end', () => {resolve()}) 
                response.data.on('error', () => {reject(error)})           
            });

        } catch (error) {console.error('Error while downloading thumbnail: ', error);}
    }

    async editThumbnail(count) {
        const imagePath = this.path + `${this.language} Video Thumbnail ${count}.jpg`;
        const editedImagePath = this.path + `${this.language} Video Thumbnail ${count} Edited.jpg`;
        
        try {
            await sharp(imagePath)
                .resize({
                    width: 1000,
                    height: 1000,
                    fit: sharp.fit.fill
                })
                .toFile(editedImagePath);

        } catch (error) {console.error('Error while editing thumbnail: ', error);}
    }
}

module.exports = vidDownloader;