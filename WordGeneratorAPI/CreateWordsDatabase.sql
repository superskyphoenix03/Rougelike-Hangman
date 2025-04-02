-- File generated with SQLiteStudio v3.4.17 on Wed Apr 2 13:22:45 2025
--
-- Text encoding used: System
--
PRAGMA foreign_keys = on;
BEGIN TRANSACTION;

-- Table: WordCategories
CREATE TABLE IF NOT EXISTS WordCategories (
    Id   INTEGER PRIMARY KEY AUTOINCREMENT,
    Type TEXT    NOT NULL
                 UNIQUE,
    Hint TEXT    NOT NULL
);

INSERT INTO WordCategories (
                               Type,
                               Hint
                           )
                           VALUES (
                               'common',
                               'Common words used in daily life'
                           );

INSERT INTO WordCategories (
                               Type,
                               Hint
                           )
                           VALUES (
                               'fruits',
                               'Various kinds of fruits'
                           );

INSERT INTO WordCategories (
                               Type,
                               Hint
                           )
                           VALUES (
                               'animals',
                               'Names of animals'
                           );

INSERT INTO WordCategories (
                               Type,
                               Hint
                           )
                           VALUES (
                               'colors',
                               'Names of colors'
                           );

INSERT INTO WordCategories (
                               Type,
                               Hint
                           )
                           VALUES (
                               'countries',
                               'Names of countries'
                           );

INSERT INTO WordCategories (
                               Type,
                               Hint
                           )
                           VALUES (
                               'occupations',
                               'Various occupations'
                           );

INSERT INTO WordCategories (
                               Type,
                               Hint
                           )
                           VALUES (
                               'sports',
                               'Different types of sports'
                           );

INSERT INTO WordCategories (
                               Type,
                               Hint
                           )
                           VALUES (
                               'instruments',
                               'Musical instruments'
                           );

INSERT INTO WordCategories (
                               Type,
                               Hint
                           )
                           VALUES (
                               'vehicles',
                               'Different types of vehicles'
                           );

INSERT INTO WordCategories (
                               Type,
                               Hint
                           )
                           VALUES (
                               'household',
                               'Common household items'
                           );

INSERT INTO WordCategories (
                               Type,
                               Hint
                           )
                           VALUES (
                               'clothing',
                               'Types of clothing'
                           );


