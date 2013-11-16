/**
 * VideoController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */
var http = require('http'),
    fs = require('fs'),
    util = require('util');

module.exports = {
    
  
	/* e.g.
  sayHello: function (req, res) {
    res.send('hello world!');
  }
  */

  /**
   * /video/stream
   */ 
  stream: function (req,res) {
  	Video.find().exec(function(err, video) {
	  	res.view({
	    	vids: video
	    });
		});
  },

  play: function (req,res) {

    var path = '/Users/max/Movies/bon_jovi.mp4';
	  var stat = fs.statSync(path);
	  var total = stat.size;
	  if (req.headers['range']) {
	    var range = req.headers.range;
	    var parts = range.replace(/bytes=/, "").split("-");
	    var partialstart = parts[0];
	    var partialend = parts[1];
	 
	    var start = parseInt(partialstart, 10);
	    var end = partialend ? parseInt(partialend, 10) : total-1;
	    var chunksize = (end-start)+1;
	    console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunksize);
	 
	    var file = fs.createReadStream(path, {start: start, end: end});
	    res.writeHead(206, { 'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': 'video/mp4' });
	    file.pipe(res);
	  } else {
	    console.log('ALL: ' + total);
	    res.writeHead(200, { 'Content-Length': total, 'Content-Type': 'video/mp4' });
	    fs.createReadStream(path).pipe(res);
	  }

  },

  new: function (req, res) {
  	res.view()
  },

  upload: function (req, res) {
  	fs.readFile(req.files.video.path, function (err, data) {
  		if (err) throw err
  		// ReadFile and save it in the "newPath" directory
 		  var newPath = __dirname + "/videoUploads/"+req.files.video.originalFilename;
		  fs.writeFile(newPath, data, function (err) {
		  	if (err) throw err

		  	Video.create({url: newPath}).done(function(err, video) {

				  // Error handling
				  if (err) {
				    return console.log(err);

				  // The video was created successfully!
				  }else {
				    console.log("Video created:", video);
				    res.redirect("back");
				  }
				});
		  });
		});
  }

  
};
