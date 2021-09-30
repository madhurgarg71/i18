const fs = require('fs');
const path = require('path');
const LANGUAGES = require('./languages.json');

const { hashElement } = require('folder-hash');
const hashOpts = {
  files: { include: ['*.json'] }
};

//Colors
const CYAN = '\x1b[36m%s\x1b[0m';
const GREEN = '\x1b[32m%s\x1b[0m';
const YELLOW = '\x1b[33m%s\x1b[0m';
const RED = '\x1b[31m%s\x1b[0m';

const stringsFolder = path.join(process.cwd(), '/build/strings');
const indexFile = path.join(process.cwd(), '/build/index.html');

function isObject(val) {
  return typeof val === 'object' && !Array.isArray(val);
}

function combineJSON(langFolder) {
  if (fs.lstatSync(langFolder).isDirectory()) {
    const strings = {};
    fs.readdirSync(langFolder).forEach(file => {
      const filePath = path.join(langFolder, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const filename = file.replace(/\..*$/, '');
      strings[filename] = data;
      //Extra - Remove the file
      fs.unlinkSync(filePath);
    });
    return strings;
  }
  console.error(RED, "Couldn't find language folder: " + path);
  process.exit(1);
}

//Reference for comparison
let reference = null;

function ensureKeys(obj1, obj2) {
  const keys1 = Object.keys(obj1).sort();
  const keys2 = Object.keys(obj2).sort();
  const string_keys1 = JSON.stringify(keys1);
  const string_keys2 = JSON.stringify(keys2);
  if (string_keys1 !== string_keys2) {
    console.error(RED, `The keys don't match`);
    console.error(string_keys1);
    console.error(`vs`);
    console.error(string_keys2);
    console.log();
    process.exit(1);
  }
  keys1.forEach(key => {
    const firstVal = obj1[key];
    const secondVal = obj2[key];
    if (isObject(firstVal) && isObject(secondVal)) {
      ensureKeys(obj1[key], obj2[key]);
    } else if (typeof firstVal !== typeof secondVal) {
      console.error(RED, `The values are of different type for key ${key}\n`);
      process.exit(1);
    }
  });
}

/**
 * This function will error and exit, if any language string
 * doesn't have same kind of keys
 */
function validateStrings(langStrings) {
  if (reference === null) {
    console.error(RED, 'There is something wrong with the script!!\n');
    process.exit(1);
  }
  ensureKeys(langStrings, reference);
}

function parseLangFolder(lang, stringsHash, isFirst) {
  console.log();
  console.log(GREEN, `Processing Language - ${lang}`);
  const langFolder = path.join(stringsFolder, lang);
  const langStrings = combineJSON(langFolder);
  if (isFirst) {
    //Please ensure first lang is English
    console.log(YELLOW, `Saved ${lang} as reference`);
    reference = langStrings;
  } else {
    //Compare against English
    console.log(YELLOW, `Comparing strings for ${lang} against reference`);
    validateStrings(langStrings);
    console.log(YELLOW, `Validated strings for ${lang}`);
  }

  console.log(YELLOW, `Creating ${lang} strings.json`);
  fs.writeFileSync(
    path.join(langFolder, `strings.${stringsHash}.json`),
    JSON.stringify(langStrings),
    'utf8'
  );
}

console.log();
console.log(CYAN, '***** Processing Multilingual Strings *****');
console.log();
if (fs.lstatSync(stringsFolder).isDirectory()) {
  hashElement(stringsFolder, hashOpts).then(res => {
    const stringsHash = res.hash.replace(/\W/g, '');

    //Update the index.html
    const indexHtml = fs.readFileSync(indexFile, 'utf8');
    const updatedHTML = indexHtml.replace(
      '__string_hash_replace__',
      stringsHash
    );
    fs.writeFileSync(indexFile, updatedHTML, 'utf8');
    console.log(
      GREEN,
      `Updated index.html with combined strings hash ${stringsHash}`
    );

    //Parse all lang strings
    LANGUAGES.forEach((lang, idx) => {
      parseLangFolder(lang, stringsHash, idx === 0);
    });

    console.log();
    console.log(CYAN, '***** Finished processing all languages *****');
    console.log();
  });
} else {
  console.error(RED, 'Strings folder not found\n');
  process.exit(1);
}
