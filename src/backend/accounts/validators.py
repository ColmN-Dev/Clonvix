from django.core.exceptions import ValidationError

# Custom password validator to enforce character requirements across the application
class PasswordCharacterValidator:
    def validate(self, password, user=None):
        if not any(char.isupper() for char in password):
            raise ValidationError("Password must contain at least one uppercase letter.")

        if not any(char.islower() for char in password):
            raise ValidationError("Password must contain at least one lowercase letter.")

        if not any(char.isdigit() for char in password):
            raise ValidationError("Password must contain at least one digit.")

        if not any(not char.isalnum() for char in password):
            raise ValidationError("Password must contain at least one special character.")

    def get_help_text(self):
        return "Your password must contain at least one uppercase letter, lowercase letter, digit, and special character."