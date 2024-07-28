from rest_framework.views import exception_handler

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        if response.status_code == 401:
            response.data = {
                'error': 'Invalid or expired token. Please login again.'
            }
            print("unauth")

    return response
