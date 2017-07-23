DROP DATABASE IF EXISTS bamazon;
CREATE database bamazon;

USE bamazon;

CREATE TABLE products (
  item_id INT(11) NOT NULL AUTO_INCREMENT,
  product_name VARCHAR(100) NOT NULL,
  department_name VARCHAR(30) NOT NULL,
  price DECIMAL (5,2) NOT NULL,
  stock_quantity INT(6) NOT NULL,
  PRIMARY KEY (item_id)
);

INSERT INTO products 
  (product_name, department_name, price, stock_quantity)
VALUES
  ("red bicycle", "sporting goods", 497.00, 22),
  ("toilet paper", "bathroom", 24.95, 507),
  ("broom", "cleaning supplies", 19.99, 200),
  ("black hat", "clothing", 9.88, 15),
  ("vanilla candle", "home goods", 7.78, 2),
  ("rug", "home decoration", 299.98, 17),
  ("hand soap", "bathroom", 4.63, 53),
  ("tennis balls", "sporting goods", 5.00, 42),
  ("phone case", "electronic accessories", 15.75, 20),
  ("white shoes", "clothing", 78.42, 27);

SELECT * FROM products;

