$(document).ready(function()
{
	var backgroundcanvas = $("#layer1")[0];
	var ctx = backgroundcanvas.getContext("2d");

	var w = $("#layer1").width();
	var h = $("#layer1").height();

	var foregroundcanvas = $("#layer2")[0];
	var ctx2 = foregroundcanvas.getContext("2d");

	var playerscore = 0;
	var roof = null;
	var roof2 = null;
	var heli = null;
	var fps = 60;
	var moveSpeed = 2;
	var isRunning = false;
	var date = null;
	var menu = null;
	var jsonObject = null;

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


	var button = function(){
    	this.position = new vector(w*0.5-70, h*0.5-25);
    	this.h = 40;
    	this.w = 100;
    	this.isColliding = false;
    	this.txt = ""

    	this.draw = function(){
    		ctx.fillStyle = "blue";
    		ctx.fillRect(this.position.x, this.position.y, 100, 40);
			ctx.font = '20pt Calibri';
			ctx.fillStyle = "black";
			ctx.fillText(this.txt, this.position.x+20, this.position.y+25);
    	}

    	this.drawOver = function(){
    		ctx.fillStyle = "blue";
    		ctx.fillRect(this.position.x, this.position.y, 100, 40);
			ctx.strokeStyle="#FF0000";
			ctx.strokeRect(this.position.x, this.position.y, 100, 40);
			ctx.font = '20pt Calibri';
			ctx.fillStyle = "black";
			ctx.fillText(this.txt, this.position.x+20, this.position.y+25);
    	}

    	this.getText = function(){
    		return this.txt;
    	};
    }

    var Menu = function(){
    	this.buttons = new Array();

    	this.createButton = function(){
    		this.buttons = new Array();
    		for (var i = 0; i < 3; i++) {
    			but = new button();
    			but.txt = this.assignText(i);
    			but.position.y += 50 *i;
    			this.buttons.push(but);
    		};
    	};

    	this.assignText = function(index){
    		switch(index){

    			case 0:

    			return "start";

    			case 1:

    			return "high score"

    			case 2:

    			return "about";

    		}
    	}

    	this.drawButtons = function(){
    		for (var i = 0; i < this.buttons.length; i++) {
    			b = this.buttons[i];
    			if(b.isColliding){
    				b.drawOver();
    			}else{
    				b.draw();	
    			}
    		};
    	}
    }

	var Helicopter = function()
	{
		this.position = new vector(100,280);
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
			playerscore += moveSpeed;
			this.imgd = ctx.getImageData(this.position.x, this.position.y,this._width, this._height);
			if(this.hitTest())init();
		}

		this.hitTest = function(){
			color = "rgba(139,9,19,255)";
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
			ctx2.clearRect (0, 0,w,h);
			ctx2.fillStyle = "black";
			ctx2.fillRect(this.position.x, this.position.y, this._width, this._height);
		}
	}

	var wall = function(x){
		this.offsetY = 15;
		this._y = Math.floor((Math.random()*100)+this.offsetY);
		this.position = new vector(x,this._y);
		
		this.getPosition = function()
		{
			return this.position;
		}
	}

	var wall2 = function(x){
		this.offsetY = h;
		this._y = Math.floor((this.offsetY-Math.random()*100));
		this.position = new vector(x,this._y);
		
		this.getPosition = function()
		{
			return this.position;
		}	
	}

	var Roof2 = function(){
		var walls = new Array();
		var _wall = null;

		for (var i = -1; i < 11; i++) {
			 var _w = new wall2(100*i);
			 walls.push(_w);
		};

		this.moveRoof = function(){
			for (var i = 0; i < walls.length; i++) {
				 _wall = walls[i];
				 _wall.getPosition().x -=moveSpeed;
				 if(_wall.getPosition().x < -300)
				 {
				 	walls.splice(i,1);
				 	_wall.getPosition().x = w+200;
				 	_wall.getPosition().y = Math.floor((_wall.offsetY-Math.random()*220));
				 	walls.push(_wall);
				 }
			};
		}

		this.paintRoof = function(){
			ctx.fillStyle = "rgba(139,9,19,1)";
			ctx.beginPath();
			ctx.moveTo(walls[0].getPosition().x,h);
			
			for (var i = 0; i < walls.length; i++) {
				 _wall = walls[i];
				if(i != 0)
				{
					ctx.lineTo(_wall.getPosition().x, _wall.getPosition().y);
				}
			};
			ctx.lineTo(_wall.getPosition().x, h);
			ctx.closePath();
			ctx.fill();
		}
	}

	var Roof = function(){
		var walls = new Array();
		var segments = new Array();
		var _wall = null;

		for (var i = -1; i < 11; i++) {
			 var _w = new wall(100*i);
			 walls.push(_w);
		};

		this.moveRoof = function(){
			for (var i = 0; i < walls.length; i++) {
				 _wall = walls[i];
				 _wall.getPosition().x -=moveSpeed;
				 if(_wall.getPosition().x < -300)
				 {
				 	walls.splice(i,1);
				 	_wall.getPosition().x = w+200;
				 	_wall.getPosition().y = Math.floor((_wall.offsetY+Math.random()*220));
				 	walls.push(_wall);
				 }
			};
		}

		this.paintRoof = function(){
			ctx.closePath();
			ctx.fillStyle = "rgba(139,9,19,1)";
			ctx.beginPath();
			ctx.moveTo(walls[0].getPosition().x,0);
			
			for (var i = 0; i < walls.length; i++) {
				 _wall = walls[i];
				if(i != 0)
				{
					ctx.lineTo(_wall.getPosition().x, _wall.getPosition().y);
				}
			};
			ctx.lineTo(_wall.getPosition().x, 0);
			ctx.closePath();
			ctx.fill();
		}
	}

	function update(){
		if(isRunning){
			roof.moveRoof();
			roof2.moveRoof();
			heli.update();
		}	
	}

	function draw(){
		paint();
		roof.paintRoof();
		roof2.paintRoof();
		heli.draw();
		drawHud();
		if(heli.imgd !== null){
			ctx.putImageData(heli.imgd,250, 250);	
		}
		
		if(!isRunning)menu.drawButtons();
	}
	
	function paint(){
		ctx.clearRect (0 , 0,w , h );
		ctx.fillStyle = "gray";
		ctx.fillRect(0, 0, w, h);
	}

	function drawHud(){
		ctx.fillStyle = "black";
		ctx.font = '20pt Calibri';
		ctx.fillText('distance: '+playerscore, 10, h-20);
	}

	function init(){
		roof = new Roof();
		roof2 = new Roof2();
		heli = new Helicopter();
		playerscore = 80;
		moveSpeed = 2;
		menu = new Menu();
		menu.createButton();
		date = new Date().getTime();
	}

	function showhighscore(){
		var url = 'highscores.json';

		$.ajax({
		   type: 'GET',
		    url: url,
		    async: false,
		    contentType: "application/json",
		    success: function(json) {
		       jsonObject = JSON.parse(json);
		    },
		    error: function(e) {
		       console.log(e.message);
		    }
		});
	}

	function getScores(){
		var url = 'highscores.json';
		$.ajax({
		   type: 'GET',
		    url: url,
		    async: false,
		    contentType: "application/json",
		    success: function(json) {
		       jsonObject = JSON.parse(json);
		    },
		    error: function(e) {
		       console.log(e.message);
		    }
		});
	}

	function checkJsonObject(){
		var replaceIndex = "none";
		getScores();

		if(playerscore > jsonObject['first']['score']){
			replaceIndex = "first";
		}else if(playerscore > jsonObject['second']['score']){
			replaceIndex = "second";
		}else if(playerscore > jsonObject['third']['score']){
			replaceIndex = "third";
		}
	  return replaceIndex;
	}

	function sendToPHP(){
		var _data = checkJsonObject();
		if(_data != 'none'){
			$.post("highscore.php", {data:_data,score:playerscore}, function(results){
			  // the output of the response is now handled via a variable call 'results'
			  alert(results);
			});
		}
	}

	function start(){
		date = new Date().getTime();
		isRunning = true;
		foregroundcanvas.removeEventListener('click',mouseClick,false);
		foregroundcanvas.removeEventListener('mousemove',mouseMove,false);
		moveSpeed = 2;
	}

	function mouseMove(e){
		collides(menu.buttons, e.offsetX, e.offsetY);
	}

	function mouseClick(){
		for (var i = 0; i < menu.buttons.length; i++) {
        	 var but = menu.buttons[i];
        	 if(but.isColliding){
        	 	switch(but.getText()){
        	 		case "start":
        	 				start();
        	 		break;

        	 		case "high score":
        	 			showhighscore();
        	 		break;

        	 		case "about":
        	 				sendToPHP();
        	 		break;
        	 	}
        	 }
        };
	}

	init();

	function run() {
		updateStats.update();
		update();
        draw();
        renderStats.update();
       	var _current = new Date().getTime();
       	var diff = _current-date;
       	if(diff > 4000){
       		moveSpeed +=1;
       		date = _current;
       	}
    }

    (function() {
        var onEachFrame;
        if (window.webkitRequestAnimationFrame) {
          onEachFrame = function(cb) {
            var _cb = function() { cb(); webkitRequestAnimationFrame(_cb); }
            _cb();
          };
        } else if (window.mozRequestAnimationFrame) {
          onEachFrame = function(cb) {
            var _cb = function() { cb(); mozRequestAnimationFrame(_cb); }
            _cb();
          };
        } else {
          onEachFrame = function(cb) {
            setInterval(cb, 1000 / 60);
          }
        }
        
        window.onEachFrame = onEachFrame;
      })();

      window.onEachFrame(run);

    function collides(buttons, x, y) {
    	var isCollision = false;
	    for (var i = 0, len = buttons.length; i < len; i++) {
	        var left = buttons[i].position.x, right = buttons[i].position.x+buttons[i].w;
	        var top = buttons[i].position.y, bottom = buttons[i].position.y+buttons[i].h;
	        if (right >= x
	            && left <= x
	            && bottom >= y
	            && top <= y) {
	            isCollision = true;
	            buttons[i].isColliding = true;
	        }else{
	        	buttons[i].isColliding = false;
	        }
	    }
	    return isCollision;
	}

    foregroundcanvas.addEventListener('click', mouseClick, false);
	foregroundcanvas.addEventListener('mousemove',mouseMove ,false);

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