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

//callback to start menu
var myMMCallback;
exports.setMMCallback = function(mmCallback) {
	myMMCallback = mmCallback;
}

//display all items for sale on load
exports.displayAllItems = function() {
	//select all from products table
	connection.query("SELECT * FROM products",
	 function(err, res) {
	 	//cli-table set up
	 	var table = new Table({
		    head: ['id', 'product name', 'price'], 
		    colWidths: [10, 30, 20]
			});
		if (err) {
			throw err;
		} else {
			res.forEach(function (row) {
				//push id, product name, price to table
				table.push( [row.item_id, row.product_name, row.price]
				);
				// console.log("id: "+row.item_id + " - " + "product name: "+row.product_name 
				// + " - " + "price: "+row.price);

			})
			//log cli-table
			console.log(table.toString());
			beginShopping();	
		}	
	});
	
}

//function to initiate checkout - ask user what/how much to buy
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
		//look up stock of item in products db
		connection.query("SELECT stock_quantity FROM products WHERE ?", { item_id: answers.id }, 
			function(err, res) {
				//if the user wants to buy more than is available
		        if (answers.quantity > res[0].stock_quantity) {
		        	console.log("Insufficient Quantity!");
		        	//prompt shopping again
		        	beginShopping();
		        } else {
		        	//pass order into fulfillment function
		        	fulfillOrder(answers.id, answers.quantity, res[0].stock_quantity)
		        }
      	});
	});
}

//function to update database with customers order
function fulfillOrder(id, quantity, stock) {
	//deplete stock based on user purchase
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
    	//confirm purchase
      console.log(quantity + " items purchased")
 
    }
  );
	connection.query("SELECT * FROM products WHERE ?", {item_id: id},
		function(error, result) {	
			//display users total
			var total = result[0].price*quantity;
			console.log("your total is: "+total);
			//add user total to product sales
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
//ask the user if they want to make another purchase, if not - returns to main menu
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
