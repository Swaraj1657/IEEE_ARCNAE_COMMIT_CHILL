"""
Field aliases and synonyms mapping for OCR/LLM extraction.
Helps the system recognize alternative names for the same field.
"""

# Mapping of canonical field names to their aliases/synonyms
FIELD_ALIASES = {
    # Student Identification
    "roll_number": [
        "roll no",
        "roll#",
        "enrollment number",
        "enrollment no",
        "enrollment id",
        "enrolment number",
        "student id",
        "student number",
        "registration number",
        "reg no",
        "reg#",
        "uid",
        "university id",
        "university id number",
        "student roll",
        "candidate id",
        "candidate number",
        "exam roll",
        "exam roll number",
        "examination roll",
    ],
    
    "registration_number": [
        "reg no",
        "reg#",
        "registration no",
        "registration id",
        "reg number",
        "student registration",
        "registration code",
        "reg code",
        "regd no",
        "registration certificate",
    ],
    
    "apaar_id": [
        "apaar",
        "apaar id",
        "apaar number",
        "autonomous pan india academic id",
    ],
    
    # Student Name
    "student_name": [
        "name",
        "student name",
        "candidate name",
        "applicant name",
        "name of student",
        "name of candidate",
        "full name",
        "candidate's name",
        "student's name",
    ],
    
    "father_name": [
        "father name",
        "father's name",
        "father",
        "father's full name",
        "parent name",
        "father / guardian",
        "name of father",
        "paternal name",
    ],
    
    "mother_name": [
        "mother name",
        "mother's name",
        "mother",
        "mother's full name",
        "mother's maiden name",
        "name of mother",
        "maternal name",
    ],
    
    # Academic Details
    "degree": [
        "degree",
        "degree name",
        "degree awarded",
        "degree conferred",
        "qualification",
        "degree title",
        "programme name",
        "program name",
        "course name",
        "course",
        "academic program",
        "degree program",
        "degree of",
    ],
    
    "branch": [
        "branch",
        "specialization",
        "specialisation",
        "major",
        "subject",
        "discipline",
        "stream",
        "field of study",
        "area of specialization",
        "programme",
        "program",
        "course specialization",
        "branch of study",
    ],
    
    "semester": [
        "semester",
        "sem",
        "semester #",
        "academic year",
        "year",
        "academic session",
        "session",
        "year of study",
        "final semester",
        "final year",
        "stage",
    ],
    
    "examination": [
        "examination",
        "exam",
        "exam type",
        "examination type",
        "test",
        "assessment",
        "final examination",
        "end semester examination",
        "end sem exam",
        "exam name",
    ],
    
    # Institutional Details
    "institution_name": [
        "institution",
        "institution name",
        "college",
        "college name",
        "university",
        "university name",
        "school",
        "school name",
        "institute",
        "institute name",
        "educational institution",
        "name of institution",
        "name of college",
        "name of university",
        "educational board",
        "issuing institution",
        "awarding body",
        "issuing body",
    ],
    
    "organization_type": [
        "organization type",
        "institution type",
        "type of institution",
        "category",
        "institutional category",
        "organization category",
        "board type",
        "type of organization",
    ],
    
    # Dates
    "issued_date": [
        "issued date",
        "date issued",
        "date of issue",
        "issue date",
        "completion date",
        "date of completion",
        "graduation date",
        "date of graduation",
        "date awarded",
        "award date",
        "conferred date",
        "certification date",
        "date",
    ],
    
    # Additional Fields
    "confidence_score": [
        "confidence",
        "confidence score",
        "extraction confidence",
        "confidence level",
        "reliability score",
    ],
    
    "verification_status": [
        "verification status",
        "status",
        "verification",
        "verified",
        "verification result",
    ],
}

# Reverse mapping: alias to canonical name
ALIAS_TO_CANONICAL = {}
for canonical, aliases in FIELD_ALIASES.items():
    for alias in aliases:
        ALIAS_TO_CANONICAL[alias.lower()] = canonical


def normalize_field_name(field_name: str) -> str:
    """
    Convert field alias to canonical name.
    
    Args:
        field_name: The field name to normalize (can be alias or canonical)
    
    Returns:
        The canonical field name, or the original if not found
    
    Example:
        normalize_field_name("roll no") → "roll_number"
        normalize_field_name("uid") → "roll_number"
        normalize_field_name("enrollment id") → "roll_number"
    """
    normalized = field_name.lower().strip()
    return ALIAS_TO_CANONICAL.get(normalized, field_name)


def get_aliases(canonical_field: str) -> list:
    """
    Get all aliases for a canonical field name.
    
    Args:
        canonical_field: The canonical field name
    
    Returns:
        List of aliases for this field, or empty list if not found
    
    Example:
        get_aliases("roll_number") → 
        ["roll no", "roll#", "enrollment number", "uid", ...]
    """
    return FIELD_ALIASES.get(canonical_field, [])


def normalize_extracted_data(extracted_dict: dict) -> dict:
    """
    Normalize all field names in extracted data to canonical names.
    
    Args:
        extracted_dict: Dictionary with potentially aliased field names
    
    Returns:
        Dictionary with all fields normalized to canonical names
    
    Example:
        normalize_extracted_data({
            "roll no": "ENG001",
            "uid": "ENG001",
            "student name": "John Doe"
        })
        →
        {
            "roll_number": "ENG001",
            "student_name": "John Doe"
        }
    """
    normalized = {}
    for key, value in extracted_dict.items():
        canonical = normalize_field_name(key)
        # Avoid duplicates - prefer already normalized key
        if canonical not in normalized:
            normalized[canonical] = value
    return normalized


# ========================
# USAGE EXAMPLE
# ========================
if __name__ == "__main__":
    # Example 1: Normalize a field name
    print("=" * 60)
    print("FIELD NAME NORMALIZATION")
    print("=" * 60)
    test_names = [
        "roll no",
        "uid",
        "enrollment id",
        "roll_number",
        "student name",
        "father's name",
        "institution name",
        "date of issue"
    ]
    
    for name in test_names:
        canonical = normalize_field_name(name)
        print(f"  '{name}' → '{canonical}'")
    
    # Example 2: Get aliases for a field
    print("\n" + "=" * 60)
    print("ALIASES FOR CANONICAL FIELDS")
    print("=" * 60)
    fields = ["roll_number", "student_name", "institution_name", "issued_date"]
    
    for field in fields:
        aliases = get_aliases(field)
        print(f"\n  {field}:")
        for alias in aliases[:5]:  # Show first 5
            print(f"    • {alias}")
        if len(aliases) > 5:
            print(f"    ... and {len(aliases) - 5} more")
    
    # Example 3: Normalize extracted data
    print("\n" + "=" * 60)
    print("NORMALIZE EXTRACTED DATA")
    print("=" * 60)
    
    extracted = {
        "roll no": "ENG001",
        "uid": "ENG001",
        "student name": "John Doe",
        "father name": "James Doe",
        "college name": "ABC University",
        "date of issue": "2024-06-15",
        "confidence": 0.95
    }
    
    print("  Before normalization:")
    for k, v in extracted.items():
        print(f"    {k}: {v}")
    
    normalized = normalize_extracted_data(extracted)
    print("\n  After normalization:")
    for k, v in normalized.items():
        print(f"    {k}: {v}")
