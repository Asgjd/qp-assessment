let mongoConnection = require("../utils/mongoUtils");
const { ObjectId } = require("mongodb");

let model = "myCollection"; // Global model definition
module.exports = {

   GroceryItem : async ({ name, price, description, inventoryCount }) => {
    try {
      const body = { name, price, description, inventoryCount };
      const res = await mongoConnection.mongoInsertOne(model, body); // Insert into MongoDB
  
      return res ? res : null;
    } catch (err) {
      console.error("Error in GroceryItem function:", err);
      throw err;
    }
  },
  
   GroceryItemFindByName : async (name) => {
    try {
      const item = await mongoConnection.mongoFindOne(model, { name }); // Find item by name
      return item;
    } catch (err) {
      console.error("Error in GroceryItemFindByName:", err);
      throw err;
    }
  },
  
   GroceryItemUpdate : async (name, updates) => {
    try {
      const result = await mongoConnection.mongoUpdateOne(model, { name }, { $set: updates }); // Update item
      return result ? result : null;
    } catch (err) {
      console.error("Error in GroceryItemUpdate:", err);
      throw err;
    }
  },
  
   getGroceryItem : async (isAdmin) => {
    try {
      const query = isAdmin ? {} : { inventoryCount: { $gt: 0 } };
  
      const res = await mongoConnection.mongoFind(model, query);
  
      return res ? res : null;
    } catch (err) {
      console.error("Error in GroceryItem function:", err);
      throw err;
    }
  },
  
   findAndDeleteById : async (id) => {
    try {
      const result = await mongoConnection.mongoDelete(model, { _id: new ObjectId(id) });
  
      if (result.deletedCount > 0) {
        return { success: true, result };
      }
      return { success: false, message: "Document not found" };
    } catch (error) {
      console.error("Error deleting document:", error);
      return {
        success: false,
        message: "Error occurred during deletion",
        error: error.message,
      };
    }
  },
  
   findByIdAndUpdate : async (id, updateData) => {
    try {
      if (!ObjectId.isValid(id)) {
        throw new Error("Invalid ID format");
      }
  
      // Ensure updateData includes atomic operators like `$set`
      const updateWithOperators = {
        $set: {
          name: updateData.name,
          price: updateData.price,
          description: updateData.description,
          inventoryCount: updateData.inventoryCount,
        },
      };
  
      const updatedDoc = await mongoConnection.mongoUpdateOne(model, { _id: new ObjectId(id) }, updateWithOperators);
  
      if (!updatedDoc || updatedDoc.matchedCount === 0) {
        return { success: false, message: "Document not found" };
      } else {
        return { success: true, data: updatedDoc };
      }
    } catch (error) {
      console.error("Error updating document:", error);
      return { success: false, message: "Error occurred during update", error: error.message };
    }
  },
  
   findGroceryItemById : async (itemId) => {
    const items = await mongoConnection.mongoFind(model, { _id: new ObjectId(itemId) });
    return items[0] || null;
  },
  
   updateGroceryItemInventory : async (itemId, newInventoryCount) => {
    return await mongoConnection.mongoUpdateOne(model, { _id: new ObjectId(itemId) }, { $set: { inventoryCount: newInventoryCount } });
  },
  
   createOrder : async (orderData) => {
    const collection = "orders";
    const result = await mongoConnection.mongoInsertOne(collection, orderData);
    return result || null;
  },
  
   findOrderByUserIdAndItems : async (userId, orderItems) => {
    try {
      const query = { userId, items: { $all: orderItems.map(item => ({ item: item.item, quantity: item.quantity })) } };
      const orders = await mongoConnection.mongoFind("orders", query);
      return orders[0] || null;
    } catch (err) {
      console.error("Error finding order:", err);
      throw err;
    }
  },
  
   updateOrderItems : async (orderId, orderItems) => {
    try {
      const update = {
        $set: { items: orderItems },
        $inc: { "totalPrice": orderItems.reduce((total, item) => total + item.price, 0) } // Update total price
      };
      const result = await mongoConnection.mongoUpdateOne("orders", { _id: new ObjectId(orderId) }, update);
      return result ? { ...result } : null;
    } catch (err) {
      console.error("Error updating order:", err);
      throw err;
    }
  }
  
};
