import Cache from '../src/Cache';
import Client from '../src/Client';
import Collection from '../src/Collection';
import Data from '../src/Data';
import Error from '../src/Error';
import Item from '../src/Item';
import Link from '../src/Link';
import QueryBuilder from '../src/QueryBuilder';
import Template from '../src/Template';
import chai, { expect } from 'chai';

chai.config.includeStack = true;

describe('Collection+Json Library', () => {

  const validData = {
    name: 'name',
    value: 'value',
    "prompt": 'prmpt',
  };

  const validError = {
    title: 'title',
    code: '200',
    message: 'message',
  };

  const validLink = {
    link: 'link',
    rel: 'test',
    render: 'image',
  };

  const validTemplate = {
    data: [
      {
        name: "name1",
        value: "value1",
      },
      {
        name: "name2",
        value: "value2",
      },
    ],
  };

  const validCollection = `{ "collection" :
  {
    "version" : "1.0",
    "href" : "http://example.org/friends/",

    "links" : [
      {"rel" : "feed", "href" : "http://example.org/friends/rss"}
    ],

    "items" : [
      {
        "href" : "http://example.org/friends/jdoe",
        "data" : [
          {"name" : "full-name", "value" : "J. Doe", "prompt" : "Full Name"},
          {"name" : "email", "value" : "jdoe@example.org", "prompt" : "Email"}
        ],
        "links" : [
          {"rel" : "blog", "href" : "http://examples.org/blogs/jdoe", "prompt" : "Blog"},
          {"rel" : "avatar", "href" : "http://examples.org/images/jdoe", "prompt" : "Avatar", "render" : "image"}
        ]
      },

      {
        "href" : "http://example.org/friends/msmith",
        "data" : [
          {"name" : "full-name", "value" : "M. Smith", "prompt" : "Full Name"},
          {"name" : "email", "value" : "msmith@example.org", "prompt" : "Email"}
        ],
        "links" : [
          {"rel" : "blog", "href" : "http://examples.org/blogs/msmith", "prompt" : "Blog"},
          {"rel" : "avatar", "href" : "http://examples.org/images/msmith", "prompt" : "Avatar", "render" : "image"}
        ]
      },

      {
        "href" : "http://example.org/friends/rwilliams",
        "data" : [
          {"name" : "full-name", "value" : "R. Williams", "prompt" : "Full Name"},
          {"name" : "email", "value" : "rwilliams@example.org", "prompt" : "Email"}
        ],
        "links" : [
          {"rel" : "blog", "href" : "http://examples.org/blogs/rwilliams", "prompt" : "Blog"},
          {"rel" : "avatar", "href" : "http://examples.org/images/rwilliams", "prompt" : "Avatar", "render" : "image"}
        ]
      }
    ],

    "queries" : [
      {"rel" : "search", "href" : "http://example.org/friends/search", "prompt" : "Search",
        "data" : [
          {"name" : "search", "value" : ""}
        ]
      }
    ],

    "template" : {
      "data" : [
        {"name" : "full-name", "value" : "", "prompt" : "Full Name"},
        {"name" : "email", "value" : "", "prompt" : "Email"},
        {"name" : "blog", "value" : "", "prompt" : "Blog"},
        {"name" : "avatar", "value" : "", "prompt" : "Avatar"}

      ]
    },
    "error" : {
      "title" : "Server Error",
      "code" : "X1C2",
      "message" : "The server have encountered an error, please wait and try again."
    }
  }
}`;

  let client;

  describe('Import a collection object', () => {
    it('should import a valid collection object', (done) => {

      let collection = Collection.getByObject(JSON.parse(validCollection));
      //console.log("JSON", JSON.stringify(collection.getJson(), null, 2));
      expect(collection.getHref()).to.equal("http://example.org/friends/");
      expect(collection.getVersion()).to.equal(Collection.VERSION);
      expect(collection.getLinks().length).to.equal(1);
      expect(collection.getItems().length).to.equal(3);
      expect(collection.getQueries().length).to.equal(1);
      expect(collection.getTemplate().getData().length).to.equal(4);
      expect(collection.getError().getTitle()).to.equal("Server Error");

      // get the link by name
      let link = collection.getLinkByRel('feed');
      expect(link.getHref()).to.equal('http://example.org/friends/rss');

      link = collection.getLinkByRel('no_link');
      expect(link.getHref()).to.equal(null);
      done();
    });
  });


  describe('Create data object', () => {
    it('should create a valid data object', (done) => {
      let data = new Data(validData.name, validData.value, validData.prompt);
      expect(validData.name).to.equal(data.getName());
      expect(validData.value).to.equal(data.getValue());
      expect(validData.prompt).to.equal(data.getPrompt());

      expect(validData.name).to.equal(data.getJson().name);
      expect(validData.value).to.equal(data.getJson().value);
      expect(validData.prompt).to.equal(data.getJson().prompt);
      done();
    });
  });

  describe('Create error object', () => {
    it('should create a valid error object', (done) => {
      let error = new Error(validError.title, validError.code, validError.message);
      expect(error.getTitle()).to.equal(validError.title);
      expect(error.getCode()).to.equal(validError.code);
      expect(error.getMessage()).to.equal(validError.message);

      let json = error.getJson();
      expect(json.title).to.equal(validError.title);
      expect(json.code).to.equal(validError.code);
      expect(json.message).to.equal(validError.message);
      done();
    });
  });

  describe('Create link object', () => {
    it('should create a valid link object', (done) => {
      let link = new Link(validLink.link, validLink.rel);

      let json = link.getJson();
      expect(json.href).to.equal(validLink.link);
      expect(json.rel).to.equal(validLink.rel);
      expect(json.render).to.equal(undefined);
      done();
    });
  });

  describe('Create template object', () => {
    it('should create a valid template object', (done) => {
      let template = new Template();
      let data1 = new Data(validTemplate.data[0].name, validTemplate.data[0].value);
      template.addData(data1);
      let data2 = new Data(validTemplate.data[1].name, validTemplate.data[1].value);
      template.addData(data2);

      let json = template.getJson();
      expect(json.data[0].name).to.equal(validTemplate.data[0].name);
      expect(json.data[0].value).to.equal(validTemplate.data[0].value);
      done();
    });
  });

  describe('import item into template object', () => {
    it('should create a valid template object', (done) => {
      let collection = Collection.getByObject(JSON.parse(validCollection));
      let item = collection.getFirstItem();
      collection.getTemplate().importItem(item);

      expect(collection.getTemplate().get('full-name')).to.equal("J. Doe");
      expect(collection.getTemplate().get('email')).to.equal("jdoe@example.org");
      let json = collection.getTemplate().asJson();
      json["full-name"] = "Changed Name";

      collection.getTemplate().importJson(json);
      expect(collection.getTemplate().get('full-name')).to.equal("Changed Name");
      expect(collection.getTemplate().get('email')).to.equal("jdoe@example.org");
      done();
    });
  });

  describe('Create item object', () => {
    it('should create a valid item object', (done) => {

      // create the item object
      let url = "https://example.com/testme";
      let item = new Item(url);

      // add the data
      let data1 = new Data(validTemplate.data[0].name, validTemplate.data[0].value);
      item.addData(data1);
      let data2 = new Data(validTemplate.data[1].name, validTemplate.data[1].value);
      item.addData(data2);

      // add the links
      let prompt1 = "Prom1";
      let prompt2 = "Prom2";
      let link = new Link(validLink.link, validLink.rel);
      link.setPrompt(prompt1);
      item.addLink(link);
      link = new Link(validLink.link, validLink.rel);
      link.setPrompt(prompt2);
      item.addLink(link);

      // get the JSON object
      let json = item.getJson();

      // test the data
      expect(json.href).to.equal(url);
      expect(json.data[0].name).to.equal(validTemplate.data[0].name);
      expect(json.data[0].value).to.equal(validTemplate.data[0].value);
      expect(json.data[1].name).to.equal(validTemplate.data[1].name);
      expect(json.data[1].value).to.equal(validTemplate.data[1].value);
      expect(json.links[1].href).to.equal(validLink.link);
      expect(json.links[1].value).to.equal(validLink.value);

      // test the getter
      let expectedValue = item.get(validTemplate.data[0].name);
      expect(expectedValue).to.equal(validTemplate.data[0].value);

      // test the setter
      let value = "1234";
      item.set(validTemplate.data[0].name, value)
      expectedValue = item.get(validTemplate.data[0].name);
      expect(expectedValue).to.equal(value);
      done();
    });
  });

  describe('Create Collection object', () => {
    it('should create a valid collection object', (done) => {

      let urlCollection = "https://example.com";

      // create the item object
      let url1 = "https://example.com/item";
      let item = new Item(url1);

      // add the data
      let data1 = new Data(validTemplate.data[0].name, validTemplate.data[0].value);
      item.addData(data1);
      let data2 = new Data(validTemplate.data[1].name, validTemplate.data[1].value);
      item.addData(data2);

      // add the links
      let prompt1 = "Prom1";
      let prompt2 = "Prom2";
      let link = new Link(validLink.link, validLink.rel);
      link.setPrompt(prompt1);
      item.addLink(link);
      link = new Link(validLink.link, validLink.rel);
      link.setPrompt(prompt2);
      item.addLink(link);

      // create the collection
      let collection = new Collection(urlCollection);

      // add the item
      collection.addItem(item);

      // get the JSON object
      let json = collection.getJson();

      // test the data
      expect(json.collection.version).to.equal(Collection.VERSION);
      expect(json.collection.href).to.equal(urlCollection);
      expect(json.collection.items[0].data[0].name).to.equal(validTemplate.data[0].name);
      expect(json.collection.items[0].data[0].value).to.equal(validTemplate.data[0].value);
      expect(json.collection.items[0].data[1].name).to.equal(validTemplate.data[1].name);
      expect(json.collection.items[0].data[1].value).to.equal(validTemplate.data[1].value);
      expect(json.collection.items[0].links[1].href).to.equal(validLink.link);
      expect(json.collection.items[0].links[1].value).to.equal(validLink.value);

      //console.log("ITEMS", JSON.stringify(collection.itemsAsJson(), null, 2));

      done();
    });
  });

  describe('Data Cache', () => {

    it('should cache the data', (done) => {

      let numberAccessed = 5;
      let coll           = null;
      let resource       = "http://example.org/friends/"
      let collection     = Collection.getByObject(JSON.parse(validCollection));
      let client         = new Client(collection, {}, Client.JSON, new Cache(100));
      for (var i = 0; i < numberAccessed; i++) {
        coll = client.getCollectionByResource(resource);
      }

      expect(numberAccessed).to.equal(client.getCache().getAccessedByResource(resource));
      done();
    });

    it('should not cache the data', (done) => {

      let resource = "http://example.org/friends/"
      let collection = Collection.getByObject(JSON.parse(validCollection));
      let client     = new Client(collection, {}, Client.JSON, new Cache(0));

      expect(0).to.equal(client.getCache().getAccessedByResource(resource));
      done();
    });
  });
});
