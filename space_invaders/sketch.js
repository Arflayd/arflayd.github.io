//canvas size
var canvasSize;

//player variables
var playerLoc;
var playerSize = 40;
var playerImg;

//projectile variables
var projectileLoc;
var projectileSize;
var maxProjectiles = 15;
var enemyProjectilesLoc = [];
var projectileCooldown = 0;
var projectileCount = 0;

//enemy variables
var enemiesLoc = [];
var enemiesAlive = [];
var enemiesDir = [];
var enemiesOffset = [];
var enemyImg = [];
var enemyFireRate = 0.1;
var enemiesAliveCount = 30;

//game mechanic variables
var canFire = true;
var score = 0;

//preload all images before displaying the canvas
function preload(){
    
    playerImg = loadImage('img/player.png');
    enemyImg[0] = loadImage('img/enemy3.png');
    enemyImg[1] = loadImage('img/enemy1.png');
    enemyImg[2] = loadImage('img/enemy2.png');
}

function setup(){
  
    //vector setup
    canvasSize = createVector(1000, 600);
    playerLoc = createVector(canvasSize.x/2 - playerSize/2, canvasSize.y - 50);
    projectileSize = createVector(5, 20);
    projectileLoc = createVector(-projectileSize.x, -projectileSize.y);
    
    //move all projectiles offscreen
    for(var i = 0; i < maxProjectiles; i++)
        enemyProjectilesLoc[i] = createVector(-projectileSize.x, -projectileSize.y);
    
    //enemies' position setup
    for(var i = 0; i < 30; i++)
    {
        enemiesAlive[i] = true;
        if(i < 10)
            enemiesLoc[i] = createVector(100*i+30, 10);
        else if(i < 20)
            enemiesLoc[i] = createVector(100*(i-10)+30, 80);
        else
            enemiesLoc[i] = createVector(100*(i-20)+30, 150);           
    }
    
    //enemies' movement setup 
    for(var i = 0; i < 3; i++)
        enemiesOffset[i] = 0;
    
    //first draw
    createCanvas(canvasSize.x, canvasSize.y);
    strokeWeight(1);
    
    //pause the game (until diffictulty is chosen)
    noLoop();   
}

function start(){
    
    //choosing the difficulty
    var select = document.getElementById("difficulty");
    var mode = Number(select.options[select.selectedIndex].value);
    
    //disable the button when the game has started
    document.getElementById("startButton").disabled = true;
    
    //difficulty setup
    enemyFireRate = 0.5 - (0.2 * mode);
    maxProjectiles = 5 + (5 * mode);
    
    //start the game
    loop();
    return false;
}

function draw(){
    
    //redraw the playing field
    clear();
    background('rgba(0,0,0,0.9)');
     
    //check if the player has won
    winCheck();
    
    //move the player & the enemies
    playerMove();
    enemyMove();
    
    //fire and move the projectiles
    enemyFireProjectile();
    projectileMove();
    
    //check if a collision has occured
    enemyCollisionCheck();
    playerCollisionCheck();
    
    //draw projectiles
    drawProjectiles();
    //draw enemies
    drawEnemies(); 
    //draw the player
    drawPlayer();   
}

//player movement
function playerMove(){
    
    if(keyIsDown(LEFT_ARROW) && playerLoc.x >= 0)
        playerLoc.x -= 2;
    
    if(keyIsDown(RIGHT_ARROW) && playerLoc.x <= canvasSize.x - playerSize)
        playerLoc.x += 2;
}

//projectile movement
function projectileMove(){
      
    //player projectile (moves up, stops when offscreen)
    if(projectileLoc.y < 0)
    {
        projectileLoc.x = -projectileSize.x;
        projectileLoc.y = -projectileSize.y;
        canFire = true;     
    }
    else
        projectileLoc.y -= 5;
    
    //enemies' projectiles (move up, stop when offscreen)
    for(var i = 0; i < maxProjectiles; i++)
    {
        if(enemyProjectilesLoc[i].y > canvasSize.y)
        {
            enemyProjectilesLoc[i].x = -projectileSize.x;
            enemyProjectilesLoc[i].y = -projectileSize.y;   
        }
        else
            enemyProjectilesLoc[i].y += 5; 
    }       
}

