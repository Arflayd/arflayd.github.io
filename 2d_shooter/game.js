//player
var playerLoc;
var playerSize = 40;
var playerSpeed = 3;
var diagonalSpeed;
var immunity = 0;
var maxHealth = 5;
var health;
//player bullets
var bulletLocs = [];
var bulletAngles = []
var bulletSpeed = 8;
var maxBullets = 5;
var bulletIndex = 0;
var bulletActive = [];
var cooldown = 0;

//enemy
var maxEnemies = 10;
var enemyCount = 3;
var enemyLocs = [];
//enemy bullets
var enemyBulletCooldowns = [];
var enemyBulletLocs = [];
var enemyBulletAngles = [];

var enemyMaxHealth = 3;
var enemyHealth = [];

//enemy spawning
var spawnPoint;
var spawnLoc;

//the score
var score =  0;

function setup(){
    
    createCanvas(1000,600);
    
    //player setup
    playerLoc = createVector(width/2, height/2);
    diagonalSpeed = sin(QUARTER_PI)*playerSpeed;
    health = maxHealth;
    
    //enemy, enemy bullets setup
    spawnLoc = createVector(0,0);
    for(var i = 0; i < maxEnemies; i++)
        {
            //every enemy has a  random spawn point
            randomizeSpawnPoint();
            
            enemyLocs[i] = createVector(spawnLoc.x, spawnLoc.y);
            enemyBulletCooldowns[i] = 1;
            enemyBulletLocs[i] = createVector(0,0);
            enemyBulletAngles[i] = 90;
            enemyHealth[i] = enemyMaxHealth;
        }
           
    //player bullet setup
    for(var i = 0; i < maxBullets; i++)
        {
            bulletLocs[i] = createVector(-5,-5);
            bulletAngles[i] = 0;
            bulletActive[i] = false;
        }   
    
    //drawing setup
    strokeWeight(3);
    textSize(24);
}

function draw(){
    
    //clear the board
    clear();
    background('#497432');
    
    //reduce  the firing cooldown for the enemies
    for(var i = 0; i < enemyCount; i++)
        {
            if(enemyBulletCooldowns[i] > 0)
                enemyBulletCooldowns[i] -= 0.016;
        } 
    
    //reduce player's immunity to bullets after being hit
    if(immunity > 0)
        immunity -= 0.016;
    
    //main mechanics
    playerMovement();
    
    playerGunMovement();
    
    enemyMovement();
    
    enemyGunMovement();
    
    enemyShoot();
    
    enemyBulletMovement();
    
    playerBulletMovement();
      
    collisionCheck();
    
    reloading();
    
    //drawing
    
    //if player has been recently hit, change his color to red
    if(immunity <= 0)
        fill('#d69f46');
    else
        fill('#a2001f');
    
    //draw the player
    ellipse(playerLoc.x,playerLoc.y,playerSize,playerSize);
    
    //display amount of bullets left
    fill('rgba(0,0,0,0.8)');
    if(cooldown <= 0)
        text(5-bulletIndex, playerLoc.x-7, playerLoc.y+8);
    
    //draw the enemies
    fill('#7c5412');
    for(var i = 0; i < enemyCount; i++)
            ellipse(enemyLocs[i].x,enemyLocs[i].y,playerSize,playerSize);
    
    //draw player's bullets
    fill('#1c1c1c');
    for(var i = 0; i < maxBullets; i++)
            ellipse(bulletLocs[i].x,bulletLocs[i].y,5,5);
    
    //draw enemies' bullets
    for(var i = 0; i < enemyCount; i++)
            ellipse(enemyBulletLocs[i].x,enemyBulletLocs[i].y,5,5);
    
    //draw player's healthbar
    fill(0);
    rect(playerLoc.x - playerSize/2, playerLoc.y + 25, playerSize, 7);
    fill('#a2001f');
    rect(playerLoc.x - playerSize/2, (playerLoc.y + 25), (playerSize / maxHealth) * health, 7);
    
    //draw enemies'  healthbars
    for(var i = 0; i < enemyCount; i++)
        {
            fill(0);
            rect(enemyLocs[i].x - playerSize/2, enemyLocs[i].y + 25, playerSize, 7);
            fill('#a2001f');
            rect(enemyLocs[i].x - playerSize/2, (enemyLocs[i].y + 25), (playerSize / enemyMaxHealth) * enemyHealth[i], 7);
        } 
}

