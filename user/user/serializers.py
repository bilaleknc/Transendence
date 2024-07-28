import uuid
import random
import re
import string
from rest_framework import serializers
from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework.validators import UniqueValidator
from user.models import Profile
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data.update({'user': self.user.username})
        return data

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=6, max_length=68)
    password2 = serializers.CharField(write_only=True, required=True, min_length=6, max_length=68)
    email = serializers.EmailField(required=True, validators=[
        UniqueValidator(queryset=User.objects.all(), message='This email address is already in use.')
    ])

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})

        # Şifre karmaşıklık kontrolü
        password = attrs['password']
        if not re.search(r'[A-Z]', password):
            raise serializers.ValidationError({"password": "Password must contain at least one uppercase letter."})
        if not re.search(r'[a-z]', password):
            raise serializers.ValidationError({"password": "Password must contain at least one lowercase letter."})
        if not re.search(r'[0-9]', password):
            raise serializers.ValidationError({"password": "Password must contain at least one digit."})
        if not re.search(r'[\W_]', password):  # Alphanumeric dışındaki karakterler için
            raise serializers.ValidationError({"password": "Password must contain at least one special character."})
        
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        user.is_active = False 
        user.save()
        nickname = validated_data['username']
        while Profile.objects.filter(nickname=nickname).exists():
            suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=4))
            nickname = f"{validated_data['username']}{suffix}"
        profile, created = Profile.objects.get_or_create(
            user=user,
            defaults={'nickname': validated_data['username']}
        )
        if not created:
            profile.nickname = nickname
            profile.save()
        return user

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, required=True, min_length=6, max_length=68)
    new_password2 = serializers.CharField(write_only=True, required=True, min_length=6, max_length=68)

    class Meta:
        model = User
        fields = ('old_password', 'new_password', 'new_password2')

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({"new_password": "Password fields didn't match."})
        
        # Şifre karmaşıklık kontrolü
        password = attrs['new_password']
        if not re.search(r'[A-Z]', password):
            raise serializers.ValidationError({"new_password": "Password must contain at least one uppercase letter."})
        if not re.search(r'[a-z]', password):
            raise serializers.ValidationError({"new_password": "Password must contain at least one lowercase letter."})
        if not re.search(r'[0-9]', password):
            raise serializers.ValidationError({"new_password": "Password must contain at least one digit."})
        if not re.search(r'[\W_]', password):
            raise serializers.ValidationError({"new_password": "Password must contain at least one special character."})
        
        return attrs

class RegisterWith42Serializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.EmailField(required=True, validators=[
        UniqueValidator(queryset=User.objects.all())
    ])

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
        )
        nickname = validated_data['username']
        while Profile.objects.filter(nickname=nickname).exists():
            suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=4))
            nickname = f"{validated_data['username']}{suffix}"
        profile, created = Profile.objects.get_or_create(
            user=user,
            nickname=validated_data['username'],
        )
        if not created:
            profile.nickname = nickname
            profile.save()
        return user
