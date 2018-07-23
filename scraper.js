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
let http = require('http');

//Requesting the urls of the 8 t-shirts

request(url, function(error, response, body) {

    if (!error && response.statusCode == 200) {

        let $ = cheerio.load(body);
        for (let i = 0; i < $('.products').children().length; i += 1) {
            websites.push($('.products').children().eq(i).html().slice(9, 25))
            url2.push(`http://shirts4mike.com/${websites[i]}`);
        }

        //Requesting the data title, price, imgURL and url.

        for (let i = 0; i < $('.products').children().length; i += 1) {
            request(url2[i], function(error, response, body) {
                if (!error && response.statusCode === 200) {
                    let $ = cheerio.load(body);
                    let $title = $('.shirt-details h1').text().slice(3).replace(',', ' -');
                    let $price = $('.shirt-details h1').text().slice(0, 3);
                    let $imgURL = $('.shirt-picture span').html().slice(17, 41);
                    let $urlComplete = `http://shirt4smike.com/${websites[i]}`;

                    // pushing the data to a new array.
                    data.push({
                        Title: $title,
                        Price: $price,
                        imgURL: $imgURL,
                        URL: $urlComplete,
                        Time: time
                    });

                    //Selecting the last loop to create de json of the data, later create the CSV from it.

                    if (data[7]) {
                        console.log(data);
                        fs.writeFile(`${today}.json`, JSON.stringify(data), function(error) {
                            if (error) {
                                console.error(`Something happened writing the JSON and CSV files.`);
                            } else {
                                console.log('Data added to a JSON file');
                                var reader = fs.createReadStream(`${today}.json`);

                                //create data folder in case it doesn't exists.
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
                }
            });
        }

        //else of errors
    } else {

        if (response = "undefined") {
            console.error('Cannot connect to "http://shirts4mike.com"');
        }
        if (error.message = "getaddrinfo") {
            console.error('Unable to determine the domain name');
        }

    }
});