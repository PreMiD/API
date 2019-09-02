import chalk from "chalk";

export const info = (message: string) =>
  console.log(
    `${chalk.bgHex("#596cae")(chalk.bold(" API "))} ${chalk.blueBright(
      message
    )}`
  );

export const success = (message: string) =>
  console.log(
    `${chalk.bgHex("#596cae")(chalk.bold(" API "))} ${chalk.greenBright(
      message
    )}`
  );

export const error = (message: string) =>
  console.log(
    `${chalk.bgHex("#596cae")(chalk.bold(" API "))} ${chalk.redBright(message)}`
  );
