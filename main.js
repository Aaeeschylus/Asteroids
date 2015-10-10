//Asteroids Game
//By Bradley Elliott

var canvas = document.getElementById("gameCanvas");
var context = canvas.getContext("2d");

window.addEventListener('keydown', function(evt) {onKeyDown(evt);}, false);
window.addEventListener('keyup', function(evt) {onKeyUp(evt);}, false);

//Stuff for Delta Time
var startFrameMillis = Date.now();
var endFrameMillis = Date.now();
function getDeltaTime()
{
	endFrameMillis = startFrameMillis;
	startFrameMillis = Date.now();
	var deltaTime = (startFrameMillis -endFrameMillis) * 0.001;
	if(deltaTime > 1)
	{
		deltaTime = 1;
	}
	return deltaTime;
}

//Defining constant values for the game states
var STATE_SPLASH = 0;
var STATE_GAME = 1;
var STATE_GAMEOVER = 2;

var gameState = STATE_SPLASH;

//Variables about Canvas
var SCREEN_WIDTH = canvas.width;
var SCREEN_HEIGHT = canvas.height;

//Variables about speeds of objects
var ASTEROID_SPEED = 2;
var PLAYER_SPEED = 4;
var PLAYER_TURN_SPEED = 0.04;
var BULLET_SPEED = 5;

//Variables for background
var space = document.createElement("img");
space.src = "background.png";

var startScreen = document.createElement("img");
startScreen.src = "startscreen.png";

var gameOverScreen = document.createElement("img");
gameOverScreen.src = "endgame.png";

var background = [];
var startScreenBackground = [];
var endScreenBackground = [];

//Background for playing Game
for(var y=0;y<1;y++)
{
	background[y] = [];
	for(var x=0; x<1; x++)
		background[y][x] = space;
}

//Background for start screen
for(var y=0;y<1;y++)
{
	startScreenBackground[y] = [];
	for(var x=0; x<1; x++)
		startScreenBackground[y][x] = startScreen;
}

//Background for playing Game
for(var y=0;y<1;y++)
{
	endScreenBackground[y] = [];
	for(var x=0; x<1; x++)
		endScreenBackground[y][x] = gameOverScreen;
}

//Player variable
var player = {
	image: document.createElement("img"),
	x: SCREEN_WIDTH/2,
	y: SCREEN_HEIGHT/2,
	width: 93,
	height: 80,
	directionX: 0,
	directionY: 0,
	angularDirection: 0,
	rotation: 0,
	isDead: false
};

player.image.src = "ship.png";

//Arrays
var asteroids = [];
var bullets = [];

//Key Variables (With Key Codes)
var KEY_SPACE = 32;
var KEY_LEFT = 37;
var KEY_UP = 38;
var KEY_RIGHT = 39;
var KEY_DOWN = 40;

var KEY_A = 65;
var KEY_S = 83;

//Hold down space to shoot variable
var shootBullet = false;

//When keys are pressed down
function onKeyDown(event)
{
	if(event.keyCode == KEY_UP)
	{
		player.directionY = 1;
	}
	if(event.keyCode == KEY_DOWN)
	{
		player.directionY = -1;
	}
	if(event.keyCode == KEY_S)
	{
		player.directionX = -1;
	}
	if(event.keyCode == KEY_A)
	{
		player.directionX = 1;
	}
	if(event.keyCode == KEY_LEFT)
	{
		player.angularDirection = -1;
	}
	if(event.keyCode == KEY_RIGHT)
	{
		player.angularDirection = 1;
	}
	if(event.keyCode == KEY_SPACE && shootTimer <= 0)
	{
		shootBullet = true;
	}		
}

