var config = require('./config');

var fs = require('fs');
var Twitter = require('twitter');
var _ = require('lodash');

var client = new Twitter(config.auth);

try{
  var posted = JSON.parse(fs.readFileSync(config.log));
}
catch(err){
  fs.writeFileSync(config.log, "[]");
  var posted = []
}

if(config.path[config.path.length] != '/'){
  config.path += '/'
}

setInterval(function(){
    fs.readdir(config.path, function(err, items){
      if(err){return console.error(err);}
      _.filter(items, function(e){return e.match(/\.(jpg|png)$/)});
      queue = _.difference(items, posted);
      if(queue.length > 0){
        var data = require('fs').readFileSync(config.path + queue[0]);
        client.post('media/upload', {media: data}, function(err, media, response){
          if(err){return console.error(err)}
          client.post('statuses/update', {media_ids: media.media_id_string}, function(err, tweet, res){
            if(err){return console.error(err)}
            console.log("Tweeted " + queue[0]);
            posted.push(queue.unshift());
            fs.writeFileSync(config.log, JSON.stringify(posted));
          });
        });
      }
    });
  }, config.interval
);
