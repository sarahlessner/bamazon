var inquirer = require("inquirer");
var customer = require("./bamazonCustomer.js");
var manager = require("./bamazonManager.js");
var supervisor = require("./bamazonSupervisor.js");

start();

//start menu for BAMAZON - select customer, manager or supervisor
function start() {
	inquirer.prompt([
	  {
	    type: "list",
		message: "Main Menu. Select user type: ",
		name: "list",
		choices: ['Customer', 'Manager', 'Supervisor', 'Exit']
	  }
	 //run one of 3 start functions based on users answer, or quit app
	]).then(function(answers) {

		if (answers.list === 'Customer') {
			//pass start menu for each option so user can call back to main menu in each view
			customer.setMMCallback(start);
			customer.displayAllItems();
		} else if (answers.list === 'Manager') {
			manager.setMMCallback(start);
			manager.managerMainMenu();
		} else if (answers.list === 'Supervisor') {
			supervisor.setMMCallback(start);
			supervisor.supervisorMainMenu();
			//option to return(quit) if user is done with program
		} else if (answers.list === 'Exit') {
			console.log('Disconnecting...'); 
			//disconnect all files connection to database
			customer.connectionEnd();
			manager.connectionEnd();
			supervisor.connectionEnd();
		} else {
			console.log("FAIL!"); //this condition should never be reached
		}

	});	
}
