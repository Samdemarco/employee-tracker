-- View All Employees
SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary,  CONCAT (manager.first_name, " ", manager.last_name) AS manager
FROM employee
LEFT JOIN role 
ON employee.role_id=role.id 
LEFT JOIN department
ON role.department_id=department.id
LEFT JOIN employee manager 
ON employee.manager_id = manager.id;
-- View All Roles
SELECT role.id, role.title, department.name AS department, role.salary
FROM role
INNER JOIN department ON role.department_id=department.id;
-- View all departments
SELECT * FROM employee_db.department;
-- Add a department
INSERT INTO employee_db.department
VALUES (newDept);
-- Add a role
INSERT INTO role (title, department, salary) VALUES ('Company Inc', 'Highway 37')"

-- Add an employee

-- Update employee role


