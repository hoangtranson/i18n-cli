#!/usr/bin/env node

const { Command } = require("commander");
const { prompt, ui } = require("inquirer");
const axios = require("axios");
const packageJSON = require("./package.json");
const { rcFile } = require("rc-config-loader");
const ora = require("ora");
const chalk = require("chalk");
const jsonfile = require('jsonfile');

const API_URL = "https://api.i18n.dev";
const program = new Command();

program
  .version(packageJSON.version)
  .description("i18n.dev command line interface.");

program
  .command("download")
  .alias("d")
  .option("-f, --format <format_type>", "format type: JSON")
  .option("--path <path>", "path that you want to put json file.")
  .option(
    "-p, --profile <profile_name>",
    "profile name that you want to download"
  )
  .description("Download JSON file")
  .action(async function () {
    const _format = this.format ? this.format : "JSON";
    const _profile = this.profile ? this.profile : "ALL";
    const _path = this.path ? this.path : "";
    console.log('_path => ', _path);
    const _rc = loadRcFile("i18n");
    const _config = _rc
      .split(" ")
      .map((item) => item.split("="))
      .reduce((arr, item) => {
        arr[item[0].toLowerCase()] = item[1];
        return arr;
      }, {});

    let _request_url = `${API_URL}/profile?token=${_config.token}`;
    
    const convertJsonI18n = arr => {
      let object  = (obj, item) => Object.assign(obj, { [item.key]: item.value })
      return arr.reduce(object, {});
    }

    if (_profile != "ALL") {
      _request_url += `$lang=${_profile}`;
    }

    const spinner = ora({
      text: `${chalk.cyan('Loading data...')} \n`
    })
    spinner.start();
    const res = await axios.get(_request_url);
    spinner.succeed();

    //  write json file
    res.data.forEach( profile => {
      const file = `${__dirname}${_path}/${profile.name}.json`;
      console.log('file => ', file);
      const _json = convertJsonI18n(profile.i18n);
      
      jsonfile.writeFile(file, _json,{ spaces: 2 }, function (err) {
        if (err) console.error(err)
      });
    });
    
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
