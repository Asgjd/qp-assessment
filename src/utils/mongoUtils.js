const { MongoClient } = require("mongodb");
require("dotenv").config();

class MongoUtils {
  constructor() {
    this.mongoClient = null;
    this.mongoClientDB = null;
  }

  /**
   * Initialize MongoDB connection
   */
  async connect() {
    if (!this.mongoClient) {
      console.log;
      try {
        this.mongoClient = new MongoClient(process.env.MONGO_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        await this.mongoClient.connect();
        this.mongoClientDB = this.mongoClient.db(process.env.DB_NAME);
        console.log("MongoDB Connected");
      } catch (err) {
        console.error("MongoDB Connection Error:", err.message);
        throw err;
      }
    }
  }

  /**
   * Generic find query
   * @param {string} model - Collection name
   * @param {Object} query - Query filter
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - List of documents
   */
  async mongoFind(model, query = {}, options = {}) {
    const thisCollection = this.mongoClientDB.collection(model);
    return await thisCollection.find(query, options).toArray();
  }

  /**
   * Generic findOne query
   * @param {string} model - Collection name
   * @param {Object} query - Query filter
   * @returns {Promise<Object>} - Single document
   */
  async mongoFindOne(model, query = {}) {
    const thisCollection = this.mongoClientDB.collection(model);
    return await thisCollection.findOne(query);
  }

  /**
   * Generic update query
   * @param {string} model - Collection name
   * @param {Object} query - Query filter
   * @param {Object} update - Update operations
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - Update result
   */

  async mongoUpdateOne(model, filter, updateDoc) {
    const thisCollection = this.mongoClientDB.collection(model);
    return await thisCollection.updateOne(filter, updateDoc);
  }

  /**
   * Generic delete query
   * @param {string} model - Collection name
   * @param {Object} query - Query filter
   * @returns {Promise<Object>} - Delete result
   */
  async mongoDelete(model, query) {
    const thisCollection = this.mongoClientDB.collection(model);
    return await thisCollection.deleteOne(query);
  }

  async mongoInsertOne(model, doc) {
    try {
      const thisCollection = this.mongoClientDB.collection(model);
      const result = await thisCollection.insertOne(doc); // Insert the document
      return result; // Return the inserted document (ops is where the inserted document is stored)
    } catch (err) {
      console.error("Error inserting document:", err);
      throw err;
    }
  }

  /**
   * Close MongoDB connection
   */
  async close() {
    if (this.mongoClient) {
      await this.mongoClient.close();
      this.mongoClient = null;
      this.mongoClientDB = null;
      console.log("MongoDB Connection Closed");
    }
  }
}

module.exports = new MongoUtils();