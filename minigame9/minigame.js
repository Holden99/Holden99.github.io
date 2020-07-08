let Bank_1 = new Phaser.Class({
 
    Extends: Phaser.GameObjects.Container,

    initialize:

    function Bank_1(scene)
    {
        this.scene = scene;
        Phaser.GameObjects.Container.call(this, this.scene, 0, 0);
		this.emitter = new Phaser.Events.EventEmitter();
    },

addImage({x = 0, y = 0, name, parentCont = this}) {
	let image = new Phaser.GameObjects.Image(this.scene, x, y, this.atlas_key, `${name}.png`);
	image.setScale(this.scalablePoint);
	parentCont.add(image);
	return image;
},


initButton({x, y, angle, name, nameActive, id}) {
	let button = new Phaser.GameObjects.Container(this.scene, x, y);
	button.id = id;
	let buttonStat = new Phaser.GameObjects.Image(this.scene, 0, 0, this.atlas_key, `${name}.png`);
	button.setScale(this.scalablePoint);
	button.angle = angle;
	button.add(buttonStat);
	this.add(button);
	let buttonActive = new Phaser.GameObjects.Image(this.scene, 0, 0, this.atlas_key, `${nameActive}.png`);
	buttonActive.setScale(this.scalablePoint + 0.2);
	button.add(buttonActive);
	buttonActive.alpha = 0;
	buttonStat.setInteractive();
	buttonStat.on('pointerover', function() {
		buttonActive.alpha = 1;
	});
	buttonStat.on('pointerout', function() {
		buttonActive.alpha = 0;
	});

	

	return button;
},

configButton(button) {
			button.list[0].on('pointerdown', function() {
				button.list[1].alpha = 0;
				if (button.btnType === 'down') {
					button.clicked = !button.clicked;
					let colPoints = [this.points[0][button.managedCol],this.points[1][button.managedCol],this.points[2][button.managedCol], this.points[3][button.managedCol]];
					let dir;
					button.clicked ? dir = '+' : dir = '-';
					colPoints.forEach(p => {
						this.moveItemVertically(p, dir);
					});
					if (button.clicked) {
						this.points[1][button.managedCol].pos = `2_${button.managedCol}`;
						this.points[2][button.managedCol].pos = `3_${button.managedCol}`;
						[this.points[1][button.managedCol], this.points[2][button.managedCol]] = [this.points[2][button.managedCol], this.points[1][button.managedCol]];
					} else {
						this.points[1][button.managedCol].pos = `2_${button.managedCol}`;
						this.points[2][button.managedCol].pos = `1_${button.managedCol}`;
						[this.points[2][button.managedCol], this.points[1][button.managedCol]] = [this.points[1][button.managedCol], this.points[2][button.managedCol]];

					}
				}
				else if (button.btnType === 'left') {
					let lastPoint = this.points[2][this.points[2].length - 1];
					let firstPoint = this.points[2].find(p => p.firstEl);
					let point = this.initPoint({name : lastPoint.name, x:-127.5 * 2, y:firstPoint.y, pos:`2_new`});
					this.points[2].unshift(point);
					this.points[2].forEach(p => {
						this.moveItem(p, 'right', () => {
							this.pointCont.remove(lastPoint);
						});
					});
			this.points[2].pop();
			this.points[2].forEach(p => {
				let pos = p.pos.split('_');
				if (pos[1] === 'new') {
					p.pos = `2_0`;
					p.firstEl = true;
					p.lastEl = false;
				} 
				else {
					let newPos = +pos[1];
					p.firstEl = false;
					p.pos = `2_${++newPos}`;
					if (newPos === 7)
					p.lastEl = true;
					else
					p.lastEl = false;
				}
					
			});
					
				}
				else if (button.btnType === 'right') {
					let firstPoint = this.points[2][0];
					let lastPoint = this.points[2].find(p => p.lastEl);
					let point = this.initPoint({name : firstPoint.name, x: 30 * 2, y:firstPoint.y, pos:`2_new`});
					this.points[2].push(point);
					this.points[2].forEach(p => {
						this.moveItem(p, 'left', () => {
							this.pointCont.remove(firstPoint);
						});
					});
					this.points[2].shift();
					this.points[2].forEach(p => {
						let pos = p.pos.split('_');
						if (pos[1] === 'new') {
							
							p.pos = `2_7`;
							p.lastEl = true;
							p.firstEl = false;
						} else {
							let newPos = +pos[1];
							p.lastEl = false;
							p.pos = `2_${--newPos}`;
							if (newPos === 0)
							p.firstEl = true;
							else
							p.firstEl = false;
						}
					});
				}
				this.check_win();
			}, this);
	
},

initBg({x, y, name}) {
	let bg = new Phaser.GameObjects.Image(this.scene, x, y, this.atlas_key, `${name}.png`);
	bg.setScale(this.scalablePoint);
	this.add(bg);
	return bg;
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
	this.items_atlas = this.scene.textures.get(this.atlas_key);
	this.x = this.center.x;
	this.y = this.center.y;

	this.finalPicture = this.addImage({x: 0, y: 0, name:'bg1', parentCont:this});
	this.finalPicture.final = true;
	this.finalPicture.alpha = 0;
	this.finalPicture2 = this.addImage({x: 0, y: 130, name:'final', parentCont:this});
	this.finalPicture2.final = true;
	this.finalPicture2.alpha = 0;

	this.bg = this.initBg({x: 0, y: 0, name: 'bg0'});
	this.targetPicture = this.bg;

	this.buttonsField = this.initBg({x: 0, y: 220, name: 'bg2'});
	this.configBut = this.addImage({x: - 305, y: - 113,name: 'code0_1'});
	this.configBut.alpha = 0;
	this.targetField = this.buttonsField;
	
    this.config = {
		first: 1,
		last: 10,
		initTarg: 8,
		codeOneWin: 9,
		codeTwoWin: 8,
		codeThreeWin: 5,
		codeFourWin: 9,
	};
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
	let _this = this;
	_this.scene.input.removeAllListeners();
	this.hitCont.destroy();
	this.each(el => {
		if (!el.final) {
			this.scene.tweens.add({
				targets: [el],
					ease: "Linear",
					duration: 600,
					repeat: 0,
					y: '+=400',
					onComplete: () => {
						el.destroy();
						setTimeout(function() {
							_this.scene.tweens.add({
								targets: [_this.finalPicture],
									ease: "Linear",
									duration: 600,
									repeat: 0,
									alpha: {from: 0, to: 1},
									onComplete: () => {
										el.destroy();
										callback();
									}
							  });
						}, 300)
						
					}
			  });
		} else {
			this.scene.tweens.add({
				targets: [el],
					ease: "Linear",
					duration: 600,
					repeat: 0,
					alpha: {from: 0, to: 1},
					onComplete: () => {
						
					}
			  });
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

		let idOne = this.codeOneArr[7].id;
		let idTwo = this.codeTwoArr[7].id;
		let idThree = this.codeThreeArr[7].id;
		let idFour = this.codeFourArr[7].id;

		 if (idOne === this.config.codeOneWin && idTwo === this.config.codeTwoWin && idThree === this.config.codeThreeWin && idFour === this.config.codeFourWin) {
			
			setTimeout(() => {
				_this.finalAnimation();
				_this.emitter.emit('EVENT', {'event': 'LEVEL_COMPLETE'});
			}, 500);
		}
		
	}
	
},
	
// type = '1', hitArea= {y=323, x = 258}, blockX = -48, mask = {x = -41, y = 138
initCodeColumn({type = '1', hitAreaX, hitAreaY, blockX = -48, maskX, maskY}) {
	let _this = this;
	let codeOne = this.initHitArea({x: hitAreaX, y: hitAreaY});
	
	let codeArr = [];
	codeOne.on('pointerdown', function(pointer) {
		codeArr.forEach(c => {
			this.moveCode(c, codeOne,() => {
				
			});
			
		});

		setTimeout(() => {
			let lastEl = codeArr.find(c => c.lastPos);
			let code = _this.initCodeBlock({name: `code${type}_${lastEl.id}`, y:_this.startY, x:lastEl.x, parentCont: codeCont});
			code.id = lastEl.id;
			let el = codeArr.splice(codeArr.length - 1, 1);
			_this.remove(el);
			codeArr.unshift(code);
			codeArr[codeArr.length - 1].lastPos = true;
			this.check_win();
			
		}, 0);
	   }, this);

	   let id = 1;
	   let y = 0;
	   let x = blockX;
	   let codeCont = new Phaser.GameObjects.Container(this.scene, 0, 0);
	   this.add(codeCont);
	   while (this.items_atlas.has(`code${type}_${id}.png`)) {
		let code = this.initCodeBlock({name: `code${type}_${id}`, y, x, parentCont: codeCont});
		code.id = id;
		codeArr.push(code);
		id == this.config.first ? this.startY = code.y : null;
		id == this.config.last ? code.lastPos = true : code.lastPos = false;
		
		id++;
		y+=this.configBut.height -10;
	   }
	   this.initMask(codeCont, maskX, maskY);

	   return codeArr;
},

start_game() {
	
	this.initDust();
	this.codeOneArr = this.initCodeColumn({type: '1', hitAreaX: 258, hitAreaY: 323, blockX: -48, maskX: -41, maskY: 138});
	this.codeTwoArr = this.initCodeColumn({type: '2', hitAreaX: 286, hitAreaY: 323, blockX: -17, maskX: -19, maskY: 138});
	this.codeThreeArr = this.initCodeColumn({type: '3', hitAreaX: 322, hitAreaY: 323, blockX: 14, maskX: 3, maskY: 138});
	this.codeFourArr = this.initCodeColumn({type: '4', hitAreaX: 352, hitAreaY: 323, blockX: 45, maskX: 25, maskY: 138});

},

moveCode(block, hitAr, callback = () => {}) {
	hitAr.removeInteractive();
	this.scene.tweens.add({
		targets: [block],
                  ease: "Linear",
                  duration: 200,
					y: `+=${30}`,
					onComplete: () => {
						callback();
						hitAr.setInteractive({
							hitArea: hitAr.rect,
							hitAreaCallback: Phaser.Geom.Rectangle.Contains
						});
					}
	});

},

initMask(codeOne, x = 0, y = 0) {
let pt = this.toGlobal(this, new Phaser.Geom.Point(codeOne.x, codeOne.y));
		let shape = this.scene.add.graphics({ fillStyle: { color: 0xFFFFFF, alpha: 0.2 } });
        let rect = new Phaser.Geom.Rectangle(pt.x + x, pt.y + y , 16, 20);
        shape.fillRectShape(rect);
        let mask = shape.createGeometryMask();
        codeOne.setMask(mask);
		shape.visible = false;
},

initHitArea({x = 0, y = 0}) {
	let hit = this.toGlobal(this, new Phaser.Geom.Point(this.targetPicture.x, this.targetPicture.y));
	hit = this.toLocal(this, new Phaser.Geom.Point(hit.x, hit.y));
	let fCode = new Phaser.GameObjects.Container(this.scene, hit.x + x, hit.y + y);
	fCode.rect = new Phaser.Geom.Rectangle(this.targetPicture.x - 320, this.targetPicture.y - 130, this.configBut.width - 7, this.configBut.height - 10);
	
	// this.fCode.add(this.configBut);
    this.add(fCode);
fCode.setInteractive({
        hitArea: fCode.rect,
        hitAreaCallback: Phaser.Geom.Rectangle.Contains
      });

	  return fCode;
},

initCodeBlock({x = 0, y = 0, name = '', parentCont = this}) {
	let block = new Phaser.GameObjects.Container(this.scene, x, y);
	parentCont.add(block);

	this.addImage({name: 'code0_1', parentCont: block});
	this.addImage({name: 'code0_2', parentCont: block});
	this.addImage({name: 'code0_3', parentCont: block});

	this.addImage({name, parentCont: block});
	block.target = true;
	return block;
},

initDust() {
    let _this = this;
    this.brushShape = new Phaser.GameObjects.Image(this.scene, 0, 0, this.atlas_key, 'brush1.png');
    this.brushShape.setScale(1);
    this.textures = [];

    let items_atlas = this.scene.textures.get(this.atlas_key);
    let id = 1;
    while(items_atlas.has(`dust${id}.png`)) {
      let texture = new Phaser.GameObjects.RenderTexture(this.scene, this.targetPicture.x - 360, this.targetPicture.y - 43, this.targetPicture.width, this.targetPicture.height - 48);
	  texture.setOrigin(0);
	  texture.setScale(0.7);
      texture.drawFrame(this.atlas_key, `dust${id}.png`, 0, 0);
      this.add(texture);
      this.textures.push(texture);
      id++;
    }

    this.brush = new Phaser.GameObjects.Image(this.scene, 0, 0, this.atlas_key, 'brush.png');
    this.brush.setScale(0.9);
    this.brush.setInteractive();
    this.brush.alpha = 0;
    this.add(this.brush);
    let hit = _this.toGlobal(this, new Phaser.Geom.Point(_this.targetPicture.x, _this.targetPicture.y));
    hit = _this.toLocal(this, new Phaser.Geom.Point(hit.x, hit.y));
    this.hitCont = new Phaser.GameObjects.Container(this.scene, hit.x, hit.y);
    this.add(this.hitCont);
    
    // let pt = this.toLocal(_this, new Phaser.Geom.Point(_this.targetPicture.x - 21, _this.targetPicture.y));
var rect = new Phaser.Geom.Rectangle(_this.targetPicture.x - 320, _this.targetPicture.y - 130, _this.targetPicture.width + 127, _this.targetPicture.height - 750);

this.hitCont.setInteractive({
        hitArea: rect,
        hitAreaCallback: Phaser.Geom.Rectangle.Contains
      });

      // _this.scene.input.on("pointermove", _this._pointerMove, this);
      let count = 0;
      this.hitCont.on('pointerover', function(pointer) {
        count++;
        if (count == 1)
        _this.scene.input.on("pointermove", _this._pointerMove, this);
      }, this);
      this.hitCont.on('pointerout', function() {
        _this.brush.alpha = 0;
        if (count == 1) {
          _this.scene.input.removeAllListeners();
          count = 0;
        }
        
      }, this);
},

destroy_level() {
	this.removeAll(true);
},

_pointerMove(pointer) {
    let _this = this;
    _this.pointerMove(pointer);
},

erase(texture, x, y) {
    let _this = this;
        if (_this.isPixelTransparent(texture, x, y) || _this.isPixelTransparent(texture, x - 40, y - 40)  || _this.isPixelTransparent(texture, x + 40, y + 40)) {
        texture.erase(_this.brushShape, x, y);
      }
      else if (_this.textures.indexOf(texture) - 1 >= 0) {
        _this.erase(_this.textures[_this.textures.indexOf(texture) - 1], x, y);
      }

},

isPixelTransparent(texture, x, y) {
    let result;
    texture.snapshotPixel(x, y, snapshot => {
      snapshot.rgba !== "rgba(0,0,0,0)" ? result = true : result = false;
    });
    return result;
},

pointerMove(pointer) {
    let _this = this;
    let {x, y} = _this.toLocal(_this, new Phaser.Geom.Point(pointer.x, pointer.y));
    let pt = this.toGlobal(_this, new Phaser.Geom.Point(_this.targetPicture.x, _this.targetPicture.y));
        _this.brush.alpha = 1;
        _this.brush.x = x;
		_this.brush.y = y - 85; // -85
		if (x < -140)
		_this.erase(_this.textures[_this.textures.length - 1], x + 390, y + 140); 
		else if (x < -60)
		_this.erase(_this.textures[_this.textures.length - 1], x + 410, y + 140); 
		else if (x < 60)
		_this.erase(_this.textures[_this.textures.length - 1], x + 470, y + 140); 
		else if (x < 180)
		_this.erase(_this.textures[_this.textures.length - 1], x + 530, y + 140); 
		else if (x < 420)
		_this.erase(_this.textures[_this.textures.length - 1], x + 600, y + 140); 
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
