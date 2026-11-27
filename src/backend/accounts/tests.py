import json
from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from unittest.mock import patch
from django.core import signing
from accounts.models import Profile
import cloudinary
from PIL import Image
from io import BytesIO
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test.client import MULTIPART_CONTENT, encode_multipart
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

User = get_user_model()

class SignupTests(TestCase):

    def test_signup_success(self):
        response = self.client.post(
            reverse('signup'),
            {
                'email': 'test@example.com',
                'username': 'testuser',
                'password': 'StrongPass123!',
                'confirmPassword': 'StrongPass123!'
            },
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 201)

        user = User.objects.get(email='test@example.com')

        self.assertTrue(user.check_password('StrongPass123!'))

class LoginTests(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='StrongPass123!'
        )

    def test_login_success(self):
        response = self.client.post(
            reverse('login'),
            json.dumps({
                'email': 'test@example.com',
                'password': 'StrongPass123!'
            }),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['user']['email'], 'test@example.com')
        self.assertIn('_auth_user_id', self.client.session)

    def test_login_invalid_password(self):
        response = self.client.post(
            reverse('login'),
            json.dumps({
                'email': 'test@example.com',
                'password': 'WrongPassword123!'
            }),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 401)
        self.assertNotIn('_auth_user_id', self.client.session)
        
class SessionTests(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='StrongPass123!'
        )

    def test_current_user_authenticated(self):
        self.client.force_login(self.user)

        response = self.client.get(reverse('current_user'))

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()['authenticated'])
        self.assertEqual(response.json()['user']['email'], 'test@example.com')

    def test_current_user_unauthenticated(self):
        response = self.client.get(reverse('current_user'))

        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.json()['authenticated'])

    def test_logout_success(self):
        self.client.force_login(self.user)

        response = self.client.post(reverse('logout'))

        self.assertEqual(response.status_code, 200)
        self.assertNotIn('_auth_user_id', self.client.session)

class ProfileTests(TestCase):
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='StrongPass123!'
        )
        
        cloudinary.config(cloud_name="test-cloud")
        
        self.profile = Profile.objects.get(user=self.user)

    def test_profile_authenticated(self):
        self.client.force_login(self.user)
        response = self.client.get(reverse('profile'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['username'], self.user.username)

    def test_profile_unauthenticated(self):
        response = self.client.get(reverse('profile'))
        self.assertEqual(response.status_code, 401)
        
    def test_profile_update(self):
        self.client.force_login(self.user)

        response = self.client.patch(reverse('profile'), {
            'display_name': 'Test Display Name',
            'bio': 'Testing my profile update',
            'location': 'Ireland'
        },
        content_type='application/json'
    )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['display_name'], 'Test Display Name')
        self.assertEqual(response.json()['bio'], 'Testing my profile update')
        self.assertEqual(response.json()['location'], 'Ireland')
        
    @patch('cloudinary.uploader.upload')
    def test_profile_image_upload(self, mock_upload):
        self.client.force_login(self.user)

        mock_upload.return_value = {
            "public_id": "test_profile_image",
            "version": 1,
            "format": "png",
            "type": "upload",
            "resource_type": "image"
        }

        image_buffer = BytesIO()
        Image.new('RGB', (10, 10), color='red').save(image_buffer, format='PNG')

        image = SimpleUploadedFile(
            'test.png',
            image_buffer.getvalue(),
            content_type='image/png'
        )

        response = self.client.patch(
            reverse('profile'),
            data=encode_multipart('BoUnDaRyStRiNg', {'image': image}),
            content_type='multipart/form-data; boundary=BoUnDaRyStRiNg'
        )
        
        self.profile.refresh_from_db()
        self.assertEqual(response.status_code, 200, response.content.decode())
        self.assertTrue(response.json()['image'])
        mock_upload.assert_called_once()

class PasswordResetTests(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='StrongPass123!'
        )

    @patch('accounts.views.send_email')
    def test_password_reset_request_success(self, mock_send_email):
        response = self.client.post(
            reverse('password_reset'),
            json.dumps({'email': 'test@example.com'}),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn('If an account exists', response.json()['message'])
        mock_send_email.assert_called_once()

    @patch('accounts.views.send_email')
    def test_password_reset_unknown_email(self, mock_send_email):
        response = self.client.post(
            reverse('password_reset'),
            json.dumps({'email': 'unknown@example.com'}),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn('If an account exists', response.json()['message'])
        mock_send_email.assert_not_called()

    def test_password_reset_confirm_success(self):
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        token = default_token_generator.make_token(self.user)

        response = self.client.post(
            reverse('password_reset_confirm'),
            json.dumps({
                'uid': uid,
                'token': token,
                'new_password': 'DifferentStrongPass456!',
                'confirm_password': 'DifferentStrongPass456!'
            }),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 200)

        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('DifferentStrongPass456!'))

    def test_password_reset_invalid_token(self):
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))

        response = self.client.post(
            reverse('password_reset_confirm'),
            json.dumps({
                'uid': uid,
                'token': 'invalid-token',
                'new_password': 'DifferentStrongPass456!',
                'confirm_password': 'DifferentStrongPass456!'
            }),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 400)
        self.assertTrue(self.user.check_password('StrongPass123!'))
        
class EmailChangeTests(TestCase):
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='StrongPass123!'
        )
        self.client.force_login(self.user)

    @patch('accounts.views.send_email')
    def test_email_change_request(self, mock_send_email):
        response = self.client.post(
            reverse('change_email'),
            json.dumps({'email': 'new@example.com'}),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 200, response.json())
        mock_send_email.assert_called_once()

        self.assertEqual(mock_send_email.call_args.args[0], 'new@example.com')
        self.assertEqual(mock_send_email.call_args.args[1], 'Confirm your Clonvix email change')
        
    @patch('accounts.views.send_email')
    def test_email_verification_success(self, mock_send_email):
        token = signing.dumps({
            'user_id': self.user.id,
            'new_email': 'new@example.com',
            'old_email': 'test@example.com'
        }, salt='accounts.email_change')

        response = self.client.post(
            reverse('verify_email_change'),
            json.dumps({'token': token}),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 200)

        self.user.refresh_from_db()
        self.assertEqual(self.user.email, 'new@example.com')
        
class AccountDeletionTests(TestCase):
    
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            username='testuser',
            password='StrongPass123!'
        )
        self.profile = Profile.objects.get(user=self.user)

    @patch('cloudinary.uploader.destroy')
    def test_account_deletion_success(self, mock_destroy):
        self.client.force_login(self.user)

        response = self.client.post(
            reverse('delete_account'),
            json.dumps({'password': 'StrongPass123!'}),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, 200)
        self.assertFalse(User.objects.filter(pk=self.user.pk).exists())
        self.assertFalse(Profile.objects.filter(pk=self.profile.pk).exists())
        self.assertNotIn('_auth_user_id', self.client.session)
