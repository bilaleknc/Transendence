import uuid
import random
import string
from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework.validators import UniqueValidator
from user.models import Profile, Stats




class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name']



class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        min_length=6,
        max_length=68
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        min_length=6,
        max_length=68
    )
    email = serializers.EmailField(
        required=True,
        validators=[
            UniqueValidator(queryset=User.objects.all(), message='This email address is already in use.')
        ]
    )

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
        )
        user.set_password(validated_data['password'])
        user.save()

        
        nickname = validated_data['username']
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!! ", nickname)
        
        while Profile.objects.filter(nickname=nickname).exists():
            suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=4))
            nickname = f"{validated_data['username']}{suffix}"
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!! ", nickname)
        profile, created = Profile.objects.get_or_create(
			user=user,
			defaults={'nickname': validated_data['username']}
		)
        if not created:
            profile.nickname = nickname
            profile.save()

        return user

 
class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(
        write_only=True,
        required=True
    )
    new_password = serializers.CharField(
        write_only=True,
        required=True,
        min_length=6,
        max_length=68
    )
    new_password2 = serializers.CharField(
        write_only=True,
        required=True,
        min_length=6,
        max_length=68
    )

    class Meta:
        model = User
        fields = ('old_password', 'new_password', 'new_password2')

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({"new_password": "Password fields didn't match."})

        return attrs


class RegisterWith42Serializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )

    class Meta:
        model = User
        fields = ('username', 'email')

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
        )
        user.set_password(str(uuid.uuid1()))
        user.save()

        profile = Profile.objects.create(
            user=user,
            nickname=validated_data['username'],
            stats=Stats.objects.create(total_games=0, total_wins=0, total_losses=0, points=0)
        )
        nickname = validated_data['username']
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!! ", nickname)
        
        while Profile.objects.filter(nickname=nickname).exists():
            suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=4))
            nickname = f"{validated_data['username']}{suffix}"
        profile, created = Profile.objects.get_or_create(
			user=user,
            nickname=validated_data['username'],
            stats=Stats.objects.create(total_games=0, total_wins=0, total_losses=0, points=0)
		)
        if not created:
            profile.nickname = nickname
            profile.save()

        return user
