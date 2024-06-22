from django.contrib import admin
from .views import *
from django.urls import path, re_path
from rest_framework_swagger.views import get_swagger_view
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from django_prometheus.exports import ExportToDjangoView


schema_view = get_schema_view(
    openapi.Info(
        title="Your Project API",
        default_version='v1',
        description="API documentation",
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="contact@yourproject.local"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    re_path(r'^$', schema_view.as_view(), name='schema-swagger-ui'),
    path('admin/', admin.site.urls),
	path('login_with_42', login_with_42, name='login_with_42'),
	path('login_with_google', login_with_google, name='login_with_google'),
	path('direct_42_login_page', direct_42_login_page, name='direct_42_login_page'),
	path('direct_google_login_page', direct_google_login_page, name='direct_google_login_page'),
	path('change_password', change_password, name='change_password'),
	path('register', register, name='register'),
	path('login', login, name='login'),
    path('profile', profile, name='profile'),
    path('update_profile', update_profile, name='update_profile'),
    path('member', member, name='member'),
	path('otp', otp, name='otp'),
    path('notactive', notActive, name='notActive'),
    path('verify-token', verify_token, name='verify_token'),
	path('login', login, name='login'),
    path('profile', profile, name='profile'),
    path('update_profile', update_profile, name='update_profile'),
	# path('verify_email_and_login', verify_email_and_login, name='verify_email_and_login'),
	# path('send_verification_email', send_verification_email, name='send_verification_email'),
 	re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path('metrics/', ExportToDjangoView, name='prometheus-metrics'),
]


