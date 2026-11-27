from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.conf import settings
from cloudinary.models import CloudinaryField
from django.db.models.functions import Lower

class CustomUserManager(BaseUserManager):
    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError("Users must have an email address")

        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if not extra_fields["is_staff"]:
            raise ValueError("Superusers must have is_staff=True")

        if not extra_fields["is_superuser"]:
            raise ValueError("Superusers must have is_superuser=True")

        return self.create_user(email, username, password, **extra_fields)


class User(AbstractUser):
    email = models.EmailField(unique=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    objects = CustomUserManager()

    class Meta:
        constraints = [
            models.UniqueConstraint(Lower('username'), name='unique_username_ci')
        ]

    def __str__(self):
        return self.email
    
class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    display_name = models.CharField(max_length=50, blank=True)
    bio = models.TextField(blank=True)
    image = CloudinaryField('image', default='default.png')
    location = models.CharField(max_length=100, blank=True)
    website = models.URLField(blank=True)
    # Up to 4 URLs, limit checked in the serializer
    social_links = models.JSONField(default=list, blank=True)

    def __str__(self):
        return self.user.username
    
class UsernameChangeLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='username_changes')
    old_username = models.CharField(max_length=150, unique=True)
    changed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        constraints = [
            models.UniqueConstraint(Lower('old_username'), name='unique_old_username_ci')
        ]

    def __str__(self):
        return f"{self.old_username} -> {self.user.username}"