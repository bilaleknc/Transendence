from django.db import models

class Person(models.Model):
    first_name = models.CharField(max_length=25)
    last_name = models.CharField(max_length=25)
    nick_name = models.CharField(max_length=25, null=True, unique=True)
    mail = models.CharField(max_length=25, null=True, unique=True)
    password = models.CharField(max_length=25, null=True)

    def __str__(self) -> str:
        return self.first_name
    
    def __str__(self) -> str:
        return self.last_name
    
    def __str__(self) -> str:
        return self.nick_name
    
    def __str__(self) -> str:
        return self.mail
    
    def __str__(self) -> str:
        return self.password
# Create your models here.
