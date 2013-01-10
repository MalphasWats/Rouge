var kills = 0
function MainGameState() {
    var fps
    
    var height = 15
    var width  = 15
    
    var tile_map = [ [1,0],[1,0],[1,0],[1,0],[1,0],[1,0],[1,0],[1,4],[1,0],[1,0],[1,0],[1,0],[1,0],[1,0],[1,0],
                     [1,0],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[1,0],
                     [1,0],[0,5],[0,5],[1,0],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[1,0],
                     [1,0],[0,5],[1,0],[1,0],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[1,0],
                     [1,0],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[1,0],
                     [1,0],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[1,0],
                     [1,0],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[1,0],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[1,0],
                     [1,0],[0,5],[0,5],[0,5],[0,5],[0,5],[1,0],[1,0],[1,0],[0,5],[0,5],[0,5],[0,5],[0,5],[1,0],
                     [1,0],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[1,0],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[1,0],
                     [1,0],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[1,0],
                     [1,0],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[1,0],
                     [1,0],[0,5],[0,5],[0,5],[0,5],[1,0],[1,0],[1,0],[1,0],[1,0],[0,5],[0,5],[0,5],[0,5],[1,4],
                     [1,0],[0,5],[0,5],[0,5],[0,5],[1,0],[0,5],[0,5],[0,5],[1,0],[0,5],[0,5],[0,5],[0,5],[1,0],
                     [1,0],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[1,0],
                     [1,0],[1,0],[1,4],[1,0],[1,0],[1,0],[1,0],[1,0],[1,0],[1,0],[1,0],[1,0],[1,0],[1,0],[1,0],]
                
    var player
    var map
    var monsters
    var powers
    
    var floor_map
    
    var spawn_timer = 0

    this.setup = function() 
    {
        kills = 0
        fps = document.getElementById("fps")
        
        var sprite_sheet = new jaws.SpriteSheet({image: "tilesets/basic-32.png", frame_size: [32,32]})
        
        var walls = new jaws.SpriteList()
        var floor = new jaws.SpriteList()
        
        for (var j=0 ; j<height; j++)
        {
            for (var i=0 ; i<width; i++)
            {
                if (i+(j*width) < tile_map.length && tile_map[i+(j*width)][0] == 1)
                {
                    walls.push( new Sprite({image: sprite_sheet.frames[tile_map[i+(j*width)][1]], x: i*32, y: j*32}) )
                }
                else
                {                
                    floor.push( new Sprite({image: sprite_sheet.frames[tile_map[i+(j*width)][1]], x: i*32, y: j*32}) )
                }
            }
        }
        
        var wall_map = new jaws.TileMap({size: [width, height], cell_size: [32,32]})
        floor_map = new jaws.TileMap({size: [width, height], cell_size: [32,32]})
        
        floor_map.push(floor)
        wall_map.push(walls)
        
        player = new Player({image: sprite_sheet.frames[15], x:6*32, y:8*32, stats:{speed:4, defence:13, attack_modifier: 1, attack_speed:1.4, max_hit_points:20}})
        console.log(player.powers)
        monsters = new jaws.SpriteList()        
        monsters.update = function()
        {
            for (var i=0 ; i<this.sprites.length ; i++)
            {
                if (this.sprites[i].stats.hit_points <= 0)
                {
                    this.remove(this.sprites[i])
                    spawn_timer -= parseInt(spawn_timer / 4)
                    kills += 1
                }
                else 
                {
                    if (this.sprites[i].attacking) {this.sprites[i].resolveAttack()}
                    
                    if (floor_map.lineOfSight([this.sprites[i].x, this.sprites[i].y], [player.x, player.y], true))
                    {
                        if (!this.sprites[i].attacking)
                        {
                            var destination = floor_map.findPath([this.sprites[i].x, this.sprites[i].y], [player.x, player.y], true)
                            destination.shift()
                            this.sprites[i].setDestination(destination)
                        }
                    }
                    else {if (this.sprites[i].destination) this.sprites[i].stop()}

                    this.sprites[i].moveToDestination()
                    var player_collide = jaws.collideOneWithOne(this.sprites[i], player)
                    if (jaws.collideOneWithMany(this.sprites[i], this.sprites).length > 0 ||
                        player_collide)
                    {
                        this.sprites[i].undoMove()
                        this.sprites[i].stop()
                        
                        if (player_collide) { this.sprites[i].setAttackTarget(player) }
                    }
                }
            }
        }
        
        monsters.spawn = function ()
        {
            var spawn_locations = [{x: 7*32, y:32}, {x: 13*32, y:11*32}, {x: 2*32, y:13*32}]
            
            for (var i=0 ; i<spawn_locations.length ; i++)
            {
                var monster =  new Mob({image: sprite_sheet.frames[11], x: spawn_locations[i].x, y: spawn_locations[i].y})
                if (jaws.collideOneWithMany(monster, this.sprites).length === 0){this.push( monster ); break;}
            }
        }
        
        monsters.spawn()
        
        jaws.context.mozImageSmoothingEnabled = false;  // non-blurry, blocky retro scaling
        jaws.preventDefaultKeys(["up", "down", "left", "right", "space"])
        
        /*
        ** Walls and floor don't change, create a single sprite to improve draw performance
        ** (very noticable on iOS)
        */
        var buffer = document.createElement('canvas')
        buffer.width = width*32
        buffer.height = height*32
        var buffer_context = buffer.getContext('2d')
        
        for (var i=0 ; i<floor.sprites.length ; i++)
        {
            buffer_context.drawImage(floor.sprites[i].image, floor.sprites[i].x, floor.sprites[i].y, 32, 32)
        }
        for (var i=0 ; i<walls.sprites.length ; i++)
        {
            buffer_context.drawImage(walls.sprites[i].image, walls.sprites[i].x, walls.sprites[i].y, 32, 32)
        }
        
        map = new Sprite({image: buffer, x:0, y:0})
        
        
        powers = new UISpriteList()
		
		var button_sheet = new jaws.SpriteSheet({image: "tilesets/spells.png", frame_size: [32,32]})
        
        var button = new Button({image: sprite_sheet.frames[0], x: 0, y: height*32})
        powers.push(button) //first button is kill count
		
		button = new Button({image: button_sheet.frames[2], x: 1*32, y: height*32, label:'S', cooldown:8})
        button.action = function() {return player.slash()}
        powers.push(button)
		
		button = new Button({image: button_sheet.frames[4], x: 2*32, y: height*32, label:'W', cooldown:25})
        button.action = function() {return player.whirlwind(monsters.sprites)}
        powers.push(button)
        
        button = new Button({image: button_sheet.frames[0], x: 8*32, y: height*32, label:'H', cooldown:35})
        button.action = function() {return player.healing_potion()}
        powers.push(button)
		
        button = new Button({image: button_sheet.frames[1], x: 9*32, y: height*32, label:'M', cooldown:90})
        button.action = function() {return player.mana_potion()}
        powers.push(button)
        
        var buffer = document.createElement('canvas')
        buffer.width = 4*32
        buffer.height = 32
        var buffer_context = buffer.getContext('2d')
        
        var health_bar = new Sprite({image: buffer, x:11*32, y:height*32})
        health_bar.max_hp = 0
        health_bar.hp = 0
        health_bar.max_mp = 0
        health_bar.mp = 0
        health_bar.draw = function()
        {
            if(!this.image) { return this }
            if(this.dom)    { return this.updateDiv() }

            this.context.save()
            this.context.translate(this.x, this.y)
            if(this.angle!=0) { jaws.context.rotate(this.angle * Math.PI / 180) }
            this.flipped && this.context.scale(-1, 1)
            this.context.globalAlpha = this.alpha
            this.context.translate(-this.left_offset, -this.top_offset) // Needs to be separate from above translate call cause of flipped
            
            jaws.context.textAlign  = "left"
            jaws.context.fillStyle  = "white"
            jaws.context.font       = "10px Helvetica";
            jaws.context.fillText("HP",0, 12)
            
            jaws.context.fillText("MP",0, 25)
            
            this.context.fillStyle = "red"
            this.context.fillRect(16, 5, this.width-20, 6)
          
            var health_width = ((this.width-20) / this.max_hp) * this.hp
            this.context.fillStyle = "green"
            this.context.fillRect(16, 5, health_width, 6)
            
            this.context.fillStyle = "red"
            this.context.fillRect(16, 18, this.width-20, 6)
          
            var mana_width = ((this.width-20) / this.max_mp) * this.mp
            this.context.fillStyle = "blue"
            this.context.fillRect(16, 18, mana_width, 6)
            
            
            this.context.restore()
            return this
        }
        
        powers.push(health_bar) //last 'button' is health/mana bar
        
    }

    this.update = function()
    {
        if (player.stats.hit_points <= 0)
        {
            jaws.switchGameState(GameOverState, {fps:60})
        }
        if (player.attacking)
        {
            player.heal_timer = 0
            player.resolveAttack()
        }
        if ( jaws.pressed("left_mouse_button") && 
            !jaws.isOutsideCanvas({x: jaws.mouse_x, y: jaws.mouse_y, width: 1, height: 1}) )
        {
            if (jaws.mouse_y >= height*32 ) {powers.handleClick(jaws.mouse_x, jaws.mouse_y)}
            else 
            {
                var point = {}
                point.rect = function() {return new jaws.Rect(jaws.mouse_x, jaws.mouse_y, 1, 1)}
                var collisions = jaws.collideOneWithMany(point, monsters)
                if (collisions.length > 0)
                {
                    if ( Math.abs(collisions[0].x-player.x)<=34 && Math.abs(collisions[0].y-player.y)<=34 )
                    {
                        player.setAttackTarget(collisions[0])
                    }
                }
                else { player.moveToClick(jaws.mouse_x, jaws.mouse_y, floor_map) }
            }
        }
        
        monsters.update()
        player.moveToDestination()
        
        if (player.heal_timer / 60 >= 8)
        {
            player.heal(3)
            
            player.regen(4)
            player.heal_timer = 0
        }
        else {player.heal_timer += 1}
        
        if (spawn_timer / 60 > 20)
        {
            var spawn_count = player.dice(3)
            
            for (var i=0 ; i<spawn_count ; i++)
            {
                monsters.spawn()
            }
            
            spawn_timer = 0
        }
        else {spawn_timer += 1}
		
		player.update()
        
        powers.sprites[0].label = kills
        powers.sprites[powers.sprites.length-1].max_hp = player.stats.max_hit_points
        powers.sprites[powers.sprites.length-1].hp = player.stats.hit_points
        powers.sprites[powers.sprites.length-1].max_mp = player.stats.max_mana_points
        powers.sprites[powers.sprites.length-1].mp = player.stats.mana_points
        
        fps.innerHTML = jaws.game_loop.fps
    }

    /* Directly after each update draw() will be called. Put all your on-screen operations here. */
    this.draw = function()
    {
        map.draw()
        monsters.draw()
        player.draw()
        
        /* Draw Action Bar */
        powers.draw()
    }
}

function GameOverState()
{
    this.update = function()
    {
        if ( jaws.pressed("left_mouse_button") )
        {
            jaws.switchGameState(MainGameState, {fps: 60})
        }
    }
    
    this.draw = function()
    {
        jaws.context.save()
        jaws.context.fillStyle  = "black"
        jaws.context.fillRect(0, 0, jaws.width, jaws.height);
        jaws.context.textAlign  = "center"
        jaws.context.fillStyle  = "white"
        jaws.context.font       = "bold 30px Helvetica";
        jaws.context.fillText("You Died",jaws.width/2, jaws.height/2);
        jaws.context.fillText(kills+" kills",jaws.width/2, jaws.height/2+40);
        jaws.context.font       = "16px Helvetica";
        jaws.context.fillText("Click to try again",jaws.width/2, jaws.height/2+100);
        jaws.context.restore()
    }
}


jaws.onload = function()
{
    jaws.unpack()
    jaws.assets.add(["tilesets/basic-32.png", "tilesets/spells.png"])
    jaws.start(MainGameState, {fps: 60})
}