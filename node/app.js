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

const express = require("express");
const bodyParser = require("body-parser");
require("isomorphic-fetch");
const { DaprClient, CommunicationProtocolEnum } = require("@dapr/dapr");

const communicationProtocol =
  process.env.DAPR_PROTOCOL === "grpc"
    ? CommunicationProtocolEnum.GRPC
    : CommunicationProtocolEnum.HTTP;

const daprHost = process.env.DAPR_HOST ?? "localhost";
let port = process.env.APP_PORT ?? "3000";

let daprPort;
switch (communicationProtocol) {
  case CommunicationProtocolEnum.HTTP: {
    daprPort = process.env.DAPR_HTTP_PORT;
    break;
  }
  case CommunicationProtocolEnum.GRPC: {
    daprPort = process.env.DAPR_GRPC_PORT;
    break;
  }
  default: {
    port = 3500;
  }
}

const daprClient = new DaprClient(
  daprHost, // Dapr sidecar address
  daprPort, // Dapr HTTP port
  communicationProtocol
);

const app = express();
app.use(bodyParser.json());

const stateStoreName = process.env.STATE_STORE_NAME ?? "statestoree";
// Get Dapr state
app.get("/order/:orderId", async (req, res) => {
  try {
    console.log(`Getting state with client, order id: ${req.params.orderId}`);
    const response = await daprClient.state.get(
      stateStoreName,
      req.params.orderId
    );
    console.log(`Response: ${JSON.stringify(response)}`);
    return res.send(response);
  } catch (error) {
    console.error("Error caught is: " + error.message);
    return res.status(500).send(error.message);
  }
});

// Invoke Dapr Binding
app.post("/binding", async (req, res) => {
  const bindingOperation = "create";
  const { bindingName, message } = req.body;

  try {
    const response = await daprClient.binding.send(
      bindingName,
      bindingOperation,
      message
    );
    console.log(`Response: ${JSON.stringify(response)}`);
    return res.send(`Binding request sent ${response}`);
  } catch (error) {
    console.error("Error caught is: " + error.message);
    return res.status(500).send(error.message);
  }
});

const queryStateStoreName = process.env.STATE_STORE_NAME ?? "statestore-im";

// Querying state in Dapr
app.post("/query", async (req, res) => {
  const { query } = req.body;
  try {
    console.log(`Querying state store: ${query}`);
    const response = await daprClient.state.query(queryStateStoreName, query);
    console.log(`Response: ${JSON.stringify(response)}`);
    return res.send(`Queried state store: ${query}`);
  } catch (error) {
    console.error("Error caught is: " + error.message);
    return res.status(500).send(error.message);
  }
});

const pubSubName = process.env.PUBSUB_NAME ?? "pubsub";

// Dapr Publish/Subscribe
app.post("/publish", async (req, res) => {
  const { topic, message } = req.body;

  console.log(`Publishing to topic: ${topic}`);
  const response = await daprClient.pubsub.publish(pubSubName, topic, message);
  console.log(`Response: ${JSON.stringify(response)}`);

  if (response.error) {
    console.error("Error response:", response.error);
    return res.status(500).send(response.error.message);
  }
  return res.send(`Message published to ${topic}`);
});








// Save state in Dapr
app.post("/order", async (req, res) => {
  const { key, value } = req.body;

  console.log(`Saving state, order id: ${key}`);
  const response = await daprClient.state.save(stateStoreName, [
    { key, value },
  ]);
  console.log(`Response: ${JSON.stringify(response)}`);
  if (response.error) {
    console.error("Error response:", response.error);
    return res.status(500).send(response.error.message);
  }
  return res.send(`State saved with key: ${key}`);
});

app.listen(port, () => console.log(`Node App listening on port ${port}!`));
