import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";

if (!existsSync(`${process.cwd()}/logs/`)) mkdirSync(`${process.cwd()}/logs/`);

let logs = existsSync(`${process.cwd()}/logs/log.txt`)
	? readFileSync(`${process.cwd()}/logs/log.txt`, "utf-8")
	: "";

export default function debug(
	type: "info" | "warn" | "error",
	file: string,
	message: string
) {
	console.log(
		`[${new Date().toUTCString()}] ${type.toUpperCase()} | ${file} > ${message}\n`
	);
	logs += `[${new Date().toUTCString()}] ${type.toUpperCase()} | ${file} > ${message}\n`;
	writeFileSync(`${process.cwd()}/logs/log.txt`, logs);
}
