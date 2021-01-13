#!/usr/bin/env node

const { Command } = require("commander");
const { prompt, ui } = require("inquirer");
const axios = require("axios");
const packageJSON = require("./package.json");
const { rcFile } = require("rc-config-loader");
const ora = require("ora");
const chalk = require("chalk");
const jsonfile = require("jsonfile");

const API_URL = "https://api.i18n.dev";
const program = new Command();

program
  .version(packageJSON.version)
  .description("i18n.dev command line interface.");

program
  .command("download")
  .alias("d")
  .option("-f, --format <format_type>", "format type: JSON")
  .option("-u, --url <url>", "path that you want to put json file.")
  .option(
    "-p, --profile <profile_name>",
    "profile name that you want to download"
  )
  .description("Download JSON file")
  .action(async function () {
    const _format = this.format ? this.format : "json";
    const _profile = this.profile ? this.profile : "ALL";
    const _path = this.url ? this.url : "";
    const _real_path = process.cwd();

    const _rc = loadRcFile("i18n");

    if (Object.keys(_rc).length === 0) {
      throw new Error("missing .i18nrc file.");
    }
    const _config = _rc
      .split(" ")
      .map((item) => item.split("="))
      .reduce((arr, item) => {
        arr[item[0].toLowerCase()] = item[1];
        return arr;
      }, {});

    if (!_config.token) {
      throw new Error("missing token in .i18nrc file.");
    }
    let _request_url = `${API_URL}/profile?token=${_config.token}`;

    const convertJsonI18n = (arr) => {
      let object = (obj, item) =>
        Object.assign(obj, { [item.key]: item.value });
      return arr.reduce(object, {});
    };

    if (_profile != "ALL") {
      _request_url += `&lang=${_profile}`;
    }

    const spinner = ora({
      text: `${chalk.cyan("Loading data...")} \n`,
    });
    spinner.start();
    const res = await axios.get(_request_url);
    spinner.succeed();

    //  write json file
    if (_profile != "ALL") {
      const file = `${_real_path}${_path}/${res.data.name}.json`;
      const _json = convertJsonI18n(res.data.i18n);

      jsonfile.writeFile(file, _json, { spaces: 2 }, function (err) {
        if (err) console.error(err);
      });
    } else {
      res.data.forEach((profile) => {
        const file = `${_real_path}${_path}/${profile.name}.json`;
        const _json = convertJsonI18n(profile.i18n);

        jsonfile.writeFile(file, _json, { spaces: 2 }, function (err) {
          if (err) console.error(err);
        });
      });
    }
  });

function loadRcFile(rcFileName) {
  try {
    const results = rcFile(rcFileName, {
      cwd: `${process.cwd()}/`,
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
