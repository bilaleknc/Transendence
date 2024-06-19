from django.db import models
from django.contrib.auth.models import User
from django.dispatch import receiver
import uuid
from tempfile import NamedTemporaryFile
from django.core.files import File
import urllib

class Stats(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    total_games = models.IntegerField(default=0)
    total_wins = models.IntegerField(default=0)
    total_losses = models.IntegerField(default=0)
    points = models.IntegerField(default=0)
    new_field = models.IntegerField(default=0)  # Geçici olarak ekleyin
    
    class Meta:
        db_table = 'stats'

class Profile(models.Model):
    ColorChoices = [
        ('white', 'White'),
        ('blue', 'Blue'),
        ('red', 'Red'),
        ('green', 'Green'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True)
    nickname = models.CharField(max_length=100, unique=False, blank=False, null=True)
    stats = models.OneToOneField(Stats, on_delete=models.CASCADE, null=True)
    profile_picture = models.ImageField(upload_to='profile-pictures/', default="profile-pictures/default.png")
    is_online = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    friends = models.ManyToManyField('Profile', blank=True, related_name='profile_friends')
    bio = models.TextField(blank=True, null=True, default=None)
    mmr = models.IntegerField(default=1000)
    blocked_users = models.ManyToManyField('Profile', blank=True, related_name='users_blocked')

    def __str__(self):
        return self.nickname

    def win_games(self, opponent_mmr):
        k_factor = 32
        expected_score = 1 / (1 + 10 ** ((opponent_mmr - self.mmr) / 400))
        self.mmr += k_factor * (1 - expected_score)
        self.stats.total_games += 1
        self.stats.total_wins += 1
        self.stats.save()
        self.save()

    def lose_games(self, opponent_mmr):
        k_factor = 32
        expected_score = 1 / (1 + 10 ** ((opponent_mmr - self.mmr) / 400))
        self.mmr += k_factor * (0 - expected_score)
        self.stats.total_games += 1
        self.stats.total_losses += 1
        self.stats.save()
        self.save()

    def save_image_from_url(self, url):
        img_temp = NamedTemporaryFile()
        img_temp.write(urllib.request.urlopen(url).read())
        img_temp.flush()
        self.profile_picture.save(f"{self.pk}.jpeg", File(img_temp), save=True)

    class Meta:
        db_table = 'profile'


@receiver(models.signals.m2m_changed, sender=Profile.friends.through)  # Use the receiver decorator
def update_friends(sender, instance, action, **kwargs):
    if action == 'post_add':
        for friend in kwargs['pk_set']:
            friend_profile = Profile.objects.get(pk=friend)
            friend_profile.friends.add(instance)


class VerificationCode(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=6)
    user = models.ForeignKey(Profile, on_delete=models.CASCADE)
    expired_date = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'verification_code'
    
    
    