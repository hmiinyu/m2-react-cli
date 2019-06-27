const { prompt } = require('inquirer');
const program = require('commander');
const chalk = require('chalk');
const download = require('download-git-repo');
const ora = require('ora');
const fs = require('fs');

const option = program.parse(process.argv).args[0];
const question = [
  {
    type: 'input',
    name: 'name',
    message: 'Project name',
    default: typeof option === 'string' ? option : 'm2-react-app',
    filter(val) {
      return val.trim()
    },
    validate(val) {
      const validate = (val.trim().split(' ')).length === 1;
      return validate || 'Project name is not allowed to have spaces.';
    },
    transformer(val) {
      return val;
    }
  },
  {
    type: 'input',
    name: 'description',
    message: 'Project description',
    default: 'React project based on m2',
    validate() {
      return true;
    },
    transformer(val) {
      return val;
    }
  },
  {
    type: 'input',
    name: 'author',
    message: 'Author',
    default: '',
    validate() {
      return true;
    },
    transformer(val) {
      return val;
    }
  }
];

module.exports = prompt(question).then(({ name, description, author }) => {
  const repository = require('../template').init.path;
  const destination = `./${name}`;
  const spinner = ora('Downloading, please wait a moment...');

  spinner.start();
  download(`${repository}`, destination,  { clone: false },(err) => {
    if (err) {
      console.log(chalk.red(err));
      process.exit()
    }

    fs.readFile(`${destination}/package.json`, 'utf8', function (err, data) {
      if (err) {
        spinner.stop();
        console.error(err);
        return;
      }

      const packageJson = JSON.parse(data);
      packageJson.name = name;
      packageJson.description = description;
      packageJson.author = author;

      fs.writeFile(`${destination}/package.json`, JSON.stringify(packageJson, null, 2), 'utf8', function (err) {
        if (err) {
          spinner.stop();
          console.error(err);
        } else {
          spinner.stop();
          console.log(chalk.green('Project init successfully!'))
          console.log(`
            ${chalk.yellow(`cd ${name}`)}
            ${chalk.yellow('yarn install')}
            ${chalk.yellow('yarn start')}
          `);
        }
      });
    });
  })
});
