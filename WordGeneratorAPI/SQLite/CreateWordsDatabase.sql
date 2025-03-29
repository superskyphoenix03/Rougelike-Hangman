-- Create the WordCategories table
CREATE TABLE WordCategories (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Type TEXT NOT NULL,
    Hint TEXT NOT NULL
);

-- Create the Words table
CREATE TABLE Words (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    Text TEXT NOT NULL,
    Type TEXT NOT NULL,
    Length INTEGER NOT NULL,
    Difficulty TEXT NOT NULL,
    FOREIGN KEY (Type) REFERENCES WordCategories(Type)
);

-- Insert sample data into WordCategories table
INSERT INTO WordCategories (Type, Hint) VALUES
('common', 'Common words used in daily life'),
('fruits', 'Various kinds of fruits'),
('animals', 'Names of animals'),
('colors', 'Names of colors'),
('countries', 'Names of countries'),
('occupations', 'Various occupations'),
('sports', 'Different types of sports'),
('instruments', 'Musical instruments'),
('vehicles', 'Different types of vehicles'),
('household', 'Common household items'),
('clothing', 'Types of clothing');

-- Insert sample data into Words table
INSERT INTO Words (Text, Type, Length, Difficulty) VALUES
('cat', 'common', 3, 'easy'),
('dog', 'common', 3, 'easy'),
('bat', 'common', 3, 'easy'),
('rat', 'common', 3, 'easy'),
('sun', 'common', 3, 'easy'),
('fun', 'common', 3, 'easy'),
('run', 'common', 3, 'easy'),
('fan', 'common', 3, 'easy'),
('cow', 'common', 3, 'easy'),
('pig', 'common', 3, 'easy'),
('apple', 'fruits', 5, 'medium'),
('banana', 'fruits', 6, 'medium'),
('cherry', 'fruits', 6, 'medium'),
('date', 'fruits', 4, 'easy'),
('elderberry', 'fruits', 10, 'hard'),
('fig', 'fruits', 3, 'easy'),
('grape', 'fruits', 5, 'medium'),
('honeydew', 'fruits', 8, 'hard'),
('kiwi', 'fruits', 4, 'easy'),
('lemon', 'fruits', 5, 'medium');