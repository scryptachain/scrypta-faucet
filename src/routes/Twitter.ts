import { time } from "console"
import express = require("express")
var twit = require('twit')
var CoinKey = require('coinkey')
var twitterlogin = require("node-twitter-api")
var config = require('../config.js')
const ScryptaCore = require('@scrypta/core')
import * as Crypto from '../libs/Crypto'
import * as Database from '../libs/Database'
var testmode = process.env.TESTMODE.toLowerCase() == 'true' ? true : false;
const puppeteer = require("puppeteer");
const sharp = require('sharp');
const fs = require('fs');

if (testmode === true) {
    console.log('\x1b[33m%s\x1b[0m', 'RUNNING IN TEST MODE')
}

if (config.access_token !== undefined && config.access_token_secret !== undefined) {
    var Twitter = new twit(config);
}

const coinInfo = {
    private: 0xae,
    public: 0x30,
    scripthash: 0x0d
};

var _requestSecret
if (process.env.TWITTER_CONSUMERKEY !== undefined && process.env.TWITTER_CONSUMERSECRET !== undefined) {
    var twtlogin = new twitterlogin({
        consumerKey: process.env.TWITTER_CONSUMERKEY,
        consumerSecret: process.env.TWITTER_CONSUMERSECRET,
        callback: process.env.URL + '/twitter/callback'
    });
    var publisherlogin = new twitterlogin({
        consumerKey: process.env.TWITTER_PUBLISHERKEY,
        consumerSecret: process.env.TWITTER_PUBLISHERSECRET,
        callback: process.env.URL + '/twitter/publisher'
    });
} else {
    console.log('\x1b[41m%s\x1b[0m', 'SETUP TWITTER FIRST!')
}

function sleep(ms) {
    return new Promise(response => {
        setTimeout(function () {
            response(true)
        }, ms)
    })
}

export function getAuth(req: express.Request, res: express.res) {
    twtlogin.getRequestToken(function (err, requestToken, requestSecret) {
        if (err)
            res.status(500).send(err);
        else {
            _requestSecret = requestSecret;
            res.redirect("https://api.twitter.com/oauth/authenticate?oauth_token=" + requestToken);
        }
    });
}

export function getAuthPublisher(req: express.Request, res: express.res) {
    publisherlogin.getRequestToken(function (err, requestToken, requestSecret) {
        if (err) {
            res.status(500).send(err);
        } else {
            _requestSecret = requestSecret;
            res.redirect("https://api.twitter.com/oauth/authenticate?oauth_token=" + requestToken);
        }
    });
}

export function getAccessToken(req: express.Request, res: express.res) {
    var requestToken = req.query.oauth_token,
        verifier = req.query.oauth_verifier;

    twtlogin.getAccessToken(requestToken, _requestSecret, verifier, function (err, accessToken, accessSecret) {
        if (err) {
            res.status(500).send(err);
        } else {
            twtlogin.verifyCredentials(accessToken, accessSecret, async function (err, user) {
                if (err) {
                    res.status(500).send(err);
                } else {
                    if (process.env.TWITTER_ACCESSTOKEN === undefined) {
                        res.send({
                            user
                        });
                        const fs = require('fs');
                        fs.appendFile('.env', "\r\n" + 'TWITTER_ACCESSTOKEN=' + accessToken, function (err) {
                            console.log('ACCESS TOKEN WRITTEN')
                        })
                        fs.appendFile('.env', "\r\n" + 'TWITTER_TOKENSECRET=' + accessSecret, function (err) {
                            console.log('TOKEN SECRET WRITTEN')
                        })
                        fs.appendFile('.env', "\r\n" + 'TWITTER_USERNAME=' + user.screen_name, function (err) {
                            console.log('USERNAME WRITTEN')
                        })
                    } else {
                        const db = new Database.Mongo
                        let userDB = await db.find('followers', { id: user.id })
                        if (userDB === null) {
                            var ck = CoinKey.createRandom(coinInfo)
                            user.address = ck.publicAddress
                            user.prv = ck.privateWif
                            await db.insert('followers', user)
                            userDB = await db.find('followers', { id: user.id })
                        }
                        let storage = {
                            name: userDB.name,
                            screen_name: userDB.screen_name,
                            reward_address: userDB.reward_address,
                            prv: userDB.prv,
                            address: userDB.address,
                            image: userDB.profile_image_url_https
                        }
                        res.send('<html><script>localStorage.setItem(`user`,`' + JSON.stringify(storage) + '`);window.location=`/#/account`;</script></html>')
                    }
                }
            });
        }
    });

}

export function getPublisherToken(req: express.Request, res: express.res) {
    var requestToken = req.query.oauth_token,
        verifier = req.query.oauth_verifier;

    publisherlogin.getAccessToken(requestToken, _requestSecret, verifier, function (err, accessToken, accessSecret) {
        if (err) {
            res.status(500).send(err);
        } else {
            publisherlogin.verifyCredentials(accessToken, accessSecret, async function (err, user) {
                if (err) {
                    res.status(500).send(err);
                } else {
                    if (process.env.TWITTER_ACCESSTOKEN === undefined) {
                        res.send({
                            user
                        });
                        const fs = require('fs');
                        fs.appendFile('.env', "\r\n" + 'TWITTER_ACCESSTOKEN=' + accessToken, function (err) {
                            console.log('ACCESS TOKEN WRITTEN')
                        })
                        fs.appendFile('.env', "\r\n" + 'TWITTER_TOKENSECRET=' + accessSecret, function (err) {
                            console.log('TOKEN SECRET WRITTEN')
                        })
                        fs.appendFile('.env', "\r\n" + 'TWITTER_USERNAME=' + user.screen_name, function (err) {
                            console.log('USERNAME WRITTEN')
                        })
                    }
                }
            });
        }
    });
}

