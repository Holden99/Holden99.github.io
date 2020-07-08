var phaser_game;
var files_preloaded = false;
var total_errors = 0;
var game = null;


window.onload = function() {
	var config = {
		//type: Phaser.WEBGL,
		type: Phaser.AUTO,
		//type: Phaser.CANVAS,
		parent: 'phaser_game',
		width: 1280,
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


class mainGame extends Phaser.Scene{
	constructor(){
		super("MainGame");
	}

	preload(){		
		this.preload_files();				
		
	}

	create_game() {		
		let cont = new Phaser.GameObjects.Container(this, 0, 0);
		this.add.existing(cont);
		this.cameras.main.setBackgroundColor('#666666');
		var game = new Golf_3(this);
		
		// this.add.existing(game);
		cont.add(game);
		game.init({'atlas_key': this.atlas_key, 'w': 1280, 'h': 660});	
		game.start_game();		
	}

	preload_files(on_complete){
		var _this = this;
		var episode_id = 'golf';
		var mini_name = 'minigame3';
		var atlas_key = episode_id + mini_name;
		this.atlas_key = atlas_key;
	
		this.load.atlas(atlas_key, "atlas.png" + '?' + loading_vars['version'], "atlas.json" + '?' + loading_vars['version']);
		this.load.scenePlugin('SpinePlugin', "../../external/SpinePlugin.js", 'spine_system', 'spine');
		//this.load.script('custom_button', "../../../../js/game_utilities/custom_button.js");
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
		if (game) game.update();
	}
}



