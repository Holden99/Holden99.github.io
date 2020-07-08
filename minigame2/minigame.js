let College_2 = new Phaser.Class({
 
    Extends: Phaser.GameObjects.Container,

    initialize:

    function College_2(scene)
    {
        this.scene = scene;
        Phaser.GameObjects.Container.call(this, this.scene, 0, 0);
		this.emitter = new Phaser.Events.EventEmitter();
    },

addImage({x, y, name, parentCont, type}) {
	let image = new Phaser.GameObjects.Image(this.scene, x, y, this.atlas_key, name);
	image.imageType = type;
	image.setScale(this.scalablePoint);
	parentCont.add(image);
},

addField({x, y, circleName, withCircleActive = true}) {
	let fieldCirc = new Phaser.GameObjects.Container(this.scene, x, y);
	let circleCirc = new Phaser.GameObjects.Image(this.scene, 0, 0, this.atlas_key, `${circleName}.png`);
	circleCirc.setScale(this.scalablePoint);
	fieldCirc.add(circleCirc);
	let circleCircActive = new Phaser.GameObjects.Image(this.scene, 0, 0, this.atlas_key, `${circleName}_2.png`);
	circleCircActive.alpha = 0;
	circleCircActive.setScale(this.scalablePoint);
	fieldCirc.add(circleCircActive);
	circleCirc.setInteractive({pixelPerfect: true});
	circleCirc.on('pointerover', function() {
		circleCircActive.alpha = 1;
	}, this);
	circleCirc.on('pointerout', function() {
		circleCircActive.alpha = 0;
	}, this);
	this.add(fieldCirc);
	
	return { field: fieldCirc, circle: circleCirc };
},

changePointsAngle(field) {
	field.each(p => {
		if (typeof p.actualAngle === "number") {
			p.actualAngle += 45;
			if (p.actualAngle > 315) p.actualAngle = 0;
			p.metka = `${p.actualAngle}_${p.fieldType}`;
			
		}
	})
},

moveField(field) {
	if(!field.moving) {
		field.moving = true;
		this.scene.tweens.add({
			targets: [field],
			ease: "Linear",
			duration: 300,
			repeat: 0,
			angle: '+=45',
			onComplete: () => {
				field.moving = false;
				this.changePointsAngle(field);
			}
		});
	}
	
	
},

configField(field) {
	let fieldZone = field.list[0];
	fieldZone.setInteractive();
	field.moving = false;
	fieldZone.on('pointerdown', function() {

		this.moveField(field);
	}, this);
	
},

getFieldPoints(type) {
	let arr = [];
	this.playCircles.forEach(p => {
		p.fieldType === type ? arr.push(p) : null;
	});
	
	return arr;
},

init(params) {
	this.moving_holder = new Phaser.GameObjects.Container(this.scene, 0, 0);
	this.add(this.moving_holder);
	this.atlas_key = params['atlas_key'];
	this.width = params['w'];
	this.height = params['h'];
	this.items = [];
	this.center = new Phaser.Geom.Point(this.width / 2, this.height / 2);
	this.scalablePoint = 0.7;
	let items_atlas = this.scene.textures.get(this.atlas_key);
	this.x = this.center.x;
	this.y = this.center.y;

	this.radius = [47, 80, 112];
	this.pointsCoord = [];
	this.points = new Map();
	this.points.set('greenPoints', [8, 'b2']);
	this.points.set('redPoints', [8, 'b1']);
	this.points.set('bluePoints', [8, 'b3']);

	let points = [];
	this.points.forEach(p => {
		for (let i = 0; i < p[0]; i++) {
			points.push(p[1]);
		}
	});
	
	points = Phaser.Utils.Array.Shuffle(points);
	let pointsRed = points.splice(0, 8);
	let pointsGreen = points.splice(0, 8);
	let pointsBlue = points.splice(0, 8);

	points = [
		pointsRed,
		pointsGreen,
		pointsBlue
	]

	this.angles = [0, 45, 90, 135, 180, 225, 270, 315];
	this.addImage({ x : 40, y: -5, name: 'bg2.png', parentCont: this, type: 'safeLocked' });
	this.addImage({ x : -135, y: 20, name: 'coins.png', parentCont: this, type:'folder' });
	this.addImage({ x : 0, y: 0, name: 'bg1.png', parentCont: this, type:'safe' });

	let {field: blueField, circle: blueCircle} = { ...this.addField({ x: 62, y: 0, circleName: 'cir1' })};
	
	this.blueField = blueField;
	this.blueField.fieldType = 'b3';
	this.blueCircle = blueCircle;
	this.configField(this.blueField);

	let {field: greenField, circle: greenCircle} = { ...this.addField({ x: 62, y: 0, circleName: 'cir2' }) };
	this.greenField = greenField;
	this.greenField.fieldType = 'b2';
	this.greenCircle = greenCircle;
	this.configField(this.greenField);

	let {field: redField, circle: redCircle} = { ...this.addField({ x: 62, y: 0, circleName: 'cir3' }) };
	this.redField = redField;
	this.redField.fieldType = 'b1';
	this.redCircle = redCircle;
	this.configField(this.redField);

	this.fieldCirc = new Phaser.GameObjects.Container(this.scene, 0, 0);
	let circleCirc = new Phaser.GameObjects.Image(this.scene, 0, 0, this.atlas_key, `cir4.png`);
	circleCirc.setScale(this.scalablePoint);
	this.fieldCirc.add(circleCirc);
	this.redField.add(this.fieldCirc);

	this.playCircles = [];
	this.playPoints = [];

	this.initPoint({x : 0, y: 0, name : 'b0', isFieldPoint : true, fieldType: 'staticPoint', fieldCont: this.fieldCirc});

let id = 0;

for (let r = 0; r < this.radius.length; r++) {
	let angles = [...this.angles];
	let pointsLoop = [...points[r]];
	for (let i = 0; i < this.angles.length; i++) {
		let angle = Phaser.Utils.Array.RemoveRandomElement(angles);
		let fieldType;
		switch (r) {
			case 0:
				fieldType = 'b1';
				fieldCont = this.redField;
				break;
			case 1:
				fieldType = 'b2';
				fieldCont = this.greenField;
				break;
			case 2:
				fieldType = 'b3';
				fieldCont = this.blueField;
				break;
		}
		this.initPoint({
			x : this.radius[r] * Math.cos(this.convertFromRadToAngle(angle)),
			y: this.radius[r] * Math.sin(this.convertFromRadToAngle(angle)),
			name : 'b0',
			isFieldPoint : true,
			fieldType: fieldType,
			fieldCont: fieldCont,
			angle: angle
		});
		this.initPoint({
			x : this.radius[r] * Math.cos(this.convertFromRadToAngle(angle)),
			y: this.radius[r] * Math.sin(this.convertFromRadToAngle(angle)),
			name : `${Phaser.Utils.Array.RemoveRandomElement(pointsLoop)}`,
			isFieldPoint : false,
			fieldType: fieldType,
			fieldCont: fieldCont,
			angle: angle
		});
		id++;
	}
}

	this.hitCont = new Phaser.GameObjects.Container(this.scene, 0, 0);
  	this.add(this.hitCont);
  	let rect = new Phaser.Geom.Rectangle(-this.list[1].width * this.scalablePoint/2, -this.list[1].height * this.scalablePoint/2, this.list[1].width * this.scalablePoint, this.list[1].height * this.scalablePoint);

	this.hitCont.setInteractive({
		hitArea: rect,
		hitAreaCallback: Phaser.Geom.Rectangle.Contains
		});

    this.hitCont.on('pointerdown', function() {
		this.removeTutorial();
    }, this);
},

convertFromRadToAngle(deg) {
	return deg * Math.PI/180;
},

initTutorialPoint({x, y, name, isFieldPoint = false, parentCont}) {
	let pt = this.toGlobal(this, new Phaser.Geom.Point(x, y));
	pt = this.toLocal(this.tutorial, new Phaser.Geom.Point(pt.x, pt.y));
	let pointCont = new Phaser.GameObjects.Container(this.scene, pt.x, pt.y);
	let point = new Phaser.GameObjects.Image(this.scene,0, 0, this.atlas_key, `${name}.png`);
	point.setScale(this.scalablePoint - 0.3);
	pointCont.add(point);
	if (!isFieldPoint) {
		let pointActive = new Phaser.GameObjects.Image(this.scene,0, 0, this.atlas_key, `${name}_2.png`);
		pointActive.alpha = 0;
		pointActive.setScale(this.scalablePoint - 0.3);
		pointCont.add(pointActive);
		this.tutorialPoints.push(pointCont);
	}
	
	parentCont.add(pointCont);
	point.setInteractive();
	
},

initPoint({x, y, name, isFieldPoint = false, fieldType, fieldCont = this, angle}) {
	// console.log(angle)
	let pt = this.toGlobal(this, new Phaser.Geom.Point(x, y));
	pt = this.toLocal(fieldCont, new Phaser.Geom.Point(pt.x, pt.y));
	let pointCont = new Phaser.GameObjects.Container(this.scene, pt.x + 62, pt.y);
	pointCont.gameAngle = angle;
	pointCont.fieldType = fieldType;
	if (!isFieldPoint) {
		pointCont.movableItem = true;
		pointCont.pointType = name;
		let pointBack = new Phaser.GameObjects.Image(this.scene,0, 0, this.atlas_key, 'b4.png');
		pointCont.fieldType = name;
		pointCont.add(pointBack);
	}
	// console.log(fieldCont);
	let point = new Phaser.GameObjects.Image(this.scene,0, 0, this.atlas_key, `${name}.png`);
	pointCont.add(point);
	if (!isFieldPoint) {
		pointCont.point = true;
		let pointActive = new Phaser.GameObjects.Image(this.scene,0, 0, this.atlas_key, `${name}_2.png`);
		pointActive.alpha = 0;
		pointCont.add(pointActive);
		pointCont.inCenter = false;
		this.configPoint(point);
	} else {
		pointCont.point = false;
	}
	pointCont.hasPoint = true;
	pointCont.metka = `${angle}_${fieldType}`;
		pointCont.actualAngle = angle;
		pointCont.fieldType = fieldType;
		if (x == 0 && y == 0) {
			pointCont.hasPoint = false;
			pointCont.metka = `0_45_90_135_180_225_270_315_b1`;
			pointCont.actualAngle = '0_45_90_135_180_225_270_315';
			pointCont.fieldType = 'b1';
			pointCont.centerMetka = true;
		}
	pointCont.setScale(this.scalablePoint);
	!isFieldPoint ?
	this.playCircles.push(pointCont) : this.playPoints.push(pointCont);
	fieldCont.add(pointCont);
	fieldCont.bringToTop(pointCont);
},

moveActivePoint(point, x, y, callback = function() {}) {
	this.scene.tweens.add({
		targets: [point],
          ease: "Linear",
          duration: 250,
		  repeat: 0,
		  x: x,
		  y: y,
          onComplete: () => {
			callback();
			this.check_win();
          }
	});
},

configPoint(item) {
	item.setInteractive();
	item.parentContainer.noMoves = 0;
	item.on('pointerover', function() {
		item.parentContainer.list[2].alpha = 1;
	}, this);

	item.on('pointerout', function() {
		item.parentContainer.list[2].alpha = 0;
	}, this);

	item.on('pointerdown', function() {
		let possibleVars = [];
		let targetPoint = this.playPoints.find(p => !p.hasPoint);
		if (typeof targetPoint.actualAngle === 'string' && item.parentContainer.fieldType === targetPoint.fieldType) {
			console.log('red -> center');
			this.playPoints.forEach(p => {
				if (!p.hasPoint) p.hasPoint = true;
				if (item.parentContainer.x === p.x && item.parentContainer.y === p.y) {
					p.hasPoint = false;
				}

			});
			let pt = this.toGlobal(targetPoint.parentContainer, new Phaser.Geom.Point(targetPoint.x, targetPoint.y));
			pt = this.toLocal(this.redField, new Phaser.Geom.Point(pt.x, pt.y));
			this.moveActivePoint(item.parentContainer, pt.x, pt.y);
			item.parentContainer.inCenter = true;
			

		}
		// center -> red
		else if (typeof targetPoint.actualAngle === 'number' && item.parentContainer.fieldType === targetPoint.fieldType && item.parentContainer.inCenter) {
			let pt = this.toGlobal(targetPoint.parentContainer, new Phaser.Geom.Point(targetPoint.x, targetPoint.y));
			pt = this.toLocal(this.redField, new Phaser.Geom.Point(pt.x, pt.y));
			this.moveActivePoint(item.parentContainer, pt.x, pt.y);
			item.parentContainer.inCenter = false;
			this.redField.bringToTop(item.parentContainer);
			this.playPoints.forEach(p => {
				if (!p.hasPoint) p.hasPoint = true;
				if (typeof p.metka === 'string')
					p.hasPoint = false;
			});
		}
		// green -> red
		else if (typeof targetPoint.actualAngle === 'number' && item.parentContainer.fieldType === 'b2' && targetPoint.fieldType === 'b1' && item.parentContainer.actualAngle === targetPoint.actualAngle) {
			this.greenField.remove(item.parentContainer);
			this.redField.add(item.parentContainer);
			let pt = this.toGlobal(this.greenField, new Phaser.Geom.Point(item.parentContainer.x, item.parentContainer.y));
			pt = this.toLocal(this.redField, new Phaser.Geom.Point(pt.x, pt.y));
			item.parentContainer.x = this.radius[1] * Math.cos(this.convertFromRadToAngle(targetPoint.gameAngle));
			item.parentContainer.y = this.radius[1] * Math.sin(this.convertFromRadToAngle(targetPoint.gameAngle));
			
			this.moveActivePoint(item.parentContainer, targetPoint.x, targetPoint.y);
			this.playPoints.forEach(p => {
				if (!p.hasPoint) p.hasPoint = true;
				if (p.metka === item.parentContainer.metka)
					p.hasPoint = false;
			});
			item.parentContainer.metka = `${item.parentContainer.actualAngle}_b1`;
			item.parentContainer.fieldType = 'b1';
		}
		// red -> green
		else if (!item.parentContainer.inCenter && typeof targetPoint.actualAngle === 'number' && item.parentContainer.fieldType === 'b1' && targetPoint.fieldType === 'b2' && item.parentContainer.actualAngle === targetPoint.actualAngle) {
			let x1 = this.radius[1] * Math.cos(this.convertFromRadToAngle(targetPoint.actualAngle));
			let y1 =  this.radius[1] * Math.sin(this.convertFromRadToAngle(targetPoint.actualAngle));
			let x2 = this.radius[0] * Math.cos(this.convertFromRadToAngle(targetPoint.actualAngle));
			let y2 =  this.radius[0] * Math.sin(this.convertFromRadToAngle(targetPoint.actualAngle));
			let pt = this.toGlobal(this, new Phaser.Geom.Point(x1, y1));
			pt = this.toLocal(this.redField, new Phaser.Geom.Point(pt.x, pt.y));
			let pt1 = this.toGlobal(this, new Phaser.Geom.Point(x2, y2));
			pt1 = this.toLocal(this.redField, new Phaser.Geom.Point(pt1.x, pt1.y));

			this.redField.remove(item.parentContainer);
			this.moving_holder.add(item.parentContainer);
			item.parentContainer.x = 0;
			item.parentContainer.y = 0;
			this.moving_holder.x = x2 + 62;
			this.moving_holder.y = y2;
			this.bringToTop(this.moving_holder);
			this.moveActivePoint(this.moving_holder, x1 + 62, y1, () => {
				this.moving_holder.removeAll();
				this.greenField.add(item.parentContainer);
				item.parentContainer.x = targetPoint.x;
				item.parentContainer.y = targetPoint.y;
			});

			
			this.playPoints.forEach(p => {
				if (!p.hasPoint) p.hasPoint = true;
				if (p.metka === item.parentContainer.metka)
					p.hasPoint = false;
			});

			item.parentContainer.metka = `${item.parentContainer.actualAngle}_b2`;
			item.parentContainer.fieldType = 'b2';
			
		}
		// blue -> green
		else if (typeof targetPoint.actualAngle === 'number' && item.parentContainer.fieldType === 'b3' && targetPoint.fieldType === 'b2' && item.parentContainer.actualAngle === targetPoint.actualAngle) {
			this.blueField.remove(item.parentContainer);
			this.greenField.add(item.parentContainer);
			let pt = this.toGlobal(this.blueField, new Phaser.Geom.Point(item.parentContainer.x, item.parentContainer.y));
			pt = this.toLocal(this.greenField, new Phaser.Geom.Point(pt.x, pt.y));
			item.parentContainer.x = this.radius[2] * Math.cos(this.convertFromRadToAngle(targetPoint.gameAngle));
			item.parentContainer.y = this.radius[2] * Math.sin(this.convertFromRadToAngle(targetPoint.gameAngle));
			this.moveActivePoint(item.parentContainer, targetPoint.x, targetPoint.y);
			this.playPoints.forEach(p => {
				if (!p.hasPoint) p.hasPoint = true;
				if (p.metka === item.parentContainer.metka)
					p.hasPoint = false;
			});
			item.parentContainer.metka = `${item.parentContainer.actualAngle}_b2`;
			item.parentContainer.fieldType = 'b2';
		}
		// green -> blue
		else if (!item.parentContainer.inCenter && typeof targetPoint.actualAngle === 'number' && item.parentContainer.fieldType === 'b2' && targetPoint.fieldType === 'b3' && item.parentContainer.actualAngle === targetPoint.actualAngle) {

			let x1 = this.radius[2] * Math.cos(this.convertFromRadToAngle(targetPoint.actualAngle));
			let y1 =  this.radius[2] * Math.sin(this.convertFromRadToAngle(targetPoint.actualAngle));
			let x2 = this.radius[1] * Math.cos(this.convertFromRadToAngle(targetPoint.actualAngle));
			let y2 =  this.radius[1] * Math.sin(this.convertFromRadToAngle(targetPoint.actualAngle));
			let pt = this.toGlobal(this, new Phaser.Geom.Point(x1, y1));
			pt = this.toLocal(this.greenField, new Phaser.Geom.Point(pt.x, pt.y));
			let pt1 = this.toGlobal(this, new Phaser.Geom.Point(x2, y2));
			pt1 = this.toLocal(this.greenField, new Phaser.Geom.Point(pt1.x, pt1.y));

			this.greenField.remove(item.parentContainer);
			this.moving_holder.add(item.parentContainer);
			item.parentContainer.x = 0;
			item.parentContainer.y = 0;
			this.moving_holder.x = x2 + 62;
			this.moving_holder.y = y2;
			this.bringToTop(this.moving_holder);
			this.moveActivePoint(this.moving_holder, x1 + 62, y1, () => {
				this.moving_holder.removeAll();
				this.blueField.add(item.parentContainer);
				item.parentContainer.x = targetPoint.x;
				item.parentContainer.y = targetPoint.y;
			});

			
			this.playPoints.forEach(p => {
				if (!p.hasPoint) p.hasPoint = true;
				if (p.metka === item.parentContainer.metka)
					p.hasPoint = false;
			});

			item.parentContainer.metka = `${item.parentContainer.actualAngle}_b3`;
			item.parentContainer.fieldType = 'b3';
			
		}
		else {
			this.noMovesAnim(item.parentContainer);
		}

	}, this);
},

noMovesAnim(item) {
	item.noMoves++;
	if (item.noMoves === 1) {
		this.scene.tweens.add({
			targets: [item],
			ease: "Linear",
			duration: 100,
			repeat: 0,
			y: '+=3',
			yoyo: true,
			onComplete: () => {
				this.scene.tweens.add({
					targets: [item],
					ease: "Linear",
					duration: 100,
					repeat: 0,
					y: '-=3',
					yoyo: true,
					onComplete: () => {
						item.noMoves = 0;
					}
				});
			}
		});
	}
},

moveItem(item, x, y, callback = function(){}) {
	let _this = this;
	this.scene.tweens.add({
		targets: [item],
          ease: "Linear",
          duration: 200,
		  repeat: 0,
		  x: x,
		  y: y,
          onComplete: () => {
			  setTimeout(function(){
				callback();
				_this.check_win();
			  }, 50);
            
          }
	});
},

targetRightAnim(item) {
	this.scene.tweens.add({
		targets: [item.list[2]],
          ease: "Linear",
          duration: 300,
		  repeat: 0,
		  alpha: {from: 1, to: 0},
          onComplete: () => {
            
          }
	});
},

finalAnimation() {
	this.each(el => {
		if (el.imageType !== 'safeLocked' && el.imageType !== 'folder') {
			this.scene.tweens.add({
				targets: [el],
		  ease: "Linear",
		  duration: 600,
		  repeat: 0,
		  y: '+=800',
		  onComplete: () => {
			  el.alpha = 0;
			  el.destroy();
		  }
			});
		}
	})
	
},

check_win(forced = false) {
	let _this = this;
	
	if (forced) {
		this.finalAnimation();
		setTimeout(() => {
			_this.emitter.emit('EVENT', {'event': 'LEVEL_COMPLETE'});
		}, 500);
	} else {
		let count = 0;
		this.redField.each(p => {
			if (p.movableItem && p.pointType == this.redField.fieldType && !p.inCenter) {
				count++;
			}
		});
		this.greenField.each(p => {
			if (p.movableItem && p.pointType == this.greenField.fieldType && !p.inCenter) {
				count++;
			}
		});
		this.blueField.each(p => {
			if (p.movableItem && p.pointType == this.blueField.fieldType && !p.inCenter) {
				count++;
			}
		});
		if (count === 24) {
			this.finalAnimation();
			setTimeout(() => {
				_this.emitter.emit('EVENT', {'event': 'LEVEL_COMPLETE'});
			}, 500);
		}
	}
	
},
		
start_game() {
	// this.check_win(true);
	this.tutorialShow = true;
	this.showTutorial();
},

checkPlayingAnim(anim) {
	if (anim) {
		anim.stop();
		anim.remove();
	  }
},
removeTutorial() {
	if (this.tutorialShow) {
		this.checkPlayingAnim(this.tutorialFirstAnim);
		this.checkPlayingAnim(this.tutorialSecondAnim);
		this.checkPlayingAnim(this.tutorialThirdAnim);
		this.checkPlayingAnim(this.tutorialFourthAnim);
		this.checkPlayingAnim(this.tutorialFifthAnim);
		this.checkPlayingAnim(this.tutorialSixAnim);
		this.checkPlayingAnim(this.tutorialSevenAnim);
		this.checkPlayingAnim(this.tutorialEightAnim);
		this.checkPlayingAnim(this.tutorialNineAnim);
		this.checkPlayingAnim(this.tutorialTenAnim);
		this.checkPlayingAnim(this.tutorialElevenAnim);
		this.checkPlayingAnim(this.tutorialTwelveAnim);
		this.checkPlayingAnim(this.tutorialThirteenAnim);
		this.checkPlayingAnim(this.tutorialFourteenAnim);
		this.checkPlayingAnim(this.tutorialFifteenAnim);
		this.checkPlayingAnim(this.tutorialSixteenAnim);
		this.checkPlayingAnim(this.tutorialSeventeenAnim);
		
		  if (this.tutorialEighteenAnim) {
			this.tutorialEighteenAnim.forEach(a => {
				a.stop();
				a.remove();
			})
			
		  }
		  if (this.hitCont)
		  	this.hitCont.destroy();
		this.tutorial.each(el => {
			el.destroy();
		})
		this.tutorialShow = false;
	}
},

showTutorial() {
	if (this.tutorialShow) {
		let _this = this;
		this.tutorialPoints = [];
		this.tutorial = new Phaser.GameObjects.Container(this.scene, 0, 0);
	
		let tutorialWind = new Phaser.GameObjects.Image(this.scene, 0, 0, this.atlas_key, 'tutor_wind1.png');
		tutorialWind.setScale(this.scalablePoint - 0.1);
		this.tutorial.add(tutorialWind);

		let greenField = new Phaser.GameObjects.Container(this.scene, 37, -3);
		let green = new Phaser.GameObjects.Image(this.scene, 0, 0, this.atlas_key, 'cir2.png');
		greenField.add(green);
		green.setScale(this.scalablePoint - 0.3);
		this.tutorial.add(greenField);

		let redField = new Phaser.GameObjects.Container(this.scene, 37, -3);
		let red = new Phaser.GameObjects.Image(this.scene, 0, 0, this.atlas_key, 'cir3.png');
		redField.add(red);
		red.setScale(this.scalablePoint - 0.3);
		this.tutorial.add(redField);

		let circ = new Phaser.GameObjects.Image(this.scene, 0, 0, this.atlas_key, 'cir4.png');
		redField.add(circ);
		circ.setScale(this.scalablePoint - 0.3);

	
		this.closeTutorial = new Phaser.GameObjects.Container(this.scene, 145, -100);
		let close = new Phaser.GameObjects.Image(this.scene, 0, 0, this.atlas_key, 'but_mini1.png');
		close.setInteractive();
		this.closeTutorial.add(close);
	
		let X = new Phaser.GameObjects.Image(this.scene, 0, 0, this.atlas_key, 'button_x.png');
		X.setScale(0.8);
		X.setInteractive();
		this.closeTutorial.add(X);
		this.tutorial.add(this.closeTutorial);
		this.add(this.tutorial);
	
		this.closeTutorial.each(el => {
		  el.on('pointerdown', function() {
			this.clickedCloseTutorial = new Phaser.GameObjects.Image(this.scene, 0, 0, this.atlas_key, 'but_mini3.png');
		  this.clickedX = new Phaser.GameObjects.Image(this.scene, 0, 0, this.atlas_key, 'button_x_dark.png');
		  this.clickedX.setScale(0.8);
		  _this.closeTutorial.each(el => {
			el.alpha = 0.1;
		  });
		  _this.closeTutorial.add(this.clickedCloseTutorial);
		  _this.closeTutorial.add(this.clickedX);
		  
		  this.clickedCloseTutorial.setScale(0.9);
		  this.clickedX.setScale(0.7);
			
		  }, this);
	
		  el.on('pointerup', function() {
	
			_this.closeTutorial.remove(_this.clickedCloseTutorial);
			_this.closeTutorial.remove(_this.clickedX);
			  _this.closeTutorial.each(el => {
				el.alpha = 1;
			  });
			  _this.tutorial.removeAll();
			  _this.remove(_this.tutorial);
			  _this.removeTutorial();
			}, this);
		  el.on('pointerover', function() {
	
			this.activeCloseTutorial = new Phaser.GameObjects.Image(this.scene, 0, 0, this.atlas_key, 'but_mini2.png');
			this.activeX = new Phaser.GameObjects.Image(this.scene, 0, 0, this.atlas_key, 'button_x_light.png');
			this.activeX.setScale(0.8);
			this.closeTutorial.add(this.activeCloseTutorial);
			this.closeTutorial.add(this.activeX);
			}, this);
		  el.on('pointerout', function() {
			_this.closeTutorial.exists(_this.clickedCloseTutorial)
			  _this.closeTutorial.remove(_this.clickedCloseTutorial);
			_this.closeTutorial.exists(_this.clickedX)
			  _this.closeTutorial.remove(_this.clickedX);
			  _this.closeTutorial.each(el => {
				el.alpha = 1;
			  });
			_this.closeTutorial.remove(_this.activeCloseTutorial);
			_this.closeTutorial.remove(_this.activeX);
		  }, this);
		});
	
		// this.tutorialRedField = new Phaser.GameObjects.Container(this.scene, 0, 0);
		// this.tutorial.add(this.tutorialRedField);
		// this.tutorialGreenField = new Phaser.GameObjects.Container(this.scene, 0, 0);
		// this.tutorial.add(this.tutorialGreenField);
		let tutorialFields = [redField, greenField];
		let points = [[], []];
		for (let i = 0; i < 2; i++)
			for (let j = 0; j < 7; j++) {
				points[i].push(`b${i+1}`);
			}
			points[0].push('b2');
			points[1].push('b1');
		this.initTutorialPoint({
			x : 0,
			y: 0,
			name : 'b0',
			isFieldPoint: true,
			parentCont: redField
		});
		let radius = [28, 46];
		for (let r = 0; r < 2; r++) {
			let angles = [0, 45, 90, 135, 180, 225, 270, 315];
			let pointsLoop = [...points[r]];
			for (let i = 0; i < angles.length; i++) {
				let angle = angles[i];
				this.initTutorialPoint({
					x : radius[r] * Math.cos(this.convertFromRadToAngle(angle)),
					y: radius[r] * Math.sin(this.convertFromRadToAngle(angle)),
					name : 'b0',
					isFieldPoint: true,
					parentCont: tutorialFields[r]
				});
				this.initTutorialPoint({
					x : radius[r] * Math.cos(this.convertFromRadToAngle(angle)),
					y: radius[r] * Math.sin(this.convertFromRadToAngle(angle)),
					name : `${pointsLoop[i]}`,
					isFieldPoint: false,
					parentCont: tutorialFields[r]
				});
			}
		}
	
	this.tutorialHand = new Phaser.GameObjects.Image(this.scene, 53, 50, this.atlas_key, 'tut2_7.png');
	this.tutorialHand.alpha = 0;
	this.tutorial.add(this.tutorialHand);
	this.tutorialHand.setScale(this.scalablePoint - 0.4);

	this.tutorialFirstAnim = this.scene.tweens.add({
		targets: [this.tutorialHand],
		ease: "Linear",
		  duration: 250,
		  repeat: 0,
		  alpha: {from: 0, to: 1},
		  onComplete: () => {
			this.tutorialSecondAnim = this.scene.tweens.add({
				targets: [this.tutorialPoints[0].list[1]],
				ease: "Linear",
				  duration: 200,
				  repeat: 0,
				  alpha: {from: 0, to: 1},
				  yoyo: true,
				  onComplete: () => {
					this.tutorialThirdAnim = this.scene.tweens.add({
						targets: [this.tutorialPoints[0]],
						ease: "Linear",
						  duration: 200,
						  repeat: 0,
							x: '-=28',	
						  onComplete: () => {
							this.tutorialFourthAnim = this.scene.tweens.add({
								targets: [this.tutorialHand],
								ease: "Linear",
								  duration: 200,
								  repeat: 0,
									x: '+=17',
									y: '+=10',	
								  onComplete: () => {
									this.tutorialFifthAnim = this.scene.tweens.add({
										targets: [greenField],
										ease: "Linear",
										  duration: 200,
										  repeat: 0,
											angle: '+=45',	
										  onComplete: () => {
											this.tutorialSixAnim = this.scene.tweens.add({
												targets: [this.tutorialHand],
												ease: "Linear",
												  duration: 200,
												  repeat: 0,
													y: '-=10',	
												  onComplete: () => {
													this.tutorialSevenAnim = this.scene.tweens.add({
														targets: [greenField.list[16].list[1]],
														ease: "Linear",
														duration: 200,
														repeat: 0,
														alpha: {from: 0, to: 1},
														yoyo: true,	
														  onComplete: () => {
															  let point = greenField.list[16];
															  greenField.remove(point);
															  redField.add(point);
															  point.y +=32;
															  point.x +=14;
															  this.tutorialEightAnim = this.scene.tweens.add({
																targets: [point],
																ease: "Linear",
																duration: 200,
																repeat: 0,
																x: '-=18',
																  onComplete: () => {
																	this.tutorialNineAnim = this.scene.tweens.add({
																		targets: [this.tutorialHand],
																		ease: "Linear",
																		  duration: 200,
																		  repeat: 0,
																			y: '+=10',
																			x: '-=24',
																		  onComplete: () => {
																			this.tutorialTenAnim = this.scene.tweens.add({
																				targets: [redField],
																				ease: "Linear",
																				duration: 200,
																				repeat: 0,
																				angle: '+=45',	
																				  onComplete: () => {
																					this.tutorialElevenAnim = this.scene.tweens.add({
																						targets: [this.tutorialHand],
																						ease: "Linear",
																						duration: 200,
																						repeat: 0,
																						y: '-=10',
																						x: '+=5',
																						  onComplete: () => {
																							this.tutorialTwelveAnim = this.scene.tweens.add({
																								targets: [redField.list[18].list[1]],
																								ease: "Linear",
																								duration: 200,
																								repeat: 0,
																								alpha: {from: 0, to: 1},
																								yoyo: true,
																								  onComplete: () => {
																									
																									this.tutorialThirteenAnim = this.scene.tweens.add({
																										targets: [redField.list[18]],
																										ease: "Linear",
																										duration: 200,
																										repeat: 0,
																										x: '+=14',
																										y: '-=14',
																										  onComplete: () => {
																											this.tutorialFifteenAnim = this.scene.tweens.add({
																												targets: [this.tutorialHand],
																												ease: "Linear",
																												duration: 200,
																												repeat: 0,
																												x: '-=28',
																												  onComplete: () => {
																													
																													this.tutorialSixteenAnim = this.scene.tweens.add({
																														targets: [this.tutorialPoints[0].list[1]],
																														ease: "Linear",
																														duration: 200,
																														repeat: 0,
																														alpha: {from: 0, to: 1},
																														yoyo: true,
																														  onComplete: () => {
																															redField.bringToTop(this.tutorialPoints[0]);
																															this.tutorialSeventeenAnim = this.scene.tweens.add({
																																
																																targets: [this.tutorialPoints[0]],
																																ease: "Linear",
																																duration: 200,
																																repeat: 0,
																																x: '+=20',
																																y: '-=20',
																																  onComplete: () => {
																																	this.tutorialEightteenAnim = [];
																																	this.tutorialPoints.forEach(el => {
																																		let anim = this.scene.tweens.add({
																																
																																			targets: [el.list[1]],
																																			ease: "Linear",
																																			duration: 200,
																																			repeat: 0,
																																			alpha: {from: 0, to: 1},
																																			yoyo:true,
																																			repeat: 2,
																																			onComplete: () => {
																																				
																																			}
																																		});
																																		this.tutorialEightteenAnim.push(anim);
																																	});
																																	
																																	setTimeout(function(){
																																		_this.tutorial.removeAll();
																																		_this.showTutorial();
																																	}, 1000);
																																  }
																															});   
																														  }
																													});   
																												  }
																											});   
																										  }
																									});   
																								  }
																							});   
																						  }
																					}); 
																				  }
																			});
																		  }
																	});
																  }
															}); 
														  }
													});
												  }
											});
										  }
									});
								  }
							});
						  }
					}); 
				  }
			});
		  }
	});
	}
},

setTutorialCircleActive(item) {
	this.tutorialSevenAnim = this.scene.tweens.add({
		targets: [item.list[1]],
		  ease: "Linear",
		  duration: 250,
		  repeat: 0,
		  alpha: {from: 0, to: 1},
		  yoyo: true,
		  onComplete: () => {
		  }
		});
},


destroy_level() {
	this.removeTutorial();
	this.removeAll(true);
},

toLocal(container, pt) {
    var containers = [];
    var parent_contaiter = container;
    var holder;
    var new_pt = new Phaser.Geom.Point(pt.x, pt.y);

    while (parent_contaiter && parent_contaiter != this.scene) {
      containers.push(parent_contaiter);
      parent_contaiter = parent_contaiter.parentContainer;
    }

    while (containers.length > 0) {
      holder = containers.pop();
      new_pt.x = (new_pt.x - holder.x) / holder.scaleX;
      new_pt.y = (new_pt.y - holder.y) / holder.scaleY;
    }

    return new_pt;
},

toGlobal(container, pt) {
    var new_pt = new Phaser.Geom.Point(pt.x, pt.y);

    var parent_contaiter = container;
    while (parent_contaiter && parent_contaiter != this.scene) {
      new_pt.x = new_pt.x * parent_contaiter.scaleX + parent_contaiter.x;
      new_pt.y = new_pt.y * parent_contaiter.scaleY + parent_contaiter.y;
      parent_contaiter = parent_contaiter.parentContainer;
    }
    return new_pt;
},

});
