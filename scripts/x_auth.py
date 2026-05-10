#!/usr/bin/env python3
"""
One-time X (Twitter) OAuth1.0a setup helper.
Run this once to get your X access token and secret.

Prerequisites:
1. Go to https://developer.x.com and create a project + app
2. Enable OAuth 1.0a with Read and Write permissions
3. Get your API Key (consumer key) and API Secret (consumer secret) from app settings
4. Set app permissions to "Read and Write"

Usage:
    python scripts/x_auth.py --api-key YOUR_KEY --api-secret YOUR_SECRET
"""

import argparse
import base64
import hashlib
import hmac
import json
import os
import sys
import time
import urllib.parse
import urllib.request
import urllib.error
import webbrowser


def oauth1_header(method, url, params, api_key, api_secret, token='', token_secret=''):
    """Build OAuth1.0a Authorization header."""
    oauth_params = {
        'oauth_consumer_key': api_key,
        'oauth_nonce': base64.b64encode(os.urandom(16)).decode('ascii').rstrip('='),
        'oauth_signature_method': 'HMAC-SHA1',
        'oauth_timestamp': str(int(time.time())),
        'oauth_version': '1.0',
    }
    if token:
        oauth_params['oauth_token'] = token

    all_params = {**params, **oauth_params}
    param_str = '&'.join(
        f'{urllib.parse.quote(k, safe="")}={urllib.parse.quote(str(v), safe="")}'
        for k, v in sorted(all_params.items())
    )
    base_str = '&'.join([
        method.upper(),
        urllib.parse.quote(url, safe=''),
        urllib.parse.quote(param_str, safe=''),
    ])
    signing_key = f'{urllib.parse.quote(api_secret, safe="")}&{urllib.parse.quote(token_secret, safe="")}'
    sig = base64.b64encode(
        hmac.new(signing_key.encode(), base_str.encode(), hashlib.sha1).digest()
    ).decode()
    oauth_params['oauth_signature'] = sig
    header = 'OAuth ' + ', '.join(
        f'{urllib.parse.quote(k, safe="")}="{urllib.parse.quote(v, safe="")}"'
        for k, v in sorted(oauth_params.items())
    )
    return header


def make_request(method, url, headers, data=None):
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.read().decode('utf-8')
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8', errors='replace')
        sys.exit(f'HTTP {e.code} from {url}:\n{body}')


def main():
    parser = argparse.ArgumentParser(description='X OAuth1.0a one-time setup')
    parser.add_argument('--api-key', required=True, help='X app API Key (consumer key)')
    parser.add_argument('--api-secret', required=True, help='X app API Secret (consumer secret)')
    args = parser.parse_args()

    # Step 1: Request token
    print('Requesting OAuth token from X...')
    req_token_url = 'https://api.twitter.com/oauth/request_token'
    auth_header = oauth1_header('POST', req_token_url, {'oauth_callback': 'oob'},
                                args.api_key, args.api_secret)
    body = urllib.parse.urlencode({'oauth_callback': 'oob'}).encode()
    headers = {'Authorization': auth_header, 'Content-Type': 'application/x-www-form-urlencoded'}
    resp = make_request('POST', req_token_url, headers, data=body)
    resp_params = dict(urllib.parse.parse_qsl(resp))
    request_token = resp_params.get('oauth_token')
    request_token_secret = resp_params.get('oauth_token_secret')
    if not request_token:
        sys.exit(f'ERROR: No oauth_token in response: {resp}')

    # Step 2: Authorize
    auth_url = f'https://api.twitter.com/oauth/authorize?oauth_token={request_token}'
    print(f'\nOpening browser for X authorization...')
    print(f'If the browser does not open, visit:\n  {auth_url}\n')
    webbrowser.open(auth_url)

    pin = input('Enter the PIN shown on X: ').strip()

    # Step 3: Exchange PIN for access token
    print('Exchanging PIN for access token...')
    access_token_url = 'https://api.twitter.com/oauth/access_token'
    auth_header = oauth1_header('POST', access_token_url, {'oauth_verifier': pin},
                                args.api_key, args.api_secret,
                                token=request_token, token_secret=request_token_secret)
    body = urllib.parse.urlencode({'oauth_verifier': pin}).encode()
    headers = {'Authorization': auth_header, 'Content-Type': 'application/x-www-form-urlencoded'}
    resp = make_request('POST', access_token_url, headers, data=body)
    resp_params = dict(urllib.parse.parse_qsl(resp))

    access_token = resp_params.get('oauth_token')
    access_token_secret = resp_params.get('oauth_token_secret')
    screen_name = resp_params.get('screen_name', '')

    if not access_token:
        sys.exit(f'ERROR: No access_token in response: {resp}')

    print('\n' + '=' * 60)
    print('SUCCESS! Add these to your .env file:')
    print('=' * 60)
    print(f'X_API_KEY={args.api_key}')
    print(f'X_API_SECRET={args.api_secret}')
    print(f'X_ACCESS_TOKEN={access_token}')
    print(f'X_ACCESS_TOKEN_SECRET={access_token_secret}')
    print('=' * 60)
    if screen_name:
        print(f'\nAuthorized as @{screen_name}')
    print('X tokens do not expire (unless revoked in app settings).')


if __name__ == '__main__':
    main()