function collisionCheck(){
    
    //PLAYER HITS ENEMY
    //check for every bullet
    for(var i = 0; i < maxBullets;  i++)
        {
            //check fo every enemy
            for(var j = 0; j < enemyCount; j++)
                {
                    //if that bullet hit any enemy
                    if(dist(bulletLocs[i].x, bulletLocs[i].y, enemyLocs[j].x, enemyLocs[j].y) < playerSize/2)
                    {
                        //destroy the bullet
                        bulletActive[i] = false;
                        bulletLocs[i].set(-5,-5);
                        
                        //damage the enemy
                        enemyHealth[j]--;
                        
                        //if the enemy has died
                        if(enemyHealth[j] <= 0)
                            {
                                //respawn the enemy, add to the score
                                randomizeSpawnPoint();
                                enemyHealth[j] = enemyMaxHealth;
            
                                enemyLocs[j].set(spawnLoc.x, spawnLoc.y);
                                
                                score++;
                                document.getElementById("score").innerHTML = "Score: "+score;
                        
                                //increasing difficulty every 10 points
                                enemyCount = Math.floor(score/10) + 3;
                            }            
                    } 
                }    
        }
    
    //ENEMY HITS THE PLAYER
    for(var i = 0; i < enemyCount; i++)
        {
            //if any of the enemies' bullets hits the player, and the player is not immune
             if(dist(enemyBulletLocs[i].x, enemyBulletLocs[i].y, playerLoc.x, playerLoc.y) < playerSize/2 && immunity <= 0)
              {
                  //make the player immune to bullets for a while, reduce his healt
                    immunity = 0.1;
                    health--;
                    if(health <= 0)
                        {
                            //if the player died stop the game, display the score
                            noLoop();
                            document.getElementById("score").innerHTML = "You've lost! Score: "+score;
                        }              
             } 
        }        
}

function enemyMovement(){

    //enemy moves towards the player, but stops at a certain distance
    for(var i = 0; i < enemyCount; i++)
        {
            if(dist(enemyLocs[i].x, enemyLocs[i].y, playerLoc.x, playerLoc.y) > 200)
                enemyLocs[i] = p5.Vector.lerp(enemyLocs[i], playerLoc, 0.002);
        }
}
    
function enemyGunMovement(){
    
    for(var i = 0; i < enemyCount; i++)
        {
            //draw a gun (rect) facing the player
            push();
            fill('#262626');
            translate(enemyLocs[i].x, enemyLocs[i].y);
            var angle = atan2(playerLoc.y - enemyLocs[i].y, playerLoc.x - enemyLocs[i].x);
            rotate(angle);  
            rect(5, -2.5, 30, 5);
            pop();
        } 
}

function enemyShoot(){
    
    for(var i = 0; i < enemyCount; i++)
        {
            //if the enemy is not reloading
            if(enemyBulletCooldowns[i] <= 0)
            {   
                //randomize the cooldown
                enemyBulletCooldowns[i] = Math.random()*1+1.5;

                //move the bullet to the enemy, offset it to match the gun's barrel
                enemyBulletLocs[i] = enemyLocs[i].copy();

                enemyBulletAngles[i] = atan2(playerLoc.y - enemyLocs[i].y, playerLoc.x - enemyLocs[i].x);
                enemyBulletLocs[i].x += cos(enemyBulletAngles[i]) * 35;
                enemyBulletLocs[i].y += sin(enemyBulletAngles[i]) * 35;
            }
        }   
}
    
function enemyBulletMovement(){
    
    //the bullets move according to the angle they've been shot at
    for(var i = 0; i < enemyCount; i++)
        {
            enemyBulletLocs[i].x += cos(enemyBulletAngles[i]) * bulletSpeed;
            enemyBulletLocs[i].y += sin(enemyBulletAngles[i]) * bulletSpeed;
        }
}

