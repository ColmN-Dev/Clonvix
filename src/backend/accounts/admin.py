
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UserCreationForm

from .models import User


# Set up the form used when creating a new user in the admin panel
class CustomUserCreationForm(UserCreationForm):
    class Meta(UserCreationForm.Meta):
        model = User
        fields = ("email", "username")


# Register the custom user model with the admin panel
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    add_form = CustomUserCreationForm
    model = User

    # Choose which details appear in the user list
    list_display = ("email", "username", "is_staff", "is_active")

    # Allow users to be searched by email or username
    search_fields = ("email", "username")

    # Allow the user list to be filtered by these options
    list_filter = ("is_staff", "is_active", "is_superuser")

    # Sort users by email address
    ordering = ("email",)

    # Choose which fields appear when viewing or editing a user
    fieldsets = (
        (None, {"fields": ("email", "username", "password")}),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        # Show when the user last logged in and when their account was created
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )

    # Choose which fields appear when adding a new user
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "username", "password1", "password2"),
            },
        ),
    )
