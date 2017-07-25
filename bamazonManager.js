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

//call back to start menu
var myMMCallback;
exports.setMMCallback = function(mmCallback) {
	myMMCallback = mmCallback;
}

//display menu of options on load
exports.managerMainMenu = function() {
	inquirer.prompt ([
		{
	    type: "list",
		message: "What would you like to do? ",
		name: "list",
		choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product', 'Go to Main Menu']
	  }
	]).then(function(answers) {
		connection.query("SELECT stock_quantity FROM products WHERE ?", { item_id: answers.id }, 
			function(err, res) {
		        if (answers.list === 'View Products for Sale') {
		        	viewProductsForSale();
		        } else if (answers.list === 'View Low Inventory'){
		        	viewLowInventory();
		        } else if (answers.list === 'Add to Inventory'){
		        	var i = "inventory";
					viewProductsForSale(i);
		        } else if (answers.list === 'Add New Product'){
		        	var p = "product";
		        	viewProductsForSale(p);
		        } else if (answers.list === 'Go to Main Menu'){
		        	myMMCallback();
		        } else {
		        	throw err;
		        	return;
		        }
      	});
	});
};
//function to list every available item: the item IDs, names, prices, and quantities.
function viewProductsForSale(x) {
	connection.query("SELECT * FROM products",
	 function(err, res) {
	 	var table = new Table({
		    head: ['id', 'product name', 'price', 'quantity'], 
		    colWidths: [10, 30, 20, 20]
		});
		if (err) {
			throw err;
		} else {
			res.forEach(function (row) {
				table.push( [row.item_id, row.product_name, row.price, row.stock_quantity]
				);
				// console.log("id: "+row.item_id +" - "+"product name: "+row.product_name 
				// +" - "+"price: "+row.price+" - "+"quantity: "+row.stock_quantity);
			})
			console.log(table.toString());
			if (!x) {
			exports.managerMainMenu();	
			} else if (x === "inventory") {
				addToInventory();
			} else if (x === "product") {
				addNewProduct();
			}
		}	
	});	
}
//function to list all items with an inventory count lower than five.
function viewLowInventory() {
	connection.query("SELECT * FROM products",
	 function(err, res) {
	 	var table = new Table({
		    head: ['id', 'product name','quantity'], 
		    colWidths: [10, 30, 20]
		});
		if (err) {
			throw err;
		} else {
			var lowCounter = 0;
			res.forEach(function (row) {
				if (row.stock_quantity < 5) {
					lowCounter++;
					table.push( [row.item_id, row.product_name, row.stock_quantity]
					);
					// console.log("id: "+row.item_id+" - item: "+row.product_name+" - quantity: "+row.stock_quantity);
				} 
			})

			if (lowCounter === 0) {
				console.log("You're well stocked!");
				viewProductsForSale();
			} else {
				console.log(table.toString());
				exports.managerMainMenu();
			}
		}	
	});	
};

//function which displays a prompt that will let the manager "add more" of any item currently in the store.
function addToInventory() {
	
	inquirer.prompt ([
	  {
	    name: "id",
	    message: "Enter the ID of the item you'd like to add inventory to: ",
	    validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
	  },
	  {
	  	name: "quantity",
	  	message: "Enter the quantity you'd like to add to the current inventory",
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
				connection.query("UPDATE products SET ? WHERE ?",
				 	[
				      {
				        stock_quantity: (res[0].stock_quantity + parseInt(answers.quantity))
				      },
				      {
				        item_id: answers.id
				      }
				    ],
				    function(error, result) {

				      console.log(answers.quantity + " added!");
				      viewProductsForSale();
				    }	
      			);
      			
			}
		);	
    });
};

//function to add new product
function addNewProduct() {
	inquirer.prompt ([
	  {
	    name: "name",
	    message: "Enter the name of the product",
	  },{
	    name: "dept",
	    message: "Enter the department name",
	  },{
	    name: "price",
	    message: "Enter the price of the product",
	    validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
	  },{
	    name: "quantity",
	    message: "Enter the quantity of the product",
	    validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
	  },
	  
	]).then(function(answers) {
		connection.query("SELECT department_name FROM departments WHERE ?",
			{
				department_name: answers.dept
			},
			function(err, res) {
		      console.log(res);
		      if (!res.length) {
		      	console.log("department does not exist - must add departments in supervisor view");
		      	exports.managerMainMenu();
		      } else {
		      	connection.query("INSERT INTO products SET ?",
				    {
				      product_name: answers.name,
				      department_name: answers.dept,
				      price: answers.price,
				      stock_quantity: answers.quantity,
				      product_sales: 0
				    },
				    function(err, res) {
				      console.log("product added!");
				      viewProductsForSale();
				    }
			 	 );
		      }
		    }
	  	); 	
    });	
};

exports.connectionEnd = function () {
	connection.end();
}
