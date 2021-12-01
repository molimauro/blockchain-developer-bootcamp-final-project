### blockchain-developer-bootcamp-final-project

# (DeChat) A decentralized chat application

## Deployed version url:

https://dechat-mauromolinari-knobsit.vercel.app/

## How to run this project locally:

### Prerequisites

- Node.js >= v16
- Truffle and Ganache
- Npm/Yarn
- `git checkout main`

### Contracts

- Run `npm install` in project root to install Truffle build and smart contract dependencies
- Run local testnet in port `8545` with an Ethereum client, e.g. Ganache
- `truffle migrate --network develop`
- `truffle console --network develop`
- Run tests in Truffle console: `test`
- `develop` network id is 1337, remember to change it in Metamask as well!

### Frontend

- `cd client`
- `npm install`
- `npm run start`
- Open `http://localhost:3000`

## Screencast link

https://youtu.be/2rtpsPoN8gE

## Public Ethereum wallet for certification:

`0x301430E545f3EB3DA114233f46524642B1337125`

## Problem 
When using proprietary platform to chat - like Discord, Slack, etc.. - we delegate our data to a third party and we need to rely on them for our privacy, message-encryption and files we share.

## Solution
A simplified solution can be to create a webchat (Discord-like) in which users will be able to chat and exchage assets in different ways. In particular, users will be able to:
- login to the application;
- send, receive, deny, confirm friend requests tracked by a smart contract;
- manage friends tracked by a smart contract;
- chat through a webapp application based on Textile;

## Future upgrades
- store file via IPFS;
- exchange NFT stickers;
- send money between friends;
- audio and video calls.

I'm aware of the fact that paying fees for managing friends is not acceptable for the final users, was implemented in this way only for the purpose of completing the course. In the future the final users will not pay such fees, instead a smart contract with the necessary funds will be in charge of these operations.

## Simple workflow

1. Enter service web site
2. Login with Metamask
3. Send friend request to another account
4. Accept friend request with the other account
5. Chat with your new friend directly or with the common chat

## Directory structure

- `client`: Project's React frontend.
- `contracts`: Smart contracts that are deployed in the Ropsten testnet.
- `migrations`: Migration files for deploying contracts in `contracts` directory.
- `test`: Tests for smart contracts.

## Environment variables for frontend (NEEDED for running project locally)

```
REACT_APP_TEXTILE=
REACT_APP_TEXTILE_COMMON_CHAT_SECRET=
```

REACT_APP_TEXTILE can be obtained through the textile hub by creating a new API key of type **user group** without Signature Authentication.
REACT_APP_TEXTILE_COMMON_CHAT_SECRET can be obtained from the funcion call `PrivateKey.fromRandom()` (see `utils/textile.ts` line 50) and is needed to generate a common identity for the common chat.

## Environment variables for contracts (not needed for running project locally)

```
ROPSTEN_MNEMONIC=
ROPSTEN_INFURA_PROJECT_ID=
```