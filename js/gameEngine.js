var Game = function(gameName,context){
	this.sprites = [];
	this.context = context;
	this.lastTime = 0;
	//loading
	this.NUM_LOADING = 51;
	this.loadImagesPainters = [];
	//image shou
	this.imageUrls = [];
	this.images = {};
	this.imagesLoadedArr = [];
	this.imagesIndex = 0;
	this.imagesLoaded = 0;
	this.imagesFailedToLoad = 0;
	//sound
	this.soundChannels = [];
	this.NUM_SOUND_CHANNELS = 10;
	for (var i=0; i < this.NUM_SOUND_CHANNELS; ++i) {
      var audio = new Audio();
      this.soundChannels.push(audio);
   }
};
Game.prototype = {
	loadAnimator:function(fn){
		for (var i=0; i < this.NUM_LOADING; i++) {
		   this.toloadImages('images/loading_000' + i + '.jpg',fn,i);
		}
	},
	toloadImages:function(src,fn,sort){
		var image = new Image(),
			_this = this,
			loadImagew = 0,
			loadImageh = 0;
		image.src = src;
		image.setAttribute("data-sort",sort);
		image.onload = function(){
			_this.loadImagesPainters.push(this);
			_this.isloadfinish(fn,this.width);
		}
	},
	sort:function(array,data){
		array.sort(function(a,b){
			var x = a.getAttribute(data);
			var y = b.getAttribute(data);
			return x-y;
		})
		return array;
	},
	isloadfinish:function(fn,width){
		if(this.NUM_LOADING==this.loadImagesPainters.length){
			this.loadImagesPainters = this.sort(this.loadImagesPainters,"data-sort");
			fn(width);
		}
	},
	queueImage:function(imageUrl){
		this.imageUrls.push(imageUrl);
	},
	loadImages:function(){
		if(this.imagesIndex<this.imageUrls.length){
			this.loadImage(this.imageUrls[this.imagesIndex]);
			this.imagesIndex++;
		}
		this.hadfineshload = (this.imagesLoaded+this.imagesFailedToLoad)/this.imageUrls.length*100;
		return this.hadfineshload;
	},
	loadImage:function(imageUrls){
		var image = new Image(),
			_this = this;
		image.src = imageUrls;
		image.addEventListener("load",function(){
			_this.imagesLoadedArr.push(this);
			_this.imageLoadedCallback();
		});
		image.addEventListener("error",function(){
			_this.imageLoadErrorCallback(image);
		});
		this.images[imageUrls] = image;
	},
	imageLoadedCallback:function(){
		this.imagesLoaded++;
	},
	imageLoadErrorCallback:function(errorImage){
		this.imagesFailedToLoad++;
	},
	getImage:function(imageUrl){
		return this.images[imageUrl];
	},
	calculateFps:function(){
		var now = +new Date;
		var fps = 1000/ (now - this.lastTime);
		this.lastTime = now;
		return fps
	},
	start:function(){
		this.animate();
	},
	animate:function(time){
		this.clearScreen(); 
		this.updateSprites(time);
		this.paintSprites(time);
		requestAnimationFrame(this.animate);
	},
	//sprite
	addSprite:function(sprite){
		this.sprites.push(sprite);
	},
	getSprite:function(name){
		for(i in this.sprites){
			if(this.sprites[i].name === name){
				return this.sprites[i];
			}
		}
		return null;
	},
	setSprite:function(name,key,value){
		for(i in this.sprites){
			var sprite = this.sprites[i];
			if(sprite.name === name){
				for(y in sprite){
					if(key == y){
						sprite[y] = value;
					}
				}
			}
		}
	},
	delSprite:function(name){
		var num=0;
		for(i in this.sprites){
			var sprite = this.sprites[i];
			if(sprite.name === name){
				this.sprites.splice(num, 1);
			}
			num++;
		}
	},
	paintSprites:function(){
		for(var i=0;i<this.sprites.length;i++){
			var sprite = this.sprites[i];
			if(sprite.visible && sprite.paint){
				sprite.paint(this.context);
			}
		}
	},
	updateSprites:function(time){
		for(var i=0;i<this.sprites.length;i++){
			var sprite = this.sprites[i];
			if(sprite.update == undefined) continue;
			sprite.update(this.context,time);
		}
	},
	clearScreen:function(){
		this.context.clearRect(0,0,canvas.width,canvas.height);
	},
	playSound:function(dom){
		var channel = this.getAvailableSoundChannel(),
			element = document.querySelector(dom);

		if(channel && element){
			channel.src = element.src == ""?element.currentSrc:element.src;
			channel.load();
			channel.play();
			return channel;
		}

	},
	getAvailableSoundChannel:function(){
		var audio;
		for(var i=0;i<this.NUM_SOUND_CHANNELS;i++){
			audio = this.soundChannels[i];
			if(audio.played.length === 0 || audio.ended){
				return audio;
			}
		}
		return undefined;
	}
}
