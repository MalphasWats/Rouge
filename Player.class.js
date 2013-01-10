function Player(options)
{
    this.constructor(options)
    
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
	
	this.heal_counter = 0
	
	this.powers = []
	this.powers.push(this.healing_potion)
	
}
Player.prototype = new Mob({})

Player.prototype.update = function()
{
	//update power_bar
	//this.power_bar.update()
}

Player.prototype.moveToClick = function(x, y, tile_map)
{
	if (this.destination)
	{
		this.setDestination(tile_map.findPath([this.destination.x, this.destination.y], [x, y], true))
	}
	else { this.setDestination(tile_map.findPath([this.x, this.y], [x, y], true)) }
}

Player.prototype.healing_potion = function()
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

Player.prototype.mana_potion = function()
{
	this.stats.mana_points += this.dice(8)+1
	if (this.stats.mana_points > this.stats.max_mana_points)
	{
		this.stats.mana_points = this.stats.max_mana_points
	}
	return true
}

Player.prototype.slash = function()
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

Player.prototype.whirlwind = function(monsters)
{
	var mana_cost = 5
	if (this.stats.mana_points >= mana_cost)
	{
		this.stats.mana_points -= mana_cost

		var box = {x: this.x-2, y: this.y-2}
		box.rect = function() {return (new jaws.Rect(this.x, this.y, 36, 36))}
		var collisions = jaws.collideOneWithMany(box, monsters)
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

function UISpriteList()
{
	this.constructor()
	
	
}
UISpriteList.prototype = new jaws.SpriteList()

UISpriteList.prototype.update = function()
{
	for(var i=0 ; i<this.sprites.length ; i++)
	{
		this.sprites[i].update()
	}
}

UISpriteList.prototype.handleClick = function(x, y)
{
	var point = {}
	point.rect = function() {return new jaws.Rect(x, y, 1, 1)}
	var collisions = jaws.collideOneWithMany(point, this.sprites)
	if (collisions.length > 0)
	{
		var button_hit = collisions[0]
		button_hit.press()
	}
}



function Button(options)
{
    this.constructor(options)
    
    if (options.label) {this.label = options.label}
    else {this.label = ' '}
    
    if (options.cooldown) {this.cooldown = options.cooldown*60}
    else {this.cooldown = 10*60}
    this.cooldown_timer = 0
}
Button.prototype = new jaws.Sprite({})

Button.prototype.press = function()
{
	if (this.cooldown_timer == 0)
	{
		if (this.action())
		{
			this.cooldown_timer = this.cooldown
		}
	}
}

Button.prototype.action = function()
{
	return false
}

Button.prototype.update = function()
{
	if (this.cooldown_timer > 0)
    {
        this.cooldown_timer -= 1
	}
}

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
	
	jaws.context.fillStyle  = "black"
	jaws.context.fillRect(0, 0, 32, 32);
	
    this.context.drawImage(this.image, 0, 0, this.width, this.height)
    
    //
    
    
    //
    
    if (this.cooldown_timer > 0)
    {
		jaws.context.globalAlpha = 0.5
		jaws.context.fillRect(0, 0, 32, 32);
		jaws.context.globalAlpha = 1
		jaws.context.textAlign  = "center"
		jaws.context.fillStyle  = "white"
		jaws.context.font       = "bold 22px Helvetica"
        jaws.context.fillText(parseInt(this.cooldown_timer/60),16, 24)
		this.cooldown_timer -= 1
    }
    /*else
    {
        jaws.context.fillText(this.label,16, 24)
    }*/
    
    this.context.restore()
    return this
}