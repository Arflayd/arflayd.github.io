//player
var playerLoc;
var playerSize = 40;
var playerSpeed = 3;
var diagonalSpeed;

//enemy
var enemyLoc;

//bullets
var bulletLocs = [];
var bulletAngles = []
var bulletSpeed = 8;
var maxBullets = 5;
var bulletIndex = 0;
var bulletActive = [];
var cooldown = 0;

function setup(){
    
    createCanvas(1000,600);
    
    //player setup
    playerLoc = createVector(width/2, height/2);
    diagonalSpeed = sin(QUARTER_PI)*playerSpeed;
    
    //enemy setup
    enemyLoc = createVector(300, 200);
    
    //bullet setup
    for(var i = 0; i < maxBullets; i++)
        {
            bulletLocs[i] = createVector(0,0);
            bulletAngles[i] = 0;
            bulletActive[i] = false;
        }
    
        
    strokeWeight(3);
}

function draw(){
    
    clear();
    background('#497432');
    
    playerMovement();
    
    playerGunMovement();
    
    playerBulletMovement();
      
    reloading();
    
    //drawing
    fill('#d69f46');
    ellipse(playerLoc.x,playerLoc.y,playerSize,playerSize);
    
    fill('#1c1c1c');
    for(var i = 0; i < maxBullets; i++)
        {
            ellipse(bulletLocs[i].x,bulletLocs[i].y,5,5);
        } 
    
}

function playerShoot()
{
    //not reloading
    if(cooldown <= 0)
        {   
            //use next bullet
            bulletIndex++;
            //if it's the last bullet, reload
            if(bulletIndex == maxBullets)
                {
                    bulletIndex = 0;
                    cooldown = 1;
                    document.getElementById("bullets").innerHTML = "reloading";
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

//reloading, displaying bullets left
function reloading(){
    if(cooldown > 0)
        cooldown -= 0.016;
    else
        document.getElementById("bullets").innerHTML = "Bullets: "+Math.abs(bulletIndex-5);
}

//shooting on LMB
function mousePressed()
{
    if(mouseButton == LEFT)
        playerShoot();
}