-- Table: Words
CREATE TABLE IF NOT EXISTS Words (
    Id         INTEGER PRIMARY KEY AUTOINCREMENT,
    Text       TEXT    NOT NULL,
    Type       TEXT    NOT NULL,
    Length     INTEGER NOT NULL,
    Difficulty TEXT    NOT NULL,
    FOREIGN KEY (
        Type
    )
    REFERENCES WordCategories (Type) 
);
-- Insert data into Words
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
('apple', 'fruits', 5, 'easy'),
('banana', 'fruits', 6, 'medium'),
('cherry', 'fruits', 6, 'medium'),
('date', 'fruits', 4, 'easy'),
('elderberry', 'fruits', 10, 'hard'),
('fig', 'fruits', 3, 'easy'),
('grape', 'fruits', 5, 'easy'),
('honeydew', 'fruits', 8, 'hard'),
('kiwi', 'fruits', 4, 'easy'),
('lemon', 'fruits', 5, 'easy'),
('elephant', 'animals', 8, 'hard'),
('fox', 'animals', 3, 'easy'),
('giraffe', 'animals', 7, 'hard'),
('hippopotamus', 'animals', 12, 'hard'),
('iguana', 'animals', 6, 'medium'),
('jaguar', 'animals', 6, 'medium'),
('kangaroo', 'animals', 8, 'hard'),
('lion', 'animals', 4, 'easy'),
('monkey', 'animals', 6, 'medium'),
('newt', 'animals', 4, 'easy'),
('red', 'colors', 3, 'easy'),
('blue', 'colors', 4, 'easy'),
('green', 'colors', 5, 'easy'),
('yellow', 'colors', 6, 'medium'),
('orange', 'colors', 6, 'medium'),
('purple', 'colors', 6, 'medium'),
('brown', 'colors', 5, 'easy'),
('pink', 'colors', 4, 'easy'),
('black', 'colors', 5, 'easy'),
('white', 'colors', 5, 'easy'),
('argentina', 'countries', 9, 'hard'),
('brazil', 'countries', 6, 'medium'),
('canada', 'countries', 6, 'medium'),
('denmark', 'countries', 7, 'hard'),
('egypt', 'countries', 5, 'easy'),
('france', 'countries', 6, 'medium'),
('germany', 'countries', 7, 'hard'),
('hungary', 'countries', 7, 'hard'),
('india', 'countries', 5, 'easy'),
('japan', 'countries', 5, 'easy'),
('doctor', 'occupations', 6, 'medium'),
('engineer', 'occupations', 8, 'hard'),
('teacher', 'occupations', 7, 'hard'),
('nurse', 'occupations', 5, 'easy'),
('pilot', 'occupations', 5, 'easy'),
('chef', 'occupations', 4, 'easy'),
('artist', 'occupations', 6, 'medium'),
('musician', 'occupations', 8, 'hard'),
('writer', 'occupations', 6, 'medium'),
('dentist', 'occupations', 7, 'hard'),
('soccer', 'sports', 6, 'medium'),
('basketball', 'sports', 10, 'hard'),
('tennis', 'sports', 6, 'medium'),
('cricket', 'sports', 7, 'hard'),
('hockey', 'sports', 6, 'medium'),
('baseball', 'sports', 8, 'hard'),
('rugby', 'sports', 5, 'easy'),
('golf', 'sports', 4, 'easy'),
('swimming', 'sports', 8, 'hard'),
('cycling', 'sports', 7, 'hard'),
('piano', 'instruments', 5, 'easy'),
('guitar', 'instruments', 6, 'medium'),
('drums', 'instruments', 5, 'easy'),
('violin', 'instruments', 6, 'medium'),
('flute', 'instruments', 5, 'easy'),
('saxophone', 'instruments', 9, 'hard'),
('trumpet', 'instruments', 7, 'hard'),
('cello', 'instruments', 5, 'easy'),
('harp', 'instruments', 4, 'easy'),
('clarinet', 'instruments', 8, 'hard'),
('car', 'vehicles', 3, 'easy'),
('truck', 'vehicles', 5, 'easy'),
('bus', 'vehicles', 3, 'easy'),
('motorcycle', 'vehicles', 10, 'hard'),
('bicycle', 'vehicles', 7, 'hard'),
('scooter', 'vehicles', 7, 'hard'),
('airplane', 'vehicles', 8, 'hard'),
('helicopter', 'vehicles', 10, 'hard'),
('boat', 'vehicles', 4, 'easy'),
('submarine', 'vehicles', 9, 'hard'),
('table', 'household', 5, 'easy'),
('chair', 'household', 5, 'easy'),
('sofa', 'household', 4, 'easy'),
('bed', 'household', 3, 'easy'),
('lamp', 'household', 4, 'easy'),
('desk', 'household', 4, 'easy'),
('cupboard', 'household', 8, 'hard'),
('shelf', 'household', 5, 'easy'),
('mirror', 'household', 6, 'medium'),
('rug', 'household', 3, 'easy'),
('shirt', 'clothing', 5, 'easy'),
('pants', 'clothing', 5, 'easy'),
('dress', 'clothing', 5, 'easy'),
('skirt', 'clothing', 5, 'easy'),
('jacket', 'clothing', 6, 'medium'),
('coat', 'clothing', 4, 'easy'),
('hat', 'clothing', 3, 'easy'),
('scarf', 'clothing', 5, 'easy'),
('gloves', 'clothing', 6, 'medium'),
('socks', 'clothing', 5, 'easy');

COMMIT TRANSACTION;
PRAGMA foreign_keys = on;