var Bank_3 = new Phaser.Class({
  Extends: Phaser.GameObjects.Container,

  initialize: function Bank_3(scene) {
    this.scene = scene;
    Phaser.GameObjects.Container.call(this, this.scene, 0, 0);
    this.emitter = new Phaser.Events.EventEmitter();
    
    this.matrix = [
      { id: 6, x: 491, y: 283, overlappedPieces: [ 5,  4,  7,  8 ], target:true },
      { id: 7, x: 504, y: 387, overlappedPieces: [ 5,  6,  8 ]
        },
      { id: 5, x: 446, y: 361, overlappedPieces: [ 7,  6 ]
          },
      { id: 8, x: 632, y: 387, overlappedPieces: [ 7,  6,  4,  1 ]
         },
      { id: 1, x: 766, y: 391, overlappedPieces: [ 8,  2,  3,  4 ]
         },
      { id: 2, x: 823, y: 399, overlappedPieces: [ 1,  3 ]
         },
      { id: 3, x: 819, y: 289, overlappedPieces: [ 1,  2,  4 ]
         },
      { id: 4, x: 664, y: 283, overlappedPieces: [ 3,  1,  8,  6 ] },
    ];

    this.tutorial = {
      from: 1, // id
      to: 2, // id,
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
      image.setScale(this.scalablePoint);
      this.add(image);
      let tween = this.scene.tweens.add({
        targets: image,
        scale: { from: 0.8, to: 0.85 },
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
      image.setScale(this.scalablePoint);
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
        scale: { from: 0.8, to: 0.85 },
        ease: "Linear",
        duration: 500,
        repeat: 0,
        yoyo: true,
        onComplete: () => {
          _this.tutorial.finalAnim = false;
          let x = _this.center.x - image.width * this.scalablePoint / 2;
          let y = _this.center.y - image.height * this.scalablePoint / 2;        
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
    if (this.mode == 'playGame') {

    }
  },

  init({ atlas_key, w, h }) {
    let _this = this;
    // moving_holder используется только для туториала
    this.moving_holder = new Phaser.GameObjects.Container(this.scene, 0, 0);
    this.add(this.moving_holder);
    this.scalablePoint = 0.8;
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

// this.tutorialFrom = this.toLocal(this, new Phaser.Geom.Point(this.center.x - 300, this.center.y - 150));
// this.tutorialTo = this.toLocal(this, new Phaser.Geom.Point(this.center.x - 300, this.center.y + 150));

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
  item.setScale(this.scalablePoint);
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
      let result = new Phaser.GameObjects.Image(
        this.scene,
        this.center.x,
        this.center.y,
        this.atlas_key,
        `Result.png`
      );
      result.alpha = 0.4;
      result.setScale(this.scalablePoint);
      this.add(result);
      this.overlappedInfo = {
        target: null,
        overlappedPieces: []
      };
      this.state = {
        activeTarget: null,
        activeOverlapped: []
      }
      this.count = 0;
      while (items_atlas.has(`${id}_2.png`)) {
        let item = new Phaser.GameObjects.Image(
          this.scene,
          150,
          150,
          this.atlas_key,
          `${id}_1.png`
        );
        item.id = id;
        item.setScale(this.scalablePoint);
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
              x: gameObject.x - gameObject.width * this.scalablePoint / 2,
              y: gameObject.y - gameObject.height * this.scalablePoint / 2,
            })
            .fillStyle(0xffffff, 0.25)
            .setTexture(this.atlas_key, `${gameObject.id}_1.png`, 1)
            .fillRect(0, 0, gameObject.width * this.scalablePoint, gameObject.height * this.scalablePoint);
    }
    else if (this.count != 0) {
      if (!this.state.activeOverlapped.includes(gameObject)) {
        this.state.activeOverlapped.push(gameObject);
          gameObject.visual = this.scene.add
          .graphics({
            x: gameObject.x - gameObject.width* this.scalablePoint / 2,
            y: gameObject.y - gameObject.height* this.scalablePoint / 2,
          })
          .fillStyle(0x000000, 0.25)
          .setTexture(this.atlas_key, `${gameObject.id}_1.png`, 1)
          .fillRect(0, 0, gameObject.width* this.scalablePoint, gameObject.height* this.scalablePoint);
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
              item1.setScale(this.scalablePoint);
              let item2 = new Phaser.GameObjects.Image(
                this.scene,
                targetElement.x,
                targetElement.y,
                this.atlas_key,
                `${targetElement.id}_1.png`
              );
              item2.setScale(this.scalablePoint);
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
                item1.setScale(this.scalablePoint);
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
              itemTarget.setScale(this.scalablePoint);
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
                    piece.setScale(this.scalablePoint);
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
