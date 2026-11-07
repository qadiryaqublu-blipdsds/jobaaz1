import json
import base64
from typing import List, Tuple
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
from jose import jwt, JWTError
from datetime import datetime, timedelta
from config import settings

# Master AES Key (32 bytes = 256 bits)
MASTER_KEY = bytes.fromhex(settings.AES_MASTER_KEY_HEX)

# ============================================================================
# 1. AES-256 GCM BIOMETRIC ENCRYPTION / DECRYPTION
# ============================================================================

def encrypt_vector_embedding(vector: List[float]) -> Tuple[str, str, str]:
    """
    Encrypts a 512-dimensional float vector using AES-256 GCM.
    Returns: (ciphertext_b64, iv_hex, tag_hex)
    """
    raw_json = json.dumps(vector).encode("utf-8")
    iv = get_random_bytes(12)  # 96-bit nonce standard for GCM
    cipher = AES.new(MASTER_KEY, AES.MODE_GCM, nonce=iv)
    
    ciphertext, tag = cipher.encrypt_and_digest(raw_json)
    
    return (
        base64.b64encode(ciphertext).decode("utf-8"),
        iv.hex(),
        tag.hex()
    )

def decrypt_vector_embedding(ciphertext_b64: str, iv_hex: str, tag_hex: str) -> List[float]:
    """
    Decrypts an AES-256 GCM encrypted vector back to float list.
    """
    ciphertext = base64.b64decode(ciphertext_b64.encode("utf-8"))
    iv = bytes.fromhex(iv_hex)
    tag = bytes.fromhex(tag_hex)
    
    cipher = AES.new(MASTER_KEY, AES.MODE_GCM, nonce=iv)
    decrypted_bytes = cipher.decrypt_and_verify(ciphertext, tag)
    
    return json.loads(decrypted_bytes.decode("utf-8"))

def encrypt_audit_thumbnail(image_bytes: bytes) -> Tuple[str, str, str]:
    """
    Encrypts low-res JPEG audit thumbnail.
    """
    iv = get_random_bytes(12)
    cipher = AES.new(MASTER_KEY, AES.MODE_GCM, nonce=iv)
    ciphertext, tag = cipher.encrypt_and_digest(image_bytes)
    return (
        base64.b64encode(ciphertext).decode("utf-8"),
        iv.hex(),
        tag.hex()
    )

# ============================================================================
# 2. JWT TOKEN SECURITY
# ============================================================================

def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=settings.ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

def decode_access_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        return {}