//enemy movement
function enemyMove(){
    
    //every row moves by a different amount
    for(var i = 0; i < 3; i++)
        {
            if(Math.abs(enemiesOffset[i]) > 15 + i*5)
            {
                enemiesDir[i] = !enemiesDir[i];
            }
        }
     
    //every row moves with a different speed
    //offset the enemy
    for(var i = 0; i < 3; i++)
        {
            if(enemiesDir[i])
                enemiesOffset[i]+= 0.5 - (0.2 * i);
            else
                enemiesOffset[i]-= 0.5 - (0.2 * i);
        }              
    
    //move the enemy
    for(var i = 0; i < 30; i++)
        {
            if(enemiesDir[Math.floor(i/10)])
                enemiesLoc[i].x+= 0.5 - (0.2 * Math.floor(i/10));
            else
                enemiesLoc[i].x-= 0.5 - (0.2 * Math.floor(i/10));
        }
    
    //move all enemies vertically by a small amount
    for(var i = 0; i < 30; i++)
        {
            enemiesLoc[i].y += 0.05;
        }  
}

//player firing a projectile
function fireProjectile(){
    projectileLoc = playerLoc.copy();
    projectileLoc.x += playerSize/2 - projectileSize.x/2;
    canFire = false;
}

//enemies firing projectiles
function enemyFireProjectile(){
    
    //reuse projectile instead of creating and deleting
    if(projectileCount == maxProjectiles)
        projectileCount = 0;
    
    //instead of firing every frame, wait a little
    if(projectileCooldown <= 0)
        {
            //choose a random enemy to fire (has to be alive)
            do{
                enemyToFire = Math.round(Math.random()*29);
            }while(enemiesAlive[enemyToFire] == false)
            
            //fire the projectile
            enemyProjectilesLoc[projectileCount] = enemiesLoc[enemyToFire].copy();
            enemyProjectilesLoc[projectileCount].x += playerSize/2 - projectileSize.x/2;
            enemyProjectilesLoc[projectileCount].y += playerSize/2;
            projectileCount++;
            
            //set the cooldown according to the difficulty and enemies left
            projectileCooldown = enemyFireRate * 30/enemiesAliveCount;
        }
    else
        projectileCooldown -= 0.016; //decrease the cooldown every frame
    
}

//draw the player
function drawPlayer(){
    fill('#34baaa');
    image(playerImg, playerLoc.x, playerLoc.y, playerSize, playerSize);
}

//check if we hit any enemy
function enemyCollisionCheck()
{
    //if we hit an enemy, update the score, disable the enemy and reset the projectile
    for(var i = 0; i < 30; i++)
        {
            if(enemiesAlive[i] && projectileLoc.x < enemiesLoc[i].x + 40 && projectileLoc.x + projectileSize.x > enemiesLoc[i].x&& projectileLoc.y <= enemiesLoc[i].y)
                {
                    score += 1;
                    document.getElementById("score").innerHTML = "Score: "+score;
                    enemiesAlive[i] = false;
                    projectileLoc.x = -projectileSize.x;
                    projectileLoc.y = -projectileSize.y;
                    canFire = true;   
                    enemiesAliveCount--;
                }         
        }
}

//check if an enemy hit us
function playerCollisionCheck()
{
    //if we've been hit, pause the game
    for(var i = 0; i < maxProjectiles; i++)
        {
            if(enemyProjectilesLoc[i].x < playerLoc.x + 40 && enemyProjectilesLoc[i].x + projectileSize.x > playerLoc.x && enemyProjectilesLoc[i].y >= playerLoc.y)
                {
                    noLoop();
                    document.getElementById("score").innerHTML = "You've lost!";
                }          
        }
}

//draw all alive enemies
function drawEnemies(){
    
    fill('red');
    for(var i = 0; i < 30; i++)
        {
            if(enemiesAlive[i])
            image(enemyImg[Math.floor(i/10)], enemiesLoc[i].x, enemiesLoc[i].y, 40, 40);
        }
    
}

//draw all the projectiles
function drawProjectiles(){
    //player's projectile
    fill('#d3db00');
    rect(projectileLoc.x, projectileLoc.y, projectileSize.x, projectileSize.y);
    
    //enemies' projectiles
    fill('#ff0f73');
    for(var i = 0; i < maxProjectiles; i++)
        rect(enemyProjectilesLoc[i].x, enemyProjectilesLoc[i].y, projectileSize.x, projectileSize.y);
}

//check for firing action
function keyPressed(){
    if(keyCode === UP_ARROW && canFire)
        fireProjectile();
}

//check if we have won
function winCheck(){
    
    if(enemiesAliveCount == 0)
        {
            document.getElementById("score").innerHTML = "You've won!";
            noLoop();
        }
}