export async function followers(twitter_user) {
    return new Promise(async response => {
        const db = new Database.Mongo
        console.log('LOOKING FOR @' + twitter_user + ' FOLLOWERS')
        Twitter.get('followers/list', { screen_name: twitter_user, count: 30 }, async function (err, data) {
            if (!err) {
                var followers = data.users
                var newfollowers = 0
                for (var index in followers) {
                    var user_follow = followers[index].id
                    var user_mention_followers = followers[index].followers_count
                    if (user_mention_followers >= process.env.MIN_FOLLOWERS) {
                        let check = await db.find('followers', { id: user_follow })
                        if (check === null || check.address === undefined) {
                            var user_registration = new Date(followers[index].created_at)
                            var now = new Date();
                            var diff = now.getTime() - user_registration.getTime();
                            var elapsed = diff / (1000 * 60 * 60 * 24)
                            if (elapsed >= parseInt(process.env.MIN_DAYS)) {
                                newfollowers++
                                console.log('NEW FOLLOWER: ' + followers[index].screen_name + '!')
                                await tipuser(followers[index], 'FOLLOW', twitter_user, process.env.TIP_FOLLOW, process.env.COIN)
                            } else {
                                console.log('USER ' + user_follow + ' IS TOO YOUNG.')
                            }
                        }
                    } else {
                        console.log('USER ' + followers[index].screen_name + ' DON\'T HAVE THE REQUIRED FOLLOWERS (' + user_mention_followers + ')')
                    }
                }
                console.log('FOUND ' + newfollowers + ' NEW FOLLOWERS!')
                response(true)
            } else {
                console.log('ERROR WHILE GETTING FOLLOWERS LIST!', err.message)
                response(false)
            }
        })
    })
};

export async function tag(tag, twitter_user) {
    return new Promise(async response => {
        const db = new Database.Mongo
        console.log('LOOKING FOR TAG: ' + tag)
        Twitter.get('search/tweets', { q: tag }, async function (err, data) {
            if (!err) {
                var found = data.statuses
                var mentions = []
                for (var index in found) {
                    if (found[index].user !== twitter_user) {
                        mentions.push(found[index])
                    }
                }
                var newmentions = 0
                for (var index in mentions) {
                    // console.log('\x1b[42m%s\x1b[0m', mentions[index].text,  mentions[index].user.screen_name)
                    var user_mention = mentions[index].user.screen_name
                    var user_id = mentions[index].user.id
                    var user_mention_followers = mentions[index].user.followers_count
                    if (user_mention !== process.env.TWITTER_BOT) {
                        if (user_mention_followers >= process.env.MIN_FOLLOWERS) {
                            var mention_id = mentions[index]['id_str']
                            var tipped = await db.find('mentions', { mention_id: mention_id, user_id: user_id })
                            if (tipped === null && user_mention !== process.env.TWITTER_USERNAME && user_mention !== process.env.TWITTER_BOT) {
                                var user_registration = new Date(mentions[index].user.created_at)
                                var now = new Date();
                                var diff = now.getTime() - user_registration.getTime();
                                var elapsed = diff / (1000 * 60 * 60 * 24)
                                if (elapsed > parseInt(process.env.MIN_DAYS)) {
                                    let tip = await tipuser(mentions[index].user, 'MENTION', mention_id, process.env.TIP_MENTION, process.env.COIN)
                                    if (tip !== 'ERROR') {
                                        newmentions++
                                        await db.insert('mentions', { mention_id: mention_id, user_id: user_id, timestamp: new Date().getTime() })
                                    }
                                } else {
                                    console.log('USER ' + user_mention + ' IS TOO YOUNG.')
                                }
                            }
                        } else {
                            console.log('USER ' + user_mention + ' DON\'T HAVE THE REQUIRED FOLLOWERS (' + user_mention_followers + ')')
                        }
                    }
                }
                console.log('FOUND ' + newmentions + ' NEW CASHTAGS MENTIONS')
                response(true)
            } else {
                console.log('ERROR WHILE GETTING USER MENTIONS!', err.message)
                response(false)
            }
        })
    })
};

