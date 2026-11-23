
#!/usr/bin/env bash
set -o errexit

cd src/frontend
npm install
npm run lint
npx tsc --noEmit
npm run build

cd ../backend
pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate

# TEMPORARY: Create production admin accounts
python manage.py shell <<'PY'
import os
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission

User = get_user_model()

# Personal production superuser
admin_email = os.environ["ADMIN_EMAIL"]
admin_password = os.environ["ADMIN_PASSWORD"]

if not User.objects.filter(username="Clonvix_admin").exists():
    User.objects.create_superuser(
        email=admin_email,
        username="Clonvix_admin",
        password=admin_password
    )
    print("Production superuser created.")
else:
    print("Production superuser already exists.")

# Lecturer's read-only staff account
demo_email = os.environ["DEMO_ADMIN_EMAIL"]
demo_password = os.environ["DEMO_ADMIN_PASSWORD"]

demo_user, created = User.objects.get_or_create(
    username="Clonvix_demo",
    defaults={
        "email": demo_email,
        "is_staff": True,
        "is_superuser": False
    }
)

if created:
    demo_user.set_password(demo_password)
    demo_user.save()

view_permissions = Permission.objects.filter(
    content_type__app_label__in=["accounts", "github"],
    codename__startswith="view_"
)

demo_user.is_staff = True
demo_user.is_superuser = False
demo_user.save()
demo_user.user_permissions.set(view_permissions)

print("Demo staff account ready.")
PY
