let Player;

var bullets = [];

var enemies = [];
var oldEnemies = [];

var fireTime;
var fireTimeLimit;
var bulletAmount;

let enemyMaxPop;
let currentAliveEnemies;

let firstRound;
let oldEnCount;

let autoFire;

let enemiesGenerated;
let totalKills;
let totalPassed;
let generation;

let generationBest;
let generationAvg;

let timescale;

let fireFrameLimit;

let createNewGeneration;

let poolCalculated;

function setup() {
	createCanvas(500, window.innerHeight-10);
	frameRate(60);

	fireTime = 0;
	fireFrameLimit =15;
	
	bulletAmount = 5;
	currentAliveEnemies = 0;

	firstRound = true;

	generationBest =0;
	generationAvg = 0;

	enemiesGenerated = 0;
	totalKills = 0;
	totalPassed = 0;
	generation = 1;
	poolCalculated = false;
	createNewGeneration = true;
	Player = new player();

	//----------------------------------------------------//
	//Configure game parameters
	timescale = 1;
	autoFire = true;
	enemyMaxPop = 5;
	//----------------------------------------------------//
}

function draw() {
	background(0);
	fireTimeLimit = fireFrameLimit / timescale;
	text("Generation: " + generation, 5, 15);
	text("Enemies Generated: " + enemiesGenerated, 5, 30);
	text("Gen Best: "+ round(100*generationBest),5,45);
	text("Gen Avg: "+ round(100*generationAvg),5,60);
	text("Kills: " + totalKills, 5, 75);
	text("Passed: " + totalPassed, 5, 90);

	//key 79 = o
	if (keyIsDown(79)) {
		autoFire = true;
  	}

  	//key 80 = p
	if (keyIsDown(80)) {
		autoFire = false;
  	}

	//ENEMIES
	for (let i = enemies.length-1; i >= 0; i--){
		if(enemies[i].frameStart >= frameCount) continue;

		enemies[i].think();
		enemies[i].update();
		enemies[i].show();

		if(enemies[i].outOfScreenLR()) {
			enemies[i].calculateScore();
			oldEnemies.push(enemies[i]);
			enemies.splice(i, 1);
			continue;
		}

		if(enemies[i].outOfScreenB()) {
			enemies[i].calculateScore(1.0);
			oldEnemies.push(enemies[i]);
			enemies.splice(i, 1);
			totalPassed++;
		}
	}

	//PLAYER
	if(keyIsDown(37) && (Player.x-Player.w/2 > 0)) {
    	Player.left();
  	}

  	if (keyIsDown(39) && (Player.x+Player.w/2 < width)) {
  		Player.right();
  	}

  	fireTime++;
  	if(bullets.length < bulletAmount && fireTime > fireTimeLimit){
  		if(keyIsDown(32) || autoFire) {
  			Player.fire();
  			fireTime = 0;
  		}
  	}

	Player.show();

	//BULLETS
	for (let i = bullets.length-1; i >= 0; i--){
		bullets[i].update();
		bullets[i].show();
		
		if(bullets[i].outOfScreen()) {
			bullets.splice(i, 1);
			continue;
		}

		for(let j = enemies.length-1; j >= 0; j--) {
			if(bullets[i].hitted(enemies[j])) {
				bullets.splice(i, 1);

				enemies[j].calculateScore();
				oldEnemies.push(enemies[j]);
				enemies.splice(j, 1);

				totalKills++;

				break;
			}
		}
	}

	//Spawn enemy
	if(createNewGeneration) {
		//if(frameCount % 15 == 0){
		for(let i = 0; i < enemyMaxPop; i++) {
			let enem;
			if(firstRound){
				enem = new enemy();
			}else{
				enem = new enemy(poolSelection());
			}
			enem.frameStart = frameCount + ((15.0/timescale) * i);
			enemies.push(enem);

			enemiesGenerated++;
			currentAliveEnemies++;
		}

		createNewGeneration = false;

		oldEnemies = [];
		//}
	}else{
		if(enemies.length == 0) {
			//New Generation
			firstRound = false;
			
			oldEnCount = oldEnemies.length;

			generation++;

			createNewGeneration = true;
			poolCalculated = false;
		}
	}
}

function distance(x1,y1,x2,y2){
	return Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
}

function poolSelection() {
	//https://en.wikipedia.org/wiki/Selection_(genetic_algorithm)
	if(!poolCalculated){
		let sum1 = 0;

		for(let i = enemyMaxPop-1; i >= 0; i--) {
			sum1 += oldEnemies[i].score;
		}

		oldEnemies.sort(function(a, b) {
	  		return b.score -a.score;
		});

		generationAvg = sum1 / enemyMaxPop;
		generationBest = oldEnemies[0].score;

		for(let i = enemyMaxPop-1; i >= 0; i--) {
			oldEnemies[i].score /= sum1;
		}

		print(oldEnemies)

		for(let i = 0; i < enemyMaxPop-1; i++) {
			oldEnemies[i+1].score += oldEnemies[i].score;
			//console.log(oldEnemies[i].score) 
		}
		//console.log(oldEnemies[enemyMaxPop-1].score);

		poolCalculated = true;
	}

	let rand = random(1);

	for(let i = 0; i < enemyMaxPop-1; i++) {
		if(oldEnemies[i].score >= rand) return  oldEnemies[i].brain;
	}

	//never gonna return null...just in case
	return null;
}

function maxOfArray(array) {
	let maxIndex = 0;

	for(let i = 0; i < array.length; i++) {
		if(array[maxIndex] < array[i]) maxIndex = i;
	}

	return maxIndex;
}