export async function commands() {
    return new Promise(async response => {
        const db = new Database.Mongo
        console.log('LOOKING FOR DIRECT COMMANDS UPDATES.')
        Twitter.get('search/tweets', { q: '#scryptabot' }, async function (err, data) {
            if (!err) {
                for (var index in data.statuses) {
                    // console.log('\x1b[42m%s\x1b[0m', mentions[index].text,  mentions[index].user.screen_name)
                    let twitter_user = data.statuses[index].user
                    let text = data.statuses[index].text
                    while(text.indexOf("\n") !== -1){
                        text = text.replace("\n", " ")
                    }
                    let exploded = []
                    let explodedToParse = text.split(' ')
                    for(let o in explodedToParse){
                        if(explodedToParse[o].trim().length > 0 && explodedToParse[o].trim() !== ""){
                            exploded.push(explodedToParse[o])
                        }
                    }
                    if (text.indexOf('address') !== -1) {
                        console.log('--> CHECKING ' + text)
                        for (let j in exploded) {
                            if (exploded[j].substr(0, 1) === 'L') {
                                let address = exploded[j]
                                var check = await db.find('followers', { id: twitter_user.id })
                                if (check === null) {
                                    console.log('CREATING NEW FOLLWER WITH ADDRESS ' + address + '!')
                                    twitter_user.reward_address = address
                                    await db.insert('followers', twitter_user)
                                    await message(
                                        twitter_user.id_str,
                                        "Compliments, you're now a Scrypta Ambassador! You will receive rewards for each interaction with us at address " + address + "!"
                                    )
                                } else if (check.reward_address === undefined || (check.reward_address !== undefined && check.reward_address !== address)) {
                                    console.log('UPDATING USER ' + twitter_user.screen_name + ' WITH ADDRESS ' + address)
                                    await db.update('followers', { id: twitter_user.id }, { $set: { reward_address: address } })
                                    await message(
                                        twitter_user.id_str,
                                        "Compliments, your reward address is now updated with " + address + "! You can continue use " + check.address + " to send coins and interact with other people!"
                                    )
                                }
                            }
                        }
                    } else if (text.indexOf('tip') !== -1) {
                        console.log('--> CHECKING ' + text)
                        for (let j in exploded) {
                            if (exploded[j].substr(0, 1) === '@') {
                                let check_tip = await db.find('tips', { id: data.statuses[index]['id_str'] })
                                let check_action = await db.find('actions', { id: data.statuses[index]['id_str'] })
                                if (check_tip === null && check_action === null) {
                                    var sender_user = await db.find('followers', { id: twitter_user.id })
                                    if (sender_user !== null && sender_user.prv !== undefined) {
                                        let totip_screenname = exploded[j].replace('@', '')
                                        let totip_user = await db.find('followers', { screen_name: totip_screenname })
                                        if (totip_user === null) {
                                            console.log('CREATING NEW TIPPED USER @' + totip_screenname + '!')
                                            try{
                                                let twitter_user = await Twitter.get('users/show', { screen_name: totip_screenname })
                                                var ck = CoinKey.createRandom(coinInfo)
                                                twitter_user.data.address = ck.publicAddress
                                                twitter_user.data.prv = ck.privateWif
                                                await db.insert('followers', twitter_user.data)
                                                totip_user = await db.find('followers', { screen_name: totip_screenname })
                                            }catch(e){
                                                console.log("Can't create user, ignoring.")
                                            }
                                        }
                                        if (totip_user !== null) {
                                            let amount = parseFloat(exploded[3])
                                            if (amount > 0) {
                                                const wallet = new Crypto.Scrypta
                                                let coin = <any>'LYRA'
                                                if (exploded[4] !== undefined) {
                                                    coin = <any>await wallet.returnCoinAddress(exploded[4])
                                                }
                                                if (coin !== false) {
                                                    if (testmode === false) {
                                                        if (coin === 'LYRA') {
                                                            try {
                                                                console.log('SENDING COINS FROM ' + sender_user.address + ' TO ' + totip_user.address)
                                                                let sent = <any>await wallet.sendLyra(sender_user.prv, sender_user.address, totip_user.address, amount)
                                                                if (sent !== 'NO_BALANCE') {
                                                                    if (sent !== false && sent !== null && sent.length === 64) {
                                                                        await db.insert('tips', { user_id: twitter_user.id, id: data.statuses[index]['id_str'], timestamp: new Date().getTime(), amount: amount, coin: coin, channel: 'TWITTER', address: totip_user.address, txid: sent, source: twitter_user.screen_name, posted: false })
                                                                        await db.insert('actions', { id: data.statuses[index]['id_str'] })
                                                                        await post('@' + twitter_user.screen_name + ' just sent ' + amount + ' $' + coin + ' to @' + totip_user.screen_name + '. Check the transaction here: https://bb.scryptachain.org/tx/' + sent)
                                                                    } else {
                                                                        console.log("SEND WAS UNSUCCESSFUL, WILL RETRY LATER")
                                                                    }
                                                                } else {
                                                                    await db.insert('actions', { id: data.statuses[index]['id_str'] })
                                                                    console.log("NOT ENOUGH BALANCE.")
                                                                }
                                                            } catch (e) {
                                                                console.log("SENDING ERROR, WILL RETRY LATER")
                                                            }
                                                        } else if (coin.substr(0, 1) === '6') {
                                                            try {
                                                                let ticker = await wallet.checkAvailableCoin(coin)
                                                                console.log('SENDING TOKENS FROM ' + sender_user.address + ' TO ' + totip_user.address)
                                                                let sent = <any>await wallet.sendPlanum(sender_user.prv, sender_user.address, totip_user.address, amount, coin)
                                                                if (sent !== 'NO_BALANCE') {
                                                                    if (sent !== false && sent !== null && sent.length === 64) {
                                                                        await db.insert('tips', { user_id: twitter_user.id, id: data.statuses[index]['id_str'], timestamp: new Date().getTime(), amount: amount, coin: coin, channel: 'TWITTER', address: totip_user.address, txid: sent, source: twitter_user.screen_name, posted: false })
                                                                        await db.insert('actions', { id: data.statuses[index]['id_str'] })
                                                                        await post('@' + twitter_user.screen_name + ' just sent ' + amount + ' $' + ticker + ' to @' + totip_user.screen_name + '. Check the transaction here: https://chains.planum.dev/#/transaction/' + coin + '/' + sent)
                                                                    } else {
                                                                        console.log("SEND WAS UNSUCCESSFUL, WILL RETRY LATER")
                                                                    }
                                                                } else {
                                                                    await db.insert('actions', { id: data.statuses[index]['id_str'] })
                                                                    console.log("NOT ENOUGH BALANCE.")
                                                                }
                                                            } catch (e) {
                                                                console.log("SENDING ERROR, WILL RETRY LATER")
                                                            }
                                                        }
                                                    } else {
                                                        console.log('STORING IN DB, TESTMODE IS ON')
                                                        await db.insert('actions', { id: data.statuses[index]['id_str'] })
                                                        await db.insert('tips', { user_id: twitter_user.id, id: data.statuses[index]['id_str'], timestamp: new Date().getTime(), amount: amount, coin: 'LYRA', channel: 'TWITTER', address: totip_user.address, txid: 'TXIDHASH', source: twitter_user.screen_name, posted: false })
                                                    }
                                                } else {
                                                    await db.insert('actions', { id: data.statuses[index]['id_str'] })
                                                    console.log('COIN IS NOT VALID')
                                                }
                                            } else {
                                                await db.insert('actions', { id: data.statuses[index]['id_str'] })
                                                console.log('AMOUNT IS NOT VALID ' + amount)
                                            }
                                        } else {
                                            await db.insert('actions', { id: data.statuses[index]['id_str'] })
                                            console.log("USER DON'T EXISTS!")
                                        }
                                    } else {
                                        await db.insert('actions', { id: data.statuses[index]['id_str'] })
                                        console.log('USER IS NOT REGISTERED TO SERVICE.')
                                    }
                                }
                            }
                        }
                    } else if (text.indexOf('disable') !== -1) {
                        console.log('--> CHECKING ' + text)
                        for (let j in exploded) {
                            if (exploded[j] === 'disable') {
                                let check_action = await db.find('actions', { id: data.statuses[index]['id_str'] })
                                if (check_action === null) {
                                    await db.insert('actions', { id: data.statuses[index]['id_str'] })
                                    console.log('---> REMOVING ENDORSEMENT FOUND!')
                                    let ni = parseInt(j) + 1
                                    let endorsement = exploded[ni]
                                    if (endorsement !== undefined && endorsement !== null) {
                                        var check = await db.find('followers', { id: twitter_user.id })
                                        if (check !== null) {
                                            let update = []
                                            for (let k in check.endorse) {
                                                if (check.endorse[k].searcher !== endorsement) {
                                                    update.push(check.endorse[k])
                                                } else {
                                                    check.endorse[k].ignore = true
                                                    update.push(check.endorse[k])
                                                }
                                            }

                                            await db.update('followers', { id: twitter_user.id }, { $set: { endorse: update } })
                                            await message(
                                                twitter_user.id_str,
                                                "Oh no, you're now stopped endorsing " + endorsement + ".."
                                            )

                                        }
                                    }
                                }
                            }
                        }
                    } else if (text.indexOf('enable') !== -1) {
                        console.log('--> CHECKING ' + text)
                        for (let j in exploded) {
                            if (exploded[j] === 'enable') {
                                let check_action = await db.find('actions', { id: data.statuses[index]['id_str'] })
                                if (check_action === null) {
                                    await db.insert('actions', { id: data.statuses[index]['id_str'] })
                                    console.log('---> ENABLING ENDORSEMENT AGAIN!')
                                    let ni = parseInt(j) + 1
                                    let endorsement = exploded[ni]
                                    if (endorsement !== undefined && endorsement !== null) {
                                        var check = await db.find('followers', { id: twitter_user.id })
                                        if (check !== null) {
                                            let update = []
                                            for (let k in check.endorse) {
                                                if (check.endorse[k].searcher !== endorsement) {
                                                    update.push(check.endorse[k])
                                                } else {
                                                    check.endorse[k].ignore = false
                                                    update.push(check.endorse[k])
                                                }
                                            }

                                            await db.update('followers', { id: twitter_user.id }, { $set: { endorse: update } })
                                            await message(
                                                twitter_user.id_str,
                                                "Yeah! You're now endorsing " + endorsement + " again!"
                                            )

                                        }
                                    }
                                }
                            }
                        }
                    } else if (text.indexOf('endorse') !== -1) {
                        console.log('--> CHECKING ' + text)
                        for (let j in exploded) {
                            if (exploded[j] === 'endorse') {
                                let check_action = await db.find('actions', { id: data.statuses[index]['id_str'] })
                                if (check_action === null) {
                                    const wallet = new Crypto.Scrypta
                                    await db.insert('actions', { id: data.statuses[index]['id_str'] })
                                    console.log('---> ENDORSEMENT FOUND!')
                                    let ni = parseInt(j) + 1
                                    let nit = parseInt(j) + 2
                                    let nic = parseInt(j) + 3
                                    let endorsement = exploded[ni]
                                    let tip = exploded[nit]
                                    let coin = exploded[nic].replace('$', '')
                                    let ticker = await wallet.checkAvailableCoin(coin)
                                    if (ticker !== false) {
                                        console.log('----> ' + ticker + ' IS AVAILABLE')
                                        if (endorsement !== undefined && endorsement !== null && tip !== undefined && coin !== null && coin !== undefined && tip !== null && parseFloat(tip) > 0) {
                                            var check = await db.find('followers', { id: twitter_user.id })
                                            if (check == null) {
                                                var ck = CoinKey.createRandom(coinInfo)
                                                twitter_user.address = ck.publicAddress
                                                twitter_user.prv = ck.privateWif
                                                twitter_user.endorse = []
                                                await db.insert('followers', twitter_user)
                                                check = await db.find('followers', { id: twitter_user.id })
                                            }

                                            let endorse = []
                                            let found = false

                                            if (check.endorse !== undefined) {
                                                endorse = check.endorse
                                            }

                                            for (let k in endorse) {
                                                if (endorse[k].searcher === endorsement) {
                                                    found = true
                                                }
                                            }

                                            if (!found) {
                                                endorse.push({
                                                    searcher: endorsement,
                                                    coin: coin,
                                                    tip: tip
                                                })

                                                await db.update('followers', { id: twitter_user.id }, { $set: { endorse: endorse } })
                                                if (testmode === false) {
                                                    await message(
                                                        twitter_user.id_str,
                                                        "Compliments, you're now endorsing " + endorsement + ". Each user that tweets your endorsement will receive  " + parseFloat(tip) + " $" + ticker + " from you! Please be sure your address is always filled with some $" + ticker + "!"
                                                    )
                                                }
                                            }
                                        } else {
                                            console.log('-----> MALFORMED REQUEST', endorsement, tip, coin)
                                        }
                                    } else {
                                        console.log(coin + ' IS NOT AVAILABLE.')
                                    }
                                }
                            }
                        }
                    } else if (text.indexOf('withdraw') !== -1) {
                        console.log('--> CHECKING ' + text)
                        for (let j in exploded) {
                            if (exploded[j] === 'withdraw') {
                                let check_action = await db.find('actions', { id: data.statuses[index]['id_str'] })
                                if (check_action === null) {
                                    var sender_user = await db.find('followers', { id: twitter_user.id })
                                    if (sender_user !== null && sender_user.prv !== undefined) {
                                        if (testmode === false) {
                                            const wallet = new Crypto.Scrypta
                                            let amount = parseFloat(exploded[3])
                                            let address = exploded[2]
                                            let coin = <any>'LYRA'
                                            let ticker = <any>'LYRA'
                                            if (exploded[3] !== undefined) {
                                                coin = <any>await wallet.returnCoinAddress(exploded[3])
                                                ticker = <any>await wallet.checkAvailableCoin(coin)
                                            }
                                            if (coin !== false) {
                                                if (amount > 0) {
                                                    if (coin === 'LYRA') {
                                                        try {
                                                            console.log('SENDING COINS FROM ' + sender_user.address + ' TO ' + address)
                                                            let sent = <any>await wallet.sendLyra(sender_user.prv, sender_user.address, address, amount)
                                                            if (sent !== 'NO_BALANCE') {
                                                                if (sent !== false && sent !== null && sent.length === 64) {
                                                                    await db.insert('actions', { id: data.statuses[index]['id_str'] })
                                                                    await post('@' + twitter_user.screen_name + ' just withdrew ' + amount + ' $' + ticker + '! Check the transaction here: https://bb.scryptachain.org/tx/' + sent)
                                                                } else {
                                                                    console.log("SEND WAS UNSUCCESSFUL, WILL RETRY LATER")
                                                                }
                                                            } else {
                                                                await db.insert('actions', { id: data.statuses[index]['id_str'] })
                                                                console.log("NOT ENOUGH BALANCE.")
                                                            }
                                                        } catch (e) {
                                                            console.log("SENDING ERROR, WILL RETRY LATER")
                                                        }
                                                    } else if (coin.substr(0, 1) === '6') {
                                                        try {
                                                            console.log('SENDING TOKENS FROM ' + sender_user.address + ' TO ' + address + ' USING ' + coin)
                                                            let sent = <any>await wallet.sendPlanum(sender_user.prv, sender_user.address, address, amount, coin)
                                                            if (sent !== 'NO_BALANCE') {
                                                                if (sent !== false && sent !== null && sent.length === 64) {
                                                                    await db.insert('actions', { id: data.statuses[index]['id_str'] })
                                                                    await post('@' + twitter_user.screen_name + ' just withdrew ' + amount + ' $' + ticker + '! Check the transaction here: https://chains.planum.dev/#/transaction/' + coin + '/' + sent)
                                                                } else {
                                                                    console.log("SEND WAS UNSUCCESSFUL, WILL RETRY LATER")
                                                                }
                                                            } else {
                                                                await db.insert('actions', { id: data.statuses[index]['id_str'] })
                                                                console.log("NOT ENOUGH BALANCE.")
                                                            }
                                                        } catch (e) {
                                                            console.log("SENDING ERROR, WILL RETRY LATER")
                                                        }
                                                    }
                                                } else {
                                                    await db.insert('actions', { id: data.statuses[index]['id_str'] })
                                                    console.log('AMOUNT IS NOT VALID ' + amount)
                                                }
                                            } else {
                                                await db.insert('actions', { id: data.statuses[index]['id_str'] })
                                                console.log('COIN IS NOT VALID')
                                            }
                                        } else {
                                            console.log('STORING IN DB, TESTMODE IS ON')
                                            await db.insert('actions', { id: data.statuses[index]['id_str'] })
                                        }
                                    } else {
                                        console.log('USER IS NOT REGISTERED TO SERVICE.')
                                    }
                                }
                            }
                        }
                    } else if (text.indexOf('notarize') !== -1) {
                        console.log('--> CHECKING ' + text)
                        for (let j in exploded) {
                            if (exploded[j] === 'notarize') {
                                let check_action = await db.find('actions', { id: data.statuses[index]['id_str'] })
                                if (check_action === null) {
                                    var sender_user = await db.find('followers', { id: twitter_user.id })
                                    if (sender_user === null) {
                                        console.log('CREATING NEW TIMESTAMP USER @' + twitter_user.screen_name + '!')
                                        var ck = CoinKey.createRandom(coinInfo)
                                        twitter_user.address = ck.publicAddress
                                        twitter_user.prv = ck.privateWif
                                        await db.insert('followers', twitter_user)
                                        sender_user = await db.find('followers', { screen_name: twitter_user.screen_name })
                                    }
                                    if (sender_user !== null && sender_user.prv !== undefined) {
                                        if (testmode === false) {
                                            let uindex = parseInt(j) + 1
                                            let tweet_url = exploded[uindex]
                                            if(tweet_url.indexOf('http') !== -1 && (tweet_url.indexOf('t.co') !== -1 || tweet_url.indexOf('twitter.com') !== -1)){
                                                let timestamped = await timestamp(sender_user, tweet_url, data.statuses[index]['id_str'])
                                                try {
                                                    console.log('TIMESTAMP RESPONSE IS ' + JSON.stringify(timestamped))
                                                } catch (e) {
                                                    console.log('TIMESTAMP RESPONSE IS ' + timestamped)
                                                }
                                                if (timestamped !== false && timestamped['written'] !== undefined && timestamped['written']['uuid'] !== undefined) {
                                                    await post('@' + twitter_user.screen_name + ' just notarized ' + tweet_url + '! Check here the proof -> https://proof.scryptachain.org/#/uuid/' + timestamped['written']['uuid'])
                                                    await db.insert('actions', { id: data.statuses[index]['id_str'] })
                                                } else if (timestamped !== false && timestamped === 'BAD') {
                                                    console.log('BAD REQUEST, STORING ACTION')
                                                    await db.insert('actions', { id: data.statuses[index]['id_str'] })
                                                }
                                            }else{
                                                console.log('BAD REQUEST, STORING ACTION.')
                                                await db.insert('actions', { id: data.statuses[index]['id_str'] })
                                            }
                                        } else {
                                            console.log('STORING IN DB, TESTMODE IS ON')
                                            await db.insert('actions', { id: data.statuses[index]['id_str'] })
                                        }
                                    } else {
                                        console.log('USER IS NOT REGISTERED TO SERVICE.')
                                    }
                                }
                            }
                        }
                    }
                }
                response(true)
            } else {
                console.log('ERROR WHILE GETTING USER MENTIONS!', err.message)
                response(false)
            }
        })
    })
};

