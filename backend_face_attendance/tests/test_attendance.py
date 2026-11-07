import pytest
import numpy as np
import security
import face_engine

def test_aes_gcm_vector_encryption_roundtrip():
    # 512-dimensional synthetic normalized vector
    vec = list(np.random.normal(0, 1, 512))
    norm = np.linalg.norm(vec)
    normalized_vec = [float(v / norm) for v in vec]

    ciphertext, iv, tag = security.encrypt_vector_embedding(normalized_vec)
    assert ciphertext is not None
    assert len(iv) == 24  # 12 bytes hex
    assert len(tag) == 32  # 16 bytes hex

    decrypted = security.decrypt_vector_embedding(ciphertext, iv, tag)
    assert len(decrypted) == 512
    # Verify values match with float precision
    for orig, dec in zip(normalized_vec, decrypted):
        assert pytest.approx(orig, rel=1e-5) == dec

def test_cosine_similarity_identical_vectors():
    vec = [0.1] * 512
    score = face_engine.cosine_similarity(vec, vec)
    assert pytest.approx(score, rel=1e-3) == 1.0

def test_cosine_similarity_orthogonal_vectors():
    vec1 = [1.0] + [0.0] * 511
    vec2 = [0.0, 1.0] + [0.0] * 510
    score = face_engine.cosine_similarity(vec1, vec2)
    # Cosine 0 is mapped to 0.5
    assert pytest.approx(score, rel=1e-3) == 0.5

def test_haversine_distance_baku_port():
    # Port Baku Tower coordinates
    lat1, lon1 = 40.3758, 49.8552
    # 100 meters away
    lat2, lon2 = 40.3765, 49.8559
    dist = face_engine.calculate_haversine_distance(lat1, lon1, lat2, lon2)
    assert 80 <= dist <= 120

def test_liveness_timeout():
    res = face_engine.verify_liveness_challenge("BLINK_EYES", True, 9.5)
    assert res["passed"] is False
    assert res["liveness_score"] <= 0.40
