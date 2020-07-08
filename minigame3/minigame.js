let Golf_3 = new Phaser.Class({
 
    Extends: Phaser.GameObjects.Container,

    initialize:

    function Golf_3(scene)
    {
        this.scene = scene;
        Phaser.GameObjects.Container.call(this, this.scene, 0, 0);
		this.emitter = new Phaser.Events.EventEmitter();
    },

addImage({x = 0, y = 0, name, parentCont, angle = 0}) {
	let image = new Phaser.GameObjects.Image(this.scene, x, y, this.atlas_key, `${name}.png`);
	image.setScale(this.scalablePoint);
	image.angle += angle;
	parentCont.add(image);
	return image;
},


initBg({x, y, name}) {
	let bg = new Phaser.GameObjects.Image(this.scene, x, y, this.atlas_key, `${name}.png`);
	bg.setScale(this.scalablePoint);
	this.add(bg);
	return bg;
},

initPanel({x, y, elemTypes = ['1', '2', '3', '4'], parentCont = this, arr = this.panels}) {
	let panelCont = new Phaser.GameObjects.Container(this.scene, x, y);
	parentCont.add(panelCont);

	let panel = this.addImage({name: 'panel1', parentCont: panelCont});
	let [left, top, right, bottom] = elemTypes;
	this.addImage({name: `elem${this.elemTypes.get(left)}`, parentCont: panelCont, angle: 180, x: -37});
	this.addImage({name: `elem${this.elemTypes.get(top)}`, parentCont: panelCont, angle: -90, y: -37});
	this.addImage({name: `elem${this.elemTypes.get(right)}`, parentCont: panelCont, angle: 0, x: 37});
	this.addImage({name: `elem${this.elemTypes.get(bottom)}`, parentCont: panelCont, angle: 90, y: 37});
	panel.setInteractive();
	panel.on('pointerdown', () => {
		panelCont.angle += 90;
		this.check_win();
	}, this)

	let randomAngles = [0, 90, 180, 270];
	panelCont.angle += Phaser.Utils.Array.GetRandom(randomAngles);
	arr.push(panelCont);

	top === bottom && left === right ? panelCont.oppositeSame = true : panelCont.oppositeSame = false;

	let filt1 = elemTypes.filter(e => e === left);
	filt1.length === 3 ? panelCont.threeSides = true : panelCont.threeSides = false;

	elemTypes.every(p => p === left) ? panelCont.same = true : panelCont.same = false;
},

init(params) {
	this.tutorialAnims = [];
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

	// left -> top -> right -> bot
	this.fieldArrangment = [
		[['3','5','6','1'],['6','6','5','2'],['5','3','3','3'],['3','2','4','2']],
		[['4','1','4','3'],['4','2','1','2'],['1','3','5','2'],['5','2','2','3']],
		[['4','3','6','1'],['6','2','6','2'],['6','2','1','2'],['1','3','5','6']],
		[['4','1','5','6'],['5','2','4','4'],['4','2','6','4'],['6','6','1','6']]
	];
	let arr = Phaser.Utils.Array.Shuffle(Phaser.Utils.Array.NumberArray(1,6));
	this.elemTypes = new Map();
	this.elemTypes.set('2', `${arr[0]}`);
	this.elemTypes.set('3', `${arr[1]}`);
	this.elemTypes.set('4', `${arr[2]}`);
	this.elemTypes.set('5', `${arr[3]}`);
	this.elemTypes.set('6', `${arr[4]}`);
	this.elemTypes.set('1', `${arr[5]}`);
	let panelWidth = 150 * this.scalablePoint;
	let panelHeight = 150 * this.scalablePoint;
	let finalPicture = this.addImage({x: 0, y: 0, name:'bg1', parentCont:this});
	finalPicture.final = true;
	finalPicture.alpha = 0;
	let finalPicture2 = new Phaser.GameObjects.Image(this.scene, -5, 0, this.atlas_key, `anim1.jpg`);
	finalPicture2.final = true;
	finalPicture2.alpha = 0;
	finalPicture2.setScale(this.scalablePoint);
	this.add(finalPicture2);
	
	

	this.bg = this.initBg({x: 0, y: 0, name: 'bg1'});
	this.panels = [];
	// this.initPanel({x: -panelWidth, y: -panelHeight});
	let initWidth = -panelWidth;
	let initHeight = -panelHeight;
	for (let i = 0; i < 4; i++) {
		initWidth = -panelWidth;
		for (let j = 0; j < 4; j++) {
			this.initPanel({x: initWidth - panelWidth + 50, y: initHeight - panelHeight + 50, elemTypes: this.fieldArrangment[i][j]});
			initWidth+= panelWidth;
		}
		initHeight+= panelHeight;
	}


	this.hitCont = new Phaser.GameObjects.Container(this.scene, 0, 0);
	  this.add(this.hitCont);
  	let rect2 = new Phaser.Geom.Rectangle(-this.bg.width * this.scalablePoint/2, -this.bg.height * this.scalablePoint/2, this.bg.width * this.scalablePoint, this.bg.height * this.scalablePoint);

	this.hitCont.setInteractive({
		hitArea: rect2,
		hitAreaCallback: Phaser.Geom.Rectangle.Contains
		});

    this.hitCont.on('pointerdown', function() {
		this.removeTutorial();
	}, this);
	
	this.setScale(0.7);
},

finalAnimation(callback = () => {}) {
	let _this = this;
	this.panels.forEach(p => {p.removeInteractive()});
	this.each(el => {
		if (!el.final) {
			setTimeout(() => {
				_this.scene.tweens.add({
					targets: [el],
						ease: "Linear",
						duration: 700,
						repeat: 0,
						alpha: {from: 1, to: 0},
						onComplete: () => {
							el.destroy();
	
						}
				  });
			}, 200)
			
		}
		else {
			setTimeout(() => {
				_this.scene.tweens.add({
					targets: [el],
						ease: "Linear",
						duration: 600,
						repeat: 0,
						alpha: {from: 0, to : 1},
						onComplete: () => {
						}
				  });
			}, 1000);
			
		}
	});
	setTimeout(() => {
		_this.emitter.emit('EVENT', {'event': 'LEVEL_COMPLETE'});
	}, 1000);
},

check_win(forced = false) {
	let _this = this;
	if (forced) {
		this.finalAnimation();
		setTimeout(() => {
			_this.emitter.emit('EVENT', {'event': 'LEVEL_COMPLETE'});
		}, 500);
	} else {
		let isWin;
		let panels = this.panels.filter(p => !p.same);
		if (!panels.filter(p => p.oppositeSame).length)
		isWin = panels.every(p => !p.angle);
		else {
			let count = 0
			panels.forEach(p => {

				if (!p.angle || (p.oppositeSame && (p.angle === 0 || p.angle === -180) || (p.threeSides && (p.angle === 0 || p.angle === 90)))) {
					count++;
				}
				
			});
			count === panels.length ? isWin = true : isWin = false;

		}

		isWin ? this.finalAnimation() : null;
			
	}
	
},
		
start_game() {
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
		if (this.tutorialAnims)
		this.tutorialAnims.forEach(a => {
			this.checkPlayingAnim(a);
		});
		  if (this.hitCont)
		  	this.hitCont.destroy();
		this.tutorial.each(el => {
			el.destroy();
		});
		this.remove(this.tutorial);
		this.tutorialShow = false;
	}
},

addGraphics({x = 0, y = 0, parentCont = this, width = 10, height = 10, radius = 10, type = 'rect'}) {
	let graphics = new Phaser.GameObjects.Graphics(this.scene, {
        x: x,
        y: y,
      });
      graphics.lineStyle(2, 0xffffff, 2)
	  
	  if (type == 'rect')
		  graphics.strokeRect(0, 0, width, height);
	  else if (type == 'circ')
	  	graphics.strokeCircle(0, 0, radius);
	  parentCont.add(graphics);
	  return graphics;
},

showTutorial() {
	if (this.tutorialShow) {
		let _this = this;
		
		this.tutorial = new Phaser.GameObjects.Container(this.scene, 0, 0);
		let frame = this.addImage({x: 0, y: 0, name:'tutor_ram', parentCont:this.tutorial});
		let tutorialWind = new Phaser.GameObjects.Image(this.scene, 0, 0, this.atlas_key, 'tutor_wind1-1.png');
		tutorialWind.setScale(this.scalablePoint);
		this.tutorial.add(tutorialWind);
	
		this.closeTutorial = new Phaser.GameObjects.Container(this.scene, 160, -120);
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

		let tutor1 = this.addImage({x: -40, y: -40, name:'tutor_1', parentCont:this.tutorial});
		tutor1.angle += 270;
		let tutor2 = this.addImage({x: 40, y: -40, name:'tutor_2', parentCont:this.tutorial});
		tutor2.angle += 270;
		let tutor3 = this.addImage({x: -40, y: 40, name:'tutor_3', parentCont:this.tutorial});
		tutor3.angle += 270;
		let tutor4 = this.addImage({x: 40, y: 40, name:'tutor_4', parentCont:this.tutorial});
		tutor4.angle += 270;

		let gr1 = this.addGraphics({x: tutor1.x - 39, y: tutor1.y - 39, parentCont: this.tutorial, type: 'rect',width: 78, height: 78});
		gr1.alpha = 0;
		let gr2 = this.addGraphics({x: tutor1.x + 39, y: tutor1.y - 39, parentCont: this.tutorial, type: 'rect',width: 78, height: 78});
		gr2.alpha = 0;
		let gr3 = this.addGraphics({x: tutor1.x - 39, y: tutor1.y + 39, parentCont: this.tutorial, type: 'rect',width: 78, height: 78});
		gr3.alpha = 0;
		let gr4 = this.addGraphics({x: tutor1.x + 39, y: tutor1.y + 39, parentCont: this.tutorial, type: 'rect',width: 78, height: 78});
		gr4.alpha = 0;

		this.tutorHand = this.addImage({name: 'tut2_7', parentCont: this.tutorial, x: -90, y: 50}).setScale(this.scalablePoint-0.2);
		this.tutorHand.alpha = 0;
		 this.addTutorialAnim({
			el: this.tutorHand,
			x: 30,
			alpha: {from: 0, to: 1},
			callback: () => {
					this.addTutorialAnim({el: gr1, alpha: {from: 0, to: 1}, yoyo: true, callback: () => {
						this.addTutorialAnim({el: tutor1, angle: 90, duration: 0,callback: () => {
							this.addTutorialAnim({el: this.tutorHand, x: 80, callback: () => {
								this.addTutorialAnim({el: gr2, alpha: {from: 0, to: 1}, yoyo: true, callback: () => {
									this.addTutorialAnim({el: tutor2, angle: 90, duration: 0, callback: () => {
										this.addTutorialAnim({el: this.tutorHand, y: 80, callback: () => {
												this.addTutorialAnim({el: gr4, alpha: {from: 0, to: 1}, yoyo: true, callback: () => {
													this.addTutorialAnim({el: tutor4, angle: 90, duration: 0,callback: () => {
													this.addTutorialAnim({el: this.tutorHand, x: -80, callback: () => {
															this.addTutorialAnim({el: gr3, alpha: {from: 0, to: 1}, yoyo: true, callback: () => {
																	this.addTutorialAnim({el: tutor3, angle: 90, duration: 0,callback: () => {
																		this.addTutorialAnim({el: this.tutorHand, x: 80, y: 80, alpha: {from: 1, to: 0}, callback: () => {
																setTimeout(() => {
																	_this.tutorialShow ?
																	_this.showTutorial() : null;
																}, 1000);
															}});
														}})
													}})
												}})
											}})
										}})
									}})
								}})
							}})
						}});
					}});
				}});
		}})
		// let bg2 = this.initBg({x: 0, y: 0, name: 'bg0'});
		// this.tutorial.add(bg2);
	}
},

addTutorialAnim({el, x = 0, y = 0, angle = 0, alpha = {from:1, to: 1}, callback = () => {}, callbackDelay = 0, yoyo = false, duration = 400, repeat = 0}) {
	 let anim = this.scene.tweens.add({
		targets: [el],
			ease: "Linear",
			duration: duration,
			repeat: repeat,
			alpha: {from: alpha.from, to: alpha.to},
			angle: `+=${angle}`,
			x: `+=${x}`,
			y: `+=${y}`,
			yoyo: yoyo,
			onComplete: () => {
				setTimeout(function(){
					callback();
				}, callbackDelay);
				
			}
			  });
			  this.tutorialAnims.push(anim);
			  return anim;
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