export async function mentions(twitter_user) {
    return new Promise(async response => {
        const db = new Database.Mongo
        console.log('LOOKING FOR @' + twitter_user + ' MENTIONS')
        Twitter.get('search/tweets', { q: '@' + twitter_user }, async function (err, data) {
            if (!err) {
                var found = data.statuses
                var mentions = []
                for (var index in found) {
                    if (found[index].user !== twitter_user) {
                        mentions.push(found[index])
                    }
                }
                var newmentions = 0
                for (var index in mentions) {
                    // console.log('\x1b[44m%s\x1b[0m', mentions[index].text)
                    var user_mention = mentions[index].user.screen_name
                    var user_id = mentions[index].user.id
                    var user_mention_followers = mentions[index].user.followers_count
                    if (user_mention !== process.env.TWITTER_BOT) {
                        if (user_mention_followers >= process.env.MIN_FOLLOWERS) {
                            var mention_id = mentions[index]['id_str']
                            var tipped = await db.find('mentions', { mention_id: mention_id, user_id: user_id })
                            if (tipped === null && user_mention !== process.env.TWITTER_USERNAME && user_mention !== process.env.TWITTER_BOT) {
                                var user_registration = new Date(mentions[index].user.created_at)
                                var now = new Date();
                                var diff = now.getTime() - user_registration.getTime();
                                var elapsed = diff / (1000 * 60 * 60 * 24)
                                if (elapsed > parseInt(process.env.MIN_DAYS)) {
                                    let tip = await tipuser(mentions[index].user, 'MENTION', mention_id, process.env.TIP_MENTION, process.env.COIN)
                                    if (tip !== 'ERROR') {
                                        newmentions++
                                        await db.insert('mentions', { mention_id: mention_id, user_id: user_id, timestamp: new Date().getTime() })
                                    }
                                } else {
                                    console.log('USER ' + user_mention + ' IS TOO YOUNG.')
                                }
                            }
                        } else {
                            console.log('USER ' + user_mention + ' DON\'T HAVE THE REQUIRED FOLLOWERS (' + user_mention_followers + ')')
                        }
                    }
                }
                console.log('FOUND ' + newmentions + ' NEW MENTIONS')
                response(true)
            } else {
                console.log('ERROR WHILE GETTING USER MENTIONS!', err.message)
                response(false)
            }
        })
    })
};

