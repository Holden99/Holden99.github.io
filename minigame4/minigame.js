var Bank_4 = new Phaser.Class({
  Extends: Phaser.GameObjects.Container,

  initialize: function Bank_4(scene) {
    this.scene = scene;
    Phaser.GameObjects.Container.call(this, this.scene, 0, 0);
    this.emitter = new Phaser.Events.EventEmitter();
    this.signsPos = [
      {x: -50, y: -150},
      {x: 33, y: -150},
      {x: 116, y: -150},
      {x: 199, y: -150},
      {x: 282, y: -150},

    ];

    this.numbersPos = [
      {x: -50, y: -44},
      {x: 33, y: -44},
      {x: 116, y: -44},
      {x: 199, y: -44},
      {x: 282, y: -44},

    ];

    this.metkaPos = [
      {x: -48, y: -210},
      {x: 33, y: -210},
      {x: 116, y: -210},
      {x: 199, y: -210},
      {x: 282, y: -210},

    ];
    this.state = {
      count: 0
    };
  },

  check_win(forced = false) {
    this.forced = forced;
    let _this = this;
    if (forced) {
      setTimeout(() => {
        _this.emitter.emit('EVENT', {'event': 'LEVEL_COMPLETE'});
      }, 500);
    }
    if (this.numberCount === 5) {
      this.buttons.forEach(b => {
        b.list[0].removeAllListeners();
      });

      this.numConts.forEach(el => {
        this.scene.tweens.add({
          targets: [el],
          ease: "Linear",
          duration: 500,
          alpha: {from: 1, to: 0},
          repeat: 0,
          onComplete: () => {
            el.destroy();
          }
        });
      });

      this.lock = new Phaser.GameObjects.Container(this.scene, this.numbersPos[2].x, this.numbersPos[2].y);
      let stick = new Phaser.GameObjects.Image(this.scene, -15, -19, this.atlas_key, 'cl9.png');
      stick.setScale(this.scalablePoint);
      
      let lock = new Phaser.GameObjects.Image(this.scene, -3, 15, this.atlas_key, 'cl1.png');
      lock.setScale(this.scalablePoint);
      this.lock.add(lock);
      this.lock.add(stick);
      this.cont.add(this.lock);
      this.lock.alpha = 0;

      this.scene.tweens.add({
        targets: [this.lock],
        ease: "Linear",
        duration: 500,
        alpha: {from: 0, to: 1},
        repeat: 0,
        onComplete: () => {
          // el.destroy();
        }
      });
      setTimeout(() => {
        _this.emitter.emit('EVENT', {'event': 'LEVEL_COMPLETE'});
      }, 500);
    }

   
     
  },

  destroy_level() {
    this.removeAll();
  },

  start_game() {
    let _this = this;


  },

  init({ atlas_key, w, h }) {
    let _this = this;
    this.moving_holder = new Phaser.GameObjects.Container(this.scene, 0, 0);
    this.add(this.moving_holder);
    this.atlas_key = atlas_key;
    let items_atlas = this.scene.textures.get(this.atlas_key);
    this.width = w;
    this.height = h;
    this.center = new Phaser.Geom.Point(this.width / 2, this.height / 2);
    this.scalablePoint = 0.7;
    this.cont = new Phaser.GameObjects.Container(this.scene, this.center.x, this.center.y);
    this.add(this.cont);

    this.signs = [];
    this.back = new Phaser.GameObjects.Image(this.scene, 0, 0, this.atlas_key, 'bg2.png');
    this.back.setScale(this.scalablePoint);
    this.cont.add(this.back);
    this.metkaConts = [];
    for (let i = 0; i < 5; i++) {
      let cont = new Phaser.GameObjects.Container(this.scene, this.metkaPos[i].x, this.metkaPos[i].y);
      this.cont.add(cont);
      this.metkaConts.push(cont);
      this.metkaConts[i].cached = false;
    }
    this.metka = new Phaser.GameObjects.Image(this.scene, 0, 0, this.atlas_key, 'metka3.png');
    this.metka.setScale(this.scalablePoint);
    this.metkaStart = this.scene.tweens.add({
      targets: [this.metka],
          ease: "Linear",
          duration: 300,
          alpha: {from: 1, to: 0},
          repeat: -1,
          yoyo: true,
          
    });
    this.metkaConts[0].add(this.metka);

    
    this.prompt = new Phaser.GameObjects.Image(this.scene, -284, 15, this.atlas_key, 'codes.png');
    this.prompt.setScale(this.scalablePoint);
    this.cont.add(this.prompt);
    this.targetPicture = this.prompt;

    this.numConts = [];
    for (let i = 0; i < 5; i++) {
      let cont = new Phaser.GameObjects.Container(this.scene, this.numbersPos[i].x, this.numbersPos[i].y);
      cont.state = false;
      this.cont.add(cont);
      this.numConts.push(cont);
    }
    let id = 1;
    this.buttons = [];
    this.gameSigns = [
      ...Phaser.Utils.Array.NumberArray(1, 5),
      ...Phaser.Utils.Array.NumberArray(7, 9)
    ];
    Phaser.Utils.Array.Shuffle(this.gameSigns);
    this.gameSigns.splice(4);
    this.gameSigns = [
      6,
      ...this.gameSigns
    ];

    this.gameSigns.forEach((id, index) => {
      let sign = new Phaser.GameObjects.Image(this.scene, 0, 0, this.atlas_key, `symb${id}.png`);
      sign.isDecrypted = false;
      sign.id = `${id}`;
      let {x, y} = this.signsPos[index];
      sign.x = x;
      sign.y = y;
      sign.setScale(this.scalablePoint);
      this.cont.add(sign);
      this.signs.push(sign);
      this.state[id] = false;
      if (id === 6) {
        this.tutorialSign = sign;
      }
    });

this.numberCount = 0;
this.metkaCount = 0;
    while (items_atlas.has(`symb${id}.png`)) {
      let button = new Phaser.GameObjects.Container(this.scene, 0, 0);
      button.state = false;
      let btn = new Phaser.GameObjects.Image(this.scene, 0, 0, this.atlas_key, 'but2.png');
      btn.id = 'passive';
      btn.setInteractive();
      let btnActive = new Phaser.GameObjects.Image(this.scene, 0, 0, this.atlas_key, 'but1.png');
      btnActive.id = 'active';
      btnActive.setInteractive();
      btnActive.setScale(this.scalablePoint);
      btnActive.alpha = 0;
      btn.setScale(this.scalablePoint);
      button.id = id;
      if (id === 6) {
        this.tutorialButton = btn;
      }
      let txt = new Phaser.GameObjects.Text(this.scene, -10, -19, `${id}`, {
        fontSize: '40px',
        color: 'black',
        fontFamily: 'sans-serif'
      });

      button.add(btn);
      button.add(btnActive);
      button.add(txt);
      switch (id) {
        case 1:
          button.x = 0 * btn.width - 25;
          button.y = btn.height - 30;
          break;
        case 2:
          button.x = 1 * btn.width - 65;
          button.y = btn.height - 30;
          break;
        case 3:
          button.x = 2 * btn.width - 108;
          button.y = btn.height - 30;
          break;
        case 4:
          button.x = 0 * btn.width - 25;
          button.y = btn.height + 32;
          break;
        case 5:
          button.x = 1 * btn.width - 65;
          button.y = btn.height + 32;
          break;
        case 6:
          button.x = 2 * btn.width - 108;
          button.y = btn.height + 32;
          break;
        case 7:
          button.x = 0 * btn.width - 25;
          button.y = btn.height + 94;
          break;
        case 8:
          button.x = 1 * btn.width - 65;
          button.y = btn.height + 94;
          break;
        case 9:
          button.x = 2 * btn.width - 108;
          button.y = btn.height + 94;
          break;
      }
      btn.on('pointerdown', function() {
          btnActive.alpha = 1;
          btn.alpha = 0;
          this.buttons.forEach(b => {
            if (b.state) {
              b.state = false;
              b.each(el => {
                if (el.id === 'active') {
                  el.alpha = 0;
                }
                if (el.id === 'passive') {
                  el.alpha = 1;
                }
              });
            }
          });
          this.metkaCount++;
          button.state = true;
          if (this.metkaCount !== 0 && this.metkaConts[this.numberCount].cached == false) {
            this.metkaConts[this.numberCount].cached == true;
            this.metkaConts[this.numberCount].removeAll();
            this.metkaFalse = new Phaser.GameObjects.Image(this.scene, 0, 0, this.atlas_key, `metka2.png`);
            this.metkaFalse.setScale(this.scalablePoint);
            this.metkaConts[this.numberCount].add(this.metkaFalse);
            this.scene.tweens.add({
              targets: [this.metkaFalse],
                  ease: "Linear",
                  duration: 300,
                  alpha: {from: 1, to: 0},
                  repeat: -1,
                  yoyo: true,
            });
          }
          this.numConts[this.numberCount].removeAll();
          this.num = new Phaser.GameObjects.Image(this.scene, 0, 0, this.atlas_key, `num${button.id}.png`);
          this.numConts[this.numberCount].x = this.numbersPos[this.numberCount].x ;
          this.numConts[this.numberCount].y = this.numbersPos[this.numberCount].y ;
          this.numConts[this.numberCount].add(this.num);

          if (+this.signs[this.numberCount].id === +button.id) {
            this.metkaConts[this.numberCount].removeAll();
            this.metkaFalse = new Phaser.GameObjects.Image(this.scene, 0, 0, this.atlas_key, `metka1.png`);
            this.metkaFalse.setScale(this.scalablePoint);
            this.metkaConts[this.numberCount].add(this.metkaFalse);
            this.numberCount++;

            if (this.numberCount < 5) {
              this.metka = new Phaser.GameObjects.Image(this.scene, 0, 0, this.atlas_key, 'metka3.png');
              this.metka.setScale(this.scalablePoint);
              this.metkaStart = this.scene.tweens.add({
                targets: [this.metka],
                    ease: "Linear",
                    duration: 300,
                    alpha: {from: 1, to: 0},
                    repeat: -1,
                    yoyo: true,
                    
              });
              this.metkaConts[this.numberCount].add(this.metka);
            }
            
          }
            
            this.check_win();
      }, this);
      this.buttons.push(button);
      this.cont.add(button);
      id++;
    }

    this.initDust();
    this.setScale(0.9);
  },

  initDust() {
    let _this = this;
    this.brushShape = new Phaser.GameObjects.Image(this.scene, 0, 0, this.atlas_key, 'brush1.png');
    this.brushShape.setScale(0.7);
    this.textures = [];

    let items_atlas = this.scene.textures.get(this.atlas_key);
    let id = 1;
    while(items_atlas.has(`dust${id}.png`)) {
      let texture = new Phaser.GameObjects.RenderTexture(this.scene, this.targetPicture.x - 110, this.targetPicture.y - 243, this.targetPicture.width + 72, this.targetPicture.height - 48);
      texture.setOrigin(0);
      texture.drawFrame(this.atlas_key, `dust${id}.png`, 0, 0);
      this.cont.add(texture);
      this.textures.push(texture);
      id++;
    }

    this.brush = new Phaser.GameObjects.Image(this.scene, 0, 0, this.atlas_key, 'brush.png');
    this.brush.setScale(0.7);
    this.brush.setInteractive();
    this.brush.alpha = 0;
    this.cont.add(this.brush);
    let hit = _this.toGlobal(this.cont, new Phaser.Geom.Point(_this.targetPicture.x, _this.targetPicture.y));
    hit = _this.toLocal(this, new Phaser.Geom.Point(hit.x, hit.y));
    this.hitCont = new Phaser.GameObjects.Container(this.scene, hit.x, hit.y);
    this.add(this.hitCont);
    
    let pt = this.toLocal(_this.cont, new Phaser.Geom.Point(_this.targetPicture.x - 21, _this.targetPicture.y));
var rect = new Phaser.Geom.Rectangle(_this.targetPicture.x + 175, _this.targetPicture.y - 350, _this.targetPicture.width + 127, _this.targetPicture.height + 80);

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
    let {x, y} = _this.toLocal(_this.cont, new Phaser.Geom.Point(pointer.x, pointer.y));
    let pt = this.toGlobal(_this.cont, new Phaser.Geom.Point(_this.targetPicture.x, _this.targetPicture.y));
        _this.brush.alpha = 1;
        _this.brush.x = x;
        _this.brush.y = y - 85; // -85
        _this.erase(_this.textures[_this.textures.length - 1], x + 360, y + 270);

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
