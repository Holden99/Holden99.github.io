var Car_3 = new Phaser.Class({
  Extends: Phaser.GameObjects.Container,

  initialize: function Car_3(scene) {
    this.scene = scene;
    Phaser.GameObjects.Container.call(this, this.scene, 0, 0);
    this.emitter = new Phaser.Events.EventEmitter();
  },

  
  init(params) {
    let _this = this;
    this.tutorial = true;
    this.atlas_key = params['atlas_key'];
    this.width = params['w'];
    this.height = params['h'];
    this.center = new Phaser.Geom.Point(this.width / 2, this.height / 2);
    this.moving_holder = new Phaser.GameObjects.Container(this.scene, 0, 0);
    this.scalablePoint = 0.8;
    this.x = this.center.x;
    this.y = this.center.y;
    let items_atlas = this.scene.textures.get(this.atlas_key);
    this.bgFinal = new Phaser.GameObjects.Image(this.scene, 0, 0, this.atlas_key, 'bg0.png');
    this.bgFinal.id = 'final';
    this.bgFinal.setScale(this.scalablePoint);
    this.bg = new Phaser.GameObjects.Image(this.scene, 0, 0, this.atlas_key, 'bg0.png');
    this.bg.setScale(this.scalablePoint);
    this.add(this.bgFinal);
    this.add(this.bg);

    this.items = [];

    this.angles = [45, 90, 135, 180, 225, 270, 315];
    let id = 1;
    while(items_atlas.has(`ob${id}.png`)) {
      let item = new Phaser.GameObjects.Image(this.scene, 0, 0, this.atlas_key, `ob${id}.png`);
      item.id = id;
      item.setScale(this.scalablePoint);
      this.items.push(item);
      this.add(item);
      switch (id) {
        case 1:
          this.setItemParametres(item, -56, -143);
          break;
        case 2:
          this.setItemParametres(item, 243, 84);
          break;
        case 3:
          this.targetItem = item;
          this.setItemParametres(item, 275, -164);
          break;
        case 4:
          this.setItemParametres(item, -70, 156);
          break;
        case 5:
          this.setItemParametres(item, -225, 23);
          break;
        case 6:
          this.setItemParametres(item, -263, -110);
          break;
          case 7:
            this.setItemParametres(item, 157, -27);
            break;
          case 8:
            this.setItemParametres(item, -122, 96);
            break;
          case 9:
            this.setItemParametres(item, -283, 173);
            break;
          case 10:
            this.setItemParametres(item, 230, 183);
            break;
          case 11:
            this.setItemParametres(item, -4, 30);
            break;
          case 12:
            this.setItemParametres(item, 85, -122);
            break;
            case 13:
              this.setItemParametres(item, -107, -13);
              break;
            case 14:
              this.setItemParametres(item, -188, 167);
              break;
            case 15:
              this.setItemParametres(item, 122, 148);
              break;
            case 16:
              this.setItemParametres(item, -162, -170);
              break;
      }
      
      this.configItem(item);
      id++;
    }
  },

  setItemParametres(item, x, y) {
    item.x = x;
    item.y = y;
    item.angle += Phaser.Utils.Array.GetRandom(this.angles);
  },

  configItem(item) {
    item.setInteractive();
    item.on('pointerdown', function() {
      if (this.tutorial)
        this.removeTutorial();
      this.items.forEach(i => {
        i.removeInteractive();
      });
      this.scene.tweens.add({
          targets: [item],
          ease: "Linear",
          duration: 150,
          repeat: 0,
          angle: `+=45`,
          onComplete: () => {
            this.items.forEach(i => {
              i.setInteractive();
            });
            this.check_win();
          }
      });
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
    }
    else {
      let count = 0;
      this.items.forEach(i => {
        i.angle === 0 ? count++ : null;
      });
      if (count === this.items.length) {
        this.finalAnimation();
        setTimeout(() => {
          _this.emitter.emit('EVENT', {'event': 'LEVEL_COMPLETE'});
        }, 500);
      }
    }
   
  },

  finalAnimation() {
    let _this = this;
    this.each(el => {
      if (el.id !== 'final')
        this.scene.tweens.add({
          targets: [el],
          ease: "Linear",
          duration: 1000,
          repeat: 0,
          y: `+= 700`,
          onComplete: () => {
            this.remove(el);
            el.destroy();
          }
        });
    });
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

    if (this.tutorialHand) {
      this.remove(this.tutorialHand);
      this.tutorialHand.destroy();
    }

    if (this.graphicsTut) {
      this.remove(this.graphicsTut);
      this.graphicsTut.destroy();
    }
    this.tutorial = false;
  },

  showTutorial() {
    if (this.tutorial) {
      let _this = this;
      this.tutorialHand = new Phaser.GameObjects.Image(this.scene, this.targetItem.x - 20, this.targetItem.y + 100, this.atlas_key, 'tut1_7.png');
      this.tutorialHand.setScale(this.scalablePoint);
      this.add(this.tutorialHand);
     this.tutorialAnim = this.scene.tweens.add({
      targets: [this.tutorialHand],
      ease: "Linear",
      duration: 700,
      repeat: 0,
      alpha: {from: 0, to: 1},
      scale: {from:  this.tutorialHand.scale + 0.2, to: this.tutorialHand.scale - 0.2},
      onComplete: () => {
        this.graphicsTut = new Phaser.GameObjects.Graphics(this.scene, {
          x: this.targetItem.x,
          y: this.targetItem.y,
        });
        this.graphicsTut.lineStyle(2, 0xffffff, 1)
            .setTexture(this.atlas_key, `ob${this.targetItem.id}.png`, 1)
            .strokeCircle(0, 0, 35);
        this.add(this.graphicsTut);
        this.bringToTop(this.tutorialHand);
        setTimeout(function() {
          _this.remove(_this.graphicsTut);
          _this.graphicsTut.destroy();
          _this.tutorialAnim2 = _this.scene.tweens.add({
            targets: [_this.tutorialHand],
            ease: "Linear",
            duration: 700,
            repeat: 0,
            alpha: {from: 1, to: 0},
            scale: {from:  _this.tutorialHand.scale, to: _this.tutorialHand.scale + 0.2},
            onComplete: () => {
              setTimeout(function(){
                _this.showTutorial();
              },500)
            }
          });
        }, 400);
        
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
});
