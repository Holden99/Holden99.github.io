var City_3 = new Phaser.Class({
  Extends: Phaser.GameObjects.Container,

  initialize: function City_3(scene) {
    this.scene = scene;
    Phaser.GameObjects.Container.call(this, this.scene, 0, 0);
    this.emitter = new Phaser.Events.EventEmitter();
    
    this.matrix = [
      {id: 18, x: 820, y: 185, overlappedPieces: [ 17,  19,  5 ]},
      { id: 15, x: 507, y: 150, overlappedPieces: [ 20,  14,  13 ], target: true },
      { id: 20, x: 641, y: 110, overlappedPieces: [ 15,  19,  14 ] },
      { id: 19, x: 726, y: 114, overlappedPieces: [ 20,  16,  18 ] },
      { id: 14, x: 576, y: 183, overlappedPieces: [ 15,  20,  19,  16,  12,  13 ] },
      { id: 13, x: 499, y: 295, overlappedPieces: [ 14,  15,  11 ] },
      { id: 10, x: 517, y: 412, overlappedPieces: [ 11,  9,  12 ] },
      { id: 9, x: 537, y: 424, overlappedPieces: [ 10,  7,  8,  6,  5,  4 ] },
      { id: 6, x: 641, y: 544, overlappedPieces: [ 7,  9,  4 ] },
      { id: 1, x: 805, y: 528, overlappedPieces: [ 3,  2 ] },
      { id: 2, x: 795, y: 390, overlappedPieces: [ 1,  4,  5,  3 ] },
      { id: 5, x: 725, y: 381, overlappedPieces: [ 9,  12,  17,  18,  2,  4 ] },
      { id: 12, x: 646, y: 287, overlappedPieces: [ 5,  9,  11,  10,  17,  16,  14 ] },
      { id: 16, x: 707, y: 219, overlappedPieces: [ 14,  12,  17,  19 ] },
      { id: 3, x: 739, y: 513, overlappedPieces: [ 1,  2,  4 ] },
      { id: 4, x: 688, y: 497, overlappedPieces: [ 3,  6,  9,  5,  2 ] },
      { id: 8, x: 512, y: 536, overlappedPieces: [ 7,  9 ] },
      { id: 7, x: 519, y: 542, overlappedPieces: [ 8,  6,  9 ] },
      { id: 11, x: 502, y: 300, overlappedPieces: [ 13,  12,  10 ] },
      { id: 17, x: 752, y: 234, overlappedPieces: [ 16,  18,  5,  12 ] },
    ];
    this.tutorial = {
      from: 4, // id
      to: 3, // id,
      finalAnim: true
    };

    this.mode = 'playGame'; // configOverlap || playGame
    this.configMode = 'setCoordinates'; // setCoordinates || setOverlap
  },

  check_win(forced = false) {
    this.forced = forced;
    let _this = this;
    if (forced) {
      this.removeAll();
      let image = new Phaser.GameObjects.Image(this.scene, this.width/2, this.height/2, this.atlas_key, 'Result.png');
      this.add(image);
      let tween = this.scene.tweens.add({
        targets: image,
        scale: { from: 1, to: 1.05 },
        ease: "Linear",
        duration: 500,
        repeat: 0,
        yoyo: true,
        onComplete: () => {
          _this.tutorial.finalAnim = false;
          let x =
            this.width / 2 -
            image.getBounds().centerX;
          let y =
            this.height / 2 -
            image.getBounds().centerY;
        }
      });
      setTimeout(() => {
        _this.emitter.emit('EVENT', {'event': 'LEVEL_COMPLETE'});
      }, 500);
    }
    else if (this.items.length === 1 && this.tutorial.finalAnim) { 
      let image = new Phaser.GameObjects.Image(this.scene, 0, 0, this.atlas_key, 'Result.png');
      image.setOrigin(0);

      let target1 = this.matrix.find((el, index) => {
        return el.target;
      }).id;

      let target2 = {};

      this.items[0].each(el => {
        if (target1 == el.id) {
          target2.x = el.x - el.width / 2;
          target2.y = el.y - el.height / 2;
          let pt = _this.toGlobal(el.parentContainer, new Phaser.Geom.Point(el.x - el.width / 2, el.y - el.height / 2));
          pt = _this.toLocal(_this, new Phaser.Geom.Point(pt.x, pt.y));

          target2.x = pt.x;
          target2.y = pt.y;
        }
      });

      image.x = target2.x;
      image.y = target2.y;
      this.items[0].removeAll();
      this.items.pop();
      this.add(image);

      let tween = this.scene.tweens.add({
        targets: image,
        scale: { from: 1, to: 1.05 },
        ease: "Linear",
        duration: 500,
        repeat: 0,
        yoyo: true,
        onComplete: () => {
          _this.tutorial.finalAnim = false;
          let x = _this.center.x - image.width / 2;
          let y = _this.center.y - image.height / 2;        
            let tween = this.scene.tweens.add({
              targets: image,
              x: x,
              y: y,
              ease: "Linear",
              duration: 1000,
              repeat: 0,
            });

        }
      });

      setTimeout(() => {
        _this.emitter.emit('EVENT', {'event': 'LEVEL_COMPLETE'});
      }, 500);
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

  init({ atlas_key, w, h }) {
    let _this = this;
    // moving_holder используется только для туториала
    this.moving_holder = new Phaser.GameObjects.Container(this.scene, 0, 0);
    this.add(this.moving_holder);

    this.atlas_key = atlas_key;
    this.width = w;
    this.height = h;
    this.center = new Phaser.Geom.Point(this.width / 2, this.height / 2);
    let shift_x = 350;
    let shift_y = 150;

    // массив items содержит информацию о кусках, которые находятся на поле. В итоге каждый раз идет проверка, и если в нем остался 1 элемент, то уровень закончен
    // Логика склейки построена так, что есть 4 случая столкновения єлемента CURRENT(кусок, который двигаем) c TARGET (кусок, к которому двигаем)
    // Current - Target
    // Image - Image (при столкновении создается контейнер, в который кидаются эти две картинки. В items теперь убираются 2 картинки и доавляется контейнер с ними)
    // Image - Container (при столкновении картинка добавялется в контейнер и удаляется с items)
    // Container - Image (при столкновении создается новый контейнер в который закидывется картинка(TARGET) и далее закидіваются другие картинки из контейнера CURRENT)
    // Container - Container (при столкновении картинки из контейнера CURRENT закидываются в контейнер TARGET. Сам CURRENT удаляется)
    this.items = [];
    let items_atlas = this.scene.textures.get(this.atlas_key);
    let id = 1;
    if (this.mode == 'playGame') {
// Рандом для того, чтоб куски летели из разных мест. Через switch устанавливем с какой стороны полетит (строка 94)
let random = new Phaser.Math.RandomDataGenerator();


this.tutorialFrom = {
  x: this.center.x + 300,
  y: this.center.y - 150
}

this.tutorialTo = {
  x: this.center.x + 300,
  y: this.center.y + 150
}

while (items_atlas.has(`${id}_1.png`)) {
  let item = new Phaser.GameObjects.Image(
    this.scene,
    this.center.x,
    this.center.y,
    this.atlas_key,
    `${id}_2.png`
  );
  item.id = id;
  
  switch (random.between(1, 4)) {
    case 1:
      item.x = -100;
      item.y = -100;
      break;
    case 2:
      item.x = this.width + 100;
      item.y = -100;
      break;
    case 3:
      item.x = -100;
      item.y = this.height + 100;
      break;
    case 4:
      item.x = this.width + 100;
      item.y = this.height + 100;
      break;
  }

  // обрабатываем нужный кусок для туториала
  if (item.id == this.tutorial.from) {
    this.fromItem = item;
    let tween = this.scene.tweens.add({
      targets: item,
      x: this.tutorialFrom.x,
      y: this.tutorialFrom.y,
      ease: "Linear",
      duration: 1000,
      repeat: 0,
    });

    this.tutorialFrom.width = item.width;
    this.tutorialFrom.height = item.height;
    
  } else if (item.id == this.tutorial.to) {
    this.toItem = item;
    let tween = this.scene.tweens.add({
      targets: item,
      x: this.tutorialTo.x,
      y: this.tutorialTo.y,
      ease: "Linear",
      duration: 1000,
      repeat: 0,
    });
    this.tutorialTo.width = item.width;
    this.tutorialTo.height = item.height;
  } else {

    // let {x, y} = this.toLocal(this, new Phaser.Geom.Point(this.center.x +  Math.random() * shift_x, this.center.y +  Math.random() * shift_y));
    let x = this.center.x -  Math.random() * shift_x;
    let y = this.center.y -  Math.random() * shift_y;
    let tween = this.scene.tweens.add({
      targets: item,
      x: x,
      y: y,
      ease: "Linear",
      duration: 1000,
      repeat: 0,
    });
  }

  this.configItem(item);
  this.items.push(item);
  this.add(item);
  id++;
}
    }
    else if (this.mode == 'configOverlap') {
      this.overlappedInfo = {
        target: null,
        overlappedPieces: []
      };
      this.state = {
        activeTarget: null,
        activeOverlapped: []
      }
      this.count = 0;
      let targetImg = new Phaser.GameObjects.Image(this.scene, this.center.x, this.center.y, this.atlas_key, 'Result.png');
      targetImg.alpha = 0.5;
      this.add(targetImg);
      while (items_atlas.has(`${id}_2.png`)) {
        let item = new Phaser.GameObjects.Image(
          this.scene,
          150,
          150,
          this.atlas_key,
          `${id}_1.png`
        );
        item.id = id;
        item.setInteractive({pixelPerfect: true, draggable: true});
        this.items.push(item);
        this.add(item);
        id++;
      }
      
      this.enter = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
      this.reset = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
      this.changeConfigMode = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
      this.left = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
      this.right = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
      this.up = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
      this.down = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
      this.movablePiece = this.items.find(el => el.id == 1);

      this.configItemOverlapMode();

      this.scene.input.keyboard.on('keydown-ONE', function () {
        if (_this.configMode == 'setOverlap') {
          _this.configMode = 'setCoordinates';
              _this.configItemOverlapMode();
            }
            else if (_this.configMode == 'setCoordinates') {
              _this.configMode = 'setOverlap';
              _this.configItemOverlapMode();
            }
    });
    this.scene.input.keyboard.on('keydown-LEFT', function() {
      _this.movablePiece.x -= 1;
    });
    this.scene.input.keyboard.on('keydown-RIGHT', function() {
      _this.movablePiece.x += 1;
    });
    this.scene.input.keyboard.on('keydown-UP', function() {
      _this.movablePiece.y -= 1;
    });
    this.scene.input.keyboard.on('keydown-DOWN', function() {
      _this.movablePiece.y += 1;
    });

    this.scene.input.keyboard.on('keydown-ENTER', function() {
      if (this.state.activeTarget != null && this.state.activeOverlapped.length != 0) {
        this.overlappedInfo.target = this.state.activeTarget.id;
        this.overlappedInfo.overlappedPieces = this.state.activeOverlapped.map(el => el.id);
        let overlappedPieces = '';
        this.overlappedInfo.overlappedPieces.forEach((el, index) => { 

          if (this.overlappedInfo.overlappedPieces.length - 1 == index) {
            overlappedPieces += ` ${el} `;
          }
          else {
            overlappedPieces += ` ${el}, `;
          }
        });

        console.log(`id: ${this.overlappedInfo.target},`, `x: ${this.state.activeTarget.x},`, `y: ${this.state.activeTarget.y},`, `overlappedPieces: [${overlappedPieces}]`);
        this.overlappedInfo.target = null;
        this.overlappedInfo.overlappedPieces = [];
        this.state.activeOverlapped.forEach(el => el.visual.destroy());
        this.state.activeOverlapped = [];
        this.state.activeTarget.visual.destroy();
        this.state.activeTarget = null;
        this.count = 0;
      }
    }, this);

    this.scene.input.keyboard.on('keydown-ESC', function() {
      if (this.state.activeTarget != null && this.state.activeOverlapped.length != 0) {
        this.overlappedInfo.target = null;
        this.overlappedInfo.overlappedPieces = [];
        this.state.activeOverlapped.forEach(el => el.visual.destroy());
        this.state.activeOverlapped = [];
        this.state.activeTarget.visual.destroy();
        this.state.activeTarget = null;
        this.count = 0;
      }
    }, this);
    }
  },

  _dragItem(pointer, gameObject, dragX, dragY) {
    gameObject.x = dragX;
    gameObject.y = dragY;
    this.movablePiece = gameObject;
  },

  _overlapHandler(pointer, gameObject) {
    if (this.state.activeTarget == gameObject) {
      
      this.state.activeTarget = null;
      gameObject.visual.destroy();
      gameObject.visual = null;
      
      this.count = 0;
    }
    else if (this.count == 0) {
        this.state.activeTarget = gameObject;
        this.count++;
        gameObject.visual = this.scene.add
            .graphics({
              x: gameObject.x - gameObject.width / 2,
              y: gameObject.y - gameObject.height / 2,
            })
            .fillStyle(0xffffff, 0.25)
            .setTexture(this.atlas_key, `${gameObject.id}_1.png`, 1)
            .fillRect(0, 0, gameObject.width, gameObject.height);
    }
    else if (this.count != 0) {
      if (!this.state.activeOverlapped.includes(gameObject)) {
        this.state.activeOverlapped.push(gameObject);
          gameObject.visual = this.scene.add
          .graphics({
            x: gameObject.x - gameObject.width / 2,
            y: gameObject.y - gameObject.height / 2,
          })
          .fillStyle(0x000000, 0.25)
          .setTexture(this.atlas_key, `${gameObject.id}_1.png`, 1)
          .fillRect(0, 0, gameObject.width, gameObject.height);
          this.count++;
      }
      else if (this.state.activeOverlapped.includes(gameObject)) {
        this.state.activeOverlapped.splice(this.state.activeOverlapped.indexOf(gameObject), 1);
        gameObject.visual.destroy();
        gameObject.visual = null;
      }
    }
  },

  configItemOverlapMode() {
    if (this.configMode == 'setCoordinates') {
      this.scene.input.on('drag', this._dragItem, this);
      this.scene.input.off('gameobjectup', this._overlapHandler, this);
    } else if (this.configMode == 'setOverlap') {
      this.scene.input.on('gameobjectup', this._overlapHandler, this);
      this.scene.input.off('drag', this._dragItem, this);
    }
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


  configItem(item) {
    let _this = this;
    item.setInteractive({ pixelPerfect: true, draggable: true });
    item.on("drag", function (pointer, dragX, dragY) {
      item.x += pointer.position.x - pointer.prevPosition.x;
      item.y += pointer.position.y - pointer.prevPosition.y;
      // _this.getOverlappedPieces(item);
      // _this.check_win();
    });

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
        this.getOverlappedPieces(item);
        this.check_win();
      },
      this
    );
  },

  configContainer(cont) {
    let _this = this;
    cont.each(item => {
      item.off('drag');
      item.off('dragstart');
      item.off('dragend');
      item.setInteractive({ draggable: true, pixelPerfect: true });
      item.on("drag", (pointer, dragX, dragY) => {
        cont.x += pointer.position.x - pointer.prevPosition.x;
        cont.y += pointer.position.y - pointer.prevPosition.y;
        // _this.getOverlappedPieces(cont);
        // _this.check_win();
      });
      item.on(
        "dragstart",
        function (pointer, dragX, dragY) {
          _this.bringToTop(cont);
        },
        this
      );
      item.on(
        "dragend",
        function (pointer, x, y, z) {
          _this.getOverlappedPieces(cont);
          _this.check_win();
        },
        this
      );
    });
  },

  checkOverlapped(item, overlappedPieces, type) {
    try {
      if (!(this.items.length === 1)) {
        let _this = this;
        let ptItem = item;
        if (item.parentContainer != this) {
          ptItem = this.toGlobal(item.parentContainer, new Phaser.Geom.Point(item.x, item.y));
        }
        let { x: currentX, y: currentY } = ptItem;
    
        overlappedPieces.forEach(id => {
          let targetElement;
          this.items.forEach(el => {
            if (el.type === "Image" && id === el.id) targetElement = el;
            else if (el.type === "Container" && !targetElement) {
              el.each(item => {
                if (id === item.id) {
                  targetElement = item;
                }
              });
            }
          });
          let { x: targetX, y: targetY } = targetElement;
  
          // я достаю картинку, не важно находится она в обычном контенйре или во вложенном(373 строка и 365). И определяю является ли она частью чего-то или сама по себе с
          // помощью свойства parentContainer. Если parentContainer == this => картинка сама по себе. Если parentContainer != this => картинка есть частью чего-то
          // Следующие 2 условных выражения написаны с целью выяснить: если картинка является частью чего-то => значит нужно перевести ее локальныые координаты
          // относительно контейнера в глобальные, относительно контейнера Motel_1
          if ( item.parentContainer == this && targetElement.parentContainer != this && targetElement.parentContainer != null &&
            item.parentContainer != null) {
            let xy = this.toGlobal(targetElement.parentContainer, new Phaser.Geom.Point(targetX, targetY));
            xy = this.toLocal(this, new Phaser.Geom.Point(xy.x, xy.y));
            targetX = xy.x;
            targetY = xy.y;
          }
    
          if ( targetElement.parentContainer != this && item.parentContainer != this && targetElement.parentContainer != null &&
            item.parentContainer != null) {
            let pt1 = this.toGlobal(targetElement.parentContainer, new Phaser.Geom.Point(targetX, targetY));
            targetX = pt1.x;
            targetY = pt1.y;
          }
    
          if ( targetElement.parentContainer == this && item.parentContainer != this && targetElement.parentContainer != null &&
            item.parentContainer != null) {
            let pt1 = this.toGlobal(this, new Phaser.Geom.Point(targetX, targetY));
    
            targetX = pt1.x;
            targetY = pt1.y;
          }
    
          // достаем координаты из конфига
          let configCurrentX, configCurrentY, configTargetX, configTargetY;
          this.matrix.forEach(el => {
            if (item.id === el.id) {
              configCurrentX = el.x;
              configCurrentY = el.y;
            }
            if (targetElement.id === el.id) {
              configTargetX = el.x;
              configTargetY = el.y;
            }
          });
      
          // проверка пересечения  текущих координат с жестко заданнымим координатами из конфига
          // и далее рассмотрены 4 случая о которых я писал в строке 71
          if (
            currentX - targetX >=
              configCurrentX - configTargetX - 10 &&
            currentX - targetX <=
              configCurrentX - configTargetX + 10 &&
            currentY - targetY >=
              configCurrentY - configTargetY - 20 &&
            currentY - targetY <=
              configCurrentY - configTargetY + 20
          ) {
            
            if ( targetElement.parentContainer == this && item.parentContainer == this &&
              targetElement.parentContainer != null &&
              item.parentContainer != null) {
              let item1 = new Phaser.GameObjects.Image(
                this.scene,
                targetElement.x - (configTargetX - configCurrentX),
                targetElement.y - (configTargetY - configCurrentY),
                this.atlas_key,
                `${item.id}_1.png`
              );
              let item2 = new Phaser.GameObjects.Image(
                this.scene,
                targetElement.x,
                targetElement.y,
                this.atlas_key,
                `${targetElement.id}_1.png`
              );
              item1.id = item.id;
              item2.id = targetElement.id;
              let cont = this.scene.add.container(0, 0, [item1, item2]);
              cont.setSize(100, 100);
              cont.setInteractive({ draggable: true });
              cont.id = `${item.id}_${targetElement.id}`;
    
              this.configContainer(cont);
    
              this.add(cont);
              let itemIndex;
              let targetIndex;
              for (let i = 0; i < this.items.length; i++) {
                if (item.id === this.items[i].id) {
                  itemIndex = i;
                }
              }
              this.items.splice(itemIndex, 1);
    
              for (let i = 0; i < this.items.length; i++) {
                if (targetElement.id === this.items[i].id) {
                  targetIndex = i;
                }
              }
    
              this.items.splice(targetIndex, 1);
              this.items.push(cont);
              this.remove(item);
              this.remove(targetElement);
            } else if ( item.parentContainer == this && targetElement.parentContainer != this &&
              targetElement.parentContainer != null &&
              item.parentContainer != null) {
              if ( !targetElement.parentContainer.id.split("_").includes(`${item.id}`) ) {
                let item1 = new Phaser.GameObjects.Image(
                  this.scene,
                  targetElement.x - (configTargetX - configCurrentX),
                  targetElement.y - (configTargetY - configCurrentY),
                  this.atlas_key,
                  `${item.id}_1.png`
                );
                item1.id = item.id;
                targetElement.parentContainer.id = `${targetElement.parentContainer.id}_${item1.id}`;
                targetElement.parentContainer.add(item1);
                
                  let itemIndex;
                  for (let i = 0; i < this.items.length; i++) {
                    if (item.id === this.items[i].id) {
                      itemIndex = i;
                    }
                  }
                this.items.splice(itemIndex, 1);
                this.remove(item);
                this.configContainer(targetElement.parentContainer);
              }
            } else if ( targetElement.parentContainer == this && item.parentContainer != this &&
              targetElement.parentContainer != null &&
              item.parentContainer != null) {
              let itemTarget = new Phaser.GameObjects.Image(
                this.scene,
                targetElement.x,
                targetElement.y,
                this.atlas_key,
                `${targetElement.id}_1.png`
              );
              itemTarget.id = targetElement.id;
              let cont = this.scene.add.container(0, 0, [itemTarget]);
              cont.setSize(100, 100);
              cont.setInteractive({ draggable: true });
              cont.id = `${item.parentContainer.id}_${targetElement.id}`;
              this.add(cont);
    
              item.parentContainer.each(el => {
                cont.add(el);
                this.matrix.forEach(matrixEl => {
                  if (matrixEl.id === el.id) {
                    el.x = targetElement.x - (configTargetX - matrixEl.x);
                    el.y = targetElement.y - (configTargetY - matrixEl.y);
                  }
                });
  
              });
    
              this.configContainer(cont);
              let itemIndex;
              for (let i = 0; i < this.items.length; i++) {
                if (item.id) {
                  itemIndex = i;
                }
              }
              this.items.splice(this.items.indexOf(item.parentContainer), 1);
              this.items.splice(this.items.indexOf(targetElement), 1);
              this.items.push(cont);
              this.remove(item);
              this.remove(targetElement);
            } else if (
              targetElement.parentContainer != this &&
              item.parentContainer != this &&
              targetElement.parentContainer != item.parentContainer &&
              targetElement.parentContainer != null &&
              item.parentContainer != null
            ) {
              if (!targetElement.parentContainer.id.split('_').includes(String(item.id))) {
                item.parentContainer.each(i => {
                  if ( !targetElement.parentContainer.id.split("_").includes(String(i.id)) ) {
     
                    let piece = new Phaser.GameObjects.Image(
                      this.scene,
                      targetElement.x,
                      targetElement.y,
                      this.atlas_key,
                      `${i.id}_1.png`
                    );
                    piece.id = i.id;
                    this.matrix.forEach(matrixEl => {
                      if ( matrixEl.id === piece.id ) {
                        piece.x = targetElement.x - (configTargetX - matrixEl.x);
                        piece.y = targetElement.y - (configTargetY - matrixEl.y);
                      }
                    });
      
                    targetElement.parentContainer.id = `${targetElement.parentContainer.id}_${i.id}`;
                    targetElement.parentContainer.add(piece);
                  }
                });
      
    
                if (this.items.includes(item.parentContainer)) {
                  this.items.splice(this.items.indexOf(item.parentContainer), 1);
                }
  
                if (this.exists(item.parentContainer)) {
                  this.remove(item.parentContainer);
                }
                if ( !this.items.includes(targetElement.parentContainer) ) {
                  this.items.push(targetElement.parentContainer);
                }
                this.configContainer(targetElement.parentContainer);
              } 
            }
          }
        });
      }
    } catch(e) {
    }
  },

  getOverlappedPieces(item) {
    let _this = this;
    let itemId;
    switch (item.type) {
      case "Image":
        itemId = item.id;
        this.matrix.forEach(el => {
          if (el.id === itemId) {
            let { overlappedPieces } = el;

            _this.checkOverlapped(item, overlappedPieces, item.type);
          }
        });
        break;
      case "Container":
        item.each(el => {
          itemId = el.id;
          this.matrix.forEach(piece => {
            if (piece.id === itemId) {
              let { overlappedPieces } = piece;

              _this.checkOverlapped(el, overlappedPieces, item.type);
            }
          });
        });
        break;
    }
  },
});
