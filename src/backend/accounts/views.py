import json
from django.contrib.auth import get_user_model, authenticate, login
from django.contrib.auth import logout as auth_logout
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.http import JsonResponse
from django.views.decorators.http import require_POST, require_GET, require_http_methods
from django.views.decorators.csrf import ensure_csrf_cookie
from .models import Profile, UsernameChangeLog
from .serializers import ProfileSerializer
from django.http.multipartparser import MultiPartParser
from django.contrib.auth import update_session_auth_hash
from django.db import transaction, IntegrityError
from django.core import signing
from django.core.validators import validate_email
from django.conf import settings
from django.utils.html import escape
from .email_utils import send_email
import cloudinary.uploader
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode

User = get_user_model()

@ensure_csrf_cookie
def csrf_token_view(request):
    """View to set the CSRF cookie."""
    return JsonResponse({'message': 'CSRF cookie set.'})

@require_POST
def signup_view(request):
    """View to handle user signup."""
    try:
        data = json.loads(request.body)

        email = data.get('email', '').strip().lower()
        username = data.get('username', '').strip()
        password = data.get('password', '')
        confirmPassword = data.get('confirmPassword', '')

        if not email or not username or not password or not confirmPassword:
            return JsonResponse({'error': 'All fields are required.'}, status=400)
        
        if password != confirmPassword:
            return JsonResponse({'error': 'Passwords do not match.'}, status=400)

        if User.objects.filter(email=email).exists():
            return JsonResponse({'error': 'An account with this email already exists.'}, status=400)

        if User.objects.filter(username=username).exists():
            return JsonResponse({'error': 'This username is already taken.'}, status=400)

        try:
            validate_password(password)
        except ValidationError as error:
            return JsonResponse({'errors': error.messages}, status=400)

        user = User.objects.create_user(email=email, username=username, password=password)

        return JsonResponse({
            'message': 'Account created successfully.',
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username,
            }
        }, status=201)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data.'}, status=400)
    
@require_POST
def login_view(request):
    """View to handle user login."""
    try:
        data = json.loads(request.body)
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')

        if not email or not password:
            return JsonResponse({'error': 'Email and password are required.'}, status=400)

        user = authenticate(request, email=email, password=password)

        if user is None:
            return JsonResponse({'error': 'Invalid email or password.'}, status=401)

        login(request, user)

        return JsonResponse({
            'message': 'Logged in successfully.',
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username
            }
        })

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data.'}, status=400)
    
@require_POST
def password_reset_request_view(request):
    """Send a password reset email to the requested email address."""
    try:
        data = json.loads(request.body)
        email = data.get('email', '').strip().lower()

        if not email:
            return JsonResponse({'error': 'Email address is required.'}, status=400)

        user = User.objects.filter(email__iexact=email, is_active=True).first()

        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)

            reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}"

            html_content = f"""
                <h2>Reset your Clonvix password</h2>
                <p>We received a request to reset your password.</p>
                <p>Click the link below to choose a new password:</p>
                <a href="{escape(reset_url)}">Reset password</a>
                <p>This link will expire after a limited period.</p>
                <p>If you didn't request a password reset, you can ignore this email.</p>
            """

            try:
                send_email(user.email, 'Reset your Clonvix password', html_content)
            except Exception:
                # Log the failure without revealing whether the email exists.
                import logging
                logging.exception('Failed to send password reset email.')

        return JsonResponse({
            'message': 'If an account exists with that email address, a password reset link has been sent.'
        })

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data.'}, status=400)
    
@require_POST
def password_reset_confirm_view(request):
    """Validate a password reset token and update the user's password."""
    try:
        data = json.loads(request.body)

        uid = data.get('uid', '')
        token = data.get('token', '')
        new_password = data.get('new_password', '')
        confirm_password = data.get('confirm_password', '')

        if not uid or not token or not new_password or not confirm_password:
            return JsonResponse({'error': 'All fields are required.'}, status=400)

        if new_password != confirm_password:
            return JsonResponse({'error': 'Passwords do not match.'}, status=400)

        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id, is_active=True)
        except (ValueError, TypeError, OverflowError, User.DoesNotExist):
            return JsonResponse({'error': 'Invalid or expired password reset link.'}, status=400)

        if not default_token_generator.check_token(user, token):
            return JsonResponse({'error': 'Invalid or expired password reset link.'}, status=400)
        
        if user.check_password(new_password):
            return JsonResponse({'error': 'New password must not be the same as your current password.'}, status=400)

        try:
            validate_password(new_password, user=user)
        except ValidationError as error:
            return JsonResponse({'errors': error.messages}, status=400)

        user.set_password(new_password)
        user.save(update_fields=['password'])

        return JsonResponse({
            'message': 'Your password has been reset successfully.'
        })

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data.'}, status=400)
    
