from django.urls import path
from . import views

urlpatterns = [
    path('csrf/', views.csrf_token_view, name='csrf_token'),
    path('signup/', views.signup_view, name='signup'),
    path('login/', views.login_view, name='login'),
    path('password-reset/', views.password_reset_request_view, name='password_reset'),
    path('password-reset-confirm/', views.password_reset_confirm_view, name='password_reset_confirm'),
    path('me/', views.current_user_view, name='current_user'),
    path('profile/', views.profile_view, name='profile'),
    path('logout/', views.logout_view, name='logout'),
    path('change-password/', views.change_password_view, name='change_password'),
    path('change-username/', views.change_username_view, name='change_username'),
    path('change-email/', views.change_email_view, name='change_email'),
    path('verify-email-change/', views.verify_email_change_view, name='verify_email_change'),
    path('delete-account/', views.delete_account_view, name='delete_account'),
]