export async function tipuser(twitter_user, action, action_id, amount, coin) {
    const db = new Database.Mongo
    return new Promise(async response => {
        console.log('\x1b[32m%s\x1b[0m', 'TIPPING USER ' + twitter_user.screen_name + ' WITH ' + amount + ' ' + coin + ' FOR ' + action + '!')
        var last_tip = await db.find('tips', { user_id: twitter_user.id, source: 'BOT' }, { timestamp: -1 })
        var eligible = false
        if (last_tip[0] === undefined) {
            eligible = true
        } else {
            var now = new Date().getTime()
            var elapsed = (now - last_tip[0].timestamp) / (1000 * 60)
            if (elapsed >= parseInt(process.env.MIN_TIMEFRAME)) {
                eligible = true
            }
        }

        if (eligible === true) {
            var user = await db.find('followers', { id: twitter_user.id })
            if (user === null) {
                console.log('CREATING NEW FOLLWER!')
                await db.insert('followers', twitter_user)
                var user = await db.find('followers', { id: twitter_user.id })
            }

            var address = user.address
            var pubAddr = ''

            if (user.reward_address === undefined) {
                if (address !== undefined) {
                    //SEND TO ADDRESS
                    pubAddr = address
                } else {
                    //CREATE ADDRESS FOR USER
                    var ck = CoinKey.createRandom(coinInfo)
                    pubAddr = ck.publicAddress
                    await db.update('followers', { id: twitter_user.id }, { $set: { address: pubAddr, prv: ck.privateWif } })
                    address = pubAddr
                }
            } else {
                pubAddr = user.reward_address
            }

            if (address !== undefined) {
                console.log('PUB ADDRESS IS ' + pubAddr)
                var wallet = new Crypto.Scrypta;
                wallet.request('getinfo').then(function (info) {
                    if (info !== undefined) {
                        if (testmode === false) {
                            var balance = info['result']['balance']
                            if (balance > amount) {
                                console.log('SENDING TO ADDRESS ' + pubAddr + ' ' + amount + ' ' + coin)
                                wallet.request('sendtoaddress', [pubAddr, parseFloat(amount)]).then(async function (txid) {
                                    if (txid !== undefined && txid['result'] !== undefined && txid['result'].length === 64) {
                                        await db.insert('tips', { user_id: twitter_user.id, id: action_id, timestamp: new Date().getTime(), amount: amount, coin: coin, channel: 'TWITTER', address: address, txid: txid['result'], source: 'BOT', posted: false })
                                        console.log('TXID IS ' + txid['result'])
                                        response(txid['result'])
                                    } else {
                                        console.log("ERROR WHILE SENDING TIP")
                                        response('ERROR')
                                    }
                                })
                            } else {
                                console.log('OPS, NOT ENOUGH FUNDS!')
                                response('ERROR')
                            }
                        } else {
                            db.insert('tips', { user_id: twitter_user.id, id: action_id, timestamp: new Date().getTime(), amount: amount, coin: coin, channel: 'TWITTER', address: address, txid: 'TXIDHASH', source: 'BOT', posted: false })
                            response('TXIDHASH')
                        }
                    } else {
                        console.log('WALLET NOT WORKING')
                        response('ERROR')
                    }
                })
            } else {
                console.log("USER IS WITHOUT ADDRESS")
                response('ERROR')
            }
        } else {
            console.log('USER WAS TIPPED IN THE PAST ' + process.env.MIN_TIMEFRAME + ' MINUTES, BAD LUCK!')
            response('BAD_LUCK')
        }
    })
}

