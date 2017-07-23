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
	mainMenu();
	
});

//display menu of options on load
function mainMenu() {
	inquirer.prompt ([
		{
	    type: "list",
		message: "What would you like to do? ",
		name: "list",
		choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product', 'Quit']
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
		        } else if (answers.list === 'Quit'){
		        	connection.end();
		        } else {
		        	throw err;
		        	return;
		        }
      	});
	});
}
//function to list every available item: the item IDs, names, prices, and quantities.
function viewProductsForSale(x) {
	connection.query("SELECT * FROM products",
	 function(err, res) {
		if (err) {
			throw err;
		} else {
			res.forEach(function (row) {
				console.log("id: "+row.item_id +" - "+"product name: "+row.product_name 
				+" - "+"price: "+row.price+" - "+"quantity: "+row.stock_quantity);

			})
			if (!x) {
			mainMenu();	
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
		if (err) {
			throw err;
		} else {
			var lowCounter = 0;
			res.forEach(function (row) {
				if (row.stock_quantity < 5) {
					lowCounter++;
					console.log("id: "+row.item_id+" - item: "+row.product_name+" - quantity: "+row.stock_quantity);
				} 
			})
			if (lowCounter === 0) {
				console.log("You're well stocked!");
				viewProductsForSale();
			} else {
				mainMenu();
			}
		}	
	});	
}

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
}

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
		connection.query("INSERT INTO products SET ?",
		    {
		      product_name: answers.name,
		      department_name: answers.dept,
		      price: answers.price,
		      stock_quantity: answers.quantity
		    },
		    function(err, res) {
		      console.log(res.affectedRows + " product(s) inserted!\n");
		      viewProductsForSale();
		    }
	  	);
    });	
}

