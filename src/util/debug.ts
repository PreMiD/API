import chalk from "chalk";

export function info(message) {
  if (process.env.NODE_ENV != "dev") return;

  console.log(
    `${chalk.bgHex("#596cae")(chalk.bold(" API "))} ${chalk.hex("#5050ff")(
      message
    )}`
  );
}

export function success(message) {
  if (process.env.NODE_ENV != "dev") return;

  var chalk = require("chalk");
  console.log(
    `${chalk.bgHex("#596cae")(chalk.bold(" API "))} ${chalk.hex("#50ff50")(
      message
    )}`
  );
}

export function error(message) {
  if (process.env.NODE_ENV != "dev") return;

  var chalk = require("chalk");
  console.log(
    `${chalk.bgHex("#596cae")(chalk.bold(" API "))} ${chalk.hex("#ff5050")(
      message
    )}`
  );
}
