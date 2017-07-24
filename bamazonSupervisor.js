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
	console.log("connected as id " + connection.threadId);
	start();
	
});

function start() {
	inquirer.prompt ([
	  {	
	  	type: "list",
	  	message: "What would you like to do?",
	    name: "supervisor",
	    choices: ['View Product Sales', 'Create New Department', 'Exit']
	  }
	]).then(function(answers) {
		if (answers.supervisor === 'View Product Sales') {
			viewProductSales();
		} else if (answers.supervisor === 'Create New Department') {
			createDept();
		} else if (answers.supervisor === 'Exit') {
			connection.end();
		} else {
			console.log("error");
			connection.end();
		}
    });	
}


function viewProductSales() {
	var query = "SELECT departments.department_id, products.department_name, departments.over_head_costs, SUM(products.product_sales)";
	query += "FROM products LEFT JOIN departments ON products.department_name = departments.department_name ";
	query += "GROUP BY departments.department_id, products.department_name";
	connection.query(query, function(err, res){
		var table = new Table({
		    head: ['id', 'department name', 'overhead', 'product sales', 'total profit'], 
		    colWidths: [10, 30, 20, 20, 20]
		});
		res.forEach(function(row) {
			var totalProfit = (row['SUM(products.product_sales)'] - row.over_head_costs);
			//added this because manager could add product/department and it would not be reflected in departments table
			if(!row.department_id) {
				connection.query("INSERT INTO departments SET ?",
			    {
			      department_name: row.department_name,
			      over_head_costs: 1000.00 //arbitrary/default overhead cost
			    },
			    function(err, res) {
			    }
	  			);
			} else {
				table.push(
				    [row.department_id, row.department_name, row.over_head_costs, row['SUM(products.product_sales)'], totalProfit ]
				);	
			}
		});
		console.log(table.toString());
		start();
	});
}

function createDept() {
	inquirer.prompt ([
	  {
	    name: "dept",
	    message: "Enter the name of the new department",
	  },{
	    name: "overhead",
	    message: "Enter the department's overhead costs",
	    validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
	  }
	  
	]).then(function(answers) {
		connection.query("INSERT INTO departments SET ?",
		    {
		      department_name: answers.dept,
		      over_head_costs: answers.overhead,
		    },
		    function(err, res) {
		      console.log("department created!\n");
		      start();
		    }
	  	);
    });	
}