export async function endorse(tag, twitter_user, coin, amount) {
    return new Promise(async response => {
        const db = new Database.Mongo
        console.log('LOOKING FOR TAG: ' + tag)
        Twitter.get('search/tweets', { q: tag }, async function (err, data) {
            if (!err) {
                var found = data.statuses
                var mentions = []
                for (var index in found) {
                    if (found[index].user !== twitter_user.screen_name) {
                        mentions.push(found[index])
                    }
                }
                var newmentions = 0
                for (var index in mentions) {
                    // console.log('\x1b[42m%s\x1b[0m', mentions[index].text,  mentions[index].user.screen_name)
                    var user_mention = mentions[index].user.screen_name
                    var user_id = mentions[index].user.id
                    var user_mention_followers = mentions[index].user.followers_count
                    if (user_mention !== process.env.TWITTER_BOT) {
                        if (user_mention_followers >= process.env.MIN_FOLLOWERS) {
                            var mention_id = mentions[index]['id_str']
                            var tipped = await db.find('mentions', { mention_id: mention_id, user_id: user_id })
                            if (tipped === null && user_mention !== process.env.TWITTER_USERNAME && user_mention !== process.env.TWITTER_BOT && user_mention !== twitter_user.screen_name) {
                                var user_registration = new Date(mentions[index].user.created_at)
                                var now = new Date();
                                var diff = now.getTime() - user_registration.getTime();
                                var elapsed = diff / (1000 * 60 * 60 * 24)
                                if (elapsed > parseInt(process.env.MIN_DAYS)) {
                                    const scrypta = new ScryptaCore
                                    scrypta.staticnodes = true

                                    const wallet = new Crypto.Scrypta
                                    if (coin !== false) {
                                        let totip_user = await db.find('followers', { screen_name: user_mention })
                                        if (totip_user === null) {
                                            console.log('CREATING NEW TIPPED USER @' + user_mention + '!')
                                            let twitter_user = await Twitter.get('users/show', { screen_name: user_mention })
                                            var ck = CoinKey.createRandom(coinInfo)
                                            twitter_user.data.address = ck.publicAddress
                                            twitter_user.data.prv = ck.privateWif
                                            await db.insert('followers', twitter_user.data)
                                            totip_user = await db.find('followers', { screen_name: user_mention })
                                        }
                                        if (totip_user !== null) {
                                            if (testmode === false) {
                                                if (coin === 'LYRA') {
                                                    try {
                                                        console.log('SENDING COINS FROM ' + twitter_user.address + ' TO ' + twitter_user.address)
                                                        let sent = <any>await wallet.sendLyra(twitter_user.prv, twitter_user.address, totip_user.address, amount)
                                                        if (sent !== 'NO_BALANCE') {
                                                            if (sent !== false && sent !== null && sent.length === 64) {
                                                                await db.insert('tips', { user_id: twitter_user.id, id: data.statuses[index]['id_str'], timestamp: new Date().getTime(), amount: amount, coin: 'LYRA', channel: 'TWITTER', address: totip_user.address, txid: sent, source: twitter_user.screen_name, posted: false })
                                                                await post('@' + twitter_user.screen_name + ' just sent ' + amount + ' $LYRA to @' + totip_user.screen_name + ' because endorsed ' + tag + ' Check the transaction here: https://bb.scryptachain.org/tx/' + sent)
                                                                await db.insert('mentions', { mention_id: mention_id, user_id: user_id, timestamp: new Date().getTime() })
                                                                await db.insert('actions', { id: data.statuses[index]['id_str'] })
                                                                newmentions++
                                                                console.log("ENDORSEMENT TIP SENT!")
                                                            } else {
                                                                console.log("SEND WAS UNSUCCESSFUL, WILL RETRY LATER")
                                                            }
                                                        } else {
                                                            await db.insert('mentions', { mention_id: mention_id, user_id: user_id, timestamp: new Date().getTime() })
                                                            await db.insert('actions', { id: data.statuses[index]['id_str'] })
                                                            console.log("NOT ENOUGH BALANCE.")
                                                        }
                                                    } catch (e) {
                                                        console.log("SENDING ERROR, WILL RETRY LATER")
                                                    }
                                                } else {
                                                    try {
                                                        let sidechain_ticker = await wallet.checkAvailableCoin(coin)
                                                        let sent = <any>await wallet.sendPlanum(twitter_user.prv, twitter_user.address, totip_user.address, amount, coin)
                                                        if (sent !== 'NO_BALANCE') {
                                                            if (sent !== false && sent !== null && sent.length === 64) {
                                                                await db.insert('tips', { user_id: twitter_user.id, id: data.statuses[index]['id_str'], timestamp: new Date().getTime(), amount: amount, coin: coin, channel: 'TWITTER', address: totip_user.address, txid: sent, source: twitter_user.screen_name, posted: false })
                                                                await post('@' + twitter_user.screen_name + ' just sent ' + amount + ' $' + sidechain_ticker + ' to @' + totip_user.screen_name + ' because endorsed ' + tag + ' Check the transaction here: https://chains.planum.dev/#/transaction/' + coin + '/' + sent)
                                                                await db.insert('mentions', { mention_id: mention_id, user_id: user_id, timestamp: new Date().getTime() })
                                                                await db.insert('actions', { id: data.statuses[index]['id_str'] })
                                                                newmentions++
                                                                console.log("ENDORSEMENT TIP SENT!")
                                                            } else {
                                                                console.log("SEND WAS UNSUCCESSFUL, WILL RETRY LATER")
                                                            }
                                                        } else {
                                                            await db.insert('mentions', { mention_id: mention_id, user_id: user_id, timestamp: new Date().getTime() })
                                                            await db.insert('actions', { id: data.statuses[index]['id_str'] })
                                                            console.log("NOT ENOUGH BALANCE.")
                                                        }
                                                    } catch (e) {
                                                        console.log("SENDING ERROR, WILL RETRY LATER")
                                                    }
                                                }
                                            } else {
                                                console.log('STORING IN DB, TESTMODE IS ON')
                                                await db.insert('mentions', { mention_id: mention_id, user_id: user_id, timestamp: new Date().getTime() })
                                                await db.insert('actions', { id: data.statuses[index]['id_str'] })
                                                await db.insert('tips', { user_id: twitter_user.id, id: data.statuses[index]['id_str'], timestamp: new Date().getTime(), amount: amount, coin: coin, channel: 'TWITTER', address: twitter_user.address, txid: 'TXIDHASH', source: twitter_user.screen_name, posted: false })
                                            }
                                        } else {
                                            await db.insert('mentions', { mention_id: mention_id, user_id: user_id, timestamp: new Date().getTime() })
                                            await db.insert('actions', { id: data.statuses[index]['id_str'] })
                                            console.log('COIN IS NOT VALID')
                                        }
                                    } else {
                                        await db.insert('mentions', { mention_id: mention_id, user_id: user_id, timestamp: new Date().getTime() })
                                        await db.insert('actions', { id: data.statuses[index]['id_str'] })
                                        console.log('COIN IS NOT VALID')
                                    }
                                } else {
                                    await db.insert('mentions', { mention_id: mention_id, user_id: user_id, timestamp: new Date().getTime() })
                                    console.log('USER ' + user_mention + ' IS TOO YOUNG.')
                                }
                            }
                        } else {
                            await db.insert('mentions', { mention_id: mention_id, user_id: user_id, timestamp: new Date().getTime() })
                            console.log('USER ' + user_mention + ' DON\'T HAVE THE REQUIRED FOLLOWERS (' + user_mention_followers + ')')
                        }
                    }
                }
                console.log('FOUND ' + newmentions + ' NEW ENDORSEMENT MENTIONS')
                response(true)
            } else {
                console.log('ERROR WHILE GETTING USER MENTIONS!', err.message)
                response(false)
            }
        })
    })
};

