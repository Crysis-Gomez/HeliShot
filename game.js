var request;

var openPaths = new Array();
var closePaths = new Array();
var started = false;

$(document).ready(function()
{
	var canvas = $("#canvas")[0];
	var ctx = canvas.getContext("2d");

	var canvas2 = $("#canvas2")[0];
	var ctx2 = canvas2.getContext("2d");

	var w = $("#canvas").width();
	var h = $("#canvas").height();
	
	var renderStats = new Stats();
	document.body.appendChild(renderStats.domElement);

	var updateStats = new Stats();
	document.body.appendChild(updateStats.domElement);

	var get_pixel = function(x,y,canvasData,offsetX,offsetY){
	
		x = x + offsetX;
		y = y + offsetY;

		if(x < 0 || y < 0 || x > canvasData.width || y > canvasData.height) return;

		var r = (y * canvasData.width + x) * 4;
		var g = (y * canvasData.width + x) * 4 + 1;
		var b = (y * canvasData.width + x) * 4 + 2;
		var a = (y * canvasData.width + x) * 4 + 3;

		return "rgba(" + canvasData.data[r] + "," + canvasData.data[g] + "," + canvasData.data[b]+ ","+ canvasData.data[a]+")";
	};

	var Rectangle = function(x,y,w,h){
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.grid = new Array();
		for (var x_ = 0; x_ < this.w; x_++) {
			for (var y_ = 0; y_ < this.h; y_++) {
				this.grid.push([this.x + x_, this.y + y_]);
			}
		}
	};


    var Tunnel = function(){

    	this.holes = new Array();
    	this.baseVector = new vector(0,300);
    	
    	this.draw = function(){
    		ctx2.lineWidth = 150;
			ctx2.lineJoin = ctx.lineCap = 'round';
			ctx2.strokeStyle="#FF0000";
			ctx2.clearRect(0,0,w,h);

    		ctx2.moveTo(this.holes[0].x, this.holes[0].y);
    		for (var i = 1; i < this.holes.length; i++) {
    				
    			 ctx2.lineTo(this.holes[i].x, this.holes[i].y);			 
    		};

    		ctx2.stroke();
    	}

    	this.addPosition = function(vec){
    		this.holes.push(vec);
    
    	}

    	this.addPosition(new vector(0,200));
    	this.addPosition(new vector(100,200));
    	this.addPosition(new vector(200,350));
    	this.addPosition(new vector(300,350));
    	this.addPosition(new vector(600,150));
    	this.addPosition(new vector(700,200));
    	this.addPosition(new vector(800,200));
    }
    

	var Helicopter = function()
	{
		this.position = new vector(100,180);
		this.prevPosition = new vector(100,280);
		this.velocity  = new vector(0,2);
		this.gravity = 1;
		this.burst = 0;
		this._width = 10;
		this._height = 10;
		this.mayBurst = false;
		this.imgd = null;

		this.getPosition = function()
		{
			return this.position;
		}

		this.getVelocity = function()
		{
			return this.velocity;
		}

		this.update = function()
		{
			ctx.clearRect(this.position.x, this.position.y, this._width, this._height);
			
			if(this.mayBurst)
			{
				if(this.velocity.y > -3)
				{
					this.velocity.y -= 1;
				}
			}
			else
			{
				if(this.velocity.y < 3)
				{
					this.velocity.y += 1;
				}
			}

			this.position.y += this.velocity.y;
			this.imgd = ctx2.getImageData(this.position.x, this.position.y,this._width, this._height);
			//ctx.fillStyle = "black";
			//ctx.fillRect(this.position.x, this.position.y, this._width, this._height);	
			this.draw();

			if(this.hitTest())cancelAnimationFrame(request);
		}

		this.hitTest = function(){
			color = "rgba(0,0,0,255)";
			var rect = new Rectangle(0,0,10,10);
			for (var i = 0; i < rect.grid.length; i++) {
				var x = rect.grid[i][0];
				var y = rect.grid[i][1];
				var pixel = get_pixel(x,y,this.imgd,-0,-0);
				if(pixel == color) return true;
			}
			return false;
		};

		this.draw = function()
		{
			ctx.beginPath();
	      	ctx.arc(this.position.x+5, this.position.y+5, 5, 0, 2 * Math.PI, false);
	      	ctx.fillStyle = '#3cff00';
	      	ctx.fill();      	
		}
	}

	var Path =  function(src,x,y,active){
		var position = new vector(x,y)
		var imageObj = new Image();
		var that = this;
		var active  = active;
	
		
		imageObj.onload = function(){
			ctx2.drawImage(imageObj, position.x, position.y);
			
			if(active)openPaths.push(that);
			else closePaths.push(that);

			if(openPaths.length == 1 && !started){
				started = true;
				request = requestAnimationFrame(animloop);
			}
		};

	    imageObj.src = src;
	    
	    this.moveImage = function(){
	    	position.x -= 6;	    	
	    	ctx2.drawImage(imageObj,position.x,position.y)
	    }

	    this.checkImage = function(){
	    	if(position.x < -800){
	    		closePaths.push(this);
	    		var index = openPaths.indexOf(that);
	    		openPaths.splice(index,1);
	    		this.selectPath();
	    	}
	    }

	    this.resetPosition=function(x,y){
	    	position = new vector(x,y);
	    }

	    this.selectPath = function(){
	    	var index = Math.floor((Math.random()*closePaths.length-1)+1);
	    	var obj = closePaths[index];
	    	obj.resetPosition(position.x+1600,20);
	    	openPaths.push(obj);
	    	closePaths.splice(index,1)   
	    }
	}

	function drawHud(){
		ctx.fillStyle = "black";
		ctx.font = '20pt Calibri';
		ctx.fillText('distance: '+ playerscore, 10, h-20);
	}

	function init(){
		heli = new Helicopter();
		path_one = new Path('http://localhost/helishot/HeliShot/path.png',0,20,true);
		path_two = new Path('http://localhost/helishot/HeliShot/path2.png',800,20,true);
		path_three = new Path('http://localhost/helishot/HeliShot/path3.png',1600,20,false);
		path_four = new Path('http://localhost/helishot/HeliShot/path4.png',1600,20,false);
		path_five = new Path('http://localhost/helishot/HeliShot/path5.png',1600,20,false);
		path_six = new Path('http://localhost/helishot/HeliShot/path6.png',1600,20,false);
	    

		//tunnel = new Tunnel();
		//tunnel.draw();
	}

	function animloop(){
		request = requestAnimationFrame(animloop);
  		
  		ctx2.clearRect(0,0,w,h);
  		for (var i = 0; i < openPaths.length; i++) {
  			openPaths[i].moveImage();
  		};

  		for (var i = 0; i < openPaths.length; i++) {
  			openPaths[i].checkImage();
  		};
  	  	
  		heli.update();
	}

    init();
	
	window.addEventListener("keydown", function (e) {

		if(e.keyCode == 32)
		{
			heli.mayBurst = true;
		} 
	});
	window.addEventListener("keyup", function (e){
		if(e.keyCode == 32)
		{
			heli.mayBurst = false;
		}
	});
});