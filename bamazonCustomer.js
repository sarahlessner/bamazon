var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('cli-table');

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
	
});

var myMMCallback;
exports.setMMCallback = function(mmCallback) {
	myMMCallback = mmCallback;
}

//display all items for sale on load
exports.displayAllItems = function() {
	connection.query("SELECT * FROM products",
	 function(err, res) {
	 	var table = new Table({
		    head: ['id', 'product name', 'price'], 
		    colWidths: [10, 30, 20]
			});
		if (err) {
			throw err;
		} else {
			res.forEach(function (row) {
				//figured I'd add a fancy table here too
				table.push( [row.item_id, row.product_name, row.price]
				);
				// console.log("id: "+row.item_id + " - " + "product name: "+row.product_name 
				// + " - " + "price: "+row.price);

			})
			console.log(table.toString());
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
		        if (answers.quantity > res[0].stock_quantity) {
		        	console.log("Insufficient Quantity!");
		        	beginShopping();
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
	connection.query("SELECT * FROM products WHERE ?", {item_id: id},
		function(error, result) {	
			var total = result[0].price*quantity;
			console.log("your total is: "+total);
			connection.query("UPDATE products SET? WHERE?",
			[
		      {
		        product_sales: result[0].product_sales + total
		      },
		      {
		        item_id: id
		      }
		    ],	
		    function(err, res) {
		 	  	buyMore();
		    }
			);
		}
	);	
}

function buyMore() {
	inquirer.prompt([
		{
		type: "confirm",
		message: "Make another purchase?",
		name: "keepshopping",
		default: true
		}
		]).then(function(answers) {
			if (answers.keepshopping) {
				exports.displayAllItems();
			} else {
				myMMCallback();
			}
		});
}

exports.connectionEnd = function () {
	connection.end();
}
