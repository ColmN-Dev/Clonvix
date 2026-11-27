import os
import requests


def send_email(to_email, subject, html_content):
    api_key = os.getenv('BREVO_API_KEY')

    if not api_key:
        raise ValueError('Brevo API key is not configured.')

    response = requests.post(
        'https://api.brevo.com/v3/smtp/email',
        headers={
            'accept': 'application/json',
            'api-key': api_key,
            'content-type': 'application/json'
        },
        json={
            'sender': {
                'name': 'Clonvix',
                'email': os.getenv('BREVO_SENDER_EMAIL')
            },
            'to': [{'email': to_email}],
            'subject': subject,
            'htmlContent': html_content
        },
        timeout=10
    )

    print(response.status_code, response.text)
    response.raise_for_status()
    return response.json()