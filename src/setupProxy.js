const path = require('path');
const fs = require('fs')

module.exports = function (app) {
  app.get('/strings/:lang/*', (req, res) => {
    const lang = req.params.lang;
    const langFolder = path.join(process.cwd() + `/public/strings/${lang}`);
    if (fs.lstatSync(langFolder).isDirectory()) {
      const strings = {};
      fs.readdirSync(langFolder).forEach(file => {
        const data = JSON.parse(
          fs.readFileSync(path.join(langFolder, file), 'utf8')
        );
        const filename = file.replace(/\..*$/, '');
        strings[filename] = data;
      });
      res.json(strings);
    } else {
      res.status(500).send("The language folder doesn't exist");
    }
  });
};