@require_GET
def current_user_view(request):
    """View to retrieve the currently authenticated user's information."""
    if not request.user.is_authenticated:
        return JsonResponse({'authenticated': False})

    return JsonResponse({
        'authenticated': True,
        'user': {
            'id': request.user.id,
            'email': request.user.email,
            'username': request.user.username
        }
    })
    
@require_http_methods(['GET', 'PATCH'])
def profile_view(request):
    """View to handle profile retrieval and updates."""
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required.'}, status=401)

    profile = Profile.objects.get(user=request.user)
    
    if request.method == 'GET':
        serializer = ProfileSerializer(profile)
        return JsonResponse(serializer.data)

    # Handle PATCH request for updating profile
    if request.method == 'PATCH':
        
        if request.content_type.startswith('multipart/form-data'):
            # Use MultiPartParser to handle multipart/form-data requests
            parser = MultiPartParser(request.META, request, request.upload_handlers, request.encoding)
            post_data, files = parser.parse()

            data = post_data.copy()
            if 'image' in files:
                data['image'] = files['image']
        else:
            try:
                data = json.loads(request.body)
            except json.JSONDecodeError:
                return JsonResponse({'error': 'Invalid JSON.'}, status=400)

        serializer = ProfileSerializer(profile, data=data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return JsonResponse(serializer.data)

        return JsonResponse(serializer.errors, status=400)
    
@require_POST
def logout_view(request):
    """View to handle user logout."""
    auth_logout(request)
    return JsonResponse({'message': 'Logged out successfully.'})

@require_POST
def change_password_view(request):
    """View to handle password change requests."""
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required.'}, status=401)

    try:
        data = json.loads(request.body)
        current_password = data.get('current_password', '')
        new_password = data.get('new_password', '')
        confirm_new_password = data.get('confirm_new_password', '')

        if not current_password or not new_password or not confirm_new_password:
            return JsonResponse({'error': 'All fields are required.'}, status=400)

        if new_password != confirm_new_password:
            return JsonResponse({'error': 'New passwords do not match.'}, status=400)

        user = request.user

        if not user.check_password(current_password):
            return JsonResponse({'error': 'Current password is incorrect.'}, status=400)
        
        if user.check_password(new_password):
            return JsonResponse({'error': 'Your new password must be different from your current password.'}, status=400)

        try:
            validate_password(new_password, user=user)
        except ValidationError as error:
            return JsonResponse({'errors': error.messages}, status=400)

        user.set_password(new_password)
        update_session_auth_hash(request, user)
        user.save()

        return JsonResponse({'message': 'Password changed successfully.'})

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data.'}, status=400)
    
@require_POST
def change_username_view(request):
    """View to handle username change requests."""
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required.'}, status=401)

    try:
        data = json.loads(request.body)
        new_username = data.get('username', '').strip()

        if not new_username:
            return JsonResponse({'error': 'Username is required.'}, status=400)

        user = request.user

        if new_username.lower() == user.username.lower():
            return JsonResponse({'error': 'Usernames cannot be the same.'}, status=400)

        if User.objects.filter(username__iexact=new_username).exists():
            return JsonResponse({'error': 'Username already exists.'}, status=400)

        if UsernameChangeLog.objects.filter(old_username__iexact=new_username).exists():
            return JsonResponse({'error': 'This username is unavailable and cannot be reclaimed.'}, status=400)

        try:
            with transaction.atomic():
                UsernameChangeLog.objects.create(user=user, old_username=user.username)
                user.username = new_username
                user.save(update_fields=['username'])
        
        except IntegrityError:
            return JsonResponse({'error': 'Username unavailable.'}, status=400)

        return JsonResponse({
            'message': 'Username changed successfully.',
            'username': user.username
        })

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data.'}, status=400)
    
@require_POST
def change_email_view(request):
    """View to handle email change requests. Sends a verification email to the new address."""
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required.'}, status=401)

    try:
        data = json.loads(request.body)
        new_email = data.get('email', '').strip().lower()

        if not new_email:
            return JsonResponse({'error': 'Email is required.'}, status=400)

        try:
            validate_email(new_email)
        except ValidationError:
            return JsonResponse({'error': 'Enter a valid email address.'}, status=400)

        user = request.user

        if new_email == user.email.lower():
            return JsonResponse({'error': 'New email cannot be the same as your current email.'}, status=400)

        if User.objects.filter(email__iexact=new_email).exists():
            return JsonResponse({'error': 'An account with this email already exists.'}, status=400)

        token = signing.dumps({
            'user_id': user.id,
            'new_email': new_email,
            'old_email': user.email
        }, salt='accounts.email_change')

        verification_url = f"{settings.FRONTEND_URL}/verify-email-change/{token}"

        html_content = f"""
            <h2>Confirm your Clonvix email change</h2>
            <p>You requested to change your account email address.</p>
            <p>Click the link below to confirm this change:</p>
            <a href="{escape(verification_url)}">Verify email address</a>
            <p>This link expires in one hour.</p>
            <p>If you didn't request this change, you can ignore this email.</p>
        """

        send_email(new_email, 'Confirm your Clonvix email change', html_content)

        return JsonResponse({
            'message': 'Verification email sent. Please check your inbox.'
        })

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data.'}, status=400)
    except Exception:
        return JsonResponse({'error': 'Unable to send verification email. Please try again.'}, status=500)
    
@require_POST
def verify_email_change_view(request):
    """View to handle email change verification via token."""
    try:
        data = json.loads(request.body)
        token = data.get('token', '')

        if not token:
            return JsonResponse({'error': 'Verification token is required.'}, status=400)

        try:
            payload = signing.loads(token, salt='accounts.email_change', max_age=3600)
        except signing.SignatureExpired:
            return JsonResponse({'error': 'This verification link has expired.'}, status=400)
        except signing.BadSignature:
            return JsonResponse({'error': 'Invalid verification link.'}, status=400)

        user = User.objects.filter(id=payload['user_id']).first()

        if not user or user.email.lower() != payload['old_email'].lower():
            return JsonResponse({'error': 'This verification link is no longer valid.'}, status=400)

        new_email = payload['new_email']

        if User.objects.filter(email__iexact=new_email).exclude(id=user.id).exists():
            return JsonResponse({'error': 'This email address is already in use.'}, status=400)

        user.email = new_email
        user.save(update_fields=['email'])

        return JsonResponse({'message': 'Email address changed successfully.'})

    except (json.JSONDecodeError, KeyError, TypeError):
        return JsonResponse({'error': 'Invalid verification request.'}, status=400)
    
@require_POST
def delete_account_view(request):
    """Delete the logged-in user's account after confirming their password."""
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required.'}, status=401)

    try:
        data = json.loads(request.body)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({'error': 'Invalid JSON data.'}, status=400)

    if not isinstance(data, dict):
        return JsonResponse({'error': 'Invalid request data.'}, status=400)
    
    password = data.get('password', '')
    
    if not isinstance(password, str) or not password:
        return JsonResponse({'error': 'Password is required.'}, status=400)

    user = request.user
    
    if not user.check_password(password):
        return JsonResponse({'error': 'Password is incorrect.'}, status=400)
    
    public_id = None

    try:
        public_id = user.profile.image.public_id
    except Exception:
        pass  # A Cloudinary problem must not stop the account being deleted.

    auth_logout(request)
    user.delete()
    
    # Remove the uploaded image after successful account deletion.
    if public_id and not public_id.startswith('default'):
        try:
            cloudinary.uploader.destroy(public_id)
        except Exception:
            pass
    
    return JsonResponse({'message': 'Account deleted successfully.'})