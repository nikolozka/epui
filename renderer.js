const electron = require('electron')
const remote = electron.remote
const desktopCapturer = electron.desktopCapturer;
const electronScreen = remote.screen;
const shell = electron.shell;
const fs = require('fs')
const os = require('os')
const path = require('path')
const osc = require('osc')
const pdfjsLib = require('pdfjs-dist');

const curpath = "../docs/"
const scrnpath = "../scrns/"

var directory

var idx = 0;
var idx_prev = 0;

var table

var isnav = true
var hasscrolled = false

var page_num = 1

var url = '../docs/5221.enfance_camera_ready.pdf';

pdfjsLib.GlobalWorkerOptions.workerSrc = './node_modules/pdfjs-dist/build/pdf.worker.js'


let onLoad = function() {
	initOSC()
	gdir()
}

function initOSC() {
  udpPort.open()
}


let snap = function(){

	const screenSize = remote.getCurrentWindow().getSize();

  	let options = {
  		thumbnailSize: {
  			width: 800, //3840 
  			height: 600 //2150
  		},
  		types: ["screen", "window"]
  	}

  	desktopCapturer.getSources(options).then(async sources => {
  		for (const source of sources) {
  			if (source.name === 'epui') {

  				img = source.thumbnail
  				/*let rect ={
  					x: 0,
  					y: 0,
  					width: 800,
  					height: 600
  				};

  				img = img.crop(rect)*/
  				
  				screenShotPath = scrnpath+Date.now()
  				fs.writeFile(screenShotPath+'.png', img.toPNG(), function (error) {
  					if (error) return console.log(error);
  					console.log(`Saved screenshot to: ${screenShotPath}`);
  					act("screenshot captured!")
  				});
  			}
  		}
  	})
}

var udpPort = new osc.UDPPort({
	localAddress: "127.0.0.1",
    localPort: 9000,
    metadata: true
});

udpPort.on("message", function(oscMsg){

  if (oscMsg.address == "/cmd") {

  	let cmd = oscMsg.args[0].value
  	act(cmd)
  }

});

let act = function(cmd){

	console.log(cmd)
	udpPort.send({
        address: "/epui",
        args: [
            {
                type: "s",
                value: cmd
            }
        ]
    },"127.0.0.1",9001);

    switch(cmd){
    	case 'a':
    		if(isnav == true){
	    		idx_prev=idx;
    			idx++
    			if (idx>=directory.length) {idx = 0}
    			updateUI()
    		}
    		else{
    			console.log("whoosh..!")
    			if(hasscrolled == false){
    			    console.log('scroll down');
    				window.scrollTo(0,500)
    				hasscrolled = true;
	      			snap()
    			}
    			else{
	   			    console.log('next page');
    				hasscrolled = false;
   					page_num++
   					loadPDF(page_num)
    				window.scrollTo(0,0)
    			}
    		}
    		break;
    	case 'b':
    		if(isnav == true){
    	    	idx_prev=idx;
    			idx--
    			if (idx<0) {idx = directory.length-1}
    			updateUI()
    		}
    		else{
    			console.log("wheesh..!")
    			if(hasscrolled == false){
	   			    console.log('prev page');
	   				window.scrollTo(0,500)
    				hasscrolled = true;
    				page_num--
    				loadPDF(page_num)
    			}
    			else{
    			    console.log('scroll up');
       				window.scrollTo(0,0)
	   				hasscrolled = false;
	      			snap()
    			}
    		}

    		break;
    	case 'c':
    		hdtable()
   			loadPDF(page_num)
    		break;
    	case 'd':
    		hdPDF()
    		swtable()
    		break;
    	case 'e':

    		break;
    	case 'f':

    		break;
    	case 'g':

    		break;
    	case 'h':

    		break;
    	case 'i':

    		break;
    	case 'j':

    		break;
    	case 'k':

    		break;
    	case 'l':

    		break;
    	case 'm':

    		break;
    	case 'n':

    		break;
    	case 'o':

    		break;
    	case 'p':

    		break;

    }

}

let gdir = function(){ // list items in curpath
	fs.readdir(curpath, function(err, items) {
    	directory = items
   		console.log(directory)
   		mktable()
	});
}

let updateUI = function(){
	console.log("refresher!")
	rows = table.rows
	rows[idx_prev].bgColor="white"
	rows[idx].bgColor="grey"
	console.log(rows)
	snap()
}

let mktable = function(){ // generate a table from curpath contents

  table = document.createElement('table');

  for( var i = 0; i < directory.length; i++ ) {
	var child = directory[i];
  	var row = table.insertRow();
   	var cell = row.insertCell();
    cell.appendChild(document.createTextNode(child));
  }
  document.getElementById('container').appendChild(table);
  updateUI()
}

let hdtable = function(){
	document.getElementById('container').style.display = "none"
}

let swtable = function(){
	document.getElementById('container').style.display = "block"
	isnav = true
	page_num=0
}

let hdPDF = function(){
	document.getElementById('the-canvas').style.display = "none"
}

let loadPDF = function(pagenum){
	isnav = false
	var url = '../docs/' + directory[idx];
	var loadingTask = pdfjsLib.getDocument(url);
	loadingTask.promise.then(function(pdf) {
	  console.log('PDF loaded');

	    // Fetch the first page
	  var pageNumber = pagenum;
	  pdf.getPage(pageNumber).then(function(page) {
	    console.log('Page loaded');

	    var vp = page.getViewport(1.0);
	    pw = (96.0/72.0)*(600.0/vp.width)
	    console.log(pw)
   	    var viewport = page.getViewport(pw);

	    // Prepare canvas using PDF page dimensions
	    var canvas = document.getElementById('the-canvas');

	    //var viewport = page.getViewport(remote.width / page.getViewport(1.0).width);


	    canvas.style.display = "block"

	    var context = canvas.getContext('2d');
	    canvas.height = viewport.height;
	    canvas.width = viewport.width;

	    // Render PDF page into canvas context
	    var renderContext = {
	      canvasContext: context,
	      viewport: viewport
	    };
	    var renderTask = page.render(renderContext);
	    renderTask.promise.then(function () {
	      console.log('Page rendered');
	      snap()

	    });
	  });
	}, function (reason) {
	  // PDF loading error
	  console.error(reason);
	});
}

window.addEventListener('load', onLoad);



//var iframe = document.createElement('iframe')
//iframe.src = "./docs/5221.enfance_camera_ready.pdf"
//document.body.appendChild(iframe)
