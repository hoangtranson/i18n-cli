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

    let _request_url = `${API_URL}/profile?token=${_config.token}`;

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
    const file = `${__dirname}/test/data.json`;
    const _json = { name: 'JP' }
    
    jsonfile.writeFile(file, _json,{ spaces: 2 }, function (err) {
      if (err) console.error(err)
    })
    console.log(res.data);
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

function formatJSON(json,textarea) {
  var nl;
  if(textarea) {
      nl = "&#13;&#10;";
  } else {
      nl = "<br>";
  }
  var tab = "&#160;&#160;&#160;&#160;";
  var ret = "";
  var numquotes = 0;
  var betweenquotes = false;
  var firstquote = false;
  for (var i = 0; i < json.length; i++) {
      var c = json[i];
      if(c == '"') {
          numquotes ++;
          if((numquotes + 2) % 2 == 1) {
              betweenquotes = true;
          } else {
              betweenquotes = false;
          }
          if((numquotes + 3) % 4 == 0) {
              firstquote = true;
          } else {
              firstquote = false;
          }
      }

      if(c == '[' && !betweenquotes) {
          ret += c;
          ret += nl;
          continue;
      }
      if(c == '{' && !betweenquotes) {
          ret += tab;
          ret += c;
          ret += nl;
          continue;
      }
      if(c == '"' && firstquote) {
          ret += tab + tab;
          ret += c;
          continue;
      } else if (c == '"' && !firstquote) {
          ret += c;
          continue;
      }
      if(c == ',' && !betweenquotes) {
          ret += c;
          ret += nl;
          continue;
      }
      if(c == '}' && !betweenquotes) {
          ret += nl;
          ret += tab;
          ret += c;
          continue;
      }
      if(c == ']' && !betweenquotes) {
          ret += nl;
          ret += c;
          continue;
      }
      ret += c;
  } // i loop
  return ret;
}
program.parse(process.argv);
