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

//supervisor view menu
exports.supervisorMainMenu = function() {
	inquirer.prompt ([
	  {	
	  	type: "list",
	  	message: "What would you like to do?",
	    name: "supervisor",
	    choices: ['View Product Sales', 'Create New Department', 'Return to Start Menu']
	  }
	]).then(function(answers) {
		if (answers.supervisor === 'View Product Sales') {
			viewProductSales();
		} else if (answers.supervisor === 'Create New Department') {
			createDept();
		} else if (answers.supervisor === 'Return to Start Menu') {
			myMMCallback();
		} else {
			//should not reach this condition 
			console.log("error");
		}
    });	
}


//view all departments overhead, sales and total profit
function viewProductSales() {
	//join products and departments tables by department name, combine product sales by department
	var query = "SELECT departments.department_id, departments.department_name, departments.over_head_costs, SUM(products.product_sales)";
	query += "FROM products RIGHT JOIN departments ON products.department_name = departments.department_name ";
	query += "GROUP BY departments.department_id, products.department_name";
	connection.query(query, function(err, res){
		//create table to display product sales
		var table = new Table({
		    head: ['id', 'department name', 'overhead', 'product sales', 'total profit'], 
		    colWidths: [10, 30, 20, 20, 20]
		});
		res.forEach(function(row) {
			//if there haven't been any sales yet, change null to 0 so table creation doesn't throw error
			if (row['SUM(products.product_sales)'] === null) {
				row['SUM(products.product_sales)'] = 0;
			}
			//calculate total profit - difference bt sales and overhead
			var totalProfit = (row['SUM(products.product_sales)'] - row.over_head_costs);
			//push results and profit calc to table
			console.log(row.department_id, row.department_name, row.over_head_costs, row['SUM(products.product_sales)'], totalProfit);
			table.push(
			    [row.department_id, row.department_name, row.over_head_costs, row['SUM(products.product_sales)'], totalProfit]
			);	
			
		});
		//display table and main menu
		console.log(table.toString());
		exports.supervisorMainMenu();
	});
}

//prompts for info necessary to create a new department
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
		//insert answers into departments table
		connection.query("INSERT INTO departments SET ?",
		    {
		      department_name: answers.dept,
		      over_head_costs: answers.overhead,
		    },
		    function(err, res) {
		      console.log("department created!\n");
		      exports.supervisorMainMenu();
		    }
	  	);
    });	
}

exports.connectionEnd = function () {
	connection.end();
}
