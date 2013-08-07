$(document).ready(function()
{
	var backgroundcanvas = $("#layer1")[0];
	var ctx = backgroundcanvas.getContext("2d");

	var w = $("#layer1").width();
	var h = $("#layer1").height();

	var foregroundcanvas = $("#layer2")[0];
	var ctx2 = foregroundcanvas.getContext("2d");

	var score = 0;
	var roof = null;
	var roof2 = null;
	var heli = null;
	var fps = 60;
	var moveSpeed = 10;

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

	var Helicopter = function()
	{
		this.position = new vector(100,200);
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
			score +=1;
			this.imgd = ctx.getImageData(0, 0,w, h);
			//console.log(this.getPosition().x)
			col = this.hitTest();
			
			if(col)init();
	
		}

		this.hitTest = function(){
			color = "rgba(139,9,19,255)";
			var rect = new Rectangle(this.getPosition().x,Math.round(this.getPosition().y),10,10);
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
		this._y = Math.floor((Math.random()*230)+this.offsetY);
		this.position = new vector(x,this._y);
		
		this.getPosition = function()
		{
			return this.position;
		}
	}

	var wall2 = function(x){
		this.offsetY = h;

		this._y = Math.floor((this.offsetY-Math.random()*230));
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
				 	_wall.getPosition().x  = w+200;
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
				 	_wall.getPosition().x  = w+200;
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
		

		roof.moveRoof();
		roof2.moveRoof();
		heli.update();
		
	}

	function draw(){
		paint();
		roof.paintRoof();
		roof2.paintRoof();
		heli.draw();
		drawHud();
	}

	
	function paint(){
		ctx.clearRect (0 , 0,w , h );
		ctx.fillStyle = "gray";
		ctx.fillRect(0, 0, w, h);
	}


	function drawHud(){
		ctx.fillStyle = "black";
		ctx.font = '20pt Calibri';
		ctx.fillText('score: '+score, 10, h-20);
	}


	function init(){
		roof = new Roof();
		roof2 = new Roof2();
		heli = new Helicopter();
		score = 0;
	}

	init();

	function run() {
		updateStats.update();
		update();
        draw();
        renderStats.update();
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