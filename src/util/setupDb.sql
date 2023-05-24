CREATE TABLE Product
(
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    title        TEXT,
    price        REAL,
    seller       TEXT,
    url          TEXT,
    selection_id INTEGER,
    FOREIGN KEY (selection_id) REFERENCES Selection (id)

);

CREATE TABLE Selection
(
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    created_time  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    product_count INTEGER   DEFAULT 0
);

CREATE TRIGGER create_selection
    AFTER INSERT
    ON Products
BEGIN
    INSERT INTO Selection (created_time)
    SELECT datetime('now') WHERE (SELECT COUNT(*) FROM Products WHERE selection_id IS NULL) = 1;
    UPDATE Products
    SET selection_id = (SELECT MAX(id) FROM Selection)
    WHERE selection_id IS NULL;
END;



INSERT INTO Products (title, seller, url)
VALUES ('Product 1', 'Seller A', 'https://example.com/product1'),
       ('Product 2', 'Seller B', 'https://example.com/product2'),
       ('Product 3', 'Seller C', 'https://example.com/product3'),
       ('Product 4', 'Seller D', 'https://example.com/product4'),
       ('Product 5', 'Seller E', 'https://example.com/product5');


DROP TRIGGER IF EXISTS create_selection;

delete
from Selection;
delete
from Product;
