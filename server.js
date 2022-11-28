const express = require('express');
//IMPORT INQUIRER
const inquirer = require('inquirer'); 
//IMPORT CONSOLE TABLE FOR DISPLAYING TABLES IN CLI
const cTable = require('console.table');
//IMPORT AND REQUIRE MYSQL2
const mysql = require('mysql2');
//IMPORT CHALK FOR COOL LOOKING CONSOLE TEXT
const chalk = require('chalk');
//USE DOTENV TO HIDE PASSWORD ON GITHUB
require('dotenv').config()

const { default: nodeTest } = require('node:test');
const log = console.log;

const PORT = process.env.PORT || 3001;
const app = express();

// EXPRESS MIDDLEWARE
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// CONNECT TO DATABASE
const db = mysql.createConnection(
  {
    host: 'localhost',
    user: 'root',
    password: process.env.DB_PASSWORD, 
    database: 'employee_db'
  },
  console.log(`Connected to the employee_db database.`)
);

db.connect(err => {
  if (err) throw err;
  console.log('connected as id ' + db.threadId);
  connected();
});

// LAUNCH mainFunc AFTER ESTABLISHING CONNECTION WITH CHALK ENABLED TEXT
connected = () => {
  log(chalk.black.bold       (" _________________________________________ "))
  log(chalk.white.bgCyan.bold("|                                         |"))
  log(chalk.white.bgCyan.bold("|            EMPLOYEE MANAGER             |"))
  log(chalk.white.bgCyan.bold("|                                         |"))
  log(chalk.white.bgCyan.bold("|_________________________________________|"))
  log(chalk.white.bgCyan.bold("                                           "))

  mainFunc();

};
//MAIN PROGRAM
function mainFunc() {

  inquirer
      .prompt([
          {
              type: "list",
              name: "memberType",
              message: "What would you like to do?",
              choices: ["View All Employees", "Add Employee", "Update Employee Role", "View All Roles", "Add Role", "View All Departments", "Add Department","Delete a Department","Delete an Employee","Delete a Role", "Quit"],
          },
      ])
      .then((answers) => {
          if (answers.memberType === "View All Departments") {
              viewAllDept();
          } else if (answers.memberType === "View All Roles") {
              viewAllRoles();
          } else if (answers.memberType === "View All Employees") {
              viewAllEmp();
          } else if (answers.memberType === "Add Department") {
            addDept();          
          } else if (answers.memberType === "Add Role") {
            addRole();          
          } else if (answers.memberType === "Add Employee") {
            addEmployee();          
          } else if (answers.memberType === "Update Employee Role") {
            updateEmployee();          
          } else if (answers.memberType === "Delete a Department") {
            deleteDept(); 
          } else if (answers.memberType === "Delete an Employee") {
            deleteEmp(); 
          } else if (answers.memberType === "Delete a Role") {
            deleteRole(); 
          } else {
              console.log("");
              console.log("All done!");
              console.log("");
              process.exit();

          }
      });
}
// VIEW ALL DEPARTMENTS FUNCTION
function viewAllDept() {
  db.query('SELECT * FROM employee_db.department;', function (err, results) {
    console.log("");
    console.table(results);
    console.log("");

    const dept = [];

    for(var i=0; i<results.length; i++){
      dept[i] = results[i].name;
    }
    mainFunc();
  });
}
// VIEW ALL ROLES FUNCTION
function viewAllRoles() {
  db.query(`SELECT role.id, role.title, department.name AS department, role.salary
            FROM role
            INNER JOIN department ON role.department_id=department.id;`, function (err, results) {
    console.log("");
    console.table(results);
    console.log("");

    mainFunc();
  });
}
function viewAllEmp() {
  db.query(`SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary,  CONCAT (manager.first_name, " ", manager.last_name) AS manager
  FROM employee
  LEFT JOIN role 
  ON employee.role_id=role.id 
  LEFT JOIN department
  ON role.department_id=department.id
  LEFT JOIN employee manager 
  ON employee.manager_id = manager.id;`, function (err, results) {
    console.log("");
    console.table(results);
    console.log("");

    mainFunc();
  });
}
//ADD DEPARTMENT FUNCTION
function addDept() {

  const sql = 'INSERT INTO department (name) VALUES (?)';

  inquirer.prompt([
      {
          type: "input",
          name: "newDept",
          message: "What department would you like to add? ",          
      },       
  ])
  .then((answers) => {

      db.query(sql,answers.newDept, function (err, results) {
      console.log("");
      viewAllDept();
      console.log("");
  });
  //BACK TO MAIN MENU
    mainFunc();
  }); 
}

