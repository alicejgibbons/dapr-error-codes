//
// Copyright 2021 The Dapr Authors
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//     http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

const express = require('express');
const bodyParser = require('body-parser');
require('isomorphic-fetch');
const { DaprClient, CommunicationProtocolEnum } = require('@dapr/dapr');

const communicationProtocol = (process.env.DAPR_PROTOCOL === "grpc")
    ? CommunicationProtocolEnum.GRPC
    : CommunicationProtocolEnum.HTTP

const daprHost = process.env.DAPR_HOST ?? "localhost"

let daprPort
switch (communicationProtocol) {
    case CommunicationProtocolEnum.HTTP: {
        daprPort = process.env.DAPR_HTTP_PORT
        break
    }
    case CommunicationProtocolEnum.GRPC: {
        daprPort = process.env.DAPR_GRPC_PORT
        break
    }
    default: {
        port = 3500
    }
}

const stateStoreName = process.env.STATE_STORE_NAME ?? "statestore-und";
const queryStateStoreName = process.env.STATE_STORE_NAME ?? "statestore-im";
const pubSubName = process.env.PUBSUB_NAME ?? "pubsub";
const port = process.env.APP_PORT ?? "3000";

const daprClient = new DaprClient(
    daprHost, // Dapr sidecar address
    daprPort,    // Dapr HTTP port
    communicationProtocol
);

const app = express();
app.use(bodyParser.json());
//app.use(express.json());

// Get state in Dapr
app.get('/order/:orderId', async (req, res) => {
  try {
    console.log(`Getting state with client, order id: ${req.params.orderId}`);
    const response = await daprClient.state.get(stateStoreName, req.params.orderId);
    console.log(`Response: ${JSON.stringify(response)}`);
    return res.send(response);
  } catch (error) {
    console.log("Error caught is: " + error);
    var json = error.toString().replace("Error: ", "");
    json = JSON.parse(json);
    return res.status(500).send(json);
  }
});

// Dapr Binding
app.post('/binding', async (req, res) => {
  const bindingOperation = "create";
  const { bindingName, message } = req.body;

  try {
    const response = await daprClient.binding.send(bindingName, bindingOperation, message);
    console.log(`Response: ${JSON.stringify(response)}`);
    return res.send(`Binding request sent ${response}`);
  } catch (error) {
    console.log("Error caught is: " + error);
    var json = error.toString().replace("Error: ", "");
    json = JSON.parse(json);
    return res.status(500).send(json);
  }
});

// Querying state in Dapr
app.post('/query', async (req, res) => {
  const { query } = req.body;
  try {
    console.log(`Querying state store: ${query}`);
    const response = await daprClient.state.query(queryStateStoreName, query);
    console.log(`Response: ${JSON.stringify(response)}`);
    return res.send(`Queried state store: ${query}`);
  } catch (error) {
    console.log("Error caught is: " + error);
    var json = error.toString().replace("Error: ", "");
    json = JSON.parse(json);
    return res.status(500).send(json);
  }
});

// Dapr Publish/Subscribe 
app.post('/publish', async (req, res) => {
  const { topic, message } = req.body;
  try {
    console.log(`Publishing to topic: ${topic}`);
    const response = await daprClient.pubsub.publish(pubSubName, topic, message);
    console.log(`Response: ${JSON.stringify(response)}`);
    
    if (response.error){
      throw `Error publishing message to topic: ${topic}`;
    }
    return res.send(`Message published to ${topic}`);
  } catch (error) {
    return res.status(500).send(error);
  }
});

// // Save state in Dapr
// app.post('/order', async (req, res) => {
//   const { key, value } = req.body;
//   try {
//     console.log(`Saving state, order id: ${key}`);
//     const response = await daprClient.state.save(stateStoreName, [{ key, value }]);
//     console.log(`Response: ${JSON.stringify(response)}`);
//     if (response.error){
//       throw `Error saving state with key: ${key}`;
//     }
//     return res.send(`State saved with key: ${key}`);
//   } catch (error) {
//     console.log(error);
//     return res.status(500).send(error);
//   }
// });

app.listen(port, () => console.log(`Node App listening on port ${port}!`));
