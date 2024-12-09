#
# Copyright 2021 The Dapr Authors
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#     http://www.apache.org/licenses/LICENSE-2.0
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

import os
import requests
import time
import random

dapr_http_endpoint = os.getenv("DAPR_HTTP_ENDPOINT", "http://localhost:3500")
dapr_url_get = "{}/order/1".format(dapr_http_endpoint)
dapr_url_binding = "{}/binding".format(dapr_http_endpoint)
dapr_url_query = "{}/query".format(dapr_http_endpoint)
dapr_url_publish = "{}/publish".format(dapr_http_endpoint)

def invoke_app(option):
    match option:
        case 1:
            print("\nCalling {}".format(dapr_url_get))
            try:
                response = requests.get(dapr_url_get, timeout=5, headers = {"dapr-app-id": "nodeapp"})
                if not response.ok:
                    print("HTTP %d => %s" % (response.status_code,
                                        response.content.decode("utf-8")), flush=True)
            except Exception as e:
                print(e, flush=True)
            return dapr_url_get
        case 2:
            print("\nCalling {}".format(dapr_url_binding))
            message = {"bindingName": "order-binding", "message":"Hello from Dapr Binding!"}
            try:
                response = requests.post(dapr_url_binding, json=message, timeout=5, headers = {"dapr-app-id": "nodeapp", 'Content-type': 'application/json'})
                if not response.ok:
                    print("HTTP %d => %s" % (response.status_code,
                                            response.content.decode("utf-8")), flush=True)
            except Exception as e:
                print(e, flush=True)
            return dapr_url_binding
        case 3:
            print("\nCalling {}".format(dapr_url_query))
            message = {"query": "SELECT var1, var2, var3 from myTable LIMIT 10"}
            try:
                response = requests.post(dapr_url_query, json=message, timeout=5, headers = {"dapr-app-id": "nodeapp", 'Content-type': 'application/json'})
                if not response.ok:
                    print("HTTP %d => %s" % (response.status_code,
                                            response.content.decode("utf-8")), flush=True)
            except Exception as e:
                print(e, flush=True)
            return dapr_url_query
        case 4:
            print("\nCalling {}".format(dapr_url_publish))
            message = {"topic": "topic4", "message":"Hello from Dapr Pubsub!"}
            try:
                response = requests.post(dapr_url_publish, json=message, timeout=5, headers = {"dapr-app-id": "nodeapp", 'Content-type': 'application/json'})
                if not response.ok:
                    print("HTTP %d => %s" % (response.status_code,
                                            response.content.decode("utf-8")), flush=True)
            except Exception as e:
                print(e, flush=True)
            return dapr_url_publish
        case _:
            return "Invalid option"

n = 0
while True:
    # Randomly choose an option between 1 and 4
    random_option = random.randint(1, 4)
    result = invoke_app(random_option)

    # Print the result
    print(f"Completed call: {result}")

    time.sleep(2)
