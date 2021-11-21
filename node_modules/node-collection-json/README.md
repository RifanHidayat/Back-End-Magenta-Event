# node-collection-json

Lightweight JavaScript client/server for easy data exchange and manipulation of objects in a 
[Collection+JSON](http://amundsen.com/media-types/collection/) API. This library can be used in the browser and also 
server-side. It features, basic and advanced API querying capabilities. See below.

# Client Usage

The calls to the API listed below are based on an imaginary API which has the following schema:

```JSON
{
    "collection": {
        "version": "1.0",
        "href": "http://plants-api/api/plants",
        "links": [
            {
                "href": "http://plants-api/api",
                "rel": "root"
            },
            {
                "href": "http://plants-api/api/plants",
                "rel": "plants"
            }
        ],
        "queries": [
            {
                "href": "http://plants-api/api/search",
                "rel": "search",
                "data": [
                    {
                        "name": "name",
                        "value": "",
                        "prompt": "The plant name"
                    }
                ]
            }
        ],
        "template": {
            "data": [
                {
                    "name": "name",
                    "value": "",
                    "prompt": "Plant Name"
                },
                {
                    "name": "type",
                    "value": "",
                    "prompt": "Plant type"
                },
                {
                    "name": "color",
                    "value": "",
                    "prompt": "Plant color"
                }
            ]
        }
    }
}
```

## Query/Crawl the API

Query and crawl the Collection+JSON API.

```javascript
import {CJClient} from 'node-collection-json';

// create client
let client = new CJClient("http://plants-api/api");

// get the collection
client.getCollection().then( collection => {

  // follow a link
  collection.getLinkByRel('plants').follow().then( collection => {

    // display the data to console
    console.log("FOLLOW LINK", JSON.stringify(collection.getJson(), null, 2));

  });
}).catch( collection => {

    // display the data to console
    console.log("Crawl ERROR", JSON.stringify(collection.getJson(), null, 2));
});
```

##  POST Data to the API

Post data to the API from the Template object.

```javascript
import {CJClient} from 'node-collection-json';

// create client
let client = new CJClient("http://plants-api/api");

// get the collection
client.getCollection().then( collection => {

  // follow a link
  collection.getLinkByRel('plants').follow().then( collection => {

    // get the template object and add data
    collection.getTemplate()
      .setData('type', 'fruit')
      .setData('name', 'apple')
      .setData('color', 'red');

    // post the template object to the API
    collection.post().then( collection  => {

      // display the data to console
      console.log("CREATED DATA", JSON.stringify(collection.getJson(), null, 2));
    }).catch( collection => {

        // display the data to console
        console.log("POST ERROR", JSON.stringify(collection.getJson(), null, 2));
    });
  }).catch( collection => {

      // display the data to console
      console.log("Follow Link ERROR", JSON.stringify(collection.getJson(), null, 2));
  });
}).catch( collection => {

    // display the data to console
    console.log("Crawl ERROR", JSON.stringify(collection.getJson(), null, 2));
});
```

##  Query/Update the API

Update data based on the Template object.

```javascript
import {CJClient} from 'node-collection-json';

// create client
let client = new CJClient("http://plants-api/api");

// get the collection
client.getCollection().then( collection => {

  // follow a link
  collection.getLinkByRel('plants').follow().then( collection => {

    // query the server
    collection.getQueryByRel('search').setData('name', 'apple').query().then( collection => {

      // import the first item to the template
      let template = collection.getTemplate();
      template.importItem(collection.getFirstItem());

      // update the item
      template.setData('type', 'fruit')
      template.setData('name', 'banana')
      template.setData('color', 'yellow');

      // save the data
      collection.put(collection.getFirstItem().getHref()).then( collection => {

        // display the data to console
        console.log("CREATED DATA", JSON.stringify(collection.getJson(), null, 2));
      }).catch( collection => {

          // display the data to console
          console.log("Update ERROR", JSON.stringify(collection.getJson(), null, 2));
      });
    }).catch( collection => {

        // display the data to console
        console.log("Query ERROR", JSON.stringify(collection.getJson(), null, 2));
    });
  }).catch( collection => {

      // display the data to console
      console.log("Follow Link ERROR", JSON.stringify(collection.getJson(), null, 2));
  });
}).catch( collection => {

    // display the data to console
    console.log("Crawl ERROR", JSON.stringify(collection.getJson(), null, 2));
});
```
##  Query/Delete from API

Query/crawl the API and delete and Item.

```javascript
import {CJClient} from 'node-collection-json';

// create client
let client = new CJClient("http://plants-api/api");

// get the collection
client.getCollection().then( collection => {

  // follow a link
  collection.getLinkByRel('plants').follow().then( collection => {

    // query the server
    collection.getQueryByRel('search').setData('name', 'banana').query().then( collection => {

      // save the data
      collection.getFirstItem().delete().then( collection => {

        // display the data to console
        console.log("DELETED DATA", JSON.stringify(collection.getJson(), null, 2));
      }).catch( collection => {

          // display the data to console
          console.log("Update ERROR", JSON.stringify(collection.getJson(), null, 2));
      });
    }).catch( collection => {

        // display the data to console
        console.log("Query ERROR", JSON.stringify(collection.getJson(), null, 2));
    });
  }).catch( collection => {

      // display the data to console
      console.log("Follow Link ERROR", JSON.stringify(collection.getJson(), null, 2));
  });
}).catch( collection => {

    // display the data to console
    console.log("Crawl ERROR", JSON.stringify(collection.getJson(), null, 2));
});
```
## Advanced Query Syntax

Complex/multiple API queries can be built and executed in the following manner.

```javascript
// create the client and build the query
let client = new Client("http://api.test.com", {}, Client.API, new Cache(10000));
let queryBuilder = new QueryBuilder();
queryBuilder.item('orders').addParams({"id" : "54321"}).setIndex(0)
            .item('customer').setIndex(0)
            .item('addresses').search("zipCode", "12345");

// query the API
client.query(queryBuilder).then(function (collection) {
    // output the street address
    console.log(item.get("streetAddress"));
}).catch( collection => {
    console.log("Crawl ERROR", JSON.stringify(collection.getJson(), null, 2));
});
```

The previous example hops/crawls the API and fetches the desired data. This example refers to an imaginary API, so the 
parameters are invented for the purpose of explanation. The following processes are executed:

1. The client goes to the root of the API: http://api.test.com and loads the data.
2. It searches for a link with the rel tag "orders". When and if found, it appends the parameter: id=1234 to the link 
address. The setIndex(0) method, tells the client to select the first item and pass the collection to the next query. 
The following query link is built: http://api.test.com/orders?id=54321
3. It searches the "customer" rel located in the item object follows the link and loads the data. Again, setIndex(0) 
fetches the first item object in the items array of the collection. The following query is built:
http://api.test.com/customer/54321
4. Finally, it  fetches the "address" rel link from the customer item object, loads the data then searches the resulting
item object for a key/value that matches "zipCode" and "12345". This final object is returned back to userland, where it
can then be manipulated and displayed. The following query is built: http://api.test.com/addresses?customer=54321

## Caching

Previous queries are cached in the client, so that extraneous queries for the same data sets are not executed again. This
speeds up the response time. The cache accepts a time to live value (TTL) in seconds. This means, that after the TTL has
been exceeded, the client will automatically re-query the data from the API.

The cache object is added to the constructor of Client:

```javascript
// create cache object and add to constructor of client
let cache = new Cache();
let client = new Client("http://api.test.com", {}, Client.API, cache);
```

If no TTL is set in the Cache constructor, the default value is set to two minutes. If caching is not desired, no caching
object is required in the Client constructor.

```javascript
// create cache object and set TTL to 5 minutes.
let client = new Client("http://api.test.com", {}, Client.API, new Cache(300));
```
