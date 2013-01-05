function MainGameState() {
    var fps
    
    var height = 15
    var width  = 15
    
    var tile_map = [ [1,0],[1,0],[1,0],[1,0],[1,0],[1,0],[1,0],[1,4],[1,0],[1,0],[1,0],[1,0],[1,0],[1,0],[1,0],
                     [1,0],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[1,0],
                     [1,0],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[1,0],
                     [1,0],[0,5],[1,0],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[1,0],
                     [1,0],[0,5],[1,0],[1,0],[1,0],[1,0],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[1,0],
                     [1,0],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[1,0],
                     [1,0],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[1,0],
                     [1,0],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[1,0],
                     [1,0],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[1,0],
                     [1,0],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[1,0],
                     [1,0],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[1,0],
                     [1,0],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[1,4],
                     [1,0],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[1,0],
                     [1,0],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[0,5],[1,0],
                     [1,0],[1,0],[1,4],[1,0],[1,0],[1,0],[1,0],[1,0],[1,0],[1,0],[1,0],[1,0],[1,0],[1,0],[1,0],]
                
    var player
    var map
    var baddies
    
    /* Called once when a game state is activated. Use it for one-time setup code. */
    this.setup = function() 
    {
        fps = document.getElementById("fps")
        
        var sprite_sheet = new jaws.SpriteSheet({image: "tilesets/basic-32.png", frame_size: [32,32]})
        
        var walls = new jaws.SpriteList()
        var floor = new jaws.SpriteList()
        
        /* We create some 32x32 blocks and save them in array blocks */
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
        
        //player = new jaws.Sprite({image: "tilesets/player.png", x:7*32, y:7*32, anchor: "top_left"})
        player = new jaws.Sprite({image: sprite_sheet.frames[15], x:7*32, y:7*32})
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
            var baddie = baddies_map.at(x, y)
            if (baddie.length > 0)
            {
                if ( Math.abs(baddie[0].x-this.x)<=32 && Math.abs(baddie[0].y-this.y)<=32 )
                {
                    console.log("Attack!")
                }
            }
            else
            {
                this.path = floor_map.findPath([this.x, this.y], [x, y], true)
                this.setDestination()
            }
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
        baddies.push( new Sprite({image: sprite_sheet.frames[11], x: 7*32, y: 32}) )
        
        var baddies_map = new jaws.TileMap({size: [width, height], cell_size: [32,32]})
        
        baddies_map.push(baddies)
        
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

    /* update() will get called each game tick with your specified FPS. Put game logic here. */
    this.update = function()
    {
        if ( jaws.pressed("left_mouse_button") && 
            !jaws.isOutsideCanvas({x: jaws.mouse_x, y: jaws.mouse_y, width: 1, height: 1}) &&
            !player.destination )
        {
            player.moveTo(jaws.mouse_x, jaws.mouse_y)
        }
        
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

jaws.onload = function()
{
    jaws.unpack()
    jaws.assets.add(["tilesets/basic-32.png"])
    jaws.start(MainGameState)
}