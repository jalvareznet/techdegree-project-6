let request = require('request');
let cheerio = require('cheerio');
const fs = require('fs');
var jsonexport = require('jsonexport');
var today = new Date().toJSON().slice(0, 10);
var dt = new Date();
var time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
var dir = './data';
let url = ("http://shirts4mike.com/shirts.php");
let websites = [];
let url2 = [];
let data = []

request(url, function(error, response, html) {
    if (!error && response.statusCode === 200) {
        let $ = cheerio.load(html);

        for (let i = 0; i < 8; i += 1) {
            websites.push($('.products').children().eq(i).html().slice(9, 25))
            url2.push(`http://shirts4mike.com/${websites[i]}`);
        }

        for (let i = 0; i < 8; i += 1) {
            request(url2[i], function(error, response, html) {
                if (!error && response.statusCode === 200) {
                    let $ = cheerio.load(html);
                    let $title = $('.shirt-details h1').text().slice(3).replace(',', ' -');
                    let $price = $('.shirt-details h1').text().slice(0, 3);
                    let $imgURL = $('.shirt-picture span').html().slice(17, 41);
                    let $urlComplete = `http://shirt4smike.com/${websites[i]}`;

                    data.push({
                        Name: $title,
                        Price: $price,
                        imgURL: $imgURL,
                        URL: $urlComplete,
                        Time: time

                    });

                    if (i === 7) {
                        console.log(data);
                        fs.writeFile(`${today}.json`, JSON.stringify(data), function(err) {
                            if (error) {
                                console.error(`Something happened writing the JSON and CSV files.`);
                            } else {
                                console.log('Data added to a JSON file');
                                var reader = fs.createReadStream(`${today}.json`);

                                if (!fs.existsSync(dir)) {
                                    fs.mkdirSync(dir);
                                    var writer = fs.createWriteStream(`./data/${today}.csv`);
                                    reader.pipe(jsonexport()).pipe(writer);
                                    console.log('CSV file created. The program also creates the data folder.');
                                } else {
                                    var writer = fs.createWriteStream(`./data/${today}.csv`);
                                    reader.pipe(jsonexport()).pipe(writer);
                                    console.log('CSV file created. Data folder was created previously.');
                                }
                            }
                        });
                    };
                } else {
                    console.error(`Something happened looking for each (t-shirt) data... and this is the error message: ${error.message}`);
                }
            });
        }
    } else {
        console.error(`Problems: this is the error message: ${error.message} and this is the status code 'statusCode:', ${response && response.statusCode}`);

    }
});