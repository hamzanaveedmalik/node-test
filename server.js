
var http = require('http');
var fs = require('fs');
var path = require('path');
var request = require("request");
var cheerio = require("cheerio");
var queryString = require('querystring');
var url = require('url');
var jsdom = require("jsdom");

const port = process.env.PORT || 3000;
var titles=[];


var server = http.createServer((req, res) => {

  if(req.method==='GET'){
     var queryString = url.parse(req.url, true).query;
     if(!queryString.address)
     {
            res.end('<h1>Error 404</h1>');
            return;
     }

     var count = Object.keys(queryString.address).length

     if(typeof queryString.address ==='string')
     {
               count=1;
      }
      if(count>1)
      {
          queryString.address.forEach((element)=> {
          request(element, (error, response, body) => {
      if(error)
      {
        titles.push(error.message);
        if(titles.length==count)
      {
        renderHtml(titles);
       }
     }

        else
      {
        var $ = cheerio.load(body);
        var title = $("title");
        titles.push(title.html());

        if(titles.length==count)
        {renderHtml(titles);}

      }
      })
      }, this);
      }

      else

      {
            request(queryString.address, (error, response, body) => {
            if(error)
            {
                        titles.push(error.message);
                        if(titles.length==count){
                            renderHtml(titles);
            }
                        }
            else {
                        var $ = cheerio.load(body);
                        var title = $("title");
                        console.log(title.html());
                        titles.push(title.html());

                        if(titles.length==count){
                            renderHtml(titles);
                        }

                    }
                })
        }

        function renderHtml(titles){
            fs.readFile('./views.html', 'utf8', (error, data)=> {
                jsdom.env(data, [], function (errors, window) {
                    var $ = require('jquery')(window);
                    titles.forEach(function(element) {
                        $("ul").append('<li>'+queryString.address+ '---' +element+'</li>');
                    },this);

                    res.write(window.document.documentElement.outerHTML);
                    res.end();
                });
            });
        }

    }
      else {
            res.end('<h1>Error 404: ' + req.method +' not supported</h1>');
      }
    })

server.listen(port, ()=> {
  console.log(`Server is up on port: ${port}`);
});
