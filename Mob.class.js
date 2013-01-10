function Mob(options)
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

function StatBlock(stats)
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