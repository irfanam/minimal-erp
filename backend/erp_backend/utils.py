from rest_framework.views import exception_handler

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is not None:
        # Standardize error format for all API errors
        detail = response.data.get('detail')
        if detail:
            response.data = {'error': detail}
        else:
            response.data = {'error': str(response.data)}
    return response
