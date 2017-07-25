# :boom: BAMAZON :boom:

Amazon-like storefront using SQL database(s) that allows initial choice of user view, manager view or supervisor view 

## DEMO VIDEO: <iframe width="560" height="315" src="https://www.youtube.com/embed/p_tQ1PjrvGA" frameborder="0" allowfullscreen></iframe>


### User View

* Upon loading user view, all available products from 'products' table will display in the console

* User can select ID of product to purchase and quantity

* Price will display and 'products' database will update quantities and product sales accordingly



### Manager View

* Loading manager view will display a set of menu options:

    * **View Products for Sale**
        * lists every available item from 'products' table: the item IDs, names, prices, and quantities.

    * **View Low Inventory**
        * lists all items with an inventory count lower than five.

    * **Add to Inventory**
        * prompts manager for ID and quantity to add to any current item

    * **Add New Product**
        * prompts manager for name, price, quantity and creates a completely new item from the input to add to 'products'



### Supervisor View

Uses info from 'products' table as well as 'departments' - exclusive to supervisor view

* Loading supervisor view will display a set of menu options:

    * **View Products Sales by Department**
        * displays a styled table to the console that joins information from 'products' and 'departments'
        * shows department ID, name, overhead, and sum of product sales for that department - uses overhead and sales to calculate total profit

    * **Add New Department**
        * prompts supervisor for department name and overhead costs, creates completely new department from the input to add to 'departments'





