var Hunter_1 = new Phaser.Class({
  Extends: Phaser.GameObjects.Container,

  initialize: function Hunter_1(scene) {
    this.scene = scene;
    Phaser.GameObjects.Container.call(this, this.scene, 0, 0);
    this.emitter = new Phaser.Events.EventEmitter();

    this.targetConfig = {
      1: [],
      2: [],
      3: [],
    };
  },

  
  init(params) {
    let _this = this;
    this.tutorial = true;
    this.atlas_key = params['atlas_key'];
    this.width = params['w'];
    this.height = params['h'];
    this.center = new Phaser.Geom.Point(this.width / 2, this.height / 2);
    this.moving_holder = new Phaser.GameObjects.Container(this.scene, 0, 0);
    this.scalablePoint = 0.6;
    this.x = this.center.x;
    this.y = this.center.y;
    let items_atlas = this.scene.textures.get(this.atlas_key);
 
    this.blocks = [];
    this.variab = [];
    this.bg = new Phaser.GameObjects.Image(this.scene, 0, 0, this.atlas_key, 'bg1.png');
    this.bg.setScale(this.scalablePoint);
    this.add(this.bg);

    this.score = 1;
    this.scoreText = new Phaser.GameObjects.Text(this.scene, -290, -230, `${this.score} / 3`, {
      fontSize: '30px',
      color: '#4898b9',
      fontFamily: 'sans-serif'
    });
    this.add(this.scoreText);

    this.fieldVariantes = new Phaser.GameObjects.Container(this.scene, -100, -187);
    this.fieldBlocks = new Phaser.GameObjects.Container(this.scene, -148, -20);

    for (let i = 1; i < 4; i++) {
      let targetSigns = Phaser.Utils.Array.Shuffle(Phaser.Utils.Array.NumberArray(1, 12)).splice(0, 6);
      this.targetConfig[i] = targetSigns;
    }
    
    this.episodeCount = 0;
    this.episodeEp = 0;
    this.createVariab();
    this.createField();
    this.add(this.fieldVariantes);
    this.add(this.fieldBlocks);
  },
  
  createVariab() {
    let id1 = 1;
    for (let i = 0; i < 2; i++) {
      let variab = new Phaser.GameObjects.Container(this.scene, 0, 15);
      variab.id = id1;
      let variabBack = new Phaser.GameObjects.Image(this.scene, 0, 0, this.atlas_key, 'c1.png');
      let variabBackActive = new Phaser.GameObjects.Image(this.scene, 0, 0, this.atlas_key, 'c2.png');
      variabBackActive.alpha = 1;
      variab.x = i * (variabBack.width - 40) - 20;
      variab.setScale(this.scalablePoint);
      variab.add(variabBack);
      variab.add(variabBackActive);

      let text = new Phaser.GameObjects.Text(this.scene, -128, -70, `${id1}`, {
        fontSize: '36px',
        color: '#4898b9',
        fontFamily: 'sans-serif'
      });
      text.id = 'text';
      variab.add(text);

      let signsCont = new Phaser.GameObjects.Container(this.scene, -30, 0);
      variab.add(signsCont);
      variab.target = '';
      if (id1 === 1) {
        if (this.tutorial)
          this.targetVar = variab;
        for (let k = 0; k < 3; k++) {
          let image = new Phaser.GameObjects.Image(this.scene, 0, 0, this.atlas_key, `ob${this.targetConfig[this.score][k]}_1.png`);
          variab.target += `${this.targetConfig[this.score][k]}`;
          image.x = k * (image.width * this.scalablePoint + 6);
          image.setScale(this.scalablePoint);
          signsCont.add(image);
        }
      } else if (id1 === 2) {
        for (let k = 3; k < 6; k++) {
          let image = new Phaser.GameObjects.Image(this.scene, 0, 0, this.atlas_key, `ob${this.targetConfig[this.score][k]}_1.png`);
          variab.target += `${this.targetConfig[this.score][k]}`;
          image.x = (k - 3) * (image.width * this.scalablePoint + 6);
          image.setScale(this.scalablePoint);
          signsCont.add(image);
        }
      }

      if (variab.id === 1)
        this.activeTarget = variab;
      else if (variab.id === 2)
        variabBackActive.alpha = 0;

      this.fieldVariantes.add(variab);
      this.variab.push(variab);
      id1++;
    }
  },

  createField(episodeEp) {
    let id2 = 1;
    let ep;
    if (episodeEp === 1) ep = 6;
      else ep = 3;
    
    let tarId = Phaser.Utils.Array.GetRandom(Phaser.Utils.Array.NumberArray(1, 4));
    for (let i = 0; i < 2; i++)
      for (let j = 0; j < 2; j++) {
        let block = new Phaser.GameObjects.Container(this.scene, 0, 0);
        block.activeVis = false;
        block.id = id2;
        let blockBack = new Phaser.GameObjects.Image(this.scene, 0, 0, this.atlas_key, 'c3.png');
        let blockBackActive = new Phaser.GameObjects.Image(this.scene, 0, 0, this.atlas_key, 'c4.png');
        block.x = i * (blockBack.width - 160) + 8;
        block.y = j * (blockBack.height - 73) + 20;
        blockBack.setScale(this.scalablePoint);
        block.add(blockBack);
        blockBackActive.x = i * (blockBackActive.width/2 * this.scalablePoint - 135);
        blockBackActive.y = j * (blockBackActive.height/2* this.scalablePoint - 73);
        blockBackActive.setScale(this.scalablePoint);
        block.add(blockBackActive);
        blockBackActive.alpha = 0;
        let text = new Phaser.GameObjects.Text(this.scene, -120, -55, `${id2}`, {
          fontSize: '30px',
          color: '#4898b9',
          fontFamily: 'sans-serif'
        });
        text.id = 'text';
        block.add(text);

        blockBack.setInteractive();
        blockBack.on('pointerdown', function() {
          if (this.tutorial)
            this.removeTutorial();
          block.activeVis = !block.activeVis;
          if (block.activeVis) {
            this.fieldBlocks.each(b => {
              if (b.activeVis && b !== block) {
                b.list[1].alpha = 0;
                b.activeVis = false;
              }
            });
            blockBackActive.alpha = 1;
          }
          this.checkSimilarity(block);
        }, this);

        let signsCont = new Phaser.GameObjects.Container(this.scene, -30, 0);
        block.add(signsCont);
        if (block.id === tarId) {
          if (this.tutorial)
            this.targetItem = block;
          block.target = '';
          for (let k = ep - 3; k < ep; k++) {
            let image = new Phaser.GameObjects.Image(this.scene, 0, 0, this.atlas_key, `ob${this.targetConfig[this.score][k]}_2.png`);
            block.target += `${this.targetConfig[this.score][k]}`;
            if (ep === 6) {
              image.x = (k-3) * (image.width * this.scalablePoint + 6);
            } else 
              image.x = k * (image.width * this.scalablePoint + 6);
            image.setScale(this.scalablePoint);
            signsCont.add(image);
          }
        } 
        else {
          let targetSignsRandom = Phaser.Utils.Array.Shuffle(Phaser.Utils.Array.NumberArray(1, 12)).splice(0, 6);
          for (let k = 0; k < 3; k++) {
            let image = new Phaser.GameObjects.Image(this.scene, 0, 0, this.atlas_key, `ob${targetSignsRandom[k]}_2.png`);
            image.x = k * (image.width * this.scalablePoint + 6);
            image.setScale(this.scalablePoint);
            signsCont.add(image);
          }
        }
        
        this.fieldBlocks.add(block);
        this.blocks.push(block);
        id2++;
      }
  },

  hideField(episodeEp) {
    let _this = this;
    let count = 0;
    setTimeout(function() {
      _this.list[3].list.forEach(el => {
        _this.scene.tweens.add({
          targets: [el],
              ease: "Linear",
              duration: 800,
              repeat: 0,
              alpha: {from: 1, to: 0},
              onComplete: () => {
                el.parentContainer.remove(el);
                el.destroy();
                count++;
                if (count === 4 && _this.score < 4) {
                  _this.createField(episodeEp);
                  _this.fieldBlocks.alpha = 0;
                  _this.scene.tweens.add({
                    targets: [_this.fieldBlocks],
                    ease: "Linear",
                    duration: 800,
                    repeat: 0,
                    alpha: {from: 0, to: 1},
                  });
                  if (_this.episodeEp === 0) {
                    _this.createVariab();
                  }
                }
                
              }
        });
      });
    },300);
    
  },

  checkSimilarity(block) {
    let _this = this;
    if (block.target === this.activeTarget.target) {
      this.episodeEp++;
      this.episodeCount++;
      setTimeout(function() {
        _this.activeTarget.parentContainer ?
        _this.activeTarget.parentContainer.list[_this.activeTarget.parentContainer.list.indexOf(_this.activeTarget)].list[1].alpha = 0 : null;
        if (_this.episodeCount < 2 && _this.activeTarget.parentContainer && _this.activeTarget.parentContainer.list[_this.activeTarget.parentContainer.list.indexOf(_this.activeTarget)+1]) {
          _this.activeTarget.parentContainer.list[_this.activeTarget.parentContainer.list.indexOf(_this.activeTarget)+1].list[1].alpha = 1;
          _this.activeTarget = _this.activeTarget.parentContainer.list[_this.activeTarget.parentContainer.list.indexOf(_this.activeTarget)+1];
        }
        
      }, 1100);
      if (_this.episodeCount === 2 && _this.score < 4) {
        _this.score++;
        
        _this.episodeEp = 0;
        _this.episodeCount = 0;
        if (_this.score <= 3) {
          _this.scoreText.text = `${this.score} / 3`;
          _this.hideVariab();
        }
      }
      
      this.hideField(this.episodeEp);
      _this.check_win();
    }
  },

  hideVariab() {
    let _this = this;
    setTimeout(function() {
      _this.list[2].list.forEach(el => {
        _this.scene.tweens.add({
          targets: [el],
              ease: "Linear",
              duration: 500,
              repeat: 0,
              alpha: {from: 1, to: 0},
              onComplete: () => {
                el.parentContainer.remove(el);
                el.destroy();
                
              }
        });
      });
    },300);
  },

  check_win(forced = false) {
    let _this = this;
    if (forced === true) {
      this.removeTutorial();
      _this.score = 4;
      this.hideField();
      this.finalAnimation();
      setTimeout(() => {
        _this.emitter.emit('EVENT', {'event': 'LEVEL_COMPLETE'});
      }, 500);
    }
    
    else if (_this.score === 4) {
      this.finalAnimation();
      setTimeout(() => {
        _this.emitter.emit('EVENT', {'event': 'LEVEL_COMPLETE'});
      }, 500);
    }
  },

  finalAnimation() {
    let _this = this;
    this.winImage = new Phaser.GameObjects.Image(this.scene, 0, 65, this.atlas_key, 'photo1.png');
    this.winImage.alpha = 0;
    this.winImage.setScale(this.scalablePoint);
    this.add(this.winImage);
    setTimeout(function(){
      _this.scene.tweens.add({
        targets: [_this.winImage],
        ease: "Linear",
        duration: 800,
        repeat: 0,
        alpha: {from: 0, to: 1},
        onComplete: () => {
        }
      });
    }, 500)
  },

  start_game() {
    this.showTutorial();
  },

  removeTutorial() {
    if (this.tutorialAnim) {
      this.tutorialAnim.stop();
      this.tutorialAnim.remove();
    }
    if (this.tutorialAnim2) {
      this.tutorialAnim2.stop();
      this.tutorialAnim2.remove();
    }

    if (this.graphicsBlock)
      this.graphicsBlock.destroy();

    if (this.graphicsVariab)
      this.graphicsVariab.destroy();

    if (this.tutorialHand) {
      this.remove(this.tutorialHand);
      this.tutorialHand.destroy();
    }
    this.tutorial = false;
  },

  showTutorial() {
    if (this.tutorial) {
      let _this = this;
      let ptT = this.toGlobal(this.targetItem.parentContainer, new Phaser.Geom.Point(this.targetItem.x, this.targetItem.y));
      let {x, y} = this.toLocal(this, new Phaser.Geom.Point(ptT.x, ptT.y));
      this.tutorialHand = new Phaser.GameObjects.Image(this.scene, x - 30, y + 200, this.atlas_key, 'tut1_7.png');
      this.tutorialHand.setScale(this.scalablePoint);
      this.add(this.tutorialHand);
      this.tutorialAnim = this.scene.tweens.add({
        targets: [this.tutorialHand],
        ease: "Linear",
        duration: 800,
        repeat: 0,
        alpha: {from: 0, to: 1},
        y: '-=100',
        onComplete: () => {
          this.graphicsBlock = new Phaser.GameObjects.Graphics(this.scene, {
            x: x - 134,
            y: y - 71,
          });
          this.graphicsBlock.lineStyle(2, 0xffffff, 1)
          .strokeRect(0, 0, (this.targetItem.list[0].width-5) * this.scalablePoint, (this.targetItem.list[0].height-5) * this.scalablePoint);
          this.add(this.graphicsBlock);
          this.bringToTop(this.tutorialHand);

          let pt1 = this.toGlobal(this.activeTarget.parentContainer, new Phaser.Geom.Point(this.activeTarget.x,this.activeTarget.y));
          let pt = this.toLocal(this, new Phaser.Geom.Point(pt1.x,pt1.y));
          this.graphicsVariab = new Phaser.GameObjects.Graphics(this.scene, {
            x: pt.x - 85,
            y: pt.y - 46,
          });
          this.graphicsVariab.lineStyle(2, 0xffffff, 1)
          .strokeRect(0, 0, (this.activeTarget.list[0].width-5) * this.scalablePoint, (this.activeTarget.list[0].height-5) * this.scalablePoint);
          this.add(this.graphicsVariab);
          
          setTimeout(function() {
            _this.remove(_this.graphicsBlock);
            _this.remove(_this.graphicsVariab);

            _this.tutorialAnim2 = _this.scene.tweens.add({
              targets: [_this.tutorialHand],
              ease: "Linear",
              duration: 800,
              repeat: 0,
              alpha: {from: 1, to: 0},
              y: '+=100',
              onComplete: () => {
                _this.tutorialHand.alpha = 0;
                if (_this.tutorial) {
                  setTimeout(function(){
                    _this.showTutorial();
                  },400);
                }
              }
            });
          }, 400)
        }
      });
    }
  },
  
  destroy_level() {
    this.removeTutorial();
    this.each(el => {
      this.remove(el);
      el.destroy();
    });
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
