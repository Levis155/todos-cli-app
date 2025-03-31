import { Command } from "commander";
import prompts from "prompts";
import { PrismaClient } from "@prisma/client";
import { nanoid } from "nanoid";
import chalk from "chalk";
import Table from "cli-table3";

const program = new Command();
const client = new PrismaClient();

program.name("Todos CLI App");
program.description("Manage todos in the terminal");
program.version("1.0.0");

program
  .command("add-todo")
  .description("Adds a new todo to your list of todos")
  .action(async function () {
    try {
      const response = await prompts([
        {
          type: "text",
          name: "todoTitle",
          message: "What is the title of your todo?",
        },
        {
          type: "text",
          name: "todoDescription",
          message: "What is the description of your todo?",
        },
        {
          type: "select",
          name: "todoStatus",
          message: "What is the status of your todo?",
          choices: [
            { title: "Todo", value: "todo" },
            { title: "In-progress", value: "in-progress" },
            { title: "Done", value: "done" },
          ],
        },
      ]);

      const title = response.todoTitle;
      const description = response.todoDescription;
      const status = response.todoStatus;

      if (title && description && status) {
        await client.todo.create({
          data: {
            id: nanoid(4),
            title,
            description,
            status,
          },
        });

        console.log(chalk.green("Your todo was added successfully!"));
      } else {
        console.log(
          chalk.bgYellow(
            "You have empty fields in your todo! Make sure to include all fields(title, description, and status)."
          )
        );
      }
    } catch {
      console.log(chalk.bgRed("There was an error adding your todo."));
    }
  });

program
  .command("read-todos")
  .description("Gets todos in your todos list in table format.")
  .option("-i, --index <value>", "Todo id")
  .action(async function (options) {
    const index = options.index;

    try {
      if (index) {
        const foundTodo = await client.todo.findFirst({
          where: { id: index },
        });

        if (!foundTodo) {
          console.log(chalk.bgRed(`Todo with index ${index} does not exist`));
        } else {
          const table = new Table({
            head: ["id", "Title", "Description", "Status"],
            colWidths: [25, 25, 25, 25],
            wordWrap: true,
          });
          table.push([
            foundTodo.id,
            foundTodo.title,
            foundTodo.description,
            foundTodo.status,
          ]);

          console.log(table.toString());
        }
      } else {
        const allTodos = await client.todo.findMany();
        const table = new Table({
          head: ["id", "Title", "Description", "Status"],
          colWidths: [25, 25, 25, 25],
          wordWrap: true,
        });

        allTodos.forEach((allTodosItem) => {
          table.push([
            allTodosItem.id,
            allTodosItem.title,
            allTodosItem.description,
            allTodosItem.status,
          ]);
        });

        console.log(table.toString());
      }
    } catch {
      console.log(chalk.bgRed("There was an error finding your todos."));
    }
  });

program
  .command("update-todo")
  .description("Updates a specified todo in your todos list")
  .requiredOption("-i, --index <value>", "Todo id")
  .option("-t, --title <value>", "Updated todo title")
  .option("-d, --description <value>", "Updated todo description")
  .option("-s, --status <value>", "Updated todo status")
  .action(async function (actions) {
    const index = actions.index;
    const updatedTitle = actions.title;
    const updatedDescription = actions.description;
    const updatedStatus = actions.status;


    if(! updatedTitle && !updatedDescription && !updatedDescription) {
        console.log(chalk.bgYellow("You did not provide any updated data."))
        return;
    }

    try {
      await client.todo.update({
        where: {
          id: index,
        },
        data: {
          title: updatedTitle && updatedTitle,
          description: updatedDescription && updatedDescription,
          status: updatedStatus && updatedStatus,
        },
      });

      console.log(chalk.green("Updated todo successfully!"))
    } catch {
      console.log(chalk.bgRed("There was an error updating your todo."));
    }
  });

program
  .command("delete-todo")
  .description("deletes a specified todo from your todos list")
  .requiredOption("-i, --index <value>", "Todo id")
  .action(async function (actions) {
    const index = actions.index;

    try {
      const foundTodo = await client.todo.findFirst({
        where: { id: index },
      });

      if (!foundTodo) {
        console.log(
          chalk.bgYellow(
            `Todo with index ${index} does not exist! `
          )
        );
      } else {
        await client.todo.delete({
          where: { id: foundTodo.id },
        });

        console.log(chalk.green("Deleted todo successfully!"));
      }
    } catch {
      console.log(chalk.bgRed("There was an error deleting your todo"));
    }
  });

program
  .command("delete-all-todos")
  .description("Deletes all todos from your todos list")
  .action(async function () {
    console.log(chalk.bgRed("!!!!HOLD THE PHONE. THAT IS A DANGEROUS ACTION!!!!"));
    try {
      const response = await prompts({
        type: "multiselect",
        name: "decision",
        message: "Are you sure you want to delete all your todos?",
        choices: [
          { title: "Yes", value: "yes" },
          { title: "No", value: "no" },
        ],
        max: 1,
      });

      if (response.decision[0] === "yes") {
        await client.todo.deleteMany();
        console.log(chalk.green("Deleted all todos successfully!"));
      } else {
        console.log(chalk.green("Deletion aborted successfully!"));
      }
    } catch {
      console.log(chalk.bgRed("There was an error deleting all your todos."));
    }
  });

program.parseAsync();
