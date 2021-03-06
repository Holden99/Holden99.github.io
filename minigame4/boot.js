var phaser_game;
var files_preloaded = false;
var total_errors = 0;
var game = null;


window.onload = function() {
	var config = {
		// type: Phaser.WEBGL,
		type: Phaser.AUTO,
		//type: Phaser.CANVAS,
		parent: 'phaser_game',
		width: 1200,
		height: 660,
		autoRound: true,
		render: {
			antialiasGL: false,
			clearBeforeRender: false
		},
		autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
		fullscreenTarget: 'phaser_game'
	};
	config['scene'] = mainGame;
	phaser_game = new Phaser.Game(config);
	
	window.focus();	

	var elem = document.getElementById('preload');
	if (elem) elem.style.display = 'none';
}	


class mainGame extends Phaser.Scene {
	constructor(){
		super("MainGame");
	}

	preload(){
		this.preload_files();
	}

	create_game() {		
		// this.cameras.main.setBackgroundColor('#666666');
		let cont = new Phaser.GameObjects.Container(this, 0, 0);
		this.add.existing(cont);
		this.game = new Bank_4(this);

		//old
		// this.add.existing(this.game);

		cont.add(this.game);
		this.game.init({'atlas_key': this.atlas_key, 'w': 1280, 'h': 660});
		this.game.start_game();
	}

	preload_files(on_complete){
		var _this = this;
		var episode_id = 'bank';
		var mini_name = 'minigame4';
		var atlas_key = episode_id + mini_name;
		this.atlas_key = atlas_key;
	
		this.load.atlas(atlas_key, "atlas.png" + '?' + loading_vars['version'], "atlas.json" + '?' + loading_vars['version']);
		this.load.scenePlugin('SpinePlugin', "../../external/SpinePlugin.js", 'spine_system', 'spine');
		this.load.script('script' + atlas_key, "minigame.js" + '?' + loading_vars['version']);

		this.load.on('progress', function (value) {
			if (Math.round(value * 100) == 100)
				_this.load.off('progress');
		});
		this.load.once('complete', function() {
			files_preloaded = true;
			_this.create_game();
		});
		this.load.start();
	}
	
	update(){
		this.game.mode == 'configOverlap' ?
			this.game.update() : null;
	}
}



