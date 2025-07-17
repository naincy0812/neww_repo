from fastapi import APIRouter, Request, Response, Depends, HTTPException, status, Cookie
from fastapi.responses import RedirectResponse, JSONResponse
from jose import jwt, JWTError
from datetime import datetime, timedelta
from app.config import settings
import msal
import requests
from typing import Optional
import os
from app.models.user import User

# Use the FRONTEND_URL environment variable
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

router = APIRouter(prefix="/auth", tags=["auth"])

# Azure AD endpoints and config
TENANT = settings.AZURE_TENANT_ID
CLIENT_ID = settings.AZURE_CLIENT_ID
CLIENT_SECRET = settings.AZURE_CLIENT_SECRET
REDIRECT_URI = settings.AZURE_REDIRECT_URI
AUTHORITY = f"https://login.microsoftonline.com/{TENANT}"
SCOPE = ["User.Read"]  # Use only 'User.Read' to avoid reserved scope error

# JWT config
JWT_SECRET = settings.JWT_SECRET_KEY
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_MINUTES = 60

# Util: create JWT
def create_jwt_token(user: dict):
    to_encode = user.copy()
    from datetime import timezone
    expire = datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

# Util: verify JWT
def verify_jwt_token(token: str):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError:
        return None

# Dependency for protected routes
def get_current_user(token: Optional[str] = Cookie(None)):
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    user = verify_jwt_token(token)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    return user

@router.get("/login")
def login():
    # Redirect user to Azure AD login
    msal_app = msal.ConfidentialClientApplication(CLIENT_ID, authority=AUTHORITY, client_credential=CLIENT_SECRET)
    auth_url = msal_app.get_authorization_request_url(SCOPE, redirect_uri=REDIRECT_URI, response_mode="query")
    return RedirectResponse(auth_url)


@router.get("/callback")
async def callback(request: Request, code: Optional[str] = None):
    if not code:
        return JSONResponse({"error": "Missing code from Azure AD"}, status_code=400)

    msal_app = msal.ConfidentialClientApplication(
        CLIENT_ID, authority=AUTHORITY, client_credential=CLIENT_SECRET
    )
    result = msal_app.acquire_token_by_authorization_code(
        code, scopes=SCOPE, redirect_uri=REDIRECT_URI
    )

    if "id_token_claims" not in result:
        return JSONResponse({"error": "Could not authenticate with Azure AD"}, status_code=400)

    user_claims = result["id_token_claims"]
    azure_id = user_claims.get("sub")
    email = user_claims.get("preferred_username", user_claims.get("email"))

    # ✅ Create or update user in MongoDB
    existing_user = await User.find_one(User.azure_id == azure_id)

    if not existing_user:
        new_user = User(
            azure_id=azure_id,
            username=email,
            email=email,
            full_name=user_claims.get("name"),
            roles=["user"],
            last_login=datetime.utcnow()
        )
        await new_user.insert()
    else:
        existing_user.last_login = datetime.utcnow()
        await existing_user.save()

    # ✅ Generate token and set cookie
    jwt_token = create_jwt_token({
        "sub": azure_id,
        "name": user_claims.get("name"),
        "email": email,
        "role": "user"
    })

    response = RedirectResponse(f"{FRONTEND_URL}/dashboard")
    response.set_cookie(
        key="token", value=jwt_token, httponly=True, secure=False,
        max_age=JWT_EXPIRE_MINUTES * 60
    )
    return response


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="token")
    return JSONResponse({"msg": "User logged out"})

from fastapi.encoders import jsonable_encoder

@router.get("/profile")
async def profile(user: dict = Depends(get_current_user)):
    db_user = await User.find_one(User.azure_id == user["sub"])
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return jsonable_encoder(db_user)