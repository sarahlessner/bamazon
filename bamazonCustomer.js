var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,

	//username
	user: "root",
	//password
	password: "",
	database: "bamazon"
});

connection.connect(function(err) {
	if (err) throw err;
	console.log("connected as id " + connection.threadId);
	
	displayAllItems();
	
});
//display all items for sale on load
function displayAllItems() {
	connection.query("SELECT * FROM products",
	 function(err, res) {
		if (err) {
			throw err;
		} else {
			res.forEach(function (row) {
				console.log("id: "+row.item_id + " - " + "product name: "+row.product_name 
				+ " - " + "price "+row.price);

			})
			beginShopping();	
		}	
	});
	
}

function beginShopping() {
	inquirer.prompt ([
	  {
	    name: "id",
	    message: "Enter the ID of the item you'd like to buy",
	    validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
	  },
	  {
	  	name: "quantity",
	  	message: "Enter the quantity",
	  	validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
	  }
	]).then(function(answers) {
		connection.query("SELECT stock_quantity FROM products WHERE ?", { item_id: answers.id }, 
			function(err, res) {
		        console.log(res[0].stock_quantity);
		        if (answers.quantity > res[0].stock_quantity) {
		        	console.log("Insufficient Quantity!");
		        	return;
		        } else {
		        	fulfillOrder(answers.id, answers.quantity, res[0].stock_quantity)
		        }
      	});
	});
}

function fulfillOrder(id, quantity, stock) {
	connection.query("UPDATE products SET ? WHERE ?",
    [
      {
        stock_quantity: (stock - quantity)
      },
      {
        item_id: id
      }
    ],
    function(err, res) {
      console.log(quantity + " items purchased")
 
    }
  );
	connection.query("SELECT price FROM products WHERE ?", {item_id: id},
		function(error, result) {
			console.log("your total is: "+(quantity*result[0].price));
		}
	);
}

