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
    
    //var wall_map, floor_map

    this.setup = function() 
    {
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
        var floor_map = new jaws.TileMap({size: [width, height], cell_size: [32,32]})
        
        floor_map.push(floor)
        wall_map.push(walls)
        
        player = new Mob({image: sprite_sheet.frames[15], x:6*32, y:8*32, speed:4})
        
        player.moveToClick = function(x, y)
        {
            var destination
            if (this.destination)
            {
                this.setDestination(floor_map.findPath([this.destination.x, this.destination.y], [x, y], true))
            }
            else { this.setDestination(floor_map.findPath([this.x, this.y], [x, y], true)) }
        }
        
        monsters = new jaws.SpriteList()
        var monster =  new Mob({image: sprite_sheet.frames[11], x: 7*32, y: 32})
        
        monsters.push( monster )
        
        monster =  new Mob({image: sprite_sheet.frames[11], x: 13*32, y: 11*32})
        monsters.push( monster )
        
        monsters.update = function()
        {
            for (var i=0 ; i<this.sprites.length ; i++)
            {
                if (wall_map.lineOfSight([this.sprites[i].x, this.sprites[i].y], [player.x, player.y]))
                {
                    var destination = floor_map.findPath([this.sprites[i].x, this.sprites[i].y], [player.x, player.y], true)
                    destination.shift()
                    this.sprites[i].setDestination(destination)
                }
                else {if (this.sprites[i].destination) this.sprites[i].stop()}
                
                this.sprites[i].moveToDestination()
                if (jaws.collideOneWithMany(this.sprites[i], this.sprites).length > 0 ||
                    jaws.collideOneWithOne(this.sprites[i], player))
                {
                    this.sprites[i].undoMove()
                    this.sprites[i].stop()
                }
                
            }
        }
        
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
    }

    this.update = function()
    {
        if ( jaws.pressed("left_mouse_button") && 
            !jaws.isOutsideCanvas({x: jaws.mouse_x, y: jaws.mouse_y, width: 1, height: 1}) )/*&&
            !player.destination )*/
        {
            var point = {}
            point.rect = function() {return new jaws.Rect(jaws.mouse_x, jaws.mouse_y, 1, 1)}
            var collisions = jaws.collideOneWithMany(point, monsters)
            if (collisions.length > 0)
            {
                if ( Math.abs(collisions[0].x-player.x)<=34 && Math.abs(collisions[0].y-player.y)<=34 )
                {
                    console.log("Attack!")
                }
            }
            else { player.moveToClick(jaws.mouse_x, jaws.mouse_y) }
        }
        
        monsters.update()
        player.moveToDestination()
        
        fps.innerHTML = jaws.game_loop.fps
    }

    /* Directly after each update draw() will be called. Put all your on-screen operations here. */
    this.draw = function()
    {
        map.draw()
        monsters.draw()
        player.draw()
    }
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
    if (options.speed) {this.speed = options.speed}
    else {this.speed = 2}
    
    this.destination = false;
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
        
        if(this.x > this.destination.x)
        {
            this.move(-this.speed, 0)
        }
        else if (this.x < this.destination.x)
        {
            this.move(this.speed, 0)
        }
        if(this.y > this.destination.y)
        {
            this.move(0, -this.speed)
        }
        else if (this.y < this.destination.y)
        {
            this.move(0, this.speed)
        }
    }
}


jaws.onload = function()
{
    jaws.unpack()
    jaws.assets.add(["tilesets/basic-32.png"])
    jaws.start(MainGameState)
}