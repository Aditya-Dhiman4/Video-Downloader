const ytdl = require('youtube-dl-exec');
const axios = require('axios');
const fs = require('fs');
const sharp = require('sharp');
const fsp = require('fs/promises');
const Canvas = require('canvas');
const jimp = require('jimp');
const { resolve } = require('path');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class VideoDownloader {
    
    constructor(language, path) {
        this.language = language;
        this.path = path;
    }

    async getVidInfo(url) {
        try {
            const options = {
                dumpSingleJson: true,
                skipDownload: true
            };

            console.log("Obtaining Video Info...");

            return await ytdl(url, options);
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
            const imagePath = this.path + `${this.language} Video Thumbnail ${count}.jpeg`;

            console.log('Downloading Thumbnail...');

            const info = await this.getVidInfo(url);

            const response = await axios({method: 'GET', url: info.thumbnail, responseType: 'stream'});

            response.data.pipe(fs.createWriteStream(imagePath));

            return new Promise((resolve, reject) => {
                response.data.on('end', () => {resolve()}) 
                response.data.on('error', () => {reject(error)})           
            });

        } catch (error) {console.error('Error while downloading thumbnail: ', error);}
    }

    async editThumbnail(count) {
        const imagePath = this.path + `${this.language} Video Thumbnail ${count}.jpeg`;
        const editedImagePath = this.path + `${this.language} Video Thumbnail ${count} Edited.jpeg`;
        const width = 1000;
        const height = 1000;

        try {
            await sharp(imagePath)
                .resize(width, height, {fit: 'fill'})
                .toFile(editedImagePath);
    
            console.log(`Image resized and saved to ${editedImagePath}`);
        } catch (error) {
            console.error('Error resizing image:', error);
        }
    }

    async deleteVideo(count) {
        const filePath = this.path + `Psych2go ${this.language} Video ${count}.mp4`;
        console.log("Deleting Video...");
    
        try {
            await fsp.unlink(filePath);
            console.log("Video Deleted!");
        } catch (err) {
            console.error('Error deleting video:', err);
        }
    }

    async deleteAudio(count) {
        const filePath = this.path + `Psych2go ${this.language} Audio ${count}.mp4`;
        console.log("Deleting Audio...");
    
        try {
            await fsp.unlink(filePath);
            console.log("Audio Deleted!");
        } catch (err) {
            console.error('Error deleting audio:', err);
        }
    }

    async deleteThumbnail(count) {
        const filePath = this.path + `${this.language} Video Thumbnail ${count}.jpeg`;
        console.log("Deleting Thumbnail...");
    
        try {
            await fsp.unlink(filePath);
            console.log("Thumbnail Deleted!");
        } catch (err) {
            console.error('Final attempt failed. Error deleting Thumbnail:', err);
        }
    }

    async deleteEditedThumbnail(count) {
        const editedImagePath = this.path + `${this.language} Video Thumbnail ${count} Edited.jpeg`;
        console.log("Deleting Edited Thumbnail...");
        fs
        try {
            await fsp.unlink(editedImagePath);
            console.log("Edited Thumbnail Deleted!");
        } catch (err) {
            console.error('Error deleting Edited Thumbnail:', err);
        }
    }
}

module.exports = VideoDownloader;