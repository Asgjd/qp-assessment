let __dbo = require("./dbo");
module.exports = {
  addGroceryItem: async (req, res) => {
    try {
      const { name, price, description, inventoryCount } = req.body;
  
      // Validate required fields
      if (!name || !price || !description || inventoryCount == null) {
        return res.status(400).json({ error: "All fields are required" });
      }
      // Check if the item already exists in the database
      const existingItem = await __dbo.GroceryItemFindByName(name);
  
      if (existingItem) {
        return res.status(500).json({ error: "Item already exist" });
      }
  
      // If the item does not exist, create a new item
      const newItem = await __dbo.GroceryItem({ name, price, description, inventoryCount });
  
      // Check if item was successfully created
      if (!newItem) {
        return res.status(500).json({ error: "Failed to add item" });
      }
      // Return success response
      res.status(201).json({ message: "Item added successfully", item: newItem });
  
    } catch (error) {
      console.error("Error in addGroceryItem:", error);
      res.status(500).json({ error: "Failed to add or update item" });
    }
  },

  getGroceryItems: async (req, res) => {
    try {
        const { isAdmin } = req.query;

        // Ensure isAdmin is a boolean
        const adminFlag = isAdmin === "true";

        // Fetch items based on isAdmin flag
        const items = await __dbo.getGroceryItem(adminFlag);

        res.status(200).json(items);
    } catch (error) {
        console.error("Error in getGroceryItems:", error);
        res.status(500).json({ error: "Failed to retrieve items" });
    }
  },

  deleteGroceryItem: async (req, res) => {
    try {
      const { id } = req.params;

      const result = await __dbo.findAndDeleteById(id);
      if (!result) return res.status(404).json({ error: "Item not found" });
      res.status(200).json({ message: "Item removed successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to remove item" });
    }
  },
  
  updateGroceryItem: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, price, description, inventoryCount } = req.body;
      const updatedItem = await __dbo.findByIdAndUpdate(id, { name, price, description, inventoryCount }, { new: true });
      if (!updatedItem) return res.status(404).json({ error: "Item not found" });

      res.status(200).json({ message: "Item updated successfully", item: updatedItem });
    } catch (error) {
      res.status(500).json({ error: "Failed to update item" });
    }
  },

  createOrder: async (req, res) => {
    try {
      const { userId, items } = req.body; // items is an array of { itemId, quantity }
      const orderItems = [];
  
      for (let item of items) {
        const groceryItem = await __dbo.findGroceryItemById(item.itemId);
  
        if (groceryItem && groceryItem.inventoryCount >= item.quantity) {
          // Add to order items
          orderItems.push({
            item: groceryItem._id,
            quantity: item.quantity,
            price: groceryItem.price * item.quantity,
          });
  
          // Update inventory count
          await __dbo.updateGroceryItemInventory(item.itemId, groceryItem.inventoryCount - item.quantity);
        } else {
          return res.status(400).json({ error: `Item ${item.itemId} is not available in the required quantity`});
        }
      }
      // Calculate total price
      const totalPrice = orderItems.reduce((total, item) => total + item.price, 0);
  
      // Check if an order already exists for the user with the same items
      const existingOrder = await __dbo.findOrderByUserIdAndItems(userId, orderItems);
  
      if (existingOrder) {
        // If the order exists, update the quantity of the items
        const updatedOrder = await __dbo.updateOrderItems(existingOrder._id, orderItems);
        
        return res.status(200).json({ message: "Order updated successfully", order: updatedOrder });
      }
  
      // If no existing order, create a new order
      const order = await __dbo.createOrder({
        userId,
        items: orderItems,
        totalPrice,
        status: "pending",
      });
  
      return res.status(201).json({ message: "Order placed successfully", order });
    } catch (error) {
      console.error("Error creating order:", error);
      return res.status(500).json({ error: "Failed to create order" });
    }
  }
};
