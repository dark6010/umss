var express = require('express');
var router = express.Router();
var pdfreader = require('pdfreader');
var fs = require('fs');
var page=-1
var documento=[]


/* GET home page. */
router.get('/sistemas', function(req, res, next) {
 
  var rows = {}; // indexed by y-position 

  function printRows() {
    Object.keys(rows) // => array of y-positions (type: float) 
      .sort((y1, y2) => parseFloat(y1) - parseFloat(y2)) // sort float positions 
      .forEach((y) => {
        if(rows[y][0].length==7)
          documento[page].push(rows[y])
      })
  }

  new pdfreader.PdfReader().parseFileItems('320902.pdf', function(err, item){
    if (!item || item.page) {
      // end of file, or page 
      printRows();
      page++
      documento[page]=[]
      console.log('PAGE:', item.page);
      rows = {}; // clear rows for next page 
    }
    else if (item.text) {
      // accumulate text items into rows object, per line 
      (rows[item.y] = rows[item.y] || []).push(item.text);
    }
    
  });
  page=-1
  documento.pop()

  fs.writeFile('sistemas.txt', JSON.stringify(documento), function (err) {
    if (err) throw err;
    console.log('Saved!');
  });
  res.render('index', { title: 'Express', documento: documento });
  documento=[]
})
router.get('/', function(req,res){
    fs.readFile('sistemas.txt', function(err, data) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    var t=data.toString()
    
    res.write(typeof(JSON.parse(t)));
    return res.end();
  });
})

module.exports = router;
