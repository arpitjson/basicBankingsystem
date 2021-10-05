//jshint esversion:6
require("dotenv").config();
const path = require('path');
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const Customer = require("./models/customers");



const app = express();

const PORT = process.env.PORT || 3000;

const URI = process.env.MONGODB_URL;

mongoose.connect(URI, {
   //useCreatendex: true, 
   //useFindAndModify: false, 
   useNewUrlParser: true, 
   useUnifiedTopology: true 
}, err => {
   if(err) throw err;
   console.log('Connected to MongoDB!')
})



app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("home", {
    activeTab: "home"
  });
});

app.get("/about", (req, res) => {
  res.render("about", { activeTab: "about" });
});

app.get("/contact", (req, res) => {
  res.render("contact", {
    activeTab: "contact"
  });
});

app.get("/customers", (req, res) => {
  Customer.find((err, docs) => {
    if (err) {
      console.log(err);
    } else {
      res.render("customers", {
        activeTab: "customers",
        customers: docs,
        custName: custName,
        custBalance: custBalance,
      });
    }
  });
});

let custName = "";
let custBalance = "";
let recieverName = "";

app.get("/customers/:custName1", (req, res) => {
  let name = req.params.custName1;
  Customer.findOne({ name: name }, (err, doc) => {
    if (err) {
      console.log(err);
    } else {
      custName = doc.name;
      custBalance = doc.balance;
      Customer.find({ name: { $ne: name } }, (err, docs) => {
        if (err) {
          console.log(err);
        } else {
          res.render("customer", {
            activeTab: "customers",
            customers: docs,
            custName: custName,
            custBalance: custBalance,
            reqParams: name,
            recieverName: recieverName,
          });
        }
      });
    }
  });
});

app.post("/customers/:custName1", (req, res) => {
  let custName = req.params.custName1;
  let custBalance = req.body.custBalance;
  let amount = req.body.amount;
  let recieverName = req.body.recieverName;

  custBalance = custBalance - amount;

  Customer.findOneAndUpdate(
    { name: custName },
    { balance: custBalance },
    (err, doc) => {
      if (err) {
        return console.log(err);
      }
      Customer.findOneAndUpdate(
        { name: recieverName },
        { $inc: { balance: amount } },
        (err, doc) => {
          if (err) {
            return console.log(err);
          }

          res.redirect("/success");
        }
      );
    }
  );
});

app.post("/customer", (req, res) => {
  const name = req.body.selectedCustomerName;
  res.redirect("/customers/" + name);
  recieverName = "";
});

app.post("/customer/transaction", (req, res) => {
  const name1 = req.body.selectedCustomerName1;
  recieverName = req.body.selectedCustomerName2;
  res.redirect("/customers/" + name1);
});

app.get("/success", (req, res) => {
  res.render("success");
});

app.get("*", (req, res) => {
  res.send("<h1>404 NOT FOUND</h1>");
});

app.listen(PORT, () => {
  console.log("Server started...");
});
