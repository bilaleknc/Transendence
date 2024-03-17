from users.models import Person
from rest_framework import serializers


class PersonSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model=Person
        fields=('first_name', 'last_name', 'nick_name', 'mail', 'password')