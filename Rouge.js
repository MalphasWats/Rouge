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
    var baddies
    
    var wall_map, floor_map

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
        
        wall_map = new jaws.TileMap({size: [width, height], cell_size: [32,32]})
        floor_map = new jaws.TileMap({size: [width, height], cell_size: [32,32]})
        
        floor_map.push(floor)
        wall_map.push(walls)
        
        player = new jaws.Sprite({image: sprite_sheet.frames[15], x:6*32, y:8*32})
        player.destination = false
        player.path = []
        player.move = function(x, y) 
        {
            this.x += x
            this.y += y
        }
        
        player.moveTo = function(x, y)
        {
            /**
              * Can't move onto an enemy square, if adjacent to enemy, attack it.
            */
            // var attacking = false
            // for(var i = 0 ; i < baddies.sprites.length ; i++)
            // {
                // if ( Math.abs(baddies.sprites[i].x-this.x)<=32 && Math.abs(baddies.sprites[i].y-this.y)<=32 )
                // {
                    // attacking = true
                    // console.log("Attack!")
                // }
            // }
            // if (!attacking)
            // {
                 this.path = floor_map.findPath([this.x, this.y], [x, y], true)
                 this.setDestination()
            // }
        }
        
        player.setDestination = function()
        {
            if (this.path.length > 0)
            {
                var next_node = this.path.shift()
                this.destination = floor_map.cell(next_node[0], next_node[1])[0]
            }
            else { this.destination = false }
        }
        
        baddies = new jaws.SpriteList()
        var baddie =  new SpriteMOB({image: sprite_sheet.frames[11], x: 7*32, y: 32})
        
        baddies.push( baddie )
        
        //var baddies_map = new jaws.TileMap({size: [width, height], cell_size: [32,32]})
        
        //baddies_map.push(baddies)
        
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
            !jaws.isOutsideCanvas({x: jaws.mouse_x, y: jaws.mouse_y, width: 1, height: 1}) &&
            !player.destination )
        {
            player.moveTo(jaws.mouse_x, jaws.mouse_y)
        }
        
                //LoS test
        baddies.sprites[0].update(wall_map, player, floor_map)
        
        //move player
        if (player.x == player.destination.x && player.y == player.destination.y)
        {
            player.setDestination()
        }
        
        if (player.destination)
        {
            if(player.x > player.destination.x)
            {
                player.move(-4, 0)
            }
            else if (player.x < player.destination.x)
            {
                player.move(4, 0)
            }
            if(player.y > player.destination.y)
            {
                player.move(0, -4)
            }
            else if (player.y < player.destination.y)
            {
                player.move(0, 4)
            }
        }
        
        fps.innerHTML = jaws.game_loop.fps
    }

    /* Directly after each update draw() will be called. Put all your on-screen operations here. */
    this.draw = function()
    {
        map.draw()
        baddies.draw()
        player.draw()
    }
}

var SpriteMOB = function SpriteMOB(options) 
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
    this.destination = false;
    this.path = []
}
SpriteMOB.prototype = new jaws.Sprite({})

SpriteMOB.prototype.update = function(tile_map, player, floor_map)
{
    if (this.checkLoS(tile_map, player))
    {
        this.path = tile_map.findPath([this.x, this.y], [player.x, player.y])
        this.path.pop()
        this.path.shift()
        if (this.path.length > 0)
        {
            var next_node = this.path.shift()
            this.destination = floor_map.cell(next_node[0], next_node[1])[0]
        }
        if (this.destination)
        {
            if (this.x == this.destination.x && this.y == this.destination.y)
            {
                if (this.path.length > 0)
                {
                    var next_node = this.path.shift()
                    this.destination = floor_map.cell(next_node[0], next_node[1])[0]
                }
                else
                {
                    this.destination = false
                }
            }
            
            if(this.x > this.destination.x)
            {
                this.move(-2, 0)
            }
            else if (this.x < this.destination.x)
            {
                this.move(2, 0)
            }
            if(this.y > this.destination.y)
            {
                this.move(0, -2)
            }
            else if (this.y < this.destination.y)
            {
                this.move(0, 2)
            }
        }
        // else
        // {
            // this.path = tile_map.findPath([this.x, this.y], [player.x, player.y])
            // this.path.pop() // last item is player's location, don't wan't to occupy same space
            //console.log(this.path)
            // if (this.path.length > 0){
            // var next_node = this.path.shift()
            // this.destination = floor_map.cell(next_node[0], next_node[1])[0]
            // }
       //}
    }
    else
    {
        this.destination = false
        this.path = []
    }
    
    
}

SpriteMOB.prototype.move = function(x, y)
{
    this.x += x
    this.y += y
}

SpriteMOB.prototype.checkLoS = function(tile_map, object)
{
    return tile_map.lineOfSight([this.x+16, this.y+16], [object.x+16, object.y+16])
}

SpriteMOB.prototype.followObject = function(object)
{
    //this.
}

jaws.onload = function()
{
    jaws.unpack()
    jaws.assets.add(["tilesets/basic-32.png"])
    jaws.start(MainGameState)
}