export async function message(twitter_user, message) {
    return new Promise(async response => {
        console.log('SENDING MESSAGE TO ' + twitter_user)
        const db = new Database.Mongo
        if (testmode === false) {
            var msg = { "event": { "type": "message_create", "message_create": { "target": { "recipient_id": twitter_user }, "message_data": { "text": message } } } }
            Twitter.post('direct_messages/events/new', msg, async function (err, data) {
                if (data.event !== undefined) {
                    await sleep(30000)
                    response(true)
                } else {
                    console.log("Can't send message to user, sorry.")
                    response(false)
                }
            })
        } else {
            response(true)
        }
    })
}

export async function post(message) {
    return new Promise(async response => {
        console.log('POSTING MESSAGE TO TWITTER', message)
        const db = new Database.Mongo
        if (testmode === false) {
            try {
                Twitter.post('statuses/update', { status: message })
                await sleep(30000)
                response(true)
            } catch (e) {
                console.log('ERROR POSTING STATUS')
                response(false)
            }
        } else {
            response(true)
        }
    })
}

function isCurrentUserRoot() {
    return process.getuid() == 0; // UID 0 is always root
}

export function timestamp(twitter_user, tweet_url, id_str) {
    return new Promise(async response => {
        try {
            const scrypta = new ScryptaCore
            scrypta.staticnodes = true
            let canWrite = true
            let balance = await scrypta.get('/balance/' + twitter_user.address)
            if (balance.balance < 0.01) {
                console.log('Balance address is low, need to fund first.')
                let txid = await fundAddress(twitter_user.address, 0.01)
                console.log('Fund transaction is ' + txid)
                if (txid === null) {
                    canWrite = false
                }
            }

            if (canWrite) {
                console.log('User can write, balance is ' + balance.balance + ' LYRA')
                const browser = await puppeteer.launch({
                    headless: true,
                    args: isCurrentUserRoot() ? ['--no-sandbox'] : undefined
                });
                const page = await browser.newPage();
                console.log('Setting up viewport...');

                await page.setViewport({
                    width: 800,
                    height: 1200
                });

                await page.goto(tweet_url);

                console.log('Loading tweet from URL ' + tweet_url);

                setTimeout(async function () {
                    let extendedURL = page.url()
                    console.log('Extended URL is ' + extendedURL)
                    const split = extendedURL.split('/')
                    const filename = process.cwd() + '/shots/' + split[3] + '/' + split[5] + '.png';
                    let mention_id = split[5];
                    if (!fs.existsSync(process.cwd() + '/shots/')) {
                        fs.mkdirSync(process.cwd() + '/shots/');
                    }

                    if (!fs.existsSync(process.cwd() + '/shots/' + split[3])) {
                        fs.mkdirSync(process.cwd() + '/shots/' + split[3]);
                    }

                    console.log('Tweet #' + mention_id + ' from @' + split[3] + ' found!');

                    if (mention_id !== undefined && split[3] !== undefined && mention_id !== id_str) {
                        let element = await page.$('article');
                        let coordinates = await element.boundingBox();

                        await page.screenshot({
                            path: filename,
                            fullPage: false
                        });

                        await browser.close();

                        let buf = fs.readFileSync(filename);
                        let maxh = parseInt(coordinates.height.toFixed(0)) - 47;

                        sharp(buf).extract({ left: 130, top: 55, width: 590, height: maxh })
                            .toFile(filename, async (err, info) => {
                                console.log('Tweet picture created successfully at ' + filename);

                                try {
                                    let file = fs.readFileSync(filename);
                                    let hexed = file.toString('hex');
                                    let signed = await scrypta.signMessage(twitter_user.prv, hexed)
                                    signed.private_key = twitter_user.prv
                                    console.log('Sending to Documenta...')
                                    let published = await scrypta.post('/documenta/add', signed)
                                    console.log('Documenta response is ', published)
                                    response(published)
                                } catch (e) {
                                    console.log(e)
                                    response(false)
                                }
                            });
                    } else {
                        response('BAD')
                    }
                }, 5000);
            } else {
                console.log('Can\'t notarize, balance is too low!')
                response('NO_BALANCE')
            }
        } catch (e) {
            console.log(e)
            response('ERROR')
        }
    })
};

