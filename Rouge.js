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
        
        player = new Mob({image: sprite_sheet.frames[15], x:6*32, y:8*32, stats:{speed:4, defence:13, attack_modifier: 1, attack_speed:1.4, max_hit_points:20}})
        player.moveToClick = function(x, y)
        {
            if (this.destination)
            {
                this.setDestination(floor_map.findPath([this.destination.x, this.destination.y], [x, y], true))
            }
            else { this.setDestination(floor_map.findPath([this.x, this.y], [x, y], true)) }
        }
        player.heal_counter = 0
        player.healing_potion = function()
        {
            var mana_cost = 4
            
            if (this.stats.mana_points >= mana_cost)
            {
                this.stats.mana_points -= mana_cost
                this.heal(this.dice(6))
                return true
            }
            else {return false}
        }
        
        player.mana_potion = function()
        {
            this.stats.mana_points += this.dice(8)+1
            if (this.stats.mana_points > this.stats.max_mana_points)
            {
                this.stats.mana_points = this.stats.max_mana_points
            }
            return true
        }
        
        player.slash = function()
        {
            var mana_cost = 2
            
            if (this.stats.mana_points >= mana_cost)
            {
                this.stats.mana_points -= mana_cost
                this.makeAttack(4, 2, 1)
                return true
            }
            else {return false}
        }
        
        player.whirlwind = function()
        {
            var mana_cost = 5
            if (this.stats.mana_points >= mana_cost)
            {
                this.stats.mana_points -= mana_cost

                var box = {x: this.x-2, y: this.y-2}
                box.rect = function() {return (new jaws.Rect(this.x, this.y, 36, 36))}
                var collisions = jaws.collideOneWithMany(box, monsters.sprites)
                var attacking = this.attacking
                for (var i=0 ; i<collisions.length ; i++)
                {
                    this.attacking = collisions[i]
                    this.makeAttack(4, 1, 5)
                    this.makeAttack(4, 1, 3)
                }
                this.attacking = attacking
                return true
            }
            else { return false }
        }
        
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
        
        
        powers = new jaws.SpriteList()
        powers.handleClick = function(x, y)
        {
            var point = {}
            point.rect = function() {return new jaws.Rect(x, y, 1, 1)}
            var collisions = jaws.collideOneWithMany(point, this.sprites)
            if (collisions.length > 0)
            {
                var button_hit = collisions[0]
                if (button_hit.cooldown_timer == 0)
                {
                    if (button_hit.action())
                    {
                        button_hit.cooldown_timer = button_hit.cooldown
                    }
                }
            }
        }
        
        var button = new Button({image: sprite_sheet.frames[0], x: 0, y: height*32})
        powers.push(button) //first button is kill count
        
        button = new Button({image: sprite_sheet.frames[0], x: 5*32, y: height*32, label:'H', cooldown:35})
        button.action = function() {return player.healing_potion()}
        powers.push(button)
        button = new Button({image: sprite_sheet.frames[0], x: 6*32, y: height*32, label:'M', cooldown:90})
        button.action = function() {return player.mana_potion()}
        powers.push(button)
        button = new Button({image: sprite_sheet.frames[0], x: 7*32, y: height*32, label:'S', cooldown:8})
        button.action = function() {return player.slash()}
        powers.push(button)
        button = new Button({image: sprite_sheet.frames[0], x: 8*32, y: height*32, label:'W', cooldown:25})
        button.action = function() {return player.whirlwind()}
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
                else { player.moveToClick(jaws.mouse_x, jaws.mouse_y) }
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

