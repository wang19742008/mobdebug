var fs = require('fs');
var http = require('http');
var url = require('url');

var _datas = [];

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'application/x-javascript'});
  service(req, res);

}).listen(1337, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1337/');

function service(req, res){
  var pathname = url.parse(req.url,true).pathname;
  if(pathname == '/fp'){
    findPackage(req, res);
  }
}

function findPackage(req, res){
  var arg = url.parse(req.url,true).query;
  var start = parseInt(arg.start) || 0;
  var r = [];
  for(i=0;i<_datas.length;i++){
    var item = _datas[i];
    if(parseInt(item.id) > start){
      var o = {};
      o.url = item.url;
      o.time = item.time;
      o.id = item.id;
      r.push(o);
    }
  }

  var str = JSON.stringify(r);

  //var str = JSON.stringify(_datas);
  if(arg._cb){
    str = arg._cb + '(\'' + str + '\');';
  }
  res.end(str);
}

function readLines(file, inx, func){
  //console.log('read lines...',inx);
  var input = fs.createReadStream('d:/cap1',{'start':inx});
  var remaining = '';
  input.on('data', function(data) {
    inx += data.length;
    remaining += data;
    var index = remaining.indexOf('\n');
    while (index > -1) {
      var line = remaining.substring(0, index);
      remaining = remaining.substring(index + 1);
      func(line);
      index = remaining.indexOf('\n');
    }

  });

  input.on('end', function() {
    setTimeout(function(){
        readLines(file,inx,func);
    }, 1000);

    if (remaining.length > 0) {
      func(remaining);
    }
  });

  input.on('error', function(e) {
    console.error('error',e);
  });
}

function parse(line){
  var item = {};
  var arr = line.split('\t');
  var stream = arr[11].substr(0,arr[11].indexOf('\r'));
  //console.log(arr);
  if(!arr[10]){
    item.id = arr[0];
    item.time = arr[1].substr(0,arr[1].indexOf('.'));
    item.ip = arr[2];
    item.url = arr[3];
    item.cookie = arr[5];
    item.stream = stream;
    _datas.push(item);
    //console.log(item);
  }else{
    for(i=_datas.length-1; i>=0; i--){
      if(_datas[i].stream && _datas[i].stream == stream){
        var item = _datas[i];
        item.code = arr[6];
        item.contentType = arr[7];
        item.content = arr[9];
        break;
      }
    }

    //console.log(arr[6],arr[7]);
  }

}

readLines('d:/cap1', 0, function(data){
  //console.log(data);
  parse(data);
});