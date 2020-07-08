var Hotel_2 = new Phaser.Class({
  Extends: Phaser.GameObjects.Container,

  initialize: function Hotel_2(scene) {
    this.scene = scene;
    Phaser.GameObjects.Container.call(this, this.scene, 0, 0);
    this.emitter = new Phaser.Events.EventEmitter();

    this.finalPositions = {
      13: {x : 2, y : 3},
  6: {x : -178, y : -71},
  5: {x : 182, y : -145},
  1: {x : -178, y : -145},
  11: {x : -178, y : 3},
  2: {x : -88, y : -145},
  16: {x : -178, y : 77},
  7: {x : -88, y : -71},
  20: {x : 182, y : 77},
  4: {x : 92, y : -145},
  14: {x : 92, y : 3},
  15: {x : 182, y : 3},
  8: {x : 2, y : -71},
  17: {x : -88, y : 77},
  9: {x : 92, y : -71},
  23: {x : 2, y : 151},
  10: {x : 182, y : -71},
  22: {x : -88, y : 151},
  18: {x : 2, y : 77},
  21: {x : -178, y : 151},
  19: {x : 92, y : 77},
  25: {x : 182, y : 151},
  3: {x : 2, y : -145},
  12: {x : -88, y : 3},
  24: {x : 92, y : 151},
    };
  },

  
  init(params) {
    this.atlas_key = params['atlas_key'];
    this.width = params['w'];
    this.height = params['h'];
    this.items = [];
    this.center = new Phaser.Geom.Point(this.width / 2, this.height / 2);
    this.moving_holder = new Phaser.GameObjects.Container(this.scene, 0, 0);
    this.scalablePoint = 0.6;
    this.x = this.center.x;
    this.y = this.center.y;
    let items_atlas = this.scene.textures.get(this.atlas_key);
  
    this.mainBack = new Phaser.GameObjects.Image(this.scene, 0, 0, this.atlas_key, 'bg2.png');
    this.mainBack.setScale(this.scalablePoint);
    this.add(this.mainBack);

    this.blocks = [];
    window.blocks = this.blocks;
    this.blocksState = {
      count: 0
    }
    this.positions = [
      ...Phaser.Utils.Array.Shuffle(Phaser.Utils.Array.NumberArray(1, 25))
    ];
    let id = 0;

    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        let blockCont = new Phaser.GameObjects.Container(this.scene, -178, -145);
        let block = new Phaser.GameObjects.Image(this.scene, 0, 0, this.atlas_key, `elem${this.positions[id]}.png`);
        blockCont.id = this.positions[id];
        blockCont.x += j * (block.width/2 + 15);
        blockCont.y += i * (block.height/2 + 12);
        block.setScale(this.scalablePoint);
        let blockActive = new Phaser.GameObjects.Graphics(this.scene, 0, 0);
        blockActive.fillStyle(0x37a835, 0.4)
        .setTexture(this.atlas_key, `elem1.png`, 1)
        .fillRoundedRect(-block.width * this.scalablePoint / 2, -block.height * this.scalablePoint / 2, block.width * (this.scalablePoint), block.height * (this.scalablePoint), 3);
        blockActive.alpha = 0;
        block.activeVis = false;
        blockCont.add(block);
        blockCont.add(blockActive);
        blockCont.bringToTop(blockActive);
        this.blocks.push(blockCont);
        
        this.add(blockCont);
        this.configBlock(block, blockActive);
        id++;
      }
    }
  },
  
  swapBlocks(first, second) {
    let _this = this;
    let secondPosition = {x: second.x, y: second.y};
    let firstPosition = {x: first.x, y: first.y};
    first.parentContainer.parentContainer.bringToTop(first);
    setTimeout(function() {
      _this.scene.tweens.add({
        targets: [first],
            ease: "Linear",
            duration: 300,
            repeat: 0,
            x: secondPosition.x,
            y: secondPosition.y,
      });
    }, 0);
    
    setTimeout(function() {
      _this.scene.tweens.add({
        targets: [second],
            ease: "Linear",
            duration: 300,
            repeat: 0,
            x: firstPosition.x,
            y: firstPosition.y,
            onComplete: () => {
              _this.check_win();
            }
      });
    }, 100);  
  },

  configBlock(block, blockActive) {
    let _this = this;
    if (this.tutorial)
      this.removeTutorial();
      block.setInteractive();
      block.on('pointerdown', function() {
        if (this.blocksState.count === 0) {
          this.blocks.forEach(cont => {
            cont.each(block => {
              block.activeVis ? block.activeVis = false : null;
            })
          })
        }
        block.activeVis = !block.activeVis;

        if (block.activeVis) {
          this.blocksState.count++;
          if (this.blocksState.count === 1)
          this.blocksState.first = block.parentContainer;
        else
        this.blocksState.second = block.parentContainer;
        blockActive.isStroked = true;
          blockActive.alpha = 1;
          this.bringToTop( block.parentContainer);
        } else if (!block.activeVis){
          this.blocksState.count--;
          blockActive.isStroked = false;
          blockActive.alpha = 0;
          this.bringToTop( block.parentContainer);
        }
        
        if (this.blocksState.count == 2) {
          this.blocks.forEach(cont => {
            cont.activeVis = false;
            cont.each(el => {
              if (el.isStroked) {
                el.alpha = 0;
                el.isStroked = false;
              }
            })
           });
           this.blocksState.count = 0;
          this.swapBlocks(this.blocksState.first, this.blocksState.second);
          
        }
      }, this);
      
  },

  check_win(forced = false) {
    let _this = this;
    if (forced === true) {
      this.removeTutorial();
      this.finalAnimation();
      setTimeout(() => {
        _this.emitter.emit('EVENT', {'event': 'LEVEL_COMPLETE'});
      }, 500);
    } else {
      let count = 0;
      this.blocks.forEach(block => {
        let {x, y} = {x: this.finalPositions[block.id].x, y: this.finalPositions[block.id].y};
        if (block.x === x && block.y === y)
          count++;
      });
      console.log(count);
      if (count === 25) {
        this.finalAnimation();
        setTimeout(() => {
          _this.emitter.emit('EVENT', {'event': 'LEVEL_COMPLETE'});
        }, 500);
      }
    }
    
  },
      
  finalAnimation() {
    let bgWin = new Phaser.GameObjects.Image(this.scene, 0, 0, this.atlas_key, 'bg1.png');
    bgWin.id = 'final';
    bgWin.setScale(this.scalablePoint);
    this.add(bgWin);
    let ring = new Phaser.GameObjects.Image(this.scene, 0, 0, this.atlas_key, 'ring.png');
    ring.id = 'final';
    ring.setScale(this.scalablePoint);
    this.add(ring);
    this.each(el => {
      if (el.id !== 'final') {
        this.bringToTop(el);
      }
    })
    this.each(el => {
      if (el.id !== 'final') {
        this.scene.tweens.add({
          targets: [el],
            ease: "Linear",
            duration: 900,
            repeat: 0,
            x: `+=${this.mainBack.width/2}`,
            onComplete: () => {
              this.scene.tweens.add({
                targets: [el],
                  ease: "Linear",
                  duration: 300,
                  repeat: 0,
                  alpha: {from: 1, to: 0},
                  onComplete: () => {
                    el.destroy();
                    this.scene.tweens.add({
                      targets: [ring],
                      ease: "Linear",
                      duration: 100,
                      repeat: 0,
                      scale: {from: this.scalablePoint, to: this.scalablePoint+0.1},
                      yoyo:true
                    });
                  }
              });
            }
        });
      }
     
    });
  },

  start_game() {
    
  },
  
  destroy_level() {
    this.each(el => {
      el.destroy();
    });
  },
});
