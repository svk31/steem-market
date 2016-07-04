# Proof of concept market view for Steem internal market

The repo contains both backend and frontend code.

## Backend
Express server with socket.io that hosts the static html files and emits updates
over a websocket whenever the market state changes.

 ## Frontend

Basic depth  chart and orderbook view that live updates as changes happen, no need
to refresh.

## Installation
Node v6+ is required.

```
git clone https://github.com/svk31/steem-market.git
cd steem-market
cp config_example.js config.js
npm install
npm start;
```
If you want to edit the frontend files, run `npm run build` in a new terminal
window.

By default this will launch a server at 127.0.0.1:3000 that you can access in
your browser.