//When keys are no longer pressed down (pressed up)
function onKeyUp(event)
{
	if(event.keyCode == KEY_UP)
	{
		player.directionY = 0;
	}
	if(event.keyCode == KEY_DOWN)
	{
		player.directionY = 0;
	}
	if(event.keyCode == KEY_A)
	{
		player.directionX = 0;
	}
	if(event.keyCode == KEY_S)
	{
		player.directionX = 0;
	}
	if(event.keyCode == KEY_LEFT)
	{
		player.angularDirection = 0;
	}
	if(event.keyCode == KEY_RIGHT)
	{
		player.angularDirection = 0;
	}
	if(event.keyCode == KEY_SPACE)
	{
		shootBullet = false;
	}
}  

//Function for shooting Bullets
function playerShoot()
{
	//Bullet Variable
	var bullet = 
	{
		image: document.createElement("img"),
		x: player.x,
		y: player.y,
		width: 5,
		height: 5,
		velocityX: 0,
		velocityY: 0
 	};
	
	//Bullet Image
	bullet.image.src = "bullet.png";
	
	//Bullet  Default Velocity (Straight Up)
	var velX = 0;
	var velY = 1;
	
	//rotate the bullet vector to be in line with the front of the player
	var s = Math.sin(player.rotation);
	var c = Math.cos(player.rotation);
	
	var xVel = (velX * c) - (velY * s);
	var yVel = (velX * s) + (velY * c);
	
	bullet.velocityX = xVel * BULLET_SPEED;
	bullet.velocityY = yVel * BULLET_SPEED;
	
	//adding the bullet to the array list
	bullets.push(bullet);
}

//Defining intersect function so collision can occur 
function intersects(x1, y1, w1, h1, x2, y2, w2, h2)
{
	if(y2 + h2 < y1 ||
		x2 + w2 < x1 ||
		x2 > x1 + w1 ||
		y2> y1 + h1)
	{
		return false;
	}
	return true;
}

//Function to choose a random number
function rand(floor, ceil)
{
	return Math.floor( (Math.random()* (ceil-floor)) +floor);
}

//Function to spawn Asteroids
function spawnAsteroid()
{
	//determine the type of asteroid (small, medium, large)
	var asteroidType = rand(0,3);
	
	//create an asteroid
	var asteroid = {};
	
	switch(asteroidType)
	{
		case 0:
		asteroid.image = document.createElement("img");
		asteroid.image.src = "rock_small.png";
		asteroid.width = 22;
		asteroid.height = 20;
		break;
		
		case 1:
		asteroid.image = document.createElement("img");
		asteroid.image.src = "rock_medium.png";
		asteroid.width = 40;
		asteroid.height = 50;
		break;
		
		case 2:
		asteroid.image = document.createElement("img");
		asteroid.image.src = "rock_large.png";
		asteroid.width = 69;
		asteroid.height = 75;
		break;
	}
	
	//start setting position to spawn (centre of screen)
	var x = SCREEN_WIDTH/2;
	var y = SCREEN_HEIGHT/2;
	
	//Choosing random values to go to set spawn position
	var dirX = rand(-10,10);
	var dirY = rand(-10,10);
	
	//normalising the direction
	var magnitude = (dirX * dirX) + (dirY * dirY);
	if(magnitude != 0)
	{
		var oneOverMag = 1/Math.sqrt(magnitude);
		dirX *= oneOverMag;
		dirY *= oneOverMag;
	}
	
	//Find where it will spawn off of the screen
	var movX = dirX * SCREEN_WIDTH;
	var movY = dirY * SCREEN_HEIGHT;
	
	//spawn off of the screen
	asteroid.x = x + movX;
	asteroid.y = y + movY;
	
	//make the asteroid move towards the centre of the screen
	asteroid.velocityX = -dirX * ASTEROID_SPEED;
	asteroid.velocityY = -dirY * ASTEROID_SPEED;
	
	//add created asteroid to the asteroids array
	asteroids.push(asteroid);
}

//Creating variables for all run functions
var shootTimer = 0;
var spawnTimer = 0;
var score = 0;
var splashTimer = 5;

