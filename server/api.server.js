/* eslint-disable */
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict';

const register = require('react-server-dom-webpack/node-register');
register();
const babelRegister = require('@babel/register');

babelRegister({
  ignore: [/[\\\/](build|server|node_modules)[\\\/]/],
  presets: [['react-app', { runtime: 'automatic' }]],
  plugins: ['@babel/transform-modules-commonjs'],
});

const { v1: uuidv1 } = require('uuid');
const express = require('express');
const compress = require('compression');
const { readFileSync } = require('fs');
const { unlink, writeFile } = require('fs').promises;
const { pipeToNodeWritable } = require('react-server-dom-webpack/writer');
const path = require('path');
const { Pool } = require('pg');
const React = require('react');
const ReactApp = require('../src/App.server').default;

// Don't keep credentials in the source tree in a real app!
const pool = new Pool(require('../credentials'));

const PORT = process.env.PORT || 4000;
const app = express();

app.use(compress());
app.use(express.json());

app
  .listen(PORT, () => {
    console.log(`React Notes listening at ${PORT}...`);
  })
  .on('error', function(error) {
    if (error.syscall !== 'listen') {
      throw error;
    }
    const isPipe = (portOrPipe) => Number.isNaN(portOrPipe);
    const bind = isPipe(PORT) ? 'Pipe ' + PORT : 'Port ' + PORT;
    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit(1);
        break;
      default:
        throw error;
    }
  });

function handleErrors(fn) {
  return async function(req, res, next) {
    try {
      return await fn(req, res);
    } catch (x) {
      next(x);
    }
  };
}

app.get(
  '/',
  handleErrors(async function(_req, res) {
    await waitForWebpack();
    const html = readFileSync(path.resolve(__dirname, '../build/index.html'), 'utf8');
    // Note: this is sending an empty HTML shell, like a client-side-only app.
    // However, the intended solution (which isn't built out yet) is to read
    // from the Server endpoint and turn its response into an HTML stream.
    res.send(html);
  }),
);

async function renderReactTree(res, props) {
  await waitForWebpack();
  const manifest = readFileSync(
    path.resolve(__dirname, '../build/react-client-manifest.json'),
    'utf8',
  );
  const moduleMap = JSON.parse(manifest);
  pipeToNodeWritable(React.createElement(ReactApp, props), res, moduleMap);
}

function sendResponse(req, res, redirectpath, props = {}) {
  const location = req.query.location ? JSON.parse(req.query.location) : {};
  if (redirectpath) {
    location.path = redirectpath;
  }
  res.set('X-Location', JSON.stringify(location));
  renderReactTree(res, {
    path: location.path,
    ...props,
  });
}

app.get('/react', function(req, res) {
  sendResponse(req, res, null);
});

function generateRoomId() {
  return Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, '0');
}

app.post(
  '/room',
  handleErrors(function(req, res) {
    const requestedRoom = req.body.roomId;
    const roomId = requestedRoom || generateRoomId();

    sendResponse(req, res, roomId, { roomId, isGuest: requestedRoom });
  }),
);

app.use(express.static('build'));
app.use(express.static('public'));

async function waitForWebpack() {
  while (true) {
    try {
      readFileSync(path.resolve(__dirname, '../build/index.html'));
      return;
    } catch (err) {
      console.log('Could not find webpack build output. Will retry in a second...');
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}
