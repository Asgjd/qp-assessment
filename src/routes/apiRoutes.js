const express = require("express");
const api = require("../controllers/apiController");
const router = express.Router();

// Example route
// router.get('/list', api.list);
router.post("/add/grocery-items", api.addGroceryItem);
router.get("/view/grocery-items", api.getGroceryItems);
router.delete("/delete/grocery-items/:id", api.deleteGroceryItem);
router.put("/update/grocery-items/:id", api.updateGroceryItem);
router.post("/orders", api.createOrder);

module.exports = router;