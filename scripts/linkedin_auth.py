#!/usr/bin/env python3
"""
One-time LinkedIn OAuth2 setup helper.
Run this once to get your LinkedIn access token.

Prerequisites:
1. Go to https://www.linkedin.com/developers/apps and create an app
2. Add OAuth 2.0 scopes: w_member_social, r_liteprofile, openid, profile, email
3. Set redirect URL to: http://localhost:8080/callback
4. Get your Client ID and Client Secret from the app settings

Usage:
    python scripts/linkedin_auth.py --client-id YOUR_ID --client-secret YOUR_SECRET
"""

import argparse
import json
import os
import sys
import urllib.parse
import urllib.request
import urllib.error
import webbrowser
from http.server import HTTPServer, BaseHTTPRequestHandler
from threading import Thread

AUTH_CODE = None


class CallbackHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        global AUTH_CODE
        parsed = urllib.parse.urlparse(self.path)
        params = urllib.parse.parse_qs(parsed.query)
        if 'code' in params:
            AUTH_CODE = params['code'][0]
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(b'<h1>Authorization successful!</h1><p>You can close this window.</p>')
        else:
            error = params.get('error', ['unknown'])[0]
            self.send_response(400)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(f'<h1>Error: {error}</h1>'.encode())

    def log_message(self, *args):
        pass  # Suppress server logs


def main():
    parser = argparse.ArgumentParser(description='LinkedIn OAuth2 one-time setup')
    parser.add_argument('--client-id', required=True, help='LinkedIn app Client ID')
    parser.add_argument('--client-secret', required=True, help='LinkedIn app Client Secret')
    args = parser.parse_args()

    redirect_uri = 'http://localhost:8080/callback'
    scopes = 'w_member_social r_liteprofile openid profile email'

    # Build auth URL
    auth_url = (
        'https://www.linkedin.com/oauth/v2/authorization'
        f'?response_type=code'
        f'&client_id={urllib.parse.quote(args.client_id)}'
        f'&redirect_uri={urllib.parse.quote(redirect_uri)}'
        f'&scope={urllib.parse.quote(scopes)}'
    )

    print('Starting local server on http://localhost:8080...')
    server = HTTPServer(('localhost', 8080), CallbackHandler)
    thread = Thread(target=server.handle_request)
    thread.start()

    print(f'\nOpening browser for LinkedIn authorization...')
    print(f'If the browser does not open, visit:\n  {auth_url}\n')
    webbrowser.open(auth_url)

    thread.join(timeout=120)

    if not AUTH_CODE:
        sys.exit('ERROR: Did not receive authorization code within 120 seconds.')

    print('Authorization code received. Exchanging for token...')

    # Exchange code for token
    token_url = 'https://www.linkedin.com/oauth/v2/accessToken'
    token_data = urllib.parse.urlencode({
        'grant_type': 'authorization_code',
        'code': AUTH_CODE,
        'redirect_uri': redirect_uri,
        'client_id': args.client_id,
        'client_secret': args.client_secret,
    }).encode('utf-8')

    req = urllib.request.Request(token_url, data=token_data, method='POST')
    req.add_header('Content-Type', 'application/x-www-form-urlencoded')
    try:
        with urllib.request.urlopen(req) as resp:
            token_resp = json.loads(resp.read())
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8', errors='replace')
        sys.exit(f'ERROR getting token: HTTP {e.code}\n{body}')

    access_token = token_resp.get('access_token')
    if not access_token:
        sys.exit(f'ERROR: No access_token in response: {token_resp}')

    # Get person URN
    print('Getting your LinkedIn profile ID...')
    profile_req = urllib.request.Request('https://api.linkedin.com/v2/userinfo')
    profile_req.add_header('Authorization', f'Bearer {access_token}')
    try:
        with urllib.request.urlopen(profile_req) as resp:
            profile = json.loads(resp.read())
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8', errors='replace')
        sys.exit(f'ERROR getting profile: HTTP {e.code}\n{body}')

    person_id = profile.get('sub', '')
    person_urn = f'urn:li:person:{person_id}' if person_id else 'UNKNOWN'

    print('\n' + '=' * 60)
    print('SUCCESS! Add these to your .env file:')
    print('=' * 60)
    print(f'LINKEDIN_ACCESS_TOKEN={access_token}')
    print(f'LINKEDIN_PERSON_URN={person_urn}')
    print('=' * 60)
    print(f'\nNote: LinkedIn tokens expire after ~60 days. Re-run this script to refresh.')
    print(f'Token expires in: {token_resp.get("expires_in", "unknown")} seconds')


if __name__ == '__main__':
    main()