var StatBlock = function StatsBlock(stats)
{   
    if (stats.speed) {this.speed = stats.speed}
    else { this.speed = 2 }
    
    if (stats.defence) {this.defence = stats.defence}
    else { this.defence = 10 }
    
    if (stats.max_hit_points) {this.max_hit_points = stats.max_hit_points}
    else { this.max_hit_points = 12 ; }
    this.hit_points = this.max_hit_points
    
    if (stats.max_mana_points) {this.max_mana_points = stats.max_mana_points}
    else { this.max_mana_points = 20 ; }
    this.mana_points = this.max_mana_points
    
    if (stats.attack_modifier) {this.attack_modifier = stats.attack_modifier}
    else { this.attack_modifier = 0 }
    
    if (stats.attack_speed) {this.attack_speed = stats.attack_speed}
    else { this.attack_speed = 2 }
    
    if (stats.attack_damage) {this.attack_damage = stats.attack_damage}
    else { this.attack_damage = 4 }
}

var Mob = function Mob(options)
{
    if( !(this instanceof arguments.callee) ) return new arguments.callee( options );

    this.options = options
    this.set(options)
    
    if(options.context) { 
        this.context = options.context
    }
    else if(options.dom) {  // No canvas context? Switch to DOM-based spritemode
        this.dom = options.dom
        this.createDiv() 
    }
    if(!options.context && !options.dom) {                  // Defaults to jaws.context or jaws.dom
        if(jaws.context)  this.context = jaws.context;
        else {
            this.dom = jaws.dom;
            this.createDiv() 
        }
    }
    
    if (options.stats) {this.stats = new StatBlock(options.stats)}
    else 
    {
        this.stats = new StatBlock({})
    }
    this.attacking = false
    this.attack_timer = 0
    
    this.destination = false
    this.path = []
    
    this.last_dx = 0
    this.last_dy = 0
}
Mob.prototype = new jaws.Sprite({})

Mob.prototype.move = function(dx, dy)
{
    this.x += dx
    this.y += dy
    
    this.last_dx = dx
    this.last_dy = dy
    
    this.attacking = false
}

Mob.prototype.undoMove = function()
{
    //console.log(this.last_dx, this.last_dy)
    this.x -= this.last_dx
    this.y -= this.last_dy
    
    this.last_dx = 0
    this.last_dy = 0
}

Mob.prototype.stop = function()
{
    this.path = []
    if (this.attacking) {this.destination = false}
}

Mob.prototype.heal = function(hp)
{
    this.stats.hit_points += hp
    if (this.stats.hit_points > this.stats.max_hit_points)
    {
        this.stats.hit_points = this.stats.max_hit_points
    }
}

Mob.prototype.regen = function(mp)
{
    this.stats.mana_points += mp
    if (this.stats.mana_points > this.stats.max_mana_points)
    {
        this.stats.mana_points = this.stats.max_mana_points
    }
}

Mob.prototype.setAttackTarget = function(mob)
{
    this.attacking = mob
}

Mob.prototype.resolveAttack = function()
{
    if (parseInt(this.attack_timer / this.stats.attack_speed) >= 60)
    {
        this.makeAttack(this.stats.attack_damage, 0, 0)
        this.attack_timer = 0
    }
    else { this.attack_timer += 1 }
}

Mob.prototype.makeAttack = function(damage_die, damage_bonus, to_hit_bonus)
{
    if ( Math.abs(this.attacking.x-this.x)>34 || Math.abs(this.attacking.y-this.y)>34 || !this.attacking)
    {
        attacking = false
        this.attack_timer = 0
        return
    }
    
    var attack = this.dice(20) + this.stats.attack_modifier + to_hit_bonus
    if (attack >= this.attacking.stats.defence)
    {
        //trigger target to attack back if not already attacking something
        if (!this.attacking.attacking) { this.attacking.attacking = this }
        var damage = this.dice(damage_die) + damage_bonus
        
        this.attacking.stats.hit_points -= damage
        if (this.attacking.stats.hit_points <= 0)
        {
            this.attacking = false
        }
        return true
    }
    else {return false/* miss */}
}

Mob.prototype.setDestination = function(path)
{
    this.path = path
    this.destination = this.path.shift()
}

