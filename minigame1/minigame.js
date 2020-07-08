var Wedding_1 = new Phaser.Class({
  Extends: Phaser.GameObjects.Container,

  initialize: function Wedding_1(scene) {
    this.scene = scene;
    Phaser.GameObjects.Container.call(this, this.scene, 0, 0);
    this.emitter = new Phaser.Events.EventEmitter();

  },

  check_win(forced = false) {
    this.forced = forced;
    let _this = this;
    if (forced) {
      setTimeout(() => {
        _this.items.forEach(item => {
          this.moveItemToItsPos(item);
        });
        _this.emitter.emit('EVENT', {'event': 'LEVEL_COMPLETE'});
      }, 500);
    }
    else { 
      let isWin = this.items.every(item => item.atPos);
      isWin ? 
      setTimeout(() => {
        _this.emitter.emit('EVENT', {'event': 'LEVEL_COMPLETE'});
      }, 500) : null;
    }
  },

  destroy_level() {
    this.removeAll();
    this.moving_holder ? this.moving_holder.removeAll() : null;
    this.each(el => {
      this.remove(el);
    });
  },

  start_game() {
    
  },

  addImage({x, y, name, parentCont}) {
    let image = new Phaser.GameObjects.Image(this.scene, x, y, this.atlas_key, `${name}.png`);
    image.setScale(this.scalablePoint);
    parentCont.add(image);
    return image;
  },
  
  
  initBg({x = 0, y = 0, name}) {
    let bg = new Phaser.GameObjects.Image(this.scene, x, y, this.atlas_key, `${name}.png`);
    bg.setScale(this.scalablePoint);
    this.add(bg);
    return bg;
  },

  init({ atlas_key, w, h }) {
    let _this = this;
    // moving_holder используется только для туториала
    this.moving_holder = new Phaser.GameObjects.Container(this.scene, 0, 0);
    this.add(this.moving_holder);

    this.matrix = new Map([
      [1, [-151, -149]],
      [2, [-57, -187]],
      [3, [47, -194]],
      [4, [151, -191]],
      [5, [56, -86]],
      [6, [151, -86]],
      [7, [-144, 17]],
      [8, [137, 16]],
      [9, [-17, 17]],
      [10, [-47, -83]]
    ]);

    this.atlas_key = atlas_key;
    this.width = w;
    this.height = h;
    this.center = new Phaser.Geom.Point(this.width / 2, this.height / 2);
    this.x = this.center.x;
    this.y = this.center.y;
    let shift_x = 350;
    let shift_y = 150;
    this.scalablePoint = 0.7;
    
    this.items = [];
    let items_atlas = this.scene.textures.get(this.atlas_key);
    let id = 1;

    this.bg = this.initBg({name: 'Background'});
let x = -130;
let y = 170;
this.boxY = y;
while (items_atlas.has(`item${id}.png`)) {
  let item = this.addImage({name: `item${id}`, parentCont: this, x, y});
  item.atPos = false;
  item.id = id;
  


  this.configItem(item);
  this.items.push(item);
  x+=item.width * 0.2;
  id++;
}

    this.setScale(0.7);
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

  checkItemPos(item, callback = () => {}) {
    let [x, y] = this.matrix.get(item.id);
    Math.abs(item.x - x) < 15 && Math.abs(item.y - y) < 15 ? this.moveItemToItsPos(item, callback): this.moveItemToBox(item);
  },

  addAnim({el, x = 0, y = 0, alpha = {from:1, to: 1}, callback = () => {}, callbackDelay = 0, yoyo = false, duration = 400, repeat = 0}) {
    return this.scene.tweens.add({
      targets: [el],
        ease: "Linear",
        duration: duration,
        repeat: repeat,
        alpha: {from: alpha.from, to: alpha.to},
        x: x,
        y: y,
        yoyo: yoyo,
        onComplete: () => {
          setTimeout(function(){
            callback();
          }, callbackDelay);
          
        }
          });
  },

  moveItemToBox(item) {
    this.addAnim({el: item, y: this.boxY, x: item.x});
  },

  moveItemToItsPos(item, callback = () => {}) {
    let [x, y] = this.matrix.get(item.id);
    this.addAnim({el: item, y, x, callback: () => {
      item.atPos = true;
      item.removeInteractive();
      callback();
    }});
    
  },


  configItem(item) {
    let _this = this;
    item.setInteractive({ pixelPerfect: true, draggable: true });
    item.on("drag", function (pointer, dragX, dragY) {
      let pt = this.toLocal(this, new Phaser.Geom.Point(pointer.x, pointer.y));
      let ptPrev = this.toLocal(this, new Phaser.Geom.Point(pointer.prevPosition.x, pointer.prevPosition.y));
      if (item.x >= -198 && item.x <= 198 && item.y >= -230 && item.y <= 240) {
        item.x += pt.x - ptPrev.x;
        item.y += pt.y - ptPrev.y;
      }
      else {
        if (!(item.x >= -198)) {
          item.x += 5;
        }
        if (!(item.x <= 198)) {
          item.x -= 5;
        }
        if (!(item.y >= -230)) {
          item.y += 5;
        }
        if (!(item.y <= 240)) {
          item.y -= 5;
        }
      }
      
      // _this.check_win();
    }, this);

    item.on(
      "dragstart",
      function (pointer, dragX, dragY) {
        _this.bringToTop(item);
      },
      this
    );

    item.on(
      "dragend",
      function () {
        this.checkItemPos(item, this.check_win.bind(this));
        
      },
      this
    );
  },


});
