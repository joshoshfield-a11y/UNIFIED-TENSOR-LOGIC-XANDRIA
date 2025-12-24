import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';

export const initCommand = async () => {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'What is the project name?',
      default: 'my-project'
    },
    {
      type: 'list',
      name: 'type',
      message: 'Select project type:',
      choices: ['API', 'Web App', 'Library']
    }
  ]);

  const spinner = ora('Scaffolding project...').start();
  
  // Simulate work
  setTimeout(() => {
    spinner.succeed(chalk.green(`Successfully created ${answers.projectName}!`));
    console.log(chalk.dim('Run `cd ' + answers.projectName + '` to get started.'));
  }, 1500);
};