#!/usr/bin/env node

const { Command } = require("commander");
const { prompt, ui } = require("inquirer");
const chalk = require("chalk");
const packageJSON = require('./package.json');

const program = new Command();
program.version(packageJSON.version).description('i18n.dev command line interface.')

program
  .command("download")
  .alias("d")
  .option("-f, --format <format_type>", "format type: JSON")
  .option("-p, --project <project_name>", "project name that you want to download")
  .option("--profile <profile_name>", "profile name that you want to download")
  .description("Download JSON file")
  .action(async function () {
    console.log('test');
  });

program.parse(process.argv);