//Splash Function
function runSplash(deltaTime)
{
	//Drawing the background
	for(var y=0; y<1; y++)
	{
		for(var x=0; x<1; x++)
		{
			context.drawImage(startScreenBackground[y][x], x*1, y*1);
		}
	}
	
	//After splashTimer seconds, start the game
	splashTimer -= deltaTime;
	if(splashTimer <= 0)
	{
		gameState = STATE_GAME;
		return;
	}
	
	//Writing the Text
	context.fillStyle = 'white';
	context.strokeStyle = 'black';
	context.font="48px Verdana";
	context.fillText("ASTEROIDS", 190, 240);
	context.strokeText("ASTEROIDS", 190, 240);
	
	context.font ="24px Verdana";
	context.fillText("By Bradley Elliott", 230, 270)
	context.strokeText("By Bradley Elliott", 230, 270)

}

//Game Function
function runGame(deltaTime)
{	
	//Drawing the background
	for(var y=0; y<1; y++)
	{
		for(var x=0; x<1; x++)
		{
			context.drawImage(background[y][x], x*1, y*1);
		}
	}
	
	//update the shoot timer
	if(shootTimer > 0)
		shootTimer -= deltaTime;
	
	//update all the bullets
	for(var i=0; i<bullets.length; i++)
	{
		bullets[i].x = bullets[i].x + bullets[i].velocityX;
		bullets[i].y = bullets[i].y + bullets[i].velocityY;
	}
	
	for(var i=0; i<bullets.length; i++)
	{
		//check if the bullet has gone out of the screen. If so, kill it
		if(bullets[i].x < -bullets[i].width || bullets[i].x > SCREEN_WIDTH || bullets[i].y < -bullets[i].height || bullets[i].y > SCREEN_HEIGHT)
		{
			bullets.splice(i,1);
			break;
		}
	}
	
	//draw all the bullets
	for(var i=0; i<bullets.length; i++)
	{
		context.drawImage(bullets[i].image, bullets[i].x - bullets[i].width/2, bullets[i].y - bullets[i].height/2);
	}
	
	//update all of the asteroids in the array
	for(var i=0; i<asteroids.length; i++)
	{
		//update the asteroids position 
		asteroids[i].x = asteroids[i].x + asteroids[i].velocityX;
		asteroids[i].y = asteroids[i].y + asteroids[i].velocityY;
	}
	
	//draw all the asteroids
	for(var i=0; i<asteroids.length; i++)
	{
		context.drawImage(asteroids[i].image, asteroids[i].x, asteroids[i].y);
	}
	spawnTimer -= deltaTime;
	
	//create an asteroid every second
	if(spawnTimer <= 0)
	{
		spawnTimer = 1;
		spawnAsteroid();
	}
	
	//shoot a bullet
	if(shootBullet == true)
	{
		if(shootTimer <= 0.3)
		{
		shootTimer += 0.1;
		playerShoot();
		}
	}	
	
	//if the player goes off the screen, warp to other side.
	if(player.x < 0)
	{
		player.x = SCREEN_WIDTH
	}
		else if(player.x > SCREEN_WIDTH)
		{
			player.x = 0
		}
			else if(player.y < 0)
			{
				player.y = SCREEN_HEIGHT
			}
				else if(player.y > SCREEN_HEIGHT)
				{
					player.y = 0
				}
	
	//If any asteroid goes off the screen, warp to the other side.
	for(var i=0; i<asteroids.length; i++)
	{		
		if(asteroids[i].x + 69 < 0)
		{
			asteroids[i].x = SCREEN_WIDTH
		}
			else if(asteroids[i].x > SCREEN_WIDTH)
			{
				asteroids[i].x = 0 - 69
			}
				else if(asteroids[i].y +72 < 0)
				{
					asteroids[i].y = SCREEN_HEIGHT
				}
					else if(asteroids[i].y > SCREEN_HEIGHT)
					{
						asteroids[i].y = 0 - 72
					}
	}
	
	//for any asteroid touches any bullet, kill them both
	for(var i=0; i<asteroids.length; i++)
	{
		for(var j=0; j<bullets.length; j++)
			if(intersects(bullets[j].x, bullets[j].y, bullets[j].width, bullets[j].height, asteroids[i].x, asteroids[i].y, asteroids[i].width, asteroids[i].height) == true)
			{
				asteroids.splice(i, 1);
				bullets.splice(j,1);
				score = score + 1;
				break;
			}
	}
	
	//for any asteroid touching the player, kill them both and go to game over screen
	for(var i=0; i<asteroids.length; i++)
	{
		var hitPlayer = intersects(player.x - 23.25, player.y - 20, player.width/2, player.height/2, asteroids[i].x, asteroids[i].y,asteroids[i].width, asteroids[i].height);
		if(hitPlayer == true)
		{
			asteroids.splice(i, 1);
			gameState = STATE_GAMEOVER;
			break;
		}
	}

	//calculate the sin(sine) and cos(cosine) of the player's current rotation
	var s = Math.sin(player.rotation);
	var c = Math.cos(player.rotation);
	
	
	//calculate the player's velocity based on the current rotation
	var xDir = (player.directionX * c) - (player.directionY * s);
	var yDir = (player.directionX * s) + (player.directionY * c);
	var xVel = xDir * PLAYER_SPEED;
	var yVel = yDir * PLAYER_SPEED;
	
	player.x += xVel;
	player.y += yVel;
	
	player.rotation += player.angularDirection * PLAYER_TURN_SPEED;
	
	//Draw the player
	if(player.isDead == false)
	{
		context.save();
			context.translate(player.x, player.y);
			context.rotate(player.rotation);
			context.drawImage(player.image, -player.width/2, -player.height/2);
		context.restore();
	}
	
	//Writing the score
	context.fillStyle = 'white';
	context.strokeStyle = 'black';
	
	context.font = '40pt Verdana';
	context.fillText('kills: ' + score, 20, 50);
	context.strokeText('kills: ' + score, 20, 50);
	
	context.fill();
	context.stroke();	
}

