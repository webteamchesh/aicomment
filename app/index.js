'use strict';
import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { NodejsClient } from 'contensis-management-api/lib/client/nodejs-client.js';

// Set some variables.
const port = 3001;
const ROOT_URL = `https://cms-${process.env.alias}.cloud.contensis.com/`;
const PROJECT = process.env.projectId;
//import {} from 'dotenv/config';
const client = NodejsClient.create({
  clientType: 'client_credentials',
  clientDetails: {
    clientId: process.env.CONTENSIS_CLIENT_ID,
    clientSecret: process.env.CONTENSIS_CLIENT_SECRET,
  },
  projectId: PROJECT,
  rootUrl: ROOT_URL,
});

// Optionally log all the environment variables.
let env = Object.keys(process.env).map(k => `${k}: ${process.env[k]}`);
env.sort();
env.forEach((e) => console.log(e));
// Start the server.
const app = express();
app.listen(port, () => {
  console.log(`Server listening on port ${port}.`);
});

// Log all requests to the server
const myLogger = function (req, _, next) {
  console.log(`Incoming: ${req.url}`);
  next();
};

// Middleware
app.use(express.json());
//app.use(express.static('public'));
app.use(cors());
app.use(myLogger);

// Routes
app.post('/*', (req, res) => {
  let entry = req.body;
  console.log(`Got a comment from ${entry.name}`);
  entry.sys = {
    id: uuidv4(),
    contentTypeId: 'prosandcons',
    projectId: PROJECT,
    language: 'en-GB',
    dataFormat: 'entry',
  };

  client.entries
    .create(entry)
    .then((_) => {
      res.writeHead(301, { Location: '/' });
      return res.end();
    })
    .catch((error) => {
      console.log(error);
      res.writeHead(301, { Location: '/' });
      return res.end();
    });
});
