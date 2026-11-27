
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
python manage.py shell -c "from django.contrib.auth import get_user_model; from accounts.models import Profile; User = get_user_model(); [Profile.objects.get_or_create(user=user) for user in User.objects.all()]"