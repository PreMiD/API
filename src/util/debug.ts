import chalk from "chalk";

export function info(message) {
  console.log(
    `${chalk.bgHex("#596cae")(chalk.bold(" API "))} ${chalk.blueBright(
      message
    )}`
  );
}

export function success(message) {
  var chalk = require("chalk");
  console.log(
    `${chalk.bgHex("#596cae")(chalk.bold(" API "))} ${chalk.greenBright(
      message
    )}`
  );
}

export function error(message) {
  var chalk = require("chalk");
  console.log(
    `${chalk.bgHex("#596cae")(chalk.bold(" API "))} ${chalk.redBright(message)}`
  );
}
