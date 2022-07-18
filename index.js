const readline = require('readline')
const fs = require('fs')
const noblox = require('noblox.js')

const interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})

/**
 * 
 * @param {string} key 
 * 
 */
async function getAccount(key) {
    let accountInfo = null
    let path = null
    fs.readdirSync('./accounts').filter(file => file.endsWith('.json')).forEach((file) => {
        const json = require(`./accounts/${file}`)
        if (json.DisplayName === key || json.UserName === key) {
            accountInfo = json
            path = `./accounts/${file}`
        }
    })
    if (accountInfo === null) {
        return [false, {}, path]
    } else {
        return [true, accountInfo, path]
    }
}

async function updateInfo(userData, json) {
    noblox.getPlayerInfo(json.UserId).then((user) => {
        fs.writeFileSync(`./accounts/${userData.UserID}.json`, JSON.stringify({
            "UserName": user.username,
            "DisplayName": user.displayName,
            "UserId": json.UserId,
            "Hidden": json.Hidden,
            ".ROBLOSECURITY": json['.ROBLOSECURITY']
        })
        )
    })
}

async function addAccount() {
    interface.question('What is the .ROBLOSECURITY cookie of the account you wish to add?\n**ALL DATA INSERTED INTO THIS APPLICATION IS STORED LOCALLY**\nIf you dont know how to get a cookie please look up a tutorial for your respective OS/Browser.\n', (reply) => {
        console.log('Please standby...')
        noblox.setCookie(reply).then((userData) => {
            noblox.getPlayerInfo(userData.UserID).then((user) => {
                noblox.getRankInGroup(901313, userData.UserID).then((rank) => {
                    if (rank === 0) {
                        console.log('Accounts must be in "Innovation Security" to be added to this application.\nReturning to account selection.')
                        selectAccount()
                    } else {
                        interface.question(`Would you like the account "${user.username}" be hidden? y/n (Unknown answers default to "n")\n`, (answer) => {
                            console.log('Please standby...')
                            if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes' || answer.toLowerCase() === 't' || answer.toLowerCase() === 'true') {
                                console.log('Stating account as a "Hidden" account.')
                                fs.writeFileSync(`./accounts/${userData.UserID}.json`, JSON.stringify({
                                    "UserName": user.username,
                                    "DisplayName": user.displayName,
                                    "UserId": userData.UserID,
                                    "Hidden": true,
                                    ".ROBLOSECURITY": reply
                                }))
                            } else if (answer.toLowerCase() === 'n' || answer.toLowerCase() === 'no' || answer.toLowerCase() === 'f' || answer.toLowerCase() === 'false') {
                                console.log('Stating account as a "Shown" account')
                                fs.writeFileSync(`./accounts/${userData.UserID}.json`, JSON.stringify({
                                    "UserName": user.username,
                                    "DisplayName": user.displayName,
                                    "UserId": userData.UserID,
                                    "Hidden": false,
                                    ".ROBLOSECURITY": reply
                                }))
                            } else {
                                console.log('Unknown answer. Defaulting to "n"\nStating account as a "Shown" account')
                                fs.writeFileSync(`./accounts/${userData.UserID}.json`, JSON.stringify({
                                    "UserName": user.username,
                                    "DisplayName": user.displayName,
                                    "UserId": userData.UserID,
                                    "Hidden": false,
                                    ".ROBLOSECURITY": reply
                                }))
                            }
                            console.log('Account created! Returning to account selection!')
                            noblox.clearSession({})
                            selectAccount()
                        })
                    }
                })
            })
        }).catch((reason) => {
            console.log(`Failed to set cookie! Returning to account selection!`)
            selectAccount()
        })
    })
}


async function selectAccount() {
    let msgString = `Please enter the UserName or DisplayName to select an account. Furthermore enter "Add Account" to add an account!`

    fs.readdirSync('./accounts').filter(file => file.endsWith('.json')).forEach((file) => {
        const json = require(`./accounts/${file}`)
        if (json.Hidden === false) {
            if (json.DisplayName === "" || json.DisplayName === '' || json.DisplayName === ``) {
                msgString = msgString + '\n' + `${json.UserName} | ${json.UserId}`
            } else {
                msgString = msgString + '\n' + `${json.DisplayName}(@${json.UserName}) | ${json.UserId}`
            }
        }
    })
    msgString = msgString + '\n'
    interface.question(msgString, (reply) => {
        if (reply === "") {
            console.log('You have to give a response :/')
            return selectAccount()
        }
        console.log('Please standby...')
        if (reply === 'Add Account') {
            addAccount()
        } else {
            getAccount(reply).then((returnInfo) => {
                const exists = returnInfo[0]
                const accountInfo = returnInfo[1]
                const path = returnInfo[2]
                if (exists === true) {
                    noblox.setCookie(accountInfo['.ROBLOSECURITY']).then((userData) => {
                        updateInfo(userData, accountInfo).then(() => {
                            noblox.clearSession({})
                            let accountString = ``
                            if (accountInfo.DisplayName === "") {
                                accountString = `${accountInfo.UserName} | ${accountInfo.UserId}`
                            } else {
                                accountString = `${accountInfo.DisplayName}(@${accountInfo.UserName}) | ${accountInfo.UserId}`
                            }
                            interface.question(`Selected account: ${accountString}. Do you want to use this account? y/n (Unknown answers default to "n")\n`, (answer) => {
                                console.log('Please standby...')
                                if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes' || answer.toLowerCase() === 't' || answer.toLowerCase() === 'true') {
                                    console.log('Starting up ISGS Desktop notifications!')
                                    require('./src/index.js')(accountInfo['.ROBLOSECURITY'])
                                } else if (answer.toLowerCase() === 'n' || answer.toLowerCase() === 'no' || answer.toLowerCase() === 'f' || answer.toLowerCase() === 'false') {
                                    console.log('Returning to account selection')
                                    selectAccount()
                                } else {
                                    console.log('Unknown answer. Defaulting to "n"')
                                    selectAccount()
                                }
                            })
                        })
                    }).catch((reason) => {
                        console.log(`The cookie for this account has been invalidated at some point!\nReturning to account selection!`)
                        selectAccount()
                    })
                } else {
                    console.log('Unknown account')
                    selectAccount()
                }
            })
        }
    })
}

selectAccount()
