from rest_framework import viewsets
from users.models import Person
from users.serializers import PersonSerializer
from rest_framework.response import Response

class PersonViewSet(viewsets.ModelViewSet):
    queryset = Person.objects.all()
    serializer_class = PersonSerializer
    basename = "person"

# Create your views here.
