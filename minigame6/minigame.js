var Museum_6 = new Phaser.Class({
  Extends: Phaser.GameObjects.Container,

  initialize: function Museum_6(scene) {
    this.scene = scene;
    Phaser.GameObjects.Container.call(this, this.scene, 0, 0);
    this.emitter = new Phaser.Events.EventEmitter();
  },

  init(params) {
    this.stickPos = new Map([
      [0, 'l'],
      [1, 'l r'],
      [2, 'r'],
      [3, 'r'],
      [4, ''],
      [5, 'r'],
      [6, 'l r'],
      [7, 'l'],
      [8, 'l'],
      [9, 'l'],
      [10, 'r'],
      [11, 'r'],
    ]);

    this.panelsInitBottom = new Map([
      [1, 'r'],
      [3, 'l r'],
      [4, 'r'],
      [7, 'r'],
      [9, 'l'],
      [10, 'l'],
    ]);

    this.panelsInitTop = new Map([
      [0, 'l'],
      [2, 'r'],
      [5, 'l'],
      [8, ''],
      [11, 'r'],
      [6, 'l r'],
    ]);

    this.count = 0;
    this.tutorial = true;
    let _this = this;
    this.globalCount = 0;
    this.atlas_key = params['atlas_key'];
	  this.width = params['w'];
    this.height = params['h'];
    this.center = new Phaser.Geom.Point(this.width / 2, this.height / 2);
    this.x += 20;
    this.moving_holder = new Phaser.GameObjects.Container(this.scene, 0, 0);
    this.scalablePoint = 0.5;
    this.targetImage = new Phaser.GameObjects.Image(this.scene, 610, 330, this.atlas_key, 'photo1.png');
    this.targetImage.setScale(.5);
    this.targetImage.alpha = 0;
    this.add(this.targetImage);
    this.case = new Phaser.GameObjects.Container(this.scene, this.center.x, this.center.y);
    this.add(this.case);
    let lock1 = new Phaser.GameObjects.Image(this.scene, 0, 0, this.atlas_key, 'lock1.png');
    lock1.setScale(this.scalablePoint);
    this.case.x -= 30;
    this.case.add(lock1);

    let lock2 = new Phaser.GameObjects.Image(this.scene, 0, 12, this.atlas_key, 'lock2.png');
    lock2.setScale(this.scalablePoint);
    this.case.add(lock2);

    this.field = new Phaser.GameObjects.Container(this.scene, this.center.x - 140, this.center.y);
    this.add(this.field);

    this.panelState = {
      count: 0
    }

    this.initialPositions = {};
    this.panels = [];
    this.sticksCont = [];

    this.sticks = [];
    let id = 0;
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 2; j++) {
        let panelCont = new Phaser.GameObjects.Container(this.scene, 0, 0);
        panelCont.left = false;
        panelCont.right = false;
        let panel = new Phaser.GameObjects.Image(this.scene, 0, 0, this.atlas_key, 'z3.png');
        panel.setScale(this.scalablePoint);
        panelCont.x = i * panel.width * (this.scalablePoint + 0.01) - 70;
        panelCont.y = j * panel.height * (this.scalablePoint + 0.01) - 50;
        panelCont.id = id;
        if (id == 1)
          this.fromItem = panelCont;
        if (id == 3)
          this.toItem = panelCont;
        panelCont.isPanel = true;

        this.panelWidth = panel.width;
        this.panelHeight = panel.height;
        panelCont.strokePanel = new Phaser.GameObjects.Graphics(this.scene, 0, 0);
        panelCont.strokePanel.lineStyle(2, 0x11cc11, 1)
        .setTexture(this.atlas_key, `z3.png`, 1)
        .strokeRect(-_this.panelWidth/2 * this.scalablePoint, -_this.panelHeight/2 * this.scalablePoint - 1, _this.panelWidth * this.scalablePoint + 1, _this.panelHeight * this.scalablePoint + 1);
        panelCont.strokePanel.isStroked = true;
        panelCont.strokePanel.id = panelCont.id;
        panelCont.strokePanel.alpha = 0;
        panelCont.add(panelCont.strokePanel);
        panelCont.add(panel);
        panelCont.each(el => {
          if (el !== panelCont.strokePanel)
          panelCont.bringToTop(el);
        });

        this.field.add(panelCont);
        this.panels.push(panelCont);
        if (this.panelsInitBottom.has(id))
        this.panelsInitBottom.get(id).split(' ').forEach(e => {
          if (e === 'l') {
            panelCont.left = true;
            panelCont.leftTube = new Phaser.GameObjects.Image(this.scene, 0, 9, this.atlas_key, 'z4.png');
            panelCont.finalAnimY = 80;
            panelCont.leftTube.x -= 18;
            panelCont.leftTube.angle += 180;
            panelCont.leftTube.setScale(this.scalablePoint);
            panelCont.add(panelCont.leftTube);
          }
          if (e === 'r') {
            panelCont.right = true;
            panelCont.rightTube = new Phaser.GameObjects.Image(this.scene, 0, 9, this.atlas_key, 'z4.png');
            panelCont.finalAnimY = 80;
            panelCont.rightTube.x += 18;
            panelCont.rightTube.angle += 180;
            panelCont.rightTube.setScale(this.scalablePoint);
            panelCont.add(panelCont.rightTube);
          }
        })

        if (this.panelsInitTop.has(id))
        this.panelsInitTop.get(id).split(' ').forEach(e => {
          if (e === 'l') {
            panelCont.left = true;
            panelCont.finalAnimY = -80;
            panelCont.leftTube = new Phaser.GameObjects.Image(this.scene, 0, -14, this.atlas_key, 'z4.png');
            panelCont.leftTube.x -= 18;
            panelCont.leftTube.setScale(this.scalablePoint);
            panelCont.add(panelCont.leftTube);
          }
          if (e === 'r') {
            panelCont.right = true;
            panelCont.finalAnimY = -80;
            panelCont.rightTube = new Phaser.GameObjects.Image(this.scene, 0, -14, this.atlas_key, 'z4.png');
            panelCont.rightTube.x += 18;
            panelCont.rightTube.setScale(this.scalablePoint);
            panelCont.add(panelCont.rightTube);
          }
        });

        let stickCont = new Phaser.GameObjects.Container(this.scene, panelCont.x, panelCont.y);
        stickCont.left = false;
        stickCont.right = false;
        this.sticksCont.push(stickCont);
        stickCont.id = id;

        this.field.add(stickCont);
        if (id%2) {
          stickCont.y += 80;
          stickCont.finalAnimY = 80;
        }
        
        else {
          stickCont.y -= 80;
          stickCont.finalAnimY = -80;
        }
        
        this.stickPos.get(id).split(' ').forEach(e => {
          if (e === 'l') {
            let leftStick = this.initStick({idType: 'left', stickX: -17, holderX: -16, shapeX: 13, stickCont, id});
          }
          if (e === 'r') {
            let rightStick = this.initStick({idType: 'right', stickX: 17, holderX: 16, shapeX: 11, stickCont, id});
          }
        });

        id++;
      }
    }

    this.panels.forEach(p => {
      this.configPanel(p);
      
    });

    this.field.each(el => {
      if (el.id === 'piston')
        this.field.bringToTop(el);
    });

    this.bringToTop(this.targetImage);
    this.sticksCont.forEach(st => {
      this.field.bringToTop(st);
    });
  },

  initStick({idType = 'right', stickX = 17, holderX = 16, shapeX = 11, stickCont, id}) {
    let stick = new Phaser.GameObjects.Image(this.scene, 0, 0, this.atlas_key, 'z2.png');
    this.sticks.push(stick);
    stick.type = 'stick';
    stick.Virg = false;
    stick.id = idType;
    stick.x = stickX;
    stick.setScale(this.scalablePoint);
    stickCont.add(stick);
    let holder = new Phaser.GameObjects.Image(this.scene, 0, 0, this.atlas_key, 'z1.png');
    holder.x = holderX;
    holder.setScale(this.scalablePoint);
    stickCont.add(holder);

    idType === 'right' ? stickCont.right = true : stickCont.left = true;

    stick.shape = this.scene.add.graphics({ fillStyle: { color: 0xFFFFFF, alpha: 0.3 } });
    let pt = this.toGlobal(stickCont, new Phaser.Geom.Point(holder.x, holder.y));
    let rect = new Phaser.Geom.Rectangle(0, 0, stick.width * this.scalablePoint, stick.height * this.scalablePoint);
    stick.shape.fillRectShape(rect);
    let mask = stick.shape.createGeometryMask();
    stick.setMask(mask);
    stick.shape.visible = false;
    if (idType == 'left') {
      stick.shape.x = pt.x + 2;
      stick.shape.y = pt.y + 60;
    }
    
    if (id%2) {
      // нижние
      stick.id = `${idType}bottom`;
      stick.finalAnimY = 80;
      holder.angle += 180;
      stick.angle += 180;
      stick.y += 30;
      stick.shape.x = pt.x - shapeX;
      let y;
      window.location.host === "127.0.0.1:8080" ? y = -108 : y = -38;
      // для серверной
      // stick.shape.y = pt.y - 38; // += 70
      stick.shape.y = pt.y + y;
    } else {
      stick.id = `${idType}top`;
      
      stick.finalAnimY = -80;
      stick.y -= 30;
      stick.shape.x = pt.x - shapeX;
      let y;
      window.location.host === "127.0.0.1:8080" ? y = -3 : y = 67;
      // для серверной
      // stick.shape.y = pt.y + 67;
      stick.shape.y = pt.y + y;
    }

    return stick;
  },

  configPanel(panel) {
    let _this = this;
    panel.state = false;
    panel.list[1].setInteractive();
    
    panel.list[1].on('pointerdown', function() {
      panel.state = !panel.state;
      this.removeTutorial();
      if (panel.state) {
        panel.state = true;
        panel.strokePanel.alpha = 1;
        _this.panelState.count++;
        if (_this.panelState.count === 1)
          _this.panelState.first = panel;
        else
          _this.panelState.second = panel;
      } else if (!panel.state) {
        panel.state = false;
        panel.strokePanel.alpha = 0;
        _this.panelState.count--;
      }
       if (_this.panelState.count == 2) {
         _this.panels.forEach(el => {
          if (el.strokePanel)
          if (el.strokePanel.isStroked) {
            el.strokePanel.alpha = 0;
          }
          el.state = false;
         });
        _this.panelState.count = 0;
        _this.swapPanels(_this.panelState.first, _this.panelState.second, function() {
          _this.moveSticks();
        });
      }
    }, this);
  },

  animateStick(target, y, yoyo, dur, callBack = function(){}) {
    this.scene.tweens.add({
      targets: [target],
          ease: "Linear",
          duration: dur,
          repeat: 0,
          y: `+=${y}`,
          yoyo: yoyo,
          scene: this.scene,
          cont: this,
          onComplete: () => {
              callBack();
          }
    });
  },

  getCountOfRightMoves() {
    let count = 0;
    this.panels.forEach(p => {
      this.sticksCont.forEach(s => {
        
        let pL;
        let sL;
        if (p.leftTube) {
          pL = this.toGlobal(p, new Phaser.Geom.Point(p.leftTube.x, p.leftTube.y));
          sL = this.toGlobal(this.field, new Phaser.Geom.Point(s.x, s.y));
        }
       
        let pR;
        let sR;
        if (p.rightTube) {
          pR = this.toGlobal(p, new Phaser.Geom.Point(p.rightTube.x, p.rightTube.y));
          sR = this.toGlobal(this.field, new Phaser.Geom.Point(s.x, s.y));
        }
        
        if (p.x === s.x && p.y > s.y && Math.abs(p.y - s.y) < 90) {
          if (p.left && s.left && Math.abs(pL.y - sL.y) < 70)
            count++;
          if (p.right && s.right && Math.abs(pR.y - sR.y) < 70)
            count++;
        }
        if (p.x === s.x && p.y < s.y && Math.abs(p.y - s.y) < 90 ) {
          if (p.left && s.left && Math.abs(pL.y - sL.y) < 72)
            count++;

          if (p.right && s.right && Math.abs(pR.y - sR.y) < 72)
            count++;

        }
      });

     
    });
    return count;
  },

  moveSticks() {
    let _this = this;
    this.count = 0;
    let pVirg = 0;
    let yoyo = true;
    this.sticksCont.forEach(s => {
      s.each(st => {
        st.Virg = false;
      });
    });
    if (this.getCountOfRightMoves() === 13)
      yoyo = false;
    else
      yoyo = true;
    this.panels.forEach(p => {
      this.sticksCont.forEach(s => {
        
        let pL;
        let sL;
        if (p.leftTube) {
          pL = this.toGlobal(p, new Phaser.Geom.Point(p.leftTube.x, p.leftTube.y));
          sL = this.toGlobal(this.field, new Phaser.Geom.Point(s.x, s.y));
        }
       
        let pR;
        let sR;
        if (p.rightTube) {
          pR = this.toGlobal(p, new Phaser.Geom.Point(p.rightTube.x, p.rightTube.y));
          sR = this.toGlobal(this.field, new Phaser.Geom.Point(s.x, s.y));
        }
        
        if (p.x === s.x && p.y > s.y && Math.abs(p.y - s.y) < 90) {
          if (p.left && s.left && Math.abs(pL.y - sL.y) < 70) {
            pVirg++;
            this.count++;
            s.each(st => {
              if (st.id === 'lefttop') {
                st.Virg = true;
                this.animateStick(st, 80, yoyo, 300);
              }
                
            });

          }
          if (p.right && s.right && Math.abs(pR.y - sR.y) < 70) {
            pVirg++
            this.count++;
            s.each(st => {
              if (st.id === 'righttop') {
                st.Virg = true;
                this.animateStick(st, 80, yoyo, 300);
              }

            });

          }
        }
        if (p.x === s.x && p.y < s.y && Math.abs(p.y - s.y) < 90 ) {
          if (p.left && s.left && Math.abs(pL.y - sL.y) < 72) {
            
            this.count++;
            s.each(st => {
              if (st.id === 'leftbottom') {
                st.Virg = true;
                this.animateStick(st, -85, yoyo, 300);
              }
                
            });
           
          }
          if (p.right && s.right && Math.abs(pR.y - sR.y) < 72) {
            this.count++;
            pVirg++
            s.each(st => {
              if (st.id === 'rightbottom') {
                st.Virg = true;
                this.animateStick(st, -85, yoyo, 300);
              }
                
            });
          
          }
        }
      });

     
    });

    this.sticks.forEach(st => {
      if (st.Virg === false && st.type === 'stick') {
        if (st.id === 'rightbottom') {
          this.animateStick(st, -15, true, 300);
        }
        else if (st.id === 'righttop') {
          this.animateStick(st, 15, true, 300);
        }
        else if (st.id === 'leftbottom') {
          this.animateStick(st, -15, true, 300);
        }
        else if (st.id === 'lefttop') {
          this.animateStick(st, 15, true, 300);
        }
      }
    });

    this.check_win();
  },

  swapPanels(first, second, callBack) {
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
              callBack.bind(_this)();
            }
      });
    }, 100);
  },

  finalAnimation(forced = false) {
    let _this = this;
    if (forced) {
      _this.scene.tweens.add({
        targets: [_this.targetImage],
              ease: "Linear",
              duration: 600,
              repeat: 0,
              alpha: {from: 0, to : 1},
              yoyo: false,
      });
    } else {
      this.panels.forEach(p => {
        setTimeout(function() {
          _this.scene.tweens.add({
            targets: [p],
                  ease: "Linear",
                  duration: 300,
                  repeat: 0,
                  y: `+=${p.finalAnimY}`,
                  yoyo: false,
                  onComplete: () => {
                    _this.scene.tweens.add({
                      targets: [p],
                            ease: "Linear",
                            duration: 300,
                            repeat: 0,
                            alpha: {from: 1, to : 0},
                            yoyo: false,
                            onComplete: () => {
                            
                            }
                    });
                  }
          });
        }, 400)
      });
      this.sticksCont.forEach(s => {
        s.each(st => {
          if (st.type === 'stick')
          setTimeout(function() {
            _this.scene.tweens.add({
              targets: [st],
                    ease: "Linear",
                    duration: 300,
                    repeat: 0,
                    y: `+=${s.finalAnimY}`,
                    yoyo: false,
                    onComplete: () => {
                      _this.scene.tweens.add({
                        targets: [st],
                              ease: "Linear",
                              duration: 300,
                              repeat: 0,
                              alpha: {from: 1, to : 0},
                              yoyo: false,
                              onComplete: () => {
                                _this.scene.tweens.add({
                                  targets: [_this.targetImage],
                                        ease: "Linear",
                                        duration: 600,
                                        repeat: 0,
                                        alpha: {from: 0, to : 1},
                                        yoyo: false,
                                        onComplete: () => {
                                          
                                        }
                                });
                              }
                      });
                    }
            });
          }, 400)
        });
        
      });
    }
    
    
  },

  start_game() {
    this.showTutorial();
  },

  check_win(forced = false) {
    let _this = this;
    if (forced == true) {
      this.finalAnimation(true);
      setTimeout(() => {
        _this.emitter.emit('EVENT', {'event': 'LEVEL_COMPLETE'});
      }, 500);
    } else {
      if (this.getCountOfRightMoves() === 13) {
        this.finalAnimation();
        setTimeout(() => {
          _this.emitter.emit('EVENT', {'event': 'LEVEL_COMPLETE'});
        }, 500);
      }
    }
  },

  destroy_level() {
    this.game = false;
    this.removeTutorial();
    this.panels.forEach(el => {
      el.list[1].removeAllListeners;
    });
    this.each(el => {
      this.remove(el);
    });
  },

  showTutorial() {
    if (this.tutorial) {
      let _this = this;
      this.tutorialHand = new Phaser.GameObjects.Image(this.scene, this.center.x - 50, this.center.y + 250, this.atlas_key, 'tut1_7.png');
      this.tutorialHand.setScale(this.scalablePoint);
      this.add(this.tutorialHand);
      
      this.tutorialAnim = this.scene.tweens.add({
        targets: [this.tutorialHand],
        ease: "Linear",
        duration: 800,
        repeat: 0,
        alpha: {from: 0, to: 1},
        y: '-=100',
        x: '-=180',
        onComplete: () => {
          let pt = this.toGlobal(this.field, new Phaser.Geom.Point(_this.fromItem.x, _this.fromItem.y));
          pt = this.toLocal(this, new Phaser.Geom.Point(pt.x, pt.y));
          this.graphicsFrom = new Phaser.GameObjects.Graphics(this.scene, 0, 0);
          this.graphicsFrom.x = pt.x - _this.panelWidth * this.scalablePoint / 2;
          this.graphicsFrom.y = pt.y - _this.panelHeight * this.scalablePoint / 2;
          this.graphicsFrom.lineStyle(2, 0xffffff, 1)
          .setTexture(this.atlas_key, `z3.png`, 1)
          .strokeRect(0, 0, _this.panelWidth * this.scalablePoint, _this.panelHeight * this.scalablePoint);
  
          this.add(this.graphicsFrom);
          _this.tutorialAnim2 =  _this.scene.tweens.add({
            targets: [this.tutorialHand],
            ease: "Linear",
            duration: 800,
            repeat: 0,
            x: '+=75',
            onComplete: () => {
            let pt = this.toGlobal(this.field, new Phaser.Geom.Point(_this.toItem.x, _this.toItem.y));
            pt = this.toLocal(this, new Phaser.Geom.Point(pt.x, pt.y));
            this.graphicsTo = new Phaser.GameObjects.Graphics(this.scene, 0, 0);
            this.graphicsTo.x = pt.x - _this.panelWidth* this.scalablePoint / 2;
            this.graphicsTo.y = pt.y - _this.panelHeight* this.scalablePoint / 2;
            this.graphicsTo.lineStyle(2, 0xffffff, 1)
            .setTexture(this.atlas_key, `z3.png`, 1)
            .strokeRect(0, 0, _this.panelWidth * this.scalablePoint, _this.panelHeight * this.scalablePoint);
            this.add(this.graphicsTo);
          _this.tutorialAnim3 = _this.scene.tweens.add({
            targets: [_this.tutorialHand],
            ease: "Linear",
            duration: 800,
            repeat: 0,
            x: '+=75',
            y: '+=75',
            alpha: {from: 1, to: 0},
            
          });
          _this.tutorialAnim4 = _this.scene.tweens.add({
            targets: [_this.graphicsFrom, _this.graphicsTo],
            ease: "Linear",
            duration: 800,
            repeat: 0,
            alpha: {from: 1, to: 0},
            onComplete: () => {
              _this.graphicsFrom.destroy();
              _this.graphicsTo.destroy();
              _this.remove(_this.graphicsFrom);
              _this.remove(_this.graphicsTo);
              setTimeout(function() {
                if (_this.tutorial)
                  _this.showTutorial();
              }, 500);
            }
          });
            }
          });
        }
      });
    }
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
    if (this.tutorialAnim3) {
      this.tutorialAnim3.stop();
      this.tutorialAnim3.remove();
    }
    if (this.tutorialAnim4) {
      this.tutorialAnim4.stop();
      this.tutorialAnim4.remove();
    }
    if (this.tutorialAnim5) {
      this.tutorialAnim5.stop();
      this.tutorialAnim5.remove();
    }
    this.tutorialHand.alpha = 0;

    if (this.graphicsFrom)
    this.graphicsFrom.destroy();
    if (this.graphicsTo)
    this.graphicsTo.destroy();

    this.remove(this.tutorialHand);
    this.tutorialHand.destroy();
    this.tutorial = false;
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
