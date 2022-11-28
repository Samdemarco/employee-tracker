INSERT INTO department (name)
VALUES ("Engineering"),
       ("Finance"),
       ("Legal"),
       ("Sales");

INSERT INTO role (title, salary, department_id)
VALUES ("Lead Engineer", 120000, 1),
       ("Sales Lead", 100000, 4),
       ("Account Manager", 160000, 2),
       ("Lawyer", 190000, 3);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Sam", "DeMarco", 1, NULL),
       ("John", "Doe", 2, 1),
       ("Mike", "Chan", 3, 1),
       ("Jane", "Doe", 4, 1);
       
