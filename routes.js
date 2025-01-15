const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, PUT, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, Content-Type")
  res.send("route")
})

module.exports = router