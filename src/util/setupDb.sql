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
    created_time  TIMESTAMP DEFAULT (STRFTIME('%d.%m.%Y %H:%M', 'now', 'localtime')),
    product_count INTEGER   DEFAULT 0
);