function playerShoot()
{
    //player is not reloading
    if(cooldown <= 0)
        {   
            //use next bullet
            bulletIndex++;
            //if it's the last bullet, reload
            if(bulletIndex == maxBullets)
                {
                    bulletIndex = 0;
                    cooldown = 1;
                }
                 
            //move the bullet to the player, offset it to match the gun's barrel, make it active
            bulletLocs[bulletIndex] = playerLoc.copy();
            
            bulletAngles[bulletIndex] = atan2(mouseY - playerLoc.y, mouseX - playerLoc.x);
            bulletLocs[bulletIndex].x += cos(bulletAngles[bulletIndex]) * 35;
            bulletLocs[bulletIndex].y += sin(bulletAngles[bulletIndex]) * 35; 
            bulletActive[bulletIndex] = true;          
        }        
}

function playerBulletMovement(){
    
    //every active bullet moves accorting to the angle it's been shot at
    for(var i = 0; i < maxBullets; i++)
        {
            if(bulletActive[i])
                {
                    bulletLocs[i].x += cos(bulletAngles[i]) * bulletSpeed;
                    bulletLocs[i].y += sin(bulletAngles[i]) * bulletSpeed;
                    
                    //if the bullet is out of the canvas, disable it
                    if(bulletLocs[i].x < -5 || bulletLocs[i].x > width+5 || bulletLocs[i].y < -5 || bulletLocs[i].y > height+5)
                        bulletActive[i] = false;
                }      
        }
}

//moving the player, same speed on x, y, diagonals
function playerMovement()
{
    if(keyIsDown(87) && keyIsDown(65))
        {
            playerLoc.y -= diagonalSpeed;
            playerLoc.x -= diagonalSpeed;
        }
    else if(keyIsDown(87) && keyIsDown(68))
        {
            playerLoc.y -= diagonalSpeed;
            playerLoc.x += diagonalSpeed;
        }
    else if(keyIsDown(83) && keyIsDown(65))
        {
            playerLoc.y += diagonalSpeed;
            playerLoc.x -= diagonalSpeed;
        }
    else if(keyIsDown(83) && keyIsDown(68))
        {
            playerLoc.y += diagonalSpeed;
            playerLoc.x += diagonalSpeed;
        }
    else if(keyIsDown(87))
        playerLoc.y-=playerSpeed;
    else if(keyIsDown(83))
        playerLoc.y+=playerSpeed;
    else if(keyIsDown(65))
        playerLoc.x-=playerSpeed;
    else if(keyIsDown(68))
        playerLoc.x+=playerSpeed;
    
    //keep the player in boundaries
    if(playerLoc.x < 0 + playerSize/2)
        playerLoc.x = 0 + playerSize/2;
    if(playerLoc.x > width - playerSize/2)
        playerLoc.x = width - playerSize/2;
    if(playerLoc.y < 0 + playerSize/2)
        playerLoc.y = 0 + playerSize/2;
    if(playerLoc.y > height - playerSize/2 )
        playerLoc.y = height - playerSize/2;
}

//move the gun with the player, make it point at the cursor
function playerGunMovement()
{
    push();
    fill('#262626');
    translate(playerLoc.x, playerLoc.y);
    var angle = atan2(mouseY - playerLoc.y, mouseX - playerLoc.x);
    rotate(angle);  
    rect(5, -2.5, 30, 5);
    pop();
}

//reloading (decreasing cooldown)
function reloading(){
    if(cooldown > 0)
        cooldown -= 0.016;
}

function randomizeSpawnPoint(){
    
    //choose a random edge of the screen
    var spawnPoint = Math.round(Math.random()*4);
            
            if(spawnPoint == 0)
                spawnLoc.set(Math.random()*width, 0);
            else if(spawnPoint == 1)
                spawnLoc.set(Math.random()*width, height);
            else if(spawnPoint == 2)
                spawnLoc.set(0, Math.random()*height);
            else
                spawnLoc.set(width, Math.random()*height);
}

//shooting on LMB
function mousePressed()
{
    if(mouseButton == LEFT)
        playerShoot();
}