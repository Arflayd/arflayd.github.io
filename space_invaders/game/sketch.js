var canvasSize;

var playerLoc;
var playerSize = 40;
var playerImg;

var projectileLoc;
var projectileSize;
var maxProjectiles = 15;
var enemyProjectilesLoc = [];
var projectileCooldown = 0;
var projectileCount = 0;

var enemiesLoc = [];
var enemiesAlive = [];
var enemiesDir = [];
var enemiesOffset = [];
var enemyImg = [];
var enemyFireRate = 0.1;
var enemiesAliveCount = 30;

var canFire = true;
var score = 0;

function preload(){
    playerImg = loadImage('player.png');
    enemyImg[0] = loadImage('enemy3.png');
    enemyImg[1] = loadImage('enemy1.png');
    enemyImg[2] = loadImage('enemy2.png');
}

function setup(){
    
    //vector setup
    canvasSize = createVector(1000, 600);
    playerLoc = createVector(canvasSize.x/2 - playerSize/2, canvasSize.y - 50);
    projectileSize = createVector(5, 20);
    projectileLoc = createVector(-projectileSize.x, -projectileSize.y);
    
    for(var i = 0; i < maxProjectiles; i++)
        enemyProjectilesLoc[i] = createVector(-projectileSize.x, -projectileSize.y);
    
    
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
    
    for(var i = 0; i < 3; i++)
        enemiesOffset[i] = 0;
    
    //first draw
    createCanvas(canvasSize.x, canvasSize.y);
    strokeWeight(1);
    
    noLoop();
    
}

function start(){
    var opt = document.getElementById("difficulty");
    var mode = opt.options[opt.selectedIndex].value;
    
    document.getElementById("startButton").disabled = true;
    
    if(mode == "easy")
        {
            enemyFireRate = 0.5; maxProjectiles = 5;
        }
    else if(mode == "medium")
        {
            enemyFireRate = 0.3; maxProjectiles = 10;
        }
    else
        {
            enemyFireRate = 0.1; maxProjectiles = 15;
        }
    
    loop();
    return false;
}

function draw(){
    clear();
    background('rgba(0,0,0,0.9)');
    if(enemiesAliveCount == 0)
        {
            document.getElementById("punkt").innerHTML = "You've won!";
            noLoop();
        }
    
    
    playerMove();
    enemyMove();
    
    enemyFireProjectile();
    projectileMove();
    
    enemyCollisionCheck();
    playerCollisionCheck();
    
    //enemies
    drawEnemies(); 
    //projectiles
    drawProjectiles();
    //player
    fill('#34baaa');
    image(playerImg, playerLoc.x, playerLoc.y, playerSize, playerSize);
    
     
    
    //debug v v v
    
    
    //document.getElementById("punkt").innerHTML = 
    
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
      
    //player projectile
    if(projectileLoc.y < 0)
    {
        projectileLoc.x = -projectileSize.x;
        projectileLoc.y = -projectileSize.y;
        canFire = true;     
    }
    else
        projectileLoc.y -= 5;
    
    //enemies projectiles
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
    
    //top row
    if(Math.abs(enemiesOffset[0]) > 25)
        {
            enemiesDir[0] = !enemiesDir[0];
        }
    
    //middle row
    if(Math.abs(enemiesOffset[1]) > 10)
        {
            enemiesDir[1] = !enemiesDir[1];
        }
    
    //bottom row
    if(Math.abs(enemiesOffset[2]) > 15)
        {
            enemiesDir[2] = !enemiesDir[2];
        }
        
    if(enemiesDir[0])
        enemiesOffset[0]+=0.3;
    else
        enemiesOffset[0]-=0.3;
    
    if(enemiesDir[1])
        enemiesOffset[1]+=0.5;
    else
        enemiesOffset[1]-=0.5;
    
    if(enemiesDir[2])
        enemiesOffset[2]+=0.1;
    else
        enemiesOffset[2]-=0.1;
    
    for(var i = 0; i < 10; i++)
        {
            if(enemiesDir[0])
                enemiesLoc[i].x+=0.3;
            else
                enemiesLoc[i].x-=0.3;
        }
    
    for(var i = 10; i < 20; i++)
        {
            if(enemiesDir[1])
                enemiesLoc[i].x+=0.5;
            else
                enemiesLoc[i].x-=0.5;
        }
    
    for(var i = 20; i < 30; i++)
        {
            if(enemiesDir[2])
                enemiesLoc[i].x+=0.1;
            else
                enemiesLoc[i].x-=0.1;
        }
    
    for(var i = 0; i < 30; i++)
        {
                enemiesLoc[i].y+=0.03;
        }
    
    
}

//fire the projectile
function fireProjectile(){
    projectileLoc = playerLoc.copy();
    projectileLoc.x += playerSize/2 - projectileSize.x/2;
    canFire = false;
}

function enemyFireProjectile(){
    
    if(projectileCount == maxProjectiles)
        projectileCount = 0;
    
    if(projectileCooldown <= 0)
        {
            do{
                enemyToFire = Math.round(Math.random()*29);
            }while(enemiesAlive[enemyToFire] == false)
                       
            enemyProjectilesLoc[projectileCount] = enemiesLoc[enemyToFire].copy();
            enemyProjectilesLoc[projectileCount].x += playerSize/2 - projectileSize.x/2;
            enemyProjectilesLoc[projectileCount].y += playerSize/2;
            projectileCount++;
            projectileCooldown = enemyFireRate * 30/enemiesAliveCount;
        }
    else
        projectileCooldown -= 0.016;
    
}

function enemyCollisionCheck()
{
    for(var i = 0; i < 30; i++)
        {
            if(enemiesAlive[i] && projectileLoc.x < enemiesLoc[i].x + 40 && projectileLoc.x + projectileSize.x > enemiesLoc[i].x&& projectileLoc.y <= enemiesLoc[i].y)
                {
                    score += 1;
                    document.getElementById("punkt").innerHTML = "Score: "+score;
                    enemiesAlive[i] = false;
                    projectileLoc.x = -projectileSize.x;
                    projectileLoc.y = -projectileSize.y;
                    canFire = true;   
                    enemiesAliveCount--;
                }
                
                
        }
}

function playerCollisionCheck()
{
    for(var i = 0; i < maxProjectiles; i++)
        {
            if(enemyProjectilesLoc[i].x < playerLoc.x + 40 && enemyProjectilesLoc[i].x + projectileSize.x > playerLoc.x && enemyProjectilesLoc[i].y >= playerLoc.y)
                {
                    noLoop();
                    document.getElementById("punkt").innerHTML = "You've lost!";
                }
                
                
        }
}

function drawEnemies(){
    fill('red');
    for(var i = 0; i < 30; i++)
        {
            if(enemiesAlive[i])
            image(enemyImg[Math.floor(i/10)], enemiesLoc[i].x, enemiesLoc[i].y, 40, 40);
        }
    
}

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