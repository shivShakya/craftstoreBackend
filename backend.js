const express = require('express');
require('./config');
const User = require('./User');
const cors = require('cors');
const Product = require('./Product');

const Jwt = require('jsonwebtoken');
const jwtKey = 'shakya22';


const app = express();
app.use(cors());
app.use(express.json());


//user api
app.post('/register', async (req, res) => {

  let user = new User(req.body);
  let result = await user.save();
  result = result.toObject();
  delete result.password;
  Jwt.sign({ result }, jwtKey, { expiresIn: "2h" }, (err, token) => {
    if (err) {
      res.send("Soething went wrong, please try again after sometime");
    }
    res.send({ result, auth: token });
  })
});


app.post('/login', async (req, res) => {
  console.log(req.body);
  if (req.body.email && req.body.password) {
    let user = await User.findOne(req.body).select("-password");
    if (user) {
           res.send({ user});
      }else{
        res.send("No user found");
      }
    
    } else {
      res.send("no user found");
    }
  }

);

//product api 


app.post('/add-product', async (req, res) => {
  let product = new Product(req.body);
  let result = await product.save();
  console.warn(result);
});

app.get('/products', async (req, res) => {
  let products = await Product.find();
  if (products.length > 0) {
    res.send(products);
  } else {
    res.send("No Product found");
  }
});

app.delete("/products/:id", async (req, res) => {

  const result = await Product.deleteOne({ _id: req.params.id });
  res.send(result);
})

app.get("/product/:id", async (req, res) => {
  let result = await Product.findOne({ _id: req.params.id });
  if (result) {
    res.send(result)
  } else {
    res.send("no record found");
  }
})

app.put("/product/:id", async (req, res) => {
  let result = await Product.updateOne(
    { _id: req.params.id },
    {
      $set: req.body
    }
  )
  res.send(result);
})

app.get("/search/:key", async (req, res) => {
  let result = await Product.find({
    "$or": [
      { name: { $regex: req.params.key } }
    ]
  });
  res.send(result);
});

app.listen(3001);