//ADD ROLE FUNCTION
function addRole() {

  inquirer.prompt([
    {
      type: "input",
      name: "role",
      message: "What role would you like to add? ",
    },
    {
      type: "input",
      name: "salary",
      message: "Please enter the salary of this role: ",
    },
  ])
    .then((answers) => {

      const newRole = [answers.role, answers.salary];

      db.query('SELECT department.id, department.name FROM employee_db.department;', function (err, results) {
        if (err) throw err;
        console.log("");
        const depts = results.map(({ id, name }) => ({ name: name, value: id }));

        inquirer.prompt([
          {
            type: "list",
            name: "dept",
            message: "Which department does this role belong to? ",
            choices: depts,
          },
        ])
          .then((deptChoice) => {
            newRole.push(deptChoice.dept);

            const sql = `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`;

            db.query(sql, newRole, function (err, results) {
            viewAllRoles();

              //BACK TO MAIN MENU
              mainFunc();
            });
          });
      });
    });
}
// ADD EMPLOYEE FUNCTION
function addEmployee() {

  inquirer.prompt([
    {
      type: "input",
      name: "firstName",
      message: "What is the employee's firstname? ",
    },
    {
      type: "input",
      name: "lastName",
      message: "What is the employee's last name? ",
    },

  ])
    .then((answers) => {
      const newEmp = [answers.firstName, answers.lastName];
      const role = [];
      const roleId = [];
      //QUERY role TABLE 
      db.query('SELECT role.id, role.title FROM employee_db.role;', function (err, results) {
        if (err) throw err;
        console.log("");
        const roles = results.map(({ id, title }) => ({ name: title, value: id }));

        inquirer.prompt([
          {
            type: "list",
            name: "empRole",
            message: "What is the employee's role?",
            choices: roles,
          },
        ])
          .then((roleChoice) => {
            newEmp.push(roleChoice.empRole);

            const managerSql = `SELECT * FROM employee`;

            db.query('SELECT * FROM employee', function (err, results) {
              if (err) throw err;
              console.log("");
              const managers = results.map(({ id, first_name, last_name }) => ({ name: first_name + " " + last_name, value: id }));

              inquirer.prompt([{
                type: "list",
                name: "manager",
                message: "Who is the employee's manager?",
                choices: managers,
              },
              ])
                .then((managerChoice) => {
                  newEmp.push(managerChoice.manager);

                  const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`;

                  db.query(sql, newEmp, function (err, results) {
                  viewAllEmp();
                    //BACK TO MAIN MENU
                  mainFunc();
                  });
                });
            });
          });
      });
    });
}  

// UPDATE EMPLOYEE FUNCTION
function updateEmployee() {

  db.query('SELECT employee.id, employee.first_name, employee.last_name FROM employee;', function (err, results) {
    if (err) throw err;
    console.log("");
    const employee = results.map(({ id, first_name, last_name }) => ({ name: first_name + " " + last_name, value: id }));

    inquirer.prompt([
      {
        type: "list",
        name: "updateEmployee",
        message: "Which employee do you want to update? ",
        choices: employee,
      },
    ])
      .then((updateEmp) => {
        const tempId = [];
        tempId.push(updateEmp.updateEmployee);

        db.query('SELECT role.id, role.title FROM role;', function (err, results) {
          if (err) throw err;
          console.log("");

          const roleId = results.map(({ id, title }) => ({ name: title, value: id }));

          inquirer.prompt([
            {
              type: "list",
              name: "updateRoleId",
              message: "Which role do you want to assign to the selected employee? ",
              choices: roleId,
            },
          ])
            .then((updateRole) => {
              tempId.push(updateRole.updateRoleId);
              //NEED TO SWAP AROUND EMP ID AND ROLE ID TO PROPERLY UPDATE EMPLOYEE TABLE
              let temp = tempId[1];
              tempId[1] = tempId[0];
              tempId[0] = temp;

              const sql = `UPDATE employee SET role_id = ? WHERE id = ?`;

              db.query(sql, tempId, function (err, results) {
                viewAllEmp();
                mainFunc();
              });
            });
        });
      });
  });
}
// BONUS FUNCTION TO DELETE A DEPARTMENT 
function deleteDept() {

  db.query('SELECT department.id, department.name FROM employee_db.department;', function (err, results) {
    if (err) throw err;
    console.log("");
    const depts = results.map(({ id, name }) => ({ name: name, value: id }));

    inquirer.prompt([
      {
        type: "list",
        name: "dept",
        message: "Which department would you like to delete? ",
        choices: depts,
      },
    ])
      .then((deptChoice) => {

        let sql = `DELETE FROM department WHERE id = ?`;

        db.query(sql, deptChoice.dept, (error, results) => {
          if (error)
            return console.error(error.message);
        
          console.log('Deleted Row(s):', results.affectedRows);
        });      
        console.log("");
        viewAllDept();
        console.log("");

          //BACK TO MAIN MENU
          mainFunc();
        });
      });
}
// BONUS FUNCTION TO DELETE AN EMPLOYEE 
function deleteEmp() {

  db.query('SELECT employee.id, employee.first_name, employee.last_name FROM employee_db.employee;', function (err, results) {
    if (err) throw err;
    console.log("");
    const employee = results.map(({ id, first_name, last_name }) => ({ name: first_name + " " + last_name, value: id }));

    inquirer.prompt([
      {
        type: "list",
        name: "emp",
        message: "Which employee would you like to delete? ",
        choices: employee,
      },
    ])
      .then((empChoice) => {

        let sql = `DELETE FROM employee WHERE id = ?`;

        db.query(sql, empChoice.emp, (error, results) => {
          if (error)
            return console.error(error.message);
        
          console.log('Deleted Row(s):', results.affectedRows);
        });      
        console.log("");
        viewAllEmp();
        console.log("");

          //BACK TO MAIN MENU
          mainFunc();
        });
      });
}
// BONUS FUNCTION TO DELETE A ROLE
function deleteRole() {

  db.query('SELECT role.id, role.title FROM employee_db.role;', function (err, results) {
    if (err) throw err;
    console.log("");
    const whichRole = results.map(({ id, title}) => ({ name: title, value: id }));

    inquirer.prompt([
      {
        type: "list",
        name: "role",
        message: "Which employee would you like to delete? ",
        choices: whichRole,
      },
    ])
      .then((roleChoice) => {

        let sql = `DELETE FROM role WHERE id = ?`;

        db.query(sql, roleChoice.role, (error, results) => {
          if (error)
            return console.error(error.message);
        
          console.log('Deleted Row(s):', results.affectedRows);
        });      
        console.log("");
        viewAllRoles();
        console.log("");

          //BACK TO MAIN MENU
          mainFunc();
        });
      });
}


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
