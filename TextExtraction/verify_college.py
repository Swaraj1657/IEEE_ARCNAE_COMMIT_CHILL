import pandas as pd
import re
from logo_matcher import verify_logo_hybrid

# =========================
# CONFIG
# =========================
import os
COLLEGE_DB_PATH = os.path.join(os.path.dirname(__file__), "College-ALL COLLEGE.xlsx")

TRUSTED_PRIVATE_ISSUERS = [
    "mathworks",
    "coursera",
    "aws",
    "google",
    "microsoft",
    "nptel"
]

# =========================
# HELPERS
# =========================
def normalize(text):
    """
    Normalize text for case-insensitive matching.
    Handles: case conversion, bracket removal, special chars, extra spaces.
    """
    if not text:
        return ""

    # Convert to lowercase for case-insensitive comparison
    text = text.lower()

    # remove anything inside brackets -> (W), (237)
    text = re.sub(r"\(.*?\)", "", text)

    # remove commas and special chars, but keep spaces and alphanumeric
    text = re.sub(r"[^a-z0-9 ]", " ", text)

    # collapse multiple spaces into single space
    text = re.sub(r"\s+", " ", text)

    return text.strip()


def extract_college_name_variants(text: str) -> list:
    """
    Extract multiple variants of college name for better matching.
    Returns a list of normalized variations to try matching against.
    
    Examples:
    - "Sri Venkateswara College Of Engineering" -> variants with different orderings
    - "SVCE" -> abbreviation handling
    """
    if not text:
        return []
    
    normalized = normalize(text)
    variants = [normalized]
    
    # Add version with extra spaces removed
    compact = re.sub(r"\s+", "", normalized)
    if compact != normalized:
        variants.append(compact)
    
    # Split into words and try different combinations
    words = normalized.split()
    if len(words) > 2:
        # Try removing common words (college, university, institute, etc.)
        common_words = {'college', 'university', 'institute', 'school', 'academy', 'department'}
        filtered_words = [w for w in words if w not in common_words]
        if filtered_words and len(filtered_words) != len(words):
            variants.append(" ".join(filtered_words))
    
    return variants



# =========================
# COLLEGE EXISTENCE CHECK
# =========================
from rapidfuzz import fuzz

def verify_college_from_db(institute_name: str) -> dict:
    """
    Verify college existence using fuzzy matching with multiple name variants.
    Handles case variations, spacing issues, and different name formats.
    """
    if not institute_name:
        return {
            "verified": False,
            "status": "INSTITUTE_NAME_MISSING",
            "source": "College-ALL COLLEGE.xlsx"
        }

    # Get all variants of the institute name to try matching
    target_variants = extract_college_name_variants(institute_name)
    
    if not target_variants:
        return {
            "verified": False,
            "status": "INVALID_INSTITUTE_NAME",
            "source": "College-ALL COLLEGE.xlsx"
        }

    df = pd.read_excel(COLLEGE_DB_PATH)
    
    best_score = 0
    best_match = None
    matched_variant = None

    # Try matching each variant against database
    for target in target_variants:
        for _, row in df.iterrows():
            # Combine all database row values and normalize
            db_text = normalize(" ".join(row.astype(str)))

            # 🎯 Strategy 1: Exact match (case-insensitive)
            if target == db_text:
                return {
                    "verified": True,
                    "status": "VERIFIED_EXACT",
                    "match_score": 100,
                    "matched_institute": db_text,
                    "input_variant": target,
                    "source": "College-ALL COLLEGE.xlsx"
                }

            # 🎯 Strategy 2: Partial fuzzy match
            score = fuzz.partial_ratio(target, db_text)

            if score > best_score:
                best_score = score
                best_match = db_text
                matched_variant = target

            # ⭐ High confidence threshold (85+)
            if score >= 85:
                return {
                    "verified": True,
                    "status": "VERIFIED_FUZZY",
                    "match_score": score,
                    "matched_institute": best_match,
                    "input_variant": matched_variant,
                    "source": "College-ALL COLLEGE.xlsx"
                }

    # Try token_set_ratio for better matching when word order differs
    for target in target_variants:
        for _, row in df.iterrows():
            db_text = normalize(" ".join(row.astype(str)))
            score = fuzz.token_set_ratio(target, db_text)

            if score > best_score:
                best_score = score
                best_match = db_text
                matched_variant = target

            if score >= 85:
                return {
                    "verified": True,
                    "status": "VERIFIED_TOKEN_SET",
                    "match_score": score,
                    "matched_institute": best_match,
                    "input_variant": matched_variant,
                    "source": "College-ALL COLLEGE.xlsx"
                }

    # No match found
    return {
        "verified": False,
        "status": "NOT_FOUND",
        "best_match_score": best_score,
        "best_match": best_match,
        "input_variants_tried": target_variants,
        "source": "College-ALL COLLEGE.xlsx"
    }