export function fundAddress(pubAddr, amount) {
    return new Promise(response => {
        const wallet = new Crypto.Scrypta
        console.log('Sending ' + amount + ' to ' + pubAddr)
        wallet.request('sendtoaddress', [pubAddr, parseFloat(amount)]).then(async function (txid) {
            setTimeout(function () {
                response(txid['result'])
            }, 1000)
        })
    })
}

export async function publish() {
    const db = new Database.Mongo
    return new Promise(async response => {
        console.log('\x1b[32m%s\x1b[0m', 'CHECKING IF THERE ARE UPDATES TO POST ON TWITTER')
        var not_published = await db.find('tips', { posted: false, source: 'BOT' }, { timestamp: -1 })

        if(not_published.length > 0){
            let tweet = "Just tipped following users, check at faucet.scryptachain.org!"
            for(let k in not_published){
                let tip = not_published[k]
                if(tweet.length <= 140){
                    let user = await db.find('followers', {id: tip.user_id})
                    if(user.screen_name !== undefined){
                        tweet += " @" + user.screen_name 
                        await db.update('tips', { _id: tip._id }, { $set: { posted: true } })
                    }
                }
            }
            
            console.log('POSTING UPDATE ON TWITTER!')
            console.log(tweet)

            if(!testmode){
                await post(tweet)
            }
        }else{
            console.log('NO UPDATES TO PUSH!')
        }
        response('CHECKED')
    })
}