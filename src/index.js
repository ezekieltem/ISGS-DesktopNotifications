module.exports = async function (cookie) {
    const noblox = require('noblox.js')
    const imagehandler = require('./imagehandler.js')
    const notifier = require('node-notifier');
    const fs = require('fs');


    for (const file of fs.readdirSync('./src/userimages').filter(file => file.endsWith('.png'))) {
        fs.unlink(`./src/userimages/${file}`, (err) => {
        })
    }

    console.log('All images cleared')
    const GID1 = 901313
    const GID2 = 6174869
    let min = 150
    noblox.getRoles(GID1).then((roles) => {
        let validRoles = roles.filter(role => (role.rank >= min))
        let roleIds = []
        let i = 0
        validRoles.forEach((role) => {
            roleIds[i] = role.id
            i += 1
        })
        roleIds.forEach((id) => {
            noblox.getPlayers(GID1, id).then((plrs) => {
                plrs.forEach((plr) => {
                    imagehandler.getImage(plr.userId).then((image) => {
                        console.log(image);
                    })
                })
            })
        })
    })
    imagehandler.getImage(116708553).then((image) => {
        console.log(image)
    })

    console.log('Images created.')

    let lastShout = null
    noblox.setCookie(cookie).then(() => {
        console.log('Logged in!')
        console.log('Now listening to shout!')
        noblox.onShout(GID1).on('data', (shout) => {
            if (shout.body === lastShout) return
            imagehandler.getImage(shout.poster.userId).then((image) => {
                console.log(image)
                notifier.notify(
                    {
                        title: `${shout.poster.displayName} (@${shout.poster.username})`,
                        message: `${shout.body}`,
                        time: 3000,
                        sound: "SMS",
                        icon: image,
                        appID: "Innovation Security Group Shouts",
                    },

                    function (error, response) {
                        if (response !== 'timeout' && response !== 'dismissed') {
                            const opn = require('opn')
                            opn('https://www.roblox.com/games/8232411/Innovation-Security-Training-Facility');
                        }
                    },

                )
            })
            lastShout = shout.body
        }).on('error', (err) => {
            console.error(err.message)
        })
    })
}
