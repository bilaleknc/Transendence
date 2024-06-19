from django.db import models

class Game(models.Model):
    leftPaddle = models.ForeignKey('Paddle', on_delete=models.CASCADE, related_name='left_games', default=1.0)
    rightPaddle = models.ForeignKey('Paddle', on_delete=models.CASCADE, related_name='right_games', default=1.0)
    ball = models.ForeignKey('Ball', on_delete=models.CASCADE, default=1.0)
    screen = models.ForeignKey('Screen', on_delete=models.CASCADE)
    leftPlyrScore = models.IntegerField(default=0)
    rightPlyrScore = models.IntegerField(default=0)
    maxScore = models.IntegerField(default=5)
    dirX = models.FloatField(default=2.0)
    dirY = models.FloatField(default=0.0)
    speedBall = models.FloatField(default=10.0)
    speedPlayer = models.FloatField(default=30.0)
    beginPos = models.BooleanField(default=True)
    animationFlag = models.BooleanField(default=False)
    game_over = models.BooleanField(default=False)
    

class Paddle(models.Model):
    _x = models.FloatField(default=0.0)
    _y = models.FloatField(default=0.0)
    _radius = models.FloatField(default=0.0)
    end = models.FloatField(default=0.0)
    Rx = models.FloatField(default=0.0)
    Ry = models.FloatField(default=0.0)
    Rradius = models.FloatField(default=0.0)
    Rend = models.FloatField(default=0.0)

class Ball(models.Model):
    _x = models.IntegerField(default=0.0)
    _y = models.IntegerField(default=0.0)
    _radius = models.FloatField(default=0.0)
    Rx = models.FloatField(default=0.0)
    Ry = models.FloatField(default=0.0)
    

class Screen(models.Model):
    _width = models.FloatField()
    _height = models.FloatField()
    _ratio = models.FloatField()
    # methods
    def paddleHeight(self):
        return self._height / self._ratio

    def getHghtOfPdlIncLoc(self):
        return (self._height / 2) - (self.paddleHeight() / 2) 