# =========================
# MAIN VERIFICATION LAYER
# =========================
def attach_verification(data: dict) -> dict:
    institution = data.get("institution_details", {})
    metadata = data.get("certificate_metadata", {})

    # =========================
    # INIT SAFETY DEFAULTS
    # =========================
    data.setdefault("fraud_checks", {"risk_level": "LOW"})
    data.setdefault("confidence_score", 0.7)
    data.setdefault("verified_profile", {"auto_verified": False})

    # =========================
    # 1️⃣ BOARD / SCHOOL
    # =========================
    if institution.get("board_name"):
        data["institution_details"]["verification"] = {
            "verified": True,
            "status": "BOARD_VERIFIED",
            "authority_type": "BOARD",
            "authority": institution["board_name"]
        }

        data["fraud_checks"]["risk_level"] = "LOW"
        data["verified_profile"]["auto_verified"] = True
        data["confidence_score"] = 0.92

        return data

    # =========================
    # 2️⃣ PRIVATE ISSUER
    # =========================
    issuer_text = (
        institution.get("name", "") +
        institution.get("institution_name", "") +
        institution.get("college_name", "") +
        " " +
        metadata.get("powered_by", "")
    ).lower()


    for issuer in TRUSTED_PRIVATE_ISSUERS:
        if issuer in issuer_text:
            data["institution_details"]["verification"] = {
                "verified": True,
                "status": "ISSUER_VERIFIED",
                "authority_type": "PRIVATE_ISSUER",
                "authority": issuer.title()
            }

            data["fraud_checks"]["risk_level"] = "LOW"
            data["verified_profile"]["auto_verified"] = True
            data["confidence_score"] = 0.78

            return data

    # =========================
    # 3️⃣ COLLEGE / UNIVERSITY
    # =========================
    institute_name = (
        institution.get("institute_name")
        or institution.get("name")
        or institution.get("college_name")
    )

    verification = verify_college_from_db(institute_name)

    data["institution_details"]["verification"] = {
        **verification,
        "authority_type": "APPROVED_INSTITUTE_REGISTRY",
        "authority": "UGC / AICTE Approved Colleges List"
    }

    data["fraud_checks"]["risk_level"] = (
        "LOW" if verification["verified"] else "HIGH"
    )

    data["verified_profile"]["auto_verified"] = verification["verified"]
    data["confidence_score"] = 0.95 if verification["verified"] else 0.45

    # =========================
    # 4️⃣ LOGO VERIFICATION (SUPPORTING)
    # =========================
    logo_result = {"verified": False, "error": "Logo verification not available"}
    try:
        logo_dir = os.path.join(os.path.dirname(__file__), "known_logos")
        reference_logo = os.path.join(logo_dir, "vesit.png")
        cropped_logo = os.path.join(os.path.dirname(__file__), "extracted_logo.png")
        
        if os.path.exists(reference_logo) and os.path.exists(cropped_logo):
            logo_result = verify_logo_hybrid(
                reference_logo=reference_logo,
                cropped_logo=cropped_logo
            )
    except Exception as e:
        logo_result = {"verified": False, "error": str(e)}

    data["institution_details"]["logo_verification"] = logo_result

    if not logo_result.get("verified", False) and "error" not in logo_result:
        # Only penalize if logo verification was attempted and failed
        # (not if it wasn't available)
        data["fraud_checks"]["risk_level"] = "HIGH"
        data["confidence_score"] -= 0.2

    # =========================
    # EXPLAINABILITY
    # =========================
    data["explainability"] = {
        "why_verified": [
            "Institute exists in approved registry",
            "Certificate issued by recognized authority"
        ],
        "why_risk": [] if data["fraud_checks"]["risk_level"] == "LOW" else [
            "Logo verification failed",
            "Institute not found in registry"
        ]
    }

    return data

# =========================
# SUMMARY OVERLAY
# =========================
def add_verification_summary(data: dict) -> dict:
    v = data.get("institution_details", {}).get("verification", {})

    data["verification_summary"] = {
        "authority_type": v.get("authority_type"),
        "authority": v.get("authority"),
        "verification_status": v.get("status"),
        "institution_verified": v.get("verified"),
        "risk_level": data.get("fraud_checks", {}).get("risk_level"),
        "confidence_score": data.get("confidence_score"),
        "auto_verified": data.get("verified_profile", {}).get("auto_verified")
    }

    return data