Mob.prototype.moveToDestination = function()
{
    if (this.destination)
    {
        if (this.x == this.destination.x && this.y == this.destination.y)
        {
            if (this.path.length > 0)
            {
                this.destination = this.path.shift()
            }
            else
            {
                this.destination = false
            }
        }
        var dx = 0
        var dy = 0
        if(this.x > this.destination.x)
        {
            dx = -this.stats.speed
            //this.move(-this.speed, 0)
        }
        else if (this.x < this.destination.x)
        {
            dx = this.stats.speed
            //this.move(this.speed, 0)
        }
        if(this.y > this.destination.y)
        {
            dy = -this.stats.speed
            //this.move(0, -this.speed)
        }
        else if (this.y < this.destination.y)
        {
            dy = this.stats.speed
            //this.move(0, this.speed)
        }
        this.move(dx, dy)
    }
}

Mob.prototype.dice = function(d)
{
    return Math.floor(Math.random()*(d)+1)
}

Mob.prototype.draw = function() {
  if(!this.image) { return this }
  if(this.dom)    { return this.updateDiv() }

  this.context.save()
  this.context.translate(this.x, this.y)
  if(this.angle!=0) { jaws.context.rotate(this.angle * Math.PI / 180) }
  this.flipped && this.context.scale(-1, 1)
  this.context.globalAlpha = this.alpha
  this.context.translate(-this.left_offset, -this.top_offset) // Needs to be separate from above translate call cause of flipped
  this.context.drawImage(this.image, 0, 0, this.width, this.height)
  
  this.context.fillStyle = "red"
  this.context.fillRect(4, 0, this.width-8, 3)
  
  var health_width = ((this.width-8) / this.stats.max_hit_points) * this.stats.hit_points
  this.context.fillStyle = "green"
  this.context.fillRect(4, 0, health_width, 3)
  
  
  this.context.restore()
  return this
}


var Button = function Button(options)
{
    if( !(this instanceof arguments.callee) ) return new arguments.callee( options );

    this.options = options
    this.set(options)
    
    if(options.context) { 
        this.context = options.context
    }
    else if(options.dom) {  // No canvas context? Switch to DOM-based spritemode
        this.dom = options.dom
        this.createDiv() 
    }
    if(!options.context && !options.dom) {                  // Defaults to jaws.context or jaws.dom
        if(jaws.context)  this.context = jaws.context;
        else {
            this.dom = jaws.dom;
            this.createDiv() 
        }
    }
    
    if (options.label) {this.label = options.label}
    else {this.label = 'X'}
    
    if (options.cooldown) {this.cooldown = options.cooldown*60}
    else {this.cooldown = 10*60}
    this.cooldown_timer = 0
}
Button.prototype = new jaws.Sprite({})

Button.prototype.draw = function()
{
    if(!this.image) { return this }
    if(this.dom)    { return this.updateDiv() }

    this.context.save()
    this.context.translate(this.x, this.y)
    if(this.angle!=0) { jaws.context.rotate(this.angle * Math.PI / 180) }
    this.flipped && this.context.scale(-1, 1)
    this.context.globalAlpha = this.alpha
    this.context.translate(-this.left_offset, -this.top_offset) // Needs to be separate from above translate call cause of flipped
    this.context.drawImage(this.image, 0, 0, this.width, this.height)
    
    jaws.context.fillStyle  = "black"
    //jaws.context.globalAlpha = 0.5
    jaws.context.fillRect(5, 5, 22, 22);
    jaws.context.textAlign  = "center"
    jaws.context.fillStyle  = "white"
    jaws.context.font       = "bold 22px Helvetica"
    //jaws.context.globalAlpha = 1
    
    if (this.cooldown_timer > 0)
    {
        this.cooldown_timer -= 1
        jaws.context.fillText(parseInt(this.cooldown_timer/60),16, 24)
    }
    else
    {
        jaws.context.fillText(this.label,16, 24)
    }
    
    this.context.restore()
    return this
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
    jaws.assets.add(["tilesets/basic-32.png"])
    jaws.start(MainGameState, {fps: 60})
}