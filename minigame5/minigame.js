let Professor_5 = new Phaser.Class({
 
    Extends: Phaser.GameObjects.Container,

    initialize:

    function Professor_5(scene)
    {
        this.scene = scene;
        Phaser.GameObjects.Container.call(this, this.scene, 0, 0);
		this.emitter = new Phaser.Events.EventEmitter();
    },

addImage({x = 0, y = 0, name, parentCont}) {
	let image = new Phaser.GameObjects.Image(this.scene, x, y, this.atlas_key, `${name}.png`);
	image.setScale(this.scalablePoint);
	parentCont.add(image);
	return image;
},

initBg({x, y, name}) {
	let bg = new Phaser.GameObjects.Image(this.scene, x, y, this.atlas_key, `${name}.png`);
	bg.setScale(this.scalablePoint);
	this.add(bg);
	return bg;
},

initPipe({type, x=-270, y=0, parentCont = this, pos, tube}) {
	let pipeCont = new Phaser.GameObjects.Container(this.scene, x, y);
	pipeCont.state = {
		hasTube: true,
		hasRightTube: false,
		pos,
		tube,
		type,
		cont: pipeCont
	};

	parentCont.add(pipeCont);
	let pipe = this.addImage({name: 't1', parentCont: pipeCont});
	
	pipe.x = -pipe.width;
	let cap = this.addImage({name: 't2', parentCont: pipeCont});
	let capColor = this.addImage({name: `t2_${type}`, parentCont: pipeCont});
	 return pipeCont;
},

initController({x = 0, y = 0, parentCont = this}) {
	let controllerCont = new Phaser.GameObjects.Container(this.scene, x, y);
	parentCont.add(controllerCont);
	let panel = this.addImage({name: 'pult', parentCont: controllerCont, x: -200});
	let topButton = this.initButton({parentCont: controllerCont, x: -200, y: -60, type: 'top', controller: controllerCont});
	let midButton = this.initButton({parentCont: controllerCont, x: -200, y: 0, type: 'mid', controller: controllerCont});
	let botButton = this.initButton({parentCont: controllerCont, x: -200, y: 60, type: 'bot', controller: controllerCont});
	controllerCont.topY = y;
	controllerCont.botY = y + 4 * (this.staticPipes.get(1).list[0].height - 8);
	return controllerCont;
},

initButton({x = 0, y = 0, type = '', parentCont, controller}) {
    	let _this= this;
	let id = 0;
	type === 'mid' ? id = 1 : id = 2;
	let buttonCont = new Phaser.GameObjects.Container(this.scene, x, y);
	let buttonClicked = this.addImage({name: `but${id}_3`, parentCont: buttonCont});
	let buttonHover = this.addImage({name: `but${id}_2`, parentCont: buttonCont});
	buttonHover.alpha = 0;
	buttonClicked.alpha = 0;
	let buttonStatic = this.addImage({name: `but${id}_1`, parentCont: buttonCont});
	parentCont.add(buttonCont);
	buttonClicked.setInteractive();
	buttonHover.setInteractive();
	buttonStatic.setInteractive();
	buttonStatic.on('pointerover', function(){
		buttonStatic.alpha = 0;
		buttonHover.alpha = 1;
	}, this);
	buttonHover.on('pointerout', function(){
		buttonStatic.alpha = 1;
		buttonHover.alpha = 0;
		buttonClicked.alpha = 0;
	}, this);
	buttonHover.on('pointerdown', function(){
		
		buttonStatic.alpha = 1;
		buttonHover.alpha = 0;
		buttonClicked.alpha = 0;
		moveController.bind(this)();
		if (type === 'mid') {
			movePipes.bind(this)();

		}
	}, this);
	buttonHover.on('pointerup', function(){
		buttonStatic.alpha = 0;
		buttonHover.alpha = 1;
		buttonClicked.alpha = 0;
	}, this);

	this.buttons.push(buttonCont);
	type === 'bot' ? buttonCont.scaleY = -1 : null;
	return buttonCont;

	function moveController() {
		let y = this.staticPipes.get(1).list[0].height - 8;
		let anim = false;
		switch (type) {
			case 'top':
				y *= -1;
				!(controller.y === controller.topY) ?
				anim = true: null;
				break;
			case 'bot':
				!(controller.y === controller.botY) ?
				anim = true: null;
				break;

		}
		anim ? this.buttons.forEach(b => b.list[2].removeInteractive()) : null;
		let pipes = [];
		this.controllerPipes.forEach(p => {
			this.bringToTop(p.state.pipe);
			pipes.push(p.state.pipe);
		});
		this.staticPipes.forEach(p => {
			this.bringToTop(p);
		});
		anim ? 
		this.scene.tweens.add({
			targets: [controller, ...pipes],
					ease: "Linear",
					duration: 300,
					repeat: 0,
					y: `+=${y}`,
					onComplete: () => {
						this.buttons.forEach(b => b.list[2].setInteractive());
						type === 'top' ? this.controllerPipes.forEach(p => p.state.pos--) : this.controllerPipes.forEach(p => p.state.pos++);
					}
		}) : null;
	}

	function movePipes() {
		let isPipeClear = this.controllerPipes.every(p => !p.state.hasPipe);
		this.controllerPipes.forEach(p => {
			this.scene.tweens.add({
				targets: [p, p.state.pipe],
					ease: "Linear",
					duration: 300,
					repeat: 0,
					x: '-=140',
					onComplete: () => {
						let staticPipe = this.staticPipes.get(p.state.pos);
						// && !this.controllerPipes.every(p => !p.state.hasPipe)
							

						if (staticPipe.state.hasTube && !p.state.hasPipe ) {
							if (staticPipe.state.tube && staticPipe.state.type === staticPipe.state.tube.state.type && !isPipeClear)  {
								staticPipe.state.hasTube = true;
								p.state.hasPipe = false;
								p.state.pipe = null;
								
							} else {
								staticPipe.state.hasTube = false;
								p.state.hasPipe = true;
								p.state.pipe = this.staticPipes.get(p.state.pos).state.tube;
								staticPipe.state.tube  = null;

							}

							this.scene.tweens.add({
								targets: [p, p.state.pipe],
								ease: "Linear",
								duration: 300,
								repeat: 0,
								x: '+=140',
								onComplete: () => {

									this.check_win();
								}
							});
						}
						else if (!staticPipe.state.hasTube && p.state.hasPipe) {
							staticPipe.state.hasTube = true;
							p.state.hasPipe = false;
							staticPipe.state.tube = p.state.pipe;
							p.state.pipe = null;

							this.scene.tweens.add({
								targets: [p, p.state.pipe],
								ease: "Linear",
								duration: 300,
								repeat: 0,
								x: '+=140',
								onComplete: () => {

									this.check_win();
								}
							});
						}
						else if (staticPipe.state.hasTube && p.state.hasPipe) {
							[staticPipe.state.tube, p.state.pipe] = [p.state.pipe, staticPipe.state.tube];
							this.bringToTop(p.state.pipe);

							this.bringToTop(staticPipe.state.cont);

							this.scene.tweens.add({
								targets: [p, p.state.pipe],
								ease: "Linear",
								duration: 300,
								repeat: 0,
								x: '+=140',
								onComplete: () => {
									this.check_win();
								}
							});
						}
						else if (!staticPipe.state.hasTube && !p.state.hasPipe) {
							this.scene.tweens.add({
								targets: [p],
								ease: "Linear",
								duration: 300,
								repeat: 0,
								x: '+=140',
								onComplete: () => {

									this.check_win();
								}
							});
						}
						
						
					}
			  });
		})
	}
},

initControllerPipe({controller, x = -80, y = 0, pos}) {
	let pipe = this.addImage({name: 'pr', parentCont: controller, x, y});
	pipe.state = {
		hasPipe: false,
		pipe: null,
		pos
	};

	controller.each(el => {
		el !== pipe ? controller.bringToTop(el) : null;
	});
	this.controllerPipes.push(pipe);
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
	this.buttons = [];
	this.staticPipes = new Map();
	this.sticks = new Map();
	this.final = this.addImage({name: `tutor_wind1`, parentCont: this, x: -10, y: 20});
	this.final.alpha = 0;
	this.final.setScale(1.6);
	this.sticksPos = Phaser.Utils.Array.Shuffle(Phaser.Utils.Array.NumberArray(1,8));
	this.controllerPipes = [];
	this.bg = this.initBg({name: 'bg0', x: 0, y: 0});
	let y = -200;
	let id = 1;
	while (items_atlas.has(`t2_${id}.png`)) {
		let stick = this.addImage({name: `t3_${this.sticksPos[id-1]}`, parentCont: this, y, x: -230});
		stick.state = {
			pos: id,
			type: this.sticksPos[id-1]
		}
		let pipe = this.initPipe({type: id, y, pos: id, tube: stick});
		
		this.staticPipes.set(id, pipe);
		this.sticks.set(id, stick);
		
		y+=pipe.list[0].height - 8;
		id++;
	}
	let controller = this.initController({
		x: 330,
		y: -120
	});
	this.initControllerPipe({controller, y: -84, pos: 1});
	this.initControllerPipe({controller, y: -28, pos: 2});
	this.initControllerPipe({controller, y: 32, pos: 3});
	this.initControllerPipe({controller, y: 92, pos: 4});


	let pt = this.toGlobal(this.bg, new Phaser.Geom.Point(this.bg.x, this.bg.y));
	let shape = this.scene.add.graphics({ fillStyle: { color: 0xFFFFFF, alpha: 0.2 } });
	let rect = new Phaser.Geom.Rectangle(pt.x - 260, pt.y - 163, this.bg.width/2 - 15, this.bg.height/2 + 30);
	shape.fillRectShape(rect);
	let mask = shape.createGeometryMask();
	controller.setMask(mask);
	shape.visible = false;
	
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

initPoint({name, x, y, pos, parentCon = this.pointCont}) {
	let parentCont = new Phaser.GameObjects.Container(this.scene, x, y);
	parentCont.name = name;
	parentCont.pos = pos;
	parentCon.add(parentCont);
	let pointImg = this.addImage({name, x:0, y:0, parentCont});
	return parentCont;
},

finalAnimation(callback = () => {}) {
	this.bringToTop(this.final);
	this.scene.tweens.add({
		targets: [this.final],
			ease: "Linear",
			duration: 800,
			repeat: 0,
			alpha: {from: 0, to: 1},
			onComplete: () => {
				
			}
	  });
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
		this.staticPipes.forEach(p =>{
			p.state.tube && p.state.type === p.state.tube.state.type ? count++ : null;
		});
		if (count === 8) {
			
			setTimeout(() => {
				this.finalAnimation();
				_this.emitter.emit('EVENT', {'event': 'LEVEL_COMPLETE'});
			}, 500) ;
		} 
			
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
		if (this.closeTutorial)
			this.closeTutorial.destroy();
		this.tutorial.each(el => {
			el.destroy();
		});
		this.remove(this.tutorial);
		this.tutorialShow = false;
	}
},

showTutorial() {
	if (this.tutorialShow) {
		let _this = this;
		this.tutorial = new Phaser.GameObjects.Container(this.scene, 0, 0);
		this.tutorial.setScale(1.8);
		let tutorialWind = new Phaser.GameObjects.Image(this.scene, 0, 0, this.atlas_key, 'tutor_wind1.png');
		tutorialWind.setScale(this.scalablePoint);
		this.tutorial.add(tutorialWind);
		let tutorialWind2 = new Phaser.GameObjects.Image(this.scene, 0, 0, this.atlas_key, 'tutor_wind0.png');
		tutorialWind2.setScale(this.scalablePoint);
		this.tutorial.add(tutorialWind2);
	
		this.closeTutorial = new Phaser.GameObjects.Container(this.scene, 300, -220);
		let close = new Phaser.GameObjects.Image(this.scene, 0, 0, this.atlas_key, 'but_mini1.png');
		close.setInteractive();
		this.closeTutorial.add(close);
	
		let X = new Phaser.GameObjects.Image(this.scene, 0, 0, this.atlas_key, 'button_x.png');
		X.setScale(0.8);
		X.setInteractive();
		this.closeTutorial.add(X);
		this.add(this.closeTutorial);
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
		// this.tutorialPlay = new Phaser.GameObjects.Container(this.scene, 0, 0);
		// this.tutorial.add(this.tutorialPlay);

		let controller = new Phaser.GameObjects.Container(this.scene, 120, -60);
		let tube1 = this.addImage({name: 'tutor_wind10', parentCont: controller, y: -30, x: 100});
		let tube2 = this.addImage({name: 'tutor_wind10', parentCont: controller, y: 30, x: 100});
		let pult = this.addImage({name: 'tutor_wind11', parentCont: controller});

		let pt = this.toGlobal(this.bg, new Phaser.Geom.Point(tutorialWind.x, tutorialWind.y));
		let shape = this.scene.add.graphics({ fillStyle: { color: 0xFFFFFF, alpha: 0.2 } });
		let rect = new Phaser.Geom.Rectangle(pt.x - 210, pt.y - 160, tutorialWind.width - 59, tutorialWind.height - 40);
		shape.fillRectShape(rect);
		let mask = shape.createGeometryMask();
		this.tutorial.setMask(mask);
		shape.visible = false;
		this.tutorial.add(controller);
		this.bringToTop(this.closeTutorial);
		let stick1 = this.addImage({name: 'tutor_wind9', parentCont: this.tutorial, y: -90, x: -140});
		let stick2 = this.addImage({name: 'tutor_wind7', parentCont: this.tutorial, y: -30, x: -140});
		let stick3 = this.addImage({name: 'tutor_wind5', parentCont: this.tutorial, y: 30, x: -140});
		let stick4 = this.addImage({name: 'tutor_wind3', parentCont: this.tutorial, y: 90, x: -140});

		let tubeTarget1 = this.addImage({name: 'tutor_wind2', parentCont: this.tutorial, y: -90, x: -174});
		let tubeTarget2 = this.addImage({name: 'tutor_wind4', parentCont: this.tutorial, y: -30, x: -174});
		let tubeTarget3 = this.addImage({name: 'tutor_wind6', parentCont: this.tutorial, y: 30, x: -174});
		let tubeTarget4 = this.addImage({name: 'tutor_wind8', parentCont: this.tutorial, y: 90, x: -174});

		this.addTutorialAnim({el: [controller], y: 60, callbackDelay: 300, callback: () => {
				this.addTutorialAnim({el: [controller], y: 60, callbackDelay: 300, callback: () => {
						this.addTutorialAnim({el: [tube1,tube2], x: -130, callbackDelay: 150, callback: () => {
								this.addTutorialAnim({el: [tube1,tube2, stick3, stick4], x: 130, callbackDelay: 300, callback: () => {
									// this.tutorial.bringToTop(stick3);
									// this.tutorial.bringToTop(stick4);
										this.addTutorialAnim({el: [controller,stick3, stick4], y: -60, callbackDelay: 300, callback: () => {
												this.addTutorialAnim({el: [tube1,tube2, stick3, stick4], x: -130, callbackDelay: 300, callback: () => {
														this.addTutorialAnim({el: [tube1,tube2, stick2], x: 130, callbackDelay: 300, callback: () => {
																this.addTutorialAnim({el: [controller, stick2], y: 60, callbackDelay: 300 , callback: () => {
																		this.addTutorialAnim({el: [tube1,tube2, stick2], x: -130, callbackDelay: 300, callback: () => {
																				this.addTutorialAnim({el: [tube1,tube2, stick4], x: 130, callbackDelay: 300, callback: () => {
																						this.addTutorialAnim({el: [controller, stick4], y: -60, callbackDelay: 300, callback: () => {
																								this.addTutorialAnim({el: [controller, stick4], y: -60, callbackDelay: 300, callback: () => {
																										this.addTutorialAnim({el: [tube1,tube2, stick4], x: -130, callbackDelay: 300, callback: () => {
																												this.addTutorialAnim({el: [tube1,tube2, stick1], x: 130, callbackDelay: 300, callback: () => {
																														this.addTutorialAnim({el: [controller, stick1], y: 60, callbackDelay: 300, callback: () => {
																																this.addTutorialAnim({el: [controller, stick1], y: 60, callbackDelay: 300, callback: () => {
																																		this.addTutorialAnim({el: [tube1,tube2, stick1], x: -130, callbackDelay: 300, callback: () => {
																																				this.addTutorialAnim({el: [tube1,tube2, stick2], x: 130, callbackDelay: 300, callback: () => {
																																						this.addTutorialAnim({el: [controller, stick2], y: -60, callbackDelay: 300, callback: () => {
																																								this.addTutorialAnim({el: [tube1,tube2, stick2], x: -130, callbackDelay: 300, callback: () => {
																																										this.addTutorialAnim({el: [tube1,tube2, stick1, stick3], x: 130, callbackDelay: 300, callback: () => {
																																												this.addTutorialAnim({el: [controller, stick1, stick3], y: 60, callbackDelay: 300, callback: () => {
																																														this.addTutorialAnim({el: [tube1,tube2, stick1, stick3], x: -130, callbackDelay: 300, callback: () => {
																																																this.addTutorialAnim({el: [tube1,tube2, ], x: 130, callbackDelay: 300, callback: () => {
																																																		this.addTutorialAnim({el: [tube1,tube2, ], x: -130, callbackDelay: 300, callback: () => {
																																																				this.addTutorialAnim({el: [tube1,tube2, stick3], x: 130, callbackDelay: 300, callback: () => {
																																																						this.addTutorialAnim({el: [controller, stick3], y: -60, callbackDelay: 300, callback: () => {
																																																								this.addTutorialAnim({el: [tube1,tube2, stick3], x: -130, callbackDelay: 300, callback: () => {
																																																										this.addTutorialAnim({el: [tube1,tube2, stick2], x: 130, callbackDelay: 300, callback: () => {
																																																												this.addTutorialAnim({el: [controller, stick2], y: 60, callbackDelay: 300, callback: () => {
																																																														this.addTutorialAnim({el: [tube1,tube2, stick2], x: -130, callbackDelay: 300, callback: () => {
																																																																this.addTutorialAnim({el: [tube1,tube2], x: 130, callbackDelay: 300, callback: () => {
																																																																	if (this.tutorialShow) {
																																																																		setTimeout(()=>{
																																																																			_this.showTutorial();
																																																																		}, 1000)
																																																																	}																																																																	}});

																																																															}});
																																																													}});
																																																											}});
																																																									}});
																																																							}});
																																																					}});
																																																			}});
																																																	}});
																																															}});
																																													}});
																																											}});
																																									}});
																																							}});
																																					}});
																																			}});
																																	}});
																															}});
																													}});
																											}});
																									}});
																							}});
																					}});
																			}});
																	}});
															}});
													}});
											}});
									}});
							}});
					}});
			}});

		}
},

addTutorialAnim({el, x = 0, y = 0, alpha = {from:1, to: 1}, callback = () => {}, callbackDelay = 0, yoyo = false, duration = 400, repeat = 0}) {
	 let anim = this.scene.tweens.add({
		targets: [...el],
			ease: "Linear",
			duration: duration,
			repeat: repeat,
			alpha: {from: alpha.from, to: alpha.to},
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
