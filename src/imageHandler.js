const fs = require('fs')
const axios = require("axios");

const noblox = require('noblox.js')

module.exports = {
    async getImage(userId) {
        if (fs.existsSync(`./src/userimages/${userId}.png`)) {
            return (`./src/userimages/${userId}.png`)
        } else {
            noblox.getPlayerThumbnail(userId, '150x150', 'png', false, 'headshot').then((data) => {
                // GET request for remote image in node.js
                axios({
                    method: "get",
                    url: `${data[0].imageUrl}.png`,
                    responseType: "stream"
                }).then(function (response) {
                    response.data.pipe(fs.createWriteStream(`./src/userimages/${userId}.png`))
                });
            })
            return (`./src/userimages/${userId}.png`)
        }
    }
}