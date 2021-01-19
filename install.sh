#!/bin/bash
echo "STARTING DEPENDENCIES FOR FAUCET"

#INSTALL NODEJS
curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install pm2 -g

echo "URL=http://localhost:3000
TWITTER_CONSUMERKEY=YOUR_CONSUMER_KEY
TWITTER_CONSUMERSECRET=YOUR_CONSUMER_SECRET
RPCUSER=YOUR_RPCUSER
RPCPASSWORD=YOUR_RPCPASSWORD
RPCPORT=YOUR_RPCPORT
RPCADDRESS=YOUR_RPCADDRESS
COININFO_PRIVATE=0xae
COININFO_PUBLIC=0x30
COININFO_SCRIPTHASH=0x0d
COIN=LYRA
TIP_FOLLOW=3
TIP_RETWEET=1
TIP_MENTION=2
TESTMODE=true" > .env

npm install
npm run tsc
pm2 start dist/index.js --name scrypta-faucet
