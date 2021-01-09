#!/usr/bin/env node

const { Command } = require("commander");
const { prompt, ui } = require("inquirer");
const chalk = require("chalk");
const packageJSON = require("./package.json");
const { rcFile } = require("rc-config-loader");

const program = new Command();
program
  .version(packageJSON.version)
  .description("i18n.dev command line interface.");

program
  .command("download")
  .alias("d")
  .option("-f, --format <format_type>", "format type: JSON")
  .option(
    "-p, --profile <profile_name>",
    "profile name that you want to download"
  )
  .description("Download JSON file")
  .action(async function () {
    const _format = this.format ? this.format : "JSON";
    const _profile = this.profile ? this.profile : "ALL";
    const _rc = loadRcFile("i18n");
    const _config = _rc
      .split(" ")
      .map((item) => item.split("="))
      .reduce((arr, item) => {
        arr[item[0].toLowerCase()] = item[1];
        return arr;
      }, {});
    
    console.log("_format => ", _format);
    console.log("_profile => ", _profile);
    console.log("_config => ", _config);
  });

function loadRcFile(rcFileName) {
  try {
    const results = rcFile(rcFileName, {
      cwd: `${__dirname}/`,
    });
    // Not Found
    if (!results) {
      return {};
    }
    return results.config;
  } catch (error) {
    // Found it, but it is parsing error
    return {}; // default value
  }
}
program.parse(process.argv);