//Game Over Function
function runGameOver(deltaTime)
{
	//Drawing the tiled background
	for(var y=0; y<1; y++)
	{
		for(var x=0; x<1; x++)
		{
			context.drawImage(endScreenBackground[y][x], x*1, y*1);
		}
	}
	
	//Writing the text on the screen
	context.fillStyle = 'white';
	context.strokeStyle = 'black';
	context.font="48px Verdana";
	context.fillText("Game Over", 190, 240);
	context.strokeText("Game Over", 190, 240);
	
	context.font="32px Verdana";
	context.fillText("Your score is: " + score, 195, 270);
	context.strokeText("Your score is: " + score, 195, 270);
	
	context.font="26px Verdana";
	context.fillText("Press F5 to restart!", 200, 300);
	context.strokeText("Press F5 to restart!", 200, 300);
}

//Run function (main function)
function run()
{
	//Creating Base Background (shade of cyan)
	context.fillStyle = "#7394B0";
	context.fillRect(0, 0, canvas.width, canvas.height);
	
	var deltaTime = getDeltaTime();
	
	switch(gameState)
	{
		case STATE_SPLASH:
			runSplash(deltaTime);
			break;
		case STATE_GAME:
			runGame(deltaTime);
			break;
		case STATE_GAMEOVER:
			runGameOver(deltaTime);
			break;
	}
}

//DO NOT TOUCH!!! IT IS THE FPS THINGY
(function() 
{
	var onEachFrame;
	if (window.requestAnimationFrame) 
	{
		onEachFrame = function(cb) 
		{
			var _cb = function() { cb(); window.requestAnimationFrame(_cb); }
			_cb();
		};
	} else if (window.mozRequestAnimationFrame) 
		{
			onEachFrame = function(cb) 
			{
			var _cb = function() { cb(); window.mozRequestAnimationFrame(_cb); }
			_cb();
			};
		} else 
		{
			onEachFrame = function(cb) 
			{
			setInterval(cb, 1000 / 60);
			}
		}
	window.onEachFrame = onEachFrame;
})();
window.onEachFrame(run);