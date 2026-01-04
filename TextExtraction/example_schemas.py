"""
Example usage of Pydantic schemas for certificate extraction and database insertion.
"""

from schemas import (
    LLMExtractedCertificate,
    CertificateDBInsert,
    VisualElements,
    DocumentType,
    OrganizationType,
    VerificationStatus,
)
import json


# =========================
# EXAMPLE 1: BASIC USAGE
# =========================
def example_basic_extraction():
    """Extract certificate data from LLM output."""
    
    # LLM output as JSON
    llm_json = {
        "student_name": "JOHN DOE",  # Can handle different cases
        "roll_number": "  ENG001  ",  # Will be cleaned
        "registration_number": "REG202400123",
        "father_name": "JAMES DOE",
        "mother_name": "JANE DOE",
        "degree": "B.Tech",
        "branch": "Computer Science",
        "semester": "8",
        "examination": "Final",
        "issued_date": "2024-06-15",
        "institution_name": "ABC UNIVERSITY",
        "organization_type": "UNIVERSITY",
        "confidence_score": 0.95,
    }
    
    # Validate and create schema
    llm_data = LLMExtractedCertificate.model_validate(llm_json)
    
    print("✅ LLM Data Validated:")
    print(f"  Student: {llm_data.student_name}")
    print(f"  Roll: {llm_data.roll_number}")
    print(f"  Institution: {llm_data.institution_name}")
    print(f"  Confidence: {llm_data.confidence_score}\n")
    
    return llm_data


# =========================
# EXAMPLE 2: DATABASE INSERTION
# =========================
def example_database_insertion(llm_data: LLMExtractedCertificate):
    """Convert LLM data to database insert format."""
    
    user_id = "user-uuid-550e8400-e29b-41d4-a716-446655440000"
    
    # Method 1: Using from_llm_data() helper
    db_row = CertificateDBInsert.from_llm_data(
        user_id=user_id,
        llm_data=llm_data,
        document_type=DocumentType.DEGREE,
        certificate_link="certificates/user-123/cert-001.pdf"
    )
    
    print("✅ Database Row Created:")
    print(f"  Owner ID: {db_row.owner_id}")
    print(f"  Document Type: {db_row.document_type}")
    print(f"  Student: {db_row.extracted_student_name}")
    print(f"  Institution: {db_row.extracted_institution_name}")
    print(f"  Status: {db_row.verification_status}\n")
    
    return db_row


# =========================
# EXAMPLE 3: WITH VISUAL ELEMENTS
# =========================
def example_with_visuals():
    """Example with extracted visual elements."""
    
    visual_data = {
        "student_name": "JOHN DOE",
        "roll_number": "ENG001",
        "degree": "B.Tech",
        "branch": "Computer Science",
        "institution_name": "ABC University",
        "issued_date": "2024-06-15",
        "organization_type": "UNIVERSITY",
        "extracted_visuals": {
            "institution_logo_embedded": True,
            "aishe_code": "C-25156",
            "signature_detected": True,
            "watermark_detected": True,
            "qr_code_present": True,
            "clip_embedding": [0.1, 0.2, 0.3, 0.4, 0.5]  # Example embedding
        },
        "confidence_score": 0.92
    }
    
    llm_data = LLMExtractedCertificate.model_validate(visual_data)
    
    print("✅ Certificate with Visual Elements:")
    if llm_data.extracted_visuals:
        print(f"  Logo Embedded: {llm_data.extracted_visuals.institution_logo_embedded}")
        print(f"  Signature Detected: {llm_data.extracted_visuals.signature_detected}")
        print(f"  AISHE Code: {llm_data.extracted_visuals.aishe_code}\n")
    
    return llm_data


# =========================
# EXAMPLE 4: ERROR HANDLING
# =========================
def example_validation_error():
    """Example of validation error handling."""
    
    bad_data = {
        "student_name": "John Doe",
        "issued_date": "invalid-date",  # Invalid format
        "confidence_score": 1.5,  # Out of range (0-1)
    }
    
    try:
        llm_data = LLMExtractedCertificate.model_validate(bad_data)
    except Exception as e:
        print("❌ Validation Error (as expected):")
        print(f"  {e}\n")


# =========================
# EXAMPLE 5: DATABASE INSERTION WITH SUPABASE
# =========================
def example_supabase_insertion(db_row: CertificateDBInsert):
    """Example of inserting into Supabase."""
    
    # This is how you would use it with Supabase
    supabase_insertion_data = {
        "owner_id": db_row.owner_id,
        "document_type": db_row.document_type,
        "certificate_link": db_row.certificate_link,
        "extracted_student_name": db_row.extracted_student_name,
        "extracted_roll_number": db_row.extracted_roll_number,
        "extracted_registration_number": db_row.extracted_registration_number,
        "extracted_apaar_id": db_row.extracted_apaar_id,
        "extracted_father_name": db_row.extracted_father_name,
        "extracted_mother_name": db_row.extracted_mother_name,
        "extracted_degree": db_row.extracted_degree,
        "extracted_branch": db_row.extracted_branch,
        "extracted_semester": db_row.extracted_semester,
        "extracted_examination": db_row.extracted_examination,
        "issued_date": db_row.issued_date,
        "extracted_institution_name": db_row.extracted_institution_name,
        "extracted_organization_type": db_row.extracted_organization_type,
        "extracted_visuals": db_row.extracted_visuals,
        "raw_extracted_data": db_row.raw_extracted_data,
        "verification_status": db_row.verification_status,
    }
    
    # Then insert with Supabase:
    # response = supabase.table('certificates').insert(supabase_insertion_data).execute()
    
    print("✅ Ready for Supabase insertion:")
    print(json.dumps(supabase_insertion_data, indent=2, default=str)[:500] + "...\n")


# =========================
# EXAMPLE 6: FULL WORKFLOW
# =========================
def example_full_workflow():
    """Complete workflow from LLM output to database."""
    
    print("=" * 60)
    print("FULL WORKFLOW: LLM → Validation → Database")
    print("=" * 60 + "\n")
    
    # Step 1: LLM extracts data
    print("📊 STEP 1: LLM Extraction")
    llm_data = example_basic_extraction()
    
    # Step 2: Convert to database format
    print("💾 STEP 2: Database Conversion")
    db_row = example_database_insertion(llm_data)
    
    # Step 3: With visual elements
    print("🎨 STEP 3: Visual Elements")
    llm_data_visual = example_with_visuals()
    
    # Step 4: Error handling
    print("⚠️  STEP 4: Error Handling")
    example_validation_error()
    
    # Step 5: Supabase format
    print("🔌 STEP 5: Supabase Ready")
    example_supabase_insertion(db_row)
    
    print("=" * 60)
    print("✅ WORKFLOW COMPLETE")
    print("=" * 60)


if __name__ == "__main__":
    example_full_workflow()
